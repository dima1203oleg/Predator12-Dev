# FastAPI Backend

## Запуск локально

```bash
cd backend-api
uvicorn fastapi_app.main:app --reload
```

## Документація API

Swagger UI: http://localhost:8000/docs
Redoc: http://localhost:8000/redoc

### Ingest API (chunked uploads)

```http
POST /ingest/upload
{
  "file_name": "dataset.csv",
  "chunk_index": 0,
  "total_chunks": 3,
  "chunk_base64": "...",
  "upload_id": null
}
```

Отримайте `upload_id` з першої відповіді й надсилайте наступні чанки з тим самим `upload_id`.
Коли `received_chunks == total_chunks`, сервіс збирає файл та повертає `status: "completed"`.
Статус можна перевірити через `GET /ingest/status/{upload_id}`.

```http
POST /ingest/commit
{
  "upload_id": "<UUID>",
  "dataset": "customs-feb"
}
```

Це переносить зібраний файл у тимчасове сховище, симулює завантаження в object storage (`local://datasets/...`), створює маніфест та фіксує подію `ingest.commit` (JSONL у `tmp/events.log`).

```http
GET /ingest/datasets
```

Повертає перелік доступних комітів (dataset, upload_id, object_url, manifest) для запуску ETL.

```http
POST /ingest/datasets/{upload_id}/trigger
{
  "parameters": {"priority": "high"}
}
```

Симулює запуск ETL (створює подію `etl.trigger` у лог-файлі) для вказаного `upload_id`.

## Тестування

```bash
pytest
```
