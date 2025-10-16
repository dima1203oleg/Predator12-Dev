#!/bin/bash

# 🏗️ PREDATOR12 NEXUS CORE V3 - PRODUCTION BUILD
# Автоматична збірка та деплой покращеного інтерфейсу

echo "🏗️ ==============================================="
echo "🚀 PREDATOR12 NEXUS CORE V3 - PRODUCTION BUILD"
echo "🎮 Ultra Gaming Interface Builder"
echo "🏗️ ==============================================="

# Перехід до frontend директорії
cd "$(dirname "$0")/predator12-local/frontend" || exit 1

echo "🧹 Очищення попередніх білдів..."
rm -rf dist/
rm -rf build/

echo "📦 Встановлення/оновлення залежностей..."
npm install

echo "🔍 Перевірка TypeScript..."
npx tsc --noEmit || echo "⚠️ TypeScript warnings ignored for build"

echo "🎨 Збірка UI/UX з оптимізаціями..."
export NODE_ENV=production
npm run build

if [ $? -eq 0 ]; then
    echo "✅ ==============================================="
    echo "🎉 БІЛД УСПІШНО ЗАВЕРШЕНО!"
    echo "📁 Файли в папці: frontend/dist/"
    echo "🌐 Готово до деплою!"
    echo "✅ ==============================================="
    
    echo "📊 Статистика білду:"
    du -sh dist/
    find dist/ -name "*.js" | wc -l | xargs echo "JS файлів:"
    find dist/ -name "*.css" | wc -l | xargs echo "CSS файлів:"
    
    echo ""
    echo "🚀 Наступні кроки:"
    echo "1. Скопіюйте dist/ на ваш веб-сервер"
    echo "2. Налаштуйте nginx/apache для SPA"
    echo "3. Відкрийте браузер та насолоджуйтесь!"
else
    echo "❌ ==============================================="
    echo "💥 ПОМИЛКА БІЛДУ!"
    echo "🔧 Перевірте логи вище"
    echo "❌ ==============================================="
    exit 1
fi
