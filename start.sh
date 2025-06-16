#!/bin/bash

# =============================================================================
# 🚀 API-DOC-IA UNIVERSAL STARTUP SCRIPT (SECURE v2)
# =============================================================================
# Auto-activate conda + use local source code + custom SQLite support
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
echo -e "${BLUE}🚀 API-DOC-IA STARTUP (SECURE v2)${NC}"
echo -e "${BLUE}============================================${NC}"

# =============================================================================
# CONFIGURATION VARIABLES WITH SAFE DEFAULTS
# =============================================================================

# User-configurable options (can be overridden via environment)
: "${SQLITE_ENV_FILE:=$PROJECT_ROOT/.sqlite_env}"
: "${ENABLE_SQLITE_VALIDATION:=true}"
: "${SQLITE_FALLBACK_STRATEGY:=graceful}"  # graceful|strict|disabled
: "${CUSTOM_SQLITE_VALIDATION_TIMEOUT:=10}"
: "${SKIP_ENVIRONMENT_DETECTION:=false}"
: "${FORCE_SYSTEM_SQLITE:=false}"

# Internal state variables
USING_CONDA_ENV=false
USING_VENV=false
CUSTOM_SQLITE_LOADED=false
SQLITE_STATUS="unknown"
CHROMADB_STATUS="unknown"
PYTHON_VERSION=""

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
    
    # Skip if disabled
    if [ "$SKIP_ENVIRONMENT_DETECTION" = "true" ]; then
        echo -e "${YELLOW}💡 Environment detection skipped by configuration${NC}"
        PYTHON_VERSION=$(python --version 2>&1 || python3 --version 2>&1 || echo "Unknown")
        return 0
    fi
    
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
                USING_VENV=true
            fi
        fi
    fi
    
    # Display Python version
    PYTHON_VERSION=$(python --version 2>&1 || echo "Python not found")
    echo -e "${BLUE}   Python: $PYTHON_VERSION${NC}"
}

# =============================================================================
# SQLITE ENVIRONMENT DETECTION AND VALIDATION
# =============================================================================

load_sqlite_environment_safely() {
    echo -e "${BLUE}🔍 Loading SQLite environment configuration...${NC}"
    
    # Skip if force system SQLite
    if [ "$FORCE_SYSTEM_SQLITE" = "true" ]; then
        echo -e "${YELLOW}💡 Using system SQLite (forced by configuration)${NC}"
        CUSTOM_SQLITE_LOADED=false
        return 0
    fi
    
    # Check if custom SQLite environment file exists
    if [ -f "$SQLITE_ENV_FILE" ]; then
        echo -e "${BLUE}🔧 Loading custom SQLite environment...${NC}"
        
        # Validate environment file before loading
        if validate_sqlite_env_file "$SQLITE_ENV_FILE"; then
            # Load the environment
            source "$SQLITE_ENV_FILE"
            CUSTOM_SQLITE_LOADED=true
            
            echo -e "${GREEN}✅ Custom SQLite environment loaded${NC}"
            
            # Post-load validation if enabled
            if [ "$ENABLE_SQLITE_VALIDATION" = "true" ]; then
                validate_sqlite_environment
            else
                SQLITE_STATUS="loaded_not_validated"
            fi
        else
            echo -e "${YELLOW}⚠️ SQLite environment file invalid, using system defaults${NC}"
            CUSTOM_SQLITE_LOADED=false
            SQLITE_STATUS="invalid_env_file"
        fi
    else
        echo -e "${BLUE}💡 No custom SQLite environment found, using system SQLite${NC}"
        CUSTOM_SQLITE_LOADED=false
        SQLITE_STATUS="system_default"
    fi
    
    # Display current SQLite status
    display_sqlite_status
}

validate_sqlite_env_file() {
    local env_file="$1"
    
    # Basic file checks
    if [ ! -f "$env_file" ] || [ ! -r "$env_file" ]; then
        return 1
    fi
    
    # Check for required variables
    if ! grep -q "LD_LIBRARY_PATH" "$env_file" || ! grep -q "CUSTOM_SQLITE_COMPILED" "$env_file"; then
        return 1
    fi
    
    return 0
}

validate_sqlite_environment() {
    echo -e "${BLUE}🧪 Validating SQLite environment...${NC}"
    
    # Run validation with timeout to prevent hanging
    local validation_result
    validation_result=$(timeout "$CUSTOM_SQLITE_VALIDATION_TIMEOUT" python -c "
import sys
import signal

def timeout_handler(signum, frame):
    print('validation_timeout')
    sys.exit(1)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm($CUSTOM_SQLITE_VALIDATION_TIMEOUT)

try:
    import sqlite3
    version = sqlite3.sqlite_version
    print(f'sqlite_version:{version}')
    
    # Parse version for compatibility check
    version_parts = version.split('.')
    major, minor = int(version_parts[0]), int(version_parts[1])
    
    if major >= 3 and minor >= 35:
        print('sqlite_compatible:true')
    else:
        print('sqlite_compatible:false')
    
    # Test ChromaDB basic import
    try:
        import chromadb
        client = chromadb.Client()
        print('chromadb_status:ok')
    except ImportError:
        print('chromadb_status:not_installed')
    except Exception as e:
        if 'sqlite' in str(e).lower():
            print('chromadb_status:sqlite_error')
        else:
            print('chromadb_status:other_error')
    
    print('validation_status:success')
    
except ImportError as e:
    print(f'validation_status:import_error:{e}')
except Exception as e:
    print(f'validation_status:error:{e}')
finally:
    signal.alarm(0)  # Cancel the alarm
" 2>/dev/null || echo "validation_status:failed")
    
    # Parse validation results
    local sqlite_version="unknown"
    local sqlite_compatible="false"
    local chromadb_status="unknown"
    local validation_status="unknown"
    
    while IFS= read -r line; do
        case "$line" in
            sqlite_version:*) sqlite_version="${line#sqlite_version:}" ;;
            sqlite_compatible:*) sqlite_compatible="${line#sqlite_compatible:}" ;;
            chromadb_status:*) chromadb_status="${line#chromadb_status:}" ;;
            validation_status:*) validation_status="${line#validation_status:}" ;;
        esac
    done <<< "$validation_result"
    
    # Update global status variables
    SQLITE_STATUS="$validation_status"
    CHROMADB_STATUS="$chromadb_status"
    
    # Display results
    echo -e "${BLUE}   SQLite version: $sqlite_version${NC}"
    
    if [ "$sqlite_compatible" = "true" ]; then
        echo -e "${GREEN}   ✅ SQLite version compatible with ChromaDB${NC}"
    else
        echo -e "${YELLOW}   ⚠️ SQLite version may not be compatible with ChromaDB${NC}"
    fi
    
    case "$chromadb_status" in
        "ok")
            echo -e "${GREEN}   ✅ ChromaDB compatible and functional${NC}"
            ;;
        "sqlite_error")
            echo -e "${RED}   ❌ ChromaDB has SQLite compatibility issues${NC}"
            ;;
        "not_installed")
            echo -e "${YELLOW}   ⚠️ ChromaDB not yet installed${NC}"
            ;;
        *)
            echo -e "${YELLOW}   ⚠️ ChromaDB status unclear: $chromadb_status${NC}"
            ;;
    esac
    
    # Handle validation failures based on strategy
    if [ "$validation_status" != "success" ]; then
        case "$SQLITE_FALLBACK_STRATEGY" in
            "strict")
                echo -e "${RED}❌ SQLite validation failed in strict mode${NC}"
                return 1
                ;;
            "graceful")
                echo -e "${YELLOW}⚠️ SQLite validation failed, continuing with degraded functionality${NC}"
                CUSTOM_SQLITE_LOADED=false
                return 0
                ;;
            "disabled")
                echo -e "${BLUE}💡 SQLite validation disabled, continuing${NC}"
                return 0
                ;;
        esac
    fi
    
    return 0
}

display_sqlite_status() {
    echo -e "${BLUE}📊 SQLite Environment Status:${NC}"
    echo -e "${BLUE}   Custom SQLite loaded: $([ "$CUSTOM_SQLITE_LOADED" = "true" ] && echo "✅ Yes" || echo "❌ No")${NC}"
    echo -e "${BLUE}   SQLite status: $SQLITE_STATUS${NC}"
    echo -e "${BLUE}   ChromaDB status: $CHROMADB_STATUS${NC}"
}

# =============================================================================
# PYTHONPATH CONFIGURATION
# =============================================================================

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

# =============================================================================
# DEPENDENCY VERIFICATION
# =============================================================================

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

perform_preflight_checks() {
    echo -e "${BLUE}🔍 Pre-flight checks...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "$BACKEND_PATH/open_webui/main.py" ]; then
        echo -e "${RED}❌ Backend source not found. Please run from project root directory.${NC}"
        echo -e "${YELLOW}   Expected: $BACKEND_PATH/open_webui/main.py${NC}"
        return 1
    fi
    
    # Check for existing instances
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            echo -e "${RED}❌ API-Doc-IA already running (PID: $PID)${NC}"
            return 1
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    # Check port 8080
    if lsof -t -i:8080 2>/dev/null >/dev/null; then
        echo -e "${RED}❌ Port 8080 is already in use${NC}"
        echo -e "${YELLOW}💡 Stop other services or change port in configuration${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Pre-flight checks passed${NC}"
    return 0
}

# =============================================================================
# SERVER ENVIRONMENT PREPARATION
# =============================================================================

prepare_server_environment() {
    echo -e "${BLUE}🔧 Preparing server environment...${NC}"
    
    # Ensure custom SQLite is available for the server process
    if [ "$CUSTOM_SQLITE_LOADED" = "true" ]; then
        echo -e "${BLUE}   Activating custom SQLite for server process...${NC}"
        
        # Re-validate environment one more time if validation is enabled
        if [ "$ENABLE_SQLITE_VALIDATION" = "true" ]; then
            if ! validate_sqlite_environment >/dev/null 2>&1; then
                echo -e "${YELLOW}   ⚠️ SQLite validation failed, falling back to system${NC}"
                
                # Reset environment variables to use system SQLite
                unset LD_LIBRARY_PATH LD_PRELOAD
                CUSTOM_SQLITE_LOADED=false
                SQLITE_STATUS="fallback_to_system"
            fi
        fi
    fi
    
    # Load environment variables from .env file
    if [ -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${BLUE}📄 Loading .env configuration...${NC}"
        set -a
        source "$PROJECT_ROOT/.env"
        set +a
    else
        echo -e "${YELLOW}💡 No .env file found, using defaults${NC}"
    fi
    
    # Set server environment variables with fallbacks
    export HOST="${HOST:-0.0.0.0}"
    export PORT="${PORT:-8080}"
    export WEBUI_AUTH="${WEBUI_AUTH:-true}"
    export API_V2_ENABLED="${API_V2_ENABLED:-true}"
    export LOG_LEVEL="info"  # Force lowercase for uvicorn compatibility
    
    # Add SQLite environment status to server environment
    if [ "$CUSTOM_SQLITE_LOADED" = "true" ]; then
        export SQLITE_ENV_STATUS="custom"
        export CUSTOM_SQLITE_ACTIVE="true"
    else
        export SQLITE_ENV_STATUS="system"
        export CUSTOM_SQLITE_ACTIVE="false"
    fi
    
    echo -e "${GREEN}✅ Server environment prepared${NC}"
}

# =============================================================================
# SERVER STARTUP AND MONITORING
# =============================================================================

start_server_with_monitoring() {
    echo -e "${BLUE}🚀 Starting server with monitoring...${NC}"
    echo -e "${YELLOW}💡 Press Ctrl+C to stop${NC}"
    
    # Create log file with startup information
    echo "============================================" > "$LOG_FILE"
    echo "API-DOC-IA STARTUP - $(date)" >> "$LOG_FILE"
    echo "PROJECT_ROOT: $PROJECT_ROOT" >> "$LOG_FILE"
    echo "BACKEND_PATH: $BACKEND_PATH" >> "$LOG_FILE"
    echo "PYTHONPATH: $PYTHONPATH" >> "$LOG_FILE"
    echo "CONDA_DEFAULT_ENV: ${CONDA_DEFAULT_ENV:-not_set}" >> "$LOG_FILE"
    echo "CUSTOM_SQLITE_LOADED: $CUSTOM_SQLITE_LOADED" >> "$LOG_FILE"
    echo "SQLITE_STATUS: $SQLITE_STATUS" >> "$LOG_FILE"
    echo "CHROMADB_STATUS: $CHROMADB_STATUS" >> "$LOG_FILE"
    echo "============================================" >> "$LOG_FILE"
    
    # Change to project root for database paths
    cd "$PROJECT_ROOT"
    
    # Start server using our local backend code
    if ! python -m uvicorn open_webui.main:app \
        --host "$HOST" \
        --port "$PORT" \
        --reload \
        --reload-dir "$BACKEND_PATH/open_webui" \
        --log-level "$LOG_LEVEL" 2>&1 | tee -a "$LOG_FILE" &
    then
        echo -e "${RED}❌ Failed to start server${NC}"
        return 1
    fi
    
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
    
    # Wait and validate startup
    validate_server_startup
}

validate_server_startup() {
    echo -e "${BLUE}🧪 Validating server startup...${NC}"
    
    # Wait for startup
    sleep 5
    
    # Test basic connectivity
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
}

# =============================================================================
# STARTUP INFORMATION DISPLAY
# =============================================================================

display_startup_information() {
    echo -e "${GREEN}📊 STARTUP INFORMATION:${NC}"
    echo -e "${GREEN}   🏠 Project: $PROJECT_ROOT${NC}"
    echo -e "${GREEN}   🐍 Backend: $BACKEND_PATH${NC}"
    echo -e "${GREEN}   📋 Logs: $LOG_FILE${NC}"
    echo -e "${GREEN}   🌐 URL: http://localhost:${PORT}${NC}"
    echo -e "${GREEN}   🔌 API v2: http://localhost:${PORT}/api/v2/health${NC}"
    echo -e "${GREEN}   📖 Docs: http://localhost:${PORT}/docs${NC}"
    
    # Environment information
    if [ "$USING_CONDA_ENV" = "true" ]; then
        echo -e "${GREEN}   🐍 Environment: conda (test-api-doc-ia)${NC}"
    elif [ "$USING_VENV" = "true" ]; then
        echo -e "${GREEN}   🐍 Environment: virtual environment${NC}"
    else
        echo -e "${YELLOW}   🐍 Environment: system Python${NC}"
    fi
    
    # SQLite information
    if [ "$CUSTOM_SQLITE_LOADED" = "true" ]; then
        echo -e "${GREEN}   💾 SQLite: Custom compiled (ChromaDB optimized) ✅${NC}"
    else
        echo -e "${YELLOW}   💾 SQLite: System default${NC}"
        if [ "$SQLITE_STATUS" = "fallback_to_system" ]; then
            echo -e "${YELLOW}       (Fallback: custom SQLite validation failed)${NC}"
        fi
    fi
    
    # ChromaDB status
    case "$CHROMADB_STATUS" in
        "ok")
            echo -e "${GREEN}   🔍 ChromaDB: Fully functional ✅${NC}"
            ;;
        "sqlite_error")
            echo -e "${RED}   🔍 ChromaDB: SQLite compatibility issues ⚠️${NC}"
            ;;
        "not_installed")
            echo -e "${YELLOW}   🔍 ChromaDB: Not yet installed ⚠️${NC}"
            ;;
        *)
            echo -e "${YELLOW}   🔍 ChromaDB: Status unclear (${CHROMADB_STATUS}) ⚠️${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 API-DOC-IA is starting up!${NC}"
    echo -e "${BLUE}📋 Access the web interface at: http://localhost:${PORT}${NC}"
    echo ""
}

# =============================================================================
# MAIN STARTUP FLOW
# =============================================================================

main() {
    # Pre-flight checks
    if ! perform_preflight_checks; then
        exit 1
    fi
    
    # Environment detection and activation
    detect_and_activate_python
    
    # Python path configuration
    configure_pythonpath
    
    # SQLite environment loading and validation
    load_sqlite_environment_safely
    
    # Dependency checks
    check_dependencies
    
    # Server environment preparation
    prepare_server_environment
    
    # Display startup information
    display_startup_information
    
    # Start server with monitoring
    start_server_with_monitoring
    
    # Wait for process
    wait $SERVER_PID
}

# =============================================================================
# EXECUTION
# =============================================================================

# Run main startup sequence
main "$@"