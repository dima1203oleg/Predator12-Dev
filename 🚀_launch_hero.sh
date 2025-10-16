#!/bin/bash

# 🚀 Predator Analytics Hero Interface - Launcher
# Запускає бекенд і фронтенд одночасно

echo "🎯 PREDATOR ANALYTICS - HERO INTERFACE"
echo "========================================"
echo ""

# Кольори для виводу
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функція для запуску бекенду
start_backend() {
    echo -e "${BLUE}📡 Запуск бекенду API...${NC}"
    cd /Users/dima/Documents/Predator12/backend
    python3.11 hero_api.py &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Бекенд запущено (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}📡 API: http://localhost:8000${NC}"
    echo -e "${GREEN}📚 Docs: http://localhost:8000/docs${NC}"
    echo ""
}

# Функція для запуску фронтенду
start_frontend() {
    echo -e "${BLUE}🎨 Запуск фронтенду...${NC}"
    cd /Users/dima/Documents/Predator12/predator12-local/frontend
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Фронтенд запущено (PID: $FRONTEND_PID)${NC}"
    echo -e "${GREEN}🌐 Frontend: http://localhost:5173${NC}"
    echo ""
}

# Функція для зупинки всіх процесів
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Зупинка сервісів...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Бекенд зупинено${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Фронтенд зупинено${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Дякую за використання Predator Analytics!${NC}"
    exit 0
}

# Перехоплення Ctrl+C
trap cleanup SIGINT SIGTERM

# Перевірка Python
if ! command -v python3.11 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3.11 не знайдено. Використовую python3...${NC}"
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python не знайдено! Встановіть Python 3.11+${NC}"
        exit 1
    fi
fi

# Перевірка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не знайдено! Встановіть Node.js${NC}"
    exit 1
fi

# Перевірка npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не знайдено! Встановіть npm${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Перевірка залежностей...${NC}"

# Перевірка бекенд залежностей
echo "Перевірка Python пакетів..."
pip3 show fastapi uvicorn > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}📦 Встановлення Python залежностей...${NC}"
    pip3 install fastapi uvicorn pydantic
fi

# Перевірка фронтенд залежностей
echo "Перевірка npm пакетів..."
cd /Users/dima/Documents/Predator12/predator12-local/frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Встановлення npm залежностей...${NC}"
    npm install
fi

# Перевірка cytoscape
npm list cytoscape > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}📦 Встановлення cytoscape...${NC}"
    npm install cytoscape @types/cytoscape classnames
fi

echo ""
echo -e "${GREEN}✅ Всі залежності встановлено${NC}"
echo ""

# Запуск сервісів
start_backend
sleep 2  # Дати бекенду час запуститися
start_frontend

echo ""
echo -e "${GREEN}🎉 ВСЕ ГОТОВО!${NC}"
echo ""
echo -e "${BLUE}🌐 Відкрийте в браузері:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}💡 Підказки:${NC}"
echo "   - Використовуйте чат для запитів"
echo "   - Натисніть 🎙️ для голосового введення"
echo "   - Клікайте на вузли графа для деталей"
echo ""
echo -e "${YELLOW}🛑 Для зупинки натисніть Ctrl+C${NC}"
echo ""

# Очікування завершення
wait
