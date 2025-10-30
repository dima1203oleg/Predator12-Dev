"""Proxy module for `app.agents.supervisor` used by tests.

It re-exports the real `agents.supervisor` module when available, otherwise
provides a minimal stub to keep tests from crashing during dry-run.
"""

try:
    from agents.supervisor import *  # type: ignore
except Exception:
    # Minimal fallback: AgentSupervisor stub with the interface tests expect.
    class AgentSupervisor:
        def __init__(self, *args, **kwargs):
            pass

        async def status(self):
            return {"status": "unknown"}


__all__ = ["AgentSupervisor"]
