import logging
import uuid
from typing import Any

import httpx
import structlog
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

router = APIRouter()

# Updated agent URLs based on new docker-compose structure
AGENT_URLS = {
    "chief": "http://chief-orchestrator:9001",
    "model_router": "http://model-router:9002",
    "ingest": "http://ingest-agent:9010",
    "synthetic": "http://synthetic-agent:9015",
    "data_quality": "http://data-quality-agent:9012",
    "anomaly": "http://anomaly-agent:9020",
    "security_privacy": "http://security-privacy-agent:9050",
    "self_healing": "http://self-healing-agent:9041",
}


class WorkflowRequest(BaseModel):
    dataset_id: str
    analyses: list[str]
    params: dict[str, Any] = {}


class WorkflowResponse(BaseModel):
    task_id: str
    status: str
    results: dict[str, Any]


@router.get("/status")
async def get_agent_status():
    """Aggregates health status from all agents"""
    status = {}
    async with httpx.AsyncClient() as client:
        for name, url in AGENT_URLS.items():
            try:
                # Use appropriate health endpoint for each agent
                health_endpoint = f"{url}/health"
                if name == "chief":
                    health_endpoint = f"{url}/chief/health"
                elif name == "model_router":
                    health_endpoint = f"{url}/router/health"
                elif name == "ingest":
                    health_endpoint = f"{url}/ingest/health"
                elif name == "synthetic":
                    health_endpoint = f"{url}/synthetic/health"
                elif name == "data_quality":
                    health_endpoint = f"{url}/quality/health"
                elif name == "anomaly":
                    health_endpoint = f"{url}/anomaly/health"
                elif name == "security_privacy":
                    health_endpoint = f"{url}/security/health"
                elif name == "self_healing":
                    health_endpoint = f"{url}/healing/health"

                resp = await client.get(health_endpoint, timeout=2.0)
                status[name] = {
                    "status": "healthy" if resp.status_code == 200 else "degraded",
                    "details": resp.json(),
                }
            except Exception as e:
                status[name] = {"status": "unavailable", "error": str(e)}
    return {
        "agents": status,
        "summary": {
            "healthy": sum(1 for s in status.values() if s.get("status") == "healthy"),
            "total": len(status),
        },
    }


@router.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowRequest):
    """Execute a multi-agent workflow"""
    task_id = str(uuid.uuid4())
    results = {}

    try:
        # Step 1: Data ingestion/preparation
        if "ingest" in request.analyses:
            results["ingest"] = await _call_agent(
                "ingest",
                "ingest/process",
                {"dataset_id": request.dataset_id, **request.params.get("ingest", {})},
            )

        # Step 2: Data quality check
        if "data_quality" in request.analyses:
            results["data_quality"] = await _call_agent(
                "data_quality",
                "quality/validate",
                {"dataset_id": request.dataset_id, **request.params.get("data_quality", {})},
            )

        # Step 3: Anomaly detection
        if "anomaly" in request.analyses:
            results["anomaly"] = await _call_agent(
                "anomaly",
                "anomaly/detect",
                {"dataset_id": request.dataset_id, **request.params.get("anomaly", {})},
            )

        # Step 4: Synthetic data generation
        if "synthetic" in request.analyses:
            results["synthetic"] = await _call_agent(
                "synthetic",
                "synthetic/generate",
                {"dataset_id": request.dataset_id, **request.params.get("synthetic", {})},
            )

        # Step 5: Security and privacy validation
        results["security_privacy"] = await _call_agent(
            "security_privacy",
            "security/validate",
            {"dataset_id": request.dataset_id, "analyses": request.analyses},
        )

        return {"task_id": task_id, "status": "completed", "results": results}

    except httpx.HTTPStatusError as e:
        logger.error("Agent call failed", status=e.response.status_code, error=e.response.text)
        raise HTTPException(502, detail=f"Agent service error: {e.response.text}") from e
    except Exception as e:
        logger.error("Workflow failed", error=str(e))
        raise HTTPException(500, detail=f"Workflow execution failed: {str(e)}") from e


@router.post("/simulate")
async def simulate_agents():
    """Simulate agent interactions for testing"""
    try:
        simulation_results = {}

        # Simulate chief orchestrator
        simulation_results["chief"] = {
            "status": "active",
            "message": "Chief orchestrator ready for dialogue",
            "capabilities": ["dialogue", "task_coordination", "model_routing"],
        }

        # Simulate model router
        simulation_results["model_router"] = {
            "status": "active",
            "message": "58 models available for routing",
            "models_count": 58,
        }

        # Simulate other agents
        for agent in [
            "ingest",
            "synthetic",
            "data_quality",
            "anomaly",
            "security_privacy",
            "self_healing",
        ]:
            simulation_results[agent] = {
                "status": "simulated",
                "message": f"{agent} agent simulation successful",
            }

        return {
            "simulation_id": str(uuid.uuid4()),
            "status": "completed",
            "agents_simulated": len(simulation_results),
            "results": simulation_results,
        }

    except Exception as e:
        logger.error("Simulation failed", error=str(e))
        raise HTTPException(500, detail=f"Simulation failed: {str(e)}") from e


async def _call_agent(agent: str, endpoint: str, data: dict[str, Any]) -> dict[str, Any]:
    """Helper to call agent endpoints"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{AGENT_URLS[agent]}/{endpoint}", json=data, timeout=10.0)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"{agent} agent error", status=e.response.status_code)
            raise
        except Exception as e:
            logger.error(f"Failed to call {agent} agent", error=str(e))
            raise
