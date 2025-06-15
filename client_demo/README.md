# 🖥️ Client Demo Api-Doc-IA

Interface graphique de démonstration pour tester l'API v2 d'Api-Doc-IA.

## 🚀 Configuration rapide

1. **Copier le fichier de configuration :**
   ```bash
   cp config.ini.template config.ini
   ```

2. **Éditer la configuration :**
   ```bash
   nano config.ini
   ```
   
   Modifier :
   - `token = your-api-key-here` → votre clé API Api-Doc-IA
   - `url = your-server-url` → URL de votre serveur (ex: http://localhost:8080)

3. **Lancer l'application :**
   ```bash
   python main.py
   ```

## 📋 Prérequis

### Python et dépendances
```bash
# Python 3.8+ requis
pip install -r requirements.txt
```

### Serveur Api-Doc-IA
- Serveur Api-Doc-IA fonctionnel
- Clé API valide (créée via l'interface web)

## ⚙️ Configuration détaillée

Le fichier `config.ini` contient les sections suivantes :

### [server]
- `url` : URL du serveur Api-Doc-IA
- `token` : Clé API d'authentification

### [app]  
- `max_tokens` : Limite de tokens pour les réponses LLM
- `timeout` : Timeout des requêtes en secondes

### Exemple de configuration :
```ini
[server]
url = http://localhost:8080
token = sk-votre-cle-api-ici

[app]
max_tokens = 2000
timeout = 60
```

## 🎮 Utilisation

1. **Lancer l'application :** `python main.py`
2. **Vérifier la configuration :** Onglet "⚙️ Configuration"
3. **Tester la connexion :** Bouton "Test connexion"
4. **Uploader un fichier :** Bouton "📁 Parcourir..."
5. **Saisir un prompt :** Zone de texte "Prompt d'analyse"
6. **Analyser :** Bouton "🚀 ANALYSER"

## 🔧 Build en exécutable

### Linux
```bash
chmod +x build_linux.sh
./build_linux.sh
```

### Windows
```batch
build_windows.bat
```

Les exécutables sont générés dans le dossier `dist/`.

## 🔒 Sécurité

⚠️ **Important :** 
- Ne jamais commiter le fichier `config.ini` avec de vraies clés API
- Utiliser le fichier `config.ini.template` pour la distribution
- Le fichier `config.ini` est exclu par `.gitignore`
- Les répertoires `build/` et `dist/` sont temporaires et exclus

## 🐛 Dépannage

### Erreur de connexion
- Vérifiez l'URL du serveur
- Testez la clé API via l'interface web
- Vérifiez que le serveur Api-Doc-IA est démarré

### Erreur d'authentification
- Régénérez une nouvelle clé API
- Vérifiez le format : `sk-` suivi de 32 caractères

### Problème d'upload
- Vérifiez que le fichier fait moins de 50MB
- Formats supportés : PDF, DOCX, TXT, images, etc.

Pour plus d'aide, consultez les logs dans la console ou le fichier `demo_client.log`.
