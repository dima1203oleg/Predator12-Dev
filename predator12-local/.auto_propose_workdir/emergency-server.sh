#!/bin/bash

echo "🚨 ЕКСТРЕНИЙ ТЕСТ БЕЗ DOCKER"
echo "=============================="

# Зупинити всі Docker контейнери
echo "Зупинка Docker контейнерів..."
docker-compose down

# Запустити простий HTTP сервер Python
echo "Запуск простого HTTP сервера на порту 3000..."
cd /Users/dima/Documents/Predator12/predator12-local
python3 -m http.server 3000

echo "Тестуйте: http://localhost:3000/emergency-test.html"
