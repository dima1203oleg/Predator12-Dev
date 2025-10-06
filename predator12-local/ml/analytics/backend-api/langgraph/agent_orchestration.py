from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint import BaseCheckpointSaver
from langgraph.prebuilt import tools

# Custom imports for Predator Analytics
from ..llm_client import LLMClient
from ..utils.redis_context import RedisContextManager
from ..utils.postgres_context import PostgresContextManager

# Initialize LLM client for remote inference
llm_client = LLMClient()

# Define agent tools
tools = [
    tools.Tool(
        name="DataQuery",
        func=lambda x: PostgresContextManager().query_data(x),
        description="Query data from PostgreSQL database for analysis."
    ),
    tools.Tool(
        name="VectorSearch",
        func=lambda x: RedisContextManager().vector_search(x),
        description="Perform vector search using Qdrant via Redis cache."
    ),
    tools.Tool(
        name="RemoteAnalysis",
        func=lambda x: llm_client.get_analysis(x),
        description="Get analysis from remote LLM API."
    )
]

# Define custom checkpoint saver for context awareness
class ContextCheckpointSaver(BaseCheckpointSaver):
    def __init__(self):
        self.redis_manager = RedisContextManager()
        self.postgres_manager = PostgresContextManager()

    async def get(self, key: str):
        context = await self.redis_manager.get_context(key)
        if not context:
            context = await self.postgres_manager.get_context(key)
        return context

    async def put(self, key: str, value: dict):
        await self.redis_manager.save_context(key, value)
        await self.postgres_manager.save_context(key, value)

# Define agent workflow using LangGraph
def build_agent_workflow():
    workflow = StateGraph()

    # Define tool node for agents to use
    tool_node = ToolNode(tools)
    workflow.add_node("tool", tool_node)

    # Define agent logic with fallback
    def agent_logic(state):
        try:
            # Primary attempt with remote LLM
            result = llm_client.get_analysis(state['query'])
            if result:
                return {"status": "success", "result": result}
        except Exception as e:
            # Fallback to local context or alternative logic
            context = RedisContextManager().get_context(state['session_id'])
            if context:
                return {"status": "fallback", "result": context}
            return {"status": "error", "error": str(e)}

    workflow.add_node("agent", agent_logic)

    # Define edges for workflow
    workflow.add_edge(
        "agent", 
        "tool", 
        should_use_tool=lambda x: x['status'] == 'fallback'
    )
    workflow.add_edge(
        "tool", 
        "agent", 
        should_retry=lambda x: x['status'] == 'error'
    )

    # Set entry point
    workflow.set_entry_point("agent")

    # Compile workflow with checkpointing
    app = workflow.compile(checkpointer=ContextCheckpointSaver())
    return app

# Usage
if __name__ == "__main__":
    agent_app = build_agent_workflow()
    # Example usage with a query
    query_data = {
        "query": "Analyze tender collusion patterns", 
        "session_id": "test_session"
    }
    result = agent_app.run(query_data)
    print(result) 