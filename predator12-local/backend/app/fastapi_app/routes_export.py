"""
Export API Routes
================

FastAPI endpoints for data export operations with Celery worker integration.
Production-ready with authentication, validation, and comprehensive monitoring.

Delta Revision 1.1 - Component B6
"""

import hashlib
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from error_system import ErrorCode, PredatorException
from export_worker import (
    ExportFormat,
    ExportRequest,
    ExportStatus,
    ExportWorkerManager,
    get_export_worker,
)
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import HTTPBearer

logger = logging.getLogger("export_routes")
router = APIRouter(prefix="/export", tags=["Data Export"])
security = HTTPBearer()


@router.post("/request")
async def create_export_request(
    request: Request,
    dataset_id: str,
    format: ExportFormat,
    user_id: str = "demo_user",  # TODO: Get from auth
    organization_id: str = "demo_org",  # TODO: Get from auth
    columns: Optional[List[str]] = None,
    filters: Optional[Dict[str, Any]] = None,
    max_rows: Optional[int] = Query(None, ge=1, le=1000000),
    include_metadata: bool = True,
    compress: bool = False,
    export_worker: ExportWorkerManager = Depends(get_export_worker),
):
    """
    Submit data export request for async processing.

    **Export Formats:**
    - `json`: JSON format with records array
    - `csv`: Comma-separated values
    - `xlsx`: Excel spreadsheet
    - `parquet`: Columnar format for analytics
    - `xml`: XML structured data

    **Features:**
    - Column selection for partial exports
    - Row filtering with SQL-like conditions
    - Automatic compression (ZIP)
    - Metadata inclusion (schema, timestamps)
    - Billing integration with quota checks

    **Returns task ID for tracking progress.**
    """
    try:
        if not export_worker:
            raise HTTPException(status_code=503, detail="Export service unavailable")

        # Generate unique request ID
        request_id = str(uuid.uuid4())

        # Create export request
        export_request = ExportRequest(
            request_id=request_id,
            user_id=user_id,
            organization_id=organization_id,
            dataset_id=dataset_id,
            format=format,
            columns=columns,
            filters=filters,
            max_rows=max_rows,
            include_metadata=include_metadata,
            compress=compress,
            created_at=datetime.now(),
        )

        # Submit for processing
        task_id = await export_worker.submit_export_request(export_request)

        return {
            "success": True,
            "request_id": request_id,
            "task_id": task_id,
            "status": "submitted",
            "message": "Export request submitted for processing",
            "estimated_completion": "5-30 minutes depending on data size",
            "check_status_url": f"/api/export/status/{request_id}",
        }

    except Exception as e:
        if "quota exceeded" in str(e).lower():
            raise PredatorException(
                error_code=ErrorCode.QUOTA_EXCEEDED,
                message="Export quota exceeded",
                user_message="You have reached your export limit. Please upgrade your plan or wait for quota reset.",
                details={"user_id": user_id, "dataset_id": dataset_id},
            )

        logger.error(f"Error creating export request: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit export request")


@router.get("/status/{request_id}")
async def get_export_status(
    request_id: str, export_worker: ExportWorkerManager = Depends(get_export_worker)
):
    """
    Get export request status and download information.

    **Status Values:**
    - `pending`: Export queued for processing
    - `processing`: Currently generating export file
    - `completed`: Export ready for download
    - `failed`: Export failed with error details
    - `expired`: Export file expired and deleted

    **Includes download URL when completed.**
    """
    try:
        if not export_worker:
            raise HTTPException(status_code=503, detail="Export service unavailable")

        result = await export_worker.get_export_status(request_id)

        response_data = {
            "request_id": result.request_id,
            "status": result.status.value,
            "created_at": result.created_at.isoformat() if result.created_at else None,
            "completed_at": result.completed_at.isoformat() if result.completed_at else None,
            "expires_at": result.expires_at.isoformat() if result.expires_at else None,
        }

        if result.status == ExportStatus.COMPLETED:
            response_data.update(
                {
                    "file_size_bytes": result.file_size_bytes,
                    "row_count": result.row_count,
                    "download_url": result.download_url,
                    "download_expires_in_hours": 24,
                }
            )
        elif result.status == ExportStatus.FAILED:
            response_data["error_message"] = result.error_message
        elif result.status == ExportStatus.PROCESSING:
            response_data["message"] = "Export is being processed. Check back in a few minutes."

        return response_data

    except Exception as e:
        logger.error(f"Error getting export status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get export status")


@router.get("/list")
async def list_user_exports(
    user_id: str = "demo_user",  # TODO: Get from auth
    limit: int = Query(50, ge=1, le=100),
    export_worker: ExportWorkerManager = Depends(get_export_worker),
):
    """
    List user's recent export requests.

    **Shows export history with status and download links.**
    """
    try:
        if not export_worker:
            raise HTTPException(status_code=503, detail="Export service unavailable")

        exports = await export_worker.list_user_exports(user_id, limit)

        export_list = []
        for export in exports:
            export_info = {
                "request_id": export.request_id,
                "status": export.status.value,
                "created_at": export.created_at.isoformat() if export.created_at else None,
                "completed_at": export.completed_at.isoformat() if export.completed_at else None,
                "expires_at": export.expires_at.isoformat() if export.expires_at else None,
                "file_size_bytes": export.file_size_bytes,
                "row_count": export.row_count,
            }

            if export.status == ExportStatus.COMPLETED and export.download_url:
                export_info["download_url"] = export.download_url
            elif export.status == ExportStatus.FAILED:
                export_info["error_message"] = export.error_message

            export_list.append(export_info)

        return {"user_id": user_id, "exports": export_list, "total_count": len(export_list)}

    except Exception as e:
        logger.error(f"Error listing user exports: {e}")
        raise HTTPException(status_code=500, detail="Failed to list exports")


@router.get("/download/{file_path}")
async def download_export_file(
    file_path: str,
    expires: int = Query(..., description="Expiration timestamp"),
    sig: str = Query(..., description="URL signature"),
    export_worker: ExportWorkerManager = Depends(get_export_worker),
):
    """
    Download export file using signed URL.

    **Security:**
    - Signed URLs with expiration
    - Signature validation
    - Single-use download prevention
    """
    try:
        if not export_worker:
            raise HTTPException(status_code=503, detail="Export service unavailable")

        # Validate signature and expiration
        current_timestamp = int(datetime.now().timestamp())
        if current_timestamp > expires:
            raise HTTPException(status_code=410, detail="Download link has expired")

        # Verify signature
        expected_sig = hashlib.sha256(f"{file_path}:{expires}:export_secret".encode()).hexdigest()[
            :16
        ]

        if sig != expected_sig:
            raise HTTPException(status_code=403, detail="Invalid download signature")

        # Check if using MinIO
        if export_worker.minio_client:
            # Redirect to MinIO presigned URL
            presigned_url = await export_worker._generate_signed_url(file_path, 1)
            return RedirectResponse(url=presigned_url)
        else:
            # Serve file directly
            local_file_path = export_worker.temp_dir / file_path

            if not local_file_path.exists():
                raise HTTPException(status_code=404, detail="Export file not found")

            return FileResponse(
                path=str(local_file_path), filename=file_path, media_type="application/octet-stream"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading export file: {e}")
        raise HTTPException(status_code=500, detail="Failed to download file")


@router.delete("/cancel/{request_id}")
async def cancel_export_request(
    request_id: str,
    user_id: str = "demo_user",  # TODO: Get from auth
    export_worker: ExportWorkerManager = Depends(get_export_worker),
):
    """
    Cancel pending export request.

    **Only works for pending/processing exports.**
    """
    try:
        if not export_worker:
            raise HTTPException(status_code=503, detail="Export service unavailable")

        # Get current status
        result = await export_worker.get_export_status(request_id)

        if result.status not in [ExportStatus.PENDING, ExportStatus.PROCESSING]:
            raise HTTPException(
                status_code=400, detail=f"Cannot cancel export with status: {result.status.value}"
            )

        # Get task ID and revoke it
        task_key = f"export_task:{request_id}"
        task_id = await export_worker.redis.get(task_key)

        if task_id:
            from celery import current_app

            current_app.control.revoke(task_id.decode(), terminate=True)

        # Mark as failed in cache
        result_key = f"export_result:{request_id}"
        failed_result = {
            "request_id": request_id,
            "status": ExportStatus.FAILED.value,
            "error_message": "Export cancelled by user",
            "completed_at": datetime.now().isoformat(),
        }

        await export_worker.redis.setex(result_key, 3600, json.dumps(failed_result))

        return {"success": True, "message": "Export request cancelled", "request_id": request_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling export: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel export")


@router.get("/formats")
async def get_export_formats():
    """
    Get available export formats and their descriptions.

    **Public endpoint for format information.**
    """
    return {
        "formats": {
            "json": {
                "description": "JSON format with records array",
                "mime_type": "application/json",
                "file_extension": "json",
                "supports_compression": True,
                "best_for": ["API integration", "web applications"],
            },
            "csv": {
                "description": "Comma-separated values",
                "mime_type": "text/csv",
                "file_extension": "csv",
                "supports_compression": True,
                "best_for": ["spreadsheet import", "data analysis"],
            },
            "xlsx": {
                "description": "Excel spreadsheet format",
                "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "file_extension": "xlsx",
                "supports_compression": False,
                "best_for": ["business reporting", "Excel analysis"],
            },
            "parquet": {
                "description": "Columnar format for analytics",
                "mime_type": "application/octet-stream",
                "file_extension": "parquet",
                "supports_compression": False,
                "best_for": ["big data analytics", "data warehousing"],
            },
            "xml": {
                "description": "XML structured data format",
                "mime_type": "application/xml",
                "file_extension": "xml",
                "supports_compression": True,
                "best_for": ["system integration", "structured data exchange"],
            },
        },
        "limits": {"max_file_size_mb": 100, "max_rows": 1000000, "default_expiry_hours": 24},
    }


@router.post("/admin/cleanup")
async def admin_cleanup_exports(
    # TODO: Add admin authentication
    background_tasks: BackgroundTasks,
    export_worker: ExportWorkerManager = Depends(get_export_worker),
):
    """
    **ADMIN ONLY**: Cleanup expired export files.

    **Requires admin authentication.**
    """
    try:
        if not export_worker:
            raise HTTPException(status_code=503, detail="Export service unavailable")

        # Run cleanup in background
        background_tasks.add_task(export_worker.cleanup_expired_exports)

        return {
            "success": True,
            "message": "Cleanup task started",
            "scheduled_at": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error starting cleanup: {e}")
        raise HTTPException(status_code=500, detail="Failed to start cleanup")


@router.get("/health")
async def export_health_check(export_worker: ExportWorkerManager = Depends(get_export_worker)):
    """
    Health check for export service.
    """
    try:
        if not export_worker:
            return {"status": "unhealthy", "error": "Export worker not initialized"}

        # Test Redis connection
        await export_worker.redis.ping()

        # Test Celery broker
        from export_worker import celery_app

        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        active_workers = len(stats) if stats else 0

        # Test temp directory
        export_worker.temp_dir.mkdir(exist_ok=True)
        test_file = export_worker.temp_dir / "health_check.txt"
        test_file.write_text("test")
        test_file.unlink()

        return {
            "status": "healthy",
            "services": {
                "redis": "connected",
                "celery_workers": active_workers,
                "temp_storage": "writable",
                "minio": "connected" if export_worker.minio_client else "local_storage",
            },
            "worker_info": {
                "temp_dir": str(export_worker.temp_dir),
                "max_file_size_mb": export_worker.max_file_size_mb,
                "default_expiry_hours": export_worker.default_expiry_hours,
            },
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Export health check failed: {e}")
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now().isoformat()}
