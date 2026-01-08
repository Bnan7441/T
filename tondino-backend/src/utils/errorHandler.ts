import { Request, Response, NextFunction } from 'express';
import { log, metrics } from './logger';

export interface APIError {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

export class StandardError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.details = details;
    this.name = 'StandardError';
  }

  private getDefaultCode(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'VALIDATION_ERROR';
      case 500: return 'INTERNAL_SERVER_ERROR';
      case 502: return 'BAD_GATEWAY';
      case 503: return 'SERVICE_UNAVAILABLE';
      default: return 'UNKNOWN_ERROR';
    }
  }
}

// Specific error types
export class ValidationError extends StandardError {
  constructor(message: string, details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends StandardError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends StandardError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends StandardError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends StandardError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DatabaseError extends StandardError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

// Enhanced error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(err);
  }

  const isProd = process.env.NODE_ENV === 'production';
  
  // Increment error metrics
  metrics.increment('errors');
  
  // Structured error logging
  log.error('Request Error', {
    message: err.message,
    stack: isProd ? undefined : err.stack,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    errorType: err.constructor.name,
    statusCode: err.statusCode || 500
  }, req);

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  if (err instanceof StandardError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors;
  } else if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Resource already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Referenced resource does not exist';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTHENTICATION_ERROR';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'Invalid JSON in request body';
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || 'Request failed';
  }

  const errorResponse: APIError = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    statusCode,
  };

  // Include details in development or for client errors
  if (!isProd || statusCode < 500) {
    if (details) {
      errorResponse.details = details;
    }
  }

  // Include stack trace in development
  if (!isProd && err.stack) {
    (errorResponse as any).stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Helper function to create async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation helper
export const validateRequired = (fields: Record<string, any>, requiredFields: string[]) => {
  const missing = requiredFields.filter(field => !fields[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    );
  }
};

// Database operation wrapper
export const dbOperation = async <T>(
  operation: () => Promise<T>,
  context: string,
  req?: Request
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    log.error(`Database operation failed: ${context}`, {
      error: error.message,
      code: error.code,
      context
    }, req);
    
    metrics.increment('errors');
    
    if (error.code?.startsWith('23')) { // PostgreSQL constraint violations
      throw error; // Let error handler deal with specific codes
    }
    
    throw new DatabaseError(`Database operation failed: ${context}`, {
      originalError: error.message
    });
  }
};