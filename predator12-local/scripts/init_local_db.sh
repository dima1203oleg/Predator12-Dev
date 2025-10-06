#!/usr/bin/env bash
# ==========================================
# ІНІЦІАЛІЗАЦІЯ ЛОКАЛЬНОЇ POSTGRESQL БД
# ==========================================

set -e

echo "🗄️ Ініціалізація локальної PostgreSQL бази даних..."

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

echo "📋 Параметри підключення:"
echo "  Host: $POSTGRES_HOST"
echo "  Port: $POSTGRES_PORT"
echo "  Database: $POSTGRES_DB"
echo "  User: $POSTGRES_USER"

# Перевірка чи PostgreSQL запущений
echo "🔍 Перевірка PostgreSQL..."
if ! pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -q; then
    echo "❌ PostgreSQL не запущений або недоступний на $POSTGRES_HOST:$POSTGRES_PORT"
    echo "💡 Для macOS: brew services start postgresql"
    echo "💡 Для Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL доступний"

# Створення користувача та бази даних
echo "👤 Створення користувача та бази даних..."

# Визначаємо поточного користувача PostgreSQL
CURRENT_PG_USER=$(whoami)

# Підключення як поточний користувач (або postgres, якщо існує)
PG_ADMIN_USER="postgres"
if ! psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U postgres -l &> /dev/null; then
    PG_ADMIN_USER=$CURRENT_PG_USER
    echo "ℹ️  Використовується користувач: $PG_ADMIN_USER"
fi

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $PG_ADMIN_USER -v ON_ERROR_STOP=1 <<-EOSQL
    -- Створення користувача (якщо не існує)
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$POSTGRES_USER') THEN
            CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        END IF;
    END
    \$\$;

    -- Створення бази даних (якщо не існує)
    SELECT 'CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\\gexec

    -- Надання привілеїв
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
    
    -- Надання привілеїв на схему public
    \\c $POSTGRES_DB
    GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;
    
    -- Налаштування привілеїв за замовчуванням
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $POSTGRES_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $POSTGRES_USER;
EOSQL

echo "✅ Користувач і база даних створені"

# Створення тестової бази даних
TEST_DB="${POSTGRES_DB}_test"
echo "🧪 Створення тестової бази даних: $TEST_DB"

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U postgres -v ON_ERROR_STOP=1 <<-EOSQL
    SELECT 'CREATE DATABASE $TEST_DB OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$TEST_DB')\\gexec
    
    GRANT ALL PRIVILEGES ON DATABASE $TEST_DB TO $POSTGRES_USER;
EOSQL

echo "✅ Тестова база даних створена"

# Тестування підключення
echo "🔍 Тестування підключення..."
if psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Підключення успішне!"
else
    echo "❌ Помилка підключення"
    exit 1
fi

# Створення папки для логів
mkdir -p logs

# Створення папки для локального сховища
mkdir -p local_storage

echo ""
echo "🎉 Ініціалізація завершена успішно!"
echo "📋 Деталі підключення:"
echo "  DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
echo ""
echo "🚀 Наступні кроки:"
echo "  1. Скопіюйте .env.example в .env та налаштуйте"
echo "  2. Запустіть: make migrate"
echo "  3. Запустіть: make dev"
