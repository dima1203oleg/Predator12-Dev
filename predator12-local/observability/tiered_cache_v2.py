"""
Advanced Tiered Cache with:
- Size-based eviction
- Cost awareness
- Hot key detection
"""
from typing import Dict, Any, Optional
import heapq
import time

class AdvancedTieredCache:
    """Enhanced caching strategy"""
    
    def __init__(self, 
                max_memory_size: int = 1000000, # ~1MB
                max_item_cost: int = 100):
        self.memory_cache: Dict[str, Dict] = {}
        self.max_memory_size = max_memory_size
        self.current_size = 0
        self.cost_weights: Dict[str, float] = {}
        self.hot_keys = set()
        
    def _get_cache_key(self, func, args, kwargs) -> str:
        """Generate consistent cache key"""
        # Existing implementation
        
    def _evict_if_needed(self):
        """LRU eviction when nearing size limit"""
        if self.current_size < self.max_memory_size:
            return
            
        # Evict 10% oldest/least valuable
        to_evict = sorted(
            self.memory_cache.items(),
            key=lambda x: x[1]['last_used'] * self.cost_weights.get(x[0], 1)
        )[:len(self.memory_cache)//10]
        
        for key, _ in to_evict:
            self.current_size -= len(self.memory_cache[key]['value'])
            del self.memory_cache[key]
    
    def cached(self, cost_weight: float = 1.0, track_hot: bool = False):
        """Decorator with cost awareness"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                key = self._get_cache_key(func, args, kwargs)
                self.cost_weights[key] = cost_weight
                
                if track_hot:
                    self.hot_keys.add(key)
                
                # Existing caching logic
                
            return wrapper
        return decorator
    
    def get_hot_keys(self) -> set:
        """Get frequently accessed keys"""
        return self.hot_keys
