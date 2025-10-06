FROM python:3.11-slim

WORKDIR /app

# Встановлення системних залежностей
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Копіювання та встановлення Python залежностей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіювання коду застосунку
COPY data_quality_agent.py .

# Створення користувача без root привілеїв
RUN useradd -m -u 1000 agent && chown -R agent:agent /app
USER agent

EXPOSE 8001

CMD ["python", "data_quality_agent.py"]
