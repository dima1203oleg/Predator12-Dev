#!/bin/bash

# 🚀 Predator12 Dashboard - Quick Start Script

echo "🎉 Starting Predator12 Enhanced Dashboard..."
echo ""

# Check if we're in the right directory
if [ ! -d "predator12-local/frontend" ]; then
    echo "❌ Error: predator12-local/frontend directory not found!"
    echo "Please run this script from the Predator12 root directory."
    exit 1
fi

# Navigate to frontend
cd predator12-local/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔥 Launching development server..."
echo ""
echo "✨ Features:"
echo "  - 25+ Services monitoring"
echo "  - 37 AI Agents"
echo "  - 58 AI Models"
echo "  - Agent Progress Tracker (NEW!)"
echo "  - Voice Control Interface with STT/TTS engine selection"
echo "  - Real-time monitoring"
echo "  - 3D Neural Visualization"
echo ""
echo "🌐 Open browser at: http://localhost:5173"
echo ""

npm run dev
