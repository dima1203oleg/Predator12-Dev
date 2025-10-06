FROM python:3.11-slim

WORKDIR /app

# Встановлення системних залежностей
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копіювання requirements
COPY requirements.txt .

# Встановлення Python залежностей
RUN pip install --no-cache-dir -r requirements.txt

# Копіювання коду агента
COPY security_privacy_agent.py .

# Експозиція порту
EXPOSE 9050

# Налаштування здоров'я контейнера
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9050/health || exit 1

# Запуск агента
CMD ["python", "security_privacy_agent.py"]
