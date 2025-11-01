#!/bin/bash

# ============================================================================
# Predator12 Python 3.11 Migration Script
# ============================================================================
# Автоматична міграція на Python 3.11 з modern stack
# ============================================================================

set -e

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Функції
print_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Banner
clear
print_header "🚀 PREDATOR12 PYTHON 3.11 MIGRATION"
echo ""

# Перевірка директорії
if [ ! -d "backend" ]; then
    print_error "Запустіть скрипт з кореня predator12-local/"
    exit 1
fi

cd backend

# Крок 1: Перевірка Python 3.11
print_step "Крок 1/8: Перевірка Python 3.11"

# Пошук Python 3.11
PYTHON311=""
for cmd in python3.11 /opt/homebrew/bin/python3.11 /usr/local/bin/python3.11; do
    if command -v $cmd &> /dev/null; then
        PYTHON311=$cmd
        break
    fi
done

if [ -z "$PYTHON311" ]; then
    print_error "Python 3.11 не знайдено!"
    echo ""
    print_warning "Встановіть Python 3.11:"
    echo "  brew install python@3.11"
    echo "  або"
    echo "  brew install python@3.11 && brew link python@3.11"
    exit 1
fi

PYTHON_VERSION=$($PYTHON311 --version 2>&1 | cut -d' ' -f2)
print_success "Python 3.11 знайдено: $PYTHON_VERSION ($PYTHON311)"

# Крок 2: Backup
print_step "Крок 2/8: Створення backup"

BACKUP_DIR="../backups/migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup venv
if [ -d "venv" ]; then
    print_warning "Створення backup поточного venv..."
    mv venv "$BACKUP_DIR/venv-old"
    print_success "venv збережено в $BACKUP_DIR/venv-old"
fi

# Backup requirements
if [ -f "requirements.txt" ]; then
    cp requirements.txt "$BACKUP_DIR/requirements-old.txt"
    print_success "requirements.txt збережено"
fi

# Backup бази даних
print_warning "Хочете зробити backup бази даних? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if command -v pg_dump &> /dev/null; then
        DB_NAME="predator11"
        DB_USER="predator"

        print_warning "Створення backup БД $DB_NAME..."
        pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/db-backup.sql" 2>/dev/null || {
            print_warning "Не вдалося створити backup БД (можливо, немає доступу)"
        }

        if [ -f "$BACKUP_DIR/db-backup.sql" ]; then
            print_success "БД backup створено: $BACKUP_DIR/db-backup.sql"
        fi
    else
        print_warning "pg_dump не знайдено, пропускаємо backup БД"
    fi
fi

# Крок 3: Створення нового venv
print_step "Крок 3/8: Створення нового Python 3.11 venv"

$PYTHON311 -m venv venv
print_success "venv створено"

# Активація
source venv/bin/activate

# Перевірка активації
ACTIVE_PYTHON=$(python --version 2>&1 | cut -d' ' -f2)
if [[ ! "$ACTIVE_PYTHON" =~ ^3\.11 ]]; then
    print_error "Не вдалося активувати Python 3.11 venv"
    exit 1
fi

print_success "venv активовано: Python $ACTIVE_PYTHON"

# Крок 4: Оновлення pip
print_step "Крок 4/8: Оновлення pip, setuptools, wheel"

pip install --upgrade pip setuptools wheel > /dev/null 2>&1
PIP_VERSION=$(pip --version | cut -d' ' -f2)
print_success "pip оновлено до версії $PIP_VERSION"

# Крок 5: Встановлення залежностей
print_step "Крок 5/8: Встановлення modern dependencies"

if [ ! -f "requirements-311-modern.txt" ]; then
    print_error "requirements-311-modern.txt не знайдено!"
    exit 1
fi

print_warning "Встановлення залежностей (це може зайняти 2-3 хвилини)..."
pip install -r requirements-311-modern.txt

if [ $? -eq 0 ]; then
    print_success "Всі залежності встановлено!"
else
    print_error "Помилка при встановленні залежностей"
    exit 1
fi

# Крок 6: Перевірка ключових пакетів
print_step "Крок 6/8: Перевірка встановлених версій"

check_package() {
    VERSION=$(pip show $1 2>/dev/null | grep Version | cut -d' ' -f2)
    if [ -n "$VERSION" ]; then
        print_success "$1: $VERSION"
    else
        print_error "$1: не встановлено"
    fi
}

check_package "fastapi"
check_package "pydantic"
check_package "sqlalchemy"
check_package "uvicorn"
check_package "psycopg"
check_package "redis"
check_package "celery"

# Крок 7: Тестування імпортів
print_step "Крок 7/8: Тестування імпортів"

python -c "
import fastapi
import pydantic
import sqlalchemy
import uvicorn
import psycopg
print('✅ Всі основні пакети імпортуються успішно')
" 2>&1

if [ $? -eq 0 ]; then
    print_success "Імпорти працюють коректно"
else
    print_error "Помилка при імпорті пакетів"
    exit 1
fi

# Крок 8: Створення звіту
print_step "Крок 8/8: Створення звіту про міграцію"

REPORT_FILE="$BACKUP_DIR/migration-report.txt"
cat > "$REPORT_FILE" << EOF
Predator12 Python 3.11 Migration Report
========================================
Date: $(date)
Python Version: $PYTHON_VERSION
Pip Version: $PIP_VERSION

Backup Location: $BACKUP_DIR

Installed Packages:
-------------------
$(pip list)

Key Versions:
-------------
FastAPI: $(pip show fastapi | grep Version | cut -d' ' -f2)
Pydantic: $(pip show pydantic | grep Version | cut -d' ' -f2)
SQLAlchemy: $(pip show sqlalchemy | grep Version | cut -d' ' -f2)
Uvicorn: $(pip show uvicorn | grep Version | cut -d' ' -f2)
psycopg: $(pip show psycopg | grep Version | cut -d' ' -f2)

Next Steps:
-----------
1. Review MIGRATION_GUIDE_PYTHON311.md
2. Update code for Pydantic v2 (.dict() -> .model_dump())
3. Update code for SQLAlchemy 2.0 (query() -> select())
4. Update DATABASE_URL for psycopg3
5. Run tests: pytest tests/ -v
6. Start server: uvicorn app.main:app --reload

Rollback:
---------
If needed, restore old venv:
  rm -rf venv
  mv $BACKUP_DIR/venv-old venv
  source venv/bin/activate
EOF

print_success "Звіт створено: $REPORT_FILE"

# Фінал
echo ""
print_header "✅ МІГРАЦІЯ ЗАВЕРШЕНА!"

echo ""
echo -e "${GREEN}Python 3.11 venv створено та налаштовано!${NC}"
echo ""
echo -e "${YELLOW}📋 Наступні кроки:${NC}"
echo ""
echo "1️⃣  Прочитайте міграційний гід:"
echo "   cat ../MIGRATION_GUIDE_PYTHON311.md"
echo ""
echo "2️⃣  Оновіть код під Pydantic v2 та SQLAlchemy 2.0"
echo "   - .dict() → .model_dump()"
echo "   - .query() → select()"
echo "   - DATABASE_URL → postgresql+psycopg://..."
echo ""
echo "3️⃣  Запустіть тести:"
echo "   pytest tests/ -v"
echo ""
echo "4️⃣  Запустіть сервер:"
echo "   uvicorn app.main:app --reload"
echo ""
echo "5️⃣  Перевірте API:"
echo "   curl http://localhost:8000/docs"
echo ""
echo -e "${CYAN}📊 Backup знаходиться тут:${NC}"
echo "   $BACKUP_DIR"
echo ""
echo -e "${CYAN}📄 Звіт про міграцію:${NC}"
echo "   $REPORT_FILE"
echo ""
echo -e "${YELLOW}🔄 Якщо потрібен rollback:${NC}"
echo "   rm -rf venv"
echo "   mv $BACKUP_DIR/venv-old venv"
echo "   source venv/bin/activate"
echo ""
print_header "🚀 Готово до розробки на Python 3.11!"
