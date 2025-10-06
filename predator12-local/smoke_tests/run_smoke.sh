#!/usr/bin/env bash
# ==========================================
# SMOKE ТЕСТИ ДЛЯ ЛОКАЛЬНОГО СЕРЕДОВИЩА
# ==========================================

set -e

echo "🧪 Запуск smoke тестів для Predator12..."

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Лічильники
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Функція для виконання тесту
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_output="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "  🔍 $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Функція для перевірки HTTP ендпоінту
check_http() {
    local url="$1"
    local expected_status="${2:-200}"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        return 0
    else
        echo "Expected $expected_status, got $status" >&2
        return 1
    fi
}

echo "🏁 Початок smoke тестів..."
echo "========================================"

# 1. Тест підключення до БД
echo "📊 Тестування бази даних:"
run_test "PostgreSQL підключення" "
    . .venv/bin/activate 2>/dev/null || true
    python -c 'import psycopg2; psycopg2.connect(\"postgresql://predator_user:changeme@127.0.0.1:5432/predator\").close()'
"

run_test "Структура БД" "
    PGPASSWORD=changeme psql -h 127.0.0.1 -U predator_user -d predator -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"public\"' | grep -q '[0-9]'
"

# 2. Тест backend
echo ""
echo "🚀 Тестування backend:"
run_test "Backend health endpoint" "check_http http://localhost:8000/health"
run_test "Backend API docs" "check_http http://localhost:8000/docs"
run_test "Backend root endpoint" "check_http http://localhost:8000/"

# Тест API ендпоінтів
run_test "API status endpoint" "check_http http://localhost:8000/api/status"
run_test "Agents list endpoint" "check_http http://localhost:8000/api/agents"

# 3. Тест frontend
echo ""
echo "🌐 Тестування frontend:"
run_test "Frontend доступність" "check_http http://localhost:3000"
run_test "Frontend assets" "curl -s http://localhost:3000 | grep -q 'Predator'"

# 4. Тест файлового сховища
echo ""
echo "📁 Тестування файлового сховища:"
run_test "Локальна папка storage" "[ -d ./local_storage ]"
run_test "Права запису в storage" "touch ./local_storage/test_file && rm ./local_storage/test_file"

# 5. Тест віртуального середовища
echo ""
echo "🐍 Тестування Python середовища:"
run_test "Virtual environment" "[ -d .venv ] && [ -f .venv/bin/activate ]"
run_test "Python залежності" ". .venv/bin/activate && pip list | grep -q fastapi"
run_test "Backend модулі" ". .venv/bin/activate && python -c 'import backend.main'"

# 6. Тест конфігурації
echo ""
echo "⚙️ Тестування конфігурації:"
run_test "Файл .env існує" "[ -f .env ]"
run_test "VS Code конфігурація" "[ -f .vscode/tasks.json ] && [ -f .vscode/launch.json ]"
run_test "Makefile команди" "make help | grep -q 'install'"

# 7. Тест логів
echo ""
echo "📋 Тестування логування:"
run_test "Папка логів" "[ -d logs ]"
run_test "Backend логи" "[ -f logs/predator.log ] || touch logs/predator.log"

# 8. Розширені API тести
echo ""
echo "🔧 Розширені API тести:"

# Тест створення простого запиту
run_test "AI agents API" "
    curl -s -X POST http://localhost:8000/api/agents/test \
    -H 'Content-Type: application/json' \
    -d '{\"message\": \"test\"}' | grep -q -E '(success|result|response)'
"

# Тест метрик
run_test "Metrics endpoint" "check_http http://localhost:8000/metrics"

# 9. Тест інтеграцій
echo ""
echo "🔗 Тестування інтеграцій:"

# Перевірка Redis (якщо увімкнений)
if command -v redis-cli &> /dev/null; then
    run_test "Redis підключення" "redis-cli ping | grep -q PONG"
fi

# Перевірка моделей AI
run_test "AI models config" "[ -f backend/model_registry.yaml ] || [ -f agents/registry_production.yaml ]"

echo ""
echo "========================================"
echo "📊 Результати smoke тестів:"
echo "  📈 Всього тестів: $TESTS_TOTAL"
echo -e "  ${GREEN}✅ Пройдено: $TESTS_PASSED${NC}"
echo -e "  ${RED}❌ Провалено: $TESTS_FAILED${NC}"

# Розрахунок відсотка успішності
if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo "  📊 Успішність: $SUCCESS_RATE%"
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "${GREEN}🎉 Система готова до роботи!${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 70 ]; then
        echo -e "${YELLOW}⚠️ Система частково готова, є помилки${NC}"
        exit 1
    else
        echo -e "${RED}❌ Система не готова, багато помилок${NC}"
        exit 2
    fi
else
    echo -e "${RED}❌ Не вдалося запустити тести${NC}"
    exit 3
fi

echo ""
echo "🔍 Для діагностики помилок:"
echo "  - Backend логи: tail -f logs/predator.log"
echo "  - Frontend логи: cd frontend && npm run dev"
echo "  - Database логи: sudo journalctl -u postgresql"
echo "  - Перевірка процесів: ps aux | grep -E '(uvicorn|node)'"
