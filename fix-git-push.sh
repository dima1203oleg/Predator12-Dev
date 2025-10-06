#!/bin/bash
# Fix git push - remove large files

cd /Users/dima/Documents/Predator12

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       🔧 FIXING GIT PUSH - REMOVING LARGE FILES 🔧          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Reset last commit (keep changes)
echo "📦 Resetting last commit..."
git reset --soft HEAD~1
echo "✅ Commit reset"
echo ""

# Create .gitignore for large files
echo "📝 Creating .gitignore for large files..."
cat > .gitignore << 'EOF'
# Large files
*.xlsx
Predator11/ml/analytics/data/
Predator11/infra/terraform/.terraform/
.terraform/

# Build artifacts
node_modules/
dist/
build/
*.log
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

echo "✅ .gitignore created"
echo ""

# Remove large files from staging
echo "🗑️  Removing large files from staging..."
git reset HEAD Predator11/ml/analytics/data/ 2>/dev/null || true
git reset HEAD Predator11/infra/terraform/.terraform/ 2>/dev/null || true
git reset HEAD "Predator11/ml/analytics/data/Березень_2024.xlsx" 2>/dev/null || true
echo "✅ Large files removed from staging"
echo ""

# Add only important files
echo "📦 Adding files..."
git add .gitignore
git add predator12-local/
git add *.md
git add *.txt
git add *.sh
git add test_system.sh
git add git-*.sh
echo "✅ Files added"
echo ""

# Commit with clean message
echo "💾 Committing..."
git commit -m "Dashboard v2.0: All 25 services with categorization

Updates:
- Frontend: 10 to 25 services (+150%)
- Added 7 service categories with icons
- Production build deployed
- Complete documentation

Status: 25/25 services visible
Live: http://localhost:3000"

if [ $? -eq 0 ]; then
  echo "✅ Commit successful"
else
  echo "⚠️  Commit failed - checking status"
  git status --short | head -20
fi
echo ""

# Push
echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                  ✅ PUSH SUCCESSFUL! ✅                      ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
else
  echo ""
  echo "⚠️  Push failed. Manual steps:"
  echo "1. Check: git status"
  echo "2. View remote: git remote -v"
  echo "3. Try: git push origin main --force"
fi
