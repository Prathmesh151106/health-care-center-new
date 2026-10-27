import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';
import { ApiErrorEnvelope, ErrorCode } from '@health-care-center/shared';
import { logger } from './requestLogger.js';
import { env } from '../config/env.js';

export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req.id as string) || (req.headers['x-request-id'] as string) || 'unknown';

  let statusCode = 500;
  let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected internal server error occurred';
  let details: any[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
      code: i.code
    }));
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Payload too large, limit is 100 KB';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = ErrorCode.UNAUTHORIZED;
    message = 'Invalid or expired authentication token';
  }

  // Safe logging: log error name and stack internally, but never leak sensitive context or tokens
  if (statusCode >= 500) {
    logger.error({
      err: {
        name: err.name,
        message: err.message,
        stack: env.NODE_ENV !== 'production' ? err.stack : undefined
      },
      requestId,
      method: req.method,
      path: req.originalUrl
    }, 'Unhandled internal error in request processing');
  }

  const responsePayload: ApiErrorEnvelope = {
    error: {
      code,
      message,
      details,
      requestId
    }
  };

  res.status(statusCode).json(responsePayload);
}

export function notFoundHandlerMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
