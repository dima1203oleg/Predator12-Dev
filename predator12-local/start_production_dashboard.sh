#!/bin/bash

# ============================================================================
#                   PREDATOR NEXUS - PRODUCTION DASHBOARD LAUNCHER
#                            Запуск продакшн пульту на порту 5090
# ============================================================================

echo "🚀 PREDATOR NEXUS - PRODUCTION DASHBOARD STARTUP"
echo "================================================="
echo "📅 $(date)"
echo "🎯 Target Port: 5090"
echo "🔧 Mode: Production Dashboard"
echo ""

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функція для логування
log() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Перевірка залежностей
log "Checking dependencies..."

if ! command -v docker &> /dev/null; then
    error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed or not in PATH"
    exit 1
fi

success "Docker and Docker Compose are available"

# Перевірка порту 5090
log "Checking port 5090..."

if lsof -i :5090 &> /dev/null; then
    warning "Port 5090 is already in use"
    echo "Current processes on port 5090:"
    lsof -i :5090
    echo ""
    read -p "Do you want to stop existing processes and continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Aborted by user"
        exit 1
    fi
    
    log "Stopping processes on port 5090..."
    sudo lsof -ti:5090 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi

success "Port 5090 is available"

# Збірка фронтенду (якщо потрібно)
log "Building frontend..."

if [ ! -d "frontend/dist" ] || [ ! -f "frontend/dist/index.html" ]; then
    warning "Frontend dist not found, building..."
    cd frontend
    npm run build
    cd ..
    success "Frontend built successfully"
else
    success "Frontend dist already exists"
fi

# Зупинка існуючих контейнерів
log "Stopping existing containers..."
docker-compose -f docker-compose.dashboard.yml down 2>/dev/null || true
success "Existing containers stopped"

# Очищення Docker системи (опціонально)
log "Cleaning up Docker system..."
docker system prune -f --volumes 2>/dev/null || true

# Запуск продакшн дашборду
log "Starting Production Dashboard on port 5090..."
docker-compose -f docker-compose.dashboard.yml up -d

# Перевірка статусу
sleep 5
log "Checking container status..."

if docker-compose -f docker-compose.dashboard.yml ps | grep -q "Up"; then
    success "Production Dashboard started successfully!"
    echo ""
    echo "🎉 PRODUCTION DASHBOARD IS READY!"
    echo "=================================="
    echo "🌐 Dashboard URL: http://localhost:5090"
    echo "🔌 API URL: http://localhost:8090"
    echo "📊 Database: localhost:5432"
    echo "🔄 Redis: localhost:6379"
    echo ""
    echo "📋 Container Status:"
    docker-compose -f docker-compose.dashboard.yml ps
    echo ""
    echo "📝 View logs: docker-compose -f docker-compose.dashboard.yml logs -f"
    echo "🛑 Stop dashboard: docker-compose -f docker-compose.dashboard.yml down"
    echo ""
    
    # Перевірка доступності
    log "Testing dashboard accessibility..."
    sleep 10
    
    if curl -s http://localhost:5090 > /dev/null; then
        success "Dashboard is accessible at http://localhost:5090"
        
        # Відкриття в браузері (macOS)
        if command -v open &> /dev/null; then
            log "Opening dashboard in browser..."
            open http://localhost:5090
        fi
    else
        warning "Dashboard might still be starting up..."
        echo "Please wait a moment and check http://localhost:5090"
    fi
    
else
    error "Failed to start Production Dashboard"
    echo ""
    echo "📋 Container Status:"
    docker-compose -f docker-compose.dashboard.yml ps
    echo ""
    echo "📝 Error logs:"
    docker-compose -f docker-compose.dashboard.yml logs
    exit 1
fi

echo ""
echo "🎯 PRODUCTION DASHBOARD STARTUP COMPLETE"
echo "========================================"
