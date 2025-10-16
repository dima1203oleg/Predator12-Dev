#!/bin/bash

# 🎉 ФІНАЛЬНИЙ ДЕМО ЗАПУСК NEXUS CORE V5.1
# Демонстрація всіх можливостей системи

echo "🎊 ЗАПУСК ФІНАЛЬНОГО ДЕМО NEXUS CORE V5.1"
echo "=========================================="

# Перехід до проекту
cd /Users/dima/Documents/Predator12/predator12-local

echo ""
echo "🔍 ПЕРЕВІРКА ГОТОВНОСТІ СИСТЕМИ:"
echo "================================"

# Перевірка критичних файлів
critical_files=(
    "frontend/src/App.tsx"
    "frontend/src/components/dashboard/SuperGameDashboard.tsx"
    "frontend/src/components/game/InteractiveTutorial.tsx"
    "frontend/src/components/analytics/SmartAnalyticsHub.tsx"
    "frontend/src/components/system/SystemControlPanel.tsx"
    "frontend/src/components/theme/AdvancedThemeCustomizer.tsx"
    "frontend/src/components/game/AchievementSystem.tsx"
    "frontend/src/components/game/NeuralNetworkGame.tsx"
    "frontend/src/components/notifications/NotificationSystem.tsx"
    "frontend/src/components/effects/EnhancedVisualEffects.tsx"
)

ready_count=0
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $(basename "$file") - ГОТОВИЙ"
        ((ready_count++))
    else
        echo "   ❌ $(basename "$file") - ВІДСУТНІЙ"
    fi
done

echo ""
echo "📊 Готовність системи: $ready_count/10 компонентів ($(($ready_count * 10))%)"

if [ $ready_count -eq 10 ]; then
    echo "🏆 СИСТЕМА ПОВНІСТЮ ГОТОВА ДО ДЕМО!"
else
    echo "⚠️ Система не готова до демо"
    exit 1
fi

echo ""
echo "🚀 ЗАПУСК СЕРВЕРА РОЗРОБКИ:"
echo "=========================="

# Перевірка активних серверів
if nc -z localhost 5094 2>/dev/null; then
    echo "   ✅ Сервер вже запущений на порту 5094"
    echo "   🌐 URL: http://localhost:5094"
    server_ready=true
else
    echo "   🔄 Запускаю новий сервер..."
    cd frontend
    npm run dev > ../demo_server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > ../demo_server.pid
    
    # Чекаємо запуску сервера
    for i in {1..15}; do
        if nc -z localhost 5094 2>/dev/null; then
            echo "   ✅ Сервер успішно запущений на порту 5094"
            echo "   🌐 URL: http://localhost:5094"
            server_ready=true
            break
        elif nc -z localhost 509$((4-i)) 2>/dev/null; then
            echo "   ✅ Сервер запущений на порту 509$((4-i))"
            echo "   🌐 URL: http://localhost:509$((4-i))"
            server_ready=true
            break
        fi
        echo "   ⏳ Очікування запуску сервера... ($i/15)"
        sleep 2
    done
    cd ..
fi

if [ "$server_ready" != true ]; then
    echo "   ❌ Не вдалося запустити сервер"
    exit 1
fi

echo ""
echo "🎮 ДЕМО СЦЕНАРІЙ:"
echo "================"

cat << 'EOF'

🎯 РЕКОМЕНДОВАНИЙ ПЛАН ТЕСТУВАННЯ:

1. 🏠 ГОЛОВНИЙ ДАШБОРД
   • Перевірте анімації та метрики
   • Спробуйте ігровий режим
   • Тестуйте звукові ефекти

2. 🎓 ІНТЕРАКТИВНИЙ ТУТОРІАЛ
   • Пройдіть всі етапи навчання
   • Отримайте XP та досягнення
   • Перевірте підказки

3. 🎨 КАСТОМІЗАТОР ТЕМ
   • Спробуйте різні готові теми
   • Створіть власну тему
   • Протестуйте прев'ю

4. 🧠 РОЗУМНА АНАЛІТИКА
   • Переглядайте метрики
   • Перевірте інсайти
   • Тестуйте фільтри

5. ⚙️ СИСТЕМНИЙ КОНТРОЛЬ
   • Змініть налаштування
   • Експортуйте конфігурацію
   • Тестуйте розширені опції

6. 🤖 AI МОДУЛІ
   • Перевірте агентів ШІ
   • Тестуйте моделі
   • Спробуйте голосовий інтерфейс

7. 🔒 БЕЗПЕКА ТА ДОСТУПНІСТЬ
   • Перевірте кібербезпеку
   • Тестуйте доступність
   • Використовуйте клавіатурні скорочення

EOF

echo ""
echo "⌨️ КЛАВІАТУРНІ СКОРОЧЕННЯ:"
echo "========================="

cat << 'EOF'

🎮 НАВІГАЦІЯ:
• Ctrl+1-9   - Переключення між модулями
• Ctrl+G     - Ігровий режим
• Ctrl+S     - Звукові ефекти
• Ctrl+F     - Повноекранний режим
• Ctrl+H     - Допомога
• Esc        - Закрити діалоги

♿ ДОСТУПНІСТЬ:
• Tab/Shift+Tab  - Навігація
• Enter/Space    - Активація
• Ctrl++/-       - Збільшити/зменшити
• Ctrl+Alt+C     - Контрастний режим

EOF

echo ""
echo "📱 ТЕСТУВАННЯ НА ПРИСТРОЯХ:"
echo "=========================="

echo "   📱 Mobile (320px+)   - Використовуйте Dev Tools"
echo "   💻 Tablet (768px+)   - Зменшіть вікно браузера"
echo "   🖥️ Desktop (1024px+) - Повний розмір"
echo "   📺 Large (1440px+)   - Максимальний розмір"

echo ""
echo "🎊 ДОДАТКОВІ ФІЧІ ДЛЯ ТЕСТУВАННЯ:"
echo "================================"

cat << 'EOF'

✨ АНІМАЦІЇ ТА ЕФЕКТИ:
• Анімовані частинки фону
• Matrix rain ефект
• Holographic overlay
• Smooth transitions
• Interactive hover effects

🎮 ІГРОВІ ЕЛЕМЕНТИ:
• XP система та рівні
• Досягнення та бейджі
• Mini-games (Neural Network)
• Прогрес-бари
• Звукові відгуки

🧠 AI ФУНКЦІЇ:
• Розумні рекомендації
• Автоматичні інсайти
• Голосове управління
• Персоналізація
• Машинне навчання

EOF

echo ""
echo "🎯 КРИТЕРІЇ УСПІШНОГО ДЕМО:"
echo "=========================="

cat << 'EOF'

✅ ВСІ МОДУЛІ ВІДКРИВАЮТЬСЯ БЕЗ ПОМИЛОК
✅ АНІМАЦІЇ ПРАЦЮЮТЬ ПЛАВНО
✅ ТЕМИ ПЕРЕКЛЮЧАЮТЬСЯ КОРЕКТНО
✅ ІГРОВІ ЕЛЕМЕНТИ АКТИВНІ
✅ ЗВУКИ ВІДТВОРЮЮТЬСЯ (ЯКЩО УВІМКНЕНІ)
✅ RESPONSIVE ДИЗАЙН ПРАЦЮЄ
✅ КЛАВІАТУРНА НАВІГАЦІЯ ФУНКЦІОНУЄ
✅ ДОСТУПНІСТЬ ПОВНІСТЮ ПІДТРИМУЄТЬСЯ

EOF

echo ""
echo "🔗 КОРИСНІ ПОСИЛАННЯ:"
echo "===================="

echo "   🌐 Основний URL: http://localhost:5094"
echo "   📚 Документація: README_ДЛЯ_КОМАНДИ_V4.md"
echo "   🎮 Туторіал: Вбудований в систему"
echo "   🐛 Логи сервера: demo_server.log"

echo ""
echo "🎉 ЗАПУСК БРАУЗЕРА..."
echo "===================="

# Спроба відкрити браузер
if command -v open >/dev/null 2>&1; then
    echo "   🚀 Відкриваю Safari/Chrome..."
    open http://localhost:5094
elif command -v google-chrome >/dev/null 2>&1; then
    echo "   🚀 Відкриваю Google Chrome..."
    google-chrome http://localhost:5094 &
elif command -v firefox >/dev/null 2>&1; then
    echo "   🚀 Відкриваю Firefox..."
    firefox http://localhost:5094 &
else
    echo "   ℹ️ Будь ласка, відкрийте http://localhost:5094 в браузері"
fi

echo ""
echo "⏰ РЕКОМЕНДОВАНИЙ ЧАС ДЕМО: 15-20 хвилин"
echo ""
echo "🎊 НАСОЛОДЖУЙТЕСЬ ДЕМО NEXUS CORE V5.1!"
echo "======================================"
echo ""
echo "💡 Порада: Спочатку пройдіть туторіал для знайомства з системою"
echo ""

# Відображення статистики в реальному часі
echo "📊 МОНІТОРИНГ ДЕМО:"
echo "=================="
echo "   ⏱️ Час початку: $(date)"
echo "   🔄 Для зупинки натисніть Ctrl+C"
echo ""

# Очікування завершення
echo "🎯 ДЕМО АКТИВНЕ! Натисніть Ctrl+C для завершення..."

trap 'echo ""; echo "🎊 ДЕМО ЗАВЕРШЕНО!"; echo "Дякуємо за тестування Nexus Core V5.1!"; exit 0' INT

# Нескінченний цикл для моніторингу
while true; do
    sleep 30
    if nc -z localhost 5094 2>/dev/null; then
        echo "   ✅ $(date '+%H:%M:%S') - Сервер активний"
    else
        echo "   ⚠️ $(date '+%H:%M:%S') - Сервер недоступний"
        break
    fi
done
