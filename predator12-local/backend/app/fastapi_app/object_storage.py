"""Placeholder object storage client to mimic MinIO/S3 interactions."""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Final


class ObjectStorageClient:
    """Stores objects on disk but mimics an object storage API."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def upload_file(self, *, bucket: str, key: str, source_path: Path) -> str:
        bucket_dir = self.root / bucket
        bucket_dir.mkdir(parents=True, exist_ok=True)

        destination = bucket_dir / key
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, destination)

        return f"local://{bucket}/{key}"


DEFAULT_BUCKET: Final[str] = "datasets"
