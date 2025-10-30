"use strict";
/**
 * useASR Hook - Automatic Speech Recognition
 * Supports Web Speech API (browser) + fallback to backend API
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
exports.useASR = void 0;
const react_1 = require("react");
const assistantStore_1 = require("../state/assistantStore");
// ============================================================================
// Hook
// ============================================================================
function useASR() {
    const { locale, setMic, pushMessage, setMicLevel } = (0, assistantStore_1.useAssistantStore)();
    const [supported, setSupported] = (0, react_1.useState)('none');
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const recognitionRef = (0, react_1.useRef)(null);
    const audioContextRef = (0, react_1.useRef)(null);
    const analyserRef = (0, react_1.useRef)(null);
    const micStreamRef = (0, react_1.useRef)(null);
    const animationFrameRef = (0, react_1.useRef)(null);
    // Language mapping
    const language = locale.startsWith('uk') ? 'uk' : 'en';
    const speechLang = locale; // 'uk-UA' | 'en-US'
    // ============================================================================
    // Detect Support
    // ============================================================================
    (0, react_1.useEffect)(() => {
        const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        setSupported(hasSpeechRecognition ? 'browser' : 'fallback');
    }, []);
    // ============================================================================
    // VU Meter (Audio Level Detection)
    // ============================================================================
    const startVUMeter = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext ||
                    window.webkitAudioContext)();
            }
            const stream = yield navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
                if (!analyserRef.current || !isListening) {
                    return;
                }
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
                const normalized = Math.min(average / 128, 1); // 0-1 range
                setMicLevel(normalized);
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
        }
        catch (err) {
            console.error('VU Meter error:', err);
            setError('Не вдалося отримати доступ до мікрофона');
        }
    }), [isListening, setMicLevel]);
    const stopVUMeter = (0, react_1.useCallback)(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach((track) => track.stop());
            micStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        analyserRef.current = null;
        setMicLevel(0);
    }, [setMicLevel]);
    // ============================================================================
    // Browser ASR (Web Speech API)
    // ============================================================================
    const startBrowserASR = (0, react_1.useCallback)(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech Recognition не підтримується');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = speechLang;
        recognition.continuous = assistantStore_1.useAssistantStore.getState().mic.continuous;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
            console.log('[ASR] Started', speechLang);
            setIsListening(true);
            setError(null);
            setMic({ enabled: true, status: 'listening' });
            startVUMeter();
        };
        recognition.onresult = (event) => {
            const results = Array.from(event.results);
            const lastResult = results[results.length - 1];
            const transcript = lastResult[0].transcript;
            const confidence = lastResult[0].confidence;
            const isFinal = lastResult.isFinal;
            console.log('[ASR] Result:', { transcript, confidence, isFinal });
            if (isFinal && transcript.trim()) {
                pushMessage({
                    role: 'user',
                    content: transcript,
                    confidence,
                });
            }
        };
        recognition.onerror = (event) => {
            console.error('[ASR] Error:', event.error);
            setError(`Помилка розпізнавання: ${event.error}`);
            setMic({ status: 'error', error: event.error });
            stop();
        };
        recognition.onend = () => {
            console.log('[ASR] Ended');
            setIsListening(false);
            setMic({ enabled: false, status: 'idle' });
            stopVUMeter();
        };
        recognitionRef.current = recognition;
        recognition.start();
    }, [speechLang, setMic, pushMessage, startVUMeter, stopVUMeter]);
    // ============================================================================
    // Fallback ASR (Backend API)
    // ============================================================================
    const startFallbackASR = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        // TODO: Implement backend ASR via /api/asr endpoint
        console.warn('[ASR] Fallback mode not implemented yet');
        setError('Fallback ASR не реалізовано. Використовуйте Chrome/Edge.');
    }), []);
    // ============================================================================
    // Public Methods
    // ============================================================================
    const start = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (isListening) {
            console.warn('[ASR] Already listening');
            return;
        }
        setError(null);
        if (supported === 'browser') {
            startBrowserASR();
        }
        else if (supported === 'fallback') {
            yield startFallbackASR();
        }
        else {
            setError('ASR не підтримується на цьому пристрої');
        }
    }), [isListening, supported, startBrowserASR, startFallbackASR]);
    const stop = (0, react_1.useCallback)(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        stopVUMeter();
        setIsListening(false);
        setMic({ enabled: false, status: 'idle' });
    }, [setMic, stopVUMeter]);
    const setLanguage = (0, react_1.useCallback)((lang) => {
        if (isListening) {
            stop();
        }
        // Language will be updated via locale in store
    }, [isListening, stop]);
    // ============================================================================
    // Cleanup
    // ============================================================================
    (0, react_1.useEffect)(() => {
        return () => {
            stop();
        };
    }, [stop]);
    return {
        supported,
        isListening,
        error,
        start,
        stop,
        setLanguage,
    };
}
exports.useASR = useASR;
