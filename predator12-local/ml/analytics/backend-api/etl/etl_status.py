import os
import json
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime

STATUS_FILE = os.getenv("ETL_STATUS_FILE", "etl_status.json")

app = FastAPI(title="ETL Watcher Status API")

class ETLJob(BaseModel):
    filename: str
    status: str  # pending, running, done, error
    started: str = None
    finished: str = None
    rows: int = None
    error: str = None

# Simple file-based status store
def load_status() -> List[Dict]:
    if not os.path.exists(STATUS_FILE):
        return []
    with open(STATUS_FILE, "r") as f:
        return json.load(f)

def save_status(status: List[Dict]):
    with open(STATUS_FILE, "w") as f:
        json.dump(status, f, indent=2)

@app.get("/api/etl/status", response_model=List[ETLJob])
def get_status():
    return load_status()

@app.post("/api/etl/manual-trigger")
def manual_trigger(filename: str):
    # Touch the file to retrigger watcher
    data_path = os.path.join("data", filename)
    if not os.path.exists(data_path):
        raise HTTPException(404, detail="File not found")
    os.utime(data_path, None)
    return {"message": f"Triggered ETL for {filename}"}

@app.get("/api/etl/log/{filename}")
def get_log(filename: str):
    log_path = os.path.join("logs", f"etl_{filename}.log")
    if not os.path.exists(log_path):
        return {"log": "No log found."}
    with open(log_path, "r") as f:
        return {"log": f.read()}

@app.get("/api/etl/history", response_model=List[ETLJob])
def get_history():
    return load_status()
