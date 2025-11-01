#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Start All Services
# ==============================================================================
# Запускає всі необхідні сервіси для локальної розробки
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

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ==============================================================================
# Banner
# ==============================================================================
cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - Local Development Environment          ║
║                      Start All Services                      ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""

# ==============================================================================
# Перевірка портів
# ==============================================================================
info "=== Перевірка портів ==="

"$SCRIPT_DIR/manage-ports.sh" check

read "REPLY?Звільнити зайняті порти (окрім PostgreSQL)? (y/N): "
if [[ $REPLY =~ ^[Yy]$ ]]; then
    "$SCRIPT_DIR/manage-ports.sh" free-dev
fi

echo ""

# ==============================================================================
# PostgreSQL
# ==============================================================================
info "=== PostgreSQL ==="

if lsof -i :5432 >/dev/null 2>&1; then
    success "PostgreSQL вже запущено"
else
    info "Запускаю PostgreSQL..."
    if command -v brew >/dev/null 2>&1; then
        brew services start postgresql@14 || brew services start postgresql
        sleep 2
        success "PostgreSQL запущено"
    else
        warning "Homebrew не знайдено. Запустіть PostgreSQL вручну."
    fi
fi

echo ""

# ==============================================================================
# Redis
# ==============================================================================
info "=== Redis ==="

if lsof -i :6379 >/dev/null 2>&1; then
    success "Redis вже запущено"
else
    info "Запускаю Redis..."
    if command -v brew >/dev/null 2>&1; then
        brew services start redis
        sleep 1
        success "Redis запущено"
    else
        warning "Homebrew не знайдено. Запустіть Redis вручну."
    fi
fi

echo ""

# ==============================================================================
# OpenSearch (опціонально)
# ==============================================================================
info "=== OpenSearch (опціонально) ==="

if lsof -i :9200 >/dev/null 2>&1; then
    success "OpenSearch вже запущено"
else
    read "REPLY?Запустити OpenSearch? (y/N): "
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v brew >/dev/null 2>&1; then
            brew services start opensearch
            sleep 3
            success "OpenSearch запущено"

            # Dashboards
            if command -v opensearch-dashboards >/dev/null 2>&1; then
                read "REPLY?Запустити OpenSearch Dashboards? (y/N): "
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    brew services start opensearch-dashboards
                    sleep 2
                    success "OpenSearch Dashboards запущено на http://localhost:5601"
                fi
            fi
        else
            warning "OpenSearch не встановлено. Див. OPENSEARCH_SETUP_GUIDE.md"
        fi
    fi
fi

echo ""

# ==============================================================================
# Backend (FastAPI)
# ==============================================================================
info "=== Backend (FastAPI) ==="

cd "$PROJECT_ROOT/backend"

# Перевірка venv
if [ ! -d "venv" ]; then
    error "venv не знайдено!"
    info "Запустіть: python3.11 -m venv venv && source venv/bin/activate && pip install -r requirements-311-modern.txt"
    exit 1
fi

# Активація venv
source venv/bin/activate

# Перевірка .env
if [ ! -f ".env" ]; then
    warning ".env не знайдено"
    if [ -f ".env.example" ]; then
        info "Копіюю .env.example -> .env"
        cp .env.example .env
        warning "Відредагуйте .env перед запуском!"
    fi
fi

# Міграції
info "Застосовую міграції БД..."
if [ -f "alembic.ini" ]; then
    alembic upgrade head
    success "Міграції застосовано"
else
    warning "alembic.ini не знайдено, пропускаю міграції"
fi

# Запуск сервера в фоні
info "Запускаю FastAPI сервер..."
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!

sleep 3

if kill -0 $BACKEND_PID 2>/dev/null; then
    success "Backend запущено на http://localhost:8000 (PID: $BACKEND_PID)"
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"
else
    error "Не вдалося запустити backend. Перегляньте logs/backend.log"
fi

echo ""

# ==============================================================================
# Celery Worker (опціонально)
# ==============================================================================
info "=== Celery Worker (опціонально) ==="

read "REPLY?Запустити Celery Worker? (y/N): "
if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Запускаю Celery Worker..."
    nohup celery -A app.celery_app worker --loglevel=info > "$PROJECT_ROOT/logs/celery.log" 2>&1 &
    CELERY_PID=$!
    echo $CELERY_PID > "$PROJECT_ROOT/.celery.pid"
    success "Celery Worker запущено (PID: $CELERY_PID)"

    # Flower
    read "REPLY?Запустити Celery Flower (monitoring)? (y/N): "
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nohup celery -A app.celery_app flower --port=5555 > "$PROJECT_ROOT/logs/flower.log" 2>&1 &
        FLOWER_PID=$!
        echo $FLOWER_PID > "$PROJECT_ROOT/.flower.pid"
        success "Celery Flower запущено на http://localhost:5555 (PID: $FLOWER_PID)"
    fi
fi

echo ""

# ==============================================================================
# Frontend (опціонально)
# ==============================================================================
info "=== Frontend (опціонально) ==="

if [ -d "$PROJECT_ROOT/frontend" ]; then
    read "REPLY?Запустити Frontend? (y/N): "
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT/frontend"

        if [ ! -d "node_modules" ]; then
            info "Встановлюю npm залежності..."
            npm install
        fi

        info "Запускаю Frontend..."
        nohup npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"
        sleep 3
        success "Frontend запущено на http://localhost:3000 (PID: $FRONTEND_PID)"
    fi
else
    warning "Frontend директорія не знайдена"
fi

echo ""

# ==============================================================================
# Підсумок
# ==============================================================================
success "=========================================="
success "   ВСІ СЕРВІСИ ЗАПУЩЕНО! 🚀"
success "=========================================="
echo ""

cat << 'EOF'
📍 Доступні сервіси:

  🌐 Backend API:        http://localhost:8000
  📚 API Docs:           http://localhost:8000/docs
  🎨 Frontend:           http://localhost:3000
  🗄️  PostgreSQL:         localhost:5432
  🔴 Redis:              localhost:6379
  🔍 OpenSearch:         http://localhost:9200
  📊 OpenSearch Dash:    http://localhost:5601
  🌸 Celery Flower:      http://localhost:5555

📋 Корисні команди:

  # Переглянути логи
  tail -f logs/backend.log
  tail -f logs/celery.log

  # Зупинити сервіси
  ./scripts/stop-all.sh

  # Перевірити статус
  ./scripts/manage-ports.sh check

  # Health check
  python scripts/health-check.py

EOF

# Зберегти інформацію про запущені процеси
cat > "$PROJECT_ROOT/.running-services.txt" << EOF
# Запущені сервіси Predator12
# $(date)

Backend PID: ${BACKEND_PID:-N/A}
Celery PID: ${CELERY_PID:-N/A}
Flower PID: ${FLOWER_PID:-N/A}
Frontend PID: ${FRONTEND_PID:-N/A}
EOF

info "Інформація про запущені процеси збережена у .running-services.txt"
echo ""

deactivate 2>/dev/null || true
