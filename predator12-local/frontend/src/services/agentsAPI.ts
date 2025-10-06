// Сервіс для роботи з API агентів PREDATOR11
import axios from 'axios';
import { FREE_MODELS_CATALOG, ModelInfo } from './modelRegistry';

export interface AgentConfig {
  id: string;
  name: string;
  type: string;
  primaryModel: string;
  fallbackModels: string[];
  multiLevelFeedback: {
    enabled: boolean;
    levels: number;
    thresholds: number[];
  };
  adaptiveRouting: boolean;
  costOptimization: boolean;
}

export interface ModelPerformance {
  modelId: string;
  successRate: number;
  avgLatency: number;
  costPerRequest: number;
  qualityScore: number;
}

export interface FeedbackLevel {
  level: number;
  threshold: number;
  action: 'retry' | 'escalate' | 'fallback' | 'optimize';
  modelSuggestions: string[];
}

class AgentsAPI {
  private baseURL: string;
  private freeModels: ModelInfo[];
  private performanceCache: Map<string, ModelPerformance> = new Map();

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8090';
    // Збираємо всі 58 безкоштовних моделей
    this.freeModels = Object.values(FREE_MODELS_CATALOG).flat();
  }

  // Отримати всі агенти з складною логікою вибору моделей
  async getAgents(): Promise<AgentConfig[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/agents`);
      return response.data.map((agent: any) => this.enrichAgentWithModelLogic(agent));
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      // Fallback до offline конфігурації з безкоштовними моделями
      return this.getOfflineAgentsConfig();
    }
  }

  // Збагачення агента складною логікою вибору моделей
  private enrichAgentWithModelLogic(agent: any): AgentConfig {
    const bestModels = this.selectOptimalModelsForAgent(agent.type);
    
    return {
      ...agent,
      primaryModel: bestModels[0],
      fallbackModels: bestModels.slice(1, 4),
      multiLevelFeedback: {
        enabled: true,
        levels: 4,
        thresholds: [0.9, 0.75, 0.6, 0.4] // Поріг для переходу на наступний рівень
      },
      adaptiveRouting: true,
      costOptimization: true
    };
  }

  // Вибір оптимальних моделей для типу агента
  private selectOptimalModelsForAgent(agentType: string): string[] {
    const typeToCategory: Record<string, keyof typeof FREE_MODELS_CATALOG> = {
      'reasoning': 'reasoning',
      'analysis': 'reasoning',
      'code': 'code',
      'etl': 'code',
      'quick': 'quick',
      'chat': 'quick',
      'vision': 'vision',
      'embed': 'embed',
      'generation': 'gen'
    };

    const category = typeToCategory[agentType] || 'reasoning';
    const categoryModels = FREE_MODELS_CATALOG[category];
    
    // Сортуємо за продуктивністю та повертаємо топ моделі
    return categoryModels
      .sort((a, b) => b.performance - a.performance)
      .map(model => model.id);
  }

  // Багаторівневий фідбек з адаптивною маршрутизацією
  async processWithMultiLevelFeedback(
    agentId: string, 
    task: any, 
    attempt: number = 1
  ): Promise<any> {
    const agent = await this.getAgent(agentId);
    const feedbackLevel = this.calculateFeedbackLevel(agent, attempt);
    
    try {
      // Вибір моделі на основі рівня фідбеку
      const selectedModel = this.selectModelForLevel(agent, feedbackLevel);
      
      // Виконання задачі з вибраною моделлю
      const result = await this.executeTask(selectedModel, task);
      
      // Оцінка якості результату
      const qualityScore = await this.evaluateResult(result, task);
      
      if (qualityScore >= agent.multiLevelFeedback.thresholds[feedbackLevel.level]) {
        // Успіх - зберігаємо метрики
        this.updateModelPerformance(selectedModel, true, qualityScore);
        return result;
      } else if (attempt < agent.multiLevelFeedback.levels) {
        // Неуспіх - переходимо на наступний рівень
        return this.processWithMultiLevelFeedback(agentId, task, attempt + 1);
      } else {
        // Всі спроби вичерпані - повертаємо найкращий результат
        return result;
      }
    } catch (error) {
      this.updateModelPerformance(agent.primaryModel, false, 0);
      throw error;
    }
  }

  // Розрахунок рівня фідбеку
  private calculateFeedbackLevel(agent: AgentConfig, attempt: number): FeedbackLevel {
    const level = Math.min(attempt - 1, agent.multiLevelFeedback.levels - 1);
    const threshold = agent.multiLevelFeedback.thresholds[level];
    
    return {
      level,
      threshold,
      action: this.determineAction(level),
      modelSuggestions: this.getModelSuggestionsForLevel(agent, level)
    };
  }

  // Визначення дії на основі рівня
  private determineAction(level: number): 'retry' | 'escalate' | 'fallback' | 'optimize' {
    switch (level) {
      case 0: return 'retry';
      case 1: return 'optimize';
      case 2: return 'escalate';
      default: return 'fallback';
    }
  }

  // Вибір моделі для рівня фідбеку
  private selectModelForLevel(agent: AgentConfig, level: FeedbackLevel): string {
    if (level.level === 0) {
      return agent.primaryModel;
    } else if (level.level < agent.fallbackModels.length) {
      return agent.fallbackModels[level.level - 1];
    } else {
      // Використовуємо найпотужнішу доступну модель
      return this.freeModels
        .filter(m => m.category === 'reasoning')
        .sort((a, b) => b.performance - a.performance)[0].id;
    }
  }

  // Виконання задачі з моделлю
  private async executeTask(modelId: string, task: any): Promise<any> {
    const response = await axios.post(`${this.baseURL}/api/models/execute`, {
      model: modelId,
      task: task,
      options: {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      }
    });
    return response.data;
  }

  // Оцінка якості результату
  private async evaluateResult(result: any, originalTask: any): Promise<number> {
    // Використовуємо спеціальну модель для оцінки
    const evaluatorModel = this.freeModels
      .filter(m => m.category === 'reasoning')
      .sort((a, b) => b.performance - a.performance)[0];

    try {
      const evaluation = await this.executeTask(evaluatorModel.id, {
        type: 'evaluate',
        result: result,
        task: originalTask,
        criteria: ['accuracy', 'completeness', 'relevance', 'clarity']
      });
      
      return evaluation.score || 0.5;
    } catch (error) {
      // Fallback до простої евристичної оцінки
      return this.simpleEvaluation(result);
    }
  }

  // Проста оцінка якості
  private simpleEvaluation(result: any): number {
    if (!result || typeof result !== 'object') return 0.3;
    
    let score = 0.5;
    if (result.content && result.content.length > 50) score += 0.2;
    if (result.confidence && result.confidence > 0.7) score += 0.2;
    if (result.sources && result.sources.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  // Оновлення метрик продуктивності моделі
  private updateModelPerformance(modelId: string, success: boolean, qualityScore: number): void {
    const current = this.performanceCache.get(modelId) || {
      modelId,
      successRate: 0,
      avgLatency: 0,
      costPerRequest: 0,
      qualityScore: 0
    };

    // Експоненціальне згладжування для метрик
    const alpha = 0.1;
    current.successRate = current.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
    current.qualityScore = current.qualityScore * (1 - alpha) + qualityScore * alpha;

    this.performanceCache.set(modelId, current);
  }

  // Отримання рекомендацій моделей для рівня
  private getModelSuggestionsForLevel(agent: AgentConfig, level: number): string[] {
    const performance = Array.from(this.performanceCache.values())
      .filter(p => this.freeModels.some(m => m.id === p.modelId))
      .sort((a, b) => b.qualityScore - a.qualityScore);

    if (performance.length > 0) {
      return performance.slice(0, 3).map(p => p.modelId);
    }

    // Fallback до статичних рекомендацій
    return this.freeModels
      .filter(m => m.free)
      .sort((a, b) => b.performance - a.performance)
      .slice(level, level + 3)
      .map(m => m.id);
  }

  // Offline конфігурація агентів з безкоштовними моделями
  private getOfflineAgentsConfig(): AgentConfig[] {
    return [
      {
        id: 'orchestrator',
        name: 'Chief Orchestrator',
        type: 'reasoning',
        primaryModel: 'meta/meta-llama-3.1-70b-instruct',
        fallbackModels: ['microsoft/phi-4-reasoning', 'qwen/qwen2.5-72b-instruct'],
        multiLevelFeedback: { enabled: true, levels: 4, thresholds: [0.9, 0.75, 0.6, 0.4] },
        adaptiveRouting: true,
        costOptimization: true
      },
      {
        id: 'code-agent',
        name: 'Code Specialist',
        type: 'code',
        primaryModel: 'codestral-2501',
        fallbackModels: ['deepseek/deepseek-coder-v2', 'qwen/qwen2.5-coder-7b-instruct'],
        multiLevelFeedback: { enabled: true, levels: 4, thresholds: [0.9, 0.75, 0.6, 0.4] },
        adaptiveRouting: true,
        costOptimization: true
      },
      {
        id: 'quick-agent',
        name: 'Quick Response',
        type: 'quick',
        primaryModel: 'microsoft/phi-3-mini-4k-instruct',
        fallbackModels: ['mistral/ministral-3b', 'google/gemma-2-2b-it'],
        multiLevelFeedback: { enabled: true, levels: 3, thresholds: [0.85, 0.65, 0.45] },
        adaptiveRouting: true,
        costOptimization: true
      }
    ];
  }

  // Отримати конкретного агента
  async getAgent(agentId: string): Promise<AgentConfig> {
    const agents = await this.getAgents();
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent;
  }

  // Оптимізація моделей на основі використання
  async optimizeModelSelection(): Promise<void> {
    const sortedPerformance = Array.from(this.performanceCache.values())
      .sort((a, b) => b.qualityScore * b.successRate - a.qualityScore * a.successRate);

    // Логуємо найкращі моделі
    console.log('🎯 Топ моделі за продуктивністю:', 
      sortedPerformance.slice(0, 5).map(p => `${p.modelId}: ${(p.qualityScore * 100).toFixed(1)}%`)
    );
  }
}

export const agentsAPI = new AgentsAPI();
export default agentsAPI;
