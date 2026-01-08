import { Request, Response } from 'express';
import pool from '../config/database';
import { log } from '../utils/logger';
import { getApplicationMetrics } from '../middleware/metrics';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: any;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

class HealthChecker {
  
  async checkDatabase(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await pool.query('SELECT 1 as health_check');
      const responseTime = Date.now() - start;
      
      return {
        name: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: { 
          connection: 'active',
          warning: responseTime > 1000 ? 'Slow response time' : undefined
        }
      };
    } catch (error: any) {
      return {
        name: 'database',
        status: 'unhealthy',
        error: error.message,
        details: { connection: 'failed' }
      };
    }
  }

  async checkMemoryUsage(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usagePercent = (usedMB / totalMB) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (usagePercent > 90) {
      status = 'unhealthy';
    } else if (usagePercent > 75) {
      status = 'degraded';
    }

    return {
      name: 'memory',
      status,
      details: {
        usedMB,
        totalMB,
        usagePercent: Math.round(usagePercent),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
    };
  }

  async checkDiskSpace(): Promise<HealthCheck> {
    try {
      const fs = require('fs').promises;
      const stats = await fs.stat('./');
      
      // This is a basic check - in production you'd want proper disk space monitoring
      return {
        name: 'disk_space',
        status: 'healthy',
        details: { 
          note: 'Basic check - consider implementing proper disk space monitoring',
          accessible: true
        }
      };
    } catch (error: any) {
      return {
        name: 'disk_space',
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkApplicationMetrics(): Promise<HealthCheck> {
    const metrics = getApplicationMetrics();
    const errorRate = metrics.totalRequests > 0 
      ? (metrics.errorCount / metrics.totalRequests) * 100 
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 10) {
      status = 'unhealthy';
    } else if (errorRate > 5 || metrics.averageResponseTime > 2000) {
      status = 'degraded';
    }

    return {
      name: 'application_metrics',
      status,
      details: {
        totalRequests: metrics.totalRequests,
        errorRate: Math.round(errorRate * 100) / 100,
        averageResponseTime: metrics.averageResponseTime,
        slowRequests: metrics.slowRequests
      }
    };
  }

  async performFullHealthCheck(): Promise<SystemHealth> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkMemoryUsage(),
      this.checkDiskSpace(),
      this.checkApplicationMetrics()
    ]);

    const summary = checks.reduce(
      (acc, check) => {
        acc[check.status]++;
        return acc;
      },
      { healthy: 0, degraded: 0, unhealthy: 0 }
    );

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: require('../../package.json').version || '1.0.0',
      checks,
      summary
    };
  }
}

const healthChecker = new HealthChecker();

// Simple health check endpoint
export const simpleHealthCheck = async (req: Request, res: Response) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
  
  log.debug("Simple health check", health, req);
  res.json(health);
};

// Comprehensive health check endpoint
export const fullHealthCheck = async (req: Request, res: Response) => {
  try {
    const healthReport = await healthChecker.performFullHealthCheck();
    
    const statusCode = healthReport.status === 'healthy' ? 200 
      : healthReport.status === 'degraded' ? 200 
      : 503;

    log.info("Full health check performed", {
      status: healthReport.status,
      summary: healthReport.summary
    }, req);
    
    res.status(statusCode).json(healthReport);
  } catch (error: any) {
    log.error("Health check failed", { error: error.message }, req);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check system failure',
      timestamp: new Date().toISOString()
    });
  }
};

// Database-specific health check
export const databaseHealthCheck = async (req: Request, res: Response) => {
  const dbCheck = await healthChecker.checkDatabase();
  
  const statusCode = dbCheck.status === 'unhealthy' ? 503 : 200;
  
  log.info("Database health check", dbCheck, req);
  res.status(statusCode).json(dbCheck);
};

// Readiness probe (for Kubernetes)
export const readinessCheck = async (req: Request, res: Response) => {
  const dbCheck = await healthChecker.checkDatabase();
  
  if (dbCheck.status === 'unhealthy') {
    log.warn("Readiness check failed - database unhealthy", dbCheck, req);
    res.status(503).json({
      status: 'not_ready',
      reason: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  log.debug("Readiness check passed", {}, req);
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
};

// Liveness probe (for Kubernetes)  
export const livenessCheck = (req: Request, res: Response) => {
  log.debug("Liveness check", {}, req);
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};