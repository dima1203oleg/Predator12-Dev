from pydantic import BaseModel
from typing import Dict, Any, Optional


class QueryRequest(BaseModel):
    """
    Model for incoming query requests from users.
    """
    query_text: str
    context: Optional[Dict[str, Any]] = None
    language: str = 'uk'


class QueryResponse(BaseModel):
    """
    Model for responses to user queries, including the original query,
    execution plan, and results.
    """
    query_id: str
    original_query: str
    plan: Dict[str, Any]
    results: Dict[str, Any]
    status: str 