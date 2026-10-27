import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          ApiError.badRequest(
            'Validation failed',
            error.issues.map((i) => ({
              field: i.path.join('.'),
              message: i.message,
              code: i.code
            }))
          )
        );
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          ApiError.badRequest(
            'Query parameter validation failed',
            error.issues.map((i) => ({
              field: i.path.join('.'),
              message: i.message,
              code: i.code
            }))
          )
        );
      }
      next(error);
    }
  };
}
