/**
 * 🎤 PREDATOR12 Premium FREE Voice API - TypeScript SDK
 * Клієнт для роботи з безкоштовними TTS/STT моделями
 */

const API_BASE_URL = 'http://localhost:5094';

export interface TTSRequest {
  text: string;
  language?: 'uk' | 'en';
  speed?: number;
  provider?: 'auto' | 'coqui' | 'gtts' | 'pyttsx3';
}

export interface STTRequest {
  audio: Blob;
  language?: 'uk' | 'en';
  provider?: 'auto' | 'faster-whisper' | 'whisper' | 'vosk';
}

export interface STTResponse {
  text: string;
  language: string;
  confidence: number;
  provider: string;
  timestamp: string;
}

export interface VoiceCapabilities {
  tts_providers: {
    coqui: boolean;
    gtts: boolean;
    pyttsx3: boolean;
  };
  stt_providers: {
    'faster-whisper': boolean;
    whisper: boolean;
    vosk: boolean;
  };
  supported_languages: string[];
  recommended_tts: string;
  recommended_stt: string;
}

class PremiumFreeVoiceAPI {
  private baseUrl: string;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Отримати інформацію про доступні моделі
   */
  async getCapabilities(): Promise<VoiceCapabilities> {
    try {
      const response = await fetch(`${this.baseUrl}/api/capabilities`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Помилка отримання capabilities:', error);
      throw error;
    }
  }

  /**
   * Text-to-Speech з найкращими безкоштовними моделями
   *
   * Пріоритет (українська):
   * 1. Coqui TTS uk/mai/vits ⭐⭐⭐⭐⭐
   * 2. gTTS uk ⭐⭐⭐⭐
   * 3. pyttsx3 ⭐⭐⭐
   *
   * Пріоритет (англійська):
   * 1. Coqui TTS en/ljspeech/vits ⭐⭐⭐⭐⭐
   * 2. gTTS en ⭐⭐⭐⭐
   * 3. pyttsx3 ⭐⭐⭐
   */
  async textToSpeech(request: TTSRequest): Promise<void> {
    const {
      text,
      language = 'uk',
      speed = 1.0,
      provider = 'auto'
    } = request;

    console.log(`🔊 TTS запит: "${text.substring(0, 50)}...", lang=${language}, provider=${provider}`);

    try {
      // Зупиняємо попереднє відтворення
      this.stopSpeaking();

      const response = await fetch(`${this.baseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
          speed,
          provider
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Отримуємо інформацію про використаний провайдер
      const usedProvider = response.headers.get('X-Provider');
      console.log(`✅ TTS провайдер: ${usedProvider}`);

      // Отримуємо аудіо дані
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Відтворюємо аудіо
      return new Promise((resolve, reject) => {
        this.currentAudio = new Audio(audioUrl);

        this.currentAudio.onended = () => {
          console.log('✅ TTS завершено');
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          console.error('❌ TTS помилка відтворення:', error);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        this.currentAudio.play().catch(reject);
      });

    } catch (error) {
      console.error('❌ TTS помилка:', error);
      throw error;
    }
  }

  /**
   * Speech-to-Text з найкращими безкоштовними моделями
   *
   * Пріоритет:
   * 1. faster-whisper ⭐⭐⭐⭐⭐ (найшвидший)
   * 2. whisper ⭐⭐⭐⭐
   * 3. vosk ⭐⭐⭐ (real-time)
   */
  async speechToText(request: STTRequest): Promise<STTResponse> {
    const {
      audio,
      language = 'uk',
      provider = 'auto'
    } = request;

    console.log(`🎧 STT запит: lang=${language}, provider=${provider}, size=${audio.size} bytes`);

    try {
      const formData = new FormData();
      formData.append('audio', audio, 'audio.wav');
      formData.append('language', language);
      formData.append('provider', provider);

      const response = await fetch(`${this.baseUrl}/api/stt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: STTResponse = await response.json();
      console.log(`✅ STT результат: "${result.text}" (провайдер: ${result.provider}, впевненість: ${result.confidence})`);

      return result;

    } catch (error) {
      console.error('❌ STT помилка:', error);
      throw error;
    }
  }

  /**
   * Зупинити відтворення TTS
   */
  stopSpeaking(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('🛑 TTS зупинено');
    }
  }

  /**
   * Перевірка доступності API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('❌ API недоступний:', error);
      return false;
    }
  }

  /**
   * Швидкий тест TTS
   */
  async testTTS(language: 'uk' | 'en' = 'uk'): Promise<void> {
    const testMessages = {
      uk: "Привіт! Я тестую систему озвучування. Використовую найкращі безкоштовні моделі.",
      en: "Hello! I am testing the text to speech system. Using the best free models."
    };

    console.log(`🧪 Тест TTS (${language})...`);
    await this.textToSpeech({
      text: testMessages[language],
      language
    });
  }
}

// Експортуємо екземпляр API
export const premiumFreeVoiceAPI = new PremiumFreeVoiceAPI();

// Експортуємо клас для кастомізації
export default PremiumFreeVoiceAPI;
