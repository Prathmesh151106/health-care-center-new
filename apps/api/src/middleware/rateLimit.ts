import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import crypto from 'node:crypto';

// Global API rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_GLOBAL_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true, // Fail-open / fallback if Redis is temporarily unreachable
  store: env.NODE_ENV === 'test' ? undefined : new RedisStore({
    // @ts-expect-error ioredis type compatibility
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
    prefix: 'rl:global:'
  }),
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many requests, please slow down.'));
  }
});

// Strict limiter for authentication endpoints (login, forgot, reset)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_AUTH_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: env.NODE_ENV === 'test' ? undefined : new RedisStore({
    // @ts-expect-error ioredis type compatibility
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
    prefix: 'rl:auth:'
  }),
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email ? crypto.createHash('sha256').update(String(req.body.email)).digest('hex').slice(0, 16) : 'anon';
    return `${ip}:${email}`;
  },
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many authentication attempts. Please try again after 1 minute.'));
  }
});

// AI Assistant rate limiter (per authenticated user)
export const assistantRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_ASSISTANT_PER_MINUTE,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: env.NODE_ENV === 'test' ? undefined : new RedisStore({
    // @ts-expect-error ioredis type compatibility
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
    prefix: 'rl:assistant:'
  }),
  keyGenerator: (req) => {
    return req.user?.id || req.ip || 'unknown';
  },
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('AI message rate limit exceeded. Please wait a moment before sending another prompt.'));
  }
});
