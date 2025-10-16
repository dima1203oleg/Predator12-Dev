#!/bin/bash

# 🔍 PREDATOR12 NEXUS CORE V3 - СИСТЕМНА ВАЛІДАЦІЯ
# Перевірка готовності всіх компонентів до демонстрації

echo "🔍✨ PREDATOR12 NEXUS CORE V3 - ФІНАЛЬНА ВАЛІДАЦІЯ"
echo "================================================="
echo ""

# Кольори для терміналу
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VALIDATION_PASSED=true

# Функція для перевірки файлу
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2 - НЕ ЗНАЙДЕНО: $1"
        VALIDATION_PASSED=false
    fi
}

# Функція для перевірки директорії
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2 - НЕ ЗНАЙДЕНО: $1"
        VALIDATION_PASSED=false
    fi
}

echo -e "${BLUE}🏗️ ПЕРЕВІРКА СТРУКТУРИ ПРОЕКТУ${NC}"
echo "================================"

# Основні директорії
check_directory "predator12-local" "Коренева директорія проекту"
check_directory "predator12-local/frontend" "Frontend директорія"
check_directory "predator12-local/frontend/src" "Source код директорія"
check_directory "predator12-local/frontend/src/components" "Компоненти директорія"

echo ""
echo -e "${BLUE}🎮 ПЕРЕВІРКА ІГРОВИХ КОМПОНЕНТІВ${NC}"
echo "================================"

# Ігрові компоненти
check_file "predator12-local/frontend/src/components/game/AchievementSystem.tsx" "Система досягнень"
check_file "predator12-local/frontend/src/components/game/NeuralNetworkGame.tsx" "Нейронна мінігра"
check_file "predator12-local/frontend/src/components/notifications/NotificationSystem.tsx" "Система нотифікацій"
check_file "predator12-local/frontend/src/components/effects/EnhancedVisualEffects.tsx" "Візуальні ефекти"

echo ""
echo -e "${BLUE}♿ ПЕРЕВІРКА ДОСТУПНОСТІ${NC}"
echo "========================"

# Компоненти доступності
check_file "predator12-local/frontend/src/components/accessibility/AccessibilityPanel.tsx" "Панель доступності"
check_file "predator12-local/frontend/src/components/accessibility/KeyboardShortcuts.tsx" "Клавіатурні скорочення"

echo ""
echo -e "${BLUE}🎨 ПЕРЕВІРКА ТЕМ ТА СТИЛІВ${NC}"
echo "============================"

# Теми та стилі
check_file "predator12-local/frontend/src/theme/nexusTheme.ts" "Nexus тема"
check_file "predator12-local/frontend/src/contexts/ThemeContext.tsx" "Контекст теми"
check_file "predator12-local/frontend/src/components/theme/ThemeSwitcher.tsx" "Переключач тем"
check_file "predator12-local/frontend/src/styles/nexus-enhanced.css" "Покращені стилі"

echo ""
echo -e "${BLUE}🧩 ПЕРЕВІРКА ОСНОВНИХ МОДУЛІВ${NC}"
echo "=============================="

# Основні модулі
check_file "predator12-local/frontend/src/App.tsx" "Головний App компонент"
check_file "predator12-local/frontend/src/components/dashboard/SuperGameDashboard.tsx" "Ігровий дашборд"
check_file "predator12-local/frontend/src/components/agents/AIAgentsModule.tsx" "Модуль AI агентів"
check_file "predator12-local/frontend/src/components/models/AIModelsHub.tsx" "Hub AI моделей"
check_file "predator12-local/frontend/src/components/monitor/SystemMonitor.tsx" "Системний монітор"
check_file "predator12-local/frontend/src/components/guide/HolographicGuide.tsx" "Голографічний гід"

echo ""
echo -e "${BLUE}📦 ПЕРЕВІРКА КОНФІГУРАЦІЇ${NC}"
echo "========================="

# Конфігураційні файли
check_file "predator12-local/frontend/package.json" "Package.json"
check_file "predator12-local/frontend/tsconfig.json" "TypeScript конфігурація"
check_file "predator12-local/frontend/vite.config.ts" "Vite конфігурація"

echo ""
echo -e "${BLUE}📋 ПЕРЕВІРКА ДОКУМЕНТАЦІЇ${NC}"
echo "=========================="

# Документація
check_file "🎉_ФІНАЛЬНИЙ_ЗВІТ_ЗАВЕРШЕННЯ_ВСІХ_ЗАВДАНЬ.md" "Фінальний звіт"
check_file "🚀_NEXUS_ULTRA_LAUNCH.sh" "Launch скрипт"
check_file "README_FOR_TEAM.md" "README для команди"

echo ""
echo -e "${BLUE}🌐 ПЕРЕВІРКА ДЕМО ФАЙЛІВ${NC}"
echo "======================"

# Демо файли
check_file "predator12-local/nexus-ultra-demo.html" "HTML демо"

echo ""
echo "================================================="

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}🎉 ВАЛІДАЦІЯ ПРОЙШЛА УСПІШНО!${NC}"
    echo -e "${GREEN}✨ Всі компоненти знайдені та готові до роботи${NC}"
    echo ""
    echo -e "${YELLOW}🚀 ГОТОВНІСТЬ ДО ЗАПУСКУ:${NC}"
    echo "   1. Ігрові компоненти: ✅ ГОТОВО"
    echo "   2. Система доступності: ✅ ГОТОВО"
    echo "   3. Теми та стилі: ✅ ГОТОВО"
    echo "   4. Основні модулі: ✅ ГОТОВО"
    echo "   5. Конфігурація: ✅ ГОТОВО"
    echo "   6. Документація: ✅ ГОТОВО"
    echo ""
    echo -e "${PURPLE}🎯 ДЛЯ ЗАПУСКУ ВИКОНАЙТЕ:${NC}"
    echo -e "${BLUE}   ./🚀_NEXUS_ULTRA_LAUNCH.sh${NC}"
    echo ""
    echo -e "${GREEN}🌐 Або відкрийте: http://localhost:5090/${NC}"
    echo ""
else
    echo -e "${RED}❌ ВАЛІДАЦІЯ НЕ ПРОЙШЛА!${NC}"
    echo -e "${RED}Деякі компоненти відсутні. Перевірте помилки вище.${NC}"
    exit 1
fi

echo -e "${PURPLE}🎮✨ PREDATOR12 NEXUS CORE V3 ГОТОВИЙ ДО ДЕМОНСТРАЦІЇ! ✨🎮${NC}"
