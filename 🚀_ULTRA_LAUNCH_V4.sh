#!/bin/bash

# 🎉 PREDATOR12 NEXUS CORE V4.0 - ULTRA LAUNCH SCRIPT
# Автоматичний запуск найсучаснішого AI Dashboard

echo "🚀 PREDATOR12 NEXUS CORE V4.0 ULTRA LAUNCH"
echo "============================================="
echo ""

# Перевірка чи існує директорія
if [ ! -d "/Users/dima/Documents/Predator12/predator12-local/frontend" ]; then
    echo "❌ Помилка: Директорія frontend не знайдена!"
    exit 1
fi

# Перехід в директорію frontend
cd /Users/dima/Documents/Predator12/predator12-local/frontend

echo "📁 Поточна директорія: $(pwd)"
echo ""

# Перевірка package.json
if [ ! -f "package.json" ]; then
    echo "❌ Помилка: package.json не знайдено!"
    exit 1
fi

echo "📦 Перевірка залежностей..."

# Перевірка node_modules
if [ ! -d "node_modules" ]; then
    echo "📥 Встановлення залежностей..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Помилка встановлення залежностей!"
        exit 1
    fi
else
    echo "✅ Залежності вже встановлені"
fi

echo ""
echo "🎮 ЗАПУСК NEXUS CORE V4.0..."
echo ""
echo "🌟 Нові модулі в цій версії:"
echo "   📊 AnalyticsModule - Покращена аналітика"
echo "   🛡️  CyberSecurityDashboard - Моніторинг безпеки"
echo "   🧬 ResearchLab - Дослідницька лабораторія"
echo "   🗄️  DataManagementHub - Управління даними"
echo ""
echo "🎯 Доступні порти:"
echo "   • http://localhost:5093 (основний)"
echo "   • http://localhost:5092 (резерв)"
echo "   • http://localhost:5091 (альтернативний)"
echo ""
echo "⚡ Можливості:"
echo "   • 🎮 Ігрові XP та рівні"
echo "   • 🎨 Потужні анімації та ефекти"
echo "   • 📱 Повністю responsive дизайн"
echo "   • ♿ Доступність для всіх користувачів"
echo "   • 🔒 Комплексна система безпеки"
echo ""
echo "🚀 Запускаємо сервер розробки..."
echo ""

# Запуск dev сервера
npm run dev

# Якщо команда завершилась
echo ""
echo "📊 Сесія завершена"
echo "🎉 Дякуємо за використання Predator12 Nexus Core V4.0!"
echo ""
