import logging
import os
import json
import time
from datetime import datetime
import asyncio
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import redis
from kafka import KafkaProducer, KafkaConsumer
import langgraph
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
import networkx as nx

# Import agent modules
from agents.red_team_agent import RedTeamAgent
from agents.auto_heal_agent import AutoHealAgent
from agents.arbiter_agent import ArbiterAgent
from environment import Environment

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("MAS-Coordinator")

class MASCoordinator:
    """
    Multi-Agent System Coordinator that manages and orchestrates different agents.
    """
    
    def __init__(self):
        """Initialize the MAS Coordinator."""
        logger.info("Initializing Multi-Agent System Coordinator")
        
        # Load configuration
        self.config = self._load_config()
        
        # Initialize database connection
        self.db_engine = create_engine(os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator"))
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.db_engine)
        
        # Initialize Redis connection
        self.redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
        
        # Initialize Kafka producer
        self.kafka_producer = KafkaProducer(
            bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda v: v.encode('utf-8') if v else None
        )
        
        # Initialize environment
        self.environment = Environment(self.db_engine, self.redis_client, self.kafka_producer)
        
        # Initialize agents
        self.agents = self._initialize_agents()
        
        # Initialize agent graph
        self.agent_graph = self._build_agent_graph()
        
        # Initialize state
        self.state = {
            "status": "initialized",
            "active_agents": [],
            "tasks": [],
            "environment": self.environment.get_state()
        }
        
        logger.info("MAS Coordinator initialized successfully")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from environment variables or config file."""
        config = {
            "enable_mas": os.getenv("ENABLE_MAS", "true").lower() == "true",
            "coordination_strategy": os.getenv("AGENT_COORDINATION_STRATEGY", "arbiter"),
            "redteam_enabled": os.getenv("REDTEAM_ENABLED", "true").lower() == "true",
            "autoheal_enabled": True,
            "max_concurrent_tasks": int(os.getenv("MAX_CONCURRENT_TASKS", "5")),
            "task_timeout_seconds": int(os.getenv("TASK_TIMEOUT_SECONDS", "3600")),
            "agent_config": {
                "red_team": {
                    "enabled": os.getenv("REDTEAM_ENABLED", "true").lower() == "true",
                    "model": os.getenv("REDTEAM_MODEL", "llama3"),
                    "attack_frequency": int(os.getenv("REDTEAM_ATTACK_FREQUENCY", "24")) # hours
                },
                "auto_heal": {
                    "enabled": True,
                    "check_frequency": int(os.getenv("AUTOHEAL_CHECK_FREQUENCY", "60")) # seconds
                },
                "arbiter": {
                    "enabled": True,
                    "model": os.getenv("ARBITER_MODEL", "llama3")
                }
            }
        }
        
        logger.info(f"Loaded configuration: {json.dumps(config, indent=2)}")
        return config
    
    def _initialize_agents(self) -> Dict[str, Any]:
        """Initialize all agents based on configuration."""
        agents = {}
        
        # Initialize RedTeamAgent if enabled
        if self.config["agent_config"]["red_team"]["enabled"]:
            agents["red_team"] = RedTeamAgent(
                environment=self.environment,
                model=self.config["agent_config"]["red_team"]["model"],
                attack_frequency=self.config["agent_config"]["red_team"]["attack_frequency"]
            )
            logger.info("RedTeamAgent initialized")
        
        # Initialize AutoHealAgent
        if self.config["agent_config"]["auto_heal"]["enabled"]:
            agents["auto_heal"] = AutoHealAgent(
                environment=self.environment,
                check_frequency=self.config["agent_config"]["auto_heal"]["check_frequency"]
            )
            logger.info("AutoHealAgent initialized")
        
        # Initialize ArbiterAgent
        if self.config["agent_config"]["arbiter"]["enabled"]:
            agents["arbiter"] = ArbiterAgent(
                environment=self.environment,
                model=self.config["agent_config"]["arbiter"]["model"]
            )
            logger.info("ArbiterAgent initialized")
        
        return agents
    
    def _build_agent_graph(self) -> StateGraph:
        """Build the agent interaction graph using LangGraph."""
        # Define the graph state schema
        state_schema = {
            "task": str,
            "status": str,
            "messages": List[Dict[str, Any]],
            "environment": Dict[str, Any],
            "current_agent": str,
            "next_agent": Optional[str],
            "result": Optional[Dict[str, Any]]
        }
        
        # Create a new graph
        graph = StateGraph(state_schema)
        
        # Add nodes for each agent
        for agent_name, agent in self.agents.items():
            graph.add_node(agent_name, agent.process)
        
        # Add special nodes
        graph.add_node("start", self._start_task)
        graph.add_node("end", self._end_task)
        
        # Define the routing function
        def router(state):
            if state["status"] == "completed" or state["status"] == "failed":
                return "end"
            
            if state["next_agent"]:
                return state["next_agent"]
            
            # If no next agent is specified, use the arbiter to decide
            if "arbiter" in self.agents:
                return "arbiter"
            
            # Default to end if no routing is possible
            return "end"
        
        # Connect the nodes
        graph.add_edge("start", router)
        
        for agent_name in self.agents:
            graph.add_edge(agent_name, router)
        
        graph.add_edge("end", END)
        
        # Compile the graph
        return graph.compile()
    
    async def _start_task(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize a new task in the agent graph."""
        logger.info(f"Starting task: {state['task']}")
        
        # Update state
        state["status"] = "in_progress"
        state["messages"] = []
        state["environment"] = self.environment.get_state()
        
        # Determine the first agent based on task type
        task_type = state.get("task_type", "default")
        
        if task_type == "security_test" and "red_team" in self.agents:
            state["next_agent"] = "red_team"
        elif task_type == "system_health" and "auto_heal" in self.agents:
            state["next_agent"] = "auto_heal"
        elif "arbiter" in self.agents:
            state["next_agent"] = "arbiter"
        else:
            # If no suitable agent, end the task
            state["status"] = "failed"
            state["result"] = {
                "error": "No suitable agent found for task",
                "timestamp": datetime.now().isoformat()
            }
        
        return state
    
    async def _end_task(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Finalize a task in the agent graph."""
        logger.info(f"Ending task: {state['task']} with status: {state['status']}")
        
        # Record task completion
        if "result" not in state:
            state["result"] = {
                "message": "Task completed with no specific result",
                "timestamp": datetime.now().isoformat()
            }
        
        # Publish task result to Kafka
        self.kafka_producer.send(
            "mas_task_results",
            key=state["task"],
            value={
                "task": state["task"],
                "status": state["status"],
                "result": state["result"],
                "timestamp": datetime.now().isoformat()
            }
        )
        
        return state
    
    async def run_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Run a task through the agent graph."""
        if not self.config["enable_mas"]:
            logger.warning("MAS is disabled, not running task")
            return {
                "task": task.get("task", "unknown"),
                "status": "skipped",
                "result": {
                    "message": "Multi-Agent System is disabled",
                    "timestamp": datetime.now().isoformat()
                }
            }
        
        logger.info(f"Running task: {task}")
        
        # Initialize task state
        task_state = {
            "task": task.get("task", f"task-{datetime.now().strftime('%Y%m%d%H%M%S')}"),
            "task_type": task.get("task_type", "default"),
            "status": "initialized",
            "messages": [],
            "environment": self.environment.get_state(),
            "current_agent": None,
            "next_agent": None,
            "parameters": task.get("parameters", {}),
            "result": None
        }
        
        try:
            # Run the task through the agent graph
            result = await self.agent_graph.ainvoke(task_state)
            logger.info(f"Task completed: {result['task']} with status: {result['status']}")
            return result
        except Exception as e:
            logger.error(f"Error running task: {str(e)}")
            return {
                "task": task_state["task"],
                "status": "failed",
                "result": {
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            }
    
    async def start(self):
        """Start the MAS Coordinator and listen for tasks."""
        logger.info("Starting MAS Coordinator")
        
        if not self.config["enable_mas"]:
            logger.warning("MAS is disabled, running in passive mode")
            # Still run, but don't actively process tasks
            while True:
                await asyncio.sleep(60)
                logger.info("MAS Coordinator passive check")
        
        # Initialize Kafka consumer for tasks
        consumer = KafkaConsumer(
            "mas_tasks",
            bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            group_id="mas-coordinator",
            auto_offset_reset="latest"
        )
        
        # Start background tasks for agents that need continuous operation
        background_tasks = []
        
        if "red_team" in self.agents and self.config["agent_config"]["red_team"]["enabled"]:
            background_tasks.append(asyncio.create_task(self.agents["red_team"].run_background()))
        
        if "auto_heal" in self.agents and self.config["agent_config"]["auto_heal"]["enabled"]:
            background_tasks.append(asyncio.create_task(self.agents["auto_heal"].run_background()))
        
        # Process tasks from Kafka
        try:
            logger.info("Listening for tasks on Kafka topic: mas_tasks")
            
            # Simulate Kafka consumer in async context
            while True:
                # Check for new messages (in a real implementation, this would be done properly with async Kafka)
                for message in consumer.poll(timeout_ms=1000).values():
                    for record in message:
                        task = record.value
                        logger.info(f"Received task: {task}")
                        asyncio.create_task(self.run_task(task))
                
                # Sleep to avoid busy waiting
                await asyncio.sleep(1)
        
        except Exception as e:
            logger.error(f"Error in MAS Coordinator: {str(e)}")
        finally:
            # Cancel background tasks
            for task in background_tasks:
                task.cancel()
            
            # Close connections
            consumer.close()
            self.kafka_producer.close()
            logger.info("MAS Coordinator stopped")

async def main():
    """Main entry point for the MAS Coordinator."""
    coordinator = MASCoordinator()
    await coordinator.start()

if __name__ == "__main__":
    asyncio.run(main())
