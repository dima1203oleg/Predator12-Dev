#!/bin/bash
set -e

echo "🚀 PREDATOR ANALYTICS - NEXUS CORE FINAL VALIDATION"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Завантажуємо локальні змінні середовища, якщо вони визначені в .env
if [ -f .env ]; then
    set +e
    set -a
    # shellcheck disable=SC1091
    source .env 2>/dev/null || true
    set +a
    set -e
fi

DEFAULT_POSTGRES_USER="predator_user"
DEFAULT_POSTGRES_PASSWORD="secure_postgres_password_2024"
DEFAULT_POSTGRES_DB="predator11"
DEFAULT_REDIS_PASSWORD="redis_secure_pass"

POSTGRES_USER=${POSTGRES_USER:-$DEFAULT_POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$DEFAULT_POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB:-$DEFAULT_POSTGRES_DB}
REDIS_PASSWORD=${REDIS_PASSWORD:-$DEFAULT_REDIS_PASSWORD}

success_count=0
total_checks=0

check_result() {
    total_checks=$((total_checks + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${BLUE}📋 Pre-flight checks...${NC}"

# Check Docker
docker --version > /dev/null 2>&1
check_result $? "Docker installed"

# Check Docker Compose
docker compose version > /dev/null 2>&1
check_result $? "Docker Compose available"

# Check required files
test -f docker-compose.yml
check_result $? "docker-compose.yml exists"

test -f Makefile
check_result $? "Makefile exists"

test -f backend/requirements.txt
check_result $? "Backend requirements.txt exists"

test -f backend/Dockerfile
check_result $? "Backend Dockerfile exists"

echo -e "\n${BLUE}🏗️ Building containers...${NC}"
docker compose build > /tmp/build.log 2>&1
check_result $? "All containers built successfully"

echo -e "\n${BLUE}🚀 Starting services...${NC}"
docker compose up -d > /tmp/startup.log 2>&1
check_result $? "All services started"

echo -e "\n${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health checks
echo -e "\n${BLUE}🔍 Health checks...${NC}"

# Check PostgreSQL
docker compose exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1
check_result $? "PostgreSQL is ready"

# Check Redis
docker compose exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping > /dev/null 2>&1
check_result $? "Redis is responding"

# Check API
curl -f http://localhost:8000/health > /dev/null 2>&1
check_result $? "Backend API health check"

# Check Grafana
curl -f http://localhost:3001/api/health > /dev/null 2>&1
check_result $? "Grafana health check"

# Check Prometheus
curl -f http://localhost:9090/-/ready > /dev/null 2>&1
check_result $? "Prometheus health check"

# Check Model SDK
curl -f http://localhost:3010/health > /dev/null 2>&1
check_result $? "Model SDK health check"

echo -e "\n${BLUE}📊 API endpoints validation...${NC}"

# Test API endpoints
curl -f http://localhost:8000/docs > /dev/null 2>&1
check_result $? "API documentation available"

curl -f http://localhost:8000/api/system/status > /dev/null 2>&1
check_result $? "System status endpoint"

echo -e "\n${BLUE}🧪 Integration tests...${NC}"

# Test agent communication
python3 - <<'PY'
import json
import sys
import urllib.request
import urllib.error

def http_get(url: str, timeout: float = 10.0) -> tuple[int, bytes]:
    request = urllib.request.Request(url)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.status, response.read()

def http_post(url: str, payload: dict, timeout: float = 10.0) -> tuple[int, bytes]:
    data = json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.status, response.read()

try:
    status, body = http_get('http://localhost:8000/api/system/status')
    assert status == 200, f"Unexpected status code: {status}"
    print('✅ System status endpoint responding')

    status, body = http_post('http://localhost:8000/api/ai_assistant', {'query': 'status'})
    assert status == 200, f"Unexpected status code: {status}"
    print('✅ AI assistant endpoint responding')

except Exception as exc:
    print(f'❌ Integration test failed: {exc}')
    sys.exit(1)
PY
check_result $? "Agent integration tests"

echo -e "\n${BLUE}📈 Performance baseline tests...${NC}"

# Simple load test
python3 - <<'PY'
import concurrent.futures
import time
import urllib.error
import urllib.request
import sys


def test_endpoint() -> bool:
    try:
        with urllib.request.urlopen('http://localhost:8000/health', timeout=5) as response:
            return response.status == 200
    except Exception:
        return False


start_time = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(test_endpoint) for _ in range(50)]
    results = [future.result() for future in concurrent.futures.as_completed(futures)]

end_time = time.time()
success_rate = sum(results) / len(results)
duration = end_time - start_time

print(f'Performance test: {success_rate*100:.1f}% success rate, {duration:.2f}s for 50 requests')
if success_rate < 0.95:
    sys.exit(1)
PY
check_result $? "Performance baseline tests"

echo -e "\n${BLUE}🔒 Security validation...${NC}"

# Test security headers
curl -I http://localhost:8000/health 2>/dev/null | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection" > /dev/null
check_result $? "Security headers present"

echo -e "\n${BLUE}📝 Configuration validation...${NC}"

# Check environment variables
python3 - <<'PY'
from pathlib import Path

required_vars = [
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'REDIS_PASSWORD',
    'DATABASE_URL',
    'REDIS_URL'
]

env_file = Path('.env') if Path('.env').exists() else Path('.env.example')
if not env_file.exists():
    print('❌ Missing both .env and .env.example files')
    raise SystemExit(1)

values = {}
for raw_line in env_file.read_text().splitlines():
    line = raw_line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    values[key.strip()] = value.strip()

missing = [var for var in required_vars if not values.get(var)]
if missing:
    print(f'❌ Missing variables in {env_file}: {", ".join(missing)}')
    raise SystemExit(1)

print(f'✅ Required variables present in {env_file}')
PY
check_result $? "Environment configuration"

echo -e "\n${BLUE}🧹 Cleanup test...${NC}"
docker compose down > /dev/null 2>&1
check_result $? "Clean shutdown"

echo -e "\n${YELLOW}=================================================${NC}"
echo -e "${BLUE}📊 FINAL VALIDATION RESULTS${NC}"
echo -e "${YELLOW}=================================================${NC}"

if [ $success_count -eq $total_checks ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! (${success_count}/${total_checks})${NC}"
    echo -e "${GREEN}✅ PREDATOR ANALYTICS - NEXUS CORE IS PRODUCTION READY!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Ready for deployment commands:${NC}"
    echo "  Development: make dev-up"
    echo "  Staging:     make staging-deploy" 
    echo "  Production:  make prod-deploy"
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API docs: http://localhost:8000/docs"
    echo "  Grafana: http://localhost:3001"
    echo "  Prometheus: http://localhost:9090"
    echo "  Model SDK: http://localhost:3010/health"
    echo ""
    echo -e "${GREEN}🌟 System fully validated and ready for enterprise use!${NC}"
    exit 0
else
    failed=$((total_checks - success_count))
    echo -e "${RED}❌ VALIDATION FAILED (${failed}/${total_checks} checks failed)${NC}"
    echo -e "${YELLOW}⚠️  Please review the failed checks above${NC}"
    exit 1
fi
