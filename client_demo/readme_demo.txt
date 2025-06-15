=====================================================
           API-DOC-IA DEMO CLIENT v1.0
          Client GUI de Démonstration
=====================================================

🎯 OBJECTIF
-----------
Cette application permet de démontrer les capacités 
d'Api-Doc-IA en analysant des documents avec l'IA
via une interface simple et intuitive.

📋 PRÉREQUIS
------------
• Api-Doc-IA serveur en fonctionnement sur localhost:8080
• Documents à analyser (PDF, DOCX, DOC, TXT)
• Connexion réseau locale

🚀 DÉMARRAGE RAPIDE
-------------------

=== EXÉCUTABLE (RECOMMANDÉ) ===
1. Lancez ApiDocIA-Demo.exe (Windows) ou ./apidocia-demo (Linux)
2. L'application se lance automatiquement

=== CODE SOURCE ===
1. Installez Python 3.8+ : https://python.org/downloads
2. Installez les dépendances : pip install -r requirements.txt
3. Lancez l'application : python main.py

🎮 UTILISATION
--------------

ÉTAPE 1 - SÉLECTION DU FICHIER
• Cliquez sur "Parcourir..." pour choisir un document
• Formats supportés : PDF, DOCX, DOC, TXT, MD, CSV, XLSX, XLS, PPT, PPTX, RTF, XML, JSON, RST, EPUB, MP3, WAV, M4A
• Taille max : 50MB

ÉTAPE 2 - PERSONNALISATION DU PROMPT
• Modifiez le texte dans la zone "Prompt d'analyse"
• Exemples de prompts efficaces :
  - "Résume ce document en 3 points clés"
  - "Extrais les informations importantes"
  - "Analyse ce contrat et identifie les risques"
  - "Traduis ce document en français"

ÉTAPE 3 - LANCEMENT DE L'ANALYSE
• Cliquez sur le bouton "🚀 ANALYSER"
• Suivez la progression dans la barre de statut
• Le résultat s'affiche dans la zone inférieure

⚙️ CONFIGURATION
----------------

ACCÈS AUX PARAMÈTRES
• Cliquez sur l'icône ⚙️ en haut à droite
• Fenêtre de configuration serveur

PARAMÈTRES DISPONIBLES
• URL Serveur : http://localhost:8080 (par défaut)
• Token API : Votre clé d'authentification
• Test de connexion disponible

FICHIER DE CONFIGURATION
• config.ini créé automatiquement
• Sauvegarde automatique des paramètres
• Éditable manuellement si nécessaire

🔧 RÉSOLUTION DE PROBLÈMES
--------------------------

CONFIGURATION PROXY (PREMIÈRE INSTALLATION)
⚠️  IMPORTANT: Configurez le proxy AVANT la première installation !

• Windows : 
  1. Ouvrir invite de commande
  2. set HTTP_PROXY=http://proxy:8080
  3. set HTTPS_PROXY=http://proxy:8080
  4. Lancer build_scripts\build_windows.bat

• Linux :
  1. Ouvrir terminal  
  2. export HTTP_PROXY=http://proxy:8080
  3. export HTTPS_PROXY=http://proxy:8080
  4. Lancer ./build_scripts/build_linux.sh

• Consultez PROXY_SETUP.md pour le guide détaillé

ERREUR "URLLIB3 METHOD_WHITELIST"
• Corrigé automatiquement : compatibilité toutes versions
• L'application détecte et s'adapte à urllib3 1.25.x ou 1.26.x+
• Fallback vers session basique en cas d'échec

ERREUR "LOST SYS.STDIN" 
• Corrigé : utilisation de --console au lieu de --windowed
• L'exécutable garde une console pour éviter ce problème
• Gestion d'erreurs avec messagebox tkinter en secours

ERREUR "CONNEXION REFUSÉE"
• Vérifiez qu'Api-Doc-IA est démarré sur le serveur
• Vérifiez l'URL dans les paramètres (⚙️)
• Testez la connexion depuis les paramètres

ERREUR "TOKEN INVALIDE"
• Vérifiez le token API dans les paramètres
• Demandez un nouveau token à l'administrateur
• Format attendu : sk-xxxxxxxxxxxxxxxx

ERREUR "FICHIER NON SUPPORTÉ"
• Formats acceptés : PDF, DOCX, DOC, TXT, MD, CSV, XLSX, XLS, PPT, PPTX, RTF, XML, JSON, RST, EPUB, MP3, WAV, M4A
• Vérifiez la taille : maximum 50MB
• Essayez avec un autre fichier

ANALYSE BLOQUÉE
• Attendez jusqu'à 60 secondes maximum
• Cliquez sur "Annuler" si nécessaire
• Redémarrez l'application en cas de problème

INTERFACE QUI NE RÉPOND PLUS
• L'analyse s'effectue en arrière-plan
• Attendez la fin du traitement
• Ne fermez pas l'application pendant l'analyse

📁 STRUCTURE DES FICHIERS
-------------------------

demo_client/
├── main.py                 ← Application principale
├── config.ini              ← Configuration (auto-créé)
├── requirements.txt        ← Dépendances Python
├── README_DEMO.txt         ← Ce fichier
├── PROXY_SETUP.md          ← Guide configuration proxy
├── icon.ico                ← Icône (optionnel)
├── demo_client.log         ← Journal d'activité
├── build_scripts/
│   ├── build_windows.bat   ← Build Windows (avec support proxy)
│   └── build_linux.sh      ← Build Linux (avec support proxy)
└── dist/
    ├── ApiDocIA-Demo.exe   ← Exécutable Windows
    └── apidocia-demo       ← Exécutable Linux

🏗️ COMPILATION (DÉVELOPPEURS)
------------------------------

⚠️  PRÉREQUIS PROXY
Si vous êtes en entreprise derrière un proxy, consultez d'abord
PROXY_SETUP.md pour configurer correctement votre environnement.

WINDOWS
• Configurez le proxy (si nécessaire) :
  set HTTP_PROXY=http://proxy:8080
  set HTTPS_PROXY=http://proxy:8080
• Exécutez : build_scripts/build_windows.bat
• Le script détecte automatiquement la configuration
• Résultat : dist/ApiDocIA-Demo.exe

LINUX
• Configurez le proxy (si nécessaire) :
  export HTTP_PROXY=http://proxy:8080
  export HTTPS_PROXY=http://proxy:8080
• Rendez exécutable : chmod +x build_scripts/build_linux.sh
• Exécutez : ./build_scripts/build_linux.sh
• Le script détecte automatiquement la configuration
• Résultat : dist/apidocia-demo

PRÉREQUIS BUILD
• Python 3.8+
• PyInstaller (installé automatiquement)
• Toutes les dépendances (requirements.txt)
• Configuration proxy si nécessaire

📊 PERFORMANCES
---------------

TEMPS DE RÉPONSE TYPIQUES
• Upload fichier (5MB) : 2-5 secondes
• Analyse document simple : 10-30 secondes
• Analyse document complexe : 30-60 secondes

UTILISATION MÉMOIRE
• Application : ~50-100MB RAM
• Pendant analyse : +20-50MB temporaire

LIMITATIONS
• 1 analyse simultanée maximum
• Timeout à 60 secondes
• Fichiers jusqu'à 50MB

🎨 FONCTIONNALITÉS AVANCÉES
---------------------------

ROBUSTESSE RÉSEAU
• Détection automatique version urllib3
• Compatibilité urllib3 v1.25.x et v1.26.x+
• Retry automatique avec backoff exponentiel
• Fallback gracieux vers session basique
• Timeouts configurables et gestion d'erreurs

SUPPORT PROXY ENTREPRISE
• Détection automatique des paramètres système
• Configuration manuelle interactive
• Test de connectivité intégré
• Support Windows (registre) et Linux (GNOME)

INTERFACE
• Redimensionnement automatique
• Auto-scroll des résultats
• Barres de progression temps réel
• Messages de statut détaillés

ROBUSTESSE
• Retry automatique sur erreurs réseau
• Gestion des timeouts
• Validation des entrées
• Logs détaillés

UX/UI
• Raccourcis clavier standard (Ctrl+C, Ctrl+V)
• Feedback visuel en temps réel
• Messages d'erreur explicites
• Interface responsive

📞 SUPPORT
----------

LOGS
• Fichier : demo_client.log
• Contient tous les détails techniques
• À fournir en cas de problème

CONTACT TECHNIQUE
• Vérifiez d'abord les logs
• Testez avec un document simple
• Notez les messages d'erreur exacts

DOCUMENTATION API
• Api-Doc-IA serveur requis
• Documentation complète sur le serveur
• Endpoints utilisés : /api/v2/process, /api/v2/status

🔒 SÉCURITÉ
-----------

• Token API stocké localement (config.ini)
• Communications HTTPS recommandées en production
• Pas de données envoyées à des tiers
• Fichiers traités temporairement sur le serveur

📝 NOTES DE VERSION
-------------------

v1.0 - Version initiale
• Interface GUI complète
• Support multi-formats (17+ extensions)
• Configuration flexible
• Build Windows/Linux avec support proxy automatique
• Gestion d'erreurs robuste
• Détection et configuration proxy entreprise
• Compatibilité urllib3 toutes versions (1.25.x et 1.26.x+)
• Retry intelligent avec fallback gracieux
• Build console (évite problèmes PyInstaller/stdin)

=====================================================
        Merci d'utiliser Api-Doc-IA Demo Client!
         
   Pour plus d'informations techniques, consultez
              le code source main.py
=====================================================