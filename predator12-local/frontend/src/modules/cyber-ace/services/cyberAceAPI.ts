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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CYBER_ACE_BASE = `${API_BASE_URL}/api/cyber-ace`;

// Types
export interface ChatMessage {
  message: string;
  user_id: string;
  language: 'uk' | 'en';
}

export interface ChatResponse {
  response: string;
  intent?: string;
  entities?: Record<string, any>;
  confidence: number;
}

export interface Agent {
  id: string;
  name: string;
  specialization: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  tasks_completed: number;
  uptime?: number;
}

export interface AgentTask {
  agent_id: string;
  task_type: string;
  parameters: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  message?: string;
}

// API Service Class
class CyberAceAPI {
  private baseUrl: string;

  constructor(baseUrl: string = CYBER_ACE_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send text message to CYBER-ACE
   */
  async chat(message: string, userId: string, language: 'uk' | 'en' = 'uk'): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_id: userId,
          language,
        } as ChatMessage),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  /**
   * Send voice message to CYBER-ACE
   */
  async voice(audioBlob: Blob, language: 'uk-UA' | 'en-US' = 'uk-UA'): Promise<{ text: string; confidence: number }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const response = await fetch(`${this.baseUrl}/voice?language=${language}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Voice API error:', error);
      throw error;
    }
  }

  /**
   * Get list of all agents
   */
  async getAgents(): Promise<{ agents: Agent[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get agents API error:', error);
      throw error;
    }
  }

  /**
   * Delegate task to specific agent
   */
  async delegateTask(agentId: string, taskType: string, parameters: Record<string, any>): Promise<TaskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/delegate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          task_type: taskType,
          parameters,
        } as AgentTask),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delegate task API error:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string; service: string; version: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check API error:', error);
      throw error;
    }
  }

  /**
   * Test connection to backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.health();
      return result.status === 'healthy';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const cyberAceAPI = new CyberAceAPI();

// Export class for custom instances
export default CyberAceAPI;

// Utility functions
export const utils = {
  /**
   * Format error message from API error
   */
  formatError(error: any): string {
    if (error.response?.data?.detail) {
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
  generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get stored user ID or create new one
   */
  getUserId(): string {
    const stored = localStorage.getItem('cyber_ace_user_id');
    if (stored) return stored;

    const newId = this.generateUserId();
    localStorage.setItem('cyber_ace_user_id', newId);
    return newId;
  },
};
