#!/usr/bin/env bash
# 🚀 PREDATOR12 AUTO-APPROVE & AUTO-START SYSTEM
# Система автоматичного схвалення змін та автозапуску

set -euo pipefail

echo "🌌 ================================================"
echo "🚀 PREDATOR12 AUTO-APPROVE SYSTEM"
echo "⚡ Автоматичне схвалення та запуск"
echo "🌌 ================================================"

# Кольорове виведення
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функція логування
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Перевірка, чи є зміни
check_changes() {
    if [ -z "$(git status --porcelain)" ]; then
        log_info "Немає змін для схвалення"
        return 1
    fi
    return 0
}

# Автоматичне схвалення змін
auto_approve() {
    log_info "Автоматичне схвалення змін..."
    
    # Додаємо всі зміни
    git add .
    log_success "Всі зміни додано до staging"
    
    # Створюємо commit з timestamp
    COMMIT_MSG="🚀 Auto-approve: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG" --no-verify
    log_success "Commit створено: $COMMIT_MSG"
    
    # Push змін
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Pushing до $CURRENT_BRANCH..."
    git push origin "$CURRENT_BRANCH" || {
        log_warning "Push failed, trying with force..."
        git push -f origin "$CURRENT_BRANCH"
    }
    log_success "Зміни відправлено до remote"
}

# Запуск Backend
start_backend() {
    log_info "Запуск Backend Hero API..."
    
    # Перевірка, чи не запущений вже
    if lsof -ti:8000 >/dev/null 2>&1; then
        log_warning "Backend вже запущений на порту 8000"
        return 0
    fi
    
    cd /Users/dima/Documents/Predator12
    nohup python3.11 backend/hero_api.py > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    
    sleep 3
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        log_success "Backend запущено (PID: $BACKEND_PID)"
    else
        log_error "Backend не запустився"
        return 1
    fi
}

# Запуск Frontend
start_frontend() {
    log_info "Запуск Frontend..."
    
    # Перевірка, чи не запущений вже
    if lsof -ti:3000 >/dev/null 2>&1; then
        log_warning "Frontend вже запущений на порту 3000"
        return 0
    fi
    
    cd /Users/dima/Documents/Predator12/predator-analytics/frontend
    nohup npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../.frontend.pid
    
    sleep 5
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        log_success "Frontend запущено (PID: $FRONTEND_PID)"
    else
        log_warning "Frontend запускається... (PID: $FRONTEND_PID)"
    fi
}

# Показати статус системи
show_status() {
    echo ""
    echo "🎯 ================================================"
    echo "📊 Статус системи Predator12"
    echo "🎯 ================================================"
    echo ""
    
    # Backend
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        log_success "Backend API: ✅ WORKING (http://localhost:8000)"
        curl -s http://localhost:8000/health | python3 -m json.tool || true
    else
        log_error "Backend API: ❌ NOT RUNNING"
    fi
    
    echo ""
    
    # Frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        log_success "Frontend: ✅ WORKING (http://localhost:3000)"
    else
        log_warning "Frontend: ⏳ STARTING..."
    fi
    
    echo ""
    echo "🎯 ================================================"
    echo "🌐 Відкрийте браузер: http://localhost:3000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo "🎯 ================================================"
}

# Головна функція
main() {
    cd /Users/dima/Documents/Predator12
    
    # Створюємо директорію для логів
    mkdir -p logs
    
    # Автосхвалення змін (якщо є)
    if check_changes; then
        auto_approve
    fi
    
    # Запуск Backend
    start_backend
    
    # Запуск Frontend
    start_frontend
    
    # Показати статус
    show_status
    
    log_success "Система автозапуску завершена успішно!"
    echo ""
    echo "💡 Для зупинки системи виконайте:"
    echo "   kill \$(cat .backend.pid .frontend.pid 2>/dev/null)"
}

# Запуск
main "$@"
