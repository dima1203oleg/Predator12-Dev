from __future__ import annotations

import os
import time
from typing import Any, Dict, Optional

import httpx


class ModelSDKClient:
    """
    Lightweight HTTP client to call remote model server via SDK-compatible HTTP API.
    Reads base URL and API key from env vars.
    """

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, timeout: float = 30.0):
        self.base_url = base_url or os.getenv("MODEL_SDK_BASE_URL", "http://localhost:3010/v1")
        self.api_key = api_key or os.getenv("MODEL_SDK_KEY", "")
        self.timeout = timeout

    async def chat_completion(self, model: str, messages: list[dict[str, Any]], **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {"model": model, "messages": messages}
        payload.update(kwargs)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            return r.json()

    async def embeddings(self, model: str, input_texts: list[str], **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}/embeddings"
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {"model": model, "input": input_texts}
        payload.update(kwargs)
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            return r.json()
