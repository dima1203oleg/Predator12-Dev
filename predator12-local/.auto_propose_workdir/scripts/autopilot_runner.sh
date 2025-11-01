#!/usr/bin/env bash
set -euo pipefail

# autopilot_runner.sh
# Supervisor/Watchdog for ai_swarm.py — restarts the orchestrator on failure with exponential backoff.
# Supports --once for a single run (useful for dry-run/testing).

AI_SWARM="./scripts/ai_swarm.py"
KILL_FLAG=".autopilot_off"
MAX_BACKOFF=${MAX_BACKOFF:-300} # seconds
INITIAL_BACKOFF=2

ONCE=0
while (("$#")); do
  case "$1" in
    --once) ONCE=1; shift;;
    --help) echo "Usage: $0 [--once]"; exit 0;;
    *) shift;;
  esac
done

if [ ! -x "$AI_SWARM" ]; then
  # try to make it executable if it's a script
  chmod +x "$AI_SWARM" || true
fi

backoff=$INITIAL_BACKOFF
while true; do
  if [ -f "$KILL_FLAG" ]; then
    echo "[autopilot_runner] kill-flag $KILL_FLAG present — stopping supervisor" >&2
    exit 0
  fi

  echo "[autopilot_runner] starting ai_swarm (backoff=${backoff}s)" >&2
  # propagate environment variables intentionally (OFFLINE_MODE, etc.)
  python "$AI_SWARM" || rc=$?
  rc=${rc:-0}

  if [ "$ONCE" -eq 1 ]; then
    echo "[autopilot_runner] --once mode: exiting after single run (rc=$rc)" >&2
    exit $rc
  fi

  if [ "$rc" -eq 0 ]; then
    echo "[autopilot_runner] ai_swarm exited normally (rc=0) — restarting after short delay" >&2
    sleep 5
    backoff=$INITIAL_BACKOFF
    continue
  fi

  echo "[autopilot_runner] ai_swarm failed with rc=$rc — backing off ${backoff}s and will restart" >&2
  sleep $backoff
  backoff=$(( backoff * 2 ))
  if [ $backoff -gt $MAX_BACKOFF ]; then
    backoff=$MAX_BACKOFF
  fi
done
