"""
Orchestrator Leader Election
"""
import asyncio
import random
from typing import Optional
import redis
from datetime import timedelta

class LeaderElection:
    """Redis-based leader election"""
    
    def __init__(self, redis_client: redis.Redis, service_id: str):
        self.redis = redis_client
        self.service_id = service_id
        self.leader_key = "predator:leader"
        self.lease_time = timedelta(seconds=30)
        self.is_leader = False
    
    async def run_election(self):
        """Continuously participate in leader election"""
        while True:
            try:
                await self._attempt_leadership()
                await asyncio.sleep(self.lease_time.total_seconds() * 0.8)
            except Exception as e:
                print(f"Election error: {e}")
                await asyncio.sleep(5 + random.random())
    
    async def _attempt_leadership(self):
        """Try to acquire/renew leadership"""
        acquired = await self.redis.set(
            self.leader_key,
            self.service_id,
            nx=True,
            px=int(self.lease_time.total_seconds() * 1000)
        )
        
        if acquired:
            self.is_leader = True
            return
            
        # Verify if we're still the leader
        current_leader = await self.redis.get(self.leader_key)
        self.is_leader = current_leader == self.service_id
    
    async def get_leader_id(self) -> Optional[str]:
        """Get current leader ID"""
        return await self.redis.get(self.leader_key)

# Usage example:
# election = LeaderElection(redis_client, "orchestrator-1")
# asyncio.create_task(election.run_election())
