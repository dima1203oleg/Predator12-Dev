#!/bin/bash

# 📚 Швидкий перегляд документації голосового інтерфейсу

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        📚 ДОКУМЕНТАЦІЯ ГОЛОСОВОГО ІНТЕРФЕЙСУ 📚            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📖 Доступна документація:"
echo ""
echo "  🚀 ШВИДКИЙ СТАРТ"
echo "  1. 📖_VOICE_INTERFACE_MAIN_README.md    - Головний README"
echo "  2. 🎤_VOICE_INTERFACE_QUICKSTART.md     - Швидкий старт"
echo "  3. 🚀_LAUNCH_VOICE_INTERFACE.sh         - Автозапуск"
echo ""
echo "  📖 ТЕХНІЧНА ДОКУМЕНТАЦІЯ"
echo "  4. 🎤_VOICE_INTERFACE_TECH_SPEC.md      - Технічна специфікація"
echo "  5. 🎤_VOICE_INTERFACE_README.md         - Детальний README"
echo "  6. 🎤_VOICE_INTERFACE_INDEX.md          - Індекс документів"
echo ""
echo "  ✅ ТЕСТУВАННЯ"
echo "  7. 🎤_VOICE_INTERFACE_VALIDATION_CHECKLIST.md - Чеклист"
echo "  8. 🎤_VOICE_INTERFACE_DEMO.sh           - Демо скрипт"
echo ""
echo "  📊 ЗВІТИ"
echo "  9. 🎤_VOICE_INTERFACE_COMPLETION_REPORT.md - Звіт завершення"
echo " 10. 🎉_VOICE_INTERFACE_COMPLETE_FINAL.md - Фінальний звіт"
echo " 11. 🎤_VOICE_INTERFACE_PROJECT_SUMMARY.md - Підсумок"
echo ""
echo "  🎨 ВІЗУАЛЬНІ МАТЕРІАЛИ"
echo " 12. 🎤_VOICE_INTERFACE_VISUAL_SUMMARY.md - Візуальний summary"
echo " 13. 🎊_VOICE_SUCCESS_CELEBRATION.txt     - Святкування"
echo ""
echo "  📄 СПИСКИ"
echo " 14. 🎤_VOICE_INTERFACE_DOCUMENTS_LIST.md - Список документів"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Виберіть документ для перегляду (1-14) або 'q' для виходу  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

read -p "Ваш вибір: " choice

case $choice in
    1)
        less "📖_VOICE_INTERFACE_MAIN_README.md" || cat "📖_VOICE_INTERFACE_MAIN_README.md"
        ;;
    2)
        less "🎤_VOICE_INTERFACE_QUICKSTART.md" || cat "🎤_VOICE_INTERFACE_QUICKSTART.md"
        ;;
    3)
        cat "🚀_LAUNCH_VOICE_INTERFACE.sh"
        ;;
    4)
        less "🎤_VOICE_INTERFACE_TECH_SPEC.md" || cat "🎤_VOICE_INTERFACE_TECH_SPEC.md"
        ;;
    5)
        less "🎤_VOICE_INTERFACE_README.md" || cat "🎤_VOICE_INTERFACE_README.md"
        ;;
    6)
        less "🎤_VOICE_INTERFACE_INDEX.md" || cat "🎤_VOICE_INTERFACE_INDEX.md"
        ;;
    7)
        less "🎤_VOICE_INTERFACE_VALIDATION_CHECKLIST.md" || cat "🎤_VOICE_INTERFACE_VALIDATION_CHECKLIST.md"
        ;;
    8)
        cat "🎤_VOICE_INTERFACE_DEMO.sh"
        ;;
    9)
        less "🎤_VOICE_INTERFACE_COMPLETION_REPORT.md" || cat "🎤_VOICE_INTERFACE_COMPLETION_REPORT.md"
        ;;
    10)
        less "🎉_VOICE_INTERFACE_COMPLETE_FINAL.md" || cat "🎉_VOICE_INTERFACE_COMPLETE_FINAL.md"
        ;;
    11)
        less "🎤_VOICE_INTERFACE_PROJECT_SUMMARY.md" || cat "🎤_VOICE_INTERFACE_PROJECT_SUMMARY.md"
        ;;
    12)
        less "🎤_VOICE_INTERFACE_VISUAL_SUMMARY.md" || cat "🎤_VOICE_INTERFACE_VISUAL_SUMMARY.md"
        ;;
    13)
        less "🎊_VOICE_SUCCESS_CELEBRATION.txt" || cat "🎊_VOICE_SUCCESS_CELEBRATION.txt"
        ;;
    14)
        less "🎤_VOICE_INTERFACE_DOCUMENTS_LIST.md" || cat "🎤_VOICE_INTERFACE_DOCUMENTS_LIST.md"
        ;;
    q|Q)
        echo "До побачення! 👋"
        exit 0
        ;;
    *)
        echo "❌ Невірний вибір. Спробуйте ще раз."
        ;;
esac

echo ""
echo "✅ Готово!"
