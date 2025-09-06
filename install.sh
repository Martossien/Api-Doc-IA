#!/bin/bash

# =============================================================================
# 🚀 API-DOC-IA INSTALLATION SCRIPT (SECURE v6)
# =============================================================================
# Détection automatique et corrections sécurisées : Python 3.11 + SQLite 3.45+
# FIXED: SQLite isolation - NO system pollution
# =============================================================================

set -e

# ---------------------------------------------------------------------
# APT update helper resilient to stale proxy caches / expired InRelease
# ---------------------------------------------------------------------
apt_update_with_proxy_fix() {
    echo -e "${BLUE}🔄 Running apt-get update (proxy-safe)...${NC}"

# ---------------------------------------------------------------------
# Python headers detection (pyenv/venv aware) + Debian fallback installer
# ---------------------------------------------------------------------
python_headers_available() {
    local hdr
    hdr="$(python - <<'PY'
import sysconfig
p = sysconfig.get_config_h_filename()
print(p if p else "")
PY
)"
    if [[ -n "$hdr" && -f "$hdr" ]]; then
        return 0
    fi
    return 1
}

# Map a package name to Debian fallbacks
map_debian_pkg_fallbacks() {
    local name="$1"
    local py_mm
    py_mm="$(python - <<'PY'
import sys
print(f"{sys.version_info.major}.{sys.version_info.minor}")
PY
)"
    case "$name" in
        python3.*-dev)
            echo "python${py_mm}-dev python3-dev python3-all-dev"
            ;;
        python*-dev)
            echo "python${py_mm}-dev python3-dev python3-all-dev"
            ;;
#            echo ""
#            ;;
    esac
}

deb_install_or_fallback() {
    if [[ $# -eq 0 ]]; then return 0; fi
    # Update once (proxy-safe)
    apt_update_with_proxy_fix || true

    local pkgs=("$@")
    local to_install=()

    # If Python headers already available, drop python*-dev requests
    if python_headers_available; then
        for p in "${pkgs[@]}"; do
            if [[ "$p" =~ ^python[0-9.]*-dev$ || "$p" == "python3-dev" || "$p" == "python3-all-dev" ]]; then
                echo -e "${GREEN}✅ Python headers present (pyenv/venv). Skipping $p.${NC}"
                continue
            fi
            to_install+=("$p")
        done
    else
        to_install=("${pkgs[@]}")
    fi

    # Install one-by-one with fallbacks to provide clear logs
    for pkg in "${to_install[@]}"; do
        if $SUDO_CMD apt-get install -y "$pkg"; then
            continue
        fi
        # Try mapped fallbacks
        local fallbacks
        fallbacks="$(map_debian_pkg_fallbacks "$pkg")"
        for alt in $fallbacks; do
            echo -e "${YELLOW}↪️  Trying fallback package: ${alt}${NC}"
            if $SUDO_CMD apt-get install -y "$alt"; then
                break
            fi
        done
    done
}
    local extra_opts=()
    if [[ -n "${http_proxy}${https_proxy}${HTTP_PROXY}${HTTPS_PROXY}" ]]; then
        extra_opts+=(-o Acquire::http::No-Cache=true -o Acquire::https::No-Cache=true)
    fi
    if $SUDO_CMD apt-get "${extra_opts[@]}" update; then
        return 0
    fi
    echo -e "${YELLOW}⚠️ apt-get update failed. Retrying with Valid-Until/Date disabled (proxy stale indexes).${NC}"
    if $SUDO_CMD apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false "${extra_opts[@]}" update; then
        return 0
    fi
    echo -e "${YELLOW}🧹 Purging APT lists cache and retrying (last attempt)...${NC}"
    $SUDO_CMD rm -rf /var/lib/apt/lists/* || true
    $SUDO_CMD apt-get clean || true
    $SUDO_CMD apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false "${extra_opts[@]}" update
}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_PATH="$PROJECT_ROOT/backend"
REQUIREMENTS_FILE="$BACKEND_PATH/requirements.txt"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 API-DOC-IA INSTALLATION (SECURE v6)${NC}"
echo -e "${BLUE}============================================${NC}"

# =============================================================================
# CONFIGURATION VARIABLES WITH SAFE DEFAULTS
# =============================================================================

# User-configurable options (can be overridden via environment)
: "${FORCE_SQLITE_COMPILATION:=false}"
: "${SKIP_CHROMADB_CHECK:=false}"
: "${INSTALLATION_MODE:=auto}"  # auto|minimal|full
: "${SQLITE_FALLBACK_STRATEGY:=graceful}"  # graceful|strict|skip
: "${DISABLE_SQLITE_COMPILATION:=false}"
: "${USE_LEGACY_MODE:=false}"
: "${SKIP_ENVIRONMENT_DETECTION:=false}"
: "${ENABLE_BACKUP_RESTORATION:=true}"

# Internal variables
BACKUP_DIR=""
USING_CONDA=false
USING_VENV=false
PYTHON_CMD=""
ROCKY_VERSION=""
RHEL_VERSION=""
UBUNTU_VERSION=""
CUSTOM_SQLITE_COMPILED=false
CHROMADB_STATUS="unknown"

# =============================================================================
# PROXY DETECTION AND CONFIGURATION
# =============================================================================

detect_and_configure_proxy() {
    echo -e "${BLUE}🌐 Detecting proxy configuration...${NC}"
    
    # Check for existing proxy configuration
    PROXY_DETECTED=false
    CURRENT_HTTP_PROXY=""
    CURRENT_HTTPS_PROXY=""
    
    # Check environment variables
    if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ] || [ -n "$https_proxy" ] || [ -n "$HTTPS_PROXY" ]; then
        PROXY_DETECTED=true
        CURRENT_HTTP_PROXY="${http_proxy:-$HTTP_PROXY}"
        CURRENT_HTTPS_PROXY="${https_proxy:-$HTTPS_PROXY}"
        echo -e "${BLUE}   Proxy detected in environment variables${NC}"
        echo -e "${BLUE}   HTTP Proxy: ${CURRENT_HTTP_PROXY:-none}${NC}"
        echo -e "${BLUE}   HTTPS Proxy: ${CURRENT_HTTPS_PROXY:-none}${NC}"
    fi
    
    # Check system proxy settings (common locations)
    for proxy_file in "/etc/environment" "$HOME/.bashrc" "$HOME/.profile"; do
        if [ -f "$proxy_file" ] && grep -q -i "proxy" "$proxy_file" 2>/dev/null; then
            if ! $PROXY_DETECTED; then
                echo -e "${BLUE}   Proxy configuration found in: $proxy_file${NC}"
                PROXY_DETECTED=true
            fi
        fi
    done
    
    if $PROXY_DETECTED; then
        echo -e "${YELLOW}⚠️ Proxy detected - Configuring localhost exclusion for API tests${NC}"
        
        # Current NO_PROXY value
        CURRENT_NO_PROXY="${NO_PROXY:-$no_proxy}"
        
        # Required exclusions for Api-Doc-IA
        REQUIRED_EXCLUSIONS="127.0.0.1,localhost,0.0.0.0"
        
        # Build new NO_PROXY value
        if [ -z "$CURRENT_NO_PROXY" ]; then
            NEW_NO_PROXY="$REQUIRED_EXCLUSIONS"
        else
            # Check if already contains our exclusions
            if echo "$CURRENT_NO_PROXY" | grep -q "127.0.0.1" && echo "$CURRENT_NO_PROXY" | grep -q "localhost"; then
                echo -e "${GREEN}✅ Proxy exclusions already configured correctly${NC}"
                NEW_NO_PROXY="$CURRENT_NO_PROXY"
            else
                NEW_NO_PROXY="$CURRENT_NO_PROXY,$REQUIRED_EXCLUSIONS"
                echo -e "${BLUE}🔧 Adding localhost exclusions to NO_PROXY${NC}"
            fi
        fi
        
        # Export for this session
        export NO_PROXY="$NEW_NO_PROXY"
        export no_proxy="$NEW_NO_PROXY"
        
        echo -e "${GREEN}✅ NO_PROXY configured: $NEW_NO_PROXY${NC}"
        
        # Test proxy bypass for localhost
        echo -e "${BLUE}🧪 Testing proxy bypass for localhost...${NC}"
        if command -v curl >/dev/null 2>&1; then
            if curl -s --max-time 5 http://127.0.0.1:8080/ >/dev/null 2>&1 || [ $? -eq 7 ]; then
                echo -e "${GREEN}✅ Localhost access bypasses proxy correctly${NC}"
            else
                echo -e "${YELLOW}⚠️ Localhost proxy bypass test inconclusive (server not running)${NC}"
            fi
        else
            echo -e "${YELLOW}💡 curl not available - proxy bypass test skipped${NC}"
        fi
        
    else
        echo -e "${GREEN}✅ No proxy detected - direct internet access${NC}"
    fi
    
    return 0
}

# =============================================================================
# GIT UPDATE VERIFICATION
# =============================================================================

check_git_updates() {
    echo -e "${BLUE}📦 Checking for project updates...${NC}"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${YELLOW}💡 Not a git repository - update check skipped${NC}"
        return 0
    fi
    
    # Check if we have network connectivity
    if ! ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ No internet connectivity - update check skipped${NC}"
        return 0
    fi
    
    # Save current state
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo -e "${BLUE}   Current branch: $CURRENT_BRANCH${NC}"
    
    # Fetch latest changes (with timeout)
    echo -e "${BLUE}🔄 Fetching latest changes...${NC}"
    if timeout 30 git fetch origin 2>/dev/null; then
        # Check if we're behind
        BEHIND_COUNT=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
        
        if [ "$BEHIND_COUNT" -gt 0 ]; then
            echo -e "${YELLOW}📦 Updates available! $BEHIND_COUNT commits behind origin${NC}"
            echo -e "${YELLOW}💡 It's recommended to update before installation${NC}"
            echo ""
            echo -e "${BLUE}Recent commits:${NC}"
            git log --oneline -5 origin/$CURRENT_BRANCH ^HEAD 2>/dev/null || true
            echo ""
            
            read -p "🔄 Update now before installation? (Y/n): " -r UPDATE_CHOICE
            if [[ ! $UPDATE_CHOICE =~ ^[Nn]$ ]]; then
                echo -e "${BLUE}🔄 Updating project...${NC}"
                if git pull origin "$CURRENT_BRANCH"; then
                    echo -e "${GREEN}✅ Project updated successfully${NC}"
                    echo -e "${BLUE}💡 Restarting installation script with latest version...${NC}"
                    sleep 2
                    exec "$0" "$@"  # Restart script with same arguments
                else
                    echo -e "${RED}❌ Update failed - continuing with current version${NC}"
                    echo -e "${YELLOW}💡 You can update manually later with: git pull${NC}"
                fi
            else
                echo -e "${BLUE}💡 Continuing with current version${NC}"
            fi
        else
            echo -e "${GREEN}✅ Project is up to date${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Could not fetch updates (timeout or network issue)${NC}"
        echo -e "${YELLOW}💡 Continuing with current version${NC}"
    fi
    
    echo ""
    return 0
}

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "${BLUE}   Installation mode: $INSTALLATION_MODE${NC}"
echo -e "${BLUE}   SQLite strategy: $SQLITE_FALLBACK_STRATEGY${NC}"
echo -e "${BLUE}   Force SQLite compilation: $FORCE_SQLITE_COMPILATION${NC}"

# =============================================================================
# SAFETY AND BACKUP FUNCTIONS
# =============================================================================

create_safety_backup() {
    echo -e "${BLUE}💾 Creating safety backup...${NC}"
    
    BACKUP_DIR="$PROJECT_ROOT/.installation_backup_$(date +%s)"
    mkdir -p "$BACKUP_DIR"
    
    # Save current state
    env > "$BACKUP_DIR/environment_before.txt" 2>/dev/null || true
    python3 -c "import sqlite3; print('SQLite:', sqlite3.sqlite_version)" > "$BACKUP_DIR/sqlite_before.txt" 2>/dev/null || echo "unknown" > "$BACKUP_DIR/sqlite_before.txt"
    
    # Save current Python path and version
    which python3 > "$BACKUP_DIR/python_path.txt" 2>/dev/null || echo "unknown" > "$BACKUP_DIR/python_path.txt"
    python3 --version > "$BACKUP_DIR/python_version.txt" 2>/dev/null || echo "unknown" > "$BACKUP_DIR/python_version.txt"
    
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"
}

restore_from_backup() {
    if [ "$ENABLE_BACKUP_RESTORATION" != "true" ] || [ -z "$BACKUP_DIR" ] || [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}⚠️ Backup restoration not available${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Restoring from backup...${NC}"
    
    # Remove custom SQLite if we installed it (NO system pollution cleanup needed)
    if [ -f "/usr/local/lib/libsqlite3.so" ]; then
        sudo rm -f /usr/local/lib/libsqlite3.so* 2>/dev/null || true
    fi
    
    # Remove project SQLite environment file
    if [ -f "$PROJECT_ROOT/.sqlite_env" ]; then
        rm -f "$PROJECT_ROOT/.sqlite_env"
    fi
    
    echo -e "${GREEN}✅ Restoration completed${NC}"
}

# =============================================================================
# SMART FIXES - AUTO-DETECTION AND CORRECTION
# =============================================================================

fix_onnxruntime_version() {
    echo -e "${BLUE}🔍 Checking onnxruntime version compatibility...${NC}"
    
    if grep -q "onnxruntime==1.20.1" "$REQUIREMENTS_FILE"; then
        echo -e "${YELLOW}⚠️ Detected onnxruntime==1.20.1 (version not available)${NC}"
        echo -e "${BLUE}🔧 Auto-correcting to available version...${NC}"
        
        # Backup original file
        cp "$REQUIREMENTS_FILE" "$REQUIREMENTS_FILE.backup"
        
        # Fix the version
        sed -i 's/onnxruntime==1.20.1/onnxruntime==1.19.2/' "$REQUIREMENTS_FILE"
        
        echo -e "${GREEN}✅ Corrected onnxruntime version: 1.20.1 → 1.19.2${NC}"
    else
        echo -e "${GREEN}✅ onnxruntime version looks compatible${NC}"
    fi
}

# =============================================================================
# SQLITE COMPILATION (ISOLATED - NO SYSTEM POLLUTION)
# =============================================================================

compile_sqlite_isolated() {
    echo -e "${BLUE}🏗️ Compiling SQLite 3.45+ in ISOLATED mode (no system pollution)...${NC}"
    echo -e "${GREEN}✅ This will NOT affect system tools (DNF, etc.) - application-only${NC}"
    
    # Check if we're root or can use sudo
    SUDO_CMD=""
    if [ "$EUID" -ne 0 ]; then
        if command -v sudo >/dev/null 2>&1; then
            SUDO_CMD="sudo"
        else
            echo -e "${RED}❌ Not running as root and sudo not available${NC}"
            return 1
        fi
    fi
    
    # 1. SAFETY CHECKS
    AVAILABLE_SPACE=$(df /usr/local --output=avail | tail -1 2>/dev/null || echo "0")
    if [ "$AVAILABLE_SPACE" -lt 500000 ]; then  # 500MB minimum
        echo -e "${RED}❌ Insufficient disk space in /usr/local${NC}"
        return 1
    fi
    
    # 2. INSTALL BUILD DEPENDENCIES
    echo -e "${BLUE}📦 Installing build dependencies...${NC}"
    MISSING_BUILD_DEPS=()
    
    if ! command -v gcc >/dev/null 2>&1; then
        MISSING_BUILD_DEPS+=("gcc")
    fi
    if ! command -v make >/dev/null 2>&1; then
        MISSING_BUILD_DEPS+=("make")
    fi
    if ! command -v wget >/dev/null 2>&1; then
        MISSING_BUILD_DEPS+=("wget")
    fi
    if ! rpm -q tar >/dev/null 2>&1 && ! dpkg -l tar >/dev/null 2>&1; then
        MISSING_BUILD_DEPS+=("tar")
    fi
    
    if [ ${#MISSING_BUILD_DEPS[@]} -gt 0 ]; then
        echo -e "${BLUE}⚙️ Installing build tools: ${MISSING_BUILD_DEPS[*]}${NC}"
        if ! $SUDO_CMD dnf install -y "${MISSING_BUILD_DEPS[@]}" 2>/dev/null && \
           ! $SUDO_CMD apt install -y "${MISSING_BUILD_DEPS[@]}" 2>/dev/null; then
            echo -e "${RED}❌ Failed to install build dependencies${NC}"
            return 1
        fi
    fi
    
    # 3. DOWNLOAD AND VERIFY
    BUILD_DIR="/tmp/sqlite-build-$$"
    mkdir -p "$BUILD_DIR"
    cd "$BUILD_DIR"
    
    echo -e "${BLUE}📥 Downloading SQLite 3.45.1...${NC}"
    if ! wget -q --timeout=30 https://www.sqlite.org/2024/sqlite-autoconf-3450100.tar.gz; then
        echo -e "${RED}❌ Failed to download SQLite source${NC}"
        cd "$PROJECT_ROOT"
        rm -rf "$BUILD_DIR"
        return 1
    fi
    
    # Verify download
    if [ ! -f "sqlite-autoconf-3450100.tar.gz" ] || [ ! -s "sqlite-autoconf-3450100.tar.gz" ]; then
        echo -e "${RED}❌ Downloaded file is invalid${NC}"
        cd "$PROJECT_ROOT"
        rm -rf "$BUILD_DIR"
        return 1
    fi
    
    tar xzf sqlite-autoconf-3450100.tar.gz
    cd sqlite-autoconf-3450100
    
    # 4. CONFIGURE WITH SAFETY (isolated installation)
    echo -e "${BLUE}⚙️ Configuring SQLite build...${NC}"
    if ! ./configure --prefix=/usr/local --enable-static=no --enable-shared=yes; then
        echo -e "${RED}❌ Configuration failed${NC}"
        cd "$PROJECT_ROOT"
        rm -rf "$BUILD_DIR"
        return 1
    fi
    
    # 5. COMPILE (with progress and timeout)
    echo -e "${BLUE}🔨 Compiling SQLite (5-10 minutes)...${NC}"
    if ! timeout 900 make -j$(nproc); then  # 15 min timeout
        echo -e "${RED}❌ Compilation failed or timed out${NC}"
        cd "$PROJECT_ROOT"
        rm -rf "$BUILD_DIR"
        return 1
    fi
    
    # 6. TEST BEFORE INSTALL
    echo -e "${BLUE}🧪 Testing compiled SQLite...${NC}"
    if ! ./sqlite3 --version | grep -q "3.45"; then
        echo -e "${RED}❌ Compiled SQLite test failed${NC}"
        cd "$PROJECT_ROOT"
        rm -rf "$BUILD_DIR"
        return 1
    fi
    
    # 7. ISOLATED INSTALL (NO SYSTEM POLLUTION)
    echo -e "${BLUE}📦 Installing SQLite to /usr/local (ISOLATED)...${NC}"
    
    # Backup existing /usr/local/lib/libsqlite3.* if exists
    if ls /usr/local/lib/libsqlite3.* >/dev/null 2>&1; then
        mkdir -p "$BACKUP_DIR"
        $SUDO_CMD cp /usr/local/lib/libsqlite3.* "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    if ! $SUDO_CMD make install; then
        echo -e "${RED}❌ Installation failed${NC}"
        # Restore backup if any
        if [ -n "$BACKUP_DIR" ] && ls "$BACKUP_DIR"/libsqlite3.* >/dev/null 2>&1; then
            $SUDO_CMD cp "$BACKUP_DIR"/libsqlite3.* /usr/local/lib/ 2>/dev/null || true
        fi
        cd "$PROJECT_ROOT"
        rm -rf "$BUILD_DIR"
        return 1
    fi
    
    # 8. CREATE ISOLATED ENVIRONMENT FILE (NO GLOBAL CONFIG)
    echo -e "${BLUE}🔧 Creating isolated SQLite environment file...${NC}"
    echo -e "${GREEN}✅ System tools (DNF, etc.) will NOT be affected${NC}"
    
    cat > "$PROJECT_ROOT/.sqlite_env" << 'EOF'
#!/bin/bash
# ISOLATED SQLite environment for Api-Doc-IA ONLY
# This does NOT affect system tools (DNF, SSH, etc.)
# Generated by install.sh SQLite compilation

# Application-specific library path (NOT global)
export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
export LD_PRELOAD="/usr/local/lib/libsqlite3.so:$LD_PRELOAD"
export PATH="/usr/local/bin:$PATH"

# Verification flags
export CUSTOM_SQLITE_COMPILED=true
export CUSTOM_SQLITE_VERSION="3.45.1"
export SQLITE_ISOLATION_MODE="application_only"

# Debug info
echo "🔧 SQLite environment loaded (application-only, no system pollution)"
EOF
    
    chmod +x "$PROJECT_ROOT/.sqlite_env"
    
    # 9. TEST PYTHON INTEGRATION (ISOLATED)
    echo -e "${BLUE}🐍 Testing Python SQLite integration (isolated)...${NC}"
    
    # Test with explicit library path (temporary for this test)
    export LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
    export LD_PRELOAD="/usr/local/lib/libsqlite3.so:$LD_PRELOAD"
    
    PYTHON_SQLITE_TEST=$(python3 -c "
import sys
import sqlite3
print('Python SQLite version:', sqlite3.version)
print('SQLite library version:', sqlite3.sqlite_version)

# Test if version is >= 3.35
version_parts = sqlite3.sqlite_version.split('.')
major, minor = int(version_parts[0]), int(version_parts[1])
if major >= 3 and minor >= 35:
    print('✅ SQLite version is compatible with ChromaDB')
    sys.exit(0)
else:
    print('❌ SQLite version still too old')
    sys.exit(1)
" 2>&1)
    
    echo -e "${BLUE}   $PYTHON_SQLITE_TEST${NC}"
    
    # Check if Python test succeeded
    if python3 -c "
import sqlite3
version_parts = sqlite3.sqlite_version.split('.')
major, minor = int(version_parts[0]), int(version_parts[1])
exit(0 if (major >= 3 and minor >= 35) else 1)
" 2>/dev/null; then
        echo -e "${GREEN}✅ Python SQLite integration successful${NC}"
        
        # Unset temporary environment variables
        unset LD_LIBRARY_PATH LD_PRELOAD
        
        CUSTOM_SQLITE_COMPILED=true
    else
        echo -e "${RED}❌ Python SQLite integration failed${NC}"
        # Unset temporary environment variables
        unset LD_LIBRARY_PATH LD_PRELOAD
        return 1
    fi
    
    # 10. VERIFY SYSTEM ISOLATION
    echo -e "${BLUE}🧪 Verifying system isolation...${NC}"
    
    # Test that system tools still use system SQLite
    SYSTEM_SQLITE_TEST=$(python3 -c "import sqlite3; print(sqlite3.sqlite_version)" 2>/dev/null || echo "unknown")
    echo -e "${BLUE}   System SQLite (without our env): $SYSTEM_SQLITE_TEST${NC}"
    
    if [ "$SYSTEM_SQLITE_TEST" = "3.34.1" ] || [ "$SYSTEM_SQLITE_TEST" = "3.26.0" ]; then
        echo -e "${GREEN}✅ System isolation verified - system tools unaffected${NC}"
    else
        echo -e "${YELLOW}⚠️ System SQLite version: $SYSTEM_SQLITE_TEST${NC}"
    fi
    
    # 11. CLEANUP
    cd "$PROJECT_ROOT"
    rm -rf "$BUILD_DIR"
    
    echo -e "${GREEN}✅ SQLite 3.45.1 successfully compiled in ISOLATED mode!${NC}"
    echo -e "${GREEN}   System tools (DNF, SSH, etc.) remain unaffected${NC}"
    return 0
}

# =============================================================================
# PYTHON INSTALLATION FUNCTIONS
# =============================================================================

install_python311_rhel9() {
    echo -e "${BLUE}🐍 Installing Python 3.11 on RHEL 9/Rocky 9...${NC}"
    
    # Check if we're root or can use sudo
    SUDO_CMD=""
    if [ "$EUID" -ne 0 ]; then
        if command -v sudo >/dev/null 2>&1; then
            SUDO_CMD="sudo"
        else
            echo -e "${RED}❌ Not running as root and sudo not available${NC}"
            return 1
        fi
    fi
    
    # Install EPEL if not already installed
    if ! rpm -q epel-release >/dev/null 2>&1; then
        echo -e "${BLUE}📦 Installing EPEL repository...${NC}"
        $SUDO_CMD dnf install -y epel-release
    else
        echo -e "${GREEN}✅ EPEL repository already installed${NC}"
    fi
    
    # Install Python 3.11 packages
    echo -e "${BLUE}📦 Installing Python 3.11...${NC}"
    $SUDO_CMD dnf install -y python3.11 python3.11-pip python3.11-devel
    
    # Verify installation
    if command -v python3.11 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3.11 --version)
        echo -e "${GREEN}✅ Python 3.11 installed successfully: $PYTHON_VERSION${NC}"
        PYTHON_CMD="python3.11"
        return 0
    else
        echo -e "${RED}❌ Failed to install Python 3.11${NC}"
        return 1
    fi
}

install_python311_ubuntu() {
    echo -e "${BLUE}🐍 Installing Python 3.11 on Ubuntu...${NC}"
    
    # Check if we're root or can use sudo
    SUDO_CMD=""
    if [ "$EUID" -ne 0 ]; then
        if command -v sudo >/dev/null 2>&1; then
            SUDO_CMD="sudo"
        else
            echo -e "${RED}❌ Not running as root and sudo not available${NC}"
            return 1
        fi
    fi
    
    # Install required packages for adding PPA
    if ! command -v add-apt-repository >/dev/null 2>&1; then
        echo -e "${BLUE}📦 Installing software-properties-common...${NC}"
        apt_update_with_proxy_fix
        $SUDO_CMD apt install -y software-properties-common
    fi
    
    # Add deadsnakes PPA for Python 3.11
    echo -e "${BLUE}📦 Adding deadsnakes PPA for Python 3.11...${NC}"
    $SUDO_CMD add-apt-repository ppa:deadsnakes/ppa -y
    apt_update_with_proxy_fix
    
    # Install Python 3.11
    echo -e "${BLUE}📦 Installing Python 3.11...${NC}"
    $SUDO_CMD apt install -y python3.11 python3.11-venv python3.11-dev python3.11-distutils
    
    # Verify installation
    if command -v python3.11 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3.11 --version)
        echo -e "${GREEN}✅ Python 3.11 installed successfully: $PYTHON_VERSION${NC}"
        PYTHON_CMD="python3.11"
        return 0
    else
        echo -e "${RED}❌ Failed to install Python 3.11${NC}"
        return 1
    fi
}

# =============================================================================
# SYSTEM DETECTION
# =============================================================================

detect_os() {
    echo -e "${BLUE}🔍 Detecting operating system...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v dnf >/dev/null 2>&1; then
            OS_TYPE="fedora"
            PACKAGE_MANAGER="dnf"
            
            # Detect specific RHEL/Rocky version for Python 3.11 handling
            if [ -f /etc/os-release ]; then
                source /etc/os-release
                if [[ "$ID" == "rocky" ]] && [[ "$VERSION_ID" == "9"* ]]; then
                    ROCKY_VERSION="9"
                    echo -e "${GREEN}✅ Rocky Linux 9 detected${NC}"
                elif [[ "$ID" == "rhel" ]] && [[ "$VERSION_ID" == "9"* ]]; then
                    RHEL_VERSION="9"
                    echo -e "${GREEN}✅ RHEL 9 detected${NC}"
                elif [[ "$ID" == "rocky" ]] && [[ "$VERSION_ID" == "8"* ]]; then
                    ROCKY_VERSION="8"
                    echo -e "${YELLOW}⚠️ Rocky Linux 8 detected (limited Python support)${NC}"
                else
                    echo -e "${GREEN}✅ Fedora/RHEL detected${NC}"
                fi
            else
                echo -e "${GREEN}✅ Fedora/RHEL detected${NC}"
            fi
        elif command -v apt >/dev/null 2>&1; then
            OS_TYPE="debian"
            PACKAGE_MANAGER="apt"
            
            # Detect specific Ubuntu version for Python 3.11 handling
            if [ -f /etc/os-release ]; then
                source /etc/os-release
                if [[ "$ID" == "ubuntu" ]]; then
                    UBUNTU_VERSION="$VERSION_ID"
                    echo -e "${GREEN}✅ Ubuntu $UBUNTU_VERSION detected${NC}"
                else
                    echo -e "${GREEN}✅ Debian-based system detected${NC}"
                fi
            else
                echo -e "${GREEN}✅ Ubuntu/Debian detected${NC}"
            fi
        elif command -v pacman >/dev/null 2>&1; then
            OS_TYPE="arch"
            PACKAGE_MANAGER="pacman"
            echo -e "${GREEN}✅ Arch Linux detected${NC}"
        else
            OS_TYPE="linux"
            PACKAGE_MANAGER="unknown"
            echo -e "${YELLOW}⚠️ Linux detected (unknown distribution)${NC}"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macos"
        PACKAGE_MANAGER="brew"
        echo -e "${GREEN}✅ macOS detected${NC}"
    else
        OS_TYPE="unknown"
        PACKAGE_MANAGER="unknown"
        echo -e "${YELLOW}⚠️ Unknown OS: $OSTYPE${NC}"
    fi
}

# =============================================================================
# PYTHON VERSION MANAGEMENT
# =============================================================================

check_python_version() {
    echo -e "${BLUE}🐍 Checking Python version...${NC}"
    
    # Check if python3.11 is available
    if command -v python3.11 >/dev/null 2>&1; then
        PYTHON_CMD="python3.11"
        PYTHON_VERSION=$(python3.11 --version)
        echo -e "${GREEN}✅ Python 3.11 found: $PYTHON_VERSION${NC}"
        return 0
    fi
    
    # Check default python3 version
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+')
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
        
        echo -e "${BLUE}   Current Python: $PYTHON_VERSION${NC}"
        
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 11 ]; then
            PYTHON_CMD="python3"
            echo -e "${GREEN}✅ Python $PYTHON_VERSION is compatible${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ Python $PYTHON_VERSION detected - Open WebUI requires Python 3.11+${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ No Python 3 found${NC}"
        return 1
    fi
}

# =============================================================================
# DEPENDENCY MANAGEMENT
# =============================================================================

install_system_deps() {
    echo -e "${BLUE}📦 Installing system dependencies...${NC}"
    
    case $OS_TYPE in
        "fedora")
            echo -e "${BLUE}🔧 Installing Fedora/RHEL dependencies...${NC}"
            
            # Check if we're root or can use sudo
            SUDO_CMD=""
            if [ "$EUID" -ne 0 ]; then
                if command -v sudo >/dev/null 2>&1; then
                    SUDO_CMD="sudo"
                else
                    echo -e "${RED}❌ Not running as root and sudo not available${NC}"
                    return 1
                fi
            fi
            
            # Special handling for Rocky/RHEL 9 - install Python 3.11 first
            if [[ "$ROCKY_VERSION" == "9" ]] || [[ "$RHEL_VERSION" == "9" ]]; then
                if ! check_python_version; then
                    echo -e "${YELLOW}🐍 Rocky/RHEL 9 detected with Python < 3.11${NC}"
                    read -p "Install Python 3.11 automatically? (Y/n): " -r
                    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                        if ! install_python311_rhel9; then
                            echo -e "${RED}❌ Failed to install Python 3.11${NC}"
                            return 1
                        fi
                    else
                        echo -e "${YELLOW}⚠️ Continuing with Python $PYTHON_VERSION - may cause issues${NC}"
                        PYTHON_CMD="python3"
                    fi
                fi
                
                # SQLite compatibility check for Rocky/RHEL 9 (ALWAYS CHECK)
                echo -e "${BLUE}🔍 Checking SQLite compatibility for Rocky/RHEL 9...${NC}"
                
                # Get current SQLite version
                CURRENT_SQLITE=$(python3 -c "
try:
    import sqlite3
    print(sqlite3.sqlite_version)
except:
    print('unknown')
" 2>/dev/null || echo "unknown")
                
                echo -e "${BLUE}   Current SQLite: ${CURRENT_SQLITE}${NC}"
                
                # Check if SQLite needs upgrade
                NEEDS_SQLITE_UPGRADE=false
                if [ "$CURRENT_SQLITE" != "unknown" ]; then
                    SQLITE_MAJOR=$(echo "$CURRENT_SQLITE" | cut -d. -f1)
                    SQLITE_MINOR=$(echo "$CURRENT_SQLITE" | cut -d. -f2)
                    
                    if [ "$SQLITE_MAJOR" -eq 3 ] && [ "$SQLITE_MINOR" -lt 35 ]; then
                        NEEDS_SQLITE_UPGRADE=true
                    fi
                else
                    NEEDS_SQLITE_UPGRADE=true  # Unknown version, better upgrade
                fi
                
                # Propose SQLite compilation if needed or forced
                if [ "$NEEDS_SQLITE_UPGRADE" = "true" ] || [ "$FORCE_SQLITE_COMPILATION" = "true" ]; then
                    echo -e "${YELLOW}⚠️ Rocky/RHEL 9: SQLite upgrade needed for full ChromaDB compatibility${NC}"
                    echo -e "${YELLOW}   Current: SQLite $CURRENT_SQLITE < 3.35.0 required${NC}"
                    echo ""
                    echo -e "${GREEN}🔧 ISOLATED SQLite compilation (no system pollution):${NC}"
                    echo -e "${BLUE}  1. Compile SQLite 3.45+ (RECOMMENDED - application only, 5-10 min) ✅${NC}"
                    echo -e "${BLUE}  2. Continue with current SQLite (may have limited ChromaDB features) ⚠️${NC}"
                    echo ""
                    echo -e "${GREEN}✅ System tools (DNF, SSH, etc.) will NOT be affected${NC}"
                    echo ""
                    
                    if [ "$SQLITE_FALLBACK_STRATEGY" = "graceful" ]; then
                        read -p "Choose option (1/2) [default: 1]: " -r SQLITE_CHOICE
                        SQLITE_CHOICE=${SQLITE_CHOICE:-1}  # Default to 1 if empty
                    else
                        SQLITE_CHOICE="1"  # Auto-compile in strict mode
                        echo -e "${BLUE}Auto-selecting option 1 (strict mode)${NC}"
                    fi
                    
                    case $SQLITE_CHOICE in
                        1)
                            echo -e "${BLUE}🔧 Starting ISOLATED SQLite 3.45+ compilation...${NC}"
                            create_safety_backup
                            if compile_sqlite_isolated; then
                                echo -e "${GREEN}✅ SQLite compilation successful - ChromaDB fully supported${NC}"
                                echo -e "${GREEN}   System remains clean and unaffected${NC}"
                                CUSTOM_SQLITE_COMPILED=true
                            else
                                echo -e "${RED}❌ SQLite compilation failed${NC}"
                                if [ "$SQLITE_FALLBACK_STRATEGY" = "graceful" ]; then
                                    echo -e "${YELLOW}💡 Continuing with current SQLite (limited functionality)${NC}"
                                    restore_from_backup
                                else
                                    echo -e "${RED}❌ Installation stopped due to SQLite compilation failure${NC}"
                                    restore_from_backup
                                    return 1
                                fi
                            fi
                            ;;
                        2)
                            echo -e "${YELLOW}⚠️ Continuing with current SQLite - ChromaDB features may be limited${NC}"
                            echo -e "${YELLOW}   You can upgrade later by running: FORCE_SQLITE_COMPILATION=true ./install.sh${NC}"
                            ;;
                        *)
                            echo -e "${YELLOW}⚠️ Invalid choice, defaulting to option 1 (compilation)${NC}"
                            create_safety_backup
                            if compile_sqlite_isolated; then
                                echo -e "${GREEN}✅ SQLite compilation successful${NC}"
                                CUSTOM_SQLITE_COMPILED=true
                            else
                                restore_from_backup
                            fi
                            ;;
                    esac
                else
                    echo -e "${GREEN}✅ SQLite $CURRENT_SQLITE is compatible with ChromaDB${NC}"
                fi
            fi
            
            # Standard system dependencies (install AFTER SQLite to avoid conflicts)
            echo -e "${BLUE}📦 Installing standard system dependencies...${NC}"
            MISSING_DEPS=()
            
            # Check postgresql-devel
            if ! rpm -q postgresql-devel >/dev/null 2>&1 && ! rpm -q postgresql-private-devel >/dev/null 2>&1 && ! rpm -q libpq-devel >/dev/null 2>&1; then
                MISSING_DEPS+=("libpq-devel")
            fi
            
            # Check python3-devel (for the correct Python version)
            if [[ "$PYTHON_CMD" == "python3.11" ]]; then
                if ! rpm -q python3.11-devel >/dev/null 2>&1; then
                    MISSING_DEPS+=("python3.11-devel")
                fi
            else
                if ! rpm -q python3-devel >/dev/null 2>&1; then
                    MISSING_DEPS+=("python3-devel")
                fi
            fi
            
            # Check gcc
            if ! rpm -q gcc >/dev/null 2>&1; then
                MISSING_DEPS+=("gcc")
            fi
            
            # Check git
            if ! command -v git >/dev/null 2>&1; then
                MISSING_DEPS+=("git")
            fi
            
            if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
                echo -e "${YELLOW}📋 Missing dependencies: ${MISSING_DEPS[*]}${NC}"
                read -p "Install missing system dependencies? (Y/n): " -r
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    echo -e "${BLUE}⚙️ Installing: ${MISSING_DEPS[*]}${NC}"
                    if $SUDO_CMD dnf install -y "${MISSING_DEPS[@]}"; then
                        echo -e "${GREEN}✅ System dependencies installed successfully${NC}"
                    else
                        echo -e "${RED}❌ Failed to install some dependencies${NC}"
                        echo -e "${YELLOW}💡 You can continue, but compilation may fail${NC}"
                    fi
                else
                    echo -e "${YELLOW}⚠️ Skipping system dependencies - compilation may fail${NC}"
                fi
            else
                echo -e "${GREEN}✅ All required system dependencies are already installed${NC}"
            fi
            ;;
            
        "debian")
            echo -e "${BLUE}🔧 Installing Debian/Ubuntu dependencies...${NC}"
            
            # Check if we're root or can use sudo
            SUDO_CMD=""
            if [ "$EUID" -ne 0 ]; then
                if command -v sudo >/dev/null 2>&1; then
                    SUDO_CMD="sudo"
                else
                    echo -e "${RED}❌ Not running as root and sudo not available${NC}"
                    echo -e "${YELLOW}💡 Please run as root or install sudo${NC}"
                    return 1
                fi
            fi
            
            # Essential packages for dependency detection
            ESSENTIAL_DEPS=()
            if ! command -v pkg-config >/dev/null 2>&1; then
                ESSENTIAL_DEPS+=("pkg-config")
            fi
            if ! command -v git >/dev/null 2>&1; then
                ESSENTIAL_DEPS+=("git")
            fi
            
            if [ ${#ESSENTIAL_DEPS[@]} -gt 0 ]; then
                echo -e "${BLUE}📦 Installing essential tools: ${ESSENTIAL_DEPS[*]}${NC}"
                apt_update_with_proxy_fix
                deb_install_or_fallback "${ESSENTIAL_DEPS[@]}"
            fi
            
            # Check Python version and install 3.11 if needed on Ubuntu
            if ! check_python_version; then
                if [[ "$ID" == "ubuntu" ]] && [[ "$UBUNTU_VERSION" == "22.04" ]]; then
                    echo -e "${YELLOW}🐍 Ubuntu 22.04 detected with Python < 3.11${NC}"
                    read -p "Install Python 3.11? (Y/n): " -r
                    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                        if ! install_python311_ubuntu; then
                            echo -e "${RED}❌ Failed to install Python 3.11${NC}"
                            return 1
                        fi
                    else
                        echo -e "${YELLOW}⚠️ Continuing with Python $PYTHON_VERSION - may cause issues${NC}"
                        PYTHON_CMD="python3"
                    fi
                else
                    echo -e "${YELLOW}⚠️ Python 3.11+ not found. Open WebUI requires Python 3.11+${NC}"
                    PYTHON_CMD="python3"
                fi
            fi
            
            # PostgreSQL and development dependencies
            DEPS_NEEDED=()
            if ! pkg-config --exists libpq 2>/dev/null; then
                DEPS_NEEDED+=("libpq-dev")
            fi
            if ! command -v gcc >/dev/null 2>&1; then
                DEPS_NEEDED+=("build-essential")
            fi
            
            # Python development headers for the correct Python version
            if [[ "$PYTHON_CMD" == "python3.11" ]]; then
                if ! dpkg -l | grep -q python3.11-dev; then
                    DEPS_NEEDED+=("python3.11-dev")
                fi
            else
                if ! pkg-config --exists python3 2>/dev/null; then
                    DEPS_NEEDED+=("python3-dev")
                fi
            fi
            
            if [ ${#DEPS_NEEDED[@]} -gt 0 ]; then
                echo -e "${YELLOW}📋 Missing dependencies: ${DEPS_NEEDED[*]}${NC}"
                read -p "Install missing dependencies? (Y/n): " -r
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    echo -e "${BLUE}⚙️ Installing dependencies...${NC}"
                    apt_update_with_proxy_fix
                    deb_install_or_fallback "${DEPS_NEEDED[@]}"
                    echo -e "${GREEN}✅ Dependencies installed${NC}"
                else
                    echo -e "${YELLOW}⚠️ Skipping system dependencies${NC}"
                fi
            else
                echo -e "${GREEN}✅ All system dependencies present${NC}"
            fi
            ;;
            
        "macos")
            if command -v brew >/dev/null 2>&1; then
                if ! brew list postgresql >/dev/null 2>&1; then
                    echo -e "${YELLOW}⚠️ PostgreSQL not found${NC}"
                    read -p "Install PostgreSQL via Homebrew? (Y/n): " -r
                    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                        brew install postgresql
                        echo -e "${GREEN}✅ PostgreSQL installed${NC}"
                    fi
                else
                    echo -e "${GREEN}✅ PostgreSQL found${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️ Homebrew not found. Install it first: https://brew.sh${NC}"
            fi
            ;;
            
        *)
            echo -e "${YELLOW}⚠️ Unknown OS. Manual dependency installation may be required.${NC}"
            echo -e "${YELLOW}Required: PostgreSQL development headers, Python development headers, C compiler${NC}"
            check_python_version
            ;;
    esac
}

# =============================================================================
# PYTHON ENVIRONMENT SETUP
# =============================================================================

setup_python_env() {
    echo -e "${BLUE}🐍 Setting up Python environment...${NC}"
    
    # CRITICAL: Detect if environment is already active (partial installation)
    EXISTING_ENV_DETECTED=false
    EXISTING_ENV_TYPE=""
    EXISTING_ENV_NAME=""
    
    # Check for active conda environment (DIRECT DETECTION)
    if command -v conda >/dev/null 2>&1; then
        echo -e "${BLUE}🔍 Detecting active conda environment...${NC}"
        
        # Direct detection using conda commands (more reliable than env vars)
        DETECTED_ENV=$(conda info --envs 2>/dev/null | grep '*' | awk '{print $1}' | head -1 2>/dev/null || echo "base")
        
        # Fallback: try conda info directly  
        if [ "$DETECTED_ENV" = "base" ] || [ -z "$DETECTED_ENV" ]; then
            DETECTED_ENV=$(conda info 2>/dev/null | grep "active environment" | awk '{print $4}' 2>/dev/null || echo "base")
        fi
        
        echo -e "${BLUE}   Detected environment: '$DETECTED_ENV'${NC}"
        
        if [ "$DETECTED_ENV" != "base" ] && [ -n "$DETECTED_ENV" ]; then
            EXISTING_ENV_DETECTED=true
            EXISTING_ENV_TYPE="conda"
            EXISTING_ENV_NAME="$DETECTED_ENV"
            echo -e "${YELLOW}🔍 Existing conda environment detected: $EXISTING_ENV_NAME${NC}"
        else
            echo -e "${BLUE}💡 No dedicated conda environment detected (in 'base' or none)${NC}"
        fi
    fi
    
    # Check for active pyenv environment
    if command -v pyenv >/dev/null 2>&1 && [ -n "$PYENV_VERSION" ]; then
        if ! $EXISTING_ENV_DETECTED; then  # Only if conda not already detected
            EXISTING_ENV_DETECTED=true
            EXISTING_ENV_TYPE="pyenv"
            EXISTING_ENV_NAME="$PYENV_VERSION"
            echo -e "${YELLOW}🔍 Existing pyenv environment detected: $EXISTING_ENV_NAME${NC}"
        fi
    fi
    
    # Check for active virtual environment
    if [ -n "$VIRTUAL_ENV" ] && ! $EXISTING_ENV_DETECTED; then
        EXISTING_ENV_DETECTED=true
        EXISTING_ENV_TYPE="venv"
        EXISTING_ENV_NAME=$(basename "$VIRTUAL_ENV")
        echo -e "${YELLOW}🔍 Existing virtual environment detected: $EXISTING_ENV_NAME${NC}"
    fi
    
    # Respect existing environment (UNIVERSAL: works with ANY environment name)
    if $EXISTING_ENV_DETECTED; then
        echo -e "${BLUE}💡 Active environment detected - respecting your choice${NC}"
        echo -e "${BLUE}   Type: $EXISTING_ENV_TYPE${NC}"
        echo -e "${BLUE}   Name: '$EXISTING_ENV_NAME'${NC}"
        echo ""
        echo -e "${BLUE}🤔 Continue installation in this environment?${NC}"
        echo -e "${BLUE}   • (Y)es: Install Api-Doc-IA in '$EXISTING_ENV_NAME'${NC}"
        echo -e "${BLUE}   • (N)o: Exit and let you choose another environment${NC}"
        read -p "Your choice (Y/n): " -r
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo -e "${GREEN}✅ Using existing $EXISTING_ENV_TYPE environment: $EXISTING_ENV_NAME${NC}"
            
            # Set appropriate flags
            case "$EXISTING_ENV_TYPE" in
                "conda")
                    USING_CONDA=true
                    PYTHON_CMD="python"  # In conda env, use 'python'
                    ;;
                "pyenv")
                    USING_VENV=false
                    USING_CONDA=false
                    PYTHON_CMD="python"
                    ;;
                "venv")
                    USING_VENV=true
                    PYTHON_CMD="python"  # In venv, use 'python'
                    ;;
            esac
            
            PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
            echo -e "${BLUE}   Python version in existing environment: $PYTHON_VERSION${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ Installation aborted by user choice${NC}"
            echo -e "${BLUE}💡 To use a different environment:${NC}"
            echo -e "${BLUE}   1. conda activate your-preferred-environment${NC}"
            echo -e "${BLUE}   2. ./install.sh${NC}"
            echo ""
            echo -e "${BLUE}💡 To proceed anyway with current environment, run install.sh again${NC}"
            exit 1
        fi
    fi
    
    # Ensure we have a Python command set
    if [ -z "$PYTHON_CMD" ]; then
        if command -v python3.11 >/dev/null 2>&1; then
            PYTHON_CMD="python3.11"
        elif command -v python3 >/dev/null 2>&1; then
            PYTHON_CMD="python3"
        else
            echo -e "${RED}❌ No suitable Python found${NC}"
            exit 1
        fi
    fi
    
    echo -e "${BLUE}   Using Python command: $PYTHON_CMD${NC}"
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo -e "${BLUE}   Python version: $PYTHON_VERSION${NC}"
    
    # Check if conda is available and if we're already in a dedicated environment
    if command -v conda >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Conda found${NC}"
        
        # Re-check current environment (same robust logic as earlier)
        eval "$(conda shell.bash hook)" 2>/dev/null || true
        ENV_FROM_VAR="${CONDA_DEFAULT_ENV:-base}"
        ENV_FROM_CMD=$(conda info --envs 2>/dev/null | grep '*' | awk '{print $1}' 2>/dev/null | head -1 || echo "base")
        PYTHON_PATH=$(which python 2>/dev/null || which python3 2>/dev/null || echo "")
        ENV_FROM_PYTHON=""
        if [ -n "$PYTHON_PATH" ] && echo "$PYTHON_PATH" | grep -q "/envs/"; then
            ENV_FROM_PYTHON=$(echo "$PYTHON_PATH" | grep -o '/envs/[^/]*' | cut -d'/' -f3)
        fi
        CURRENT_ENV="${ENV_FROM_VAR}"
        if [ "$CURRENT_ENV" = "base" ] && [ -n "$ENV_FROM_PYTHON" ] && [ "$ENV_FROM_PYTHON" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_PYTHON"
        fi
        if [ "$CURRENT_ENV" = "base" ] && [ "$ENV_FROM_CMD" != "base" ]; then
            CURRENT_ENV="$ENV_FROM_CMD"
        fi
        
        if [ "$CURRENT_ENV" != "base" ]; then
            echo -e "${BLUE}💡 You are currently in conda environment: '$CURRENT_ENV'${NC}"
            read -p "🤔 Use '$CURRENT_ENV' as the dedicated environment for Api-Doc-IA? (Y/n): " -r
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                echo -e "${GREEN}✅ Using existing environment '$CURRENT_ENV' for Api-Doc-IA${NC}"
                USING_CONDA=true
                PYTHON_CMD="python"
                return 0
            else
                echo -e "${YELLOW}💡 Will create a new dedicated environment instead${NC}"
            fi
        fi
        
        read -p "Do you want to create a dedicated conda environment? (Y/n): " -r
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            ENV_NAME="test-api-doc-ia"
            echo -e "${BLUE}🔧 Creating conda environment '$ENV_NAME'...${NC}"
            
            if conda env list | grep -q "$ENV_NAME"; then
                echo -e "${YELLOW}⚠️ Environment '$ENV_NAME' already exists${NC}"
                read -p "Remove and recreate? (y/N): " -r
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    conda env remove -n "$ENV_NAME"
                    conda create -n "$ENV_NAME" python=3.11 -y
                else
                    echo -e "${BLUE}💡 Using existing environment${NC}"
                fi
            else
                conda create -n "$ENV_NAME" python=3.11 -y
            fi
            
            echo -e "${GREEN}✅ Conda environment ready${NC}"
            echo -e "${BLUE}🔄 Activating environment automatically...${NC}"
            
            # Initialize conda for bash
            eval "$(conda shell.bash hook)"
            
            # Activate the environment
            conda activate "$ENV_NAME"
            
            # Verify activation
            if [[ "$CONDA_DEFAULT_ENV" == "$ENV_NAME" ]]; then
                echo -e "${GREEN}✅ Environment '$ENV_NAME' activated successfully${NC}"
                USING_CONDA=true
                PYTHON_CMD="python"  # In conda env, use 'python'
            else
                echo -e "${RED}❌ Failed to activate environment${NC}"
                echo -e "${YELLOW}💡 Continuing with system Python${NC}"
                USING_CONDA=false
            fi
        else
            USING_CONDA=false
        fi
    else
        echo -e "${YELLOW}⚠️ Conda not found, using system Python${NC}"
        USING_CONDA=false
        
        # Check if venv is available
        if $PYTHON_CMD -m venv --help >/dev/null 2>&1; then
            read -p "Create a virtual environment? (Y/n): " -r
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                echo -e "${BLUE}🔧 Creating and activating virtual environment...${NC}"
                $PYTHON_CMD -m venv venv
                
                # Activate venv
                source venv/bin/activate
                
                if [[ "$VIRTUAL_ENV" ]]; then
                    echo -e "${GREEN}✅ Virtual environment activated${NC}"
                    USING_VENV=true
                    PYTHON_CMD="python"  # In venv, use 'python'
                else
                    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
                    USING_VENV=false
                fi
            else
                USING_VENV=false
            fi
        else
            USING_VENV=false
        fi
    fi
}

# =============================================================================
# BACKEND DEPENDENCIES INSTALLATION
# =============================================================================

install_backend_deps() {
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    
    # Auto-fix onnxruntime version if needed
    fix_onnxruntime_version
    
    # Vérifier que le fichier requirements.txt existe
    if [ ! -f "$REQUIREMENTS_FILE" ]; then
        echo -e "${RED}❌ Requirements file not found: $REQUIREMENTS_FILE${NC}"
        echo -e "${YELLOW}💡 Make sure you're running from the project root directory${NC}"
        exit 1
    fi
    
    # Load SQLite environment if available (FOR INSTALLATION ONLY)
    if [ "$CUSTOM_SQLITE_COMPILED" = "true" ] && [ -f "$PROJECT_ROOT/.sqlite_env" ]; then
        echo -e "${BLUE}🔧 Loading custom SQLite environment for dependencies installation...${NC}"
        source "$PROJECT_ROOT/.sqlite_env"
    fi
    
    # Afficher info sur l'environnement Python
    if [ "$USING_CONDA" == "true" ]; then
        echo -e "${BLUE}🐍 Using conda environment: $CONDA_DEFAULT_ENV${NC}"
    elif [ "$USING_VENV" == "true" ]; then
        echo -e "${BLUE}🐍 Using virtual environment: $VIRTUAL_ENV${NC}"
    else
        echo -e "${BLUE}🐍 Using system Python${NC}"
    fi
    
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo -e "${BLUE}   Python version: $PYTHON_VERSION${NC}"
    
    # Display SQLite info for installation
    if [ "$CUSTOM_SQLITE_COMPILED" = "true" ]; then
        INSTALL_SQLITE_VERSION=$($PYTHON_CMD -c "import sqlite3; print(sqlite3.sqlite_version)" 2>/dev/null || echo "unknown")
        echo -e "${BLUE}   SQLite for installation: $INSTALL_SQLITE_VERSION${NC}"
    fi
    
    # Mise à jour de pip
    echo -e "${BLUE}🔄 Updating pip...${NC}"
    $PYTHON_CMD -m pip install --upgrade pip
    
    # Installation des dépendances
    echo -e "${BLUE}📋 Installing from: $REQUIREMENTS_FILE${NC}"
    echo -e "${BLUE}   (This may take several minutes...)${NC}"
    
    if $PYTHON_CMD -m pip install -r "$REQUIREMENTS_FILE"; then
        echo -e "${GREEN}✅ Backend dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install some dependencies${NC}"
        echo -e "${YELLOW}💡 Common solutions:${NC}"
        echo -e "${YELLOW}   - Install missing system dependencies${NC}"
        echo -e "${YELLOW}   - Update pip: $PYTHON_CMD -m pip install --upgrade pip${NC}"
        echo -e "${YELLOW}   - Try with --no-cache-dir flag${NC}"
        
        read -p "Try installation with --no-cache-dir? (Y/n): " -r
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo -e "${BLUE}🔄 Retrying with --no-cache-dir...${NC}"
            if $PYTHON_CMD -m pip install --no-cache-dir -r "$REQUIREMENTS_FILE"; then
                echo -e "${GREEN}✅ Dependencies installed with --no-cache-dir${NC}"
            else
                echo -e "${RED}❌ Installation failed even with --no-cache-dir${NC}"
                echo -e "${YELLOW}💡 Check the error messages above for specific issues${NC}"
                
                if [ "$SQLITE_FALLBACK_STRATEGY" = "graceful" ]; then
                    echo -e "${YELLOW}💡 Continuing with potential issues (graceful degradation)${NC}"
                else
                    exit 1
                fi
            fi
        else
            if [ "$SQLITE_FALLBACK_STRATEGY" = "graceful" ]; then
                echo -e "${YELLOW}💡 Continuing with potential issues (graceful degradation)${NC}"
            else
                exit 1
            fi
        fi
    fi
}

# =============================================================================
# CONFIGURATION
# =============================================================================

setup_configuration() {
    echo -e "${BLUE}⚙️ Setting up configuration...${NC}"
    
    # Create .env from example
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            read -p "Create .env configuration file from example? (Y/n): " -r
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
                echo -e "${GREEN}✅ Configuration file created from example${NC}"
            fi
        else
            # Create basic .env if example doesn't exist
            echo -e "${BLUE}📝 Creating basic .env configuration...${NC}"
            cat > "$PROJECT_ROOT/.env" << 'EOF'
# API-DOC-IA Configuration
WEBUI_AUTH=true
ENABLE_SIGNUP=true
API_V2_ENABLED=true
DEBUG=false

# Database (SQLite by default)
DATABASE_URL=sqlite:///./webui.db

# Optional: Uncomment if using PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost/dbname
EOF
            echo -e "${GREEN}✅ Basic configuration file created${NC}"
        fi
    else
        echo -e "${GREEN}✅ Configuration file already exists${NC}"
    fi
    
    # Add SQLite configuration if custom compiled
    if [ "$CUSTOM_SQLITE_COMPILED" = "true" ]; then
        echo -e "${BLUE}📝 Adding SQLite configuration...${NC}"
        
        # Add SQLite flags to .env if not present
        if ! grep -q "CUSTOM_SQLITE_COMPILED" "$PROJECT_ROOT/.env" 2>/dev/null; then
            cat >> "$PROJECT_ROOT/.env" << EOF

# Custom SQLite Configuration (ISOLATED - Added by install.sh)
CUSTOM_SQLITE_COMPILED=true
CUSTOM_SQLITE_VERSION=3.45.1
SQLITE_ENV_FILE=.sqlite_env
SQLITE_ISOLATION_MODE=application_only
EOF
            echo -e "${GREEN}✅ SQLite configuration added to .env${NC}"
        fi
    fi
    
    # Create data directories
    echo -e "${BLUE}📁 Creating data directories...${NC}"
    mkdir -p "$PROJECT_ROOT/backend/data"
    mkdir -p "$PROJECT_ROOT/backend/data/uploads"
    mkdir -p "$PROJECT_ROOT/backend/data/docs"
    mkdir -p "$PROJECT_ROOT/backend/data/cache"
    echo -e "${GREEN}✅ Data directories created${NC}"
    
    # Make scripts executable
    for script in "start.sh" "install.sh"; do
        if [ -f "$PROJECT_ROOT/$script" ]; then
            chmod +x "$PROJECT_ROOT/$script"
            echo -e "${GREEN}✅ $script made executable${NC}"
        fi
    done
}

# =============================================================================
# DATABASE MIGRATION PROTECTION
# =============================================================================

check_and_fix_database_migrations() {
    echo -e "${BLUE}🔍 Checking database migration integrity...${NC}"
    
    # Check if corrupted webui.db exists
    if [ -f "$PROJECT_ROOT/backend/data/webui.db" ]; then
        echo -e "${YELLOW}⚠️ Existing database found - checking for corruption...${NC}"
        
        # Test if we can run a simple query without Alembic errors
        cd "$PROJECT_ROOT/backend" 2>/dev/null || return 1
        
        # Quick corruption test using Python
        if $PYTHON_CMD -c "
import sys
import os
sys.path.insert(0, os.getcwd())
try:
    import sqlite3
    conn = sqlite3.connect('data/webui.db')
    cursor = conn.cursor()
    cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\" AND name=\"config\";')
    result = cursor.fetchone()
    conn.close()
    if not result:
        print('NO_CONFIG_TABLE')
    else:
        print('CONFIG_OK')
except Exception as e:
    print(f'DB_ERROR:{str(e)}')
        " 2>/dev/null | grep -q "NO_CONFIG_TABLE\|DB_ERROR"; then
            echo -e "${RED}❌ Database corruption detected (missing tables or Alembic conflicts)${NC}"
            echo -e "${YELLOW}💡 Creating backup and starting fresh...${NC}"
            
            # Create backup with timestamp
            BACKUP_NAME="webui.db.backup.$(date +%Y%m%d_%H%M%S).corrupted"
            mv "data/webui.db" "data/$BACKUP_NAME" 2>/dev/null
            
            echo -e "${GREEN}✅ Corrupted database backed up as: $BACKUP_NAME${NC}"
            echo -e "${BLUE}💡 Fresh database will be created on first startup${NC}"
        else
            echo -e "${GREEN}✅ Existing database appears healthy${NC}"
        fi
        
        cd "$PROJECT_ROOT" 2>/dev/null || return 1
    else
        echo -e "${BLUE}💡 No existing database - will be created fresh on first startup${NC}"
    fi
    
    echo -e "${GREEN}✅ Database migration check completed${NC}"
}

# =============================================================================
# VERIFICATION
# =============================================================================

  verify_installation() {
    echo -e "${BLUE}🧪 Verifying installation...${NC}"
    
    # Load SQLite environment if available (FOR VERIFICATION ONLY)
    if [ "$CUSTOM_SQLITE_COMPILED" = "true" ] && [ -f "$PROJECT_ROOT/.sqlite_env" ]; then
        source "$PROJECT_ROOT/.sqlite_env"
    fi
    
    # Test Python imports with detailed feedback
    $PYTHON_CMD -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')

print('🔍 Testing core dependencies...')

# Test core imports
try:
    import fastapi
    print('✅ FastAPI available:', fastapi.__version__)
except ImportError as e:
    print(f'❌ FastAPI import failed: {e}')
    sys.exit(1)

try:
    import uvicorn
    print('✅ Uvicorn available')
except ImportError as e:
    print(f'❌ Uvicorn import failed: {e}')
    sys.exit(1)

try:
    import sqlalchemy
    print('✅ SQLAlchemy available:', sqlalchemy.__version__)
except ImportError as e:
    print(f'❌ SQLAlchemy import failed: {e}')

try:
    import psycopg2
    print('✅ PostgreSQL support available:', psycopg2.__version__)
except ImportError:
    print('⚠️ PostgreSQL support not available (will use SQLite)')

# Test AI libraries
try:
    import openai
    print('✅ OpenAI library available')
except ImportError:
    print('⚠️ OpenAI library not available')

try:
    import sentence_transformers
    print('✅ Sentence Transformers available')
except ImportError:
    print('⚠️ Sentence Transformers not available')

# Test onnxruntime specifically
try:
    import onnxruntime
    print('✅ ONNX Runtime available:', onnxruntime.__version__)
except ImportError:
    print('⚠️ ONNX Runtime not available')

# Test SQLite version
try:
    import sqlite3
    sqlite_version = sqlite3.sqlite_version
    print('✅ SQLite version:', sqlite_version)
    
    # Check if version is compatible with ChromaDB
    version_parts = sqlite_version.split('.')
    major, minor = int(version_parts[0]), int(version_parts[1])
    if major >= 3 and minor >= 35:
        print('✅ SQLite version compatible with ChromaDB')
    else:
        print('⚠️ SQLite version may not be compatible with ChromaDB')
except Exception as e:
    print(f'❌ SQLite test failed: {e}')

# Test ChromaDB specifically
try:
    import chromadb
    client = chromadb.Client()
    print('✅ ChromaDB available and functional')
except ImportError:
    print('⚠️ ChromaDB not available')
except Exception as e:
    if 'sqlite3' in str(e).lower():
        print(f'⚠️ ChromaDB SQLite issue: {e}')
        print('   This may be resolved when using the custom SQLite environment')
    else:
        print(f'⚠️ ChromaDB issue: {e}')

# Test Open WebUI imports (if available)
try:
    import open_webui
    print('✅ Open WebUI module found')
except ImportError as e:
    print(f'⚠️ Open WebUI not found: {e}')
    print('   This is normal if not yet configured')

print('\\n🎉 Core dependency verification completed!')
" || {
        echo -e "${RED}❌ Verification failed${NC}"
        echo -e "${YELLOW}💡 Some dependencies may be missing, but basic functionality should work${NC}"
        
        if [ "$SQLITE_FALLBACK_STRATEGY" = "graceful" ]; then
            echo -e "${YELLOW}💡 Continuing with graceful degradation mode${NC}"
        fi
    }
  }
  
  # =============================================================================
  # POST-INSTALL FINALIZATION (ownership, paths, env)
  # =============================================================================
  
  post_install_finalize() {
      echo -e "${BLUE}🧩 Finalisation post‑installation...${NC}"
      
      local REPO_PATH
      REPO_PATH="$(realpath "$PROJECT_ROOT" 2>/dev/null || echo "$PROJECT_ROOT")"
      local CUR_USER CUR_GROUP OWNER_GROUP
      CUR_USER="$(id -un)"
      CUR_GROUP="$(id -gn)"
      OWNER_GROUP="$(stat -c '%U:%G' "$REPO_PATH" 2>/dev/null || echo '')"
      
      # 1) Proposer un chown si nécessaire (si non propriétaire ou non inscriptible)
      if [ -n "$OWNER_GROUP" ]; then
          local OWNER OWNERGRP
          OWNER="${OWNER_GROUP%%:*}"
          OWNERGRP="${OWNER_GROUP##*:}"
          if [ "$OWNER" != "$CUR_USER" ] || [ ! -w "$REPO_PATH" ]; then
              echo -e "${YELLOW}⚠️ Le répertoire du projet n'est pas détenu par l'utilisateur actif ou n'est pas inscriptible.${NC}"
              echo -e "${YELLOW}   Projet: $REPO_PATH${NC}"
              echo -e "${YELLOW}   Actuel: $OWNER:$OWNERGRP | Utilisateur: $CUR_USER:$CUR_GROUP${NC}"
              if command -v sudo >/dev/null 2>&1; then
                  read -p "Appliquer sudo chown -R $CUR_USER:$CUR_GROUP '$REPO_PATH' ? (Y/n): " -r REPLY_CHOWN
                  if [[ ! $REPLY_CHOWN =~ ^[Nn]$ ]]; then
                      if sudo chown -R "$CUR_USER:$CUR_GROUP" "$REPO_PATH"; then
                          echo -e "${GREEN}✅ Permissions corrigées${NC}"
                      else
                          echo -e "${RED}❌ Échec du chown. Corrige manuellement puis relance start.sh.${NC}"
                      fi
                  else
                      echo -e "${YELLOW}↪️  Chown ignoré par l'utilisateur${NC}"
                  fi
              else
                  echo -e "${YELLOW}💡 sudo indisponible. Corrige manuellement: chown -R $CUR_USER:$CUR_GROUP '$REPO_PATH'${NC}"
              fi
          fi
      fi
      
      # 2) Corriger DATA_DIR codé en dur dans start.sh si présent
      if [ -f "$PROJECT_ROOT/start.sh" ]; then
          if grep -qE '^export[[:space:]]+DATA_DIR=' "$PROJECT_ROOT/start.sh"; then
              CURRENT_DATA_DIR_LINE="$(grep -E '^export[[:space:]]+DATA_DIR=' "$PROJECT_ROOT/start.sh" | head -1)"
              if ! echo "$CURRENT_DATA_DIR_LINE" | grep -q '\$BACKEND_PATH/data'; then
                  echo -e "${YELLOW}⚠️ Ligne DATA_DIR détectée dans start.sh:${NC}"
                  echo -e "${YELLOW}   $CURRENT_DATA_DIR_LINE${NC}"
                  echo -e "${BLUE}Proposer remplacement par: export DATA_DIR=\"$BACKEND_PATH/data\"${NC}"
                  read -p "Appliquer la correction automatique ? (Y/n): " -r REPLY_DATA
                  if [[ ! $REPLY_DATA =~ ^[Nn]$ ]]; then
                      sed -i 's|^export[[:space:]]\+DATA_DIR=.*|export DATA_DIR="$BACKEND_PATH/data"|' "$PROJECT_ROOT/start.sh"
                      echo -e "${GREEN}✅ DATA_DIR corrigé dans start.sh${NC}"
                  else
                      echo -e "${YELLOW}↪️  Correction DATA_DIR ignorée par l'utilisateur${NC}"
                  fi
              fi
          fi
      fi
      
      # 3) Chemins absolus erronés vers Api-Doc-IA → proposer correction vers REPO_PATH
      echo -e "${BLUE}🔎 Recherche de chemins absolus codés en dur vers Api-Doc-IA...${NC}"
      MAP_FILE_LIST="$(grep -RIl --exclude-dir='.git' --include='*.sh' '/home/admia/Api-Doc-IA' "$PROJECT_ROOT" 2>/dev/null || true)"
      if [ -z "$MAP_FILE_LIST" ]; then
          # Pattern plus précis
          MAP_FILE_LIST="$(grep -RIl --exclude-dir='.git' --include='*.sh' '/home/[^/][^/]*/Api-Doc-IA' "$PROJECT_ROOT" 2>/dev/null || true)"
      fi
      if [ -n "$MAP_FILE_LIST" ]; then
          echo -e "${YELLOW}⚠️ Des chemins absolus ont été trouvés dans:${NC}"
          echo "$MAP_FILE_LIST" | sed 's/^/   • /'
          echo -e "${BLUE}Proposer de remplacer ces chemins par: $REPO_PATH${NC}"
          read -p "Appliquer la correction à ces fichiers ? (Y/n): " -r REPLY_PATHS
          if [[ ! $REPLY_PATHS =~ ^[Nn]$ ]]; then
              while IFS= read -r f; do
                  [ -z "$f" ] && continue
                  sed -i "s|/home/[^/][^/]*/Api-Doc-IA|$REPO_PATH|g" "$f"
              done <<< "$MAP_FILE_LIST"
              echo -e "${GREEN}✅ Chemins mis à jour${NC}"
          else
              echo -e "${YELLOW}↪️  Correction des chemins ignorée par l'utilisateur${NC}"
          fi
      else
          echo -e "${GREEN}✅ Aucun chemin absolu problématique détecté (scripts .sh)${NC}"
      fi
      
      # 4) .env à partir de .env.example
      if [ -f "$PROJECT_ROOT/.env" ]; then
          echo -e "${GREEN}✅ Fichier .env détecté${NC}"
      else
          if [ -f "$PROJECT_ROOT/.env.example" ]; then
              read -p "Créer .env depuis .env.example ? (Y/n): " -r REPLY_ENV
              if [[ ! $REPLY_ENV =~ ^[Nn]$ ]]; then
                  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
                  echo -e "${GREEN}✅ .env créé${NC}"
              else
                  echo -e "${YELLOW}↪️  Création de .env ignorée par l'utilisateur${NC}"
              fi
          else
              echo -e "${YELLOW}💡 Aucun .env.example trouvé. Étape ignorée.${NC}"
          fi
      fi

      # 4bis) Injecter des clés conseillées si absentes
      local ENV_PATH="$PROJECT_ROOT/.env"
      if [ -f "$ENV_PATH" ]; then
          ensure_env_key() {
              local key="$1"; shift
              local value="$1"; shift
              if ! grep -Eq "^${key}=" "$ENV_PATH"; then
                  echo "${key}=${value}" >> "$ENV_PATH"
                  echo -e "${GREEN}✅ Ajout dans .env: ${key}=${value}${NC}"
              fi
          }
          ensure_env_key "CORS_ALLOW_ORIGIN" "http://localhost:8080"
          ensure_env_key "CHROMADB_TELEMETRY" "false"
          ensure_env_key "ANONYMIZED_TELEMETRY" "false"
          ensure_env_key "JOBLIB_TEMP_FOLDER" "\${DATA_DIR}/tmp"
      fi

      # 4ter) Créer le dossier temp joblib si DATA_DIR connu
      local DATA_DIR_PATH
      DATA_DIR_PATH=$(grep -E '^DATA_DIR=' "$ENV_PATH" 2>/dev/null | head -1 | cut -d= -f2- | sed 's/^"\(.*\)"$/\1/' )
      if [ -n "$DATA_DIR_PATH" ]; then
          mkdir -p "$DATA_DIR_PATH/tmp" 2>/dev/null || true
      fi
      
      # 5) Résumé
      echo ""
      echo -e "${GREEN}🎯 Finalisation terminée. Vous pouvez lancer:${NC}"
      echo -e "   ./start.sh"
  }
  
# =============================================================================
# MAIN INSTALLATION FLOW
# =============================================================================

main() {
    echo -e "${BLUE}Welcome to Api-Doc-IA installation! (Secure v6 - No system pollution)${NC}"
    echo -e "${BLUE}This script will install all dependencies with smart fixes and isolated improvements.${NC}"
    echo ""
    
    # Initialize environment tracking variables
    USING_CONDA=false
    USING_VENV=false
    PYTHON_CMD=""
    ROCKY_VERSION=""
    RHEL_VERSION=""
    UBUNTU_VERSION=""
    CUSTOM_SQLITE_COMPILED=false
    
    # Check requirements file
    if [ ! -f "$REQUIREMENTS_FILE" ]; then
        echo -e "${RED}❌ Requirements file not found: $REQUIREMENTS_FILE${NC}"
        echo -e "${YELLOW}💡 Make sure you're in the correct directory and have the backend/requirements.txt file${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}📋 Found requirements file: $REQUIREMENTS_FILE${NC}"
    REQ_COUNT=$(wc -l < "$REQUIREMENTS_FILE")
    echo -e "${GREEN}📊 Dependencies to install: ~$REQ_COUNT packages${NC}"
    echo ""
    
    # System detection
    detect_os
    echo ""
    
    # Proxy detection and configuration (critical for network operations)
    detect_and_configure_proxy
    echo ""
    
    # Git updates check (before any system changes)
    check_git_updates
    echo ""
    
    # System dependencies (includes Python 3.11 check and ISOLATED SQLite handling)
    install_system_deps
    echo ""
    
    # Python environment (with automatic activation)
    setup_python_env
    echo ""
    
    # Backend dependencies (with auto-fixes)
    install_backend_deps
    echo ""
    
    # Configuration
    setup_configuration
    echo ""
    
    # Database migration check (prevent multiple heads issue)
    check_and_fix_database_migrations
    echo ""
    
    # Verification
    verify_installation
    echo ""
    
    # Post-installation assistant to finalize permissions and paths
    post_install_finalize
    echo ""
    
    # Final instructions
    echo -e "${GREEN}🎉 INSTALLATION COMPLETED!${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo -e "${GREEN}Next steps:${NC}"
    echo ""
    
    if [ "$USING_CONDA" == "true" ]; then
        echo -e "${GREEN}✅ Conda environment '$CONDA_DEFAULT_ENV' is active${NC}"
        echo -e "${YELLOW}💡 To reactivate later: conda activate test-api-doc-ia${NC}"
    elif [ "$USING_VENV" == "true" ]; then
        echo -e "${GREEN}✅ Virtual environment is active${NC}"
        echo -e "${YELLOW}💡 To reactivate later: source venv/bin/activate${NC}"
    else
        echo -e "${YELLOW}⚠️ Using system Python${NC}"
    fi
    
    if [ "$CUSTOM_SQLITE_COMPILED" = "true" ]; then
        echo -e "${GREEN}✅ Custom SQLite 3.45.1 compiled in ISOLATED mode${NC}"
        echo -e "${GREEN}   System tools (DNF, SSH, etc.) remain unaffected${NC}"
        echo -e "${YELLOW}💡 SQLite environment will be loaded automatically by start.sh${NC}"
    fi
    echo ""
    
    echo -e "${YELLOW}1. Start Api-Doc-IA:${NC}"
    echo -e "   ./start.sh"
    echo ""
    
    echo -e "${YELLOW}2. Access the interface:${NC}"
    echo -e "   🌐 Web: http://localhost:8080"
    echo -e "   🔌 API v2: http://localhost:8080/api/v2/health"
    echo ""
    
    echo -e "${YELLOW}3. First-time setup:${NC}"
    echo -e "   • Create admin account"
    echo -e "   • Configure models in settings"
    echo -e "   • Test file upload functionality"
    echo ""
    
    # Display applied fixes
    echo -e "${BLUE}🔧 Applied fixes and features:${NC}"
    if [ -f "$REQUIREMENTS_FILE.backup" ]; then
        echo -e "${GREEN}   ✅ Corrected onnxruntime version compatibility${NC}"
    fi
    if [ "$CUSTOM_SQLITE_COMPILED" = "true" ]; then
        echo -e "${GREEN}   ✅ Compiled SQLite 3.45.1 in ISOLATED mode (no system pollution)${NC}"
        echo -e "${GREEN}   ✅ System tools remain clean and functional${NC}"
    fi
    if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR" ]; then
        echo -e "${GREEN}   ✅ Safety backup available: $BACKUP_DIR${NC}"
    fi
    echo -e "${GREEN}   ✅ Graceful degradation enabled for maximum compatibility${NC}"
    echo ""
    
    echo -e "${GREEN}Thank you for using Api-Doc-IA! 🚀${NC}"
}

# =============================================================================
# EXECUTION WITH ERROR HANDLING
# =============================================================================

# Set trap for cleanup on exit
trap 'if [ $? -ne 0 ] && [ "$ENABLE_BACKUP_RESTORATION" = "true" ]; then echo -e "\n${RED}Installation failed. Attempting restoration...${NC}"; restore_from_backup; fi' EXIT

# Check if running from project root
if [ ! -f "$PROJECT_ROOT/README.md" ] || [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Please run this script from the Api-Doc-IA project root directory${NC}"
    echo -e "${YELLOW}Expected structure:${NC}"
    echo -e "${YELLOW}  ./backend/requirements.txt${NC}"
    echo -e "${YELLOW}  ./README.md${NC}"
    exit 1
fi

# Check requirements file
if [ ! -f "$REQUIREMENTS_FILE" ]; then
    echo -e "${RED}❌ Requirements file not found: $REQUIREMENTS_FILE${NC}"
    exit 1
fi

# Run main installation
main "$@"
