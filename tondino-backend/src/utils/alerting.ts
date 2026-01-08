import { log, metrics } from './logger';
import { getApplicationMetrics } from '../middleware/metrics';

interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  condition: () => boolean;
  action: () => void;
  lastTriggered?: Date;
  cooldownMs: number;
}

interface AlertRule {
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  threshold: any;
  checkFunction: (threshold: any) => boolean;
  cooldownMs: number;
}

class AlertManager {
  private alerts: Alert[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAlerts();
  }

  private initializeAlerts() {
    const alertRules: AlertRule[] = [
      {
        name: 'high_error_rate',
        description: 'Application error rate exceeds threshold',
        severity: 'critical',
        threshold: 10, // 10% error rate
        checkFunction: (threshold) => {
          const appMetrics = getApplicationMetrics();
          const errorRate = appMetrics.totalRequests > 0 
            ? (appMetrics.errorCount / appMetrics.totalRequests) * 100 
            : 0;
          return errorRate > threshold;
        },
        cooldownMs: 5 * 60 * 1000 // 5 minutes
      },
      {
        name: 'slow_response_time',
        description: 'Average response time is too high',
        severity: 'warning',
        threshold: 2000, // 2 seconds
        checkFunction: (threshold) => {
          const appMetrics = getApplicationMetrics();
          return appMetrics.averageResponseTime > threshold;
        },
        cooldownMs: 10 * 60 * 1000 // 10 minutes
      },
      {
        name: 'high_memory_usage',
        description: 'Memory usage exceeds threshold',
        severity: 'warning',
        threshold: 80, // 80% of heap
        checkFunction: (threshold) => {
          const memUsage = process.memoryUsage();
          const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
          return usagePercent > threshold;
        },
        cooldownMs: 15 * 60 * 1000 // 15 minutes
      },
      {
        name: 'database_connection_errors',
        description: 'Database connection issues detected',
        severity: 'critical',
        threshold: 5, // 5 errors in the monitoring period
        checkFunction: (threshold) => {
          // This would need to be enhanced to track actual DB connection errors
          // For now, this is a placeholder
          return false;
        },
        cooldownMs: 2 * 60 * 1000 // 2 minutes
      },
      {
        name: 'too_many_slow_requests',
        description: 'High number of slow requests detected',
        severity: 'warning',
        threshold: 50, // 50 slow requests
        checkFunction: (threshold) => {
          const appMetrics = getApplicationMetrics();
          return appMetrics.slowRequests > threshold;
        },
        cooldownMs: 20 * 60 * 1000 // 20 minutes
      }
    ];

    // Convert rules to alerts
    this.alerts = alertRules.map(rule => ({
      id: `alert_${rule.name}`,
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      condition: () => rule.checkFunction(rule.threshold),
      action: () => this.triggerAlert(rule),
      cooldownMs: rule.cooldownMs
    }));
  }

  private triggerAlert(rule: AlertRule) {
    const alertData = {
      alert: rule.name,
      description: rule.description,
      severity: rule.severity,
      threshold: rule.threshold,
      timestamp: new Date().toISOString(),
      systemState: this.getSystemSnapshot()
    };

    if (rule.severity === 'critical') {
      log.error(`ALERT: ${rule.description}`, alertData);
    } else if (rule.severity === 'warning') {
      log.warn(`ALERT: ${rule.description}`, alertData);
    } else {
      log.info(`ALERT: ${rule.description}`, alertData);
    }

    // Here you would integrate with external alerting systems:
    // - Send email notifications
    // - Post to Slack/Teams
    // - Send to PagerDuty
    // - Webhook to monitoring service
    
    this.notifyExternalSystems(rule, alertData);
  }

  private notifyExternalSystems(rule: AlertRule, alertData: any) {
    // Example integrations:
    
    // Webhook notification
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      this.sendWebhook(webhookUrl, alertData).catch(err => {
        log.error('Failed to send alert webhook', { error: err.message });
      });
    }

    // Email notification (would need email service)
    const alertEmail = process.env.ALERT_EMAIL;
    if (alertEmail && rule.severity === 'critical') {
      log.info('Critical alert would be emailed', { 
        email: alertEmail, 
        alert: alertData 
      });
    }

    // Log aggregation service markers
    log.info('ALERT_MARKER', {
      type: 'alert_triggered',
      rule: rule.name,
      severity: rule.severity,
      searchable: true,
      ...alertData
    });
  }

  private async sendWebhook(url: string, data: any) {
    try {
      const fetch = require('node-fetch');
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error: any) {
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }

  private getSystemSnapshot() {
    const memUsage = process.memoryUsage();
    const appMetrics = getApplicationMetrics();
    
    return {
      memory: {
        usedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        totalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      application: {
        totalRequests: appMetrics.totalRequests,
        errorCount: appMetrics.errorCount,
        averageResponseTime: appMetrics.averageResponseTime,
        slowRequests: appMetrics.slowRequests,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    };
  }

  private shouldTriggerAlert(alert: Alert): boolean {
    const now = new Date();
    
    if (alert.lastTriggered) {
      const timeSinceLastTrigger = now.getTime() - alert.lastTriggered.getTime();
      if (timeSinceLastTrigger < alert.cooldownMs) {
        return false; // Still in cooldown period
      }
    }

    return alert.condition();
  }

  checkAlerts() {
    this.alerts.forEach(alert => {
      if (this.shouldTriggerAlert(alert)) {
        alert.lastTriggered = new Date();
        alert.action();
      }
    });
  }

  startMonitoring(intervalMs = 60000) { // Default: check every minute
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkAlerts();
    }, intervalMs);

    log.info('Alert monitoring started', { 
      intervalMs, 
      alertsConfigured: this.alerts.length 
    });
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      log.info('Alert monitoring stopped');
    }
  }

  getAlertStatus() {
    return {
      monitoring: this.checkInterval !== null,
      configuredAlerts: this.alerts.length,
      alerts: this.alerts.map(alert => ({
        name: alert.name,
        description: alert.description,
        severity: alert.severity,
        lastTriggered: alert.lastTriggered,
        cooldownMs: alert.cooldownMs
      }))
    };
  }
}

// Singleton instance
const alertManager = new AlertManager();

export { alertManager, AlertManager };
export default alertManager;