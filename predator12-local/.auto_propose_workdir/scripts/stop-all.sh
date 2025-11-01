#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Stop All Services
# ==============================================================================
# Зупиняє всі запущені сервіси
# ==============================================================================

set -Eeuo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - Stop All Services                      ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""

# ==============================================================================
# Зупинка Backend
# ==============================================================================
if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/.backend.pid")
    if kill -0 $PID 2>/dev/null; then
        info "Зупиняю Backend (PID: $PID)..."
        kill $PID
        success "Backend зупинено"
    else
        warning "Backend процес не знайдено"
    fi
    rm -f "$PROJECT_ROOT/.backend.pid"
fi

# ==============================================================================
# Зупинка Celery
# ==============================================================================
if [ -f "$PROJECT_ROOT/.celery.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/.celery.pid")
    if kill -0 $PID 2>/dev/null; then
        info "Зупиняю Celery Worker (PID: $PID)..."
        kill $PID
        success "Celery зупинено"
    fi
    rm -f "$PROJECT_ROOT/.celery.pid"
fi

# ==============================================================================
# Зупинка Flower
# ==============================================================================
if [ -f "$PROJECT_ROOT/.flower.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/.flower.pid")
    if kill -0 $PID 2>/dev/null; then
        info "Зупиняю Celery Flower (PID: $PID)..."
        kill $PID
        success "Flower зупинено"
    fi
    rm -f "$PROJECT_ROOT/.flower.pid"
fi

# ==============================================================================
# Зупинка Frontend
# ==============================================================================
if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/.frontend.pid")
    if kill -0 $PID 2>/dev/null; then
        info "Зупиняю Frontend (PID: $PID)..."
        kill $PID
        success "Frontend зупинено"
    fi
    rm -f "$PROJECT_ROOT/.frontend.pid"
fi

# ==============================================================================
# Зупинка сервісів через Homebrew (опціонально)
# ==============================================================================
echo ""
read "REPLY?Зупинити також Redis/OpenSearch/PostgreSQL? (y/N): "
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v brew >/dev/null 2>&1; then
        info "Зупиняю Redis..."
        brew services stop redis 2>/dev/null || true

        info "Зупиняю OpenSearch..."
        brew services stop opensearch 2>/dev/null || true
        brew services stop opensearch-dashboards 2>/dev/null || true

        warning "PostgreSQL залишається запущеним (містить дані)"
        read "REPLY?Зупинити PostgreSQL? (y/N): "
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            info "Зупиняю PostgreSQL..."
            brew services stop postgresql@14 || brew services stop postgresql
            success "PostgreSQL зупинено"
        fi
    fi
fi

# ==============================================================================
# Очистка файлів
# ==============================================================================
rm -f "$PROJECT_ROOT/.running-services.txt"

echo ""
success "=========================================="
success "   ВСІ СЕРВІСИ ЗУПИНЕНО! 🛑"
success "=========================================="
echo ""

info "Для повторного запуску використовуйте: ./scripts/start-all.sh"
