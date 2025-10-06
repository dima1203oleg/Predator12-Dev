import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://backend:8000';
class NexusAPI {
    constructor() {
        Object.defineProperty(this, "baseURL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseURL = API_BASE_URL;
    }
    async getSystemStatus() {
        const response = await axios.get(`${this.baseURL}/api/system/status`);
        return response.data;
    }
    async getAgentsStatus() {
        const response = await axios.get(`${this.baseURL}/api/agents/status`);
        return response.data;
    }
    async getChronoSpatialData() {
        const response = await axios.get(`${this.baseURL}/api/chrono_spatial_data`);
        return response.data;
    }
    async sendAIQuery(query) {
        const response = await axios.post(`${this.baseURL}/api/ai_assistant`, { query });
        return response.data;
    }
    async createSimulation(type, parameters) {
        const response = await axios.post(`${this.baseURL}/api/simulations`, { type, parameters });
        return response.data;
    }
    async getSimulationStatus(simId) {
        const response = await axios.get(`${this.baseURL}/api/simulations/${simId}`);
        return response.data;
    }
}
// Експортуємо єдиний екземпляр API
export const nexusAPI = new NexusAPI();
export default nexusAPI;
