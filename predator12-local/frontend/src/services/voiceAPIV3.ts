/**
 * 🎤 PREDATOR12 Voice API Client V3
 * Триступенева система: API → Local → Browser
 */

export interface VoiceConfig {
  apiBaseUrl: string;
  preferApi: boolean;
  enableBrowserFallback: boolean;
  timeout: number;
}

export interface TTSRequest {
  text: string;
  language?: string;
  speed?: number;
  voice?: string;
  prefer_api?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface STTRequest {
  language?: string;
  prefer_api?: boolean;
  model?: string;
}

export interface VoiceResponse {
  success: boolean;
  data?: any;
  source: string; // "api", "local", "browser"
  fallback_used: boolean;
  error?: string;
  processing_time: number;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  api_services: Record<string, boolean>;
  local_models: Record<string, boolean>;
  usage_stats: any;
}

export class VoiceAPIClientV3 {
  private config: VoiceConfig;
  private synthesis: SpeechSynthesis | null = null;
  private recognition: any | null = null;

  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || 'http://localhost:8000',
      preferApi: config.preferApi !== undefined ? config.preferApi : true,
      enableBrowserFallback: config.enableBrowserFallback !== undefined ? config.enableBrowserFallback : true,
      timeout: config.timeout || 30000
    };

    // Ініціалізація браузерних API
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  /**
   * 🔊 TTS з триступеневим fallback
   * Level 1: API (Google/Coqui Cloud)
   * Level 2: Local (Piper/Coqui)
   * Level 3: Browser (Web Speech API)
   */
  async synthesizeSpeech(request: TTSRequest): Promise<Blob | null> {
    const startTime = Date.now();

    try {
      // ====== LEVEL 1 + 2: API/Local через сервер ======
      console.log('🌐 Спроба синтезу через API/Local...');

      const response = await fetch(`${this.config.apiBaseUrl}/api/v3/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          prefer_api: this.config.preferApi
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      const result: VoiceResponse = await response.json();

      if (result.success && result.data?.audio_url) {
        console.log(`✅ TTS успішно (${result.source}${result.fallback_used ? ' - fallback' : ''})`);

        // Завантажити аудіо
        const audioResponse = await fetch(`${this.config.apiBaseUrl}${result.data.audio_url}`);
        return await audioResponse.blob();
      }

      // ====== LEVEL 3: Browser Fallback ======
      if (result.source === 'browser_fallback_required' && this.config.enableBrowserFallback) {
        console.warn('⚠️  API/Local недоступні, використовую Web Speech API...');
        return await this.browserTTS(request.text, request.language || 'uk');
      }

      console.error('❌ TTS не вдалося:', result.error);
      return null;

    } catch (error) {
      console.error('❌ Помилка TTS API:', error);

      // ====== LEVEL 3: Browser Fallback (при помилці) ======
      if (this.config.enableBrowserFallback) {
        console.warn('⚠️  Fallback на Web Speech API через помилку...');
        return await this.browserTTS(request.text, request.language || 'uk');
      }

      return null;
    }
  }

  /**
   * 🗣️ STT з триступеневим fallback
   * Level 1: API (Whisper/Google)
   * Level 2: Local (Whisper/Vosk)
   * Level 3: Browser (Web Speech API)
   */
  async recognizeSpeech(audioBlob: Blob, language: string = 'uk'): Promise<string | null> {
    try {
      // ====== LEVEL 1 + 2: API/Local через сервер ======
      console.log('🌐 Спроба розпізнавання через API/Local...');

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('language', language);
      formData.append('prefer_api', this.config.preferApi.toString());

      const response = await fetch(`${this.config.apiBaseUrl}/api/v3/stt`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      const result: VoiceResponse = await response.json();

      if (result.success && result.data?.text) {
        console.log(`✅ STT успішно (${result.source}${result.fallback_used ? ' - fallback' : ''})`);
        return result.data.text;
      }

      // ====== LEVEL 3: Browser Fallback ======
      if (result.source === 'browser_fallback_required' && this.config.enableBrowserFallback) {
        console.warn('⚠️  API/Local недоступні, використовую Web Speech API...');
        return await this.browserSTT(language);
      }

      console.error('❌ STT не вдалося:', result.error);
      return null;

    } catch (error) {
      console.error('❌ Помилка STT API:', error);

      // ====== LEVEL 3: Browser Fallback (при помилці) ======
      if (this.config.enableBrowserFallback) {
        console.warn('⚠️  Fallback на Web Speech API через помилку...');
        return await this.browserSTT(language);
      }

      return null;
    }
  }

  /**
   * 🌐 Browser TTS (Level 3)
   */
  private async browserTTS(text: string, language: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Web Speech API не підтримується'));
        return;
      }

      try {
        // Створити utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'uk' ? 'uk-UA' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Для браузерного TTS не можемо отримати Blob напряму
        // Повертаємо null, але голос програється
        utterance.onend = () => {
          console.log('✅ Browser TTS завершено');
          resolve(null);
        };

        utterance.onerror = (error) => {
          console.error('❌ Browser TTS помилка:', error);
          reject(error);
        };

        this.synthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 🌐 Browser STT (Level 3)
   */
  private async browserSTT(language: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Web Speech Recognition не підтримується'));
        return;
      }

      try {
        this.recognition.lang = language === 'uk' ? 'uk-UA' : 'en-US';

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('✅ Browser STT розпізнано:', transcript);
          resolve(transcript);
        };

        this.recognition.onerror = (error: any) => {
          console.error('❌ Browser STT помилка:', error);
          reject(error);
        };

        this.recognition.onend = () => {
          // Auto-resolve якщо нічого не розпізнано
          resolve(null);
        };

        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 🎤 Запис аудіо з мікрофона
   */
  async recordAudio(duration: number = 5000): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          stream.getTracks().forEach(track => track.stop());
          resolve(audioBlob);
        };

        mediaRecorder.onerror = (error) => {
          stream.getTracks().forEach(track => track.stop());
          reject(error);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), duration);
      });
    } catch (error) {
      console.error('❌ Помилка запису аудіо:', error);
      return null;
    }
  }

  /**
   * 📊 Перевірка здоров'я системи
   */
  async checkHealth(): Promise<HealthStatus | null> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/v3/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('❌ Помилка health check:', error);
      return null;
    }
  }

  /**
   * 🎯 Повний цикл: запис → розпізнавання → відповідь → синтез
   */
  async voiceInteraction(
    responseGenerator: (userText: string) => Promise<string>,
    duration: number = 5000
  ): Promise<void> {
    try {
      console.log('🎤 Починаю запис...');
      const audioBlob = await this.recordAudio(duration);

      if (!audioBlob) {
        throw new Error('Не вдалося записати аудіо');
      }

      console.log('🗣️ Розпізнаю мовлення...');
      const userText = await this.recognizeSpeech(audioBlob);

      if (!userText) {
        throw new Error('Не вдалося розпізнати мовлення');
      }

      console.log('💬 Користувач сказав:', userText);

      console.log('🤖 Генерую відповідь...');
      const responseText = await responseGenerator(userText);

      console.log('🔊 Озвучую відповідь...');
      await this.synthesizeSpeech({ text: responseText, language: 'uk' });

      console.log('✅ Взаємодія завершена!');
    } catch (error) {
      console.error('❌ Помилка voice interaction:', error);
      throw error;
    }
  }

  /**
   * ⚙️ Оновити конфігурацію
   */
  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 📊 Отримати поточну конфігурацію
   */
  getConfig(): VoiceConfig {
    return { ...this.config };
  }
}

// ============================================
// React Hook для зручного використання
// ============================================

import { useState, useEffect, useCallback } from 'react';

export function useVoiceAPIV3(config?: Partial<VoiceConfig>) {
  const [client, setClient] = useState<VoiceAPIClientV3 | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const voiceClient = new VoiceAPIClientV3(config);
    setClient(voiceClient);

    // Перевірити здоров'я при ініціалізації
    voiceClient.checkHealth().then(setHealth);
  }, []);

  const speak = useCallback(async (text: string, language: string = 'uk') => {
    if (!client) return;
    setIsSpeaking(true);
    try {
      await client.synthesizeSpeech({ text, language });
    } finally {
      setIsSpeaking(false);
    }
  }, [client]);

  const listen = useCallback(async (duration: number = 5000): Promise<string | null> => {
    if (!client) return null;
    setIsRecording(true);
    try {
      const audioBlob = await client.recordAudio(duration);
      if (!audioBlob) return null;
      return await client.recognizeSpeech(audioBlob);
    } finally {
      setIsRecording(false);
    }
  }, [client]);

  const voiceInteraction = useCallback(async (
    responseGenerator: (text: string) => Promise<string>,
    duration: number = 5000
  ) => {
    if (!client) return;
    await client.voiceInteraction(responseGenerator, duration);
  }, [client]);

  const refreshHealth = useCallback(async () => {
    if (!client) return;
    const newHealth = await client.checkHealth();
    setHealth(newHealth);
  }, [client]);

  return {
    client,
    speak,
    listen,
    voiceInteraction,
    isRecording,
    isSpeaking,
    health,
    refreshHealth
  };
}

export default VoiceAPIClientV3;
