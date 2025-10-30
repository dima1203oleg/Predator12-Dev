#!/bin/bash

# 🚀 PREDATOR12 NEXUS CORE V3 - ULTRA LAUNCH SCRIPT
# Автоматичний запуск покращеного ігрового веб-пульту

echo "🌌 ==============================================="
echo "🚀 PREDATOR12 NEXUS CORE V3 - ULTIMATE LAUNCH"
echo "🎮 Ігровий режим: АКТИВНИЙ"
echo "🎨 UI/UX: Покращений з анімаціями та частинками"
echo "🌌 ==============================================="

# Перехід до frontend директорії
cd "$(dirname "$0")/predator12-local/frontend" || exit 1

echo "📦 Перевірка залежностей..."
if [ ! -d "node_modules" ]; then
    echo "🔧 Встановлення залежностей..."
    npm install
fi

echo "🎯 Компілація TypeScript..."
npx tsc --noEmit || echo "⚠️ TypeScript warnings ignored for demo"

echo "🔥 Запуск Dev Server з новим UI..."
echo "🌐 Відкриттьйте браузер: http://localhost:3000"
echo "🎮 Features:"
echo "   • Ігровий режим з XP та рівнями"
echo "   • Анімовані частинки фону"
echo "   • Покращена навігація з 8 модулями"
echo "   • Голографічний AI помічник"
echo "   • Звукові ефекти"
echo "   • Повноекранний режим"
echo "   • Налаштування в реальному часі"
echo ""
echo "🔧 Контроли:"
echo "   • ⚙️ Налаштування - правий верхній кут"
echo "   • 🎮 Ігровий режим - увімкнути/вимкнути"
echo "   • 🤖 AI помічник - FAB кнопка знизу"
echo "   • 📱 Відгукливий дизайн для всіх пристроїв"

# Запуск Vite dev server
npm run dev
