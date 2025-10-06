#!/bin/bash

# Кольори для виводу
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Запуск Predator Analytics ====${NC}"

# Шлях до директорій проекту
PROJECT_DIR="$(pwd)"
BACKEND_DIR="${PROJECT_DIR}/backend-api/fastapi_app"
FRONTEND_DIRS=("${PROJECT_DIR}/frontend" "${PROJECT_DIR}/web" "${PROJECT_DIR}/client" "${PROJECT_DIR}/ui")

# Створюємо tmux сесію, якщо вона ще не існує
tmux new-session -d -s predator 2>/dev/null || true

# Функція для запуску бекенду
start_backend() {
    echo -e "${GREEN}Запуск FastAPI бекенду...${NC}"
    
    # Перевіряємо наявність директорії бекенду
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}Помилка: Директорія бекенду не знайдена: $BACKEND_DIR${NC}"
        return 1
    fi
    
    cd "$BACKEND_DIR" || return 1
    
    # Активуємо віртуальне середовище, якщо воно існує
    if [ -d "venv" ]; then
        echo "Активація віртуального середовища..."
        source "venv/bin/activate" || source "venv/Scripts/activate"
    fi
    
    # Встановлюємо залежності
    echo "Встановлення залежностей Python..."
    pip install -r requirements.txt
    
    # Запускаємо FastAPI в tmux
    echo "Запуск FastAPI сервера..."
    tmux send-keys -t predator:0 "cd \"$BACKEND_DIR\" && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" C-m
    
    # Встановлюємо змінну середовища для фронтенду
    export REACT_APP_API_URL="http://localhost:8000"
    
    echo -e "${GREEN}Бекенд FastAPI запущено на http://localhost:8000${NC}"
    echo -e "${YELLOW}Документація API доступна за адресою: http://localhost:8000/docs${NC}"
}

# Функція для пошуку та запуску фронтенду
start_frontend() {
    echo -e "${GREEN}Пошук та запуск фронтенду...${NC}"
    
    local frontend_found=false
    local frontend_dir=""
    
    # Пошук директорії фронтенду
    for dir in "${FRONTEND_DIRS[@]}"; do
        if [ -f "$dir/package.json" ]; then
            frontend_dir="$dir"
            frontend_found=true
            break
        fi
    done
    
    if [ "$frontend_found" = false ]; then
        echo -e "${RED}Не знайдено директорію фронтенду з package.json.${NC}"
        echo -e "${YELLOW}Перевірте наявність фронтенду в одній з директорій: ${FRONTEND_DIRS[*]}${NC}"
        return 1
    fi
    
    echo -e "Знайдено фронтенд в: ${GREEN}$frontend_dir${NC}"
    cd "$frontend_dir" || return 1
    
    # Встановлюємо залежності npm
    echo "Встановлення залежностей npm..."
    npm install || yarn install
    
    # Запускаємо фронтенд в tmux
    echo "Запуск фронтенду..."
    tmux new-window -t predator:1 -n "frontend"
    tmux send-keys -t predator:1 "cd \"$frontend_dir\" && npm start || npm run dev || yarn start || yarn dev" C-m
    
    echo -e "${GREEN}Фронтенд має запуститися на http://localhost:3000${NC}"
}

# Головна функція
main() {
    # Запускаємо бекенд і фронтенд
    start_backend
    start_frontend
    
    # Показуємо tmux сесію користувачу
    echo -e "${GREEN}Обидва сервіси запущено в tmux сесії 'predator'.${NC}"
    echo -e "${YELLOW}Використовуйте 'tmux attach -t predator' щоб побачити логи.${NC}"
    echo -e "${YELLOW}Для перемикання між вікнами використовуйте Ctrl+b та потім цифри 0 або 1.${NC}"
    echo ""
    echo -e "${GREEN}Веб-інтерфейс має бути доступний за адресою: http://localhost:3000${NC}"
    echo -e "${GREEN}API доступне за адресою: http://localhost:8000${NC}"
    
    # Опціонально підключаємось до tmux сесії
    read -p "Показати логи запуску? (y/n): " show_logs
    if [[ "$show_logs" == "y" || "$show_logs" == "Y" ]]; then
        tmux attach -t predator
    fi
}

# Запускаємо головну функцію
main

exit 0
