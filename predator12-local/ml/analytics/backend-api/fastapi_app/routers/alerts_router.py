from fastapi import APIRouter, HTTPException, Depends
from typing import Annotated
from ..auto_remediation import remediate, RemediationAction, RemediationError
from ..models import Alert, Settings
from ..dependencies import get_settings
from ..logging import logger, log_alert_to_database

router = APIRouter()

@router.post("/handle_alert")
async def handle_alert(alert: Alert, settings: Annotated[Settings, Depends(get_settings)]):
    """
    Handles incoming alerts, triggers auto-remediation if necessary,
    and logs the alert.
    """
    logger.info(f"Received alert: {alert.name} - {alert.status}")

    # Extract relevant data for remediation
    alert_data = {
        "name": alert.name,
        "severity": alert.severity,
        "status": alert.status,
        "component": alert.component,
        "description": alert.description,
        "remediation_suggestion": alert.remediation_suggestion
    }

    if settings.auto_remediation_enabled and alert.status == "firing" and alert.severity in ["critical", "high"]:
        logger.info(f"Attempting auto-remediation for alert: {alert.name}")
        try:
            action_taken: RemediationAction = await remediate(alert_data)
            logger.info(f"Auto-remediation action for alert '{alert.name}': {action_taken.action_type} - {action_taken.details}")
            # Optionally, update the alert status or send a notification about the remediation
        except RemediationError as e:
            logger.error(f"Auto-remediation failed for alert '{alert.name}': {e}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during auto-remediation for alert '{alert.name}': {e}")

    # Log the alert to a persistent store (e.g., database, logging service)
    # This is a placeholder for actual logging logic
    log_alert_to_database(alert)

    return {"message": "Alert received and processed", "alert_name": alert.name}