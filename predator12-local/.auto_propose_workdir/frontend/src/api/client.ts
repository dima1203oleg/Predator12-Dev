// @ts-nocheck
/**
 * API Client for Predator AI Platform
 * Provides methods to interact with backend services
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async getHealth() {
    return this.fetch('/api/health');
  }

  /**
   * Get system statistics
   */
  async getStats() {
    return this.fetch('/api/stats');
  }

  /**
   * Get list of available AI models
   */
  async getModels() {
    return this.fetch('/api/models');
  }

  /**
   * Get model details
   */
  async getModelDetails(modelId: string) {
    return this.fetch(`/api/models/${modelId}`);
  }

  /**
   * Test model with input
   */
  async testModel(modelId: string, input: any) {
    return this.fetch(`/api/models/${modelId}/test`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange: string = '24h') {
    return this.fetch(`/api/analytics?range=${timeRange}`);
  }

  /**
   * Get system logs
   */
  async getLogs(limit: number = 100) {
    return this.fetch(`/api/logs?limit=${limit}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface StatsResponse {
  uptime: number;
  requests_total: number;
  requests_per_second: number;
  active_models: number;
  memory_usage: number;
  cpu_usage: number;
}

export interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'inactive';
  version: string;
}
