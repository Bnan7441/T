import morgan from 'morgan';
import { Request, Response } from 'express';
import { log, metrics } from '../utils/logger';

// Custom Morgan token for correlation IDs
morgan.token('correlationId', (req: Request) => req.correlationId || 'none');

// Custom Morgan token for response time with color coding
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = parseFloat(res.getHeader('x-response-time') as string || '0');
  return `${responseTime.toFixed(2)}ms`;
});

// Custom Morgan token for request size
morgan.token('request-size', (req: Request) => {
  const contentLength = req.headers['content-length'];
  return contentLength ? `${contentLength}b` : '0b';
});

// Custom Morgan format for structured logging
const createStructuredFormat = () => {
  return (tokens: any, req: Request, res: Response) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: parseInt(tokens.status(req, res)),
      responseTime: parseFloat(tokens['response-time'](req, res)),
      contentLength: parseInt(tokens.res(req, res, 'content-length') || '0'),
      userAgent: tokens['user-agent'](req, res),
      remoteAddr: tokens['remote-addr'](req, res),
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    };

    // Increment request metrics
    metrics.increment('requests');
    
    // Log errors separately
    if (logData.status >= 400) {
      metrics.increment('errors');
      log.error('HTTP Error Response', logData, req);
    } else if (logData.status >= 300) {
      log.http('HTTP Redirect', logData, req);
    } else {
      log.http('HTTP Success', logData, req);
    }

    // Log slow requests
    if (logData.responseTime > 2000) {
      log.warn('Slow HTTP Request', {
        ...logData,
        warning: 'Response time exceeded 2 seconds'
      }, req);
    }

    return JSON.stringify(logData);
  };
};

// Development format with colors
const devFormat = ':correlationId :method :url :status :response-time-ms :request-size - :user-agent';

// Export configured Morgan middleware
export const requestLogger = morgan(devFormat, {
    // Skip logging for health checks in production to reduce noise
    skip: (req: Request) => {
      return process.env.NODE_ENV === 'production' && req.originalUrl === '/api/health';
    },
    
    // Stream to our logger instead of console
    stream: {
      write: (message: string) => {
        // Parse request data for metrics tracking
        metrics.increment('requests');
        log.http(message.trim());
      }
    }
  }
);

// Middleware to measure and add response time header
export const responseTimeMiddleware = (req: Request, res: Response, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    // Header cannot be set after response is finished
    // metric logging happens via morgan stream above
  });
  
  next();
};