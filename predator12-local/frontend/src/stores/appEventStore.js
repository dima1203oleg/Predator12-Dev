import { create } from 'zustand';
export const useAppEventStore = create((set, get) => ({
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
        const newEvent = {
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
            events: state.events.map(event => event.id === eventId ? { ...event, isRead: true } : event),
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
