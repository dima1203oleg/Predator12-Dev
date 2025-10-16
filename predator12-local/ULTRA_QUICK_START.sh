#!/bin/bash

# 🚀 CYBER-ACE ULTRA QUICK START
# Запуск за 10 секунд!

echo "🚀 CYBER-ACE ULTRA QUICK START"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Перевірка директорії
if [ ! -d "/Users/dima/Documents/Predator12/predator12-local" ]; then
    echo "❌ Помилка: Директорія не знайдена!"
    exit 1
fi

cd /Users/dima/Documents/Predator12/predator12-local

# Статус
echo "📊 Статус:"
./cyber-ace.sh status 2>/dev/null || echo "⚠️  Скрипти потребують chmod +x"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Інструкції
echo "⚡ ШВИДКІ КОМАНДИ:"
echo ""
echo "1️⃣  Встановити залежності (перший раз):"
echo "   chmod +x *.sh && ./cyber-ace-install.sh"
echo ""
echo "2️⃣  Запустити backend:"
echo "   ./cyber-ace.sh start"
echo ""
echo "3️⃣  Запустити frontend (новий terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4️⃣  Відкрити UI:"
echo "   open http://localhost:5173/cyber-ace"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Документація:"
echo "   cat CYBER_ACE_README.md"
echo "   cat 📚_CYBER_ACE_DOCS_INDEX.md"
echo ""
echo "🆘 Допомога:"
echo "   ./cyber-ace.sh help"
echo ""
echo "🎉 Готово!"
