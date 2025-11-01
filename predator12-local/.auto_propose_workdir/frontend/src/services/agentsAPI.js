"use strict";
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
exports.agentsAPI = void 0;
// Сервіс для роботи з API агентів PREDATOR11
const axios_1 = __importDefault(require("axios"));
const modelRegistry_1 = require("./modelRegistry");
class AgentsAPI {
    constructor() {
        this.performanceCache = new Map();
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8090';
        // Збираємо всі 58 безкоштовних моделей
        this.freeModels = Object.values(modelRegistry_1.FREE_MODELS_CATALOG).flat();
    }
    // Отримати всі агенти з складною логікою вибору моделей
    getAgents() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseURL}/api/agents`);
                return response.data.map((agent) => this.enrichAgentWithModelLogic(agent));
            }
            catch (error) {
                console.error('Failed to fetch agents:', error);
                // Fallback до offline конфігурації з безкоштовними моделями
                return this.getOfflineAgentsConfig();
            }
        });
    }
    // Збагачення агента складною логікою вибору моделей
    enrichAgentWithModelLogic(agent) {
        const bestModels = this.selectOptimalModelsForAgent(agent.type);
        return Object.assign(Object.assign({}, agent), { primaryModel: bestModels[0], fallbackModels: bestModels.slice(1, 4), multiLevelFeedback: {
                enabled: true,
                levels: 4,
                thresholds: [0.9, 0.75, 0.6, 0.4] // Поріг для переходу на наступний рівень
            }, adaptiveRouting: true, costOptimization: true });
    }
    // Вибір оптимальних моделей для типу агента
    selectOptimalModelsForAgent(agentType) {
        const typeToCategory = {
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
        const categoryModels = modelRegistry_1.FREE_MODELS_CATALOG[category];
        // Сортуємо за продуктивністю та повертаємо топ моделі
        return categoryModels
            .sort((a, b) => b.performance - a.performance)
            .map(model => model.id);
    }
    // Багаторівневий фідбек з адаптивною маршрутизацією
    processWithMultiLevelFeedback(agentId, task, attempt = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = yield this.getAgent(agentId);
            const feedbackLevel = this.calculateFeedbackLevel(agent, attempt);
            try {
                // Вибір моделі на основі рівня фідбеку
                const selectedModel = this.selectModelForLevel(agent, feedbackLevel);
                // Виконання задачі з вибраною моделлю
                const result = yield this.executeTask(selectedModel, task);
                // Оцінка якості результату
                const qualityScore = yield this.evaluateResult(result, task);
                if (qualityScore >= agent.multiLevelFeedback.thresholds[feedbackLevel.level]) {
                    // Успіх - зберігаємо метрики
                    this.updateModelPerformance(selectedModel, true, qualityScore);
                    return result;
                }
                else if (attempt < agent.multiLevelFeedback.levels) {
                    // Неуспіх - переходимо на наступний рівень
                    return this.processWithMultiLevelFeedback(agentId, task, attempt + 1);
                }
                else {
                    // Всі спроби вичерпані - повертаємо найкращий результат
                    return result;
                }
            }
            catch (error) {
                this.updateModelPerformance(agent.primaryModel, false, 0);
                throw error;
            }
        });
    }
    // Розрахунок рівня фідбеку
    calculateFeedbackLevel(agent, attempt) {
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
    determineAction(level) {
        switch (level) {
            case 0: return 'retry';
            case 1: return 'optimize';
            case 2: return 'escalate';
            default: return 'fallback';
        }
    }
    // Вибір моделі для рівня фідбеку
    selectModelForLevel(agent, level) {
        if (level.level === 0) {
            return agent.primaryModel;
        }
        else if (level.level < agent.fallbackModels.length) {
            return agent.fallbackModels[level.level - 1];
        }
        else {
            // Використовуємо найпотужнішу доступну модель
            return this.freeModels
                .filter(m => m.category === 'reasoning')
                .sort((a, b) => b.performance - a.performance)[0].id;
        }
    }
    // Виконання задачі з моделлю
    executeTask(modelId, task) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(`${this.baseURL}/api/models/execute`, {
                model: modelId,
                task: task,
                options: {
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.9
                }
            });
            return response.data;
        });
    }
    // Оцінка якості результату
    evaluateResult(result, originalTask) {
        return __awaiter(this, void 0, void 0, function* () {
            // Використовуємо спеціальну модель для оцінки
            const evaluatorModel = this.freeModels
                .filter(m => m.category === 'reasoning')
                .sort((a, b) => b.performance - a.performance)[0];
            try {
                const evaluation = yield this.executeTask(evaluatorModel.id, {
                    type: 'evaluate',
                    result: result,
                    task: originalTask,
                    criteria: ['accuracy', 'completeness', 'relevance', 'clarity']
                });
                return evaluation.score || 0.5;
            }
            catch (error) {
                // Fallback до простої евристичної оцінки
                return this.simpleEvaluation(result);
            }
        });
    }
    // Проста оцінка якості
    simpleEvaluation(result) {
        if (!result || typeof result !== 'object')
            return 0.3;
        let score = 0.5;
        if (result.content && result.content.length > 50)
            score += 0.2;
        if (result.confidence && result.confidence > 0.7)
            score += 0.2;
        if (result.sources && result.sources.length > 0)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    // Оновлення метрик продуктивності моделі
    updateModelPerformance(modelId, success, qualityScore) {
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
    getModelSuggestionsForLevel(agent, level) {
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
    getOfflineAgentsConfig() {
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
    getAgent(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const agents = yield this.getAgents();
            const agent = agents.find(a => a.id === agentId);
            if (!agent) {
                throw new Error(`Agent ${agentId} not found`);
            }
            return agent;
        });
    }
    // Оптимізація моделей на основі використання
    optimizeModelSelection() {
        return __awaiter(this, void 0, void 0, function* () {
            const sortedPerformance = Array.from(this.performanceCache.values())
                .sort((a, b) => b.qualityScore * b.successRate - a.qualityScore * a.successRate);
            // Логуємо найкращі моделі
            console.log('🎯 Топ моделі за продуктивністю:', sortedPerformance.slice(0, 5).map(p => `${p.modelId}: ${(p.qualityScore * 100).toFixed(1)}%`));
        });
    }
}
exports.agentsAPI = new AgentsAPI();
exports.default = exports.agentsAPI;
