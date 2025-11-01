#!/bin/bash

echo "🚀 Запуск Predator Nexus для тестування..."

# Перевірка наявності Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не знайдено. Встановіть Node.js спочатку."
    exit 1
fi

# Перевірка наявності npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не знайдено. Встановіть npm спочатку."
    exit 1
fi

echo "✅ Node.js та npm доступні"

# Перехід до директорії frontend
cd frontend

# Перевірка залежностей
if [ ! -d "node_modules" ]; then
    echo "📦 Встановлення залежностей..."
    npm install
fi

# Перевірка збірки
if [ ! -d "dist" ]; then
    echo "🔨 Збірка проекту..."
    npm run build
fi

echo "🌐 Запуск development сервера..."
echo "📍 URL: http://localhost:5173"
echo "⏹️  Зупинити: Ctrl+C"
echo ""

# Запуск dev сервера
npm run dev

echo "🏁 Готово!"
