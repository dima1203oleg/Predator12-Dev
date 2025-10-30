// 🎤 PREDATOR12 NEXUS - Voice API Integration
// Інтеграція з backend Voice API (Whisper + Coqui TTS)

export class VoiceAPIClient {
  private baseURL: string;
  private isInitialized: boolean = false;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  /**
   * Перевірка доступності API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      this.isInitialized = data.status === 'healthy';
      return this.isInitialized;
    } catch (error) {
      console.error('❌ Voice API недоступний:', error);
      return false;
    }
  }

  /**
   * Отримання інформації про моделі
   */
  async getModelsInfo() {
    try {
      const response = await fetch(`${this.baseURL}/test/models`);
      return await response.json();
    } catch (error) {
      console.error('❌ Помилка отримання інформації про моделі:', error);
      return null;
    }
  }

  /**
   * Text-to-Speech (TTS)
   * @param text Текст для озвучування
   * @param language Мова (uk/en)
   * @param speed Швидкість мовлення (0.5-2.0)
   */
  async textToSpeech(
    text: string,
    language: string = 'uk',
    speed: number = 1.0
  ): Promise<string | null> {
    try {
      console.log('🔊 TTS запит:', text.substring(0, 50) + '...');

      const response = await fetch(`${this.baseURL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
          speed,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS помилка: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ TTS успішно:', data);

      // Повертаємо повний URL до аудіо
      return `${this.baseURL}${data.audio_url}`;
    } catch (error) {
      console.error('❌ Помилка TTS:', error);
      return null;
    }
  }

  /**
   * Speech-to-Text (STT)
   * @param audioBlob Аудіо файл
   */
  async speechToText(audioBlob: Blob): Promise<string | null> {
    try {
      console.log('🎤 STT запит, розмір:', audioBlob.size, 'bytes');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch(`${this.baseURL}/api/stt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT помилка: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ STT успішно:', data);

      return data.text;
    } catch (error) {
      console.error('❌ Помилка STT:', error);
      return null;
    }
  }

  /**
   * Швидкий тест TTS
   */
  async testTTS(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/test/tts`);
      const data = await response.json();
      return `${this.baseURL}${data.audio_url}`;
    } catch (error) {
      console.error('❌ Помилка тесту TTS:', error);
      return null;
    }
  }

  /**
   * Програвання аудіо з URL
   */
  async playAudio(audioURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioURL);

      audio.onended = () => {
        console.log('✅ Аудіо завершено');
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ Помилка відтворення:', error);
        reject(error);
      };

      audio.play().catch((error) => {
        console.error('❌ Помилка play():', error);
        reject(error);
      });
    });
  }

  /**
   * Запис аудіо з мікрофону
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
          stream.getTracks().forEach((track) => track.stop());
          resolve(audioBlob);
        };

        mediaRecorder.onerror = (error) => {
          stream.getTracks().forEach((track) => track.stop());
          reject(error);
        };

        mediaRecorder.start();
        console.log('🎤 Запис почато...');

        setTimeout(() => {
          mediaRecorder.stop();
          console.log('✅ Запис завершено');
        }, duration);
      });
    } catch (error) {
      console.error('❌ Помилка запису:', error);
      return null;
    }
  }

  /**
   * Повний цикл: STT -> обробка -> TTS
   */
  async voiceInteraction(
    audioBlob: Blob,
    onTextRecognized?: (text: string) => void,
    onResponseGenerated?: (response: string) => void
  ): Promise<void> {
    // 1. Розпізнавання мовлення
    const recognizedText = await this.speechToText(audioBlob);
    if (!recognizedText) {
      throw new Error('Не вдалося розпізнати мовлення');
    }

    console.log('📝 Розпізнано:', recognizedText);
    if (onTextRecognized) {
      onTextRecognized(recognizedText);
    }

    // 2. Генерація відповіді (тут може бути ваша логіка)
    const response = this.generateResponse(recognizedText);
    console.log('💬 Відповідь:', response);
    if (onResponseGenerated) {
      onResponseGenerated(response);
    }

    // 3. Озвучування відповіді
    const audioURL = await this.textToSpeech(response);
    if (audioURL) {
      await this.playAudio(audioURL);
    }
  }

  /**
   * Генерація відповіді (заглушка - тут має бути ваша логіка)
   */
  private generateResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('привіт') || lowerInput.includes('hello')) {
      return 'Привіт! Я голосовий асистент Нексус. Чим можу допомогти?';
    } else if (lowerInput.includes('дашборд')) {
      return 'Відкриваю головний дашборд. Всі системи працюють нормально.';
    } else if (lowerInput.includes('статус')) {
      return 'Системний статус відмінний. Всі сервіси активні.';
    } else {
      return `Ви сказали: ${input}. Я обробляю вашу команду.`;
    }
  }
}

// Експорт singleton інстансу
export const voiceAPI = new VoiceAPIClient();

// Експорт типів
export interface TTSRequest {
  text: string;
  language?: string;
  speed?: number;
}

export interface STTResponse {
  text: string;
  language: string;
  confidence: number;
  duration: number;
  timestamp: string;
}

export interface TTSResponse {
  audio_url: string;
  text: string;
  language: string;
  duration: number;
  timestamp: string;
}
