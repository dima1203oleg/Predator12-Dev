#!/bin/bash

echo "🚀 Predator11 Stack Startup Script"
echo "=================================="

# Функція для перевірки Docker
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker не запущений. Запускаю Docker Desktop..."
        open -a Docker
        echo "⏳ Зачекайте 30 секунд для запуску Docker..."
        sleep 30

        # Перевірка ще раз
        if ! docker info >/dev/null 2>&1; then
            echo "❌ Docker все ще недоступний. Запустіть Docker Desktop вручно."
            exit 1
        fi
    fi
    echo "✅ Docker працює"
}

# Функція для видалення застарілих версій
fix_compose_versions() {
    echo "🔧 Виправлення docker-compose версій..."

    # Видалення version: з основного файлу
    if grep -q "^version:" docker-compose.yml 2>/dev/null; then
        sed -i '' '/^version:/d' docker-compose.yml
        echo "   ✅ Видалено version з docker-compose.yml"
    fi

    # Видалення version: з override файлу
    if grep -q "^version:" docker-compose.override.yml 2>/dev/null; then
        sed -i '' '/^version:/d' docker-compose.override.yml
        echo "   ✅ Видалено version з docker-compose.override.yml"
    fi
}

# Функція для перевірки .env
check_env() {
    if [ ! -f .env ]; then
        echo "⚠️ .env файл не знайдено. Копіюю з .env.example..."
        cp .env.example .env
        echo "❗ УВАГА: Відредагуйте .env файл з вашими налаштуваннями"
    else
        echo "✅ .env файл існує"
    fi
}

# Головна функція
main() {
    echo "📍 Робоча папка: $(pwd)"

    # Перевірки
    check_docker
    fix_compose_versions
    check_env

    echo ""
    echo "🚀 Запуск Predator11 stack..."

    # Зупинка старих контейнерів (якщо є)
    echo "🛑 Зупинка старих контейнерів..."
    docker-compose down

    # Запуск нових
    echo "▶️ Запуск сервісів..."
    docker-compose up -d

    echo ""
    echo "⏳ Чекаємо запуску сервісів (60 секунд)..."
    sleep 60

    # Перевірка статусу
    echo ""
    echo "📊 Статус сервісів:"
    docker-compose ps

    echo ""
    echo "🌐 Перевірка доступності..."

    # Основні сервіси
    services=(
        "3000:Frontend"
        "8000:Backend"
        "5432:PostgreSQL"
        "6379:Redis"
        "9200:OpenSearch"
        "5601:Dashboards"
        "9090:Prometheus"
        "3001:Grafana"
    )

    for service in "${services[@]}"; do
        port=$(echo $service | cut -d: -f1)
        name=$(echo $service | cut -d: -f2)

        if nc -z localhost $port 2>/dev/null; then
            echo "   ✅ $name ($port) - Доступний"
        else
            echo "   ⚠️ $name ($port) - Недоступний (можливо, ще запускається)"
        fi
    done

    echo ""
    echo "🎯 ВАЖЛИВО:"
    echo "   • Деякі сервіси можуть показувати 🟡 ORANGE статус перші 2-3 хвилини"
    echo "   • Це нормально - великі сервіси (OpenSearch, Keycloak) запускаються повільно"
    echo "   • Перевіряйте логи: docker-compose logs [service_name]"

    echo ""
    echo "📱 Корисні посилання:"
    echo "   • Frontend: http://localhost:3000"
    echo "   • Backend API: http://localhost:8000"
    echo "   • OpenSearch Dashboards: http://localhost:5601"
    echo "   • Grafana: http://localhost:3001"
    echo "   • Prometheus: http://localhost:9090"

    echo ""
    echo "🔍 Для моніторингу статусу:"
    echo "   docker-compose ps"
    echo "   docker-compose logs -f"
    echo "   python3 scripts/quick_stack_check.py"
}

# Запуск
main
