# app.py
# FastAPI додаток для Predator12 - управління агентами, моделями, акаунтами

import csv
import json
import os
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

# Allow local dev CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
PORT = int(os.getenv("PORT", 5090))
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
DATA_FILE = DATA_DIR / "store.json"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)


# In-memory store and API models
class AgentIn(BaseModel):
    name: str
    desc: str = ""


class ModelIn(BaseModel):
    name: str
    type: str = "text"


class AccountIn(BaseModel):
    label: str
    type: str = "generic"


store = {"agents": [], "models": [], "accounts": []}

# File lock for JSON persistence
store_lock = threading.Lock()


def load_store():
    """Load store from JSON file if it exists."""
    global store
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r") as f:
                store = json.load(f)
        except Exception as e:
            print(f"Error loading store: {e}")


def save_store():
    """Save store to JSON file."""
    with store_lock:
        try:
            with open(DATA_FILE, "w") as f:
                json.dump(store, f, indent=2)
        except Exception as e:
            print(f"Error saving store: {e}")


def audit(action: str, details: Dict[str, Any]):
    """Write audit log entry."""
    try:
        audit_file = DATA_DIR / "audit.log"
        with open(audit_file, "a") as f:
            entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "action": action,
                "details": details,
            }
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Error logging audit: {e}")


def next_id(prefix: str, coll: list):
    return f"{prefix}{len(coll)+1}"


# Load store on startup
load_store()

# Serve static frontend if present (look for frontend/dist or frontend/build)
ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
FRONTEND_PUBLIC = ROOT_DIR / "frontend" / "public"

index_path = None
if FRONTEND_DIST.exists():
    # Serve built frontend under /assets and return index.html for /
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
    index_path = FRONTEND_DIST / "index.html"
elif FRONTEND_PUBLIC.exists():
    app.mount(
        "/assets", StaticFiles(directory=str(FRONTEND_PUBLIC), html=False), name="frontend_public"
    )
    index_path = FRONTEND_PUBLIC / "index.html"

if index_path and index_path.exists():

    @app.get("/", include_in_schema=False)
    async def serve_index():
        return FileResponse(index_path)

else:
    # Fallback high-visibility landing page served at GET /
    @app.get("/", include_in_schema=False)
    async def landing():
        html = """
        <!doctype html>
        <html lang="uk">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>Predator12 — Інтерфейс</title>
                <style>
                    body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: linear-gradient(135deg,#071224 0%, #0b1b2b 100%); color: #e6f3ff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0 }
                    .card { max-width:900px; padding:36px; border-radius:12px; box-shadow:0 10px 30px rgba(2,6,23,0.6); background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.04) }
                    h1 { font-size:36px; margin-bottom:8px; color:#00ffd1 }
                    p { opacity:0.9 }
                    .row { margin-top:16px; display:flex; gap:8px }
                    a.btn { display:inline-block; padding:10px 14px; background:#0055ff; color:white; border-radius:8px; text-decoration:none }
                    a.ghost { background:transparent; border:1px solid rgba(255,255,255,0.06) }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>🚀 Predator12 — Інтерфейс</h1>
                    <p>Сервер працює на порті <strong>5090</strong>. Нижче — корисні дії для орієнтації.</p>
                    <div class="row">
                        <a class="btn" href="/">Open Root (this page)</a>
                        <a class="btn ghost" href="/health">Health</a>
                        <a class="btn ghost" href="/metrics">Metrics</a>
                    </div>
                    <p style="margin-top:16px;opacity:0.7">If you have a built frontend, place it under <code>frontend/dist</code> or <code>frontend/public</code> and it will be served automatically.</p>
                </div>
            </body>
        </html>
        """
        return Response(content=html, media_type="text/html")


@app.get("/health")
async def health():
    return {"status": "ok", "port": PORT}


@app.get("/metrics")
async def metrics():
    # Lightweight metrics placeholder
    return {"uptime_seconds": 0, "requests": 0}


@app.get("/api/agents")
async def api_get_agents():
    return store["agents"]


@app.post("/api/agents")
async def api_post_agent(payload: AgentIn):
    item = {
        "id": next_id("a", store["agents"]),
        "name": payload.name,
        "desc": payload.desc,
        "models": [],
    }
    store["agents"].append(item)
    save_store()
    audit("create_agent", item)
    return item


@app.get("/api/models")
async def api_get_models():
    return store["models"]


@app.post("/api/models")
async def api_post_model(payload: ModelIn):
    item = {"id": next_id("m", store["models"]), "name": payload.name, "type": payload.type}
    store["models"].append(item)
    save_store()
    audit("create_model", item)
    return item


@app.get("/api/accounts")
async def api_get_accounts():
    return store["accounts"]


@app.post("/api/accounts")
async def api_post_account(payload: AccountIn):
    item = {"id": next_id("acc", store["accounts"]), "label": payload.label, "type": payload.type}
    store["accounts"].append(item)
    save_store()
    audit("create_account", item)
    return item


@app.post("/restart")
async def api_restart():
    # Restart stub: in production hook into process manager
    return {"status": "requested"}


@app.post("/api/agents/{agent_id}/attach_model")
async def attach_model(agent_id: str, payload: Dict[str, str]):
    model_id = payload.get("model_id")
    a = next((x for x in store["agents"] if x["id"] == agent_id), None)
    if not a:
        raise HTTPException(status_code=404, detail="agent not found")
    if model_id in a.get("models", []):
        return {"status": "already"}
    a.setdefault("models", []).append(model_id)
    save_store()
    audit("attach_model", {"agent": agent_id, "model": model_id})
    return {"status": "ok", "agent": a}


@app.post("/api/agents/{agent_id}/detach_model")
async def detach_model(agent_id: str, payload: Dict[str, str]):
    model_id = payload.get("model_id")
    a = next((x for x in store["agents"] if x["id"] == agent_id), None)
    if not a:
        raise HTTPException(status_code=404, detail="agent not found")
    a["models"] = [m for m in a.get("models", []) if m != model_id]
    save_store()
    audit("detach_model", {"agent": agent_id, "model": model_id})
    return {"status": "ok", "agent": a}


@app.post("/api/agents/{agent_id}/set_models")
async def set_models(agent_id: str, payload: Dict[str, List[str]]):
    models = payload.get("models")
    if models is None:
        raise HTTPException(status_code=400, detail="models list required")
    a = next((x for x in store["agents"] if x["id"] == agent_id), None)
    if not a:
        raise HTTPException(status_code=404, detail="agent not found")
    a["models"] = models
    save_store()
    audit("set_models", {"agent": agent_id, "models": models})
    return {"status": "ok", "agent": a}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Accept CSV only for prototype
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="only csv supported in prototype")
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="failed to decode file")
    # parse first N rows
    rows = []
    try:
        reader = csv.reader(text.splitlines())
        for i, row in enumerate(reader):
            if i >= 10:
                break
            rows.append(row)
    except Exception:
        raise HTTPException(status_code=400, detail="csv parse error")
    return {"filename": file.filename, "preview": rows}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT)
