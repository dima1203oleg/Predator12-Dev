"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const voiceProvidersAPI_1 = require("../../services/voiceProvidersAPI");
const VoiceProvidersAdmin = ({ open = false, onClose }) => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [providers, setProviders] = (0, react_1.useState)([]);
    const [settings, setSettings] = (0, react_1.useState)(null);
    const [usageStats, setUsageStats] = (0, react_1.useState)(null);
    const [configDialog, setConfigDialog] = (0, react_1.useState)({ open: false });
    const [showApiKeys, setShowApiKeys] = (0, react_1.useState)({});
    const [testingProvider, setTestingProvider] = (0, react_1.useState)(null);
    const [saveStatus, setSaveStatus] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [backendAvailable, setBackendAvailable] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Ініціалізація - завантаження даних з backend
    (0, react_1.useEffect)(() => {
        const loadData = () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('🎤 Завантаження даних Voice Providers Admin...');
            setLoading(true);
            setError(null);
            try {
                // Перевірка доступності backend
                const isBackendHealthy = yield voiceProvidersAPI_1.voiceProvidersAPI.isBackendAvailable();
                setBackendAvailable(isBackendHealthy);
                if (isBackendHealthy) {
                    console.log('✅ Backend доступний, завантажуємо дані...');
                    // Завантажуємо всі дані паралельно
                    const [providersData, settingsData, statsData] = yield Promise.all([
                        voiceProvidersAPI_1.voiceProvidersAPI.getProviders(),
                        voiceProvidersAPI_1.voiceProvidersAPI.getSettings(),
                        voiceProvidersAPI_1.voiceProvidersAPI.getUsageStats()
                    ]);
                    setProviders(providersData);
                    setSettings(settingsData);
                    setUsageStats(statsData);
                    console.log('📋 Завантажено провайдерів:', providersData.length);
                    console.log('⚙️ Завантажено налаштування:', settingsData);
                    console.log('📊 Завантажено статистику:', statsData.total_requests, 'запитів');
                }
                else {
                    console.warn('⚠️ Backend недоступний, використовуємо локальні дані');
                    // Fallback до локальних даних
                    initializeLocalProviders();
                }
            }
            catch (error) {
                console.error('❌ Помилка завантаження даних:', error);
                setError(`Помилка підключення до backend: ${error}`);
                // Fallback до локальних даних
                initializeLocalProviders();
            }
            finally {
                setLoading(false);
            }
        });
        loadData();
    }, []);
    // Ініціалізація локальних провайдерів якщо backend недоступний
    const initializeLocalProviders = () => {
        var _a, _b, _c, _d;
        console.log('🏠 Ініціалізація локальних провайдерів...');
        const localProviders = [
            {
                id: 'coqui_tts',
                name: 'Coqui TTS (Local)',
                category: 'tts',
                type: 'free',
                status: 'available',
                quality: 5,
                speed: 3,
                languages: ['uk-UA', 'en-US', 'ru-RU'],
                description: 'Локальний open-source TTS з підтримкою української мови',
                features: ['Офлайн робота', 'Висока якість', 'Мультимовність'],
                limits: { free: 'Необмежено (локально)' },
                pricing: { free: true },
                test_phrase: 'Привіт! Це тест голосового синтезу.',
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'faster_whisper',
                name: 'Faster Whisper (Local)',
                category: 'stt',
                type: 'free',
                status: 'available',
                quality: 5,
                speed: 4,
                languages: ['uk-UA', 'en-US', 'ru-RU'],
                description: 'Оптимізована версія OpenAI Whisper',
                features: ['Офлайн робота', 'Висока точність', 'Швидкість'],
                limits: { free: 'Необмежено (локально)' },
                pricing: { free: true },
                test_phrase: 'Скажіть будь-що українською або англійською',
                usage_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        setProviders(localProviders);
        const defaultSettings = {
            default_tts_provider: 'coqui_tts',
            default_stt_provider: 'faster_whisper',
            fallback_enabled: true,
            fallback_order: ['api', 'local', 'browser'],
            auto_switch_on_error: true,
            usage_analytics: true,
            language_preference: 'uk-UA',
            quality_preference: 'balanced'
        };
        setSettings(defaultSettings);
        // Збереження налаштувань провайдера
        const handleSaveProvider = (provider) => __awaiter(void 0, void 0, void 0, function* () {
            setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [provider.id]: 'saving' })));
            try {
                if (backendAvailable) {
                    console.log('💾 Збереження провайдера в backend:', provider.name);
                    // Перевіряємо чи провайдер існує
                    const existingProvider = yield voiceProvidersAPI_1.voiceProvidersAPI.getProviderById(provider.id);
                    if (existingProvider) {
                        // Оновлюємо існуючий
                        yield voiceProvidersAPI_1.voiceProvidersAPI.updateProvider(provider.id, provider);
                    }
                    else {
                        // Створюємо новий
                        yield voiceProvidersAPI_1.voiceProvidersAPI.createProvider(provider);
                    }
                    // Оновлюємо локальний стан
                    setProviders(prev => {
                        const index = prev.findIndex(p => p.id === provider.id);
                        if (index >= 0) {
                            prev[index] = provider;
                            return [...prev];
                        }
                        else {
                            return [...prev, provider];
                        }
                    });
                    console.log('✅ Провайдер збережено:', provider.name);
                    setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [provider.id]: 'saved' })));
                }
                else {
                    // Локальне збереження
                    console.log('🏠 Локальне збереження провайдера:', provider.name);
                    setProviders(prev => {
                        const index = prev.findIndex(p => p.id === provider.id);
                        if (index >= 0) {
                            prev[index] = provider;
                            return [...prev];
                        }
                        else {
                            return [...prev, provider];
                        }
                    });
                    setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [provider.id]: 'saved' })));
                }
            }
            catch (error) {
                console.error('❌ Помилка збереження провайдера:', error);
                setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [provider.id]: 'error' })));
            }
            // Очищуємо статус через 3 секунди
            setTimeout(() => {
                setSaveStatus(prev => {
                    const newStatus = Object.assign({}, prev);
                    delete newStatus[provider.id];
                    return newStatus;
                });
            }, 3000);
        });
        // Тестування провайдера
        const handleTestProvider = (provider) => __awaiter(void 0, void 0, void 0, function* () {
            setTestingProvider(provider.id);
            try {
                if (backendAvailable) {
                    console.log('🧪 Тестування провайдера через backend:', provider.name);
                    const testData = {
                        provider_id: provider.id,
                        test_type: provider.category,
                        text: provider.category === 'tts' ? provider.test_phrase : undefined,
                        language: 'uk-UA'
                    };
                    const result = yield voiceProvidersAPI_1.voiceProvidersAPI.testProvider(provider.id, testData);
                    if (result.success) {
                        console.log('✅ Тест пройдено:', result.result);
                        alert(`✅ Тест пройдено!\n${result.result}\nЧас: ${result.duration_ms}мс`);
                        // Оновлюємо статус провайдера
                        const updatedProvider = Object.assign(Object.assign({}, provider), { status: 'configured', last_tested: new Date().toISOString() });
                        yield handleSaveProvider(updatedProvider);
                    }
                    else {
                        console.error('❌ Тест не пройдено:', result.result);
                        alert(`❌ Тест не пройдено!\n${result.result}`);
                        // Оновлюємо статус провайдера
                        const updatedProvider = Object.assign(Object.assign({}, provider), { status: 'error', last_tested: new Date().toISOString() });
                        yield handleSaveProvider(updatedProvider);
                    }
                }
                else {
                    // Локальне тестування (симуляція)
                    console.log('🏠 Локальне тестування провайдера:', provider.name);
                    yield new Promise(resolve => setTimeout(resolve, 1000)); // Симуляція запиту
                    const success = Math.random() > 0.3; // 70% успішність
                    if (success) {
                        alert(`✅ Локальний тест пройдено!\nПровайдер: ${provider.name}\nКатегорія: ${provider.category}`);
                        provider.status = 'configured';
                    }
                    else {
                        alert(`❌ Локальний тест не пройдено!\nПровайдер: ${provider.name}\nПомилка: Тимчасова недоступність`);
                        provider.status = 'error';
                    }
                    provider.last_tested = new Date().toISOString();
                    yield handleSaveProvider(provider);
                }
            }
            catch (error) {
                console.error('❌ Помилка тестування:', error);
                alert(`❌ Помилка тестування!\n${error}`);
            }
            finally {
                setTestingProvider(null);
            }
        });
        // Збереження глобальних налаштувань
        const handleSaveSettings = (newSettings) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (backendAvailable) {
                    console.log('💾 Збереження налаштувань в backend...');
                    yield voiceProvidersAPI_1.voiceProvidersAPI.updateSettings(newSettings);
                    console.log('✅ Налаштування збережено в backend');
                }
                else {
                    console.log('🏠 Локальне збереження налаштувань...');
                    // Локальне збереження в localStorage
                    localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
                    console.log('✅ Налаштування збережено локально');
                }
                setSettings(newSettings);
            }
            catch (error) {
                console.error('❌ Помилка збереження налаштувань:', error);
                alert(`❌ Помилка збереження налаштувань!\n${error}`);
            }
        });
        // Оновлення статистики
        const refreshStats = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!backendAvailable)
                return;
            try {
                console.log('🔄 Оновлення статистики...');
                const stats = yield voiceProvidersAPI_1.voiceProvidersAPI.getUsageStats();
                setUsageStats(stats);
                console.log('✅ Статистика оновлена');
            }
            catch (error) {
                console.error('❌ Помилка оновлення статистики:', error);
            }
        });
        // Видалення провайдера
        const handleDeleteProvider = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
            if (!confirm('Ви впевнені, що хочете видалити цей провайдер?'))
                return;
            try {
                if (backendAvailable) {
                    console.log('🗑️ Видалення провайдера з backend:', providerId);
                    yield voiceProvidersAPI_1.voiceProvidersAPI.deleteProvider(providerId);
                }
                // Видаляємо з локального стану
                setProviders(prev => prev.filter(p => p.id !== providerId));
                console.log('✅ Провайдер видалено:', providerId);
            }
            catch (error) {
                console.error('❌ Помилка видалення провайдера:', error);
                alert(`❌ Помилка видалення!\n${error}`);
            }
        });
        (0, react_1.useEffect)(() => {
            initializeProviders();
        }, []);
        const initializeProviders = () => {
            const defaultProviders = [
                // ============================================
                // TTS ПРОВАЙДЕРИ
                // ============================================
                // БЕЗКОШТОВНІ TTS
                {
                    id: 'coqui-tts',
                    name: 'Coqui TTS',
                    category: 'tts',
                    type: 'free',
                    status: 'available',
                    quality: 5,
                    speed: 4,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Найкращий безкоштовний TTS з нейронними голосами',
                    features: ['Офлайн', 'Нейронні голоси', 'Багатомовність', 'Open Source'],
                    pricing: { free: true },
                    documentation: 'https://github.com/coqui-ai/TTS',
                    testPhrase: 'Привіт! Я тестую Coqui TTS систему.'
                },
                {
                    id: 'gtts',
                    name: 'Google TTS (gTTS)',
                    category: 'tts',
                    type: 'free',
                    status: 'available',
                    quality: 4,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi'],
                    description: 'Google TTS без API ключа',
                    features: ['Швидкий', 'Якісний', 'Багато мов', 'Без ключів'],
                    limits: { free: 'Необмежено (залежить від інтернету)' },
                    pricing: { free: true },
                    documentation: 'https://github.com/pndurette/gTTS',
                    testPhrase: 'Hello! Testing Google TTS system.'
                },
                {
                    id: 'pyttsx3',
                    name: 'System TTS (pyttsx3)',
                    category: 'tts',
                    type: 'free',
                    status: 'available',
                    quality: 3,
                    speed: 5,
                    languages: ['uk', 'en', 'system'],
                    description: 'Системні голоси операційної системи',
                    features: ['Офлайн', 'Швидкий', 'Завжди доступний', 'Системні голоси'],
                    pricing: { free: true },
                    testPhrase: 'Testing system voice synthesis.'
                },
                // FREEMIUM TTS
                {
                    id: 'elevenlabs',
                    name: 'ElevenLabs',
                    category: 'tts',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 5,
                    speed: 4,
                    languages: ['en', 'uk', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Найреалістичніші AI голоси',
                    features: ['Ultra реалістичні', 'Клонування голосу', 'Емоції', 'Акценти'],
                    limits: {
                        free: '10,000 символів/місяць',
                        paid: 'Від 30,000 символів/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '10k символів/місяць',
                        paidFrom: '$5/місяць'
                    },
                    documentation: 'https://elevenlabs.io/docs',
                    testPhrase: 'Amazing realistic voice synthesis with ElevenLabs.'
                },
                {
                    id: 'google-cloud-tts',
                    name: 'Google Cloud TTS',
                    category: 'tts',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 5,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ar', 'hi'],
                    description: 'Google Cloud нейронні голоси',
                    features: ['WaveNet голоси', 'Neural2', 'SSML', 'Багато мов'],
                    limits: {
                        free: '1 млн символів/місяць',
                        paid: 'Від 1 млн символів/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '1M символів/місяць',
                        paidFrom: '$4/1M символів'
                    },
                    documentation: 'https://cloud.google.com/text-to-speech/docs',
                    testPhrase: 'Google Cloud neural voice synthesis test.'
                },
                {
                    id: 'azure-speech',
                    name: 'Azure Speech',
                    category: 'tts',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 5,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Microsoft Azure нейронні голоси',
                    features: ['Neural голоси', 'Custom Voice', 'SSML', 'Real-time'],
                    limits: {
                        free: '500,000 символів/місяць',
                        paid: 'Від 500k символів/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '500k символів/місяць',
                        paidFrom: '$4/1M символів'
                    },
                    documentation: 'https://docs.microsoft.com/azure/cognitive-services/speech-service/',
                    testPhrase: 'Azure neural voice synthesis demonstration.'
                },
                {
                    id: 'aws-polly',
                    name: 'AWS Polly',
                    category: 'tts',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 4,
                    speed: 4,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Amazon Polly TTS сервіс',
                    features: ['Neural голоси', 'SSML', 'Lexicons', 'Speech marks'],
                    limits: {
                        free: '5 млн символів/місяць (12 місяців)',
                        paid: 'Від 5 млн символів/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '5M символів/місяць (1 рік)',
                        paidFrom: '$4/1M символів'
                    },
                    documentation: 'https://docs.aws.amazon.com/polly/',
                    testPhrase: 'AWS Polly text to speech service test.'
                },
                // ============================================
                // STT ПРОВАЙДЕРИ
                // ============================================
                // БЕЗКОШТОВНІ STT
                {
                    id: 'faster-whisper',
                    name: 'Faster Whisper',
                    category: 'stt',
                    type: 'free',
                    status: 'available',
                    quality: 5,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Оптимізована версія OpenAI Whisper',
                    features: ['5-10x швидше', 'Офлайн', 'Висока точність', 'INT8 квантізація'],
                    pricing: { free: true },
                    documentation: 'https://github.com/guillaumekln/faster-whisper',
                    testPhrase: 'Testing faster whisper speech recognition.'
                },
                {
                    id: 'whisper',
                    name: 'OpenAI Whisper',
                    category: 'stt',
                    type: 'free',
                    status: 'available',
                    quality: 5,
                    speed: 3,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Офіційний OpenAI Whisper',
                    features: ['Офлайн', 'Висока точність', 'Багатомовність', 'Open Source'],
                    pricing: { free: true },
                    documentation: 'https://github.com/openai/whisper',
                    testPhrase: 'OpenAI Whisper speech to text test.'
                },
                {
                    id: 'vosk',
                    name: 'Vosk',
                    category: 'stt',
                    type: 'free',
                    status: 'available',
                    quality: 4,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh'],
                    description: 'Швидкий офлайн STT для real-time',
                    features: ['Real-time', 'Офлайн', 'Малі моделі', 'Швидкий'],
                    pricing: { free: true },
                    documentation: 'https://alphacephei.com/vosk/',
                    testPhrase: 'Vosk real-time speech recognition test.'
                },
                // FREEMIUM STT
                {
                    id: 'google-cloud-stt',
                    name: 'Google Cloud STT',
                    category: 'stt',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 5,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Google Cloud Speech-to-Text',
                    features: ['Висока точність', 'Real-time', 'Автопунктуація', 'Профанність фільтр'],
                    limits: {
                        free: '60 хвилин/місяць',
                        paid: 'Від 60 хвилин/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '60 хв/місяць',
                        paidFrom: '$0.006/15сек'
                    },
                    documentation: 'https://cloud.google.com/speech-to-text/docs'
                },
                {
                    id: 'azure-speech-stt',
                    name: 'Azure Speech STT',
                    category: 'stt',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 5,
                    speed: 5,
                    languages: ['uk', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'],
                    description: 'Microsoft Azure Speech-to-Text',
                    features: ['Custom модель', 'Real-time', 'Batch', 'Conversation'],
                    limits: {
                        free: '5 годин/місяць',
                        paid: 'Від 5 годин/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '5 годин/місяць',
                        paidFrom: '$1/година'
                    },
                    documentation: 'https://docs.microsoft.com/azure/cognitive-services/speech-service/'
                },
                {
                    id: 'assemblyai',
                    name: 'AssemblyAI',
                    category: 'stt',
                    type: 'freemium',
                    status: 'disabled',
                    quality: 5,
                    speed: 4,
                    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'uk'],
                    description: 'AI-powered STT з додатковими фічами',
                    features: ['Sentiment analysis', 'Entity detection', 'Summarization', 'Punctuation'],
                    limits: {
                        free: '3 години/місяць',
                        paid: 'Від 3 годин/місяць'
                    },
                    pricing: {
                        free: false,
                        freeTier: '3 години/місяць',
                        paidFrom: '$0.37/година'
                    },
                    documentation: 'https://docs.assemblyai.com/'
                }
            ];
            setProviders(defaultProviders);
        };
        const handleTabChange = (event, newValue) => {
            setCurrentTab(newValue);
        };
        const toggleProvider = (providerId) => {
            setProviders(prev => prev.map(p => p.id === providerId
                ? Object.assign(Object.assign({}, p), { status: p.status === 'disabled' ? 'available' : 'disabled' }) : p));
        };
        const openConfigDialog = (provider) => {
            setConfigDialog({ open: true, provider: Object.assign({}, provider) });
        };
        const closeConfigDialog = () => {
            setConfigDialog({ open: false });
        };
        const saveProviderConfig = () => {
            if (!configDialog.provider)
                return;
            setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [configDialog.provider.id]: 'saving' })));
            // Симуляція збереження
            setTimeout(() => {
                setProviders(prev => prev.map(p => p.id === configDialog.provider.id ? Object.assign({}, configDialog.provider) : p));
                setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [configDialog.provider.id]: 'saved' })));
                closeConfigDialog();
                // Очищення статусу через 3 секунди
                setTimeout(() => {
                    setSaveStatus(prev => (Object.assign(Object.assign({}, prev), { [configDialog.provider.id]: undefined })));
                }, 3000);
            }, 1000);
        };
        const testProvider = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
            setTestingProvider(providerId);
            // Симуляція тестування
            setTimeout(() => {
                setTestingProvider(null);
                // Тут можна додати реальний тест провайдера
            }, 2000);
        });
        const toggleApiKeyVisibility = (providerId) => {
            setShowApiKeys(prev => (Object.assign(Object.assign({}, prev), { [providerId]: !prev[providerId] })));
        };
        const getStatusColor = (status) => {
            switch (status) {
                case 'configured': return 'success';
                case 'available': return 'info';
                case 'error': return 'error';
                case 'disabled': return 'default';
                default: return 'default';
            }
        };
        const getStatusIcon = (status) => {
            switch (status) {
                case 'configured': return <icons_material_1.CheckCircle />;
                case 'available': return <icons_material_1.Info />;
                case 'error': return <icons_material_1.Error />;
                case 'disabled': return null;
                default: return <icons_material_1.Info />;
            }
        };
        const getTypeIcon = (type) => {
            switch (type) {
                case 'free': return <icons_material_1.MonetizationOff color="success"/>;
                case 'freemium': return <icons_material_1.AttachMoney color="warning"/>;
                case 'paid': return <icons_material_1.AttachMoney color="error"/>;
                default: return <icons_material_1.Info />;
            }
        };
        const getCategoryIcon = (category) => {
            return category === 'tts' ? <icons_material_1.VolumeUp /> : <icons_material_1.Hearing />;
        };
        const renderStars = (rating) => (<material_1.Box display="flex">
      {[1, 2, 3, 4, 5].map(star => (<icons_material_1.Star key={star} sx={{
                    color: star <= rating ? '#ffd700' : '#e0e0e0',
                    fontSize: '16px'
                }}/>))}
    </material_1.Box>);
        const filteredProviders = providers.filter(p => {
            if (currentTab === 0)
                return true; // Всі
            if (currentTab === 1)
                return p.category === 'tts';
            if (currentTab === 2)
                return p.category === 'stt';
            if (currentTab === 3)
                return p.type === 'free';
            if (currentTab === 4)
                return p.type === 'freemium';
            return true;
        });
        if (loading) {
            return (<material_1.Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <material_1.DialogTitle>Завантаження...</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box display="flex" justifyContent="center" p={4}>
            <material_1.LinearProgress sx={{ width: '100%' }}/>
          </material_1.Box>
        </material_1.DialogContent>
      </material_1.Dialog>);
        }
        return (<material_1.Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{
                sx: { height: '90vh' }
            }}>
      <material_1.DialogTitle>
        <material_1.Box display="flex" alignItems="center" gap={2}>
          <icons_material_1.Settings />
          <material_1.Typography variant="h6">
            🎤 Налаштування голосових провайдерів
          </material_1.Typography>
          {!backendAvailable && (<material_1.Chip label="Локальний режим" color="warning" size="small" icon={<OfflineIcon />}/>)}
        </material_1.Box>
        {error && (<material_1.Alert severity="warning" sx={{ mt: 1 }}>
            {error}
          </material_1.Alert>)}
      </material_1.DialogTitle>

      <material_1.DialogContent dividers>
        <material_1.Box sx={{ height: '100%' }}>
          {/* Tab Navigation */}
          <material_1.Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <material_1.Box mb={3}>
        <material_1.Typography variant="h4" gutterBottom display="flex" alignItems="center">
          <icons_material_1.Settings sx={{ mr: 2, color: '#1976d2' }}/>
          Voice Providers Admin Panel
        </material_1.Typography>
        <material_1.Typography variant="subtitle1" color="text.secondary">
          Управління TTS/STT провайдерами, API ключами та моделями
        </material_1.Typography>
      </material_1.Box>

      {/* Tabs */}
      <material_1.Paper sx={{ mb: 3 }}>
        <material_1.Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <material_1.Tab icon={<icons_material_1.Api />} label="Всі провайдери"/>
          <material_1.Tab icon={<icons_material_1.VolumeUp />} label="TTS"/>
          <material_1.Tab icon={<icons_material_1.Hearing />} label="STT"/>
          <material_1.Tab icon={<icons_material_1.MonetizationOff />} label="Безкоштовні"/>
          <material_1.Tab icon={<icons_material_1.AttachMoney />} label="Freemium"/>
        </material_1.Tabs>
      </material_1.Paper>

      {/* Providers Grid */}
      <material_1.Grid container spacing={3}>
        {filteredProviders.map((provider) => (<material_1.Grid item xs={12} lg={6} key={provider.id}>
            <framer_motion_1.motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <material_1.Card sx={{
                    height: '100%',
                    opacity: provider.status === 'disabled' ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                }}>
                <material_1.CardContent>
                  {/* Provider Header */}
                  <material_1.Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <material_1.Box display="flex" alignItems="center" flex={1}>
                      {getCategoryIcon(provider.category)}
                      <material_1.Box ml={1} flex={1}>
                        <material_1.Typography variant="h6" component="div" display="flex" alignItems="center">
                          {provider.name}
                          <material_1.Box ml={1}>
                            {getTypeIcon(provider.type)}
                          </material_1.Box>
                        </material_1.Typography>
                        <material_1.Box display="flex" alignItems="center" mt={0.5}>
                          <material_1.Chip size="small" label={provider.status} color={getStatusColor(provider.status)} icon={getStatusIcon(provider.status)} sx={{ mr: 1 }}/>
                          <material_1.Typography variant="caption" color="text.secondary">
                            {provider.category.toUpperCase()}
                          </material_1.Typography>
                        </material_1.Box>
                      </material_1.Box>
                    </material_1.Box>

                    {/* Toggle Switch */}
                    <material_1.FormControlLabel control={<material_1.Switch checked={provider.status !== 'disabled'} onChange={() => toggleProvider(provider.id)} size="small"/>} label="" sx={{ m: 0 }}/>
                  </material_1.Box>

                  {/* Description */}
                  <material_1.Typography variant="body2" color="text.secondary" mb={2}>
                    {provider.description}
                  </material_1.Typography>

                  {/* Quality & Speed */}
                  <material_1.Box display="flex" justifyContent="space-between" mb={2}>
                    <material_1.Box>
                      <material_1.Typography variant="caption" display="block">
                        Якість
                      </material_1.Typography>
                      {renderStars(provider.quality)}
                    </material_1.Box>
                    <material_1.Box>
                      <material_1.Typography variant="caption" display="block">
                        Швидкість
                      </material_1.Typography>
                      {renderStars(provider.speed)}
                    </material_1.Box>
                  </material_1.Box>

                  {/* Features */}
                  <material_1.Box mb={2}>
                    <material_1.Typography variant="caption" display="block" mb={1}>
                      Особливості:
                    </material_1.Typography>
                    <material_1.Box display="flex" flexWrap="wrap" gap={0.5}>
                      {provider.features.slice(0, 3).map((feature, index) => (<material_1.Chip key={index} label={feature} size="small" variant="outlined" sx={{ fontSize: '10px', height: '20px' }}/>))}
                      {provider.features.length > 3 && (<material_1.Chip label={`+${provider.features.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '10px', height: '20px' }}/>)}
                    </material_1.Box>
                  </material_1.Box>

                  {/* Languages */}
                  <material_1.Box mb={2}>
                    <material_1.Typography variant="caption" display="block" mb={1}>
                      Мови: {provider.languages.length}
                    </material_1.Typography>
                    <material_1.Box display="flex" flexWrap="wrap" gap={0.5}>
                      {provider.languages.slice(0, 5).map((lang, index) => (<material_1.Chip key={index} label={lang} size="small" sx={{ fontSize: '10px', height: '18px' }}/>))}
                      {provider.languages.length > 5 && (<material_1.Chip label={`+${provider.languages.length - 5}`} size="small" sx={{ fontSize: '10px', height: '18px' }}/>)}
                    </material_1.Box>
                  </material_1.Box>

                  {/* Pricing */}
                  {provider.pricing && (<material_1.Box mb={2}>
                      {provider.pricing.free ? (<material_1.Chip label="100% Безкоштовно" color="success" size="small" icon={<icons_material_1.MonetizationOff />}/>) : (<material_1.Box>
                          <material_1.Chip label={`Free: ${provider.pricing.freeTier}`} color="info" size="small" sx={{ mr: 1, mb: 0.5 }}/>
                          <material_1.Chip label={`Paid: ${provider.pricing.paidFrom}`} color="warning" size="small"/>
                        </material_1.Box>)}
                    </material_1.Box>)}

                  {/* Action Buttons */}
                  <material_1.Box display="flex" gap={1} mt={2}>
                    <material_1.Button size="small" variant="outlined" startIcon={<icons_material_1.Settings />} onClick={() => openConfigDialog(provider)} disabled={provider.status === 'disabled'}>
                      Налаштувати
                    </material_1.Button>

                    <material_1.Button size="small" variant="outlined" startIcon={testingProvider === provider.id
                    ? <icons_material_1.Refresh sx={{ animation: 'spin 1s linear infinite' }}/>
                    : <icons_material_1.PlayArrow />} onClick={() => testProvider(provider.id)} disabled={provider.status === 'disabled' || testingProvider === provider.id}>
                      Тест
                    </material_1.Button>

                    {saveStatus[provider.id] === 'saving' && (<material_1.Box display="flex" alignItems="center" ml={1}>
                        <material_1.LinearProgress size={20}/>
                      </material_1.Box>)}
                    {saveStatus[provider.id] === 'saved' && (<material_1.Chip label="Збережено" color="success" size="small" icon={<icons_material_1.CheckCircle />}/>)}
                  </material_1.Box>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Configuration Dialog */}
      <material_1.Dialog open={configDialog.open} onClose={closeConfigDialog} maxWidth="md" fullWidth>
        <material_1.DialogTitle>
          <material_1.Box display="flex" alignItems="center">
            {configDialog.provider && getCategoryIcon(configDialog.provider.category)}
            <material_1.Box ml={1}>
              Налаштування: {(_a = configDialog.provider) === null || _a === void 0 ? void 0 : _a.name}
            </material_1.Box>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent>
          {configDialog.provider && (<material_1.Box mt={2}>
              {/* API Key */}
              {!((_b = configDialog.provider.pricing) === null || _b === void 0 ? void 0 : _b.free) && (<material_1.Box mb={3}>
                  <material_1.TextField fullWidth label="API Key" type={showApiKeys[configDialog.provider.id] ? 'text' : 'password'} value={configDialog.provider.apiKey || ''} onChange={(e) => setConfigDialog(prev => (Object.assign(Object.assign({}, prev), { provider: prev.provider ? Object.assign(Object.assign({}, prev.provider), { apiKey: e.target.value }) : undefined })))} InputProps={{
                        endAdornment: (<material_1.IconButton onClick={() => toggleApiKeyVisibility(configDialog.provider.id)} size="small">
                          {showApiKeys[configDialog.provider.id] ? <icons_material_1.VisibilityOff /> : <icons_material_1.Visibility />}
                        </material_1.IconButton>)
                    }} helperText="Отримайте API ключ на офіційному сайті провайдера"/>
                </material_1.Box>)}

              {/* Model Selection */}
              <material_1.Box mb={3}>
                <material_1.FormControl fullWidth>
                  <material_1.InputLabel>Модель</material_1.InputLabel>
                  <material_1.Select value={configDialog.provider.model || ''} onChange={(e) => setConfigDialog(prev => (Object.assign(Object.assign({}, prev), { provider: prev.provider ? Object.assign(Object.assign({}, prev.provider), { model: e.target.value }) : undefined })))}>
                    {configDialog.provider.category === 'tts' ? ([
                    <material_1.MenuItem value="standard">Standard</material_1.MenuItem>,
                    <material_1.MenuItem value="neural">Neural</material_1.MenuItem>,
                    <material_1.MenuItem value="premium">Premium</material_1.MenuItem>
                ]) : ([
                    <material_1.MenuItem value="base">Base</material_1.MenuItem>,
                    <material_1.MenuItem value="small">Small</material_1.MenuItem>,
                    <material_1.MenuItem value="medium">Medium</material_1.MenuItem>,
                    <material_1.MenuItem value="large">Large</material_1.MenuItem>
                ])}
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Box>

              {/* Region */}
              <material_1.Box mb={3}>
                <material_1.FormControl fullWidth>
                  <material_1.InputLabel>Регіон</material_1.InputLabel>
                  <material_1.Select value={configDialog.provider.region || ''} onChange={(e) => setConfigDialog(prev => (Object.assign(Object.assign({}, prev), { provider: prev.provider ? Object.assign(Object.assign({}, prev.provider), { region: e.target.value }) : undefined })))}>
                    <material_1.MenuItem value="us-east-1">US East (N. Virginia)</material_1.MenuItem>
                    <material_1.MenuItem value="us-west-2">US West (Oregon)</material_1.MenuItem>
                    <material_1.MenuItem value="eu-west-1">Europe (Ireland)</material_1.MenuItem>
                    <material_1.MenuItem value="eu-central-1">Europe (Frankfurt)</material_1.MenuItem>
                    <material_1.MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Box>

              {/* Custom Endpoint */}
              <material_1.Box mb={3}>
                <material_1.TextField fullWidth label="Custom Endpoint (опціонально)" value={configDialog.provider.endpoint || ''} onChange={(e) => setConfigDialog(prev => (Object.assign(Object.assign({}, prev), { provider: prev.provider ? Object.assign(Object.assign({}, prev.provider), { endpoint: e.target.value }) : undefined })))} helperText="Залиште пусте для використання стандартного endpoint"/>
              </material_1.Box>

              {/* Test Phrase */}
              <material_1.Box mb={3}>
                <material_1.TextField fullWidth label="Тестова фраза" multiline rows={2} value={configDialog.provider.testPhrase || ''} onChange={(e) => setConfigDialog(prev => (Object.assign(Object.assign({}, prev), { provider: prev.provider ? Object.assign(Object.assign({}, prev.provider), { testPhrase: e.target.value }) : undefined })))}/>
              </material_1.Box>

              {/* Provider Info */}
              <material_1.Alert severity="info" sx={{ mt: 2 }}>
                <material_1.Typography variant="body2">
                  <strong>Документація:</strong>{' '}
                  {configDialog.provider.documentation ? (<a href={configDialog.provider.documentation} target="_blank" rel="noopener noreferrer">
                      {configDialog.provider.documentation}
                    </a>) : ('Відсутня')}
                </material_1.Typography>
                {configDialog.provider.limits && (<material_1.Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Ліміти:</strong> {configDialog.provider.limits.free}
                    {configDialog.provider.limits.paid && (<span> | Платно: {configDialog.provider.limits.paid}</span>)}
                  </material_1.Typography>)}
              </material_1.Alert>
            </material_1.Box>)}
        </material_1.DialogContent>

        <material_1.DialogActions>
          <material_1.Button onClick={closeConfigDialog}>
            Скасувати
          </material_1.Button>
          <material_1.Button onClick={saveProviderConfig} variant="contained" startIcon={<icons_material_1.Save />} disabled={saveStatus[((_c = configDialog.provider) === null || _c === void 0 ? void 0 : _c.id) || ''] === 'saving'}>
            {saveStatus[((_d = configDialog.provider) === null || _d === void 0 ? void 0 : _d.id) || ''] === 'saving' ? 'Збереження...' : 'Зберегти'}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* CSS для анімації */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
        </></material_1.Box>
      </material_1.DialogContent>

      <material_1.DialogActions>
        <material_1.Button onClick={onClose}>
          Закрити
        </material_1.Button>
        {backendAvailable && (<material_1.Button onClick={refreshStats} startIcon={<icons_material_1.Refresh />}>
            Оновити статистику
          </material_1.Button>)}
      </material_1.DialogActions>
    </material_1.Dialog>);
    };
    export default VoiceProvidersAdmin;
};
