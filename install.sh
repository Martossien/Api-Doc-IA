#!/bin/bash

# =============================================================================
# 🚀 API-DOC-IA INSTALLATION SCRIPT
# =============================================================================
# Automated installation script for Api-Doc-IA
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

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🚀 API-DOC-IA INSTALLATION${NC}"
echo -e "${BLUE}============================================${NC}"

# =============================================================================
# SYSTEM CHECK
# =============================================================================

check_system() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${GREEN}✅ Linux detected${NC}"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${GREEN}✅ macOS detected${NC}"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo -e "${YELLOW}⚠️ Windows detected - WSL recommended${NC}"
    else
        echo -e "${YELLOW}⚠️ Unknown OS: $OSTYPE${NC}"
    fi
    
    # Check Python
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        echo -e "${GREEN}✅ Python 3 found: $PYTHON_VERSION${NC}"
        
        # Check if Python 3.11+
        if python3 -c "import sys; assert sys.version_info >= (3, 11)" 2>/dev/null; then
            echo -e "${GREEN}✅ Python version is compatible${NC}"
        else
            echo -e "${YELLOW}⚠️ Python 3.11+ recommended, found: $PYTHON_VERSION${NC}"
        fi
    else
        echo -e "${RED}❌ Python 3 not found${NC}"
        echo -e "${YELLOW}💡 Please install Python 3.11+ first${NC}"
        exit 1
    fi
    
    # Check Node.js (optional)
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️ Node.js not found (optional for development)${NC}"
    fi
    
    # Check Git
    if command -v git >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Git found${NC}"
    else
        echo -e "${YELLOW}⚠️ Git not found (recommended)${NC}"
    fi
}

# =============================================================================
# PYTHON ENVIRONMENT SETUP
# =============================================================================

setup_python_env() {
    echo -e "${BLUE}🐍 Setting up Python environment...${NC}"
    
    # Check if conda is available
    if command -v conda >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Conda found${NC}"
        
        read -p "Do you want to create a dedicated conda environment? (Y/n): " -r
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo -e "${BLUE}🔧 Creating conda environment 'api-doc-ia'...${NC}"
            
            if conda env list | grep -q "api-doc-ia"; then
                echo -e "${YELLOW}⚠️ Environment 'api-doc-ia' already exists${NC}"
                read -p "Remove and recreate? (y/N): " -r
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    conda env remove -n api-doc-ia
                    conda create -n api-doc-ia python=3.11 -y
                fi
            else
                conda create -n api-doc-ia python=3.11 -y
            fi
            
            echo -e "${GREEN}✅ Conda environment created${NC}"
            echo -e "${YELLOW}💡 Activate with: conda activate api-doc-ia${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Conda not found, using system Python${NC}"
        
        # Check if venv is available
        if python3 -m venv --help >/dev/null 2>&1; then
            read -p "Create a virtual environment? (Y/n): " -r
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                echo -e "${BLUE}🔧 Creating virtual environment...${NC}"
                python3 -m venv venv
                echo -e "${GREEN}✅ Virtual environment created${NC}"
                echo -e "${YELLOW}💡 Activate with: source venv/bin/activate${NC}"
            fi
        fi
    fi
}

# =============================================================================
# DEPENDENCIES INSTALLATION
# =============================================================================

install_backend_deps() {
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    
    if [ -f "$BACKEND_PATH/requirements.txt" ]; then
        pip install -r "$BACKEND_PATH/requirements.txt"
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠️ requirements.txt not found, trying alternative installation${NC}"
        
        # Try to install Open WebUI directly
        pip install open-webui
        
        # Install additional dependencies that might be needed
        pip install uvicorn fastapi python-multipart
    fi
}

install_frontend_deps() {
    if command -v npm >/dev/null 2>&1 && [ -f "$PROJECT_ROOT/package.json" ]; then
        echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
        
        read -p "Install frontend dependencies? (Y/n): " -r
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            npm install
            echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Skipping frontend dependencies (npm not found or no package.json)${NC}"
    fi
}

# =============================================================================
# CONFIGURATION
# =============================================================================

setup_configuration() {
    echo -e "${BLUE}⚙️ Setting up configuration...${NC}"
    
    # Create .env from example
    if [ ! -f "$PROJECT_ROOT/.env" ] && [ -f "$PROJECT_ROOT/.env.example" ]; then
        read -p "Create .env configuration file? (Y/n): " -r
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            echo -e "${GREEN}✅ Configuration file created${NC}"
            echo -e "${YELLOW}💡 Edit .env file to customize settings${NC}"
        fi
    fi
    
    # Create data directories
    echo -e "${BLUE}📁 Creating data directories...${NC}"
    mkdir -p "$PROJECT_ROOT/backend/data"
    mkdir -p "$PROJECT_ROOT/backend/data/uploads"
    mkdir -p "$PROJECT_ROOT/backend/data/docs"
    echo -e "${GREEN}✅ Data directories created${NC}"
    
    # Make scripts executable
    if [ -f "$PROJECT_ROOT/start.sh" ]; then
        chmod +x "$PROJECT_ROOT/start.sh"
        echo -e "${GREEN}✅ Start script made executable${NC}"
    fi
}

# =============================================================================
# VERIFICATION
# =============================================================================

verify_installation() {
    echo -e "${BLUE}🧪 Verifying installation...${NC}"
    
    # Test Python imports
    python3 -c "
import sys
sys.path.insert(0, '$BACKEND_PATH')
try:
    import open_webui
    print('✅ Open WebUI module found')
except ImportError as e:
    print(f'❌ Open WebUI import failed: {e}')
    sys.exit(1)

try:
    from open_webui.routers import api_v2
    print('✅ API v2 module found')
except ImportError as e:
    print(f'⚠️ API v2 module not found: {e}')
    print('   This might be normal if using a clean Open WebUI installation')
" || echo -e "${YELLOW}⚠️ Some verification tests failed${NC}"
    
    echo -e "${GREEN}✅ Installation verification completed${NC}"
}

# =============================================================================
# MAIN INSTALLATION FLOW
# =============================================================================

main() {
    echo -e "${BLUE}Welcome to Api-Doc-IA installation!${NC}"
    echo -e "${BLUE}This script will help you set up Api-Doc-IA on your system.${NC}"
    echo ""
    
    # System check
    check_system
    echo ""
    
    # Python environment
    setup_python_env
    echo ""
    
    # Dependencies
    install_backend_deps
    echo ""
    
    install_frontend_deps
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
    
    if command -v conda >/dev/null 2>&1 && conda env list | grep -q "api-doc-ia"; then
        echo -e "${YELLOW}1. Activate conda environment:${NC}"
        echo -e "   conda activate api-doc-ia"
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${YELLOW}2. Review and edit configuration:${NC}"
        echo -e "   nano .env"
        echo ""
    fi
    
    echo -e "${YELLOW}3. Start Api-Doc-IA:${NC}"
    if [ -f "$PROJECT_ROOT/start.sh" ]; then
        echo -e "   ./start.sh"
    else
        echo -e "   python -m uvicorn open_webui.main:app --host 0.0.0.0 --port 8080"
    fi
    echo ""
    
    echo -e "${YELLOW}4. Access the interface:${NC}"
    echo -e "   🌐 Web: http://localhost:8080"
    echo -e "   🔌 API: http://localhost:8080/api/v2/health"
    echo -e "   📖 Docs: http://localhost:8080/docs"
    echo ""
    
    echo -e "${BLUE}For more information, see:${NC}"
    echo -e "   📚 INSTALLATION.md"
    echo -e "   📖 API_DOCUMENTATION.md"
    echo -e "   🏗️ ARCHITECTURE.md"
    echo ""
    
    echo -e "${GREEN}Thank you for using Api-Doc-IA! 🚀${NC}"
}

# =============================================================================
# EXECUTION
# =============================================================================

# Check if running from project root
if [ ! -f "$PROJECT_ROOT/README.md" ] || [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Please run this script from the Api-Doc-IA project root directory${NC}"
    exit 1
fi

# Run main installation
main "$@"