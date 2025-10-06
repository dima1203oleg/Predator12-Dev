import base64
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from fastapi_app.event_logger import EventLogger
from fastapi_app.ingest_manager import ChunkStorage
from fastapi_app.main import app
from fastapi_app.object_storage import ObjectStorageClient
from fastapi_app.routes_ingest import (
    get_chunk_storage,
    get_commit_root,
    get_object_storage,
    get_event_logger,
)


def encode_chunk(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")


def test_chunked_upload_roundtrip(tmp_path: Path) -> None:
    uploads_root = tmp_path / "uploads"
    committed_root = tmp_path / "committed"
    object_storage_root = tmp_path / "object_storage"
    event_log_path = tmp_path / "events.log"

    app.dependency_overrides[get_chunk_storage] = lambda: ChunkStorage(uploads_root)
    app.dependency_overrides[get_commit_root] = lambda: committed_root
    app.dependency_overrides[get_object_storage] = lambda: ObjectStorageClient(object_storage_root)
    app.dependency_overrides[get_event_logger] = lambda: EventLogger(event_log_path)

    client = TestClient(app)

    file_bytes = b"PredatorAnalytics" * 100
    chunk_size = len(file_bytes) // 3
    chunks = [file_bytes[i : i + chunk_size] for i in range(0, len(file_bytes), chunk_size)]
    total_chunks = len(chunks)

    response = client.post(
        "/ingest/upload",
        json={
            "file_name": "sample.csv",
            "chunk_index": 0,
            "total_chunks": total_chunks,
            "chunk_base64": encode_chunk(chunks[0]),
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "pending"
    upload_id = payload["upload_id"]

    for index, chunk in enumerate(chunks[1:], start=1):
        response = client.post(
            "/ingest/upload",
            json={
                "upload_id": upload_id,
                "file_name": "sample.csv",
                "chunk_index": index,
                "total_chunks": total_chunks,
                "chunk_base64": encode_chunk(chunk),
            },
        )
        assert response.status_code == 200

    final_payload = response.json()
    assert final_payload["status"] == "completed"
    assert final_payload["file_path"] is not None

    assembled_path = Path(final_payload["file_path"])
    assert assembled_path.exists()
    assert assembled_path.read_bytes() == file_bytes

    status_response = client.get(f"/ingest/status/{upload_id}")
    assert status_response.status_code == 200
    status_payload = status_response.json()
    assert status_payload["status"] == "completed"
    assert status_payload["received_chunks"] == total_chunks

    commit_response = client.post(
        "/ingest/commit",
        json={
            "upload_id": upload_id,
            "dataset": "customs-test",
        },
    )
    assert commit_response.status_code == 200
    commit_payload = commit_response.json()
    stored_file = Path(commit_payload["stored_file"])
    manifest_path = Path(commit_payload["manifest"])
    object_url = commit_payload["object_url"]

    assert stored_file.exists()
    assert stored_file.read_bytes() == file_bytes
    assert manifest_path.exists()
    assert object_url.startswith("local://")

    bucket, key = object_url.replace("local://", "").split("/", 1)
    object_file = object_storage_root / bucket / key
    assert object_file.exists()
    assert object_file.read_bytes() == file_bytes

    assert event_log_path.exists()
    events = [line for line in event_log_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert events

    trigger_response = client.post(
        f"/ingest/datasets/{upload_id}/trigger",
        json={"parameters": {"priority": "high"}},
    )
    assert trigger_response.status_code == 200
    trigger_payload = trigger_response.json()
    assert trigger_payload["status"] == "queued"
    assert trigger_payload["upload_id"] == upload_id

    trigger_events = [line for line in event_log_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert len(trigger_events) >= 2
    assert any('"type": "etl.trigger"' in line for line in trigger_events)

    list_response = client.get("/ingest/datasets")
    assert list_response.status_code == 200
    datasets = list_response.json()
    assert any(entry["dataset"] == "customs-test" for entry in datasets)

    app.dependency_overrides.clear()
    get_chunk_storage.cache_clear()  # type: ignore[attr-defined]
    get_commit_root.cache_clear()  # type: ignore[attr-defined]
    get_object_storage.cache_clear()  # type: ignore[attr-defined]
    get_event_logger.cache_clear()  # type: ignore[attr-defined]
