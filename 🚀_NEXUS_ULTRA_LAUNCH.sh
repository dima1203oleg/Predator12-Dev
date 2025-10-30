#!/bin/bash

# 🚀 PREDATOR12 NEXUS CORE V3 - ШВИДКИЙ ЗАПУСК ДЕМО
# Автор: AI Assistant
# Дата: 8 жовтня 2025 р.

echo "🎮🚀 PREDATOR12 NEXUS CORE V3 - ULTRA DEMO LAUNCHER"
echo "=================================================="
echo ""

# Кольори для терміналу
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Перевірка поточної директорії
if [ ! -d "predator12-local" ]; then
    echo -e "${RED}❌ Помилка: Запустіть скрипт з кореневої директорії проекту${NC}"
    echo -e "${YELLOW}💡 Поточна директорія повинна містити папку 'predator12-local'${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Перевірка залежностей...${NC}"

# Перехід до frontend директорії
cd predator12-local/frontend

# Перевірка наявності Node.js та npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не знайдено. Встановіть Node.js спочатку.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не знайдено. Встановіть npm спочатку.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js версія: $(node --version)${NC}"
echo -e "${GREEN}✅ npm версія: $(npm --version)${NC}"
echo ""

# Встановлення залежностей
echo -e "${BLUE}📦 Встановлення залежностей...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Залежності успішно встановлено${NC}"
else
    echo -e "${RED}❌ Помилка встановлення залежностей${NC}"
    exit 1
fi

echo ""
echo -e "${PURPLE}🎯 ЗАПУСК NEXUS CORE V3 INTERFACE...${NC}"
echo ""

# Інформація про функції
echo -e "${YELLOW}🎮 ДОСТУПНІ ФУНКЦІЇ:${NC}"
echo "   🏆 Система досягнень з анімаціями"
echo "   🧠 Інтерактивна нейронна мінігра"
echo "   🔔 Smart нотифікації зі звуками"
echo "   🎨 4 унікальні теми (Nexus, Cyberpunk, Neural, Matrix)"
echo "   ♿ Повна підтримка доступності"
echo "   ⌨️ 25+ клавіатурних скорочень"
echo "   🌟 Покращені візуальні ефекти"
echo ""

echo -e "${YELLOW}⌨️ КОРИСНІ КЛАВІШІ:${NC}"
echo "   Alt + 1-6  : Швидка навігація між модулями"
echo "   Ctrl + G   : Переключити ігровий режим"
echo "   Ctrl + M   : Переключити звук"
echo "   Ctrl + ?   : Показати всі скорочення"
echo "   F11        : Повноекранний режим"
echo ""

# Запуск сервера
echo -e "${GREEN}🚀 Запуск dev сервера...${NC}"
echo -e "${BLUE}📍 Сервер буде доступний за адресою: http://localhost:5090/${NC}"
echo ""
echo -e "${PURPLE}Натисніть Ctrl+C для зупинки сервера${NC}"
echo ""

# Запуск Vite dev сервера
npm run dev
