#!/bin/bash

echo "🔧 Швидка заміна index.html на тестову сторінку"

# Копіюємо тестову сторінку
cp /Users/dima/Documents/Predator12/predator12-local/frontend/test-page.html /Users/dima/Documents/Predator12/predator12-local/frontend/dist/index.html

echo "✅ Файл замінено"

# Перебудовуємо контейнер
cd /Users/dima/Documents/Predator12/predator12-local
docker-compose build --no-cache frontend

echo "✅ Контейнер перебудовано"

# Перезапускаємо
docker-compose up -d frontend

echo "✅ Контейнер перезапущено"
echo "🌐 Перевірте http://localhost:3000"
