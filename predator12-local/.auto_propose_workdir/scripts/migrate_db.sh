#!/usr/bin/env bash
# ==========================================
# ВИКОНАННЯ МІГРАЦІЙ БД
# ==========================================

set -e

echo "🔄 Виконання міграцій бази даних..."

# Завантаження змінних з .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Активація віртуального середовища
if [ -d ".venv" ]; then
    echo "🐍 Активація Python віртуального середовища..."
    source .venv/bin/activate
else
    echo "❌ Віртуальне середовище .venv не знайдено!"
    echo "💡 Запустіть спочатку: make install"
    exit 1
fi

# Перехід в папку backend
cd backend

# Перевірка чи Alembic налаштований
if [ ! -f "alembic.ini" ]; then
    echo "⚙️ Ініціалізація Alembic..."
    alembic init alembic
    echo "✅ Alembic ініціалізовано"
fi

# Перевірка підключення до БД
echo "🔍 Перевірка підключення до БД..."
python -c "
import os
import psycopg2
from sqlalchemy import create_engine

db_url = os.getenv('DATABASE_URL', 'postgresql://predator_user:changeme@127.0.0.1:5432/predator')
try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute('SELECT 1')
        print('✅ Підключення до БД успішне!')
except Exception as e:
    print(f'❌ Помилка підключення до БД: {e}')
    exit(1)
"

# Створення нової міграції (якщо є зміни)
echo "🔍 Перевірка змін моделей..."
if alembic check > /dev/null 2>&1; then
    echo "✅ Моделі синхронізовані"
else
    echo "📝 Виявлено зміни в моделях, створення нової міграції..."
    alembic revision --autogenerate -m "Auto migration $(date +%Y%m%d_%H%M%S)"
fi

# Виконання міграцій
echo "⬆️ Застосування міграцій..."
alembic upgrade head

echo "✅ Міграції виконано успішно!"

# Перевірка структури БД
echo "🔍 Перевірка структури БД..."
python -c "
import os
from sqlalchemy import create_engine, inspect

db_url = os.getenv('DATABASE_URL', 'postgresql://predator_user:changeme@127.0.0.1:5432/predator')
engine = create_engine(db_url)
inspector = inspect(engine)

tables = inspector.get_table_names()
print(f'📊 Знайдено таблиць: {len(tables)}')
for table in tables[:10]:  # Показуємо перші 10
    print(f'  - {table}')
if len(tables) > 10:
    print(f'  ... та ще {len(tables) - 10} таблиць')
"

echo ""
echo "🎉 Міграції завершено!"
echo "🚀 Тепер можна запускати: make backend"
