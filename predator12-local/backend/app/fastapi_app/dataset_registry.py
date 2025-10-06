"""Dataset registry backed by committed manifest files."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional


class DatasetRegistry:
    def __init__(self, committed_root: Path) -> None:
        self.committed_root = committed_root

    def list_datasets(self) -> List[Dict[str, str]]:
        if not self.committed_root.exists():
            return []

        manifests: List[Dict[str, str]] = []
        for manifest_path in self.committed_root.glob("*/**/*.json"):
            try:
                content = json.loads(manifest_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            entry = {
                "dataset": content.get("dataset", manifest_path.parent.name),
                "upload_id": content.get("upload_id"),
                "stored_file": content.get("stored_file"),
                "object_url": content.get("object_url"),
                "manifest": str(manifest_path),
                "status": content.get("status", "ready"),
            }
            manifests.append(entry)
        return sorted(manifests, key=lambda item: item.get("dataset", ""))

    def get_entry(self, upload_id: str) -> Optional[Dict[str, str]]:
        if not self.committed_root.exists():
            return None
        for manifest_path in self.committed_root.glob("*/**/*.json"):
            try:
                content = json.loads(manifest_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            if content.get("upload_id") == upload_id:
                return {
                    "dataset": content.get("dataset", manifest_path.parent.name),
                    "upload_id": content.get("upload_id"),
                    "stored_file": content.get("stored_file"),
                    "object_url": content.get("object_url"),
                    "manifest": str(manifest_path),
                    "status": content.get("status", "ready"),
                }
        return None
