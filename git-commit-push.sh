#!/bin/bash
# Git commit and push script for Predator12

cd /Users/dima/Documents/Predator12

echo "========================================"
echo "Git Commit & Push - Predator12"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
  echo "⚠️  Git repository not initialized"
  echo "Initializing..."
  git init
  git branch -M main
  echo "✅ Git initialized"
  echo ""
fi

# Add all files
echo "📦 Adding all files..."
git add .
echo "✅ Files added"
echo ""

# Commit
echo "💾 Committing changes..."
git commit -m "Dashboard v2.0: All 25 services with categorization

Major updates:
- Expanded from 10 to 25 services
- Added 7 service categories
- Created CategoryHeader component
- Updated UI badges and counters
- Complete documentation

Services: 25 total, 24 online, 1 warning
Live at: http://localhost:3000"

if [ $? -eq 0 ]; then
  echo "✅ Commit successful"
else
  echo "⚠️  Commit failed or no changes"
fi
echo ""

# Push to remote (if configured)
echo "🚀 Pushing to remote..."
git push origin main 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Push successful!"
else
  echo "⚠️  Push failed - check remote configuration"
  echo ""
  echo "To configure remote, run:"
  echo "  git remote add origin <your-repo-url>"
fi

echo ""
echo "========================================"
echo "✅ Done!"
echo "========================================"
