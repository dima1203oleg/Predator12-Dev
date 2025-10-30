"use strict";
/**
 * 🎤 PREDATOR12 Voice API Client V3
 * Триступенева система: API → Local → Browser
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
exports.useVoiceAPIV3 = exports.VoiceAPIClientV3 = void 0;
class VoiceAPIClientV3 {
    constructor(config = {}) {
        this.synthesis = null;
        this.recognition = null;
        this.config = {
            apiBaseUrl: config.apiBaseUrl || 'http://localhost:8000',
            preferApi: config.preferApi !== undefined ? config.preferApi : true,
            enableBrowserFallback: config.enableBrowserFallback !== undefined ? config.enableBrowserFallback : true,
            timeout: config.timeout || 30000
        };
        // Ініціалізація браузерних API
        if (typeof window !== 'undefined') {
            this.synthesis = window.speechSynthesis;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    synthesizeSpeech(request) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            try {
                // ====== LEVEL 1 + 2: API/Local через сервер ======
                console.log('🌐 Спроба синтезу через API/Local...');
                const response = yield fetch(`${this.config.apiBaseUrl}/api/v3/tts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.assign(Object.assign({}, request), { prefer_api: this.config.preferApi })),
                    signal: AbortSignal.timeout(this.config.timeout)
                });
                const result = yield response.json();
                if (result.success && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.audio_url)) {
                    console.log(`✅ TTS успішно (${result.source}${result.fallback_used ? ' - fallback' : ''})`);
                    // Завантажити аудіо
                    const audioResponse = yield fetch(`${this.config.apiBaseUrl}${result.data.audio_url}`);
                    return yield audioResponse.blob();
                }
                // ====== LEVEL 3: Browser Fallback ======
                if (result.source === 'browser_fallback_required' && this.config.enableBrowserFallback) {
                    console.warn('⚠️  API/Local недоступні, використовую Web Speech API...');
                    return yield this.browserTTS(request.text, request.language || 'uk');
                }
                console.error('❌ TTS не вдалося:', result.error);
                return null;
            }
            catch (error) {
                console.error('❌ Помилка TTS API:', error);
                // ====== LEVEL 3: Browser Fallback (при помилці) ======
                if (this.config.enableBrowserFallback) {
                    console.warn('⚠️  Fallback на Web Speech API через помилку...');
                    return yield this.browserTTS(request.text, request.language || 'uk');
                }
                return null;
            }
        });
    }
    /**
     * 🗣️ STT з триступеневим fallback
     * Level 1: API (Whisper/Google)
     * Level 2: Local (Whisper/Vosk)
     * Level 3: Browser (Web Speech API)
     */
    recognizeSpeech(audioBlob, language = 'uk') {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // ====== LEVEL 1 + 2: API/Local через сервер ======
                console.log('🌐 Спроба розпізнавання через API/Local...');
                const formData = new FormData();
                formData.append('file', audioBlob, 'audio.wav');
                formData.append('language', language);
                formData.append('prefer_api', this.config.preferApi.toString());
                const response = yield fetch(`${this.config.apiBaseUrl}/api/v3/stt`, {
                    method: 'POST',
                    body: formData,
                    signal: AbortSignal.timeout(this.config.timeout)
                });
                const result = yield response.json();
                if (result.success && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.text)) {
                    console.log(`✅ STT успішно (${result.source}${result.fallback_used ? ' - fallback' : ''})`);
                    return result.data.text;
                }
                // ====== LEVEL 3: Browser Fallback ======
                if (result.source === 'browser_fallback_required' && this.config.enableBrowserFallback) {
                    console.warn('⚠️  API/Local недоступні, використовую Web Speech API...');
                    return yield this.browserSTT(language);
                }
                console.error('❌ STT не вдалося:', result.error);
                return null;
            }
            catch (error) {
                console.error('❌ Помилка STT API:', error);
                // ====== LEVEL 3: Browser Fallback (при помилці) ======
                if (this.config.enableBrowserFallback) {
                    console.warn('⚠️  Fallback на Web Speech API через помилку...');
                    return yield this.browserSTT(language);
                }
                return null;
            }
        });
    }
    /**
     * 🌐 Browser TTS (Level 3)
     */
    browserTTS(text, language) {
        return __awaiter(this, void 0, void 0, function* () {
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
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    /**
     * 🌐 Browser STT (Level 3)
     */
    browserSTT(language) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.recognition) {
                    reject(new Error('Web Speech Recognition не підтримується'));
                    return;
                }
                try {
                    this.recognition.lang = language === 'uk' ? 'uk-UA' : 'en-US';
                    this.recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        console.log('✅ Browser STT розпізнано:', transcript);
                        resolve(transcript);
                    };
                    this.recognition.onerror = (error) => {
                        console.error('❌ Browser STT помилка:', error);
                        reject(error);
                    };
                    this.recognition.onend = () => {
                        // Auto-resolve якщо нічого не розпізнано
                        resolve(null);
                    };
                    this.recognition.start();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    /**
     * 🎤 Запис аудіо з мікрофона
     */
    recordAudio(duration = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stream = yield navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];
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
            }
            catch (error) {
                console.error('❌ Помилка запису аудіо:', error);
                return null;
            }
        });
    }
    /**
     * 📊 Перевірка здоров'я системи
     */
    checkHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.config.apiBaseUrl}/api/v3/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    return yield response.json();
                }
                return null;
            }
            catch (error) {
                console.error('❌ Помилка health check:', error);
                return null;
            }
        });
    }
    /**
     * 🎯 Повний цикл: запис → розпізнавання → відповідь → синтез
     */
    voiceInteraction(responseGenerator, duration = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🎤 Починаю запис...');
                const audioBlob = yield this.recordAudio(duration);
                if (!audioBlob) {
                    throw new Error('Не вдалося записати аудіо');
                }
                console.log('🗣️ Розпізнаю мовлення...');
                const userText = yield this.recognizeSpeech(audioBlob);
                if (!userText) {
                    throw new Error('Не вдалося розпізнати мовлення');
                }
                console.log('💬 Користувач сказав:', userText);
                console.log('🤖 Генерую відповідь...');
                const responseText = yield responseGenerator(userText);
                console.log('🔊 Озвучую відповідь...');
                yield this.synthesizeSpeech({ text: responseText, language: 'uk' });
                console.log('✅ Взаємодія завершена!');
            }
            catch (error) {
                console.error('❌ Помилка voice interaction:', error);
                throw error;
            }
        });
    }
    /**
     * ⚙️ Оновити конфігурацію
     */
    updateConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
    }
    /**
     * 📊 Отримати поточну конфігурацію
     */
    getConfig() {
        return Object.assign({}, this.config);
    }
}
exports.VoiceAPIClientV3 = VoiceAPIClientV3;
// ============================================
// React Hook для зручного використання
// ============================================
const react_1 = require("react");
function useVoiceAPIV3(config) {
    const [client, setClient] = (0, react_1.useState)(null);
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    const [health, setHealth] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const voiceClient = new VoiceAPIClientV3(config);
        setClient(voiceClient);
        // Перевірити здоров'я при ініціалізації
        voiceClient.checkHealth().then(setHealth);
    }, []);
    const speak = (0, react_1.useCallback)((text, language = 'uk') => __awaiter(this, void 0, void 0, function* () {
        if (!client)
            return;
        setIsSpeaking(true);
        try {
            yield client.synthesizeSpeech({ text, language });
        }
        finally {
            setIsSpeaking(false);
        }
    }), [client]);
    const listen = (0, react_1.useCallback)((duration = 5000) => __awaiter(this, void 0, void 0, function* () {
        if (!client)
            return null;
        setIsRecording(true);
        try {
            const audioBlob = yield client.recordAudio(duration);
            if (!audioBlob)
                return null;
            return yield client.recognizeSpeech(audioBlob);
        }
        finally {
            setIsRecording(false);
        }
    }), [client]);
    const voiceInteraction = (0, react_1.useCallback)((responseGenerator, duration = 5000) => __awaiter(this, void 0, void 0, function* () {
        if (!client)
            return;
        yield client.voiceInteraction(responseGenerator, duration);
    }), [client]);
    const refreshHealth = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!client)
            return;
        const newHealth = yield client.checkHealth();
        setHealth(newHealth);
    }), [client]);
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
exports.useVoiceAPIV3 = useVoiceAPIV3;
exports.default = VoiceAPIClientV3;
