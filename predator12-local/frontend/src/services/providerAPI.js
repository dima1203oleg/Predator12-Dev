"use strict";
/**
 * 🔌 PROVIDER API SERVICE
 *
 * Frontend service для взаємодії з Backend API
 */
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
exports.toggleProviderStatus = exports.fetchOverallStats = exports.fetchProviderStats = exports.testConnection = exports.saveModelConfig = exports.fetchProviderModels = exports.deleteProvider = exports.updateProvider = exports.addProvider = exports.fetchProviders = void 0;
const axios_1 = __importDefault(require("axios"));
// ============= CONFIGURATION =============
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const api = axios_1.default.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Request interceptor для додавання auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor для обробки помилок
api.interceptors.response.use((response) => response, (error) => {
    var _a;
    if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        // Redirect to login
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
// ============= API FUNCTIONS =============
/**
 * Отримати список всіх провайдерів
 */
const fetchProviders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/providers');
        return response.data;
    }
    catch (error) {
        console.error('Error fetching providers:', error);
        throw new Error('Failed to fetch providers');
    }
});
exports.fetchProviders = fetchProviders;
/**
 * Додати новий Provider Account
 */
const addProvider = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield api.post('/providers', data);
        return response.data;
    }
    catch (error) {
        console.error('Error adding provider:', error);
        if (axios_1.default.isAxiosError(error) && ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error)) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Failed to add provider');
    }
});
exports.addProvider = addProvider;
/**
 * Оновити Provider Account
 */
const updateProvider = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.put(`/providers/${id}`, data);
        return response.data;
    }
    catch (error) {
        console.error('Error updating provider:', error);
        throw new Error('Failed to update provider');
    }
});
exports.updateProvider = updateProvider;
/**
 * Видалити Provider Account
 */
const deleteProvider = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield api.delete(`/providers/${id}`);
    }
    catch (error) {
        console.error('Error deleting provider:', error);
        throw new Error('Failed to delete provider');
    }
});
exports.deleteProvider = deleteProvider;
/**
 * Отримати моделі для Provider Account
 */
const fetchProviderModels = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get(`/providers/${providerId}/models`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching models:', error);
        throw new Error('Failed to fetch models');
    }
});
exports.fetchProviderModels = fetchProviderModels;
/**
 * Зберегти конфігурацію моделі
 */
const saveModelConfig = (providerId, config) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post(`/providers/${providerId}/models/config`, config);
        return response.data;
    }
    catch (error) {
        console.error('Error saving model config:', error);
        throw new Error('Failed to save model configuration');
    }
});
exports.saveModelConfig = saveModelConfig;
/**
 * Тестувати підключення до провайдера
 */
const testConnection = (providerId, modelId, testPrompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post(`/providers/${providerId}/test`, { modelId, testPrompt });
        return response.data;
    }
    catch (error) {
        console.error('Error testing connection:', error);
        return {
            success: false,
            message: 'Connection test failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});
exports.testConnection = testConnection;
/**
 * Отримати статистику для провайдера
 */
const fetchProviderStats = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get(`/providers/${providerId}/stats`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching provider stats:', error);
        throw new Error('Failed to fetch provider statistics');
    }
});
exports.fetchProviderStats = fetchProviderStats;
/**
 * Отримати загальну статистику
 */
const fetchOverallStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/providers/stats/overall');
        return response.data;
    }
    catch (error) {
        console.error('Error fetching overall stats:', error);
        throw new Error('Failed to fetch overall statistics');
    }
});
exports.fetchOverallStats = fetchOverallStats;
/**
 * Toggle активність провайдера
 */
const toggleProviderStatus = (id, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.updateProvider)(id, { isActive });
});
exports.toggleProviderStatus = toggleProviderStatus;
// ============= EXPORT =============
const providerAPI = {
    fetchProviders: exports.fetchProviders,
    addProvider: exports.addProvider,
    updateProvider: exports.updateProvider,
    deleteProvider: exports.deleteProvider,
    fetchProviderModels: exports.fetchProviderModels,
    saveModelConfig: exports.saveModelConfig,
    testConnection: exports.testConnection,
    fetchProviderStats: exports.fetchProviderStats,
    fetchOverallStats: exports.fetchOverallStats,
    toggleProviderStatus: exports.toggleProviderStatus
};
exports.default = providerAPI;
