#!/bin/bash

# 🤖 Predator Analytics - Intelligent Migration Scheduler
# Автоматичний вибір оптимального моменту для переходу на Helm Charts

set -euo pipefail

# Кольори
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Конфігурація
MIGRATION_SCRIPT="/Users/dima/Documents/Predator11/scripts/migrate-to-helm.sh"
MONITORING_INTERVAL=300  # 5 хвилин
MAX_WAIT_TIME=86400     # 24 години
LOG_FILE="/tmp/predator-migration-scheduler.log"

# Метрики для вибору оптимального часу
check_system_metrics() {
    local cpu_usage memory_usage disk_usage network_load user_activity
    
    # CPU використання
    cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    
    # Memory використання  
    memory_usage=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print 100-$5}')
    
    # Disk I/O
    disk_usage=$(iostat -d 1 2 | tail -1 | awk '{print $3+$4}')
    
    # Network активність (приблизно)
    network_load=$(netstat -ib | awk 'NR>1 {sum+=$7+$10} END {print sum/1024/1024}' 2>/dev/null || echo "0")
    
    # Активність користувача (кількість процесів)
    user_activity=$(ps aux | wc -l)
    
    # Час доби (0-23)
    current_hour=$(date +%H)
    
    echo "$cpu_usage $memory_usage $disk_usage $network_load $user_activity $current_hour"
}

# Оцінка оптимальності моменту (0-100, де 100 - найкраще)
calculate_migration_score() {
    local metrics=($1)
    local cpu=${metrics[0]:-50}
    local memory=${metrics[1]:-50}
    local disk=${metrics[2]:-50}
    local network=${metrics[3]:-50}
    local processes=${metrics[4]:-200}
    local hour=${metrics[5]:-12}
    
    local score=100
    
    # CPU навантаження (чим менше, тим краще)
    if (( $(echo "$cpu > 70" | bc -l) )); then
        score=$((score - 30))
    elif (( $(echo "$cpu > 50" | bc -l) )); then
        score=$((score - 15))
    fi
    
    # Memory використання
    if (( $(echo "$memory > 80" | bc -l) )); then
        score=$((score - 25))
    elif (( $(echo "$memory > 60" | bc -l) )); then
        score=$((score - 10))
    fi
    
    # Disk I/O активність
    if (( $(echo "$disk > 100" | bc -l) )); then
        score=$((score - 20))
    fi
    
    # Час доби (кращий час: 2-6 ранку або 14-16)
    if [[ $hour -ge 2 && $hour -le 6 ]]; then
        score=$((score + 20))  # Ніч - найкращий час
    elif [[ $hour -ge 14 && $hour -le 16 ]]; then
        score=$((score + 10))  # Обід - добрий час
    elif [[ $hour -ge 9 && $hour -le 18 ]]; then
        score=$((score - 15))  # Робочий час - гірше
    fi
    
    # День тижня
    local weekday=$(date +%u)  # 1=Monday, 7=Sunday
    if [[ $weekday -eq 6 || $weekday -eq 7 ]]; then
        score=$((score + 15))  # Вихідні - краще
    fi
    
    # Кількість активних процесів
    if [[ $processes -gt 300 ]]; then
        score=$((score - 10))
    fi
    
    # Обмеження score
    if [[ $score -lt 0 ]]; then score=0; fi
    if [[ $score -gt 100 ]]; then score=100; fi
    
    echo $score
}

# Перевірка готовності системи
check_system_readiness() {
    local issues=0
    
    # Перевірка наявності необхідних інструментів
    for tool in kubectl helm docker; do
        if ! command -v $tool &> /dev/null; then
            error "$tool не встановлено"
            ((issues++))
        fi
    done
    
    # Перевірка доступу до Kubernetes
    if ! kubectl cluster-info &> /dev/null; then
        warning "Немає доступу до Kubernetes кластера"
        ((issues++))
    fi
    
    # Перевірка Docker
    if ! docker info &> /dev/null; then
        warning "Docker не запущений"
        ((issues++))
    fi
    
    # Перевірка вільного місця на диску
    local free_space=$(df / | tail -1 | awk '{print $4}')
    if [[ $free_space -lt 10000000 ]]; then  # Менше 10GB
        warning "Недостатньо вільного місця на диску"
        ((issues++))
    fi
    
    return $issues
}

# Відправка уведомлення
send_notification() {
    local message="$1"
    local level="$2"  # info, warning, error
    
    # Лог
    echo "[$(date)] [$level] $message" >> "$LOG_FILE"
    
    # Terminal notification (macOS)
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"$message\" with title \"Predator Analytics Migration\""
    fi
    
    # Slack notification (якщо налаштовано)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🤖 Predator Migration: $message\"}" \
            "$SLACK_WEBHOOK_URL" &> /dev/null || true
    fi
}

# Основний цикл моніторингу
monitor_and_schedule() {
    local start_time=$(date +%s)
    local best_score=0
    local wait_count=0
    local max_wait_cycles=$((MAX_WAIT_TIME / MONITORING_INTERVAL))
    
    log "🔍 Початок моніторингу для вибору оптимального моменту міграції"
    log "📊 Перевірка кожні $MONITORING_INTERVAL секунд, максимум $MAX_WAIT_TIME секунд"
    
    while true; do
        # Перевірка готовності системи
        if ! check_system_readiness; then
            warning "Система не готова для міграції, чекаємо..."
            sleep $MONITORING_INTERVAL
            continue
        fi
        
        # Збір метрик
        local metrics=$(check_system_metrics)
        local score=$(calculate_migration_score "$metrics")
        
        log "📈 Поточний score: $score/100 (CPU: $(echo $metrics | cut -d' ' -f1)%, Memory: $(echo $metrics | cut -d' ' -f2)%, Hour: $(echo $metrics | cut -d' ' -f6))"
        
        # Перевірка порогів для запуску міграції
        if [[ $score -ge 85 ]]; then
            success "🎯 Відмінні умови для міграції (score: $score)!"
            return 0
        elif [[ $score -ge 75 && $wait_count -gt 20 ]]; then  # Після години чекання
            success "✅ Хороші умови для міграції (score: $score)"
            return 0
        elif [[ $score -ge 60 && $wait_count -gt 100 ]]; then # Після 8+ годин
            warning "⏰ Запускаємо міграцію через тривале очікування (score: $score)"
            return 0
        fi
        
        # Оновлення найкращого score
        if [[ $score -gt $best_score ]]; then
            best_score=$score
        fi
        
        # Перевірка максимального часу очікування
        wait_count=$((wait_count + 1))
        if [[ $wait_count -ge $max_wait_cycles ]]; then
            warning "⏱️ Досягнуто максимальний час очікування, запускаємо міграцію"
            return 0
        fi
        
        # Прогнозування наступного оптимального вікна
        local current_hour=$(date +%H)
        local next_optimal=""
        
        if [[ $current_hour -lt 2 ]]; then
            next_optimal="02:00 сьогодні"
        elif [[ $current_hour -lt 6 ]]; then
            next_optimal="через $((6 - current_hour)) годин"
        elif [[ $current_hour -lt 14 ]]; then
            next_optimal="14:00 сьогодні"
        else
            next_optimal="02:00 завтра"
        fi
        
        log "⏳ Очікування... Наступне оптимальне вікно: $next_optimal (найкращий score: $best_score)"
        
        # Сповіщення кожні 30 хвилин
        if [[ $((wait_count % 6)) -eq 0 ]]; then
            send_notification "Очікування оптимального моменту для міграції. Score: $score/100" "info"
        fi
        
        sleep $MONITORING_INTERVAL
    done
}

# Виконання міграції
execute_migration() {
    log "🚀 Розпочинаємо міграцію на Kubernetes..."
    
    send_notification "Розпочинаємо автоматичну міграцію Predator Analytics на Kubernetes" "info"
    
    # Запуск міграції з правильними параметрами
    if [[ -x "$MIGRATION_SCRIPT" ]]; then
        "$MIGRATION_SCRIPT" \
            --registry "${DOCKER_REGISTRY:-localhost:5000}" \
            --namespace "predator-analytics"
    else
        error "Скрипт міграції не знайдено або не має права виконання: $MIGRATION_SCRIPT"
        return 1
    fi
}

# Головна функція
main() {
    log "🤖 Predator Analytics - Intelligent Migration Scheduler"
    
    # Обробка параметрів
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                log "🔨 Форсована міграція без очікування"
                execute_migration
                exit $?
                ;;
            --check-only)
                local metrics=$(check_system_metrics)
                local score=$(calculate_migration_score "$metrics")
                echo "Поточний score: $score/100"
                echo "Метрики: $metrics"
                exit 0
                ;;
            --max-wait)
                MAX_WAIT_TIME="$2"
                shift 2
                ;;
            --interval)
                MONITORING_INTERVAL="$2"
                shift 2
                ;;
            --slack-webhook)
                SLACK_WEBHOOK_URL="$2"
                shift 2
                ;;
            -h|--help)
                echo "Використання: $0 [OPTIONS]"
                echo "OPTIONS:"
                echo "  --force              Форсувати міграцію негайно"
                echo "  --check-only         Тільки показати поточний score"
                echo "  --max-wait SECONDS   Максимальний час очікування (за замовчуванням: 86400)"
                echo "  --interval SECONDS   Інтервал перевірки (за замовчуванням: 300)"
                echo "  --slack-webhook URL  Slack webhook для сповіщень"
                echo "  -h, --help           Показати цю довідку"
                exit 0
                ;;
            *)
                error "Невідомий параметр: $1"
                exit 1
                ;;
        esac
    done
    
    # Початкова перевірка
    log "🔍 Початкова перевірка системи..."
    if ! check_system_readiness; then
        error "Система не готова для міграції"
        exit 1
    fi
    
    # Моніторинг та планування
    if monitor_and_schedule; then
        execute_migration
        if [[ $? -eq 0 ]]; then
            success "🎉 Міграція завершена успішно!"
            send_notification "Міграція Predator Analytics завершена успішно! 🎉" "info"
        else
            error "Помилка під час міграції"
            send_notification "Помилка під час міграції Predator Analytics" "error"
            exit 1
        fi
    else
        error "Помилка планувальника"
        exit 1
    fi
}

# Запуск у фоновому режимі з можливістю контролю
if [[ "${1:-}" == "--daemon" ]]; then
    log "🔄 Запуск у фоновому режимі..."
    # Створення PID файлу
    echo $$ > /tmp/predator-migration-scheduler.pid
    
    # Перенаправлення логів
    exec > >(tee -a "$LOG_FILE") 2>&1
    
    # Запуск
    main "${@:2}"
else
    main "$@"
fi
