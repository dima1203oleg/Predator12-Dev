/**
 * AI Assistant Module - Type Definitions
 * PREDATOR12 Analytics Platform
 */

// ============================================================================
// Locale & Language
// ============================================================================

export type Locale = 'uk-UA' | 'en-US';
export type Language = 'uk' | 'en';

// ============================================================================
// Microphone State
// ============================================================================

export interface MicState {
  enabled: boolean;
  level: number; // 0-1, VU-meter level
  continuous: boolean;
  status: 'idle' | 'listening' | 'processing' | 'error';
  error?: string;
}

// ============================================================================
// Chat
// ============================================================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string; // Main message content
  text?: string; // Alias for content (for compatibility)
  timestamp: number;
  locale?: Locale;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface ChatState {
  history: ChatMessage[];
  loading: boolean;
  error?: string;
}

// ============================================================================
// Intent & Entities
// ============================================================================

export interface Intent {
  name: string;
  confidence: number;
  entities: Entity[];
}

export interface Entity {
  type: string; // 'counterparty', 'person', 'company', etc.
  value: string;
  confidence: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Graph / Network
// ============================================================================

export interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'company' | 'account' | 'transaction' | 'other';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: string;
  weight?: number;
  metadata?: Record<string, any>;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string;
  loading: boolean;
  error?: string;
}

// ============================================================================
// Risk & Alerts
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  entityId?: string;
  entityName?: string;
  severity: RiskLevel; // Changed from 'level' to match component usage
  message: string; // Main alert message
  title?: string;
  description?: string;
  source?: string;
  sourceLink?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AlertsState {
  items: Alert[];
  activeIndex: number;
  loading: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ParseIntentRequest {
  text: string;
  lang: Language;
}

export interface ParseIntentResponse {
  intent: string;
  entities: Entity[];
  confidence: number;
}

export interface ExecuteIntentRequest {
  intent: string;
  entities: Entity[];
  context?: Record<string, any>;
}

export interface ExecuteIntentResponse {
  answer: string;
  actions?: Action[];
  graph?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  alerts?: Alert[];
}

export interface Action {
  type: string;
  payload: any;
}

// ============================================================================
// 3D Head Animation
// ============================================================================

export interface HeadAnimationState {
  intensity: number; // 0-1, based on mic level
  lookAtX: number; // -1 to 1
  lookAtY: number; // -1 to 1
  speaking: boolean;
  color: string; // hex color for emission
}

// ============================================================================
// Assistant Store State (Zustand)
// ============================================================================

export interface AssistantState {
  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Microphone
  mic: MicState;
  setMic: (updates: Partial<MicState>) => void;
  setMicLevel: (level: number) => void;

  // Chat
  chat: ChatState;
  pushMessage: (message: { role: ChatRole; text?: string; content?: string; locale?: Locale }) => void;
  setChatLoading: (loading: boolean) => void;
  setChatError: (error?: string) => void;
  clearChat: () => void;

  // Graph
  graph: GraphState;
  setGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  setSelectedNode: (nodeId?: string) => void;
  setGraphLoading: (loading: boolean) => void;
  setGraphError: (error?: string) => void;

  // Alerts
  alerts: AlertsState;
  setAlerts: (alerts: Alert[]) => void;
  setActiveAlert: (index: number) => void;
  nextAlert: () => void;
  prevAlert: () => void;

  // 3D Head Animation
  headAnimation: HeadAnimationState;
  setHeadAnimation: (updates: Partial<HeadAnimationState>) => void;
}

// ============================================================================
// Component Props
// ============================================================================

export interface AssistantPageProps {
  // Optional overrides for testing
  mockMode?: boolean;
}

export interface Head3DProps {
  className?: string;
}

export interface ChatPanelProps {
  className?: string;
}

export interface NetworkPanelProps {
  className?: string;
}

export interface RiskBannerProps {
  className?: string;
}

export interface MicStatusProps {
  className?: string;
}
