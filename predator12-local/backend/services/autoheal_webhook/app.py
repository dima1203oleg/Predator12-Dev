from fastapi import FastAPI, Request, HTTPException
import httpx
import os
import asyncio
import logging
from typing import Dict, Any

app = FastAPI(title="PredatorAnalytics AutoHeal Webhook")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
K8S_ENDPOINT = os.getenv("K8S_ENDPOINT", "http://localhost:8001")  # Kubernetes API
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL", "")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Action mappings for different alert types
ACTIONS = {
    "OpenSearchClusterRed": [
        "scale:opensearch:up",
        "restart:opensearch_exporter",
        "notify:devops"
    ],
    "NodeLowMemory": [
        "evict:pods:best-effort",
        "scale:service:celery:down",
        "notify:devops"
    ],
    "ContainerRestarts": [
        "restart:container",
        "notify:devops"
    ]
}

@app.post("/alert")
@app.post("/webhook")
async def alertmanager_webhook(payload: Dict[str, Any]):
    """
    Receive alerts from Alertmanager and execute remediation actions
    """
    logger.info(f"Received alert payload: {payload}")

    alerts = payload.get("alerts", [])
    if not alerts:
        return {"status": "ok", "message": "No alerts to process"}

    results = []

    for alert in alerts:
        alert_name = alert.get("labels", {}).get("alertname", "unknown")
        instance = alert.get("labels", {}).get("instance", "unknown")

        logger.info(f"Processing alert: {alert_name} on {instance}")

        # Get actions for this alert type
        actions = ACTIONS.get(alert_name, ["notify:devops"])

        for action in actions:
            try:
                result = await execute_action(action, alert)
                results.append({
                    "alert": alert_name,
                    "instance": instance,
                    "action": action,
                    "result": result
                })
                logger.info(f"Action {action} completed: {result}")
            except Exception as e:
                logger.error(f"Action {action} failed: {e}")
                results.append({
                    "alert": alert_name,
                    "instance": instance,
                    "action": action,
                    "result": f"error: {str(e)}"
                })

    return {"status": "ok", "results": results}

async def execute_action(action: str, alert: Dict[str, Any]) -> str:
    """
    Execute a specific remediation action
    """
    action_type, *params = action.split(":")

    if action_type == "notify":
        return await notify_devops(action, alert)
    elif action_type == "restart":
        return await restart_service(params[0])
    elif action_type == "scale":
        return await scale_service(params[0], params[1])
    elif action_type == "evict":
        return await evict_pods(params[0])
    else:
        return f"unknown action: {action}"

async def notify_devops(action: str, alert: Dict[str, Any]) -> str:
    """
    Send notification to DevOps team via Slack and/or Telegram
    """
    alert_name = alert.get("labels", {}).get("alertname", "unknown")
    instance = alert.get("labels", {}).get("instance", "unknown")
    summary = alert.get("annotations", {}).get("summary", "No summary")

    message = f"🚨 Alert: {alert_name}\n📍 Instance: {instance}\n📝 {summary}"

    notifications = []

    # Send to Slack if configured
    if SLACK_WEBHOOK:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(SLACK_WEBHOOK, json={"text": message})
            notifications.append("Slack")
        except Exception as e:
            logger.error(f"Slack notification failed: {e}")

    # Send to Telegram if configured
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                await client.post(url, json={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "HTML"
                })
            notifications.append("Telegram")
        except Exception as e:
            logger.error(f"Telegram notification failed: {e}")

    if notifications:
        return f"Sent notifications to: {', '.join(notifications)}"
    else:
        return "No notification channels configured"

async def restart_service(service: str) -> str:
    """
    Restart a specific service
    """
    if service == "opensearch_exporter":
        # Restart the OpenSearch exporter container
        try:
            import subprocess
            result = subprocess.run([
                "docker", "restart", "opensearch_exporter"
            ], capture_output=True, text=True)

            if result.returncode == 0:
                return "OpenSearch exporter restarted successfully"
            else:
                return f"Failed to restart OpenSearch exporter: {result.stderr}"
        except Exception as e:
            return f"Error restarting service: {str(e)}"
    else:
        return f"Unknown service to restart: {service}"

async def scale_service(service: str, direction: str) -> str:
    """
    Scale a service up or down
    """
    # This is a placeholder - in a real K8s environment, you would use the K8s API
    # For Docker Compose, we could restart with different replica counts
    return f"Scaling {service} {direction} - placeholder implementation"

async def evict_pods(priority: str) -> str:
    """
    Evict pods by priority class
    """
    # Placeholder for K8s pod eviction
    return f"Evicting {priority} pods - placeholder implementation"

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "autoheal-webhook"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8088)
