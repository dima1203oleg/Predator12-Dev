#!/usr/bin/env python3
"""
🧠 DEEPSEEK AI AGENT
Supports R1 (reasoning), V3 (general), Coder-V2 (coding)
OpenAI-compatible API integration with intelligent routing
"""

import asyncio
import logging
import os
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

try:
    import httpx
except ImportError:
    httpx = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DeepSeekModel(Enum):
    """Available DeepSeek models"""
    R1 = "deepseek-reasoner"
    V3 = "deepseek-chat"
    CODER = "deepseek-coder"


@dataclass
class ModelCapabilities:
    """Model capability profile"""
    name: str
    model_id: str
    best_for: str
    context_length: int
    supports_streaming: bool
    cost_per_1k_tokens: float


class DeepSeekAgent:
    """
    Advanced DeepSeek AI Agent with multiple model support
    - DeepSeek-R1: Complex reasoning, math, logic
    - DeepSeek-V3: General conversation, analysis (671B parameters)
    - DeepSeek-Coder-V2: Code generation, debugging, refactoring
    """
    
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
        
        if not self.api_key:
            logger.warning("⚠️  DEEPSEEK_API_KEY not set. Agent will not function.")
        
        self.models = {
            DeepSeekModel.R1: ModelCapabilities(
                name="DeepSeek R1 (Reasoning)",
                model_id="deepseek-reasoner",
                best_for="complex reasoning, math, logic, problem-solving",
                context_length=65536,
                supports_streaming=True,
                cost_per_1k_tokens=0.014
            ),
            DeepSeekModel.V3: ModelCapabilities(
                name="DeepSeek V3 (671B)",
                model_id="deepseek-chat",
                best_for="general conversation, analysis, creative tasks",
                context_length=65536,
                supports_streaming=True,
                cost_per_1k_tokens=0.014
            ),
            DeepSeekModel.CODER: ModelCapabilities(
                name="DeepSeek Coder V2",
                model_id="deepseek-coder",
                best_for="code generation, debugging, refactoring, completion",
                context_length=16384,
                supports_streaming=True,
                cost_per_1k_tokens=0.0012
            )
        }
        
        self.timeout = httpx.Timeout(60.0, read=120.0) if httpx else None
    
    async def chat(
        self,
        model: DeepSeekModel,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to DeepSeek API
        
        Args:
            model: DeepSeek model to use
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            **kwargs: Additional parameters
        
        Returns:
            API response dict
        """
        if not httpx:
            logger.error("❌ httpx not installed. Run: pip install httpx")
            return {"error": "httpx not installed"}
        
        if not self.api_key:
            logger.error("❌ DEEPSEEK_API_KEY not set")
            return {"error": "API key not configured"}
        
        model_config = self.models[model]
        logger.info(f"🤖 Using {model_config.name}")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model_config.model_id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
            **kwargs
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"✅ Response received from {model_config.name}")
                return result
                
        except httpx.HTTPError as e:
            logger.error(f"❌ HTTP error: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            return {"error": str(e)}
    
    async def code_completion(
        self,
        code: str,
        language: str,
        instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get code completion using DeepSeek Coder
        
        Args:
            code: Code snippet to complete
            language: Programming language
            instruction: Optional instruction for completion
        
        Returns:
            Completion result
        """
        system_msg = f"You are an expert {language} programmer. Provide high-quality code completions."
        
        user_msg = f"Complete the following {language} code:\n\n```{language}\n{code}\n```"
        if instruction:
            user_msg += f"\n\nInstruction: {instruction}"
        
        messages = [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ]
        
        return await self.chat(
            model=DeepSeekModel.CODER,
            messages=messages,
            temperature=0.3,
            max_tokens=2048
        )
    
    async def reasoning(
        self,
        problem: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use DeepSeek R1 for complex reasoning tasks
        
        Args:
            problem: Problem statement
            context: Optional context
        
        Returns:
            Reasoning result
        """
        system_msg = "You are a reasoning expert. Think step-by-step and provide detailed analysis."
        
        user_msg = problem
        if context:
            user_msg = f"Context: {context}\n\nProblem: {problem}"
        
        messages = [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ]
        
        return await self.chat(
            model=DeepSeekModel.R1,
            messages=messages,
            temperature=0.7,
            max_tokens=4096
        )
    
    async def general_chat(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use DeepSeek V3 for general conversation
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
        
        Returns:
            Chat result
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        return await self.chat(
            model=DeepSeekModel.V3,
            messages=messages,
            temperature=0.7,
            max_tokens=4096
        )
    
    def get_model_info(self, model: DeepSeekModel) -> ModelCapabilities:
        """Get information about a specific model"""
        return self.models[model]
    
    def list_models(self) -> List[ModelCapabilities]:
        """List all available models"""
        return list(self.models.values())


async def main():
    """Example usage"""
    agent = DeepSeekAgent()
    
    print("🧠 DeepSeek Agent Demo\n")
    print("Available Models:")
    for model_cap in agent.list_models():
        print(f"  • {model_cap.name}")
        print(f"    Best for: {model_cap.best_for}")
        print(f"    Context: {model_cap.context_length} tokens")
        print(f"    Cost: ${model_cap.cost_per_1k_tokens}/1K tokens\n")
    
    # Example: Code completion
    print("\n🔧 Testing Code Completion...")
    result = await agent.code_completion(
        code="def fibonacci(n):\n    # TODO: implement",
        language="python",
        instruction="Implement an efficient fibonacci function"
    )
    
    if "error" not in result:
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        print(f"Result: {content[:200]}...")
    else:
        print(f"Error: {result['error']}")


if __name__ == "__main__":
    asyncio.run(main())
