#!/bin/bash
# Швидкий запуск агентів самовдосконалення Predator11 (robust)
set -euo pipefail

ROOT_DIR="/Users/dima/Documents/Predator11"
AGENTS_DIR="$ROOT_DIR/agents"
LOG_DIR="$ROOT_DIR/logs/agents"
VENV_DIR="/tmp/predator11_agents_env"

mkdir -p "$LOG_DIR"

echo "🚀 Запуск агентів самовдосконалення Predator11..."

# Перехід у папку агентів
cd "$AGENTS_DIR"

# Створення Python virtual environment для агентів
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi
# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

# Оновлення pip і встановлення залежностей
echo "📦 Встановлюю залежності для агентів..."
python -m pip install --upgrade pip >/dev/null 2>&1 || true
pip install --quiet \
  structlog \
  redis qdrant-client kafka-python aioredis asyncpg prometheus-client psutil docker pyyaml httpx >/dev/null

# Експорт змінних середовища з .env (безпечне)
set +H
set -a
. "$ROOT_DIR/.env" || true
set +a

# PYTHONPATH для імпортів із каталогу агентів
export PYTHONPATH="$AGENTS_DIR:$PYTHONPATH"

# Override endpoints for host-run agents (map docker service names -> localhost)
# Kafka (Redpanda) з портом 19092, який проброшений з docker-compose
export KAFKA_BROKERS="${KAFKA_BROKERS:-localhost:19092}"
export KAFKA_BOOTSTRAP_SERVERS="$KAFKA_BROKERS"
# OpenSearch
export OPENSEARCH_URL="http://localhost:9200"
# Redis: заміна хоста на localhost у різних форматах URL
if [[ "${REDIS_URL:-}" == *"@redis:"* ]]; then
  export REDIS_URL="${REDIS_URL//@redis:/@localhost:}"
elif [[ "${REDIS_URL:-}" == *"redis:6379"* ]]; then
  export REDIS_URL="${REDIS_URL//redis:6379/localhost:6379}"
fi
# Postgres: заміна хоста db на localhost
if [[ "${DATABASE_URL:-}" == *"@db:"* ]]; then
  export DATABASE_URL="${DATABASE_URL//@db:/@localhost:}"
elif [[ "${DATABASE_URL:-}" == *"db:5432"* ]]; then
  export DATABASE_URL="${DATABASE_URL//db:5432/localhost:5432}"
fi
# Qdrant
export QDRANT_HOST="localhost"
export QDRANT_PORT="6333"
# MinIO та Keycloak (опційно для перевірок)
export MINIO_URL="http://localhost:9000"
export KEYCLOAK_URL="http://localhost:8080"

# Запуск Supervisor (завантаження agents.yaml та запуск основного циклу)
echo "📡 Запускаю Agent Supervisor..."
nohup python "$AGENTS_DIR/start_supervisor.py" >> "$LOG_DIR/supervisor.log" 2>&1 &
SUPERVISOR_PID=$!

sleep 2

# Запуск AutoHeal Agent
echo "🔧 Запускаю AutoHeal Agent..."
if [ -d "$AGENTS_DIR/auto-heal" ]; then
  nohup python "$AGENTS_DIR/auto-heal/auto_heal_agent.py" >> "$LOG_DIR/auto_heal.log" 2>&1 &
  AUTOHEAL_PID=$!
else
  echo "❌ Не знайдено каталог $AGENTS_DIR/auto-heal" | tee -a "$LOG_DIR/errors.log"
  AUTOHEAL_PID=0
fi

sleep 1

# Запуск SelfImprovement Agent
echo "🧠 Запускаю SelfImprovement Agent..."
if [ -d "$AGENTS_DIR/self-improvement" ]; then
  nohup python "$AGENTS_DIR/self-improvement/self_improvement_agent.py" >> "$LOG_DIR/self_improvement.log" 2>&1 &
  SELFIMPROVEMENT_PID=$!
else
  echo "❌ Не знайдено каталог $AGENTS_DIR/self-improvement" | tee -a "$LOG_DIR/errors.log"
  SELFIMPROVEMENT_PID=0
fi

sleep 1

# Запуск SelfDiagnosis Agent
echo "🔍 Запускаю SelfDiagnosis Agent..."
if [ -d "$AGENTS_DIR/self-diagnosis" ]; then
  nohup python "$AGENTS_DIR/self-diagnosis/self_diagnosis_agent.py" >> "$LOG_DIR/self_diagnosis.log" 2>&1 &
  SELFDIAGNOSIS_PID=$!
else
  echo "❌ Не знайдено каталог $AGENTS_DIR/self-diagnosis" | tee -a "$LOG_DIR/errors.log"
  SELFDIAGNOSIS_PID=0
fi

# Збереження PID агентів
echo "$SUPERVISOR_PID,$AUTOHEAL_PID,$SELFIMPROVEMENT_PID,$SELFDIAGNOSIS_PID" > /tmp/predator11_agents.pids

# Підсумок
echo "✅ Агенти самовдосконалення запущені!"
echo "🔍 Supervisor PID: $SUPERVISOR_PID"
echo "🔧 AutoHeal PID: $AUTOHEAL_PID"
echo "🧠 SelfImprovement PID: $SELFIMPROVEMENT_PID"
echo "🔍 SelfDiagnosis PID: $SELFDIAGNOSIS_PID"

echo "📊 Перевірити статус процесів:"
echo "ps -p \$(cat /tmp/predator11_agents.pids | tr ',' ' ')"
echo "📄 Логи: $LOG_DIR (supervisor.log, auto_heal.log, self_improvement.log, self_diagnosis.log)"
