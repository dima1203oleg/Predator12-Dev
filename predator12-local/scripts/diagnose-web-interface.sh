#!/bin/bash

# 🔍 Predator Analytics - Web Interface Diagnostics
# Comprehensive health check and troubleshooting

echo "🔍 Predator Analytics - Web Interface Diagnostics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check port status
echo ""
echo -e "${BLUE}1️⃣  Checking Port 5090...${NC}"
if lsof -Pi :5090 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Port 5090 is in use${NC}"
    lsof -i :5090 | head -5
else
    echo -e "${RED}❌ Port 5090 is free (server not running)${NC}"
fi

# 2. Test HTTP connection
echo ""
echo -e "${BLUE}2️⃣  Testing HTTP Connection...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5090 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK - Server is responding${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ Connection refused - Server not running${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE - Unexpected response${NC}"
fi

# 3. Check Node.js process
echo ""
echo -e "${BLUE}3️⃣  Checking Node.js/Vite Processes...${NC}"
NODE_PROCS=$(ps aux | grep -E "node.*vite|vite.*5090" | grep -v grep)
if [ -n "$NODE_PROCS" ]; then
    echo -e "${GREEN}✅ Vite process found:${NC}"
    echo "$NODE_PROCS"
else
    echo -e "${RED}❌ No Vite process found${NC}"
fi

# 4. Check frontend directory
echo ""
echo -e "${BLUE}4️⃣  Checking Frontend Directory...${NC}"
FRONTEND_DIR="/Users/dima/Documents/Predator11/frontend"
if [ -d "$FRONTEND_DIR" ]; then
    echo -e "${GREEN}✅ Frontend directory exists${NC}"
    
    if [ -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${GREEN}✅ node_modules exists${NC}"
    else
        echo -e "${RED}❌ node_modules not found${NC}"
    fi
    
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        echo -e "${GREEN}✅ package.json exists${NC}"
    else
        echo -e "${RED}❌ package.json not found${NC}"
    fi
    
    if [ -f "$FRONTEND_DIR/vite.config.ts" ]; then
        echo -e "${GREEN}✅ vite.config.ts exists${NC}"
    else
        echo -e "${RED}❌ vite.config.ts not found${NC}"
    fi
else
    echo -e "${RED}❌ Frontend directory not found${NC}"
fi

# 5. Check TypeScript compilation
echo ""
echo -e "${BLUE}5️⃣  Checking TypeScript Compilation...${NC}"
cd "$FRONTEND_DIR" || exit 1
echo -e "${YELLOW}Running type check (this may take a moment)...${NC}"
npx tsc --noEmit 2>&1 | head -20

# 6. Check for conflicting .js files
echo ""
echo -e "${BLUE}6️⃣  Checking for Conflicting .js Files...${NC}"
JS_COUNT=$(find "$FRONTEND_DIR/src" -name "*.js" -type f | wc -l)
if [ "$JS_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $JS_COUNT .js files in src/ (should be .tsx)${NC}"
    echo "Sample files:"
    find "$FRONTEND_DIR/src" -name "*.js" -type f | head -5
else
    echo -e "${GREEN}✅ No conflicting .js files found${NC}"
fi

# 7. Check browser console errors
echo ""
echo -e "${BLUE}7️⃣  Suggested Actions:${NC}"
echo "1. Open http://localhost:5090 in browser"
echo "2. Press F12 to open DevTools"
echo "3. Check Console tab for errors"
echo "4. Check Network tab for failed requests"

# 8. Quick fixes
echo ""
echo -e "${BLUE}8️⃣  Quick Fixes:${NC}"
echo -e "${YELLOW}To restart server:${NC}"
echo "  ./scripts/start-web-interface.sh"
echo ""
echo -e "${YELLOW}To clear cache and restart:${NC}"
echo "  cd frontend && rm -rf node_modules/.vite dist && npm run dev"
echo ""
echo -e "${YELLOW}To reinstall dependencies:${NC}"
echo "  cd frontend && rm -rf node_modules && npm install"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Diagnostics complete!${NC}"
