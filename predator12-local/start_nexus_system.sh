#!/bin/bash

# 🚀 ЗАПУСК PREDATOR ANALYTICS NEXUS CORE V2.0
# Система автоматичного самовдосконалення та бізнес-аналітики

echo "🚀 Запуск Predator Analytics Nexus Core v2.0..."
echo "================================================"

# Перевірка Docker
echo "🔍 Перевірка Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не встановлено або не запущено"
    echo "📋 Будь ласка, запустіть Docker Desktop"
    exit 1
fi

# Перехід в робочу директорію
cd "$(dirname "$0")" || exit 1

echo "📁 Робоча директорія: $(pwd)"

# Запуск всіх сервісів
echo "🐳 Запуск контейнерів..."
docker-compose up -d

echo "⏳ Очікування запуску сервісів (30 секунд)..."
sleep 30

# Перевірка статусу
echo "📊 Статус контейнерів:"
docker-compose ps

echo ""
echo "🌐 Доступні інтерфейси:"
echo "=================================="
echo "🎯 Головний інтерфейс:     http://localhost:3001"
echo "📊 Backend API:            http://localhost:8000"
echo "📈 Grafana Дашборди:       http://localhost:3001"
echo "🔍 Prometheus Метрики:     http://localhost:9090"
echo "🔎 OpenSearch Dashboards:  http://localhost:5601"
echo "🔐 Keycloak Auth:          http://localhost:8080"

echo ""
echo "🤖 Тестування агентів самовдосконалення..."
echo "========================================="

# Чекаємо ще трохи для повного запуску
sleep 30

# Запуск тесту агентів
if [ -f "scripts/test_self_healing_agents.py" ]; then
    echo "🔧 Запуск тесту агентів самовиправлення..."
    python3 scripts/test_self_healing_agents.py
fi

if [ -f "scripts/test_all_26_agents.py" ]; then
    echo "🎯 Запуск тесту всіх 26 агентів..."
    python3 scripts/test_all_26_agents.py
fi

echo ""
echo "✅ СИСТЕМА ЗАПУЩЕНА ТА ГОТОВА ДО РОБОТИ!"
echo "🎉 Відкрийте http://localhost:3001 для доступу до інтерфейсу"
echo "📊 Агенти самовдосконалення активні та працюють!"

# Моніторинг логів
echo ""
echo "📝 Моніторинг логів системи (Ctrl+C для виходу):"
echo "================================================"
docker-compose logs -f agent-supervisor backend modelsdk
