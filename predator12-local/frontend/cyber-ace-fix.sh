#!/bin/bash

# 🚀 CYBER-ACE Quick Fix Script
# Швидке вирішення проблеми з білим екраном

echo "🤖 CYBER-ACE Quick Fix"
echo "======================"
echo ""

# 1. Перевірити що ми в правильній директорії
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from frontend directory"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# 2. Перевірити що модуль існує
if [ ! -d "src/modules/cyber-ace" ]; then
    echo "❌ Error: cyber-ace module not found"
    echo "Please ensure the module is created"
    exit 1
fi

echo "✅ Found cyber-ace module"
echo ""

# 3. Перевірити залежності
echo "📦 Checking dependencies..."
if npm list three @react-three/fiber @react-three/drei zustand framer-motion i18next react-i18next &>/dev/null; then
    echo "✅ All dependencies installed"
else
    echo "⚠️  Some dependencies missing"
    echo "Installing..."
    npm install --save three @react-three/fiber @react-three/drei zustand framer-motion i18next react-i18next
fi
echo ""

# 4. Очистити кеш
echo "🧹 Cleaning cache..."
rm -rf .vite
rm -rf node_modules/.vite
echo "✅ Cache cleared"
echo ""

# 5. Перевірити що dev server не запущений
echo "🔍 Checking if dev server is running..."
if lsof -ti:5173 &>/dev/null; then
    echo "⚠️  Dev server already running on port 5173"
    echo "Kill it with: kill -9 \$(lsof -ti:5173)"
else
    echo "✅ Port 5173 is free"
fi
echo ""

# 6. Вивести інструкції
echo "📋 Next Steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:5173"
echo "3. Navigate to CYBER-ACE in the menu"
echo "4. Check browser console (F12) for errors"
echo ""
echo "If white screen persists:"
echo "- Check browser console for errors"
echo "- Try using CyberAceTestPage instead"
echo "- See 🐛_CYBER_ACE_WHITE_SCREEN_FIX.md"
echo ""
echo "✅ Quick fix complete!"
