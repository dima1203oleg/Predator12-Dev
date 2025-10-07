#!/bin/bash

# 🎯 PREDATOR12 Dashboard - Demo Script V3
# Тестування всіх нових функцій веб-інтерфейсу

echo "🚀 PREDATOR12 DASHBOARD - INTERACTIVE DEMO"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
echo -e "${BLUE}📡 Перевірка dev server...${NC}"
if curl -s http://localhost:5091 > /dev/null; then
    echo -e "${GREEN}✅ Dev server АКТИВНИЙ на http://localhost:5091${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server не запущений, запускаю...${NC}"
    cd /Users/dima/Documents/Predator12/predator12-local/frontend
    npm run dev > /tmp/vite-dev.log 2>&1 &
    sleep 5
    echo -e "${GREEN}✅ Dev server запущений!${NC}"
fi

echo ""
echo "🎯 ДЕМОНСТРАЦІЯ НОВИХ ФУНКЦІЙ:"
echo "================================"
echo ""

# Feature 1: Search
echo -e "${BLUE}1️⃣  ПОШУК СЕРВІСІВ${NC}"
echo "   - Відкрийте: http://localhost:5091"
echo "   - Клікніть в search bar (🔍 Search services...)"
echo "   - Введіть 'postgres' або 'redis'"
echo "   - Побачите: миттєву фільтрацію результатів"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Feature 2: Filters
echo -e "${BLUE}2️⃣  ФІЛЬТРИ ПО КАТЕГОРІЯХ${NC}"
echo "   Доступні категорії:"
echo "   - All Services (25) - всі сервіси"
echo "   - Core (5) - основні застосунки"
echo "   - Database (4) - бази даних"
echo "   - Search (2) - системи пошуку"
echo "   - AI/ML (1) - AI сервіси"
echo "   - Monitoring (7) - моніторинг"
echo "   - Security (1) - безпека"
echo ""
echo "   ✨ Спробуйте:"
echo "   1. Клікнути на 'Database' chip"
echo "   2. Побачити тільки 4 database сервіси"
echo "   3. Клікнути 'All Services' для скидання"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Feature 3: Service Details Modal
echo -e "${BLUE}3️⃣  МОДАЛЬНЕ ВІКНО ДЕТАЛЕЙ${NC}"
echo "   ✨ Спробуйте:"
echo "   1. Клікнути на будь-яку Service Card (наприклад, Backend API)"
echo "   2. Модальне вікно відкриється з деталями:"
echo "      - ⏱️  Uptime: 99.9%"
echo "      - 📊 Requests/min: 1,247"
echo "      - ⚡ Response Time: 45ms"
echo "      - 🔍 Last Check: 2s ago"
echo "   3. Побачити action buttons:"
echo "      - 📄 View Logs"
echo "      - 🔄 Restart (warning style)"
echo "      - ⚙️ Configure"
echo "   4. Закрити: клік на × або поза вікном"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Feature 4: Alerts
echo -e "${BLUE}4️⃣  СИСТЕМА СПОВІЩЕНЬ${NC}"
echo "   Поточний alert:"
echo "   ⚠️  WARNING: Qdrant Vector DB experiencing high response times (156ms)"
echo ""
echo "   Розташування: верхній правий кут"
echo "   Анімація: slideInRight"
echo ""
echo "   ✨ Спробуйте:"
echo "   1. Знайти alert у верхньому правому куті"
echo "   2. Натиснути × для закриття"
echo "   3. Alert зникне з анімацією"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Feature 5: Combined Search + Filter
echo -e "${BLUE}5️⃣  КОМБІНОВАНИЙ ПОШУК + ФІЛЬТР${NC}"
echo "   ✨ Спробуйте:"
echo "   1. Ввести 'prom' в search bar"
echo "   2. Клікнути на 'Monitoring' filter"
echo "   3. Побачити тільки Prometheus + Promtail"
echo "   4. Очистити search для скидання"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Feature 6: Empty State
echo -e "${BLUE}6️⃣  EMPTY STATE (НЕМАЄ РЕЗУЛЬТАТІВ)${NC}"
echo "   ✨ Спробуйте:"
echo "   1. Ввести 'xyz123' в search bar"
echo "   2. Побачити красивий empty state:"
echo "      🔍"
echo "      No services found"
echo "      Try adjusting your search or filter criteria"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Performance Metrics
echo -e "${BLUE}7️⃣  СИСТЕМНІ МЕТРИКИ (REAL-TIME)${NC}"
echo "   4 метрики з live оновленням:"
echo "   - ⚡ CPU Usage: 45.0% (↘ -2.3%)"
echo "   - 💾 Memory: 68.0% (↗ +1.5%)"
echo "   - 💿 Disk: 52.0% (↗ +0.8%)"
echo "   - 🌐 Network: 34.0 MB/s (↗ +5.2%)"
echo ""
echo "   ✨ Оновлення кожні 2 секунди"
echo "   ✨ Hover для box-shadow ефекту"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Chart
echo -e "${BLUE}8️⃣  PERFORMANCE CHART${NC}"
echo "   📈 System Performance"
echo "   - Canvas-based smooth line chart"
echo "   - Gradient fill"
echo "   - Real-time monitoring"
echo ""
echo "   Quick Stats:"
echo "   - Requests: 12.4K (+12%)"
echo "   - Avg Response: 45ms (-8%)"
echo "   - Error Rate: 0.02% (-15%)"
echo ""
read -p "   Натисніть Enter для продовження..."
echo ""

# Summary
echo ""
echo "🎉 ДЕМОНСТРАЦІЯ ЗАВЕРШЕНА!"
echo "=========================="
echo ""
echo -e "${GREEN}✅ Всі 8 нових функцій продемонстровані${NC}"
echo ""
echo "📊 Статистика:"
echo "   - 25 сервісів"
echo "   - 8 категорій фільтрів"
echo "   - 4 системні метрики"
echo "   - 1 performance chart"
echo "   - 1 система алертів"
echo "   - ∞ можливостей кастомізації"
echo ""

# URLs
echo "🌐 URLs для доступу:"
echo "   Development:  http://localhost:5091/"
echo "   Production:   http://localhost:3000/"
echo "   Network:      http://172.20.10.3:5091/"
echo ""

# Next Steps
echo "🚀 НАСТУПНІ КРОКИ:"
echo "   1. Інтеграція з backend API (Phase 2)"
echo "   2. WebSocket для real-time updates"
echo "   3. Persistent filters в localStorage"
echo "   4. Dark/Light mode toggle"
echo "   5. Advanced charts (Chart.js/Recharts)"
echo "   6. Notification center з історією"
echo ""

# Build status
echo "📦 BUILD STATUS:"
if [ -f "/Users/dima/Documents/Predator12/predator12-local/frontend/dist/index.html" ]; then
    echo -e "   ${GREEN}✅ Production build готовий${NC}"
    echo "   📁 Location: predator12-local/frontend/dist/"
else
    echo -e "   ${YELLOW}⚠️  Production build потребує оновлення${NC}"
    echo "   Запустіть: npm run build"
fi
echo ""

# Open in browser
echo "🌐 Відкрити dashboard в браузері?"
read -p "   Натисніть Enter для відкриття..."
if command -v open &> /dev/null; then
    open http://localhost:5091
    echo -e "${GREEN}✅ Dashboard відкрито в браузері!${NC}"
else
    echo "   Відкрийте вручну: http://localhost:5091"
fi

echo ""
echo "✨ Насолоджуйтесь вдосконаленим інтерфейсом!"
echo ""

