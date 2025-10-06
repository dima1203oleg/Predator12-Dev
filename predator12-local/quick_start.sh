#!/usr/bin/env bash
# Швидкий запуск веб-інтерфейсів Predator11

echo "🚀 Швидкий запуск Predator11..."

# Запуск Docker Desktop
echo "📦 Запускаю Docker Desktop..."
open -a "Docker Desktop"

# Очікування готовності Docker (до 60 секунд)
echo "⏳ Очікую готовності Docker..."
for i in {1..12}; do
    if docker info >/dev/null 2>&1; then
        echo "✅ Docker готовий!"
        break
    fi
    echo "   Очікую... ($i/12)"
    sleep 5
done

# Запуск основних сервісів
echo "🔧 Запускаю основні сервіси..."
docker-compose up -d db redis opensearch

# Запуск ModelSDK
echo "🤖 Запускаю ModelSDK з 48 моделями..."
docker-compose up -d modelsdk

# Запуск Backend
echo "⚙️ Запускаю Backend API..."
docker-compose up -d backend

# Запуск веб-інтерфейсів
echo "🌐 Запускаю веб-інтерфейси..."
docker-compose up -d frontend grafana

# Запуск моніторингу
echo "📊 Запускаю моніторинг..."
docker-compose up -d prometheus

echo ""
echo "🎯 ВЕБ-ІНТЕРФЕЙСИ ГОТОВІ:"
echo "   Frontend (основний пульт): http://localhost:3000"
echo "   Grafana (моніторинг):      http://localhost:3001"
echo "   Backend API:               http://localhost:8000"
echo "   ModelSDK (48 моделей):     http://localhost:3010"
echo ""
echo "✅ Система запущена! Перевірте веб-інтерфейси через 30-60 секунд."
