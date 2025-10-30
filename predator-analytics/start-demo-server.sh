#!/bin/bash

# Start a simple HTTP server to view the 3D Avatar demo

echo "🚀 Starting demo server..."
echo ""
echo "✨ Server will start on: http://localhost:8080"
echo ""
echo "📱 Open in your browser:"
echo "   👉 http://localhost:8080/demo-avatar.html"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Python HTTP server
python3 -m http.server 8080
