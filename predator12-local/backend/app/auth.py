import os
import time
from typing import Dict, Any, Optional

import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt

_http = httpx.AsyncClient(timeout=10)
_jwks_cache: Dict[str, Any] = {}
_jwks_cache_ts: float = 0.0
_jwks_ttl: float = 3600.0

REALM = os.environ.get("KEYCLOAK_REALM", "predator")
KC_URL = os.environ.get("KEYCLOAK_URL", "http://keycloak:8080")
ISSUER = f"{KC_URL}/realms/{REALM}"

security = HTTPBearer(auto_error=False)

async def _get_openid_cfg() -> Dict[str, Any]:
    url = f"{ISSUER}/.well-known/openid-configuration"
    r = await _http.get(url)
    if r.status_code >= 300:
        raise HTTPException(status_code=500, detail="OIDC discovery failed")
    return r.json()

async def _get_jwks() -> Dict[str, Any]:
    global _jwks_cache_ts
    now = time.time()
    if _jwks_cache and (now - _jwks_cache_ts) < _jwks_ttl:
        return _jwks_cache
    cfg = await _get_openid_cfg()
    jwks_uri = cfg.get("jwks_uri")
    if not jwks_uri:
        raise HTTPException(status_code=500, detail="No jwks_uri")
    r = await _http.get(jwks_uri)
    if r.status_code >= 300:
        raise HTTPException(status_code=500, detail="JWKS fetch failed")
    data = r.json()
    _jwks_cache.clear()
    _jwks_cache.update(data)
    _jwks_cache_ts = now
    return data

async def verify_token_required(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not creds or not creds.scheme.lower() == "bearer":
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = creds.credentials
    jwks = await _get_jwks()
    try:
        unverified = jwt.get_unverified_header(token)
        kid = unverified.get("kid")
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Unknown kid")
        public_key = jwt.construct_public_key(key)
        payload = jwt.decode(token, public_key, algorithms=[key.get("alg", "RS256")], audience=None, issuer=ISSUER)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

def requires_role(role_name: str):
    async def _inner(payload: Dict[str, Any] = Depends(verify_token_required)):
        roles = []
        realm_access = payload.get("realm_access", {}) or {}
        roles.extend(realm_access.get("roles", []) or [])
        if role_name not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return payload
    return _inner
