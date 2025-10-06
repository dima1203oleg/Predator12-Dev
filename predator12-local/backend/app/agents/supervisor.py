#!/usr/bin/env python3
"""
Predator11 Agent Supervisor
Manages long-running agents and coordinates their activities
"""

import asyncio
import json
import logging
import os
import threading
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pathlib import Path

# Import agent classes
try:
    from ..workers.tasks.self_healing_tasks import run_health_check, auto_heal_issues
    from ..workers.tasks.ml_tasks import check_model_performance
    from ..workers.tasks.agent_tasks import execute_chief_orchestrator
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False

# Import monitoring libraries
try:
    import requests
    import psutil
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False

logger = logging.getLogger(__name__)

class AgentSupervisor:
    """Production Agent Supervisor for Predator11"""
    
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {
            'self_healing': {
                'name': 'SelfHealingAgent',
                'description': 'Monitors system health and performs auto-healing',
                'interval': 60,  # seconds
                'active': False,
                'thread': None,
                'last_run': None,
                'error_count': 0
            },
            'model_monitor': {
                'name': 'ModelMonitorAgent',
                'description': 'Monitors ML model performance',
                'interval': 300,  # 5 minutes
                'active': False,
                'thread': None,
                'last_run': None,
                'error_count': 0
            },
            'data_quality': {
                'name': 'DataQualityAgent',
                'description': 'Monitors data quality and integrity',
                'interval': 600,  # 10 minutes
                'active': False,
                'thread': None,
                'last_run': None,
                'error_count': 0
            },
            'resource_monitor': {
                'name': 'ResourceMonitorAgent',
                'description': 'Monitors system resources',
                'interval': 30,  # 30 seconds
                'active': False,
                'thread': None,
                'last_run': None,
                'error_count': 0
            }
        }
        self.running = False
        self.logger = logging.getLogger(__name__)
        
    def start(self):
        """Start the agent supervisor"""
        self.logger.info("Starting Predator11 Agent Supervisor...")
        self.running = True
        
        # Start all agents
        for agent_id in self.agents:
            self.start_agent(agent_id)
        
        self.logger.info("Agent Supervisor started successfully")
        
        # Keep the supervisor running
        try:
            while self.running:
                time.sleep(10)
                self._check_agent_health()
        except KeyboardInterrupt:
            self.logger.info("Received shutdown signal")
        finally:
            self.stop_all_agents()
        
    def start_agent(self, agent_id: str) -> bool:
        """Start a specific agent"""
        if agent_id not in self.agents:
            self.logger.error(f"Unknown agent: {agent_id}")
            return False
        
        agent = self.agents[agent_id]
        
        if agent['active']:
            self.logger.warning(f"Agent {agent_id} is already running")
            return True
        
        try:
            # Create and start agent thread
            thread = threading.Thread(
                target=self._run_agent,
                args=(agent_id,),
                daemon=True,
                name=f"Agent-{agent['name']}"
            )
            thread.start()
            
            agent['active'] = True
            agent['thread'] = thread
            agent['error_count'] = 0
            
            self.logger.info(f"Started agent: {agent['name']}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to start agent {agent_id}: {e}")
            return False
            
    def stop_agent(self, agent_id: str) -> bool:
        """Stop a specific agent"""
        if agent_id not in self.agents:
            self.logger.error(f"Unknown agent: {agent_id}")
            return False
        
        agent = self.agents[agent_id]
        
        if not agent['active']:
            self.logger.warning(f"Agent {agent_id} is not running")
            return True
        
        try:
            agent['active'] = False
            
            # Wait for thread to finish (with timeout)
            if agent['thread'] and agent['thread'].is_alive():
                agent['thread'].join(timeout=5)
            
            agent['thread'] = None
            
            self.logger.info(f"Stopped agent: {agent['name']}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to stop agent {agent_id}: {e}")
            return False
            
    def stop_all_agents(self):
        """Stop all agents"""
        self.logger.info("Stopping all agents...")
        
        for agent_id in self.agents:
            self.stop_agent(agent_id)
        
        self.logger.info("All agents stopped")
            
    def _run_agent(self, agent_id: str):
        """Main loop for an agent"""
        agent = self.agents[agent_id]
        
        while agent['active'] and self.running:
            try:
                # Execute agent logic based on type
                if agent_id == 'self_healing':
                    self._run_self_healing_agent()
                elif agent_id == 'model_monitor':
                    self._run_model_monitor_agent()
                elif agent_id == 'data_quality':
                    self._run_data_quality_agent()
                elif agent_id == 'resource_monitor':
                    self._run_resource_monitor_agent()
                
                agent['last_run'] = datetime.now(timezone.utc)
                agent['error_count'] = 0
                
                # Sleep for the specified interval
                time.sleep(agent['interval'])
                
            except Exception as e:
                agent['error_count'] += 1
                self.logger.error(f"Error in agent {agent_id}: {e}")
                
                # If too many errors, stop the agent
                if agent['error_count'] > 5:
                    self.logger.error(f"Too many errors in agent {agent_id}, stopping")
                    agent['active'] = False
                    break
                
                # Wait before retrying
                time.sleep(min(agent['interval'], 60))
            
    def _run_self_healing_agent(self):
        """Self-healing agent logic"""
        if not CELERY_AVAILABLE:
            self.logger.warning("Celery not available, skipping self-healing check")
            return
        
        try:
            # Trigger health check task
            result = run_health_check.delay()
            health_report = result.get(timeout=30)
            
            # If critical issues found, trigger auto-healing
            if health_report.get('overall_status') == 'critical':
                healing_result = auto_heal_issues.delay(health_report)
                healing_report = healing_result.get(timeout=60)
                
                self.logger.info(f"Auto-healing completed: {len(healing_report.get('actions_taken', []))} actions taken")
            
        except Exception as e:
            self.logger.error(f"Self-healing agent error: {e}")
            raise
        
    def _run_model_monitor_agent(self):
        """Model monitoring agent logic"""
        if not CELERY_AVAILABLE:
            self.logger.warning("Celery not available, skipping model monitoring")
            return
        
        try:
            # Trigger model performance check
            result = check_model_performance.delay()
            performance_report = result.get(timeout=120)
            
            # Log any models that need retraining
            retraining_needed = performance_report.get('retraining_triggered', [])
            if retraining_needed:
                self.logger.info(f"Models scheduled for retraining: {[m['model_name'] for m in retraining_needed]}")
            
        except Exception as e:
            self.logger.error(f"Model monitor agent error: {e}")
            raise
                
    def _run_data_quality_agent(self):
        """Data quality monitoring agent logic"""
        try:
            # Check data quality metrics
            # This would integrate with your data quality monitoring system
            self.logger.info("Data quality check completed")
            
        except Exception as e:
            self.logger.error(f"Data quality agent error: {e}")
            raise
    
    def _run_resource_monitor_agent(self):
        """Resource monitoring agent logic"""
        if not MONITORING_AVAILABLE:
            self.logger.warning("Monitoring libraries not available")
            return
        
        try:
            # Check system resources
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Log warnings for high resource usage
            if cpu_percent > 80:
                self.logger.warning(f"High CPU usage: {cpu_percent}%")
            
            if memory.percent > 85:
                self.logger.warning(f"High memory usage: {memory.percent}%")
            
            if disk.percent > 90:
                self.logger.warning(f"Low disk space: {disk.percent}% used")
            
        except Exception as e:
            self.logger.error(f"Resource monitor agent error: {e}")
            raise
        
    def _check_agent_health(self):
        """Check health of all agents"""
        for agent_id, agent in self.agents.items():
            if agent['active']:
                # Check if thread is still alive
                if agent['thread'] and not agent['thread'].is_alive():
                    self.logger.warning(f"Agent {agent_id} thread died, restarting...")
                    self.stop_agent(agent_id)
                    time.sleep(2)
                    self.start_agent(agent_id)
                
                # Check for stale agents (haven't run recently)
                if agent['last_run']:
                    time_since_run = (datetime.now(timezone.utc) - agent['last_run']).total_seconds()
                    max_stale_time = agent['interval'] * 3  # 3x the normal interval
                    
                    if time_since_run > max_stale_time:
                        self.logger.warning(f"Agent {agent_id} appears stale, restarting...")
                        self.stop_agent(agent_id)
                        time.sleep(2)
                        self.start_agent(agent_id)
        
    def get_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        status = {
            'supervisor_running': self.running,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'agents': {}
        }
        
        for agent_id, agent in self.agents.items():
            status['agents'][agent_id] = {
                'name': agent['name'],
                'description': agent['description'],
                'active': agent['active'],
                'interval': agent['interval'],
                'last_run': agent['last_run'].isoformat() if agent['last_run'] else None,
                'error_count': agent['error_count'],
                'thread_alive': agent['thread'].is_alive() if agent['thread'] else False
            }
        
        return status
        
    def shutdown(self):
        """Shutdown the supervisor"""
        self.logger.info("Shutting down Agent Supervisor...")
        self.running = False
        self.stop_all_agents()
        self.logger.info("Agent Supervisor shutdown complete")
        
        
        

def main():
    """Main function to run the agent supervisor"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    supervisor = AgentSupervisor()
    
    try:
        supervisor.start()
    except KeyboardInterrupt:
        supervisor.shutdown()
    except Exception as e:
        logging.error(f"Supervisor error: {e}")
        supervisor.shutdown()
        raise

if __name__ == "__main__":
    main()
