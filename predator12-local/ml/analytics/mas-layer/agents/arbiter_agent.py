import logging
import os
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import httpx

# Setup logging
logger = logging.getLogger("ArbiterAgent")

class ArbiterAgent:
    """
    Arbiter Agent that coordinates other agents and makes high-level decisions.
    This agent acts as a central decision maker in the multi-agent system.
    """
    
    def __init__(self, environment, model="llama3"):
        """
        Initialize the Arbiter Agent.
        
        Args:
            environment: Shared environment object
            model: LLM model to use for decision making
        """
        self.environment = environment
        self.model = model
        self.decisions_made = 0
        
        logger.info(f"ArbiterAgent initialized with model {model}")
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task in the agent graph.
        
        Args:
            state: Current state of the task
        
        Returns:
            Updated state
        """
        logger.info(f"ArbiterAgent processing task: {state['task']}")
        
        # Add agent to state
        state["current_agent"] = "arbiter"
        
        # Analyze the current state and decide what to do next
        decision = await self.make_decision(state)
        
        # Apply the decision to the state
        state["messages"].append({
            "agent": "arbiter",
            "content": f"Decision: {decision['description']}",
            "timestamp": datetime.now().isoformat()
        })
        
        # Update state based on decision
        if decision["action"] == "complete_task":
            state["status"] = "completed"
            state["next_agent"] = None
            
            if "result" not in state:
                state["result"] = {
                    "message": decision["description"],
                    "timestamp": datetime.now().isoformat()
                }
        
        elif decision["action"] == "delegate":
            state["next_agent"] = decision["target_agent"]
            
            state["messages"].append({
                "agent": "arbiter",
                "content": f"Delegating to {decision['target_agent']}",
                "timestamp": datetime.now().isoformat()
            })
        
        elif decision["action"] == "request_information":
            # In a real implementation, this might trigger a human intervention
            # or a request for additional data
            state["status"] = "waiting"
            state["next_agent"] = None
            
            state["messages"].append({
                "agent": "arbiter",
                "content": f"Requesting additional information: {decision['description']}",
                "timestamp": datetime.now().isoformat()
            })
        
        # Increment decisions made
        self.decisions_made += 1
        
        # Log the decision
        self.environment.log_event("arbiter_decision", {
            "task": state["task"],
            "action": decision["action"],
            "description": decision["description"],
            "timestamp": datetime.now().isoformat()
        })
        
        return state
    
    async def make_decision(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a decision based on the current state.
        
        Args:
            state: Current state of the task
        
        Returns:
            Decision object
        """
        logger.info(f"Making decision for task: {state['task']}")
        
        # In a real implementation, this would use the LLM to analyze the state
        # and make an intelligent decision
        
        # Get task type and current status
        task_type = state.get("task_type", "default")
        status = state.get("status", "in_progress")
        current_agent = state.get("current_agent", "arbiter")
        
        # Get available agents
        available_agents = state.get("available_agents", [])
        
        # Check if the task is already completed or failed
        if status == "completed" or status == "failed":
            return {
                "action": "complete_task",
                "description": f"Task {state['task']} is already {status}",
                "timestamp": datetime.now().isoformat()
            }
        
        # Make decisions based on task type and current state
        if task_type == "security_test":
            # If coming from red team, check if vulnerabilities were found
            if current_agent == "red_team":
                result = state.get("result", {})
                vulnerabilities = result.get("vulnerabilities", [])
                
                if vulnerabilities:
                    # If critical vulnerabilities were found, delegate to auto_heal
                    critical_vulns = [v for v in vulnerabilities if v.get("severity") == "critical"]
                    
                    if critical_vulns and "auto_heal" in available_agents:
                        return {
                            "action": "delegate",
                            "target_agent": "auto_heal",
                            "description": f"Critical vulnerabilities found, delegating to auto_heal for immediate action",
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        # Complete the task with recommendations
                        return {
                            "action": "complete_task",
                            "description": f"Security test completed with {len(vulnerabilities)} vulnerabilities. Recommendations provided.",
                            "timestamp": datetime.now().isoformat()
                        }
                else:
                    # No vulnerabilities found, task is complete
                    return {
                        "action": "complete_task",
                        "description": "Security test completed with no vulnerabilities found",
                        "timestamp": datetime.now().isoformat()
                    }
            
            # If not coming from red team, delegate to red team
            elif "red_team" in available_agents:
                return {
                    "action": "delegate",
                    "target_agent": "red_team",
                    "description": "Delegating security test to red_team agent",
                    "timestamp": datetime.now().isoformat()
                }
        
        elif task_type == "system_health":
            # If coming from auto_heal, check if actions were taken
            if current_agent == "auto_heal":
                result = state.get("result", {})
                actions_taken = result.get("actions_taken", [])
                
                if actions_taken:
                    # Complete the task with a summary of actions taken
                    return {
                        "action": "complete_task",
                        "description": f"System health check completed with {len(actions_taken)} healing actions taken",
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    # No actions needed, task is complete
                    return {
                        "action": "complete_task",
                        "description": "System health check completed with no issues requiring action",
                        "timestamp": datetime.now().isoformat()
                    }
            
            # If not coming from auto_heal, delegate to auto_heal
            elif "auto_heal" in available_agents:
                return {
                    "action": "delegate",
                    "target_agent": "auto_heal",
                    "description": "Delegating system health check to auto_heal agent",
                    "timestamp": datetime.now().isoformat()
                }
        
        # For other task types or if no specific logic applies
        # Make a generic decision
        
        # If the task has been through multiple agents already, complete it
        messages = state.get("messages", [])
        if len(messages) > 3:
            return {
                "action": "complete_task",
                "description": "Task has been processed by multiple agents, completing",
                "timestamp": datetime.now().isoformat()
            }
        
        # If we need more information
        if len(messages) < 2 and "parameters" not in state:
            return {
                "action": "request_information",
                "description": "Need more information to process this task effectively",
                "timestamp": datetime.now().isoformat()
            }
        
        # Default: complete the task
        return {
            "action": "complete_task",
            "description": "Task processed successfully by the multi-agent system",
            "timestamp": datetime.now().isoformat()
        }
    
    async def evaluate_system_state(self) -> Dict[str, Any]:
        """
        Evaluate the overall system state and make strategic decisions.
        
        Returns:
            Evaluation results
        """
        logger.info("Evaluating overall system state")
        
        # Get environment state
        env_state = self.environment.get_state()
        
        # In a real implementation, this would use the LLM to analyze the state
        # and make strategic decisions about system operation
        
        # Check for critical issues
        critical_issues = []
        
        # Check security status
        if env_state["security"]["threats_detected"] > 0:
            critical_issues.append({
                "type": "security",
                "description": f"{env_state['security']['threats_detected']} security threats detected",
                "timestamp": datetime.now().isoformat()
            })
        
        # Check resource status
        resources = env_state["resources"]
        
        if resources["cpu_usage"] > 90:
            critical_issues.append({
                "type": "resource",
                "description": f"CPU usage is critical: {resources['cpu_usage']}%",
                "timestamp": datetime.now().isoformat()
            })
        
        if resources["memory_usage"] > 90:
            critical_issues.append({
                "type": "resource",
                "description": f"Memory usage is critical: {resources['memory_usage']}%",
                "timestamp": datetime.now().isoformat()
            })
        
        if resources["disk_usage"] > 90:
            critical_issues.append({
                "type": "resource",
                "description": f"Disk usage is critical: {resources['disk_usage']}%",
                "timestamp": datetime.now().isoformat()
            })
        
        # Check service status
        service_issues = []
        for service, status in env_state["services"].items():
            if status["status"] != "running" or status["health"] != "healthy":
                service_issues.append({
                    "service": service,
                    "status": status["status"],
                    "health": status["health"]
                })
        
        if service_issues:
            critical_issues.append({
                "type": "service",
                "description": f"{len(service_issues)} services have issues",
                "details": service_issues,
                "timestamp": datetime.now().isoformat()
            })
        
        # Make strategic decisions
        strategic_decisions = []
        
        if critical_issues:
            # Prioritize critical issues
            for issue in critical_issues:
                if issue["type"] == "security":
                    strategic_decisions.append({
                        "action": "initiate_security_response",
                        "description": "Initiating security response protocol",
                        "priority": "high",
                        "timestamp": datetime.now().isoformat()
                    })
                
                elif issue["type"] == "resource":
                    strategic_decisions.append({
                        "action": "optimize_resources",
                        "description": "Initiating resource optimization",
                        "priority": "high",
                        "timestamp": datetime.now().isoformat()
                    })
                
                elif issue["type"] == "service":
                    strategic_decisions.append({
                        "action": "restore_services",
                        "description": "Initiating service restoration",
                        "priority": "high",
                        "timestamp": datetime.now().isoformat()
                    })
        else:
            # If no critical issues, focus on optimization
            strategic_decisions.append({
                "action": "optimize_performance",
                "description": "Initiating routine performance optimization",
                "priority": "medium",
                "timestamp": datetime.now().isoformat()
            })
        
        # Generate evaluation report
        evaluation = {
            "evaluation_id": f"eval-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "system_status": "critical" if critical_issues else "healthy",
            "critical_issues": critical_issues,
            "strategic_decisions": strategic_decisions,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"System evaluation completed: status={evaluation['system_status']}, issues={len(critical_issues)}")
        return evaluation
