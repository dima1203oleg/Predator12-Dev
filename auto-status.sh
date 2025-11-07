#!/usr/bin/env bash
# 🎯 PREDATOR12 STATUS CHECKER
# Швидка перевірка статусу всієї системи

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🎯 ================================================${NC}"
echo -e "${BLUE}📊 PREDATOR12 SYSTEM STATUS${NC}"
echo -e "${BLUE}🎯 ================================================${NC}"
echo ""

# Backend Status
echo -e "${YELLOW}📡 Backend API:${NC}"
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    BACKEND_STATUS=$(curl -s http://localhost:8000/health)
    echo -e "${GREEN}✅ RUNNING${NC} - http://localhost:8000"
    echo "$BACKEND_STATUS" | python3 -m json.tool 2>/dev/null || echo "$BACKEND_STATUS"
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
fi

echo ""

# Frontend Status
echo -e "${YELLOW}🌐 Frontend:${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ RUNNING${NC} - http://localhost:3000"
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
fi

echo ""

# Git Status
echo -e "${YELLOW}📂 Git Repository:${NC}"
cd /Users/dima/Documents/Predator12
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BRANCH"

if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ Clean working tree${NC}"
else
    CHANGES=$(git status --porcelain | wc -l | xargs)
    echo -e "${YELLOW}⚠️  $CHANGES uncommitted changes${NC}"
fi

echo ""

# Process Status
echo -e "${YELLOW}⚙️  Running Processes:${NC}"
if [ -f .backend.pid ] && ps -p $(cat .backend.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend PID: $(cat .backend.pid)${NC}"
else
    echo -e "${RED}❌ Backend process not found${NC}"
fi

if [ -f .frontend.pid ] && ps -p $(cat .frontend.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend PID: $(cat .frontend.pid)${NC}"
else
    echo -e "${RED}❌ Frontend process not found${NC}"
fi

echo ""
echo -e "${BLUE}🎯 ================================================${NC}"
echo -e "${GREEN}💡 Commands:${NC}"
echo "  Start:  ./auto-approve.sh"
echo "  Stop:   ./auto-stop.sh"
echo "  Status: ./auto-status.sh"
echo -e "${BLUE}🎯 ================================================${NC}"
