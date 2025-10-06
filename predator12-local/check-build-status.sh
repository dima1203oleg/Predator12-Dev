#!/bin/bash

echo "🔍 Checking build status..."
echo ""

cd /Users/dima/Documents/Predator12/predator12-local/frontend

# Check if dist exists
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    echo "✅ SUCCESS! dist folder exists and is not empty"
    echo ""
    echo "Build size:"
    du -sh dist
    echo ""
    echo "Contents:"
    ls -lh dist/ | head -10
    echo ""
    echo "🚀 Ready for Docker build!"
    echo ""
    echo "Next steps:"
    echo "  cd /Users/dima/Documents/Predator12/predator12-local"
    echo "  docker-compose build frontend"
    echo "  docker-compose up -d"
    exit 0
else
    echo "⏳ Build in progress or failed..."
    echo ""

    # Check for running processes
    if pgrep -f "npm run build" > /dev/null; then
        echo "📦 npm build is currently running"
        echo ""
    fi

    # Check latest errors
    LATEST_LOG=$(ls -t /tmp/build-iter-*.log 2>/dev/null | head -1)
    if [ -n "$LATEST_LOG" ]; then
        echo "📋 Latest build log: $LATEST_LOG"
        echo ""
        echo "Recent TS2590 errors:"
        grep "TS2590" "$LATEST_LOG" | head -5
        echo ""
        echo "Other errors:"
        grep -E "error TS" "$LATEST_LOG" | grep -v "TS2590" | head -5
    fi

    echo ""
    echo "💡 Tip: Run ./iterative-fix-ts2590.sh if not already running"
    exit 1
fi
