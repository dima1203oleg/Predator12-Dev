#!/bin/bash

# 🚀 PREDATOR12 NEXUS CORE - Quick Launch Script
# Version: 2.0 "Cosmic Evolution"

echo "════════════════════════════════════════════════════════════════"
echo "   🌌 PREDATOR12 NEXUS CORE - COSMIC DASHBOARD v2.0"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to frontend
cd "$(dirname "$0")/predator12-local/frontend" || exit 1

echo -e "${CYAN}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${PURPLE}✨ Starting Cosmic Dashboard...${NC}"
echo ""
echo -e "${GREEN}🎯 Features enabled:${NC}"
echo -e "   ${BLUE}●${NC} Voice Control Interface (STT/TTS)"
echo -e "   ${BLUE}●${NC} Agent Progress Tracker (Real-time)"
echo -e "   ${BLUE}●${NC} 27 Services Monitoring"
echo -e "   ${BLUE}●${NC} 37 AI Agents Supervision"
echo -e "   ${BLUE}●${NC} 58 ML Models Registry"
echo -e "   ${BLUE}●${NC} Cosmic Visual Effects"
echo -e "   ${BLUE}●${NC} Accessibility (WCAG 2.1 AA)"
echo ""
echo -e "${GREEN}🌐 Dashboard will be available at:${NC}"
echo -e "   ${CYAN}http://localhost:5090${NC}"
echo ""
echo -e "${PURPLE}Press Ctrl+C to stop${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Start development server
npm run dev
