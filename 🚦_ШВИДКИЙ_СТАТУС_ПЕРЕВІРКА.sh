#!/bin/bash

# 🚦 Швидка перевірка статусу CYBER-ACE
# Використовуйте: ./🚦_ШВИДКИЙ_СТАТУС_ПЕРЕВІРКА.sh

clear
echo "🚦 ========================================="
echo "   CYBER-ACE - ШВИДКА ПЕРЕВІРКА СТАТУСУ"
echo "   ========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="/Users/dima/Documents/Predator12/predator12-local"

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "   ${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "   ${RED}✗${NC} $2"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "   ${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "   ${RED}✗${NC} $2"
        return 1
    fi
}

# 1. Backend Files
echo -e "${BLUE}📦 Backend Components:${NC}"
check_file "$PROJECT_DIR/backend/cyber_ace/services/ai/ai_engine.py" "AI Engine"
check_file "$PROJECT_DIR/backend/cyber_ace/services/voice/voice_service.py" "Voice Service"
check_file "$PROJECT_DIR/backend/cyber_ace/services/agents/agent_manager.py" "Agent Manager"
check_file "$PROJECT_DIR/backend/cyber_ace/routes/cyber_ace.py" "API Routes"
check_file "$PROJECT_DIR/backend/cyber_ace/models/schemas.py" "Data Models"
check_file "$PROJECT_DIR/backend/app/main.py" "FastAPI App"
echo ""

# 2. Frontend Files
echo -e "${BLUE}🎨 Frontend Components:${NC}"
check_file "$PROJECT_DIR/frontend/src/modules/cyber-ace/CyberAcePage.tsx" "Main Page"
check_file "$PROJECT_DIR/frontend/src/modules/cyber-ace/services/cyberAceAPI.ts" "API Service"
check_file "$PROJECT_DIR/frontend/src/modules/cyber-ace/store/cyberAceStore.ts" "State Store"
check_dir "$PROJECT_DIR/frontend/src/modules/cyber-ace/components" "Components Dir"
check_file "$PROJECT_DIR/frontend/.env.development" "Environment Config"
echo ""

# 3. Helper Scripts
echo -e "${BLUE}🛠️  Helper Scripts:${NC}"
check_file "$PROJECT_DIR/cyber-ace.sh" "Main Helper"
check_file "$PROJECT_DIR/cyber-ace-status.sh" "Status Checker"
check_file "$PROJECT_DIR/cyber-ace-start.sh" "Auto Start"
check_file "$PROJECT_DIR/test-cyber-ace-integration.sh" "Integration Tests"
check_file "$PROJECT_DIR/ULTRA_QUICK_START.sh" "Ultra Quick Start"
echo ""

# 4. Documentation
echo -e "${BLUE}📚 Documentation:${NC}"
check_file "/Users/dima/Documents/Predator12/📚_CYBER_ACE_GLOBAL_INDEX.md" "Global Index"
check_file "/Users/dima/Documents/Predator12/ONE_PAGE_SUMMARY.md" "One Page Summary"
check_file "$PROJECT_DIR/CYBER_ACE_README.md" "Main README"
check_file "/Users/dima/Documents/Predator12/🎯_ФІНАЛЬНИЙ_ГІД_CYBER_ACE.md" "Final Guide"
echo ""

# 5. Runtime Status
echo -e "${BLUE}🔄 Runtime Status:${NC}"

# Check Backend
echo -n "   Backend (port 8000): "
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}Running ✓${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}Not Running ✗${NC}"
    BACKEND_RUNNING=false
fi

# Check Frontend
echo -n "   Frontend (port 5173): "
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}Running ✓${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${RED}Not Running ✗${NC}"
    FRONTEND_RUNNING=false
fi
echo ""

# 6. Health Check
if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${BLUE}💊 Health Check:${NC}"
    echo -n "   Testing endpoint... "

    if response=$(curl -s http://localhost:8000/api/cyber-ace/health 2>/dev/null); then
        if echo "$response" | grep -q "healthy"; then
            echo -e "${GREEN}Healthy ✓${NC}"
            echo "   Response: $response"
        else
            echo -e "${YELLOW}Response received but status unclear${NC}"
        fi
    else
        echo -e "${RED}No response ✗${NC}"
    fi
    echo ""
fi

# 7. Quick Access
echo -e "${BLUE}🌐 Quick Access:${NC}"
if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "   ${GREEN}Backend:${NC}     http://localhost:8000"
    echo -e "   ${GREEN}API Docs:${NC}    http://localhost:8000/docs"
    echo -e "   ${GREEN}Health:${NC}      http://localhost:8000/api/cyber-ace/health"
else
    echo -e "   ${RED}Backend not running${NC}"
fi

if [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "   ${GREEN}Frontend:${NC}    http://localhost:5173"
    echo -e "   ${GREEN}CYBER-ACE:${NC}   http://localhost:5173/cyber-ace"
else
    echo -e "   ${RED}Frontend not running${NC}"
fi
echo ""

# 8. Next Actions
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Швидкі команди:${NC}"
echo ""

if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "   ${CYAN}Запустити все:${NC}"
    echo "   cd $PROJECT_DIR && ./ULTRA_QUICK_START.sh"
    echo ""
    echo -e "   ${CYAN}Або окремо:${NC}"
    echo "   cd $PROJECT_DIR && ./cyber-ace.sh start"
else
    echo -e "   ${CYAN}Перевірити детальний статус:${NC}"
    echo "   cd $PROJECT_DIR && ./cyber-ace-status.sh"
    echo ""
    echo -e "   ${CYAN}Запустити тести:${NC}"
    echo "   cd $PROJECT_DIR && ./test-cyber-ace-integration.sh"
    echo ""
    echo -e "   ${CYAN}Відкрити UI:${NC}"
    echo "   cd $PROJECT_DIR && ./cyber-ace.sh ui"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Overall Status
echo -e "${BLUE}🎯 Загальний статус:${NC}"

total_checks=20
passed_checks=0

# Count passed checks
[ -f "$PROJECT_DIR/backend/cyber_ace/services/ai/ai_engine.py" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/backend/cyber_ace/services/voice/voice_service.py" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/backend/cyber_ace/services/agents/agent_manager.py" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/backend/cyber_ace/routes/cyber_ace.py" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/backend/cyber_ace/models/schemas.py" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/backend/app/main.py" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/frontend/src/modules/cyber-ace/CyberAcePage.tsx" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/frontend/src/modules/cyber-ace/services/cyberAceAPI.ts" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/frontend/src/modules/cyber-ace/store/cyberAceStore.ts" ] && ((passed_checks++))
[ -d "$PROJECT_DIR/frontend/src/modules/cyber-ace/components" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/frontend/.env.development" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/cyber-ace.sh" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/cyber-ace-status.sh" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/cyber-ace-start.sh" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/test-cyber-ace-integration.sh" ] && ((passed_checks++))
[ -f "$PROJECT_DIR/ULTRA_QUICK_START.sh" ] && ((passed_checks++))
[ -f "/Users/dima/Documents/Predator12/📚_CYBER_ACE_GLOBAL_INDEX.md" ] && ((passed_checks++))
[ -f "/Users/dima/Documents/Predator12/ONE_PAGE_SUMMARY.md" ] && ((passed_checks++))
[ "$BACKEND_RUNNING" = true ] && ((passed_checks++))
[ "$FRONTEND_RUNNING" = true ] && ((passed_checks++))

percentage=$((passed_checks * 100 / total_checks))

echo "   Перевірок пройдено: $passed_checks/$total_checks ($percentage%)"
echo ""

if [ $percentage -eq 100 ]; then
    echo -e "   ${GREEN}✅ Система повністю готова!${NC}"
elif [ $percentage -ge 90 ]; then
    echo -e "   ${YELLOW}⚠️  Майже готово - перевірте запущені сервіси${NC}"
elif [ $percentage -ge 70 ]; then
    echo -e "   ${YELLOW}⚠️  Потрібна увага - деякі компоненти відсутні${NC}"
else
    echo -e "   ${RED}❌ Потрібне налаштування - багато компонентів відсутні${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✨ Для детальної інформації: ./cyber-ace.sh help"
echo ""
