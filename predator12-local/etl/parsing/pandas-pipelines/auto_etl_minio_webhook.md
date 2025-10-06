# Автоматичний запуск ETL для митних декларацій при появі нового файлу у MinIO

## 1. MinIO Notification → Webhook
- Налаштуйте MinIO на надсилання webhook при завантаженні нового файлу у bucket `originals`.
- Приклад конфігурації:
```
mc event add minio/originals arn:minio:sqs::webhook1:webhook --event put
```

## 2. Flask/FastAPI Webhook Listener
- Створіть простий сервер, який приймає webhook і запускає ETL:
```python
from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/minio-webhook', methods=['POST'])
def minio_webhook():
    # Тут можна перевірити payload, ім'я файлу тощо
    subprocess.Popen(['python', 'etl-parsing/pandas-pipelines/customs_registry_etl_template.py'])
    return '', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

## 3. Деплой webhook listener як окремий контейнер у Kubernetes або docker-compose.

## 4. (Опційно) Додавайте логіку для інтеграції з knowledge graph після ETL:
```python
subprocess.Popen(['python', 'scripts/generate_knowledge_graph.py'])
```

> Таким чином, кожен новий файл митних декларацій автоматично обробляється, завантажується у базу, інтегрується у knowledge graph і стає доступним для аналітики та AI.
