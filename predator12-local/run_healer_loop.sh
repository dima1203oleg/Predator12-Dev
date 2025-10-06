#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
HEAL_RUNNER_LOG="$LOG_DIR/container_healer_runner.out"
HEAL_LOG="$LOG_DIR/container_healer.log"

# Очікуємо Docker READY (до 15 хв), перевірка кожні 5 секунд
MAX_WAIT=$((15*60))
STEP=5
WAITED=0
printf "[watcher] Очікую Docker READY (до %ds)\n" "$MAX_WAIT" | tee -a "$HEAL_RUNNER_LOG"
while true; do
  if docker info >/dev/null 2>&1; then
    echo "[watcher] Docker READY, запускаю container_healer.py" | tee -a "$HEAL_RUNNER_LOG"
    nohup python3 container_healer.py >> "$HEAL_RUNNER_LOG" 2>&1 &
    exit 0
  fi
  sleep "$STEP"
  WAITED=$((WAITED+STEP))
  printf "[watcher] Docker STARTING... %ds\n" "$WAITED" | tee -a "$HEAL_RUNNER_LOG"
  if [[ "$WAITED" -ge "$MAX_WAIT" ]]; then
    echo "[watcher] Таймаут очікування Docker" | tee -a "$HEAL_RUNNER_LOG"
    exit 1
  fi
done

