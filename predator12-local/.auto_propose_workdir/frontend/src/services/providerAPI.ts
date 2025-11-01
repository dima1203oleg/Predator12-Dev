/**
 * 🔌 PROVIDER API SERVICE
 *
 * Frontend service для взаємодії з Backend API
 */

import axios, { AxiosError } from 'axios';

// ============= TYPES =============

interface ProviderAccount {
  id: string;
  providerName: string;
  accountName: string;
  apiKey: string;
  apiEndpoint?: string;
  isActive: boolean;
  addedAt: string;
  lastUsed?: string;
  requestCount?: number;
  models?: string[];
}

interface ModelConfig {
  modelId: string;
  config: {
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  message?: string;
  error?: string;
}

interface ProviderStats {
  providerId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  totalTokens: number;
  estimatedCost: number;
  lastUpdated: string;
  topModel?: {
    id: string;
    name: string;
    requests: number;
  };
}

interface OverallStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgLatency: number;
  totalCost: number;
  lastUpdated: string;
  providers: Array<{
    id: string;
    name: string;
    requests: number;
    successRate: number;
  }>;
}

// ============= CONFIGURATION =============

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor для додавання auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обробки помилок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= API FUNCTIONS =============

/**
 * Отримати список всіх провайдерів
 */
export const fetchProviders = async (): Promise<ProviderAccount[]> => {
  try {
    const response = await api.get<ProviderAccount[]>('/providers');
    return response.data;
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw new Error('Failed to fetch providers');
  }
};

/**
 * Додати новий Provider Account
 */
export const addProvider = async (data: {
  providerId: string;
  accountName: string;
  apiKey: string;
  apiEndpoint?: string;
  models?: string[];
}): Promise<ProviderAccount> => {
  try {
    const response = await api.post<ProviderAccount>('/providers', data);
    return response.data;
  } catch (error) {
    console.error('Error adding provider:', error);
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to add provider');
  }
};

/**
 * Оновити Provider Account
 */
export const updateProvider = async (
  id: string,
  data: Partial<ProviderAccount>
): Promise<ProviderAccount> => {
  try {
    const response = await api.put<ProviderAccount>(`/providers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating provider:', error);
    throw new Error('Failed to update provider');
  }
};

/**
 * Видалити Provider Account
 */
export const deleteProvider = async (id: string): Promise<void> => {
  try {
    await api.delete(`/providers/${id}`);
  } catch (error) {
    console.error('Error deleting provider:', error);
    throw new Error('Failed to delete provider');
  }
};

/**
 * Отримати моделі для Provider Account
 */
export const fetchProviderModels = async (providerId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/providers/${providerId}/models`);
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw new Error('Failed to fetch models');
  }
};

/**
 * Зберегти конфігурацію моделі
 */
export const saveModelConfig = async (
  providerId: string,
  config: ModelConfig
): Promise<{ success: boolean; config: ModelConfig }> => {
  try {
    const response = await api.post(`/providers/${providerId}/models/config`, config);
    return response.data;
  } catch (error) {
    console.error('Error saving model config:', error);
    throw new Error('Failed to save model configuration');
  }
};

/**
 * Тестувати підключення до провайдера
 */
export const testConnection = async (
  providerId: string,
  modelId: string,
  testPrompt?: string
): Promise<ConnectionTestResult> => {
  try {
    const response = await api.post<ConnectionTestResult>(
      `/providers/${providerId}/test`,
      { modelId, testPrompt }
    );
    return response.data;
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Отримати статистику для провайдера
 */
export const fetchProviderStats = async (providerId: string): Promise<ProviderStats> => {
  try {
    const response = await api.get<ProviderStats>(`/providers/${providerId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    throw new Error('Failed to fetch provider statistics');
  }
};

/**
 * Отримати загальну статистику
 */
export const fetchOverallStats = async (): Promise<OverallStats> => {
  try {
    const response = await api.get<OverallStats>('/providers/stats/overall');
    return response.data;
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    throw new Error('Failed to fetch overall statistics');
  }
};

/**
 * Toggle активність провайдера
 */
export const toggleProviderStatus = async (
  id: string,
  isActive: boolean
): Promise<ProviderAccount> => {
  return updateProvider(id, { isActive });
};

// ============= EXPORT =============

const providerAPI = {
  fetchProviders,
  addProvider,
  updateProvider,
  deleteProvider,
  fetchProviderModels,
  saveModelConfig,
  testConnection,
  fetchProviderStats,
  fetchOverallStats,
  toggleProviderStatus
};

export default providerAPI;
