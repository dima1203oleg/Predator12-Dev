#!/usr/bin/env bash
# ==========================================
# СТВОРЕННЯ ДАМПУ БД З КОНТЕЙНЕРА
# ==========================================

set -e

echo "💾 Створення дампу БД з контейнера..."

# Параметри контейнера (можна змінити)
CONTAINER_NAME=${1:-"predator_db"}
CONTAINER_DB=${2:-"predator11"}
CONTAINER_USER=${3:-"postgres"}

# Створення папки для бекапів
mkdir -p backups

# Ім'я файлу дампу з датою
DUMP_FILE="backups/predator_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "📋 Параметри дампу:"
echo "  Container: $CONTAINER_NAME"
echo "  Database: $CONTAINER_DB"
echo "  User: $CONTAINER_USER"
echo "  Output: $DUMP_FILE"

# Перевірка чи контейнер існує та запущений
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "🔍 Пошук контейнера по іменах що містять 'postgres' або 'db'..."

    # Автоматичний пошук postgres контейнера
    FOUND_CONTAINER=$(docker ps --format "table {{.Names}}" | grep -E "(postgres|db|predator)" | head -1)

    if [ -n "$FOUND_CONTAINER" ]; then
        CONTAINER_NAME=$FOUND_CONTAINER
        echo "✅ Знайдено контейнер: $CONTAINER_NAME"
    else
        echo "❌ Контейнер з PostgreSQL не знайдено!"
        echo "📋 Доступні контейнери:"
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
        exit 1
    fi
fi

# Метод 1: Спроба pg_dump через docker exec
echo "📤 Спроба створення дампу методом 1 (pg_dump)..."
if docker exec $CONTAINER_NAME pg_dump -U $CONTAINER_USER -d $CONTAINER_DB > $DUMP_FILE 2>/dev/null; then
    echo "✅ Дамп створено успішно (pg_dump)!"

# Метод 2: Спроба pg_dumpall
elif docker exec $CONTAINER_NAME pg_dumpall -U $CONTAINER_USER > $DUMP_FILE 2>/dev/null; then
    echo "✅ Дамп створено успішно (pg_dumpall)!"

# Метод 3: Бінарний дамп
else
    echo "🔄 Спроба створення бінарного дампу..."
    BINARY_DUMP="backups/predator_dump_$(date +%Y%m%d_%H%M%S).dump"

    if docker exec $CONTAINER_NAME pg_dump -U $CONTAINER_USER -F c -d $CONTAINER_DB > $BINARY_DUMP; then
        echo "✅ Бінарний дамп створено: $BINARY_DUMP"
        DUMP_FILE=$BINARY_DUMP
    else
        echo "❌ Не вдалося створити дамп!"

        # Діагностика
        echo "🔍 Діагностична інформація:"
        echo "Бази даних в контейнері:"
        docker exec $CONTAINER_NAME psql -U $CONTAINER_USER -l || true

        echo "Користувачі в контейнері:"
        docker exec $CONTAINER_NAME psql -U $CONTAINER_USER -c "\\du" || true

        exit 1
    fi
fi

# Перевірка розміру файлу
FILE_SIZE=$(stat -f%z "$DUMP_FILE" 2>/dev/null || stat -c%s "$DUMP_FILE" 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -gt 0 ]; then
    echo "📊 Розмір дампу: $(numfmt --to=iec $FILE_SIZE)"
    echo "📁 Файл: $DUMP_FILE"
else
    echo "❌ Дамп порожній або не створений!"
    exit 1
fi

# Створення metadata файлу
METADATA_FILE="${DUMP_FILE}.meta"
cat > $METADATA_FILE <<EOF
# Metadata для дампу PostgreSQL
Created: $(date)
Container: $CONTAINER_NAME
Database: $CONTAINER_DB
User: $CONTAINER_USER
Size: $FILE_SIZE bytes
File: $DUMP_FILE
EOF

echo "📝 Метадані збережено: $METADATA_FILE"

echo ""
echo "🎉 Дамп створено успішно!"
echo "📁 Файл: $DUMP_FILE"
echo "🚀 Для відновлення запустіть: make restore"
echo ""
echo "💡 Альтернативно, для ручного відновлення:"
if [[ $DUMP_FILE == *.dump ]]; then
    echo "pg_restore -U predator_user -d predator $DUMP_FILE"
else
    echo "psql -U predator_user -d predator < $DUMP_FILE"
fi
