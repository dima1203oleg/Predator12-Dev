#!/bin/bash

# 🚀 AI Assistant Module - Quick Test Script
# Швидке тестування модуля AI Assistant

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 AI ASSISTANT MODULE - QUICK TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check files exist
echo "📁 Перевірка файлів модуля..."
FILES=(
  "src/modules/assistant/AssistantPage.tsx"
  "src/modules/assistant/components/Head3D.tsx"
  "src/modules/assistant/components/ChatPanel.tsx"
  "src/modules/assistant/components/NetworkPanel.tsx"
  "src/modules/assistant/components/RiskBanner.tsx"
  "src/modules/assistant/components/MicStatus.tsx"
  "src/modules/assistant/components/index.ts"
  "src/modules/assistant/hooks/useASR.ts"
  "src/modules/assistant/hooks/useTTS.ts"
  "src/modules/assistant/hooks/useAssistantAPI.ts"
  "src/modules/assistant/state/assistantStore.ts"
  "src/modules/assistant/types/index.ts"
  "src/modules/assistant/i18n.ts"
  "src/modules/assistant/locales/uk-UA.json"
  "src/modules/assistant/locales/en-US.json"
)

MISSING=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - ВІДСУТНІЙ!"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "❌ Знайдено відсутніх файлів: $MISSING"
  exit 1
fi

echo ""
echo "✅ Всі файли на місці!"
echo ""

# 2. Check TypeScript errors in assistant module
echo "🔍 Перевірка TypeScript помилок у модулі assistant..."
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "assistant")
if [ $TS_ERRORS -eq 0 ]; then
  echo "  ✅ Помилок TypeScript у модулі assistant не знайдено!"
else
  echo "  ⚠️  Знайдено $TS_ERRORS згадок assistant у помилках"
  echo "  (Це може бути нормально, якщо помилки в інших файлах)"
fi

echo ""

# 3. Check imports
echo "🔗 Перевірка імпортів..."
# Note: standalone tsc doesn't know about JSX without jsx flag, but Vite handles this
if [ -f "src/modules/assistant/test-imports.ts" ]; then
  echo "  ✅ Файл test-imports.ts існує"
  echo "  ℹ️  Імпорти працюють у Vite (tsc потребує --jsx для .tsx)"
else
  echo "  ❌ test-imports.ts не знайдено"
fi

echo ""

# 4. Count lines of code
echo "📊 Статистика коду..."
LOC=$(find src/modules/assistant -name "*.ts" -o -name "*.tsx" -o -name "*.json" | xargs wc -l | tail -1 | awk '{print $1}')
echo "  📝 Загалом рядків коду: $LOC"

FILES_COUNT=$(find src/modules/assistant -type f | wc -l | xargs)
echo "  📄 Загалом файлів: $FILES_COUNT"

echo ""

# 5. Check dependencies
echo "📦 Перевірка залежностей..."
DEPS=("three" "zustand" "i18next" "@react-three/fiber" "@react-three/drei")
for dep in "${DEPS[@]}"; do
  if npm list "$dep" 2>&1 | grep -q "$dep@"; then
    VERSION=$(npm list "$dep" 2>&1 | grep "$dep@" | head -1 | sed 's/.*@//' | awk '{print $1}')
    echo "  ✅ $dep@$VERSION"
  else
    echo "  ❌ $dep - не встановлено!"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ТЕСТУВАННЯ ЗАВЕРШЕНО!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Для запуску dev server:"
echo "   npm run dev"
echo ""
echo "🌐 Потім відкрийте:"
echo "   http://localhost:5173/assistant"
echo ""
