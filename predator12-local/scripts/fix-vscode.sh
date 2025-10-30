#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - VS Code Configuration Fixer
# ==============================================================================
# Автоматично виправляє всі помилки VS Code
# ==============================================================================

set -Eeuo pipefail

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
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VSCODE_DIR="$PROJECT_ROOT/.vscode"

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - VS Code Config Fixer                   ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""

# ==============================================================================
# 1. Створити venv (якщо немає)
# ==============================================================================

info "=== Крок 1: Python venv ==="

BACKEND_DIR="$PROJECT_ROOT/backend"
VENV_DIR="$BACKEND_DIR/venv"

if [ ! -d "$VENV_DIR" ]; then
    warning "venv не знайдено, створюю..."
    cd "$BACKEND_DIR"
    python3.11 -m venv venv
    success "venv створено"
else
    success "venv вже існує"
fi

# Перевірка Python версії
if [ -f "$VENV_DIR/bin/python" ]; then
    PYTHON_VERSION=$("$VENV_DIR/bin/python" --version 2>&1)
    info "Python: $PYTHON_VERSION"
else
    error "venv/bin/python не знайдено!"
    exit 1
fi

echo ""

# ==============================================================================
# 2. Backup старих конфігів
# ==============================================================================

info "=== Крок 2: Backup конфігурацій ==="

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -f "$VSCODE_DIR/settings.json" ]; then
    cp "$VSCODE_DIR/settings.json" "$VSCODE_DIR/settings.json.backup.$TIMESTAMP"
    success "settings.json → backup"
fi

if [ -f "$VSCODE_DIR/launch.json" ]; then
    cp "$VSCODE_DIR/launch.json" "$VSCODE_DIR/launch.json.backup.$TIMESTAMP"
    success "launch.json → backup"
fi

echo ""

# ==============================================================================
# 3. Створити новий settings.json
# ==============================================================================

info "=== Крок 3: Створення settings.json ==="

cat > "$VSCODE_DIR/settings.json" << 'SETTINGS_EOF'
{
    "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
    "python.envFile": "${workspaceFolder}/backend/.env",
    "python.terminal.activateEnvironment": true,
    "python.testing.pytestEnabled": true,
    "python.testing.pytestArgs": ["backend/tests"],
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "python.formatting.blackArgs": ["--line-length=100"],
    "python.analysis.extraPaths": [
        "${workspaceFolder}/backend",
        "${workspaceFolder}/backend/app"
    ],
    "typescript.tsdk": "frontend/node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": "explicit"
    },
    "files.exclude": {
        "**/.git": true,
        "**/.DS_Store": true,
        "**/__pycache__": true,
        "**/*.pyc": true,
        "**/.pytest_cache": true,
        "**/.ruff_cache": true,
        "**/node_modules": true,
        "**/.venv": false
    },
    "files.watcherExclude": {
        "**/.git/objects/**": true,
        "**/.git/subtree-cache/**": true,
        "**/node_modules/**": true,
        "**/.venv/**": true,
        "**/backups/**": true,
        "**/logs/**": true
    },
    "terminal.integrated.env.osx": {
        "PYTHONPATH": "${workspaceFolder}/backend",
        "ENV_FILE": "${workspaceFolder}/backend/.env"
    },
    "files.autoSave": "onFocusChange",
    "git.enableSmartCommit": true,
    "git.confirmSync": false,
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    },
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true
    },
    "[typescriptreact]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true
    },
    "[json]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[jsonc]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
}
SETTINGS_EOF

success "settings.json створено"

echo ""

# ==============================================================================
# 4. Створити новий launch.json
# ==============================================================================

info "=== Крок 4: Створення launch.json ==="

cat > "$VSCODE_DIR/launch.json" << 'LAUNCH_EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Backend: FastAPI (debugpy)",
            "type": "debugpy",
            "request": "launch",
            "module": "uvicorn",
            "args": [
                "app.main:app",
                "--reload",
                "--host", "0.0.0.0",
                "--port", "8000"
            ],
            "jinja": true,
            "console": "integratedTerminal",
            "cwd": "${workspaceFolder}/backend",
            "envFile": "${workspaceFolder}/backend/.env",
            "justMyCode": false
        },
        {
            "name": "Backend: Pytest",
            "type": "debugpy",
            "request": "launch",
            "module": "pytest",
            "args": ["tests/", "-v", "-s"],
            "console": "integratedTerminal",
            "cwd": "${workspaceFolder}/backend",
            "envFile": "${workspaceFolder}/backend/.env",
            "justMyCode": false
        },
        {
            "name": "Backend: Celery Worker",
            "type": "debugpy",
            "request": "launch",
            "module": "celery",
            "args": ["-A", "app.celery_app", "worker", "--loglevel=info"],
            "console": "integratedTerminal",
            "cwd": "${workspaceFolder}/backend",
            "envFile": "${workspaceFolder}/backend/.env"
        },
        {
            "name": "Frontend: Next.js Dev",
            "type": "node",
            "request": "launch",
            "cwd": "${workspaceFolder}/frontend",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"],
            "console": "integratedTerminal",
            "serverReadyAction": {
                "pattern": "- Local:.+(https?://.+)",
                "uriFormat": "%s",
                "action": "debugWithChrome"
            }
        },
        {
            "name": "Scripts: Health Check",
            "type": "debugpy",
            "request": "launch",
            "program": "${workspaceFolder}/scripts/health-check.py",
            "console": "integratedTerminal",
            "cwd": "${workspaceFolder}",
            "justMyCode": false
        }
    ],
    "compounds": [
        {
            "name": "Full Stack: Backend + Frontend",
            "configurations": [
                "Backend: FastAPI (debugpy)",
                "Frontend: Next.js Dev"
            ],
            "stopAll": true
        }
    ]
}
LAUNCH_EOF

success "launch.json створено"

echo ""

# ==============================================================================
# 5. Перевірка
# ==============================================================================

info "=== Крок 5: Перевірка ==="

# Валідація JSON
if command -v python3 &> /dev/null; then
    if python3 -m json.tool "$VSCODE_DIR/settings.json" > /dev/null 2>&1; then
        success "settings.json валідний"
    else
        error "settings.json має помилки синтаксису!"
    fi

    if python3 -m json.tool "$VSCODE_DIR/launch.json" > /dev/null 2>&1; then
        success "launch.json валідний"
    else
        error "launch.json має помилки синтаксису!"
    fi
fi

# Перевірка venv
if [ -f "$VENV_DIR/bin/python" ]; then
    success "Python venv готовий"
else
    warning "Python venv не знайдено"
fi

echo ""

# ==============================================================================
# Фінал
# ==============================================================================

success "=========================================="
success "   VS CODE КОНФІГУРАЦІЯ ВИПРАВЛЕНА! ✅"
success "=========================================="
echo ""

cat << 'EOF'
📋 Що було зроблено:

  ✅ settings.json без коментарів
  ✅ launch.json з debugpy/node
  ✅ Python paths оновлено
  ✅ analysis.extraPaths додано
  ✅ Backup створено

🎯 Наступні кроки:

  1. Перезавантажити VS Code:
     Command Palette → Developer: Reload Window

  2. Вибрати Python interpreter:
     Command Palette → Python: Select Interpreter
     → predator12-local/backend/venv/bin/python

  3. Встановити залежності (якщо ще не):
     cd backend
     source venv/bin/activate
     pip install -r requirements-311-modern.txt

  4. Перевірити imports:
     Відкрити backend/app/main.py
     → Має НЕ показувати помилок

  5. Спробувати debug:
     Run and Debug → Backend: FastAPI (debugpy)

📚 Документація:
  Див. VSCODE_FIXES.md для деталей

EOF

info "Backup файли: $VSCODE_DIR/*.backup.$TIMESTAMP"
