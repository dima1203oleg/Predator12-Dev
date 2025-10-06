#!/bin/bash

# 🚀 Predator12 Quick Setup Script
# Автоматичне налаштування локального dev-середовища

set -e

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функція для виводу з кольором
print_color() {
    echo -e "${1}${2}${NC}"
}

# Функція для перевірки команди
check_command() {
    local cmd=$1
    
    # Спеціальна перевірка для python3.11
    if [ "$cmd" = "python3.11" ]; then
        if /opt/homebrew/bin/python3.11 --version &> /dev/null; then
            print_color "$GREEN" "✅ python3.11 встановлено (/opt/homebrew/bin/python3.11)"
            return 0
        elif command -v python3.11 &> /dev/null; then
            print_color "$GREEN" "✅ python3.11 встановлено"
            return 0
        else
            print_color "$RED" "❌ python3.11 не знайдено"
            return 1
        fi
    fi
    
    if command -v $cmd &> /dev/null; then
        print_color "$GREEN" "✅ $cmd встановлено"
        return 0
    else
        print_color "$RED" "❌ $cmd не знайдено"
        return 1
    fi
}

# Функція для перевірки порту
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_color "$YELLOW" "⚠️  Порт $1 зайнято"
        return 1
    else
        print_color "$GREEN" "✅ Порт $1 вільний"
        return 0
    fi
}

clear

print_color "$CYAN" "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 PREDATOR12 QUICK SETUP                              ║
║   Автоматичне налаштування dev-середовища                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"

# Перевірка prerequisites
print_color "$BLUE" "\n📋 Крок 1: Перевірка необхідних інструментів\n"

PREREQUISITES_OK=true

# Перевірка Python 3.11 (може бути в Homebrew)
if command -v python3.11 &> /dev/null || command -v /opt/homebrew/bin/python3.11 &> /dev/null; then
    print_color "$GREEN" "✅ python3.11 встановлено"
else
    print_color "$RED" "❌ python3.11 не знайдено"
    PREREQUISITES_OK=false
fi

check_command "node" || PREREQUISITES_OK=false
check_command "npm" || PREREQUISITES_OK=false
check_command "psql" || PREREQUISITES_OK=false
check_command "git" || PREREQUISITES_OK=false

if [ "$PREREQUISITES_OK" = false ]; then
    print_color "$RED" "\n❌ Деякі необхідні інструменти не встановлено!"
    print_color "$YELLOW" "\nВстановіть відсутні інструменти:"
    print_color "$YELLOW" "  - Python 3.11: brew install python@3.11"
    print_color "$YELLOW" "  - Node.js: brew install node"
    print_color "$YELLOW" "  - PostgreSQL: brew install postgresql@15"
    exit 1
fi

# Перевірка портів
print_color "$BLUE" "\n📋 Крок 2: Перевірка доступності портів\n"

PORTS_OK=true
check_port 5432 || PORTS_OK=false  # PostgreSQL
check_port 8000 || PORTS_OK=false  # Backend
check_port 3000 || PORTS_OK=false  # Frontend

if [ "$PORTS_OK" = false ]; then
    print_color "$YELLOW" "\n⚠️  Деякі порти зайняті. Продовжити? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Перевірка .env файлу
print_color "$BLUE" "\n📋 Крок 3: Налаштування середовища\n"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        print_color "$YELLOW" "⚠️  .env файл не знайдено. Створити з .env.example? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp .env.example .env
            print_color "$GREEN" "✅ .env створено з .env.example"
            print_color "$YELLOW" "⚠️  Не забудьте відредагувати .env з вашими налаштуваннями!"
        fi
    else
        print_color "$RED" "❌ .env.example не знайдено!"
        exit 1
    fi
else
    print_color "$GREEN" "✅ .env знайдено"
fi

# Встановлення залежностей
print_color "$BLUE" "\n📋 Крок 4: Встановлення залежностей\n"

print_color "$CYAN" "📦 Backend Python залежності..."
cd backend

# Визначаємо правильний шлях до python3.11
PYTHON311=""
if /opt/homebrew/bin/python3.11 --version &> /dev/null; then
    PYTHON311="/opt/homebrew/bin/python3.11"
elif command -v python3.11 &> /dev/null; then
    PYTHON311="python3.11"
else
    print_color "$RED" "❌ Python 3.11 не знайдено!"
    exit 1
fi

if [ ! -d "venv" ]; then
    $PYTHON311 -m venv venv
    print_color "$GREEN" "✅ Python venv створено"
fi

source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
print_color "$GREEN" "✅ Backend залежності встановлено"
deactivate
cd ..

print_color "$CYAN" "📦 Frontend Node.js залежності..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    print_color "$GREEN" "✅ Frontend залежності встановлено"
else
    print_color "$GREEN" "✅ node_modules вже існує"
fi
cd ..

# Ініціалізація бази даних
print_color "$BLUE" "\n📋 Крок 5: Ініціалізація бази даних\n"

print_color "$YELLOW" "Ініціалізувати PostgreSQL базу даних? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if [ -f scripts/init_local_db.sh ]; then
        chmod +x scripts/init_local_db.sh
        ./scripts/init_local_db.sh
    else
        print_color "$RED" "❌ scripts/init_local_db.sh не знайдено!"
    fi
fi

# Виконання міграцій
print_color "$BLUE" "\n📋 Крок 6: Міграції бази даних\n"

print_color "$YELLOW" "Виконати міграції бази даних? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if [ -f scripts/migrate_db.sh ]; then
        chmod +x scripts/migrate_db.sh
        ./scripts/migrate_db.sh
    else
        print_color "$RED" "❌ scripts/migrate_db.sh не знайдено!"
    fi
fi

# Smoke тести
print_color "$BLUE" "\n📋 Крок 7: Smoke тести\n"

print_color "$YELLOW" "Запустити smoke тести? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if [ -f smoke_tests/run_smoke.sh ]; then
        chmod +x smoke_tests/run_smoke.sh
        ./smoke_tests/run_smoke.sh
    else
        print_color "$RED" "❌ smoke_tests/run_smoke.sh не знайдено!"
    fi
fi

# Фінальні інструкції
print_color "$GREEN" "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ НАЛАШТУВАННЯ ЗАВЕРШЕНО!                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"

print_color "$CYAN" "\n📚 Наступні кроки:\n"

print_color "$YELLOW" "1️⃣  Запуск backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""

print_color "$YELLOW" "2️⃣  Запуск frontend (в новому терміналі):"
echo "   cd frontend"
echo "   npm run dev"
echo ""

print_color "$YELLOW" "3️⃣  Або використовуйте Makefile:"
echo "   make dev         # Запустити все разом"
echo "   make test        # Запустити тести"
echo "   make status      # Перевірити статус"
echo ""

print_color "$YELLOW" "4️⃣  Або інтерактивний режим:"
echo "   ./predator11.sh"
echo ""

print_color "$YELLOW" "5️⃣  Або VS Code:"
echo "   Cmd+Shift+P → 'Tasks: Run Task' → Виберіть задачу"
echo ""

print_color "$CYAN" "📖 Корисна документація:"
echo "   - README.md                 - Повна документація"
echo "   - START_HERE.md             - Швидкий старт"
echo "   - QUICK_START.md            - 5-хвилинний гід"
echo "   - LOCAL_DEV_STATUS.md       - Статус налаштування"
echo "   - DEPLOYMENT_CHECKLIST.md   - Чек-ліст (100+ пунктів)"
echo ""

print_color "$CYAN" "🔗 Посилання:"
echo "   - Backend API: http://localhost:8000/docs"
echo "   - Frontend:    http://localhost:3000"
echo "   - PostgreSQL:  postgresql://localhost:5432/predator"
echo ""

print_color "$GREEN" "🎉 Гарної розробки!"
