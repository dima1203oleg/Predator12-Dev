"use strict";
/**
 * 🎤 PREDATOR12 NEXUS - Ultimate Voice API Client
 * TypeScript SDK з триступеневою логікою fallback:
 * 1. API Services (ElevenLabs, Google Cloud, Azure)
 * 2. Local Models (Coqui TTS, Whisper, faster-whisper)
 * 3. Browser Web Speech API (резервний варіант)
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
exports.voiceAPIUltimate = exports.VoiceAPIUltimate = void 0;
class VoiceAPIUltimate {
    constructor(baseURL = 'http://localhost:8000') {
        this.capabilities = null;
        this.audioCache = new Map();
        this.browserSynthesis = null;
        this.browserRecognition = null;
        this.baseURL = baseURL;
        // Ініціалізація Browser API
        if (typeof window !== 'undefined') {
            this.browserSynthesis = window.speechSynthesis;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.browserRecognition = new SpeechRecognition();
                this.browserRecognition.continuous = false;
                this.browserRecognition.interimResults = false;
            }
        }
        // Завантажити capabilities при ініціалізації
        this.loadCapabilities();
    }
    /**
     * Завантаження інформації про можливості системи
     */
    loadCapabilities() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/api/capabilities`);
                if (response.ok) {
                    this.capabilities = yield response.json();
                    console.log('✅ Capabilities завантажено:', this.capabilities);
                    return this.capabilities;
                }
                else {
                    throw new Error('Failed to load capabilities');
                }
            }
            catch (error) {
                console.warn('⚠️ API недоступний, використовую лише Browser API:', error);
                // Fallback до browser-only режиму
                this.capabilities = {
                    api_services: {},
                    local_models: {},
                    browser_fallback: true,
                    supported_languages: ['uk-UA', 'en-US'],
                    recommended_provider: 'browser'
                };
                return this.capabilities;
            }
        });
    }
    /**
     * 🎤 Text-to-Speech з триступеневою логікою fallback
     */
    textToSpeech(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, language = 'uk', speed = 1.0, voice = null, provider = 'auto', quality = 'high' } = request;
            console.log(`🎤 TTS запит: "${text.substring(0, 50)}..." (${provider})`);
            // LEVEL 1 & 2: API/Local через бекенд
            if (provider === 'auto' || provider === 'api' || provider === 'local') {
                try {
                    const response = yield fetch(`${this.baseURL}/api/tts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            text,
                            language,
                            speed,
                            voice,
                            provider,
                            quality
                        }),
                    });
                    if (response.ok) {
                        const data = yield response.json();
                        console.log(`✅ TTS успішно через ${data.provider}`);
                        // Якщо отримали audio_url, відтворюємо
                        if (data.audio_url) {
                            yield this.playAudio(data.audio_url);
                        }
                        return data;
                    }
                    else {
                        console.warn(`⚠️ API TTS failed: ${response.status}`);
                    }
                }
                catch (error) {
                    console.warn('⚠️ API TTS error:', error);
                }
            }
            // LEVEL 3: Browser Web Speech API Fallback
            console.log('🌐 Fallback до Browser Web Speech API');
            return yield this.browserTTS(text, language, speed);
        });
    }
    /**
     * 🌐 Browser-based TTS (Web Speech API)
     */
    browserTTS(text, language, speed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browserSynthesis) {
                throw new Error('Browser Speech Synthesis не підтримується');
            }
            return new Promise((resolve, reject) => {
                // Зупиняємо попереднє озвучування
                this.browserSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                // Налаштування мови
                const langCode = language === 'uk' ? 'uk-UA' : 'en-US';
                utterance.lang = langCode;
                utterance.rate = speed;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                // Вибір голосу
                const voices = this.browserSynthesis.getVoices();
                const voice = voices.find(v => v.lang.includes(langCode)) || voices[0];
                if (voice) {
                    utterance.voice = voice;
                }
                utterance.onend = () => {
                    console.log('✅ Browser TTS завершено');
                    resolve({
                        text,
                        language,
                        duration: text.length * 0.08,
                        provider: 'Browser Web Speech API',
                        cached: false,
                        timestamp: new Date().toISOString()
                    });
                };
                utterance.onerror = (error) => {
                    console.error('❌ Browser TTS error:', error);
                    reject(error);
                };
                this.browserSynthesis.speak(utterance);
            });
        });
    }
    /**
     * 🎧 Speech-to-Text з триступеневою логікою fallback
     */
    speechToText(audioBlob, language = 'uk', provider = 'auto') {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`🎧 STT запит (${provider})`);
            // LEVEL 1 & 2: API/Local через бекенд
            if (provider === 'auto' || provider === 'api' || provider === 'local') {
                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'audio.wav');
                    const response = yield fetch(`${this.baseURL}/api/stt?language=${language}&provider=${provider}`, {
                        method: 'POST',
                        body: formData,
                    });
                    if (response.ok) {
                        const data = yield response.json();
                        console.log(`✅ STT успішно через ${data.provider}: "${data.text}"`);
                        return data;
                    }
                    else {
                        console.warn(`⚠️ API STT failed: ${response.status}`);
                    }
                }
                catch (error) {
                    console.warn('⚠️ API STT error:', error);
                }
            }
            // LEVEL 3: Browser Web Speech API Fallback
            console.log('🌐 Fallback до Browser Web Speech API');
            return yield this.browserSTT(language);
        });
    }
    /**
     * 🌐 Browser-based STT (Web Speech API)
     */
    browserSTT(language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browserRecognition) {
                throw new Error('Browser Speech Recognition не підтримується');
            }
            return new Promise((resolve, reject) => {
                const langCode = language === 'uk' ? 'uk-UA' : 'en-US';
                this.browserRecognition.lang = langCode;
                const startTime = Date.now();
                this.browserRecognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    const confidence = event.results[0][0].confidence || 0.95;
                    const duration = (Date.now() - startTime) / 1000;
                    console.log(`✅ Browser STT: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
                    resolve({
                        text: transcript,
                        language: langCode,
                        confidence,
                        duration,
                        provider: 'Browser Web Speech API',
                        timestamp: new Date().toISOString()
                    });
                };
                this.browserRecognition.onerror = (error) => {
                    console.error('❌ Browser STT error:', error);
                    reject(error);
                };
                this.browserRecognition.start();
                console.log('🎤 Browser STT розпочато');
            });
        });
    }
    /**
     * Відтворення аудіо через URL
     */
    playAudio(audioUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullUrl = audioUrl.startsWith('http')
                ? audioUrl
                : `${this.baseURL}${audioUrl}`;
            // Перевірка кешу
            if (this.audioCache.has(fullUrl)) {
                const cachedAudio = this.audioCache.get(fullUrl);
                cachedAudio.currentTime = 0;
                yield cachedAudio.play();
                return;
            }
            // Створення нового аудіо
            const audio = new Audio(fullUrl);
            this.audioCache.set(fullUrl, audio);
            return new Promise((resolve, reject) => {
                audio.onended = () => resolve();
                audio.onerror = (error) => reject(error);
                audio.play().catch(reject);
            });
        });
    }
    /**
     * Перевірка здоров'я API
     */
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/health`);
                return yield response.json();
            }
            catch (error) {
                console.warn('⚠️ Health check failed:', error);
                return {
                    status: 'offline',
                    api_services: {},
                    local_models: { tts: false, stt: false },
                    timestamp: new Date().toISOString()
                };
            }
        });
    }
    /**
     * Отримати рекомендований провайдер
     */
    getRecommendedProvider() {
        var _a;
        return ((_a = this.capabilities) === null || _a === void 0 ? void 0 : _a.recommended_provider) || 'browser';
    }
    /**
     * Перевірка підтримки мови
     */
    isLanguageSupported(language) {
        if (!this.capabilities)
            return true; // Припускаємо, що підтримується
        return this.capabilities.supported_languages.includes(language);
    }
    /**
     * Отримати список доступних голосів (Browser API)
     */
    getAvailableVoices() {
        if (!this.browserSynthesis)
            return [];
        return this.browserSynthesis.getVoices();
    }
    /**
     * Зупинити поточне озвучування
     */
    stopSpeaking() {
        if (this.browserSynthesis) {
            this.browserSynthesis.cancel();
        }
        // Зупинити всі аудіо елементи
        this.audioCache.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
    /**
     * Очистити кеш аудіо
     */
    clearCache() {
        this.audioCache.clear();
        console.log('🗑️ Audio cache cleared');
    }
}
exports.VoiceAPIUltimate = VoiceAPIUltimate;
// Export singleton instance
exports.voiceAPIUltimate = new VoiceAPIUltimate();
exports.default = exports.voiceAPIUltimate;
