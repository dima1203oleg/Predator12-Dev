from __future__ import annotations

import time
from typing import Any


def example_task(payload: dict[str, Any]) -> dict[str, Any]:
    """A simple example RQ task that simulates work."""
    start = time.time()
    # simulate work
    time.sleep(float(payload.get("sleep", 0.5)))
    return {
        "status": "ok",
        "echo": payload,
        "duration_sec": round(time.time() - start, 3),
    }
