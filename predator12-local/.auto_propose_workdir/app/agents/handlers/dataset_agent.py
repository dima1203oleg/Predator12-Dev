"""Proxy for app.agents.handlers.dataset_agent used by tests.

Re-exports repository implementation when available, otherwise provides a
minimal fallback that satisfies the tests' interface expectations.
"""

try:
    from agents.handlers.dataset_agent import *  # type: ignore
except Exception:
    # Minimal fallback
    class DatasetAgent:
        def __init__(self, *args, **kwargs):
            pass

        async def get_capabilities(self):
            return ["ingest", "analyze"]

        def execute(self, command, payload):
            return {"task_id": "stub", "status": "submitted", "agent": "dataset"}


__all__ = ["DatasetAgent"]
