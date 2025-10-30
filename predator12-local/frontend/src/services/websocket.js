"use strict";
/**
 * 📡 WEBSOCKET SERVICE
 *
 * Real-time updates для статистики провайдерів
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocket = void 0;
const socket_io_client_1 = require("socket.io-client");
// ============= CONFIGURATION =============
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
class WebSocketService {
    constructor() {
        this.socket = null;
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
    /**
     * Підключитися до WebSocket сервера
     */
    connect() {
        var _a;
        if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) {
            console.log('WebSocket already connected');
            return;
        }
        const token = localStorage.getItem('auth_token');
        this.socket = (0, socket_io_client_1.io)(WS_URL, {
            auth: {
                token
            },
            reconnection: true,
            reconnectionDelay: this.reconnectDelay,
            reconnectionAttempts: this.maxReconnectAttempts
        });
        this.setupEventListeners();
    }
    /**
     * Відключитися від WebSocket сервера
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('WebSocket disconnected');
        }
    }
    /**
     * Перевірити статус підключення
     */
    isConnected() {
        var _a;
        return ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) || false;
    }
    /**
     * Налаштувати обробники подій
     */
    setupEventListeners() {
        if (!this.socket)
            return;
        // Connection events
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.emitToHandlers('connection:established', { connected: true });
        });
        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.emitToHandlers('connection:lost', { reason });
        });
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnectAttempts++;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.emitToHandlers('connection:failed', { error: 'Max reconnection attempts reached' });
            }
        });
        // Provider events
        this.socket.on('provider:stats:update', (data) => {
            this.emitToHandlers('provider:stats:update', data);
        });
        this.socket.on('provider:status:change', (data) => {
            this.emitToHandlers('provider:status:change', data);
        });
        this.socket.on('model:request:complete', (data) => {
            this.emitToHandlers('model:request:complete', data);
        });
    }
    /**
     * Підписатися на подію
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
        // Повернути функцію для відписки
        return () => {
            this.off(event, handler);
        };
    }
    /**
     * Відписатися від події
     */
    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.eventHandlers.delete(event);
            }
        }
    }
    /**
     * Викликати всі обробники події
     */
    emitToHandlers(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error(`Error in handler for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Надіслати подію на сервер
     */
    emit(event, data) {
        var _a;
        if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) {
            this.socket.emit(event, data);
        }
        else {
            console.warn('Cannot emit event: WebSocket not connected');
        }
    }
    /**
     * Підписатися на оновлення статистики провайдера
     */
    subscribeToProviderStats(providerId) {
        this.emit('subscribe:provider:stats', { providerId });
    }
    /**
     * Відписатися від оновлень статистики провайдера
     */
    unsubscribeFromProviderStats(providerId) {
        this.emit('unsubscribe:provider:stats', { providerId });
    }
    /**
     * Підписатися на загальні оновлення статистики
     */
    subscribeToOverallStats() {
        this.emit('subscribe:overall:stats', {});
    }
    /**
     * Відписатися від загальних оновлень статистики
     */
    unsubscribeFromOverallStats() {
        this.emit('unsubscribe:overall:stats', {});
    }
}
// ============= SINGLETON INSTANCE =============
const wsService = new WebSocketService();
exports.default = wsService;
// ============= REACT HOOK =============
/**
 * React Hook для використання WebSocket
 */
const useWebSocket = () => {
    const connect = () => wsService.connect();
    const disconnect = () => wsService.disconnect();
    const isConnected = () => wsService.isConnected();
    const on = (event, handler) => wsService.on(event, handler);
    const emit = (event, data) => wsService.emit(event, data);
    return {
        connect,
        disconnect,
        isConnected,
        on,
        emit,
        subscribeToProviderStats: wsService.subscribeToProviderStats.bind(wsService),
        unsubscribeFromProviderStats: wsService.unsubscribeFromProviderStats.bind(wsService),
        subscribeToOverallStats: wsService.subscribeToOverallStats.bind(wsService),
        unsubscribeFromOverallStats: wsService.unsubscribeFromOverallStats.bind(wsService)
    };
};
exports.useWebSocket = useWebSocket;
