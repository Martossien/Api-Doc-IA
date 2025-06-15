# API v2 Documentation

**Version:** 2.0.0  
**Date:** 09/06/2025  
**Status:** Production Ready ✅

## Overview

API v2 is a simplified, production-ready interface for Open WebUI that provides document processing capabilities with vision models. It's designed for easy integration, high performance, and robust memory management.

### Key Features

- **Document Processing**: Upload and analyze documents with LLMs
- **Vision Model Support**: Automatic routing to vision-capable models
- **Concurrency Control**: Intelligent task queuing and memory management
- **Background Processing**: Asynchronous task execution with status tracking
- **Authentication**: Seamless integration with Open WebUI's auth system
- **Memory Safety**: Automatic cleanup and resource management

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │ -> │   API v2 Router │ -> │ OpenWebUI Core  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                v
                       ┌─────────────────┐
                       │ Background Tasks│
                       │ & Task Manager  │
                       └─────────────────┘
```

## Quick Start

### 1. Configuration

API v2 is configured via environment variables or the admin interface:

```bash
# Enable API v2
API_V2_ENABLED=true

# File upload limits
API_V2_MAX_FILE_SIZE=52428800  # 50MB

# Concurrency (auto-calculated based on RAM)
API_V2_MAX_CONCURRENT=6

# Processing timeout
API_V2_TIMEOUT=300  # 5 minutes

# Default model
API_V2_ADMIN_MODEL=gpt-4-vision
```

### 2. Authentication

API v2 supports the same authentication methods as Open WebUI:

- **JWT Tokens**: From regular login
- **API Keys**: Generated in user settings (prefix: `sk-`)

```bash
# Using JWT token
Authorization: Bearer <jwt_token>

# Using API key
Authorization: Bearer sk-1234567890abcdef
```

### 3. Basic Usage

#### Process a Document

```bash
curl -X POST "https://your-domain.com/api/v2/process" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "file=@document.pdf" \
  -F "prompt=Analyze this document and provide a summary"
```

**Response:**
```json
{
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "status": "processing",
  "message": "Document processing started",
  "config_applied": {
    "model": "gpt-4-vision",
    "temperature": 0.7,
    "max_tokens": 8000
  },
  "created_at": 1699123456.789
}
```

#### Check Task Status

```bash
curl -H "Authorization: Bearer sk-your-api-key" \
  "https://your-domain.com/api/v2/status/a24790f5-719b-4ba1-aecb-b4e90466699b"
```

**Response:**
```json
{
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "status": "completed",
  "progress": 100.0,
  "result": {
    "content": "This document discusses...",
    "model_used": "gpt-4-vision",
    "file_info": {
      "filename": "document.pdf",
      "size": 1048576,
      "type": "application/pdf"
    }
  },
  "created_at": 1699123456.789,
  "completed_at": 1699123476.234,
  "processing_time": 19.445
}
```

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/process` | Upload and process a document |
| `GET` | `/api/v2/status/{task_id}` | Get task status and results |
| `GET` | `/api/v2/models` | List available models |
| `DELETE` | `/api/v2/tasks/{task_id}` | Cancel a pending task |

### Monitoring Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/health` | Service health check |
| `GET` | `/api/v2/config` | Current configuration |

### File Processing Endpoint

#### `POST /api/v2/process`

Process a document with a prompt.

**Parameters:**
- `file` (required): The document file to process
- `prompt` (required): Text prompt for analysis (5-4000 chars)
- `model` (optional): Override default model
- `temperature` (optional): Model temperature (0.0-2.0)
- `max_tokens` (optional): Maximum response tokens

**Supported File Types:**
- PDF (`.pdf`)
- Word Documents (`.docx`)
- Text files (`.txt`, `.md`)
- Images (`.png`, `.jpg`, `.jpeg`, `.gif`)

**File Size Limit:** 50MB (configurable)

**Response:**
```json
{
  "task_id": "string",
  "status": "processing|queued",
  "message": "string",
  "position": 1,  // if queued
  "estimated_time": 60,  // seconds
  "config_applied": {
    "model": "gpt-4-vision",
    "temperature": 0.7,
    "max_tokens": 8000
  },
  "created_at": 1699123456.789
}
```

### Status Endpoint

#### `GET /api/v2/status/{task_id}`

Get the current status and results of a task.

**Response:**
```json
{
  "task_id": "string",
  "status": "pending|processing|completed|failed|queued",
  "progress": 75.5,  // percentage
  "result": {
    "content": "Analysis result text",
    "model_used": "gpt-4-vision",
    "file_info": {
      "filename": "document.pdf",
      "size": 1048576,
      "type": "application/pdf"
    },
    "processing_metadata": {
      "prompt_length": 45,
      "response_length": 1234,
      "model_config": {
        "temperature": 0.7,
        "max_tokens": 8000
      }
    }
  },
  "error": "string",  // if failed
  "error_type": "processing_error",
  "created_at": 1699123456.789,
  "started_at": 1699123457.123,
  "completed_at": 1699123476.234,
  "processing_time": 19.111,
  "memory_usage": {
    "used_percent": 45.2,
    "available_mb": 8192,
    "total_mb": 16384
  }
}
```

### Models Endpoint

#### `GET /api/v2/models`

Get list of available models for document processing.

**Response:**
```json
{
  "models": [
    {
      "id": "gpt-4-vision",
      "name": "GPT-4 Vision",
      "vision_capable": true,
      "capabilities": ["vision", "text"]
    },
    {
      "id": "claude-3-haiku",
      "name": "Claude 3 Haiku",
      "vision_capable": true,
      "capabilities": ["vision", "text"]
    }
  ],
  "default_model": "gpt-4-vision",
  "vision_models": ["gpt-4-vision", "claude-3-haiku"],
  "model_configs": {
    "gpt-4-vision": {
      "temperature": 0.7,
      "max_tokens": 8000,
      "vision_capable": true
    }
  }
}
```

### Health Check

#### `GET /api/v2/health`

Check the health status of API v2 service.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": 1699123456.789,
  "services": {
    "database": true,
    "storage": true,
    "models": true,
    "api_v2": true
  },
  "memory_usage": {
    "used_percent": 25.3,
    "available_mb": 12288,
    "total_mb": 16384
  },
  "active_tasks": 3,
  "queue_length": 1
}
```

### Configuration

#### `GET /api/v2/config`

Get current API v2 configuration (requires authentication).

**Response:**
```json
{
  "enabled": true,
  "max_file_size": 52428800,
  "max_concurrent": 6,
  "timeout": 300,
  "admin_model": "gpt-4-vision",
  "supported_formats": ["pdf", "docx", "txt", "md", "png", "jpg", "jpeg", "gif"],
  "features": {
    "vision": true,
    "multimodal": true,
    "background_processing": true,
    "queue_management": true,
    "memory_management": true
  }
}
```

## Task Management

### Task States

| State | Description |
|-------|-------------|
| `pending` | Task created, waiting to start |
| `processing` | Currently being processed |
| `completed` | Successfully completed |
| `failed` | Processing failed with error |
| `queued` | Waiting in queue (concurrency limit reached) |

### Queue Management

When the concurrency limit is reached, new tasks are automatically queued:

- **FIFO Processing**: First in, first out
- **Position Tracking**: Get your position in the queue
- **Estimated Time**: Rough processing time estimate
- **Automatic Progression**: Tasks move from queue to processing automatically

### Concurrency Limits

API v2 automatically calculates safe concurrency limits based on available RAM:

| RAM | Max Concurrent | Memory per Task |
|-----|----------------|-----------------|
| 16GB | 3 tasks | ~520MB |
| 32GB | 6 tasks | ~520MB |
| 64GB | 12 tasks | ~520MB |
| 512GB+ | 30 tasks | ~520MB |

## Memory Management

### Automatic Cleanup

- **Task Cleanup**: Old completed/failed tasks removed after 24 hours
- **Memory Monitoring**: Real-time memory usage tracking
- **Garbage Collection**: Forced cleanup after each task
- **Emergency Stops**: Circuit breaker at 95% memory usage

### Memory Safety Features

- **Pre-flight Checks**: Memory validation before processing
- **Progress Monitoring**: Track memory usage during processing
- **Cleanup Verification**: Confirm memory release after completion
- **Safety Thresholds**: Multiple warning levels (85%, 90%, 95%)

## Error Handling

### Error Types

- `validation_error`: Invalid input parameters
- `processing_error`: Error during document processing
- `auth_error`: Authentication/authorization failure
- `rate_limit_error`: Too many requests
- `system_error`: Internal system error
- `timeout_error`: Processing exceeded time limit

### Error Response Format

```json
{
  "detail": "Human readable error message",
  "error_type": "processing_error",
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "timestamp": 1699123456.789,
  "request_id": "req_123456789"
}
```

### Common Error Scenarios

#### File Too Large (413)
```json
{
  "detail": "File too large. Maximum size: 50.0MB",
  "error_type": "validation_error"
}
```

#### Task Not Found (404)
```json
{
  "detail": "Task not found",
  "error_type": "system_error"
}
```

#### API Disabled (503)
```json
{
  "detail": "API v2 is currently disabled",
  "error_type": "system_error"
}
```

## Security

### Authentication

API v2 uses Open WebUI's existing authentication system:

- **JWT Tokens**: Standard session tokens from web login
- **API Keys**: Long-lived keys with `sk-` prefix
- **Permissions**: Same user permissions as Open WebUI
- **Rate Limiting**: Configurable per-user limits

### Authorization

- **User Isolation**: Users can only access their own tasks
- **Admin Features**: System status and configuration
- **Model Access**: Respects Open WebUI model permissions
- **File Access**: Files are user-scoped

### Data Security

- **File Storage**: Uses Open WebUI's configured storage provider
- **Temporary Files**: Automatic cleanup after processing
- **Memory Safety**: No data persisted in memory beyond task completion
- **Audit Trail**: All API calls logged via Open WebUI's audit system

## Performance

### Benchmarks

Based on testing with 50MB PDF files:

- **Upload Time**: < 5 seconds
- **Processing Time**: 30-120 seconds (model dependent)
- **Memory Usage**: ~520MB per concurrent task
- **Queue Response**: < 1 second
- **Status Queries**: < 100ms

### Optimization Tips

1. **File Size**: Smaller files process faster
2. **Concurrent Limit**: Don't exceed recommended limits
3. **Model Selection**: Vision models are slower but more capable
4. **Prompt Length**: Shorter prompts process faster
5. **Memory**: Ensure adequate RAM for concurrent tasks

### Monitoring

Monitor these metrics for optimal performance:

- **Memory Usage**: Keep below 85% total RAM
- **Active Tasks**: Stay within concurrency limits
- **Queue Length**: Should be zero under normal load
- **Error Rate**: Target < 5% error rate
- **Response Times**: Monitor for degradation

## Integration Examples

### Python Client

```python
import requests
import time

class APIv2Client:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    def process_document(self, file_path, prompt, **kwargs):
        """Upload and process a document"""
        with open(file_path, "rb") as f:
            files = {"file": f}
            data = {"prompt": prompt, **kwargs}
            
            response = requests.post(
                f"{self.base_url}/api/v2/process",
                headers=self.headers,
                files=files,
                data=data
            )
            return response.json()
    
    def get_status(self, task_id):
        """Get task status"""
        response = requests.get(
            f"{self.base_url}/api/v2/status/{task_id}",
            headers=self.headers
        )
        return response.json()
    
    def wait_for_completion(self, task_id, timeout=300):
        """Wait for task to complete"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.get_status(task_id)
            
            if status["status"] == "completed":
                return status["result"]
            elif status["status"] == "failed":
                raise Exception(f"Task failed: {status.get('error')}")
            
            time.sleep(2)
        
        raise Exception("Task timed out")

# Usage
client = APIv2Client("https://your-domain.com", "sk-your-api-key")

# Process document
result = client.process_document(
    "document.pdf",
    "Analyze this document and provide a summary",
    temperature=0.7
)

# Wait for completion
if result["status"] == "processing":
    final_result = client.wait_for_completion(result["task_id"])
    print(final_result["content"])
```

### JavaScript/Node.js Client

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class APIv2Client {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.headers = { 'Authorization': `Bearer ${apiKey}` };
    }

    async processDocument(filePath, prompt, options = {}) {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('prompt', prompt);
        
        Object.entries(options).forEach(([key, value]) => {
            form.append(key, value);
        });

        const response = await axios.post(
            `${this.baseUrl}/api/v2/process`,
            form,
            {
                headers: {
                    ...this.headers,
                    ...form.getHeaders()
                }
            }
        );
        
        return response.data;
    }

    async getStatus(taskId) {
        const response = await axios.get(
            `${this.baseUrl}/api/v2/status/${taskId}`,
            { headers: this.headers }
        );
        return response.data;
    }

    async waitForCompletion(taskId, timeout = 300000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const status = await this.getStatus(taskId);
            
            if (status.status === 'completed') {
                return status.result;
            } else if (status.status === 'failed') {
                throw new Error(`Task failed: ${status.error}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        throw new Error('Task timed out');
    }
}

// Usage
const client = new APIv2Client('https://your-domain.com', 'sk-your-api-key');

async function main() {
    try {
        const result = await client.processDocument(
            'document.pdf',
            'Analyze this document and provide a summary',
            { temperature: 0.7 }
        );
        
        if (result.status === 'processing') {
            const finalResult = await client.waitForCompletion(result.task_id);
            console.log(finalResult.content);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
```

## Troubleshooting

### Common Issues

#### 1. Tasks Stuck in Queue
**Symptom**: Tasks remain queued for long periods  
**Cause**: Concurrency limit reached, processing tasks taking too long  
**Solution**: 
- Check active tasks with `/api/v2/health`
- Increase `API_V2_MAX_CONCURRENT` if you have more RAM
- Cancel stuck tasks manually

#### 2. Memory Usage High
**Symptom**: High memory usage, tasks failing  
**Cause**: Insufficient cleanup, too many concurrent tasks  
**Solution**:
- Reduce `API_V2_MAX_CONCURRENT`
- Check for memory leaks in processing
- Restart service to clear memory

#### 3. Slow Processing
**Symptom**: Tasks take much longer than expected  
**Cause**: Model overload, large files, complex prompts  
**Solution**:
- Use simpler prompts
- Reduce file sizes
- Check model availability

#### 4. Authentication Errors
**Symptom**: 401/403 errors despite valid credentials  
**Cause**: API key restrictions, expired tokens  
**Solution**:
- Check API key is valid and has correct permissions
- Verify endpoint is in `API_KEY_ALLOWED_ENDPOINTS`
- Generate new API key if needed

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Environment variable
OPEN_WEBUI_LOG_LEVEL=DEBUG

# Or in config
SRC_LOG_LEVELS={"API_V2": "DEBUG"}
```

### Support Resources

- **GitHub Issues**: [open-webui/open-webui](https://github.com/open-webui/open-webui)
- **Documentation**: [docs.openwebui.com](https://docs.openwebui.com)
- **Community**: Discord/Forums

---

**Need help?** Check the [Admin Guide](API_V2_ADMIN_GUIDE.md) for configuration details or the [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues.