#!/bin/bash

# =============================================================================
# 🚀 API-DOC-IA UNIVERSAL STARTUP SCRIPT
# =============================================================================
# Generic startup script that works across different environments
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_PATH="$PROJECT_ROOT/backend"
LOG_FILE="$PROJECT_ROOT/api_doc_ia.log"
PID_FILE="$PROJECT_ROOT/api_doc_ia.pid"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 API-DOC-IA STARTUP${NC}"
echo -e "${BLUE}============================================${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}⚠️ Shutting down...${NC}"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        kill $PID 2>/dev/null || true
        sleep 2
        kill -9 $PID 2>/dev/null || true
        rm -f "$PID_FILE"
    fi
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# =============================================================================
# ENVIRONMENT DETECTION
# =============================================================================

detect_python() {
    echo -e "${BLUE}🐍 Detecting Python environment...${NC}"
    
    # Check if conda is available and activated
    if command -v conda >/dev/null 2>&1; then
        CURRENT_ENV=$(conda info --envs | grep '*' | awk '{print $1}' 2>/dev/null || echo "base")
        echo -e "${BLUE}   Conda environment: $CURRENT_ENV${NC}"
        
        # Suggest activation if not in api-doc-ia environment
        if [ "$CURRENT_ENV" != "api-doc-ia" ] && conda env list | grep -q "api-doc-ia"; then
            echo -e "${YELLOW}💡 Tip: Consider using 'conda activate api-doc-ia' for optimal performance${NC}"
        fi
    fi
    
    # Check Python version
    PYTHON_VERSION=$(python --version 2>&1 || echo "Python not found")
    echo -e "${BLUE}   Python: $PYTHON_VERSION${NC}"
    
    # Verify Python 3.11+
    if ! python -c "import sys; assert sys.version_info >= (3, 11)" 2>/dev/null; then
        echo -e "${YELLOW}⚠️ Python 3.11+ recommended for best compatibility${NC}"
    fi
}

configure_pythonpath() {
    echo -e "${BLUE}📁 Configuring Python path...${NC}"
    
    # Set PYTHONPATH to use local code
    export PYTHONPATH="$BACKEND_PATH:$PYTHONPATH"
    
    # Verify we're using local code
    LOCAL_WEBUI=$(python -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')
try:
    import open_webui
    print(open_webui.__file__)
except ImportError as e:
    print('ERROR: ' + str(e))
" 2>/dev/null)
    
    if [[ "$LOCAL_WEBUI" == *"$BACKEND_PATH"* ]]; then
        echo -e "${GREEN}✅ Using local code: $LOCAL_WEBUI${NC}"
    else
        echo -e "${YELLOW}⚠️ May be using system installation: $LOCAL_WEBUI${NC}"
        echo -e "${YELLOW}   This is normal if you installed via pip${NC}"
    fi
}

check_api_v2() {
    echo -e "${BLUE}🔍 Checking API v2 module...${NC}"
    python -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')
try:
    from open_webui.routers import api_v2
    print('✅ API v2 module available')
except ImportError as e:
    print('❌ API v2 module not found:', str(e))
    sys.exit(1)
" || {
    echo -e "${RED}❌ API v2 not available. Please check installation.${NC}"
    exit 1
}
}

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================

echo -e "${BLUE}🔍 Pre-flight checks...${NC}"

# Check if we're in the right directory
if [ ! -f "$BACKEND_PATH/open_webui/main.py" ]; then
    echo -e "${RED}❌ Backend not found. Please run from project root directory.${NC}"
    echo -e "${YELLOW}   Expected: $BACKEND_PATH/open_webui/main.py${NC}"
    exit 1
fi

# Check for existing instances
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 $PID 2>/dev/null; then
        echo -e "${RED}❌ API-Doc-IA already running (PID: $PID)${NC}"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

# Check port 8080
if lsof -t -i:8080 2>/dev/null >/dev/null; then
    echo -e "${RED}❌ Port 8080 is already in use${NC}"
    echo -e "${YELLOW}💡 Stop other services or change port in configuration${NC}"
    exit 1
fi

# =============================================================================
# CONFIGURATION
# =============================================================================

detect_python
configure_pythonpath
check_api_v2

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${BLUE}📄 Loading .env configuration...${NC}"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
else
    echo -e "${YELLOW}💡 No .env file found, using defaults${NC}"
    echo -e "${YELLOW}   Copy .env.example to .env for custom configuration${NC}"
fi

# Set default environment variables
export WEBUI_AUTH=${WEBUI_AUTH:-true}
export API_V2_ENABLED=${API_V2_ENABLED:-true}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8080}
export LOG_LEVEL=${LOG_LEVEL:-INFO}

# =============================================================================
# STARTUP
# =============================================================================

echo -e "${GREEN}📊 STARTUP INFORMATION:${NC}"
echo -e "${GREEN}   🏠 Project: $PROJECT_ROOT${NC}"
echo -e "${GREEN}   🐍 Backend: $BACKEND_PATH${NC}"
echo -e "${GREEN}   📋 Logs: $LOG_FILE${NC}"
echo -e "${GREEN}   🌐 URL: http://localhost:${PORT}${NC}"
echo -e "${GREEN}   🔌 API v2: http://localhost:${PORT}/api/v2/health${NC}"
echo -e "${GREEN}   📖 Docs: http://localhost:${PORT}/docs${NC}"

# Create log file
echo "============================================" > "$LOG_FILE"
echo "API-DOC-IA STARTUP - $(date)" >> "$LOG_FILE"
echo "PROJECT_ROOT: $PROJECT_ROOT" >> "$LOG_FILE"
echo "PYTHONPATH: $PYTHONPATH" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

echo -e "${BLUE}🚀 Starting server...${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop${NC}"

# Change to project root for database paths
cd "$PROJECT_ROOT"

# Start server
python -m uvicorn open_webui.main:app \
    --host "$HOST" \
    --port "$PORT" \
    --reload \
    --reload-dir "$BACKEND_PATH/open_webui" \
    --log-level "$LOG_LEVEL" 2>&1 | tee -a "$LOG_FILE" &

SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"

# Wait for startup and test
sleep 5
if curl -s "http://localhost:${PORT}/api/v2/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API v2 is responding${NC}"
else
    echo -e "${YELLOW}⚠️ API v2 not ready yet (normal during startup)${NC}"
fi

echo -e "${GREEN}🎉 API-DOC-IA is ready!${NC}"

# Wait for process
wait $SERVER_PID