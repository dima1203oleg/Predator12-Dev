from __future__ import annotations

from fastapi import APIRouter, HTTPException
from typing import Any, Dict

from .supervisor import get_supervisor

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])


@router.get("/status")
async def agents_status() -> Dict[str, Any]:
    sup = await get_supervisor()
    return await sup.get_system_status()


@router.post("/restart")
async def agents_restart() -> Dict[str, Any]:
    """Restart all configured agents.
    Matches Makefile target `agents-restart` which POSTs without body.
    """
    sup = await get_supervisor()
    results = {}
    for name in list(sup.agents.keys()):
        results[name] = await sup.restart_agent(name)
    return {"message": "restart triggered", "results": results}


@router.post("/supervisor/start_self_improve")
async def start_self_improve() -> Dict[str, Any]:
    sup = await get_supervisor()
    return await sup.start_self_improvement()


@router.post("/supervisor/stop_self_improve")
async def stop_self_improve() -> Dict[str, Any]:
    sup = await get_supervisor()
    return await sup.stop_self_improvement()


@router.post("/{agent_name}/restart")
async def restart_single_agent(agent_name: str) -> Dict[str, Any]:
    sup = await get_supervisor()
    if agent_name not in sup.agents:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    return await sup.restart_agent(agent_name)
