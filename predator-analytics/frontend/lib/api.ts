/**
 * API Client for Predator Analytics Backend
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Agents API
export const agentsApi = {
  list: () => apiClient.get('/agents'),
  get: (id: string) => apiClient.get(`/agents/${id}`),
  status: () => apiClient.get('/agents/system/status'),
  execute: (taskData: any) => apiClient.post('/agents/execute', taskData),
};

// Tasks API
export const tasksApi = {
  create: (task: any) => apiClient.post('/tasks', task),
  list: (params?: any) => apiClient.get('/tasks', { params }),
  get: (id: string) => apiClient.get(`/tasks/${id}`),
  getResult: (id: string) => apiClient.get(`/tasks/${id}/result`),
  cancel: (id: string) => apiClient.delete(`/tasks/${id}`),
};

// Analytics API
export const analyticsApi = {
  overview: () => apiClient.get('/analytics/overview'),
  agents: () => apiClient.get('/analytics/agents'),
  timeline: (days: number = 7) => apiClient.get(`/analytics/timeline?days=${days}`),
};

// Voice API
export const voiceApi = {
  textToSpeech: (text: string, options?: any) =>
    apiClient.post('/voice/tts', { text, ...options }),
  speechToText: (audioData: string, language: string = 'uk-UA') =>
    apiClient.post('/voice/stt', { audio_data: audioData, language }),
  listVoices: () => apiClient.get('/voice/voices'),
  health: () => apiClient.get('/voice/health'),
};

// Helper function for chat messages
export async function sendMessage(message: string) {
  try {
    const response = await agentsApi.execute({
      task_type: 'chat',
      data: { message }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export default apiClient;
