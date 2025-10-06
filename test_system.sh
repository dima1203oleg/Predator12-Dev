#!/bin/bash

# 🚀 Predator12 System Test Script
# Comprehensive system health check

echo "=================================================="
echo "🚀 PREDATOR12 PLATFORM - SYSTEM TEST"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "Testing ${name}... "
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
    
    if [ "$http_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, expected $expected_code)"
        ((FAILED++))
    fi
}

# Function to test container
test_container() {
    local name=$1
    
    echo -n "Checking container ${name}... "
    
    if docker ps --format '{{.Names}}' | grep -q "${name}"; then
        status=$(docker ps --filter "name=${name}" --format '{{.Status}}')
        echo -e "${GREEN}✓ RUNNING${NC} ($status)"
        ((PASSED++))
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        ((FAILED++))
    fi
}

echo "=================================================="
echo "📦 DOCKER CONTAINERS"
echo "=================================================="
echo ""

test_container "predator12-local-frontend-1"
test_container "predator12-local-backend-1"
test_container "predator12-local-db-1"
test_container "predator12-local-redis-1"
test_container "predator12-local-qdrant-1"
test_container "predator12-local-keycloak-1"
test_container "predator12-local-minio-1"

echo ""
echo "=================================================="
echo "🌐 WEB ENDPOINTS"
echo "=================================================="
echo ""

test_endpoint "Frontend" "http://localhost:3000" 200
test_endpoint "Backend Health" "http://localhost:8000/health" 200
test_endpoint "Backend Docs" "http://localhost:8000/docs" 200
test_endpoint "Grafana" "http://localhost:3001" 200
test_endpoint "Prometheus" "http://localhost:9090" 200

echo ""
echo "=================================================="
echo "📊 SYSTEM RESOURCES"
echo "=================================================="
echo ""

# Docker stats
echo "Docker Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10

echo ""
echo "=================================================="
echo "📝 RECENT LOGS"
echo "=================================================="
echo ""

echo -e "${BLUE}Frontend logs (last 5 lines):${NC}"
docker logs --tail 5 predator12-local-frontend-1 2>&1

echo ""
echo -e "${BLUE}Backend logs (last 5 lines):${NC}"
docker logs --tail 5 predator12-local-backend-1 2>&1

echo ""
echo "=================================================="
echo "📈 TEST SUMMARY"
echo "=================================================="
echo ""

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo -e "Total Tests:    ${BLUE}${TOTAL}${NC}"
echo -e "Passed:         ${GREEN}${PASSED}${NC}"
echo -e "Failed:         ${RED}${FAILED}${NC}"
echo -e "Success Rate:   ${YELLOW}${SUCCESS_RATE}%${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}🎉 System is healthy and ready to use!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED!${NC}"
    echo -e "${YELLOW}⚠️  Please check the errors above${NC}"
    exit 1
fi
