import create from 'zustand';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'degraded' | 'down' | 'starting';
  lastActive: Date;
}

interface AgentState {
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  expectedAgents: number;
  setExpectedAgents: (expectedAgents: number) => void;
}

const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  expectedAgents: 8,
  setAgents: (agents) => set({ agents }),
  setExpectedAgents: (expectedAgents) => set({ expectedAgents }),
}));

export const setAgents = (agents: Agent[]) => {
  useAgentStore.getState().setAgents(agents);
};

export const setExpectedAgents = (expectedAgents: number) => {
  useAgentStore.getState().setExpectedAgents(expectedAgents);
};

export default useAgentStore;
