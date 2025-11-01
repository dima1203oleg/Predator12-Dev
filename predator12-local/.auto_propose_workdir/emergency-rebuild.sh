#!/bin/bash

echo "🚨 EMERGENCY FRONTEND REBUILD"

# Зупинка контейнера
docker stop predator12-local-frontend-1 2>/dev/null || echo "Container already stopped"

# Видалення контейнера
docker rm predator12-local-frontend-1 2>/dev/null || echo "Container already removed"

# Видалення образу
docker rmi predator12-local-frontend:latest 2>/dev/null || echo "Image already removed"

# Перебудова образу
docker-compose build --no-cache frontend

# Запуск контейнера
docker-compose up -d frontend

# Перевірка
sleep 5
docker ps | grep frontend

echo "Done! Check http://localhost:3000"
