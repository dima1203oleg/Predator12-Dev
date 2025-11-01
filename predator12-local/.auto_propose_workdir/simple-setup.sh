#!/bin/bash

# 🚀 Predator12 Simple Setup
# Простий швидкий запуск для macOS

set -e

# Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║  🚀 PREDATOR12 SIMPLE SETUP              ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}\n"

# Перевірка Python 3.11
echo -e "${BLUE}1. Перевірка Python 3.11...${NC}"
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
elif [ -f "/opt/homebrew/bin/python3.11" ]; then
    PYTHON_CMD="/opt/homebrew/bin/python3.11"
else
    echo -e "${RED}❌ Python 3.11 не знайдено!${NC}"
    echo -e "${YELLOW}Встановіть: brew install python@3.11${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3.11: $PYTHON_CMD${NC}"

# Перевірка PostgreSQL
echo -e "\n${BLUE}2. Перевірка PostgreSQL...${NC}"
if ! psql -U dima -d postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL не доступний!${NC}"
    echo -e "${YELLOW}Запустіть: brew services start postgresql@14${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL працює${NC}"

# Перевірка бази даних
echo -e "\n${BLUE}3. Перевірка бази даних...${NC}"
if psql -U dima -lqt | cut -d \| -f 1 | grep -qw predator11; then
    echo -e "${GREEN}✅ База даних predator11 існує${NC}"
else
    echo -e "${YELLOW}⚠️  База даних не знайдена. Створюю...${NC}"
    createdb -U dima predator11
    echo -e "${GREEN}✅ База даних predator11 створена${NC}"
fi

# Перевірка .env
echo -e "\n${BLUE}4. Перевірка .env файлу...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env створено з .env.example${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example не знайдено, створюю базовий .env${NC}"
        cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://dima:@localhost:5432/predator11
POSTGRES_USER=dima
POSTGRES_DB=predator11
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DEBUG=true
ENVIRONMENT=local

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
EOF
        echo -e "${GREEN}✅ Базовий .env створено${NC}"
    fi
else
    echo -e "${GREEN}✅ .env вже існує${NC}"
fi

# Backend залежності
echo -e "\n${BLUE}5. Встановлення backend залежностей...${NC}"
if [ -d "backend" ]; then
    cd backend

    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Створюю Python virtual environment...${NC}"
        $PYTHON_CMD -m venv venv
    fi

    echo -e "${YELLOW}Активую venv та встановлюю залежності...${NC}"
    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    deactivate

    echo -e "${GREEN}✅ Backend залежності встановлено${NC}"
    cd ..
else
    echo -e "${RED}❌ Директорія backend не знайдена!${NC}"
fi

# Frontend залежності
echo -e "\n${BLUE}6. Встановлення frontend залежностей...${NC}"
if [ -d "frontend" ]; then
    cd frontend

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Встановлюю npm залежності...${NC}"
        npm install -q
    else
        echo -e "${GREEN}✅ node_modules вже існує${NC}"
    fi

    echo -e "${GREEN}✅ Frontend залежності встановлено${NC}"
    cd ..
else
    echo -e "${RED}❌ Директорія frontend не знайдена!${NC}"
fi

# Фінальні інструкції
echo -e "\n${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ НАЛАШТУВАННЯ ЗАВЕРШЕНО!              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}Наступні кроки:${NC}\n"

echo -e "${YELLOW}1️⃣  Запуск Backend (термінал 1):${NC}"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""

echo -e "${YELLOW}2️⃣  Запуск Frontend (термінал 2):${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""

echo -e "${YELLOW}3️⃣  Або використайте Makefile:${NC}"
echo "   make dev"
echo ""

echo -e "${BLUE}🔗 Посилання:${NC}"
echo "   • Frontend:    http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs:    http://localhost:8000/docs"
echo ""

echo -e "${GREEN}🎉 Готово до розробки!${NC}\n"
