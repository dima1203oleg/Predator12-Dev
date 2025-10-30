#!/bin/bash

# 🎮 PREDATOR12 NEXUS CORE V5.2 - ENHANCED DEMO LAUNCHER
# Розширений демо-скрипт з новими модулями та покращеннями

echo "🌟 =========================================="
echo "🎮 PREDATOR12 NEXUS CORE V5.2 DEMO LAUNCHER"
echo "🌟 =========================================="
echo ""

# Функція кольорового виводу
print_color() {
    local color=$1
    local text=$2
    case $color in
        "red") echo -e "\033[31m$text\033[0m" ;;
        "green") echo -e "\033[32m$text\033[0m" ;;
        "yellow") echo -e "\033[33m$text\033[0m" ;;
        "blue") echo -e "\033[34m$text\033[0m" ;;
        "purple") echo -e "\033[35m$text\033[0m" ;;
        "cyan") echo -e "\033[36m$text\033[0m" ;;
        *) echo "$text" ;;
    esac
}

# Перевірка наявності необхідних файлів
check_files() {
    print_color "cyan" "🔍 Перевірка файлової структури..."

    local required_files=(
        "predator12-local/frontend/src/App.tsx"
        "predator12-local/frontend/src/components/voice/AIVoiceInterface.tsx"
        "predator12-local/frontend/src/components/visualization/Immersive3DVisualizer.tsx"
        "predator12-local/frontend/src/components/collaboration/RealTimeCollaborationHub.tsx"
        "predator12-local/frontend/package.json"
    )

    local missing_files=()
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -eq 0 ]]; then
        print_color "green" "✅ Всі необхідні файли присутні!"
    else
        print_color "red" "❌ Відсутні файли:"
        for file in "${missing_files[@]}"; do
            print_color "red" "   - $file"
        done
        return 1
    fi
}

# Показати статус нових модулів
show_module_status() {
    print_color "purple" "🧩 СТАТУС НОВИХ МОДУЛІВ V5.2:"
    echo ""

    print_color "green" "✅ AIVoiceInterface - Голосовий інтерфейс ШІ"
    print_color "green" "   • Розпізнавання мови"
    print_color "green" "   • Голосові команди"
    print_color "green" "   • AI асистент"
    echo ""

    print_color "green" "✅ Immersive3DVisualizer - 3D/VR Візуалізатор"
    print_color "green" "   • Інтерактивні 3D ноди"
    print_color "green" "   • Canvas візуалізація"
    print_color "green" "   • VR підтримка"
    echo ""

    print_color "green" "✅ RealTimeCollaborationHub - Колаборація"
    print_color "green" "   • Чат в реальному часі"
    print_color "green" "   • Відео дзвінки"
    print_color "green" "   • Спільний доступ до екрану"
    echo ""
}

# Запуск розробницького сервера
start_dev_server() {
    print_color "blue" "🚀 Запуск розробницького сервера..."
    cd predator12-local/frontend

    # Перевірка залежностей
    if [[ ! -d "node_modules" ]]; then
        print_color "yellow" "📦 Встановлення залежностей..."
        npm install
    fi

    # Запуск сервера
    print_color "green" "🌐 Запускаємо Vite Dev Server на порту 5094..."
    npm run dev -- --port 5094 --host &

    local server_pid=$!
    echo $server_pid > ../server.pid

    print_color "green" "✅ Сервер запущено! PID: $server_pid"
    cd ../..
}

# Перевірка доступності сервера
check_server() {
    print_color "cyan" "⏳ Очікування запуску сервера..."
    local max_attempts=30
    local attempt=0

    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s http://localhost:5094 > /dev/null 2>&1; then
            print_color "green" "✅ Сервер доступний на http://localhost:5094"
            return 0
        fi

        echo -n "."
        sleep 1
        ((attempt++))
    done

    print_color "red" "❌ Сервер не відповідає після $max_attempts спроб"
    return 1
}

# Показати демо інструкції
show_demo_instructions() {
    print_color "yellow" "📖 ІНСТРУКЦІЇ ДЛЯ ДЕМО V5.2:"
    echo ""

    print_color "cyan" "🎯 НОВІ ФУНКЦІЇ ДЛЯ ТЕСТУВАННЯ:"
    echo ""

    print_color "green" "🎤 ГОЛОСОВИЙ ІНТЕРФЕЙС:"
    echo "   • Натисніть на модуль 'Голосовий Інтерфейс ШІ'"
    echo "   • Спробуйте голосові команди: 'відкрий дашборд', 'показати агентів'"
    echo "   • Тестуйте різні мови та акценти"
    echo ""

    print_color "blue" "🌐 3D ВІЗУАЛІЗАТОР:"
    echo "   • Перейдіть до '3D/VR Візуалізатор'"
    echo "   • Обертайте та масштабуйте 3D сцену"
    echo "   • Клікайте на ноди для навігації"
    echo "   • Експериментуйте з VR режимом"
    echo ""

    print_color "purple" "👥 КОЛАБОРАЦІЯ:"
    echo "   • Відкрийте 'Колаборація в Реальному Часі'"
    echo "   • Тестуйте чат функціональність"
    echo "   • Спробуйте емодзі та реакції"
    echo "   • Симулюйте відео дзвінки"
    echo ""

    print_color "cyan" "🎮 ЗАГАЛЬНІ ФУНКЦІЇ:"
    echo "   • Ігровий режим з XP та досягненнями"
    echo "   • Клавіатурні скорочення (Ctrl+G для довідки)"
    echo "   • Система сповіщень з пріоритетами"
    echo "   • Покращена доступність (ARIA, контрастність)"
    echo ""
}

# Відкрити браузер
open_browser() {
    local url="http://localhost:5094"
    print_color "green" "🌐 Відкриваємо браузер: $url"

    if command -v open > /dev/null; then
        open "$url"  # macOS
    elif command -v xdg-open > /dev/null; then
        xdg-open "$url"  # Linux
    elif command -v start > /dev/null; then
        start "$url"  # Windows
    else
        print_color "yellow" "⚠️  Відкрийте браузер вручну: $url"
    fi
}

# Моніторинг системи
monitor_system() {
    print_color "blue" "📊 Моніторинг системи активний..."
    echo ""

    while true; do
        if [[ -f "predator12-local/server.pid" ]]; then
            local pid=$(cat predator12-local/server.pid)
            if ps -p $pid > /dev/null 2>&1; then
                print_color "green" "✅ Сервер активний (PID: $pid) - $(date '+%H:%M:%S')"
            else
                print_color "red" "❌ Сервер завершився!"
                break
            fi
        else
            print_color "yellow" "⚠️  PID файл не знайдено"
        fi

        sleep 30
    done
}

# Очищення при виході
cleanup() {
    print_color "yellow" "🧹 Очищення..."

    if [[ -f "predator12-local/server.pid" ]]; then
        local pid=$(cat predator12-local/server.pid)
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid
            print_color "green" "✅ Сервер зупинено"
        fi
        rm -f predator12-local/server.pid
    fi

    print_color "blue" "👋 Демо завершено!"
}

# Основна функція
main() {
    trap cleanup EXIT

    # Перевірки
    if ! check_files; then
        print_color "red" "❌ Критичні файли відсутні. Завершення."
        exit 1
    fi

    # Показати статус
    show_module_status

    # Запустити сервер
    start_dev_server

    # Перевірити сервер
    if check_server; then
        show_demo_instructions
        open_browser

        print_color "green" "🎉 NEXUS CORE V5.2 DEMO ЗАПУЩЕНО!"
        print_color "cyan" "💡 Натисніть Ctrl+C для завершення"
        echo ""

        # Моніторинг (необов'язково)
        read -p "Запустити моніторинг системи? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            monitor_system
        else
            print_color "blue" "📝 Демо активне. Натисніть Ctrl+C для завершення."
            while true; do sleep 1; done
        fi
    else
        print_color "red" "❌ Не вдалося запустити сервер"
        cleanup
        exit 1
    fi
}

# Запуск
main "$@"
