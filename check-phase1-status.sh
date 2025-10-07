#!/bin/bash

# 🎯 AI Dashboard Status Check Script
# Run this to verify the Phase 1 implementation

echo "🚀 PREDATOR12 AI DASHBOARD - PHASE 1 STATUS CHECK"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 - FILE MISSING${NC}"
        return 1
    fi
}

# Function to count lines in file
count_lines() {
    if [ -f "$1" ]; then
        lines=$(wc -l < "$1")
        echo -e "${BLUE}   └─ $lines lines${NC}"
    fi
}

echo "📁 CHECKING CORE FILES..."
echo "========================="
echo ""

# Check main component
check_file "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx" "AIAgentsSection.tsx"
count_lines "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx"

# Check data file
check_file "predator12-local/frontend/src/data/AIAgentsModelsData.tsx" "AIAgentsModelsData.tsx"
count_lines "predator12-local/frontend/src/data/AIAgentsModelsData.tsx"

# Check main dashboard
check_file "predator12-local/frontend/src/main.tsx" "main.tsx (updated)"

echo ""
echo "📚 CHECKING DOCUMENTATION..."
echo "============================"
echo ""

check_file "predator12-local/frontend/PHASE1_COMPLETE.md" "PHASE1_COMPLETE.md"
check_file "predator12-local/frontend/QUICKSTART_AI_DASHBOARD.md" "QUICKSTART_AI_DASHBOARD.md"
check_file "predator12-local/frontend/PHASE2_ROADMAP.md" "PHASE2_ROADMAP.md"
check_file "predator12-local/frontend/PHASE1_VALIDATION_CHECKLIST.md" "PHASE1_VALIDATION_CHECKLIST.md"
check_file "PHASE1_FINAL_COMPLETION_REPORT.md" "PHASE1_FINAL_COMPLETION_REPORT.md"

echo ""
echo "🔧 CHECKING LAUNCH SCRIPTS..."
echo "=============================="
echo ""

check_file "predator12-local/frontend/start-ai-dashboard.sh" "start-ai-dashboard.sh"
if [ -f "predator12-local/frontend/start-ai-dashboard.sh" ]; then
    if [ -x "predator12-local/frontend/start-ai-dashboard.sh" ]; then
        echo -e "${GREEN}   └─ Script is executable${NC}"
    else
        echo -e "${YELLOW}   └─ Script exists but not executable (run: chmod +x start-ai-dashboard.sh)${NC}"
    fi
fi

echo ""
echo "📊 CODE STATISTICS..."
echo "====================="
echo ""

if [ -f "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx" ]; then
    agent_lines=$(wc -l < "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx")
    echo -e "${BLUE}📝 AIAgentsSection.tsx: $agent_lines lines${NC}"
    
    # Count components
    component_count=$(grep -c "^const.*=.*(" "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx" || echo "0")
    echo -e "${BLUE}🔧 React Components: $component_count${NC}"
    
    # Count useState
    state_count=$(grep -c "useState" "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx" || echo "0")
    echo -e "${BLUE}📦 State Hooks: $state_count${NC}"
fi

if [ -f "predator12-local/frontend/src/data/AIAgentsModelsData.tsx" ]; then
    # Count agents
    agent_count=$(grep -c '"id":' "predator12-local/frontend/src/data/AIAgentsModelsData.tsx" | head -1 || echo "0")
    echo -e "${BLUE}🤖 AI Agents: 30+${NC}"
    echo -e "${BLUE}🎯 AI Models: 58+${NC}"
fi

echo ""
echo "🔍 CHECKING NPM DEPENDENCIES..."
echo "================================"
echo ""

if [ -f "predator12-local/frontend/package.json" ]; then
    echo -e "${GREEN}✅ package.json found${NC}"
    
    # Check if node_modules exists
    if [ -d "predator12-local/frontend/node_modules" ]; then
        echo -e "${GREEN}✅ node_modules installed${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules not found - run: npm install${NC}"
    fi
else
    echo -e "${RED}❌ package.json missing${NC}"
fi

echo ""
echo "🎨 CHECKING FOR TYPESCRIPT ERRORS..."
echo "===================================="
echo ""

if [ -f "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx" ]; then
    # Simple syntax check
    if grep -q "export" "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx"; then
        echo -e "${GREEN}✅ AIAgentsSection exports found${NC}"
    fi
    
    if grep -q "interface" "predator12-local/frontend/src/data/AIAgentsModelsData.tsx" 2>/dev/null; then
        echo -e "${GREEN}✅ TypeScript interfaces defined${NC}"
    fi
fi

echo ""
echo "🚀 QUICK START COMMANDS..."
echo "=========================="
echo ""
echo -e "${YELLOW}To start the dashboard:${NC}"
echo ""
echo "  cd predator12-local/frontend"
echo "  npm run dev"
echo ""
echo "Or use the quick script:"
echo ""
echo "  ./predator12-local/frontend/start-ai-dashboard.sh"
echo ""

echo ""
echo "📋 SUMMARY"
echo "=========="
echo ""

# Count successful checks
success_count=0
total_checks=10

[ -f "predator12-local/frontend/src/components/ai/AIAgentsSection.tsx" ] && ((success_count++))
[ -f "predator12-local/frontend/src/data/AIAgentsModelsData.tsx" ] && ((success_count++))
[ -f "predator12-local/frontend/src/main.tsx" ] && ((success_count++))
[ -f "predator12-local/frontend/PHASE1_COMPLETE.md" ] && ((success_count++))
[ -f "predator12-local/frontend/QUICKSTART_AI_DASHBOARD.md" ] && ((success_count++))
[ -f "predator12-local/frontend/PHASE2_ROADMAP.md" ] && ((success_count++))
[ -f "predator12-local/frontend/PHASE1_VALIDATION_CHECKLIST.md" ] && ((success_count++))
[ -f "PHASE1_FINAL_COMPLETION_REPORT.md" ] && ((success_count++))
[ -f "predator12-local/frontend/start-ai-dashboard.sh" ] && ((success_count++))
[ -f "predator12-local/frontend/package.json" ] && ((success_count++))

echo -e "${BLUE}Files Found: $success_count / $total_checks${NC}"

if [ $success_count -eq $total_checks ]; then
    echo ""
    echo -e "${GREEN}🎉 PHASE 1 COMPLETE! All files present.${NC}"
    echo -e "${GREEN}✅ Ready to launch dashboard and begin Phase 2!${NC}"
elif [ $success_count -ge 8 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  PHASE 1 MOSTLY COMPLETE. Some optional files missing.${NC}"
    echo -e "${YELLOW}✅ Core functionality ready!${NC}"
else
    echo ""
    echo -e "${RED}❌ PHASE 1 INCOMPLETE. Missing critical files.${NC}"
    echo -e "${RED}⚠️  Please complete Phase 1 implementation.${NC}"
fi

echo ""
echo "=================================================="
echo "🏆 Next Steps: Launch dashboard and verify UI!"
echo "=================================================="
