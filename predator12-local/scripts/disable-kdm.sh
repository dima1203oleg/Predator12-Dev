#!/usr/bin/env bash

# ==============================================================================
# PREDATOR12 - Find and Disable KDM Environment
# ==============================================================================
# Автоматичний пошук та відключення KDM середовища
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

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - Disable KDM Environment                ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""

# ==============================================================================
# Крок 1: Знайти KDM
# ==============================================================================
info "=== Крок 1: Пошук KDM середовища ==="
echo ""

FOUND_KDM=false
KDM_TYPE=""
KDM_LOCATION=""

# Перевірка Conda
if command -v conda &> /dev/null; then
    info "Перевіряю Conda..."
    if conda env list | grep -q "kdm"; then
        KDM_TYPE="conda"
        KDM_LOCATION=$(conda env list | grep "kdm" | awk '{print $NF}')
        warning "Знайдено KDM Conda environment: $KDM_LOCATION"
        FOUND_KDM=true
    fi
fi

# Перевірка Pyenv
if command -v pyenv &> /dev/null; then
    info "Перевіряю Pyenv..."
    if pyenv versions | grep -q "kdm"; then
        KDM_TYPE="pyenv"
        warning "Знайдено KDM Pyenv environment"
        FOUND_KDM=true
    fi
fi

# Перевірка virtualenv/venv
info "Перевіряю venv/virtualenv..."
KDM_DIRS=$(find ~ -maxdepth 3 -type d -name "*kdm*" 2>/dev/null | head -5)
if [ -n "$KDM_DIRS" ]; then
    KDM_TYPE="venv"
    KDM_LOCATION="$KDM_DIRS"
    warning "Знайдено KDM директорії:"
    echo "$KDM_DIRS"
    FOUND_KDM=true
fi

# Перевірка shell конфігів
info "Перевіряю shell конфіги..."
SHELL_CONFIGS=$(grep -rn "kdm\|KDM" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile 2>/dev/null || true)
if [ -n "$SHELL_CONFIGS" ]; then
    warning "Знайдено згадки KDM у shell конфігах:"
    echo "$SHELL_CONFIGS"
    FOUND_KDM=true
fi

echo ""

if [ "$FOUND_KDM" = false ]; then
    success "KDM середовище не знайдено!"
    echo ""
    echo "Можливо, це кастомне середовище."
    echo "Перевірте вручну: $HOME/.virtualenvs/"
    exit 0
fi

# ==============================================================================
# Крок 2: Відключити KDM
# ==============================================================================
info "=== Крок 2: Відключення KDM ==="
echo ""

read -p "Відключити KDM середовище? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Скасовано користувачем"
    exit 0
fi

# Відключити за типом
case "$KDM_TYPE" in
    conda)
        info "Відключаю Conda KDM..."
        
        # Деактивувати
        conda deactivate 2>/dev/null || true
        
        # Вимкнути автоактивацію
        conda config --set auto_activate_base false
        
        # Запитати чи видаляти
        read -p "Видалити KDM Conda environment? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            conda remove -n kdm --all -y
            success "KDM Conda environment видалено"
        fi
        ;;
        
    pyenv)
        info "Відключаю Pyenv KDM..."
        
        # Деактивувати
        pyenv deactivate 2>/dev/null || true
        
        # Видалити
        read -p "Видалити KDM Pyenv virtualenv? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pyenv virtualenv-delete kdm
            pyenv global system
            success "KDM Pyenv environment видалено"
        fi
        ;;
        
    venv)
        info "Знайдено venv/virtualenv KDM..."
        
        echo "Директорії:"
        echo "$KDM_LOCATION"
        echo ""
        
        read -p "Видалити ці директорії? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            while IFS= read -r dir; do
                if [ -d "$dir" ]; then
                    rm -rf "$dir"
                    success "Видалено: $dir"
                fi
            done <<< "$KDM_LOCATION"
        fi
        ;;
esac

# ==============================================================================
# Крок 3: Очистити shell конфіги
# ==============================================================================
info "=== Крок 3: Очищення shell конфігів ==="
echo ""

CONFIGS=(~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile)

for config in "${CONFIGS[@]}"; do
    if [ -f "$config" ] && grep -q "kdm\|KDM" "$config"; then
        warning "Знайдено KDM в $config"
        
        # Backup
        cp "$config" "$config.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Закоментувати рядки з KDM
        sed -i.tmp '/kdm\|KDM/s/^/# DISABLED_KDM: /' "$config"
        rm "$config.tmp" 2>/dev/null || true
        
        success "KDM рядки закоментовано в $config"
        echo "   Backup: $config.backup.*"
    fi
done

echo ""

# ==============================================================================
# Крок 4: Перезавантажити shell
# ==============================================================================
info "=== Крок 4: Застосування змін ==="
echo ""

warning "Щоб зміни набули чинності, виконайте:"
echo ""
echo "  source ~/.zshrc"
echo "  # або"
echo "  exec zsh"
echo "  # або закрийте та відкрийте новий термінал"
echo ""

# ==============================================================================
# Крок 5: Створити новий Python 3.11 venv
# ==============================================================================
info "=== Крок 5: Створення нового Python 3.11 venv ==="
echo ""

read -p "Створити новий Python 3.11 venv зараз? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    if [ -f "$SCRIPT_DIR/setup-venv.sh" ]; then
        info "Запускаю setup-venv.sh..."
        bash "$SCRIPT_DIR/setup-venv.sh"
    else
        warning "setup-venv.sh не знайдено"
        echo ""
        echo "Створіть venv вручну:"
        echo "  cd backend"
        echo "  python3.11 -m venv venv"
        echo "  source venv/bin/activate"
        echo "  pip install -r requirements-311-modern.txt"
    fi
else
    info "Створіть venv пізніше:"
    echo "  bash scripts/setup-venv.sh"
fi

echo ""

# ==============================================================================
# Підсумок
# ==============================================================================
success "=========================================="
success "   KDM ВІДКЛЮЧЕНО! ✅"
success "=========================================="
echo ""

info "Що зроблено:"
echo "  ✅ KDM середовище деактивовано/видалено"
echo "  ✅ Shell конфіги очищені"
echo "  ✅ Backup створені"
echo ""

info "Наступні кроки:"
echo "  1. Перезавантажити shell:"
echo "     exec zsh"
echo ""
echo "  2. Перевірити:"
echo "     which python"
echo "     python --version"
echo ""
echo "  3. Створити Python 3.11 venv (якщо не створено):"
echo "     bash scripts/setup-venv.sh"
echo ""
echo "  4. Перевірити систему:"
echo "     bash scripts/system-check.sh"
echo ""

warning "ВАЖЛИВО: Перезавантажте термінал перед продовженням!"
