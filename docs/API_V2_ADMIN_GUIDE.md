# API v2 Administrator Guide

**Version:** 2.0.0  
**Target Audience:** System Administrators, DevOps Engineers  
**Date:** 09/06/2025

## Overview

This guide covers the administration, configuration, monitoring, and maintenance of Open WebUI's API v2 system. It's designed for system administrators who need to deploy, configure, and maintain API v2 in production environments.

## Installation & Deployment

### Prerequisites

- Open WebUI v0.6.5 or later
- Python 3.8+ with asyncio support
- Minimum 16GB RAM (32GB+ recommended for production)
- Storage system configured (local, S3, GCS, or Azure)
- Vision-capable LLM models available

### Installation Steps

#### 1. Verify Open WebUI Installation

```bash
# Check Open WebUI version
curl -s http://localhost:3000/api/version

# Verify API v2 is available
curl -s http://localhost:3000/api/v2/health
```

#### 2. Enable API v2

Add to your environment configuration:

```bash
# .env file or environment variables
API_V2_ENABLED=true
API_V2_MAX_FILE_SIZE=52428800  # 50MB
API_V2_MAX_CONCURRENT=6        # Auto-calculated if not set
API_V2_TIMEOUT=300             # 5 minutes
API_V2_ADMIN_MODEL=gpt-4-vision
```

#### 3. Configure Reverse Proxy

See [deployment configurations](#reverse-proxy-configuration) below.

#### 4. Restart Services

```bash
# Docker deployment
docker-compose restart

# Manual deployment
systemctl restart open-webui
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_V2_ENABLED` | `true` | Enable/disable API v2 |
| `API_V2_MAX_FILE_SIZE` | `52428800` | Max file size in bytes (50MB) |
| `API_V2_MAX_CONCURRENT` | Auto-calculated | Max concurrent processing tasks |
| `API_V2_TIMEOUT` | `300` | Processing timeout in seconds |
| `API_V2_ADMIN_MODEL` | `gpt-4-vision` | Default model for processing |

### Advanced Configuration

The `API_V2_ADMIN_CONFIG` contains detailed settings:

```json
{
  "temperature": 0.7,
  "max_tokens": 8000,
  "enable_vision": true,
  "enable_multimodal": true,
  "default_prompt_template": "Analyze the provided document and answer: {prompt}",
  "supported_formats": ["pdf", "docx", "txt", "md", "png", "jpg", "jpeg", "gif"],
  "memory_management": {
    "cleanup_after_processing": true,
    "monitor_usage": true,
    "emergency_stop_threshold": 95
  }
}
```

### Runtime Configuration Changes

Configuration can be updated via the admin interface:

```bash
# Update max concurrent tasks
curl -X POST http://localhost:3000/admin/config \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"api_v2": {"max_concurrent": 8}}'

# Disable API v2 temporarily
curl -X POST http://localhost:3000/admin/config \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"api_v2": {"enabled": false}}'
```

## Memory Management

### Automatic Calculation

API v2 automatically calculates safe concurrency limits:

```python
def calculate_max_concurrent(ram_gb):
    memory_per_file = 520  # MB per file processing
    available_ram = ram_gb * 1024 * 0.7  # 70% RAM available
    max_concurrent = max(1, int(available_ram / memory_per_file))
    
    # Apply safety limits
    if ram_gb >= 512:
        return min(max_concurrent, 30)
    elif ram_gb >= 32:
        return min(max_concurrent, 6)
    elif ram_gb >= 16:
        return min(max_concurrent, 3)
    else:
        return 1
```

### Memory Recommendations

| Server RAM | Recommended Max Concurrent | Expected Peak Usage |
|------------|---------------------------|-------------------|
| 16GB | 3 tasks | ~1.6GB (10%) |
| 32GB | 6 tasks | ~3.1GB (10%) |
| 64GB | 12 tasks | ~6.2GB (10%) |
| 128GB | 24 tasks | ~12.5GB (10%) |
| 256GB+ | 30 tasks | ~15.6GB (6%) |

### Memory Monitoring

Monitor these metrics:

```bash
# Check current memory usage
curl -s http://localhost:3000/api/v2/health | jq '.memory_usage'

# Monitor system memory
free -h
htop

# Check API v2 specific usage
curl -s http://localhost:3000/api/v2/config
```

## Model Management

### Supported Models

API v2 works with any Open WebUI compatible model, but vision models are recommended:

- **OpenAI**: gpt-4-vision-preview, gpt-4-turbo, gpt-4o
- **Anthropic**: claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Open Source**: LLaVA, InstructBLIP, Flamingo
- **Google**: Gemini Pro Vision

### Model Configuration

#### 1. Add Models via Open WebUI Admin

```bash
# List current models
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/v1/models

# Add new model (via admin interface)
curl -X POST http://localhost:3000/admin/models \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "gpt-4-vision-preview",
    "name": "GPT-4 Vision Preview",
    "meta": {
      "vision": true,
      "max_tokens": 4096
    }
  }'
```

#### 2. Set Default Model

```bash
# Update default model for API v2
curl -X POST http://localhost:3000/admin/config \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"api_v2": {"admin_model": "claude-3-haiku"}}'
```

#### 3. Model-Specific Settings

Configure per-model settings in the admin config:

```json
{
  "model_configs": {
    "gpt-4-vision": {
      "temperature": 0.7,
      "max_tokens": 8000,
      "timeout": 300
    },
    "claude-3-haiku": {
      "temperature": 0.5,
      "max_tokens": 4096,
      "timeout": 180
    }
  }
}
```

## Security Configuration

### API Key Management

#### 1. Enable API Key Access

```bash
# Ensure API keys are enabled for v2 endpoints
ENABLE_API_KEY=true
API_KEY_ALLOWED_ENDPOINTS="/api/v2/process,/api/v2/status,/api/v2/models,/api/v2/health,/api/v2/config"
```

#### 2. Rate Limiting

Configure rate limiting per user:

```json
{
  "rate_limits": {
    "per_minute": 50,
    "per_hour": 1000,
    "per_day": 10000
  }
}
```

#### 3. File Type Restrictions

Restrict allowed file types:

```json
{
  "supported_formats": ["pdf", "docx", "txt", "md"],
  "blocked_extensions": [".exe", ".sh", ".bat", ".ps1"],
  "max_file_size_mb": 50
}
```

### Network Security

#### 1. Firewall Configuration

```bash
# Allow HTTPS only
ufw allow 443/tcp
ufw deny 80/tcp

# Restrict API access to specific IPs (optional)
ufw allow from 192.168.1.0/24 to any port 443
```

#### 2. SSL/TLS Configuration

Use strong SSL settings in your reverse proxy:

```nginx
# Nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```

## Monitoring & Alerting

### Health Checks

#### 1. Basic Health Check

```bash
#!/bin/bash
# health_check.sh

HEALTH_URL="http://localhost:3000/api/v2/health"
RESPONSE=$(curl -s -w "%{http_code}" $HEALTH_URL)
HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API v2 is healthy"
    exit 0
else
    echo "❌ API v2 health check failed (HTTP $HTTP_CODE)"
    exit 1
fi
```

#### 2. Comprehensive Monitoring

```bash
#!/bin/bash
# comprehensive_check.sh

API_URL="http://localhost:3000/api/v2"

# Check health
HEALTH=$(curl -s "$API_URL/health")
STATUS=$(echo $HEALTH | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
    echo "⚠️ API v2 status: $STATUS"
fi

# Check memory usage
MEMORY_PERCENT=$(echo $HEALTH | jq -r '.memory_usage.used_percent')
if (( $(echo "$MEMORY_PERCENT > 85" | bc -l) )); then
    echo "🚨 High memory usage: ${MEMORY_PERCENT}%"
fi

# Check active tasks
ACTIVE_TASKS=$(echo $HEALTH | jq -r '.active_tasks')
QUEUE_LENGTH=$(echo $HEALTH | jq -r '.queue_length')

echo "📊 Active tasks: $ACTIVE_TASKS, Queue: $QUEUE_LENGTH"

# Check if models are available
MODELS=$(curl -s "$API_URL/models" | jq -r '.models | length')
echo "🤖 Available models: $MODELS"
```

### Metrics Collection

#### 1. Prometheus Metrics

If using Prometheus, expose these metrics:

```yaml
# prometheus.yml
- job_name: 'openwebui-api-v2'
  static_configs:
    - targets: ['localhost:3000']
  metrics_path: '/metrics'
  params:
    module: ['api_v2']
```

Key metrics to monitor:
- `api_v2_active_tasks_total`
- `api_v2_queue_length`
- `api_v2_memory_usage_percent`
- `api_v2_processing_time_seconds`
- `api_v2_error_rate`

#### 2. Log Monitoring

Monitor these log patterns:

```bash
# Error patterns to watch
tail -f /var/log/openwebui/api_v2.log | grep -E "(ERROR|CRITICAL|Failed)"

# Performance patterns
tail -f /var/log/openwebui/api_v2.log | grep -E "(slow|timeout|memory)"

# Success patterns
tail -f /var/log/openwebui/api_v2.log | grep -E "(completed|success)"
```

### Alerting Rules

#### 1. Memory Alerts

```yaml
# AlertManager rules
groups:
- name: api_v2
  rules:
  - alert: HighMemoryUsage
    expr: api_v2_memory_usage_percent > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API v2 high memory usage"
      description: "Memory usage is {{ $value }}%"

  - alert: CriticalMemoryUsage
    expr: api_v2_memory_usage_percent > 95
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "API v2 critical memory usage"
      description: "Memory usage is {{ $value }}%, service may crash"
```

#### 2. Queue Alerts

```yaml
  - alert: LongQueue
    expr: api_v2_queue_length > 10
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "API v2 queue is growing"
      description: "Queue length is {{ $value }} tasks"

  - alert: StuckTasks
    expr: api_v2_active_tasks_total > 0 and rate(api_v2_completed_tasks_total[10m]) == 0
    for: 15m
    labels:
      severity: critical
    annotations:
      summary: "API v2 tasks appear stuck"
      description: "No tasks completed in 10 minutes"
```

## Reverse Proxy Configuration

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/openwebui-api-v2
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # API v2 specific configuration
    location /api/v2/ {
        # Rate limiting for API v2
        limit_req zone=api_v2 burst=10 nodelay;
        
        # Increase timeouts for processing
        proxy_connect_timeout 30s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Large file support
        client_max_body_size 100M;
        client_body_timeout 300s;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Backend
        proxy_pass http://localhost:3000;
    }
    
    # File upload specific configuration
    location ~ ^/api/v2/(process|upload) {
        limit_req zone=uploads burst=5 nodelay;
        
        # Extended timeouts for uploads
        client_max_body_size 100M;
        client_body_timeout 600s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        
        # Disable buffering for large uploads
        proxy_request_buffering off;
        proxy_buffering off;
        
        proxy_pass http://localhost:3000;
    }
}

# Rate limiting zones
http {
    limit_req_zone $binary_remote_addr zone=api_v2:10m rate=50r/m;
    limit_req_zone $binary_remote_addr zone=uploads:10m rate=10r/m;
}
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/openwebui-api-v2.conf
<VirtualHost *:443>
    ServerName api.yourdomain.com
    
    # SSL configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
    
    # API v2 configuration
    <LocationMatch "^/api/v2/">
        ProxyPass http://localhost:3000/
        ProxyPassReverse http://localhost:3000/
        
        # Timeouts for API v2
        ProxyTimeout 300
        
        # Large file support
        LimitRequestBody 104857600  # 100MB
    </LocationMatch>
    
    # Upload specific configuration
    <LocationMatch "^/api/v2/(process|upload)">
        ProxyTimeout 600
        LimitRequestBody 104857600
    </LocationMatch>
</VirtualHost>
```

## Backup & Recovery

### Data Backup

#### 1. Configuration Backup

```bash
#!/bin/bash
# backup_config.sh

BACKUP_DIR="/backup/openwebui/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup configuration
cp /path/to/.env "$BACKUP_DIR/env.backup"

# Backup database
sqlite3 /path/to/webui.db ".backup '$BACKUP_DIR/webui.db.backup'"

# Backup API v2 specific config
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/v1/configs > "$BACKUP_DIR/api_config.json"

echo "✅ Backup completed: $BACKUP_DIR"
```

#### 2. File Storage Backup

```bash
#!/bin/bash
# backup_files.sh

# For local storage
rsync -av /path/to/storage/ /backup/storage/

# For S3 storage (already backed up)
aws s3 sync s3://your-bucket s3://your-backup-bucket

# For Google Cloud Storage
gsutil -m rsync -r gs://your-bucket gs://your-backup-bucket
```

### Disaster Recovery

#### 1. Service Recovery

```bash
#!/bin/bash
# recover_service.sh

# Stop services
docker-compose down

# Restore configuration
cp /backup/env.backup /path/to/.env

# Restore database
sqlite3 /path/to/webui.db ".restore '/backup/webui.db.backup'"

# Restore file storage
rsync -av /backup/storage/ /path/to/storage/

# Start services
docker-compose up -d

# Verify API v2
curl -s http://localhost:3000/api/v2/health
```

#### 2. Data Migration

```bash
#!/bin/bash
# migrate_to_new_server.sh

NEW_SERVER="new-server.com"

# Copy configuration
scp /path/to/.env $NEW_SERVER:/path/to/.env

# Copy database
scp /path/to/webui.db $NEW_SERVER:/path/to/webui.db

# Copy storage (if local)
rsync -av /path/to/storage/ $NEW_SERVER:/path/to/storage/

# Update DNS
# Update load balancer
# Verify functionality
```

## Performance Tuning

### System Optimization

#### 1. Memory Settings

```bash
# /etc/sysctl.conf
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.dirty_ratio=5
vm.dirty_background_ratio=5

# Apply settings
sysctl -p
```

#### 2. File Descriptor Limits

```bash
# /etc/security/limits.conf
openwebui soft nofile 65536
openwebui hard nofile 65536

# For systemd services
# /etc/systemd/system/openwebui.service
[Service]
LimitNOFILE=65536
```

#### 3. Database Optimization

```sql
-- SQLite optimization
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000;
PRAGMA temp_store = memory;
```

### Application Tuning

#### 1. Concurrency Optimization

```python
# Custom concurrency calculation
def calculate_optimal_concurrent():
    import psutil
    
    # Get available resources
    ram_gb = psutil.virtual_memory().total / (1024**3)
    cpu_cores = psutil.cpu_count()
    
    # Calculate based on bottleneck
    memory_limit = (ram_gb * 0.7 * 1024) // 520  # 520MB per task
    cpu_limit = cpu_cores * 2  # 2 tasks per core
    
    return min(memory_limit, cpu_limit, 30)  # Cap at 30
```

#### 2. Caching Configuration

```python
# Enable caching for model responses
ENABLE_MODEL_CACHE = True
MODEL_CACHE_TTL = 3600  # 1 hour

# Enable file processing cache
ENABLE_PROCESSING_CACHE = True
PROCESSING_CACHE_TTL = 7200  # 2 hours
```

## Troubleshooting

### Common Issues

#### 1. High Memory Usage

**Symptoms:**
- Tasks failing with memory errors
- System becoming unresponsive
- High swap usage

**Diagnosis:**
```bash
# Check memory usage
free -h
htop

# Check API v2 specific usage
curl -s http://localhost:3000/api/v2/health | jq '.memory_usage'

# Check for memory leaks
ps aux | grep -i webui
```

**Solutions:**
```bash
# Reduce concurrency
API_V2_MAX_CONCURRENT=3

# Enable aggressive cleanup
API_V2_ADMIN_CONFIG='{"memory_management": {"cleanup_after_processing": true, "monitor_usage": true}}'

# Restart service to clear memory
systemctl restart openwebui
```

#### 2. Tasks Stuck in Queue

**Symptoms:**
- Tasks remain queued for hours
- No processing progress
- Queue length constantly growing

**Diagnosis:**
```bash
# Check queue status
curl -s http://localhost:3000/api/v2/health | jq '.queue_length'

# Check active tasks
curl -s http://localhost:3000/api/v2/health | jq '.active_tasks'

# Check task details
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v2/status/<task_id>
```

**Solutions:**
```bash
# Cancel stuck tasks
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v2/tasks/<task_id>

# Increase concurrency if resources allow
API_V2_MAX_CONCURRENT=8

# Check model availability
curl -s http://localhost:3000/api/v2/models
```

#### 3. Model Errors

**Symptoms:**
- Tasks failing with model errors
- "Model not available" messages
- Slow processing times

**Diagnosis:**
```bash
# Check available models
curl -s http://localhost:3000/api/v2/models | jq '.models[].id'

# Check model configuration
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:3000/api/v1/models

# Check model health
curl -s http://localhost:3000/ollama/api/tags  # For Ollama models
```

**Solutions:**
```bash
# Update default model
API_V2_ADMIN_MODEL=claude-3-haiku

# Restart model service
docker-compose restart ollama  # If using Ollama

# Check model permissions
# Ensure user has access to the model
```

### Debug Mode

Enable detailed logging:

```bash
# Environment variables
DEBUG=true
OPEN_WEBUI_LOG_LEVEL=DEBUG
SRC_LOG_LEVELS='{"API_V2": "DEBUG"}'

# Check logs
tail -f /var/log/openwebui/api_v2.log
journalctl -u openwebui -f
```

### Support Escalation

When to escalate issues:

1. **Memory leaks**: Memory usage continuously increases
2. **Data corruption**: Database or file system errors
3. **Security issues**: Unauthorized access or vulnerabilities
4. **Performance degradation**: Consistent 10x+ slower than baseline

Contact information:
- **GitHub Issues**: Report bugs and feature requests
- **Community Support**: Discord/forums for community help
- **Commercial Support**: Contact Open WebUI team for enterprise support

---

**Next Steps:**
- Review the [API Documentation](API_V2_DOCUMENTATION.md) for developer integration
- Check the [Endpoints Reference](API_V2_ENDPOINTS.md) for complete API details
- See [Troubleshooting Guide](TROUBLESHOOTING.md) for specific error scenarios