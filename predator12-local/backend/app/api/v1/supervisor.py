from fastapi import APIRouter, HTTPException, Depends
from typing import Any
from app.agents.supervisor import supervisor
from app.core.security import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/command")
async def execute_command(
    command: str, 
    parameters: dict[str, Any] = None,
    current_user = Depends(get_current_user)
) -> dict[str, Any]:
    """Виконання команди через головного агента"""
    try:
        if parameters is None:
            parameters = {}
        
        # Додавання інформації про користувача
        parameters["user_id"] = current_user.get("sub")
        parameters["user_roles"] = current_user.get("realm_access", {}).get("roles", [])
        
        result = await supervisor.handle_user_command(command, parameters)
        
        logger.info(f"Command executed: {command} by user {current_user.get('sub')}")
        return result
        
    except Exception as e:
        logger.error(f"Command execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_system_status(current_user = Depends(get_current_user)) -> dict[str, Any]:
    """Отримання статусу системи"""
    try:
        status = await supervisor.handle_user_command("system_status", {})
        return status
        
    except Exception as e:
        logger.error(f"Failed to get system status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/self-improvement/stop")
async def stop_self_improvement(current_user = Depends(get_current_user)) -> dict[str, Any]:
    """Зупинка самовдосконалення"""
    try:
        # Перевірка прав адміністратора
        user_roles = current_user.get("realm_access", {}).get("roles", [])
        if "admin" not in user_roles:
            raise HTTPException(status_code=403, detail="Admin role required")
        
        result = await supervisor.handle_user_command("stop_self_improve", {})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop self-improvement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/self-improvement/start")
async def start_self_improvement(current_user = Depends(get_current_user)) -> dict[str, Any]:
    """Запуск самовдосконалення"""
    try:
        # Перевірка прав адміністратора
        user_roles = current_user.get("realm_access", {}).get("roles", [])
        if "admin" not in user_roles:
            raise HTTPException(status_code=403, detail="Admin role required")
        
        result = await supervisor.handle_user_command("start_self_improve", {})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start self-improvement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shutdown")
async def shutdown_system(current_user = Depends(get_current_user)) -> dict[str, Any]:
    """Вимкнення системи"""
    try:
        # Перевірка прав адміністратора
        user_roles = current_user.get("realm_access", {}).get("roles", [])
        if "admin" not in user_roles:
            raise HTTPException(status_code=403, detail="Admin role required")
        
        result = await supervisor.handle_user_command("shutdown", {})
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"System shutdown failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks")
async def get_active_tasks(current_user = Depends(get_current_user)) -> dict[str, Any]:
    """Отримання списку активних завдань"""
    try:
        status = await supervisor.handle_user_command("system_status", {})
        return {
            "active_tasks": status.get("active_tasks", 0),
            "tasks": status.get("tasks", []),
            "timestamp": status.get("timestamp")
        }
        
    except Exception as e:
        logger.error(f"Failed to get active tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
