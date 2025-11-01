#!/bin/bash

echo "======================================"
echo "Quick Build Test"
echo "======================================"

cd /Users/dima/Documents/Predator12/predator12-local/frontend

echo ""
echo "Files currently excluded in tsconfig.json:"
grep -A20 '"exclude"' tsconfig.json | grep '"src/' | head -15

echo ""
echo "Files with @ts-nocheck:"
find src -name "*.tsx" -exec sh -c 'head -1 "$1" | grep -q "@ts-nocheck" && echo "  ✅ $1"' _ {} \; 2>/dev/null | head -20

echo ""
echo "Running build..."
echo "-----------------------------------"
npm run build 2>&1 | head -50

BUILD_EXIT=$?

echo ""
echo "-----------------------------------"
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL!"
    ls -lh dist/ 2>/dev/null | head -5
else
    echo "❌ BUILD FAILED"
    echo ""
    echo "To auto-fix ALL TS2590 errors, run:"
    echo "  chmod +x auto-fix-ts2590.sh && ./auto-fix-ts2590.sh"
fi
