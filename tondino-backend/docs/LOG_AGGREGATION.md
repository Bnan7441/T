# Log Aggregation Configuration for Tondino Backend

This document describes how to integrate Tondino backend with various log aggregation services.

## Built-in Structured Logging

The application uses Winston for structured logging with correlation IDs and comprehensive error tracking.

### Log Format
```json
{
  "timestamp": "2026-01-06T10:30:00Z",
  "level": "info",
  "message": "Request completed",
  "correlationId": "abc123de-f456-789g-hij1-234567890klm",
  "method": "POST",
  "url": "/api/courses/purchase/1",
  "statusCode": 200,
  "responseTime": 145,
  "userId": "user123"
}
```

### Log Levels
- `error`: Application errors, exceptions
- `warn`: Warning conditions, slow queries, high error rates
- `info`: General information, successful operations
- `http`: HTTP request/response logging
- `debug`: Detailed debugging information

## Integration Options

### 1. ELK Stack (Elasticsearch, Logstash, Kibana)

#### Logstash Configuration
Create `/etc/logstash/conf.d/tondino-backend.conf`:

```ruby
input {
  file {
    path => "/path/to/tondino-backend/logs/*.log"
    type => "tondino-backend"
    codec => "json"
  }
}

filter {
  if [type] == "tondino-backend" {
    # Parse correlation ID for tracing
    if [correlationId] {
      mutate {
        add_field => { "trace_id" => "%{correlationId}" }
      }
    }
    
    # Add environment tag
    mutate {
      add_field => { "environment" => "${ENV_NAME:dev}" }
      add_field => { "service" => "tondino-backend" }
    }
    
    # Parse response time for performance monitoring
    if [responseTime] {
      mutate {
        convert => { "responseTime" => "integer" }
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "tondino-backend-%{+YYYY.MM.dd}"
  }
}
```

#### Kibana Dashboards
Import dashboard configurations for:
- Request volume and response times
- Error rate monitoring
- Slow request tracking
- Correlation ID tracing

### 2. Grafana Loki

#### Promtail Configuration
Create `promtail-config.yml`:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: tondino-backend
    static_configs:
      - targets:
          - localhost
        labels:
          job: tondino-backend
          environment: ${ENV_NAME}
          __path__: /path/to/tondino-backend/logs/*.log
    
    pipeline_stages:
      - json:
          expressions:
            level: level
            correlationId: correlationId
            method: method
            statusCode: statusCode
            responseTime: responseTime
      
      - labels:
          level:
          method:
          statusCode:
```

#### Grafana Queries
LogQL examples for monitoring:
```logql
# Error rate
rate({job="tondino-backend"} |= "error" [5m])

# Slow requests
{job="tondino-backend"} | json | responseTime > 2000

# Correlation ID tracing
{job="tondino-backend"} | json | correlationId = "your-correlation-id"
```

### 3. AWS CloudWatch

#### CloudWatch Agent Configuration
Create `cloudwatch-agent.json`:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/path/to/tondino-backend/logs/combined.log",
            "log_group_name": "/aws/tondino/backend",
            "log_stream_name": "{instance_id}/combined",
            "timestamp_format": "%Y-%m-%d %H:%M:%S"
          },
          {
            "file_path": "/path/to/tondino-backend/logs/error.log", 
            "log_group_name": "/aws/tondino/backend-errors",
            "log_stream_name": "{instance_id}/errors"
          }
        ]
      }
    }
  }
}
```

#### CloudWatch Insights Queries
```sql
-- Error analysis
fields @timestamp, level, message, correlationId, error
| filter level = "error"
| sort @timestamp desc

-- Performance monitoring
fields @timestamp, method, url, responseTime
| filter responseTime > 1000
| sort responseTime desc

-- Correlation tracking
fields @timestamp, level, message, method, url
| filter correlationId = "abc123de-f456-789g"
| sort @timestamp asc
```

### 4. Splunk

#### Splunk Configuration
Create `inputs.conf`:

```ini
[monitor:///path/to/tondino-backend/logs/*.log]
disabled = false
index = tondino_backend
sourcetype = tondino:backend:json
```

Create `props.conf`:
```ini
[tondino:backend:json]
SHOULD_LINEMERGE = false
KV_MODE = json
TIME_PREFIX = timestamp
TIME_FORMAT = %Y-%m-%dT%H:%M:%S
MAX_TIMESTAMP_LOOKAHEAD = 25
```

#### Splunk Searches
```spl
# Error dashboard
index=tondino_backend level=error | stats count by method, url | sort -count

# Performance monitoring
index=tondino_backend | where responseTime > 1000 | timechart avg(responseTime) by method

# Correlation tracing
index=tondino_backend correlationId="abc123de-f456-789g" | sort _time
```

## Docker Compose for Local Development

```yaml
version: '3.8'

services:
  tondino-backend:
    # Your existing service config
    volumes:
      - ./logs:/app/logs
    
  # ELK Stack
  elasticsearch:
    image: elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:7.15.0
    volumes:
      - ./config/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
      - ./logs:/logs:ro
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  # Alternative: Loki Stack
  loki:
    image: grafana/loki:2.6.1
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:2.6.1
    volumes:
      - ./logs:/logs:ro
      - ./config/promtail-config.yml:/etc/promtail/config.yml
    depends_on:
      - loki

  grafana:
    image: grafana/grafana:9.0.0
    ports:
      - "3000:3000"
    volumes:
      - grafana_storage:/var/lib/grafana

volumes:
  elasticsearch_data:
  grafana_storage:
```

## Environment Variables for Log Aggregation

```env
# Logging Configuration
LOG_LEVEL=info
NODE_ENV=production

# Alert Webhooks
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ALERT_EMAIL=alerts@yourdomain.com

# Log Service Endpoints
ELASTICSEARCH_URL=http://localhost:9200
LOKI_URL=http://localhost:3100
SPLUNK_URL=https://your-splunk-instance.com
CLOUDWATCH_REGION=us-east-1
```

## Monitoring Queries and Alerts

### Key Performance Indicators (KPIs)
1. **Request Rate**: requests/minute
2. **Error Rate**: (errors/total requests) * 100
3. **Average Response Time**: milliseconds
4. **P95 Response Time**: 95th percentile response time
5. **Database Query Time**: average query duration
6. **Memory Usage**: heap usage percentage

### Recommended Alerts
1. **High Error Rate**: > 5% in 5 minutes
2. **Slow Response Time**: Average > 2 seconds for 10 minutes
3. **Database Issues**: Connection failures or query timeouts
4. **Memory Usage**: > 80% heap usage for 15 minutes
5. **High Request Volume**: Unusual spike (> 3x normal)

## Production Recommendations

1. **Log Rotation**: Configure log rotation to prevent disk space issues
2. **Retention Policy**: Keep logs for compliance requirements (typically 90-365 days)
3. **Sampling**: For high-traffic applications, consider log sampling
4. **Security**: Ensure sensitive data is not logged (PII, passwords, tokens)
5. **Performance**: Monitor log aggregation system performance impact
6. **Backup**: Backup critical logs to long-term storage
7. **Access Control**: Restrict access to logs containing sensitive information