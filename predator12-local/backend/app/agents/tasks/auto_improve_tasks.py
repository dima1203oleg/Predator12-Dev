"""Таски для агента автопокращення."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from ..celery_app import celery_app
from ..handlers.auto_improve_agent import AutoImproveAgent


@celery_app.task(bind=True, name="improve.analyze_performance")
def analyze_performance_task(self, component: str = "system", **kwargs) -> dict[str, Any]:
    """Таск для аналізу продуктивності."""

    agent = AutoImproveAgent()

    payload = {
        "component": component,
        "time_period": kwargs.get("time_period", "last_hour"),
        "metrics": kwargs.get("metrics", ["response_time", "throughput", "error_rate"]),
        **kwargs,
    }

    try:
        result = asyncio.run(agent.execute("analyze_performance", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="improve.suggest_optimizations")
def suggest_optimizations_task(self, performance_data: dict[str, Any], **kwargs) -> dict[str, Any]:
    """Таск для пропозиції оптимізацій."""

    agent = AutoImproveAgent()

    payload = {
        "performance_data": performance_data,
        "constraints": kwargs.get("constraints", {}),
        "priority": kwargs.get("priority", "performance"),
        **kwargs,
    }

    try:
        result = asyncio.run(agent.execute("suggest_optimizations", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="improve.auto_tune")
def auto_tune_parameters_task(
    self, component: str, parameters: dict[str, Any], **kwargs
) -> dict[str, Any]:
    """Таск для автоматичного налаштування параметрів."""

    agent = AutoImproveAgent()

    payload = {
        "component": component,
        "parameters": parameters,
        "goal": kwargs.get("goal", "performance"),
        **kwargs,
    }

    try:
        result = asyncio.run(agent.execute("auto_tune_parameters", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="improve.generate_suggested_patch")
def generate_suggested_patch_task(
    self, target_path: str = ".", provider: str = "local", **kwargs
) -> dict[str, Any]:
    """Generate a suggested.patch using configured generator.

    This task is intentionally conservative: it attempts to call the AutoImproveAgent
    to generate a patch. If the agent cannot produce one, it falls back to a
    local helper script `scripts/generate_patch_local.py` which must produce
    a `suggested.patch` file at the repository root.
    """

    agent = AutoImproveAgent()

    payload = {
        "target_path": target_path,
        "provider": provider,
        **kwargs,
    }

    try:
        # First try to ask the AutoImproveAgent to create a patch
        result = asyncio.run(agent.execute("generate_patch", payload))

        # If agent returned content for a patch, write it
        patch_content = result.get("patch") if isinstance(result, dict) else None
        if patch_content:
            repo_root = kwargs.get("repo_root", ".")
            patch_file = str(Path(repo_root) / "suggested.patch")
            with open(patch_file, "w", encoding="utf-8") as f:
                f.write(patch_content)

            return {"status": "ok", "method": "agent", "path": patch_file}

    except Exception:
        # swallow and fallback to local generator
        pass

    # Fallback: call local script
    try:
        script = Path(__file__).resolve().parents[4] / "scripts" / "generate_patch_local.py"
        if script.exists():
            import subprocess

            subprocess.run(["python3", str(script), "--target", target_path], check=True)
            patch_file = str(Path("suggested.patch").resolve())
            if Path(patch_file).exists():
                return {"status": "ok", "method": "local_script", "path": patch_file}

        return {"status": "no_patch", "reason": "agent_failed_and_no_local_generator"}

    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=2)
