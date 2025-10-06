FROM python:3.11-slim

WORKDIR /app

# Встановлюємо залежності
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо скрипти
COPY ./scripts/ ./scripts/
COPY ./file_watcher.py .

CMD ["python", "file_watcher.py"]
