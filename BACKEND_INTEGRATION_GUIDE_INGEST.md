# 🔌 BACKEND INTEGRATION GUIDE - INGEST HUB

## 📋 Overview

This guide covers backend integration for the Ingest Hub module.

---

## 📂 File Structure

```
backend/
├── src/
│   ├── api/
│   │   └── ingest.py           # API endpoints (created ✅)
│   ├── services/
│   │   ├── file_processor.py   # File processing (created ✅)
│   │   ├── link_crawler.py     # Link crawling (TODO)
│   │   └── telegram_client.py  # Telegram integration (TODO)
│   ├── models/
│   │   └── ingest.py           # Database models (TODO)
│   └── tasks/
│       └── celery_tasks.py     # Background tasks (TODO)
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend

# Core dependencies
pip install fastapi uvicorn websockets

# File processing
pip install pandas openpyxl pdfplumber pillow opencv-python

# Link crawling
pip install playwright beautifulsoup4 feedparser

# Telegram
pip install telethon

# Task queue
pip install celery redis

# Storage
pip install boto3  # MinIO/S3
pip install asyncpg  # PostgreSQL
pip install opensearch-py  # OpenSearch
```

### 2. Add to FastAPI App

```python
# main.py
from fastapi import FastAPI
from api.ingest import router as ingest_router

app = FastAPI(title="Predator12 Nexus Core")

# Include ingest router
app.include_router(ingest_router)

# Run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. Test Endpoints

```bash
# Start server
uvicorn main:app --reload

# Test file upload
curl -X POST "http://localhost:8000/api/ingest/upload" \
  -F "file=@data.csv"

# Test link crawl
curl -X POST "http://localhost:8000/api/ingest/crawl" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "type": "url", "depth": 1}'

# Test WebSocket
wscat -c ws://localhost:8000/api/ingest/ws
```

---

## 📡 API Endpoints

### File Upload

```http
POST /api/ingest/upload
Content-Type: multipart/form-data

Parameters:
- file: File (required)
- dataset: string (optional)
- tags: string[] (optional)

Response:
{
  "id": "uuid",
  "status": "pending",
  "filename": "data.csv",
  "size": 1024000
}
```

### Link Crawl

```http
POST /api/ingest/crawl
Content-Type: application/json

Body:
{
  "url": "https://example.com",
  "type": "url" | "rss" | "sitemap",
  "depth": 1 | 2 | 3,
  "extractImages": true,
  "extractLinks": false
}

Response:
{
  "id": "uuid",
  "status": "pending",
  "url": "https://example.com"
}
```

### Telegram Connect

```http
POST /api/ingest/telegram/connect
Content-Type: application/json

Body:
{
  "token": "telegram-api-token"
}

Response:
{
  "status": "connected",
  "userId": "session-id"
}
```

### Telegram Subscribe

```http
POST /api/ingest/telegram/subscribe
Content-Type: application/json

Body:
{
  "identifier": "@channel",
  "filters": {
    "media": true,
    "links": true,
    "forwards": false,
    "minLength": 100
  }
}

Response:
{
  "id": "uuid",
  "status": "pending",
  "identifier": "@channel"
}
```

### Get Tasks

```http
GET /api/ingest/tasks?status=processing&limit=50

Response:
{
  "tasks": [
    {
      "id": "uuid",
      "type": "file",
      "status": "processing",
      "name": "data.csv",
      "progress": 0.65,
      "createdAt": "2025-01-08T12:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### WebSocket Events

```javascript
// Connect
ws = new WebSocket("ws://localhost:8000/api/ingest/ws");

// Events received
{
  "type": "task.created",
  "taskId": "uuid",
  "timestamp": "2025-01-08T12:00:00Z"
}

{
  "type": "task.progress",
  "taskId": "uuid",
  "progress": 0.5,
  "itemsProcessed": 500,
  "itemsTotal": 1000
}

{
  "type": "task.completed",
  "taskId": "uuid",
  "status": "success"
}

{
  "type": "task.log",
  "taskId": "uuid",
  "log": "Processing step 3/5"
}
```

---

## 🔧 Implementation Tasks

### Phase 1: Core Infrastructure ✅

- [x] API routes (`ingest.py`)
- [x] File processor service (`file_processor.py`)
- [ ] Database models
- [ ] Task queue setup (Celery)
- [ ] WebSocket manager

### Phase 2: File Processing

- [ ] Complete CSV processor
- [ ] Complete Excel processor
- [ ] Complete PDF processor
- [ ] Complete image processor
- [ ] Complete video processor
- [ ] MinIO storage integration
- [ ] PostgreSQL storage
- [ ] OpenSearch indexing

### Phase 3: Link Crawling

- [ ] URL crawler (Playwright)
- [ ] RSS parser
- [ ] Sitemap parser
- [ ] Link extraction
- [ ] Image extraction
- [ ] Content cleaning
- [ ] Deduplication

### Phase 4: Telegram Integration

- [ ] Telethon client setup
- [ ] Channel connection
- [ ] Message fetching
- [ ] Media download
- [ ] Message filtering
- [ ] Real-time sync

### Phase 5: Task Queue

- [ ] Celery configuration
- [ ] Redis setup
- [ ] Task definitions
- [ ] Progress tracking
- [ ] Error handling
- [ ] Retry logic

### Phase 6: Storage & Indexing

- [ ] MinIO bucket setup
- [ ] PostgreSQL tables
- [ ] OpenSearch indices
- [ ] Qdrant collections
- [ ] Data versioning
- [ ] Backup strategy

---

## 🔄 Data Flow

```
1. Upload/Crawl Request
   ↓
2. Create Task (status: pending)
   ↓
3. Queue in Celery
   ↓
4. Worker picks up task
   ↓
5. Process (status: processing)
   ↓
6. Extract/Parse data
   ↓
7. Store in MinIO (raw)
   ↓
8. Store in PostgreSQL (metadata)
   ↓
9. Index in OpenSearch (searchable)
   ↓
10. Generate embeddings → Qdrant
   ↓
11. Update task (status: success/error)
   ↓
12. Broadcast via WebSocket
```

---

## 📊 Database Schema

### Tasks Table

```sql
CREATE TABLE ingest_tasks (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL,  -- file, link, telegram
    status VARCHAR(20) NOT NULL,  -- pending, processing, success, error
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    progress FLOAT DEFAULT 0.0,
    details JSONB,
    error TEXT,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created (created_at DESC)
);
```

### Files Table

```sql
CREATE TABLE ingest_files (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES ingest_tasks(id),
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    hash VARCHAR(64) NOT NULL,
    storage_path TEXT NOT NULL,
    dataset VARCHAR(100),
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_hash (hash),
    INDEX idx_dataset (dataset)
);
```

### Links Table

```sql
CREATE TABLE ingest_links (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES ingest_tasks(id),
    url TEXT NOT NULL,
    link_type VARCHAR(20),  -- url, rss, sitemap
    depth INT,
    items_found INT DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_url (url)
);
```

### Telegram Sources Table

```sql
CREATE TABLE telegram_sources (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES ingest_tasks(id),
    identifier TEXT NOT NULL,
    source_type VARCHAR(20),  -- channel, group
    filters JSONB,
    members INT,
    messages_collected INT DEFAULT 0,
    last_sync TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_identifier (identifier)
);
```

---

## 🎯 Celery Tasks

### File Processing Task

```python
# tasks/celery_tasks.py
from celery import Celery

app = Celery('predator12', broker='redis://localhost:6379/0')

@app.task(bind=True)
async def process_file_task(self, task_id: str, file_path: str):
    """Process uploaded file"""
    try:
        # Update status
        await update_task_status(task_id, "processing")

        # Process file
        result = await process_file(file_path)

        # Store results
        await store_file_results(task_id, result)

        # Update status
        await update_task_status(task_id, "success")

        # Broadcast
        await broadcast_task_update(task_id, "task.completed", {
            "status": "success"
        })

    except Exception as e:
        await update_task_status(task_id, "error", error=str(e))
        await broadcast_task_update(task_id, "task.failed", {
            "error": str(e)
        })
```

---

## 🔐 Security

### File Upload Security

```python
# Validate file size
MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024  # 2GB

if len(content) > MAX_FILE_SIZE:
    raise HTTPException(400, "File too large")

# Validate file type
ALLOWED_TYPES = [
    "text/csv",
    "application/pdf",
    # ...
]

if content_type not in ALLOWED_TYPES:
    raise HTTPException(400, "File type not allowed")

# Scan for malware (optional)
# result = await scan_file_with_clamav(content)
```

### API Authentication

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    # Verify JWT token
    token = credentials.credentials
    # ... validate token
    return user

@router.post("/upload")
async def upload_file(
    file: UploadFile,
    user = Depends(verify_token)
):
    # Only authenticated users can upload
    pass
```

---

## 🧪 Testing

### Unit Tests

```python
# tests/test_ingest_api.py
import pytest
from fastapi.testclient import TestClient

def test_upload_file():
    client = TestClient(app)

    files = {"file": ("test.csv", b"col1,col2\n1,2", "text/csv")}
    response = client.post("/api/ingest/upload", files=files)

    assert response.status_code == 200
    assert "id" in response.json()

def test_crawl_link():
    client = TestClient(app)

    data = {
        "url": "https://example.com",
        "type": "url",
        "depth": 1
    }
    response = client.post("/api/ingest/crawl", json=data)

    assert response.status_code == 200
```

### Integration Tests

```python
# tests/test_file_processor.py
import pytest
from services.file_processor import CSVProcessor

@pytest.mark.asyncio
async def test_csv_processor():
    content = b"col1,col2\n1,2\n3,4"
    processor = CSVProcessor(content, "test.csv")

    result = await processor.process()

    assert result["success"] is True
    assert result["metadata"]["rows"] == 2
    assert result["metadata"]["columns"] == 2
```

---

## 📈 Monitoring

### Metrics to Track

- Tasks created/processed/failed per minute
- Average processing time per task type
- File upload sizes and counts
- Link crawl success/failure rates
- Telegram message collection rates
- Queue lengths and worker utilization
- Storage usage (MinIO, PostgreSQL)

### Logging

```python
import logging

logger = logging.getLogger("ingest")

@router.post("/upload")
async def upload_file(file: UploadFile):
    logger.info(f"File upload started: {file.filename}")

    try:
        # Process
        logger.debug(f"Processing {file.filename}")

        logger.info(f"File upload completed: {file.filename}")

    except Exception as e:
        logger.error(f"File upload failed: {file.filename}", exc_info=True)
```

---

## 🚀 Deployment

### Docker Compose

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/predator12
      - REDIS_URL=redis://redis:6379/0
      - MINIO_ENDPOINT=minio:9000
    depends_on:
      - db
      - redis
      - minio

  celery-worker:
    build: ./backend
    command: celery -A tasks.celery_tasks worker -l info
    depends_on:
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: predator12

  redis:
    image: redis:7

  minio:
    image: minio/minio
    command: server /data
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: password
```

---

## 📚 Next Steps

1. ✅ Review API endpoints
2. ✅ Review file processor
3. ⏳ Implement link crawler
4. ⏳ Implement Telegram client
5. ⏳ Set up Celery tasks
6. ⏳ Create database models
7. ⏳ Implement storage (MinIO, PostgreSQL)
8. ⏳ Add tests
9. ⏳ Deploy to staging

---

**Status:** Backend API scaffolding complete ✅  
**Next:** Link crawler and Telegram client implementation

**Date:** January 2025  
**Version:** 1.0.0
