// 48 Free Models - matches backend model_registry.yaml
export const FREE_MODELS_CATALOG = {
    reasoning: [
        { id: 'meta/meta-llama-3.1-70b-instruct', free: true, performance: 95, category: 'reasoning' },
        { id: 'meta/meta-llama-3.1-8b-instruct', free: true, performance: 82, category: 'reasoning' },
        { id: 'mistral/mixtral-8x7b-instruct', free: true, performance: 89, category: 'reasoning' },
        { id: 'mistral/mistral-7b-instruct-v0.3', free: true, performance: 78, category: 'reasoning' },
        { id: 'qwen/qwen2.5-72b-instruct', free: true, performance: 92, category: 'reasoning' },
        { id: 'qwen/qwen2.5-14b-instruct', free: true, performance: 85, category: 'reasoning' },
        { id: 'microsoft/phi-3-medium-4k-instruct', free: true, performance: 81, category: 'reasoning' },
        { id: 'microsoft/phi-4-reasoning', free: true, performance: 94, category: 'reasoning' },
        { id: 'google/gemma-2-27b-it', free: true, performance: 87, category: 'reasoning' },
        { id: 'google/gemma-2-9b-it', free: true, performance: 79, category: 'reasoning' },
        { id: 'snowflake-arctic/arctic-instruct', free: true, performance: 83, category: 'reasoning' },
        { id: 'mistral/ministral-3b', free: true, performance: 74, category: 'reasoning' }
    ],
    code: [
        { id: 'deepseek/deepseek-coder-v2', free: true, performance: 93, category: 'code' },
        { id: 'bigcode/starcoder2-15b', free: true, performance: 88, category: 'code' },
        { id: 'qwen/qwen2.5-coder-7b-instruct', free: true, performance: 84, category: 'code' },
        { id: 'replit/replit-code-v1.5', free: true, performance: 82, category: 'code' },
        { id: 'phind/phind-codellama-34b-v2', free: true, performance: 86, category: 'code' },
        { id: 'deepseek/deepseek-coder-33b-instruct', free: true, performance: 91, category: 'code' },
        { id: 'bigcode/starcoder2-7b', free: true, performance: 80, category: 'code' },
        { id: 'qwen/qwen2.5-coder-14b-instruct', free: true, performance: 87, category: 'code' },
        { id: 'codestral-2501', free: true, performance: 95, category: 'code' },
        { id: 'wizardcoder/wizardcoder-15b', free: true, performance: 83, category: 'code' }
    ],
    quick: [
        { id: 'microsoft/phi-3-mini-4k-instruct', free: true, performance: 79, category: 'quick' },
        { id: 'mistral/mistral-7b-instruct-v0.3', free: true, performance: 78, category: 'quick' },
        { id: 'qwen/qwen2.5-3b-instruct', free: true, performance: 76, category: 'quick' },
        { id: 'meta/meta-llama-3.2-3b-instruct', free: true, performance: 75, category: 'quick' },
        { id: 'microsoft/phi-3-mini-128k-instruct', free: true, performance: 80, category: 'quick' },
        { id: 'qwen/qwen2.5-1.5b-instruct', free: true, performance: 72, category: 'quick' },
        { id: 'meta/meta-llama-3.2-1b-instruct', free: true, performance: 70, category: 'quick' },
        { id: 'google/gemma-2-2b-it', free: true, performance: 74, category: 'quick' }
    ],
    embed: [
        { id: 'BAAI/bge-m3', free: true, performance: 91, category: 'embed' },
        { id: 'jinaai/jina-embeddings-v3', free: true, performance: 89, category: 'embed' },
        { id: 'intfloat/e5-large-v2', free: true, performance: 87, category: 'embed' },
        { id: 'intfloat/multilingual-e5-large', free: true, performance: 88, category: 'embed' },
        { id: 'BAAI/bge-base-en-v1.5', free: true, performance: 84, category: 'embed' },
        { id: 'BAAI/bge-small-en-v1.5', free: true, performance: 80, category: 'embed' },
        { id: 'snowflake-arctic-embed/arctic-embed-l', free: true, performance: 90, category: 'embed' },
        { id: 'sentence-transformers/all-MiniLM-L6-v2', free: true, performance: 77, category: 'embed' }
    ],
    vision: [
        { id: 'llava-hf/llava-1.6-mistral-7b', free: true, performance: 85, category: 'vision' },
        { id: 'Qwen/Qwen2-VL-7B-Instruct', free: true, performance: 88, category: 'vision' },
        { id: 'meta/llama-3.2-11b-vision-instruct', free: true, performance: 90, category: 'vision' },
        { id: 'llava-hf/llava-1.5-7b', free: true, performance: 82, category: 'vision' },
        { id: 'Qwen/Qwen2-VL-2B-Instruct', free: true, performance: 79, category: 'vision' },
        { id: 'moondream/moondream2', free: true, performance: 76, category: 'vision' }
    ],
    gen: [
        { id: 'meta/meta-llama-3.1-8b-instruct', free: true, performance: 82, category: 'gen' },
        { id: 'mistral/mixtral-8x7b-instruct', free: true, performance: 89, category: 'gen' },
        { id: 'qwen/qwen2.5-14b-instruct', free: true, performance: 85, category: 'gen' },
        { id: 'google/gemma-2-27b-it', free: true, performance: 87, category: 'gen' }
    ]
};
// Competition Scenarios - matches backend arbiter_competitions
export const COMPETITION_SCENARIOS = [
    {
        name: 'reasoning_premium',
        title: '🏆 Преміум розумування',
        models: ['gpt-5', 'microsoft/phi-4-reasoning', 'qwen/qwen2.5-72b-instruct'],
        tasks: ['complex_analysis', 'multi_step_reasoning', 'logical_deduction']
    },
    {
        name: 'coding_showdown',
        title: '💻 Код-дуель',
        models: ['codestral-2501', 'deepseek/deepseek-coder-v2', 'phind/phind-codellama-34b-v2'],
        tasks: ['algorithm_design', 'code_optimization', 'bug_fixing']
    },
    {
        name: 'speed_test',
        title: '⚡ Швидкість відповіді',
        models: ['microsoft/phi-3-mini-4k-instruct', 'mistral/ministral-3b', 'google/gemma-2-2b-it'],
        tasks: ['classification', 'simple_qa', 'sentiment_analysis']
    },
    {
        name: 'language_masters',
        title: '🌍 Мовні майстри',
        models: ['qwen/qwen2.5-14b-instruct', 'google/gemma-2-9b-it', 'meta/meta-llama-3.1-8b-instruct'],
        tasks: ['translation', 'multilingual_understanding', 'cultural_context']
    },
    {
        name: 'embedding_battle',
        title: '🔗 Батл вбудовування',
        models: ['text-embedding-3-large', 'BAAI/bge-m3', 'jinaai/jina-embeddings-v3'],
        tasks: ['semantic_search', 'similarity_detection', 'clustering']
    },
    {
        name: 'vision_clash',
        title: '👁️ Візійний зворот',
        models: ['meta/llama-3.2-11b-vision-instruct', 'Qwen/Qwen2-VL-7B-Instruct', 'llava-hf/llava-1.6-mistral-7b'],
        tasks: ['image_understanding', 'ocr_extraction', 'visual_reasoning']
    }
];
// Agent-to-Model assignments - ALL FREE models only 
export const AGENT_MODEL_ASSIGNMENTS = {
    ChiefOrchestrator: 'qwen/qwen2.5-72b-instruct',
    QueryPlanner: 'microsoft/phi-4-reasoning',
    ModelRouter: 'mistral/ministral-3b',
    Arbiter: 'microsoft/phi-4-reasoning',
    NexusGuide: 'meta/meta-llama-3.1-70b-instruct',
    DatasetIngest: 'mistral/ministral-3b',
    DataQuality: 'qwen/qwen2.5-3b-instruct',
    SchemaMapper: 'microsoft/phi-4-reasoning',
    ETLOrchestrator: 'mistral/ministral-3b',
    Indexer: 'qwen/qwen2.5-1.5b-instruct',
    Embedding: 'snowflake-arctic-embed/arctic-embed-l',
    OSINTCrawler: 'meta/meta-llama-3.1-8b-instruct',
    GraphBuilder: 'qwen/qwen2.5-72b-instruct',
    Anomaly: 'microsoft/phi-3-mini-4k-instruct',
    Forecast: 'qwen/qwen2.5-14b-instruct',
    Simulator: 'meta/meta-llama-3.1-70b-instruct',
    SyntheticData: 'mistral/mixtral-8x7b-instruct',
    ReportExport: 'mistral/ministral-3b',
    BillingGate: 'microsoft/phi-3-mini-128k-instruct',
    PIIGuardian: 'google/gemma-2-2b-it',
    AutoHeal: 'codestral-2501',
    SelfDiagnosis: 'deepseek/deepseek-coder-v2',
    SelfImprovement: 'microsoft/phi-4-reasoning',
    RedTeam: 'qwen/qwen2.5-72b-instruct',
    ComplianceMonitor: 'microsoft/phi-3-mini-4k-instruct',
    PerformanceOptimizer: 'qwen/qwen2.5-14b-instruct'
};
// Utility functions
export const getAllFreeModels = () => {
    return Object.values(FREE_MODELS_CATALOG).flat();
};
export const getModelById = (id) => {
    return getAllFreeModels().find(model => model.id === id);
};
export const getModelsByCategory = (category) => {
    return FREE_MODELS_CATALOG[category] || [];
};
export const getModelPerformance = (modelId) => {
    const model = getModelById(modelId);
    return model?.performance || 75; // Default performance
};
export const getTotalModelsCount = () => {
    return getAllFreeModels().length;
};
// Simulate competition results with realistic variance
export const simulateCompetitionResults = (scenario) => {
    const results = {};
    scenario.models.forEach(modelId => {
        const basePerformance = getModelPerformance(modelId);
        const variance = (Math.random() - 0.5) * 20; // ±10 points variance
        const finalScore = Math.max(0, Math.min(100, basePerformance + variance));
        results[modelId] = Math.round(finalScore * 100) / 100; // Round to 2 decimal places
    });
    return results;
};
export const getRandomCompetitionScenario = () => {
    return COMPETITION_SCENARIOS[Math.floor(Math.random() * COMPETITION_SCENARIOS.length)];
};
export const formatModelName = (modelId) => {
    // Extract readable name from model ID
    const parts = modelId.split('/');
    const name = parts[parts.length - 1];
    return name.replace(/-/g, ' ').replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
};
