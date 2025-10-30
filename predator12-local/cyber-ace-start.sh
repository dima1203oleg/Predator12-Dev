#!/bin/bash

# 🚀 CYBER-ACE QUICK START SCRIPT
# Швидкий запуск та тестування CYBER-ACE системи

set -e

echo "🚀 =================================="
echo "   CYBER-ACE QUICK START"
echo "   =================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_DIR="/Users/dima/Documents/Predator12/predator12-local/backend"
FRONTEND_DIR="/Users/dima/Documents/Predator12/predator12-local/frontend"

# Function to check if process is running on port
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
    return $?
}

# Function to wait for server to be ready
wait_for_server() {
    local url=$1
    local max_attempts=30
    local attempt=0

    echo -n "Waiting for server to be ready"
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo ""
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    echo ""
    return 1
}

echo "📋 Checking current state..."
echo ""

# Check Backend
echo -n "Backend (port 8000): "
if check_port 8000; then
    echo -e "${GREEN}✓ Running${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}✗ Not running${NC}"
    BACKEND_RUNNING=false
fi

# Check Frontend
echo -n "Frontend (port 5173): "
if check_port 5173; then
    echo -e "${GREEN}✓ Running${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}✗ Not running${NC}"
    FRONTEND_RUNNING=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Backend if needed
if [ "$BACKEND_RUNNING" = false ]; then
    echo "🔧 Starting Backend Server..."
    cd "$BACKEND_DIR"

    # Create logs directory if not exists
    mkdir -p logs

    # Start backend in background
    nohup python3 -m uvicorn app.main:app --reload --port 8000 > logs/cyber_ace.log 2>&1 &
    BACKEND_PID=$!

    echo "   PID: $BACKEND_PID"
    echo "   Logs: $BACKEND_DIR/logs/cyber_ace.log"

    # Wait for backend to be ready
    if wait_for_server "http://localhost:8000/docs"; then
        echo -e "   ${GREEN}✓ Backend started successfully${NC}"
    else
        echo -e "   ${RED}✗ Backend failed to start${NC}"
        echo "   Check logs: tail -f $BACKEND_DIR/logs/cyber_ace.log"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Backend already running${NC}"
fi

echo ""

# Start Frontend if needed
if [ "$FRONTEND_RUNNING" = false ]; then
    echo "🔧 Starting Frontend Server..."
    cd "$FRONTEND_DIR"

    echo -e "${YELLOW}Please run in a separate terminal:${NC}"
    echo "   cd $FRONTEND_DIR"
    echo "   npm run dev"
else
    echo -e "${GREEN}✓ Frontend already running${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test Backend Health
echo "🧪 Testing Backend Health..."
if curl -s http://localhost:8000/api/cyber-ace/health > /dev/null 2>&1; then
    response=$(curl -s http://localhost:8000/api/cyber-ace/health)
    echo -e "   ${GREEN}✓ Health check passed${NC}"
    echo "   Response: $response"
else
    echo -e "   ${RED}✗ Health check failed${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show URLs
echo "🌐 URLs:"
echo "   Backend API: ${BLUE}http://localhost:8000${NC}"
echo "   API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
echo "   CYBER-ACE:   ${BLUE}http://localhost:8000/api/cyber-ace${NC}"
echo "   Frontend:    ${BLUE}http://localhost:5173/cyber-ace${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show useful commands
echo "📝 Useful Commands:"
echo ""
echo "   # Test chat endpoint"
echo "   curl -X POST http://localhost:8000/api/cyber-ace/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Привіт!\",\"user_id\":\"test\",\"language\":\"uk\"}'"
echo ""
echo "   # View logs"
echo "   tail -f $BACKEND_DIR/logs/cyber_ace.log"
echo ""
echo "   # Stop backend"
echo "   pkill -f 'uvicorn app.main:app'"
echo ""
echo "   # Run full integration test"
echo "   ./test-cyber-ace-integration.sh"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 CYBER-ACE is ready!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:5173/cyber-ace in browser"
echo "  2. Try voice commands or quick actions"
echo "  3. Check backend logs for requests"
echo ""
