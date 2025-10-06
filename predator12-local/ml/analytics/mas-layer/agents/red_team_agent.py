import logging
import os
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import httpx
import random

# Setup logging
logger = logging.getLogger("RedTeamAgent")

class RedTeamAgent:
    """
    Red Team Agent that simulates attacks and tests system security.
    This agent helps identify vulnerabilities by attempting to exploit the system.
    """
    
    def __init__(self, environment, model="llama3", attack_frequency=24):
        """
        Initialize the Red Team Agent.
        
        Args:
            environment: Shared environment object
            model: LLM model to use for attack generation
            attack_frequency: How often to run attacks (in hours)
        """
        self.environment = environment
        self.model = model
        self.attack_frequency = attack_frequency
        self.last_attack_time = None
        
        logger.info(f"RedTeamAgent initialized with model {model} and attack frequency {attack_frequency}h")
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task in the agent graph.
        
        Args:
            state: Current state of the task
        
        Returns:
            Updated state
        """
        logger.info(f"RedTeamAgent processing task: {state['task']}")
        
        # Add agent to state
        state["current_agent"] = "red_team"
        
        # Check if this is a security test task
        if state.get("task_type") == "security_test":
            # Run a security test
            test_result = await self.run_security_test(state.get("parameters", {}))
            
            # Update state with test results
            state["result"] = test_result
            state["status"] = "completed"
            
            # Add message to state
            state["messages"].append({
                "agent": "red_team",
                "content": f"Completed security test with {len(test_result.get('vulnerabilities', []))} vulnerabilities found",
                "timestamp": datetime.now().isoformat()
            })
            
            # Set next agent to arbiter if available
            if "arbiter" in state.get("available_agents", []):
                state["next_agent"] = "arbiter"
            else:
                state["next_agent"] = None
        else:
            # For non-security tasks, just pass to the next agent
            state["messages"].append({
                "agent": "red_team",
                "content": "Task is not a security test, passing to next agent",
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
        Run the agent in the background, periodically checking for security issues.
        """
        logger.info("Starting RedTeamAgent background process")
        
        while True:
            try:
                # Check if it's time to run an attack
                current_time = datetime.now()
                
                if (self.last_attack_time is None or 
                    (current_time - self.last_attack_time) > timedelta(hours=self.attack_frequency)):
                    
                    logger.info("Running scheduled security test")
                    
                    # Run a security test
                    test_result = await self.run_security_test()
                    
                    # Log the results
                    vulnerabilities = test_result.get("vulnerabilities", [])
                    if vulnerabilities:
                        logger.warning(f"Security test found {len(vulnerabilities)} vulnerabilities")
                        
                        # Log event in environment
                        self.environment.log_event("security_test", {
                            "vulnerabilities_found": len(vulnerabilities),
                            "severity_counts": test_result.get("severity_counts", {}),
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        # Update security status
                        self.environment.update_security_status(len(vulnerabilities))
                    else:
                        logger.info("Security test completed with no vulnerabilities found")
                    
                    # Update last attack time
                    self.last_attack_time = current_time
                
                # Sleep until next check
                await asyncio.sleep(60 * 60)  # Check every hour
                
            except Exception as e:
                logger.error(f"Error in RedTeamAgent background process: {str(e)}")
                await asyncio.sleep(60)  # Sleep and retry on error
    
    async def run_security_test(self, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Run a security test against the system.
        
        Args:
            parameters: Test parameters
        
        Returns:
            Test results
        """
        parameters = parameters or {}
        test_type = parameters.get("test_type", "comprehensive")
        target = parameters.get("target", "all")
        
        logger.info(f"Running security test: type={test_type}, target={target}")
        
        # In a real implementation, this would use the LLM to generate attack vectors
        # and then execute them against the system
        
        # For this example, we'll simulate the security test
        vulnerabilities = []
        
        if test_type == "comprehensive" or test_type == "api":
            # Test API endpoints for vulnerabilities
            api_vulns = await self._test_api_endpoints()
            vulnerabilities.extend(api_vulns)
        
        if test_type == "comprehensive" or test_type == "database":
            # Test database for vulnerabilities
            db_vulns = await self._test_database()
            vulnerabilities.extend(db_vulns)
        
        if test_type == "comprehensive" or test_type == "network":
            # Test network for vulnerabilities
            network_vulns = await self._test_network()
            vulnerabilities.extend(network_vulns)
        
        # Count vulnerabilities by severity
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "medium")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        # Generate report
        report = {
            "test_id": f"security-test-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "test_type": test_type,
            "target": target,
            "vulnerabilities": vulnerabilities,
            "vulnerability_count": len(vulnerabilities),
            "severity_counts": severity_counts,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Security test completed: {len(vulnerabilities)} vulnerabilities found")
        return report
    
    async def _test_api_endpoints(self) -> List[Dict[str, Any]]:
        """Test API endpoints for vulnerabilities."""
        # In a real implementation, this would test for:
        # - SQL injection
        # - XSS
        # - CSRF
        # - Authentication bypass
        # - Authorization issues
        # - Rate limiting bypass
        
        # Simulate finding vulnerabilities
        vulnerabilities = []
        
        # Simulate a SQL injection vulnerability
        if random.random() < 0.3:  # 30% chance
            vulnerabilities.append({
                "type": "sql_injection",
                "endpoint": "/api/tenders",
                "severity": "high",
                "description": "SQL injection vulnerability in tender search parameter",
                "proof_of_concept": "?search=1' OR '1'='1",
                "remediation": "Use parameterized queries or ORM"
            })
        
        # Simulate an XSS vulnerability
        if random.random() < 0.2:  # 20% chance
            vulnerabilities.append({
                "type": "xss",
                "endpoint": "/api/companies",
                "severity": "medium",
                "description": "Reflected XSS in company name parameter",
                "proof_of_concept": "?name=<script>alert('XSS')</script>",
                "remediation": "Implement proper output encoding"
            })
        
        # Simulate an authorization issue
        if random.random() < 0.15:  # 15% chance
            vulnerabilities.append({
                "type": "authorization",
                "endpoint": "/api/users/{id}",
                "severity": "critical",
                "description": "Users can access other users' data by changing the ID parameter",
                "proof_of_concept": "Change user ID in request",
                "remediation": "Implement proper authorization checks"
            })
        
        return vulnerabilities
    
    async def _test_database(self) -> List[Dict[str, Any]]:
        """Test database for vulnerabilities."""
        # In a real implementation, this would test for:
        # - Weak credentials
        # - Excessive privileges
        # - Unencrypted sensitive data
        # - Backup exposure
        
        # Simulate finding vulnerabilities
        vulnerabilities = []
        
        # Simulate weak credentials
        if random.random() < 0.1:  # 10% chance
            vulnerabilities.append({
                "type": "weak_credentials",
                "component": "database",
                "severity": "critical",
                "description": "Database using default or weak credentials",
                "proof_of_concept": "Connected with default credentials",
                "remediation": "Use strong, unique passwords and restrict access"
            })
        
        # Simulate unencrypted sensitive data
        if random.random() < 0.25:  # 25% chance
            vulnerabilities.append({
                "type": "unencrypted_data",
                "component": "database",
                "severity": "high",
                "description": "Sensitive user data stored without encryption",
                "proof_of_concept": "Extracted plaintext sensitive data from database",
                "remediation": "Implement data encryption for sensitive fields"
            })
        
        return vulnerabilities
    
    async def _test_network(self) -> List[Dict[str, Any]]:
        """Test network for vulnerabilities."""
        # In a real implementation, this would test for:
        # - Open ports
        # - Unencrypted communications
        # - Weak TLS configurations
        # - Network segmentation issues
        
        # Simulate finding vulnerabilities
        vulnerabilities = []
        
        # Simulate open ports
        if random.random() < 0.2:  # 20% chance
            vulnerabilities.append({
                "type": "open_ports",
                "component": "network",
                "severity": "medium",
                "description": "Unnecessary ports exposed to the internet",
                "proof_of_concept": "Port scan revealed open ports: 22, 3306",
                "remediation": "Close unnecessary ports and implement firewall rules"
            })
        
        # Simulate unencrypted communications
        if random.random() < 0.15:  # 15% chance
            vulnerabilities.append({
                "type": "unencrypted_comms",
                "component": "network",
                "severity": "high",
                "description": "Internal service communications not encrypted",
                "proof_of_concept": "Captured plaintext traffic between services",
                "remediation": "Implement TLS for all service communications"
            })
        
        return vulnerabilities
