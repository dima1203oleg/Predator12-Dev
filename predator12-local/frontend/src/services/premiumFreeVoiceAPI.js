"use strict";
/**
 * 🎤 PREDATOR12 Premium FREE Voice API - TypeScript SDK
 * Клієнт для роботи з безкоштовними TTS/STT моделями
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
exports.premiumFreeVoiceAPI = void 0;
const API_BASE_URL = 'http://localhost:5094';
class PremiumFreeVoiceAPI {
    constructor(baseUrl = API_BASE_URL) {
        this.audioContext = null;
        this.currentAudio = null;
        this.baseUrl = baseUrl;
    }
    /**
     * Отримати інформацію про доступні моделі
     */
    getCapabilities() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/api/capabilities`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('❌ Помилка отримання capabilities:', error);
                throw error;
            }
        });
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
    textToSpeech(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, language = 'uk', speed = 1.0, provider = 'auto' } = request;
            console.log(`🔊 TTS запит: "${text.substring(0, 50)}...", lang=${language}, provider=${provider}`);
            try {
                // Зупиняємо попереднє відтворення
                this.stopSpeaking();
                const response = yield fetch(`${this.baseUrl}/api/tts`, {
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
                const audioBlob = yield response.blob();
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
            }
            catch (error) {
                console.error('❌ TTS помилка:', error);
                throw error;
            }
        });
    }
    /**
     * Speech-to-Text з найкращими безкоштовними моделями
     *
     * Пріоритет:
     * 1. faster-whisper ⭐⭐⭐⭐⭐ (найшвидший)
     * 2. whisper ⭐⭐⭐⭐
     * 3. vosk ⭐⭐⭐ (real-time)
     */
    speechToText(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { audio, language = 'uk', provider = 'auto' } = request;
            console.log(`🎧 STT запит: lang=${language}, provider=${provider}, size=${audio.size} bytes`);
            try {
                const formData = new FormData();
                formData.append('audio', audio, 'audio.wav');
                formData.append('language', language);
                formData.append('provider', provider);
                const response = yield fetch(`${this.baseUrl}/api/stt`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const result = yield response.json();
                console.log(`✅ STT результат: "${result.text}" (провайдер: ${result.provider}, впевненість: ${result.confidence})`);
                return result;
            }
            catch (error) {
                console.error('❌ STT помилка:', error);
                throw error;
            }
        });
    }
    /**
     * Зупинити відтворення TTS
     */
    stopSpeaking() {
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
    checkHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseUrl}/`);
                return response.ok;
            }
            catch (error) {
                console.error('❌ API недоступний:', error);
                return false;
            }
        });
    }
    /**
     * Швидкий тест TTS
     */
    testTTS(language = 'uk') {
        return __awaiter(this, void 0, void 0, function* () {
            const testMessages = {
                uk: "Привіт! Я тестую систему озвучування. Використовую найкращі безкоштовні моделі.",
                en: "Hello! I am testing the text to speech system. Using the best free models."
            };
            console.log(`🧪 Тест TTS (${language})...`);
            yield this.textToSpeech({
                text: testMessages[language],
                language
            });
        });
    }
}
// Експортуємо екземпляр API
exports.premiumFreeVoiceAPI = new PremiumFreeVoiceAPI();
// Експортуємо клас для кастомізації
exports.default = PremiumFreeVoiceAPI;
