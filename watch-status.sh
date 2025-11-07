#!/usr/bin/env bash
# 👁️ Моніторинг системи в реальному часі

echo "👁️ Моніторинг Predator12 - натисніть Ctrl+C для виходу"
echo ""

while true; do
    clear
    ./quick-status.sh
    echo ""
    echo "Оновлення кожні 5 секунд..."
    sleep 5
done
