"""
Keycloak Authentication Middleware для FastAPI
"""
import os
from typing import Optional, List
from functools import wraps

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from keycloak import KeycloakOpenID
from jose import jwt, JWTError
import logging

logger = logging.getLogger(__name__)

# Keycloak Configuration
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "predator")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "predator-backend")
KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "predator-backend-secret")

# Initialize Keycloak OpenID Client
keycloak_openid = KeycloakOpenID(
    server_url=KEYCLOAK_URL,
    client_id=KEYCLOAK_CLIENT_ID,
    realm_name=KEYCLOAK_REALM,
    client_secret_key=KEYCLOAK_CLIENT_SECRET,
    verify=True
)

# OAuth2 схеми
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token")
http_bearer = HTTPBearer()


class KeycloakUser:
    """Модель користувача з токена Keycloak"""
    
    def __init__(self, token_info: dict):
        self.sub = token_info.get("sub")
        self.email = token_info.get("email")
        self.username = token_info.get("preferred_username")
        self.first_name = token_info.get("given_name")
        self.last_name = token_info.get("family_name")
        self.roles = token_info.get("realm_roles", [])
        self.groups = token_info.get("groups", [])
        self.tenant = token_info.get("tenant")
        self.email_verified = token_info.get("email_verified", False)
        self.raw_token = token_info
    
    def has_role(self, role: str) -> bool:
        """Перевірка наявності ролі"""
        return role in self.roles
    
    def has_any_role(self, roles: List[str]) -> bool:
        """Перевірка наявності хоча б однієї ролі"""
        return any(role in self.roles for role in roles)
    
    def has_all_roles(self, roles: List[str]) -> bool:
        """Перевірка наявності всіх ролей"""
        return all(role in self.roles for role in roles)
    
    def in_group(self, group: str) -> bool:
        """Перевірка приналежності до групи"""
        return group in self.groups


async def get_current_user(token: str = Depends(oauth2_scheme)) -> KeycloakUser:
    """
    Dependency для отримання поточного користувача з JWT токена
    
    Args:
        token: JWT токен з Authorization header
        
    Returns:
        KeycloakUser: Об'єкт користувача
        
    Raises:
        HTTPException: Якщо токен недійсний або протермінований
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Отримуємо публічний ключ від Keycloak
        public_key = (
            "-----BEGIN PUBLIC KEY-----\n"
            + keycloak_openid.public_key()
            + "\n-----END PUBLIC KEY-----"
        )
        
        # Декодуємо та валідуємо токен
        token_info = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=KEYCLOAK_CLIENT_ID,
            options={
                "verify_signature": True,
                "verify_aud": True,
                "verify_exp": True,
            }
        )
        
        # Створюємо об'єкт користувача
        user = KeycloakUser(token_info)
        
        logger.info(f"User authenticated: {user.username} ({user.email})")
        return user
        
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise credentials_exception


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)
) -> Optional[KeycloakUser]:
    """
    Dependency для опціональної автентифікації
    Повертає користувача якщо токен надано, інакше None
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials.credentials)
    except HTTPException:
        return None


def require_roles(roles: List[str], require_all: bool = False):
    """
    Decorator для перевірки ролей користувача
    
    Args:
        roles: Список необхідних ролей
        require_all: Якщо True - потрібні всі ролі, якщо False - хоча б одна
        
    Example:
        @app.get("/admin")
        @require_roles(["admin"])
        async def admin_endpoint(user: KeycloakUser = Depends(get_current_user)):
            return {"message": "Admin access granted"}
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, user: KeycloakUser = Depends(get_current_user), **kwargs):
            if require_all:
                if not user.has_all_roles(roles):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Requires all roles: {', '.join(roles)}"
                    )
            else:
                if not user.has_any_role(roles):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Requires one of roles: {', '.join(roles)}"
                    )
            
            return await func(*args, user=user, **kwargs)
        return wrapper
    return decorator


def require_groups(groups: List[str]):
    """
    Decorator для перевірки груп користувача
    
    Args:
        groups: Список необхідних груп
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, user: KeycloakUser = Depends(get_current_user), **kwargs):
            if not any(user.in_group(group) for group in groups):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Requires membership in one of groups: {', '.join(groups)}"
                )
            
            return await func(*args, user=user, **kwargs)
        return wrapper
    return decorator


# Готові dependency для різних рівнів доступу
async def require_admin(user: KeycloakUser = Depends(get_current_user)) -> KeycloakUser:
    """Dependency: тільки адміністратори"""
    if not user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


async def require_analyst(user: KeycloakUser = Depends(get_current_user)) -> KeycloakUser:
    """Dependency: аналітики та вище"""
    if not user.has_any_role(["admin", "analyst"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Analyst access required"
        )
    return user


async def require_engineer(user: KeycloakUser = Depends(get_current_user)) -> KeycloakUser:
    """Dependency: інженери (data/ml)"""
    if not user.has_any_role(["admin", "data-engineer", "ml-engineer"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Engineer access required"
        )
    return user


# Health check функція для Keycloak
async def keycloak_health_check() -> bool:
    """
    Перевірка доступності Keycloak сервера
    
    Returns:
        bool: True якщо Keycloak доступний
    """
    try:
        # Спроба отримати well-known конфігурацію
        config = keycloak_openid.well_known()
        return config is not None
    except Exception as e:
        logger.error(f"Keycloak health check failed: {str(e)}")
        return False


# Утиліти для роботи з токенами
async def refresh_token(refresh_token: str) -> dict:
    """
    Оновлення access токена за допомогою refresh токена
    
    Args:
        refresh_token: Refresh токен
        
    Returns:
        dict: Новий набір токенів
    """
    try:
        return keycloak_openid.refresh_token(refresh_token)
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )


async def logout_user(refresh_token: str) -> bool:
    """
    Вихід користувача (відкликання токенів)
    
    Args:
        refresh_token: Refresh токен
        
    Returns:
        bool: True якщо успішно
    """
    try:
        keycloak_openid.logout(refresh_token)
        return True
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        return False


# Експортуємо основні компоненти
__all__ = [
    "KeycloakUser",
    "get_current_user",
    "get_current_user_optional",
    "require_roles",
    "require_groups",
    "require_admin",
    "require_analyst",
    "require_engineer",
    "keycloak_health_check",
    "refresh_token",
    "logout_user",
]
