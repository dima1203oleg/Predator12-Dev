#!/usr/bin/env python3
"""
🔌 MCP (Model Context Protocol) AGENT
Implements Model Context Protocol for context sharing between models
Connects to MCP registry and supports tools/list, tools/call, streaming
"""

import asyncio
import logging
import os
from typing import Dict, List, Any, Optional
import httpx
import json
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MCPAgent:
    """
    Model Context Protocol Agent
    Enables context sharing and tool calling across models
    """
    
    def __init__(self, registry_url: str = "http://localhost:3010"):
        self.registry_url = registry_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.tools: Dict[str, Any] = {}
        self.contexts: Dict[str, Any] = {}
        
        logger.info(f"🔌 MCP Agent initialized with registry: {registry_url}")
    
    async def connect(self) -> bool:
        """
        Connect to MCP registry and discover available tools
        
        Returns:
            True if connection successful
        """
        try:
            logger.info(f"🔄 Connecting to MCP registry: {self.registry_url}")
            
            response = await self.client.get(f"{self.registry_url}/health")
            
            if response.status_code == 200:
                logger.info("✅ MCP registry connection successful")
                await self._discover_tools()
                return True
            else:
                logger.error(f"❌ MCP registry connection failed: {response.status_code}")
                return False
        
        except Exception as e:
            logger.error(f"❌ Exception connecting to MCP registry: {e}")
            return False
    
    async def _discover_tools(self):
        """Discover available tools from MCP registry"""
        try:
            response = await self.client.get(f"{self.registry_url}/tools/list")
            
            if response.status_code == 200:
                tools_data = response.json()
                self.tools = {tool["name"]: tool for tool in tools_data.get("tools", [])}
                logger.info(f"📦 Discovered {len(self.tools)} MCP tools")
                for tool_name in self.tools.keys():
                    logger.info(f"  - {tool_name}")
            else:
                logger.warning(f"⚠️ Failed to discover tools: {response.status_code}")
        
        except Exception as e:
            logger.warning(f"⚠️ Exception discovering tools: {e}")
    
    async def list_tools(self) -> Dict[str, Any]:
        """
        List all available MCP tools
        
        Returns:
            Dict of tool names to tool definitions
        """
        if not self.tools:
            await self._discover_tools()
        
        return self.tools
    
    async def call_tool(self, 
                       tool_name: str, 
                       arguments: Dict[str, Any],
                       context_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Call an MCP tool
        
        Args:
            tool_name: Name of the tool to call
            arguments: Tool arguments
            context_id: Optional context ID for sharing state
        
        Returns:
            Tool execution result
        """
        if tool_name not in self.tools:
            logger.error(f"❌ Unknown tool: {tool_name}")
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }
        
        try:
            logger.info(f"🔧 Calling MCP tool: {tool_name}")
            
            payload = {
                "tool": tool_name,
                "arguments": arguments
            }
            
            if context_id:
                payload["context_id"] = context_id
            
            response = await self.client.post(
                f"{self.registry_url}/tools/call",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ Tool {tool_name} executed successfully")
                return {
                    "success": True,
                    "tool": tool_name,
                    "result": result,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                logger.error(f"❌ Tool execution failed: {response.status_code}")
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
        
        except Exception as e:
            logger.error(f"❌ Exception calling tool: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_context(self, context_id: str, data: Dict[str, Any]) -> bool:
        """
        Create a shared context for models
        
        Args:
            context_id: Unique context identifier
            data: Context data
        
        Returns:
            True if context created
        """
        self.contexts[context_id] = {
            "data": data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        logger.info(f"📝 Created context: {context_id}")
        return True
    
    async def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a shared context
        
        Args:
            context_id: Context identifier
        
        Returns:
            Context data or None
        """
        context = self.contexts.get(context_id)
        if context:
            logger.info(f"📖 Retrieved context: {context_id}")
        else:
            logger.warning(f"⚠️ Context not found: {context_id}")
        
        return context
    
    async def update_context(self, context_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update a shared context
        
        Args:
            context_id: Context identifier
            updates: Updates to apply
        
        Returns:
            True if context updated
        """
        if context_id not in self.contexts:
            logger.error(f"❌ Context not found: {context_id}")
            return False
        
        self.contexts[context_id]["data"].update(updates)
        self.contexts[context_id]["updated_at"] = datetime.now().isoformat()
        
        logger.info(f"✏️ Updated context: {context_id}")
        return True
    
    async def stream_response(self, 
                            model: str, 
                            prompt: str,
                            context_id: Optional[str] = None):
        """
        Stream response from a model via MCP
        
        Args:
            model: Model name
            prompt: User prompt
            context_id: Optional context ID
        
        Yields:
            Response chunks
        """
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": True
            }
            
            if context_id:
                payload["context_id"] = context_id
            
            async with self.client.stream(
                "POST",
                f"{self.registry_url}/v1/chat/completions",
                json=payload
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            yield chunk
                        except json.JSONDecodeError:
                            continue
        
        except Exception as e:
            logger.error(f"❌ Exception streaming response: {e}")
            yield {"error": str(e)}
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
        logger.info("🔌 MCP Agent closed")


async def main():
    """Test MCP agent"""
    agent = MCPAgent()
    
    try:
        # Try to connect
        connected = await agent.connect()
        
        print("\n" + "="*60)
        print("MCP AGENT TEST")
        print("="*60)
        print(f"Connection Status: {'✅ Connected' if connected else '❌ Failed'}")
        
        if connected:
            # List tools
            tools = await agent.list_tools()
            print(f"\nAvailable Tools: {len(tools)}")
            for tool_name, tool_def in tools.items():
                print(f"  - {tool_name}: {tool_def.get('description', 'No description')}")
        
        # Test context sharing (works even without registry)
        print("\n" + "="*60)
        print("CONTEXT SHARING TEST")
        print("="*60)
        
        await agent.create_context("test-context", {
            "user": "test_user",
            "task": "code_review",
            "language": "python"
        })
        
        context = await agent.get_context("test-context")
        print(f"Context: {context['data']}")
        
        await agent.update_context("test-context", {
            "status": "in_progress"
        })
        
        updated_context = await agent.get_context("test-context")
        print(f"Updated Context: {updated_context['data']}")
    
    finally:
        await agent.close()


if __name__ == "__main__":
    asyncio.run(main())
