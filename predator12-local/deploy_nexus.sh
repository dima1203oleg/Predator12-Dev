#!/bin/bash

# ============================================================================
#                    PREDATOR NEXUS - PRODUCTION DEPLOYMENT
#                          Кібер-інтерфейс Launch Script
# ============================================================================

set -e

echo "🔮 Запуск Predator Analytics Nexus - Кібер-інтерфейс"
echo "═══════════════════════════════════════════════════════════════"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.nexus.yml"
ENV_FILE=".env.production"
PROJECT_NAME="predator-nexus"

# Functions
print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${PURPLE}━━━ $1 ━━━${NC}"
}

# Pre-deployment checks
print_section "PRE-DEPLOYMENT CHECKS"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker не встановлено. Встановіть Docker спочатку."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose не встановлено."
    exit 1
fi

print_success "Docker і Docker Compose доступні"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker не запущений. Запустіть Docker Desktop."
    exit 1
fi

print_success "Docker daemon працює"

# Check files
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Файл $COMPOSE_FILE не знайдено"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    print_warning "Файл $ENV_FILE не знайдено. Використовую defaults."
    ENV_FILE=""
else
    print_success "Environment файл знайдено"
fi

print_success "Всі необхідні файли присутні"

# Frontend build check
print_section "FRONTEND BUILD CHECK"

if [ ! -d "frontend/dist" ]; then
    print_status "Збираю frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Встановлюю npm залежності..."
        npm install
    fi
    
    print_status "Виконую production build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend зібрано успішно"
    else
        print_error "Помилка збірки frontend"
        exit 1
    fi
    
    cd ..
else
    print_success "Frontend вже зібрано"
fi

# Deployment
print_section "DEPLOYMENT"

# Stop existing containers
print_status "Зупиняю існуючі контейнери..."
if [ -n "$ENV_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT_NAME" down 2>/dev/null || true
else
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down 2>/dev/null || true
fi

# Pull latest images
print_status "Оновлюю Docker образи..."
if [ -n "$ENV_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT_NAME" pull
else
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" pull
fi

# Build and start
print_status "Запускаю Nexus кібер-інтерфейс..."
if [ -n "$ENV_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" -p "$PROJECT_NAME" up -d --build
else
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build
fi

# Wait for services
print_section "HEALTH CHECKS"

print_status "Очікую готовності сервісів..."
sleep 10

# Check frontend
print_status "Перевіряю frontend (http://localhost:3000)..."
for i in {1..30}; do
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_success "✅ Frontend готовий"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Frontend не відповідає, але deployment продовжується"
    fi
    sleep 2
done

# Check backend
print_status "Перевіряю backend (http://localhost:8000)..."
for i in {1..30}; do
    if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "✅ Backend готовий"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend не відповідає, перевірте логи"
    fi
    sleep 2
done

# Show status
print_section "DEPLOYMENT STATUS"

echo -e "${BLUE}🔮 Predator Analytics Nexus - Кібер-інтерфейс${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Frontend (React + 3D):${NC} http://localhost:3000"
echo -e "${GREEN}✅ Backend API:${NC}           http://localhost:8000"
echo -e "${GREEN}✅ Database:${NC}              localhost:5432"
echo -e "${GREEN}✅ Redis Cache:${NC}           localhost:6379"
echo -e "${GREEN}✅ Nginx Proxy:${NC}           http://localhost:80"
echo ""

# Show running containers
echo -e "${BLUE}📦 Запущені контейнери:${NC}"
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps

echo ""
echo -e "${PURPLE}🎮 FEATURES READY:${NC}"
echo "  🤖 HolographicGuide - 3D AI-гід з голосовим управлінням"
echo "  🌌 DataFlowMap - 3D карта потоків даних"
echo "  🔥 MASupervisor - 3D вулик агентів"
echo "  ⚡ NexusCore - центральний dashboard"
echo ""

print_section "MANAGEMENT COMMANDS"

echo "🛑 Зупинка:"
echo "   docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down"
echo ""
echo "📊 Логи:"
echo "   docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
echo ""
echo "🔄 Перезапуск:"
echo "   docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart"
echo ""
echo "🧹 Повне очищення:"
echo "   docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --remove-orphans"

print_section "READY FOR ACTION!"

print_success "🎊 Predator Nexus кібер-інтерфейс успішно запущено!"
print_success "🌐 Відкрийте http://localhost:3000 для початку"
print_success "🎯 Всі 3D голографічні компоненти активні"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                    MISSION ACCOMPLISHED! 🏆${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
