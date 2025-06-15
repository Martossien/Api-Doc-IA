#!/bin/bash

# =============================================================================
# 🔍 SCRIPT DE VÉRIFICATION D'ÉTAT API-DOC-IA
# =============================================================================
# Ce script vérifie l'état actuel du système et détecte les instances en cours
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
echo -e "${BLUE}🔍 VÉRIFICATION D'ÉTAT API-DOC-IA${NC}"
echo -e "${BLUE}============================================${NC}"

instances_found=false

# 1. Vérifier le fichier PID
echo -e "${BLUE}📋 Vérification du fichier PID...${NC}"
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 $PID 2>/dev/null; then
        echo -e "${GREEN}✅ Instance API-DOC-IA active (PID: $PID)${NC}"
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Commande inconnue")
        echo -e "   Commande: $PROCESS_CMD"
        instances_found=true
    else
        echo -e "${YELLOW}⚠️ Fichier PID obsolète (processus $PID n'existe plus)${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️ Aucun fichier PID trouvé${NC}"
fi

# 2. Vérifier le fichier de verrouillage
echo -e "${BLUE}🔒 Vérification du fichier de verrouillage...${NC}"
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$LOCK_PID" ]; then
        if kill -0 $LOCK_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Verrouillage actif (PID: $LOCK_PID)${NC}"
        else
            echo -e "${YELLOW}⚠️ Fichier de verrouillage obsolète (PID: $LOCK_PID)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Fichier de verrouillage vide${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️ Aucun fichier de verrouillage${NC}"
fi

# 3. Vérifier le port 8080
echo -e "${BLUE}🌐 Vérification du port 8080...${NC}"
if PORT_PIDS=$(lsof -t -i:8080 2>/dev/null); then
    echo -e "${GREEN}✅ Port 8080 utilisé${NC}"
    for PID in $PORT_PIDS; do
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Processus non trouvé")
        echo -e "   PID $PID: $PROCESS_CMD"
        instances_found=true
    done
else
    echo -e "${YELLOW}ℹ️ Port 8080 libre${NC}"
fi

# 4. Rechercher tous les processus Open WebUI
echo -e "${BLUE}🔍 Recherche des processus Open WebUI...${NC}"

# Processus uvicorn avec open_webui
UVICORN_PIDS=$(pgrep -f "uvicorn.*open_webui" 2>/dev/null || true)
if [ -n "$UVICORN_PIDS" ]; then
    echo -e "${GREEN}✅ Processus uvicorn Open WebUI trouvés:${NC}"
    for PID in $UVICORN_PIDS; do
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Processus non trouvé")
        echo -e "   PID $PID: $PROCESS_CMD"
        instances_found=true
    done
else
    echo -e "${YELLOW}ℹ️ Aucun processus uvicorn Open WebUI${NC}"
fi

# Processus open-webui (commande)
OPENWEBUI_PIDS=$(pgrep -f "open-webui" 2>/dev/null | grep -v $$ || true)
if [ -n "$OPENWEBUI_PIDS" ]; then
    echo -e "${GREEN}✅ Processus open-webui trouvés:${NC}"
    for PID in $OPENWEBUI_PIDS; do
        # Éviter les doublons avec uvicorn
        if echo "$UVICORN_PIDS" | grep -q "$PID"; then
            continue
        fi
        PROCESS_CMD=$(ps -p $PID -o cmd= 2>/dev/null || echo "Processus non trouvé")
        echo -e "   PID $PID: $PROCESS_CMD"
        instances_found=true
    done
fi

# 5. Vérifier les logs récents
echo -e "${BLUE}📋 Vérification des logs...${NC}"
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(wc -l < "$LOG_FILE")
    LOG_DATE=$(stat -c %y "$LOG_FILE" 2>/dev/null || echo "Date inconnue")
    echo -e "${GREEN}✅ Fichier de log présent ($LOG_SIZE lignes, modifié: $LOG_DATE)${NC}"
    
    # Afficher les dernières lignes si récentes
    if [ -n "$(find "$LOG_FILE" -mmin -60)" ]; then
        echo -e "${BLUE}📝 Dernières lignes du log (dernière heure):${NC}"
        tail -n 5 "$LOG_FILE" | sed 's/^/   /'
    fi
else
    echo -e "${YELLOW}ℹ️ Aucun fichier de log${NC}"
fi

# 6. Tester la connectivité
echo -e "${BLUE}🧪 Test de connectivité...${NC}"

# Test HTTP local
if curl -s --connect-timeout 3 http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Service répond sur http://localhost:8080/health${NC}"
else
    echo -e "${YELLOW}⚠️ Aucune réponse sur http://localhost:8080/health${NC}"
fi

# Test API v2
if curl -s --connect-timeout 3 http://localhost:8080/api/v2/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API v2 répond sur /api/v2/health${NC}"
    
    # Vérifier le contenu de la réponse
    RESPONSE=$(curl -s --connect-timeout 3 http://localhost:8080/api/v2/health 2>/dev/null)
    if echo "$RESPONSE" | grep -q '"status"'; then
        echo -e "${GREEN}   ✅ Réponse JSON valide${NC}"
    else
        echo -e "${RED}   ❌ Réponse non-JSON (problème SPAStaticFiles?)${NC}"
        echo -e "   Réponse: $(echo "$RESPONSE" | head -c 100)..."
    fi
else
    echo -e "${YELLOW}⚠️ API v2 ne répond pas${NC}"
fi

# 7. Vérifier l'environnement conda
echo -e "${BLUE}🐍 Vérification de l'environnement...${NC}"
if command -v conda >/dev/null 2>&1; then
    CURRENT_ENV=$(conda info --envs | grep '*' | awk '{print $1}' 2>/dev/null || echo "Aucun")
    echo -e "${BLUE}   Environnement conda actuel: $CURRENT_ENV${NC}"
    
    if [ "$CURRENT_ENV" = "api-doc-ia" ]; then
        echo -e "${GREEN}   ✅ Bon environnement conda${NC}"
    else
        echo -e "${YELLOW}   ⚠️ Environnement conda différent${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️ Conda non disponible${NC}"
fi

# 8. Vérifier le PYTHONPATH
if [ -n "$PYTHONPATH" ]; then
    echo -e "${BLUE}   PYTHONPATH: $PYTHONPATH${NC}"
    if echo "$PYTHONPATH" | grep -q "$PROJECT_ROOT/backend"; then
        echo -e "${GREEN}   ✅ PYTHONPATH pointe vers le code local${NC}"
    else
        echo -e "${YELLOW}   ⚠️ PYTHONPATH ne pointe pas vers le code local${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️ PYTHONPATH non défini${NC}"
fi

# 9. Résumé de l'état
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}📊 RÉSUMÉ DE L'ÉTAT${NC}"
echo -e "${BLUE}============================================${NC}"

if [ "$instances_found" = true ]; then
    echo -e "${GREEN}✅ API-DOC-IA semble être en cours d'exécution${NC}"
    echo -e "${BLUE}💡 Commandes utiles:${NC}"
    echo -e "${BLUE}   - Arrêter: ./stop_all_api_instances.sh${NC}"
    echo -e "${BLUE}   - Tester: ./test_api_startup.sh${NC}"
    echo -e "${BLUE}   - Redémarrer: ./stop_all_api_instances.sh && ./start_local_api_doc_ia_safe.sh${NC}"
else
    echo -e "${YELLOW}ℹ️ Aucune instance API-DOC-IA détectée${NC}"
    echo -e "${BLUE}💡 Commandes utiles:${NC}"
    echo -e "${BLUE}   - Démarrer: ./start_local_api_doc_ia_safe.sh${NC}"
    echo -e "${BLUE}   - Nettoyer avant démarrage: ./stop_all_api_instances.sh${NC}"
fi

echo -e "${BLUE}============================================${NC}"