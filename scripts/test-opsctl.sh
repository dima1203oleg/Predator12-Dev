#!/bin/bash
# Integration test for opsctl script
# Tests all command paths to ensure they work correctly

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPSCTL="${SCRIPT_DIR}/opsctl"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass_count=0
fail_count=0

test_command() {
    local test_name="$1"
    shift
    
    echo -n "Testing: ${test_name}... "
    
    if "$@" &> /tmp/opsctl-test.log; then
        echo -e "${GREEN}PASS${NC}"
        ((pass_count++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Exit code: $?"
        cat /tmp/opsctl-test.log 2>/dev/null | head -5 | sed 's/^/    /' || echo "    (no output)"
        ((fail_count++))
        return 1
    fi
}

echo "=========================================="
echo "OPSCTL Integration Tests"
echo "=========================================="
echo ""

# Test 1: Help
test_command "help command" bash -c "$OPSCTL --help | grep -q 'Usage: opsctl'"

# Test 2: Check-gate
test_command "check-gate --env prod" $OPSCTL check-gate --env prod

# Test 3: Deploy (dry run)
test_command "deploy with nonstop" bash -c "$OPSCTL deploy stage --kubeconfig /tmp/fake-kubeconfig --nonstop | grep -q 'Deployment to stage completed'"

# Test 4: ETL run
test_command "etl-run --jobs changed" bash -c "$OPSCTL etl-run --jobs changed --nonstop | grep -q 'ETL jobs completed'"

# Test 5: Run local daemon
test_command "run-local-daemon" bash -c "$OPSCTL run-local-daemon --env dev | grep -q 'LOCAL DAEMON SETUP INSTRUCTIONS'"

# Test 6: Enable autoheal
test_command "enable-autoheal (no kubectl)" bash -c "$OPSCTL enable-autoheal --env stage 2>&1 | grep -qE '(kubectl not found|No auto-heal playbooks found|Auto-heal enabled)'"

# Test 7: Maybe-release (without auto-merge)
test_command "maybe-release without AUTO_MERGE" bash -c "AUTO_MERGE=0 $OPSCTL maybe-release --env prod --timebox 12h | grep -q 'AUTO_MERGE not enabled'"

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}${pass_count}${NC}"
echo -e "Failed: ${RED}${fail_count}${NC}"
echo "=========================================="

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
