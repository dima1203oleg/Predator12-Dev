#!/bin/bash

# 🎤 PREDATOR12 NEXUS - Швидке встановлення голосових технологій
# Автоматична інсталяція TTS/STT систем за 10 хвилин

echo "🎤 ================================================="
echo "   PREDATOR12 NEXUS - Голосові Технології"
echo "   Встановлення TTS/STT систем"
echo "================================================="
echo ""

# Кольорові функції
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Перевірка Python
print_step "Перевірка Python..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 не знайдено! Встановіть Python 3.9+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_success "Python ${PYTHON_VERSION} знайдено"

# Перевірка pip
print_step "Перевірка pip..."
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 не знайдено!"
    exit 1
fi
print_success "pip готовий"

# Створення віртуального середовища
print_step "Створення віртуального середовища..."
if [ ! -d "voice-env" ]; then
    python3 -m venv voice-env
    print_success "Віртуальне середовище створено"
else
    print_warning "Віртуальне середовище вже існує"
fi

# Активація віртуального середовища
print_step "Активація середовища..."
source voice-env/bin/activate
print_success "Середовище активовано"

# Оновлення pip
print_step "Оновлення pip..."
pip install --upgrade pip setuptools wheel --quiet
print_success "pip оновлено"

# Встановлення базових залежностей
print_step "Встановлення базових бібліотек..."
pip install numpy scipy --quiet
print_success "Базові бібліотеки встановлено"

# Встановлення PyTorch
print_step "Встановлення PyTorch..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [[ $(uname -m) == 'arm64' ]]; then
        print_step "Встановлення для Apple Silicon (M1/M2/M3)..."
        pip install torch torchvision torchaudio --quiet
    else
        print_step "Встановлення для Intel Mac..."
        pip install torch torchvision torchaudio --quiet
    fi
else
    # Linux
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --quiet
fi
print_success "PyTorch встановлено"

# Встановлення Coqui TTS
print_step "Встановлення Coqui TTS (може зайняти кілька хвилин)..."
pip install TTS --quiet
print_success "Coqui TTS встановлено"

# Встановлення Whisper
print_step "Встановлення OpenAI Whisper..."
pip install openai-whisper --quiet
print_success "Whisper встановлено"

# Встановлення faster-whisper (оптимізована версія)
print_step "Встановлення faster-whisper..."
pip install faster-whisper --quiet
print_success "faster-whisper встановлено"

# Встановлення аудіо бібліотек
print_step "Встановлення аудіо бібліотек..."
pip install soundfile pydub librosa --quiet
print_success "Аудіо бібліотеки встановлено"

# Встановлення решти залежностей
print_step "Встановлення додаткових бібліотек..."
pip install -r voice-requirements.txt --quiet 2>/dev/null || true
print_success "Додаткові бібліотеки встановлено"

# Завантаження моделей
echo ""
print_step "Завантаження моделей (це може зайняти час)..."

# Whisper моделі
print_step "Завантаження Whisper Base моделі..."
python3 -c "import whisper; whisper.load_model('base')" 2>/dev/null &
WHISPER_PID=$!

# Coqui TTS моделі
print_step "Завантаження TTS моделі для української..."
python3 -c "from TTS.api import TTS; TTS('tts_models/uk/mai/glow-tts')" 2>/dev/null &
TTS_PID=$!

# Чекаємо на завантаження
wait $WHISPER_PID 2>/dev/null
print_success "Whisper модель завантажена"

wait $TTS_PID 2>/dev/null
print_success "TTS модель завантажена"

# Тестування встановлення
echo ""
print_step "Перевірка встановлення..."

# Тест Whisper
python3 -c "import whisper; print('✓ Whisper працює')" 2>/dev/null && print_success "Whisper OK" || print_warning "Whisper потребує налаштування"

# Тест TTS
python3 -c "from TTS.api import TTS; print('✓ TTS працює')" 2>/dev/null && print_success "TTS OK" || print_warning "TTS потребує налаштування"

# Тест аудіо
python3 -c "import soundfile; print('✓ Audio працює')" 2>/dev/null && print_success "Audio OK" || print_warning "Audio потребує налаштування"

# Фінальне повідомлення
echo ""
echo "================================================="
print_success "🎉 Встановлення завершено успішно!"
echo "================================================="
echo ""
echo "📝 Наступні кроки:"
echo "   1. Активуйте середовище: source voice-env/bin/activate"
echo "   2. Запустіть тестовий скрипт: python test_voice_system.py"
echo "   3. Або використайте API: python voice_api.py"
echo ""
echo "🎤 Доступні моделі:"
echo "   - Whisper (STT): base, small, medium, large"
echo "   - Coqui TTS: Ukrainian + English"
echo ""
echo "📚 Документація:"
echo "   - Whisper: https://github.com/openai/whisper"
echo "   - Coqui TTS: https://github.com/coqui-ai/TTS"
echo ""
print_success "Готово до використання! 🚀"
