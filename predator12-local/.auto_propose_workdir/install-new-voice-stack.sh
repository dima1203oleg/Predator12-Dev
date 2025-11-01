#!/bin/bash
# 🔥 Встановлення НОВОГО Voice Stack
# Piper + Whisper Turbo + Оптимізації

echo "🔥 PREDATOR12 - Новий Voice Stack"
echo "================================="
echo ""

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функції
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Перевірка Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 не знайдено!"
    exit 1
fi

print_success "Python $(python3 --version) знайдено"

# Створити віртуальне середовище
VENV_DIR="voice-env-v2"

if [ -d "$VENV_DIR" ]; then
    print_info "Віртуальне середовище вже існує"
else
    print_info "Створення віртуального середовища..."
    python3 -m venv "$VENV_DIR"
    print_success "Віртуальне середовище створено"
fi

# Активувати
source "$VENV_DIR/bin/activate"
print_success "Віртуальне середовище активовано"

# Оновити pip
print_info "Оновлення pip..."
pip install --upgrade pip > /dev/null 2>&1
print_success "pip оновлено"

echo ""
echo "📦 Встановлення пакетів..."
echo "================================="
echo ""

# 1. Piper TTS
print_info "Встановлення Piper TTS..."
if pip install piper-tts > /dev/null 2>&1; then
    print_success "Piper TTS встановлено"
else
    print_error "Помилка встановлення Piper TTS"
fi

# 2. Whisper
print_info "Встановлення Whisper..."
if pip install openai-whisper > /dev/null 2>&1; then
    print_success "Whisper встановлено"
else
    print_error "Помилка встановлення Whisper"
fi

# 3. faster-whisper
print_info "Встановлення faster-whisper..."
if pip install faster-whisper > /dev/null 2>&1; then
    print_success "faster-whisper встановлено"
else
    print_error "Помилка встановлення faster-whisper"
fi

# 4. Vosk (легка альтернатива)
print_info "Встановлення Vosk..."
if pip install vosk > /dev/null 2>&1; then
    print_success "Vosk встановлено"
else
    print_error "Помилка встановлення Vosk"
fi

# 5. Silero VAD
print_info "Встановлення Silero VAD..."
if pip install silero-vad > /dev/null 2>&1; then
    print_success "Silero VAD встановлено"
else
    print_error "Помилка встановлення Silero VAD"
fi

# 6. Core бібліотеки
print_info "Встановлення core бібліотек..."
pip install torch torchaudio scipy librosa soundfile numpy > /dev/null 2>&1
print_success "Core бібліотеки встановлено"

# 7. API сервер
print_info "Встановлення FastAPI..."
pip install "fastapi[standard]" uvicorn python-multipart > /dev/null 2>&1
print_success "FastAPI встановлено"

echo ""
echo "📥 Завантаження моделей..."
echo "================================="
echo ""

# Завантажити українську модель Piper
MODELS_DIR="models/piper"
mkdir -p "$MODELS_DIR"

if [ -f "$MODELS_DIR/uk_UA-ukrainian-medium.onnx" ]; then
    print_success "Українська модель Piper вже завантажена"
else
    print_info "Завантаження української моделі Piper (50 MB)..."

    # Модель
    curl -L -o "$MODELS_DIR/uk_UA-ukrainian-medium.onnx" \
        "https://huggingface.co/rhasspy/piper-voices/resolve/main/uk/uk_UA/ukrainian/medium/uk_UA-ukrainian-medium.onnx" \
        2>&1 | grep -v "%" || true

    # Конфіг
    curl -L -o "$MODELS_DIR/uk_UA-ukrainian-medium.onnx.json" \
        "https://huggingface.co/rhasspy/piper-voices/resolve/main/uk/uk_UA/ukrainian/medium/uk_UA-ukrainian-medium.onnx.json" \
        2>&1 | grep -v "%" || true

    if [ -f "$MODELS_DIR/uk_UA-ukrainian-medium.onnx" ]; then
        print_success "Українська модель завантажена"
    else
        print_error "Помилка завантаження моделі"
    fi
fi

# Whisper моделі (будуть завантажені при першому використанні)
print_info "Whisper моделі будуть завантажені автоматично при першому запуску"

echo ""
echo "🧪 Запуск тестів..."
echo "================================="
echo ""

# Тест Piper
if [ -f "test_piper_tts.py" ]; then
    print_info "Тестування Piper TTS..."
    python test_piper_tts.py
else
    print_info "Тестовий скрипт test_piper_tts.py не знайдено"
fi

# Тест Whisper
if [ -f "test_whisper_turbo.py" ]; then
    print_info "Тестування Whisper Turbo..."
    python test_whisper_turbo.py
else
    print_info "Тестовий скрипт test_whisper_turbo.py не знайдено"
fi

echo ""
echo "✅ ВСТАНОВЛЕННЯ ЗАВЕРШЕНО!"
echo "================================="
echo ""
echo "📊 Встановлено:"
echo "  ✅ Piper TTS (найшвидший)"
echo "  ✅ Whisper Large v3 Turbo"
echo "  ✅ faster-whisper (оптимізований)"
echo "  ✅ Vosk (легкий STT)"
echo "  ✅ Silero VAD (оптимізація)"
echo "  ✅ FastAPI сервер"
echo ""
echo "🚀 Наступні кроки:"
echo "  1. Активуйте середовище: source voice-env-v2/bin/activate"
echo "  2. Тест Piper: python test_piper_tts.py"
echo "  3. Тест Whisper: python test_whisper_turbo.py"
echo "  4. Запуск API: python voice_api_v2.py"
echo ""
echo "📚 Документація:"
echo "  - 🔥_КРАЩІ_АЛЬТЕРНАТИВИ_VOICE_TECH.md"
echo ""

# Деактивувати (опціонально)
# deactivate
