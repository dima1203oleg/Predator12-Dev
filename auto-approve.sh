#!/bin/bash

# 🤖 Predator12 Auto-Approve System
# Автоматичне схвалення та моніторинг змін

echo "🤖 Запуск системи автосхвалення Predator12..."
echo ""

# Кольори для виводу
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функція автосхвалення
auto_approve() {
    echo -e "${BLUE}🔍 Перевірка змін...${NC}"

    # Перевірка статусу git
    if git diff --quiet && git diff --cached --quiet; then
        echo -e "${GREEN}✅ Немає змін для схвалення${NC}"
        return 0
    fi

    # Показуємо зміни
    echo -e "${YELLOW}📝 Знайдені зміни:${NC}"
    git status --short
    echo ""

    # Автоматичне додавання всіх змін
    echo -e "${BLUE}➕ Додаю всі зміни...${NC}"
    git add .

    # Автоматичне схвалення
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    COMMIT_MSG="🤖 Auto-approve: System update ${TIMESTAMP}"

    echo -e "${BLUE}✅ Створюю коміт: ${COMMIT_MSG}${NC}"
    git commit -m "${COMMIT_MSG}"

    echo -e "${GREEN}✨ Зміни автоматично схвалені!${NC}"
}

# Функція моніторингу сервісів
check_services() {
    echo -e "${BLUE}🔍 Перевірка сервісів...${NC}"
    echo ""

    # Backend перевірка
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API: Running (http://localhost:8000)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend API: Not running${NC}"
    fi

    # Frontend перевірка
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: Running (http://localhost:3000)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend: Not running${NC}"
    fi

    echo ""
}

# Основний цикл
main() {
    echo -e "${GREEN}🚀 Система автосхвалення активована!${NC}"
    echo ""

    # Перевірка сервісів
    check_services

    # Запуск автосхвалення
    auto_approve

    echo ""
    echo -e "${GREEN}🎉 Готово! Система працює в автоматичному режимі.${NC}"
}

# Якщо скрипт запущено з параметром --watch, запускаємо моніторинг
if [ "$1" = "--watch" ]; then
    echo -e "${BLUE}👀 Режим постійного моніторингу активовано${NC}"
    echo -e "${YELLOW}Натисніть Ctrl+C для виходу${NC}"
    echo ""

    while true; do
        main
        echo ""
        echo -e "${BLUE}⏳ Чекаю 60 секунд до наступної перевірки...${NC}"
        sleep 60
    done
else
    main
fi
