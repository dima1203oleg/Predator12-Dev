#!/bin/bash

# 🚀 PREDATOR12 NEXUS CORE V3 - УЛЬТРА ДЕМО ЗАПУСК

echo "🎮 =================================================="
echo "🚀 PREDATOR12 NEXUS CORE V3 - УЛЬТРА ІНТЕРФЕЙС"
echo "🎮 =================================================="
echo ""

# Перевірка чи існує директорія frontend
if [ -d "predator12-local/frontend" ]; then
    echo "✅ Frontend директорія знайдена"
    cd predator12-local/frontend

    # Перевірка package.json
    if [ -f "package.json" ]; then
        echo "✅ package.json знайдено"

        # Встановлення залежностей якщо потрібно
        if [ ! -d "node_modules" ]; then
            echo "📦 Встановлення залежностей..."
            npm install
        else
            echo "✅ Залежності вже встановлені"
        fi

        echo ""
        echo "🎉 Запуск УЛЬТРА інтерфейсу..."
        echo "🌐 Відкриється на: http://localhost:3000"
        echo ""
        echo "🎮 ІГРОВІ ФУНКЦІЇ:"
        echo "   • Натисніть Alt+H для клавіатурних скорочень"
        echo "   • Використовуйте FAB кнопки справа для досягнень, мінігри, нотифікацій"
        echo "   • Переключіть ігровий режим для повних ефектів"
        echo ""
        echo "♿ ДОСТУПНІСТЬ:"
        echo "   • Фіолетова FAB кнопка для налаштувань доступності"
        echo "   • Підтримка клавіатурної навігації"
        echo "   • Автоматичне виявлення системних переваг"
        echo ""

        # Запуск сервера розробки
        npm start

    else
        echo "❌ package.json не знайдено в frontend директорії"
        echo "🔧 Можливо потрібно створити React проект"
    fi
else
    echo "❌ Frontend директорія не знайдена"
    echo "📂 Поточна директорія: $(pwd)"
    echo ""
    echo "🌐 Запуск HTML демо замість цього..."

    # Пошук HTML демо файлу
    if [ -f "predator12-local/nexus-ultra-demo.html" ]; then
        echo "✅ HTML демо знайдено"

        # Відкриття в браузері
        if command -v open &> /dev/null; then
            open predator12-local/nexus-ultra-demo.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open predator12-local/nexus-ultra-demo.html
        else
            echo "🌐 Відкрийте файл predator12-local/nexus-ultra-demo.html в браузері"
        fi
    else
        echo "❌ HTML демо файл не знайдено"
        echo "📁 Доступні файли:"
        ls -la predator12-local/ 2>/dev/null || echo "Директорія predator12-local не існує"
    fi
fi

echo ""
echo "🎮 =================================================="
echo "✨ PREDATOR12 NEXUS CORE V3 - ГОТОВО!"
echo "🎮 =================================================="
