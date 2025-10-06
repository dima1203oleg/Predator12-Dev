#!/bin/bash

echo "🚨 ЯДЕРНА ПЕРЕБУДОВА ФРОНТЕНДУ 🚨"
echo "========================================"

# Переходимо в правильну директорію
cd /Users/dima/Documents/Predator12/predator12-local

echo "1. Зупинка всіх контейнерів..."
docker-compose down

echo "2. Видалення старих образів фронтенду..."
docker rmi predator12-local-frontend:latest 2>/dev/null || echo "Образ не знайдено"

echo "3. Перехід до директорії фронтенду..."
cd frontend

echo "4. Очищення кешу npm..."
npm cache clean --force

echo "5. Видалення node_modules та dist..."
rm -rf node_modules dist

echo "6. Встановлення залежностей..."
npm install

echo "7. Перебудова фронтенду..."
npm run build

echo "8. Перевірка результату build..."
ls -la dist/
echo "Вміст index.html:"
head -10 dist/index.html

echo "9. Повернення до корневої директорії..."
cd ..

echo "10. Перебудова Docker образу..."
docker-compose build --no-cache frontend

echo "11. Запуск контейнерів..."
docker-compose up -d

echo "12. Очікування запуску..."
sleep 10

echo "13. Перевірка статусу..."
docker-compose ps frontend

echo "14. Тестування доступності..."
curl -f http://localhost:3000/ && echo "✅ Frontend доступний" || echo "❌ Frontend недоступний"

echo "========================================"
echo "🎉 ЯДЕРНА ПЕРЕБУДОВА ЗАВЕРШЕНА!"
echo "Перевірте http://localhost:3000"
