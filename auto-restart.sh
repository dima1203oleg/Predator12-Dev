#!/usr/bin/env bash
# 🔄 PREDATOR12 RESTART SYSTEM
# Перезапуск всієї системи

set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🔄 ================================================${NC}"
echo -e "${BLUE}🔄 RESTARTING PREDATOR12 SYSTEM${NC}"
echo -e "${BLUE}🔄 ================================================${NC}"
echo ""

cd /Users/dima/Documents/Predator12

# Stop system
echo -e "${BLUE}⏹️  Stopping current system...${NC}"
./auto-stop.sh

echo ""
echo -e "${GREEN}⏳ Waiting 3 seconds...${NC}"
sleep 3

echo ""
echo -e "${BLUE}🚀 Starting system...${NC}"
./auto-approve.sh

echo ""
echo -e "${GREEN}🎯 ================================================${NC}"
echo -e "${GREEN}✅ RESTART COMPLETE${NC}"
echo -e "${GREEN}🎯 ================================================${NC}"
