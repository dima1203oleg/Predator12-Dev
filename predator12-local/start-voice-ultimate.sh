#!/bin/bash

# 🚀 PREDATOR12 - Ultimate Voice API Quickstart
# Швидкий запуск триступеневої голосової системи

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║       🎤 PREDATOR12 Ultimate Voice API Quickstart               ║"
echo "║              Триступенева логіка fallback                       ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Перевірка Python
echo "📋 Перевірка Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не знайдено! Встановіть Python 3.8+"
    exit 1
fi

python3 --version
echo "✅ Python встановлено"
echo ""

# Перевірка встановлення залежностей
echo "📦 Перевірка залежностей..."
if [ -f "voice-requirements.txt" ]; then
    echo "ℹ️  Знайдено voice-requirements.txt"

    read -p "Встановити/оновити залежності? (y/n): " install_deps
    if [ "$install_deps" = "y" ]; then
        echo "📥 Встановлення залежностей..."
        pip3 install -r voice-requirements.txt
        echo "✅ Залежності встановлено"
    fi
else
    echo "⚠️  voice-requirements.txt не знайдено"
    echo "ℹ️  Запустіть ./install-voice-tech.sh для повної установки"
fi
echo ""

# API Keys налаштування
echo "🔑 Налаштування API Keys (опціонально для кращої якості):"
echo ""
echo "Для використання API-first підходу, встановіть environment variables:"
echo "  export ELEVENLABS_API_KEY='your_key_here'"
echo "  export GOOGLE_CLOUD_API_KEY='your_key_here'"
echo "  export AZURE_SPEECH_KEY='your_key_here'"
echo ""
echo "💡 Без API keys система використовуватиме локальні моделі та браузер"
echo ""

read -p "Продовжити запуск? (y/n): " continue_launch
if [ "$continue_launch" != "y" ]; then
    echo "Зупинка."
    exit 0
fi
echo ""

# Запуск API сервера
echo "🚀 Запуск Ultimate Voice API Server..."
echo "📍 URL: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
echo ""
echo "🎯 Триступенева логіка fallback:"
echo "   1️⃣  API Services (ElevenLabs → Google Cloud → Azure)"
echo "   2️⃣  Local Models (Coqui TTS → Piper | Whisper → faster-whisper)"
echo "   3️⃣  Browser Web Speech API (завжди доступний)"
echo ""
echo "⏹️  Натисніть Ctrl+C для зупинки"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Запуск сервера
python3 voice_api_ultimate.py
