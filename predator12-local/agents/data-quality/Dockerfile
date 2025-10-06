FROM python:3.11-slim

WORKDIR /app

# Встановлюємо системні залежності  
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо код агента
COPY data_quality_agent.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9012/health || exit 1

# Експозиція порту
EXPOSE 9012

# Запуск агента
CMD ["python", "data_quality_agent.py"]
