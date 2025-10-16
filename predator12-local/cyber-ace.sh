#!/bin/bash

# 🎯 CYBER-ACE Helper - Швидкі команди для управління системою

case "$1" in
    start)
        echo "🚀 Starting CYBER-ACE..."
        ./cyber-ace-start.sh
        ;;

    status)
        echo "🔍 Checking CYBER-ACE status..."
        ./cyber-ace-status.sh
        ;;

    test)
        echo "🧪 Running integration tests..."
        ./test-cyber-ace-integration.sh
        ;;

    stop)
        echo "🛑 Stopping CYBER-ACE..."
        echo "Stopping backend..."
        pkill -f 'uvicorn app.main:app' && echo "✓ Backend stopped" || echo "Backend was not running"
        echo "Stopping frontend..."
        pkill -f 'vite' && echo "✓ Frontend stopped" || echo "Frontend was not running"
        ;;

    restart)
        echo "🔄 Restarting CYBER-ACE..."
        $0 stop
        sleep 2
        $0 start
        ;;

    logs)
        echo "📋 Showing backend logs..."
        tail -f backend/logs/cyber_ace.log
        ;;

    backend)
        echo "🔧 Starting backend only..."
        cd backend
        python3 -m uvicorn app.main:app --reload --port 8000
        ;;

    frontend)
        echo "🎨 Starting frontend only..."
        cd frontend
        npm run dev
        ;;

    health)
        echo "❤️ Checking backend health..."
        curl -s http://localhost:8000/api/cyber-ace/health | python3 -m json.tool
        ;;

    chat)
        echo "💬 Testing chat endpoint..."
        curl -X POST http://localhost:8000/api/cyber-ace/chat \
            -H 'Content-Type: application/json' \
            -d '{"message":"Привіт!","user_id":"test","language":"uk"}' \
            | python3 -m json.tool
        ;;

    agents)
        echo "🤖 Getting agents list..."
        curl -s http://localhost:8000/api/cyber-ace/agents | python3 -m json.tool
        ;;

    docs)
        echo "📚 Opening API documentation..."
        open http://localhost:8000/docs 2>/dev/null || \
        xdg-open http://localhost:8000/docs 2>/dev/null || \
        echo "Please open http://localhost:8000/docs in your browser"
        ;;

    ui)
        echo "🌐 Opening CYBER-ACE UI..."
        open http://localhost:5173/cyber-ace 2>/dev/null || \
        xdg-open http://localhost:5173/cyber-ace 2>/dev/null || \
        echo "Please open http://localhost:5173/cyber-ace in your browser"
        ;;

    help|*)
        echo "🎯 CYBER-ACE Helper - Usage:"
        echo ""
        echo "  ./cyber-ace.sh <command>"
        echo ""
        echo "Commands:"
        echo "  start      - Start backend and frontend"
        echo "  stop       - Stop all services"
        echo "  restart    - Restart all services"
        echo "  status     - Check status of all services"
        echo "  test       - Run integration tests"
        echo "  logs       - Show backend logs"
        echo ""
        echo "  backend    - Start backend only"
        echo "  frontend   - Start frontend only"
        echo ""
        echo "  health     - Check backend health"
        echo "  chat       - Test chat endpoint"
        echo "  agents     - Get agents list"
        echo ""
        echo "  docs       - Open API documentation"
        echo "  ui         - Open CYBER-ACE UI"
        echo ""
        echo "Examples:"
        echo "  ./cyber-ace.sh start"
        echo "  ./cyber-ace.sh status"
        echo "  ./cyber-ace.sh test"
        echo "  ./cyber-ace.sh logs"
        echo ""
        ;;
esac
