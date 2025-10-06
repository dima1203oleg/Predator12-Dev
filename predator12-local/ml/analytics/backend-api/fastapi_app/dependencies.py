from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import redis.asyncio as redis
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

# Import local modules
from models.database import SessionLocal, User
from .services.auth_service import AuthService

# Constants
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Token data model
class TokenData(BaseModel):
    username: Optional[str] = None
    permissions: list[str] = []

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis dependency
async def get_redis_client():
    """
    Provide a Redis client instance for dependency injection.
    """
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    return redis.from_url(redis_url, encoding="utf-8", decode_responses=True)

# PostgreSQL dependency
async def get_db_session():
    """
    Provide a session for PostgreSQL database operations.
    This is a placeholder; in a real app, it would be configured
    with the actual database connection.
    """
    # Placeholder for session creation (to be implemented with actual DB config)
    async def mock_session():
        class MockSession:
            async def add(self, obj):
                pass

            async def commit(self):
                pass

            async def rollback(self):
                pass

        return MockSession()

    return await mock_session()

# Create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Get current user
async def get_current_user(token: str = Depends(oauth2_scheme), auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Get current active user
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Check if user has required permissions
def has_permission(required_permissions: list[str]):
    async def check_permission(current_user: User = Depends(get_current_user)):
        user_permissions = [role.name for role in current_user.roles]
        if not any(perm in user_permissions for perm in required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return current_user
    return check_permission

# Get Kafka producer
def get_kafka_producer():
    from kafka import KafkaProducer
    import json
    
    bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    producer = KafkaProducer(
        bootstrap_servers=bootstrap_servers,
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda v: v.encode('utf-8') if v else None,
    )
    try:
        yield producer
    finally:
        producer.close()

# Get Qdrant client
def get_qdrant_client():
    from qdrant_client import QdrantClient
    
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    client = QdrantClient(url=qdrant_url)
    return client

# Get OpenSearch client
def get_opensearch_client():
    from opensearchpy import OpenSearch
    
    opensearch_url = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
    auth = (
        os.getenv("OPENSEARCH_USER", "admin"),
        os.getenv("OPENSEARCH_PASSWORD", "admin")
    )
    client = OpenSearch(
        hosts=[opensearch_url],
        http_auth=auth,
        use_ssl=os.getenv("OPENSEARCH_USE_SSL", "false").lower() == "true",
        verify_certs=False,
        ssl_show_warn=False,
    )
    return client

# Mock function for demonstration
async def mock_external_api_call():
    """
    Mock function to simulate an external API call.
    This is a placeholder for actual API integration.
    Returns a dictionary with a mock user ID.
    """
    return {"id": "mock_user_id"}

# Dependency for auth service
async def get_auth_service() -> AuthService:
    return AuthService()
