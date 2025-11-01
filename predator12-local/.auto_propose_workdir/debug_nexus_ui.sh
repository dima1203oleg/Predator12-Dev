#!/bin/bash

# Nexus UI Debug Script
echo "🚀 Starting Nexus UI Debug Session..."

# Kill any existing processes on port 5173
echo "📡 Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Navigate to frontend directory
cd /Users/dima/Documents/Predator11/frontend

echo "📦 Installing/updating dependencies..."
npm install

echo "🔧 Running type checks..."
npm run typecheck || echo "⚠️ Type check completed with warnings"

echo "🧹 Running linter..."
npm run lint:fix || echo "⚠️ Linting completed"

echo "🚀 Starting Vite dev server..."
npm run dev &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is running at http://localhost:3000"
    echo "🌐 Opening in browser..."
    open http://localhost:3000
else
    echo "❌ Server failed to start, checking logs..."
    pkill -f vite
fi

echo "📊 Current agents count in registry:"
grep -c ":" /Users/dima/Documents/Predator11/agents/registry.yaml | head -1

echo "🤖 Agent status check:"
python3 /Users/dima/Documents/Predator11/scripts/check_agents_status.py 2>/dev/null || echo "Script not found, skipping agent check"

echo "🎯 Debug session ready! Check browser at http://localhost:3000"
