#!/bin/bash

# =============================================================================
# 🚀 API-DOC-IA UNIVERSAL STARTUP SCRIPT (CORRECTED)
# =============================================================================
# Fixed: Auto-activate conda + use local source code
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
# ENVIRONMENT DETECTION AND AUTO-ACTIVATION
# =============================================================================

detect_and_activate_python() {
    echo -e "${BLUE}🐍 Detecting Python environment...${NC}"
    
    # Check if conda is available
    if command -v conda >/dev/null 2>&1; then
        # Initialize conda for this script
        eval "$(conda shell.bash hook)" 2>/dev/null || true
        
        CURRENT_ENV=$(conda info --envs | grep '*' | awk '{print $1}' 2>/dev/null || echo "base")
        echo -e "${BLUE}   Current conda environment: $CURRENT_ENV${NC}"
        
        # Auto-activate test-api-doc-ia environment if it exists and not active
        if [ "$CURRENT_ENV" != "test-api-doc-ia" ] && conda env list | grep -q "test-api-doc-ia"; then
            echo -e "${BLUE}🔄 Auto-activating conda environment 'test-api-doc-ia'...${NC}"
            
            conda activate test-api-doc-ia
            
            # Verify activation
            CURRENT_ENV=$(conda info --envs | grep '*' | awk '{print $1}' 2>/dev/null || echo "base")
            if [ "$CURRENT_ENV" = "test-api-doc-ia" ]; then
                echo -e "${GREEN}✅ Environment 'test-api-doc-ia' activated successfully${NC}"
                USING_CONDA_ENV=true
            else
                echo -e "${YELLOW}⚠️ Failed to activate environment, using current: $CURRENT_ENV${NC}"
                USING_CONDA_ENV=false
            fi
        elif [ "$CURRENT_ENV" = "test-api-doc-ia" ]; then
            echo -e "${GREEN}✅ Already using conda environment 'test-api-doc-ia'${NC}"
            USING_CONDA_ENV=true
        else
            echo -e "${YELLOW}⚠️ Using conda environment: $CURRENT_ENV${NC}"
            USING_CONDA_ENV=false
        fi
    else
        echo -e "${YELLOW}⚠️ Conda not found, using system Python${NC}"
        USING_CONDA_ENV=false
        
        # Check for virtual environment
        if [ -d "$PROJECT_ROOT/venv" ]; then
            echo -e "${BLUE}🔄 Activating virtual environment...${NC}"
            source "$PROJECT_ROOT/venv/bin/activate"
            if [ "$VIRTUAL_ENV" ]; then
                echo -e "${GREEN}✅ Virtual environment activated${NC}"
            fi
        fi
    fi
    
    # Display Python version
    PYTHON_VERSION=$(python --version 2>&1 || echo "Python not found")
    echo -e "${BLUE}   Python: $PYTHON_VERSION${NC}"
}

configure_pythonpath() {
    echo -e "${BLUE}📁 Configuring Python path for local source code...${NC}"
    
    # Set PYTHONPATH to use our fork's source code
    export PYTHONPATH="$BACKEND_PATH:$PYTHONPATH"
    
    # Verify we can import from our local code
    IMPORT_TEST=$(python -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')
try:
    # Test if we can import our local backend
    import os
    backend_path = '$BACKEND_PATH/open_webui'
    if os.path.exists(backend_path):
        print('✅ Local backend source found: $BACKEND_PATH/open_webui')
    else:
        print('❌ Local backend source not found: $BACKEND_PATH/open_webui')
        sys.exit(1)
        
    # Test basic imports that we need
    sys.path.insert(0, '$BACKEND_PATH')
    from open_webui import main
    print('✅ Can import main module')
    
except ImportError as e:
    print(f'❌ Import failed: {e}')
    sys.exit(1)
except Exception as e:
    print(f'❌ Unexpected error: {e}')
    sys.exit(1)
" 2>&1)
    
    echo -e "${BLUE}   $IMPORT_TEST${NC}"
    
    # Check if imports succeeded
    if echo "$IMPORT_TEST" | grep -q "❌"; then
        echo -e "${RED}❌ Failed to configure local source code${NC}"
        exit 1
    fi
}

check_dependencies() {
    echo -e "${BLUE}🔍 Checking essential dependencies...${NC}"
    
    python -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')

# Test core dependencies
try:
    import fastapi
    print('✅ FastAPI available')
except ImportError as e:
    print(f'❌ FastAPI not found: {e}')
    sys.exit(1)

try:
    import uvicorn
    print('✅ Uvicorn available')
except ImportError as e:
    print(f'❌ Uvicorn not found: {e}')
    sys.exit(1)

try:
    import sqlalchemy
    print('✅ SQLAlchemy available')
except ImportError as e:
    print(f'❌ SQLAlchemy not found: {e}')
    sys.exit(1)

# Test our local backend
try:
    from open_webui import main
    print('✅ Local backend main module available')
except ImportError as e:
    print(f'❌ Local backend main not found: {e}')
    sys.exit(1)

# Test if we can find the API v2 router
try:
    import os
    api_v2_path = '$BACKEND_PATH/open_webui/routers/api_v2.py'
    if os.path.exists(api_v2_path):
        print('✅ API v2 router file found')
        # Try to import it
        from open_webui.routers import api_v2
        print('✅ API v2 router module available')
    else:
        print('⚠️ API v2 router file not found (may need to be created)')
except ImportError as e:
    print(f'⚠️ API v2 router import issue: {e}')
    print('   This may be normal for a fresh setup')
except Exception as e:
    print(f'⚠️ API v2 check failed: {e}')

print('✅ Core dependencies check completed')
" || {
        echo -e "${RED}❌ Dependency check failed${NC}"
        exit 1
    }
}

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================

echo -e "${BLUE}🔍 Pre-flight checks...${NC}"

# Check if we're in the right directory
if [ ! -f "$BACKEND_PATH/open_webui/main.py" ]; then
    echo -e "${RED}❌ Backend source not found. Please run from project root directory.${NC}"
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
# ENVIRONMENT SETUP
# =============================================================================

detect_and_activate_python
configure_pythonpath
check_dependencies

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${BLUE}📄 Loading .env configuration...${NC}"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
else
    echo -e "${YELLOW}💡 No .env file found, using defaults${NC}"
fi

# Set default environment variables
export WEBUI_AUTH=${WEBUI_AUTH:-true}
export API_V2_ENABLED=${API_V2_ENABLED:-true}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8080}
export LOG_LEVEL="info"  # Force lowercase for uvicorn compatibility

# =============================================================================
# STARTUP INFORMATION
# =============================================================================

echo -e "${GREEN}📊 STARTUP INFORMATION:${NC}"
echo -e "${GREEN}   🏠 Project: $PROJECT_ROOT${NC}"
echo -e "${GREEN}   🐍 Backend: $BACKEND_PATH${NC}"
echo -e "${GREEN}   📋 Logs: $LOG_FILE${NC}"
echo -e "${GREEN}   🌐 URL: http://localhost:${PORT}${NC}"
echo -e "${GREEN}   🔌 API v2: http://localhost:${PORT}/api/v2/health${NC}"
echo -e "${GREEN}   📖 Docs: http://localhost:${PORT}/docs${NC}"

if [ "$USING_CONDA_ENV" = "true" ]; then
    echo -e "${GREEN}   🐍 Environment: conda (test-api-doc-ia)${NC}"
else
    echo -e "${YELLOW}   🐍 Environment: system Python${NC}"
fi

# Create log file
echo "============================================" > "$LOG_FILE"
echo "API-DOC-IA STARTUP - $(date)" >> "$LOG_FILE"
echo "PROJECT_ROOT: $PROJECT_ROOT" >> "$LOG_FILE"
echo "BACKEND_PATH: $BACKEND_PATH" >> "$LOG_FILE"
echo "PYTHONPATH: $PYTHONPATH" >> "$LOG_FILE"
echo "CONDA_DEFAULT_ENV: $CONDA_DEFAULT_ENV" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

# =============================================================================
# SERVER STARTUP
# =============================================================================

echo -e "${BLUE}🚀 Starting server...${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop${NC}"

# Change to project root for database paths
cd "$PROJECT_ROOT"

# Start server using our local backend code
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
if curl -s "http://localhost:${PORT}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is responding${NC}"
    
    # Test API v2 if available
    if curl -s "http://localhost:${PORT}/api/v2/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API v2 is responding${NC}"
    else
        echo -e "${YELLOW}⚠️ API v2 not available yet (may need configuration)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Server not ready yet (normal during startup)${NC}"
fi

echo -e "${GREEN}🎉 API-DOC-IA is starting up!${NC}"
echo -e "${BLUE}📋 Access the web interface at: http://localhost:${PORT}${NC}"

# Wait for process
wait $SERVER_PID