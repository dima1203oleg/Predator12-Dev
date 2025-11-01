"""Utilities for handling chunked uploads and assembling files."""

from __future__ import annotations

import base64
import binascii
import json
import shutil
from pathlib import Path
from typing import Dict, Optional
from uuid import UUID

from fastapi import HTTPException, status


class ChunkStorage:
    """Simple filesystem-backed chunk storage.

    In production, chunks would be persisted to an object store (e.g. MinIO/S3).
    This class keeps things local while preserving the contract and validation.
    """

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def _upload_dir(self, upload_id: UUID) -> Path:
        return self.root / str(upload_id)

    def _metadata_path(self, upload_id: UUID) -> Path:
        return self._upload_dir(upload_id) / "metadata.json"

    def _load_metadata(self, upload_id: UUID) -> Dict[str, object]:
        metadata_path = self._metadata_path(upload_id)
        if not metadata_path.exists():
            return {}
        return json.loads(metadata_path.read_text(encoding="utf-8"))

    def _write_metadata(self, upload_id: UUID, metadata: Dict[str, object]) -> None:
        metadata_path = self._metadata_path(upload_id)
        metadata_path.parent.mkdir(parents=True, exist_ok=True)
        metadata_path.write_text(
            json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    def write_chunk(
        self,
        upload_id: UUID,
        *,
        chunk_index: int,
        total_chunks: int,
        file_name: str,
        chunk_bytes: bytes,
    ) -> Dict[str, object]:
        if chunk_index < 0 or chunk_index >= total_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="chunk_index must be between 0 and total_chunks - 1",
            )

        upload_dir = self._upload_dir(upload_id)
        upload_dir.mkdir(parents=True, exist_ok=True)

        chunk_path = upload_dir / f"{chunk_index:06d}.part"
        chunk_path.write_bytes(chunk_bytes)

        metadata = self._load_metadata(upload_id)
        metadata.setdefault("file_name", file_name)
        metadata.setdefault("total_chunks", total_chunks)
        existing_received = metadata.get("received_chunks", [])
        if not isinstance(existing_received, list):
            existing_received = list(existing_received)
        metadata["received_chunks"] = existing_received

        # Validate consistency of total_chunks/file_name across requests
        if metadata["file_name"] != file_name:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="file_name mismatch for upload")
        if metadata["total_chunks"] != total_chunks:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail="total_chunks mismatch for upload"
            )

        received = set(existing_received)
        received.add(chunk_index)
        metadata["received_chunks"] = sorted(received)

        self._write_metadata(upload_id, metadata)

        completed = len(received) == total_chunks
        file_path: Optional[str] = None
        if completed:
            file_path = str(self._assemble_file(upload_id, metadata))

        return {
            "upload_id": str(upload_id),
            "received_chunks": len(received),
            "status": "completed" if completed else "pending",
            "file_path": file_path,
        }

    def _assemble_file(self, upload_id: UUID, metadata: Dict[str, object]) -> Path:
        upload_dir = self._upload_dir(upload_id)
        final_path = upload_dir / metadata["file_name"]  # type: ignore[index]
        if final_path.exists():
            return final_path

        chunk_files = sorted(upload_dir.glob("*.part"))
        if len(chunk_files) != metadata.get("total_chunks"):
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Upload incomplete")

        with final_path.open("wb") as target:
            for chunk_file in chunk_files:
                target.write(chunk_file.read_bytes())

        return final_path

    def get_status(self, upload_id: UUID) -> Dict[str, object]:
        metadata = self._load_metadata(upload_id)
        if not metadata:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Upload not found")

        received = metadata.get("received_chunks", [])
        total_chunks = metadata.get("total_chunks", 0)
        status_value = "completed" if len(received) == total_chunks and total_chunks else "pending"
        file_name = metadata.get("file_name")
        file_path = None
        assembled_file = self._upload_dir(upload_id) / file_name if file_name else None
        if assembled_file and assembled_file.exists():
            file_path = str(assembled_file)
        return {
            "upload_id": str(upload_id),
            "file_name": file_name,
            "total_chunks": total_chunks,
            "received_chunks": len(received),
            "status": status_value,
            "file_path": file_path,
        }

    def finalize_upload(
        self,
        upload_id: UUID,
        *,
        dataset: str,
        destination_root: Path,
        object_storage,
        bucket: str,
    ) -> Dict[str, object]:
        status_payload = self.get_status(upload_id)
        if status_payload["status"] != "completed":
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Upload is not complete")

        source_path = status_payload.get("file_path")
        if not source_path:
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Assembled file missing")

        destination_root.mkdir(parents=True, exist_ok=True)
        dataset_slug = dataset.strip().replace(" ", "_") or "dataset"
        dataset_dir = destination_root / dataset_slug
        dataset_dir.mkdir(parents=True, exist_ok=True)

        source = Path(source_path)
        destination_file = dataset_dir / source.name

        # Avoid overwriting existing files by appending suffix
        if destination_file.exists():
            destination_file = dataset_dir / f"{source.stem}_{upload_id}{source.suffix}"

        shutil.copy2(source, destination_file)

        object_key = f"{dataset_slug}/{destination_file.name}"
        object_url = object_storage.upload_file(
            bucket=bucket, key=object_key, source_path=destination_file
        )

        manifest = {
            "upload_id": status_payload["upload_id"],
            "dataset": dataset,
            "original_file": source_path,
            "stored_file": str(destination_file),
            "object_url": object_url,
            "status": "ready",
        }

        manifest_path = dataset_dir / f"{upload_id}.json"
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
        )

        return {
            "upload_id": status_payload["upload_id"],
            "dataset": dataset,
            "stored_file": str(destination_file),
            "manifest": str(manifest_path),
            "object_url": object_url,
        }


def decode_chunk(encoded_chunk: str) -> bytes:
    try:
        return base64.b64decode(encoded_chunk, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid base64 chunk") from exc
