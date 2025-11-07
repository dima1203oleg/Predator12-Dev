#!/usr/bin/env bash
# 📋 PREDATOR12 LOG VIEWER
# Перегляд логів системи в реальному часі

set -euo pipefail

# Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Створення директорії для логів
mkdir -p logs

echo ""
echo -e "${BLUE}📋 ================================================${NC}"
echo -e "${BLUE}📋 PREDATOR12 LOGS VIEWER${NC}"
echo -e "${BLUE}📋 ================================================${NC}"
echo ""

echo -e "${YELLOW}Select log to view:${NC}"
echo -e "${GREEN}1)${NC} Backend logs"
echo -e "${GREEN}2)${NC} Frontend logs"
echo -e "${GREEN}3)${NC} Both (split view)"
echo ""
read -p "Choice [1-3]: " choice

case $choice in
    1)
        echo -e "${BLUE}📡 Watching Backend logs...${NC}"
        if [ -f logs/backend.log ]; then
            tail -f logs/backend.log
        else
            echo -e "${YELLOW}No backend.log found${NC}"
        fi
        ;;
    2)
        echo -e "${BLUE}🌐 Watching Frontend logs...${NC}"
        if [ -f logs/frontend.log ]; then
            tail -f logs/frontend.log
        else
            echo -e "${YELLOW}No frontend.log found${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}📊 Watching both logs...${NC}"
        if command -v multitail >/dev/null 2>&1; then
            multitail logs/backend.log logs/frontend.log
        else
            echo -e "${YELLOW}multitail not installed, using tail${NC}"
            tail -f logs/backend.log logs/frontend.log
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
