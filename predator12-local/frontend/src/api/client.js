"use strict";
// @ts-nocheck
/**
 * API Client for Predator AI Platform
 * Provides methods to interact with backend services
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.APIClient = void 0;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }
    /**
     * Generic fetch wrapper with error handling
     */
    fetch(endpoint, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseURL}${endpoint}`;
            try {
                const response = yield fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers) }));
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error(`API Error (${endpoint}):`, error);
                throw error;
            }
        });
    }
    /**
     * Health check endpoint
     */
    getHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch('/api/health');
        });
    }
    /**
     * Get system statistics
     */
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch('/api/stats');
        });
    }
    /**
     * Get list of available AI models
     */
    getModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch('/api/models');
        });
    }
    /**
     * Get model details
     */
    getModelDetails(modelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch(`/api/models/${modelId}`);
        });
    }
    /**
     * Test model with input
     */
    testModel(modelId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch(`/api/models/${modelId}/test`, {
                method: 'POST',
                body: JSON.stringify({ input }),
            });
        });
    }
    /**
     * Get analytics data
     */
    getAnalytics(timeRange = '24h') {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch(`/api/analytics?range=${timeRange}`);
        });
    }
    /**
     * Get system logs
     */
    getLogs(limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fetch(`/api/logs?limit=${limit}`);
        });
    }
}
exports.APIClient = APIClient;
// Export singleton instance
exports.apiClient = new APIClient();
