#!/bin/bash

# 🚀 MEGA Dashboard - Quick Rebuild Script
# Автоматична перебудова та деплой нового UI

set -e

echo "🎨 MEGA DASHBOARD - REBUILD & DEPLOY"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify files
echo -e "${BLUE}📁 Step 1: Verifying files...${NC}"
cd /Users/dima/Documents/Predator12/predator12-local/frontend

if [ ! -f "src/main-mega.tsx" ]; then
    echo -e "${YELLOW}⚠️  main-mega.tsx not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Files verified${NC}"
echo ""

# Step 2: Activate MEGA version
echo -e "${BLUE}🔄 Step 2: Activating MEGA Dashboard...${NC}"
cp src/main.tsx src/main-backup-v3.tsx 2>/dev/null || true
cp src/main-mega.tsx src/main.tsx
echo -e "${GREEN}✅ MEGA Dashboard activated${NC}"
echo ""

# Step 3: Clean old build
echo -e "${BLUE}🧹 Step 3: Cleaning old build...${NC}"
rm -rf dist/
echo -e "${GREEN}✅ Old build cleaned${NC}"
echo ""

# Step 4: Build frontend
echo -e "${BLUE}🏗️  Step 4: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 5: Verify build
echo -e "${BLUE}🔍 Step 5: Verifying build...${NC}"
if [ -f "dist/index.html" ]; then
    SIZE=$(du -sh dist/ | cut -f1)
    echo -e "${GREEN}✅ Build verified (size: $SIZE)${NC}"
else
    echo -e "${YELLOW}⚠️  Build verification failed${NC}"
    exit 1
fi
echo ""

# Step 6: Rebuild Docker image
echo -e "${BLUE}🐳 Step 6: Rebuilding Docker image...${NC}"
cd /Users/dima/Documents/Predator12
docker-compose build frontend --no-cache
echo -e "${GREEN}✅ Docker image rebuilt${NC}"
echo ""

# Step 7: Restart container
echo -e "${BLUE}🔄 Step 7: Restarting container...${NC}"
docker-compose up -d frontend
sleep 3
echo -e "${GREEN}✅ Container restarted${NC}"
echo ""

# Step 8: Health check
echo -e "${BLUE}🏥 Step 8: Running health check...${NC}"
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' predator12-frontend 2>/dev/null || echo "no-health")
STATUS=$(docker inspect --format='{{.State.Status}}' predator12-frontend 2>/dev/null || echo "unknown")

echo "Container status: $STATUS"
echo "Health status: $HEALTH"
echo ""

# Step 9: Test endpoint
echo -e "${BLUE}🌐 Step 9: Testing endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend returned HTTP $HTTP_CODE${NC}"
fi
echo ""

# Final summary
echo "=================================="
echo -e "${GREEN}🎉 MEGA DASHBOARD DEPLOYED!${NC}"
echo "=================================="
echo ""
echo "📊 Access Dashboard:"
echo "   → http://localhost:3000"
echo ""
echo "🐳 Docker Status:"
echo "   → Container: $STATUS"
echo "   → Health: $HEALTH"
echo ""
echo "📝 Next Steps:"
echo "   1. Open http://localhost:3000 in browser"
echo "   2. Verify all animations working"
echo "   3. Check real-time updates"
echo "   4. Test responsive design"
echo ""
echo -e "${BLUE}💡 Tip: Check logs with:${NC}"
echo "   docker logs predator12-frontend -f"
echo ""
