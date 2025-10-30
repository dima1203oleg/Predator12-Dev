import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Типи для CYBER-ACE Store
 */

export type AgentType =
  | 'data-analyst'
  | 'risk-detective'
  | 'network-scout'
  | 'compliance-guardian'
  | 'threat-hunter'
  | 'pattern-finder';

export type AgentStatus = 'idle' | 'active' | 'busy' | 'error';

export type SystemStatus = 'online' | 'offline' | 'degraded' | 'maintenance';

export type AceMood = 'neutral' | 'thinking' | 'speaking' | 'alert' | 'success' | 'error';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  status: AgentStatus;
  tasks: number;
  lastActive: Date | null;
  capabilities: string[];
  avatar: string;
}

export interface Task {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  completedAt: Date | null;
  result?: any;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  agentId?: string;
}

/**
 * CYBER-ACE Store State
 */
interface CyberAceState {
  // Статус системи
  isActive: boolean;
  systemStatus: SystemStatus;
  mood: AceMood;
  greeting: string;

  // Агенти
  agents: Agent[];
  currentAgent: Agent | null;

  // Завдання та нотифікації
  tasks: Task[];
  notifications: Notification[];

  // Історія взаємодій
  conversationHistory: Array<{
    role: 'user' | 'ace' | 'agent';
    content: string;
    timestamp: Date;
    agentId?: string;
  }>;

  // Налаштування
  settings: {
    voiceEnabled: boolean;
    autoDelegate: boolean;
    notificationsEnabled: boolean;
    language: 'uk' | 'en';
  };

  // Дії
  initializeAce: () => void;
  setSystemStatus: (status: SystemStatus) => void;
  setMood: (mood: AceMood) => void;
  setGreeting: (greeting: string) => void;

  // Агенти
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  setCurrentAgent: (agent: Agent | null) => void;
  getAgentById: (id: string) => Agent | undefined;

  // Завдання
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string, result?: any) => void;
  delegateTask: (taskId: string, agentId: string) => void;

  // Нотифікації
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Історія
  addMessage: (role: 'user' | 'ace' | 'agent', content: string, agentId?: string) => void;
  clearHistory: () => void;

  // Налаштування
  updateSettings: (settings: Partial<CyberAceState['settings']>) => void;
}

/**
 * Початкові агенти системи
 */
const initialAgents: Agent[] = [
  {
    id: 'data-analyst-01',
    type: 'data-analyst',
    name: 'Data Analyst',
    description: 'Аналізує дані та створює звіти',
    status: 'idle',
    tasks: 0,
    lastActive: null,
    capabilities: ['data-analysis', 'reporting', 'visualization'],
    avatar: '📊'
  },
  {
    id: 'risk-detective-01',
    type: 'risk-detective',
    name: 'Risk Detective',
    description: 'Виявляє ризики та аномалії',
    status: 'idle',
    tasks: 0,
    lastActive: null,
    capabilities: ['risk-detection', 'anomaly-detection', 'alert-management'],
    avatar: '🔍'
  },
  {
    id: 'network-scout-01',
    type: 'network-scout',
    name: 'Network Scout',
    description: 'Досліджує мережу зв\'язків',
    status: 'idle',
    tasks: 0,
    lastActive: null,
    capabilities: ['network-analysis', 'relationship-mapping', 'graph-visualization'],
    avatar: '🕸️'
  },
  {
    id: 'compliance-guardian-01',
    type: 'compliance-guardian',
    name: 'Compliance Guardian',
    description: 'Перевіряє відповідність регуляціям',
    status: 'idle',
    tasks: 0,
    lastActive: null,
    capabilities: ['compliance-check', 'regulation-monitoring', 'audit'],
    avatar: '🛡️'
  },
  {
    id: 'threat-hunter-01',
    type: 'threat-hunter',
    name: 'Threat Hunter',
    description: 'Полює на загрози безпеці',
    status: 'idle',
    tasks: 0,
    lastActive: null,
    capabilities: ['threat-detection', 'security-analysis', 'incident-response'],
    avatar: '🎯'
  },
  {
    id: 'pattern-finder-01',
    type: 'pattern-finder',
    name: 'Pattern Finder',
    description: 'Знаходить паттерни в даних',
    status: 'idle',
    tasks: 0,
    lastActive: null,
    capabilities: ['pattern-recognition', 'trend-analysis', 'prediction'],
    avatar: '🔮'
  }
];

/**
 * CYBER-ACE Store
 */
export const useCyberAceStore = create<CyberAceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Початковий стан
        isActive: false,
        systemStatus: 'online',
        mood: 'neutral',
        greeting: 'Вітаю! Я CYBER-ACE, ваш особистий кібер-асистент.',
        agents: initialAgents,
        currentAgent: null,
        tasks: [],
        notifications: [],
        conversationHistory: [],
        settings: {
          voiceEnabled: true,
          autoDelegate: true,
          notificationsEnabled: true,
          language: 'uk'
        },

        // Ініціалізація
        initializeAce: () => {
          set({ isActive: true, systemStatus: 'online', mood: 'neutral' });
        },

        setSystemStatus: (status) => set({ systemStatus: status }),
        setMood: (mood) => set({ mood }),
        setGreeting: (greeting) => set({ greeting }),

        // Агенти
        addAgent: (agent) => {
          set((state) => ({ agents: [...state.agents, agent] }));
        },

        updateAgent: (id, updates) => {
          set((state) => ({
            agents: state.agents.map((agent) =>
              agent.id === id ? { ...agent, ...updates } : agent
            )
          }));
        },

        setCurrentAgent: (agent) => set({ currentAgent: agent }),

        getAgentById: (id) => {
          return get().agents.find((agent) => agent.id === id);
        },

        // Завдання
        addTask: (task) => {
          set((state) => ({ tasks: [...state.tasks, task] }));

          // Оновлюємо статус агента
          if (task.agentId) {
            get().updateAgent(task.agentId, { status: 'busy' });
          }
        },

        updateTask: (id, updates) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updates } : task
            )
          }));
        },

        completeTask: (id, result) => {
          const task = get().tasks.find((t) => t.id === id);

          if (task) {
            get().updateTask(id, {
              status: 'completed',
              completedAt: new Date(),
              result
            });

            // Оновлюємо статус агента
            if (task.agentId) {
              const agentTasks = get().tasks.filter(
                (t) => t.agentId === task.agentId && t.status !== 'completed'
              );

              get().updateAgent(task.agentId, {
                status: agentTasks.length > 0 ? 'busy' : 'idle',
                lastActive: new Date()
              });
            }

            // Додаємо нотифікацію
            get().addNotification({
              type: 'success',
              title: 'Завдання виконано',
              message: `Завдання "${task.title}" успішно виконано`,
              agentId: task.agentId
            });
          }
        },

        delegateTask: (taskId, agentId) => {
          get().updateTask(taskId, { agentId, status: 'in-progress' });
          get().updateAgent(agentId, { status: 'busy' });
        },

        // Нотифікації
        addNotification: (notification) => {
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: `notif-${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                read: false
              }
            ]
          }));
        },

        markNotificationAsRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map((notif) =>
              notif.id === id ? { ...notif, read: true } : notif
            )
          }));
        },

        clearNotifications: () => set({ notifications: [] }),

        // Історія
        addMessage: (role, content, agentId) => {
          set((state) => ({
            conversationHistory: [
              ...state.conversationHistory,
              { role, content, timestamp: new Date(), agentId }
            ]
          }));
        },

        clearHistory: () => set({ conversationHistory: [] }),

        // Налаштування
        updateSettings: (settings) => {
          set((state) => ({
            settings: { ...state.settings, ...settings }
          }));
        }
      }),
      {
        name: 'cyber-ace-storage',
        partialize: (state) => ({
          agents: state.agents,
          settings: state.settings,
          conversationHistory: state.conversationHistory.slice(-50) // Зберігаємо тільки останні 50 повідомлень
        })
      }
    )
  )
);
