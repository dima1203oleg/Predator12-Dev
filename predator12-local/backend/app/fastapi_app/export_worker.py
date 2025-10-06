"""
Export Worker System
===================

Production-ready export worker using Celery for async export processing.
Supports multiple formats, signed URLs, and billing integration.

Delta Revision 1.1 - Critical Component B6
"""

import asyncio
import hashlib
import json
import logging
import zipfile
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

# Celery imports
from celery import Celery
from celery.result import AsyncResult
from redis import asyncio as aioredis
from sqlalchemy import text

logger = logging.getLogger("export_worker")


class ExportFormat(Enum):
    """Supported export formats."""

    JSON = "json"
    CSV = "csv"
    XLSX = "xlsx"
    PARQUET = "parquet"
    XML = "xml"
    PDF = "pdf"


class ExportStatus(Enum):
    """Export task status."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


@dataclass
class ExportRequest:
    """Export request configuration."""

    request_id: str
    user_id: str
    organization_id: str
    dataset_id: str
    format: ExportFormat
    filters: Optional[Dict[str, Any]] = None
    columns: Optional[List[str]] = None
    max_rows: Optional[int] = None
    include_metadata: bool = True
    compress: bool = False
    created_at: datetime = None
    expires_at: datetime = None


@dataclass
class ExportResult:
    """Export task result."""

    request_id: str
    status: ExportStatus
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    row_count: Optional[int] = None
    download_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


# Initialize Celery app
celery_app = Celery(
    "export_worker",
    broker="redis://localhost:6379/2",  # Dedicated Redis DB for Celery
    backend="redis://localhost:6379/2",
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=False,
    task_default_retry_delay=60,
    task_max_retries=3,
)


class ExportWorkerManager:
    """
    Manages export worker operations and file generation.

    Features:
    - Async export processing via Celery
    - Multiple format support (JSON, CSV, Excel, Parquet, etc.)
    - Signed URL generation for secure downloads
    - Automatic cleanup and expiration
    - Billing integration for export charges
    - Progress tracking and notifications
    """

    def __init__(
        self,
        redis_client: aioredis.Redis,
        db_session_factory,
        minio_client=None,
        billing_manager=None,
    ):
        self.redis = redis_client
        self.db_session_factory = db_session_factory
        self.minio_client = minio_client
        self.billing_manager = billing_manager

        # Export settings
        self.max_file_size_mb = 100  # Max export file size
        self.default_expiry_hours = 24  # Default download expiry
        self.cleanup_interval_hours = 6  # Cleanup frequency

        # Storage configuration
        self.export_bucket = "predator-exports"
        self.temp_dir = Path("/tmp/predator_exports")
        self.temp_dir.mkdir(exist_ok=True)

    async def submit_export_request(self, request: ExportRequest) -> str:
        """
        Submit export request for async processing.

        Args:
            request: Export request configuration

        Returns:
            str: Task ID for tracking progress
        """
        try:
            # Set defaults
            if not request.created_at:
                request.created_at = datetime.now(timezone.utc)
            if not request.expires_at:
                request.expires_at = request.created_at + timedelta(hours=self.default_expiry_hours)

            # Validate request
            await self._validate_export_request(request)

            # Record billing for export request
            if self.billing_manager:
                from .billing_manager import UsageRecord, UsageType

                usage_record = UsageRecord(
                    user_id=request.user_id,
                    organization_id=request.organization_id,
                    usage_type=UsageType.EXPORT,
                    quantity=1,
                    unit="export",
                    timestamp=request.created_at,
                    resource_id=request.dataset_id,
                    metadata={
                        "format": request.format.value,
                        "compressed": request.compress,
                        "max_rows": request.max_rows,
                    },
                )

                # Check quota and record usage
                quota_ok = await self.billing_manager.record_usage(usage_record)
                if not quota_ok:
                    raise Exception("Export quota exceeded")

            # Store request in Redis
            request_key = f"export_request:{request.request_id}"
            await self.redis.setex(
                request_key, 86400, json.dumps(asdict(request), default=str)  # 24 hours TTL
            )

            # Submit Celery task
            task = process_export_task.delay(request.request_id)

            # Store task ID mapping
            task_key = f"export_task:{request.request_id}"
            await self.redis.setex(task_key, 86400, task.id)

            logger.info(f"Export request submitted: {request.request_id} -> {task.id}")
            return task.id

        except Exception as e:
            logger.error(f"Error submitting export request: {e}")
            raise

    async def _validate_export_request(self, request: ExportRequest):
        """Validate export request parameters."""
        # Check if dataset exists and user has access
        async with self.db_session_factory() as session:
            result = await session.execute(
                text(
                    """
                    SELECT id, row_count, size_mb 
                    FROM datasets 
                    WHERE id = :dataset_id AND user_id = :user_id
                """
                ),
                {"dataset_id": request.dataset_id, "user_id": request.user_id},
            )

            row = result.fetchone()
            if not row:
                raise Exception("Dataset not found or access denied")

            # Check size limits
            dataset_size_mb = row[2] or 0
            if dataset_size_mb > self.max_file_size_mb:
                raise Exception(
                    f"Dataset too large for export: {dataset_size_mb}MB > {self.max_file_size_mb}MB"
                )

            # Check row count limits
            if request.max_rows and request.max_rows > 1000000:  # 1M row limit
                raise Exception("Row limit too high (max: 1,000,000)")

    async def get_export_status(self, request_id: str) -> ExportResult:
        """Get export task status and result."""
        try:
            # Get task ID
            task_key = f"export_task:{request_id}"
            task_id = await self.redis.get(task_key)

            if not task_id:
                return ExportResult(
                    request_id=request_id,
                    status=ExportStatus.FAILED,
                    error_message="Export request not found",
                )

            # Get Celery task result
            task_result = AsyncResult(task_id.decode(), app=celery_app)

            # Check Redis for cached result
            result_key = f"export_result:{request_id}"
            cached_result = await self.redis.get(result_key)

            if cached_result:
                result_data = json.loads(cached_result)
                return ExportResult(**result_data)

            # Build result from Celery task
            if task_result.state == "PENDING":
                status = ExportStatus.PENDING
            elif task_result.state == "PROGRESS":
                status = ExportStatus.PROCESSING
            elif task_result.state == "SUCCESS":
                status = ExportStatus.COMPLETED
            else:
                status = ExportStatus.FAILED

            result = ExportResult(
                request_id=request_id,
                status=status,
                error_message=str(task_result.info) if task_result.failed() else None,
            )

            # If completed, get file info
            if status == ExportStatus.COMPLETED and task_result.successful():
                task_info = task_result.result
                result.file_path = task_info.get("file_path")
                result.file_size_bytes = task_info.get("file_size_bytes")
                result.row_count = task_info.get("row_count")
                result.completed_at = datetime.fromisoformat(task_info.get("completed_at"))
                result.expires_at = datetime.fromisoformat(task_info.get("expires_at"))

                # Generate signed download URL
                if result.file_path:
                    result.download_url = await self._generate_signed_url(result.file_path)

            # Cache result for faster retrieval
            await self.redis.setex(
                result_key, 3600, json.dumps(asdict(result), default=str)  # 1 hour cache
            )

            return result

        except Exception as e:
            logger.error(f"Error getting export status: {e}")
            return ExportResult(
                request_id=request_id, status=ExportStatus.FAILED, error_message=str(e)
            )

    async def _generate_signed_url(self, file_path: str, expires_in_hours: int = 24) -> str:
        """Generate signed URL for secure file download."""
        try:
            if self.minio_client:
                # Generate MinIO presigned URL
                expires = timedelta(hours=expires_in_hours)
                url = self.minio_client.presigned_get_object(
                    self.export_bucket, file_path, expires=expires
                )
                return url
            else:
                # Generate simple signed URL with hash
                expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)
                signature = hashlib.sha256(
                    f"{file_path}:{expires_at.timestamp()}:export_secret".encode()
                ).hexdigest()[:16]

                return f"/api/export/download/{file_path}?expires={int(expires_at.timestamp())}&sig={signature}"

        except Exception as e:
            logger.error(f"Error generating signed URL: {e}")
            return f"/api/export/download/{file_path}"

    async def list_user_exports(self, user_id: str, limit: int = 50) -> List[ExportResult]:
        """List user's recent export requests."""
        try:
            exports = []

            # Get export request keys for user
            pattern = "export_request:*"
            keys = await self.redis.keys(pattern)

            for key in keys[:limit]:
                try:
                    request_data = await self.redis.get(key)
                    if request_data:
                        request_info = json.loads(request_data)
                        if request_info.get("user_id") == user_id:
                            request_id = request_info["request_id"]
                            export_result = await self.get_export_status(request_id)
                            exports.append(export_result)
                except Exception:
                    continue

            # Sort by created_at descending
            exports.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
            return exports

        except Exception as e:
            logger.error(f"Error listing user exports: {e}")
            return []

    async def cleanup_expired_exports(self):
        """Clean up expired export files and cache entries."""
        try:
            now = datetime.now(timezone.utc)
            cleaned_count = 0

            # Find expired exports
            pattern = "export_result:*"
            keys = await self.redis.keys(pattern)

            for key in keys:
                try:
                    result_data = await self.redis.get(key)
                    if result_data:
                        result_info = json.loads(result_data)
                        expires_at = datetime.fromisoformat(result_info.get("expires_at", ""))

                        if now > expires_at:
                            # Delete file from storage
                            file_path = result_info.get("file_path")
                            if file_path:
                                await self._delete_export_file(file_path)

                            # Remove from cache
                            await self.redis.delete(key)
                            cleaned_count += 1

                except Exception as e:
                    logger.error(f"Error cleaning up export {key}: {e}")
                    continue

            logger.info(f"Cleaned up {cleaned_count} expired exports")
            return cleaned_count

        except Exception as e:
            logger.error(f"Error in export cleanup: {e}")
            return 0

    async def _delete_export_file(self, file_path: str):
        """Delete export file from storage."""
        try:
            if self.minio_client:
                # Delete from MinIO
                self.minio_client.remove_object(self.export_bucket, file_path)
            else:
                # Delete from local filesystem
                local_path = self.temp_dir / file_path
                if local_path.exists():
                    local_path.unlink()

        except Exception as e:
            logger.error(f"Error deleting export file {file_path}: {e}")


# Celery Tasks
@celery_app.task(bind=True)
def process_export_task(self, request_id: str):
    """
    Celery task to process export request.
    Runs in separate worker process.
    """
    try:
        # Get export worker manager (reinitialize in worker)
        from .main import get_export_worker  # Avoid circular imports

        export_worker = get_export_worker()

        if not export_worker:
            raise Exception("Export worker not available")

        # Update task status
        self.update_state(state="PROGRESS", meta={"status": "Starting export..."})

        # Process the export (run in async context)
        result = asyncio.run(_process_export_async(export_worker, request_id, self))
        return result

    except Exception as e:
        logger.error(f"Export task failed: {e}")
        raise


async def _process_export_async(export_worker, request_id: str, task):
    """Async export processing logic."""
    try:
        # Get export request
        request_key = f"export_request:{request_id}"
        request_data = await export_worker.redis.get(request_key)

        if not request_data:
            raise Exception("Export request not found")

        request_info = json.loads(request_data)
        request = ExportRequest(**request_info)

        # Update progress
        task.update_state(state="PROGRESS", meta={"status": "Loading dataset..."})

        # Load data from database
        data = await _load_dataset_data(export_worker, request)

        task.update_state(state="PROGRESS", meta={"status": "Generating export file..."})

        # Generate export file
        file_info = await _generate_export_file(export_worker, request, data)

        task.update_state(state="PROGRESS", meta={"status": "Finalizing..."})

        # Upload to storage if using MinIO
        if export_worker.minio_client:
            await _upload_to_storage(export_worker, file_info)

        completed_at = datetime.now(timezone.utc)
        expires_at = completed_at + timedelta(hours=export_worker.default_expiry_hours)

        result = {
            "request_id": request_id,
            "file_path": file_info["file_path"],
            "file_size_bytes": file_info["file_size"],
            "row_count": len(data),
            "completed_at": completed_at.isoformat(),
            "expires_at": expires_at.isoformat(),
        }

        # Cache result
        result_key = f"export_result:{request_id}"
        await export_worker.redis.setex(
            result_key, 86400, json.dumps(result, default=str)  # 24 hours
        )

        return result

    except Exception as e:
        logger.error(f"Export processing failed: {e}")
        raise


async def _load_dataset_data(export_worker, request: ExportRequest) -> pd.DataFrame:
    """Load dataset data based on export request."""
    try:
        # Build SQL query with filters
        base_query = "SELECT * FROM dataset_records WHERE dataset_id = :dataset_id"
        params = {"dataset_id": request.dataset_id}

        # Add column selection
        if request.columns:
            columns_str = ", ".join(request.columns)
            base_query = base_query.replace("*", columns_str)

        # Add filters
        if request.filters:
            for field, value in request.filters.items():
                base_query += f" AND {field} = :{field}"
                params[field] = value

        # Add row limit
        if request.max_rows:
            base_query += f" LIMIT {request.max_rows}"

        # Execute query
        async with export_worker.db_session_factory() as session:
            result = await session.execute(text(base_query), params)
            rows = result.fetchall()
            columns = result.keys()

        # Convert to pandas DataFrame
        data = pd.DataFrame(rows, columns=columns)
        return data

    except Exception as e:
        logger.error(f"Error loading dataset data: {e}")
        raise


async def _generate_export_file(
    export_worker, request: ExportRequest, data: pd.DataFrame
) -> Dict[str, Any]:
    """Generate export file in requested format."""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_{request.dataset_id}_{timestamp}.{request.format.value}"

        if request.compress:
            filename += ".zip"

        file_path = export_worker.temp_dir / filename

        # Generate file based on format
        if request.format == ExportFormat.JSON:
            data.to_json(file_path, orient="records", indent=2)
        elif request.format == ExportFormat.CSV:
            data.to_csv(file_path, index=False)
        elif request.format == ExportFormat.XLSX:
            data.to_excel(file_path, index=False)
        elif request.format == ExportFormat.PARQUET:
            data.to_parquet(file_path, index=False)
        elif request.format == ExportFormat.XML:
            data.to_xml(file_path, index=False)
        else:
            raise Exception(f"Unsupported export format: {request.format}")

        # Compress if requested
        if request.compress:
            original_path = file_path.with_suffix("")  # Remove .zip
            with zipfile.ZipFile(file_path, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.write(original_path, original_path.name)
            original_path.unlink()  # Delete uncompressed file

        file_size = file_path.stat().st_size

        return {"file_path": filename, "local_path": str(file_path), "file_size": file_size}

    except Exception as e:
        logger.error(f"Error generating export file: {e}")
        raise


async def _upload_to_storage(export_worker, file_info):
    """Upload export file to MinIO storage."""
    try:
        if export_worker.minio_client:
            export_worker.minio_client.fput_object(
                export_worker.export_bucket, file_info["file_path"], file_info["local_path"]
            )

            # Delete local file after upload
            Path(file_info["local_path"]).unlink()

    except Exception as e:
        logger.error(f"Error uploading to storage: {e}")
        raise


# Global export worker instance
export_worker = None


def get_export_worker() -> Optional[ExportWorkerManager]:
    """Get global export worker instance."""
    return export_worker


def initialize_export_worker(
    redis_client: aioredis.Redis, db_session_factory, minio_client=None, billing_manager=None
):
    """Initialize global export worker."""
    global export_worker
    export_worker = ExportWorkerManager(
        redis_client, db_session_factory, minio_client, billing_manager
    )
    return export_worker
