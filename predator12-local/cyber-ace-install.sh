#!/bin/bash

# 📦 CYBER-ACE Dependencies Installer
# Встановлення всіх необхідних залежностей

set -e

echo "📦 =================================="
echo "   CYBER-ACE DEPENDENCIES INSTALLER"
echo "   =================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_DIR="/Users/dima/Documents/Predator12/predator12-local/backend"
FRONTEND_DIR="/Users/dima/Documents/Predator12/predator12-local/frontend"

# Check Python
echo "🔍 Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "   ${GREEN}✓ $PYTHON_VERSION${NC}"
else
    echo -e "   ${RED}✗ Python 3 not found${NC}"
    exit 1
fi

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "   ${GREEN}✓ Node.js $NODE_VERSION${NC}"
else
    echo -e "   ${RED}✗ Node.js not found${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install Backend Dependencies
echo "📦 Installing Backend Dependencies..."
cd "$BACKEND_DIR"

if [ -f "cyber_ace/requirements.txt" ]; then
    echo "   Installing from cyber_ace/requirements.txt..."
    pip3 install -r cyber_ace/requirements.txt
    echo -e "   ${GREEN}✓ Backend dependencies installed${NC}"
else
    echo "   Installing essential packages..."
    pip3 install fastapi uvicorn pydantic python-dotenv openai
    echo -e "   ${GREEN}✓ Essential backend packages installed${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install Frontend Dependencies
echo "📦 Installing Frontend Dependencies..."
cd "$FRONTEND_DIR"

if [ -f "package.json" ]; then
    echo "   Running npm install..."
    npm install
    echo -e "   ${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "   ${RED}✗ package.json not found${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify installations
echo "✅ Verifying installations..."

# Check Backend
echo -n "   Backend (FastAPI): "
if python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo -n "   Backend (Uvicorn): "
if python3 -c "import uvicorn" 2>/dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo -n "   Backend (OpenAI): "
if python3 -c "import openai" 2>/dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Optional${NC}"
fi

# Check Frontend
cd "$FRONTEND_DIR"
echo -n "   Frontend (node_modules): "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure environment: cp backend/cyber_ace/.env.template backend/cyber_ace/.env"
echo "  2. Start backend: ./cyber-ace.sh backend"
echo "  3. Start frontend: ./cyber-ace.sh frontend"
echo "  4. Or use: ./cyber-ace.sh start"
echo ""
