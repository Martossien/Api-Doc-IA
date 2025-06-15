#!/bin/bash
# Installation des dépendances Api-Doc-IA

set -e

echo "📦 Installation des dépendances Api-Doc-IA"

# Vérifier Python 3.11+
if ! python3 --version | grep -E "3\.(11|12)" >/dev/null; then
    echo "❌ Python 3.11+ requis"
    exit 1
fi

# Installer les dépendances Python
if [ -f "backend/requirements.txt" ]; then
    echo "📥 Installation des dépendances Python..."
    pip install -r backend/requirements.txt
else
    echo "❌ Fichier backend/requirements.txt introuvable"
    exit 1
fi

# Installer les dépendances Node.js si nécessaire
if [ -f "package.json" ]; then
    echo "📥 Installation des dépendances Node.js..."
    npm install
fi

echo "✅ Installation terminée!"
echo "💡 Lancez le serveur avec: ./scripts/start-api-doc-ia.sh"
