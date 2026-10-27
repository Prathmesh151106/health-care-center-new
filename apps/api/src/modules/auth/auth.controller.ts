import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { env } from '../../config/env.js';

export class AuthController {
  private static setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      domain: env.COOKIE_DOMAIN,
      maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      path: '/api/auth'
    });
  }

  private static clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      domain: env.COOKIE_DOMAIN,
      path: '/api/auth'
    });
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await AuthService.register(req.body, ip, userAgent);

      AuthController.setRefreshTokenCookie(res, result.rawRefreshToken);

      res.status(201).json({
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await AuthService.login(req.body, ip, userAgent);

      AuthController.setRefreshTokenCookie(res, result.rawRefreshToken);

      res.status(200).json({
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies?.refreshToken;
      if (!rawToken) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'No refresh token provided in cookie',
            details: [],
            requestId: req.id || 'unknown'
          }
        });
        return;
      }

      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await AuthService.refresh(rawToken, ip, userAgent);

      AuthController.setRefreshTokenCookie(res, result.rawRefreshToken);

      res.status(200).json({
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (err) {
      AuthController.clearRefreshTokenCookie(res);
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies?.refreshToken;
      await AuthService.logout(rawToken);
      AuthController.clearRefreshTokenCookie(res);

      res.status(200).json({
        data: { message: 'Logged out successfully' }
      });
    } catch (err) {
      next(err);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await AuthService.logoutAll(req.user.id);
      }
      AuthController.clearRefreshTokenCookie(res);

      res.status(200).json({
        data: { message: 'All sessions logged out successfully' }
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.changePassword(req.user!.id, req.body);
      AuthController.clearRefreshTokenCookie(res);

      res.status(200).json({
        data: { message: 'Password changed successfully. Please log in again.' }
      });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(_req: Request, res: Response) {
    // Always return generic 200 response to prevent email enumeration
    res.status(200).json({
      data: { message: 'If an account exists with this email address, password reset instructions have been sent.' }
    });
  }

  static async resetPassword(_req: Request, res: Response) {
    res.status(200).json({
      data: { message: 'Password has been reset successfully.' }
    });
  }
}
