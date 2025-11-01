#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Setup Python 3.11 venv
# ==============================================================================
# Створює чистий Python 3.11 venv та встановлює залежності
# ==============================================================================

set -Eeuo pipefail

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../backend" && pwd)"
VENV_DIR="$BACKEND_DIR/venv"

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - Python 3.11 venv Setup                 ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""

# ==============================================================================
# Крок 1: Перевірка Python 3.11
# ==============================================================================
info "=== Крок 1: Перевірка Python 3.11 ==="

if ! command -v python3.11 &> /dev/null; then
    error "Python 3.11 не знайдено!"
    echo ""
    echo "Встановіть Python 3.11:"
    echo "  brew install python@3.11"
    exit 1
fi

PYTHON_VERSION=$(python3.11 --version)
success "Знайдено: $PYTHON_VERSION"

echo ""

# ==============================================================================
# Крок 2: Backup старого venv (якщо існує)
# ==============================================================================
info "=== Крок 2: Перевірка існуючого venv ==="

if [ -d "$VENV_DIR" ]; then
    warning "Знайдено існуючий venv"

    # Перевірка версії Python у venv
    if [ -f "$VENV_DIR/bin/python" ]; then
        OLD_VERSION=$("$VENV_DIR/bin/python" --version 2>&1 || echo "unknown")
        info "Поточна версія у venv: $OLD_VERSION"
    fi

    read -p "Видалити існуючий venv та створити новий? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_DIR="$BACKEND_DIR/venv.backup.$(date +%Y%m%d_%H%M%S)"
        info "Створюю backup: $BACKUP_DIR"
        mv "$VENV_DIR" "$BACKUP_DIR"
        success "Backup створено"
    else
        info "Залишаю існуючий venv"
        exit 0
    fi
else
    info "Існуючого venv не знайдено"
fi

echo ""

# ==============================================================================
# Крок 3: Створення нового venv
# ==============================================================================
info "=== Крок 3: Створення Python 3.11 venv ==="

cd "$BACKEND_DIR"
python3.11 -m venv venv

if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/python" ]; then
    success "venv створено: $VENV_DIR"
else
    error "Не вдалося створити venv"
    exit 1
fi

echo ""

# ==============================================================================
# Крок 4: Активація та оновлення pip
# ==============================================================================
info "=== Крок 4: Оновлення pip, setuptools, wheel ==="

source "$VENV_DIR/bin/activate"

# Перевірка активації
ACTIVE_PYTHON=$(which python)
info "Активний Python: $ACTIVE_PYTHON"

if [[ ! "$ACTIVE_PYTHON" == *"venv/bin/python"* ]]; then
    warning "venv може бути не активовано коректно"
fi

# Оновлення інструментів
pip install --upgrade pip setuptools wheel

PIP_VERSION=$(pip --version)
success "pip оновлено: $PIP_VERSION"

echo ""

# ==============================================================================
# Крок 5: Встановлення залежностей
# ==============================================================================
info "=== Крок 5: Встановлення залежностей ==="

if [ ! -f "$BACKEND_DIR/requirements-311-modern.txt" ]; then
    error "Файл requirements-311-modern.txt не знайдено!"
    exit 1
fi

info "Встановлюю пакети з requirements-311-modern.txt..."
info "Це може зайняти 5-10 хвилин..."
echo ""

pip install -r requirements-311-modern.txt

if [ $? -eq 0 ]; then
    success "Всі залежності встановлено"
else
    error "Помилка встановлення залежностей"
    exit 1
fi

echo ""

# ==============================================================================
# Крок 6: Перевірка критичних пакетів
# ==============================================================================
info "=== Крок 6: Перевірка критичних пакетів ==="

PACKAGES=(
    "fastapi"
    "uvicorn"
    "sqlalchemy"
    "alembic"
    "pydantic"
    "psycopg"
    "redis"
    "celery"
)

FAILED=0

for pkg in "${PACKAGES[@]}"; do
    if pip show "$pkg" > /dev/null 2>&1; then
        VERSION=$(pip show "$pkg" | grep "Version:" | cut -d' ' -f2)
        success "$pkg ($VERSION)"
    else
        error "$pkg не встановлено"
        FAILED=1
    fi
done

echo ""

if [ $FAILED -eq 1 ]; then
    error "Деякі пакети не встановлено"
    exit 1
fi

# ==============================================================================
# Крок 7: Тестування імпортів
# ==============================================================================
info "=== Крок 7: Тестування імпортів ==="

python << 'PYEOF'
import sys
print(f"Python: {sys.version}")

packages = [
    "fastapi",
    "sqlalchemy",
    "pydantic",
    "psycopg",
    "redis",
    "celery",
    "httpx",
    "numpy",
    "pandas",
]

failed = []
for pkg in packages:
    try:
        __import__(pkg)
        print(f"✅ {pkg}")
    except ImportError as e:
        print(f"❌ {pkg}: {e}")
        failed.append(pkg)

if failed:
    print(f"\n⚠️  Не вдалося імпортувати: {', '.join(failed)}")
    sys.exit(1)
else:
    print("\n✅ Всі пакети імпортуються успішно")
PYEOF

if [ $? -eq 0 ]; then
    success "Тестування імпортів пройдено"
else
    error "Деякі пакети не імпортуються"
    exit 1
fi

echo ""

# ==============================================================================
# Крок 8: Створення інформаційного файлу
# ==============================================================================
info "=== Крок 8: Збереження інформації про venv ==="

cat > "$BACKEND_DIR/.venv-info" << INFOEOF
# Predator12 venv Information
Created: $(date)
Python: $(python --version)
Pip: $(pip --version)
Location: $VENV_DIR

# Activation:
source $VENV_DIR/bin/activate

# Packages:
$(pip list --format=freeze | head -20)
...
Total packages: $(pip list | wc -l)
INFOEOF

success "Інформація збережена в .venv-info"

echo ""

# ==============================================================================
# Крок 9: VS Code налаштування
# ==============================================================================
info "=== Крок 9: VS Code налаштування ==="

VSCODE_DIR="$BACKEND_DIR/../.vscode"
mkdir -p "$VSCODE_DIR"

# Оновлення settings.json
if [ -f "$VSCODE_DIR/settings.json" ]; then
    info "settings.json вже існує"
else
    cat > "$VSCODE_DIR/settings.json" << 'VSCEOF'
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  }
}
VSCEOF
    success "settings.json створено"
fi

echo ""

# ==============================================================================
# ФІНАЛ
# ==============================================================================
success "=========================================="
success "   Python 3.11 venv ГОТОВИЙ! 🎉"
success "=========================================="
echo ""

info "Що далі:"
echo ""
echo "  1. Активувати venv:"
echo "     source backend/venv/bin/activate"
echo ""
echo "  2. Перевірити версію:"
echo "     python --version"
echo ""
echo "  3. Health check:"
echo "     python scripts/health-check.py"
echo ""
echo "  4. Налаштувати .env:"
echo "     cd backend && cp .env.example .env"
echo ""
echo "  5. Запустити міграції:"
echo "     alembic upgrade head"
echo ""
echo "  6. Запустити сервер:"
echo "     uvicorn app.main:app --reload"
echo ""

info "Інформація про venv:"
echo "  Розташування: $VENV_DIR"
echo "  Python: $PYTHON_VERSION"
echo "  Пакетів встановлено: $(pip list | wc -l)"
echo ""

deactivate 2>/dev/null || true
