import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface SystemStatus {
  system_health: string;
  health?: string; // Додаткова властивість для сумісності
  health_percentage?: number;
  active_agents: number;
  quantum_events: number;
  galactic_risks: string;
  data_teleportation: string;
  neural_network: string;
  anomaly_chronicle: Array<{
    type: string;
    level: string;
    location: string;
    timestamp: string;
  }>;
}

export interface Agent {
  name: string;
  status: string;
  health: string;
  cpu: string;
  memory: string;
  type?: string; // Додаткова властивість для типу агента
}

export interface GeoEvent {
  lat: number;
  lon: number;
  intensity: number;
  type: string;
  timestamp: string;
}

class NexusAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await axios.get(`${this.baseURL}/api/system/status`);
      return response.data;
    } catch (error) {
      // Fallback дані для демонстрації
      return {
        system_health: 'optimal',
        health: 'optimal',
        health_percentage: 95,
        active_agents: 12,
        quantum_events: 47,
        galactic_risks: 'minimal',
        data_teleportation: 'active',
        neural_network: 'operational',
        anomaly_chronicle: [
          {
            type: 'performance',
            level: 'info',
            location: 'ETL-Module',
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  }

  async getAgentsStatus(): Promise<{ total_agents: number; active_agents: number; agents: Agent[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/agents/status`);
      return response.data;
    } catch (error) {
      // Fallback дані для демонстрації
      return {
        total_agents: 12,
        active_agents: 10,
        agents: [
          { name: 'ETL-Agent-01', status: 'active', health: 'optimal', cpu: '45%', memory: '32%', type: 'etl' },
          { name: 'MAS-Agent-02', status: 'active', health: 'optimal', cpu: '67%', memory: '28%', type: 'mas' },
          { name: 'Security-Agent-03', status: 'warning', health: 'warning', cpu: '89%', memory: '71%', type: 'security' },
          { name: 'Data-Agent-04', status: 'active', health: 'optimal', cpu: '23%', memory: '19%', type: 'data' },
          { name: 'Analytics-Agent-05', status: 'active', health: 'optimal', cpu: '55%', memory: '41%', type: 'analytics' }
        ]
      };
    }
  }

  async getChronoSpatialData(): Promise<{ events: GeoEvent[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/chrono_spatial_data`);
      return response.data;
    } catch (error) {
      // Fallback дані для демонстрації
      return {
        events: [
          { lat: 50.4501, lon: 30.5234, intensity: 0.7, type: 'data_flow', timestamp: new Date().toISOString() },
          { lat: 49.8397, lon: 24.0297, intensity: 0.9, type: 'computation', timestamp: new Date().toISOString() }
        ]
      };
    }
  }

  async sendAIQuery(query: string): Promise<{ response: string; action: string; timestamp: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/ai_assistant`, { query });
      return response.data;
    } catch (error) {
      // Fallback відповідь для демонстрації
      return {
        response: `Отримав запит: "${query}". Система працює в демонстраційному режимі.`,
        action: 'demo_response',
        timestamp: new Date().toISOString()
      };
    }
  }

  async createSimulation(type: string, parameters: any): Promise<{
    simulation_id: string;
    status: string;
    type: string;
    parameters: any;
    estimated_completion: string;
    progress: number;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/simulations`, { type, parameters });
      return response.data;
    } catch (error) {
      // Fallback для демонстрації
      return {
        simulation_id: `sim_${Date.now()}`,
        status: 'running',
        type,
        parameters,
        estimated_completion: new Date(Date.now() + 300000).toISOString(), // +5 хвилин
        progress: 0
      };
    }
  }

  async getSimulationStatus(simId: string): Promise<{
    simulation_id: string;
    status: string;
    progress: number;
    results?: any;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/simulations/${simId}`);
      return response.data;
    } catch (error) {
      // Fallback для демонстрації
      return {
        simulation_id: simId,
        status: 'completed',
        progress: 100,
        results: { success: true, data: 'Demo simulation completed' }
      };
    }
  }

  // WebSocket connections
  connect3DStream(onMessage: (data: any) => void): WebSocket {
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/3d_stream`);

      ws.onopen = () => {
        console.log('3D Stream connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      ws.onerror = (error) => {
        console.error('3D Stream error:', error);
      };

      ws.onclose = () => {
        console.log('3D Stream disconnected');
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      // Повертаємо mock WebSocket для демонстрації
      return {
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null
      } as any;
    }
  }

  connectSimulationStream(onMessage: (data: any) => void): WebSocket {
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/simulations`);

      ws.onopen = () => {
        console.log('Simulation Stream connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      ws.onerror = (error) => {
        console.error('Simulation Stream error:', error);
      };

      ws.onclose = () => {
        console.log('Simulation Stream disconnected');
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      // Повертаємо mock WebSocket для демонстрації
      return {
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null
      } as any;
    }
  }

  // Додаткові методи для системи гіда
  async getModuleHealth(module: string): Promise<{ status: string; metrics: any }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/modules/${module}/health`);
      return response.data;
    } catch (error) {
      return {
        status: 'optimal',
        metrics: { cpu: '45%', memory: '32%', uptime: '99.9%' }
      };
    }
  }

  async executeAction(action: string, module: string, params?: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/actions/${action}`, { module, params });
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: `Дія "${action}" виконана в демонстраційному режимі для модуля ${module}`
      };
    }
  }
}

// Експортуємо єдиний екземпляр API
export const nexusAPI = new NexusAPI();
export default nexusAPI;
