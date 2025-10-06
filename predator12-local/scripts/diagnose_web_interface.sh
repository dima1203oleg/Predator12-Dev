#!/bin/bash

echo "🔍 ДІАГНОСТИКА ВЕБ-ІНТЕРФЕЙСУ PREDATOR11"
echo "========================================"

# Функції для перевірки
check_port() {
    local port=$1
    local service_name=$2
    
    echo -n "Перевірка порту $port ($service_name)... "
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ ЗАЙНЯТИЙ"
        lsof -i :$port | head -2
    else
        echo "❌ ВІЛЬНИЙ"
    fi
}

check_service_health() {
    local url=$1
    local service_name=$2
    
    echo -n "Перевірка $service_name ($url)... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "✅ ДОСТУПНИЙ"
    else
        echo "❌ НЕДОСТУПНИЙ"
    fi
}

# 1. Перевірка портів
echo "📡 Перевірка портів..."
echo "===================="
check_port 3000 "Frontend"
check_port 8000 "Backend API"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"
check_port 9200 "OpenSearch"
check_port 9090 "Prometheus"

echo ""

# 2. Перевірка Docker контейнерів
echo "🐳 Статус Docker контейнерів..."
echo "==============================="

cd /Users/dima/Documents/Predator11

if docker compose ps 2>/dev/null | grep -q "Up\|running"; then
    echo "✅ Контейнери запущені:"
    docker compose ps | grep -E "(Up|running)"
else
    echo "❌ Контейнери не запущені"
    echo "Спробуйте: docker compose up -d"
fi

echo ""

# 3. Перевірка залежностей Node.js
echo "📦 Frontend залежності..."
echo "========================"

cd frontend

if [ -d "node_modules" ]; then
    echo "✅ node_modules існує"
    echo "   Розмір: $(du -sh node_modules 2>/dev/null | cut -f1)"
else
    echo "❌ node_modules відсутні"
    echo "   Потрібно: npm install"
fi

if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json існує"
else
    echo "❌ package-lock.json відсутній"
fi

echo ""

# 4. Перевірка TypeScript/ESLint помилок
echo "🔧 Перевірка коду..."
echo "==================="

if command -v npm &> /dev/null; then
    if [ -d "node_modules" ]; then
        echo "Перевірка TypeScript..."
        if npm run typecheck 2>/dev/null; then
            echo "✅ TypeScript: OK"
        else
            echo "❌ TypeScript: Є помилки"
        fi
    else
        echo "⚠️  Неможливо перевірити - відсутні node_modules"
    fi
else
    echo "❌ npm не встановлено"
fi

echo ""

# 5. Перевірка файлів конфігурації
echo "⚙️  Конфігураційні файли..."
echo "==========================="

config_files=(
    "vite.config.ts"
    "package.json"
    "tsconfig.json"
    ".env"
    "nginx.conf"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    elif [ -f "../$file" ]; then
        echo "✅ $file (в корені проекту)"
    else
        echo "❌ $file відсутній"
    fi
done

echo ""

# 6. Рекомендації для виправлення
echo "💡 РЕКОМЕНДАЦІЇ"
echo "==============="

if [ ! -d "node_modules" ]; then
    echo "1. Встановіть залежності:"
    echo "   cd frontend && npm install"
fi

if ! docker compose ps 2>/dev/null | grep -q "Up"; then
    echo "2. Запустіть Docker сервіси:"
    echo "   cd /Users/dima/Documents/Predator11 && docker compose up -d"
fi

if ! lsof -i :3000 > /dev/null 2>&1; then
    echo "3. Запустіть frontend:"
    echo "   cd frontend && npm run dev"
fi

if ! curl -s -f "http://localhost:8000/health" > /dev/null 2>&1; then
    echo "4. Перевірте backend API:"
    echo "   curl http://localhost:8000/health"
fi

echo ""
echo "📋 ШВИДКИЙ СТАРТ:"
echo "================"
echo "# Повний запуск системи:"
echo "cd /Users/dima/Documents/Predator11"
echo "docker compose up -d"
echo "cd frontend"
echo "npm install"
echo "npm run dev"
echo ""
echo "🌐 Після запуску відкрийте: http://localhost:3000"
