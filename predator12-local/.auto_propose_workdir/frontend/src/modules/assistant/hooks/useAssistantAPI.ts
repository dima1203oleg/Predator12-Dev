/**
 * useAssistantAPI Hook - Backend API integration
 * Handles intent parsing, execution, graph queries, and alerts
 */

import { useCallback, useState } from 'react';
import { useAssistantStore } from '../state/assistantStore';
import type {
  ParseIntentRequest,
  ParseIntentResponse,
  ExecuteIntentRequest,
  ExecuteIntentResponse,
  GraphNode,
  GraphEdge,
  Alert,
  Language,
} from '../types';

// ============================================================================
// Types
// ============================================================================

interface UseAssistantAPIReturn {
  parseIntent: (text: string, lang: Language) => Promise<ParseIntentResponse | null>;
  executeIntent: (intent: string, entities: any[]) => Promise<ExecuteIntentResponse | null>;
  fetchGraph: (entityId: string) => Promise<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>;
  fetchAlerts: (entityId?: string) => Promise<Alert[] | null>;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Mock Data (for demo/offline mode)
// ============================================================================

const MOCK_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    {
      id: '1',
      label: 'Компанія X',
      type: 'company',
      riskLevel: 'high',
    },
    {
      id: '2',
      label: 'Директор А',
      type: 'person',
      riskLevel: 'medium',
    },
    {
      id: '3',
      label: 'Рахунок Y',
      type: 'account',
      riskLevel: 'low',
    },
    {
      id: '4',
      label: 'Контрагент Z',
      type: 'company',
      riskLevel: 'critical',
    },
  ],
  edges: [
    { id: 'e1', from: '1', to: '2', label: 'Директор', type: 'управління' },
    { id: 'e2', from: '1', to: '3', label: 'Рахунок', type: 'володіє' },
    { id: 'e3', from: '1', to: '4', label: 'Партнер', type: 'співпраця' },
  ],
};

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    entityId: '1',
    entityName: 'Компанія X',
    level: 'high',
    title: 'Підвищений ризик санкцій',
    description: 'Виявлено зв\'язки з компаніями під санкціями',
    source: 'OpenSearch Analytics',
    sourceLink: '#',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'alert-2',
    entityId: '4',
    entityName: 'Контрагент Z',
    level: 'critical',
    title: 'Критичний ризик',
    description: 'Компанія у санкційних списках',
    source: 'OFAC Database',
    sourceLink: '#',
    timestamp: Date.now() - 7200000,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const getAuthToken = (): string | null => {
  // TODO: Get from Keycloak/OIDC
  return localStorage.getItem('access_token');
};

const handleAPIError = (err: any): string => {
  if (err.response) {
    return `API Error: ${err.response.status} - ${err.response.statusText}`;
  }
  if (err.message) {
    return err.message;
  }
  return 'Unknown API error';
};

// ============================================================================
// Hook
// ============================================================================

export function useAssistantAPI(): UseAssistantAPIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { locale } = useAssistantStore();
  const language: Language = locale.startsWith('uk') ? 'uk' : 'en';

  // ============================================================================
  // Parse Intent
  // ============================================================================

  const parseIntent = useCallback(
    async (text: string, lang: Language): Promise<ParseIntentResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        const response = await fetch('/api/assistant/parse_intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ text, lang } as ParseIntentRequest),
        });

        if (!response.ok) {
          throw new Error(`Parse intent failed: ${response.status}`);
        }

        const data: ParseIntentResponse = await response.json();
        console.log('[API] Parse intent success:', data);
        return data;
      } catch (err: any) {
        const errorMsg = handleAPIError(err);
        console.error('[API] Parse intent error:', errorMsg);
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // Execute Intent
  // ============================================================================

  const executeIntent = useCallback(
    async (intent: string, entities: any[]): Promise<ExecuteIntentResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        const response = await fetch('/api/assistant/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ intent, entities } as ExecuteIntentRequest),
        });

        if (!response.ok) {
          throw new Error(`Execute intent failed: ${response.status}`);
        }

        const data: ExecuteIntentResponse = await response.json();
        console.log('[API] Execute intent success:', data);
        return data;
      } catch (err: any) {
        const errorMsg = handleAPIError(err);
        console.error('[API] Execute intent error:', errorMsg);
        setError(errorMsg);

        // Fallback to mock data in demo mode
        console.warn('[API] Using mock data as fallback');
        return {
          answer: 'Демо-режим: показую тестові дані графа та алертів.',
          graph: MOCK_GRAPH,
          alerts: MOCK_ALERTS,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // Fetch Graph
  // ============================================================================

  const fetchGraph = useCallback(
    async (entityId: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] } | null> => {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        const response = await fetch(`/api/graph/entity/${entityId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Fetch graph failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Fetch graph success:', data);
        return data;
      } catch (err: any) {
        const errorMsg = handleAPIError(err);
        console.error('[API] Fetch graph error:', errorMsg);
        setError(errorMsg);

        // Fallback to mock data
        console.warn('[API] Using mock graph data');
        return MOCK_GRAPH;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // Fetch Alerts
  // ============================================================================

  const fetchAlerts = useCallback(async (entityId?: string): Promise<Alert[] | null> => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const url = entityId
        ? `/api/alerts/latest?entity=${entityId}`
        : '/api/alerts/latest';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Fetch alerts failed: ${response.status}`);
      }

      const data = await response.json();
      const alerts: Alert[] = data.items || [];
      console.log('[API] Fetch alerts success:', alerts.length, 'alerts');
      return alerts;
    } catch (err: any) {
      const errorMsg = handleAPIError(err);
      console.error('[API] Fetch alerts error:', errorMsg);
      setError(errorMsg);

      // Fallback to mock data
      console.warn('[API] Using mock alerts data');
      return MOCK_ALERTS;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    parseIntent,
    executeIntent,
    fetchGraph,
    fetchAlerts,
    loading,
    error,
  };
}
