"""Compatibility shim for ETL trigger used by FastAPI routes/tests.

Re-exports EtlTrigger from backend.app.fastapi_app.etl_trigger when available.
Provides a small no-op fallback used in dev/test mode.
"""

try:
    from backend.app.fastapi_app.etl_trigger import EtlTrigger  # type: ignore
except Exception:
    from typing import Any, Dict

    class EtlTrigger:
        def __init__(self, logger: Any = None):
            self.logger = logger

        def trigger(self, payload: Dict[str, Any]) -> None:
            # No-op fallback for local test environments
            if self.logger and hasattr(self.logger, "emit"):
                try:
                    self.logger.emit("etl.trigger", payload)
                except Exception:
                    pass
            return


__all__ = ["EtlTrigger"]
