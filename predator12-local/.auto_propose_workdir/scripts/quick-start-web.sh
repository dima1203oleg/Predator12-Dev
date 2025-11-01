#!/bin/bash

# 🚀 Quick Start Script - Test Web Interface
# Uses simplified component to verify React rendering

echo "🚀 Starting Predator Analytics - Simple Test Mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/../frontend" || exit 1

# Kill existing process
echo "🔪 Killing existing Vite processes..."
pkill -f "vite" 2>/dev/null || true
sleep 1

# Clear cache
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

# Start Vite
echo "🚀 Starting Vite on port 5090..."
echo ""
echo "✅ Opening http://localhost:5090"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start in background
npx vite --port 5090 --host &
VITE_PID=$!

# Wait for server to start
sleep 3

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:5090
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5090
fi

echo ""
echo "✅ Server started! PID: $VITE_PID"
echo "🌐 Access at: http://localhost:5090"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Wait for process
wait $VITE_PID
