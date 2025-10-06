"""
Zero-Downtime Configuration Reload
"""
import asyncio
import signal
from typing import Dict, Any
from leader_election import LeaderElection

class GracefulReloader:
    """Handles config reloads without dropping requests"""
    
    def __init__(self, election: LeaderElection):
        self.election = election
        self.active_requests = 0
        self.reload_requested = False
        
    async def handle_reload(self):
        """Coordinate safe reload process"""
        if not self.election.is_leader:
            return
            
        print("Starting graceful reload...")
        self.reload_requested = True
        
        # Wait for active requests to complete
        while self.active_requests > 0:
            await asyncio.sleep(0.5)
            
        # Perform actual reload
        await self._load_new_config()
        self.reload_requested = False
        
    async def request_context(self):
        """Track active requests"""
        if self.reload_requested:
            raise HTTPException(503, "Service reloading")
            
        self.active_requests += 1
        try:
            yield
        finally:
            self.active_requests -= 1
            
    async def _load_new_config(self):
        """Load updated configuration"""
        # Implementation depends on your config system
        pass

# Signal handler example
def register_handlers(reloader: GracefulReloader):
    """Register OS signal handlers"""
    loop = asyncio.get_event_loop()
    
    def handle_sighup():
        asyncio.create_task(reloader.handle_reload())
        
    loop.add_signal_handler(signal.SIGHUP, handle_sighup)
