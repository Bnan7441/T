import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
// const { v4: uuidv4 } = require('uuid');
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include correlation ID
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

// Log levels: error, warn, info, http, verbose, debug, silly
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
      const logEntry = {
        timestamp,
        level,
        message,
        ...(correlationId ? { correlationId } : {}),
        ...meta
      };
      return JSON.stringify(logEntry);
    })
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              const corrId = correlationId ? `[${String(correlationId).substring(0, 8)}]` : '';
              return `${timestamp} ${level}${corrId}: ${message} ${metaStr}`;
            })
          )
    }),
    
    // File transports for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ] : [])
  ],
  // Don't exit on handled exceptions in production
  exitOnError: process.env.NODE_ENV !== 'production'
});

// Middleware to add correlation IDs to requests
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  if (req.correlationId) {
    res.setHeader('x-correlation-id', req.correlationId);
  }
  next();
};

// Enhanced logger with correlation ID support
export const log = {
  error: (message: string, meta?: any, req?: Request) => {
    logger.error(message, { 
      ...meta, 
      correlationId: req?.correlationId 
    });
  },
  
  warn: (message: string, meta?: any, req?: Request) => {
    logger.warn(message, { 
      ...meta, 
      correlationId: req?.correlationId 
    });
  },
  
  info: (message: string, meta?: any, req?: Request) => {
    logger.info(message, { 
      ...meta, 
      correlationId: req?.correlationId 
    });
  },
  
  http: (message: string, meta?: any, req?: Request) => {
    logger.http(message, { 
      ...meta, 
      correlationId: req?.correlationId 
    });
  },
  
  debug: (message: string, meta?: any, req?: Request) => {
    logger.debug(message, { 
      ...meta, 
      correlationId: req?.correlationId 
    });
  },
  
  // Business event logging
  audit: (event: string, userId?: string, details?: any, req?: Request) => {
    logger.info('AUDIT_EVENT', {
      event,
      userId,
      details,
      correlationId: req?.correlationId,
      timestamp: new Date().toISOString(),
      auditLog: true
    });
  }
};

// Performance monitoring helpers
export const performanceLogger = {
  startTimer: () => {
    return Date.now();
  },
  
  logDuration: (startTime: number, operation: string, req?: Request, meta?: any) => {
    const duration = Date.now() - startTime;
    log.info(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      operation,
      ...meta
    }, req);
    return duration;
  }
};

// Database operation logger
export const dbLogger = {
  query: (query: string, params?: any[], req?: Request) => {
    const startTime = performanceLogger.startTimer();
    return {
      end: (rowCount?: number, error?: any) => {
        const duration = performanceLogger.logDuration(startTime, 'database_query', req, {
          query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
          paramCount: params?.length || 0,
          rowCount,
          error: error?.message
        });
        
        if (duration > 1000) { // Log slow queries
          log.warn('Slow database query detected', {
            duration: `${duration}ms`,
            query: query.substring(0, 200)
          }, req);
        }
      }
    };
  }
};

// Application metrics helpers
interface MetricsCounters {
  requests: number;
  errors: number;
  dbQueries: number;
  authAttempts: number;
  purchases: number;
}

export const metrics = {
  counters: {
    requests: 0,
    errors: 0,
    dbQueries: 0,
    authAttempts: 0,
    purchases: 0
  } as MetricsCounters,
  
  increment: (counter: keyof MetricsCounters) => {
    metrics.counters[counter]++;
    
    // Log significant milestones
    if (metrics.counters[counter] % 1000 === 0) {
      log.info(`Metrics milestone: ${String(counter)} reached ${metrics.counters[counter]}`);
    }
  },
  
  getSnapshot: () => ({
    ...metrics.counters,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
};

export default logger;