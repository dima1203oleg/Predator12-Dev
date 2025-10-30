"""Compatibility shim for dataset registry used by fastapi routes and tests.

Some modules import `from dataset_registry import DatasetRegistry` expecting a
top-level module. The real implementation lives under
`backend.app.fastapi_app.dataset_registry`. Re-export the class here so tests
and quick local runs work without modifying many import sites.

This is a minimal, safe shim intended for dev/test environments.
"""

try:
    # prefer the local application module
    from backend.app.fastapi_app.dataset_registry import DatasetRegistry  # type: ignore
except Exception:
    # Fallback stub: very small in-memory registry used for tests when the
    # real implementation is unavailable.
    from pathlib import Path
    from typing import Dict, List, Optional

    class DatasetRegistry:
        def __init__(self, committed_root: Path):
            self.committed_root = committed_root

        def get_entry(self, upload_id: str) -> Optional[Dict[str, str]]:
            # Simple stub: no datasets committed in stub
            return None

        def list_datasets(self) -> List[Dict[str, str]]:
            return []


__all__ = ["DatasetRegistry"]
