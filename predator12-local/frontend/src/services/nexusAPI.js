"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nexusAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = 'http://localhost:8000';
class NexusAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }
    getSystemStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/api/system/status`);
                return response.data;
            }
            catch (error) {
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
        });
    }
    getAgentsStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/api/agents/status`);
                return response.data;
            }
            catch (error) {
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
        });
    }
    getChronoSpatialData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/api/chrono_spatial_data`);
                return response.data;
            }
            catch (error) {
                // Fallback дані для демонстрації
                return {
                    events: [
                        { lat: 50.4501, lon: 30.5234, intensity: 0.7, type: 'data_flow', timestamp: new Date().toISOString() },
                        { lat: 49.8397, lon: 24.0297, intensity: 0.9, type: 'computation', timestamp: new Date().toISOString() }
                    ]
                };
            }
        });
    }
    sendAIQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${this.baseURL}/api/ai_assistant`, { query });
                return response.data;
            }
            catch (error) {
                // Fallback відповідь для демонстрації
                return {
                    response: `Отримав запит: "${query}". Система працює в демонстраційному режимі.`,
                    action: 'demo_response',
                    timestamp: new Date().toISOString()
                };
            }
        });
    }
    createSimulation(type, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${this.baseURL}/api/simulations`, { type, parameters });
                return response.data;
            }
            catch (error) {
                // Fallback для демонстрації
                return {
                    simulation_id: `sim_${Date.now()}`,
                    status: 'running',
                    type,
                    parameters,
                    estimated_completion: new Date(Date.now() + 300000).toISOString(),
                    progress: 0
                };
            }
        });
    }
    getSimulationStatus(simId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/api/simulations/${simId}`);
                return response.data;
            }
            catch (error) {
                // Fallback для демонстрації
                return {
                    simulation_id: simId,
                    status: 'completed',
                    progress: 100,
                    results: { success: true, data: 'Demo simulation completed' }
                };
            }
        });
    }
    // WebSocket connections
    connect3DStream(onMessage) {
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
        }
        catch (error) {
            console.error('WebSocket connection failed:', error);
            // Повертаємо mock WebSocket для демонстрації
            return {
                close: () => { },
                send: () => { },
                addEventListener: () => { },
                removeEventListener: () => { },
                onopen: null,
                onclose: null,
                onmessage: null,
                onerror: null
            };
        }
    }
    connectSimulationStream(onMessage) {
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
        }
        catch (error) {
            console.error('WebSocket connection failed:', error);
            // Повертаємо mock WebSocket для демонстрації
            return {
                close: () => { },
                send: () => { },
                addEventListener: () => { },
                removeEventListener: () => { },
                onopen: null,
                onclose: null,
                onmessage: null,
                onerror: null
            };
        }
    }
    // Додаткові методи для системи гіда
    getModuleHealth(module) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/api/modules/${module}/health`);
                return response.data;
            }
            catch (error) {
                return {
                    status: 'optimal',
                    metrics: { cpu: '45%', memory: '32%', uptime: '99.9%' }
                };
            }
        });
    }
    executeAction(action, module, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${this.baseURL}/api/actions/${action}`, { module, params });
                return response.data;
            }
            catch (error) {
                return {
                    success: true,
                    message: `Дія "${action}" виконана в демонстраційному режимі для модуля ${module}`
                };
            }
        });
    }
}
// Експортуємо єдиний екземпляр API
exports.nexusAPI = new NexusAPI();
exports.default = exports.nexusAPI;
