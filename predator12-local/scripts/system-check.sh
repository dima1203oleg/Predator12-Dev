#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Complete System Check
# ==============================================================================
# Перевірка всієї системи перед запуском
# ==============================================================================

set -Eeuo pipefail

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PASSED=0
FAILED=0
WARNINGS=0

# ==============================================================================
# Банер
# ==============================================================================
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║          PREDATOR12 - Complete System Check                          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
EOF

echo ""

# ==============================================================================
# 1. Python 3.11
# ==============================================================================
info "=== 1. Python 3.11 ===" 

if command -v python3.11 &> /dev/null; then
    VERSION=$(python3.11 --version)
    success "Python 3.11: $VERSION"
    ((PASSED++))
else
    error "Python 3.11 не знайдено"
    echo "   Встановіть: brew install python@3.11"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 2. PostgreSQL
# ==============================================================================
info "=== 2. PostgreSQL ==="

if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | head -1)
    success "PostgreSQL встановлено: $PG_VERSION"
    ((PASSED++))
    
    # Перевірка чи запущено
    if lsof -i :5432 &> /dev/null; then
        success "PostgreSQL запущено на порту 5432"
        ((PASSED++))
    else
        warning "PostgreSQL не запущено"
        echo "   Запустіть: brew services start postgresql@14"
        ((WARNINGS++))
    fi
else
    error "PostgreSQL не встановлено"
    echo "   Встановіть: brew install postgresql@14"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 3. Redis (опціонально)
# ==============================================================================
info "=== 3. Redis (опціонально) ==="

if command -v redis-cli &> /dev/null; then
    REDIS_VERSION=$(redis-cli --version)
    success "Redis встановлено: $REDIS_VERSION"
    ((PASSED++))
    
    if lsof -i :6379 &> /dev/null; then
        success "Redis запущено на порту 6379"
        ((PASSED++))
    else
        warning "Redis не запущено"
        echo "   Запустіть: brew services start redis"
        ((WARNINGS++))
    fi
else
    warning "Redis не встановлено (опціонально)"
    echo "   Встановіть: brew install redis"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# 4. Git
# ==============================================================================
info "=== 4. Git ==="

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    success "Git: $GIT_VERSION"
    ((PASSED++))
else
    error "Git не встановлено"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 5. Структура проекту
# ==============================================================================
info "=== 5. Структура проекту ==="

REQUIRED_PATHS=(
    "backend"
    "backend/requirements-311-modern.txt"
    "scripts"
    "scripts/manage-ports.sh"
    "scripts/health-check.py"
    "Makefile"
)

for path in "${REQUIRED_PATHS[@]}"; do
    if [ -e "$PROJECT_ROOT/$path" ]; then
        success "$path"
        ((PASSED++))
    else
        error "$path не знайдено"
        ((FAILED++))
    fi
done

echo ""

# ==============================================================================
# 6. Python venv
# ==============================================================================
info "=== 6. Python venv ==="

VENV_PATH="$PROJECT_ROOT/backend/venv"

if [ -d "$VENV_PATH" ]; then
    success "venv існує: $VENV_PATH"
    ((PASSED++))
    
    if [ -f "$VENV_PATH/bin/python" ]; then
        VENV_PYTHON=$("$VENV_PATH/bin/python" --version 2>&1)
        if [[ "$VENV_PYTHON" == *"3.11"* ]]; then
            success "venv Python: $VENV_PYTHON"
            ((PASSED++))
        else
            warning "venv Python НЕ 3.11: $VENV_PYTHON"
            echo "   Пересоздайте venv: bash scripts/setup-venv.sh"
            ((WARNINGS++))
        fi
    else
        error "venv пошкоджений (немає bin/python)"
        ((FAILED++))
    fi
else
    warning "venv не створено"
    echo "   Створіть: bash scripts/setup-venv.sh"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# 7. Порти
# ==============================================================================
info "=== 7. Порти ==="

PORTS=(
    "8000:Backend FastAPI"
    "3000:Frontend"
    "9200:OpenSearch"
    "5601:Dashboards"
)

for entry in "${PORTS[@]}"; do
    PORT="${entry%%:*}"
    NAME="${entry#*:}"
    
    if lsof -i :"$PORT" &> /dev/null; then
        warning "Port $PORT ($NAME) зайнятий"
        ((WARNINGS++))
    else
        success "Port $PORT ($NAME) вільний"
        ((PASSED++))
    fi
done

echo ""

# ==============================================================================
# 8. .env файл
# ==============================================================================
info "=== 8. .env Configuration ==="

if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    success ".env існує"
    ((PASSED++))
    
    # Перевірка критичних параметрів
    if grep -q "DATABASE_URL" "$PROJECT_ROOT/backend/.env"; then
        success "DATABASE_URL налаштовано"
        ((PASSED++))
    else
        warning "DATABASE_URL не знайдено в .env"
        ((WARNINGS++))
    fi
else
    warning ".env не створено"
    echo "   Створіть: cd backend && cp .env.example .env"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# 9. OpenSearch (опціонально)
# ==============================================================================
info "=== 9. OpenSearch (опціонально) ==="

if command -v opensearch &> /dev/null || brew list opensearch &> /dev/null; then
    success "OpenSearch встановлено"
    ((PASSED++))
    
    if lsof -i :9200 &> /dev/null; then
        success "OpenSearch запущено"
        ((PASSED++))
    else
        warning "OpenSearch не запущено"
        echo "   Запустіть: brew services start opensearch"
        ((WARNINGS++))
    fi
else
    warning "OpenSearch не встановлено (опціонально)"
    echo "   Встановіть: brew install opensearch"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# 10. Node.js (для frontend)
# ==============================================================================
info "=== 10. Node.js (опціонально) ==="

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js: $NODE_VERSION"
    ((PASSED++))
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        success "npm: $NPM_VERSION"
        ((PASSED++))
    fi
else
    warning "Node.js не встановлено (потрібно для frontend)"
    echo "   Встановіть: brew install node"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# Підсумок
# ==============================================================================
TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${BLUE}${'='*72}${NC}"
echo -e "${BLUE}ПІДСУМОК${NC}"
echo -e "${BLUE}${'='*72}${NC}"
echo ""
echo -e "  ${GREEN}✅ Passed:   $PASSED${NC}"
echo -e "  ${RED}❌ Failed:   $FAILED${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "  ────────────────"
echo -e "     Total:    $TOTAL"
echo ""
echo -e "${BLUE}${'='*72}${NC}"
echo ""

# ==============================================================================
# Рекомендації
# ==============================================================================
if [ $FAILED -gt 0 ]; then
    error "КРИТИЧНІ ПРОБЛЕМИ ЗНАЙДЕНО!"
    echo ""
    echo "Виправте помилки перед запуском:"
    echo "  - Встановіть відсутні залежності"
    echo "  - Створіть venv: bash scripts/setup-venv.sh"
    echo "  - Налаштуйте .env файл"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    warning "СИСТЕМА ГОТОВА З ЗАСТЕРЕЖЕННЯМИ"
    echo ""
    echo "Рекомендації:"
    [ ! -d "$VENV_PATH" ] && echo "  • Створіть venv: bash scripts/setup-venv.sh"
    [ ! -f "$PROJECT_ROOT/backend/.env" ] && echo "  • Налаштуйте .env: cd backend && cp .env.example .env"
    ! lsof -i :5432 &> /dev/null && echo "  • Запустіть PostgreSQL: brew services start postgresql@14"
    ! lsof -i :6379 &> /dev/null && echo "  • Запустіть Redis (опціонально): brew services start redis"
    echo ""
    echo "Після виправлення:"
    echo "  bash scripts/start-all.sh"
    echo ""
    exit 0
else
    success "ВСІ ПЕРЕВІРКИ ПРОЙДЕНО! 🎉"
    echo ""
    echo "Система готова до запуску!"
    echo ""
    echo "Наступні кроки:"
    echo "  1. Активувати venv:"
    echo "     source backend/venv/bin/activate"
    echo ""
    echo "  2. Запустити всі сервіси:"
    echo "     bash scripts/start-all.sh"
    echo ""
    echo "  3. Перевірити API:"
    echo "     curl http://localhost:8000/health"
    echo "     open http://localhost:8000/docs"
    echo ""
    exit 0
fi
