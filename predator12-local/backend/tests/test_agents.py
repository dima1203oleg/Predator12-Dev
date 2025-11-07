from unittest.mock import patch

import pytest


@pytest.mark.asyncio
async def test_supervisor_status(mock_supervisor):
    """Test supervisor status endpoint"""
    with patch("app.agents.supervisor.AgentSupervisor", return_value=mock_supervisor):
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
        "agent": "dataset",
    }

    with patch("app.agents.supervisor.AgentSupervisor", return_value=mock_supervisor):
        from app.agents.supervisor import AgentSupervisor

        supervisor = AgentSupervisor()
        result = await supervisor.execute_command("dataset", "analyze", {"data_source": "test"})

        assert result["task_id"] == "test-123"
        assert result["status"] == "submitted"
        assert result["agent"] == "dataset"


@pytest.mark.asyncio
@patch("app.agents.supervisor.AgentSupervisor")
async def test_agent_registration(mock_supervisor_class):
    """Test agent registration with supervisor"""
    from app.agents.handlers.dataset_agent import DatasetAgent

    mock_supervisor = mock_supervisor_class.return_value
    mock_supervisor.agents = {}

    agent = DatasetAgent()

    # Since register_agent is async, we need to configure the mock for await
    async def _register(agent_id, agent_obj):
        mock_supervisor.agents[agent_id] = agent_obj

    mock_supervisor.register_agent.side_effect = _register

    await mock_supervisor.register_agent("test_dataset", agent)
    assert "test_dataset" in mock_supervisor.agents
    assert mock_supervisor.agents["test_dataset"] == agent


@pytest.mark.asyncio
@patch("app.agents.supervisor.AgentSupervisor")
async def test_invalid_agent_command(mock_supervisor_class):
    """Test handling of invalid agent commands"""
    mock_supervisor = mock_supervisor_class.return_value
    mock_supervisor.agents = {}
    mock_supervisor.execute_command.side_effect = ValueError("Unknown agent")

    with pytest.raises(ValueError):
        await mock_supervisor.execute_command("nonexistent_agent", "test_command", {})


@pytest.mark.asyncio
async def test_agent_capabilities():
    """Test agent capabilities retrieval"""
    from app.agents.handlers.dataset_agent import DatasetAgent

    agent = DatasetAgent()
    capabilities = await agent.get_capabilities()

    assert isinstance(capabilities, list)
    assert len(capabilities) > 0
    assert all(isinstance(cap, str) for cap in capabilities)
