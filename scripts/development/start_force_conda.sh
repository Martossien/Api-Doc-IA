#!/bin/bash

# =============================================================================
# 🚀 SCRIPT DE DEMARRAGE API-DOC-IA - FORCE CONDA
# =============================================================================
# Ce script force l'activation de l'environnement conda api-doc-ia
# =============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/home/admin_ia/api/Api-Doc-IA"
BACKEND_PATH="$PROJECT_ROOT/backend"
LOG_FILE="$PROJECT_ROOT/api_doc_ia_startup.log"
PID_FILE="$PROJECT_ROOT/api_doc_ia.pid"
LOCK_FILE="$PROJECT_ROOT/api_doc_ia.lock"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 DÉMARRAGE API-DOC-IA FORCE CONDA${NC}"
echo -e "${BLUE}============================================${NC}"

# Force conda environment
echo -e "${BLUE}🔧 Configuration forcée de l'environnement conda...${NC}"
export CONDA_DEFAULT_ENV="api-doc-ia"
export PATH="/home/admin_ia/.conda/envs/api-doc-ia/bin:$PATH"
export PYTHONPATH="$BACKEND_PATH:$PYTHONPATH"

# Vérifications
echo -e "${BLUE}🔍 Vérifications...${NC}"
echo -e "${BLUE}   CONDA_DEFAULT_ENV: $CONDA_DEFAULT_ENV${NC}"
echo -e "${BLUE}   Python: $(which python)${NC}"
echo -e "${BLUE}   PYTHONPATH: $PYTHONPATH${NC}"

# Nettoyage fonction
cleanup() {
    echo -e "\n${YELLOW}⚠️ Arrêt en cours...${NC}"
    rm -f "$LOCK_FILE"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        kill $PID 2>/dev/null || true
        sleep 2
        kill -9 $PID 2>/dev/null || true
        rm -f "$PID_FILE"
    fi
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Vérifications existantes
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 $PID 2>/dev/null; then
        echo -e "${RED}❌ Instance déjà en cours (PID: $PID)${NC}"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

if lsof -t -i:8080 2>/dev/null >/dev/null; then
    echo -e "${RED}❌ Port 8080 déjà utilisé${NC}"
    exit 1
fi

# Lock
echo $$ > "$LOCK_FILE"

# Test import
echo -e "${BLUE}🔍 Test d'import API v2...${NC}"
cd "$PROJECT_ROOT"
python -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')
try:
    from open_webui.routers import api_v2
    print('✅ Module API v2 importé avec succès')
except Exception as e:
    print(f'❌ Erreur import: {e}')
    sys.exit(1)
" || exit 1

# Configuration env
export WEBUI_AUTH=True
export API_V2_ENABLED=True
export HOST=0.0.0.0
export PORT=8080

# Log
echo "============================================" > "$LOG_FILE"
echo "API-DOC-IA STARTUP LOG - $(date)" >> "$LOG_FILE"
echo "CONDA_DEFAULT_ENV: $CONDA_DEFAULT_ENV" >> "$LOG_FILE"
echo "PYTHON: $(which python)" >> "$LOG_FILE"
echo "PYTHONPATH: $PYTHONPATH" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

# Démarrage
echo -e "${BLUE}🚀 Démarrage du serveur...${NC}"
echo -e "${GREEN}   🌐 URL: http://localhost:8080${NC}"
echo -e "${GREEN}   🔌 API v2: http://localhost:8080/api/v2/health${NC}"
echo -e "${YELLOW}💡 Ctrl+C pour arrêter${NC}"

cd "$PROJECT_ROOT"
python -m uvicorn open_webui.main:app \
    --host 0.0.0.0 \
    --port 8080 \
    --reload \
    --reload-dir "$BACKEND_PATH/open_webui" \
    --log-level info 2>&1 | tee -a "$LOG_FILE" &

SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo -e "${GREEN}✅ Serveur démarré (PID: $SERVER_PID)${NC}"

# Test rapide
sleep 5
if curl -s http://localhost:8080/api/v2/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API v2 répond${NC}"
else
    echo -e "${YELLOW}⚠️ API v2 pas encore prête${NC}"
fi

echo -e "${GREEN}🎉 API-DOC-IA prêt !${NC}"

# Attendre
wait $SERVER_PID