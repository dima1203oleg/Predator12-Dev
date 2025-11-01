#!/bin/bash

# Master build and deploy script
# Fixes TypeScript errors and deploys to Docker

set -e  # Exit on error

FRONTEND_DIR="/Users/dima/Documents/Predator12/predator12-local/frontend"
PROJECT_DIR="/Users/dima/Documents/Predator12/predator12-local"

echo "=========================================="
echo "🚀 Predator12 Frontend - Build & Deploy"
echo "=========================================="
echo ""

# Step 1: Check current state
echo "📋 Step 1: Checking current state..."
cd "$FRONTEND_DIR"

if [ -d "dist" ]; then
    echo "  ⚠️  Old dist folder found, cleaning..."
    rm -rf dist
fi

# Step 2: Try building
echo ""
echo "🔨 Step 2: Attempting build..."
echo "-----------------------------------"

if npm run build 2>&1 | tee /tmp/build-output.log; then
    echo ""
    echo "✅ Build succeeded on first try!"
    BUILD_SUCCESS=true
else
    echo ""
    echo "❌ Build failed. Checking for TS2590 errors..."

    # Check if it's a TS2590 error
    if grep -q "TS2590" /tmp/build-output.log; then
        echo "  ⚠️  Found TS2590 errors (complex union types)"
        echo ""
        echo "🔧 Step 3: Running auto-fix script..."
        echo "-----------------------------------"
        cd "$PROJECT_DIR"

        if [ -f "auto-fix-ts2590.sh" ]; then
            ./auto-fix-ts2590.sh
            BUILD_SUCCESS=$?
        else
            echo "  ❌ Auto-fix script not found!"
            BUILD_SUCCESS=1
        fi
    else
        echo "  ❌ Build failed with non-TS2590 errors"
        echo ""
        echo "Common errors in build output:"
        grep -E "error TS[0-9]+:" /tmp/build-output.log | head -10
        BUILD_SUCCESS=1
    fi
fi

# Step 3: Verify build
echo ""
echo "📦 Step 4: Verifying build..."
cd "$FRONTEND_DIR"

if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    echo "  ✅ dist folder created successfully"
    echo "  📊 Build size: $(du -sh dist | cut -f1)"
    echo ""

    # Step 4: Docker build
    echo "🐳 Step 5: Building Docker image..."
    echo "-----------------------------------"
    cd "$PROJECT_DIR"

    if docker-compose build frontend; then
        echo ""
        echo "✅ Docker image built successfully!"
        echo ""

        # Step 5: Start services
        echo "🚀 Step 6: Starting services..."
        echo "-----------------------------------"

        if docker-compose up -d; then
            echo ""
            echo "=========================================="
            echo "✅ DEPLOYMENT SUCCESSFUL!"
            echo "=========================================="
            echo ""
            echo "Services status:"
            docker-compose ps
            echo ""
            echo "🌐 Frontend: http://localhost:3000"
            echo "🔧 Backend: http://localhost:8000"
            echo ""
            echo "📝 View logs:"
            echo "  docker-compose logs -f frontend"
            echo "  docker-compose logs -f backend"
            echo ""
            echo "🛑 Stop services:"
            echo "  docker-compose down"
        else
            echo "❌ Failed to start services"
            exit 1
        fi
    else
        echo "❌ Docker build failed"
        echo ""
        echo "Troubleshooting:"
        echo "1. Check if Docker is running"
        echo "2. Check Docker logs for errors"
        echo "3. Try: docker-compose build --no-cache frontend"
        exit 1
    fi
else
    echo "❌ Build verification failed - dist folder missing or empty"
    exit 1
fi
