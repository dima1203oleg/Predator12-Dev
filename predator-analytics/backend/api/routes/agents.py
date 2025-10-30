"""
Agents API Routes
"""

from typing import Any, Dict, List

from agents.arbiter_agent import ArbiterAgent
from agents.dataset_inspector_agent import DatasetInspectorAgent
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.agent import Agent
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()

# Initialize agents (in production, use dependency injection or service layer)
arbiter = ArbiterAgent()
dataset_inspector = DatasetInspectorAgent()

# Register agents with arbiter
arbiter.register_agent(dataset_inspector)


class AgentResponse(BaseModel):
    """Agent response model"""

    id: str
    name: str
    agent_type: str
    is_active: bool
    is_busy: bool


@router.get("/agents", response_model=List[AgentResponse])
async def list_agents(db: Session = Depends(get_db)):
    """
    List all registered agents
    """
    agents = db.query(Agent).all()
    return agents


@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, db: Session = Depends(get_db)):
    """
    Get agent by ID
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("/agents/system/status")
async def get_system_status():
    """
    Get status of all agents in the system
    """
    status = await arbiter.get_system_status()
    return status


@router.post("/agents/execute")
async def execute_agent_task(task_data: Dict[str, Any]):
    """
    Execute a task through the Arbiter agent

    Request body:
    {
        "task_type": "analyze_dataset",
        "data": {...}
    }
    """
    try:
        result = await arbiter.execute(task_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agents/{agent_type}/execute")
async def execute_specific_agent(agent_type: str, task_data: Dict[str, Any]):
    """
    Execute a task on a specific agent type
    """
    try:
        result = await arbiter._delegate_to_agent(agent_type, task_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
