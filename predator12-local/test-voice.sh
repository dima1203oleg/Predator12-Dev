#!/bin/bash

# 🎤 Quick Voice Test Script
# Predator12 Nexus Core V5.2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 PREDATOR12 VOICE RECOGNITION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка ОС
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    BROWSER_CMD="open"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    BROWSER_CMD="xdg-open"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    OS="Windows"
    BROWSER_CMD="start"
else
    OS="Unknown"
    BROWSER_CMD="open"
fi

echo "📱 Операційна система: $OS"
echo ""

# Шлях до тестової сторінки
TEST_FILE="/Users/dima/Documents/Predator12/predator12-local/test-speech-recognition.html"

# Перевірка існування файлу
if [ ! -f "$TEST_FILE" ]; then
    echo "❌ ПОМИЛКА: Тестовий файл не знайдено!"
    echo "   Очікується: $TEST_FILE"
    exit 1
fi

echo "✅ Тестовий файл знайдено: test-speech-recognition.html"
echo ""

# Меню вибору
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Оберіть спосіб запуску:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1) 🌐 Відкрити тестову сторінку напряму (file://)"
echo "   → Простий спосіб, працює для базового тестування"
echo ""
echo "2) 🚀 Запустити HTTP сервер (http://localhost:8888)"
echo "   → Рекомендовано для повного тестування"
echo "   → Імітує production середовище"
echo ""
echo "3) 💻 Запустити frontend додаток (http://localhost:3000)"
echo "   → Повна інтеграція з React компонентами"
echo ""
echo "4) 📖 Показати інструкції"
echo ""
echo "0) ❌ Вийти"
echo ""

read -p "Ваш вибір (1-4, 0): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Відкриваю тестову сторінку..."
        $BROWSER_CMD "$TEST_FILE"
        echo ""
        echo "✅ Сторінка відкрита у браузері!"
        echo ""
        echo "📋 Що робити далі:"
        echo "   1. Натисніть '🔍 Діагностика' для перевірки систем"
        echo "   2. Дозвольте доступ до мікрофона у спливаючому вікні"
        echo "   3. Натисніть '▶️ Старт' для початку розпізнавання"
        echo "   4. Скажіть щось українською: 'Привіт', 'Тест', 'Відкрий дашборд'"
        echo "   5. Перегляньте логи внизу сторінки"
        ;;

    2)
        echo ""
        echo "🚀 Запускаю HTTP сервер..."
        echo ""
        cd /Users/dima/Documents/Predator12/predator12-local

        # Перевірка, чи порт зайнятий
        if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null ; then
            echo "⚠️  Порт 8888 вже зайнятий. Зупиняю процес..."
            kill -9 $(lsof -ti:8888) 2>/dev/null
            sleep 1
        fi

        echo "✅ Запускаю Python HTTP сервер на порту 8888..."
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📍 URL: http://localhost:8888/test-speech-recognition.html"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Натисніть Ctrl+C для зупинки сервера"
        echo ""

        # Відкриваємо браузер через 2 секунди
        (sleep 2 && $BROWSER_CMD "http://localhost:8888/test-speech-recognition.html") &

        # Запускаємо сервер
        python3 -m http.server 8888
        ;;

    3)
        echo ""
        echo "💻 Запускаю frontend додаток..."
        echo ""

        FRONTEND_DIR="/Users/dima/Documents/Predator12/predator12-local/frontend"

        if [ ! -d "$FRONTEND_DIR" ]; then
            echo "❌ ПОМИЛКА: Frontend директорія не знайдена!"
            echo "   Очікується: $FRONTEND_DIR"
            exit 1
        fi

        cd "$FRONTEND_DIR"

        # Перевірка node_modules
        if [ ! -d "node_modules" ]; then
            echo "📦 Встановлюю залежності..."
            npm install
        fi

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📍 Frontend запускається на: http://localhost:3000"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📋 Що робити далі:"
        echo "   1. Дочекайтеся завантаження додатку"
        echo "   2. Перейдіть до 'Voice Control Interface'"
        echo "   3. Натисніть кнопку мікрофона"
        echo "   4. Дозвольте доступ до мікрофона"
        echo "   5. Почніть говорити"
        echo ""
        echo "Натисніть Ctrl+C для зупинки"
        echo ""

        npm run dev
        ;;

    4)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📖 ІНСТРУКЦІЇ ПО ТЕСТУВАННЮ"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "✅ ВИМОГИ:"
        echo "   • Chrome 25+ або Edge 79+ (НЕ Firefox/Safari)"
        echo "   • macOS: Дозвіл у System Preferences → Security → Microphone"
        echo "   • Працюючий мікрофон (вбудований або зовнішній)"
        echo "   • Інтернет-з'єднання (для Web Speech API)"
        echo ""
        echo "🔍 ДІАГНОСТИКА:"
        echo "   1. Відкрийте DevTools (F12 або Cmd+Option+I)"
        echo "   2. Вкладка Console"
        echo "   3. Шукайте повідомлення з '🎤', '✅', '❌'"
        echo ""
        echo "🎤 ТЕСТУВАННЯ:"
        echo "   Спробуйте сказати:"
        echo "   • 'Привіт' (українська)"
        echo "   • 'Тест'"
        echo "   • 'Відкрий дашборд'"
        echo "   • 'Покажи статус системи'"
        echo "   • 'Hello' (English)"
        echo ""
        echo "❌ ТИПОВІ ПРОБЛЕМИ:"
        echo "   • 'not-allowed': Заборонено доступ → Дозвольте у налаштуваннях"
        echo "   • 'audio-capture': Мікрофон недоступний → Перевірте підключення"
        echo "   • 'no-speech': Не чує звук → Говоріть голосніше"
        echo "   • 'network': Немає інтернету → Перевірте з'єднання"
        echo ""
        echo "📄 Детальніше: 🔧_VOICE_DIAGNOSTIC_GUIDE.md"
        echo ""
        ;;

    0)
        echo ""
        echo "👋 До побачення!"
        exit 0
        ;;

    *)
        echo ""
        echo "❌ Невірний вибір. Спробуйте ще раз."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Готово!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
