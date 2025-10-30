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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModels = exports.useHealth = exports.useStats = void 0;
// @ts-nocheck
const react_1 = require("react");
const client_1 = require("../api/client");
/**
 * Custom hook for fetching and managing stats data
 */
const useStats = (refreshInterval = 5000) => {
    const [stats, setStats] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchStats = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield client_1.apiClient.getStats();
                setStats(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch stats');
                // Use mock data if API fails
                setStats({
                    uptime: Math.floor(Date.now() / 1000),
                    requests_total: Math.floor(Math.random() * 10000),
                    requests_per_second: Math.floor(Math.random() * 100),
                    active_models: 15,
                    memory_usage: Math.floor(Math.random() * 80),
                    cpu_usage: Math.floor(Math.random() * 60),
                });
            }
            finally {
                setLoading(false);
            }
        });
        fetchStats();
        const interval = setInterval(fetchStats, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);
    return { stats, loading, error };
};
exports.useStats = useStats;
/**
 * Custom hook for health check
 */
const useHealth = (checkInterval = 10000) => {
    const [health, setHealth] = (0, react_1.useState)('unknown');
    (0, react_1.useEffect)(() => {
        const checkHealth = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield client_1.apiClient.getHealth();
                setHealth(response.status);
            }
            catch (_a) {
                setHealth('error');
            }
        });
        checkHealth();
        const interval = setInterval(checkHealth, checkInterval);
        return () => clearInterval(interval);
    }, [checkInterval]);
    return health;
};
exports.useHealth = useHealth;
/**
 * Custom hook for models list
 */
const useModels = () => {
    const [models, setModels] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchModels = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield client_1.apiClient.getModels();
                setModels(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch models');
                // Mock data
                setModels([
                    { id: '1', name: 'GPT-4', type: 'text', description: 'Language model', status: 'active', version: '1.0' },
                    { id: '2', name: 'DALL-E', type: 'image', description: 'Image generation', status: 'active', version: '2.0' },
                    { id: '3', name: 'Whisper', type: 'audio', description: 'Speech recognition', status: 'active', version: '1.0' },
                ]);
            }
            finally {
                setLoading(false);
            }
        });
        fetchModels();
    }, []);
    return { models, loading, error };
};
exports.useModels = useModels;
