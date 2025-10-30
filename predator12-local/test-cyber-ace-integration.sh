#!/bin/bash

# 🧪 CYBER-ACE Integration Test Script
# Тестування інтеграції Frontend ↔ Backend

set -e

echo "🧪 =================================="
echo "   CYBER-ACE INTEGRATION TEST"
echo "   =================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
CYBER_ACE_URL="$BACKEND_URL/api/cyber-ace"

# Test functions
test_health() {
    echo -n "Testing health endpoint... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$CYBER_ACE_URL/health")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

test_chat() {
    echo -n "Testing chat endpoint... "
    response=$(curl -s -X POST "$CYBER_ACE_URL/chat" \
        -H "Content-Type: application/json" \
        -d '{"message":"Привіт!","user_id":"test123","language":"uk"}' \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        echo "   Response: $(echo $body | head -c 80)..."
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "   Response: $body"
        return 1
    fi
}

test_agents() {
    echo -n "Testing agents endpoint... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$CYBER_ACE_URL/agents")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo ""
    echo "Please start the backend server first:"
    echo "  cd /Users/dima/Documents/Predator12/predator12-local/backend"
    echo "  uvicorn app.main:app --reload --port 8000"
    exit 1
fi

echo ""
echo "🧪 Running API tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run tests
passed=0
failed=0

if test_health; then
    ((passed++))
else
    ((failed++))
fi

if test_chat; then
    ((passed++))
else
    ((failed++))
fi

if test_agents; then
    ((passed++))
else
    ((failed++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results:"
echo "   Passed: ${GREEN}$passed${NC}"
echo "   Failed: ${RED}$failed${NC}"
echo "   Total:  $((passed + failed))"

if [ $failed -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ CYBER-ACE backend is ready for integration!"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:5173/cyber-ace in browser"
    echo "  2. Test voice commands"
    echo "  3. Test quick actions"
    echo "  4. Test agent delegation"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo ""
    echo "Check backend logs for errors:"
    echo "  tail -f logs/app.log"
    exit 1
fi
