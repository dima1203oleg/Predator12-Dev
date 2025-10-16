#!/bin/bash

# Predator Analytics - Comprehensive Test Script

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Predator Analytics - Test Suite                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Running: ${test_name}${NC}"
    
    if eval $test_command > /tmp/test_output.log 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo -e "${YELLOW}Error output:${NC}"
        cat /tmp/test_output.log
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 1. Backend Health Check
run_test "Backend Health Check" \
    "curl -f http://localhost:8000/health"

# 2. Backend Ready Check
run_test "Backend Ready Check" \
    "curl -f http://localhost:8000/ready"

# 3. API Documentation
run_test "API Documentation Available" \
    "curl -f http://localhost:8000/api/docs"

# 4. Frontend Accessibility
run_test "Frontend Homepage" \
    "curl -f http://localhost:3000"

# 5. Prometheus Metrics
run_test "Prometheus Metrics Endpoint" \
    "curl -f http://localhost:8000/metrics"

# 6. Redis Connection
run_test "Redis Connection" \
    "docker-compose exec -T redis redis-cli ping"

# 7. PostgreSQL Connection
run_test "PostgreSQL Connection" \
    "docker-compose exec -T postgres pg_isready -U postgres"

# 8. Agents System Status
run_test "Agents System Status" \
    "curl -f http://localhost:8000/api/v1/agents/system/status"

# 9. Voice Service Health
run_test "Voice Service Health" \
    "curl -f http://localhost:8000/api/v1/voice/health"

# 10. Analytics Overview
run_test "Analytics Overview Endpoint" \
    "curl -f http://localhost:8000/api/v1/analytics/overview"

# Summary
echo -e "\n${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Test Results                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Total Tests:${NC}   $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC}        $PASSED_TESTS"
echo -e "${RED}Failed:${NC}        $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed!${NC}"
    exit 1
fi
