import { Request, Response, NextFunction } from 'express';
import { log, metrics, performanceLogger } from '../utils/logger';

interface MetricsData {
  totalRequests: number;
  errorCount: number;
  averageResponseTime: number;
  slowRequests: number;
  endpoints: { [key: string]: EndpointMetrics };
  statusCodes: { [key: string]: number };
}

interface EndpointMetrics {
  count: number;
  totalTime: number;
  avgTime: number;
  errorCount: number;
}

class ApplicationMetrics {
  private data: MetricsData;
  private responseTimes: number[] = [];

  constructor() {
    this.data = {
      totalRequests: 0,
      errorCount: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      endpoints: {},
      statusCodes: {}
    };
  }

  recordRequest(req: Request, res: Response, responseTime: number) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const statusCode = res.statusCode.toString();

    // Update general metrics
    this.data.totalRequests++;
    this.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times for rolling average
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
    
    this.data.averageResponseTime = Math.round(
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
    );

    // Track slow requests (> 2 seconds)
    if (responseTime > 2000) {
      this.data.slowRequests++;
    }

    // Track errors
    if (res.statusCode >= 400) {
      this.data.errorCount++;
    }

    // Track endpoint metrics
    if (!this.data.endpoints[endpoint]) {
      this.data.endpoints[endpoint] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        errorCount: 0
      };
    }

    const endpointMetric = this.data.endpoints[endpoint];
    endpointMetric.count++;
    endpointMetric.totalTime += responseTime;
    endpointMetric.avgTime = Math.round(endpointMetric.totalTime / endpointMetric.count);
    
    if (res.statusCode >= 400) {
      endpointMetric.errorCount++;
    }

    // Track status codes
    this.data.statusCodes[statusCode] = (this.data.statusCodes[statusCode] || 0) + 1;

    // Log significant events
    if (responseTime > 5000) {
      log.warn('Very slow request detected', {
        endpoint,
        responseTime: `${responseTime}ms`,
        threshold: '5000ms'
      }, req);
    }

    if (this.data.totalRequests % 100 === 0) {
      log.info('Request milestone reached', {
        totalRequests: this.data.totalRequests,
        averageResponseTime: `${this.data.averageResponseTime}ms`,
        errorRate: `${((this.data.errorCount / this.data.totalRequests) * 100).toFixed(2)}%`
      });
    }
  }

  getMetrics(): MetricsData & { timestamp: string; uptime: number } {
    return {
      ...this.data,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  getTopSlowEndpoints(limit = 5): Array<{endpoint: string, avgTime: number, count: number}> {
    return Object.entries(this.data.endpoints)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgTime: metrics.avgTime,
        count: metrics.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  getTopErrorEndpoints(limit = 5): Array<{endpoint: string, errorCount: number, errorRate: string}> {
    return Object.entries(this.data.endpoints)
      .map(([endpoint, metrics]) => ({
        endpoint,
        errorCount: metrics.errorCount,
        errorRate: `${((metrics.errorCount / metrics.count) * 100).toFixed(2)}%`
      }))
      .filter(item => item.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);
  }
}

const appMetrics = new ApplicationMetrics();

// Middleware to track application metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performanceLogger.startTimer();
  
  res.on('finish', () => {
    const responseTime = performanceLogger.logDuration(startTime, 'request_completed', req, {
      endpoint: `${req.method} ${req.route?.path || req.path}`,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent')?.substring(0, 50)
    });
    
    appMetrics.recordRequest(req, res, responseTime);
  });
  
  next();
};

// Export metrics for external access
export const getApplicationMetrics = () => appMetrics.getMetrics();
export const getTopSlowEndpoints = (limit?: number) => appMetrics.getTopSlowEndpoints(limit);
export const getTopErrorEndpoints = (limit?: number) => appMetrics.getTopErrorEndpoints(limit);

export default appMetrics;