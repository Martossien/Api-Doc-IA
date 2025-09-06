#!/bin/bash

# =============================================================================
# 🚀 DÉMARRAGE RAPIDE API-DOC-IA (OPTIMISÉ)
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_PATH="$PROJECT_ROOT/backend"
LOG_FILE="$PROJECT_ROOT/api_doc_ia.log"
PID_FILE="$PROJECT_ROOT/api_doc_ia.pid"

export DATA_DIR=/home/admia/Api-Doc-IA/backend/data

echo -e "${PURPLE}============================================${NC}"
echo -e "${PURPLE}🚀 API-DOC-IA STARTUP (FAST MODE)${NC}"
echo -e "${PURPLE}============================================${NC}"

# Cleanup function
cleanup() {
    echo -e "\n⚠️ Shutting down..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        kill $PID 2>/dev/null || true
        sleep 2
        kill -9 $PID 2>/dev/null || true
        rm -f "$PID_FILE"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# =============================================================================
# DÉMARRAGE RAPIDE - SKIP VALIDATIONS LONGUES
# =============================================================================

echo -e "${BLUE}🐍 Activating environment (fast mode)...${NC}"

# Auto-activate pyenv/conda if available
if [ -d "/root/.pyenv/versions/api-doc-ia" ]; then
    echo -e "${BLUE}🔄 Activating pyenv api-doc-ia environment...${NC}"
    export PATH="/root/.pyenv/versions/api-doc-ia/bin:$PATH"
    export VIRTUAL_ENV="/root/.pyenv/versions/api-doc-ia"
    echo -e "${GREEN}✅ Python api-doc-ia environment activated${NC}"
elif command -v conda >/dev/null 2>&1; then
    eval "$(conda shell.bash hook)" 2>/dev/null || true
    if conda env list | grep -q "api-doc-ia"; then
        echo -e "${BLUE}🔄 Activating conda environment 'api-doc-ia'...${NC}"
        conda activate api-doc-ia 2>/dev/null || true
    fi
fi

# Quick Python path setup
export PYTHONPATH="$BACKEND_PATH:$PYTHONPATH"

# Load fast configuration
if [ -f "$PROJECT_ROOT/.env.fast_startup" ]; then
    set -a
    source "$PROJECT_ROOT/.env.fast_startup"
    set +a
else
    # Fallback defaults optimisés
    export ENABLE_SQLITE_VALIDATION=false
    export SKIP_ENVIRONMENT_DETECTION=false
    export LOG_LEVEL=info
fi

# Load main .env if exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Server environment (minimised)
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8080}"
export WEBUI_AUTH="${WEBUI_AUTH:-true}"
export API_V2_ENABLED="${API_V2_ENABLED:-true}"
# Force lowercase log level pour uvicorn
export LOG_LEVEL="info"

# Quick pre-flight checks ONLY
echo -e "${BLUE}🔍 Quick pre-flight checks...${NC}"

if [ ! -f "$BACKEND_PATH/open_webui/main.py" ]; then
    echo -e "❌ Backend source not found. Please run from project root."
    exit 1
fi

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 $PID 2>/dev/null; then
        echo -e "❌ API-Doc-IA already running (PID: $PID)"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

if lsof -t -i:8080 2>/dev/null >/dev/null; then
    echo -e "❌ Port 8080 is already in use"
    exit 1
fi

echo -e "${GREEN}✅ Pre-flight checks passed (fast mode)${NC}"

# =============================================================================
# START SERVER IMMEDIATELY
# =============================================================================

echo -e "${BLUE}🚀 Starting server (fast mode)...${NC}"

# Create minimal log header
echo "============================================" > "$LOG_FILE"
echo "API-DOC-IA FAST STARTUP - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

# Change to project root
cd "$PROJECT_ROOT"

# Start server with minimal validation - OPTIMISÉ POUR VITESSE
echo -e "${GREEN}🌐 Server starting at: http://localhost:${PORT}${NC}"
echo -e "${GREEN}📋 Logs: $LOG_FILE${NC}"
echo -e "${BLUE}⚡ Mode: NO RELOAD (production speed)${NC}"

# DÉMARRAGE ULTRA-RAPIDE: pas de reload, buffer H11 optimisé
python -m uvicorn open_webui.main:app \
    --host "$HOST" \
    --port "$PORT" \
    --h11-max-incomplete-event-size 65536 \
    --workers 1 \
    --access-log \
    --log-level "$LOG_LEVEL" 2>&1 | tee -a "$LOG_FILE" &

SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
echo -e "${PURPLE}🌸 Fast startup completed! Access: http://localhost:${PORT}${NC}"

# Wait for process
wait $SERVER_PID
