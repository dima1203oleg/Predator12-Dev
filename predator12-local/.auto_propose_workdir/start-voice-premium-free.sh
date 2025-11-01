#!/bin/bash

# 🎤 PREDATOR12 Premium FREE Voice API - Startup Script
# Запуск найкращих БЕЗКОШТОВНИХ TTS/STT моделей

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 PREDATOR12 PREMIUM FREE VOICE API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Найкращі БЕЗКОШТОВНІ моделі:"
echo "  🔊 TTS: Coqui TTS (українська + англійська)"
echo "  🎧 STT: faster-whisper (українська + англійська)"
echo ""

cd "$(dirname "$0")"

# Перевірка Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не знайдено!"
    echo "   Встановіть: brew install python3"
    exit 1
fi

echo "✅ Python: $(python3 --version)"
echo ""

# Перевірка віртуального середовища
if [ ! -d "venv" ]; then
    echo "📦 Створюю віртуальне середовище..."
    python3 -m venv venv
    echo "✅ Віртуальне середовище створено"
    echo ""
fi

# Активація віртуального середовища
echo "🔄 Активація віртуального середовища..."
source venv/bin/activate

# Перевірка залежностей
if [ ! -f "venv/installed.txt" ]; then
    echo ""
    echo "📥 Встановлення залежностей (перший раз може зайняти 5-10 хв)..."
    echo ""

    pip install --upgrade pip
    pip install -r requirements_premium_free.txt

    # Позначка про встановлення
    touch venv/installed.txt

    echo ""
    echo "✅ Всі залежності встановлено!"
    echo ""
else
    echo "✅ Залежності вже встановлено"
    echo ""
fi

# Перевірка портів
if lsof -Pi :5094 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Порт 5094 вже зайнятий. Зупиняю попередній процес..."
    kill -9 $(lsof -ti:5094) 2>/dev/null
    sleep 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Запуск API сервера..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 URL: http://localhost:5094"
echo "📚 Docs: http://localhost:5094/docs"
echo ""
echo "💡 Перше завантаження моделей займе 2-5 хв (автоматично)"
echo "💡 Натисніть Ctrl+C для зупинки"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Запуск API
python3 voice_api_premium_free.py
