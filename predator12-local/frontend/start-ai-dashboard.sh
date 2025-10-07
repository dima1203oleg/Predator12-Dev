#!/bin/bash

# 🚀 Quick Start Script для AI Agents Dashboard
# Запускає frontend dev server та відкриває браузер

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 PREDATOR12 AI AGENTS & MODELS DASHBOARD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Перевірка залежностей..."

# Перевірка node_modules
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules не знайдено"
  echo "⚙️  Встановлюємо залежності..."
  npm install
else
  echo "✅ node_modules знайдено"
fi

echo ""
echo "🔍 Перевірка компонентів..."

# Перевірка ключових файлів
if [ -f "src/components/ai/AIAgentsSection.tsx" ]; then
  echo "✅ AIAgentsSection.tsx - готовий"
else
  echo "❌ AIAgentsSection.tsx - не знайдено!"
  exit 1
fi

if [ -f "src/data/AIAgentsModelsData.tsx" ]; then
  echo "✅ AIAgentsModelsData.tsx - готовий"
else
  echo "❌ AIAgentsModelsData.tsx - не знайдено!"
  exit 1
fi

if [ -f "src/main.tsx" ]; then
  echo "✅ main.tsx - готовий"
else
  echo "❌ main.tsx - не знайдено!"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 FEATURES ГОТОВІ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 30+ AI Agents відображення"
echo "✅ 58+ AI Models відображення"
echo "✅ Пошук та фільтрація"
echo "✅ Статистичні картки"
echo "✅ Agent details modal"
echo "✅ Models grouped by provider"
echo "✅ Glassmorphism design"
echo "✅ Hover effects & animations"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Запуск development server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Server буде доступний на: http://localhost:5173"
echo "📍 Секція AI Agents & Models буде внизу dashboard"
echo ""
echo "💡 Підказки:"
echo "   - Прокрутіть вниз до 'AI Agents & Models Control Center'"
echo "   - Спробуйте табби: Agents, Models, Competition"
echo "   - Використайте пошук: введіть 'Chief' або 'GPT'"
echo "   - Клікніть на agent card для деталей"
echo "   - Фільтруйте по статусу: All, Active, Online, Critical"
echo ""
echo "⏸️  Щоб зупинити: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Запуск dev server
npm run dev
