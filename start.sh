#!/bin/bash

export DATA_DIR=/home/admin_ia/Api-Doc-IA/backend/data

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

# =============================================================================
# PROXY DETECTION AND CONFIGURATION
# =============================================================================

detect_and_configure_proxy() {
    echo -e "${BLUE}🌐 Detecting proxy configuration...${NC}"
    
    # Check for existing proxy configuration
    PROXY_DETECTED=false
    CURRENT_HTTP_PROXY=""
    CURRENT_HTTPS_PROXY=""
    
    # Check environment variables
    if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ] || [ -n "$https_proxy" ] || [ -n "$HTTPS_PROXY" ]; then
        PROXY_DETECTED=true
        CURRENT_HTTP_PROXY="${http_proxy:-$HTTP_PROXY}"
        CURRENT_HTTPS_PROXY="${https_proxy:-$HTTPS_PROXY}"
        echo -e "${BLUE}   Proxy detected in environment variables${NC}"
        echo -e "${BLUE}   HTTP Proxy: ${CURRENT_HTTP_PROXY:-none}${NC}"
        echo -e "${BLUE}   HTTPS Proxy: ${CURRENT_HTTPS_PROXY:-none}${NC}"
    fi
    
    # Check system proxy settings (common locations)
    for proxy_file in "/etc/environment" "$HOME/.bashrc" "$HOME/.profile"; do
        if [ -f "$proxy_file" ] && grep -q -i "proxy" "$proxy_file" 2>/dev/null; then
            if ! $PROXY_DETECTED; then
                echo -e "${BLUE}   Proxy configuration found in: $proxy_file${NC}"
                PROXY_DETECTED=true
            fi
        fi
    done
    
    if $PROXY_DETECTED; then
        echo -e "${YELLOW}⚠️ Proxy detected - Configuring localhost exclusion for API tests${NC}"
        
        # Current NO_PROXY value
        CURRENT_NO_PROXY="${NO_PROXY:-$no_proxy}"
        
        # Required exclusions for Api-Doc-IA
        REQUIRED_EXCLUSIONS="127.0.0.1,localhost,0.0.0.0"
        
        # Build new NO_PROXY value
        if [ -z "$CURRENT_NO_PROXY" ]; then
            NEW_NO_PROXY="$REQUIRED_EXCLUSIONS"
        else
            # Check if already contains our exclusions
            if echo "$CURRENT_NO_PROXY" | grep -q "127.0.0.1" && echo "$CURRENT_NO_PROXY" | grep -q "localhost"; then
                echo -e "${GREEN}✅ Proxy exclusions already configured correctly${NC}"
                NEW_NO_PROXY="$CURRENT_NO_PROXY"
            else
                NEW_NO_PROXY="$CURRENT_NO_PROXY,$REQUIRED_EXCLUSIONS"
                echo -e "${BLUE}🔧 Adding localhost exclusions to NO_PROXY${NC}"
            fi
        fi
        
        # Export for this session
        export NO_PROXY="$NEW_NO_PROXY"
        export no_proxy="$NEW_NO_PROXY"
        
        echo -e "${GREEN}✅ NO_PROXY configured: $NEW_NO_PROXY${NC}"
        
        # Critical test for server startup
        echo -e "${BLUE}🧪 Testing proxy bypass for localhost...${NC}"
        if command -v curl >/dev/null 2>&1; then
            if curl -s --max-time 3 http://127.0.0.1:8080/ >/dev/null 2>&1 || [ $? -eq 7 ]; then
                echo -e "${GREEN}✅ Localhost access bypasses proxy correctly${NC}"
            else
                echo -e "${BLUE}💡 Localhost proxy bypass configured (server will test when running)${NC}"
            fi
        fi
        
    else
        echo -e "${GREEN}✅ No proxy detected - direct internet access${NC}"
    fi
    
    return 0
}

# =============================================================================
# PERIODIC GIT UPDATE VERIFICATION
# =============================================================================

check_periodic_git_updates() {
    # Configuration for update checks
    UPDATE_CHECK_FREQUENCY=${UPDATE_CHECK_FREQUENCY:-daily}  # daily, weekly, never
    UPDATE_CHECK_FILE="$PROJECT_ROOT/.last_update_check"
    
    # Skip if disabled
    if [ "$UPDATE_CHECK_FREQUENCY" = "never" ]; then
        return 0
    fi
    
    # Check if we should perform the check
    SHOULD_CHECK=false
    
    if [ ! -f "$UPDATE_CHECK_FILE" ]; then
        SHOULD_CHECK=true
    else
        LAST_CHECK=$(cat "$UPDATE_CHECK_FILE" 2>/dev/null || echo "0")
        CURRENT_TIME=$(date +%s)
        
        case "$UPDATE_CHECK_FREQUENCY" in
            "daily")
                CHECK_INTERVAL=$((24 * 3600))  # 24 hours
                ;;
            "weekly")
                CHECK_INTERVAL=$((7 * 24 * 3600))  # 7 days
                ;;
            *)
                CHECK_INTERVAL=$((24 * 3600))  # Default to daily
                ;;
        esac
        
        if [ $((CURRENT_TIME - LAST_CHECK)) -gt $CHECK_INTERVAL ]; then
            SHOULD_CHECK=true
        fi
    fi
    
    if ! $SHOULD_CHECK; then
        return 0
    fi
    
    echo -e "${BLUE}📦 Checking for project updates (periodic check)...${NC}"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${YELLOW}💡 Not a git repository - update check skipped${NC}"
        return 0
    fi
    
    # Quick network test
    if ! timeout 5 ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ No internet connectivity - update check skipped${NC}"
        return 0
    fi
    
    # Update timestamp
    echo "$(date +%s)" > "$UPDATE_CHECK_FILE"
    
    # Save current state
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo -e "${BLUE}   Current branch: $CURRENT_BRANCH${NC}"
    
    # Fetch latest changes (with short timeout for startup)
    echo -e "${BLUE}🔄 Fetching latest changes...${NC}"
    if timeout 15 git fetch origin 2>/dev/null; then
        # Check if we're behind
        BEHIND_COUNT=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
        
        if [ "$BEHIND_COUNT" -gt 0 ]; then
            echo -e "${YELLOW}📦 Updates available! $BEHIND_COUNT commits behind origin${NC}"
            echo -e "${YELLOW}💡 Consider updating after server shutdown${NC}"
            echo ""
            echo -e "${BLUE}Recent commits:${NC}"
            git log --oneline -3 origin/$CURRENT_BRANCH ^HEAD 2>/dev/null || true
            echo ""
            
            read -p "🔄 Update now (will restart server)? (y/N): " -n 1 -r UPDATE_CHOICE
            echo ""
            if [[ $UPDATE_CHOICE =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}🔄 Updating project...${NC}"
                if git pull origin "$CURRENT_BRANCH"; then
                    echo -e "${GREEN}✅ Project updated successfully${NC}"
                    echo -e "${BLUE}💡 Restarting server with latest version...${NC}"
                    sleep 2
                    exec "$0" "$@"  # Restart script with same arguments
                else
                    echo -e "${RED}❌ Update failed - continuing with current version${NC}"
                fi
            else
                echo -e "${BLUE}💡 Continuing with current version${NC}"
                echo -e "${YELLOW}💡 To update later: git pull && ./start.sh${NC}"
            fi
        else
            echo -e "${GREEN}✅ Project is up to date${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Could not fetch updates (timeout or network issue)${NC}"
    fi
    
    echo ""
    return 0
}

# =============================================================================
# INTELLIGENT DEPENDENCY AUTO-REPAIR
# =============================================================================

auto_repair_dependencies() {
    echo -e "${BLUE}🔧 Checking for missing dependencies...${NC}"
    
    # Critical dependencies for basic functionality
    CRITICAL_DEPS=("fastapi" "uvicorn" "pydantic" "sqlalchemy" "requests")
    MISSING_DEPS=()
    
    # Check each critical dependency
    for dep in "${CRITICAL_DEPS[@]}"; do
        if ! python -c "import $dep" 2>/dev/null; then
            MISSING_DEPS+=("$dep")
        fi
    done
    
    # Check for specific common issues
    
    # ChromaDB check
    if ! python -c "import chromadb" 2>/dev/null; then
        echo -e "${YELLOW}⚠️ ChromaDB import issue detected${NC}"
        MISSING_DEPS+=("chromadb")
    fi
    
    # OpenAI check (optional but common)
    if ! python -c "import openai" 2>/dev/null; then
        echo -e "${BLUE}💡 OpenAI library not found (optional)${NC}"
        MISSING_DEPS+=("openai")
    fi
    
    if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All critical dependencies are available${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}📦 Missing dependencies detected: ${MISSING_DEPS[*]}${NC}"
    echo -e "${BLUE}This can happen if:${NC}"
    echo -e "${BLUE}  - Virtual environment not activated${NC}"
    echo -e "${BLUE}  - Dependencies not fully installed${NC}"
    echo -e "${BLUE}  - Requirements.txt has been updated${NC}"
    echo ""
    
    read -p "🔧 Attempt automatic repair (install missing packages)? (Y/n): " -r REPAIR_CHOICE
    if [[ ! $REPAIR_CHOICE =~ ^[Nn]$ ]]; then
        echo -e "${BLUE}🔄 Installing missing dependencies...${NC}"
        
        # Prepare pip command
        REQUIREMENTS_FILE="$BACKEND_PATH/requirements.txt"
        
        if [ -f "$REQUIREMENTS_FILE" ]; then
            # Full requirements installation (safest)
            echo -e "${BLUE}📦 Reinstalling from requirements.txt (recommended)...${NC}"
            if python -m pip install -r "$REQUIREMENTS_FILE" --quiet --no-warn-script-location; then
                echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
                
                # Verify repair
                STILL_MISSING=()
                for dep in "${CRITICAL_DEPS[@]}"; do
                    if ! python -c "import $dep" 2>/dev/null; then
                        STILL_MISSING+=("$dep")
                    fi
                done
                
                if [ ${#STILL_MISSING[@]} -eq 0 ]; then
                    echo -e "${GREEN}✅ All critical dependencies now available${NC}"
                else
                    echo -e "${YELLOW}⚠️ Some dependencies still missing: ${STILL_MISSING[*]}${NC}"
                    echo -e "${YELLOW}💡 You may need to check your Python environment${NC}"
                fi
            else
                echo -e "${RED}❌ Failed to install dependencies${NC}"
                echo -e "${YELLOW}💡 Try manual installation: pip install -r $REQUIREMENTS_FILE${NC}"
            fi
        else
            # Individual package installation
            echo -e "${BLUE}📦 Installing individual packages...${NC}"
            for dep in "${MISSING_DEPS[@]}"; do
                echo -e "${BLUE}   Installing $dep...${NC}"
                if python -m pip install "$dep" --quiet --no-warn-script-location; then
                    echo -e "${GREEN}   ✅ $dep installed${NC}"
                else
                    echo -e "${RED}   ❌ Failed to install $dep${NC}"
                fi
            done
        fi
        
        echo ""
    else
        echo -e "${YELLOW}⚠️ Continuing with missing dependencies${NC}"
        echo -e "${YELLOW}💡 Server may fail to start properly${NC}"
        echo -e "${YELLOW}💡 To fix manually: pip install -r backend/requirements.txt${NC}"
    fi
    
    return 0
}

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
        # Initialize conda for this script (critical for environment detection)
        eval "$(conda shell.bash hook)" 2>/dev/null || true
        
        # ULTRA-ROBUST: Force conda activation FIRST, then detect
        # Source conda directly to ensure variables are available
        CONDA_BASE=$(conda info --base 2>/dev/null)
        if [ -n "$CONDA_BASE" ]; then
            source "$CONDA_BASE/etc/profile.d/conda.sh" 2>/dev/null || true
        fi
        
        # Now get environment from multiple sources
        ENV_FROM_VAR="${CONDA_DEFAULT_ENV:-base}"
        ENV_FROM_CMD=$(conda info --envs 2>/dev/null | grep '*' | awk '{print $1}' 2>/dev/null | head -1 || echo "base")
        ENV_FROM_INFO=$(conda info 2>/dev/null | grep "active environment" | awk '{print $4}' 2>/dev/null || echo "base")
        ENV_FROM_PROMPT=$(echo "$PS1" | grep -o '([^)]*)' | head -1 | sed 's/[()]//g' 2>/dev/null || echo "")
        
        # MOST RELIABLE: Parse from actual Python executable path
        PYTHON_PATH=$(which python 2>/dev/null || which python3 2>/dev/null || echo "")
        ENV_FROM_PYTHON=""
        if [ -n "$PYTHON_PATH" ] && echo "$PYTHON_PATH" | grep -q "/envs/"; then
            ENV_FROM_PYTHON=$(echo "$PYTHON_PATH" | grep -o '/envs/[^/]*' | cut -d'/' -f3)
        fi
        
        # FALLBACK: Parse from process environment if all else fails
        ENV_FROM_PROC=$(ps -p $$ -o command= 2>/dev/null | grep -o 'conda.*activate [^[:space:]]*' | awk '{print $NF}' || echo "")
        
        echo -e "${BLUE}   Debug: VAR='$ENV_FROM_VAR', CMD='$ENV_FROM_CMD', INFO='$ENV_FROM_INFO', PROMPT='$ENV_FROM_PROMPT', PYTHON='$ENV_FROM_PYTHON'${NC}"
        
        # Use the most reliable non-base source (priority order: PYTHON first!)
        CURRENT_ENV="$ENV_FROM_VAR"
        if [ "$CURRENT_ENV" = "base" ] && [ -n "$ENV_FROM_PYTHON" ] && [ "$ENV_FROM_PYTHON" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_PYTHON"
        fi
        if [ "$CURRENT_ENV" = "base" ] && [ "$ENV_FROM_CMD" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_CMD"
        fi
        if [ "$CURRENT_ENV" = "base" ] && [ "$ENV_FROM_INFO" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_INFO"
        fi
        if [ "$CURRENT_ENV" = "base" ] && [ -n "$ENV_FROM_PROMPT" ] && [ "$ENV_FROM_PROMPT" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_PROMPT"
        fi
        if [ "$CURRENT_ENV" = "base" ] && [ -n "$ENV_FROM_PROC" ] && [ "$ENV_FROM_PROC" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_PROC"
        fi
        
        echo -e "${BLUE}   Current conda environment: $CURRENT_ENV${NC}"
        
        # FLEXIBLE LOGIC: Handle ANY conda environment name
        if [ "$CURRENT_ENV" = "base" ]; then
            echo -e "${YELLOW}⚠️ Currently in 'base' environment${NC}"
            echo -e "${BLUE}💡 Recommended: Use a dedicated environment for Api-Doc-IA${NC}"
            
            # Look for common Api-Doc-IA environment names
            if conda env list | grep -q "api-doc-ia"; then
                echo -e "${BLUE}🔄 Found 'api-doc-ia' environment. Switch to it? (Y/n): ${NC}"
                read -r -t 10 SWITCH_CHOICE || SWITCH_CHOICE="Y"
                if [[ ! $SWITCH_CHOICE =~ ^[Nn]$ ]]; then
                    conda activate api-doc-ia
                    CURRENT_ENV="api-doc-ia"
                    echo -e "${GREEN}✅ Switched to 'api-doc-ia' environment${NC}"
                fi
            elif conda env list | grep -q "test-api-doc-ia"; then
                echo -e "${BLUE}🔄 Found 'test-api-doc-ia' environment. Switch to it? (Y/n): ${NC}"
                read -r -t 10 SWITCH_CHOICE || SWITCH_CHOICE="Y"
                if [[ ! $SWITCH_CHOICE =~ ^[Nn]$ ]]; then
                    conda activate test-api-doc-ia
                    CURRENT_ENV="test-api-doc-ia"
                    echo -e "${GREEN}✅ Switched to 'test-api-doc-ia' environment${NC}"
                fi
            fi
            
            # Final confirmation for base environment
            if [ "$CURRENT_ENV" = "base" ]; then
                echo -e "${YELLOW}⚠️ Continuing with 'base' environment${NC}"
                echo -e "${BLUE}💡 This may cause dependency conflicts. Continue anyway? (y/N): ${NC}"
                read -r -t 10 BASE_CHOICE || BASE_CHOICE="N"
                if [[ ! $BASE_CHOICE =~ ^[Yy]$ ]]; then
                    echo -e "${RED}❌ Aborted by user. Please activate a proper environment first.${NC}"
                    echo -e "${BLUE}💡 Example: conda activate your-environment${NC}"
                    exit 1
                fi
            fi
            USING_CONDA_ENV=true
        else
            # ANY non-base environment: Continue directly (no interruption for daily use)
            echo -e "${GREEN}✅ Using conda environment: '$CURRENT_ENV'${NC}"
            USING_CONDA_ENV=true
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
        --h11-max-incomplete-event-size 65536 \
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
    # Network and update checks (proxy detection + periodic git updates)
    detect_and_configure_proxy
    check_periodic_git_updates
    
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
    
    # Auto-repair missing dependencies if needed
    auto_repair_dependencies
    
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