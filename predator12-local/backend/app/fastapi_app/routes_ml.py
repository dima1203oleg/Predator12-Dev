from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.model_router.router_core import ModelRouter

# -------- Request/Response Schemas --------


class ChatMessage(BaseModel):
    role: str
    content: str


class ReasonRequest(BaseModel):
    messages: List[ChatMessage]
    request_key: Optional[str] = Field(default=None, description="Idempotency key for caching")
    params: Dict[str, Any] = Field(default_factory=dict)


class CodeRequest(ReasonRequest):
    pass


class QuickRequest(ReasonRequest):
    pass


class VisionRequest(ReasonRequest):
    pass


class EmbedRequest(BaseModel):
    input: List[str]
    request_key: Optional[str] = None
    params: Dict[str, Any] = Field(default_factory=dict)


class ArbiterRequest(BaseModel):
    candidates: List[Dict[str, Any]]


# -------- Router Setup --------

router = APIRouter(prefix="/ml", tags=["ml"])

# Initialize a singleton ModelRouter using the central registry file
REGISTRY_PATH = os.getenv(
    "MODEL_REGISTRY_PATH",
    str(Path(__file__).resolve().parents[2] / "model_registry.yaml"),
)

_model_router = ModelRouter(
    registry_path=REGISTRY_PATH,
    redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
)


@router.post("/reason")
async def ml_reason(req: ReasonRequest):
    try:
        msgs = [m.model_dump() for m in req.messages]
        result = await _model_router.reason(
            messages=msgs, request_key=req.request_key, **req.params
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Reason routing failed: {e}")


@router.post("/code")
async def ml_code(req: CodeRequest):
    try:
        msgs = [m.model_dump() for m in req.messages]
        result = await _model_router.code(messages=msgs, request_key=req.request_key, **req.params)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Code routing failed: {e}")


@router.post("/quick")
async def ml_quick(req: QuickRequest):
    try:
        msgs = [m.model_dump() for m in req.messages]
        result = await _model_router.quick(messages=msgs, request_key=req.request_key, **req.params)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quick routing failed: {e}")


@router.post("/vision")
async def ml_vision(req: VisionRequest):
    try:
        msgs = [m.model_dump() for m in req.messages]
        result = await _model_router.vision(
            messages=msgs, request_key=req.request_key, **req.params
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Vision routing failed: {e}")


@router.post("/embed")
async def ml_embed(req: EmbedRequest):
    try:
        result = await _model_router.embed(
            inputs=req.input, request_key=req.request_key, **req.params
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embedding routing failed: {e}")


@router.post("/arbiter")
async def ml_arbiter(req: ArbiterRequest):
    try:
        result = await _model_router.arbiter(req.candidates)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Arbiter failed: {e}")
