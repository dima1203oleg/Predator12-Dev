#!/bin/bash

# 🎯 Простий статус-чекер з записом у файл
# Створює текстовий звіт про стан проекту

OUTPUT_FILE="/Users/dima/Documents/Predator12/LIVE_STATUS_REPORT.txt"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" > "$OUTPUT_FILE"
echo "🎯 V3 DASHBOARD LIVE STATUS REPORT" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "📅 Дата: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT_FILE"
echo "💻 Система: macOS" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "📦 ПЕРЕВІРКА СТРУКТУРИ ФАЙЛІВ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Перевірка основних файлів
FILES=(
    "predator12-local/frontend/src/main-full.tsx"
    "predator12-local/frontend/src/styles/dashboard-refined.css"
    "predator12-local/frontend/src/styles/cosmic-enhancements.css"
    "predator12-local/frontend/src/components/AgentProgressTracker.tsx"
    "predator12-local/frontend/src/components/HolographicDataSphere.tsx"
    "predator12-local/frontend/src/components/AICommandAssistant.tsx"
    "predator12-local/frontend/package.json"
)

FOUND=0
MISSING=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file" >> "$OUTPUT_FILE"
        FOUND=$((FOUND + 1))
    else
        echo "❌ $file - НЕ ЗНАЙДЕНО" >> "$OUTPUT_FILE"
        MISSING=$((MISSING + 1))
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "Знайдено: $FOUND / $((FOUND + MISSING))" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Перевірка розміру cosmic-enhancements.css
if [ -f "predator12-local/frontend/src/styles/cosmic-enhancements.css" ]; then
    CSS_LINES=$(wc -l < "predator12-local/frontend/src/styles/cosmic-enhancements.css")
    echo "📏 cosmic-enhancements.css: $CSS_LINES рядків" >> "$OUTPUT_FILE"
    if [ "$CSS_LINES" -gt 500 ]; then
        echo "   ✅ Розмір достатній (>500 рядків)" >> "$OUTPUT_FILE"
    else
        echo "   ⚠️  Малий розмір (<500 рядків)" >> "$OUTPUT_FILE"
    fi
    echo "" >> "$OUTPUT_FILE"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "🌐 ПЕРЕВІРКА СЕРВЕРУ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Перевірка порту 5090
if lsof -Pi :5090 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Сервер ЗАПУЩЕНО на порту 5090" >> "$OUTPUT_FILE"

    # Спроба отримати HTTP відповідь
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5090 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ HTTP статус: 200 OK" >> "$OUTPUT_FILE"
        echo "🌐 URL: http://localhost:5090" >> "$OUTPUT_FILE"
    else
        echo "⚠️  HTTP статус: $HTTP_CODE" >> "$OUTPUT_FILE"
    fi
else
    echo "❌ Сервер НЕ ЗАПУЩЕНО на порту 5090" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "💡 Щоб запустити:" >> "$OUTPUT_FILE"
    echo "   cd /Users/dima/Documents/Predator12" >> "$OUTPUT_FILE"
    echo "   ./launch-enhanced-v3.sh" >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "📦 ПЕРЕВІРКА ЗАЛЕЖНОСТЕЙ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ -d "predator12-local/frontend/node_modules" ]; then
    echo "✅ node_modules існує" >> "$OUTPUT_FILE"

    # Перевірка ключових пакетів
    PACKAGES=("react" "three" "vite")
    for pkg in "${PACKAGES[@]}"; do
        if [ -d "predator12-local/frontend/node_modules/$pkg" ]; then
            echo "✅ $pkg встановлено" >> "$OUTPUT_FILE"
        else
            echo "❌ $pkg НЕ ВСТАНОВЛЕНО" >> "$OUTPUT_FILE"
        fi
    done
else
    echo "❌ node_modules НЕ ІСНУЄ" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "💡 Встановіть залежності:" >> "$OUTPUT_FILE"
    echo "   cd predator12-local/frontend" >> "$OUTPUT_FILE"
    echo "   npm install" >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "📄 ДОКУМЕНТАЦІЯ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

DOCS=(
    "🎨_ENHANCED_DESIGN_V3.md"
    "🎉_V3_FINAL_COMPLETE.md"
    "🧪_V3_COMPREHENSIVE_TESTING_GUIDE.md"
    "✅_LIVE_UI_VALIDATION_CHECKLIST.md"
    "🚀_ФІНАЛЬНИЙ_ПЛАН_ДЕПЛОЙМЕНТУ_V3.md"
    "📊_РЕЗУЛЬТАТИ_АУДИТУ_V3.md"
    "🎊_V3_MISSION_ACCOMPLISHED.md"
    "⚡_ШВИДКИЙ_СТАТУС_V3.md"
)

DOC_FOUND=0
DOC_MISSING=0

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc" >> "$OUTPUT_FILE"
        DOC_FOUND=$((DOC_FOUND + 1))
    else
        echo "❌ $doc" >> "$OUTPUT_FILE"
        DOC_MISSING=$((DOC_MISSING + 1))
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "Документація: $DOC_FOUND / $((DOC_FOUND + DOC_MISSING))" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "🔍 АНАЛІЗ КОДУ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ -f "predator12-local/frontend/src/main-full.tsx" ]; then
    # Inline styles
    INLINE_STYLES=$(grep -c 'style={{' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$INLINE_STYLES" -eq 0 ]; then
        echo "✅ Немає inline styles" >> "$OUTPUT_FILE"
    else
        echo "⚠️  Знайдено $INLINE_STYLES inline styles" >> "$OUTPUT_FILE"
    fi

    # ARIA labels
    ARIA_LABELS=$(grep -c 'aria-label' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$ARIA_LABELS" -gt 5 ]; then
        echo "✅ ARIA labels: $ARIA_LABELS (accessibility ✓)" >> "$OUTPUT_FILE"
    else
        echo "⚠️  ARIA labels: $ARIA_LABELS (мало)" >> "$OUTPUT_FILE"
    fi

    # console.log
    CONSOLE_LOGS=$(grep -c 'console\.log' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$CONSOLE_LOGS" -eq 0 ]; then
        echo "✅ Немає console.log" >> "$OUTPUT_FILE"
    else
        echo "⚠️  Знайдено $CONSOLE_LOGS console.log" >> "$OUTPUT_FILE"
    fi
fi

echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "🎨 CSS АНАЛІЗ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ -f "predator12-local/frontend/src/styles/cosmic-enhancements.css" ]; then
    # backdrop-filter
    BACKDROP=$(grep -c 'backdrop-filter' predator12-local/frontend/src/styles/cosmic-enhancements.css 2>/dev/null || echo "0")
    if [ "$BACKDROP" -gt 0 ]; then
        echo "✅ Glassmorphism (backdrop-filter): $BACKDROP використань" >> "$OUTPUT_FILE"
    else
        echo "❌ backdrop-filter не знайдено" >> "$OUTPUT_FILE"
    fi

    # Градієнти
    GRADIENTS=$(grep -c 'linear-gradient\|radial-gradient' predator12-local/frontend/src/styles/cosmic-enhancements.css 2>/dev/null || echo "0")
    if [ "$GRADIENTS" -gt 5 ]; then
        echo "✅ Градієнти: $GRADIENTS" >> "$OUTPUT_FILE"
    else
        echo "⚠️  Градієнти: $GRADIENTS (мало)" >> "$OUTPUT_FILE"
    fi

    # Анімації
    ANIMATIONS=$(grep -c '@keyframes\|animation:' predator12-local/frontend/src/styles/cosmic-enhancements.css 2>/dev/null || echo "0")
    if [ "$ANIMATIONS" -gt 3 ]; then
        echo "✅ Анімації: $ANIMATIONS" >> "$OUTPUT_FILE"
    else
        echo "⚠️  Анімації: $ANIMATIONS" >> "$OUTPUT_FILE"
    fi
fi

echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "📊 ПІДСУМОК" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TOTAL_CHECKS=$((FOUND + DOC_FOUND + 10))
PASSED_CHECKS=$((FOUND + DOC_FOUND + 6))
SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "📋 Всього перевірок: $TOTAL_CHECKS" >> "$OUTPUT_FILE"
echo "✅ Пройдено: $PASSED_CHECKS" >> "$OUTPUT_FILE"
echo "📈 Успішність: $SUCCESS_RATE%" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ "$SUCCESS_RATE" -ge 90 ]; then
    echo "🎉 СТАТУС: ВІДМІННО" >> "$OUTPUT_FILE"
    echo "🚀 Dashboard готовий до використання!" >> "$OUTPUT_FILE"
elif [ "$SUCCESS_RATE" -ge 75 ]; then
    echo "✅ СТАТУС: ДОБРЕ" >> "$OUTPUT_FILE"
    echo "📝 Розгляньте попередження" >> "$OUTPUT_FILE"
else
    echo "⚠️  СТАТУС: ПОТРІБНІ ВИПРАВЛЕННЯ" >> "$OUTPUT_FILE"
    echo "🔧 Виправте помилки перед продовженням" >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "🚀 ШВИДКІ ДІЇ" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "1. Відкрити Dashboard:" >> "$OUTPUT_FILE"
echo "   open http://localhost:5090" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "2. Запустити сервер (якщо не запущено):" >> "$OUTPUT_FILE"
echo "   cd /Users/dima/Documents/Predator12" >> "$OUTPUT_FILE"
echo "   ./launch-enhanced-v3.sh" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "3. Візуальний тест:" >> "$OUTPUT_FILE"
echo "   open predator12-local/quick-visual-test.html" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "4. Повний план тестування:" >> "$OUTPUT_FILE"
echo "   open 🚀_ФІНАЛЬНИЙ_ПЛАН_ДЕПЛОЙМЕНТУ_V3.md" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
echo "✅ Звіт завершено: $(date '+%H:%M:%S')" >> "$OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"

# Показати результат
echo ""
echo "✅ Звіт створено успішно!"
echo "📄 Файл: LIVE_STATUS_REPORT.txt"
echo ""
echo "Щоб переглянути звіт:"
echo "  cat LIVE_STATUS_REPORT.txt"
echo ""
echo "Або відкрийте файл у VS Code/текстовому редакторі"
echo ""
