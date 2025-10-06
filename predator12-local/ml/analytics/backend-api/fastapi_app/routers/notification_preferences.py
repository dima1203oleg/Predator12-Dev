from fastapi import APIRouter, Depends, HTTPException, Body, Response, status
from pydantic import BaseModel, Field
from ..models.auth_models import User
from ..services.auth_service import get_current_user
from typing import Optional
from datetime import datetime

router = APIRouter(
    prefix="/api/notification-preferences",
    tags=["notifications"]
)

class NotificationPreferences(BaseModel):
    """Модель налаштувань сповіщень користувача"""
    info: bool = Field(True, description="Отримувати інформаційні сповіщення")
    success: bool = Field(True, description="Отримувати сповіщення про успішні операції")
    warning: bool = Field(True, description="Отримувати попередження")
    error: bool = Field(True, description="Отримувати сповіщення про помилки")
    critical: bool = Field(True, description="Отримувати критичні сповіщення")
    sound: bool = Field(True, description="Увімкнути звукові сповіщення")
    autoClose: bool = Field(False, description="Автоматично закривати сповіщення")
    autoCloseDelay: int = Field(5000, description="Затримка до автоматичного закриття (мс)")
    updated_at: Optional[datetime] = Field(None, description="Час останнього оновлення")

@router.get("/", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    """
    Отримати налаштування сповіщень для поточного користувача
    """
    try:
        # Тут би був код для отримання з бази даних
        # У спрощеному випадку, повертаємо стандартні налаштування
        # В реальному використанні - витяг з PostgreSQL/Redis
        user_id = current_user.id
        
        # Для прикладу Redis:
        # preferences_json = await redis.get(
        #    f"user:{user_id}:notification_preferences"
        # )
        
        # Приклад отримання з PostgreSQL:
        # preferences = await db.fetch_one(
        #     """
        #     SELECT preferences 
        #     FROM user_preferences 
        #     WHERE user_id = :user_id
        #     """,
        #     {"user_id": user_id}
        # )
        
        # Повертаємо стандартні налаштування для демонстрації
        return NotificationPreferences()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Помилка отримання налаштувань сповіщень: {str(e)}"
        )

@router.post("/", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences: NotificationPreferences = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Оновити налаштування сповіщень для поточного користувача
    """
    try:
        user_id = current_user.id
        
        # Встановлюємо час оновлення
        preferences.updated_at = datetime.utcnow()
        
        # Тут код для збереження в базу даних
        # Приклад збереження в Redis:
        # await redis.set(
        #     f"user:{user_id}:notification_preferences",
        #     preferences.json(),
        #     ex=60*60*24*30  # TTL 30 днів
        # )
        
        # Приклад збереження в PostgreSQL:
        # await db.execute(
        #     """
        #     INSERT INTO user_preferences (user_id, preferences, updated_at)
        #     VALUES (:user_id, :preferences, :updated_at)
        #     ON CONFLICT (user_id) DO UPDATE
        #     SET preferences = :preferences, updated_at = :updated_at
        #     """,
        #     {
        #         "user_id": user_id,
        #         "preferences": preferences.json(),
        #         "updated_at": preferences.updated_at
        #     }
        # )
        
        # Логування активності користувача
        # await log_user_activity(
        #     user_id=user_id,
        #     action="update_notification_preferences",
        #     details={}
        # )
        
        return preferences
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Помилка оновлення налаштувань сповіщень: {str(e)}"
        )

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def reset_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    """
    Скинути налаштування сповіщень до стандартних
    """
    try:
        user_id = current_user.id
        
        # Тут код для видалення налаштувань з бази даних
        # Приклад для Redis:
        # await redis.delete(
        #     f"user:{user_id}:notification_preferences"
        # )
        
        # Приклад для PostgreSQL:
        # await db.execute(
        #     "DELETE FROM user_preferences WHERE user_id = :user_id",
        #     {"user_id": user_id}
        # )
        
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Помилка скидання налаштувань сповіщень: {str(e)}"
        ) 