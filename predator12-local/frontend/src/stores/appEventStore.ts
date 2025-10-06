import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

// Типи подій згідно з ТЗ п.11
type AppEvent = 
  | { type: 'HEALTH_UNKNOWN'; source?: 'prometheus' | 'backend' | 'opensearch'; hint?: string; ts?: string }
  | { type: 'AGENT_DOWN'; agentId: string; ts?: string }
  | { type: 'NETWORK_OFFLINE'; ts?: string }
  | { type: 'ACTION_REQUIRED'; cta: { label: string; target?: string; run?: () => void }; ts?: string };

interface NotificationEvent {
  id: string;
  event: AppEvent;
  level: 'info' | 'success' | 'warn' | 'error' | 'action';
  title: string;
  message: string;
  timestamp: Date;
  ttl: number; // Time to live in seconds
  isRead: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    type?: 'primary' | 'secondary' | 'danger';
  }>;
  source: 'websocket' | 'local' | 'api';
}

interface GuideState {
  mode: 'passive' | 'guide' | 'silent';
  isActive: boolean;
  currentModule: string;
  lastInteraction: Date | null;
}

interface AppEventStore {
  // Notifications
  events: NotificationEvent[];
  unreadCount: number;
  
  // Guide
  guide: GuideState;
  
  // WebSocket connection
  wsConnected: boolean;
  
  // Actions
  addEvent: (
    event: AppEvent, 
    title: string,
    message: string, 
    level: NotificationEvent['level'], 
    actions?: NotificationEvent['actions'],
    source?: NotificationEvent['source']
  ) => void;
  markAsRead: (eventId: string) => void;
  clearExpiredEvents: () => void;
  clearAllEvents: () => void;
  setGuideMode: (mode: GuideState['mode']) => void;
  activateGuide: (module?: string) => void;
  deactivateGuide: () => void;
  updateLastInteraction: () => void;
  setWSConnection: (connected: boolean) => void;
}

export const useAppEventStore = create<AppEventStore>((set, get) => ({
  events: [],
  unreadCount: 0,
  wsConnected: false,
  
  guide: {
    mode: 'passive',
    isActive: false,
    currentModule: 'dashboard',
    lastInteraction: null
  },

  addEvent: (event, title, message, level, actions, source = 'local') => {
    const newEvent: NotificationEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      level,
      title,
      message,
      timestamp: new Date(),
      ttl: level === 'error' || level === 'action' ? 300 : 60, // 5 min for errors, 1 min for others
      isRead: false,
      actions: actions || [],
      source
    };

    set(state => ({
      events: [newEvent, ...state.events],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: (eventId) => {
    set(state => ({
      events: state.events.map(event => 
        event.id === eventId ? { ...event, isRead: true } : event
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  clearExpiredEvents: () => {
    const now = new Date();
    set(state => ({
      events: state.events.filter(event => {
        const eventAge = (now.getTime() - event.timestamp.getTime()) / 1000;
        return eventAge < event.ttl;
      })
    }));
  },

  setGuideMode: (mode) => {
    set(state => ({
      guide: { ...state.guide, mode }
    }));
  },

  activateGuide: (module) => {
    set(state => ({
      guide: {
        ...state.guide,
        isActive: true,
        currentModule: module || state.guide.currentModule,
        lastInteraction: new Date()
      }
    }));
  },

  deactivateGuide: () => {
    set(state => ({
      guide: { ...state.guide, isActive: false }
    }));
  },

  updateLastInteraction: () => {
    set(state => ({
      guide: { ...state.guide, lastInteraction: new Date() }
    }));
  },

  clearAllEvents: () => {
    set({ events: [], unreadCount: 0 });
  },

  setWSConnection: (connected) => {
    set({ wsConnected: connected });
  }
}));

// Auto cleanup expired events every 30 seconds
setInterval(() => {
  useAppEventStore.getState().clearExpiredEvents();
}, 30000);
