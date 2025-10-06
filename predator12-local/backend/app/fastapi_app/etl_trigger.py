"""Placeholder ETL trigger service."""

from __future__ import annotations

from typing import Dict

from event_logger import EventLogger


class EtlTrigger:
    def __init__(self, logger: EventLogger) -> None:
        self.logger = logger

    def trigger(self, payload: Dict[str, str]) -> None:
        self.logger.emit("etl.trigger", payload)
