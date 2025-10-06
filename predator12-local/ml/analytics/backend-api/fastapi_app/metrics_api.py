from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi.responses import JSONResponse
import numpy as np

router = APIRouter()

# --- MOCKED DATA: Replace with real data fetching/logic as needed ---

def generate_time_series(start: str, end: str, series: List[str]):
    # Generate mock time series data for demo
    start_dt = datetime.fromisoformat(start)
    end_dt = datetime.fromisoformat(end)
    days = (end_dt - start_dt).days + 1
    timestamps = [(start_dt + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]
    values = []
    for t in timestamps:
        row = {"timestamp": t}
        for s in series:
            row[s] = np.random.randint(10, 200) + np.random.randint(0, 50)
        values.append(row)
    return values

@router.get("/metrics/agent-trends")
def agent_trends(start: str = Query(...), end: str = Query(...)):
    # Example: one series (total activity)
    data = {
        "labels": ["timestamp"],
        "datasets": [
            {"label": "Agent Activity", "data": np.random.randint(50, 200, 7).tolist()}
        ],
        "timestamps": [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)][::-1]
    }
    return JSONResponse(content=data)

@router.get("/metrics/agent-trends-multiline")
def agent_trends_multiline(start: str = Query(...), end: str = Query(...)):
    # Example: multiple series
    series = ["Agent A", "Agent B", "Agent C", "Agent D"]
    values = generate_time_series(start, end, series)
    return {"values": values, "series": series}

@router.get("/metrics/agent-role-distribution")
def agent_role_distribution():
    # Example: role distribution
    data = [
        {"role": "Analyzer", "value": 5},
        {"role": "Collector", "value": 3},
        {"role": "Remediator", "value": 2},
        {"role": "Supervisor", "value": 1},
    ]
    return data

@router.get("/metrics/agent-activity-heatmap")
def agent_activity_heatmap():
    # Example: heatmap data
    xLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    yLabels = [f"Agent {i+1}" for i in range(6)]
    values = np.random.randint(0, 10, (len(yLabels), len(xLabels))).tolist()
    return {"xLabels": xLabels, "yLabels": yLabels, "values": values}

@router.get("/metrics/agent-network")
def agent_network():
    # Example: network graph data
    nodes = [
        {"id": f"A{i}", "name": f"Agent {i+1}"} for i in range(6)
    ]
    links = [
        {"source": "A0", "target": "A1"},
        {"source": "A1", "target": "A2"},
        {"source": "A2", "target": "A3"},
        {"source": "A3", "target": "A4"},
        {"source": "A4", "target": "A5"},
        {"source": "A5", "target": "A0"},
        {"source": "A2", "target": "A5"},
    ]
    return {"nodes": nodes, "links": links}
