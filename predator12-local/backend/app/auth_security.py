"""
JWT Token Validation & Security Utilities
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWTError
from typing import Optional

security = HTTPBearer()

# Configuration (move to env vars in production)
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        return payload
    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

# Usage example:
# @router.get("/secure-endpoint")
# async def secure_endpoint(payload: dict = Depends(validate_token)):
#     ...
