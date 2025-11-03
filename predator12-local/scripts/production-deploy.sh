#!/bin/bash

# 🚀 Production Deployment Guide для Predator12
# Повна інструкція для запуску в production

set -e

echo "═════════════════════════════════════════════════════════════"
echo "  🚀 PREDATOR12 PRODUCTION DEPLOYMENT GUIDE"
echo "═════════════════════════════════════════════════════════════"
echo ""

# Кроки deployment
STEPS=(
    "1. Pre-flight Checks"
    "2. Environment Validation"
    "3. Database Migrations"
    "4. Service Deployment"
    "5. Health Verification"
    "6. Monitoring Setup"
    "7. Smoke Tests"
)

echo "📋 DEPLOYMENT STEPS:"
for step in "${STEPS[@]}"; do
    echo "  ✓ $step"
done
echo ""

# Функція для помилок
error_exit() {
    echo "❌ ERROR: $1"
    exit 1
}

# Функція для успіху
success_msg() {
    echo "✅ $1"
}

# 1. PRE-FLIGHT CHECKS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  PRE-FLIGHT CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Перевірити залежності
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        error_exit "$1 not found. Please install it first."
    fi
    success_msg "$1 found"
}

check_dependency "docker"
check_dependency "docker-compose"
check_dependency "kubectl"
check_dependency "helm"
check_dependency "git"

# Перевірити git status
if [[ -n $(git status -s) ]]; then
    echo "⚠️  WARNING: Uncommitted changes detected"
    git status -s
fi

success_msg "Pre-flight checks passed"
echo ""

# 2. ENVIRONMENT VALIDATION
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  ENVIRONMENT VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Перевірити .env файл
if [[ ! -f .env.production ]]; then
    error_exit ".env.production not found"
fi

success_msg ".env.production found"

# Перевірити critical env vars
critical_vars=(
    "TELEGRAM_BOT_TOKEN"
    "REDIS_URL"
    "DATABASE_URL"
    "SECRET_KEY"
)

for var in "${critical_vars[@]}"; do
    if [[ ! -v $var ]]; then
        echo "⚠️  WARNING: $var not set in environment"
    else
        success_msg "$var configured"
    fi
done
echo ""

# 3. BACKEND TESTS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  BACKEND TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend
python -m pytest tests/ -q --tb=short || error_exit "Tests failed"
success_msg "All backend tests passed"
cd ..
echo ""

# 4. DOCKER BUILD
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DOCKER BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache || error_exit "Docker build failed"
success_msg "Docker build successful"
echo ""

# 5. DEPLOYMENT
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d || error_exit "Deployment failed"

# Чекаємо до того, як сервіси запустяться
echo "Waiting for services to start..."
sleep 10

success_msg "Services deployed"
echo ""

# 6. HEALTH CHECKS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Перевірити API
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [[ $response == "200" ]]; then
    success_msg "API is healthy (HTTP $response)"
else
    error_exit "API health check failed (HTTP $response)"
fi

# Перевірити Prometheus
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090)
if [[ $response == "200" ]]; then
    success_msg "Prometheus is healthy (HTTP $response)"
else
    echo "⚠️  Prometheus not responding (HTTP $response)"
fi

# Перевірити Grafana
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ $response == "200" || $response == "302" ]]; then
    success_msg "Grafana is healthy (HTTP $response)"
else
    echo "⚠️  Grafana not responding (HTTP $response)"
fi

echo ""

# 7. SMOKE TESTS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  SMOKE TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Базові smoke тести
echo "Running smoke tests..."
python -m pytest tests/e2e/test_smoke.py -v || error_exit "Smoke tests failed"

success_msg "All smoke tests passed"
echo ""

# 8. FINAL STATUS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEPLOYMENT COMPLETE ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📊 SERVICE ENDPOINTS:"
echo "  • API:        http://localhost:8000"
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana:    http://localhost:3000"
echo "  • OpenSearch: http://localhost:9200"
echo "  • Redis:      localhost:6379"
echo ""

echo "🔗 NEXT STEPS:"
echo "  1. Access Grafana: http://localhost:3000 (admin/admin)"
echo "  2. Check metrics: http://localhost:9090"
echo "  3. Verify API: curl http://localhost:8000/health"
echo "  4. Check logs: docker-compose logs -f api"
echo ""

echo "📝 USEFUL COMMANDS:"
echo "  docker-compose -f docker-compose.prod.yml logs -f      # View logs"
echo "  docker-compose -f docker-compose.prod.yml ps           # Container status"
echo "  docker-compose -f docker-compose.prod.yml down         # Stop all"
echo ""

echo "🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!"
echo ""
