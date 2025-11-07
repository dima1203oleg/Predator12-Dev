#!/usr/bin/env bash
# 🎯 PREDATOR12 QUICK STATUS CHECK
# Швидка перевірка статусу всієї системи

set -euo pipefail

# Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🎯 ================================================${NC}"
echo -e "${BLUE}📊 PREDATOR12 SYSTEM STATUS${NC}"
echo -e "${BLUE}🎯 ================================================${NC}"
echo ""

# Перевірка Backend
echo -e "${BLUE}📡 Backend API (port 8000):${NC}"
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ ONLINE${NC}"
    HEALTH=$(curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "{}")
    echo -e "${GREEN}   Response: $HEALTH${NC}"
else
    echo -e "${RED}   ❌ OFFLINE${NC}"
    if [ -f .backend.pid ]; then
        echo -e "${YELLOW}   PID file exists: $(cat .backend.pid)${NC}"
    fi
fi

echo ""

# Перевірка Frontend
echo -e "${BLUE}🌐 Frontend (port 3000):${NC}"
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ ONLINE${NC}"
    echo -e "${GREEN}   URL: http://localhost:3000${NC}"
else
    echo -e "${RED}   ❌ OFFLINE${NC}"
    if [ -f .frontend.pid ]; then
        echo -e "${YELLOW}   PID file exists: $(cat .frontend.pid)${NC}"
    fi
fi

echo ""

# Перевірка Git статусу
echo -e "${BLUE}📦 Git Status:${NC}"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}   ✅ Working tree clean${NC}"
else
    CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
    echo -e "${YELLOW}   ⚠️  $CHANGES files changed${NC}"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}   Branch: ${GREEN}$BRANCH${NC}"

echo ""

# Перевірка процесів
echo -e "${BLUE}🔄 Running Processes:${NC}"
if lsof -ti:8000 >/dev/null 2>&1; then
    PID=$(lsof -ti:8000)
    echo -e "${GREEN}   • Backend: PID $PID${NC}"
fi

if lsof -ti:3000 >/dev/null 2>&1; then
    PID=$(lsof -ti:3000)
    echo -e "${GREEN}   • Frontend: PID $PID${NC}"
fi

echo ""
echo -e "${BLUE}🎯 ================================================${NC}"
echo -e "${BLUE}💡 Commands:${NC}"
echo -e "${YELLOW}   ./auto-approve.sh${NC}    - Auto-approve & restart"
echo -e "${YELLOW}   ./quick-status.sh${NC}    - Check status"
echo -e "${YELLOW}   ./stop-all.sh${NC}        - Stop all services"
echo -e "${BLUE}🎯 ================================================${NC}"
echo ""
