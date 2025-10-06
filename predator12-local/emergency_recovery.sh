#!/usr/bin/env bash
# Критичне відновлення системи Predator11

echo "🚨 КРИТИЧНЕ ВІДНОВЛЕННЯ СИСТЕМИ PREDATOR11"
echo "=============================================="

# Крок 1: Форсований перезапуск Docker
echo "1️⃣ Форсований перезапуск Docker Desktop..."
killall Docker 2>/dev/null || true
killall "Docker Desktop" 2>/dev/null || true
sleep 5

# Крок 2: Запуск Docker Desktop
echo "2️⃣ Запуск Docker Desktop..."
open -a "Docker Desktop"

# Крок 3: Очікування готовності (до 2 хвилин)
echo "3️⃣ Очікування готовності Docker (до 120 секунд)..."
for i in {1..24}; do
    if docker info >/dev/null 2>&1; then
        echo "✅ Docker готовий після $((i*5)) секунд!"
        break
    fi
    echo "   Очікую Docker... ($i/24) - $((i*5))s"
    sleep 5
done

# Крок 4: Перевірка статусу Docker
if ! docker info >/dev/null 2>&1; then
    echo "❌ КРИТИЧНА ПОМИЛКА: Docker не запустився!"
    echo "Рекомендації:"
    echo "- Перевірте чи встановлений Docker Desktop"
    echo "- Перезавантажте систему якщо потрібно"
    echo "- Запустіть Docker Desktop вручну"
    exit 1
fi

# Крок 5: Виявлення та очищення проблемних контейнерів
echo "4️⃣ Очищення проблемних контейнерів..."
docker ps -a --filter "status=exited" --filter "name=predator11" -q | xargs -r docker rm
docker ps -a --filter "status=dead" --filter "name=predator11" -q | xargs -r docker rm

# Крок 6: Запуск системи поетапно
echo "5️⃣ Поетапний запуск системи..."

# База даних та кеш
echo "   📦 Запуск базових сервісів..."
docker-compose up -d db redis minio

# OpenSearch
echo "   🔍 Запуск OpenSearch..."
docker-compose up -d opensearch

# ModelSDK з AI моделями
echo "   🤖 Запуск ModelSDK (48 AI моделей)..."
docker-compose up -d modelsdk

# Backend API
echo "   ⚙️ Запуск Backend API..."
docker-compose up -d backend

# Worker сервіси для агентів
echo "   👥 Запуск Worker сервісів для агентів..."
docker-compose up -d worker scheduler celery-worker agent-supervisor

# Веб-інтерфейси
echo "   🌐 Запуск веб-інтерфейсів..."
docker-compose up -d frontend grafana

# Моніторинг
echo "   📊 Запуск моніторингу..."
docker-compose up -d prometheus loki tempo

echo ""
echo "6️⃣ Фінальна перевірка системи..."
sleep 10

# Перевірка активних контейнерів
CONTAINERS=$(docker ps --format "{{.Names}}" | grep predator11 | wc -l)
echo "   Активних контейнерів: $CONTAINERS"

# Перевірка веб-інтерфейсів
echo "7️⃣ Перевірка веб-інтерфейсів..."
curl -s -o /dev/null -w "Frontend (3000): %{http_code}\n" http://localhost:3000 || echo "Frontend (3000): не відповідає"
curl -s -o /dev/null -w "Grafana (3001): %{http_code}\n" http://localhost:3001 || echo "Grafana (3001): не відповідає"
curl -s -o /dev/null -w "Backend (8000): %{http_code}\n" http://localhost:8000 || echo "Backend (8000): не відповідає"
curl -s -o /dev/null -w "ModelSDK (3010): %{http_code}\n" http://localhost:3010 || echo "ModelSDK (3010): не відповідає"

echo ""
echo "🎯 СИСТЕМА ВІДНОВЛЕНА!"
echo "================================"
echo "Веб-інтерфейси:"
echo "   Frontend: http://localhost:3000"
echo "   Grafana:  http://localhost:3001"
echo "   Backend:  http://localhost:8000"
echo "   ModelSDK: http://localhost:3010"
echo ""
echo "✅ Агенти самовдосконалення будуть активовані автоматично!"
