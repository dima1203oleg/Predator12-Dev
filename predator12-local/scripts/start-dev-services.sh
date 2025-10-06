#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Start Development Services
# ==============================================================================
# Запускає всі необхідні сервіси для локальної розробки
# ==============================================================================

set -Eeuo pipefail

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# ==============================================================================
# Функції запуску сервісів
# ==============================================================================

start_postgres() {
    info "Запуск PostgreSQL..."
    if brew services list | grep -q "postgresql.*started"; then
        success "PostgreSQL вже запущено"
    else
        brew services start postgresql@14
        sleep 2
        success "PostgreSQL запущено"
    fi
}

start_redis() {
    info "Запуск Redis..."
    if brew services list | grep -q "redis.*started"; then
        success "Redis вже запущено"
    else
        brew services start redis
        sleep 1
        success "Redis запущено"
    fi
}

start_opensearch() {
    info "Запуск OpenSearch..."
    if brew services list | grep -q "opensearch.*started"; then
        success "OpenSearch вже запущено"
    else
        brew services start opensearch
        warning "OpenSearch стартує (може зайняти 10-30 сек)..."
        sleep 5
        success "OpenSearch запущено"
    fi
}

start_opensearch_dashboards() {
    info "Запуск OpenSearch Dashboards..."
    if brew services list | grep -q "opensearch-dashboards.*started"; then
        success "OpenSearch Dashboards вже запущено"
    else
        brew services start opensearch-dashboards
        sleep 3
        success "OpenSearch Dashboards запущено"
    fi
}

# ==============================================================================
# Головна функція
# ==============================================================================

main() {
    echo ""
    info "=== PREDATOR12 Development Services Startup ==="
    echo ""
    
    # Запускаємо всі сервіси
    start_postgres
    start_redis
    start_opensearch
    start_opensearch_dashboards
    
    echo ""
    success "=== Всі сервіси запущено! ==="
    echo ""
    
    info "Доступні URL:"
    echo "  PostgreSQL:  localhost:5432"
    echo "  Redis:       localhost:6379"
    echo "  OpenSearch:  http://localhost:9200"
    echo "  Dashboards:  http://localhost:5601"
    echo ""
    
    info "Перевірка портів:"
    bash "$(dirname "$0")/manage-ports.sh" check
    echo ""
    
    info "Для зупинки сервісів:"
    echo "  brew services stop postgresql@14"
    echo "  brew services stop redis"
    echo "  brew services stop opensearch"
    echo "  brew services stop opensearch-dashboards"
    echo ""
}

main "$@"
