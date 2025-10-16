#!/bin/bash

# 🎨 Enhanced Nexus Core - Quick Launch Script
# Version 3.0 - Improved Design with Larger Icons

echo "🎨 =========================================="
echo "   NEXUS CORE V3 - ENHANCED DESIGN"
echo "   Larger Icons · Better Spacing · Cosmic FX"
echo "============================================"
echo ""

# Navigate to frontend
cd "$(dirname "$0")/predator12-local/frontend" || exit 1

echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  Installing dependencies..."
  npm install
fi

echo ""
echo "🚀 Starting Vite development server..."
echo ""
echo "📋 ENHANCED FEATURES:"
echo "   ✅ Metrics icons: 68px (was 50px)"
echo "   ✅ Service status dots: 14px (was 10px)"
echo "   ✅ Filter chips: 15px font (was 13px)"
echo "   ✅ Category titles: 24px (was 20px)"
echo "   ✅ Section icons: 38px (NEW!)"
echo "   ✅ Agent status: 32px (NEW!)"
echo "   ✅ Voice button: 80px (NEW!)"
echo "   ✅ 670 lines of cosmic effects"
echo ""
echo "🌐 Opening: http://localhost:5090"
echo "   Press Ctrl+C to stop"
echo ""

# Start vite
./node_modules/.bin/vite --port 5090 --host
