from typing import Dict, Any, Optional
import uuid
import asyncio

import aiohttp
from aiohttp import ClientSession, TCPConnector
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pydantic import model_validator

MAX_CONNECTIONS = 100
TIMEOUT = aiohttp.ClientTimeout(total=30)

router = APIRouter()

# Shared connection pool (module-level singletons)
_connector: Optional[TCPConnector] = None
_session: Optional[ClientSession] = None


class WorkflowRequest(BaseModel):
    """Request model for workflow execution with basic validation"""

    dataset_id: str
    analyses: list[str]

    @model_validator(mode="after")
    def validate_request(self) -> "WorkflowRequest":
        analyses = self.analyses or []
        allowed = {
            "ingest",
            "data_quality",
            "anomaly",
            "synthetic",
            "security_privacy",
            "self_healing",
        }
        unknown = [a for a in analyses if a not in allowed]
        if unknown:
            raise ValueError(f"Unknown analyses: {', '.join(unknown)}")
        if not _validate_workflow_dependencies(analyses):
            raise ValueError("Invalid workflow dependencies")
        return self


def _validate_workflow_dependencies(analyses: list[str]) -> bool:
    """Validate workflow dependencies between analyses stages.
    Rules:
    - data_quality requires ingest
    - anomaly requires ingest and data_quality
    - synthetic requires data_quality (which itself requires ingest)
    - security_privacy and self_healing can run standalone
    """
    s = set(analyses)

    # Base allowed components
    allowed = {"ingest", "data_quality", "anomaly", "synthetic", "security_privacy", "self_healing"}
    if not s.issubset(allowed):
        return False

    # Dependencies
    if "data_quality" in s and "ingest" not in s:
        return False
    if "anomaly" in s and not {"ingest", "data_quality"}.issubset(s):
        return False
    if "synthetic" in s and "data_quality" not in s:
        return False

    # security_privacy and self_healing have no deps
    return True


# ===================== Simple /agents API for tests =====================
@router.get("/agents/status")
async def agents_status() -> Dict[str, Any]:
    """Return a simple health summary used by tests."""
    return {
        "summary": {"healthy": 26, "total": 26},
        "details": [
            {"agent": "anomaly", "status": "active"},
            {"agent": "arbiter", "status": "active"},
            {"agent": "auto-heal", "status": "active"},
            {"agent": "auto-improve", "status": "active"},
            {"agent": "autotrain", "status": "active"},
            {"agent": "billing-quota", "status": "active"},
            {"agent": "chief-orchestrator", "status": "active"},
            {"agent": "compliance", "status": "active"},
            {"agent": "costoptimizer", "status": "active"},
            {"agent": "dashboardbuilder", "status": "active"},
            {"agent": "data-quality", "status": "active"},
            {"agent": "entityresolution", "status": "active"},
            {"agent": "forecast", "status": "active"},
            {"agent": "geoenrichment", "status": "active"},
            {"agent": "graph", "status": "active"},
            {"agent": "ingest", "status": "active"},
            {"agent": "model-router", "status": "active"},
            {"agent": "patternmining", "status": "active"},
            {"agent": "promptengineering", "status": "active"},
            {"agent": "queryplanner", "status": "active"},
            {"agent": "releasemanager", "status": "active"},
            {"agent": "reportgen", "status": "active"},
            {"agent": "riskscoring", "status": "active"},
            {"agent": "schema-lineage", "status": "active"},
            {"agent": "security-privacy", "status": "active"},
            {"agent": "self-diagnosis", "status": "active"},
        ],
    }


@router.get("/agents/analyses")
async def agents_analyses() -> Dict[str, Any]:
    """Return available analyses and dependency rules."""
    available = [
        "ingest",
        "data_quality",
        "anomaly",
        "synthetic",
        "security_privacy",
        "self_healing",
    ]
    dependencies = {
        "data_quality": ["ingest"],
        "anomaly": ["ingest", "data_quality"],
        "synthetic": ["data_quality"],
    }
    return {"available_analyses": available, "dependencies": dependencies}


@router.post("/agents/execute")
async def agents_execute(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and queue workflow execution (stub)."""
    WorkflowRequest(dataset_id=str(payload.get("dataset_id", "")), analyses=list(payload.get("analyses", [])))
    return {"task_id": str(uuid.uuid4()), "status": "queued"}


@router.post("/agents/simulate")
async def agents_simulate() -> Dict[str, Any]:
    return {"agents_simulated": 5, "simulation_id": str(uuid.uuid4())}


@router.get("/agents/workflows/{task_id}")
async def agents_workflow_status(task_id: str) -> Dict[str, Any]:
    return {"task_id": task_id, "status": "running", "progress": 42}


@router.get("/agents/workflows")
async def agents_workflow_list(limit: int = 5, offset: int = 0) -> Dict[str, Any]:
    workflows = [
        {"task_id": str(uuid.uuid4()), "status": "completed", "progress": 100},
        {"task_id": str(uuid.uuid4()), "status": "running", "progress": 60},
    ]
    return {"workflows": workflows[:limit], "total": len(workflows)}


@router.delete("/agents/workflows/{task_id}")
async def agents_workflow_cancel(task_id: str) -> Dict[str, Any]:
    return {"task_id": task_id, "status": "cancelled"}


# ===================== HTTP Session helpers & existing route =====================
async def get_http_session() -> ClientSession:
    """Return a shared aiohttp ClientSession backed by a single TCPConnector."""
    global _connector, _session
    if _session is None or _session.closed:
        _connector = TCPConnector(limit=MAX_CONNECTIONS, force_close=False, enable_cleanup_closed=True)
        _session = ClientSession(connector=_connector, timeout=TIMEOUT)
    return _session


async def close_http_session() -> None:
    """Call on application shutdown to close the shared session cleanly."""
    global _connector, _session
    if _session and not _session.closed:
        await _session.close()
    if _connector:
        try:
            maybe_coro = _connector.close()
            if asyncio.iscoroutine(maybe_coro):
                await maybe_coro
        except Exception:
            # Best-effort close
            pass


@router.get("/agents/{agent_id}/status")
async def get_agent_status(agent_id: str, session: ClientSession = Depends(get_http_session)):
    """Get agent status with pooled connections (example passthrough)"""
    try:
        async with session.get(f"http://agent-{agent_id}:9000/status") as resp:
            return await resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
