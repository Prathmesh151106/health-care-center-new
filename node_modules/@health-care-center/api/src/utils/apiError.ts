import { ErrorCode, ApiErrorDetail } from '@health-care-center/shared';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: ApiErrorDetail[];

  constructor(statusCode: number, code: ErrorCode, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details: ApiErrorDetail[] = []): ApiError {
    return new ApiError(400, ErrorCode.VALIDATION_ERROR, message, details);
  }

  static unauthorized(message: string = 'Authentication required'): ApiError {
    return new ApiError(401, ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message: string = 'Access denied'): ApiError {
    return new ApiError(403, ErrorCode.FORBIDDEN, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, ErrorCode.NOT_FOUND, message);
  }

  static conflict(message: string = 'Resource already exists'): ApiError {
    return new ApiError(409, ErrorCode.CONFLICT, message);
  }

  static tooManyRequests(message: string = 'Too many requests, please slow down'): ApiError {
    return new ApiError(429, ErrorCode.TOO_MANY_REQUESTS, message);
  }

  static internal(message: string = 'An unexpected error occurred'): ApiError {
    return new ApiError(500, ErrorCode.INTERNAL_SERVER_ERROR, message);
  }
}
