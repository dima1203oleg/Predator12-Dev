#!/usr/bin/env bash
# 🔄 PREDATOR12 RESTART ALL SERVICES
# Перезапуск всіх сервісів системи

set -euo pipefail

# Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🔄 ================================================${NC}"
echo -e "${BLUE}🔄 RESTARTING PREDATOR12 SERVICES${NC}"
echo -e "${BLUE}🔄 ================================================${NC}"
echo ""

# Зупинка
echo -e "${YELLOW}Step 1: Stopping all services...${NC}"
./stop-all.sh

echo ""
echo -e "${YELLOW}Step 2: Waiting 3 seconds...${NC}"
sleep 3

echo ""
echo -e "${YELLOW}Step 3: Starting services...${NC}"
./auto-approve.sh

echo ""
echo -e "${GREEN}✅ Restart complete!${NC}"
echo ""
