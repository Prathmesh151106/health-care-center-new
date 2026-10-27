import { prisma } from '../../config/db.js';
import { hashPassword, verifyPassword, isCommonPassword } from '../../utils/hash.js';
import { hashToken } from '../../utils/crypto.js';
import { signAccessToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/apiError.js';
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  AuthenticatedUserContext
} from '@health-care-center/shared';
import crypto from 'node:crypto';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput, ip: string, userAgent?: string) {
    if (isCommonPassword(input.password)) {
      throw ApiError.badRequest('The chosen password is too common and easily guessed. Please pick a stronger password.');
    }

    const existing = await prisma.user.findUnique({
      where: { email: input.email }
    });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        heightCm: input.heightCm ?? null,
        timezone: input.timezone,
        locale: input.locale,
        settings: {
          create: {
            aiContextOptIn: false,
            theme: 'system'
          }
        }
      }
    });

    // Create session / tokens
    const { accessToken, rawRefreshToken } = await this.createSession(user, ip, userAgent);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        metadata: {
          ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
        }
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        locale: user.locale
      },
      accessToken,
      rawRefreshToken
    };
  }

  /**
   * Login user with rate-limiting and generic invalid credential rejection
   */
  static async login(input: LoginInput, ip: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      // Use fake verify to protect against timing attacks
      await verifyPassword('$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$fakehashfakehashfakehashfakehashfakehash', input.password);
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw ApiError.tooManyRequests('Account is temporarily locked due to repeated failed logins. Please try again later.');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockoutUntil
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILURE',
          metadata: {
            ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
          }
        }
      });

      throw ApiError.unauthorized('Invalid email or password');
    }

    // Reset failed login counter on success
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null
        }
      });
    }

    const { accessToken, rawRefreshToken } = await this.createSession(user, ip, userAgent);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        metadata: {
          ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
        }
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        locale: user.locale
      },
      accessToken,
      rawRefreshToken
    };
  }

  /**
   * Atomic refresh token rotation with reuse detection
   */
  static async refresh(rawToken: string, ip: string, userAgent?: string) {
    const hashed = hashToken(rawToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Reuse detection: if a revoked token is used, revoke the entire token family
    if (tokenRecord.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { isRevoked: true }
      });
      throw ApiError.unauthorized('Compromised refresh token reused. All sessions in this family have been revoked.');
    }

    // Check expiration
    if (tokenRecord.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token has expired');
    }

    // Generate new raw refresh token in the same family
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newHashed = hashToken(newRawRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 86400000);

    // Atomically revoke current token and create replacement
    const [newToken] = await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          tokenHash: newHashed,
          familyId: tokenRecord.familyId,
          expiresAt,
          ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
          userAgent: userAgent ? userAgent.slice(0, 255) : null
        }
      }),
      prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          isRevoked: true
        }
      })
    ]);

    // Update replacement pointer
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { replacedById: newToken.id }
    });

    const userContext: AuthenticatedUserContext = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      timezone: tokenRecord.user.timezone,
      locale: tokenRecord.user.locale
    };

    const accessToken = signAccessToken(userContext);

    return {
      accessToken,
      rawRefreshToken: newRawRefreshToken
    };
  }

  /**
   * Logout single session
   */
  static async logout(rawToken?: string) {
    if (!rawToken) return;
    const hashed = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashed },
      data: { isRevoked: true }
    });
  }

  /**
   * Logout all sessions for a user
   */
  static async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!isValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    if (isCommonPassword(input.newPassword)) {
      throw ApiError.badRequest('The new password is too common and easily guessed.');
    }

    const newHash = await hashPassword(input.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash }
      }),
      // Revoke all refresh tokens
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          metadata: { timestamp: new Date().toISOString() }
        }
      })
    ]);
  }

  /**
   * Helper to create access token and store hashed refresh token
   */
  private static async createSession(user: { id: string; email: string; timezone: string; locale: string }, ip: string, userAgent?: string) {
    const userContext: AuthenticatedUserContext = {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      locale: user.locale
    };

    const accessToken = signAccessToken(userContext);
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 86400000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt,
        ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
        userAgent: userAgent ? userAgent.slice(0, 255) : null
      }
    });

    return {
      accessToken,
      rawRefreshToken
    };
  }
}
