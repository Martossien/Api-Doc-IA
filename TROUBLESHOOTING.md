# Troubleshooting Guide - Api-Doc-IA

> Common issues and solutions for Api-Doc-IA document processing system

## 🔍 Quick Diagnosis

### Health Check First
```bash
# Check system status
curl "http://localhost:8080/api/v2/health"

# Expected response
{
  "status": "healthy",
  "services": {
    "database": true,
    "storage": true,
    "models": true,
    "api_v2": true
  }
}
```

### Common Status Meanings
- `healthy` - All systems operational
- `degraded` - Some services have issues but API functional
- `down` - Critical services unavailable

## 🚨 Installation & Startup Issues

### Server Won't Start

**Symptom:** `python -m open_webui.main` fails
```bash
ModuleNotFoundError: No module named 'open_webui'
```

**Solutions:**
```bash
# 1. Check Python path
export PYTHONPATH="/path/to/Api-Doc-IA/backend:$PYTHONPATH"

# 2. Verify installation
cd backend
pip install -r requirements.txt

# 3. Use provided startup script
./scripts/start-api-doc-ia.sh
```

### Port Already in Use

**Symptom:** `Address already in use: 8080`

**Solutions:**
```bash
# 1. Find process using port
lsof -i :8080

# 2. Kill existing process
kill -9 <PID>

# 3. Use different port
python -m open_webui.main --port 8081
```

### Database Connection Errors

**Symptom:** `unable to open database file`

**Solutions:**
```bash
# 1. Check database directory exists
mkdir -p backend/open_webui/data

# 2. Fix permissions
chmod 755 backend/open_webui/data

# 3. Reset database (WARNING: loses data)
rm backend/open_webui/data/webui.db
# Restart server to recreate
```

## 🔐 Authentication Issues

### API v2 Not Available

**Symptom:** `404 Not Found` on `/api/v2/*` endpoints

**Diagnosis:**
```bash
# Check if API v2 is enabled
curl "http://localhost:8080/api/v2/health"
```

**Solutions:**
1. **Enable in Admin Interface:**
   - Login as admin → Settings → API v2
   - Toggle "Enable API v2" ON
   - Click "Save"

2. **Check Environment Variable:**
   ```bash
   export API_V2_ENABLED=true
   ```

3. **Restart Application:**
   ```bash
   # Stop current instance
   pkill -f "open_webui"
   
   # Restart
   ./scripts/start-api-doc-ia.sh
   ```

### API Key Authentication Failures

**Symptom:** `401 Unauthorized` with valid-looking API key

**Diagnosis:**
```bash
# Test API key format
echo "sk-d88e3244ae2e4b64a5256c6f4946155a" | grep "^sk-"
```

**Solutions:**
1. **Regenerate API Key:**
   - Admin → Settings → API v2
   - Click "Generate New API Key"
   - Copy the new key (starts with `sk-`)

2. **Check Header Format:**
   ```bash
   # Correct format
   Authorization: Bearer sk-your-api-key
   
   # Common mistakes
   Authorization: sk-your-api-key        # Missing "Bearer"
   Authorization: Bearer your-api-key    # Missing "sk-" prefix
   ```

3. **Verify Admin User:**
   - Ensure you're logged in as admin
   - Check user permissions in Admin → Users

### Login Issues

**Symptom:** Cannot login to web interface

**Solutions:**
```bash
# 1. Reset admin password (if database accessible)
# Access SQLite database
sqlite3 backend/open_webui/data/webui.db
UPDATE user SET password = '$2b$12$...' WHERE email = 'admin@localhost';

# 2. Create new admin user (first signup)
# Delete existing users and restart
rm backend/open_webui/data/webui.db
# First user to register becomes admin
```

## 📄 Document Processing Issues

### File Upload Failures

**Symptom:** Upload fails with various errors

**Diagnosis:**
```bash
# Check file size
ls -lh your-document.pdf

# Check file type
file your-document.pdf
```

**Solutions by Error:**

**1. File Too Large:**
```bash
# Default limit: 50MB
# Check current limits
curl -H "Authorization: Bearer sk-your-key" \
  "http://localhost:8080/api/v2/config"

# Increase limit (in MB)
export MAX_FILE_SIZE_MB=100
```

**2. Unsupported Format:**
```bash
# Supported formats
.pdf, .docx, .doc, .txt, .md, .xls, .xlsx, .png, .jpg, .jpeg

# Convert unsupported files
libreoffice --headless --convert-to pdf document.pages
```

**3. Corrupted File:**
```bash
# Test file integrity
file your-document.pdf
# Should show: "PDF document, version X.X"

# For images
identify your-image.jpg
```

### Processing Timeouts

**Symptom:** Task stays in "processing" status forever

**Diagnosis:**
```bash
# Check task status
curl -H "Authorization: Bearer sk-your-key" \
  "http://localhost:8080/api/v2/status/task-id"
```

**Solutions:**
1. **Check System Resources:**
   ```bash
   # Memory usage
   free -h
   
   # CPU usage
   top
   
   # Disk space
   df -h
   ```

2. **Reduce File Complexity:**
   - Split large documents
   - Reduce image resolution in PDFs
   - Simplify prompts

3. **Increase Timeout:**
   ```bash
   export PROCESSING_TIMEOUT=600  # 10 minutes
   ```

### "Cannot Access File" Errors

**Symptom:** LLM responds "I cannot access the file"

**Diagnosis:**
```bash
# Check if content extraction worked
# Look for "Content extracted" in logs
tail -f logs/api-doc-ia.log | grep "Content"
```

**Solutions:**
1. **Check File Format Support:**
   - Use supported formats only
   - Convert problematic files

2. **Enable Debug Mode:**
   ```bash
   export LOG_LEVEL=DEBUG
   export API_V2_DEBUG=true
   ```

3. **Test with Simple File:**
   ```bash
   # Create test file
   echo "This is a test document." > test.txt
   
   # Test processing
   curl -X POST "http://localhost:8080/api/v2/process" \
     -H "Authorization: Bearer sk-your-key" \
     -F "file=@test.txt" \
     -F "prompt=Summarize this document"
   ```

## 🤖 Model Issues

### No Models Available

**Symptom:** Empty models list or processing fails

**Diagnosis:**
```bash
# Check available models
curl -H "Authorization: Bearer sk-your-key" \
  "http://localhost:8080/api/v2/models"
```

**Solutions:**

**1. Install Ollama Models:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download models
ollama pull llama3:8b
ollama pull llava:13b

# Verify
ollama list
```

**2. Configure OpenAI API:**
```bash
export OPENAI_API_KEY="sk-your-openai-key"
```

**3. Check Model Connectivity:**
```bash
# Test Ollama connection
curl "http://localhost:11434/api/tags"

# Test OpenAI connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  "https://api.openai.com/v1/models"
```

### Model Loading Errors

**Symptom:** Models show as unavailable

**Solutions:**
```bash
# 1. Restart Ollama
systemctl restart ollama

# 2. Check Ollama logs
journalctl -u ollama -f

# 3. Verify model files
ls ~/.ollama/models/

# 4. Re-pull corrupted models
ollama rm llama3:8b
ollama pull llama3:8b
```

## 🐳 Docker Issues

### Container Won't Start

**Symptom:** Docker container exits immediately

**Diagnosis:**
```bash
# Check container logs
docker logs api-doc-ia

# Check container status
docker ps -a
```

**Solutions:**
```bash
# 1. Fix volume permissions
sudo chown -R 1000:1000 ./data

# 2. Check environment variables
docker exec api-doc-ia env | grep API_V2

# 3. Rebuild container
docker-compose build --no-cache
docker-compose up -d
```

### Volume Mount Issues

**Symptom:** Data not persisting or permission errors

**Solutions:**
```bash
# 1. Fix ownership
sudo chown -R $USER:$USER ./data

# 2. Use absolute paths in docker-compose.yml
volumes:
  - /absolute/path/to/data:/app/backend/data

# 3. Check SELinux (if applicable)
sudo setsebool -P container_manage_cgroup on
```

## 📊 Performance Issues

### Slow Processing

**Symptom:** Documents take very long to process

**Diagnosis:**
```bash
# Check system resources during processing
htop

# Monitor API v2 specific metrics
curl -H "Authorization: Bearer sk-your-key" \
  "http://localhost:8080/api/v2/health" | jq '.memory_usage'
```

**Solutions:**
1. **Optimize Parameters:**
   ```bash
   # Reduce chunk size for faster processing
   -F "chunk_size=800"
   
   # Skip embeddings for simple documents
   -F "bypass_embedding_and_retrieval=true"
   
   # Use lower token limits
   -F "max_tokens=1000"
   ```

2. **Hardware Optimization:**
   ```bash
   # Increase concurrent tasks (if CPU allows)
   export MAX_CONCURRENT_TASKS=8
   
   # Use SSD storage
   # Ensure sufficient RAM (8GB+ recommended)
   ```

3. **Model Optimization:**
   ```bash
   # Use faster models
   -F "model=llama3:8b"  # Instead of larger models
   ```

### Memory Issues

**Symptom:** Out of memory errors or system slowdown

**Solutions:**
```bash
# 1. Monitor memory usage
free -h
watch -n 1 "ps aux --sort=-%mem | head"

# 2. Reduce concurrent tasks
export MAX_CONCURRENT_TASKS=2

# 3. Clear tmp files regularly
find /tmp -name "*api_doc_ia*" -delete

# 4. Restart application periodically
# Add to cron for automatic restart
0 2 * * * /path/to/restart-api-doc-ia.sh
```

## 🔧 Client Demo Issues

### Demo Client Won't Start

**Symptom:** `python main.py` fails in client_demo

**Solutions:**
```bash
# 1. Install requirements
cd client_demo
pip install -r requirements.txt

# 2. Create config file
cp config.ini.template config.ini
# Edit config.ini with your API key

# 3. Check tkinter installation
python -c "import tkinter; print('OK')"
# If fails: sudo apt-get install python3-tk
```

### Connection Errors in Demo

**Symptom:** Demo shows connection failed

**Solutions:**
1. **Check Server URL:**
   - Ensure server is running on configured port
   - Test: `curl "http://localhost:8080/api/v2/health"`

2. **Verify API Key:**
   - Regenerate in admin interface
   - Update config.ini

3. **Check Firewall:**
   ```bash
   # Allow port 8080
   sudo ufw allow 8080
   ```

## 📋 Log Analysis

### Enable Debug Logging

```bash
# Set debug environment variables
export LOG_LEVEL=DEBUG
export API_V2_DEBUG=true

# Start with verbose logging
python -m open_webui.main --log-level DEBUG
```

### Important Log Locations

```bash
# Application logs
tail -f logs/api-doc-ia.log

# System logs
journalctl -u api-doc-ia -f

# Docker logs
docker logs -f api-doc-ia
```

### Log Patterns to Watch

**Successful Processing:**
```
INFO: Content extracted successfully
INFO: LLM processing completed
INFO: Task completed in X.XX seconds
```

**Problems:**
```
ERROR: Failed to extract content
WARNING: Model not available
ERROR: Authentication failed
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Review logs for error messages**
3. **Test with simple files first**
4. **Verify basic connectivity**

### Information to Include

When reporting issues, include:

```bash
# System information
uname -a
python --version
docker --version

# Api-Doc-IA version
git describe --tags

# Health check output
curl "http://localhost:8080/api/v2/health"

# Relevant log snippets
tail -50 logs/api-doc-ia.log

# Steps to reproduce
# Expected vs actual behavior
```

### Support Channels

1. **GitHub Issues**: For bugs and feature requests
2. **GitHub Discussions**: For questions and help
3. **Documentation**: Check [INSTALLATION.md](INSTALLATION.md) and [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

**Most issues can be resolved by following this guide systematically.** Start with the quick diagnosis, then work through the relevant sections based on your specific symptoms. 🔧
