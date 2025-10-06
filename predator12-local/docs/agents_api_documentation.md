# Agents API Documentation

## Overview
The Agents API provides orchestration and management capabilities for the Predator Analytics multi-agent system.

## Base URL
```
http://localhost:8000/agents
```

## Endpoints

### 1. Agent Status
**GET** `/status`

Returns the health status of all agents in the system.

**Response:**
```json
{
  "agents": {
    "chief": {
      "status": "healthy",
      "details": {...}
    },
    "model_router": {
      "status": "healthy", 
      "details": {...}
    },
    "ingest": {
      "status": "unavailable",
      "error": "Connection timeout"
    }
  },
  "summary": {
    "healthy": 6,
    "total": 8
  }
}
```

### 2. Available Analyses
**GET** `/analyses`

Returns list of available analyses and their dependencies.

**Response:**
```json
{
  "available_analyses": [
    "ingest", "data_quality", "anomaly", 
    "synthetic", "security_privacy", "self_healing"
  ],
  "dependencies": {
    "anomaly": ["ingest"],
    "synthetic": ["data_quality"],
    "data_quality": ["ingest"]
  },
  "descriptions": {
    "ingest": "Data ingestion and preparation",
    "data_quality": "Data quality validation and assessment",
    "anomaly": "Anomaly detection and analysis",
    "synthetic": "Synthetic data generation",
    "security_privacy": "Security and privacy validation",
    "self_healing": "System self-healing and recovery"
  }
}
```

### 3. Execute Workflow
**POST** `/execute`

Executes a multi-agent workflow with specified analyses.

**Request Body:**
```json
{
  "dataset_id": "dataset_123",
  "analyses": ["ingest", "data_quality", "anomaly"],
  "params": {
    "ingest": {
      "source_type": "csv",
      "delimiter": ","
    },
    "anomaly": {
      "algorithm": "isolation_forest",
      "contamination": 0.1
    }
  }
}
```

**Response:**
```json
{
  "task_id": "workflow_uuid_123",
  "status": "completed",
  "results": {
    "ingest": {
      "records_processed": 10000,
      "status": "success"
    },
    "data_quality": {
      "quality_score": 0.95,
      "issues_found": 12
    },
    "anomaly": {
      "anomalies_detected": 23,
      "confidence": 0.87
    },
    "security_privacy": {
      "pii_detected": false,
      "compliance_score": 1.0
    }
  }
}
```

### 4. Simulate Agents
**POST** `/simulate`

Simulates agent interactions for testing purposes.

**Response:**
```json
{
  "simulation_id": "sim_uuid_456",
  "status": "completed",
  "agents_simulated": 8,
  "results": {
    "chief": {
      "status": "active",
      "message": "Chief orchestrator ready for dialogue",
      "capabilities": ["dialogue", "task_coordination", "model_routing"]
    },
    "model_router": {
      "status": "active",
      "message": "58 models available for routing",
      "models_count": 58
    }
  }
}
```

### 5. Get Workflow Status
**GET** `/workflows/{task_id}`

Returns the status of a specific workflow.

**Response:**
```json
{
  "task_id": "workflow_uuid_123",
  "status": "completed",
  "progress": 100,
  "steps_completed": [
    "ingest", "data_quality", "anomaly", "security_privacy"
  ],
  "current_step": null,
  "started_at": "2025-09-26T10:00:00Z",
  "completed_at": "2025-09-26T10:05:30Z",
  "duration_seconds": 330,
  "results_available": true
}
```

### 6. Cancel Workflow
**DELETE** `/workflows/{task_id}`

Cancels a running workflow.

**Response:**
```json
{
  "task_id": "workflow_uuid_123",
  "status": "cancelled",
  "message": "Workflow cancellation requested",
  "timestamp": "2025-09-26T10:03:15Z"
}
```

### 7. List Workflows
**GET** `/workflows?limit=10&offset=0`

Returns a paginated list of recent workflows.

**Query Parameters:**
- `limit` (optional): Number of workflows to return (default: 10)
- `offset` (optional): Number of workflows to skip (default: 0)

**Response:**
```json
{
  "workflows": [
    {
      "task_id": "workflow_1",
      "status": "completed",
      "dataset_id": "dataset_1",
      "analyses": ["ingest", "anomaly"],
      "created_at": "2025-09-26T10:00:00Z",
      "duration_seconds": 300
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters, dependency validation failed)
- `502` - Bad Gateway (agent service error)
- `500` - Internal Server Error (workflow execution failed)
- `503` - Service Unavailable (agent not available)

## Agent Dependencies

The system enforces the following dependencies:
- **Anomaly Detection** requires **Data Ingestion**
- **Synthetic Data Generation** requires **Data Quality Validation**
- **Data Quality Validation** requires **Data Ingestion**

Workflows that don't satisfy these dependencies will be rejected with a 400 error.

## Agent URLs

The system communicates with the following agent services:

| Agent | URL | Port | Health Endpoint |
|-------|-----|------|----------------|
| Chief Orchestrator | chief-orchestrator:9001 | 9001 | /chief/health |
| Model Router | model-router:9002 | 9002 | /router/health |
| Ingest Agent | ingest-agent:9010 | 9010 | /ingest/health |
| Synthetic Agent | synthetic-agent:9015 | 9015 | /synthetic/health |
| Data Quality Agent | data-quality-agent:9012 | 9012 | /quality/health |
| Anomaly Agent | anomaly-agent:9020 | 9020 | /anomaly/health |
| Security Privacy Agent | security-privacy-agent:9050 | 9050 | /security/health |
| Self Healing Agent | self-healing-agent:9041 | 9041 | /healing/health |

## Testing

Use the `/simulate` endpoint to test agent interactions without requiring all services to be running.

## Monitoring

- Use `/status` for real-time agent health monitoring
- Use `/workflows` to track workflow execution history
- All endpoints include structured logging for debugging
