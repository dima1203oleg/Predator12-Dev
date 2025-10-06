#!/bin/bash

echo "🧹 Повне очищення і перебудова фронтенду"

echo "1. Зупинка контейнера..."
docker stop predator12-local-frontend-1 2>/dev/null || true

echo "2. Видалення контейнера..."
docker rm predator12-local-frontend-1 2>/dev/null || true

echo "3. Видалення образу..."
docker rmi predator12-local-frontend 2>/dev/null || true

echo "4. Очищення Docker cache..."
docker system prune -f

echo "5. Перебудова образу..."
cd /Users/dima/Documents/Predator12/predator12-local
docker-compose build --no-cache frontend

echo "6. Запуск нового контейнера..."
docker-compose up -d frontend

echo "7. Очікування запуску..."
sleep 10

echo "8. Перевірка..."
curl -I http://localhost:3000/ || echo "❌ Недоступний"

echo "✅ Готово! Перевірте http://localhost:3000 в браузері"
echo "Також рекомендується очистити кеш браузера (Ctrl+Shift+R)"
