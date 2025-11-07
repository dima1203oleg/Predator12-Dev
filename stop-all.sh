#!/usr/bin/env bash
# 🛑 PREDATOR12 STOP ALL SERVICES
# Зупинка всіх сервісів системи

set -euo pipefail

# Кольори
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${RED}🛑 ================================================${NC}"
echo -e "${RED}⏹️  STOPPING ALL PREDATOR12 SERVICES${NC}"
echo -e "${RED}🛑 ================================================${NC}"
echo ""

# Зупинка Backend
if lsof -ti:8000 >/dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Backend (port 8000)...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Backend stopped${NC}"
else
    echo -e "${YELLOW}Backend not running${NC}"
fi

# Зупинка Frontend
if lsof -ti:3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Frontend (port 3000)...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Frontend stopped${NC}"
else
    echo -e "${YELLOW}Frontend not running${NC}"
fi

# Видалення PID файлів
if [ -f .backend.pid ]; then
    rm .backend.pid
    echo -e "${GREEN}✅ Removed .backend.pid${NC}"
fi

if [ -f .frontend.pid ]; then
    rm .frontend.pid
    echo -e "${GREEN}✅ Removed .frontend.pid${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
