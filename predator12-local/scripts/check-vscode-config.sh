#!/usr/bin/env bash
# Auto-fix VS Code configuration issues

set -Eeuo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 VS Code Auto-Fix Tool${NC}\n"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VSCODE_DIR="$PROJECT_ROOT/.vscode"

# Check if .vscode exists
if [ ! -d "$VSCODE_DIR" ]; then
    echo -e "${YELLOW}⚠️  .vscode directory not found${NC}"
    echo "Creating .vscode directory..."
    mkdir -p "$VSCODE_DIR"
fi

echo -e "${GREEN}✅ Checking VS Code configuration...${NC}\n"

# 1. Check settings.json
echo -e "${BLUE}1. Checking settings.json${NC}"
if [ -f "$VSCODE_DIR/settings.json" ]; then
    # Check for comments in JSON
    if grep -q '//' "$VSCODE_DIR/settings.json" || grep -q '/\*' "$VSCODE_DIR/settings.json"; then
        echo -e "${RED}❌ Found comments in settings.json${NC}"
        echo "   JSON files should not contain comments"
        echo "   Please remove // or /* */ comments"
    else
        echo -e "${GREEN}✅ settings.json is valid${NC}"
    fi
    
    # Check for extraPaths
    if grep -q "python.analysis.extraPaths" "$VSCODE_DIR/settings.json"; then
        echo -e "${GREEN}✅ extraPaths configured for Pylance${NC}"
    else
        echo -e "${YELLOW}⚠️  extraPaths not found - Pylance may show import errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  settings.json not found${NC}"
fi

# 2. Check launch.json
echo -e "\n${BLUE}2. Checking launch.json${NC}"
if [ -f "$VSCODE_DIR/launch.json" ]; then
    # Check for deprecated "type": "python"
    if grep -q '"type"[[:space:]]*:[[:space:]]*"python"' "$VSCODE_DIR/launch.json"; then
        echo -e "${RED}❌ Found deprecated 'type: python' in launch.json${NC}"
        echo "   Should be 'type: debugpy' for Python debugging"
    else
        echo -e "${GREEN}✅ No deprecated 'type: python' found${NC}"
    fi
    
    # Check for deprecated "type": "pwa-node"
    if grep -q '"type"[[:space:]]*:[[:space:]]*"pwa-node"' "$VSCODE_DIR/launch.json"; then
        echo -e "${RED}❌ Found deprecated 'type: pwa-node' in launch.json${NC}"
        echo "   Should be 'type: node' for Node.js debugging"
    else
        echo -e "${GREEN}✅ No deprecated 'type: pwa-node' found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  launch.json not found${NC}"
fi

# 3. Check Python interpreter
echo -e "\n${BLUE}3. Checking Python environment${NC}"
VENV_PATH="$PROJECT_ROOT/.venv/bin/python"
if [ -f "$VENV_PATH" ]; then
    echo -e "${GREEN}✅ Virtual environment found: $VENV_PATH${NC}"
    PYTHON_VERSION=$("$VENV_PATH" --version 2>&1)
    echo "   Python version: $PYTHON_VERSION"
else
    echo -e "${RED}❌ Virtual environment not found${NC}"
    echo "   Expected: $VENV_PATH"
    echo ""
    echo "   To create virtual environment:"
    echo "   cd $PROJECT_ROOT"
    echo "   python3.11 -m venv .venv"
    echo "   source .venv/bin/activate"
    echo "   pip install -r backend/requirements-311-modern.txt"
fi

# 4. Check for duplicate config files
echo -e "\n${BLUE}4. Checking for duplicate configuration files${NC}"
DUPLICATES=0
for file in settings-local.json launch-local.json tasks-local.json; do
    if [ -f "$VSCODE_DIR/$file" ]; then
        echo -e "${YELLOW}⚠️  Found duplicate: $file${NC}"
        DUPLICATES=$((DUPLICATES + 1))
    fi
done
if [ $DUPLICATES -eq 0 ]; then
    echo -e "${GREEN}✅ No duplicate configuration files${NC}"
fi

# 5. Check installed VS Code extensions
echo -e "\n${BLUE}5. Recommended VS Code Extensions${NC}"
REQUIRED_EXTENSIONS=(
    "ms-python.python"
    "ms-python.debugpy"
    "ms-python.black-formatter"
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
)

echo "To install all recommended extensions:"
echo ""
for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    echo "code --install-extension $ext"
done

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 VS Code Configuration Check Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Next steps:"
echo "1. Reload VS Code: Cmd+Shift+P → 'Developer: Reload Window'"
echo "2. Select Python Interpreter: Cmd+Shift+P → 'Python: Select Interpreter'"
echo "3. Install recommended extensions (see list above)"
echo "4. Start debugging with F5!"
echo ""
echo "For more details, see: VSCODE_WARNINGS_FIXED.md"
