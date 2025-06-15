@echo off
echo =============================================
echo   Api-Doc-IA Demo Client - Build Windows
echo =============================================

REM Configuration manuelle du proxy AVANT installation
echo.
echo 🌐 CONFIGURATION PROXY (Environnement d'entreprise)
echo.
echo Si vous êtes derrière un proxy d'entreprise, configurez-le MAINTENANT :
echo.
echo Pour configurer un proxy, ouvrez une NOUVELLE invite de commande et tapez :
echo   set HTTP_PROXY=http://proxy.entreprise.com:8080
echo   set HTTPS_PROXY=http://proxy.entreprise.com:8080
echo.
echo Puis relancez ce script depuis cette nouvelle invite de commande.
echo.
choice /c YN /m "Êtes-vous derrière un proxy d'entreprise (Y/N)"
if errorlevel 2 goto :no_proxy_setup
if errorlevel 1 goto :proxy_setup

:proxy_setup
echo.
echo 🔧 Configuration manuelle du proxy :
echo.
set /p "MANUAL_PROXY=Entrez l'URL du proxy (ex: http://proxy:8080) ou ENTER si déjà configuré: "
if not "%MANUAL_PROXY%" == "" (
    set "HTTP_PROXY=%MANUAL_PROXY%"
    set "HTTPS_PROXY=%MANUAL_PROXY%"
    echo ✅ Proxy configuré pour cette session: %MANUAL_PROXY%
) else (
    echo ℹ️  Utilisation des variables d'environnement existantes
)
goto :start_build

:no_proxy_setup
echo ℹ️  Continuation sans proxy
echo.

:start_build
REM Affichage de la configuration actuelle
echo.
echo 📋 CONFIGURATION ACTUELLE :
if defined HTTP_PROXY (
    echo   HTTP_PROXY: %HTTP_PROXY%
) else (
    echo   HTTP_PROXY: Non défini
)
if defined HTTPS_PROXY (
    echo   HTTPS_PROXY: %HTTPS_PROXY%
) else (
    echo   HTTPS_PROXY: Non défini
)
echo.

REM Vérification de Python
echo [1/4] Vérification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)
echo ✅ Python détecté

echo [2/4] Installation des dépendances...
if defined HTTP_PROXY (
    echo 🌐 Utilisation du proxy: %HTTP_PROXY%
    pip install --proxy %HTTP_PROXY% -r requirements.txt
) else (
    pip install -r requirements.txt
)
if errorlevel 1 (
    echo.
    echo ❌ ERREUR: Échec de l'installation des dépendances
    echo.
    echo 💡 Si vous êtes derrière un proxy, essayez :
    echo    1. Ouvrir une nouvelle invite de commande
    echo    2. Taper : set HTTP_PROXY=http://votre-proxy:port
    echo    3. Taper : set HTTPS_PROXY=http://votre-proxy:port  
    echo    4. Relancer ce script
    echo.
    echo 💡 Ou contactez votre administrateur réseau
    pause
    exit /b 1
)
echo ✅ Dépendances installées

echo [3/4] Installation de PyInstaller...
if defined HTTP_PROXY (
    pip install --proxy %HTTP_PROXY% pyinstaller
) else (
    pip install pyinstaller
)
if errorlevel 1 (
    echo ERREUR: Échec de l'installation de PyInstaller
    pause
    exit /b 1
)
echo ✅ PyInstaller installé

echo [4/4] Création de l'exécutable...
if exist "icon.ico" (
    echo Utilisation de l'icône personnalisée...
    pyinstaller --onefile --console --icon=icon.ico --name="ApiDocIA-Demo" main.py
) else (
    echo Pas d'icône trouvée, build sans icône...
    pyinstaller --onefile --console --name="ApiDocIA-Demo" main.py
)

if errorlevel 1 (
    echo ERREUR: Échec de la création de l'exécutable
    echo 💡 Tentative sans icône...
    pyinstaller --onefile --console --name="ApiDocIA-Demo" main.py
    if errorlevel 1 (
        echo ERREUR: Échec définitif de la création de l'exécutable
        pause
        exit /b 1
    )
)

echo [5/5] Finalisation...
if exist "dist\ApiDocIA-Demo.exe" (
    echo.
    echo ✅ BUILD RÉUSSI!
    echo.
    echo 📁 Exécutable créé: dist\ApiDocIA-Demo.exe
    echo 📊 Taille approximative: 
    dir dist\ApiDocIA-Demo.exe | findstr "ApiDocIA-Demo.exe"
    echo.
    echo 💡 Vous pouvez maintenant distribuer le fichier:
    echo    dist\ApiDocIA-Demo.exe
    echo.
) else (
    echo ❌ ERREUR: L'exécutable n'a pas été créé
    pause
    exit /b 1
)

echo =============================================
echo Build terminé - Appuyez sur une touche...
pause >nul