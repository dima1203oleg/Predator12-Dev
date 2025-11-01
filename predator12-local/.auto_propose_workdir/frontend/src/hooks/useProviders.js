"use strict";
/**
 * 🎣 CUSTOM HOOK: useProviders
 *
 * React hook для управління провайдерами та їх даними
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProviders = void 0;
const react_1 = require("react");
const providerAPI_1 = __importDefault(require("../services/providerAPI"));
const websocket_1 = __importDefault(require("../services/websocket"));
// ============= HOOK =============
const useProviders = () => {
    const [providers, setProviders] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    /**
     * Завантажити провайдерів з API
     */
    const fetchProviders = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            const data = yield providerAPI_1.default.fetchProviders();
            setProviders(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch providers');
            console.error('Error fetching providers:', err);
        }
        finally {
            setLoading(false);
        }
    }), []);
    /**
     * Додати нового провайдера
     */
    const addProvider = (0, react_1.useCallback)((data) => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            const newProvider = yield providerAPI_1.default.addProvider(data);
            setProviders(prev => [...prev, newProvider]);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add provider');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }), []);
    /**
     * Оновити провайдера
     */
    const updateProvider = (0, react_1.useCallback)((id, data) => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            const updated = yield providerAPI_1.default.updateProvider(id, data);
            setProviders(prev => prev.map(p => p.id === id ? Object.assign(Object.assign({}, p), updated) : p));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update provider');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }), []);
    /**
     * Видалити провайдера
     */
    const deleteProvider = (0, react_1.useCallback)((id) => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            yield providerAPI_1.default.deleteProvider(id);
            setProviders(prev => prev.filter(p => p.id !== id));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete provider');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }), []);
    /**
     * Toggle статус провайдера
     */
    const toggleProviderStatus = (0, react_1.useCallback)((id) => __awaiter(void 0, void 0, void 0, function* () {
        const provider = providers.find(p => p.id === id);
        if (!provider)
            return;
        // Optimistic update
        setProviders(prev => prev.map(p => p.id === id ? Object.assign(Object.assign({}, p), { isActive: !p.isActive }) : p));
        try {
            yield providerAPI_1.default.toggleProviderStatus(id, !provider.isActive);
        }
        catch (err) {
            // Revert on error
            setProviders(prev => prev.map(p => p.id === id ? Object.assign(Object.assign({}, p), { isActive: provider.isActive }) : p));
            setError(err instanceof Error ? err.message : 'Failed to toggle provider status');
            throw err;
        }
    }), [providers]);
    /**
     * Підписатися на real-time оновлення
     */
    const subscribeToUpdates = (0, react_1.useCallback)(() => {
        // Subscribe to provider status changes
        websocket_1.default.on('provider:status:change', (data) => {
            setProviders(prev => prev.map(p => p.id === data.providerId
                ? Object.assign(Object.assign({}, p), { isActive: data.status === 'active' }) : p));
        });
        // Subscribe to stats updates
        websocket_1.default.on('provider:stats:update', (data) => {
            setProviders(prev => prev.map(p => p.id === data.providerId
                ? Object.assign(Object.assign({}, p), { requestCount: data.stats.totalRequests }) : p));
        });
        websocket_1.default.subscribeToOverallStats();
    }, []);
    /**
     * Відписатися від real-time оновлень
     */
    const unsubscribeFromUpdates = (0, react_1.useCallback)(() => {
        websocket_1.default.unsubscribeFromOverallStats();
    }, []);
    /**
     * Завантажити дані при mount
     */
    (0, react_1.useEffect)(() => {
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
exports.useProviders = useProviders;
exports.default = exports.useProviders;
