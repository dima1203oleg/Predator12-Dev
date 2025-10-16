#!/bin/bash

# 🎤 AI Voice Control - Quick Verification Script
# Швидка перевірка всіх компонентів голосового інтерфейсу

echo "================================================"
echo "🎤 AI VOICE CONTROL - QUICK VERIFICATION"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="/Users/dima/Documents/Predator12"
FRONTEND_DIR="$PROJECT_ROOT/predator12-local/frontend"
COMPONENT_FILE="$FRONTEND_DIR/src/components/voice/AIVoiceInterface.tsx"

echo "📂 Перевірка структури проекту..."
echo ""

# Check if files exist
if [ -f "$COMPONENT_FILE" ]; then
    echo -e "${GREEN}✓${NC} AIVoiceInterface.tsx знайдено"
else
    echo -e "${RED}✗${NC} AIVoiceInterface.tsx НЕ знайдено"
    exit 1
fi

echo ""
echo "🔍 Перевірка ключових функцій у коді..."
echo ""

# Check for STT (Speech Recognition)
if grep -q "webkitSpeechRecognition" "$COMPONENT_FILE"; then
    echo -e "${GREEN}✓${NC} STT (Speech Recognition) реалізовано"
else
    echo -e "${RED}✗${NC} STT НЕ знайдено"
fi

# Check for TTS (Speech Synthesis)
if grep -q "speechSynthesis" "$COMPONENT_FILE"; then
    echo -e "${GREEN}✓${NC} TTS (Speech Synthesis) реалізовано"
else
    echo -e "${RED}✗${NC} TTS НЕ знайдено"
fi

# Check for Ukrainian language
if grep -q "uk-UA" "$COMPONENT_FILE"; then
    echo -e "${GREEN}✓${NC} Українська мова налаштована"
else
    echo -e "${YELLOW}⚠${NC} Українська мова можливо не налаштована"
fi

# Check for English language
if grep -q "en-US" "$COMPONENT_FILE"; then
    echo -e "${GREEN}✓${NC} Англійська мова налаштована"
else
    echo -e "${YELLOW}⚠${NC} Англійська мова можливо не налаштована"
fi

# Check for language toggle
if grep -q "language.*useState" "$COMPONENT_FILE"; then
    echo -e "${GREEN}✓${NC} Перемикання мов реалізовано"
else
    echo -e "${YELLOW}⚠${NC} Перемикання мов можливо не реалізовано"
fi

echo ""
echo "🌐 Перевірка сервера..."
echo ""

# Check if server is running on port 5090
if lsof -Pi :5090 -sTCP:LISTEN -t >/dev/null ; then
    PID=$(lsof -ti:5090)
    echo -e "${GREEN}✓${NC} Сервер запущено на порту 5090 (PID: $PID)"
    echo -e "  ${BLUE}→${NC} URL: http://localhost:5090/"
else
    echo -e "${RED}✗${NC} Сервер НЕ запущено на порту 5090"
    echo -e "  ${YELLOW}→${NC} Запустіть: cd $FRONTEND_DIR && npm run dev"
fi

echo ""
echo "📝 Перевірка документації..."
echo ""

# Check documentation files
DOCS=(
    "$PROJECT_ROOT/🎯_AI_VOICE_FINAL_DOCUMENTATION.md"
    "$PROJECT_ROOT/🎤_VOICE_INTEGRATION_SUCCESS.md"
    "$PROJECT_ROOT/🎤_TEST_VOICE_QUICK.sh"
    "$PROJECT_ROOT/🎯_QUICK_ACCESS.md"
)

for doc in "${DOCS[@]}"; do
    filename=$(basename "$doc")
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $filename"
    else
        echo -e "${RED}✗${NC} $filename НЕ знайдено"
    fi
done

echo ""
echo "🧪 Рекомендації для тестування..."
echo ""
echo -e "${BLUE}1.${NC} Відкрийте http://localhost:5090/ в Chrome/Edge"
echo -e "${BLUE}2.${NC} Знайдіть компонент 'AI Voice Control'"
echo -e "${BLUE}3.${NC} Протестуйте STT (натисніть мікрофон, скажіть щось)"
echo -e "${BLUE}4.${NC} Протестуйте TTS (введіть текст, натисніть озвучити)"
echo -e "${BLUE}5.${NC} Протестуйте перемикання UA/EN"
echo ""

echo "📊 Підсумок перевірки:"
echo ""

# Count checks
TOTAL_CHECKS=9
PASSED_CHECKS=0

[ -f "$COMPONENT_FILE" ] && ((PASSED_CHECKS++))
grep -q "webkitSpeechRecognition" "$COMPONENT_FILE" && ((PASSED_CHECKS++))
grep -q "speechSynthesis" "$COMPONENT_FILE" && ((PASSED_CHECKS++))
grep -q "uk-UA" "$COMPONENT_FILE" && ((PASSED_CHECKS++))
grep -q "en-US" "$COMPONENT_FILE" && ((PASSED_CHECKS++))
grep -q "language.*useState" "$COMPONENT_FILE" && ((PASSED_CHECKS++))
lsof -Pi :5090 -sTCP:LISTEN -t >/dev/null && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/🎯_AI_VOICE_FINAL_DOCUMENTATION.md" ] && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/🎤_VOICE_INTEGRATION_SUCCESS.md" ] && ((PASSED_CHECKS++))

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✅ ВСІ ПЕРЕВІРКИ ПРОЙДЕНО ($PASSED_CHECKS/$TOTAL_CHECKS)${NC}"
    echo ""
    echo -e "${GREEN}🎉 AI Voice Control готовий до використання!${NC}"
elif [ $PASSED_CHECKS -ge 7 ]; then
    echo -e "${YELLOW}⚠️  БІЛЬШІСТЬ ПЕРЕВІРОК ПРОЙДЕНО ($PASSED_CHECKS/$TOTAL_CHECKS)${NC}"
    echo ""
    echo -e "${YELLOW}Деякі компоненти потребують уваги${NC}"
else
    echo -e "${RED}❌ ДЕЯКІ ПЕРЕВІРКИ НЕ ПРОЙДЕНО ($PASSED_CHECKS/$TOTAL_CHECKS)${NC}"
    echo ""
    echo -e "${RED}Потрібна додаткова налаштування${NC}"
fi

echo ""
echo "================================================"
echo "📚 Додаткова інформація:"
echo "   - Документація: 🎯_AI_VOICE_FINAL_DOCUMENTATION.md"
echo "   - Звіт про успіх: 🎤_VOICE_INTEGRATION_SUCCESS.md"
echo "   - Тестування: ./🎤_TEST_VOICE_QUICK.sh"
echo "================================================"
echo ""
