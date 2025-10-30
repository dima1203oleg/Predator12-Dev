"use strict";
/**
 * 🔌 PROVIDER MANAGEMENT API ENDPOINTS
 *
 * Backend API для управління провайдерами та моделями
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// ============= VALIDATION SCHEMAS =============
const ProviderAccountSchema = zod_1.z.object({
    providerId: zod_1.z.string().min(1),
    accountName: zod_1.z.string().min(3),
    apiKey: zod_1.z.string().min(20),
    apiEndpoint: zod_1.z.string().url().optional(),
    models: zod_1.z.array(zod_1.z.string()).optional()
});
const ModelConfigSchema = zod_1.z.object({
    modelId: zod_1.z.string(),
    config: zod_1.z.object({
        maxTokens: zod_1.z.number().min(256).max(16384),
        temperature: zod_1.z.number().min(0).max(2),
        topP: zod_1.z.number().min(0).max(1),
        frequencyPenalty: zod_1.z.number().min(-2).max(2).optional(),
        presencePenalty: zod_1.z.number().min(-2).max(2).optional()
    })
});
// ============= ENDPOINTS =============
/**
 * GET /api/providers
 * Отримати список всіх провайдерів
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Отримати з БД
        const providers = [
            {
                id: '1',
                providerName: 'OpenAI',
                accountName: 'Production Account',
                apiKey: 'sk-***************************',
                isActive: true,
                addedAt: new Date().toISOString(),
                requestCount: 1234,
                models: ['gpt-4-turbo', 'gpt-4']
            }
        ];
        res.json(providers);
    }
    catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
}));
/**
 * POST /api/providers
 * Додати новий Provider Account
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = ProviderAccountSchema.parse(req.body);
        // TODO: Зберегти в БД
        const newProvider = {
            id: Date.now().toString(),
            providerName: validatedData.providerId,
            accountName: validatedData.accountName,
            apiKey: validatedData.apiKey,
            apiEndpoint: validatedData.apiEndpoint,
            isActive: true,
            addedAt: new Date().toISOString(),
            requestCount: 0,
            models: validatedData.models || []
        };
        res.status(201).json(newProvider);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        else {
            console.error('Error creating provider:', error);
            res.status(500).json({ error: 'Failed to create provider' });
        }
    }
}));
/**
 * PUT /api/providers/:id
 * Оновити існуючий Provider Account
 */
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // TODO: Оновити в БД
        const updatedProvider = Object.assign(Object.assign({ id }, updates), { updatedAt: new Date().toISOString() });
        res.json(updatedProvider);
    }
    catch (error) {
        console.error('Error updating provider:', error);
        res.status(500).json({ error: 'Failed to update provider' });
    }
}));
/**
 * DELETE /api/providers/:id
 * Видалити Provider Account
 */
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // TODO: Видалити з БД
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting provider:', error);
        res.status(500).json({ error: 'Failed to delete provider' });
    }
}));
/**
 * GET /api/providers/:id/models
 * Отримати моделі для Provider Account
 */
router.get('/:id/models', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // TODO: Отримати з БД
        const models = [
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
            { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' }
        ];
        res.json(models);
    }
    catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch models' });
    }
}));
/**
 * POST /api/providers/:id/models/config
 * Зберегти конфігурацію моделі
 */
router.post('/:id/models/config', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const validatedData = ModelConfigSchema.parse(req.body);
        // TODO: Зберегти конфігурацію в БД
        const savedConfig = Object.assign(Object.assign({ providerId: id }, validatedData), { savedAt: new Date().toISOString() });
        res.json({ success: true, config: savedConfig });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        else {
            console.error('Error saving config:', error);
            res.status(500).json({ error: 'Failed to save configuration' });
        }
    }
}));
/**
 * POST /api/providers/:id/test
 * Тестувати підключення до провайдера
 */
router.post('/:id/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { modelId, testPrompt = 'Hello, world!' } = req.body;
        const startTime = Date.now();
        // TODO: Реальний тест підключення
        // Simulate API call
        yield new Promise(resolve => setTimeout(resolve, 200));
        const latency = Date.now() - startTime;
        res.json({
            success: true,
            latency,
            message: 'Connection successful'
        });
    }
    catch (error) {
        console.error('Error testing connection:', error);
        res.status(500).json({
            success: false,
            message: 'Connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
/**
 * GET /api/providers/:id/stats
 * Отримати статистику для провайдера
 */
router.get('/:id/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // TODO: Отримати реальну статистику з БД
        const stats = {
            providerId: id,
            totalRequests: 1234,
            successfulRequests: 1210,
            failedRequests: 24,
            avgLatency: 245,
            totalTokens: 56789,
            estimatedCost: 12.45,
            lastUpdated: new Date().toISOString(),
            topModel: {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                requests: 890
            }
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
}));
/**
 * GET /api/providers/stats/overall
 * Отримати загальну статистику по всіх провайдерах
 */
router.get('/stats/overall', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: Отримати реальну статистику з БД
        const overallStats = {
            totalRequests: 12345,
            successfulRequests: 12156,
            failedRequests: 189,
            successRate: 98.5,
            avgLatency: 245,
            totalCost: 127.50,
            lastUpdated: new Date().toISOString(),
            providers: [
                {
                    id: '1',
                    name: 'OpenAI',
                    requests: 5234,
                    successRate: 99.2
                }
            ]
        };
        res.json(overallStats);
    }
    catch (error) {
        console.error('Error fetching overall stats:', error);
        res.status(500).json({ error: 'Failed to fetch overall statistics' });
    }
}));
exports.default = router;
