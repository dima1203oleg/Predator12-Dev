/**
 * 🎤 PREDATOR12 Ultimate Voice API SDK V5.4 PREMIUM
 * Найкращі API провайдери з автоматичним fallback
 */

export interface TTSRequest {
  text: string;
  language?: 'uk' | 'en';
  speed?: number;
  voice?: string;
  provider?: 'auto' | 'google' | 'aws' | 'azure' | 'elevenlabs' | 'local' | 'browser';
  quality?: 'low' | 'medium' | 'high';
}

export interface TTSResponse {
  audio_url?: string;
  audio_base64?: string;
  text: string;
  language: string;
  provider: string;
  quality: string;
  cached: boolean;
  timestamp: string;
}

export interface STTRequest {
  audio: Blob;
  language?: 'uk' | 'en';
  provider?: 'auto' | 'google' | 'azure' | 'aws' | 'local' | 'browser';
}

export interface STTResponse {
  text: string;
  language: string;
  confidence: number;
  duration: number;
  provider: string;
  timestamp: string;
}

export interface VoiceCapabilities {
  tts_providers: Record<string, string[]>;
  stt_providers: Record<string, string[]>;
  api_status: Record<string, boolean>;
  local_available: boolean;
  recommended_tts: Record<string, string>;
  recommended_stt: Record<string, string>;
  supported_languages: string[];
}

export class VoiceAPIPremium {
  private baseURL: string;
  private audioContext: AudioContext | null = null;

  constructor(baseURL: string = 'http://localhost:8765') {
    this.baseURL = baseURL;
  }

  /**
   * 🎤 Text-to-Speech з автоматичним fallback
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          language: request.language || 'uk',
          speed: request.speed || 1.0,
          voice: request.voice,
          provider: request.provider || 'auto',
          quality: request.quality || 'high',
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const data: TTSResponse = await response.json();

      console.log(`✅ TTS Success (${data.provider}):`, data.text.substring(0, 50));

      return data;
    } catch (error) {
      console.error('❌ TTS API Error:', error);

      // Fallback до Browser Web Speech API
      console.log('🔄 Fallback to Browser TTS...');
      return this.textToSpeechBrowser(request);
    }
  }

  /**
   * 🔊 Озвучити текст (з автоматичним відтворенням)
   */
  async speak(
    text: string,
    language: 'uk' | 'en' = 'uk',
    options?: Partial<TTSRequest>
  ): Promise<void> {
    try {
      const response = await this.textToSpeech({
        text,
        language,
        ...options,
      });

      // Якщо є audio_base64 - відтворюємо
      if (response.audio_base64) {
        await this.playAudioBase64(response.audio_base64);
      } else {
        // Fallback до браузерного TTS
        await this.speakBrowser(text, language);
      }
    } catch (error) {
      console.error('❌ Speak error:', error);
      // Останній fallback
      await this.speakBrowser(text, language);
    }
  }

  /**
   * 🎧 Speech-to-Text (рекомендується Browser API)
   */
  async speechToText(request: STTRequest): Promise<STTResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', request.audio);

      const response = await fetch(
        `${this.baseURL}/api/v1/stt?language=${request.language || 'uk'}&provider=${request.provider || 'auto'}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ STT API Error:', error);
      throw error;
    }
  }

  /**
   * 📊 Отримати capabilities
   */
  async getCapabilities(): Promise<VoiceCapabilities> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/capabilities`);

      if (!response.ok) {
        throw new Error(`Capabilities API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Capabilities Error:', error);

      // Fallback capabilities
      return {
        tts_providers: {
          uk: ['browser'],
          en: ['browser']
        },
        stt_providers: {
          uk: ['browser'],
          en: ['browser']
        },
        api_status: {},
        local_available: false,
        recommended_tts: {
          uk: 'Browser Web Speech API',
          en: 'Browser Web Speech API'
        },
        recommended_stt: {
          uk: 'Browser Web Speech API',
          en: 'Browser Web Speech API'
        },
        supported_languages: ['uk', 'en']
      };
    }
  }

  /**
   * 🔊 Відтворити audio з base64
   */
  private async playAudioBase64(base64: string): Promise<void> {
    try {
      // Декодуємо base64
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Створюємо blob та URL
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      // Відтворюємо
      const audio = new Audio(url);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        audio.play();
      });
    } catch (error) {
      console.error('❌ Audio playback error:', error);
      throw error;
    }
  }

  /**
   * 🌐 Browser Web Speech API TTS (fallback)
   */
  private async textToSpeechBrowser(request: TTSRequest): Promise<TTSResponse> {
    console.log('🌐 Using Browser Web Speech API...');

    if (!('speechSynthesis' in window)) {
      throw new Error('Browser Speech Synthesis not available');
    }

    return {
      audio_url: undefined,
      audio_base64: undefined,
      text: request.text,
      language: request.language || 'uk',
      provider: 'Browser Web Speech API',
      quality: 'browser',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🔊 Озвучити через браузер (fallback)
   */
  async speakBrowser(text: string, language: 'uk' | 'en' = 'uk'): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser Speech Synthesis not available');
    }

    return new Promise((resolve, reject) => {
      // Зупиняємо попереднє
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'uk' ? 'uk-UA' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Вибір голосу
      const voices = speechSynthesis.getVoices();

      let selectedVoice = null;
      if (language === 'uk') {
        selectedVoice = voices.find(v =>
          v.lang.startsWith('uk') ||
          v.name.toLowerCase().includes('ukrainian')
        );
      } else {
        selectedVoice = voices.find(v =>
          v.lang === 'en-US' && (
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            v.name.includes('Neural') ||
            v.name.includes('Samantha')
          )
        ) || voices.find(v => v.lang === 'en-US');
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🎵 Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * 🛑 Зупинити озвучування
   */
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * 🎤 Розпізнавання через браузер (Web Speech API)
   */
  async startListening(
    language: 'uk' | 'en' = 'uk',
    options?: {
      continuous?: boolean;
      interimResults?: boolean;
      onResult?: (text: string, isFinal: boolean) => void;
      onError?: (error: any) => void;
    }
  ): Promise<any> {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Browser Speech Recognition not available');
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'uk' ? 'uk-UA' : 'en-US';
    recognition.continuous = options?.continuous ?? true;
    recognition.interimResults = options?.interimResults ?? true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          if (options?.onResult) {
            options.onResult(transcript, true);
          }
        } else {
          interimTranscript += transcript;
          if (options?.onResult) {
            options.onResult(transcript, false);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Recognition error:', event.error);
      if (options?.onError) {
        options.onError(event.error);
      }
    };

    // Запитуємо дозвіл на мікрофон
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      recognition.start();
      console.log('🎤 Recognition started');
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      throw error;
    }

    return recognition;
  }

  /**
   * 🔍 Перевірити доступність API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const voiceAPIPremium = new VoiceAPIPremium('http://localhost:8765');

export default voiceAPIPremium;
