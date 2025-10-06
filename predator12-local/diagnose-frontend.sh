#!/bin/bash

echo "🔍 Діагностика чорного екрану фронтенду"

echo "1. Перевірка статусу контейнера:"
docker ps --filter "name=predator12-local-frontend" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "2. Перевірка доступності порту:"
curl -I http://localhost:3000/ 2>/dev/null | head -1 || echo "❌ Порт недоступний"

echo ""
echo "3. Перевірка index.html:"
curl -s http://localhost:3000/ | head -5

echo ""
echo "4. Перевірка JavaScript файлів:"
if curl -s http://localhost:3000/assets/index-Q0D4TZn4.js | head -1 > /dev/null 2>&1; then
    echo "✅ JavaScript файл доступний"
else
    echo "❌ JavaScript файл недоступний"
fi

echo ""
echo "5. Перевірка CSS файлів:"
if curl -s http://localhost:3000/assets/index-Bdih9Z_x.css | head -1 > /dev/null 2>&1; then
    echo "✅ CSS файл доступний"
else
    echo "❌ CSS файл недоступний"
fi

echo ""
echo "6. Логи контейнера (останні 10 рядків):"
docker logs predator12-local-frontend-1 --tail 10
