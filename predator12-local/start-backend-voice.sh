#!/bin/bash

# 🎤 Start Backend with Voice Providers API
# Запуск backend Predator12 з інтегрованим Voice Providers API
# Частина Premium FREE Voice System Predator12 Nexus Core V5.2

set -e

# Кольори для логів
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🎤 Запуск Backend з Voice Providers API${NC}"
echo -e "${CYAN}=====================================Predator12 Nexus Core V5.2${NC}"

# Перевірка поточної директорії
if [[ ! -f "backend/app/main.py" ]]; then
    echo -e "${YELLOW}⚠️  Переходжу в директорію predator12-local...${NC}"
    cd predator12-local 2>/dev/null || {
        echo -e "${RED}❌ Помилка: Не знайдено backend/app/main.py${NC}"
        echo -e "${YELLOW}💡 Запустіть скрипт з кореневої директорії проекту${NC}"
        exit 1
    }
fi

# Перевірка файлів Voice Providers API
if [[ ! -f "backend/app/api/voice_providers.py" ]]; then
    echo -e "${RED}❌ Помилка: Не знайдено voice_providers.py${NC}"
    echo -e "${YELLOW}💡 Спочатку створіть Voice Providers API файли${NC}"
    exit 1
fi

# Перевірка Python
echo -e "${BLUE}🐍 Перевірка Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 не встановлено${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✅ Python ${PYTHON_VERSION} знайдено${NC}"

# Створення/активація віртуального середовища
echo -e "${BLUE}📦 Налаштування віртуального середовища...${NC}"
cd backend

if [[ ! -d "venv" ]]; then
    echo -e "${YELLOW}🔧 Створення нового venv...${NC}"
    python3 -m venv venv
fi

echo -e "${BLUE}🔄 Активація venv...${NC}"
source venv/bin/activate

# Встановлення залежностей
echo -e "${BLUE}📚 Встановлення залежностей...${NC}"
pip install --upgrade pip

if [[ -f "requirements.txt" ]]; then
    echo -e "${BLUE}📋 Встановлення основних залежностей...${NC}"
    pip install -r requirements.txt
else
    echo -e "${YELLOW}⚠️  requirements.txt не знайдено, встановлюю базові залежності...${NC}"
    pip install fastapi uvicorn cryptography pathlib2 python-jose aiofiles
fi

# Перевірка залежностей для Voice Providers
echo -e "${BLUE}🎤 Перевірка Voice Providers залежностей...${NC}"
python3 -c "
try:
    import cryptography
    print('✅ cryptography')
except ImportError:
    print('❌ cryptography')

try:
    from pathlib import Path
    print('✅ pathlib')
except ImportError:
    print('❌ pathlib')

try:
    from fastapi import FastAPI
    print('✅ FastAPI')
except ImportError:
    print('❌ FastAPI')
"

# Створення конфігураційних директорій
echo -e "${BLUE}📁 Створення директорій...${NC}"
mkdir -p app/voice_configs
mkdir -p logs

# Перевірка портів
echo -e "${BLUE}🔍 Перевірка доступності порту 8000...${NC}"
if lsof -i :8000 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Порт 8000 зайнятий, спробую зупинити процес...${NC}"
    pkill -f "uvicorn.*main:app" || true
    sleep 2
fi

# Запуск сервера
echo -e "${GREEN}🚀 Запуск Backend сервера...${NC}"
echo -e "${CYAN}🔗 Backend буде доступний на: http://localhost:8000${NC}"
echo -e "${CYAN}📚 Документація API: http://localhost:8000/docs${NC}"
echo -e "${CYAN}🎤 Voice Providers API: http://localhost:8000/api/voice-providers${NC}"
echo ""
echo -e "${PURPLE}=== ЛОГИ СЕРВЕРА ===${NC}"

export PYTHONPATH="${PYTHONPATH}:$(pwd)/app"

# Запуск з детальними логами
python3 -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info \
    --access-log \
    --reload-dir app \
    --reload-exclude "*.pyc" \
    --reload-exclude "__pycache__" \
    --reload-exclude "voice_configs" \
    --reload-exclude "logs" \
    --reload-exclude "venv"
