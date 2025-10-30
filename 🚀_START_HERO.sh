#!/bin/bash

# 🚀 PREDATOR ANALYTICS - HERO INTERFACE LAUNCHER
# Запускає frontend + backend для героїчної сторінки

echo "🎯 PREDATOR ANALYTICS - Hero Interface"
echo "======================================"
echo ""

# Перевірка чи встановлено залежності
if [ ! -d "predator12-local/frontend/node_modules" ]; then
  echo "📦 Встановлення frontend залежностей..."
  cd predator12-local/frontend
  npm install
  cd ../..
fi

if [ ! -d "predator12-local/backend/venv" ]; then
  echo "🐍 Створення Python virtual environment..."
  cd predator12-local/backend
  python3.11 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  cd ../..
fi

echo ""
echo "✅ Залежності встановлено"
echo ""

# Запуск backend у фоні
echo "🔧 Запуск Backend (FastAPI на :8000)..."
cd predator12-local/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ../..

sleep 3

# Запуск frontend
echo "🎨 Запуск Frontend (Vite на :5173)..."
cd predator12-local/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "======================================"
echo "✅ PREDATOR ANALYTICS запущено!"
echo "======================================"
echo ""
echo "📡 Backend:  http://localhost:8000"
echo "🎯 Frontend: http://localhost:5173"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Щоб зупинити, натисніть Ctrl+C"
echo ""

# Обробка сигналу переривання
trap "echo ''; echo '🛑 Зупинка сервісів...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Очікування
wait
