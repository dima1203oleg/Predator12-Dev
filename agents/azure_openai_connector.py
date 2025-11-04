#!/usr/bin/env python3
"""
☁️ AZURE OPENAI CONNECTOR
Connects to Azure OpenAI services with built-in retry logic
Supports GPT-4o, GPT-4-turbo, GPT-3.5-turbo
"""

import asyncio
import logging
import os
from typing import Dict, List, Any, Optional
import httpx
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AzureOpenAIConnector:
    """
    Connector for Azure OpenAI services
    Uses Azure AI Inference SDK approach
    """
    
    def __init__(self):
        self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "")
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY", "")
        self.api_version = "2024-02-15-preview"
        
        # Available Azure OpenAI models
        self.models = {
            "gpt-4o": {
                "deployment": "gpt-4o",
                "max_tokens": 128000,
                "cost_per_1k_input": 0.005,
                "cost_per_1k_output": 0.015
            },
            "gpt-4-turbo": {
                "deployment": "gpt-4-turbo",
                "max_tokens": 128000,
                "cost_per_1k_input": 0.01,
                "cost_per_1k_output": 0.03
            },
            "gpt-35-turbo": {
                "deployment": "gpt-35-turbo",
                "max_tokens": 16385,
                "cost_per_1k_input": 0.0005,
                "cost_per_1k_output": 0.0015
            }
        }
        
        self.client = httpx.AsyncClient(timeout=60.0)
        self.retry_attempts = 3
        self.retry_delay = 2.0
        
        logger.info("☁️ Azure OpenAI Connector initialized")
    
    async def chat_completion(self,
                             model: str,
                             messages: List[Dict[str, str]],
                             temperature: float = 0.7,
                             max_tokens: Optional[int] = None,
                             stream: bool = False) -> Dict[str, Any]:
        """
        Create a chat completion using Azure OpenAI
        
        Args:
            model: Model name (gpt-4o, gpt-4-turbo, gpt-35-turbo)
            messages: List of message dicts with role and content
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
        
        Returns:
            Response dict with completion and metadata
        """
        if not self.endpoint or not self.api_key:
            logger.error("❌ Azure OpenAI credentials not configured")
            return {
                "success": False,
                "error": "Azure OpenAI credentials not configured"
            }
        
        if model not in self.models:
            logger.error(f"❌ Unknown model: {model}")
            return {
                "success": False,
                "error": f"Unknown model: {model}"
            }
        
        model_config = self.models[model]
        deployment = model_config["deployment"]
        
        if max_tokens is None:
            max_tokens = min(4096, model_config["max_tokens"])
        
        url = f"{self.endpoint}/openai/deployments/{deployment}/chat/completions"
        
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        params = {
            "api-version": self.api_version
        }
        
        data = {
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        # Retry logic
        for attempt in range(self.retry_attempts):
            try:
                logger.info(f"🔄 Calling Azure OpenAI {model} (attempt {attempt + 1}/{self.retry_attempts})")
                
                response = await self.client.post(
                    url,
                    headers=headers,
                    params=params,
                    json=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Extract response
                    content = result["choices"][0]["message"]["content"]
                    usage = result.get("usage", {})
                    
                    # Calculate cost
                    input_tokens = usage.get("prompt_tokens", 0)
                    output_tokens = usage.get("completion_tokens", 0)
                    
                    cost = (
                        input_tokens / 1000 * model_config["cost_per_1k_input"] +
                        output_tokens / 1000 * model_config["cost_per_1k_output"]
                    )
                    
                    logger.info(f"✅ Azure OpenAI success: {output_tokens} tokens, ${cost:.6f}")
                    
                    return {
                        "success": True,
                        "model": model,
                        "deployment": deployment,
                        "content": content,
                        "usage": usage,
                        "cost": cost,
                        "timestamp": datetime.now().isoformat()
                    }
                
                elif response.status_code == 429:
                    # Rate limited
                    logger.warning(f"⏱️ Rate limited by Azure OpenAI, retrying...")
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                    continue
                
                else:
                    logger.error(f"❌ Azure OpenAI error: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }
            
            except Exception as e:
                logger.error(f"❌ Exception calling Azure OpenAI: {e}")
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                    continue
                else:
                    return {
                        "success": False,
                        "error": str(e)
                    }
        
        return {
            "success": False,
            "error": "Max retries exceeded"
        }
    
    async def analyze_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze code for issues and improvements
        
        Args:
            code: Code to analyze
            language: Programming language
        
        Returns:
            Analysis results
        """
        messages = [
            {
                "role": "system",
                "content": "You are an expert code reviewer. Analyze code for bugs, security issues, and improvements."
            },
            {
                "role": "user",
                "content": f"Analyze this {language} code:\n\n```{language}\n{code}\n```"
            }
        ]
        
        result = await self.chat_completion(
            model="gpt-4o",
            messages=messages,
            temperature=0.3
        )
        
        return result
    
    async def generate_fix(self, error: str, context: str) -> Dict[str, Any]:
        """
        Generate a fix for an error
        
        Args:
            error: Error message
            context: Context (code, logs, etc.)
        
        Returns:
            Fix suggestion
        """
        messages = [
            {
                "role": "system",
                "content": "You are an expert DevOps engineer. Generate fixes for errors."
            },
            {
                "role": "user",
                "content": f"Error: {error}\n\nContext:\n{context}\n\nGenerate a fix:"
            }
        ]
        
        result = await self.chat_completion(
            model="gpt-4o",
            messages=messages,
            temperature=0.5
        )
        
        return result
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


async def main():
    """Test Azure OpenAI connector"""
    connector = AzureOpenAIConnector()
    
    try:
        # Test chat completion
        result = await connector.chat_completion(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Explain Azure OpenAI in 2 sentences."}
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        print("\n" + "="*60)
        print("AZURE OPENAI CONNECTOR TEST")
        print("="*60)
        print(f"Success: {result['success']}")
        if result['success']:
            print(f"Model: {result['model']}")
            print(f"Content: {result['content']}")
            print(f"Usage: {result['usage']}")
            print(f"Cost: ${result['cost']:.6f}")
        else:
            print(f"Error: {result['error']}")
    
    finally:
        await connector.close()


if __name__ == "__main__":
    asyncio.run(main())
