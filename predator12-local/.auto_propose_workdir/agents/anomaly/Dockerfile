FROM python:3.11-slim

# Run as root initially for system operations
USER root

WORKDIR /app

# Встановлюємо системні залежності
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r predator11 || true && useradd -r -g predator11 predator11 || true

# Копіюємо requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо код агента
COPY anomaly_agent.py .

# Set ownership for non-root user
RUN chown -R predator11:predator11 /app

# Switch to non-root user
USER predator11

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9020/anomaly/health || exit 1

# Експозиція порту
EXPOSE 9020

# Запуск агента
CMD ["python", "anomaly_agent.py"]
