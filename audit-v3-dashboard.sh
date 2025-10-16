#!/bin/bash

# 🎯 АВТОМАТИЧНИЙ АУДИТ V3 DASHBOARD
# Швидка перевірка всіх критичних компонентів

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PREDATOR12 V3 DASHBOARD - АВТОМАТИЧНИЙ АУДИТ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📅 Дата: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🌍 URL: http://localhost:5090"
echo ""

# Лічильники
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Функція для виводу результату тесту
test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ "$1" = "PASS" ]; then
        echo "  ✅ $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$1" = "FAIL" ]; then
        echo "  ❌ $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    elif [ "$1" = "WARN" ]; then
        echo "  ⚠️  $2"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "  ℹ️  $2"
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 ТЕСТ 1: СТРУКТУРА ПРОЕКТУ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка існування ключових файлів
if [ -f "predator12-local/frontend/src/main-full.tsx" ]; then
    test_result "PASS" "main-full.tsx існує"
else
    test_result "FAIL" "main-full.tsx НЕ ЗНАЙДЕНО"
fi

if [ -f "predator12-local/frontend/src/styles/dashboard-refined.css" ]; then
    test_result "PASS" "dashboard-refined.css існує"
else
    test_result "FAIL" "dashboard-refined.css НЕ ЗНАЙДЕНО"
fi

if [ -f "predator12-local/frontend/src/styles/cosmic-enhancements.css" ]; then
    test_result "PASS" "cosmic-enhancements.css існує"
    # Перевірка розміру файлу
    CSS_SIZE=$(wc -l < "predator12-local/frontend/src/styles/cosmic-enhancements.css" 2>/dev/null || echo "0")
    if [ "$CSS_SIZE" -gt 500 ]; then
        test_result "PASS" "cosmic-enhancements.css має $CSS_SIZE рядків (достатньо)"
    else
        test_result "WARN" "cosmic-enhancements.css має лише $CSS_SIZE рядків (очікується >500)"
    fi
else
    test_result "FAIL" "cosmic-enhancements.css НЕ ЗНАЙДЕНО"
fi

if [ -f "predator12-local/frontend/src/components/HolographicDataSphere.tsx" ]; then
    test_result "PASS" "HolographicDataSphere.tsx існує"
else
    test_result "WARN" "HolographicDataSphere.tsx НЕ ЗНАЙДЕНО (опціональний компонент)"
fi

if [ -f "predator12-local/frontend/src/components/AICommandAssistant.tsx" ]; then
    test_result "PASS" "AICommandAssistant.tsx існує"
else
    test_result "WARN" "AICommandAssistant.tsx НЕ ЗНАЙДЕНО (опціональний компонент)"
fi

if [ -f "predator12-local/frontend/package.json" ]; then
    test_result "PASS" "package.json існує"
else
    test_result "FAIL" "package.json НЕ ЗНАЙДЕНО"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 ТЕСТ 2: АНАЛІЗ КОДУ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка на inline styles (anti-pattern)
if [ -f "predator12-local/frontend/src/main-full.tsx" ]; then
    INLINE_STYLES=$(grep -c 'style={{' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$INLINE_STYLES" -eq 0 ]; then
        test_result "PASS" "Немає inline styles в main-full.tsx"
    else
        test_result "WARN" "Знайдено $INLINE_STYLES inline styles (краще використовувати CSS класи)"
    fi
fi

# Перевірка ARIA labels
if [ -f "predator12-local/frontend/src/main-full.tsx" ]; then
    ARIA_LABELS=$(grep -c 'aria-label' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$ARIA_LABELS" -gt 5 ]; then
        test_result "PASS" "Знайдено $ARIA_LABELS ARIA labels (accessibility ✓)"
    else
        test_result "WARN" "Лише $ARIA_LABELS ARIA labels (рекомендується більше)"
    fi
fi

# Перевірка console.log (не повинно бути в production)
if [ -f "predator12-local/frontend/src/main-full.tsx" ]; then
    CONSOLE_LOGS=$(grep -c 'console\.log' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$CONSOLE_LOGS" -eq 0 ]; then
        test_result "PASS" "Немає console.log у main-full.tsx"
    else
        test_result "WARN" "Знайдено $CONSOLE_LOGS console.log (видаліть для production)"
    fi
fi

# Перевірка TODO коментарів
if [ -f "predator12-local/frontend/src/main-full.tsx" ]; then
    TODO_COUNT=$(grep -ci 'TODO\|FIXME' predator12-local/frontend/src/main-full.tsx 2>/dev/null || echo "0")
    if [ "$TODO_COUNT" -eq 0 ]; then
        test_result "PASS" "Немає TODO/FIXME коментарів"
    else
        test_result "WARN" "Знайдено $TODO_COUNT TODO/FIXME коментарів"
    fi
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 ТЕСТ 3: CSS АНАЛІЗ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка cosmic effects
if [ -f "predator12-local/frontend/src/styles/cosmic-enhancements.css" ]; then
    BACKDROP_FILTER=$(grep -c 'backdrop-filter' predator12-local/frontend/src/styles/cosmic-enhancements.css 2>/dev/null || echo "0")
    if [ "$BACKDROP_FILTER" -gt 0 ]; then
        test_result "PASS" "Glassmorphism (backdrop-filter) реалізовано"
    else
        test_result "FAIL" "backdrop-filter НЕ ЗНАЙДЕНО"
    fi

    GRADIENTS=$(grep -c 'linear-gradient\|radial-gradient' predator12-local/frontend/src/styles/cosmic-enhancements.css 2>/dev/null || echo "0")
    if [ "$GRADIENTS" -gt 5 ]; then
        test_result "PASS" "Знайдено $GRADIENTS градієнтів"
    else
        test_result "WARN" "Лише $GRADIENTS градієнтів (очікується більше)"
    fi

    ANIMATIONS=$(grep -c '@keyframes\|animation:' predator12-local/frontend/src/styles/cosmic-enhancements.css 2>/dev/null || echo "0")
    if [ "$ANIMATIONS" -gt 3 ]; then
        test_result "PASS" "Знайдено $ANIMATIONS анімацій"
    else
        test_result "WARN" "Лише $ANIMATIONS анімацій"
    fi
fi

# Перевірка CSS змінних
if [ -f "predator12-local/frontend/src/styles/dashboard-refined.css" ]; then
    CSS_VARS=$(grep -c '\-\-' predator12-local/frontend/src/styles/dashboard-refined.css 2>/dev/null || echo "0")
    if [ "$CSS_VARS" -gt 10 ]; then
        test_result "PASS" "Використовуються CSS змінні ($CSS_VARS)"
    else
        test_result "WARN" "Мало CSS змінних ($CSS_VARS)"
    fi
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 ТЕСТ 4: SERVER STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка чи сервер запущено
if lsof -Pi :5090 -sTCP:LISTEN -t >/dev/null 2>&1; then
    test_result "PASS" "Сервер запущено на порту 5090"
    
    # Спроба отримати HTTP відповідь
    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5090 2>/dev/null || echo "000")
        if [ "$HTTP_STATUS" = "200" ]; then
            test_result "PASS" "HTTP статус 200 OK"
        else
            test_result "WARN" "HTTP статус $HTTP_STATUS (очікується 200)"
        fi
    else
        test_result "INFO" "curl недоступний - пропускаємо HTTP тест"
    fi
else
    test_result "FAIL" "Сервер НЕ ЗАПУЩЕНО на порту 5090"
    echo ""
    echo "  💡 Підказка: Запустіть сервер командою:"
    echo "     ./launch-enhanced-v3.sh"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 ТЕСТ 5: DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "predator12-local/frontend/node_modules" ]; then
    test_result "PASS" "node_modules існує"
    
    # Перевірка критичних залежностей
    if [ -d "predator12-local/frontend/node_modules/react" ]; then
        test_result "PASS" "React встановлено"
    else
        test_result "FAIL" "React НЕ ВСТАНОВЛЕНО"
    fi
    
    if [ -d "predator12-local/frontend/node_modules/three" ]; then
        test_result "PASS" "Three.js встановлено"
    else
        test_result "WARN" "Three.js НЕ ВСТАНОВЛЕНО (потрібно для 3D)"
    fi
    
    if [ -d "predator12-local/frontend/node_modules/vite" ]; then
        test_result "PASS" "Vite встановлено"
    else
        test_result "FAIL" "Vite НЕ ВСТАНОВЛЕНО"
    fi
else
    test_result "FAIL" "node_modules НЕ ІСНУЄ - запустіть npm install"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 ТЕСТ 6: ДОКУМЕНТАЦІЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка ключових документів
DOC_FILES=(
    "🎨_ENHANCED_DESIGN_V3.md"
    "🎉_V3_FINAL_COMPLETE.md"
    "🧪_V3_COMPREHENSIVE_TESTING_GUIDE.md"
    "✅_LIVE_UI_VALIDATION_CHECKLIST.md"
    "🚀_ФІНАЛЬНИЙ_ПЛАН_ДЕПЛОЙМЕНТУ_V3.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        test_result "PASS" "$doc існує"
    else
        test_result "WARN" "$doc НЕ ЗНАЙДЕНО"
    fi
done

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 ТЕСТ 7: GIT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        test_result "PASS" "Git репозиторій ініціалізовано"
        
        # Перевірка незакомічених змін
        UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        if [ "$UNCOMMITTED" -eq 0 ]; then
            test_result "PASS" "Немає незакомічених змін"
        else
            test_result "WARN" "$UNCOMMITTED файлів не закомічено"
        fi
        
        # Перевірка поточної гілки
        BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
        if [ "$BRANCH" != "unknown" ]; then
            test_result "INFO" "Поточна гілка: $BRANCH"
        fi
    else
        test_result "WARN" "Git репозиторій не ініціалізовано"
    fi
else
    test_result "INFO" "Git не встановлено - пропускаємо перевірку"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ПІДСУМОК РЕЗУЛЬТАТІВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Розрахунок відсотка успішності
if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    SUCCESS_RATE=0
fi

echo "  📋 Всього тестів:       $TOTAL_TESTS"
echo "  ✅ Пройдено:            $PASSED_TESTS"
echo "  ❌ Провалено:           $FAILED_TESTS"
echo "  ⚠️  Попередження:       $WARNINGS"
echo ""
echo "  📈 Успішність:          $SUCCESS_RATE%"
echo ""

# Визначення загального статусу
if [ "$FAILED_TESTS" -eq 0 ] && [ "$SUCCESS_RATE" -ge 90 ]; then
    echo "  🎉 СТАТУС: ВІДМІННО - Готово до production!"
    echo "  🚀 Рекомендація: Продовжуйте з деплойментом"
elif [ "$FAILED_TESTS" -eq 0 ] && [ "$SUCCESS_RATE" -ge 75 ]; then
    echo "  ✅ СТАТУС: ДОБРЕ - Майже готово"
    echo "  📝 Рекомендація: Розгляньте попередження"
elif [ "$FAILED_TESTS" -le 2 ]; then
    echo "  ⚠️  СТАТУС: ПОТРІБНІ ВИПРАВЛЕННЯ"
    echo "  🔧 Рекомендація: Виправте критичні помилки"
else
    echo "  ❌ СТАТУС: ПОТРІБНА УВАГА"
    echo "  🛠️  Рекомендація: Виправте всі помилки перед продовженням"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 КОРИСНІ ПОСИЛАННЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Dashboard:           http://localhost:5090"
echo "  📄 Документація:        ./🚀_ФІНАЛЬНИЙ_ПЛАН_ДЕПЛОЙМЕНТУ_V3.md"
echo "  🧪 Тести:               ./🧪_V3_COMPREHENSIVE_TESTING_GUIDE.md"
echo "  ✅ Валідація:           ./✅_LIVE_UI_VALIDATION_CHECKLIST.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ Завершено: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Exit code базується на кількості провалених тестів
if [ "$FAILED_TESTS" -eq 0 ]; then
    exit 0
else
    exit 1
fi
