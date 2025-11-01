"""Simple JSON-lines event logger simulating Kafka events."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


class EventLogger:
    def __init__(self, log_path: Path) -> None:
        self.log_path = log_path
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def emit(self, event_type: str, payload: Dict[str, Any]) -> None:
        record = {"type": event_type, **payload}
        with self.log_path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(record, ensure_ascii=False) + "\n")
