/**
 * 🎣 CUSTOM HOOK: useProviders
 *
 * React hook для управління провайдерами та їх даними
 */

import { useState, useEffect, useCallback } from 'react';
import providerAPI from '../services/providerAPI';
import wsService from '../services/websocket';

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

interface UseProvidersReturn {
  // Data
  providers: ProviderAccount[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProviders: () => Promise<void>;
  addProvider: (data: any) => Promise<void>;
  updateProvider: (id: string, data: any) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  toggleProviderStatus: (id: string) => Promise<void>;

  // Real-time
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

// ============= HOOK =============

export const useProviders = (): UseProvidersReturn => {
  const [providers, setProviders] = useState<ProviderAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Завантажити провайдерів з API
   */
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await providerAPI.fetchProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Додати нового провайдера
   */
  const addProvider = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const newProvider = await providerAPI.addProvider(data);
      setProviders(prev => [...prev, newProvider]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Оновити провайдера
   */
  const updateProvider = useCallback(async (id: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await providerAPI.updateProvider(id, data);
      setProviders(prev =>
        prev.map(p => p.id === id ? { ...p, ...updated } : p)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Видалити провайдера
   */
  const deleteProvider = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await providerAPI.deleteProvider(id);
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggle статус провайдера
   */
  const toggleProviderStatus = useCallback(async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    // Optimistic update
    setProviders(prev =>
      prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
    );

    try {
      await providerAPI.toggleProviderStatus(id, !provider.isActive);
    } catch (err) {
      // Revert on error
      setProviders(prev =>
        prev.map(p => p.id === id ? { ...p, isActive: provider.isActive } : p)
      );
      setError(err instanceof Error ? err.message : 'Failed to toggle provider status');
      throw err;
    }
  }, [providers]);

  /**
   * Підписатися на real-time оновлення
   */
  const subscribeToUpdates = useCallback(() => {
    // Subscribe to provider status changes
    wsService.on('provider:status:change', (data: any) => {
      setProviders(prev =>
        prev.map(p =>
          p.id === data.providerId
            ? { ...p, isActive: data.status === 'active' }
            : p
        )
      );
    });

    // Subscribe to stats updates
    wsService.on('provider:stats:update', (data: any) => {
      setProviders(prev =>
        prev.map(p =>
          p.id === data.providerId
            ? { ...p, requestCount: data.stats.totalRequests }
            : p
        )
      );
    });

    wsService.subscribeToOverallStats();
  }, []);

  /**
   * Відписатися від real-time оновлень
   */
  const unsubscribeFromUpdates = useCallback(() => {
    wsService.unsubscribeFromOverallStats();
  }, []);

  /**
   * Завантажити дані при mount
   */
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    toggleProviderStatus,
    subscribeToUpdates,
    unsubscribeFromUpdates
  };
};

export default useProviders;
