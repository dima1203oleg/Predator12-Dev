"""
OpenSearch Query Caching Layer
"""
from typing import Dict, Any
import hashlib
import json
from tiered_cache import TieredCache

class OpenSearchCache:
    """Cache for frequent OpenSearch queries"""
    
    def __init__(self, redis_client):
        self.cache = TieredCache(
            redis_client=redis_client,
            memory_ttl=60,   # 1 minute
            redis_ttl=3600   # 1 hour
        )
    
    def _get_cache_key(self, index: str, query: Dict[str, Any]) -> str:
        """Generate consistent cache key"""
        query_str = json.dumps(query, sort_keys=True)
        return f"opensearch:{index}:{hashlib.md5(query_str.encode()).hexdigest()}"
    
    async def execute_cached_query(self, index: str, query: Dict[str, Any], executor: callable):
        """Execute query with caching"""
        cache_key = self._get_cache_key(index, query)
        
        @self.cache.cached
        async def cached_query_execution():
            return await executor(index, query)
            
        return await cached_query_execution()

    async def warm_cache(self, common_queries: Dict[str, list]):
        """Pre-warm frequent queries"""
        for index, queries in common_queries.items():
            for query in queries:
                await self.execute_cached_query(index, query, lambda i,q: None)
