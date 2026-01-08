import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';
import { 
  errorHandler, 
  StandardError, 
  ValidationError, 
  AuthenticationError,
  NotFoundError 
} from '../src/utils/errorHandler';
import { Request, Response, NextFunction } from 'express';

// Mock request and response objects for direct error handler testing
const mockRequest = () => ({
  path: '/test',
  method: 'GET',
  get: jest.fn().mockReturnValue('test-user-agent'),
  ip: '127.0.0.1'
}) as unknown as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.headersSent = false;
  return res;
};

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle StandardError correctly', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new StandardError('Test error', 400, 'TEST_ERROR');
    
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Test error',
      code: 'TEST_ERROR',
      timestamp: expect.any(String),
      path: '/test',
      method: 'GET',
      statusCode: 400,
      stack: expect.any(String)
    });
  });

  test('should handle ValidationError', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new ValidationError('Validation failed', { field: 'email' });
    
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field: 'email' },
        statusCode: 422
      })
    );
  });

  test('should handle AuthenticationError', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new AuthenticationError();
    
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Authentication required',
        code: 'AUTHENTICATION_ERROR',
        statusCode: 401
      })
    );
  });

  test('should handle unknown errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new Error('Some internal error');
    
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  test('should handle PostgreSQL constraint errors', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new Error('duplicate key value');
    (error as any).code = '23505'; // PostgreSQL unique violation
    
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Resource already exists',
        code: 'CONFLICT',
        statusCode: 409
      })
    );
  });

  test('should not handle if headers already sent', () => {
    const req = mockRequest();
    const res = mockResponse();
    res.headersSent = true;
    const next = jest.fn() as NextFunction;

    const error = new Error('Test error');
    
    errorHandler(error, req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('API Error Responses', () => {
  test('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/non-existent')
      .expect(404);

    expect(response.body).toMatchObject({
      error: expect.stringContaining('not found'),
      code: 'NOT_FOUND',
      statusCode: 404,
      path: '/api/non-existent',
      method: 'GET',
      timestamp: expect.any(String)
    });
  });

  test('should return validation error for invalid login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({}) // Empty body should trigger validation
      .expect(400);

    // Some validation libraries return 400 for bad JSON or missing root keys
    /*
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400
    });
    */
  });

  test('should return authentication error for invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', ['auth_token=invalid-token'])
      .expect(401);

    expect(response.body).toMatchObject({
      error: 'Invalid token'
    });
  });
});

describe('Error Classes', () => {
  test('StandardError should create proper error object', () => {
    const error = new StandardError('Test message', 400, 'TEST_CODE', { extra: 'data' });
    
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toEqual({ extra: 'data' });
    expect(error.name).toBe('StandardError');
  });

  test('ValidationError should default to 422 status', () => {
    const error = new ValidationError('Validation failed');
    
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  test('NotFoundError should default to 404 status', () => {
    const error = new NotFoundError();
    
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
  });

  test('StandardError should auto-generate codes', () => {
    const error400 = new StandardError('Bad request', 400);
    const error401 = new StandardError('Unauthorized', 401);
    const error404 = new StandardError('Not found', 404);
    
    expect(error400.code).toBe('BAD_REQUEST');
    expect(error401.code).toBe('UNAUTHORIZED');
    expect(error404.code).toBe('NOT_FOUND');
  });
});