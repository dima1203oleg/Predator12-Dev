#!/bin/bash

# 🚀 CYBER-ACE ШВИДКІ КОМАНДИ
# Копіюйте та вставляйте ці команди для швидкого запуску

echo "🚀 CYBER-ACE Quick Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 1. ЗАПУСК BACKEND
# ==========================================
echo "📌 1. ЗАПУСК BACKEND (Terminal 1):"
echo ""
echo "cd /Users/dima/Documents/Predator12/predator12-local/backend"
echo "python3 -m uvicorn app.main:app --reload --port 8000"
echo ""
echo "✅ Перевірка: http://localhost:8000/docs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 2. ЗАПУСК FRONTEND
# ==========================================
echo "📌 2. ЗАПУСК FRONTEND (Terminal 2):"
echo ""
echo "cd /Users/dima/Documents/Predator12/predator12-local/frontend"
echo "npm run dev"
echo ""
echo "✅ Перевірка: http://localhost:5173"
echo "✅ CYBER-ACE: http://localhost:5173/cyber-ace"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 3. ТЕСТУВАННЯ
# ==========================================
echo "📌 3. ТЕСТУВАННЯ (Terminal 3):"
echo ""
echo "cd /Users/dima/Documents/Predator12/predator12-local"
echo "./test-cyber-ace-integration.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 4. АВТОМАТИЧНИЙ ЗАПУСК
# ==========================================
echo "📌 4. АБО АВТОМАТИЧНИЙ ЗАПУСК (все в одному):"
echo ""
echo "cd /Users/dima/Documents/Predator12/predator12-local"
echo "./cyber-ace-start.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 5. ШВИДКІ ПЕРЕВІРКИ
# ==========================================
echo "📌 5. ШВИДКІ ПЕРЕВІРКИ API:"
echo ""
echo "# Health Check"
echo "curl http://localhost:8000/api/cyber-ace/health"
echo ""
echo "# Chat Test"
echo "curl -X POST http://localhost:8000/api/cyber-ace/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\":\"Привіт\",\"user_id\":\"test\",\"language\":\"uk\"}'"
echo ""
echo "# Agents List"
echo "curl http://localhost:8000/api/cyber-ace/agents"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 6. TROUBLESHOOTING
# ==========================================
echo "📌 6. TROUBLESHOOTING:"
echo ""
echo "# Перевірити зайняті порти"
echo "lsof -ti:8000  # Backend"
echo "lsof -ti:5173  # Frontend"
echo ""
echo "# Вбити процес на порту"
echo "kill -9 \$(lsof -ti:8000)"
echo "kill -9 \$(lsof -ti:5173)"
echo ""
echo "# Встановити залежності"
echo "cd backend && pip3 install -r cyber_ace/requirements.txt"
echo "cd frontend && npm install"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 7. КОРИСНІ ПОСИЛАННЯ
# ==========================================
echo "📌 7. КОРИСНІ ПОСИЛАННЯ:"
echo ""
echo "Backend API Docs: http://localhost:8000/docs"
echo "Frontend App:     http://localhost:5173"
echo "CYBER-ACE Page:   http://localhost:5173/cyber-ace"
echo "Health Check:     http://localhost:8000/api/cyber-ace/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# 8. ДОКУМЕНТАЦІЯ
# ==========================================
echo "📌 8. ДОКУМЕНТАЦІЯ:"
echo ""
echo "📊 Фінальний Summary: 📊_CYBER_ACE_FINAL_SUMMARY.md"
echo "🎯 Action Plan:       🎯_ACTION_PLAN_CYBER_ACE.md"
echo "⚡ Швидкий Запуск:    ⚡_ЗАПУСК_CYBER_ACE.md"
echo "🎯 Наступні Кроки:    🎯_CYBER_ACE_NEXT_STEPS.md"
echo "🚀 Готово До Запуску: 🚀_ГОТОВО_ДО_ЗАПУСКУ.md"
echo "🔗 Інтеграція:        🔗_CYBER_ACE_INTEGRATION_COMPLETED.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "🎉 ВСЕ ГОТОВО ДО ЗАПУСКУ!"
echo ""
echo "Оберіть опцію:"
echo "  1. Ручний запуск (3 термінали) - команди вище"
echo "  2. Автоматичний - ./cyber-ace-start.sh"
echo ""
echo "🚀 Успіхів з CYBER-ACE!"
