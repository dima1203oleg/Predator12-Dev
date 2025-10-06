#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - ONE COMMAND SETUP
# ==============================================================================
# Виконує повне налаштування системи одною командою
# ==============================================================================

set -Eeuo pipefail

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - One Command Setup                      ║
╚══════════════════════════════════════════════════════════════╝

Цей скрипт виконає:
  1. Перевірку портів
  2. Створення Python 3.11 venv
  3. Встановлення залежностей
  4. Виправлення VS Code
  5. Health check
  6. Запуск системи

Це займе ~15-20 хвилин.

EOF

read -p "Продовжити? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Скасовано"
    exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "🚀 Починаємо setup..."
echo ""

# 1. Перевірка портів
echo "📊 Крок 1/6: Перевірка портів..."
bash scripts/manage-ports.sh check
echo ""

# 2. Створення venv
echo "🐍 Крок 2/6: Створення Python venv..."
cd backend

if [ ! -d "venv" ]; then
    python3.11 -m venv venv
    echo "✅ venv створено"
else
    echo "✅ venv вже існує"
fi

source venv/bin/activate
echo "✅ venv активовано"
echo ""

# 3. Встановлення залежностей
echo "📦 Крок 3/6: Встановлення залежностей..."
pip install --upgrade pip setuptools wheel
pip install -r requirements-311-modern.txt
echo "✅ Залежності встановлено"
echo ""

cd ..

# 4. VS Code виправлення
echo "🔧 Крок 4/6: Виправлення VS Code..."
bash scripts/fix-vscode.sh
echo "✅ VS Code налаштовано"
echo ""

# 5. Health check
echo "🏥 Крок 5/6: Health check..."
python scripts/health-check.py
echo ""

# 6. Налаштування .env
echo "⚙️  Крок 6/6: Налаштування .env..."
cd backend

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env створено з .env.example"
        echo "⚠️  ВАЖЛИВО: Відредагуйте backend/.env перед запуском!"
    else
        echo "⚠️  .env.example не знайдено, створюю базовий .env..."
        cat > .env << 'ENVEOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/predator12

# Redis
REDIS_URL=redis://localhost:6379/0

# App
DEBUG=True
SECRET_KEY=change-me-in-production

# OpenSearch (optional)
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
ENVEOF
        echo "✅ Базовий .env створено"
        echo "⚠️  ВАЖЛИВО: Відредагуйте backend/.env перед запуском!"
    fi
else
    echo "✅ .env вже існує"
fi

cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          ✅ SETUP ЗАВЕРШЕНО!                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
🎯 Наступні кроки:

  1. Відредагувати backend/.env (якщо потрібно):
     nano backend/.env

  2. Створити/перевірити БД:
     psql -U postgres -c "CREATE DATABASE predator12;"

  3. Застосувати міграції:
     cd backend && source venv/bin/activate
     alembic upgrade head

  4. Перезавантажити VS Code:
     Command Palette → Developer: Reload Window

  5. Вибрати Python interpreter у VS Code:
     Command Palette → Python: Select Interpreter
     → predator12-local/backend/venv/bin/python

  6. Запустити систему:
     bash scripts/start-all.sh

  7. Перевірити:
     curl http://localhost:8000/health
     open http://localhost:8000/docs

📚 Документація:
  • README.md - основна інформація
  • QUICKSTART.md - швидкий старт
  • CHEAT_SHEET.md - шпаргалка команд
  • FINAL_STATUS.md - повний статус

🆘 Допомога:
  bash scripts/manage-ports.sh --help
  python scripts/health-check.py
  cat QUICKSTART.md

EOF

echo "🚀 Готово! Приємної розробки!"
