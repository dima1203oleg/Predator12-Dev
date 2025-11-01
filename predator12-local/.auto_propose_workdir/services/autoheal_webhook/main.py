from fastapi import FastAPI, Request
from pydantic import BaseModel
import logging

app = FastAPI(title="AutoHeal Webhook")
logger = logging.getLogger("autoheal")
logging.basicConfig(level=logging.INFO)

class Alert(BaseModel):
    status: str | None = None
    labels: dict | None = None
    annotations: dict | None = None

class AlertmanagerPayload(BaseModel):
    receiver: str | None = None
    status: str | None = None
    alerts: list[Alert] | None = None

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/webhook")
async def webhook(payload: AlertmanagerPayload, request: Request):
    logger.info("[AUTOHEAL] Received alert batch: status=%s, receiver=%s, count=%s",
                payload.status, payload.receiver, len(payload.alerts or []))
    for a in (payload.alerts or []):
        name = (a.labels or {}).get("alertname", "")
        inst = (a.labels or {}).get("instance", "")
        sev = (a.labels or {}).get("severity", "")
        logger.info("[AUTOHEAL] alert=%s instance=%s severity=%s annotations=%s", name, inst, sev, (a.annotations or {}))
        # TODO: implement actions (restart, scale, rollback) via orchestrator/K8s/ArgoCD.
    return {"received": len(payload.alerts or [])}
