"""
Reality Simulator API endpoints for Nexus Core
Provides what-if scenario modeling and simulation capabilities
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid
import random
import asyncio
import json

router = APIRouter(prefix="/api/v1/simulations", tags=["simulations"])

# In-memory storage for simulations (in production, use Redis or database)
active_simulations: Dict[str, Dict] = {}
simulation_results: Dict[str, Dict] = {}


class SimulationParameter(BaseModel):
    name: str
    type: str  # 'number', 'string', 'boolean', 'range'
    value: Union[str, int, float, bool, List[Union[str, int, float]]]
    description: Optional[str] = None


class ScenarioConfig(BaseModel):
    name: str
    description: str
    parameters: List[SimulationParameter]
    duration: float  # simulation time units
    model_type: str  # 'monte_carlo', 'agent_based', 'system_dynamics', 'discrete_event'


class SimulationRequest(BaseModel):
    scenario_name: str
    config: ScenarioConfig
    iterations: int = 1000
    parallel_runs: int = 1
    output_metrics: List[str] = []


class SimulationStatus(BaseModel):
    id: str
    status: str  # 'queued', 'running', 'completed', 'failed', 'cancelled'
    progress: float  # 0.0 to 1.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    estimated_completion: Optional[datetime] = None


class SimulationResult(BaseModel):
    id: str
    scenario_name: str
    status: str
    results: Dict[str, Any]
    metrics: Dict[str, float]
    visualizations: List[Dict[str, Any]]
    summary: str


async def run_simulation_background(simulation_id: str, request: SimulationRequest):
    """
    Background task to run the simulation
    """
    try:
        # Update status to running
        active_simulations[simulation_id]["status"] = "running"
        active_simulations[simulation_id]["started_at"] = datetime.now()
        
        # Simulate the simulation process
        total_steps = request.iterations
        results_data = []
        
        for step in range(total_steps):
            # Simulate computation delay
            await asyncio.sleep(0.01)  # 10ms per iteration
            
            # Generate sample results based on scenario type
            if request.config.model_type == "monte_carlo":
                result = simulate_monte_carlo_step(request.config, step)
            elif request.config.model_type == "agent_based":
                result = simulate_agent_based_step(request.config, step)
            elif request.config.model_type == "system_dynamics":
                result = simulate_system_dynamics_step(request.config, step)
            else:  # discrete_event
                result = simulate_discrete_event_step(request.config, step)
            
            results_data.append(result)
            
            # Update progress
            progress = (step + 1) / total_steps
            active_simulations[simulation_id]["progress"] = progress
            
            # Check if simulation was cancelled
            if active_simulations[simulation_id]["status"] == "cancelled":
                return
        
        # Calculate final metrics
        metrics = calculate_simulation_metrics(results_data, request.config)
        
        # Generate visualizations
        visualizations = generate_visualizations(results_data, request.config)
        
        # Create summary
        summary = generate_simulation_summary(metrics, request.config)
        
        # Store results
        simulation_results[simulation_id] = {
            "id": simulation_id,
            "scenario_name": request.scenario_name,
            "status": "completed",
            "results": {
                "data": results_data,
                "iterations": len(results_data),
                "config": request.config.dict()
            },
            "metrics": metrics,
            "visualizations": visualizations,
            "summary": summary
        }
        
        # Update status
        active_simulations[simulation_id]["status"] = "completed"
        active_simulations[simulation_id]["completed_at"] = datetime.now()
        
    except Exception as e:
        # Handle simulation error
        active_simulations[simulation_id]["status"] = "failed"
        active_simulations[simulation_id]["error_message"] = str(e)
        active_simulations[simulation_id]["completed_at"] = datetime.now()


def simulate_monte_carlo_step(config: ScenarioConfig, step: int) -> Dict[str, Any]:
    """Simulate a Monte Carlo step"""
    return {
        "step": step,
        "timestamp": step * 0.1,
        "value": random.gauss(100, 15),
        "confidence_interval": [random.gauss(85, 10), random.gauss(115, 10)],
        "probability": random.uniform(0, 1)
    }


def simulate_agent_based_step(config: ScenarioConfig, step: int) -> Dict[str, Any]:
    """Simulate an agent-based model step"""
    num_agents = 50
    return {
        "step": step,
        "timestamp": step * 0.1,
        "active_agents": random.randint(30, num_agents),
        "average_behavior": random.uniform(0, 10),
        "network_density": random.uniform(0.3, 0.8),
        "emergent_properties": {
            "clustering": random.uniform(0, 1),
            "synchronization": random.uniform(0, 1)
        }
    }


def simulate_system_dynamics_step(config: ScenarioConfig, step: int) -> Dict[str, Any]:
    """Simulate a system dynamics step"""
    return {
        "step": step,
        "timestamp": step * 0.1,
        "stock_levels": {
            "resource_a": max(0, 1000 + random.gauss(0, 50)),
            "resource_b": max(0, 500 + random.gauss(0, 25))
        },
        "flow_rates": {
            "inflow": random.uniform(10, 30),
            "outflow": random.uniform(8, 25)
        },
        "feedback_loops": random.uniform(-1, 1)
    }


def simulate_discrete_event_step(config: ScenarioConfig, step: int) -> Dict[str, Any]:
    """Simulate a discrete event step"""
    return {
        "step": step,
        "timestamp": step * 0.1,
        "events": random.randint(0, 5),
        "queue_length": random.randint(0, 20),
        "processing_time": random.uniform(1, 10),
        "utilization": random.uniform(0.5, 0.95)
    }


def calculate_simulation_metrics(results_data: List[Dict], config: ScenarioConfig) -> Dict[str, float]:
    """Calculate key metrics from simulation results"""
    if not results_data:
        return {}
    
    metrics = {}
    
    if config.model_type == "monte_carlo":
        values = [r["value"] for r in results_data]
        metrics = {
            "mean_value": sum(values) / len(values),
            "std_deviation": (sum((x - sum(values)/len(values))**2 for x in values) / len(values))**0.5,
            "min_value": min(values),
            "max_value": max(values),
            "confidence_95": 1.96 * (sum((x - sum(values)/len(values))**2 for x in values) / len(values))**0.5
        }
    elif config.model_type == "agent_based":
        avg_behaviors = [r["average_behavior"] for r in results_data]
        metrics = {
            "avg_agent_behavior": sum(avg_behaviors) / len(avg_behaviors),
            "network_stability": sum(r["network_density"] for r in results_data) / len(results_data),
            "emergence_score": sum(r["emergent_properties"]["clustering"] for r in results_data) / len(results_data)
        }
    elif config.model_type == "system_dynamics":
        final_stock_a = results_data[-1]["stock_levels"]["resource_a"]
        final_stock_b = results_data[-1]["stock_levels"]["resource_b"]
        metrics = {
            "final_resource_a": final_stock_a,
            "final_resource_b": final_stock_b,
            "system_stability": 1.0 - abs(sum(r["feedback_loops"] for r in results_data) / len(results_data)),
            "resource_efficiency": (final_stock_a + final_stock_b) / 1500
        }
    else:  # discrete_event
        avg_queue = sum(r["queue_length"] for r in results_data) / len(results_data)
        avg_utilization = sum(r["utilization"] for r in results_data) / len(results_data)
        metrics = {
            "average_queue_length": avg_queue,
            "average_utilization": avg_utilization,
            "throughput": sum(r["events"] for r in results_data) / len(results_data),
            "efficiency_score": avg_utilization * (1 - avg_queue / 20)
        }
    
    return metrics


def generate_visualizations(results_data: List[Dict], config: ScenarioConfig) -> List[Dict[str, Any]]:
    """Generate visualization configurations for the results"""
    visualizations = []
    
    # Time series chart
    visualizations.append({
        "type": "time_series",
        "title": f"{config.name} - Time Series",
        "data": {
            "x": [r["timestamp"] for r in results_data],
            "y": [r.get("value", r.get("average_behavior", r.get("queue_length", 0))) for r in results_data]
        },
        "config": {
            "x_label": "Time",
            "y_label": "Value",
            "color": "#00FFC6"
        }
    })
    
    # Distribution histogram
    if config.model_type == "monte_carlo":
        values = [r["value"] for r in results_data]
        visualizations.append({
            "type": "histogram",
            "title": f"{config.name} - Value Distribution",
            "data": {"values": values},
            "config": {
                "bins": 20,
                "color": "#0A75FF"
            }
        })
    
    # 3D surface plot for system dynamics
    if config.model_type == "system_dynamics":
        visualizations.append({
            "type": "surface_3d",
            "title": f"{config.name} - System State Space",
            "data": {
                "x": [r["stock_levels"]["resource_a"] for r in results_data],
                "y": [r["stock_levels"]["resource_b"] for r in results_data],
                "z": [r["timestamp"] for r in results_data]
            },
            "config": {
                "x_label": "Resource A",
                "y_label": "Resource B",
                "z_label": "Time"
            }
        })
    
    return visualizations


def generate_simulation_summary(metrics: Dict[str, float], config: ScenarioConfig) -> str:
    """Generate a human-readable summary of the simulation results"""
    summary_parts = [
        f"Simulation '{config.name}' completed successfully.",
        f"Model type: {config.model_type.replace('_', ' ').title()}",
        f"Duration: {config.duration} time units"
    ]
    
    if metrics:
        summary_parts.append("Key findings:")
        for metric_name, value in metrics.items():
            formatted_name = metric_name.replace('_', ' ').title()
            if isinstance(value, float):
                summary_parts.append(f"- {formatted_name}: {value:.3f}")
            else:
                summary_parts.append(f"- {formatted_name}: {value}")
    
    return " ".join(summary_parts)


@router.post("/start", response_model=Dict[str, str])
async def start_simulation(request: SimulationRequest, background_tasks: BackgroundTasks):
    """
    Start a new simulation
    """
    simulation_id = str(uuid.uuid4())
    
    # Initialize simulation tracking
    active_simulations[simulation_id] = {
        "id": simulation_id,
        "status": "queued",
        "progress": 0.0,
        "request": request.dict(),
        "created_at": datetime.now()
    }
    
    # Start background simulation
    background_tasks.add_task(run_simulation_background, simulation_id, request)
    
    return {
        "simulation_id": simulation_id,
        "status": "queued",
        "message": "Simulation started successfully"
    }


@router.get("/status/{simulation_id}", response_model=SimulationStatus)
async def get_simulation_status(simulation_id: str):
    """
    Get the status of a running simulation
    """
    if simulation_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    sim_data = active_simulations[simulation_id]
    
    # Estimate completion time for running simulations
    estimated_completion = None
    if sim_data["status"] == "running" and sim_data["progress"] > 0:
        elapsed = datetime.now() - sim_data["started_at"]
        total_estimated = elapsed / sim_data["progress"]
        estimated_completion = sim_data["started_at"] + total_estimated
    
    return SimulationStatus(
        id=simulation_id,
        status=sim_data["status"],
        progress=sim_data["progress"],
        started_at=sim_data.get("started_at"),
        completed_at=sim_data.get("completed_at"),
        error_message=sim_data.get("error_message"),
        estimated_completion=estimated_completion
    )


@router.get("/results/{simulation_id}", response_model=SimulationResult)
async def get_simulation_results(simulation_id: str):
    """
    Get the results of a completed simulation
    """
    if simulation_id not in simulation_results:
        # Check if simulation is still running
        if simulation_id in active_simulations:
            status = active_simulations[simulation_id]["status"]
            if status in ["queued", "running"]:
                raise HTTPException(status_code=202, detail=f"Simulation is {status}")
            elif status == "failed":
                error_msg = active_simulations[simulation_id].get("error_message", "Unknown error")
                raise HTTPException(status_code=500, detail=f"Simulation failed: {error_msg}")
        
        raise HTTPException(status_code=404, detail="Simulation results not found")
    
    return SimulationResult(**simulation_results[simulation_id])


@router.delete("/cancel/{simulation_id}")
async def cancel_simulation(simulation_id: str):
    """
    Cancel a running simulation
    """
    if simulation_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    sim_data = active_simulations[simulation_id]
    
    if sim_data["status"] in ["completed", "failed", "cancelled"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel simulation with status: {sim_data['status']}")
    
    # Mark as cancelled
    active_simulations[simulation_id]["status"] = "cancelled"
    active_simulations[simulation_id]["completed_at"] = datetime.now()
    
    return {"message": "Simulation cancelled successfully"}


@router.get("/list")
async def list_simulations(
    status: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    List all simulations with optional status filter
    """
    simulations = []
    
    # Combine active and completed simulations
    all_sims = {}
    all_sims.update(active_simulations)
    
    for sim_id, result in simulation_results.items():
        if sim_id not in all_sims:
            all_sims[sim_id] = {
                "id": sim_id,
                "status": result["status"],
                "progress": 1.0,
                "created_at": datetime.now()  # Placeholder
            }
    
    for sim_id, sim_data in all_sims.items():
        if status is None or sim_data["status"] == status:
            simulations.append({
                "id": sim_id,
                "status": sim_data["status"],
                "progress": sim_data["progress"],
                "created_at": sim_data.get("created_at"),
                "scenario_name": sim_data.get("request", {}).get("scenario_name", "Unknown")
            })
    
    # Sort by creation time (newest first)
    simulations.sort(key=lambda x: x["created_at"] or datetime.min, reverse=True)
    
    return {
        "simulations": simulations[:limit],
        "total": len(simulations),
        "filtered_by_status": status
    }


@router.get("/templates")
async def get_simulation_templates() -> List[ScenarioConfig]:
    """
    Get predefined simulation templates
    """
    templates = [
        ScenarioConfig(
            name="Network Security Breach",
            description="Simulate the spread and impact of a security breach through a network",
            parameters=[
                SimulationParameter(name="initial_infected_nodes", type="number", value=1, description="Number of initially compromised nodes"),
                SimulationParameter(name="infection_rate", type="range", value=[0.1, 0.3], description="Rate of infection spread"),
                SimulationParameter(name="detection_probability", type="number", value=0.7, description="Probability of detecting infected node"),
                SimulationParameter(name="mitigation_effectiveness", type="range", value=[0.5, 0.9], description="Effectiveness of mitigation measures")
            ],
            duration=100.0,
            model_type="agent_based"
        ),
        ScenarioConfig(
            name="Resource Allocation Optimization",
            description="Optimize resource allocation under varying demand conditions",
            parameters=[
                SimulationParameter(name="initial_resources", type="number", value=1000, description="Initial resource pool"),
                SimulationParameter(name="demand_variability", type="range", value=[0.8, 1.2], description="Demand variation factor"),
                SimulationParameter(name="allocation_strategy", type="string", value="balanced", description="Resource allocation strategy"),
                SimulationParameter(name="efficiency_target", type="number", value=0.85, description="Target efficiency level")
            ],
            duration=200.0,
            model_type="system_dynamics"
        ),
        ScenarioConfig(
            name="Market Risk Assessment",
            description="Monte Carlo simulation for financial risk assessment",
            parameters=[
                SimulationParameter(name="initial_portfolio_value", type="number", value=1000000, description="Initial portfolio value"),
                SimulationParameter(name="volatility", type="range", value=[0.15, 0.25], description="Market volatility range"),
                SimulationParameter(name="correlation_factor", type="number", value=0.3, description="Asset correlation factor"),
                SimulationParameter(name="confidence_level", type="number", value=0.95, description="Confidence level for VaR calculation")
            ],
            duration=252.0,  # Trading days in a year
            model_type="monte_carlo"
        ),
        ScenarioConfig(
            name="Service Queue Performance",
            description="Analyze service queue performance under different load conditions",
            parameters=[
                SimulationParameter(name="arrival_rate", type="range", value=[5, 15], description="Customer arrival rate per hour"),
                SimulationParameter(name="service_rate", type="range", value=[8, 12], description="Service rate per hour"),
                SimulationParameter(name="queue_capacity", type="number", value=50, description="Maximum queue capacity"),
                SimulationParameter(name="service_priority", type="boolean", value=True, description="Enable priority service")
            ],
            duration=480.0,  # 8 hours
            model_type="discrete_event"
        )
    ]
    
    return templates
