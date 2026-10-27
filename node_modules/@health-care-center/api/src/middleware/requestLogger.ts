import { Request, Response, NextFunction } from 'express';
import { pinoHttp } from 'pino-http';
import { pino } from 'pino';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.newPassword',
      'req.body.currentPassword',
      'req.body.token',
      'req.body.keys',
      'req.body.notes',
      'req.body.symptoms',
      'req.body.value',
      'req.body.message',
      'res.headers["set-cookie"]'
    ],
    remove: true
  }
});

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
}

export const requestLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => (req as Request).id || crypto.randomUUID(),
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url?.startsWith('/api/health') || false
  }
});
