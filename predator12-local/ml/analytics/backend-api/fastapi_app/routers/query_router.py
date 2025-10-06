from fastapi import APIRouter, HTTPException, status, Depends, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import json
import hashlib
from datetime import datetime

from services.query_planner import QueryPlannerAgent
from models.query import QueryResponse
from dependencies import get_current_user, get_redis_client, get_db_session
from database.models import QueryHistory


router = APIRouter(prefix='/api/v2', tags=['query'])


# Setup logging
logger = logging.getLogger(__name__)


class QueryInput(BaseModel):
    query_text: str
    context: Optional[Dict[str, Any]] = None
    language: str = 'uk'


@router.post('/query', response_model=QueryResponse)
async def process_user_query(
    query_data: QueryInput = Body(...),
    user: Dict[str, Any] = Depends(get_current_user),
    redis_client=Depends(get_redis_client),
    db_session=Depends(get_db_session)
):
    """
    Process a user query, decompose it into subtasks using QueryPlannerAgent,
    and return results. Cache in Redis and store history in PostgreSQL.
    """
    try:
        logger.info(
            f"Processing query from user {user.get('id', 'anonymous')}: "
            f"{query_data.query_text[:50]}..."
        )
        
        # Generate a cache key based on query text and user context
        cache_key = generate_cache_key(
            query_data.query_text, 
            query_data.context or {}, 
            user.get('id', 'anonymous')
        )
        
        # Check if the result is cached in Redis
        cached_result = await redis_client.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for query key {cache_key}")
            return QueryResponse.parse_obj(json.loads(cached_result))
        
        # Initialize the QueryPlannerAgent (assuming it's injectable
        # or can be instantiated)
        planner = QueryPlannerAgent()
        
        # Decompose the query into subtasks
        query_plan = await planner.decompose_query(
            query_text=query_data.query_text,
            user_context=query_data.context or {},
            language=query_data.language,
            user_id=user.get('id')
        )
        
        if not query_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to decompose query into actionable subtasks."
            )
        
        # Execute the plan (this could be a placeholder for actual execution)
        execution_result = await planner.execute_plan(query_plan)
        
        # Format the response
        response = QueryResponse(
            query_id=query_plan.get('query_id', 'N/A'),
            original_query=query_data.query_text,
            plan=query_plan,
            results=execution_result,
            status='completed'
        )
        
        # Cache the response in Redis with a TTL of 1 hour
        await redis_client.setex(
            name=cache_key,
            time=3600,  # 1 hour TTL
            value=response.json()
        )
        logger.info(f"Cached response for query key {cache_key}")
        
        # Store query history in PostgreSQL
        await store_query_history(
            db_session=db_session,
            user_id=user.get('id', 'anonymous'),
            query_text=query_data.query_text,
            query_plan=query_plan,
            results=execution_result
        )
        
        logger.info(
            f"Query processed successfully for user "
            f"{user.get('id', 'anonymous')}, query_id: {response.query_id}"
        )
        return response
    
    except Exception as e:
        logger.error(
            f"Error processing query for user "
            f"{user.get('id', 'anonymous')}: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )


def generate_cache_key(
    query_text: str, 
    context: Dict[str, Any], 
    user_id: str
) -> str:
    """
    Generate a unique cache key based on query text, context, and user ID.
    """
    context_str = json.dumps(context, sort_keys=True)
    key_str = f"query:{user_id}:{query_text}:{context_str}"
    return hashlib.sha256(key_str.encode()).hexdigest()


async def store_query_history(
    db_session,
    user_id: str,
    query_text: str,
    query_plan: Dict[str, Any],
    results: Dict[str, Any]
):
    """
    Store the query history in PostgreSQL for audit and analysis purposes.
    """
    try:
        query_record = QueryHistory(
            user_id=user_id,
            query_text=query_text,
            query_plan=query_plan,
            results=results,
            created_at=datetime.utcnow()
        )
        db_session.add(query_record)
        await db_session.commit()
        logger.info(f"Stored query history for user {user_id}")
    except Exception as e:
        await db_session.rollback()
        logger.error(
            f"Failed to store query history for user {user_id}: "
            f"{str(e)}"
        ) 