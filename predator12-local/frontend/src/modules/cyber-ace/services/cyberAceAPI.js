"use strict";
/**
 * CYBER-ACE API Service
 * =====================
 *
 * Frontend API service для взаємодії з CYBER-ACE backend.
 *
 * Endpoints:
 * - POST /api/cyber-ace/chat - Send text message
 * - POST /api/cyber-ace/voice - Send voice message
 * - GET /api/cyber-ace/agents - Get list of agents
 * - POST /api/cyber-ace/agents/delegate - Delegate task to agent
 * - GET /api/cyber-ace/health - Health check
 *
 * @module cyberAceAPI
 * @version 1.0.0
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
exports.utils = exports.cyberAceAPI = void 0;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CYBER_ACE_BASE = `${API_BASE_URL}/api/cyber-ace`;
// API Service Class
class CyberAceAPI {
    constructor(baseUrl = CYBER_ACE_BASE) {
        this.baseUrl = baseUrl;
    }
    /**
     * Send text message to CYBER-ACE
     */
    chat(message, userId, language = 'uk') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                        user_id: userId,
                        language,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Chat API error:', error);
                throw error;
            }
        });
    }
    /**
     * Send voice message to CYBER-ACE
     */
    voice(audioBlob, language = 'uk-UA') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formData = new FormData();
                formData.append('audio', audioBlob, 'audio.wav');
                const response = yield fetch(`${this.baseUrl}/voice?language=${language}`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Voice API error:', error);
                throw error;
            }
        });
    }
    /**
     * Get list of all agents
     */
    getAgents() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/agents`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Get agents API error:', error);
                throw error;
            }
        });
    }
    /**
     * Delegate task to specific agent
     */
    delegateTask(agentId, taskType, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/agents/delegate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        agent_id: agentId,
                        task_type: taskType,
                        parameters,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Delegate task API error:', error);
                throw error;
            }
        });
    }
    /**
     * Health check
     */
    health() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/health`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Health check API error:', error);
                throw error;
            }
        });
    }
    /**
     * Test connection to backend
     */
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.health();
                return result.status === 'healthy';
            }
            catch (error) {
                console.error('Connection test failed:', error);
                return false;
            }
        });
    }
}
// Singleton instance
exports.cyberAceAPI = new CyberAceAPI();
// Export class for custom instances
exports.default = CyberAceAPI;
// Utility functions
exports.utils = {
    /**
     * Format error message from API error
     */
    formatError(error) {
        var _a, _b;
        if ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) {
            return error.response.data.detail;
        }
        if (error.message) {
            return error.message;
        }
        return 'Unknown error occurred';
    },
    /**
     * Generate unique user ID
     */
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    /**
     * Get stored user ID or create new one
     */
    getUserId() {
        const stored = localStorage.getItem('cyber_ace_user_id');
        if (stored)
            return stored;
        const newId = this.generateUserId();
        localStorage.setItem('cyber_ace_user_id', newId);
        return newId;
    },
};
