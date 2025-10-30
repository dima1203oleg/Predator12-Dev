/**
 * 📡 WEBSOCKET SERVICE
 *
 * Real-time updates для статистики провайдерів
 */

import { io, Socket } from 'socket.io-client';

// ============= TYPES =============

interface ProviderStatsUpdate {
  providerId: string;
  stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgLatency: number;
    estimatedCost: number;
  };
}

interface ProviderStatusChange {
  providerId: string;
  status: 'active' | 'inactive' | 'error';
  message?: string;
}

interface ModelRequestComplete {
  providerId: string;
  modelId: string;
  latency: number;
  tokens: number;
  cost: number;
  success: boolean;
}

type WebSocketEventHandler = (data: any) => void;

// ============= CONFIGURATION =============

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Підключитися до WebSocket сервера
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = localStorage.getItem('auth_token');

    this.socket = io(WS_URL, {
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
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Перевірити статус підключення
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Налаштувати обробники подій
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

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
    this.socket.on('provider:stats:update', (data: ProviderStatsUpdate) => {
      this.emitToHandlers('provider:stats:update', data);
    });

    this.socket.on('provider:status:change', (data: ProviderStatusChange) => {
      this.emitToHandlers('provider:status:change', data);
    });

    this.socket.on('model:request:complete', (data: ModelRequestComplete) => {
      this.emitToHandlers('model:request:complete', data);
    });
  }

  /**
   * Підписатися на подію
   */
  on(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    // Повернути функцію для відписки
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Відписатися від події
   */
  off(event: string, handler: WebSocketEventHandler): void {
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
  private emitToHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Надіслати подію на сервер
   */
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }

  /**
   * Підписатися на оновлення статистики провайдера
   */
  subscribeToProviderStats(providerId: string): void {
    this.emit('subscribe:provider:stats', { providerId });
  }

  /**
   * Відписатися від оновлень статистики провайдера
   */
  unsubscribeFromProviderStats(providerId: string): void {
    this.emit('unsubscribe:provider:stats', { providerId });
  }

  /**
   * Підписатися на загальні оновлення статистики
   */
  subscribeToOverallStats(): void {
    this.emit('subscribe:overall:stats', {});
  }

  /**
   * Відписатися від загальних оновлень статистики
   */
  unsubscribeFromOverallStats(): void {
    this.emit('unsubscribe:overall:stats', {});
  }
}

// ============= SINGLETON INSTANCE =============

const wsService = new WebSocketService();

export default wsService;

// ============= REACT HOOK =============

/**
 * React Hook для використання WebSocket
 */
export const useWebSocket = () => {
  const connect = () => wsService.connect();
  const disconnect = () => wsService.disconnect();
  const isConnected = () => wsService.isConnected();
  const on = (event: string, handler: WebSocketEventHandler) => wsService.on(event, handler);
  const emit = (event: string, data: any) => wsService.emit(event, data);

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
