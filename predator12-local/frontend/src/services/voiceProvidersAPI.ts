/**
 * 🎤 Voice Providers Backend API Service
 * TypeScript клієнт для роботи з Voice Providers API
 * Частина Premium FREE Voice System Predator12 Nexus Core V5.2
 */

interface ProviderConfig {
  id: string;
  name: string;
  category: 'tts' | 'stt';
  type: 'free' | 'freemium' | 'paid';
  status: 'available' | 'configured' | 'error' | 'disabled';
  api_key?: string;
  model?: string;
  region?: string;
  endpoint?: string;
  quality: 1 | 2 | 3 | 4 | 5;
  speed: 1 | 2 | 3 | 4 | 5;
  languages: string[];
  description: string;
  features: string[];
  limits?: { [key: string]: string };
  pricing?: { [key: string]: any };
  documentation?: string;
  test_phrase?: string;
  last_tested?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface VoiceSettings {
  default_tts_provider: string;
  default_stt_provider: string;
  fallback_enabled: boolean;
  fallback_order: string[];
  auto_switch_on_error: boolean;
  usage_analytics: boolean;
  language_preference: string;
  quality_preference: 'speed' | 'quality' | 'balanced';
}

interface ProviderTest {
  provider_id: string;
  test_type: 'tts' | 'stt';
  text?: string;
  audio_url?: string;
  language?: string;
}

interface ProviderUsage {
  provider_id: string;
  timestamp: string;
  operation: 'tts' | 'stt';
  success: boolean;
  duration_ms: number;
  error_message?: string;
}

interface UsageStats {
  total_requests: number;
  providers: { [key: string]: any };
  success_rate: number;
  last_24h: number;
  tts_requests: number;
  stt_requests: number;
}

interface TestResult {
  provider_id: string;
  test_type: 'tts' | 'stt';
  success: boolean;
  result: string;
  duration_ms: number;
  timestamp: string;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  providers_count?: number;
  config_files?: { [key: string]: boolean };
  encryption?: string;
  error?: string;
}

class VoiceProvidersAPI {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string = 'http://localhost:8000/api/voice-providers') {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`API Error: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('🚨 Voice Providers API Error:', error);
      throw error;
    }
  }

  // Провайдери
  async getProviders(): Promise<ProviderConfig[]> {
    console.log('📋 Завантаження провайдерів...');
    return this.request<ProviderConfig[]>('/providers');
  }

  async createProvider(provider: Omit<ProviderConfig, 'created_at' | 'updated_at' | 'usage_count'>): Promise<ProviderConfig> {
    console.log('➕ Створення провайдера:', provider.name);
    return this.request<ProviderConfig>('/providers', {
      method: 'POST',
      body: JSON.stringify(provider),
    });
  }

  async updateProvider(providerId: string, provider: ProviderConfig): Promise<ProviderConfig> {
    console.log('🔄 Оновлення провайдера:', providerId);
    return this.request<ProviderConfig>(`/providers/${providerId}`, {
      method: 'PUT',
      body: JSON.stringify(provider),
    });
  }

  async deleteProvider(providerId: string): Promise<{ message: string }> {
    console.log('🗑️ Видалення провайдера:', providerId);
    return this.request<{ message: string }>(`/providers/${providerId}`, {
      method: 'DELETE',
    });
  }

  async testProvider(providerId: string, testData: ProviderTest): Promise<TestResult> {
    console.log('🧪 Тестування провайдера:', providerId, testData.test_type);
    return this.request<TestResult>(`/providers/${providerId}/test`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  // Налаштування
  async getSettings(): Promise<VoiceSettings> {
    console.log('⚙️ Завантаження налаштувань...');
    return this.request<VoiceSettings>('/settings');
  }

  async updateSettings(settings: VoiceSettings): Promise<VoiceSettings> {
    console.log('💾 Збереження налаштувань...');
    return this.request<VoiceSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Статистика
  async getUsageStats(): Promise<UsageStats> {
    console.log('📊 Завантаження статистики...');
    return this.request<UsageStats>('/usage/stats');
  }

  async logUsage(usage: ProviderUsage): Promise<{ message: string }> {
    return this.request<{ message: string }>('/usage/log', {
      method: 'POST',
      body: JSON.stringify(usage),
    });
  }

  // Здоров'я API
  async checkHealth(): Promise<HealthStatus> {
    try {
      return await this.request<HealthStatus>('/health');
    } catch (error) {
      console.warn('⚠️ Voice Providers API недоступний:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility методи
  async isBackendAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  async getProviderById(providerId: string): Promise<ProviderConfig | null> {
    try {
      const providers = await this.getProviders();
      return providers.find(p => p.id === providerId) || null;
    } catch {
      return null;
    }
  }

  async getProvidersByCategory(category: 'tts' | 'stt'): Promise<ProviderConfig[]> {
    try {
      const providers = await this.getProviders();
      return providers.filter(p => p.category === category);
    } catch {
      return [];
    }
  }

  async getAvailableProviders(): Promise<ProviderConfig[]> {
    try {
      const providers = await this.getProviders();
      return providers.filter(p => p.status !== 'disabled' && p.status !== 'error');
    } catch {
      return [];
    }
  }

  async getFreeProviders(): Promise<ProviderConfig[]> {
    try {
      const providers = await this.getProviders();
      return providers.filter(p => p.type === 'free');
    } catch {
      return [];
    }
  }

  async updateProviderStatus(providerId: string, status: ProviderConfig['status']): Promise<ProviderConfig | null> {
    try {
      const provider = await this.getProviderById(providerId);
      if (!provider) return null;

      provider.status = status;
      provider.updated_at = new Date().toISOString();

      return await this.updateProvider(providerId, provider);
    } catch {
      return null;
    }
  }

  async incrementUsageCount(providerId: string): Promise<void> {
    try {
      const provider = await this.getProviderById(providerId);
      if (!provider) return;

      provider.usage_count += 1;
      provider.updated_at = new Date().toISOString();

      await this.updateProvider(providerId, provider);
    } catch (error) {
      console.warn('⚠️ Не вдалося оновити лічильник використання:', error);
    }
  }

  // Batch операції
  async resetAllUsageCounters(): Promise<number> {
    try {
      const providers = await this.getProviders();
      let updatedCount = 0;

      for (const provider of providers) {
        if (provider.usage_count > 0) {
          provider.usage_count = 0;
          provider.updated_at = new Date().toISOString();
          await this.updateProvider(provider.id, provider);
          updatedCount++;
        }
      }

      console.log(`🔄 Скинуто лічильники для ${updatedCount} провайдерів`);
      return updatedCount;
    } catch (error) {
      console.error('❌ Помилка скидання лічильників:', error);
      return 0;
    }
  }

  async validateAllProviders(): Promise<{ valid: number; invalid: number; results: TestResult[] }> {
    try {
      const providers = await this.getProviders();
      const results: TestResult[] = [];
      let valid = 0;
      let invalid = 0;

      for (const provider of providers) {
        if (provider.status === 'disabled') continue;

        try {
          const testData: ProviderTest = {
            provider_id: provider.id,
            test_type: provider.category,
            text: provider.category === 'tts' ? provider.test_phrase : undefined,
            language: 'uk-UA'
          };

          const result = await this.testProvider(provider.id, testData);
          results.push(result);

          if (result.success) {
            valid++;
            await this.updateProviderStatus(provider.id, 'configured');
          } else {
            invalid++;
            await this.updateProviderStatus(provider.id, 'error');
          }
        } catch (error) {
          invalid++;
          await this.updateProviderStatus(provider.id, 'error');
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
    } catch (error) {
      console.error('❌ Помилка валідації провайдерів:', error);
      return { valid: 0, invalid: 0, results: [] };
    }
  }
}

// Singleton інстанс
export const voiceProvidersAPI = new VoiceProvidersAPI();

// Export types
export type {
  ProviderConfig,
  VoiceSettings,
  ProviderTest,
  ProviderUsage,
  UsageStats,
  TestResult,
  HealthStatus
};

export { VoiceProvidersAPI };

// Константи для швидкого доступу
export const VOICE_PROVIDERS_ENDPOINTS = {
  PROVIDERS: '/providers',
  SETTINGS: '/settings',
  USAGE_STATS: '/usage/stats',
  USAGE_LOG: '/usage/log',
  HEALTH: '/health'
} as const;

export const DEFAULT_PROVIDERS_CONFIG = {
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
} as const;
