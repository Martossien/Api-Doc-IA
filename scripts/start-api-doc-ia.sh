#!/bin/bash
# Script de démarrage générique Api-Doc-IA
# À adapter selon votre environnement

set -e

# Configuration par défaut - À MODIFIER
DEFAULT_PORT=8080
DEFAULT_HOST="0.0.0.0"
CONDA_ENV_NAME="api-doc-ia"  # Nom de votre environnement conda

echo "🚀 Démarrage Api-Doc-IA"

# Vérifier si conda est disponible
if command -v conda >/dev/null 2>&1; then
    echo "📦 Activation de l'environnement conda: $CONDA_ENV_NAME"
    eval "$(conda shell.bash hook)"
    conda activate "$CONDA_ENV_NAME" || {
        echo "❌ Erreur: Environnement conda '$CONDA_ENV_NAME' introuvable"
        echo "💡 Créez-le avec: conda create -n $CONDA_ENV_NAME python=3.11"
        exit 1
    }
else
    echo "⚠️  Conda non trouvé, utilisation de l'environnement Python par défaut"
fi

# Vérifier que le port est libre
if ss -tulpn | grep ":$DEFAULT_PORT " >/dev/null 2>&1; then
    echo "❌ Port $DEFAULT_PORT déjà utilisé"
    echo "💡 Arrêtez le service existant ou changez le port"
    exit 1
fi

# Configurer le PYTHONPATH pour utiliser le code local
export PYTHONPATH="$(pwd)/backend:$PYTHONPATH"

# Variables d'environnement essentielles
export WEBUI_AUTH=True
export API_V2_ENABLED=True

echo "✅ Démarrage du serveur sur http://$DEFAULT_HOST:$DEFAULT_PORT"
echo "📍 Code source: $(pwd)/backend"

# Démarrage du serveur
cd backend
python -m open_webui serve --host "$DEFAULT_HOST" --port "$DEFAULT_PORT"
