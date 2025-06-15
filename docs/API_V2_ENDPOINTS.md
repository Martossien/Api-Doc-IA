# API v2 Endpoints Reference

**Version:** 2.0.0  
**Base URL:** `https://your-domain.com/api/v2`  
**Date:** 09/06/2025

## Authentication

All endpoints except `/health` require authentication using one of these methods:

```http
Authorization: Bearer <jwt_token>
Authorization: Bearer sk-<api_key>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "data": { /* response data */ },
  "status": "success",
  "timestamp": 1699123456.789
}
```

### Error Response
```json
{
  "detail": "Error message",
  "error_type": "error_category",
  "timestamp": 1699123456.789,
  "request_id": "req_123456789"
}
```

## Endpoints

### 1. Process Document

Upload and process a document with AI analysis.

#### Request

```http
POST /api/v2/process
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Document to process |
| `prompt` | String | Yes | Analysis prompt (5-4000 chars) |
| `model` | String | No | Override default model |
| `temperature` | Float | No | Model temperature (0.0-2.0) |
| `max_tokens` | Integer | No | Max response tokens (1-32000) |
| `stream` | Boolean | No | Stream response (not implemented) |

**File Constraints:**
- **Max Size:** 50MB (configurable)
- **Supported Types:** PDF, DOCX, TXT, MD, PNG, JPG, JPEG, GIF
- **Encoding:** Binary upload via multipart/form-data

#### Response

**Status: 200 OK**

```json
{
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "status": "processing",
  "message": "Document processing started",
  "position": null,
  "estimated_time": null,
  "config_applied": {
    "model": "gpt-4-vision",
    "temperature": 0.7,
    "max_tokens": 8000
  },
  "created_at": 1699123456.789
}
```

**Status: 200 OK (Queued)**

```json
{
  "task_id": "b35891g6-829c-5bc2-befb-c5f91577788c",
  "status": "queued",
  "message": "Task queued for processing",
  "position": 3,
  "estimated_time": 180,
  "config_applied": {
    "model": "gpt-4-vision",
    "temperature": 0.7,
    "max_tokens": 8000
  },
  "created_at": 1699123456.789
}
```

#### Error Responses

**Status: 413 Request Entity Too Large**
```json
{
  "detail": "File too large. Maximum size: 50.0MB",
  "error_type": "validation_error"
}
```

**Status: 422 Unprocessable Entity**
```json
{
  "detail": "Validation error: prompt must be between 5 and 4000 characters",
  "error_type": "validation_error"
}
```

**Status: 503 Service Unavailable**
```json
{
  "detail": "API v2 is currently disabled",
  "error_type": "system_error"
}
```

#### Example Usage

**cURL:**
```bash
curl -X POST "https://api.example.com/api/v2/process" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "file=@document.pdf" \
  -F "prompt=Summarize the key points in this document" \
  -F "temperature=0.7" \
  -F "max_tokens=4000"
```

**Python:**
```python
import requests

files = {'file': open('document.pdf', 'rb')}
data = {
    'prompt': 'Summarize the key points in this document',
    'temperature': 0.7,
    'max_tokens': 4000
}
headers = {'Authorization': 'Bearer sk-your-api-key'}

response = requests.post(
    'https://api.example.com/api/v2/process',
    files=files,
    data=data,
    headers=headers
)
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('prompt', 'Summarize the key points in this document');
formData.append('temperature', '0.7');

fetch('https://api.example.com/api/v2/process', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: formData
});
```

---

### 2. Get Task Status

Retrieve the current status and results of a processing task.

#### Request

```http
GET /api/v2/status/{task_id}
Authorization: Bearer <token>
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | String | Yes | Unique task identifier |

#### Response

**Status: 200 OK (Processing)**

```json
{
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "status": "processing",
  "progress": 45.5,
  "result": null,
  "error": null,
  "error_type": null,
  "created_at": 1699123456.789,
  "started_at": 1699123457.123,
  "completed_at": null,
  "processing_time": null,
  "model_used": "gpt-4-vision",
  "file_info": {
    "filename": "document.pdf",
    "size": 1048576,
    "type": "application/pdf"
  },
  "memory_usage": null
}
```

**Status: 200 OK (Completed)**

```json
{
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "status": "completed",
  "progress": 100.0,
  "result": {
    "content": "## Document Summary\n\nThis document discusses the implementation of...",
    "model_used": "gpt-4-vision",
    "file_info": {
      "filename": "document.pdf",
      "size": 1048576,
      "type": "application/pdf"
    },
    "processing_metadata": {
      "prompt_length": 45,
      "response_length": 1247,
      "model_config": {
        "temperature": 0.7,
        "max_tokens": 8000
      }
    }
  },
  "error": null,
  "error_type": null,
  "created_at": 1699123456.789,
  "started_at": 1699123457.123,
  "completed_at": 1699123476.234,
  "processing_time": 19.111,
  "model_used": "gpt-4-vision",
  "file_info": {
    "filename": "document.pdf",
    "size": 1048576,
    "type": "application/pdf"
  },
  "memory_usage": {
    "used_percent": 67.3,
    "available_mb": 5324,
    "total_mb": 16384
  }
}
```

**Status: 200 OK (Failed)**

```json
{
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "status": "failed",
  "progress": 25.0,
  "result": null,
  "error": "Model 'gpt-4-vision' is not available or accessible",
  "error_type": "processing_error",
  "created_at": 1699123456.789,
  "started_at": 1699123457.123,
  "completed_at": null,
  "processing_time": null,
  "model_used": "gpt-4-vision",
  "file_info": {
    "filename": "document.pdf",
    "size": 1048576,
    "type": "application/pdf"
  },
  "memory_usage": {
    "used_percent": 45.2,
    "available_mb": 8956,
    "total_mb": 16384
  }
}
```

#### Error Responses

**Status: 404 Not Found**
```json
{
  "detail": "Task not found",
  "error_type": "system_error"
}
```

**Status: 403 Forbidden**
```json
{
  "detail": "Access denied to this task",
  "error_type": "auth_error"
}
```

#### Task Status Values

| Status | Description |
|--------|-------------|
| `pending` | Task created, waiting to start |
| `processing` | Currently being processed |
| `completed` | Successfully completed |
| `failed` | Processing failed with error |
| `queued` | Waiting in queue (concurrency limit reached) |

#### Example Usage

**cURL:**
```bash
curl -H "Authorization: Bearer sk-your-api-key" \
  "https://api.example.com/api/v2/status/a24790f5-719b-4ba1-aecb-b4e90466699b"
```

**Python:**
```python
import requests

headers = {'Authorization': 'Bearer sk-your-api-key'}
task_id = 'a24790f5-719b-4ba1-aecb-b4e90466699b'

response = requests.get(
    f'https://api.example.com/api/v2/status/{task_id}',
    headers=headers
)

status_data = response.json()
print(f"Status: {status_data['status']}")
if status_data['status'] == 'completed':
    print(f"Result: {status_data['result']['content']}")
```

---

### 3. List Available Models

Get information about available models for document processing.

#### Request

```http
GET /api/v2/models
Authorization: Bearer <token>
```

#### Response

**Status: 200 OK**

```json
{
  "models": [
    {
      "id": "gpt-4-vision",
      "name": "GPT-4 Vision",
      "meta": {
        "description": "OpenAI's GPT-4 with vision capabilities",
        "max_tokens": 8000,
        "context_length": 128000
      },
      "capabilities": ["vision", "text"],
      "vision_capable": true
    },
    {
      "id": "claude-3-haiku",
      "name": "Claude 3 Haiku",
      "meta": {
        "description": "Anthropic's fastest vision model",
        "max_tokens": 4096,
        "context_length": 200000
      },
      "capabilities": ["vision", "text"],
      "vision_capable": true
    },
    {
      "id": "llama-2-7b",
      "name": "Llama 2 7B",
      "meta": {
        "description": "Meta's Llama 2 model",
        "max_tokens": 4096,
        "context_length": 4096
      },
      "capabilities": ["text"],
      "vision_capable": false
    }
  ],
  "default_model": "gpt-4-vision",
  "vision_models": ["gpt-4-vision", "claude-3-haiku"],
  "model_configs": {
    "gpt-4-vision": {
      "temperature": 0.7,
      "max_tokens": 8000,
      "vision_capable": true,
      "capabilities": ["vision", "text"]
    },
    "claude-3-haiku": {
      "temperature": 0.5,
      "max_tokens": 4096,
      "vision_capable": true,
      "capabilities": ["vision", "text"]
    },
    "llama-2-7b": {
      "temperature": 0.7,
      "max_tokens": 4096,
      "vision_capable": false,
      "capabilities": ["text"]
    }
  }
}
```

#### Example Usage

**cURL:**
```bash
curl -H "Authorization: Bearer sk-your-api-key" \
  "https://api.example.com/api/v2/models"
```

**Python:**
```python
import requests

headers = {'Authorization': 'Bearer sk-your-api-key'}
response = requests.get(
    'https://api.example.com/api/v2/models',
    headers=headers
)

models_data = response.json()
print(f"Default model: {models_data['default_model']}")
print(f"Vision models: {models_data['vision_models']}")
```

---

### 4. Cancel Task

Cancel a pending or processing task.

#### Request

```http
DELETE /api/v2/tasks/{task_id}
Authorization: Bearer <token>
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | String | Yes | Unique task identifier |

#### Response

**Status: 200 OK**

```json
{
  "message": "Task cancelled successfully",
  "task_id": "a24790f5-719b-4ba1-aecb-b4e90466699b",
  "timestamp": 1699123456.789
}
```

#### Error Responses

**Status: 404 Not Found**
```json
{
  "detail": "Task not found",
  "error_type": "system_error"
}
```

**Status: 403 Forbidden**
```json
{
  "detail": "Access denied to this task",
  "error_type": "auth_error"
}
```

**Status: 400 Bad Request**
```json
{
  "detail": "Cannot cancel completed or failed task",
  "error_type": "validation_error"
}
```

#### Example Usage

**cURL:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.example.com/api/v2/tasks/a24790f5-719b-4ba1-aecb-b4e90466699b"
```

---

### 5. Health Check

Check the health and status of the API v2 service.

#### Request

```http
GET /api/v2/health
```

**Note:** This endpoint does not require authentication.

#### Response

**Status: 200 OK (Healthy)**

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
    "used_percent": 34.7,
    "available_mb": 10547,
    "total_mb": 16384
  },
  "active_tasks": 2,
  "queue_length": 0
}
```

**Status: 200 OK (Degraded)**

```json
{
  "status": "degraded",
  "version": "2.0.0",
  "timestamp": 1699123456.789,
  "services": {
    "database": true,
    "storage": true,
    "models": false,
    "api_v2": true
  },
  "memory_usage": {
    "used_percent": 89.2,
    "available_mb": 1773,
    "total_mb": 16384
  },
  "active_tasks": 5,
  "queue_length": 8
}
```

**Status: 503 Service Unavailable**

```json
{
  "status": "unhealthy",
  "version": "2.0.0",
  "timestamp": 1699123456.789,
  "services": {
    "api_v2": false
  },
  "active_tasks": 0,
  "queue_length": 0
}
```

#### Health Status Values

| Status | Description |
|--------|-------------|
| `healthy` | All services operational |
| `degraded` | Some services have issues but API is functional |
| `unhealthy` | Critical services down, API may not function |

#### Example Usage

**cURL:**
```bash
curl "https://api.example.com/api/v2/health"
```

**Python for Monitoring:**
```python
import requests
import time

def check_health():
    try:
        response = requests.get('https://api.example.com/api/v2/health', timeout=5)
        data = response.json()
        
        if data['status'] == 'healthy':
            print("✅ API is healthy")
        elif data['status'] == 'degraded':
            print("⚠️ API is degraded")
            print(f"Memory usage: {data['memory_usage']['used_percent']:.1f}%")
        else:
            print("❌ API is unhealthy")
            
        return data['status'] == 'healthy'
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

# Monitor every 30 seconds
while True:
    check_health()
    time.sleep(30)
```

---

### 6. Get Configuration

Get current API v2 configuration and limits.

#### Request

```http
GET /api/v2/config
Authorization: Bearer <token>
```

#### Response

**Status: 200 OK**

```json
{
  "enabled": true,
  "max_file_size": 52428800,
  "max_concurrent": 6,
  "timeout": 300,
  "admin_model": "gpt-4-vision",
  "supported_formats": [
    "pdf",
    "docx", 
    "txt",
    "md",
    "png",
    "jpg",
    "jpeg",
    "gif"
  ],
  "features": {
    "vision": true,
    "multimodal": true,
    "background_processing": true,
    "queue_management": true,
    "memory_management": true
  }
}
```

#### Example Usage

**cURL:**
```bash
curl -H "Authorization: Bearer sk-your-api-key" \
  "https://api.example.com/api/v2/config"
```

---

## HTTP Status Codes

### Success Codes

| Code | Description |
|------|-------------|
| `200` | Request successful |
| `201` | Resource created successfully |

### Client Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing authentication |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Resource doesn't exist |
| `413` | Request Entity Too Large - File too big |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limit exceeded |

### Server Error Codes

| Code | Description |
|------|-------------|
| `500` | Internal Server Error - Unexpected server error |
| `502` | Bad Gateway - Upstream service error |
| `503` | Service Unavailable - Service temporarily down |
| `504` | Gateway Timeout - Request timed out |

## Error Types

### Validation Errors
- `validation_error`: Input parameter validation failed
- Example: Invalid file type, prompt too long, invalid temperature

### Processing Errors
- `processing_error`: Error during document processing
- Example: Model unavailable, file corruption, processing timeout

### Authentication Errors
- `auth_error`: Authentication or authorization failed
- Example: Invalid API key, insufficient permissions

### System Errors
- `system_error`: Internal system error
- Example: Database connection failed, service unavailable

### Rate Limit Errors
- `rate_limit_error`: Too many requests
- Example: Exceeded per-minute request limit

### Timeout Errors
- `timeout_error`: Request processing timed out
- Example: Document processing exceeded timeout limit

## Rate Limiting

API v2 implements rate limiting to ensure fair usage:

### Default Limits
- **Per minute:** 50 requests
- **Per hour:** 1000 requests
- **Per day:** 10,000 requests
- **Concurrent uploads:** 10 per minute

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1699123516
X-RateLimit-Window: 60
```

### Rate Limit Response

When rate limit is exceeded:

**Status: 429 Too Many Requests**
```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds.",
  "error_type": "rate_limit_error",
  "retry_after": 60
}
```

## Webhooks (Future)

*Note: Webhook functionality is planned for future releases.*

API v2 will support webhooks for real-time notifications:

- Task completion notifications
- Error notifications  
- Queue status updates

## SDK Examples

### Python SDK (Future)

```python
from openwebui_api_v2 import Client

client = Client(
    base_url="https://api.example.com",
    api_key="sk-your-api-key"
)

# Process document
task = client.process_document(
    file_path="document.pdf",
    prompt="Summarize this document"
)

# Wait for completion
result = task.wait_for_completion()
print(result.content)
```

### JavaScript SDK (Future)

```javascript
import { OpenWebUIClient } from 'openwebui-api-v2';

const client = new OpenWebUIClient({
    baseUrl: 'https://api.example.com',
    apiKey: 'sk-your-api-key'
});

// Process document
const task = await client.processDocument({
    file: fileInput.files[0],
    prompt: 'Summarize this document'
});

// Wait for completion
const result = await task.waitForCompletion();
console.log(result.content);
```

## Testing

### Test Endpoints

Use these examples to test API functionality:

```bash
# 1. Health check
curl "https://api.example.com/api/v2/health"

# 2. List models
curl -H "Authorization: Bearer sk-test-key" \
  "https://api.example.com/api/v2/models"

# 3. Process small text file
echo "This is a test document." > test.txt
curl -X POST "https://api.example.com/api/v2/process" \
  -H "Authorization: Bearer sk-test-key" \
  -F "file=@test.txt" \
  -F "prompt=What is this document about?"

# 4. Check task status
curl -H "Authorization: Bearer sk-test-key" \
  "https://api.example.com/api/v2/status/<task_id>"
```

---

**Related Documentation:**
- [API v2 Main Documentation](API_V2_DOCUMENTATION.md)
- [Administrator Guide](API_V2_ADMIN_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)