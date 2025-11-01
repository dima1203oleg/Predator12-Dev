"use strict";
/**
 * 🎤 PREDATOR12 Ultimate Voice API SDK V5.4 PREMIUM
 * Найкращі API провайдери з автоматичним fallback
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
exports.voiceAPIPremium = exports.VoiceAPIPremium = void 0;
class VoiceAPIPremium {
    constructor(baseURL = 'http://localhost:8765') {
        this.audioContext = null;
        this.baseURL = baseURL;
    }
    /**
     * 🎤 Text-to-Speech з автоматичним fallback
     */
    textToSpeech(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/api/v1/tts`, {
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
                const data = yield response.json();
                console.log(`✅ TTS Success (${data.provider}):`, data.text.substring(0, 50));
                return data;
            }
            catch (error) {
                console.error('❌ TTS API Error:', error);
                // Fallback до Browser Web Speech API
                console.log('🔄 Fallback to Browser TTS...');
                return this.textToSpeechBrowser(request);
            }
        });
    }
    /**
     * 🔊 Озвучити текст (з автоматичним відтворенням)
     */
    speak(text, language = 'uk', options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.textToSpeech(Object.assign({ text,
                    language }, options));
                // Якщо є audio_base64 - відтворюємо
                if (response.audio_base64) {
                    yield this.playAudioBase64(response.audio_base64);
                }
                else {
                    // Fallback до браузерного TTS
                    yield this.speakBrowser(text, language);
                }
            }
            catch (error) {
                console.error('❌ Speak error:', error);
                // Останній fallback
                yield this.speakBrowser(text, language);
            }
        });
    }
    /**
     * 🎧 Speech-to-Text (рекомендується Browser API)
     */
    speechToText(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formData = new FormData();
                formData.append('audio', request.audio);
                const response = yield fetch(`${this.baseURL}/api/v1/stt?language=${request.language || 'uk'}&provider=${request.provider || 'auto'}`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`STT API error: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('❌ STT API Error:', error);
                throw error;
            }
        });
    }
    /**
     * 📊 Отримати capabilities
     */
    getCapabilities() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/api/v1/capabilities`);
                if (!response.ok) {
                    throw new Error(`Capabilities API error: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
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
        });
    }
    /**
     * 🔊 Відтворити audio з base64
     */
    playAudioBase64(base64) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                console.error('❌ Audio playback error:', error);
                throw error;
            }
        });
    }
    /**
     * 🌐 Browser Web Speech API TTS (fallback)
     */
    textToSpeechBrowser(request) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * 🔊 Озвучити через браузер (fallback)
     */
    speakBrowser(text, language = 'uk') {
        return __awaiter(this, void 0, void 0, function* () {
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
                    selectedVoice = voices.find(v => v.lang.startsWith('uk') ||
                        v.name.toLowerCase().includes('ukrainian'));
                }
                else {
                    selectedVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') ||
                        v.name.includes('Microsoft') ||
                        v.name.includes('Neural') ||
                        v.name.includes('Samantha'))) || voices.find(v => v.lang === 'en-US');
                }
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                    console.log(`🎵 Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
                }
                utterance.onend = () => resolve();
                utterance.onerror = (error) => reject(error);
                speechSynthesis.speak(utterance);
            });
        });
    }
    /**
     * 🛑 Зупинити озвучування
     */
    stopSpeaking() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
    /**
     * 🎤 Розпізнавання через браузер (Web Speech API)
     */
    startListening(language = 'uk', options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const SpeechRecognition = window.SpeechRecognition ||
                window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Browser Speech Recognition not available');
            }
            const recognition = new SpeechRecognition();
            recognition.lang = language === 'uk' ? 'uk-UA' : 'en-US';
            recognition.continuous = (_a = options === null || options === void 0 ? void 0 : options.continuous) !== null && _a !== void 0 ? _a : true;
            recognition.interimResults = (_b = options === null || options === void 0 ? void 0 : options.interimResults) !== null && _b !== void 0 ? _b : true;
            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        if (options === null || options === void 0 ? void 0 : options.onResult) {
                            options.onResult(transcript, true);
                        }
                    }
                    else {
                        interimTranscript += transcript;
                        if (options === null || options === void 0 ? void 0 : options.onResult) {
                            options.onResult(transcript, false);
                        }
                    }
                }
            };
            recognition.onerror = (event) => {
                console.error('❌ Recognition error:', event.error);
                if (options === null || options === void 0 ? void 0 : options.onError) {
                    options.onError(event.error);
                }
            };
            // Запитуємо дозвіл на мікрофон
            try {
                const stream = yield navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                recognition.start();
                console.log('🎤 Recognition started');
            }
            catch (error) {
                console.error('❌ Microphone access denied:', error);
                throw error;
            }
            return recognition;
        });
    }
    /**
     * 🔍 Перевірити доступність API
     */
    checkHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000),
                });
                return response.ok;
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.VoiceAPIPremium = VoiceAPIPremium;
// Singleton instance
exports.voiceAPIPremium = new VoiceAPIPremium('http://localhost:8765');
exports.default = exports.voiceAPIPremium;
