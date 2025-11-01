"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAgentWebSocket = void 0;
const agentStore_1 = require("@/stores/agentStore");
const setupAgentWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/api/v1/agents/ws`);
    ws.onopen = () => {
        console.log('Agent WebSocket connected');
    };
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'AGENT_UPDATE') {
            (0, agentStore_1.setAgents)(data.agents);
        }
    };
    ws.onclose = () => {
        console.log('Agent WebSocket disconnected');
        setTimeout(exports.setupAgentWebSocket, 3000);
    };
    return ws;
};
exports.setupAgentWebSocket = setupAgentWebSocket;
