# Security Policy - Api-Doc-IA

> Security guidelines and procedures for Api-Doc-IA document processing system

## 🛡️ Security Overview

Api-Doc-IA takes security seriously. This document outlines our security practices, how to report vulnerabilities, and guidelines for secure deployment and usage.

## 🔒 Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.1.x   | ❌ No              |
| 1.0.x   | ❌ No              |

**Note:** Only the latest major version receives security updates. Please upgrade to the latest version for security patches.

## 🚨 Reporting Security Vulnerabilities

### How to Report

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. **Do NOT** disclose the vulnerability publicly until it's been addressed
3. **Email**: Send details to `security@your-domain.com` (when available)
4. **GitHub**: Use GitHub's private vulnerability reporting feature

### What to Include

Please provide the following information:

```
Subject: [SECURITY] Brief description of vulnerability

Description:
- Detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact and attack scenarios
- Affected versions
- Suggested fix (if known)

Environment:
- Api-Doc-IA version
- Operating System
- Python version
- Deployment method (Docker, pip, etc.)

Contact:
- Your name (optional)
- Contact information for follow-up
```

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Development**: Depends on severity
- **Public Disclosure**: After fix is released

## 🔐 Authentication & Authorization

### API Key Security

**API Key Management:**
- Generate unique keys for each application/user
- Use strong, unpredictable key generation (cryptographically secure)
- Store keys securely (encrypted at rest)
- Rotate keys regularly (recommended: monthly)
- Revoke unused or compromised keys immediately

**Key Format:**
```
sk-[32-character-random-string]
Example: sk-4e0492a827b441d6acc98819a338ebca8
```

**Best Practices:**
```bash
# ✅ Good: Use environment variables
export API_DOC_IA_KEY="sk-your-api-key"

# ❌ Bad: Hardcode in source code
api_key = "sk-your-api-key"  # Never do this!

# ✅ Good: Secure storage in config files
echo "API_KEY=sk-your-api-key" >> .env
chmod 600 .env

# ✅ Good: Use secrets management
docker run -e API_KEY_FILE=/run/secrets/api_key ...
```

### Authentication Flow Security

**Token Validation:**
- All API v2 endpoints require valid authentication
- Tokens are validated on every request
- Invalid tokens result in immediate rejection (401 Unauthorized)
- No token caching or session persistence

**Rate Limiting:**
```python
# Built-in protection
MAX_CONCURRENT_TASKS = 6  # Prevents resource exhaustion
REQUEST_TIMEOUT = 300     # 5-minute processing limit
```

## 🔒 Data Security

### File Upload Security

**File Validation Pipeline:**
1. **Extension Check**: Only allowed file types accepted
2. **MIME Type Verification**: Content-based validation
3. **Size Limits**: Configurable maximum file size (default: 50MB)
4. **Content Scanning**: Basic malware detection patterns
5. **Sanitization**: File name cleaning and path validation

**Allowed File Types:**
```python
ALLOWED_EXTENSIONS = {
    '.pdf', '.docx', '.doc', '.txt', '.md', 
    '.xls', '.xlsx', '.png', '.jpg', '.jpeg'
}

ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg'
}
```

**Security Measures:**
```python
class FileValidator:
    def validate_file(self, file):
        # Size check
        if file.size > MAX_FILE_SIZE:
            raise SecurityError("File too large")
        
        # Extension validation
        if not self.is_allowed_extension(file.filename):
            raise SecurityError("File type not allowed")
        
        # MIME type verification
        detected_mime = magic.from_buffer(file.content, mime=True)
        if detected_mime not in ALLOWED_MIME_TYPES:
            raise SecurityError("Invalid file content")
        
        # Path traversal protection
        safe_filename = secure_filename(file.filename)
        if safe_filename != file.filename:
            raise SecurityError("Invalid filename")
```

### Data Processing Security

**Content Isolation:**
- Each processing task runs in isolation
- Temporary files are automatically cleaned up
- No persistent storage of document content
- Memory is cleared after processing

**Input Sanitization:**
```python
class InputSanitizer:
    def sanitize_prompt(self, prompt: str) -> str:
        # Remove potentially dangerous characters
        prompt = re.sub(r'[<>"\'\n\r]', '', prompt)
        
        # Limit length to prevent resource exhaustion
        if len(prompt) > 10000:
            prompt = prompt[:10000]
        
        # Remove potential injection patterns
        prompt = re.sub(r'(script|javascript|eval|exec)', '', prompt, re.IGNORECASE)
        
        return prompt.strip()
```

### Data Storage Security

**Temporary File Handling:**
```python
class SecureFileHandler:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix="api_doc_ia_")
        os.chmod(self.temp_dir, 0o700)  # Owner only
    
    def save_uploaded_file(self, file):
        # Generate random filename to prevent conflicts
        safe_name = f"{uuid4().hex}_{secure_filename(file.filename)}"
        file_path = os.path.join(self.temp_dir, safe_name)
        
        # Ensure file is within temp directory (prevent path traversal)
        if not file_path.startswith(self.temp_dir):
            raise SecurityError("Invalid file path")
        
        return file_path
    
    def cleanup(self):
        # Secure deletion of temporary files
        shutil.rmtree(self.temp_dir, ignore_errors=True)
```

## 🌐 Network Security

### HTTPS/TLS Configuration

**Production Deployment:**
```nginx
# nginx.conf example
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    location /api/v2/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Request size limits
        client_max_body_size 50M;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }
}
```

### API Security Headers

**FastAPI Security Configuration:**
```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["your-domain.com", "*.your-domain.com"]
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

## 🔍 Security Monitoring

### Logging and Auditing

**Security Events to Log:**
```python
import logging

security_logger = logging.getLogger("api_doc_ia.security")

class SecurityAuditor:
    def log_authentication_attempt(self, api_key_prefix, success, ip_address):
        security_logger.info(
            f"Auth attempt: key={api_key_prefix[:8]}..., "
            f"success={success}, ip={ip_address}"
        )
    
    def log_file_upload(self, user_id, filename, size, ip_address):
        security_logger.info(
            f"File upload: user={user_id}, file={filename}, "
            f"size={size}, ip={ip_address}"
        )
    
    def log_suspicious_activity(self, event_type, details, ip_address):
        security_logger.warning(
            f"Suspicious activity: type={event_type}, "
            f"details={details}, ip={ip_address}"
        )
```

**Log Format:**
```
2024-11-06 10:15:30 [INFO] api_doc_ia.security: Auth attempt: key=sk-4e049..., success=true, ip=192.168.1.100
2024-11-06 10:16:45 [INFO] api_doc_ia.security: File upload: user=admin, file=document.pdf, size=1048576, ip=192.168.1.100
2024-11-06 10:17:22 [WARNING] api_doc_ia.security: Suspicious activity: type=rapid_requests, details=10_requests_in_1s, ip=192.168.1.100
```

### Intrusion Detection

**Rate Limiting Implementation:**
```python
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.max_requests = 60  # per minute
        self.window = 60  # seconds
    
    def is_allowed(self, client_ip):
        now = time.time()
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip] 
            if now - req_time < self.window
        ]
        
        # Check limit
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        
        # Record request
        self.requests[client_ip].append(now)
        return True
```

## 🚨 Incident Response

### Security Incident Classification

**Severity Levels:**

**Critical (P0):**
- Remote code execution vulnerabilities
- Authentication bypass
- Data breach or unauthorized access
- System compromise

**High (P1):**
- Privilege escalation
- SQL injection or similar injection attacks
- Sensitive data exposure
- DoS vulnerabilities

**Medium (P2):**
- Information disclosure
- CSRF vulnerabilities
- Insecure defaults
- Missing security headers

**Low (P3):**
- Security configuration improvements
- Non-sensitive information leaks
- Minor protocol vulnerabilities

### Response Procedures

**Immediate Response (0-2 hours):**
1. **Assess Impact**: Determine scope and severity
2. **Contain Threat**: Isolate affected systems if necessary
3. **Preserve Evidence**: Capture logs and system state
4. **Notify Stakeholders**: Internal team and affected users

**Short-term Response (2-24 hours):**
1. **Develop Fix**: Create patch or workaround
2. **Test Solution**: Validate fix in staging environment
3. **Prepare Communications**: Draft user notifications
4. **Deploy Fix**: Roll out to production systems

**Long-term Response (1-7 days):**
1. **Post-Incident Review**: Analyze root cause
2. **Update Procedures**: Improve security processes
3. **Security Enhancements**: Implement additional protections
4. **Documentation**: Update security documentation

## 🔐 Deployment Security

### Production Security Checklist

**System Configuration:**
- [ ] Use HTTPS/TLS for all communications
- [ ] Configure secure headers (HSTS, CSP, etc.)
- [ ] Set up firewall rules (only necessary ports open)
- [ ] Enable system-level logging and monitoring
- [ ] Use non-root user for application processes
- [ ] Keep system and dependencies updated

**Application Configuration:**
- [ ] Change default admin credentials
- [ ] Set strong `WEBUI_SECRET_KEY`
- [ ] Disable debug mode in production
- [ ] Configure rate limiting
- [ ] Set appropriate file size limits
- [ ] Enable API key authentication
- [ ] Configure secure session settings

**Infrastructure Security:**
- [ ] Use isolated network segments
- [ ] Implement proper backup procedures
- [ ] Set up intrusion detection/prevention
- [ ] Configure log aggregation and analysis
- [ ] Implement secrets management
- [ ] Use container security best practices (if using Docker)

### Environment Variables Security

**Secure Configuration:**
```bash
# ✅ Good: Use strong random secrets
WEBUI_SECRET_KEY=$(openssl rand -hex 32)

# ✅ Good: Disable unnecessary features
ENABLE_SIGNUP=false
DEBUG=false

# ✅ Good: Set security limits
MAX_FILE_SIZE_MB=50
MAX_CONCURRENT_TASKS=6
API_REQUEST_TIMEOUT=300

# ✅ Good: Configure secure defaults
WEBUI_AUTH=true
ENABLE_API_KEY=true
SECURE_COOKIES=true
```

### Docker Security

**Secure Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set security options
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy application
COPY . /app
WORKDIR /app

# Set permissions
RUN chown -R appuser:appuser /app
USER appuser

# Remove unnecessary packages
RUN pip install --no-cache-dir -r requirements.txt

# Security settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8080
CMD ["python", "-m", "open_webui.main"]
```

**Docker Compose Security:**
```yaml
version: '3.8'
services:
  api-doc-ia:
    build: .
    ports:
      - "127.0.0.1:8080:8080"  # Bind to localhost only
    environment:
      - WEBUI_SECRET_KEY_FILE=/run/secrets/webui_secret
    secrets:
      - webui_secret
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID

secrets:
  webui_secret:
    file: ./secrets/webui_secret.txt
```

## 📋 Security Contact

### Responsible Disclosure

We follow responsible disclosure practices:

1. **Private Reporting**: Vulnerabilities reported privately first
2. **Coordinated Disclosure**: Public disclosure after fix is available
3. **Credit**: Security researchers receive appropriate credit
4. **No Legal Action**: We won't pursue legal action against researchers who follow these guidelines

### Security Team

- **Response Time**: Business hours (UTC)
- **Languages**: English, French
- **PGP Key**: Available on request

---

**Security is a shared responsibility.** Users, developers, and administrators all play a role in maintaining a secure Api-Doc-IA deployment. 🛡️

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

**Stay secure, stay updated!** 🔒