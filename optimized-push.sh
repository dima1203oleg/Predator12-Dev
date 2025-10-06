#!/bin/bash
# Push to GitHub with optimized settings

cd /Users/dima/Documents/Predator12

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🚀 OPTIMIZED GIT PUSH TO GITHUB 🚀               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Configure git for large pushes
echo "📝 Configuring git for large repository..."
git config http.postBuffer 524288000  # 500MB
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads 1
echo "✅ Git configured"
echo ""

# Check status
echo "📊 Repository status:"
git log --oneline origin/main..HEAD | wc -l | xargs echo "  Unpushed commits:"
du -sh .git | awk '{print "  Repository size: " $1}'
echo ""

# Try push with progress
echo "🚀 Attempting push (this may take 5-10 minutes)..."
echo "⏳ Please wait..."
echo ""

git push origin main --verbose 2>&1 | tee push.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                 ✅ PUSH SUCCESSFUL! ✅                       ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "🎉 All changes pushed to GitHub!"
  echo "🔗 Repository: https://github.com/dima1203oleg/Predator12-Dev.git"
  rm -f push.log
else
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                 ⚠️  PUSH FAILED ⚠️                          ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "❌ Error occurred during push"
  echo ""
  echo "📋 Possible solutions:"
  echo ""
  echo "1. Repository too large - use Git LFS:"
  echo "   git lfs install"
  echo "   git lfs track '*.xlsx'"
  echo "   git lfs track '*.zip'"
  echo ""
  echo "2. Split into smaller commits:"
  echo "   git rebase -i origin/main"
  echo ""
  echo "3. Force push (if safe):"
  echo "   git push origin main --force"
  echo ""
  echo "4. Clone fresh and copy files:"
  echo "   git clone <repo> predator12-fresh"
  echo "   cp -r predator12-local predator12-fresh/"
  echo ""
  echo "📄 Check push.log for details"
fi
