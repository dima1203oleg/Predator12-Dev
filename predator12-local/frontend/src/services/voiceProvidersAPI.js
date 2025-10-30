"use strict";
/**
 * 🎤 Voice Providers Backend API Service
 * TypeScript клієнт для роботи з Voice Providers API
 * Частина Premium FREE Voice System Predator12 Nexus Core V5.2
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
exports.DEFAULT_PROVIDERS_CONFIG = exports.VOICE_PROVIDERS_ENDPOINTS = exports.VoiceProvidersAPI = exports.voiceProvidersAPI = void 0;
class VoiceProvidersAPI {
    constructor(baseURL = 'http://localhost:8000/api/voice-providers') {
        this.baseURL = baseURL;
    }
    setAuthToken(token) {
        this.authToken = token;
    }
    request(endpoint, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseURL}${endpoint}`;
            const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers);
            if (this.authToken) {
                headers.Authorization = `Bearer ${this.authToken}`;
            }
            try {
                const response = yield fetch(url, Object.assign(Object.assign({}, options), { headers }));
                if (!response.ok) {
                    const errorData = yield response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(`API Error: ${response.status} - ${errorData.detail || response.statusText}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('🚨 Voice Providers API Error:', error);
                throw error;
            }
        });
    }
    // Провайдери
    getProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('📋 Завантаження провайдерів...');
            return this.request('/providers');
        });
    }
    createProvider(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('➕ Створення провайдера:', provider.name);
            return this.request('/providers', {
                method: 'POST',
                body: JSON.stringify(provider),
            });
        });
    }
    updateProvider(providerId, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔄 Оновлення провайдера:', providerId);
            return this.request(`/providers/${providerId}`, {
                method: 'PUT',
                body: JSON.stringify(provider),
            });
        });
    }
    deleteProvider(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🗑️ Видалення провайдера:', providerId);
            return this.request(`/providers/${providerId}`, {
                method: 'DELETE',
            });
        });
    }
    testProvider(providerId, testData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🧪 Тестування провайдера:', providerId, testData.test_type);
            return this.request(`/providers/${providerId}/test`, {
                method: 'POST',
                body: JSON.stringify(testData),
            });
        });
    }
    // Налаштування
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('⚙️ Завантаження налаштувань...');
            return this.request('/settings');
        });
    }
    updateSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('💾 Збереження налаштувань...');
            return this.request('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            });
        });
    }
    // Статистика
    getUsageStats() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('📊 Завантаження статистики...');
            return this.request('/usage/stats');
        });
    }
    logUsage(usage) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('/usage/log', {
                method: 'POST',
                body: JSON.stringify(usage),
            });
        });
    }
    // Здоров'я API
    checkHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.request('/health');
            }
            catch (error) {
                console.warn('⚠️ Voice Providers API недоступний:', error);
                return {
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
    // Utility методи
    isBackendAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const health = yield this.checkHealth();
                return health.status === 'healthy';
            }
            catch (_a) {
                return false;
            }
        });
    }
    getProviderById(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = yield this.getProviders();
                return providers.find(p => p.id === providerId) || null;
            }
            catch (_a) {
                return null;
            }
        });
    }
    getProvidersByCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = yield this.getProviders();
                return providers.filter(p => p.category === category);
            }
            catch (_a) {
                return [];
            }
        });
    }
    getAvailableProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = yield this.getProviders();
                return providers.filter(p => p.status !== 'disabled' && p.status !== 'error');
            }
            catch (_a) {
                return [];
            }
        });
    }
    getFreeProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = yield this.getProviders();
                return providers.filter(p => p.type === 'free');
            }
            catch (_a) {
                return [];
            }
        });
    }
    updateProviderStatus(providerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = yield this.getProviderById(providerId);
                if (!provider)
                    return null;
                provider.status = status;
                provider.updated_at = new Date().toISOString();
                return yield this.updateProvider(providerId, provider);
            }
            catch (_a) {
                return null;
            }
        });
    }
    incrementUsageCount(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = yield this.getProviderById(providerId);
                if (!provider)
                    return;
                provider.usage_count += 1;
                provider.updated_at = new Date().toISOString();
                yield this.updateProvider(providerId, provider);
            }
            catch (error) {
                console.warn('⚠️ Не вдалося оновити лічильник використання:', error);
            }
        });
    }
    // Batch операції
    resetAllUsageCounters() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = yield this.getProviders();
                let updatedCount = 0;
                for (const provider of providers) {
                    if (provider.usage_count > 0) {
                        provider.usage_count = 0;
                        provider.updated_at = new Date().toISOString();
                        yield this.updateProvider(provider.id, provider);
                        updatedCount++;
                    }
                }
                console.log(`🔄 Скинуто лічильники для ${updatedCount} провайдерів`);
                return updatedCount;
            }
            catch (error) {
                console.error('❌ Помилка скидання лічильників:', error);
                return 0;
            }
        });
    }
    validateAllProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providers = yield this.getProviders();
                const results = [];
                let valid = 0;
                let invalid = 0;
                for (const provider of providers) {
                    if (provider.status === 'disabled')
                        continue;
                    try {
                        const testData = {
                            provider_id: provider.id,
                            test_type: provider.category,
                            text: provider.category === 'tts' ? provider.test_phrase : undefined,
                            language: 'uk-UA'
                        };
                        const result = yield this.testProvider(provider.id, testData);
                        results.push(result);
                        if (result.success) {
                            valid++;
                            yield this.updateProviderStatus(provider.id, 'configured');
                        }
                        else {
                            invalid++;
                            yield this.updateProviderStatus(provider.id, 'error');
                        }
                    }
                    catch (error) {
                        invalid++;
                        yield this.updateProviderStatus(provider.id, 'error');
                        results.push({
                            provider_id: provider.id,
                            test_type: provider.category,
                            success: false,
                            result: `Error: ${error}`,
                            duration_ms: 0,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                console.log(`✅ Валідація завершена: ${valid} валідних, ${invalid} з помилками`);
                return { valid, invalid, results };
            }
            catch (error) {
                console.error('❌ Помилка валідації провайдерів:', error);
                return { valid: 0, invalid: 0, results: [] };
            }
        });
    }
}
exports.VoiceProvidersAPI = VoiceProvidersAPI;
// Singleton інстанс
exports.voiceProvidersAPI = new VoiceProvidersAPI();
// Константи для швидкого доступу
exports.VOICE_PROVIDERS_ENDPOINTS = {
    PROVIDERS: '/providers',
    SETTINGS: '/settings',
    USAGE_STATS: '/usage/stats',
    USAGE_LOG: '/usage/log',
    HEALTH: '/health'
};
exports.DEFAULT_PROVIDERS_CONFIG = {
    TTS: {
        COQUI: 'coqui_tts',
        GTTS: 'gtts',
        PYTTSX3: 'pyttsx3'
    },
    STT: {
        FASTER_WHISPER: 'faster_whisper',
        WHISPER: 'whisper',
        VOSK: 'vosk'
    }
};
