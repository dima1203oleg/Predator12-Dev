#!/usr/bin/env python3
"""
📥 Ingest Agent - File/Stream Ingestion with Profiling & PII Scanning
Завантаження файлів/потоків з профілюванням та PII сканом
"""

import os
import hashlib
import mimetypes
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any, BinaryIO
from dataclasses import dataclass
from pathlib import Path
import re

import redis
import aiofiles
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
import pandas as pd
import structlog
from minio import Minio
import psycopg2
from opensearchpy import OpenSearch

logger = structlog.get_logger(__name__)

@dataclass
class FileMetadata:
    """Метадані завантаженого файлу"""
    filename: str
    size: int
    mime_type: str
    md5_hash: str
    upload_time: datetime
    user_id: str
    
@dataclass 
class DataProfile:
    """Профіль даних"""
    row_count: int
    column_count: int
    columns_info: Dict[str, Any]
    data_types: Dict[str, str]
    null_counts: Dict[str, int]
    unique_counts: Dict[str, int]
    sample_data: List[Dict[str, Any]]
    
@dataclass
class PIIFindings:
    """Знайдені PII дані"""
    has_pii: bool
    pii_columns: List[str]
    pii_types: Dict[str, List[str]]  # column -> [pii_type1, pii_type2]
    confidence_scores: Dict[str, float]

class PIIDetector:
    """Детектор персональних даних"""
    
    def __init__(self):
        # Регулярні вирази для різних типів PII
        self.patterns = {
            "email": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            "phone": re.compile(r'\b(?:\+?38)?(?:\(0\d{2}\)|\d{3})\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b'),
            "inn": re.compile(r'\b\d{10}\b'),
            "passport": re.compile(r'\b[А-Я]{2}\d{6}\b'),
            "card_number": re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'),
            "iban": re.compile(r'\bUA\d{27}\b'),
            "social_security": re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
        }
        
        # Ключові слова для стовпців
        self.column_keywords = {
            "email": ["email", "e-mail", "електронна", "пошта", "mail"],
            "phone": ["phone", "tel", "mobile", "телефон", "моб"],
            "name": ["name", "surname", "firstname", "lastname", "ім'я", "прізвище"],
            "address": ["address", "адреса", "вулиця", "місто", "область"],
            "birth_date": ["birth", "birthday", "дата", "народження", "birth_date"],
            "inn": ["inn", "інн", "код", "tax"],
            "passport": ["passport", "паспорт", "документ"]
        }
    
    def detect_pii(self, df: pd.DataFrame) -> PIIFindings:
        """Виявлення PII в DataFrame"""
        
        pii_columns = []
        pii_types = {}
        confidence_scores = {}
        
        for column in df.columns:
            column_pii_types = []
            max_confidence = 0.0
            
            # Перевірка назви стовпця
            col_lower = column.lower()
            for pii_type, keywords in self.column_keywords.items():
                if any(keyword in col_lower for keyword in keywords):
                    column_pii_types.append(pii_type)
                    max_confidence = max(max_confidence, 0.8)
            
            # Перевірка вмісту стовпця (sample)
            sample_values = df[column].dropna().astype(str).head(100)
            
            for pii_type, pattern in self.patterns.items():
                matches = sum(1 for value in sample_values if pattern.search(value))
                if matches > 0:
                    match_ratio = matches / len(sample_values)
                    if match_ratio >= 0.1:  # 10% співпадінь
                        column_pii_types.append(pii_type)
                        max_confidence = max(max_confidence, match_ratio)
            
            if column_pii_types:
                pii_columns.append(column)
                pii_types[column] = list(set(column_pii_types))
                confidence_scores[column] = max_confidence
        
        return PIIFindings(
            has_pii=len(pii_columns) > 0,
            pii_columns=pii_columns,
            pii_types=pii_types,
            confidence_scores=confidence_scores
        )

class DataProfiler:
    """Профілювання даних"""
    
    def profile_dataframe(self, df: pd.DataFrame) -> DataProfile:
        """Створення профілю DataFrame"""
        
        columns_info = {}
        data_types = {}
        null_counts = {}
        unique_counts = {}
        
        for column in df.columns:
            series = df[column]
            
            # Базова інформація
            data_types[column] = str(series.dtype)
            null_counts[column] = series.isnull().sum()
            unique_counts[column] = series.nunique()
            
            # Детальна інформація
            col_info = {
                "dtype": str(series.dtype),
                "null_count": int(series.isnull().sum()),
                "unique_count": int(series.nunique()),
                "null_percentage": round(series.isnull().sum() / len(series) * 100, 2)
            }
            
            # Додаткові метрики для числових стовпців
            if pd.api.types.is_numeric_dtype(series):
                col_info.update({
                    "min": float(series.min()) if not series.empty else None,
                    "max": float(series.max()) if not series.empty else None,
                    "mean": float(series.mean()) if not series.empty else None,
                    "std": float(series.std()) if not series.empty else None
                })
            
            # Додаткові метрики для текстових стовпців
            elif pd.api.types.is_string_dtype(series):
                non_null_series = series.dropna()
                if not non_null_series.empty:
                    col_info.update({
                        "min_length": int(non_null_series.str.len().min()),
                        "max_length": int(non_null_series.str.len().max()),
                        "avg_length": round(non_null_series.str.len().mean(), 2)
                    })
            
            columns_info[column] = col_info
        
        # Sample даних (перші 5 рядків)
        sample_data = df.head(5).to_dict('records')
        
        return DataProfile(
            row_count=len(df),
            column_count=len(df.columns),
            columns_info=columns_info,
            data_types=data_types,
            null_counts=null_counts,
            unique_counts=unique_counts,
            sample_data=sample_data
        )

class IngestAgent:
    """Ingest Agent - завантаження та обробка файлів"""
    
    def __init__(self):
        self.app = FastAPI(title="Ingest Agent", version="1.0.0")
        
        # Підключення до сервісів
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        self.minio_client = Minio(
            'minio:9000',
            access_key='minioadmin',
            secret_key='minioadmin',
            secure=False
        )
        self.opensearch_client = OpenSearch([{'host': 'opensearch', 'port': 9200}])
        
        # Утиліти
        self.pii_detector = PIIDetector()
        self.profiler = DataProfiler()
        
        # Налаштування
        self.bucket_name = "predator11-raw"
        self.max_file_size = 500 * 1024 * 1024  # 500MB
        
        # Створення bucket якщо не існує
        self._ensure_bucket()
        
        self._setup_routes()
    
    def _ensure_bucket(self):
        """Створення MinIO bucket"""
        try:
            if not self.minio_client.bucket_exists(self.bucket_name):
                self.minio_client.make_bucket(self.bucket_name)
                logger.info("Created MinIO bucket", bucket=self.bucket_name)
        except Exception as e:
            logger.error("Failed to create bucket", error=str(e))
    
    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""
        
        @self.app.post("/ingest/upload")
        async def upload_file(
            file: UploadFile = File(...),
            user_id: str = Form("system"),
            tags: Optional[str] = Form(None)
        ):
            """Завантаження файлу"""
            try:
                # Валідація розміру
                if file.size and file.size > self.max_file_size:
                    raise HTTPException(400, f"File too large: {file.size} > {self.max_file_size}")
                
                # Обробка файлу
                result = await self.process_upload(file, user_id, tags)
                return result
                
            except Exception as e:
                logger.error("Upload failed", filename=file.filename, error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/ingest/commit/{file_id}")
        async def commit_file(file_id: str):
            """Підтвердження завантаження та індексація"""
            try:
                result = await self.commit_and_index(file_id)
                return result
            except Exception as e:
                logger.error("Commit failed", file_id=file_id, error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/ingest/profile/{file_id}")
        async def get_profile(file_id: str):
            """Отримання профілю файлу"""
            try:
                # Завантаження профілю з Redis
                profile_data = self.redis_client.get(f"profile:{file_id}")
                if not profile_data:
                    raise HTTPException(404, "Profile not found")
                
                import json
                return json.loads(profile_data)
            except Exception as e:
                logger.error("Failed to get profile", file_id=file_id, error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/ingest/health")
        async def health():
            """Health check"""
            try:
                # Перевіряємо підключення до сервісів
                self.redis_client.ping()
                self.minio_client.list_buckets()
                self.opensearch_client.cluster.health()
                
                return {"status": "healthy", "timestamp": datetime.now().isoformat()}
            except Exception as e:
                return {"status": "unhealthy", "error": str(e)}
    
    async def process_upload(self, file: UploadFile, user_id: str, tags: Optional[str]) -> Dict[str, Any]:
        """Обробка завантаження файлу"""
        
        # Генерація ID файлу
        file_id = hashlib.md5(f"{file.filename}{datetime.now()}".encode()).hexdigest()
        
        # Читання файлу
        content = await file.read()
        
        # Метадані
        metadata = FileMetadata(
            filename=file.filename,
            size=len(content),
            mime_type=file.content_type or mimetypes.guess_type(file.filename)[0],
            md5_hash=hashlib.md5(content).hexdigest(),
            upload_time=datetime.now(),
            user_id=user_id
        )
        
        # Збереження в MinIO
        object_name = f"raw/{file_id}/{file.filename}"
        self.minio_client.put_object(
            self.bucket_name,
            object_name,
            data=BytesIO(content),
            length=len(content),
            content_type=metadata.mime_type
        )
        
        # Профілювання даних (якщо це CSV/Excel)
        profile = None
        pii_findings = None
        
        if self._is_tabular_file(file.filename):
            try:
                df = await self._read_tabular_file(content, file.filename)
                profile = self.profiler.profile_dataframe(df)
                pii_findings = self.pii_detector.detect_pii(df)
                
                # Збереження профілю
                import json
                profile_data = {
                    "metadata": metadata.__dict__,
                    "profile": profile.__dict__,
                    "pii_findings": pii_findings.__dict__ if pii_findings else None
                }
                
                self.redis_client.setex(
                    f"profile:{file_id}", 
                    3600,  # 1 година TTL
                    json.dumps(profile_data, default=str)
                )
                
            except Exception as e:
                logger.warning("Failed to profile data", filename=file.filename, error=str(e))
        
        # Публікація події
        await self._publish_event("dataset.uploaded", {
            "file_id": file_id,
            "filename": file.filename,
            "size": metadata.size,
            "user_id": user_id,
            "has_pii": pii_findings.has_pii if pii_findings else False,
            "row_count": profile.row_count if profile else None
        })
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": metadata.size,
            "status": "uploaded",
            "has_profile": profile is not None,
            "has_pii": pii_findings.has_pii if pii_findings else False,
            "pii_columns": pii_findings.pii_columns if pii_findings else []
        }
    
    async def commit_and_index(self, file_id: str) -> Dict[str, Any]:
        """Підтвердження та індексація файлу"""
        
        # Отримання профілю
        import json
        profile_data = self.redis_client.get(f"profile:{file_id}")
        if not profile_data:
            raise Exception("Profile not found")
        
        data = json.loads(profile_data)
        
        # Створення індексу в OpenSearch
        index_name = f"dataset_{file_id}"
        
        # Mapping з урахуванням PII
        mapping = {
            "mappings": {
                "properties": {
                    "file_id": {"type": "keyword"},
                    "filename": {"type": "text"},
                    "upload_time": {"type": "date"},
                    "user_id": {"type": "keyword"},
                    "row_count": {"type": "integer"},
                    "column_count": {"type": "integer"},
                    "has_pii": {"type": "boolean"},
                    "pii_columns": {"type": "keyword"},
                    "tags": {"type": "keyword"}
                }
            }
        }
        
        # Створення індексу
        self.opensearch_client.indices.create(
            index=index_name,
            body=mapping,
            ignore=400  # Ігнорувати якщо вже існує
        )
        
        # Індексація метаданих
        doc = {
            "file_id": file_id,
            "filename": data["metadata"]["filename"],
            "upload_time": data["metadata"]["upload_time"],
            "user_id": data["metadata"]["user_id"],
            "row_count": data["profile"]["row_count"] if data["profile"] else 0,
            "column_count": data["profile"]["column_count"] if data["profile"] else 0,
            "has_pii": data["pii_findings"]["has_pii"] if data["pii_findings"] else False,
            "pii_columns": data["pii_findings"]["pii_columns"] if data["pii_findings"] else [],
            "indexed_at": datetime.now().isoformat()
        }
        
        self.opensearch_client.index(
            index=index_name,
            id=file_id,
            body=doc
        )
        
        # Публікація події
        await self._publish_event("dataset.indexed", {
            "file_id": file_id,
            "index_name": index_name,
            "has_pii": doc["has_pii"]
        })
        
        return {
            "file_id": file_id,
            "status": "indexed",
            "index_name": index_name,
            "document_id": file_id
        }
    
    def _is_tabular_file(self, filename: str) -> bool:
        """Перевірка чи є файл табличним"""
        ext = Path(filename).suffix.lower()
        return ext in ['.csv', '.xlsx', '.xls', '.tsv', '.parquet']
    
    async def _read_tabular_file(self, content: bytes, filename: str) -> pd.DataFrame:
        """Читання табличного файлу"""
        ext = Path(filename).suffix.lower()
        
        if ext == '.csv':
            return pd.read_csv(BytesIO(content))
        elif ext in ['.xlsx', '.xls']:
            return pd.read_excel(BytesIO(content))
        elif ext == '.tsv':
            return pd.read_csv(BytesIO(content), sep='\t')
        elif ext == '.parquet':
            return pd.read_parquet(BytesIO(content))
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        try:
            event_data = {
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "source": "IngestAgent",
                **data
            }
            
            self.redis_client.xadd("pred:events:ingest", event_data)
            logger.debug("Event published", event_type=event_type)
            
        except Exception as e:
            logger.error("Failed to publish event", error=str(e))

# Запуск агента
if __name__ == "__main__":
    import uvicorn
    from io import BytesIO
    
    agent = IngestAgent()
    uvicorn.run(agent.app, host="0.0.0.0", port=9010)
