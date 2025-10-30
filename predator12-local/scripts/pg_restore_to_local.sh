#!/usr/bin/env bash
# ==========================================
# ВІДНОВЛЕННЯ ДАМПУ В ЛОКАЛЬНУ БД
# ==========================================

set -e

echo "📥 Відновлення дампу в локальну PostgreSQL БД..."

# Завантаження змінних з .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Значення за замовчуванням
POSTGRES_HOST=${POSTGRES_HOST:-127.0.0.1}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-predator}
POSTGRES_USER=${POSTGRES_USER:-predator_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-changeme}

# Знаходження найновішого дампу або використання вказаного
DUMP_FILE=$1

if [ -z "$DUMP_FILE" ]; then
    echo "🔍 Пошук найновішого дампу в папці backups/..."
    if [ -d "backups" ]; then
        DUMP_FILE=$(ls -t backups/predator_dump_*.{sql,dump} 2>/dev/null | head -1)
        if [ -n "$DUMP_FILE" ]; then
            echo "📁 Знайдено дамп: $DUMP_FILE"
        else
            echo "❌ Дампи не знайдено в папці backups/"
            echo "💡 Створіть дамп командою: make dump"
            echo "💡 Або вкажіть шлях до дампу: make restore DUMP=/path/to/dump.sql"
            exit 1
        fi
    else
        echo "❌ Папка backups/ не існує!"
        exit 1
    fi
fi

# Перевірка існування файлу дампу
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Файл дампу не знайдено: $DUMP_FILE"
    exit 1
fi

echo "📋 Параметри відновлення:"
echo "  Host: $POSTGRES_HOST"
echo "  Port: $POSTGRES_PORT"
echo "  Database: $POSTGRES_DB"
echo "  User: $POSTGRES_USER"
echo "  Dump file: $DUMP_FILE"

# Перевірка підключення до БД
echo "🔍 Перевірка підключення до БД..."
if ! PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Не вдається підключитися до БД!"
    echo "💡 Перевірте чи БД запущена: make initdb"
    exit 1
fi

echo "✅ Підключення до БД успішне"

# Резервна копія поточної БД
echo "💾 Створення резервної копії поточної БД..."
BACKUP_FILE="backups/current_backup_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backups
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE
echo "✅ Резервна копія створена: $BACKUP_FILE"

# Очищення поточної БД (опційно)
read -p "🗑️ Очистити поточну БД перед відновленням? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Очищення БД..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
        GRANT ALL ON SCHEMA public TO public;
    "
    echo "✅ БД очищена"
fi

# Відновлення з дампу
echo "📤 Відновлення з дампу..."

# Визначення типу дампу та методу відновлення
if [[ $DUMP_FILE == *.dump ]]; then
    # Бінарний дамп - використовуємо pg_restore
    echo "🔄 Відновлення бінарного дампу..."
    PGPASSWORD=$POSTGRES_PASSWORD pg_restore -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB --verbose --clean --no-acl --no-owner $DUMP_FILE
else
    # SQL дамп - використовуємо psql
    echo "🔄 Відновлення SQL дампу..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB < $DUMP_FILE
fi

echo "✅ Дамп відновлено успішно!"

# Перевірка відновлення
echo "🔍 Перевірка відновлення..."
TABLE_COUNT=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

echo "📊 Відновлено таблиць: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "✅ Відновлення перевірено!"

    # Показати список таблиць
    echo "📋 Список таблиць:"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "\\dt"
else
    echo "⚠️ Таблиці не знайдено. Можливо дамп порожній або сталася помилка."
fi

# Обновлення послідовностей (sequences)
echo "🔄 Оновлення послідовностей..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "
SELECT setval(sequencename, (SELECT max(id) FROM \$\$\" || tablename || \"\$\$))
FROM (
    SELECT
        schemaname||'.'||sequencename as sequencename,
        replace(sequencename, '_id_seq', '') as tablename
    FROM pg_sequences
    WHERE schemaname = 'public'
) s;
" || echo "⚠️ Помилка оновлення послідовностей (можливо, немає послідовностей)"

echo ""
echo "🎉 Відновлення завершено успішно!"
echo "📊 Статистика:"
echo "  - Відновлено таблиць: $TABLE_COUNT"
echo "  - Резервна копія: $BACKUP_FILE"
echo "  - Джерело: $DUMP_FILE"
echo ""
echo "🚀 Тепер можна запускати: make dev"
