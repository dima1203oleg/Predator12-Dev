"""
Health monitor adapter that connects the SelfHealingAgent implementation
to the FastAPI self-heal loop. Exposes two objects used by `main.lifespan`:

- `health_checker` with `run_comprehensive_health_check()` async method
- `self_healing_manager` with `auto_heal_issues(health_report)` async method

This is a thin adapter so tests and the mock fallback in `main.py` keep working
when the module isn't present.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List

# Import the SelfHealingAgent implementation from whichever package path is available.
try:
    # Preferred: backend app package path (when running as backend.app.*)
    from .agents.handlers.self_healing_agent import SelfHealingAgent
except Exception:
    try:
        # Fallback to absolute backend path
        from backend.app.agents.handlers.self_healing_agent import SelfHealingAgent
    except Exception:
        # Final fallback to top-level agents package (if present)
        from agents.handlers.self_healing_agent import SelfHealingAgent

logger = logging.getLogger(__name__)


class HealthChecker:
    """Runs comprehensive health checks using the SelfHealingAgent."""

    def __init__(self):
        # create agent once and reuse to preserve history
        self.agent = SelfHealingAgent()

    async def run_comprehensive_health_check(self) -> Dict[str, Any]:
        try:
            # collect metrics and failure detections in parallel
            monitor_task = asyncio.create_task(self.agent.execute("monitor_health", {}))
            detect_task = asyncio.create_task(self.agent.execute("detect_failures", {}))

            monitor_res, detect_res = await asyncio.gather(monitor_task, detect_task)

            overall_status = "unknown"
            health_score = 0.0
            if isinstance(monitor_res, dict):
                overall_status = monitor_res.get("health_metrics", {}).get(
                    "overall_status", "unknown"
                )
                # crude health score: healthy=1, warning=0.5, critical=0
                overall_status_map = {"healthy": 1.0, "warning": 0.5, "critical": 0.0}
                health_score = overall_status_map.get(overall_status, 0.25)

            result: Dict[str, Any] = {
                "overall_status": overall_status,
                "health_score": float(health_score),
                "system_metrics": (
                    monitor_res.get("health_metrics") if isinstance(monitor_res, dict) else {}
                ),
                "healing_actions": (
                    monitor_res.get("healing_actions", []) if isinstance(monitor_res, dict) else []
                ),
                "failures": detect_res.get("failures", []) if isinstance(detect_res, dict) else [],
                "component_health": {},
            }

            return result

        except Exception as e:
            logger.exception("Health check failed")
            return {
                "overall_status": "unknown",
                "health_score": 0.0,
                "system_metrics": {},
                "healing_actions": [],
                "failures": [],
                "component_health": {},
                "error": str(e),
            }


class SelfHealingManager:
    """Adapter that runs healing actions through the SelfHealingAgent."""

    def __init__(self):
        self.agent = SelfHealingAgent()

    async def auto_heal_issues(self, health_report: Dict[str, Any]) -> Dict[str, Any]:
        results: List[Dict[str, Any]] = []

        # Actions suggested by monitor (e.g. high_cpu -> scale_out)
        for action in health_report.get("healing_actions", []):
            try:
                payload = {
                    "action": action.get("action"),
                    "target": action.get("trigger"),
                    "parameters": {},
                }
                res = await self.agent.execute("execute_recovery", payload)
                results.append(
                    {
                        "component": action.get("trigger"),
                        "success": res.get("status") == "success",
                        "result": res,
                    }
                )
            except Exception as e:
                logger.exception("Failed executing healing action")
                results.append(
                    {"component": action.get("trigger"), "success": False, "error": str(e)}
                )

        # Handle service failures detected separately
        for failure in health_report.get("failures", []):
            try:
                payload = {
                    "action": failure.get("recovery_action", "restart_service"),
                    "target": failure.get("service"),
                    "parameters": {},
                }
                res = await self.agent.execute("execute_recovery", payload)
                results.append(
                    {
                        "component": failure.get("service"),
                        "success": res.get("status") == "success",
                        "result": res,
                    }
                )
            except Exception as e:
                logger.exception("Failed executing failure recovery")
                results.append(
                    {"component": failure.get("service"), "success": False, "error": str(e)}
                )

        return {"healing_results": results}


# Module-level singletons used by main.py
health_checker = HealthChecker()
self_healing_manager = SelfHealingManager()
