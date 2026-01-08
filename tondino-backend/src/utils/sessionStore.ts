// For development without Redis, fallback to ioredis types
let Redis: any;
try {
  Redis = require('ioredis');
} catch (e) {
  // Fallback for development
  Redis = class MockRedis {
    constructor() {}
    setex() { throw new Error('Redis not available'); }
    get() { throw new Error('Redis not available'); }
    del() { throw new Error('Redis not available'); }
    keys() { throw new Error('Redis not available'); }
    ping() { throw new Error('Redis not available'); }
    quit() { return Promise.resolve(); }
  };
}
import { log } from './logger.js';

export interface SessionData {
  userId: number;
  email: string;
  role: string;
  lastActivity: number;
  metadata?: Record<string, any>;
}

/**
 * External Session Store using Redis
 * Enables horizontal scaling by moving session state out of memory
 */
export class ExternalSessionStore {
  private redis: any;
  private readonly TTL = 24 * 60 * 60; // 24 hours in seconds
  private readonly prefix = 'session:';

  constructor() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: false,
      keyPrefix: this.prefix,
      onConnect: () => log.info('Redis session store connected'),
      onError: (err: Error) => log.error('Redis session store error:', err),
    });
  }

  /**
   * Store session data
   */
  async set(sessionId: string, data: SessionData): Promise<void> {
    try {
      const serialized = JSON.stringify({
        ...data,
        lastActivity: Date.now(),
      });
      
      await this.redis.setex(sessionId, this.TTL, serialized);
      log.debug('Session stored', { sessionId, userId: data.userId });
    } catch (error: any) {
      log.error('Failed to store session', { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Retrieve session data
   */
  async get(sessionId: string): Promise<SessionData | null> {
    try {
      const serialized = await this.redis.get(sessionId);
      if (!serialized) {
        return null;
      }

      const data = JSON.parse(serialized) as SessionData;
      
      // Check if session is expired based on activity
      const inactiveTime = Date.now() - data.lastActivity;
      const maxInactiveTime = 2 * 60 * 60 * 1000; // 2 hours
      
      if (inactiveTime > maxInactiveTime) {
        await this.delete(sessionId);
        return null;
      }

      return data;
    } catch (error: any) {
      log.error('Failed to retrieve session', { sessionId, error: error.message });
      return null;
    }
  }

  /**
   * Update session activity timestamp
   */
  async touch(sessionId: string): Promise<void> {
    try {
      const data = await this.get(sessionId);
      if (data) {
        data.lastActivity = Date.now();
        await this.set(sessionId, data);
      }
    } catch (error: any) {
      log.error('Failed to touch session', { sessionId, error: error.message });
    }
  }

  /**
   * Delete session
   */
  async delete(sessionId: string): Promise<void> {
    try {
      await this.redis.del(sessionId);
      log.debug('Session deleted', { sessionId });
    } catch (error) {
      log.error('Failed to delete session', { sessionId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: number): Promise<void> {
    try {
      const keys = await this.redis.keys(`*`);
      const userSessions = [];

      for (const key of keys) {
        const sessionId = key.replace(this.prefix, '');
        const data = await this.get(sessionId);
        if (data && data.userId === userId) {
          userSessions.push(sessionId);
        }
      }

      if (userSessions.length > 0) {
        await Promise.all(userSessions.map(id => this.delete(id)));
        log.info('Deleted user sessions', { userId, count: userSessions.length });
      }
    } catch (error) {
      log.error('Failed to delete user sessions', { userId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get active session count
   */
  async getActiveSessionCount(): Promise<number> {
    try {
      const keys = await this.redis.keys(`*`);
      return keys.length;
    } catch (error) {
      log.error('Failed to get session count', { error: error instanceof Error ? error.message : String(error) });
      return 0;
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanup(): Promise<void> {
    try {
      const keys = await this.redis.keys(`*`);
      let cleanedCount = 0;

      for (const key of keys) {
        const sessionId = key.replace(this.prefix, '');
        const data = await this.get(sessionId); // This will auto-delete expired sessions
        if (!data) {
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        log.info('Session cleanup completed', { cleanedCount });
      }
    } catch (error) {
      log.error('Session cleanup failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      log.error('Redis health check failed', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      log.info('Redis session store disconnected');
    } catch (error) {
      log.error('Error closing Redis connection', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}

// Singleton instance
let sessionStore: ExternalSessionStore;

export function getSessionStore(): ExternalSessionStore {
  if (!sessionStore) {
    sessionStore = new ExternalSessionStore();
  }
  return sessionStore;
}

/**
 * Fallback in-memory session store for development
 * Use when Redis is not available
 */
export class InMemorySessionStore {
  private sessions = new Map<string, SessionData>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

  async set(sessionId: string, data: SessionData): Promise<void> {
    this.sessions.set(sessionId, {
      ...data,
      lastActivity: Date.now(),
    });
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const data = this.sessions.get(sessionId);
    if (!data) {
      return null;
    }

    // Check expiration
    const inactiveTime = Date.now() - data.lastActivity;
    if (inactiveTime > this.TTL) {
      this.sessions.delete(sessionId);
      return null;
    }

    return data;
  }

  async touch(sessionId: string): Promise<void> {
    const data = this.sessions.get(sessionId);
    if (data) {
      data.lastActivity = Date.now();
    }
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async deleteUserSessions(userId: number): Promise<void> {
    for (const [sessionId, data] of this.sessions) {
      if (data.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  async getActiveSessionCount(): Promise<number> {
    return this.sessions.size;
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [sessionId, data] of this.sessions) {
      if (now - data.lastActivity > this.TTL) {
        this.sessions.delete(sessionId);
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async close(): Promise<void> {
    this.sessions.clear();
  }
}

/**
 * Get appropriate session store based on environment
 */
export function createSessionStore(): ExternalSessionStore | InMemorySessionStore {
  const useRedis = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
  
  if (useRedis) {
    log.info('Using Redis session store for horizontal scaling');
    return getSessionStore();
  } else {
    log.warn('Using in-memory session store - not suitable for production scaling');
    return new InMemorySessionStore();
  }
}