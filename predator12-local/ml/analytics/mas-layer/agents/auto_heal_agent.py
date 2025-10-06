import logging
import os
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import httpx

# Setup logging
logger = logging.getLogger("AutoHealAgent")

class AutoHealAgent:
    """
    AutoHeal Agent that monitors system health and automatically fixes issues.
    This agent is responsible for maintaining system stability and performance.
    """
    
    def __init__(self, environment, check_frequency=60):
        """
        Initialize the AutoHeal Agent.
        
        Args:
            environment: Shared environment object
            check_frequency: How often to check system health (in seconds)
        """
        self.environment = environment
        self.check_frequency = check_frequency
        self.last_check_time = None
        self.healing_actions = 0
        
        logger.info(f"AutoHealAgent initialized with check frequency {check_frequency}s")
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task in the agent graph.
        
        Args:
            state: Current state of the task
        
        Returns:
            Updated state
        """
        logger.info(f"AutoHealAgent processing task: {state['task']}")
        
        # Add agent to state
        state["current_agent"] = "auto_heal"
        
        # Check if this is a system health task
        if state.get("task_type") == "system_health":
            # Run a health check and healing
            health_result = await self.check_and_heal_system(state.get("parameters", {}))
            
            # Update state with health results
            state["result"] = health_result
            state["status"] = "completed"
            
            # Add message to state
            state["messages"].append({
                "agent": "auto_heal",
                "content": f"Completed system health check with {len(health_result.get('actions_taken', []))} healing actions",
                "timestamp": datetime.now().isoformat()
            })
            
            # Set next agent to arbiter if available
            if "arbiter" in state.get("available_agents", []):
                state["next_agent"] = "arbiter"
            else:
                state["next_agent"] = None
        else:
            # For non-health tasks, just pass to the next agent
            state["messages"].append({
                "agent": "auto_heal",
                "content": "Task is not a system health check, passing to next agent",
                "timestamp": datetime.now().isoformat()
            })
            
            # Set next agent to arbiter if available
            if "arbiter" in state.get("available_agents", []):
                state["next_agent"] = "arbiter"
            else:
                state["next_agent"] = None
        
        return state
    
    async def run_background(self):
        """
        Run the agent in the background, periodically checking system health.
        """
        logger.info("Starting AutoHealAgent background process")
        
        while True:
            try:
                # Check system health
                health_result = await self.check_and_heal_system()
                
                # Log the results
                actions_taken = health_result.get("actions_taken", [])
                if actions_taken:
                    logger.info(f"System health check resulted in {len(actions_taken)} healing actions")
                    
                    # Log event in environment
                    self.environment.log_event("system_healing", {
                        "actions_taken": len(actions_taken),
                        "components_healed": [action["component"] for action in actions_taken],
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Update healing actions count
                    self.healing_actions += len(actions_taken)
                else:
                    logger.info("System health check completed with no healing actions needed")
                
                # Sleep until next check
                await asyncio.sleep(self.check_frequency)
                
            except Exception as e:
                logger.error(f"Error in AutoHealAgent background process: {str(e)}")
                await asyncio.sleep(60)  # Sleep and retry on error
    
    async def check_and_heal_system(self, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Check system health and heal any issues.
        
        Args:
            parameters: Check parameters
        
        Returns:
            Health check and healing results
        """
        parameters = parameters or {}
        check_type = parameters.get("check_type", "comprehensive")
        components = parameters.get("components", ["database", "api", "redis", "kafka", "disk", "memory"])
        
        logger.info(f"Checking system health: type={check_type}, components={components}")
        
        # Get system health from environment
        health = self.environment.get_system_health()
        
        # Identify issues that need healing
        issues = []
        
        if "database" in components and health["components"]["database"] != "healthy":
            issues.append({
                "component": "database",
                "status": health["components"]["database"],
                "description": "Database connection issues detected"
            })
        
        if "redis" in components and health["components"]["redis"] != "healthy":
            issues.append({
                "component": "redis",
                "status": health["components"]["redis"],
                "description": "Redis connection issues detected"
            })
        
        if "api" in components and health["components"]["api"] != "healthy":
            issues.append({
                "component": "api",
                "status": health["components"]["api"],
                "description": "API endpoint issues detected"
            })
        
        # Check disk space
        if "disk" in components:
            disk_status = await self._check_disk_space()
            if disk_status["status"] != "healthy":
                issues.append({
                    "component": "disk",
                    "status": disk_status["status"],
                    "description": f"Disk space issues detected: {disk_status['percent_used']}% used"
                })
        
        # Check memory usage
        if "memory" in components:
            memory_status = await self._check_memory_usage()
            if memory_status["status"] != "healthy":
                issues.append({
                    "component": "memory",
                    "status": memory_status["status"],
                    "description": f"Memory issues detected: {memory_status['percent_used']}% used"
                })
        
        # Heal identified issues
        actions_taken = []
        
        for issue in issues:
            action = await self._heal_component(issue["component"])
            if action:
                actions_taken.append(action)
        
        # Generate report
        report = {
            "check_id": f"health-check-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "check_type": check_type,
            "components_checked": components,
            "issues_found": issues,
            "actions_taken": actions_taken,
            "system_status": health["status"],
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Health check completed: {len(issues)} issues found, {len(actions_taken)} actions taken")
        return report
    
    async def _check_disk_space(self) -> Dict[str, Any]:
        """Check disk space usage."""
        # In a real implementation, this would check actual disk usage
        # For this example, we'll simulate the check
        
        # Simulate disk usage (between 50% and 95%)
        import random
        percent_used = random.uniform(50, 95)
        
        status = "healthy"
        if percent_used > 90:
            status = "critical"
        elif percent_used > 80:
            status = "warning"
        
        return {
            "status": status,
            "percent_used": percent_used,
            "total_gb": 100,  # Placeholder
            "free_gb": 100 - (percent_used / 100 * 100)  # Placeholder
        }
    
    async def _check_memory_usage(self) -> Dict[str, Any]:
        """Check memory usage."""
        # In a real implementation, this would check actual memory usage
        # For this example, we'll simulate the check
        
        # Simulate memory usage (between 40% and 90%)
        import random
        percent_used = random.uniform(40, 90)
        
        status = "healthy"
        if percent_used > 85:
            status = "critical"
        elif percent_used > 75:
            status = "warning"
        
        return {
            "status": status,
            "percent_used": percent_used,
            "total_gb": 16,  # Placeholder
            "available_gb": 16 - (percent_used / 100 * 16)  # Placeholder
        }
    
    async def _heal_component(self, component: str) -> Optional[Dict[str, Any]]:
        """
        Heal a specific component.
        
        Args:
            component: Component to heal
        
        Returns:
            Healing action details or None if no action was taken
        """
        logger.info(f"Attempting to heal component: {component}")
        
        # Execute healing action through environment
        if component == "database":
            action_result = self.environment.execute_action("restart_service", {"service_name": "postgres"})
            return {
                "component": component,
                "action": "restart_service",
                "result": action_result.get("status", "unknown"),
                "message": action_result.get("message", ""),
                "timestamp": datetime.now().isoformat()
            }
        
        elif component == "redis":
            action_result = self.environment.execute_action("restart_service", {"service_name": "redis"})
            return {
                "component": component,
                "action": "restart_service",
                "result": action_result.get("status", "unknown"),
                "message": action_result.get("message", ""),
                "timestamp": datetime.now().isoformat()
            }
        
        elif component == "api":
            action_result = self.environment.execute_action("restart_service", {"service_name": "fastapi"})
            return {
                "component": component,
                "action": "restart_service",
                "result": action_result.get("status", "unknown"),
                "message": action_result.get("message", ""),
                "timestamp": datetime.now().isoformat()
            }
        
        elif component == "disk":
            action_result = self.environment.execute_action("optimize_resources", {"resource_type": "disk"})
            return {
                "component": component,
                "action": "cleanup_disk",
                "result": action_result.get("status", "unknown"),
                "message": action_result.get("message", ""),
                "timestamp": datetime.now().isoformat()
            }
        
        elif component == "memory":
            action_result = self.environment.execute_action("optimize_resources", {"resource_type": "memory"})
            return {
                "component": component,
                "action": "optimize_memory",
                "result": action_result.get("status", "unknown"),
                "message": action_result.get("message", ""),
                "timestamp": datetime.now().isoformat()
            }
        
        else:
            logger.warning(f"No healing action defined for component: {component}")
            return None
