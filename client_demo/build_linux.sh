#!/bin/bash

echo "============================================="
echo "  Api-Doc-IA Demo Client - Build Linux"
echo "============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction d'erreur
error_exit() {
    echo -e "${RED}❌ ERREUR: $1${NC}" >&2
    exit 1
}

# Fonction de succès
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction d'info
info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction d'avertissement
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Configuration manuelle du proxy
echo ""
echo -e "${CYAN}🌐 CONFIGURATION PROXY (Environnement d'entreprise)${NC}"
echo ""
echo "Si vous êtes derrière un proxy d'entreprise, configurez-le MAINTENANT :"
echo ""
echo "Pour configurer un proxy, ouvrez un NOUVEAU terminal et tapez :"
echo "  export HTTP_PROXY=http://proxy.entreprise.com:8080"
echo "  export HTTPS_PROXY=http://proxy.entreprise.com:8080"
echo ""
echo "Puis relancez ce script depuis ce nouveau terminal."
echo ""

read -p "Êtes-vous derrière un proxy d'entreprise ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}🔧 Configuration manuelle du proxy :${NC}"
    echo ""
    read -p "Entrez l'URL du proxy (ex: http://proxy:8080) ou ENTER si déjà configuré: " MANUAL_PROXY
    
    if [ ! -z "$MANUAL_PROXY" ]; then
        export HTTP_PROXY="$MANUAL_PROXY"
        export HTTPS_PROXY="$MANUAL_PROXY"
        success_msg "Proxy configuré pour cette session: $MANUAL_PROXY"
    else
        info_msg "Utilisation des variables d'environnement existantes"
    fi
else
    info_msg "Continuation sans proxy"
fi

# Affichage de la configuration actuelle
echo ""
echo -e "${BLUE}📋 CONFIGURATION ACTUELLE :${NC}"
if [ ! -z "$HTTP_PROXY" ]; then
    echo "  HTTP_PROXY: $HTTP_PROXY"
else
    echo "  HTTP_PROXY: Non défini"
fi
if [ ! -z "$HTTPS_PROXY" ]; then
    echo "  HTTPS_PROXY: $HTTPS_PROXY"
else
    echo "  HTTPS_PROXY: Non défini"
fi
echo ""

# Vérification de Python
echo -e "${YELLOW}[1/4] Vérification de Python...${NC}"
if ! command -v python3 &> /dev/null; then
    error_exit "Python 3 n'est pas installé ou pas dans le PATH"
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
info_msg "Python détecté: v$PYTHON_VERSION"

# Vérification de pip
if ! command -v pip3 &> /dev/null; then
    error_exit "pip3 n'est pas installé"
fi

# Installation des dépendances
echo -e "${YELLOW}[2/4] Installation des dépendances...${NC}"
if [ ! -z "$HTTP_PROXY" ]; then
    info_msg "Utilisation du proxy: $HTTP_PROXY"
    pip3 install --proxy $HTTP_PROXY -r requirements.txt
else
    pip3 install -r requirements.txt
fi

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ ERREUR: Échec de l'installation des dépendances${NC}"
    echo ""
    echo -e "${YELLOW}💡 Si vous êtes derrière un proxy, essayez :${NC}"
    echo -e "${YELLOW}   1. Ouvrir un nouveau terminal${NC}"
    echo -e "${YELLOW}   2. Taper : export HTTP_PROXY=http://votre-proxy:port${NC}"
    echo -e "${YELLOW}   3. Taper : export HTTPS_PROXY=http://votre-proxy:port${NC}"
    echo -e "${YELLOW}   4. Relancer ce script${NC}"
    echo ""
    echo -e "${YELLOW}💡 Ou contactez votre administrateur réseau${NC}"
    exit 1
fi
success_msg "Dépendances installées"

# Installation de PyInstaller
echo -e "${YELLOW}[3/4] Installation de PyInstaller...${NC}"
if [ ! -z "$HTTP_PROXY" ]; then
    pip3 install --proxy $HTTP_PROXY pyinstaller
else
    pip3 install pyinstaller
fi

if [ $? -ne 0 ]; then
    error_exit "Échec de l'installation de PyInstaller"
fi
success_msg "PyInstaller installé"

# Création de l'exécutable
echo -e "${YELLOW}[4/4] Création de l'exécutable...${NC}"

# Vérification de l'icône
BUILD_CMD="pyinstaller --onefile --console --name=apidocia-demo main.py"

if [ -f "icon.ico" ]; then
    info_msg "Icône trouvée, ajout à l'exécutable..."
    BUILD_CMD="pyinstaller --onefile --console --icon=icon.ico --name=apidocia-demo main.py"
else
    info_msg "Pas d'icône trouvée, build sans icône..."
fi

# Exécution du build
eval $BUILD_CMD
if [ $? -ne 0 ]; then
    warning_msg "Échec avec icône, tentative sans icône..."
    pyinstaller --onefile --console --name=apidocia-demo main.py
    if [ $? -ne 0 ]; then
        error_exit "Échec définitif de la création de l'exécutable"
    fi
fi
success_msg "Exécutable créé"

# Vérification du résultat
if [ -f "dist/apidocia-demo" ]; then
    success_msg "BUILD RÉUSSI!"
    echo ""
    echo -e "${GREEN}📁 Exécutable créé: dist/apidocia-demo${NC}"
    
    # Informations sur le fichier
    FILE_SIZE=$(du -h dist/apidocia-demo | cut -f1)
    echo -e "${BLUE}📊 Taille: $FILE_SIZE${NC}"
    
    # Rendre exécutable
    chmod +x dist/apidocia-demo
    echo -e "${GREEN}🔧 Permissions d'exécution accordées${NC}"
    
    echo ""
    echo -e "${YELLOW}💡 Vous pouvez maintenant distribuer le fichier:${NC}"
    echo -e "${BLUE}   ./dist/apidocia-demo${NC}"
    echo ""
    
    # Test de démarrage rapide
    echo -e "${YELLOW}🧪 Test de démarrage (5s)...${NC}"
    timeout 5s ./dist/apidocia-demo --help > /dev/null 2>&1
    if [ $? -eq 0 ] || [ $? -eq 124 ]; then
        success_msg "Test de démarrage réussi"
    else
        echo -e "${YELLOW}⚠️  Attention: Test de démarrage échoué (peut être normal)${NC}"
    fi
    
else
    error_exit "L'exécutable n'a pas été créé"
fi

echo "============================================="
success_msg "Build terminé avec succès!"
echo "============================================="