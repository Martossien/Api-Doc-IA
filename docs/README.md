# Api-Doc-IA Documentation

> Complete documentation hub for Api-Doc-IA document processing system

## 📚 Documentation Index

### 🚀 Getting Started

| Document | Description | Audience |
|----------|-------------|-----------|
| **[README.md](../README.md)** | Project overview and quick start | Everyone |
| **[INSTALLATION.md](../INSTALLATION.md)** | Detailed setup instructions | Developers, Admins |
| **[API_DOCUMENTATION.md](../API_DOCUMENTATION.md)** | Complete API reference | API Users, Developers |

### 🏗️ Technical Documentation

| Document | Description | Audience |
|----------|-------------|-----------|
| **[ARCHITECTURE.md](../ARCHITECTURE.md)** | Technical deep dive and design decisions | Developers, Architects |
| **[CONTRIBUTING.md](../CONTRIBUTING.md)** | Development guidelines and processes | Contributors |
| **[SECURITY.md](../SECURITY.md)** | Security policies and best practices | Security Teams, Admins |

### 📋 Project Information

| Document | Description | Audience |
|----------|-------------|-----------|
| **[CHANGELOG.md](../CHANGELOG.md)** | Version history and release notes | Everyone |
| **[TESTS_API_V2_FORMATS_RAPPORT.md](../TESTS_API_V2_FORMATS_RAPPORT.md)** | Comprehensive testing report | QA, Developers |

## 🎯 Documentation by Use Case

### For API Integration

1. **Start here**: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
2. **Authentication**: [SECURITY.md](../SECURITY.md#authentication--authorization)
3. **Error handling**: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md#error-handling)
4. **Examples**: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md#usage-examples)

### For System Administration

1. **Installation**: [INSTALLATION.md](../INSTALLATION.md)
2. **Security**: [SECURITY.md](../SECURITY.md)
3. **Monitoring**: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md#monitoring--performance)

### For Development

1. **Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md)
2. **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)
3. **Testing**: [TESTS_API_V2_FORMATS_RAPPORT.md](../TESTS_API_V2_FORMATS_RAPPORT.md)

## 📖 Quick Reference

### Key Features

- **Multi-format processing**: PDF, DOCX, DOC, TXT, XLS, images
- **OCR integration**: Extract text from PDF images
- **Native Open WebUI integration**: 95% infrastructure reuse
- **Production-ready API**: RESTful endpoints with authentication
- **Real-time monitoring**: Health checks and progress tracking

### API Endpoints

```bash
POST /api/v2/process      # Upload and process documents
GET  /api/v2/status/{id}  # Check processing status
GET  /api/v2/models       # List available models
GET  /api/v2/health       # System health check
GET  /api/v2/config       # Configuration and limits
```

### Quick Start

```bash
# 1. Install and start
./start_with_local_code.sh

# 2. Generate API key (Admin → Settings → API v2)

# 3. Process document
curl -X POST "http://localhost:8080/api/v2/process" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "file=@document.pdf" \
  -F "prompt=Analyze this document"
```

## 🔗 External Resources

### Open WebUI Foundation

- **[Open WebUI GitHub](https://github.com/open-webui/open-webui)** - Base project
- **[Open WebUI Documentation](https://docs.openwebui.com/)** - Core features

### Technical Standards

- **[FastAPI Documentation](https://fastapi.tiangolo.com/)** - API framework
- **[Pydantic Documentation](https://docs.pydantic.dev/)** - Data validation
- **[SvelteKit Documentation](https://kit.svelte.dev/)** - Frontend framework

---

**This documentation is maintained by the Api-Doc-IA community.** 📚✨