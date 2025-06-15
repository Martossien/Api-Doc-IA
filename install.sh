#!/bin/bash

# =============================================================================
# 🚀 API-DOC-IA INSTALLATION SCRIPT (IMPROVED v4)
# =============================================================================
# Détection automatique et corrections : Python 3.11 + onnxruntime
# =============================================================================

set -e

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
echo -e "${BLUE}🚀 API-DOC-IA INSTALLATION (IMPROVED v4)${NC}"
echo -e "${BLUE}============================================${NC}"

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
            fi
            
            # Standard system dependencies
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
                $SUDO_CMD apt update
                $SUDO_CMD apt install -y "${ESSENTIAL_DEPS[@]}"
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
                    $SUDO_CMD apt update
                    $SUDO_CMD apt install -y "${DEPS_NEEDED[@]}"
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
        $SUDO_CMD apt update
        $SUDO_CMD apt install -y software-properties-common
    fi
    
    # Add deadsnakes PPA for Python 3.11
    echo -e "${BLUE}📦 Adding deadsnakes PPA for Python 3.11...${NC}"
    $SUDO_CMD add-apt-repository ppa:deadsnakes/ppa -y
    $SUDO_CMD apt update
    
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
# PYTHON ENVIRONMENT SETUP
# =============================================================================

setup_python_env() {
    echo -e "${BLUE}🐍 Setting up Python environment...${NC}"
    
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
    
    # Check if conda is available
    if command -v conda >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Conda found${NC}"
        
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
                exit 1
            fi
        else
            exit 1
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
# VERIFICATION
# =============================================================================

verify_installation() {
    echo -e "${BLUE}🧪 Verifying installation...${NC}"
    
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
    }
}

# =============================================================================
# MAIN INSTALLATION FLOW
# =============================================================================

main() {
    echo -e "${BLUE}Welcome to Api-Doc-IA installation! (Auto-correcting version)${NC}"
    echo -e "${BLUE}This script will install all dependencies with smart fixes for compatibility.${NC}"
    echo ""
    
    # Initialize environment tracking variables
    USING_CONDA=false
    USING_VENV=false
    PYTHON_CMD=""
    ROCKY_VERSION=""
    RHEL_VERSION=""
    UBUNTU_VERSION=""
    
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
    
    # System dependencies (includes Python 3.11 check for Ubuntu/Rocky)
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
    
    # Verification
    verify_installation
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
    echo ""
    
    echo -e "${YELLOW}1. Start Api-Doc-IA:${NC}"
    echo -e "   ./start.sh"
    echo ""
    
    echo -e "${YELLOW}2. Access the interface:${NC}"
    echo -e "   🌐 Web: http://localhost:8080"
    echo -e "   🔌 API: http://localhost:8080/api/v2/health"
    echo ""
    
    echo -e "${YELLOW}3. First-time setup:${NC}"
    echo -e "   • Create admin account"
    echo -e "   • Configure models in settings"
    echo -e "   • Test file upload functionality"
    echo ""
    
    # Display applied fixes
    if [ -f "$REQUIREMENTS_FILE.backup" ]; then
        echo -e "${BLUE}🔧 Applied fixes:${NC}"
        echo -e "${GREEN}   ✅ Corrected onnxruntime version compatibility${NC}"
    fi
    
    echo -e "${GREEN}Thank you for using Api-Doc-IA! 🚀${NC}"
}

# =============================================================================
# EXECUTION
# =============================================================================

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