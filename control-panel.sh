#!/usr/bin/env bash
# 🎮 PREDATOR12 CONTROL PANEL
# Головна панель управління системою

set -euo pipefail

# Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

show_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${MAGENTA}🎮 PREDATOR12 CONTROL PANEL${NC}              ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 System Management:${NC}"
    echo -e "${GREEN}  1)${NC} 🚀 Start/Auto-approve System"
    echo -e "${GREEN}  2)${NC} 🛑 Stop All Services"
    echo -e "${GREEN}  3)${NC} 🔄 Restart All Services"
    echo -e "${GREEN}  4)${NC} 🎯 Check System Status"
    echo ""
    echo -e "${BLUE}📋 Logs & Monitoring:${NC}"
    echo -e "${GREEN}  5)${NC} 📋 Watch Logs"
    echo -e "${GREEN}  6)${NC} 📊 Show Backend Logs"
    echo -e "${GREEN}  7)${NC} 🌐 Show Frontend Logs"
    echo ""
    echo -e "${BLUE}🔧 Git Operations:${NC}"
    echo -e "${GREEN}  8)${NC} 📦 Git Status"
    echo -e "${GREEN}  9)${NC} 🚀 Force Push to GitHub"
    echo -e "${GREEN} 10)${NC} 🔄 Pull Latest Changes"
    echo ""
    echo -e "${BLUE}🌐 Quick Access:${NC}"
    echo -e "${GREEN} 11)${NC} 🌐 Open Frontend (localhost:3000)"
    echo -e "${GREEN} 12)${NC} 📚 Open API Docs (localhost:8000/docs)"
    echo ""
    echo -e "${RED} 0)${NC} 🚪 Exit"
    echo ""
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
}

execute_command() {
    case $1 in
        1)
            echo -e "${YELLOW}🚀 Starting system with auto-approve...${NC}"
            ./auto-approve.sh
            ;;
        2)
            echo -e "${YELLOW}🛑 Stopping all services...${NC}"
            ./stop-all.sh
            ;;
        3)
            echo -e "${YELLOW}🔄 Restarting all services...${NC}"
            ./restart-all.sh
            ;;
        4)
            echo -e "${YELLOW}🎯 Checking system status...${NC}"
            ./quick-status.sh
            ;;
        5)
            echo -e "${YELLOW}📋 Opening log viewer...${NC}"
            ./watch-logs.sh
            ;;
        6)
            echo -e "${YELLOW}📊 Showing backend logs...${NC}"
            if [ -f logs/backend.log ]; then
                tail -50 logs/backend.log
            else
                echo -e "${RED}No backend.log found${NC}"
            fi
            ;;
        7)
            echo -e "${YELLOW}🌐 Showing frontend logs...${NC}"
            if [ -f logs/frontend.log ]; then
                tail -50 logs/frontend.log
            else
                echo -e "${RED}No frontend.log found${NC}"
            fi
            ;;
        8)
            echo -e "${YELLOW}📦 Git status...${NC}"
            git status
            ;;
        9)
            echo -e "${YELLOW}🚀 Force pushing to GitHub...${NC}"
            git push -f origin $(git rev-parse --abbrev-ref HEAD)
            echo -e "${GREEN}✅ Push complete${NC}"
            ;;
        10)
            echo -e "${YELLOW}🔄 Pulling latest changes...${NC}"
            git pull origin $(git rev-parse --abbrev-ref HEAD)
            echo -e "${GREEN}✅ Pull complete${NC}"
            ;;
        11)
            echo -e "${YELLOW}🌐 Opening Frontend in browser...${NC}"
            if command -v open >/dev/null 2>&1; then
                open http://localhost:3000
            elif command -v xdg-open >/dev/null 2>&1; then
                xdg-open http://localhost:3000
            else
                echo -e "${YELLOW}Please open: http://localhost:3000${NC}"
            fi
            ;;
        12)
            echo -e "${YELLOW}📚 Opening API Docs in browser...${NC}"
            if command -v open >/dev/null 2>&1; then
                open http://localhost:8000/docs
            elif command -v xdg-open >/dev/null 2>&1; then
                xdg-open http://localhost:8000/docs
            else
                echo -e "${YELLOW}Please open: http://localhost:8000/docs${NC}"
            fi
            ;;
        0)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            ;;
    esac
}

# Головний цикл
while true; do
    show_menu
    read -p "$(echo -e ${YELLOW}Select option: ${NC})" choice
    echo ""
    
    if [ "$choice" = "0" ]; then
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
    fi
    
    execute_command "$choice"
    
    echo ""
    read -p "$(echo -e ${YELLOW}Press Enter to continue...${NC})"
    clear
done
