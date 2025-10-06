#!/bin/bash

# 🚀 Predator Analytics - Web Interface Launcher
# Production-ready startup script

echo "🚀 Starting Predator Analytics Web Interface..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if port 5090 is already in use
if lsof -Pi :5090 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 5090 is already in use${NC}"
    echo -e "${BLUE}🔍 Checking existing process...${NC}"
    lsof -i :5090
    
    read -p "Kill existing process and restart? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔪 Killing process on port 5090...${NC}"
        pkill -f "vite.*5090"
        sleep 2
    else
        echo -e "${GREEN}✅ Interface already running at http://localhost:5090${NC}"
        exit 0
    fi
fi

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Clear Vite cache
echo -e "${BLUE}🧹 Clearing Vite cache...${NC}"
rm -rf node_modules/.vite
rm -rf dist

# Start Vite dev server
echo -e "${GREEN}🚀 Starting Vite development server on port 5090...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ Web Interface Features:${NC}"
echo -e "  🤖 26 AI Agents Visualization"
echo -e "  ♻️  Self-Healing System"
echo -e "  🧠 Self-Learning Progress"
echo -e "  📈 Self-Improvement Analytics"
echo -e "  📊 Real-Time Metrics"
echo -e "  🎮 Interactive Game-Like UI"
echo ""
echo -e "${GREEN}🌐 Opening: ${BLUE}http://localhost:5090${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start server
npm run dev -- --port 5090 --host

# If server stops
echo ""
echo -e "${RED}❌ Server stopped${NC}"
