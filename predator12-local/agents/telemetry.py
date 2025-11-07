"""Minimal telemetry shim for agents package.

Provides a lightweight AgentTelemetry class used by imports during
tests. The real project may integrate OpenTelemetry; this shim keeps
tests/imports working in dev/workspace runs.
"""

from typing import Any, Dict, Optional


class AgentTelemetry:
    def __init__(self, service_name: str = "predator-agents"):
        self.service_name = service_name

    def record_event(self, name: str, attributes: Optional[Dict[str, Any]] = None) -> None:
        # lightweight no-op; tests only need the class to exist
        return

    def record_metric(
        self, name: str, value: float, attributes: Optional[Dict[str, Any]] = None
    ) -> None:
        return

    def flush(self) -> None:
        return


__all__ = ["AgentTelemetry"]
