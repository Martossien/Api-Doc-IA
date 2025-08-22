#!/bin/bash

# =============================================================================
# 🛑 API-DOC-IA STOP SCRIPT (ENHANCED)
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
PID_FILE="$PROJECT_ROOT/api_doc_ia.pid"
LOG_FILE="$PROJECT_ROOT/api_doc_ia.log"

# Default port (will be overridden if found in environment)
PORT="8080"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🛑 API-DOC-IA STOP SCRIPT${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to check if port is in use
check_port_available() {
    local port=${1:-8080}
    if lsof -t -i:$port 2>/dev/null >/dev/null; then
        echo -e "${RED}❌ Port $port is still in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to check for remaining processes
check_remaining_processes() {
    echo -e "${BLUE}🔍 Checking for remaining API-DOC-IA processes...${NC}"
    
    # Check for uvicorn processes related to open_webui
    UVICORN_PIDS=$(pgrep -f "uvicorn.*open_webui" 2>/dev/null || true)
    
    # Check for any python processes from our project
    PYTHON_PIDS=$(pgrep -f "python.*$PROJECT_ROOT" 2>/dev/null || true)
    
    # Check for any processes with our log file
    LOG_PIDS=$(pgrep -f "$LOG_FILE" 2>/dev/null || true)
    
    # Combine and deduplicate
    ALL_PIDS=$(echo -e "$UVICORN_PIDS
$PYTHON_PIDS
$LOG_PIDS" | grep -v "^$" | sort -u 2>/dev/null || true)
    
    if [ -n "$ALL_PIDS" ]; then
        echo -e "${YELLOW}⚠️ Found remaining processes:${NC}"
        echo "$ALL_PIDS" | while read pid; do
            if [ -n "$pid" ]; then
                CMDLINE=$(ps -p $pid -o args= 2>/dev/null || echo "unknown")
                echo -e "${BLUE}   PID: $pid - $CMDLINE${NC}"
            fi
        done
        return 0  # Always return 0 to avoid breaking the script
    else
        echo -e "${GREEN}✅ No remaining API-DOC-IA processes found${NC}"
        return 0
    fi
}

# Enhanced cleanup function to handle all related processes
cleanup_all_processes() {
    echo -e "${BLUE}🔍 Searching for all API-DOC-IA related processes...${NC}"
    
    # Find all processes related to API-Doc-IA
    UVICORN_PIDS=$(pgrep -f "uvicorn.*open_webui" 2>/dev/null || true)
    PYTHON_PIDS=$(pgrep -f "python.*$PROJECT_ROOT" 2>/dev/null || true)
    LOG_PIDS=$(pgrep -f "$LOG_FILE" 2>/dev/null || true)
    
    # Combine and deduplicate PIDs
    ALL_PIDS=$(echo -e "$UVICORN_PIDS
$PYTHON_PIDS
$LOG_PIDS" | grep -v "^$" | sort -u 2>/dev/null || true)
    
    if [ -z "$ALL_PIDS" ]; then
        echo -e "${GREEN}✅ No API-DOC-IA processes found${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ Found running processes:${NC}"
        echo "$ALL_PIDS" | while read pid; do
            if [ -n "$pid" ]; then
                CMDLINE=$(ps -p $pid -o args= 2>/dev/null || echo "unknown")
                echo -e "${BLUE}   PID: $pid - $CMDLINE${NC}"
            fi
        done
        
        echo -e "${BLUE}🔧 Stopping all processes...${NC}"
        
        # Send SIGTERM first
        echo "$ALL_PIDS" | while read pid; do
            if [ -n "$pid" ]; then
                echo -e "${BLUE}   Sending SIGTERM to PID: $pid${NC}"
                kill $pid 2>/dev/null || true
            fi
        done
        
        # Wait a bit for graceful shutdown
        echo -e "${BLUE}⏳ Waiting for graceful shutdown (5 seconds)...${NC}"
        sleep 5
        
        # Check if any processes are still running and send SIGKILL
        STILL_RUNNING=false
        echo "$ALL_PIDS" | while read pid; do
            if [ -n "$pid" ] && kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}⚠️ Force killing PID: $pid${NC}"
                kill -9 $pid 2>/dev/null || true
                STILL_RUNNING=true
            fi
        done
        
        # Additional wait after force kill
        if [ "$STILL_RUNNING" = "true" ]; then
            echo -e "${BLUE}⏳ Waiting after force kill (2 seconds)...${NC}"
            sleep 2
        fi
        
        # Final verification
        FAILED=false
        echo "$ALL_PIDS" | while read pid; do
            if [ -n "$pid" ] && kill -0 $pid 2>/dev/null; then
                echo -e "${RED}❌ Failed to stop process: $pid${NC}"
                FAILED=true
            else
                echo -e "${GREEN}✅ Stopped process: $pid${NC}"
            fi
        done
        
        # Always return 0 to avoid breaking the script
        return 0
    fi
}

# Try to get port from environment or .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    # Try to extract port from .env file
    ENV_PORT=$(grep -E "^PORT=" "$PROJECT_ROOT/.env" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    if [ -n "$ENV_PORT" ]; then
        PORT="$ENV_PORT"
    fi
fi

# Also check for PORT in current environment
if [ -n "$PORT" ] && [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo -e "${BLUE}🌐 Configured port: $PORT${NC}"
else
    echo -e "${YELLOW}⚠️ Using default port: $PORT${NC}"
fi

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️ No PID file found. Performing comprehensive process search...${NC}"
    cleanup_all_processes
    
    # Final verification
    echo -e "${BLUE}🔍 Final verification...${NC}"
    check_remaining_processes
    check_port_available "$PORT"
    
    exit 0
fi

# Read PID from file
PID=$(cat "$PID_FILE")
echo -e "${BLUE}📜 Found PID: $PID${NC}"

# Check if process is running
if ! kill -0 $PID 2>/dev/null; then
    echo -e "${YELLOW}⚠️ Process $PID is not running${NC}"
    rm -f "$PID_FILE"
    
    # Still do a comprehensive cleanup to catch any orphaned processes
    cleanup_all_processes
    
    # Final verification
    echo -e "${BLUE}🔍 Final verification...${NC}"
    check_remaining_processes
    check_port_available "$PORT"
    
    exit 0
fi

# Graceful shutdown
echo -e "${BLUE}🔄 Sending SIGTERM to main process $PID...${NC}"
kill $PID 2>/dev/null || true

# Wait for graceful shutdown
echo -e "${BLUE}⏳ Waiting for graceful shutdown (10 seconds)...${NC}"
for i in {1..10}; do
    if ! kill -0 $PID 2>/dev/null; then
        echo -e "${GREEN}✅ Main process stopped gracefully${NC}"
        rm -f "$PID_FILE"
        
        # Perform comprehensive cleanup for any child processes
        cleanup_all_processes
        
        # Final verification
        echo -e "${BLUE}🔍 Final verification...${NC}"
        check_remaining_processes
        check_port_available "$PORT"
        
        exit 0
    fi
    sleep 1
done

# Force kill if still running
echo -e "${YELLOW}⚠️ Main process still running, sending SIGKILL...${NC}"
kill -9 $PID 2>/dev/null || true

# Verify main process is stopped
if ! kill -0 $PID 2>/dev/null; then
    echo -e "${GREEN}✅ Main process stopped${NC}"
    rm -f "$PID_FILE"
else
    echo -e "${RED}❌ Failed to stop main process $PID${NC}"
    exit 1
fi

# Perform comprehensive cleanup for any remaining processes
cleanup_all_processes

# Final verification
echo -e "${BLUE}🔍 Final verification...${NC}"
check_remaining_processes
check_port_available "$PORT"

exit 0