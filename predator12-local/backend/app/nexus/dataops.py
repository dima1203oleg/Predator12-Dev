"""
DataOps API endpoints for Nexus Core
Provides data management, ETL pipeline control, and synthetic data generation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import math
import uuid
import random
import asyncio
import pandas as pd
import io
import json

router = APIRouter(prefix="/api/v1/dataops", tags=["dataops"])

# In-memory storage (in production, use database)
datasets: Dict[str, Dict] = {}
etl_pipelines: Dict[str, Dict] = {}
pipeline_runs: Dict[str, Dict] = {}


class Dataset(BaseModel):
    id: str
    name: str
    type: str  # 'csv', 'json', 'parquet', 'xml', 'database'
    size: int
    rows: int
    columns: int
    status: str  # 'ready', 'processing', 'error', 'uploading'
    last_modified: datetime
    source: str
    metadata: Optional[Dict[str, Any]] = None
    schema: Optional[Dict[str, str]] = None


class ETLPipeline(BaseModel):
    id: str
    name: str
    source: str
    destination: str
    status: str  # 'running', 'stopped', 'error', 'completed'
    progress: float
    last_run: datetime
    next_run: Optional[datetime] = None
    config: Dict[str, Any]
    schedule: Optional[str] = None


class SyntheticDataRequest(BaseModel):
    name: str
    rows: int
    columns: int
    data_type: str  # 'mixed', 'numerical', 'categorical', 'timeseries'
    seed: Optional[int] = None
    parameters: Optional[Dict[str, Any]] = None


class DataTransformation(BaseModel):
    operation: str  # 'filter', 'aggregate', 'join', 'pivot', 'clean'
    parameters: Dict[str, Any]
    target_columns: Optional[List[str]] = None


class ETLJobRequest(BaseModel):
    pipeline_id: str
    transformations: List[DataTransformation]
    schedule: Optional[str] = None
    notifications: Optional[List[str]] = None


# Initialize sample data
def initialize_sample_data():
    """Initialize sample datasets and pipelines"""
    
    # Sample datasets
    sample_datasets = [
        {
            "id": "dataset_1",
            "name": "User Analytics Data",
            "type": "csv",
            "size": 2621440,  # 2.5MB
            "rows": 15000,
            "columns": 12,
            "status": "ready",
            "last_modified": datetime.now() - timedelta(days=1),
            "source": "analytics_db",
            "metadata": {
                "description": "User behavior analytics from web application",
                "tags": ["analytics", "user_behavior", "web"],
                "owner": "analytics_team"
            },
            "schema": {
                "user_id": "string",
                "session_id": "string",
                "timestamp": "datetime",
                "page_views": "integer",
                "duration": "float",
                "device_type": "string",
                "location": "string",
                "conversion": "boolean"
            }
        },
        {
            "id": "dataset_2",
            "name": "Security Logs",
            "type": "json",
            "size": 9126805,  # 8.7MB
            "rows": 45000,
            "columns": 8,
            "status": "processing",
            "last_modified": datetime.now(),
            "source": "security_system",
            "metadata": {
                "description": "Security event logs from monitoring system",
                "tags": ["security", "logs", "monitoring"],
                "owner": "security_team"
            },
            "schema": {
                "event_id": "string",
                "timestamp": "datetime",
                "severity": "string",
                "source_ip": "string",
                "event_type": "string",
                "description": "string",
                "user_agent": "string",
                "status": "string"
            }
        }
    ]
    
    for dataset_data in sample_datasets:
        datasets[dataset_data["id"]] = dataset_data
    
    # Sample ETL pipelines
    sample_pipelines = [
        {
            "id": "pipeline_1",
            "name": "Daily Analytics ETL",
            "source": "PostgreSQL Analytics DB",
            "destination": "Data Warehouse",
            "status": "running",
            "progress": 65.0,
            "last_run": datetime.now() - timedelta(hours=2),
            "next_run": datetime.now() + timedelta(hours=22),
            "config": {
                "source_connection": "postgresql://analytics_db",
                "destination_connection": "warehouse://main",
                "batch_size": 1000,
                "parallel_workers": 4
            },
            "schedule": "0 8 * * *"  # Daily at 8 AM
        },
        {
            "id": "pipeline_2",
            "name": "Security Data Pipeline",
            "source": "Kafka Stream",
            "destination": "OpenSearch",
            "status": "completed",
            "progress": 100.0,
            "last_run": datetime.now() - timedelta(minutes=30),
            "next_run": None,
            "config": {
                "source_connection": "kafka://security-events",
                "destination_connection": "opensearch://security-index",
                "real_time": True
            },
            "schedule": None
        }
    ]
    
    for pipeline_data in sample_pipelines:
        etl_pipelines[pipeline_data["id"]] = pipeline_data


# Initialize sample data on startup
initialize_sample_data()


@router.get("/datasets", response_model=List[Dataset])
async def list_datasets(
    status: Optional[str] = None,
    data_type: Optional[str] = None,
    limit: int = 50
) -> List[Dataset]:
    """
    List all datasets with optional filters
    """
    result = []
    
    for dataset_data in datasets.values():
        # Apply filters
        if status and dataset_data["status"] != status:
            continue
        if data_type and dataset_data["type"] != data_type:
            continue
        
        result.append(Dataset(**dataset_data))
    
    # Sort by last modified (newest first)
    result.sort(key=lambda x: x.last_modified, reverse=True)
    
    return result[:limit]


@router.get("/datasets/{dataset_id}", response_model=Dataset)
async def get_dataset(dataset_id: str) -> Dataset:
    """
    Get detailed information about a specific dataset
    """
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return Dataset(**datasets[dataset_id])


@router.post("/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[str] = None
):
    """
    Upload a new dataset file
    """
    dataset_id = str(uuid.uuid4())
    
    # Determine file type
    file_extension = file.filename.split('.')[-1].lower() if file.filename else 'unknown'
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Analyze file structure (simplified)
    rows, columns = 0, 0
    schema = {}
    
    try:
        if file_extension == 'csv':
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            rows, columns = df.shape
            schema = {col: str(df[col].dtype) for col in df.columns}
        elif file_extension in ['xlsx', 'xls']:
            # Excel parsing using openpyxl/xlrd engines
            excel_buffer = io.BytesIO(content)
            df = pd.read_excel(excel_buffer)
            rows, columns = df.shape
            schema = {col: str(df[col].dtype) for col in df.columns}
        elif file_extension == 'json':
            data = json.loads(content.decode('utf-8'))
            if isinstance(data, list) and data:
                rows = len(data)
                columns = len(data[0]) if isinstance(data[0], dict) else 1
                if isinstance(data[0], dict):
                    schema = {key: type(value).__name__ for key, value in data[0].items()}
    except Exception as e:
        # If analysis fails, use defaults
        pass
    
    # Create dataset record
    dataset_data = {
        "id": dataset_id,
        "name": name or file.filename or f"Dataset_{dataset_id[:8]}",
        "type": file_extension,
        "size": file_size,
        "rows": rows,
        "columns": columns,
        "status": "ready",
        "last_modified": datetime.now(),
        "source": "upload",
        "metadata": {
            "description": description or f"Uploaded file: {file.filename}",
            "tags": tags.split(',') if tags else [],
            "original_filename": file.filename,
            "upload_timestamp": datetime.now().isoformat()
        },
        "schema": schema
    }
    
    datasets[dataset_id] = dataset_data
    
    return {
        "dataset_id": dataset_id,
        "message": "Dataset uploaded successfully",
        "details": {
            "name": dataset_data["name"],
            "size": file_size,
            "rows": rows,
            "columns": columns
        }
    }


@router.post("/datasets/synthetic")
async def generate_synthetic_dataset(request: SyntheticDataRequest):
    """
    Generate synthetic dataset based on specifications
    """
    dataset_id = str(uuid.uuid4())
    
    # Set random seed if provided
    if request.seed:
        random.seed(request.seed)
    
    # Generate synthetic data based on type
    synthetic_data = []
    schema = {}
    
    if request.data_type == "numerical":
        # Generate numerical data
        for i in range(request.rows):
            row = {}
            for j in range(request.columns):
                col_name = f"numeric_col_{j+1}"
                row[col_name] = random.gauss(100, 25)
                schema[col_name] = "float"
            synthetic_data.append(row)
    
    elif request.data_type == "categorical":
        # Generate categorical data
        categories = ["Category_A", "Category_B", "Category_C", "Category_D", "Category_E"]
        for i in range(request.rows):
            row = {}
            for j in range(request.columns):
                col_name = f"category_col_{j+1}"
                row[col_name] = random.choice(categories)
                schema[col_name] = "string"
            synthetic_data.append(row)
    
    elif request.data_type == "timeseries":
        # Generate time series data
        start_date = datetime.now() - timedelta(days=request.rows)
        for i in range(request.rows):
            row = {
                "timestamp": (start_date + timedelta(days=i)).isoformat(),
                "value": 100 + random.gauss(0, 10) + 5 * math.sin(i * 0.1)
            }
            for j in range(request.columns - 2):
                col_name = f"metric_{j+1}"
                row[col_name] = random.uniform(0, 100)
            synthetic_data.append(row)
        
        schema = {"timestamp": "datetime", "value": "float"}
        for j in range(request.columns - 2):
            schema[f"metric_{j+1}"] = "float"
    
    else:  # mixed
        # Generate mixed data types
        for i in range(request.rows):
            row = {
                "id": f"record_{i+1}",
                "numeric_value": random.gauss(50, 15),
                "category": random.choice(["A", "B", "C"]),
                "boolean_flag": random.choice([True, False]),
                "timestamp": (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat()
            }
            
            # Add additional columns
            for j in range(max(0, request.columns - 5)):
                col_name = f"extra_col_{j+1}"
                row[col_name] = random.uniform(0, 1000)
            
            synthetic_data.append(row)
        
        schema = {
            "id": "string",
            "numeric_value": "float",
            "category": "string",
            "boolean_flag": "boolean",
            "timestamp": "datetime"
        }
        for j in range(max(0, request.columns - 5)):
            schema[f"extra_col_{j+1}"] = "float"
    
    # Calculate size estimate (rough)
    estimated_size = len(json.dumps(synthetic_data[:10])) * (request.rows // 10)
    
    # Create dataset record
    dataset_data = {
        "id": dataset_id,
        "name": request.name,
        "type": "json",
        "size": estimated_size,
        "rows": request.rows,
        "columns": request.columns,
        "status": "ready",
        "last_modified": datetime.now(),
        "source": "synthetic_generation",
        "metadata": {
            "description": f"Synthetically generated {request.data_type} dataset",
            "tags": ["synthetic", request.data_type],
            "generation_parameters": request.parameters or {},
            "seed": request.seed
        },
        "schema": schema
    }
    
    datasets[dataset_id] = dataset_data
    
    return {
        "dataset_id": dataset_id,
        "message": "Synthetic dataset generated successfully",
        "details": {
            "name": request.name,
            "rows": request.rows,
            "columns": request.columns,
            "data_type": request.data_type
        }
    }


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """
    Delete a dataset
    """
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    del datasets[dataset_id]
    
    return {"message": "Dataset deleted successfully"}


@router.get("/pipelines", response_model=List[ETLPipeline])
async def list_etl_pipelines(
    status: Optional[str] = None,
    limit: int = 50
) -> List[ETLPipeline]:
    """
    List all ETL pipelines
    """
    result = []
    
    for pipeline_data in etl_pipelines.values():
        if status and pipeline_data["status"] != status:
            continue
        
        result.append(ETLPipeline(**pipeline_data))
    
    # Sort by last run (newest first)
    result.sort(key=lambda x: x.last_run, reverse=True)
    
    return result[:limit]


@router.get("/pipelines/{pipeline_id}", response_model=ETLPipeline)
async def get_etl_pipeline(pipeline_id: str) -> ETLPipeline:
    """
    Get detailed information about a specific ETL pipeline
    """
    if pipeline_id not in etl_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    return ETLPipeline(**etl_pipelines[pipeline_id])


@router.post("/pipelines/{pipeline_id}/start")
async def start_etl_pipeline(pipeline_id: str, background_tasks: BackgroundTasks):
    """
    Start an ETL pipeline
    """
    if pipeline_id not in etl_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    pipeline = etl_pipelines[pipeline_id]
    
    if pipeline["status"] == "running":
        raise HTTPException(status_code=400, detail="Pipeline is already running")
    
    # Start pipeline
    pipeline["status"] = "running"
    pipeline["progress"] = 0.0
    pipeline["last_run"] = datetime.now()
    
    # Add background task to simulate pipeline execution
    background_tasks.add_task(simulate_pipeline_execution, pipeline_id)
    
    return {"message": "Pipeline started successfully"}


@router.post("/pipelines/{pipeline_id}/stop")
async def stop_etl_pipeline(pipeline_id: str):
    """
    Stop a running ETL pipeline
    """
    if pipeline_id not in etl_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    pipeline = etl_pipelines[pipeline_id]
    
    if pipeline["status"] != "running":
        raise HTTPException(status_code=400, detail="Pipeline is not running")
    
    pipeline["status"] = "stopped"
    
    return {"message": "Pipeline stopped successfully"}


async def simulate_pipeline_execution(pipeline_id: str):
    """
    Simulate ETL pipeline execution
    """
    pipeline = etl_pipelines[pipeline_id]
    
    try:
        # Simulate pipeline steps
        steps = ["extracting", "transforming", "loading", "validating"]
        
        for i, step in enumerate(steps):
            # Simulate processing time
            await asyncio.sleep(random.uniform(2, 5))
            
            # Update progress
            progress = (i + 1) / len(steps) * 100
            pipeline["progress"] = progress
            
            # Check if pipeline was stopped
            if pipeline["status"] != "running":
                return
        
        # Complete pipeline
        pipeline["status"] = "completed"
        pipeline["progress"] = 100.0
        
        # Schedule next run if it's a scheduled pipeline
        if pipeline.get("schedule"):
            # Simple scheduling logic (in production, use proper cron parser)
            pipeline["next_run"] = datetime.now() + timedelta(hours=24)
    
    except Exception as e:
        pipeline["status"] = "error"
        pipeline["error_message"] = str(e)


@router.get("/stats")
async def get_dataops_stats() -> Dict[str, Any]:
    """
    Get comprehensive DataOps statistics
    """
    # Dataset statistics
    total_datasets = len(datasets)
    dataset_types = {}
    total_size = 0
    total_rows = 0
    
    for dataset in datasets.values():
        dataset_types[dataset["type"]] = dataset_types.get(dataset["type"], 0) + 1
        total_size += dataset["size"]
        total_rows += dataset["rows"]
    
    # Pipeline statistics
    total_pipelines = len(etl_pipelines)
    pipeline_statuses = {}
    
    for pipeline in etl_pipelines.values():
        status = pipeline["status"]
        pipeline_statuses[status] = pipeline_statuses.get(status, 0) + 1
    
    # Recent activity
    recent_datasets = sorted(
        datasets.values(),
        key=lambda x: x["last_modified"],
        reverse=True
    )[:5]
    
    recent_pipeline_runs = sorted(
        etl_pipelines.values(),
        key=lambda x: x["last_run"],
        reverse=True
    )[:5]
    
    return {
        "datasets": {
            "total": total_datasets,
            "total_size_bytes": total_size,
            "total_rows": total_rows,
            "by_type": dataset_types,
            "recent": [
                {
                    "id": ds["id"],
                    "name": ds["name"],
                    "last_modified": ds["last_modified"]
                }
                for ds in recent_datasets
            ]
        },
        "pipelines": {
            "total": total_pipelines,
            "by_status": pipeline_statuses,
            "recent_runs": [
                {
                    "id": pl["id"],
                    "name": pl["name"],
                    "status": pl["status"],
                    "last_run": pl["last_run"]
                }
                for pl in recent_pipeline_runs
            ]
        },
        "system": {
            "uptime": "99.8%",
            "avg_processing_time": "2.3 minutes",
            "success_rate": "97.5%"
        }
    }


@router.get("/datasets/{dataset_id}/preview")
async def preview_dataset(dataset_id: str, limit: int = 10) -> Dict[str, Any]:
    """
    Get a preview of dataset content
    """
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = datasets[dataset_id]
    
    # Generate sample data based on schema
    sample_data = []
    schema = dataset.get("schema", {})
    
    for i in range(min(limit, dataset["rows"])):
        row = {}
        for col_name, col_type in schema.items():
            if col_type in ["int64", "integer"]:
                row[col_name] = random.randint(1, 1000)
            elif col_type in ["float64", "float"]:
                row[col_name] = round(random.uniform(0, 100), 2)
            elif col_type == "boolean":
                row[col_name] = random.choice([True, False])
            elif col_type == "datetime":
                row[col_name] = (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat()
            else:  # string
                row[col_name] = f"sample_value_{i+1}"
        sample_data.append(row)
    
    return {
        "dataset_id": dataset_id,
        "dataset_name": dataset["name"],
        "total_rows": dataset["rows"],
        "preview_rows": len(sample_data),
        "schema": schema,
        "sample_data": sample_data
    }
