#!/bin/bash

# 🎮 PREDATOR12 NEXUS CORE V3 - МИТТЄВИЙ ЗАПУСК
# Автоматичний запуск ультра ігрового веб-пульту

clear
echo "🌌 ==============================================="
echo "🎮 PREDATOR12 NEXUS CORE V3 - ULTRA LAUNCH"
echo "🚀 Ігровий веб-пульт з анімаціями та ефектами"
echo "🌌 ==============================================="
echo ""

# Перевірка та встановлення залежностей
if [ ! -d "predator12-local/frontend/node_modules" ]; then
    echo "📦 Встановлення залежностей..."
    cd predator12-local/frontend
    npm install
    cd ../..
fi

echo "🎯 Запуск опцій:"
echo ""
echo "1. 🚀 React App (повний інтерфейс)"
echo "2. 🎮 HTML Demo (швидкий перегляд)"
echo "3. 📊 Обидва варіанти"
echo ""

read -p "Виберіть опцію (1-3): " choice

case $choice in
    1)
        echo "🚀 Запуск React додатку..."
        cd predator12-local/frontend
        npm run dev
        ;;
    2)
        echo "🎮 Відкриття HTML демо..."
        open predator12-local/nexus-ultra-demo.html || xdg-open predator12-local/nexus-ultra-demo.html
        echo "✅ HTML демо відкрито в браузері"
        ;;
    3)
        echo "📊 Запуск обох варіантів..."
        open predator12-local/nexus-ultra-demo.html || xdg-open predator12-local/nexus-ultra-demo.html &
        sleep 2
        cd predator12-local/frontend
        npm run dev
        ;;
    *)
        echo "❌ Невірний вибір. Запуск HTML демо за замовчуванням..."
        open predator12-local/nexus-ultra-demo.html || xdg-open predator12-local/nexus-ultra-demo.html
        ;;
esac
