#!/bin/bash

# =============================================================================
# 🛑 API-DOC-IA STOP SCRIPT
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

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🛑 API-DOC-IA STOP SCRIPT${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️ No PID file found. Checking for running processes...${NC}"
    
    # Find processes related to API-Doc-IA
    PIDS=$(pgrep -f "uvicorn.*open_webui" 2>/dev/null || true)
    
    if [ -z "$PIDS" ]; then
        echo -e "${GREEN}✅ No API-DOC-IA processes found${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️ Found running processes:${NC}"
        echo "$PIDS"
        echo -e "${BLUE}🔧 Stopping processes...${NC}"
        
        # Kill processes
        echo "$PIDS" | xargs kill 2>/dev/null || true
        sleep 2
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        
        echo -e "${GREEN}✅ Processes stopped${NC}"
        exit 0
    fi
fi

# Read PID from file
PID=$(cat "$PID_FILE")
echo -e "${BLUE}📜 Found PID: $PID${NC}"

# Check if process is running
if ! kill -0 $PID 2>/dev/null; then
    echo -e "${YELLOW}⚠️ Process $PID is not running${NC}"
    rm -f "$PID_FILE"
    exit 0
fi

# Graceful shutdown
echo -e "${BLUE}🔄 Sending SIGTERM to process $PID...${NC}"
kill $PID 2>/dev/null || true

# Wait for graceful shutdown
echo -e "${BLUE}⏳ Waiting for graceful shutdown (10 seconds)...${NC}"
for i in {1..10}; do
    if ! kill -0 $PID 2>/dev/null; then
        echo -e "${GREEN}✅ Process stopped gracefully${NC}"
        rm -f "$PID_FILE"
        exit 0
    fi
    sleep 1
done

# Force kill if still running
echo -e "${YELLOW}⚠️ Process still running, sending SIGKILL...${NC}"
kill -9 $PID 2>/dev/null || true

# Verify process is stopped
if ! kill -0 $PID 2>/dev/null; then
    echo -e "${GREEN}✅ Process stopped${NC}"
    rm -f "$PID_FILE"
else
    echo -e "${RED}❌ Failed to stop process $PID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API-DOC-IA stopped successfully${NC}"