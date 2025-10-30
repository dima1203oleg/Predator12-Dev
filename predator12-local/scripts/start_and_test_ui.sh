#!/bin/bash

# Скрипт для запуску та тестування функціональності бічного меню

echo "🚀 Запуск системи Predator Analytics..."

# Перевірка наявності необхідних файлів
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json не знайдено"
    exit 1
fi

# Перехід у папку frontend
cd frontend

echo "📦 Встановлення залежностей (якщо потрібно)..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🔧 Перевірка TypeScript компіляції..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript компіляція успішна"
else
    echo "❌ Помилки TypeScript компіляції"
    exit 1
fi

echo "🌐 Запуск React додатку..."
echo "📝 Коли сервер запуститься, перевірте функціональність:"
echo "   1. Відкрийте http://localhost:3000"
echo "   2. Спробуйте кнопки бічного меню:"
echo "      - Міст Управління (Dashboard) ✅"
echo "      - Орбітальний Вузол ШІ (MAS) ✅"
echo "      - Фабрика Даних (ETL) 🆕"
echo "      - Хроно-Аналіз (Chrono) 🆕"
echo "      - Симулятор Реальностей (Simulator) 🆕"
echo "      - Аналітична Палуба (OpenSearch) 🆕"
echo "      - Святилище Архітектора (Admin) 🆕"
echo ""
echo "💡 Тепер всі модулі повинні показувати реальний контент!"

# Запуск React додатку
npm start
