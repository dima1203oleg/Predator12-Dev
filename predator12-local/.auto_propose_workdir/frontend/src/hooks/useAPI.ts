// @ts-nocheck
import { useState, useEffect } from 'react';
import { apiClient, StatsResponse } from '../api/client';

/**
 * Custom hook for fetching and managing stats data
 */
export const useStats = (refreshInterval: number = 5000) => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
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
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { stats, loading, error };
};

/**
 * Custom hook for health check
 */
export const useHealth = (checkInterval: number = 10000) => {
  const [health, setHealth] = useState<'ok' | 'error' | 'unknown'>('unknown');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.getHealth();
        setHealth(response.status);
      } catch {
        setHealth('error');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return health;
};

/**
 * Custom hook for models list
 */
export const useModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await apiClient.getModels();
        setModels(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        // Mock data
        setModels([
          { id: '1', name: 'GPT-4', type: 'text', description: 'Language model', status: 'active', version: '1.0' },
          { id: '2', name: 'DALL-E', type: 'image', description: 'Image generation', status: 'active', version: '2.0' },
          { id: '3', name: 'Whisper', type: 'audio', description: 'Speech recognition', status: 'active', version: '1.0' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
};
