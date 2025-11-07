#!/usr/bin/env bash
# 🛑 PREDATOR12 STOP SYSTEM
# Зупинка всіх сервісів

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🛑 ================================================${NC}"
echo -e "${RED}⏹️  STOPPING PREDATOR12 SYSTEM${NC}"
echo -e "${RED}🛑 ================================================${NC}"
echo ""

cd /Users/dima/Documents/Predator12

# Stop Backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || kill -9 $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
        echo -e "${GREEN}✅ Backend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend already stopped${NC}"
        rm .backend.pid
    fi
else
    echo -e "${YELLOW}⚠️  No backend PID file found${NC}"
fi

# Stop Frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || kill -9 $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend already stopped${NC}"
        rm .frontend.pid
    fi
else
    echo -e "${YELLOW}⚠️  No frontend PID file found${NC}"
fi

# Kill any remaining processes on ports
echo ""
echo -e "${YELLOW}Checking ports 8000 and 3000...${NC}"

if lsof -ti:8000 >/dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Port 8000 cleared${NC}"
else
    echo -e "${GREEN}✅ Port 8000 already free${NC}"
fi

if lsof -ti:3000 >/dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Port 3000 cleared${NC}"
else
    echo -e "${GREEN}✅ Port 3000 already free${NC}"
fi

echo ""
echo -e "${GREEN}🎯 ================================================${NC}"
echo -e "${GREEN}✅ PREDATOR12 SYSTEM STOPPED${NC}"
echo -e "${GREEN}🎯 ================================================${NC}"
echo ""
echo -e "${YELLOW}💡 To start again, run: ./auto-approve.sh${NC}"
