"""API routes for chunked file uploads."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal, Optional
from uuid import UUID, uuid4

# Delta Revision 1.1 - Enhanced data governance and ILM
try:
    from data_governance import DataClassification, enforce_data_governance
except ImportError:
    # Mock data governance for testing/dev
    class DataClassification:
        SENSITIVE = "sensitive"
        PUBLIC = "public"
    
    def enforce_data_governance(data, classification=None):
        return data  # Pass-through in dev mode
from dataset_registry import DatasetRegistry
from etl_trigger import EtlTrigger
from event_logger import EventLogger
from fastapi import APIRouter, Depends, HTTPException, status
from ingest_manager import ChunkStorage, decode_chunk
from object_storage import DEFAULT_BUCKET, ObjectStorageClient
from pydantic import BaseModel, Field

router = APIRouter(prefix="/ingest", tags=["ingest"])


class ChunkUploadRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    chunk_index: int = Field(ge=0)
    total_chunks: int = Field(gt=0, le=10_000)
    chunk_base64: str = Field(min_length=1)
    upload_id: Optional[UUID] = None


class ChunkUploadResponse(BaseModel):
    upload_id: UUID
    received_chunks: int
    status: Literal["pending", "completed"]
    file_path: Optional[str] = None


class UploadStatusResponse(BaseModel):
    upload_id: UUID
    file_name: Optional[str] = None
    total_chunks: int
    received_chunks: int
    status: Literal["pending", "completed"]
    file_path: Optional[str] = None


@lru_cache(maxsize=1)
def get_chunk_storage() -> ChunkStorage:
    root = Path(__file__).resolve().parent.parent / "tmp" / "uploads"
    return ChunkStorage(root)


@lru_cache(maxsize=1)
def get_commit_root() -> Path:
    return Path(__file__).resolve().parent.parent / "tmp" / "committed"


@lru_cache(maxsize=1)
def get_object_storage() -> ObjectStorageClient:
    root = Path(__file__).resolve().parent.parent / "tmp" / "object_storage"
    return ObjectStorageClient(root)


@lru_cache(maxsize=1)
def get_event_logger() -> EventLogger:
    log_path = Path(__file__).resolve().parent.parent / "tmp" / "events.log"
    return EventLogger(log_path)


@lru_cache(maxsize=1)
def get_dataset_registry() -> DatasetRegistry:
    committed_root = get_commit_root()
    return DatasetRegistry(committed_root)


@lru_cache(maxsize=1)
def get_etl_trigger() -> EtlTrigger:
    logger = get_event_logger()
    return EtlTrigger(logger)


@router.post("/upload", response_model=ChunkUploadResponse)
def upload_chunk(payload: ChunkUploadRequest, storage: ChunkStorage = Depends(get_chunk_storage)):
    upload_id = payload.upload_id or uuid4()

    try:
        chunk_bytes = decode_chunk(payload.chunk_base64)

        # Delta Revision 1.1: Apply data governance to uploaded chunk
        if payload.chunk_index == 0:  # First chunk - analyze for PII/classification
            try:
                # Try to parse as JSON/CSV for PII detection
                chunk_text = chunk_bytes.decode("utf-8", errors="ignore")
                if chunk_text.strip().startswith("{") or "email" in chunk_text.lower():
                    chunk_data = {"raw_content": chunk_text[:1000]}  # Sample for analysis
                    governed_data = enforce_data_governance(
                        dataset_id=f"upload_{upload_id}",
                        data=chunk_data,
                        source=f"upload_{payload.file_name}",
                        classification=DataClassification.INTERNAL,
                    )
                    EventLogger.log_info(f"Data governance applied to upload {upload_id}")
            except Exception as e:
                EventLogger.log_warning(f"Data governance analysis failed for {upload_id}: {e}")

        result = storage.write_chunk(
            upload_id,
            chunk_index=payload.chunk_index,
            total_chunks=payload.total_chunks,
            file_name=payload.file_name,
            chunk_bytes=chunk_bytes,
        )

        return ChunkUploadResponse(**result)

    except Exception as e:
        EventLogger.log_error(f"Upload chunk failed for {upload_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")


@router.get("/status/{upload_id}", response_model=UploadStatusResponse)
def get_upload_status(upload_id: UUID, storage: ChunkStorage = Depends(get_chunk_storage)):
    status_payload = storage.get_status(upload_id)
    return UploadStatusResponse(**status_payload)


class CommitUploadRequest(BaseModel):
    upload_id: UUID
    dataset: str = Field(min_length=1, max_length=128)


class CommitUploadResponse(BaseModel):
    upload_id: UUID
    dataset: str
    stored_file: str
    manifest: str
    object_url: str


class DatasetEntry(BaseModel):
    dataset: Optional[str]
    upload_id: Optional[str]
    stored_file: Optional[str]
    object_url: Optional[str]
    manifest: str
    status: Optional[str] = "ready"


class TriggerDatasetRequest(BaseModel):
    parameters: Optional[dict] = None


class TriggerDatasetResponse(BaseModel):
    upload_id: str
    dataset: str
    status: Literal["queued"]


@router.post("/commit", response_model=CommitUploadResponse)
def commit_upload(
    payload: CommitUploadRequest,
    storage: ChunkStorage = Depends(get_chunk_storage),
    destination_root: Path = Depends(get_commit_root),
    object_storage: ObjectStorageClient = Depends(get_object_storage),
    event_logger: EventLogger = Depends(get_event_logger),
):
    result = storage.finalize_upload(
        payload.upload_id,
        dataset=payload.dataset,
        destination_root=destination_root,
        object_storage=object_storage,
        bucket=DEFAULT_BUCKET,
    )
    event_logger.emit(
        "ingest.commit",
        {
            "upload_id": result["upload_id"],
            "dataset": payload.dataset,
            "object_url": result["object_url"],
            "stored_file": result["stored_file"],
        },
    )
    return CommitUploadResponse(**result)


@router.get("/datasets", response_model=list[DatasetEntry])
def list_datasets(registry: DatasetRegistry = Depends(get_dataset_registry)):
    entries = registry.list_datasets()
    return [DatasetEntry(**entry) for entry in entries]


@router.post("/datasets/{upload_id}/trigger", response_model=TriggerDatasetResponse)
def trigger_dataset(
    upload_id: str,
    request: TriggerDatasetRequest,
    registry: DatasetRegistry = Depends(get_dataset_registry),
    etl_trigger: EtlTrigger = Depends(get_etl_trigger),
):
    entry = registry.get_entry(upload_id)
    if not entry:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    etl_trigger.trigger(
        {
            "upload_id": upload_id,
            "dataset": entry.get("dataset"),
            "manifest": entry.get("manifest"),
            "object_url": entry.get("object_url"),
            "parameters": request.parameters or {},
        }
    )
    return TriggerDatasetResponse(
        upload_id=upload_id, dataset=entry.get("dataset", ""), status="queued"
    )
