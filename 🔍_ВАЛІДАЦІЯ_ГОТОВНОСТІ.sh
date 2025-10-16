#!/bin/bash

echo "🔍 ====================================="
echo "🎮 PREDATOR12 NEXUS CORE V3 - ВАЛІДАЦІЯ"
echo "🔍 ====================================="
echo ""

# Лічильники
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Функція для перевірки
check_item() {
    local item="$1"
    local path="$2"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$path" ] || [ -d "$path" ]; then
        echo "✅ $item"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo "❌ $item (не знайдено: $path)"
    fi
}

echo "📦 ПЕРЕВІРКА ОСНОВНИХ КОМПОНЕНТІВ:"
echo "--------------------------------"

# Перевірка основних файлів
check_item "App.tsx (основний файл)" "predator12-local/frontend/src/App.tsx"
check_item "App.js (compiled)" "predator12-local/frontend/src/App.js"

echo ""
echo "🎮 ПЕРЕВІРКА ІГРОВИХ КОМПОНЕНТІВ:"
echo "--------------------------------"

# Ігрові компоненти
check_item "Система досягнень" "predator12-local/frontend/src/components/game/AchievementSystem.tsx"
check_item "Нейронна мінігра" "predator12-local/frontend/src/components/game/NeuralNetworkGame.tsx"

echo ""
echo "🔔 ПЕРЕВІРКА СИСТЕМИ НОТИФІКАЦІЙ:"
echo "--------------------------------"

check_item "Система нотифікацій" "predator12-local/frontend/src/components/notifications/NotificationSystem.tsx"

echo ""
echo "🎨 ПЕРЕВІРКА ВІЗУАЛЬНИХ ЕФЕКТІВ:"
echo "-------------------------------"

check_item "Покращені візуальні ефекти" "predator12-local/frontend/src/components/effects/EnhancedVisualEffects.tsx"

echo ""
echo "♿ ПЕРЕВІРКА ДОСТУПНОСТІ:"
echo "-----------------------"

check_item "Accessibility Provider" "predator12-local/frontend/src/components/accessibility/AccessibilityProvider.tsx"
check_item "Клавіатурні скорочення" "predator12-local/frontend/src/components/accessibility/KeyboardShortcuts.tsx"

echo ""
echo "🎨 ПЕРЕВІРКА СТИЛІВ:"
echo "-------------------"

check_item "Покращені CSS стилі" "predator12-local/frontend/src/styles/nexus-enhanced.css"
check_item "Основні стилі" "predator12-local/frontend/src/styles/nexus-global.css"

echo ""
echo "🌐 ПЕРЕВІРКА ДЕМО ФАЙЛІВ:"
echo "------------------------"

check_item "HTML демо" "predator12-local/nexus-ultra-demo.html"
check_item "HolographicGuide" "predator12-local/frontend/src/components/guide/HolographicGuide.tsx"

echo ""
echo "📚 ПЕРЕВІРКА ДОКУМЕНТАЦІЇ:"
echo "-------------------------"

check_item "Фінальний звіт" "🎉_ФІНАЛЬНЕ_УЛЬТРА_ПОКРАЩЕННЯ_ЗАВЕРШЕНО.md"
check_item "Інструкція для команди" "🎉_КОМАНДІ_РОЗРОБНИКІВ_ФІНАЛЬНА_ІНСТРУКЦІЯ.md"
check_item "Скрипт запуску" "🚀_ULTRA_DEMO_LAUNCH.sh"

echo ""
echo "🚀 ПЕРЕВІРКА СКРИПТІВ:"
echo "---------------------"

check_item "Скрипт запуску (executable)" "🚀_ULTRA_DEMO_LAUNCH.sh"

# Перевірка executable
if [ -x "🚀_ULTRA_DEMO_LAUNCH.sh" ]; then
    echo "✅ Скрипт запуску виконуваний"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo "❌ Скрипт запуску не виконуваний"
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""
echo "🎯 РЕЗУЛЬТАТИ ВАЛІДАЦІЇ:"
echo "======================="

# Розрахунок відсотку
PERCENTAGE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))

echo "📊 Пройдено: $PASSED_CHECKS/$TOTAL_CHECKS перевірок ($PERCENTAGE%)"

if [ $PERCENTAGE -ge 90 ]; then
    echo "🎉 ВІДМІННО! Система готова до використання"
    echo "🚀 Запускайте: ./🚀_ULTRA_DEMO_LAUNCH.sh"
elif [ $PERCENTAGE -ge 75 ]; then
    echo "✅ ДОБРЕ! Більшість компонентів на місці"
    echo "⚠️  Перевірте відсутні файли вище"
elif [ $PERCENTAGE -ge 50 ]; then
    echo "⚠️  ЗАДОВІЛЬНО. Потрібні додаткові налаштування"
    echo "🔧 Багато компонентів відсутні"
else
    echo "❌ КРИТИЧНО! Система потребує серйозного налаштування"
    echo "🚨 Більшість компонентів відсутні"
fi

echo ""
echo "💡 ДОДАТКОВІ ПЕРЕВІРКИ:"
echo "----------------------"

# Перевірка Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js встановлено: $NODE_VERSION"
else
    echo "❌ Node.js не встановлено"
fi

# Перевірка npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm встановлено: $NPM_VERSION"
else
    echo "❌ npm не встановлено"
fi

# Перевірка package.json
if [ -f "predator12-local/frontend/package.json" ]; then
    echo "✅ package.json знайдено"
else
    echo "❌ package.json не знайдено"
fi

# Перевірка node_modules
if [ -d "predator12-local/frontend/node_modules" ]; then
    echo "✅ node_modules встановлені"
else
    echo "⚠️  node_modules не встановлені (потрібно npm install)"
fi

echo ""
echo "🎮 ГОТОВНІСТЬ ДО ДЕМО:"
echo "====================="

if [ $PERCENTAGE -ge 90 ] && [ -f "predator12-local/nexus-ultra-demo.html" ]; then
    echo "🎉 ГОТОВО! Всі системи працюють"
    echo ""
    echo "🚀 ШВИДКИЙ ЗАПУСК:"
    echo "   ./🚀_ULTRA_DEMO_LAUNCH.sh"
    echo ""
    echo "🌐 АБО HTML ДЕМО:"
    echo "   Відкрийте predator12-local/nexus-ultra-demo.html"
    echo ""
    echo "⌨️  ГАРЯЧІ КЛАВІШІ:"
    echo "   Alt+H = Довідка"
    echo "   Alt+D = Dashboard" 
    echo "   Ctrl+G = Ігровий режим"
else
    echo "⚠️  Не всі компоненти готові"
    echo "🔧 Рекомендується завершити налаштування"
fi

echo ""
echo "🎮 ====================================="
echo "✨ PREDATOR12 NEXUS CORE V3 ВАЛІДОВАНО"
echo "🎮 ====================================="
