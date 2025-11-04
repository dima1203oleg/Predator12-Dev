#!/usr/bin/env python3
"""
🤖 GITHUB COPILOT CONNECTOR
Connects to GitHub Models API (GitHub Copilot)
Supports GPT-4o, GPT-4o-mini, Phi-3, Llama-3.1
"""

import asyncio
import logging
import os
from typing import Dict, List, Any, Optional
import httpx
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CopilotConnector:
    """
    Connector for GitHub Models API (GitHub Copilot)
    """
    
    def __init__(self):
        self.endpoint = "https://models.github.ai/inference"
        self.token = os.getenv("GITHUB_TOKEN", "")
        
        # Available GitHub Copilot models
        self.models = {
            "gpt-4o": {
                "name": "gpt-4o",
                "max_tokens": 128000,
                "supports_streaming": True
            },
            "gpt-4o-mini": {
                "name": "gpt-4o-mini",
                "max_tokens": 128000,
                "supports_streaming": True
            },
            "phi-3": {
                "name": "phi-3",
                "max_tokens": 4096,
                "supports_streaming": True
            },
            "llama-3.1": {
                "name": "llama-3.1-70b-instruct",
                "max_tokens": 8192,
                "supports_streaming": True
            }
        }
        
        self.client = httpx.AsyncClient(timeout=60.0)
        self.rate_limit_rpm = 60  # Requests per minute
        self.requests_this_minute = 0
        
        logger.info("🤖 GitHub Copilot Connector initialized")
    
    async def chat_completion(self,
                             model: str,
                             messages: List[Dict[str, str]],
                             temperature: float = 0.7,
                             max_tokens: Optional[int] = None,
                             stream: bool = False) -> Dict[str, Any]:
        """
        Create a chat completion using GitHub Copilot
        
        Args:
            model: Model name (gpt-4o, gpt-4o-mini, phi-3, llama-3.1)
            messages: List of message dicts with role and content
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
        
        Returns:
            Response dict with completion and metadata
        """
        if not self.token:
            logger.error("❌ GitHub token not configured")
            return {
                "success": False,
                "error": "GitHub token not configured"
            }
        
        if model not in self.models:
            logger.error(f"❌ Unknown model: {model}")
            return {
                "success": False,
                "error": f"Unknown model: {model}"
            }
        
        # Check rate limit
        if self.requests_this_minute >= self.rate_limit_rpm:
            logger.warning("⏱️ Rate limit reached, waiting...")
            await asyncio.sleep(2)
            self.requests_this_minute = 0
        
        model_config = self.models[model]
        model_name = model_config["name"]
        
        if max_tokens is None:
            max_tokens = min(4096, model_config["max_tokens"])
        
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        try:
            logger.info(f"🔄 Calling GitHub Copilot with {model}")
            
            response = await self.client.post(
                self.endpoint,
                headers=headers,
                json=data
            )
            
            self.requests_this_minute += 1
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract response
                content = result["choices"][0]["message"]["content"]
                usage = result.get("usage", {})
                
                logger.info(f"✅ GitHub Copilot success: {usage.get('completion_tokens', 0)} tokens")
                
                return {
                    "success": True,
                    "model": model,
                    "content": content,
                    "usage": usage,
                    "timestamp": datetime.now().isoformat()
                }
            
            elif response.status_code == 429:
                # Rate limited
                logger.warning("⏱️ Rate limited by GitHub Copilot")
                return {
                    "success": False,
                    "error": "Rate limited",
                    "retry_after": response.headers.get("Retry-After", 60)
                }
            
            else:
                logger.error(f"❌ GitHub Copilot error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
        
        except Exception as e:
            logger.error(f"❌ Exception calling GitHub Copilot: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def code_review(self, code: str, language: str) -> Dict[str, Any]:
        """
        Review code using GitHub Copilot
        
        Args:
            code: Code to review
            language: Programming language
        
        Returns:
            Code review results
        """
        messages = [
            {
                "role": "system",
                "content": "You are GitHub Copilot, an expert code reviewer. Provide detailed, actionable feedback."
            },
            {
                "role": "user",
                "content": f"Review this {language} code and suggest improvements:\n\n```{language}\n{code}\n```"
            }
        ]
        
        result = await self.chat_completion(
            model="gpt-4o",
            messages=messages,
            temperature=0.3
        )
        
        return result
    
    async def generate_tests(self, code: str, language: str) -> Dict[str, Any]:
        """
        Generate unit tests for code
        
        Args:
            code: Code to test
            language: Programming language
        
        Returns:
            Generated tests
        """
        messages = [
            {
                "role": "system",
                "content": "You are GitHub Copilot. Generate comprehensive unit tests."
            },
            {
                "role": "user",
                "content": f"Generate unit tests for this {language} code:\n\n```{language}\n{code}\n```"
            }
        ]
        
        result = await self.chat_completion(
            model="gpt-4o",
            messages=messages,
            temperature=0.5
        )
        
        return result
    
    async def explain_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Explain what code does
        
        Args:
            code: Code to explain
            language: Programming language
        
        Returns:
            Code explanation
        """
        messages = [
            {
                "role": "system",
                "content": "You are GitHub Copilot. Explain code clearly and concisely."
            },
            {
                "role": "user",
                "content": f"Explain this {language} code:\n\n```{language}\n{code}\n```"
            }
        ]
        
        result = await self.chat_completion(
            model="gpt-4o-mini",  # Use faster model for explanations
            messages=messages,
            temperature=0.5
        )
        
        return result
    
    async def fix_bug(self, code: str, error: str, language: str) -> Dict[str, Any]:
        """
        Fix a bug in code
        
        Args:
            code: Code with bug
            error: Error message
            language: Programming language
        
        Returns:
            Fixed code
        """
        messages = [
            {
                "role": "system",
                "content": "You are GitHub Copilot. Fix bugs and provide corrected code."
            },
            {
                "role": "user",
                "content": f"Fix this {language} code that produces error: {error}\n\n```{language}\n{code}\n```"
            }
        ]
        
        result = await self.chat_completion(
            model="gpt-4o",
            messages=messages,
            temperature=0.3
        )
        
        return result
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


async def main():
    """Test GitHub Copilot connector"""
    connector = CopilotConnector()
    
    try:
        # Test chat completion
        result = await connector.chat_completion(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful coding assistant."},
                {"role": "user", "content": "What is GitHub Copilot?"}
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        print("\n" + "="*60)
        print("GITHUB COPILOT CONNECTOR TEST")
        print("="*60)
        print(f"Success: {result['success']}")
        if result['success']:
            print(f"Model: {result['model']}")
            print(f"Content: {result['content']}")
            print(f"Usage: {result['usage']}")
        else:
            print(f"Error: {result['error']}")
        
        # Test code explanation
        print("\n" + "="*60)
        print("CODE EXPLANATION TEST")
        print("="*60)
        
        test_code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
"""
        
        explanation = await connector.explain_code(test_code, "python")
        if explanation['success']:
            print(f"Explanation: {explanation['content'][:200]}...")
        else:
            print(f"Error: {explanation['error']}")
    
    finally:
        await connector.close()


if __name__ == "__main__":
    asyncio.run(main())
