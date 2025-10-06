import { setAgents } from '@/stores/agentStore';

export const setupAgentWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const ws = new WebSocket(`${protocol}//${host}/api/v1/agents/ws`);

  ws.onopen = () => {
    console.log('Agent WebSocket connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'AGENT_UPDATE') {
      setAgents(data.agents);
    }
  };

  ws.onclose = () => {
    console.log('Agent WebSocket disconnected');
    setTimeout(setupAgentWebSocket, 3000);
  };

  return ws;
};
