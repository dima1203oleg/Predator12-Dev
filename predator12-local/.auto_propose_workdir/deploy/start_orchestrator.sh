#!/bin/bash
# Start Chief Orchestrator readiness helper

# Initialize
REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"
METRICS_PORT="${METRICS_PORT:-8000}"

# Wait for Redis
while ! nc -z $REDIS_HOST $REDIS_PORT; do
  echo "Waiting for Redis..."
  sleep 1
done

echo "Redis is ready at ${REDIS_HOST}:${REDIS_PORT}. Proceeding to launch app via Gunicorn."
exit 0
