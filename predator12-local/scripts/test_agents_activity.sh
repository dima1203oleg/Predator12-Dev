#!/bin/bash

echo "🚀 ЗАПУСК PREDATOR11 SYSTEM TEST"
echo "================================="

# Функція для перевірки статусу сервісу
check_service() {
    local service_name=$1
    local url=$2
    
    echo -n "Перевірка $service_name... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "✅ OK"
        return 0
    else
        echo "❌ НЕДОСТУПНИЙ"
        return 1
    fi
}

# Функція для запуску агента
start_agent() {
    local agent_name=$1
    local agent_path=$2
    
    echo "🤖 Запуск $agent_name..."
    
    if [ -f "$agent_path" ]; then
        cd "$(dirname "$agent_path")"
        python3 "$(basename "$agent_path")" &
        local agent_pid=$!
        echo "   PID: $agent_pid"
        echo "$agent_pid" > "/tmp/${agent_name}.pid"
        sleep 2
    else
        echo "   ❌ Файл не знайдено: $agent_path"
    fi
}

# 1. Перевірка Docker сервісів
echo "📋 Перевірка сервісів..."
echo "========================"

check_service "PostgreSQL" "localhost:5432" || echo "   PostgreSQL може бути недоступний"
check_service "Redis" "localhost:6379" || echo "   Redis може бути недоступний" 
check_service "Prometheus" "http://localhost:9090/-/healthy"
check_service "Backend API" "http://localhost:8000/health"

echo ""

# 2. Запуск агентів самовдосконалення
echo "🤖 Запуск агентів самовдосконалення..."
echo "====================================="

# Встановлення змінних оточення для агентів
export REDIS_URL="redis://localhost:6379/0"
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/predator11"
export KAFKA_BROKERS="localhost:9092"

start_agent "AutoHeal" "/Users/dima/Documents/Predator11/agents/auto-heal/auto_heal_agent.py"
start_agent "SelfImprovement" "/Users/dima/Documents/Predator11/agents/self-improvement/self_improvement_agent.py"
start_agent "SelfDiagnosis" "/Users/dima/Documents/Predator11/agents/self-diagnosis/self_diagnosis_agent.py"

echo ""

# 3. Моніторинг активності
echo "📊 Моніторинг активності (30 секунд)..."
echo "======================================="

monitor_duration=30
start_time=$(date +%s)

while [ $(($(date +%s) - start_time)) -lt $monitor_duration ]; do
    echo -n "."
    sleep 1
done

echo ""

# 4. Збір інформації про активність
echo "📈 Збір результатів..."
echo "====================="

echo "Запущені агенти:"
for pid_file in /tmp/AutoHeal.pid /tmp/SelfImprovement.pid /tmp/SelfDiagnosis.pid; do
    if [ -f "$pid_file" ]; then
        agent_name=$(basename "$pid_file" .pid)
        pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "   ✅ $agent_name (PID: $pid) - АКТИВНИЙ"
        else
            echo "   ❌ $agent_name (PID: $pid) - ЗУПИНЕНИЙ"
        fi
    fi
done

echo ""

# 5. Перевірка логів
echo "📝 Перевірка логів..."
echo "===================="

log_dirs=(
    "/Users/dima/Documents/Predator11/logs/agents"
    "/Users/dima/Documents/Predator11/logs/autoheal"  
    "/tmp"
)

for log_dir in "${log_dirs[@]}"; do
    if [ -d "$log_dir" ]; then
        echo "Директорія: $log_dir"
        find "$log_dir" -name "*.log" -newer /tmp/test_start_time 2>/dev/null | head -5 | while read logfile; do
            echo "   📄 $(basename "$logfile"): $(wc -l < "$logfile") рядків"
        done
    fi
done

echo ""

# 6. Cleanup функція для зупинки агентів
cleanup_agents() {
    echo "🛑 Зупинка агентів..."
    
    for pid_file in /tmp/AutoHeal.pid /tmp/SelfImprovement.pid /tmp/SelfDiagnosis.pid; do
        if [ -f "$pid_file" ]; then
            agent_name=$(basename "$pid_file" .pid)
            pid=$(cat "$pid_file")
            if ps -p $pid > /dev/null 2>&1; then
                echo "   Зупиняю $agent_name (PID: $pid)"
                kill $pid
            fi
            rm -f "$pid_file"
        fi
    done
}

# 7. Підсумок
echo "📋 ПІДСУМОК ТЕСТУ"
echo "================="

# Підрахунок активних процесів
active_agents=0
for pid_file in /tmp/AutoHeal.pid /tmp/SelfImprovement.pid /tmp/SelfDiagnosis.pid; do
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            ((active_agents++))
        fi
    fi
done

echo "Активних агентів: $active_agents/3"
echo "Час тестування: $monitor_duration секунд"
echo ""

# Опції для користувача
echo "Оберіть дію:"
echo "1. Зупинити всі агенти"
echo "2. Продовжити роботу в фоні"
echo "3. Показати детальну статистику"

read -p "Ваш вибір (1/2/3): " choice

case $choice in
    1)
        cleanup_agents
        echo "✅ Всі агенти зупинені"
        ;;
    2)
        echo "✅ Агенти продовжують роботу в фоні"
        echo "Для зупинки використовуйте: killall python3"
        ;;
    3)
        echo "📊 Детальна статистика:"
        echo "======================="
        ps aux | grep -E "(auto_heal|self_improvement|self_diagnosis)" | grep -v grep
        ;;
esac

echo ""
echo "🎯 Тест завершено!"
