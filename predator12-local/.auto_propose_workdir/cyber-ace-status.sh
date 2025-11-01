#!/bin/bash

# 🔍 CYBER-ACE Status Check Script
# Швидка перевірка статусу всіх компонентів

echo "🔍 =================================="
echo "   CYBER-ACE STATUS CHECK"
echo "   =================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Backend Port
echo -n "Backend (port 8000): "
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}✗ Not running${NC}"
    BACKEND_RUNNING=false
fi

# Check Frontend Port
echo -n "Frontend (port 5173): "
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${RED}✗ Not running${NC}"
    FRONTEND_RUNNING=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test Backend Health if running
if [ "$BACKEND_RUNNING" = true ]; then
    echo "🧪 Testing Backend Health..."
    if response=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/cyber-ace/health 2>/dev/null); then
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)

        if [ "$http_code" = "200" ]; then
            echo -e "   ${GREEN}✓ Health check passed${NC}"
            echo "   Response: $body"
        else
            echo -e "   ${RED}✗ Health check failed (HTTP $http_code)${NC}"
        fi
    else
        echo -e "   ${YELLOW}⚠ Backend not responding${NC}"
    fi
    echo ""
fi

# Show URLs
echo "🌐 Access URLs:"
if [ "$BACKEND_RUNNING" = true ]; then
    echo -e "   Backend API: ${GREEN}http://localhost:8000${NC}"
    echo -e "   API Docs:    ${GREEN}http://localhost:8000/docs${NC}"
    echo -e "   Health:      ${GREEN}http://localhost:8000/api/cyber-ace/health${NC}"
else
    echo -e "   Backend API: ${RED}Not available${NC}"
fi

if [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "   Frontend:    ${GREEN}http://localhost:5173${NC}"
    echo -e "   CYBER-ACE:   ${GREEN}http://localhost:5173/cyber-ace${NC}"
else
    echo -e "   Frontend:    ${RED}Not available${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show next steps
if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo "📝 Next Steps:"
    echo ""

    if [ "$BACKEND_RUNNING" = false ]; then
        echo "   Start Backend:"
        echo "   cd /Users/dima/Documents/Predator12/predator12-local/backend"
        echo "   python3 -m uvicorn app.main:app --reload --port 8000"
        echo ""
    fi

    if [ "$FRONTEND_RUNNING" = false ]; then
        echo "   Start Frontend:"
        echo "   cd /Users/dima/Documents/Predator12/predator12-local/frontend"
        echo "   npm run dev"
        echo ""
    fi

    echo "   Or use auto-start:"
    echo "   ./cyber-ace-start.sh"
    echo ""
else
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "🎉 CYBER-ACE is ready to use!"
    echo ""
    echo "Next steps:"
    echo "   1. Open http://localhost:5173/cyber-ace"
    echo "   2. Test integration: ./test-cyber-ace-integration.sh"
    echo ""
fi
