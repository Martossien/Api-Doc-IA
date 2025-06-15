# API Documentation - Api-Doc-IA

> Complete reference for the Api-Doc-IA v2 REST API

## 📋 Overview

The Api-Doc-IA v2 API provides powerful document processing capabilities with intelligent content extraction, multi-format support, and seamless integration with Open WebUI's native infrastructure.

**Base URL:** `http://localhost:8080/api/v2`

**Authentication:** Bearer tokens (API keys with `sk-` prefix)

**Content Type:** `multipart/form-data` for file uploads, `application/json` for responses

## 🔐 Authentication

### API Key Generation

Generate API keys via the admin interface or programmatically:

#### Via Admin Interface
1. Login as admin
2. Navigate to **Admin → Settings → API v2**
3. Click **Generate API Key**
4. Copy the generated key (starts with `sk-`)

#### Programmatic Generation

```bash
# First, get JWT token
curl -X POST "http://localhost:8080/api/v1/auths/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localhost","password":"admin"}'

# Then generate API key
curl -X POST "http://localhost:8080/api/v1/auths/api_key" \
  -H "Authorization: Bearer <jwt_token>"
```

### Using API Keys

All API v2 endpoints require authentication via Bearer token:

```bash
Authorization: Bearer sk-your-api-key-here
```

## 📋 Endpoints Reference

### 1. Health Check

**`GET /api/v2/health`**

Check service health and status.

#### Response

```json
{
  \"status\": \"healthy\",
  \"version\": \"2.0.0\",
  \"timestamp\": 1699123456.789,
  \"services\": {
    \"database\": true,
    \"storage\": true,
    \"models\": true,
    \"api_v2\": true
  },
  \"memory_usage\": {
    \"used_percent\": 4.6,
    \"available_mb\": 492103.4,
    \"total_mb\": 515630.6
  },
  \"active_tasks\": 2,
  \"queue_length\": 0
}
```

#### Status Values
- `healthy` - All services operational
- `degraded` - Some services have issues
- `down` - Critical services unavailable

### 2. Document Processing

**`POST /api/v2/process`**

Upload and process a document with custom prompts and parameters.

#### Request

**Content-Type:** `multipart/form-data`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ | Document file to process |
| `prompt` | String | ✅ | Analysis instructions for the LLM |
| `temperature` | Float | ❌ | LLM creativity (0.0-1.0, default: 0.7) |
| `max_tokens` | Integer | ❌ | Maximum response tokens (default: 4000) |
| `model` | String | ❌ | Specific model to use |

#### Native Open WebUI Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pdf_extract_images` | Boolean | `false` | Enable OCR for PDF images |
| `bypass_embedding_and_retrieval` | Boolean | `false` | Skip RAG, use full document |
| `rag_full_context` | Boolean | `true` | Extended context mode |
| `enable_hybrid_search` | Boolean | `false` | Hybrid search capabilities |
| `chunk_size` | Integer | `1200` | Text chunk size for processing |
| `chunk_overlap` | Integer | `200` | Overlap between chunks |
| `top_k` | Integer | `5` | Number of relevant chunks |
| `text_splitter` | String | `character` | Text splitting method |
| `content_extraction_engine` | String | `default` | Extraction engine to use |

#### Example Request

```bash
curl -X POST \"http://localhost:8080/api/v2/process\" \\
  -H \"Authorization: Bearer sk-your-api-key\" \\
  -F \"file=@document.pdf\" \\
  -F \"prompt=Analyze this document and provide a detailed summary\" \\
  -F \"temperature=0.7\" \\
  -F \"max_tokens=2000\" \\
  -F \"pdf_extract_images=true\" \\
  -F \"rag_full_context=true\" \\
  -F \"chunk_size=1000\"
```

#### Response

```json
{
  \"task_id\": \"550e8400-e29b-41d4-a716-446655440000\",
  \"status\": \"processing\",
  \"message\": \"Document processing started\"
}
```

### 3. Task Status

**`GET /api/v2/status/{task_id}`**

Check processing status and retrieve results.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | String | ✅ | Task identifier from process endpoint |

#### Response (Processing)

```json
{
  \"task_id\": \"550e8400-e29b-41d4-a716-446655440000\",
  \"status\": \"processing\",
  \"progress\": 65.0,
  \"step\": \"Extracting content from document\",
  \"estimated_completion\": \"2024-01-15T10:30:00Z\"
}
```

#### Response (Completed)

```json
{
  \"task_id\": \"550e8400-e29b-41d4-a716-446655440000\",
  \"status\": \"completed\",
  \"progress\": 100.0,
  \"processing_time\": 13.2,
  \"result\": {
    \"content\": \"This document discusses...\",
    \"processing_metadata\": {
      \"file_name\": \"document.pdf\",
      \"file_size\": 1048576,
      \"extraction_method\": \"PDFLoader\",
      \"content_length\": 1508,
      \"pages_processed\": 5,
      \"model_used\": \"llama3:8b\",
      \"parameters_applied\": {
        \"temperature\": 0.7,
        \"max_tokens\": 2000,
        \"pdf_extract_images\": true
      }
    }
  }
}
```

#### Response (Failed)

```json
{
  \"task_id\": \"550e8400-e29b-41d4-a716-446655440000\",
  \"status\": \"failed\",
  \"progress\": 0,
  \"error\": \"File format not supported\",
  \"error_code\": \"UNSUPPORTED_FORMAT\"
}
```

#### Status Values
- `pending` - Task queued for processing
- `processing` - Currently being processed
- `completed` - Successfully completed
- `failed` - Processing failed

### 4. Available Models

**`GET /api/v2/models`**

List available models with their capabilities.

#### Response

```json
{
  \"models\": [
    {
      \"id\": \"llama3:8b\",
      \"name\": \"Llama 3 8B\",
      \"capabilities\": [\"text\"],
      \"provider\": \"ollama\",
      \"context_length\": 8192,
      \"available\": true
    },
    {
      \"id\": \"llava:13b\",
      \"name\": \"LLaVA 13B\",
      \"capabilities\": [\"text\", \"vision\"],
      \"provider\": \"ollama\",
      \"context_length\": 4096,
      \"available\": true
    },
    {
      \"id\": \"gpt-4\",
      \"name\": \"GPT-4\",
      \"capabilities\": [\"text\", \"vision\"],
      \"provider\": \"openai\",
      \"context_length\": 128000,
      \"available\": false,
      \"reason\": \"API key required\"
    }
  ],
  \"default_model\": \"llama3:8b\",
  \"vision_models\": [\"llava:13b\", \"gpt-4-vision\"]
}
```

### 5. Configuration

**`GET /api/v2/config`**

Get current API configuration and limits.

#### Response

```json
{
  \"api_version\": \"2.0.0\",
  \"enabled\": true,
  \"limits\": {
    \"max_file_size_mb\": 50,
    \"max_concurrent_tasks\": 6,
    \"supported_formats\": [\"pdf\", \"docx\", \"doc\", \"txt\", \"md\", \"xls\", \"xlsx\", \"png\", \"jpg\", \"jpeg\"],
    \"timeout_seconds\": 300
  },
  \"features\": {
    \"ocr_enabled\": true,
    \"vision_models_available\": true,
    \"batch_processing\": false
  },
  \"default_parameters\": {
    \"temperature\": 0.7,
    \"max_tokens\": 4000,
    \"chunk_size\": 1200,
    \"chunk_overlap\": 200
  }
}
```

## 📄 Supported File Formats

| Format | Extensions | Max Size | OCR Support | Notes |
|--------|------------|----------|-------------|-------|
| **PDF** | `.pdf` | 50MB | ✅ | Text + image extraction |
| **Word** | `.docx`, `.doc` | 50MB | ❌ | Complete formatting |
| **Excel** | `.xls`, `.xlsx` | 50MB | ❌ | Tabular data |
| **Text** | `.txt`, `.md` | 50MB | ❌ | Direct processing |
| **Images** | `.png`, `.jpg`, `.jpeg` | 10MB | ✅ | Vision model analysis |

## 🔧 Parameter Reference

### Core Parameters

#### `temperature` (Float, 0.0-1.0)
Controls LLM creativity and randomness:
- `0.0` - Deterministic, focused responses
- `0.5` - Balanced creativity
- `1.0` - Maximum creativity and variation

#### `max_tokens` (Integer, 1-8192)
Maximum tokens in the response:
- `1000` - Short summaries
- `2000` - Standard analysis
- `4000` - Detailed reports

#### `model` (String, optional)
Specific model to use:
- Auto-selection if not specified
- Vision models for images
- Text models for documents

### Document Processing Parameters

#### `pdf_extract_images` (Boolean)
- `true` - Extract text from images using OCR
- `false` - Text-only extraction (faster)

#### `rag_full_context` (Boolean)
- `true` - Use entire document as context
- `false` - Use only relevant chunks

#### `bypass_embedding_and_retrieval` (Boolean)
- `true` - Skip RAG processing, use raw content
- `false` - Use Open WebUI's RAG system

#### `chunk_size` (Integer, 100-2000)
Size of text chunks for processing:
- `500` - Small chunks, precise matching
- `1200` - Balanced processing
- `2000` - Large context, slower processing

#### `chunk_overlap` (Integer, 0-500)
Overlap between consecutive chunks:
- `0` - No overlap (faster)
- `200` - Standard overlap
- `500` - Maximum continuity

#### `top_k` (Integer, 1-20)
Number of relevant chunks to retrieve:
- `3` - Focused analysis
- `5` - Standard retrieval
- `10` - Comprehensive analysis

## 🚀 Usage Examples

### Basic Document Analysis

```python
import requests

# Setup
url = \"http://localhost:8080/api/v2/process\"
headers = {\"Authorization\": \"Bearer sk-your-api-key\"}

# Upload and process
with open(\"document.pdf\", \"rb\") as f:
    data = {
        \"prompt\": \"Summarize the key points of this document\",
        \"temperature\": \"0.6\",
        \"max_tokens\": \"1500\"
    }
    files = {\"file\": f}
    
    response = requests.post(url, headers=headers, files=files, data=data)
    task_id = response.json()[\"task_id\"]

# Poll for results
status_url = f\"http://localhost:8080/api/v2/status/{task_id}\"
while True:
    status = requests.get(status_url, headers=headers).json()
    if status[\"status\"] == \"completed\":
        print(status[\"result\"][\"content\"])
        break
    elif status[\"status\"] == \"failed\":
        print(f\"Error: {status['error']}\")
        break
    time.sleep(2)
```

### Advanced OCR Processing

```bash
curl -X POST \"http://localhost:8080/api/v2/process\" \\
  -H \"Authorization: Bearer sk-your-api-key\" \\
  -F \"file=@scanned_document.pdf\" \\
  -F \"prompt=Extract all text and analyze the document structure\" \\
  -F \"pdf_extract_images=true\" \\
  -F \"rag_full_context=true\" \\
  -F \"temperature=0.3\"
```

### Batch Processing (Manual)

```python
import asyncio
import aiohttp

async def process_document(session, file_path, prompt):
    with open(file_path, 'rb') as f:
        data = aiohttp.FormData()
        data.add_field('file', f)
        data.add_field('prompt', prompt)
        data.add_field('temperature', '0.7')
        
        async with session.post(
            'http://localhost:8080/api/v2/process',
            headers={'Authorization': 'Bearer sk-your-api-key'},
            data=data
        ) as response:
            return await response.json()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [
            process_document(session, 'doc1.pdf', 'Summarize this document'),
            process_document(session, 'doc2.docx', 'Extract key insights'),
            process_document(session, 'doc3.txt', 'Analyze the content')
        ]
        results = await asyncio.gather(*tasks)
        print(results)

asyncio.run(main())
```

### Excel Data Analysis

```bash
curl -X POST \"http://localhost:8080/api/v2/process\" \\
  -H \"Authorization: Bearer sk-your-api-key\" \\
  -F \"file=@financial_data.xlsx\" \\
  -F \"prompt=Analyze the financial trends and provide insights\" \\
  -F \"bypass_embedding_and_retrieval=true\" \\
  -F \"max_tokens=3000\"
```

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | Success | Request processed successfully |
| `400` | Bad Request | Invalid parameters or malformed request |
| `401` | Unauthorized | Invalid or missing API key |
| `413` | Payload Too Large | File exceeds size limits |
| `415` | Unsupported Media Type | File format not supported |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server processing error |
| `503` | Service Unavailable | System overloaded or maintenance |

### Error Response Format

```json
{
  \"error\": \"File size exceeds maximum limit\",
  \"error_code\": \"FILE_TOO_LARGE\",
  \"details\": {
    \"max_size_mb\": 50,
    \"received_size_mb\": 75
  },
  \"timestamp\": \"2024-01-15T10:15:30Z\"
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_API_KEY` | API key invalid or expired | Regenerate API key |
| `FILE_TOO_LARGE` | File exceeds size limit | Reduce file size or split document |
| `UNSUPPORTED_FORMAT` | File format not supported | Convert to supported format |
| `PROCESSING_TIMEOUT` | Processing took too long | Try with smaller file or simpler prompt |
| `MODEL_UNAVAILABLE` | Requested model not available | Use different model or check configuration |
| `QUEUE_FULL` | Too many concurrent tasks | Wait and retry |

## 📊 Rate Limits

### Default Limits

- **Concurrent tasks:** 6 per instance
- **File size:** 50MB maximum
- **Request rate:** No hard limit (governed by task queue)
- **Processing timeout:** 300 seconds (5 minutes)

### Monitoring Usage

Check current usage via health endpoint:

```bash
curl -H \"Authorization: Bearer sk-your-api-key\" \\
  \"http://localhost:8080/api/v2/health\"
```

Response includes:
- `active_tasks` - Currently processing
- `queue_length` - Waiting to process
- `memory_usage` - System resource utilization

## 🔧 Configuration Options

### Admin Interface Settings

Access via **Admin → Settings → API v2**:

- **Enable/Disable API v2** - Toggle functionality
- **Max Concurrent Tasks** - Adjust based on hardware
- **Max File Size** - Set upload limits
- **Default Model** - Choose processing model
- **Timeout Settings** - Configure processing limits

### Environment Variables

```bash
# API v2 Configuration
API_V2_ENABLED=true
MAX_CONCURRENT_TASKS=6
MAX_FILE_SIZE_MB=50
PROCESSING_TIMEOUT=300

# Model Configuration
DEFAULT_MODEL="llama3:8b"
ENABLE_VISION_MODELS=true

# Performance
ENABLE_CACHING=true
CACHE_TTL=3600
```

## 🔐 Security Considerations

### API Key Management

- **Generate unique keys** for each application
- **Rotate keys regularly** (recommended: monthly)
- **Revoke unused keys** immediately
- **Monitor key usage** via logs

### Content Security

- **Validate file types** before upload
- **Scan for malware** in production environments
- **Limit file sizes** to prevent DoS attacks
- **Sanitize prompts** to prevent injection attacks

### Network Security

- **Use HTTPS** in production
- **Implement rate limiting** at network level
- **Configure firewalls** to restrict access
- **Monitor API usage** for unusual patterns

## 📈 Performance Optimization

### File Optimization

- **Compress PDFs** before upload
- **Convert images** to optimal formats
- **Split large documents** into smaller sections
- **Remove unnecessary metadata**

### Parameter Tuning

- **Reduce chunk_size** for faster processing
- **Lower max_tokens** for quicker responses
- **Use specific models** instead of auto-selection
- **Enable caching** for repeated processing

### System Optimization

- **Increase concurrent tasks** on powerful hardware
- **Use SSD storage** for better I/O performance
- **Allocate sufficient RAM** for large files
- **Monitor CPU usage** and scale accordingly

## 🧪 Testing & Validation

### Health Check Monitoring

```bash
#!/bin/bash
# health_check.sh

API_KEY=\"sk-your-api-key\"
BASE_URL=\"http://localhost:8080/api/v2\"

# Check API health
response=$(curl -s -H \"Authorization: Bearer $API_KEY\" \"$BASE_URL/health\")
status=$(echo $response | jq -r '.status')

if [ \"$status\" = \"healthy\" ]; then
  echo \"✅ API is healthy\"
  exit 0
else
  echo \"❌ API is $status\"
  exit 1
fi
```

### Automated Testing

```python
# test_api_functionality.py
import requests
import time

def test_document_processing():
    headers = {\"Authorization\": \"Bearer sk-your-api-key\"}
    
    # Test file upload
    with open(\"test_document.pdf\", \"rb\") as f:
        response = requests.post(
            \"http://localhost:8080/api/v2/process\",
            headers=headers,
            files={\"file\": f},
            data={\"prompt\": \"Test processing\"}
        )
    
    assert response.status_code == 200
    task_id = response.json()[\"task_id\"]
    
    # Test status polling
    while True:
        status_response = requests.get(
            f\"http://localhost:8080/api/v2/status/{task_id}\",
            headers=headers
        )
        status_data = status_response.json()
        
        if status_data[\"status\"] == \"completed\":
            assert \"content\" in status_data[\"result\"]
            break
        elif status_data[\"status\"] == \"failed\":
            raise Exception(f\"Processing failed: {status_data['error']}\")
        
        time.sleep(1)

if __name__ == \"__main__\":
    test_document_processing()
    print(\"✅ All tests passed\")
```

## 📞 Support & Troubleshooting

### Common Issues

**Authentication Errors:**
1. Verify API key format (`sk-` prefix)
2. Check API key hasn't expired
3. Ensure API v2 is enabled

**Processing Failures:**
1. Check file format compatibility
2. Verify file size limits
3. Monitor system resources

**Timeout Issues:**
1. Reduce file size
2. Simplify prompts
3. Check system performance

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=\"DEBUG\"
export API_V2_DEBUG=true
```

### Getting Help

1. **Documentation:** Review this complete API reference
2. **Logs:** Check application logs for detailed error information
3. **Health Check:** Use `/health` endpoint to diagnose issues
4. **Community:** Join discussions and report issues on GitHub

---

**API v2 is production-ready and actively maintained.** For the latest updates and additional features, check the project repository. 🚀