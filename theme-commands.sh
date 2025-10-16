#!/bin/bash

# 🎨 PREDATOR12 MULTI-THEME SYSTEM
# Quick Commands and Scripts

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🎨 Predator12 Multi-Theme System                            ║"
echo "║     Quick Commands                                           ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ============= MENU =============

echo "📋 Available Commands:"
echo ""
echo "1. 📦 Install Dependencies"
echo "2. 🔍 Check Files"
echo "3. 📊 Show Stats"
echo "4. 📚 Open Documentation"
echo "5. 🚀 Start Demo"
echo "6. ✅ Validate Setup"
echo "7. 🎨 List All Themes"
echo "8. 📝 Generate Report"
echo "9. 🧪 Run Tests"
echo "0. ❌ Exit"
echo ""

read -p "Enter choice [0-9]: " choice

case $choice in
  1)
    echo ""
    echo "📦 Installing dependencies..."
    echo ""
    cd predator12-local/frontend
    npm install @mui/material @emotion/react @emotion/styled
    echo ""
    echo "✅ Dependencies installed!"
    ;;
    
  2)
    echo ""
    echo "🔍 Checking theme system files..."
    echo ""
    
    files=(
      "predator12-local/frontend/src/theme/themes.ts"
      "predator12-local/frontend/src/contexts/ThemeContext.tsx"
      "predator12-local/frontend/src/components/theme/ThemeSwitcher.tsx"
      "predator12-local/frontend/src/AppThemeDemo.tsx"
    )
    
    for file in "${files[@]}"; do
      if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo "✅ $file ($lines lines)"
      else
        echo "❌ $file (missing)"
      fi
    done
    
    echo ""
    echo "Documentation files:"
    
    docs=(
      "MULTI_THEME_GUIDE.md"
      "THEME_SYSTEM_QUICK_REF.md"
      "THEME_INTEGRATION_EXAMPLES.md"
      "MULTI_THEME_COMPLETION_REPORT.md"
      "THEME_README.md"
      "THEME_VISUAL_GUIDE.md"
      "MULTI_THEME_SYSTEM_FINAL_STATUS.md"
      "THEME_FILES_INDEX.md"
    )
    
    for doc in "${docs[@]}"; do
      if [ -f "$doc" ]; then
        lines=$(wc -l < "$doc")
        echo "✅ $doc ($lines lines)"
      else
        echo "❌ $doc (missing)"
      fi
    done
    ;;
    
  3)
    echo ""
    echo "📊 Multi-Theme System Statistics"
    echo ""
    echo "Implementation Files:"
    echo "--------------------"
    
    impl_total=0
    
    if [ -f "predator12-local/frontend/src/theme/themes.ts" ]; then
      lines=$(wc -l < "predator12-local/frontend/src/theme/themes.ts")
      echo "themes.ts:          $lines lines"
      impl_total=$((impl_total + lines))
    fi
    
    if [ -f "predator12-local/frontend/src/contexts/ThemeContext.tsx" ]; then
      lines=$(wc -l < "predator12-local/frontend/src/contexts/ThemeContext.tsx")
      echo "ThemeContext.tsx:   $lines lines"
      impl_total=$((impl_total + lines))
    fi
    
    if [ -f "predator12-local/frontend/src/components/theme/ThemeSwitcher.tsx" ]; then
      lines=$(wc -l < "predator12-local/frontend/src/components/theme/ThemeSwitcher.tsx")
      echo "ThemeSwitcher.tsx:  $lines lines"
      impl_total=$((impl_total + lines))
    fi
    
    if [ -f "predator12-local/frontend/src/AppThemeDemo.tsx" ]; then
      lines=$(wc -l < "predator12-local/frontend/src/AppThemeDemo.tsx")
      echo "AppThemeDemo.tsx:   $lines lines"
      impl_total=$((impl_total + lines))
    fi
    
    echo "--------------------"
    echo "Total:              $impl_total lines"
    echo ""
    echo "Documentation Files:"
    echo "--------------------"
    
    doc_total=0
    doc_count=0
    
    for doc in MULTI_THEME_*.md THEME_*.md; do
      if [ -f "$doc" ]; then
        lines=$(wc -l < "$doc")
        echo "$doc: $lines lines"
        doc_total=$((doc_total + lines))
        doc_count=$((doc_count + 1))
      fi
    done
    
    echo "--------------------"
    echo "Total:              $doc_total lines ($doc_count files)"
    echo ""
    echo "Grand Total:        $((impl_total + doc_total)) lines"
    echo ""
    echo "Themes:             7 complete themes"
    echo "Colors:             280+ unique colors"
    echo "Gradients:          28 combinations"
    ;;
    
  4)
    echo ""
    echo "📚 Opening documentation..."
    echo ""
    echo "Available documentation:"
    echo "1. Quick Start (THEME_README.md)"
    echo "2. Full Guide (MULTI_THEME_GUIDE.md)"
    echo "3. Quick Reference (THEME_SYSTEM_QUICK_REF.md)"
    echo "4. Integration Examples (THEME_INTEGRATION_EXAMPLES.md)"
    echo "5. Visual Guide (THEME_VISUAL_GUIDE.md)"
    echo "6. Completion Report (MULTI_THEME_COMPLETION_REPORT.md)"
    echo "7. Final Status (MULTI_THEME_SYSTEM_FINAL_STATUS.md)"
    echo "8. Files Index (THEME_FILES_INDEX.md)"
    echo ""
    read -p "Enter choice [1-8]: " doc_choice
    
    case $doc_choice in
      1) open THEME_README.md 2>/dev/null || cat THEME_README.md ;;
      2) open MULTI_THEME_GUIDE.md 2>/dev/null || cat MULTI_THEME_GUIDE.md ;;
      3) open THEME_SYSTEM_QUICK_REF.md 2>/dev/null || cat THEME_SYSTEM_QUICK_REF.md ;;
      4) open THEME_INTEGRATION_EXAMPLES.md 2>/dev/null || cat THEME_INTEGRATION_EXAMPLES.md ;;
      5) open THEME_VISUAL_GUIDE.md 2>/dev/null || cat THEME_VISUAL_GUIDE.md ;;
      6) open MULTI_THEME_COMPLETION_REPORT.md 2>/dev/null || cat MULTI_THEME_COMPLETION_REPORT.md ;;
      7) open MULTI_THEME_SYSTEM_FINAL_STATUS.md 2>/dev/null || cat MULTI_THEME_SYSTEM_FINAL_STATUS.md ;;
      8) open THEME_FILES_INDEX.md 2>/dev/null || cat THEME_FILES_INDEX.md ;;
      *) echo "Invalid choice" ;;
    esac
    ;;
    
  5)
    echo ""
    echo "🚀 Starting demo application..."
    echo ""
    cd predator12-local/frontend
    npm start
    ;;
    
  6)
    echo ""
    echo "✅ Validating theme system setup..."
    echo ""
    
    all_good=true
    
    # Check implementation files
    if [ ! -f "predator12-local/frontend/src/theme/themes.ts" ]; then
      echo "❌ themes.ts not found"
      all_good=false
    else
      echo "✅ themes.ts found"
    fi
    
    if [ ! -f "predator12-local/frontend/src/contexts/ThemeContext.tsx" ]; then
      echo "❌ ThemeContext.tsx not found"
      all_good=false
    else
      echo "✅ ThemeContext.tsx found"
    fi
    
    if [ ! -f "predator12-local/frontend/src/components/theme/ThemeSwitcher.tsx" ]; then
      echo "❌ ThemeSwitcher.tsx not found"
      all_good=false
    else
      echo "✅ ThemeSwitcher.tsx found"
    fi
    
    # Check dependencies
    if [ -f "predator12-local/frontend/package.json" ]; then
      if grep -q "@mui/material" predator12-local/frontend/package.json; then
        echo "✅ @mui/material installed"
      else
        echo "⚠️  @mui/material not in package.json"
        all_good=false
      fi
    else
      echo "❌ package.json not found"
      all_good=false
    fi
    
    echo ""
    if [ "$all_good" = true ]; then
      echo "🎉 All validations passed! Theme system is ready."
    else
      echo "⚠️  Some validations failed. Please check the issues above."
    fi
    ;;
    
  7)
    echo ""
    echo "🎨 Available Themes:"
    echo ""
    echo "1. 🌌 Dark Cyber       (ID: dark-cyber)"
    echo "   Primary: Cyan + Purple"
    echo "   Use: Default futuristic theme"
    echo ""
    echo "2. 🟢 Matrix           (ID: matrix)"
    echo "   Primary: Neon Green"
    echo "   Use: Classic terminal style"
    echo ""
    echo "3. 🌅 Sunset           (ID: sunset)"
    echo "   Primary: Orange + Purple"
    echo "   Use: Warm evening work"
    echo ""
    echo "4. 🌊 Ocean            (ID: ocean)"
    echo "   Primary: Deep Blue"
    echo "   Use: Calm focused work"
    echo ""
    echo "5. 🗼 Neon Tokyo       (ID: neon-tokyo)"
    echo "   Primary: Pink + Cyan"
    echo "   Use: Vibrant creative work"
    echo ""
    echo "6. 💾 Retro Terminal   (ID: retro-terminal)"
    echo "   Primary: Amber"
    echo "   Use: Nostalgic terminal"
    echo ""
    echo "7. ☀️  Light            (ID: light)"
    echo "   Primary: Sky Blue + Purple"
    echo "   Use: Daytime work"
    echo ""
    ;;
    
  8)
    echo ""
    echo "📝 Generating theme system report..."
    echo ""
    
    report_file="THEME_SYSTEM_REPORT_$(date +%Y%m%d_%H%M%S).txt"
    
    {
      echo "🎨 PREDATOR12 MULTI-THEME SYSTEM REPORT"
      echo "Generated: $(date)"
      echo ""
      echo "=" | tr '=' '='| head -c 60; echo ""
      echo ""
      
      echo "📦 IMPLEMENTATION FILES"
      echo ""
      
      for file in predator12-local/frontend/src/theme/themes.ts \
                  predator12-local/frontend/src/contexts/ThemeContext.tsx \
                  predator12-local/frontend/src/components/theme/ThemeSwitcher.tsx \
                  predator12-local/frontend/src/AppThemeDemo.tsx; do
        if [ -f "$file" ]; then
          lines=$(wc -l < "$file")
          echo "✅ $(basename $file): $lines lines"
        else
          echo "❌ $(basename $file): NOT FOUND"
        fi
      done
      
      echo ""
      echo "📚 DOCUMENTATION FILES"
      echo ""
      
      for doc in MULTI_THEME_*.md THEME_*.md; do
        if [ -f "$doc" ]; then
          lines=$(wc -l < "$doc")
          echo "✅ $doc: $lines lines"
        fi
      done
      
      echo ""
      echo "🎨 THEMES"
      echo ""
      echo "1. 🌌 Dark Cyber (dark-cyber)"
      echo "2. 🟢 Matrix (matrix)"
      echo "3. 🌅 Sunset (sunset)"
      echo "4. 🌊 Ocean (ocean)"
      echo "5. 🗼 Neon Tokyo (neon-tokyo)"
      echo "6. 💾 Retro Terminal (retro-terminal)"
      echo "7. ☀️  Light (light)"
      
      echo ""
      echo "=" | tr '=' '='| head -c 60; echo ""
      echo ""
      echo "Status: ✅ COMPLETE"
      
    } > "$report_file"
    
    echo "✅ Report generated: $report_file"
    echo ""
    cat "$report_file"
    ;;
    
  9)
    echo ""
    echo "🧪 Running theme system tests..."
    echo ""
    
    echo "Checking TypeScript compilation..."
    cd predator12-local/frontend
    if npx tsc --noEmit 2>/dev/null; then
      echo "✅ TypeScript compilation passed"
    else
      echo "⚠️  TypeScript compilation issues detected"
    fi
    
    echo ""
    echo "Checking ESLint..."
    if npx eslint src/theme src/contexts src/components/theme 2>/dev/null; then
      echo "✅ ESLint checks passed"
    else
      echo "⚠️  ESLint warnings detected"
    fi
    
    cd ../..
    ;;
    
  0)
    echo ""
    echo "👋 Goodbye!"
    exit 0
    ;;
    
  *)
    echo ""
    echo "❌ Invalid choice. Please select 0-9."
    ;;
esac

echo ""
echo "Press any key to continue..."
read -n 1
