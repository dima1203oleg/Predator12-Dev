"use strict";
/**
 * AI Assistant - Zustand Store
 * Centralized state management for the Assistant module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectLastMessage = exports.selectSelectedNode = exports.selectActiveAlert = exports.selectHeadAnimation = exports.selectAlerts = exports.selectGraph = exports.selectChat = exports.selectMic = exports.selectLocale = exports.useAssistantStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
// ============================================================================
// Initial States
// ============================================================================
const initialMicState = {
    enabled: false,
    level: 0,
    continuous: false,
    status: 'idle',
};
const initialHeadAnimationState = {
    intensity: 0,
    lookAtX: 0,
    lookAtY: 0,
    speaking: false,
    color: '#00ffff', // Cyan/Nexus theme
};
// ============================================================================
// Store
// ============================================================================
exports.useAssistantStore = (0, zustand_1.create)()((0, middleware_1.devtools)((0, middleware_1.persist)((set, get) => ({
    // ====================================================================
    // Locale (Українська за замовчуванням)
    // ====================================================================
    locale: 'uk-UA',
    setLocale: (locale) => {
        set({ locale }, false, 'setLocale');
        // Sync з localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('predator-locale', locale);
        }
    },
    // ====================================================================
    // Microphone
    // ====================================================================
    mic: initialMicState,
    setMic: (updates) => {
        set((state) => ({
            mic: Object.assign(Object.assign({}, state.mic), updates),
        }), false, 'setMic');
    },
    setMicLevel: (level) => {
        set((state) => ({
            mic: Object.assign(Object.assign({}, state.mic), { level: Math.max(0, Math.min(1, level)) }),
        }), false, 'setMicLevel');
    },
    // ====================================================================
    // Chat
    // ====================================================================
    chat: {
        history: [],
        loading: false,
    },
    pushMessage: (message) => {
        const messageText = message.text || message.content || '';
        const newMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            role: message.role,
            content: messageText,
            text: messageText,
            timestamp: Date.now(),
            locale: message.locale || get().locale,
        };
        set((state) => ({
            chat: Object.assign(Object.assign({}, state.chat), { history: [...state.chat.history, newMessage] }),
        }), false, 'pushMessage');
    },
    setChatLoading: (loading) => {
        set((state) => ({
            chat: Object.assign(Object.assign({}, state.chat), { loading }),
        }), false, 'setChatLoading');
    },
    setChatError: (error) => {
        set((state) => ({
            chat: Object.assign(Object.assign({}, state.chat), { error }),
        }), false, 'setChatError');
    },
    clearChat: () => {
        set({
            chat: {
                history: [],
                loading: false,
            },
        }, false, 'clearChat');
    },
    // ====================================================================
    // Graph
    // ====================================================================
    graph: {
        nodes: [],
        edges: [],
        loading: false,
    },
    setGraph: (nodes, edges) => {
        set({
            graph: {
                nodes,
                edges,
                loading: false,
            },
        }, false, 'setGraph');
    },
    setSelectedNode: (nodeId) => {
        set((state) => ({
            graph: Object.assign(Object.assign({}, state.graph), { selectedId: nodeId }),
        }), false, 'setSelectedNode');
    },
    setGraphLoading: (loading) => {
        set((state) => ({
            graph: Object.assign(Object.assign({}, state.graph), { loading }),
        }), false, 'setGraphLoading');
    },
    setGraphError: (error) => {
        set((state) => ({
            graph: Object.assign(Object.assign({}, state.graph), { error }),
        }), false, 'setGraphError');
    },
    // ====================================================================
    // Alerts
    // ====================================================================
    alerts: {
        items: [],
        activeIndex: 0,
        loading: false,
    },
    setAlerts: (alerts) => {
        set({
            alerts: {
                items: alerts,
                activeIndex: 0,
                loading: false,
            },
        }, false, 'setAlerts');
    },
    setActiveAlert: (index) => {
        set((state) => {
            const maxIndex = state.alerts.items.length - 1;
            const clampedIndex = Math.max(0, Math.min(maxIndex, index));
            return {
                alerts: Object.assign(Object.assign({}, state.alerts), { activeIndex: clampedIndex }),
            };
        }, false, 'setActiveAlert');
    },
    nextAlert: () => {
        set((state) => {
            const nextIndex = (state.alerts.activeIndex + 1) % state.alerts.items.length;
            return {
                alerts: Object.assign(Object.assign({}, state.alerts), { activeIndex: nextIndex }),
            };
        }, false, 'nextAlert');
    },
    prevAlert: () => {
        set((state) => {
            const prevIndex = state.alerts.activeIndex === 0
                ? state.alerts.items.length - 1
                : state.alerts.activeIndex - 1;
            return {
                alerts: Object.assign(Object.assign({}, state.alerts), { activeIndex: prevIndex }),
            };
        }, false, 'prevAlert');
    },
    // ====================================================================
    // 3D Head Animation
    // ====================================================================
    headAnimation: initialHeadAnimationState,
    setHeadAnimation: (updates) => {
        set((state) => ({
            headAnimation: Object.assign(Object.assign({}, state.headAnimation), updates),
        }), false, 'setHeadAnimation');
    },
}), {
    name: 'predator-assistant-store',
    partialize: (state) => ({
        locale: state.locale,
        mic: {
            continuous: state.mic.continuous,
        },
    }),
}), {
    name: 'AssistantStore',
    enabled: process.env.NODE_ENV === 'development',
}));
// ============================================================================
// Selectors (for performance optimization)
// ============================================================================
const selectLocale = (state) => state.locale;
exports.selectLocale = selectLocale;
const selectMic = (state) => state.mic;
exports.selectMic = selectMic;
const selectChat = (state) => state.chat;
exports.selectChat = selectChat;
const selectGraph = (state) => state.graph;
exports.selectGraph = selectGraph;
const selectAlerts = (state) => state.alerts;
exports.selectAlerts = selectAlerts;
const selectHeadAnimation = (state) => state.headAnimation;
exports.selectHeadAnimation = selectHeadAnimation;
// Derived selectors
const selectActiveAlert = (state) => state.alerts.items[state.alerts.activeIndex];
exports.selectActiveAlert = selectActiveAlert;
const selectSelectedNode = (state) => state.graph.nodes.find((n) => n.id === state.graph.selectedId);
exports.selectSelectedNode = selectSelectedNode;
const selectLastMessage = (state) => state.chat.history[state.chat.history.length - 1];
exports.selectLastMessage = selectLastMessage;
