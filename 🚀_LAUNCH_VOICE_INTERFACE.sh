#!/bin/bash

# 🚀 Швидкий запуск голосового інтерфейсу
# Цей скрипт автоматично запускає весь проект

# Кольори для виводу
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║       🎤 ЗАПУСК ГОЛОСОВОГО ІНТЕРФЕЙСУ 🎤                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Функція для виводу статусу
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Перевірка наявності Node.js
print_status "Перевірка наявності Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js не знайдено! Будь ласка, встановіть Node.js"
    exit 1
fi
print_success "Node.js знайдено: $(node --version)"

# Перевірка наявності npm
print_status "Перевірка наявності npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm не знайдено! Будь ласка, встановіть npm"
    exit 1
fi
print_success "npm знайдено: $(npm --version)"

# Перехід в директорію frontend
print_status "Перехід в директорію frontend..."
cd predator12-local/frontend || {
    print_error "Директорія predator12-local/frontend не знайдена!"
    exit 1
}
print_success "Знаходимось в директорії: $(pwd)"

# Перевірка наявності package.json
if [ ! -f "package.json" ]; then
    print_error "package.json не знайдено!"
    exit 1
fi
print_success "package.json знайдено"

# Встановлення залежностей (якщо потрібно)
if [ ! -d "node_modules" ]; then
    print_warning "node_modules не знайдено. Встановлюємо залежності..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Залежності встановлено успішно"
    else
        print_error "Помилка при встановленні залежностей"
        exit 1
    fi
else
    print_success "node_modules вже існує"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║          🎉 ВСЕ ГОТОВО ДО ЗАПУСКУ! 🎉                   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

print_status "Запускаємо development сервер..."
echo ""
print_success "Сервер буде доступний за адресою: http://localhost:3000"
print_success "Голосовий інтерфейс буде доступний після запуску"
echo ""
print_warning "Для зупинки сервера натисніть Ctrl+C"
echo ""

# Запуск dev сервера
npm run dev
