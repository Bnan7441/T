import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createSessionStore, SessionData } from '../utils/sessionStore.js';
import { log } from '../utils/logger.js';
import { StandardError, AuthenticationError } from '../utils/errorHandler.js';

// Extend Request interface to include session data
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      session?: SessionData;
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

const sessionStore = createSessionStore();

/**
 * JWT Configuration
 */
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate secure session ID
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to cookie
  return req.cookies?.token || null;
}

/**
 * Stateless Authentication Middleware
 * 
 * Features:
 * - External session storage for horizontal scaling
 * - JWT token validation
 * - Session activity tracking
 * - Graceful fallback for missing Redis
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError: any) {
      log.warn('Invalid JWT token', { 
        error: jwtError.message, 
        correlationId: req.correlationId 
      });
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    // Extract session ID from JWT
    const sessionId = decoded.sessionId;
    if (!sessionId) {
      log.warn('No session ID in JWT token', { 
        userId: decoded.userId,
        correlationId: req.correlationId 
      });
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session',
        code: 'INVALID_SESSION'
      });
    }

    // Retrieve session from external store
    const sessionData = await sessionStore.get(sessionId);
    if (!sessionData) {
      log.warn('Session not found or expired', { 
        sessionId,
        userId: decoded.userId,
        correlationId: req.correlationId 
      });
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Update session activity
    await sessionStore.touch(sessionId);

    // Attach session data to request
    req.sessionId = sessionId;
    req.session = sessionData;
    req.user = {
      id: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
    };

    log.debug('User authenticated', {
      userId: sessionData.userId,
      sessionId,
      correlationId: req.correlationId
    });

    next();
  } catch (error: any) {
    log.error('Authentication middleware error', {
      error: error.message,
      correlationId: req.correlationId
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Require Authentication Middleware
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

/**
 * Require Admin Role Middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

/**
 * Create new session
 */
export async function createSession(userData: {
  userId: number;
  email: string;
  role: string;
  metadata?: Record<string, any>;
}): Promise<{ token: string; sessionId: string }> {
  const sessionId = generateSessionId();
  
  const sessionData: SessionData = {
    userId: userData.userId,
    email: userData.email,
    role: userData.role,
    lastActivity: Date.now(),
    metadata: userData.metadata || {},
  };

  // Store session in external store
  await sessionStore.set(sessionId, sessionData);

  // Create JWT token with session reference
  const token = jwt.sign(
    {
      userId: userData.userId,
      email: userData.email,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  log.info('Session created', {
    userId: userData.userId,
    sessionId,
    email: userData.email
  });

  return { token, sessionId };
}

/**
 * Destroy session
 */
export async function destroySession(sessionId: string): Promise<void> {
  await sessionStore.delete(sessionId);
  log.info('Session destroyed', { sessionId });
}

/**
 * Destroy all user sessions (useful for logout from all devices)
 */
export async function destroyUserSessions(userId: number): Promise<void> {
  await sessionStore.deleteUserSessions(userId);
  log.info('All user sessions destroyed', { userId });
}

/**
 * Session cleanup middleware
 * Run periodically to clean expired sessions
 */
export async function sessionCleanup(): Promise<void> {
  try {
    await sessionStore.cleanup();
    log.debug('Session cleanup completed');
  } catch (error) {
    log.error('Session cleanup error', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Session health check
 */
export async function sessionHealthCheck(): Promise<{
  healthy: boolean;
  activeSessions: number;
  storeType: string;
}> {
  try {
    const healthy = await sessionStore.healthCheck();
    const activeSessions = await sessionStore.getActiveSessionCount();
    const storeType = process.env.REDIS_URL ? 'redis' : 'memory';

    return {
      healthy,
      activeSessions,
      storeType,
    };
  } catch (error) {
    log.error('Session health check failed', { error: error instanceof Error ? error.message : String(error) });
    return {
      healthy: false,
      activeSessions: 0,
      storeType: 'unknown',
    };
  }
}

/**
 * Initialize session management
 * Set up periodic cleanup and health monitoring
 */
export function initializeSessionManagement(): void {
  // Cleanup expired sessions every hour
  setInterval(() => {
    sessionCleanup().catch(error => {
      log.error('Scheduled session cleanup failed', { error: error.message });
    });
  }, 60 * 60 * 1000); // 1 hour

  log.info('Session management initialized', {
    storeType: process.env.REDIS_URL ? 'redis' : 'memory',
    cleanupInterval: '60 minutes'
  });
}

/**
 * Graceful shutdown
 */
export async function shutdownSessionStore(): Promise<void> {
  await sessionStore.close();
  log.info('Session store shutdown completed');
}