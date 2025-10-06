#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Port Management Script
# ==============================================================================
# Керування портами для локального dev-середовища
# ==============================================================================

set -Eeuo pipefail

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функції виводу
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Порти Predator12 (масиви для bash 3.x compatibility)
PORTS=(
    "8000:Backend FastAPI"
    "3000:Frontend React/Next.js"
    "5432:PostgreSQL Database"
    "6379:Redis Cache"
    "9200:OpenSearch"
    "5601:OpenSearch Dashboards"
    "5672:RabbitMQ"
    "15672:RabbitMQ Management"
    "6333:Qdrant Vector DB"
    "9000:MinIO S3"
    "9001:MinIO Console"
    "5555:Celery Flower"
)

# ==============================================================================
# Функція: Перевірка порту
# ==============================================================================
check_port() {
    local port=$1
    local name=$2
    
    if sudo lsof -i :$port -sTCP:LISTEN &>/dev/null; then
        local pid=$(sudo lsof -ti :$port -sTCP:LISTEN)
        local process=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
        warning "Port $port ($name) зайнятий: PID=$pid, Process=$process"
        return 1
    else
        success "Port $port ($name) вільний"
        return 0
    fi
}

# ==============================================================================
# Функція: Звільнення порту
# ==============================================================================
free_port() {
    local port=$1
    local name=$2
    
    info "Звільняю порт $port ($name)..."
    
    if sudo lsof -ti :$port -sTCP:LISTEN &>/dev/null; then
        local pids=$(sudo lsof -ti :$port -sTCP:LISTEN)
        for pid in $pids; do
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            warning "Вбиваю процес: PID=$pid, Process=$process"
            sudo kill -9 $pid 2>/dev/null || true
        done
        sleep 1
        
        if sudo lsof -ti :$port -sTCP:LISTEN &>/dev/null; then
            error "Не вдалося звільнити порт $port"
            return 1
        else
            success "Порт $port звільнено"
            return 0
        fi
    else
        info "Порт $port вже вільний"
        return 0
    fi
}

# ==============================================================================
# Команда: check - Перевірити всі порти
# ==============================================================================
cmd_check() {
    info "=== Перевірка всіх портів Predator12 ==="
    echo ""
    
    local occupied=0
    local free_count=0
    
    for entry in "${PORTS[@]}"; do
        local port="${entry%%:*}"
        local name="${entry#*:}"
        if check_port "$port" "$name"; then
            free_count=$((free_count + 1))
        else
            occupied=$((occupied + 1))
        fi
    done
    
    echo ""
    info "Підсумок: $free_count вільних, $occupied зайнятих"
}

# ==============================================================================
# Команда: free - Звільнити всі зайняті порти
# ==============================================================================
cmd_free() {
    warning "=== УВАГА: Звільнення всіх портів Predator12 ==="
    echo ""
    
    read -p "Ви впевнені? Це вб'є всі процеси на цих портах! (y/N): " -n 1 -r REPLY
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Скасовано користувачем"
        exit 0
    fi
    
    echo ""
    info "Звільняю порти..."
    echo ""
    
    for entry in "${PORTS[@]}"; do
        local port="${entry%%:*}"
        local name="${entry#*:}"
        free_port "$port" "$name"
    done
    
    echo ""
    success "Всі порти звільнено!"
}

# ==============================================================================
# Команда: free-single - Звільнити конкретний порт
# ==============================================================================
cmd_free_single() {
    local port=$1
    
    if [ -z "$port" ]; then
        error "Вкажіть номер порту: $0 free-single <PORT>"
        exit 1
    fi
    
    local name="Unknown service"
    for entry in "${PORTS[@]}"; do
        if [ "${entry%%:*}" = "$port" ]; then
            name="${entry#*:}"
            break
        fi
    done
    
    free_port "$port" "$name"
}

# ==============================================================================
# Команда: free-dev - Звільнити тільки dev-порти (8000, 3000, 5555)
# ==============================================================================
cmd_free_dev() {
    info "=== Звільняю dev-порти (8000, 3000, 5555) ==="
    echo ""
    
    free_port 8000 "Backend FastAPI"
    free_port 3000 "Frontend"
    free_port 5555 "Celery Flower"
    
    echo ""
    success "Dev-порти звільнено!"
}

# ==============================================================================
# Команда: kill-postgres - Зупинити PostgreSQL (обережно!)
# ==============================================================================
cmd_kill_postgres() {
    warning "=== УВАГА: Зупинка PostgreSQL ==="
    echo ""
    
    read -p "Це зупинить всю базу даних! Впевнені? (y/N): " -n 1 -r REPLY
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Скасовано"
        exit 0
    fi
    
    # Спроба через brew
    if brew services list 2>/dev/null | grep -q "postgresql.*started"; then
        info "Зупиняю PostgreSQL через Homebrew..."
        brew services stop postgresql@14 || brew services stop postgresql
        success "PostgreSQL зупинено через brew"
    else
        # Спроба через kill
        free_port 5432 "PostgreSQL"
    fi
}

# ==============================================================================
# Команда: help
# ==============================================================================
cmd_help() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - Port Management Script                 ║
╚══════════════════════════════════════════════════════════════╝

ВИКОРИСТАННЯ:
  ./manage-ports.sh <command>

КОМАНДИ:
  check           Перевірити статус всіх портів
  free            Звільнити ВСІ зайняті порти (з підтвердженням)
  free-dev        Звільнити тільки dev-порти (8000, 3000, 5555)
  free-single     Звільнити конкретний порт: free-single <PORT>
  kill-postgres   Зупинити PostgreSQL (обережно!)
  help            Показати цю довідку

ПОРТИ PREDATOR12:
  8000   - Backend FastAPI
  3000   - Frontend React/Next.js
  5432   - PostgreSQL Database
  6379   - Redis Cache
  9200   - OpenSearch
  5601   - OpenSearch Dashboards
  5672   - RabbitMQ
  15672  - RabbitMQ Management
  6333   - Qdrant Vector DB
  9000   - MinIO S3
  9001   - MinIO Console
  5555   - Celery Flower

ПРИКЛАДИ:
  # Перевірити всі порти
  ./manage-ports.sh check

  # Звільнити dev-порти
  ./manage-ports.sh free-dev

  # Звільнити конкретний порт
  ./manage-ports.sh free-single 8000

  # Звільнити всі порти
  ./manage-ports.sh free

EOF
}

# ==============================================================================
# MAIN
# ==============================================================================

case "${1:-help}" in
    check)
        cmd_check
        ;;
    free)
        cmd_free
        ;;
    free-dev)
        cmd_free_dev
        ;;
    free-single)
        cmd_free_single "$2"
        ;;
    kill-postgres)
        cmd_kill_postgres
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        error "Невідома команда: $1"
        echo ""
        cmd_help
        exit 1
        ;;
esac
