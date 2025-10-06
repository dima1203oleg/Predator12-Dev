#!/bin/bash

# 🐳 PREDATOR NEXUS - DOCKER LAUNCHER
# Автоматичний запуск та моніторинг контейнерів

echo "🚀 PREDATOR NEXUS - DOCKER DEPLOYMENT"
echo "====================================="
echo ""

# Функція для кольорового виводу
print_status() {
    local color=$1
    local message=$2
    case $color in
        "green") echo -e "\033[32m✅ $message\033[0m" ;;
        "yellow") echo -e "\033[33m⚠️  $message\033[0m" ;;
        "red") echo -e "\033[31m❌ $message\033[0m" ;;
        "blue") echo -e "\033[34mℹ️  $message\033[0m" ;;
        *) echo "$message" ;;
    esac
}

# Перевірка Docker
print_status "blue" "Checking Docker status..."

if ! command -v docker &> /dev/null; then
    print_status "red" "Docker не встановлений!"
    echo "Будь ласка, встановіть Docker Desktop: https://docker.com/products/docker-desktop"
    exit 1
fi

# Перевірка Docker daemon
if ! docker info &> /dev/null; then
    print_status "red" "Docker daemon не запущений!"
    echo "Будь ласка, запустіть Docker Desktop"
    exit 1
fi

print_status "green" "Docker готовий до роботи"

# Зупинка існуючих контейнерів
print_status "blue" "Зупинка існуючих контейнерів..."
docker-compose -f docker-compose.nexus.yml down 2>/dev/null || true
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true

# Очистка
print_status "blue" "Очистка старих образів..."
docker system prune -f 2>/dev/null || true

echo ""
echo "🎯 Доступні варіанти запуску:"
echo "1. Простий frontend (рекомендовано)"
echo "2. Повний Nexus stack"
echo "3. Всі сервіси"
echo ""

read -p "Оберіть варіант (1-3): " choice

case $choice in
    1)
        print_status "blue" "Запуск простого frontend контейнера..."
        if docker-compose -f docker-compose.simple.yml up -d --build; then
            print_status "green" "Простий frontend запущено!"
            echo "🌐 Доступ: http://localhost:8080"
        else
            print_status "red" "Помилка запуску простого frontend"
        fi
        ;;
    2)
        print_status "blue" "Запуск повного Nexus stack..."
        if docker-compose -f docker-compose.nexus.yml up -d --build; then
            print_status "green" "Nexus stack запущено!"
            echo "🌐 Frontend: http://localhost:3000"
            echo "🔧 Backend API: http://localhost:8000"
        else
            print_status "red" "Помилка запуску Nexus stack"
        fi
        ;;
    3)
        print_status "blue" "Запуск всіх сервісів..."
        if docker-compose up -d --build; then
            print_status "green" "Всі сервіси запущено!"
            echo "🌐 Перевірте docker ps для портів"
        else
            print_status "red" "Помилка запуску всіх сервісів"
        fi
        ;;
    *)
        print_status "yellow" "Невірний вибір. Запускаємо простий frontend..."
        docker-compose -f docker-compose.simple.yml up -d --build
        ;;
esac

echo ""
print_status "blue" "Перевірка статусу контейнерів..."
sleep 3

# Показати активні контейнери
echo ""
echo "📊 АКТИВНІ КОНТЕЙНЕРИ:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📋 КОРИСНІ КОМАНДИ:"
echo "docker ps                     # Перевірити контейнери"
echo "docker logs <container_name>  # Переглянути логи"
echo "docker-compose down           # Зупинити всі"
echo ""

print_status "green" "Docker deployment завершено!"
echo "🎊 Predator Nexus готовий до використання!"
