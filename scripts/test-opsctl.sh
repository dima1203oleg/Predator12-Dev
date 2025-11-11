#!/usr/bin/env bash
#
# Integration tests for opsctl script
# Tests all major commands to ensure proper functionality
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPSCTL="$SCRIPT_DIR/opsctl"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test runner
run_test() {
  local test_name="$1"
  local test_command="$2"
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  echo -e "${BLUE}[TEST $TESTS_RUN]${NC} $test_name"
  
  if eval "$test_command" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}  ✗ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Start tests
echo -e "\n${YELLOW}===== opsctl Integration Tests =====${NC}\n"

# Test 1: Help command
run_test "Help command" "$OPSCTL help"

# Test 2: Help flag
run_test "Help flag --help" "$OPSCTL --help"

# Test 3: Help flag -h
run_test "Help flag -h" "$OPSCTL -h"

# Test 4: Build-test-scan
run_test "build-test-scan command" "$OPSCTL build-test-scan"

# Test 5: Check-gate with env
run_test "check-gate --env stage" "$OPSCTL check-gate --env stage"

# Test 6: Check-gate with prod
run_test "check-gate --env prod" "$OPSCTL check-gate --env prod"

# Test 7: Deploy to stage
run_test "deploy stage" "$OPSCTL deploy stage"

# Test 8: Deploy with nonstop flag
run_test "deploy stage --nonstop" "$OPSCTL deploy stage --nonstop"

# Test 9: ETL run with all jobs
run_test "etl-run --jobs all" "$OPSCTL etl-run --jobs all"

# Test 10: ETL run with changed jobs
run_test "etl-run --jobs changed" "$OPSCTL etl-run --jobs changed"

# Test 11: ETL run with nonstop
run_test "etl-run --jobs all --nonstop" "$OPSCTL etl-run --jobs all --nonstop"

# Test 12: Run local daemon
run_test "run-local-daemon --env dev" "$OPSCTL run-local-daemon --env dev"

# Test 13: Enable autoheal
run_test "enable-autoheal --env stage" "$OPSCTL enable-autoheal --env stage"

# Test 14: Maybe release
run_test "maybe-release --env prod --timebox 12h" "$OPSCTL maybe-release --env prod --timebox 12h"

# Test 15: Helm deploy
run_test "helm-deploy --env stage" "$OPSCTL helm-deploy --env stage"

# Print summary
echo -e "\n${YELLOW}===== Test Summary =====${NC}\n"
echo -e "Total Tests:  $TESTS_RUN"
echo -e "${GREEN}Passed:       $TESTS_PASSED${NC}"
echo -e "${RED}Failed:       $TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed${NC}\n"
  exit 1
fi
