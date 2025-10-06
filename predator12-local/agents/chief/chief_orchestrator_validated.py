#!/usr/bin/env python3
"""
🤖 Chief Orchestrator Agent - Main Dialogue Interface
With Enhanced Input Validation
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any
import re

# Request Models
class UserRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000,
                      description="User query or command")
    channel: str = Field("api", regex="^(ui|telegram|api)$",
                        description="Communication channel")
    user_id: str = Field(..., min_length=3, max_length=64,
                        description="User identifier")
    context: Optional[Dict[str, Any]] = Field(None,
                                            description="Additional context")
    priority: str = Field("medium", regex="^(low|medium|high|critical)$")

    @validator('query')
    def sanitize_query(cls, v):
        # Remove potentially dangerous characters
        v = re.sub(r'[<>{};]', '', v)
        return v.strip()

    @validator('user_id')
    def validate_user_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Invalid user ID format')
        return v

class TaskRequest(BaseModel):
    parameters: Dict[str, Any] = Field(..., description="Task parameters")
    timeout: int = Field(300, ge=10, le=3600, description="Timeout in seconds")
    retries: int = Field(2, ge=0, le=5, description="Number of retries")

# Enhanced ChiefOrchestrator with Validation
class ValidatedChiefOrchestrator(ChiefOrchestratorAgent):
    
    def _setup_routes(self):
        super()._setup_routes()
        
        @self.app.post("/v2/chief/ask")
        async def validated_ask(request: UserRequest):
            """Validated version of ask endpoint"""
            try:
                task_id = await self.process_user_request(request)
                return {
                    "task_id": task_id,
                    "status": "processing",
                    "message": "Task accepted"
                }
            except Exception as e:
                logger.error("Error processing validated request", error=str(e))
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.post("/v2/chief/task")
        async def create_task(task: TaskRequest):
            """Create a new validated task"""
            try:
                # Implementation here
                pass
            except Exception as e:
                logger.error("Task creation failed", error=str(e))
                raise HTTPException(status_code=400, detail=str(e))

# Helper Functions
def sanitize_input(input_str: str, max_length: int = 1000) -> str:
    """Basic input sanitization"""
    if not input_str or not isinstance(input_str, str):
        return ""
    
    input_str = input_str[:max_length]
    return re.sub(r'[<>{};]', '', input_str).strip()

def validate_priority(priority: str) -> bool:
    """Validate priority value"""
    return priority.lower() in ["low", "medium", "high", "critical"]
