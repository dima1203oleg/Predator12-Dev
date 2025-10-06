"""
Base Agent Classes
==================

Core classes and interfaces for the agent system.
"""

import asyncio
import logging
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union, Callable
import json

logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    """Agent execution status"""
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    WAITING_REVIEW = "waiting_review"

class TaskPriority(Enum):
    """Task priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5

class RiskLevel(Enum):
    """Risk assessment levels"""
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class AgentTask:
    """Represents a task for an agent to execute"""
    
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    priority: TaskPriority = TaskPriority.NORMAL
    risk_level: RiskLevel = RiskLevel.LOW
    context: Dict[str, Any] = field(default_factory=dict)
    requires_review: bool = False
    timeout_seconds: int = 300
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'priority': self.priority.value,
            'risk_level': self.risk_level.value,
            'context': self.context,
            'requires_review': self.requires_review,
            'timeout_seconds': self.timeout_seconds,
            'created_at': self.created_at.isoformat(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

@dataclass
class AgentResult:
    """Result of agent execution"""
    
    task_id: str
    status: AgentStatus
    success: bool = False
    message: str = ""
    data: Dict[str, Any] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    execution_time: float = 0.0
    model_used: str = ""
    fallback_used: bool = False
    review_required: bool = False
    pull_request_url: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary"""
        return {
            'task_id': self.task_id,
            'status': self.status.value,
            'success': self.success,
            'message': self.message,
            'data': self.data,
            'errors': self.errors,
            'warnings': self.warnings,
            'execution_time': self.execution_time,
            'model_used': self.model_used,
            'fallback_used': self.fallback_used,
            'review_required': self.review_required,
            'pull_request_url': self.pull_request_url
        }

@dataclass
class ExecutionPlan:
    """Plan for executing a task"""
    
    steps: List[Dict[str, Any]] = field(default_factory=list)
    estimated_duration: float = 0.0
    required_resources: Dict[str, Any] = field(default_factory=dict)
    risk_assessment: RiskLevel = RiskLevel.LOW
    dependencies: List[str] = field(default_factory=list)
    fallback_steps: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_step(self, name: str, action: str, params: Dict[str, Any] = None):
        """Add a step to the execution plan"""
        self.steps.append({
            'name': name,
            'action': action,
            'params': params or {},
            'order': len(self.steps) + 1
        })

class BaseAgent(ABC):
    """Base class for all agents"""
    
    def __init__(self, name: str, agent_type: str, config: Dict[str, Any] = None):
        self.name = name
        self.agent_type = agent_type
        self.config = config or {}
        self.status = AgentStatus.IDLE
        self.current_task: Optional[AgentTask] = None
        
        # Model configuration
        self.primary_model = self.config.get('primary_model', 'gpt-4')
        self.fallback_models = self.config.get('fallback_models', ['gpt-3.5-turbo', 'local'])
        self.current_model = self.primary_model
        
        # Resource limits
        self.max_memory_mb = self.config.get('max_memory_mb', 1024)
        self.max_cpu_percent = self.config.get('max_cpu_percent', 50)
        self.max_execution_time = self.config.get('max_execution_time', 600)
        
        # Safety settings
        self.requires_review = self.config.get('requires_review', False)
        self.safe_mode = self.config.get('safe_mode', True)
        self.sandbox_enabled = self.config.get('sandbox_enabled', True)
        
        # Callbacks
        self.on_task_start: Optional[Callable] = None
        self.on_task_complete: Optional[Callable] = None
        self.on_error: Optional[Callable] = None
        
        # Telemetry
        self.telemetry_data = {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'total_execution_time': 0.0,
            'fallback_usage': 0,
            'last_activity': None
        }
    
    @abstractmethod
    async def plan(self, task: AgentTask) -> ExecutionPlan:
        """Create execution plan for the task"""
        pass
    
    @abstractmethod
    async def execute_step(self, step: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single step in the plan"""
        pass
    
    async def execute(self, task: AgentTask) -> AgentResult:
        """Execute a task following Plan-then-Execute pattern"""
        start_time = time.time()
        self.current_task = task
        self.status = AgentStatus.PLANNING
        
        try:
            # Log task start
            logger.info(f"Agent {self.name} starting task {task.id}: {task.name}")
            await self._log_telemetry('task_start', task.to_dict())
            
            if self.on_task_start:
                await self.on_task_start(self, task)
            
            # Phase 1: Planning
            plan = await self.plan(task)
            
            # Risk assessment
            if plan.risk_assessment in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
                if self.requires_review or task.requires_review:
                    return await self._create_review_request(task, plan)
            
            # Phase 2: Execution
            self.status = AgentStatus.EXECUTING
            result = await self._execute_plan(task, plan)
            
            # Update telemetry
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self.telemetry_data['total_execution_time'] += execution_time
            
            if result.success:
                self.telemetry_data['tasks_completed'] += 1
                self.status = AgentStatus.COMPLETED
            else:
                self.telemetry_data['tasks_failed'] += 1
                self.status = AgentStatus.FAILED
            
            self.telemetry_data['last_activity'] = datetime.now().isoformat()
            
            if self.on_task_complete:
                await self.on_task_complete(self, task, result)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            error_result = AgentResult(
                task_id=task.id,
                status=AgentStatus.FAILED,
                success=False,
                message=f"Agent execution failed: {str(e)}",
                errors=[str(e)],
                execution_time=execution_time
            )
            
            self.status = AgentStatus.FAILED
            self.telemetry_data['tasks_failed'] += 1
            
            logger.error(f"Agent {self.name} failed on task {task.id}: {e}")
            await self._log_telemetry('task_error', {'error': str(e), 'task_id': task.id})
            
            if self.on_error:
                await self.on_error(self, task, e)
            
            return error_result
        
        finally:
            self.current_task = None
            if self.status not in [AgentStatus.COMPLETED, AgentStatus.FAILED]:
                self.status = AgentStatus.IDLE
    
    async def _execute_plan(self, task: AgentTask, plan: ExecutionPlan) -> AgentResult:
        """Execute the execution plan"""
        context = task.context.copy()
        executed_steps = []
        
        try:
            for i, step in enumerate(plan.steps):
                step_start = time.time()
                
                logger.info(f"Agent {self.name} executing step {i+1}/{len(plan.steps)}: {step['name']}")
                
                try:
                    # Execute step with timeout
                    step_result = await asyncio.wait_for(
                        self.execute_step(step, context),
                        timeout=task.timeout_seconds
                    )
                    
                    step_duration = time.time() - step_start
                    executed_steps.append({
                        'step': step,
                        'result': step_result,
                        'duration': step_duration,
                        'success': True
                    })
                    
                    # Update context with step results
                    context.update(step_result.get('context_updates', {}))
                    
                except asyncio.TimeoutError:
                    logger.warning(f"Step {step['name']} timed out, attempting fallback")
                    return await self._try_fallback(task, plan, executed_steps)
                
                except Exception as step_error:
                    logger.error(f"Step {step['name']} failed: {step_error}")
                    
                    # Try fallback if available
                    if plan.fallback_steps:
                        return await self._try_fallback(task, plan, executed_steps)
                    
                    return AgentResult(
                        task_id=task.id,
                        status=AgentStatus.FAILED,
                        success=False,
                        message=f"Step '{step['name']}' failed: {str(step_error)}",
                        errors=[str(step_error)],
                        data={'executed_steps': executed_steps}
                    )
            
            # All steps completed successfully
            return AgentResult(
                task_id=task.id,
                status=AgentStatus.COMPLETED,
                success=True,
                message=f"Task completed successfully with {len(executed_steps)} steps",
                data={
                    'executed_steps': executed_steps,
                    'final_context': context
                },
                model_used=self.current_model
            )
            
        except Exception as e:
            return AgentResult(
                task_id=task.id,
                status=AgentStatus.FAILED,
                success=False,
                message=f"Plan execution failed: {str(e)}",
                errors=[str(e)],
                data={'executed_steps': executed_steps}
            )
    
    async def _try_fallback(self, task: AgentTask, plan: ExecutionPlan, executed_steps: List) -> AgentResult:
        """Try fallback execution"""
        logger.info(f"Agent {self.name} attempting fallback for task {task.id}")
        
        # Switch to fallback model
        if self.fallback_models and self.current_model != self.fallback_models[0]:
            old_model = self.current_model
            self.current_model = self.fallback_models[0]
            self.telemetry_data['fallback_usage'] += 1
            
            logger.info(f"Switched from {old_model} to fallback model {self.current_model}")
        
        # Try fallback steps if available
        if plan.fallback_steps:
            try:
                context = task.context.copy()
                
                for step in plan.fallback_steps:
                    step_result = await self.execute_step(step, context)
                    executed_steps.append({
                        'step': step,
                        'result': step_result,
                        'success': True,
                        'fallback': True
                    })
                    context.update(step_result.get('context_updates', {}))
                
                return AgentResult(
                    task_id=task.id,
                    status=AgentStatus.COMPLETED,
                    success=True,
                    message="Task completed using fallback plan",
                    data={'executed_steps': executed_steps},
                    model_used=self.current_model,
                    fallback_used=True,
                    warnings=["Primary plan failed, used fallback"]
                )
                
            except Exception as fallback_error:
                logger.error(f"Fallback execution failed: {fallback_error}")
        
        return AgentResult(
            task_id=task.id,
            status=AgentStatus.FAILED,
            success=False,
            message="Both primary and fallback execution failed",
            errors=["Primary execution failed", "Fallback execution failed"],
            data={'executed_steps': executed_steps},
            fallback_used=True
        )
    
    async def _create_review_request(self, task: AgentTask, plan: ExecutionPlan) -> AgentResult:
        """Create a review request for high-risk tasks"""
        logger.info(f"Creating review request for high-risk task {task.id}")
        
        # This would create a Pull Request or review ticket
        # For now, we'll simulate this
        review_data = {
            'task': task.to_dict(),
            'plan': {
                'steps': plan.steps,
                'risk_assessment': plan.risk_assessment.value,
                'estimated_duration': plan.estimated_duration
            },
            'agent': self.name,
            'review_url': f"https://github.com/predator-analytics/reviews/{task.id}"
        }
        
        return AgentResult(
            task_id=task.id,
            status=AgentStatus.WAITING_REVIEW,
            success=False,
            message="Task requires human review due to high risk level",
            data=review_data,
            review_required=True,
            pull_request_url=review_data['review_url']
        )
    
    async def _log_telemetry(self, event: str, data: Dict[str, Any]):
        """Log telemetry data"""
        telemetry_entry = {
            'timestamp': datetime.now().isoformat(),
            'agent': self.name,
            'agent_type': self.agent_type,
            'event': event,
            'data': data
        }
        
        # This would send to telemetry system
        logger.debug(f"Telemetry: {json.dumps(telemetry_entry)}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            'name': self.name,
            'type': self.agent_type,
            'status': self.status.value,
            'current_task': self.current_task.to_dict() if self.current_task else None,
            'current_model': self.current_model,
            'telemetry': self.telemetry_data,
            'config': {
                'requires_review': self.requires_review,
                'safe_mode': self.safe_mode,
                'sandbox_enabled': self.sandbox_enabled
            }
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform agent health check"""
        return {
            'healthy': True,
            'status': self.status.value,
            'model_available': True,  # Would check actual model availability
            'resource_usage': {
                'memory_mb': 0,  # Would check actual usage
                'cpu_percent': 0
            },
            'last_activity': self.telemetry_data.get('last_activity'),
            'error_rate': self._calculate_error_rate()
        }
    
    def _calculate_error_rate(self) -> float:
        """Calculate agent error rate"""
        total_tasks = self.telemetry_data['tasks_completed'] + self.telemetry_data['tasks_failed']
        if total_tasks == 0:
            return 0.0
        return self.telemetry_data['tasks_failed'] / total_tasks

# Export main classes
__all__ = [
    'BaseAgent',
    'AgentTask',
    'AgentResult',
    'AgentStatus',
    'TaskPriority',
    'RiskLevel',
    'ExecutionPlan'
]
