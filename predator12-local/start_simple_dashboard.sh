#!/bin/bash

# ============================================================================
#                   SIMPLE PRODUCTION DASHBOARD SERVER
#                       Простий сервер для порту 5090
# ============================================================================

echo "🚀 Starting Simple Production Dashboard Server"
echo "=============================================="
echo "📅 $(date)"
echo "🎯 Port: 5090"
echo "📁 Directory: frontend/dist"
echo ""

# Перевірка наявності dist папки
if [ ! -d "frontend/dist" ]; then
    echo "❌ frontend/dist directory not found"
    echo "🔧 Building frontend first..."
    cd frontend
    npm run build
    cd ..
fi

if [ ! -f "frontend/dist/index.html" ]; then
    echo "❌ frontend/dist/index.html not found"
    exit 1
fi

# Перевірка порту
if lsof -i :5090 &> /dev/null; then
    echo "⚠️  Port 5090 is already in use"
    echo "Stopping existing processes..."
    sudo lsof -ti:5090 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi

echo "✅ Starting HTTP server on port 5090..."
echo "🌐 Dashboard will be available at: http://localhost:5090"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Запуск сервера
cd frontend/dist
python3 -m http.server 5090
