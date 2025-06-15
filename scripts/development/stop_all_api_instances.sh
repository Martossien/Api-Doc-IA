#!/bin/bash

# =============================================================================
# 🛑 SCRIPT D'ARRÊT COMPLET - TOUTES LES INSTANCES OPEN WEBUI
# =============================================================================
# Ce script arrête TOUTES les instances Open WebUI/API-DOC-IA en cours
# =============================================================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="/home/admin_ia/api/Api-Doc-IA"
PID_FILE="$PROJECT_ROOT/api_doc_ia.pid"
LOCK_FILE="$PROJECT_ROOT/api_doc_ia.lock"
LOG_FILE="$PROJECT_ROOT/api_doc_ia_startup.log"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🛑 ARRÊT COMPLET - TOUTES INSTANCES OPEN WEBUI${NC}"
echo -e "${BLUE}============================================${NC}"

# Fonction pour arrêter un processus avec timeout
kill_process_with_timeout() {
    local PID="$1"
    local NAME="$2"
    local TIMEOUT="${3:-10}"
    
    if ! kill -0 $PID 2>/dev/null; then
        echo -e "${YELLOW}⚠️ Le processus $NAME (PID: $PID) n'existe plus${NC}"
        return 0
    fi
    
    echo -e "${BLUE}🔄 Arrêt de $NAME (PID: $PID)...${NC}"
    
    # Tentative d'arrêt gracieux
    kill $PID 2>/dev/null || true
    
    # Attendre l'arrêt gracieux
    for i in $(seq 1 $TIMEOUT); do
        if ! kill -0 $PID 2>/dev/null; then
            echo -e "${GREEN}✅ $NAME arrêté gracieusement${NC}"
            return 0
        fi
        sleep 1
    done
    
    # Arrêt forcé si nécessaire
    echo -e "${YELLOW}⚠️ Arrêt forcé de $NAME...${NC}"
    kill -9 $PID 2>/dev/null || true
    
    # Vérification finale
    sleep 1
    if ! kill -0 $PID 2>/dev/null; then
        echo -e "${GREEN}✅ $NAME arrêté (forcé)${NC}"
        return 0
    else
        echo -e "${RED}❌ Échec de l'arrêt de $NAME${NC}"
        return 1
    fi
}

# Compter les instances trouvées
instances_count=0

echo -e "${BLUE}🔍 Recherche de toutes les instances Open WebUI...${NC}"

# 1. Arrêter par fichier PID du projet
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    echo -e "${BLUE}📋 Instance API-DOC-IA trouvée (PID: $PID)${NC}"
    if kill_process_with_timeout $PID "API-DOC-IA"; then
        instances_count=$((instances_count + 1))
    fi
    rm -f "$PID_FILE"
fi

# 2. Rechercher tous les processus uvicorn Open WebUI
echo -e "${BLUE}🔍 Recherche des processus uvicorn Open WebUI...${NC}"
WEBUI_PIDS=$(pgrep -f "uvicorn.*open_webui" 2>/dev/null || true)

if [ -n "$WEBUI_PIDS" ]; then
    for PID in $WEBUI_PIDS; do
        # Éviter de traiter le même PID deux fois
        if [ -f "$PID_FILE" ] && [ "$PID" = "$(cat "$PID_FILE" 2>/dev/null)" ]; then
            continue
        fi
        
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Processus non trouvé")
        echo -e "${BLUE}📋 Processus uvicorn trouvé (PID: $PID)${NC}"
        echo -e "   Commande: $PROCESS_CMD"
        
        if kill_process_with_timeout $PID "uvicorn Open WebUI"; then
            instances_count=$((instances_count + 1))
        fi
    done
else
    echo -e "${GREEN}✅ Aucun processus uvicorn Open WebUI trouvé${NC}"
fi

# 3. Rechercher les processus utilisant la commande 'open-webui'
echo -e "${BLUE}🔍 Recherche des processus open-webui (commande)...${NC}"
OPENWEBUI_PIDS=$(pgrep -f "open-webui" 2>/dev/null || true)

if [ -n "$OPENWEBUI_PIDS" ]; then
    for PID in $OPENWEBUI_PIDS; do
        # Éviter les doublons avec uvicorn
        if echo "$WEBUI_PIDS" | grep -q "$PID"; then
            continue
        fi
        
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Processus non trouvé")
        echo -e "${BLUE}📋 Processus open-webui trouvé (PID: $PID)${NC}"
        echo -e "   Commande: $PROCESS_CMD"
        
        if kill_process_with_timeout $PID "open-webui"; then
            instances_count=$((instances_count + 1))
        fi
    done
else
    echo -e "${GREEN}✅ Aucun processus open-webui trouvé${NC}"
fi

# 4. Vérifier le port 8080 (au cas où)
echo -e "${BLUE}🔍 Vérification du port 8080...${NC}"
PORT_PIDS=$(lsof -t -i:8080 2>/dev/null || true)

if [ -n "$PORT_PIDS" ]; then
    for PID in $PORT_PIDS; do
        # Éviter les doublons déjà traités
        if echo "$WEBUI_PIDS $OPENWEBUI_PIDS" | grep -q "$PID"; then
            continue
        fi
        
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Processus non trouvé")
        echo -e "${YELLOW}⚠️ Processus sur le port 8080 (PID: $PID)${NC}"
        echo -e "   Commande: $PROCESS_CMD"
        
        # Demander confirmation pour arrêter les processus non-Open WebUI
        if ! echo "$PROCESS_CMD" | grep -qi "open.webui\|uvicorn.*8080"; then
            read -p "Ce processus ne semble pas être Open WebUI. L'arrêter quand même? (y/N): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}⏭️ Processus ignoré${NC}"
                continue
            fi
        fi
        
        if kill_process_with_timeout $PID "processus port 8080"; then
            instances_count=$((instances_count + 1))
        fi
    done
else
    echo -e "${GREEN}✅ Port 8080 libre${NC}"
fi

# 5. Nettoyage des fichiers
echo -e "${BLUE}🧹 Nettoyage des fichiers...${NC}"

if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$LOCK_PID" ] && ! kill -0 $LOCK_PID 2>/dev/null; then
        echo -e "${BLUE}🗑️ Suppression du fichier de verrouillage obsolète${NC}"
        rm -f "$LOCK_FILE"
    elif [ -n "$LOCK_PID" ]; then
        echo -e "${YELLOW}⚠️ Fichier de verrouillage actif pour PID $LOCK_PID (déjà arrêté)${NC}"
        rm -f "$LOCK_FILE"
    fi
fi

if [ -f "$PID_FILE" ]; then
    echo -e "${BLUE}🗑️ Suppression du fichier PID${NC}"
    rm -f "$PID_FILE"
fi

# 6. Ajouter une entrée dans le log
if [ -f "$LOG_FILE" ]; then
    echo "" >> "$LOG_FILE"
    echo "========== ARRÊT COMPLET $(date) ==========" >> "$LOG_FILE"
    echo "Instances arrêtées: $instances_count" >> "$LOG_FILE"
fi

# 7. Vérification finale
echo -e "${BLUE}🔍 Vérification finale...${NC}"

# Re-vérifier le port
if lsof -t -i:8080 2>/dev/null >/dev/null; then
    echo -e "${RED}⚠️ Le port 8080 est encore utilisé${NC}"
    lsof -i:8080
else
    echo -e "${GREEN}✅ Port 8080 libre${NC}"
fi

# Re-vérifier les processus
REMAINING_WEBUI=$(pgrep -f "open.webui\|uvicorn.*open_webui" 2>/dev/null || true)
if [ -n "$REMAINING_WEBUI" ]; then
    echo -e "${RED}⚠️ Processus Open WebUI encore actifs:${NC}"
    for PID in $REMAINING_WEBUI; do
        echo -e "${RED}   PID $PID: $(ps -p $PID -o cmd= 2>/dev/null)${NC}"
    done
else
    echo -e "${GREEN}✅ Aucun processus Open WebUI restant${NC}"
fi

# Message final
echo -e "${BLUE}============================================${NC}"
if [ $instances_count -gt 0 ]; then
    echo -e "${GREEN}✅ $instances_count instance(s) Open WebUI arrêtée(s)${NC}"
else
    echo -e "${YELLOW}ℹ️ Aucune instance Open WebUI trouvée${NC}"
fi

# Vérification très finale
if ! lsof -t -i:8080 2>/dev/null >/dev/null && ! pgrep -f "open.webui\|uvicorn.*open_webui" >/dev/null 2>&1; then
    echo -e "${GREEN}🎉 Système propre - Prêt pour un nouveau démarrage${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️ Quelques processus peuvent persister${NC}"
    exit 1
fi