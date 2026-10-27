import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticatedUserContext } from '@health-care-center/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  timezone: string;
  locale: string;
  type: 'access';
}

export function signAccessToken(user: AuthenticatedUserContext): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    timezone: user.timezone,
    locale: user.locale,
    type: 'access'
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'daily-health-companion-api',
    audience: 'daily-health-companion-web'
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'daily-health-companion-api',
    audience: 'daily-health-companion-web'
  }) as JwtPayload;
}
