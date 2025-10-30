"use strict";
// 🎤 PREDATOR12 NEXUS - Voice API Integration
// Інтеграція з backend Voice API (Whisper + Coqui TTS)
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
exports.voiceAPI = exports.VoiceAPIClient = void 0;
class VoiceAPIClient {
    constructor(baseURL = 'http://localhost:8000') {
        this.isInitialized = false;
        this.baseURL = baseURL;
    }
    /**
     * Перевірка доступності API
     */
    checkHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/health`);
                const data = yield response.json();
                this.isInitialized = data.status === 'healthy';
                return this.isInitialized;
            }
            catch (error) {
                console.error('❌ Voice API недоступний:', error);
                return false;
            }
        });
    }
    /**
     * Отримання інформації про моделі
     */
    getModelsInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/test/models`);
                return yield response.json();
            }
            catch (error) {
                console.error('❌ Помилка отримання інформації про моделі:', error);
                return null;
            }
        });
    }
    /**
     * Text-to-Speech (TTS)
     * @param text Текст для озвучування
     * @param language Мова (uk/en)
     * @param speed Швидкість мовлення (0.5-2.0)
     */
    textToSpeech(text, language = 'uk', speed = 1.0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔊 TTS запит:', text.substring(0, 50) + '...');
                const response = yield fetch(`${this.baseURL}/api/tts`, {
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
                const data = yield response.json();
                console.log('✅ TTS успішно:', data);
                // Повертаємо повний URL до аудіо
                return `${this.baseURL}${data.audio_url}`;
            }
            catch (error) {
                console.error('❌ Помилка TTS:', error);
                return null;
            }
        });
    }
    /**
     * Speech-to-Text (STT)
     * @param audioBlob Аудіо файл
     */
    speechToText(audioBlob) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🎤 STT запит, розмір:', audioBlob.size, 'bytes');
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.wav');
                const response = yield fetch(`${this.baseURL}/api/stt`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`STT помилка: ${response.statusText}`);
                }
                const data = yield response.json();
                console.log('✅ STT успішно:', data);
                return data.text;
            }
            catch (error) {
                console.error('❌ Помилка STT:', error);
                return null;
            }
        });
    }
    /**
     * Швидкий тест TTS
     */
    testTTS() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/test/tts`);
                const data = yield response.json();
                return `${this.baseURL}${data.audio_url}`;
            }
            catch (error) {
                console.error('❌ Помилка тесту TTS:', error);
                return null;
            }
        });
    }
    /**
     * Програвання аудіо з URL
     */
    playAudio(audioURL) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * Запис аудіо з мікрофону
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
            }
            catch (error) {
                console.error('❌ Помилка запису:', error);
                return null;
            }
        });
    }
    /**
     * Повний цикл: STT -> обробка -> TTS
     */
    voiceInteraction(audioBlob, onTextRecognized, onResponseGenerated) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Розпізнавання мовлення
            const recognizedText = yield this.speechToText(audioBlob);
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
            const audioURL = yield this.textToSpeech(response);
            if (audioURL) {
                yield this.playAudio(audioURL);
            }
        });
    }
    /**
     * Генерація відповіді (заглушка - тут має бути ваша логіка)
     */
    generateResponse(input) {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('привіт') || lowerInput.includes('hello')) {
            return 'Привіт! Я голосовий асистент Нексус. Чим можу допомогти?';
        }
        else if (lowerInput.includes('дашборд')) {
            return 'Відкриваю головний дашборд. Всі системи працюють нормально.';
        }
        else if (lowerInput.includes('статус')) {
            return 'Системний статус відмінний. Всі сервіси активні.';
        }
        else {
            return `Ви сказали: ${input}. Я обробляю вашу команду.`;
        }
    }
}
exports.VoiceAPIClient = VoiceAPIClient;
// Експорт singleton інстансу
exports.voiceAPI = new VoiceAPIClient();
