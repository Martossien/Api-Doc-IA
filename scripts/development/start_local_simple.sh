#!/bin/bash

# =============================================================================
# 🚀 SCRIPT DE DEMARRAGE API-DOC-IA - VERSION SIMPLE
# =============================================================================
# Version simplifiée qui fonctionne si conda est déjà activé
# =============================================================================

set -e  # Arrêt en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration des chemins
PROJECT_ROOT="/home/admin_ia/api/Api-Doc-IA"
BACKEND_PATH="$PROJECT_ROOT/backend"
LOG_FILE="$PROJECT_ROOT/api_doc_ia_startup.log"
PID_FILE="$PROJECT_ROOT/api_doc_ia.pid"
LOCK_FILE="$PROJECT_ROOT/api_doc_ia.lock"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 DÉMARRAGE API-DOC-IA SIMPLE${NC}"
echo -e "${BLUE}============================================${NC}"

# Fonction de nettoyage en cas d'arrêt
cleanup() {
    echo -e "\n${YELLOW}⚠️ Arrêt en cours...${NC}"
    
    # Supprimer le verrouillage
    rm -f "$LOCK_FILE"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo -e "${YELLOW}🔄 Arrêt du processus $PID${NC}"
        kill $PID 2>/dev/null || true
        sleep 2
        
        # Force kill si nécessaire
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}🔄 Arrêt forcé...${NC}"
            kill -9 $PID 2>/dev/null || true
        fi
        
        rm -f "$PID_FILE"
    fi
    
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
    exit 0
}

# Capturer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# =============================================================================
# VÉRIFICATIONS RAPIDES
# =============================================================================

echo -e "${BLUE}🔍 Vérifications rapides...${NC}"

# Vérifier les instances existantes
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 $PID 2>/dev/null; then
        echo -e "${RED}❌ Instance déjà en cours (PID: $PID)${NC}"
        echo -e "${YELLOW}💡 Utilisez: ./stop_all_api_instances.sh${NC}"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

# Vérifier le port 8080
if lsof -t -i:8080 2>/dev/null >/dev/null; then
    echo -e "${RED}❌ Port 8080 déjà utilisé${NC}"
    echo -e "${YELLOW}💡 Utilisez: ./stop_all_api_instances.sh${NC}"
    exit 1
fi

# Vérifier que nous sommes dans le bon répertoire
cd "$PROJECT_ROOT" || {
    echo -e "${RED}❌ Impossible d'accéder au répertoire: $PROJECT_ROOT${NC}"
    exit 1
}

# Vérifier que le backend existe
if [ ! -f "$BACKEND_PATH/open_webui/main.py" ]; then
    echo -e "${RED}❌ Fichier main.py non trouvé: $BACKEND_PATH/open_webui/main.py${NC}"
    exit 1
fi

# Créer le fichier de verrouillage
echo $$ > "$LOCK_FILE"
echo -e "${GREEN}🔒 Verrouillage créé (PID: $$)${NC}"

# =============================================================================
# CONFIGURATION PYTHON
# =============================================================================

echo -e "${BLUE}🐍 Configuration Python...${NC}"

# Vérifier l'environnement conda
CURRENT_ENV=$(conda info --envs | grep '*' | awk '{print $1}' 2>/dev/null || echo "unknown")
echo -e "${BLUE}   Environnement conda actuel: $CURRENT_ENV${NC}"

if [ "$CURRENT_ENV" != "api-doc-ia" ]; then
    echo -e "${YELLOW}⚠️ Vous n'êtes pas dans l'environnement 'api-doc-ia'${NC}"
    echo -e "${YELLOW}💡 Activez d'abord: conda activate api-doc-ia${NC}"
    exit 1
fi

# Configuration du PYTHONPATH pour forcer l'utilisation du code local
echo -e "${BLUE}📁 Configuration du PYTHONPATH pour le code local...${NC}"
export PYTHONPATH="$BACKEND_PATH:$PYTHONPATH"

# Vérification que Python utilise bien notre code local
echo -e "${BLUE}🔍 Vérification du module Open WebUI utilisé...${NC}"
WEBUI_PATH=$(python -c "import open_webui; print(open_webui.__file__)" 2>/dev/null || echo "ERREUR")

if [[ "$WEBUI_PATH" == *"$BACKEND_PATH"* ]]; then
    echo -e "${GREEN}✅ Utilisation du code local: $WEBUI_PATH${NC}"
else
    echo -e "${RED}❌ ERREUR: Python utilise une autre version: $WEBUI_PATH${NC}"
    echo -e "${YELLOW}💡 Forçage du PYTHONPATH...${NC}"
    export PYTHONPATH="$BACKEND_PATH"
    # Nouvelle vérification
    WEBUI_PATH=$(python -c "import open_webui; print(open_webui.__file__)" 2>/dev/null || echo "ERREUR")
    if [[ "$WEBUI_PATH" == *"$BACKEND_PATH"* ]]; then
        echo -e "${GREEN}✅ Maintenant utilise le code local: $WEBUI_PATH${NC}"
    else
        echo -e "${RED}❌ ERREUR: Impossible de forcer l'utilisation du code local${NC}"
        echo -e "${YELLOW}   PYTHONPATH: $PYTHONPATH${NC}"
        echo -e "${YELLOW}   Module trouvé: $WEBUI_PATH${NC}"
        exit 1
    fi
fi

# Vérification de l'API v2
echo -e "${BLUE}🔍 Vérification de l'API v2...${NC}"
python -c "
try:
    from open_webui.routers import api_v2
    print('✅ Module API v2 trouvé')
except ImportError as e:
    print(f'❌ Module API v2 non trouvé: {e}')
    exit(1)
" || exit 1

# =============================================================================
# CONFIGURATION ET DÉMARRAGE
# =============================================================================

# Configuration des variables d'environnement
echo -e "${BLUE}⚙️ Configuration des variables d'environnement...${NC}"
export WEBUI_AUTH=True
export API_V2_ENABLED=True
export HOST=0.0.0.0
export PORT=8080
export WEBUI_LOG_LEVEL=INFO

# Création du fichier de log
echo -e "${BLUE}📝 Initialisation du fichier de log: $LOG_FILE${NC}"
echo "============================================" > "$LOG_FILE"
echo "API-DOC-IA STARTUP LOG - $(date)" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"
echo "PROJECT_ROOT: $PROJECT_ROOT" >> "$LOG_FILE"
echo "BACKEND_PATH: $BACKEND_PATH" >> "$LOG_FILE"
echo "PYTHONPATH: $PYTHONPATH" >> "$LOG_FILE"
echo "WEBUI_PATH: $WEBUI_PATH" >> "$LOG_FILE"
echo "CONDA_ENV: $CURRENT_ENV" >> "$LOG_FILE"
echo "PID: $$" >> "$LOG_FILE"
echo "============================================" >> "$LOG_FILE"

# Affichage des informations de démarrage
echo -e "${GREEN}📊 INFORMATIONS DE DÉMARRAGE:${NC}"
echo -e "${GREEN}   🏠 Projet: $PROJECT_ROOT${NC}"
echo -e "${GREEN}   🐍 Code Python: $BACKEND_PATH${NC}"
echo -e "${GREEN}   📋 Log file: $LOG_FILE${NC}"
echo -e "${GREEN}   🌐 URL: http://localhost:8080${NC}"
echo -e "${GREEN}   🔌 API v2: http://localhost:8080/api/v2/health${NC}"
echo -e "${GREEN}   📖 Docs: http://localhost:8080/docs${NC}"

# Démarrage du serveur avec uvicorn directement
echo -e "${BLUE}🚀 Démarrage du serveur...${NC}"
echo -e "${YELLOW}💡 Ctrl+C pour arrêter le serveur${NC}"

echo "" >> "$LOG_FILE"
echo "========== DÉMARRAGE SERVEUR $(date) ==========" >> "$LOG_FILE"

# S'assurer que le répertoire de travail est correct pour la base de données
cd "$PROJECT_ROOT"

# Commande de démarrage avec redirection vers le log
PYTHONPATH="$BACKEND_PATH" python -m uvicorn open_webui.main:app \
    --host 0.0.0.0 \
    --port 8080 \
    --reload \
    --reload-dir "$BACKEND_PATH/open_webui" \
    --log-level info 2>&1 | tee -a "$LOG_FILE" &

# Sauvegarder le PID
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo -e "${GREEN}✅ Serveur démarré (PID: $SERVER_PID)${NC}"
echo -e "${BLUE}📋 Les logs sont écrits dans: $LOG_FILE${NC}"

# Attendre quelques secondes puis tester
echo -e "${BLUE}⏳ Attente du démarrage complet...${NC}"
sleep 5

# Test de l'API v2
echo -e "${BLUE}🧪 Test de l'API v2...${NC}"
if curl -s http://localhost:8080/api/v2/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API v2 répond correctement${NC}"
else
    echo -e "${YELLOW}⚠️ API v2 ne répond pas encore (normal au démarrage)${NC}"
fi

echo -e "${GREEN}🎉 API-DOC-IA est prêt !${NC}"
echo -e "${BLUE}============================================${NC}"

# Attendre que le processus se termine (permet Ctrl+C)
wait $SERVER_PID

# Le cleanup sera appelé automatiquement par le trap