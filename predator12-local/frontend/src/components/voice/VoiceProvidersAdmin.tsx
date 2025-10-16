// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Badge,
  Divider,
  Paper
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Api as ApiIcon,
  VolumeUp as TTSIcon,
  Hearing as STTIcon,
  Cloud as CloudIcon,
  Computer as LocalIcon,
  Language as WebIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  PlayArrow as TestIcon,
  Star as StarIcon,
  MonetizationOff as FreeIcon,
  AttachMoney as PaidIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceProvidersAPI, type ProviderConfig, type VoiceSettings, type UsageStats } from '../../services/voiceProvidersAPI';

interface ProviderConfig {
  id: string;
  name: string;
  category: 'tts' | 'stt';
  type: 'free' | 'freemium' | 'paid';
  status: 'available' | 'configured' | 'error' | 'disabled';
  apiKey?: string;
  model?: string;
  region?: string;
  endpoint?: string;
  quality: 1 | 2 | 3 | 4 | 5;
  speed: 1 | 2 | 3 | 4 | 5;
  languages: string[];
  description: string;
  features: string[];
  limits?: {
    free: string;
    paid?: string;
  };
  pricing?: {
    free: boolean;
    freeTier?: string;
    paidFrom?: string;
  };
  documentation?: string;
  testPhrase?: string;
}

const VoiceProvidersAdmin: React.FC<{open?: boolean, onClose?: () => void}> = ({
  open = false,
  onClose
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [settings, setSettings] = useState<VoiceSettings | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [configDialog, setConfigDialog] = useState<{open: boolean, provider?: ProviderConfig}>({open: false});
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saving' | 'saved' | 'error'}>({});
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ініціалізація - завантаження даних з backend
  useEffect(() => {
    const loadData = async () => {
      console.log('🎤 Завантаження даних Voice Providers Admin...');
      setLoading(true);
      setError(null);

      try {
        // Перевірка доступності backend
        const isBackendHealthy = await voiceProvidersAPI.isBackendAvailable();
        setBackendAvailable(isBackendHealthy);

        if (isBackendHealthy) {
          console.log('✅ Backend доступний, завантажуємо дані...');

          // Завантажуємо всі дані паралельно
          const [providersData, settingsData, statsData] = await Promise.all([
            voiceProvidersAPI.getProviders(),
            voiceProvidersAPI.getSettings(),
            voiceProvidersAPI.getUsageStats()
          ]);

          setProviders(providersData);
          setSettings(settingsData);
          setUsageStats(statsData);

          console.log('📋 Завантажено провайдерів:', providersData.length);
          console.log('⚙️ Завантажено налаштування:', settingsData);
          console.log('📊 Завантажено статистику:', statsData.total_requests, 'запитів');
        } else {
          console.warn('⚠️ Backend недоступний, використовуємо локальні дані');
          // Fallback до локальних даних
          initializeLocalProviders();
        }
      } catch (error) {
        console.error('❌ Помилка завантаження даних:', error);
        setError(`Помилка підключення до backend: ${error}`);
        // Fallback до локальних даних
        initializeLocalProviders();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Ініціалізація локальних провайдерів якщо backend недоступний
  const initializeLocalProviders = () => {
    console.log('🏠 Ініціалізація локальних провайдерів...');

    const localProviders: ProviderConfig[] = [
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

    const defaultSettings: VoiceSettings = {
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
  const handleSaveProvider = async (provider: ProviderConfig) => {
    setSaveStatus(prev => ({ ...prev, [provider.id]: 'saving' }));

    try {
      if (backendAvailable) {
        console.log('💾 Збереження провайдера в backend:', provider.name);

        // Перевіряємо чи провайдер існує
        const existingProvider = await voiceProvidersAPI.getProviderById(provider.id);

        if (existingProvider) {
          // Оновлюємо існуючий
          await voiceProvidersAPI.updateProvider(provider.id, provider);
        } else {
          // Створюємо новий
          await voiceProvidersAPI.createProvider(provider);
        }

        // Оновлюємо локальний стан
        setProviders(prev => {
          const index = prev.findIndex(p => p.id === provider.id);
          if (index >= 0) {
            prev[index] = provider;
            return [...prev];
          } else {
            return [...prev, provider];
          }
        });

        console.log('✅ Провайдер збережено:', provider.name);
        setSaveStatus(prev => ({ ...prev, [provider.id]: 'saved' }));
      } else {
        // Локальне збереження
        console.log('🏠 Локальне збереження провайдера:', provider.name);
        setProviders(prev => {
          const index = prev.findIndex(p => p.id === provider.id);
          if (index >= 0) {
            prev[index] = provider;
            return [...prev];
          } else {
            return [...prev, provider];
          }
        });
        setSaveStatus(prev => ({ ...prev, [provider.id]: 'saved' }));
      }
    } catch (error) {
      console.error('❌ Помилка збереження провайдера:', error);
      setSaveStatus(prev => ({ ...prev, [provider.id]: 'error' }));
    }

    // Очищуємо статус через 3 секунди
    setTimeout(() => {
      setSaveStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[provider.id];
        return newStatus;
      });
    }, 3000);
  };

  // Тестування провайдера
  const handleTestProvider = async (provider: ProviderConfig) => {
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

        const result = await voiceProvidersAPI.testProvider(provider.id, testData);

        if (result.success) {
          console.log('✅ Тест пройдено:', result.result);
          alert(`✅ Тест пройдено!\n${result.result}\nЧас: ${result.duration_ms}мс`);

          // Оновлюємо статус провайдера
          const updatedProvider = { ...provider, status: 'configured' as const, last_tested: new Date().toISOString() };
          await handleSaveProvider(updatedProvider);
        } else {
          console.error('❌ Тест не пройдено:', result.result);
          alert(`❌ Тест не пройдено!\n${result.result}`);

          // Оновлюємо статус провайдера
          const updatedProvider = { ...provider, status: 'error' as const, last_tested: new Date().toISOString() };
          await handleSaveProvider(updatedProvider);
        }
      } else {
        // Локальне тестування (симуляція)
        console.log('🏠 Локальне тестування провайдера:', provider.name);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Симуляція запиту

        const success = Math.random() > 0.3; // 70% успішність
        if (success) {
          alert(`✅ Локальний тест пройдено!\nПровайдер: ${provider.name}\nКатегорія: ${provider.category}`);
          provider.status = 'configured';
        } else {
          alert(`❌ Локальний тест не пройдено!\nПровайдер: ${provider.name}\nПомилка: Тимчасова недоступність`);
          provider.status = 'error';
        }

        provider.last_tested = new Date().toISOString();
        await handleSaveProvider(provider);
      }
    } catch (error) {
      console.error('❌ Помилка тестування:', error);
      alert(`❌ Помилка тестування!\n${error}`);
    } finally {
      setTestingProvider(null);
    }
  };

  // Збереження глобальних налаштувань
  const handleSaveSettings = async (newSettings: VoiceSettings) => {
    try {
      if (backendAvailable) {
        console.log('💾 Збереження налаштувань в backend...');
        await voiceProvidersAPI.updateSettings(newSettings);
        console.log('✅ Налаштування збережено в backend');
      } else {
        console.log('🏠 Локальне збереження налаштувань...');
        // Локальне збереження в localStorage
        localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
        console.log('✅ Налаштування збережено локально');
      }

      setSettings(newSettings);
    } catch (error) {
      console.error('❌ Помилка збереження налаштувань:', error);
      alert(`❌ Помилка збереження налаштувань!\n${error}`);
    }
  };

  // Оновлення статистики
  const refreshStats = async () => {
    if (!backendAvailable) return;

    try {
      console.log('🔄 Оновлення статистики...');
      const stats = await voiceProvidersAPI.getUsageStats();
      setUsageStats(stats);
      console.log('✅ Статистика оновлена');
    } catch (error) {
      console.error('❌ Помилка оновлення статистики:', error);
    }
  };

  // Видалення провайдера
  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей провайдер?')) return;

    try {
      if (backendAvailable) {
        console.log('🗑️ Видалення провайдера з backend:', providerId);
        await voiceProvidersAPI.deleteProvider(providerId);
      }

      // Видаляємо з локального стану
      setProviders(prev => prev.filter(p => p.id !== providerId));
      console.log('✅ Провайдер видалено:', providerId);
    } catch (error) {
      console.error('❌ Помилка видалення провайдера:', error);
      alert(`❌ Помилка видалення!\n${error}`);
    }
  };
  useEffect(() => {
    initializeProviders();
  }, []);

  const initializeProviders = () => {
    const defaultProviders: ProviderConfig[] = [
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleProvider = (providerId: string) => {
    setProviders(prev => prev.map(p =>
      p.id === providerId
        ? { ...p, status: p.status === 'disabled' ? 'available' : 'disabled' }
        : p
    ));
  };

  const openConfigDialog = (provider: ProviderConfig) => {
    setConfigDialog({ open: true, provider: { ...provider } });
  };

  const closeConfigDialog = () => {
    setConfigDialog({ open: false });
  };

  const saveProviderConfig = () => {
    if (!configDialog.provider) return;

    setSaveStatus(prev => ({ ...prev, [configDialog.provider!.id]: 'saving' }));

    // Симуляція збереження
    setTimeout(() => {
      setProviders(prev => prev.map(p =>
        p.id === configDialog.provider!.id ? { ...configDialog.provider! } : p
      ));
      setSaveStatus(prev => ({ ...prev, [configDialog.provider!.id]: 'saved' }));
      closeConfigDialog();

      // Очищення статусу через 3 секунди
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [configDialog.provider!.id]: undefined }));
      }, 3000);
    }, 1000);
  };

  const testProvider = async (providerId: string) => {
    setTestingProvider(providerId);

    // Симуляція тестування
    setTimeout(() => {
      setTestingProvider(null);
      // Тут можна додати реальний тест провайдера
    }, 2000);
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured': return 'success';
      case 'available': return 'info';
      case 'error': return 'error';
      case 'disabled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured': return <CheckIcon />;
      case 'available': return <InfoIcon />;
      case 'error': return <ErrorIcon />;
      case 'disabled': return null;
      default: return <InfoIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'free': return <FreeIcon color="success" />;
      case 'freemium': return <PaidIcon color="warning" />;
      case 'paid': return <PaidIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === 'tts' ? <TTSIcon /> : <STTIcon />;
  };

  const renderStars = (rating: number) => (
    <Box display="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon
          key={star}
          sx={{
            color: star <= rating ? '#ffd700' : '#e0e0e0',
            fontSize: '16px'
          }}
        />
      ))}
    </Box>
  );

  const filteredProviders = providers.filter(p => {
    if (currentTab === 0) return true; // Всі
    if (currentTab === 1) return p.category === 'tts';
    if (currentTab === 2) return p.category === 'stt';
    if (currentTab === 3) return p.type === 'free';
    if (currentTab === 4) return p.type === 'freemium';
    return true;
  });

  if (loading) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Завантаження...</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <SettingsIcon />
          <Typography variant="h6">
            🎤 Налаштування голосових провайдерів
          </Typography>
          {!backendAvailable && (
            <Chip
              label="Локальний режим"
              color="warning"
              size="small"
              icon={<OfflineIcon />}
            />
          )}
        </Box>
        {error && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ height: '100%' }}>
          {/* Tab Navigation */}
          <Tabs
            value={currentTab}
            onChange={(_, value) => setCurrentTab(value)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
      <Box mb={3}>
        <Typography variant="h4" gutterBottom display="flex" alignItems="center">
          <SettingsIcon sx={{ mr: 2, color: '#1976d2' }} />
          Voice Providers Admin Panel
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Управління TTS/STT провайдерами, API ключами та моделями
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ApiIcon />} label="Всі провайдери" />
          <Tab icon={<TTSIcon />} label="TTS" />
          <Tab icon={<STTIcon />} label="STT" />
          <Tab icon={<FreeIcon />} label="Безкоштовні" />
          <Tab icon={<PaidIcon />} label="Freemium" />
        </Tabs>
      </Paper>

      {/* Providers Grid */}
      <Grid container spacing={3}>
        {filteredProviders.map((provider) => (
          <Grid item xs={12} lg={6} key={provider.id}>
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  opacity: provider.status === 'disabled' ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent>
                  {/* Provider Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" flex={1}>
                      {getCategoryIcon(provider.category)}
                      <Box ml={1} flex={1}>
                        <Typography variant="h6" component="div" display="flex" alignItems="center">
                          {provider.name}
                          <Box ml={1}>
                            {getTypeIcon(provider.type)}
                          </Box>
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Chip
                            size="small"
                            label={provider.status}
                            color={getStatusColor(provider.status) as any}
                            icon={getStatusIcon(provider.status)}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {provider.category.toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Toggle Switch */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={provider.status !== 'disabled'}
                          onChange={() => toggleProvider(provider.id)}
                          size="small"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {provider.description}
                  </Typography>

                  {/* Quality & Speed */}
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="caption" display="block">
                        Якість
                      </Typography>
                      {renderStars(provider.quality)}
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">
                        Швидкість
                      </Typography>
                      {renderStars(provider.speed)}
                    </Box>
                  </Box>

                  {/* Features */}
                  <Box mb={2}>
                    <Typography variant="caption" display="block" mb={1}>
                      Особливості:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {provider.features.slice(0, 3).map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '10px', height: '20px' }}
                        />
                      ))}
                      {provider.features.length > 3 && (
                        <Chip
                          label={`+${provider.features.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '10px', height: '20px' }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Languages */}
                  <Box mb={2}>
                    <Typography variant="caption" display="block" mb={1}>
                      Мови: {provider.languages.length}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {provider.languages.slice(0, 5).map((lang, index) => (
                        <Chip
                          key={index}
                          label={lang}
                          size="small"
                          sx={{ fontSize: '10px', height: '18px' }}
                        />
                      ))}
                      {provider.languages.length > 5 && (
                        <Chip
                          label={`+${provider.languages.length - 5}`}
                          size="small"
                          sx={{ fontSize: '10px', height: '18px' }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Pricing */}
                  {provider.pricing && (
                    <Box mb={2}>
                      {provider.pricing.free ? (
                        <Chip
                          label="100% Безкоштовно"
                          color="success"
                          size="small"
                          icon={<FreeIcon />}
                        />
                      ) : (
                        <Box>
                          <Chip
                            label={`Free: ${provider.pricing.freeTier}`}
                            color="info"
                            size="small"
                            sx={{ mr: 1, mb: 0.5 }}
                          />
                          <Chip
                            label={`Paid: ${provider.pricing.paidFrom}`}
                            color="warning"
                            size="small"
                          />
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => openConfigDialog(provider)}
                      disabled={provider.status === 'disabled'}
                    >
                      Налаштувати
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        testingProvider === provider.id
                          ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} />
                          : <TestIcon />
                      }
                      onClick={() => testProvider(provider.id)}
                      disabled={provider.status === 'disabled' || testingProvider === provider.id}
                    >
                      Тест
                    </Button>

                    {saveStatus[provider.id] === 'saving' && (
                      <Box display="flex" alignItems="center" ml={1}>
                        <LinearProgress size={20} />
                      </Box>
                    )}
                    {saveStatus[provider.id] === 'saved' && (
                      <Chip
                        label="Збережено"
                        color="success"
                        size="small"
                        icon={<CheckIcon />}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Configuration Dialog */}
      <Dialog
        open={configDialog.open}
        onClose={closeConfigDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {configDialog.provider && getCategoryIcon(configDialog.provider.category)}
            <Box ml={1}>
              Налаштування: {configDialog.provider?.name}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {configDialog.provider && (
            <Box mt={2}>
              {/* API Key */}
              {!configDialog.provider.pricing?.free && (
                <Box mb={3}>
                  <TextField
                    fullWidth
                    label="API Key"
                    type={showApiKeys[configDialog.provider.id] ? 'text' : 'password'}
                    value={configDialog.provider.apiKey || ''}
                    onChange={(e) => setConfigDialog(prev => ({
                      ...prev,
                      provider: prev.provider ? {
                        ...prev.provider,
                        apiKey: e.target.value
                      } : undefined
                    }))}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => toggleApiKeyVisibility(configDialog.provider!.id)}
                          size="small"
                        >
                          {showApiKeys[configDialog.provider.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                    helperText="Отримайте API ключ на офіційному сайті провайдера"
                  />
                </Box>
              )}

              {/* Model Selection */}
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel>Модель</InputLabel>
                  <Select
                    value={configDialog.provider.model || ''}
                    onChange={(e) => setConfigDialog(prev => ({
                      ...prev,
                      provider: prev.provider ? {
                        ...prev.provider,
                        model: e.target.value
                      } : undefined
                    }))}
                  >
                    {configDialog.provider.category === 'tts' ? (
                      [
                        <MenuItem value="standard">Standard</MenuItem>,
                        <MenuItem value="neural">Neural</MenuItem>,
                        <MenuItem value="premium">Premium</MenuItem>
                      ]
                    ) : (
                      [
                        <MenuItem value="base">Base</MenuItem>,
                        <MenuItem value="small">Small</MenuItem>,
                        <MenuItem value="medium">Medium</MenuItem>,
                        <MenuItem value="large">Large</MenuItem>
                      ]
                    )}
                  </Select>
                </FormControl>
              </Box>

              {/* Region */}
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel>Регіон</InputLabel>
                  <Select
                    value={configDialog.provider.region || ''}
                    onChange={(e) => setConfigDialog(prev => ({
                      ...prev,
                      provider: prev.provider ? {
                        ...prev.provider,
                        region: e.target.value
                      } : undefined
                    }))}
                  >
                    <MenuItem value="us-east-1">US East (N. Virginia)</MenuItem>
                    <MenuItem value="us-west-2">US West (Oregon)</MenuItem>
                    <MenuItem value="eu-west-1">Europe (Ireland)</MenuItem>
                    <MenuItem value="eu-central-1">Europe (Frankfurt)</MenuItem>
                    <MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Custom Endpoint */}
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Custom Endpoint (опціонально)"
                  value={configDialog.provider.endpoint || ''}
                  onChange={(e) => setConfigDialog(prev => ({
                    ...prev,
                    provider: prev.provider ? {
                      ...prev.provider,
                      endpoint: e.target.value
                    } : undefined
                  }))}
                  helperText="Залиште пусте для використання стандартного endpoint"
                />
              </Box>

              {/* Test Phrase */}
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Тестова фраза"
                  multiline
                  rows={2}
                  value={configDialog.provider.testPhrase || ''}
                  onChange={(e) => setConfigDialog(prev => ({
                    ...prev,
                    provider: prev.provider ? {
                      ...prev.provider,
                      testPhrase: e.target.value
                    } : undefined
                  }))}
                />
              </Box>

              {/* Provider Info */}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Документація:</strong>{' '}
                  {configDialog.provider.documentation ? (
                    <a
                      href={configDialog.provider.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {configDialog.provider.documentation}
                    </a>
                  ) : (
                    'Відсутня'
                  )}
                </Typography>
                {configDialog.provider.limits && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Ліміти:</strong> {configDialog.provider.limits.free}
                    {configDialog.provider.limits.paid && (
                      <span> | Платно: {configDialog.provider.limits.paid}</span>
                    )}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeConfigDialog}>
            Скасувати
          </Button>
          <Button
            onClick={saveProviderConfig}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saveStatus[configDialog.provider?.id || ''] === 'saving'}
          >
            {saveStatus[configDialog.provider?.id || ''] === 'saving' ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS для анімації */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Закрити
        </Button>
        {backendAvailable && (
          <Button
            onClick={refreshStats}
            startIcon={<RefreshIcon />}
          >
            Оновити статистику
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VoiceProvidersAdmin;
