# Installation Guide - Api-Doc-IA

> Complete setup instructions for Api-Doc-IA document processing system

## 📋 Prerequisites

### System Requirements

- **Python 3.11+** (recommended)
- **Node.js 18+** and npm
- **Git** for source control
- **4GB+ RAM** (8GB+ recommended for production)
- **2GB+ disk space** for dependencies and models

### Optional Requirements

- **Docker** and Docker Compose (for containerized deployment)
- **NVIDIA GPU** (for accelerated processing)
- **Ollama** (for local LLM models)

## 🚀 Installation Methods

### Method 1: Development Setup (Recommended)

Perfect for development and testing with full customization options.

#### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Api-Doc-IA
```

#### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 3: Frontend Setup

```bash
# Return to project root
cd ..

# Install Node.js dependencies
npm install

# Build frontend
npm run build
```

#### Step 4: Configuration

Create environment file:

```bash
# Copy example configuration
cp .env.example .env

# Edit configuration (optional)
nano .env
```

Key configuration variables:

```bash
# Authentication
WEBUI_AUTH=True
ENABLE_SIGNUP=False

# API v2 Settings
API_V2_ENABLED=True
MAX_CONCURRENT_TASKS=6
MAX_FILE_SIZE_MB=50

# Database
DATABASE_URL=sqlite:///./webui.db

# Development
DEBUG=True
```

#### Step 5: Start Development Server

```bash
# Set Python path and start
export PYTHONPATH="/path/to/Api-Doc-IA/backend:$PYTHONPATH"
./start_with_local_code.sh
```

Or manually:

```bash
cd backend
python -m open_webui.main --port 8080 --host 0.0.0.0
```

#### Step 6: Verify Installation

1. Open browser to [http://localhost:8080](http://localhost:8080)
2. Create admin account on first visit
3. Navigate to **Admin → Settings → API v2**
4. Enable API v2 and generate API key
5. Test with health endpoint:

```bash
curl "http://localhost:8080/api/v2/health"
```

### Method 2: Docker Deployment

#### Standard Docker Setup

```bash
# Clone repository
git clone <repository-url>
cd Api-Doc-IA

# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose logs -f
```

#### Docker with GPU Support

```bash
# Ensure NVIDIA Docker runtime is installed
# See: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html

# Start with GPU support
docker-compose -f docker-compose.gpu.yaml up -d
```

#### Custom Docker Configuration

Create `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  open-webui:
    environment:
      - API_V2_ENABLED=true
      - MAX_CONCURRENT_TASKS=10
      - MAX_FILE_SIZE_MB=100
    volumes:
      - ./custom-models:/app/backend/data/models
    ports:
      - "8080:8080"
```

### Method 3: Production Deployment

#### Using pip (Quick Production Setup)

```bash
# Install from source
pip install -e .

# Create configuration directory
mkdir -p ~/.config/api-doc-ia

# Copy configuration
cp config/production.env ~/.config/api-doc-ia/.env

# Start production server
api-doc-ia serve --config ~/.config/api-doc-ia/.env
```

#### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/

# Or using Helm
helm install api-doc-ia ./kubernetes/helm/api-doc-ia
```

## 🔧 Configuration

### Environment Variables

Comprehensive list of configuration options:

```bash
# Core Settings
WEBUI_NAME="Api-Doc-IA"
WEBUI_URL="http://localhost:8080"
DATA_DIR="/app/backend/data"

# Authentication & Security
WEBUI_AUTH=True
ENABLE_SIGNUP=False
JWT_EXPIRES_IN="7d"
WEBUI_SECRET_KEY="your-secret-key"

# API v2 Configuration
API_V2_ENABLED=True
MAX_CONCURRENT_TASKS=6
MAX_FILE_SIZE_MB=50
ENABLE_API_KEY=True

# Document Processing
PDF_EXTRACT_IMAGES=True
RAG_FULL_CONTEXT=True
CHUNK_SIZE=1200
CHUNK_OVERLAP=200

# Performance
OLLAMA_BASE_URL="http://localhost:11434"
OPENAI_API_KEY="your-openai-key"
DEFAULT_MODELS="llama3:8b"

# Storage
UPLOAD_DIR="/app/backend/data/uploads"
DOCS_DIR="/app/backend/data/docs"

# Monitoring
ENABLE_MONITORING=True
LOG_LEVEL="INFO"
```

### Model Configuration

#### Ollama Setup (Local Models)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download recommended models
ollama pull llama3:8b
ollama pull llava:13b  # For vision capabilities
ollama pull codellama:13b

# Verify models
ollama list
```

#### OpenAI API Configuration

```bash
# Set OpenAI API key
export OPENAI_API_KEY="sk-your-openai-key"

# Or in .env file
echo "OPENAI_API_KEY=sk-your-openai-key" >> .env
```

#### Custom Model Endpoints

```bash
# Configure custom OpenAI-compatible endpoint
OPENAI_API_BASE_URL="https://your-custom-endpoint.com/v1"
OPENAI_API_KEY="your-custom-key"
```

## 🧪 Testing Installation

### Quick Functionality Test

```bash
# Test authentication
python test_auth_simple.py

# Test document processing
python test_quick_apikey.py

# Test all supported formats
python test_formats_final.py
```

### Manual API Testing

```bash
# 1. Get API key from admin interface
# Admin → Settings → API v2 → Generate Key

# 2. Test health endpoint
curl -H "Authorization: Bearer sk-your-api-key" \
  "http://localhost:8080/api/v2/health"

# 3. Test document processing
curl -X POST "http://localhost:8080/api/v2/process" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "file=@test.txt" \
  -F "prompt=Summarize this document"

# 4. Check task status (replace task-id)
curl -H "Authorization: Bearer sk-your-api-key" \
  "http://localhost:8080/api/v2/status/task-id"
```

## 🔧 Troubleshooting

### Common Installation Issues

#### Python Version Conflicts

```bash
# Check Python version
python --version

# Use specific Python version
python3.11 -m venv venv
```

#### Node.js Build Errors

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Permission Issues

```bash
# Fix file permissions
chmod +x start_with_local_code.sh

# Fix ownership (if needed)
sudo chown -R $USER:$USER .
```

### Database Issues

#### SQLite Database Errors

```bash
# Reset database
rm backend/open_webui/data/webui.db

# Recreate admin user on first startup
```

#### Migration Problems

```bash
# Run migrations manually
cd backend
python -c "from open_webui.internal.db import init_db; init_db()"
```

### Docker Issues

#### Container Startup Problems

```bash
# Check container logs
docker-compose logs open-webui

# Restart services
docker-compose restart

# Rebuild containers
docker-compose build --no-cache
```

#### Volume Mount Issues

```bash
# Check volume permissions
ls -la data/

# Fix permissions
sudo chown -R 1000:1000 data/
```

### API Issues

#### API v2 Not Available

1. Check API v2 is enabled in admin settings
2. Verify `API_V2_ENABLED=True` in environment
3. Restart application after configuration changes

#### Authentication Failures

1. Regenerate API key in admin interface
2. Check API key format (should start with `sk-`)
3. Verify Bearer token format in Authorization header

#### File Upload Errors

1. Check file size limits (default 50MB)
2. Verify file format is supported
3. Ensure sufficient disk space

## 📊 Performance Optimization

### Resource Allocation

```bash
# Increase concurrent tasks for powerful hardware
MAX_CONCURRENT_TASKS=12

# Adjust file size limits
MAX_FILE_SIZE_MB=100

# Configure memory limits
OLLAMA_NUM_PARALLEL=4
```

### Caching Configuration

```bash
# Enable response caching
ENABLE_CACHING=True
CACHE_TTL=3600

# Configure Redis cache (optional)
REDIS_URL="redis://localhost:6379"
```

### Load Balancing

For high-traffic deployments:

```bash
# Use multiple worker processes
gunicorn --workers 4 --worker-class uvicorn.workers.UvicornWorker open_webui.main:app

# Configure reverse proxy (nginx)
# See: nginx.conf.example
```

## 🔒 Security Configuration

### Production Security Checklist

- [ ] Change default admin credentials
- [ ] Set strong `WEBUI_SECRET_KEY`
- [ ] Disable signup (`ENABLE_SIGNUP=False`)
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular backup schedule
- [ ] Monitor API usage logs

### SSL/HTTPS Setup

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com

# Or configure custom certificates
SSL_CERT_PATH="/path/to/cert.pem"
SSL_KEY_PATH="/path/to/key.pem"
```

## 📈 Monitoring & Maintenance

### Health Monitoring

```bash
# Setup health check endpoint monitoring
curl "http://localhost:8080/api/v2/health" | jq '.status'

# Monitor system resources
htop
df -h
```

### Log Management

```bash
# Configure log rotation
LOG_LEVEL="INFO"
LOG_FILE="/var/log/api-doc-ia.log"

# View application logs
tail -f /var/log/api-doc-ia.log
```

### Backup Strategy

```bash
# Backup database
cp backend/open_webui/data/webui.db backup/webui-$(date +%Y%m%d).db

# Backup uploaded documents
tar -czf backup/documents-$(date +%Y%m%d).tar.gz backend/open_webui/data/uploads/

# Automated backup script
./scripts/backup.sh
```

## 🚀 Next Steps

After successful installation:

1. **Configure models** - Set up Ollama or OpenAI API
2. **Generate API key** - Create API key for development
3. **Test document processing** - Upload sample documents
4. **Read API documentation** - Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
5. **Explore admin interface** - Familiarize with settings and monitoring

## 💬 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Search existing [GitHub Issues](https://github.com/your-repo/Api-Doc-IA/issues)
4. Create a new issue with detailed error information

---

**Installation complete!** Your Api-Doc-IA instance should now be running and ready for document processing. 🎉