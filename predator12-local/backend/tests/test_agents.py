import pytest
from unittest.mock import AsyncMock, patch
import asyncio


@pytest.mark.asyncio
async def test_supervisor_status(mock_supervisor):
    """Test supervisor status endpoint"""
    with patch('app.agents.supervisor.AgentSupervisor', return_value=mock_supervisor):
        from app.agents.supervisor import AgentSupervisor
        
        supervisor = AgentSupervisor()
        status = await supervisor.get_status()
        
        assert status["status"] == "operational"
        assert "agents" in status
        assert len(status["agents"]) > 0


@pytest.mark.asyncio 
async def test_supervisor_execute_command(mock_supervisor):
    """Test supervisor command execution"""
    mock_supervisor.execute_command.return_value = {
        "task_id": "test-123",
        "status": "submitted",
        "agent": "dataset"
    }
    
    with patch('app.agents.supervisor.AgentSupervisor', return_value=mock_supervisor):
        from app.agents.supervisor import AgentSupervisor
        
        supervisor = AgentSupervisor()
        result = await supervisor.execute_command("dataset", "analyze", {"data_source": "test"})
        
        assert result["task_id"] == "test-123"
        assert result["status"] == "submitted"
        assert result["agent"] == "dataset"


@pytest.mark.asyncio
async def test_agent_registration():
    """Test agent registration with supervisor"""
    from app.agents.supervisor import AgentSupervisor
    from app.agents.handlers.dataset_agent import DatasetAgent
    
    supervisor = AgentSupervisor()
    agent = DatasetAgent()
    
    supervisor.register_agent("test_dataset", agent)
    assert "test_dataset" in supervisor.agents
    assert supervisor.agents["test_dataset"] == agent


@pytest.mark.asyncio
async def test_invalid_agent_command():
    """Test handling of invalid agent commands"""
    from app.agents.supervisor import AgentSupervisor
    
    supervisor = AgentSupervisor()
    
    with pytest.raises(ValueError):
        await supervisor.execute_command("nonexistent_agent", "test_command", {})


@pytest.mark.asyncio
async def test_agent_capabilities():
    """Test agent capabilities retrieval"""
    from app.agents.handlers.dataset_agent import DatasetAgent
    
    agent = DatasetAgent()
    capabilities = await agent.get_capabilities()
    
    assert isinstance(capabilities, list)
    assert len(capabilities) > 0
    assert all(isinstance(cap, str) for cap in capabilities)
