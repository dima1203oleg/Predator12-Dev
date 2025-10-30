/**
 * AI Assistant - Zustand Store
 * Centralized state management for the Assistant module
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AssistantState,
  MicState,
  ChatMessage,
  GraphNode,
  GraphEdge,
  Alert,
  Locale,
  HeadAnimationState,
} from '../types';

// ============================================================================
// Initial States
// ============================================================================

const initialMicState: MicState = {
  enabled: false,
  level: 0,
  continuous: false,
  status: 'idle',
};

const initialHeadAnimationState: HeadAnimationState = {
  intensity: 0,
  lookAtX: 0,
  lookAtY: 0,
  speaking: false,
  color: '#00ffff', // Cyan/Nexus theme
};

// ============================================================================
// Store
// ============================================================================

export const useAssistantStore = create<AssistantState>()(
  devtools(
    persist(
      (set, get) => ({
        // ====================================================================
        // Locale (Українська за замовчуванням)
        // ====================================================================
        locale: 'uk-UA', // Головна мова — українська
        setLocale: (locale: Locale) => {
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
        setMic: (updates: Partial<MicState>) => {
          set(
            (state) => ({
              mic: { ...state.mic, ...updates },
            }),
            false,
            'setMic'
          );
        },
        setMicLevel: (level: number) => {
          set(
            (state) => ({
              mic: { ...state.mic, level: Math.max(0, Math.min(1, level)) },
            }),
            false,
            'setMicLevel'
          );
        },

        // ====================================================================
        // Chat
        // ====================================================================
        chat: {
          history: [],
          loading: false,
        },
        pushMessage: (message: { role: ChatRole; text?: string; content?: string; locale?: Locale }) => {
          const messageText = message.text || message.content || '';
          const newMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            role: message.role,
            content: messageText,
            text: messageText,
            timestamp: Date.now(),
            locale: message.locale || get().locale,
          };
          set(
            (state) => ({
              chat: {
                ...state.chat,
                history: [...state.chat.history, newMessage],
              },
            }),
            false,
            'pushMessage'
          );
        },
        setChatLoading: (loading: boolean) => {
          set(
            (state) => ({
              chat: { ...state.chat, loading },
            }),
            false,
            'setChatLoading'
          );
        },
        setChatError: (error?: string) => {
          set(
            (state) => ({
              chat: { ...state.chat, error },
            }),
            false,
            'setChatError'
          );
        },
        clearChat: () => {
          set(
            {
              chat: {
                history: [],
                loading: false,
              },
            },
            false,
            'clearChat'
          );
        },

        // ====================================================================
        // Graph
        // ====================================================================
        graph: {
          nodes: [],
          edges: [],
          loading: false,
        },
        setGraph: (nodes: GraphNode[], edges: GraphEdge[]) => {
          set(
            {
              graph: {
                nodes,
                edges,
                loading: false,
              },
            },
            false,
            'setGraph'
          );
        },
        setSelectedNode: (nodeId?: string) => {
          set(
            (state) => ({
              graph: { ...state.graph, selectedId: nodeId },
            }),
            false,
            'setSelectedNode'
          );
        },
        setGraphLoading: (loading: boolean) => {
          set(
            (state) => ({
              graph: { ...state.graph, loading },
            }),
            false,
            'setGraphLoading'
          );
        },
        setGraphError: (error?: string) => {
          set(
            (state) => ({
              graph: { ...state.graph, error },
            }),
            false,
            'setGraphError'
          );
        },

        // ====================================================================
        // Alerts
        // ====================================================================
        alerts: {
          items: [],
          activeIndex: 0,
          loading: false,
        },
        setAlerts: (alerts: Alert[]) => {
          set(
            {
              alerts: {
                items: alerts,
                activeIndex: 0,
                loading: false,
              },
            },
            false,
            'setAlerts'
          );
        },
        setActiveAlert: (index: number) => {
          set(
            (state) => {
              const maxIndex = state.alerts.items.length - 1;
              const clampedIndex = Math.max(0, Math.min(maxIndex, index));
              return {
                alerts: { ...state.alerts, activeIndex: clampedIndex },
              };
            },
            false,
            'setActiveAlert'
          );
        },
        nextAlert: () => {
          set(
            (state) => {
              const nextIndex = (state.alerts.activeIndex + 1) % state.alerts.items.length;
              return {
                alerts: { ...state.alerts, activeIndex: nextIndex },
              };
            },
            false,
            'nextAlert'
          );
        },
        prevAlert: () => {
          set(
            (state) => {
              const prevIndex =
                state.alerts.activeIndex === 0
                  ? state.alerts.items.length - 1
                  : state.alerts.activeIndex - 1;
              return {
                alerts: { ...state.alerts, activeIndex: prevIndex },
              };
            },
            false,
            'prevAlert'
          );
        },

        // ====================================================================
        // 3D Head Animation
        // ====================================================================
        headAnimation: initialHeadAnimationState,
        setHeadAnimation: (updates: Partial<HeadAnimationState>) => {
          set(
            (state) => ({
              headAnimation: { ...state.headAnimation, ...updates },
            }),
            false,
            'setHeadAnimation'
          );
        },
      }),
      {
        name: 'predator-assistant-store',
        partialize: (state) => ({
          locale: state.locale,
          mic: {
            continuous: state.mic.continuous,
          },
        }),
      }
    ),
    {
      name: 'AssistantStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

export const selectLocale = (state: AssistantState) => state.locale;
export const selectMic = (state: AssistantState) => state.mic;
export const selectChat = (state: AssistantState) => state.chat;
export const selectGraph = (state: AssistantState) => state.graph;
export const selectAlerts = (state: AssistantState) => state.alerts;
export const selectHeadAnimation = (state: AssistantState) => state.headAnimation;

// Derived selectors
export const selectActiveAlert = (state: AssistantState) =>
  state.alerts.items[state.alerts.activeIndex];
export const selectSelectedNode = (state: AssistantState) =>
  state.graph.nodes.find((n) => n.id === state.graph.selectedId);
export const selectLastMessage = (state: AssistantState) =>
  state.chat.history[state.chat.history.length - 1];
