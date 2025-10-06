#!/bin/bash

echo "🔧 АВТОМАТИЧНЕ ВИПРАВЛЕННЯ ФРОНТЕНДУ"
echo "===================================="

# Зупинка контейнерів
echo "1. Зупинка контейнерів..."
docker-compose down

# Очистка
echo "2. Очистка Docker кешу..."
docker system prune -f

# Перехід в папку фронтенду
echo "3. Очистка dist папки..."
cd /Users/dima/Documents/Predator12/predator12-local/frontend
rm -rf dist node_modules/.cache

# Перебудова
echo "4. Перебудова фронтенду..."
npm run build

# Перевірка результату
echo "5. Перевірка build результату..."
if [ -f "dist/index.html" ]; then
    echo "✅ Build успішний"
    echo "Перші рядки index.html:"
    head -5 dist/index.html
else
    echo "❌ Build не вдався"
    exit 1
fi

# Повернення до корневої папки
cd /Users/dima/Documents/Predator12/predator12-local

# Перебудова Docker образу
echo "6. Перебудова Docker образу..."
docker-compose build --no-cache frontend

# Запуск
echo "7. Запуск контейнера..."
docker-compose up -d frontend

# Очікування
echo "8. Очікування запуску (10 секунд)..."
sleep 10

# Тестування
echo "9. Тестування доступності..."
curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "✅ Frontend доступний" || echo "❌ Frontend недоступний"

echo "===================================="
echo "🎉 ВИПРАВЛЕННЯ ЗАВЕРШЕНО!"
echo "Відкрийте: http://localhost:3000"
