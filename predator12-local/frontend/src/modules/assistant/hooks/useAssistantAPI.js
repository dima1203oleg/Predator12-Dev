"use strict";
/**
 * useAssistantAPI Hook - Backend API integration
 * Handles intent parsing, execution, graph queries, and alerts
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
exports.useAssistantAPI = void 0;
const react_1 = require("react");
const assistantStore_1 = require("../state/assistantStore");
// ============================================================================
// Mock Data (for demo/offline mode)
// ============================================================================
const MOCK_GRAPH = {
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
const MOCK_ALERTS = [
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
const getAuthToken = () => {
    // TODO: Get from Keycloak/OIDC
    return localStorage.getItem('access_token');
};
const handleAPIError = (err) => {
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
function useAssistantAPI() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const { locale } = (0, assistantStore_1.useAssistantStore)();
    const language = locale.startsWith('uk') ? 'uk' : 'en';
    // ============================================================================
    // Parse Intent
    // ============================================================================
    const parseIntent = (0, react_1.useCallback)((text, lang) => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            const response = yield fetch('/api/assistant/parse_intent', {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` })),
                body: JSON.stringify({ text, lang }),
            });
            if (!response.ok) {
                throw new Error(`Parse intent failed: ${response.status}`);
            }
            const data = yield response.json();
            console.log('[API] Parse intent success:', data);
            return data;
        }
        catch (err) {
            const errorMsg = handleAPIError(err);
            console.error('[API] Parse intent error:', errorMsg);
            setError(errorMsg);
            return null;
        }
        finally {
            setLoading(false);
        }
    }), []);
    // ============================================================================
    // Execute Intent
    // ============================================================================
    const executeIntent = (0, react_1.useCallback)((intent, entities) => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            const response = yield fetch('/api/assistant/execute', {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` })),
                body: JSON.stringify({ intent, entities }),
            });
            if (!response.ok) {
                throw new Error(`Execute intent failed: ${response.status}`);
            }
            const data = yield response.json();
            console.log('[API] Execute intent success:', data);
            return data;
        }
        catch (err) {
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
        }
        finally {
            setLoading(false);
        }
    }), []);
    // ============================================================================
    // Fetch Graph
    // ============================================================================
    const fetchGraph = (0, react_1.useCallback)((entityId) => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            const response = yield fetch(`/api/graph/entity/${entityId}`, {
                method: 'GET',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` })),
            });
            if (!response.ok) {
                throw new Error(`Fetch graph failed: ${response.status}`);
            }
            const data = yield response.json();
            console.log('[API] Fetch graph success:', data);
            return data;
        }
        catch (err) {
            const errorMsg = handleAPIError(err);
            console.error('[API] Fetch graph error:', errorMsg);
            setError(errorMsg);
            // Fallback to mock data
            console.warn('[API] Using mock graph data');
            return MOCK_GRAPH;
        }
        finally {
            setLoading(false);
        }
    }), []);
    // ============================================================================
    // Fetch Alerts
    // ============================================================================
    const fetchAlerts = (0, react_1.useCallback)((entityId) => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            const url = entityId
                ? `/api/alerts/latest?entity=${entityId}`
                : '/api/alerts/latest';
            const response = yield fetch(url, {
                method: 'GET',
                headers: Object.assign({ 'Content-Type': 'application/json' }, (token && { Authorization: `Bearer ${token}` })),
            });
            if (!response.ok) {
                throw new Error(`Fetch alerts failed: ${response.status}`);
            }
            const data = yield response.json();
            const alerts = data.items || [];
            console.log('[API] Fetch alerts success:', alerts.length, 'alerts');
            return alerts;
        }
        catch (err) {
            const errorMsg = handleAPIError(err);
            console.error('[API] Fetch alerts error:', errorMsg);
            setError(errorMsg);
            // Fallback to mock data
            console.warn('[API] Using mock alerts data');
            return MOCK_ALERTS;
        }
        finally {
            setLoading(false);
        }
    }), []);
    return {
        parseIntent,
        executeIntent,
        fetchGraph,
        fetchAlerts,
        loading,
        error,
    };
}
exports.useAssistantAPI = useAssistantAPI;
