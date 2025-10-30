"use strict";
/**
 * useTTS Hook - Text-to-Speech
 * Supports speechSynthesis (browser) + fallback to Coqui TTS (backend)
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
exports.useTTS = void 0;
const react_1 = require("react");
const assistantStore_1 = require("../state/assistantStore");
// ============================================================================
// Hook
// ============================================================================
function useTTS() {
    const { locale, setHeadAnimation } = (0, assistantStore_1.useAssistantStore)();
    const [supported, setSupported] = (0, react_1.useState)('none');
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [availableVoices, setAvailableVoices] = (0, react_1.useState)([]);
    const utteranceRef = (0, react_1.useRef)(null);
    const audioRef = (0, react_1.useRef)(null);
    // Language mapping
    const language = locale.startsWith('uk') ? 'uk' : 'en';
    // ============================================================================
    // Detect Support & Load Voices
    // ============================================================================
    (0, react_1.useEffect)(() => {
        const hasSpeechSynthesis = 'speechSynthesis' in window;
        setSupported(hasSpeechSynthesis ? 'browser' : 'fallback');
        if (hasSpeechSynthesis) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                setAvailableVoices(voices);
                console.log('[TTS] Voices loaded:', voices.length);
            };
            loadVoices();
            window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
            return () => {
                window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            };
        }
    }, []);
    // ============================================================================
    // Voice Selection Logic
    // ============================================================================
    const getVoiceByLanguage = (0, react_1.useCallback)((lang) => {
        if (!availableVoices.length)
            return null;
        const langCode = lang === 'uk' ? 'uk-UA' : 'en-US';
        const langPrefix = lang === 'uk' ? 'uk' : 'en';
        // Priority 1: Exact match (uk-UA, en-US)
        let voice = availableVoices.find((v) => v.lang === langCode);
        if (voice) {
            console.log('[TTS] Voice found (exact):', voice.name, voice.lang);
            return voice;
        }
        // Priority 2: Partial match (uk, en)
        voice = availableVoices.find((v) => v.lang.startsWith(langPrefix));
        if (voice) {
            console.log('[TTS] Voice found (partial):', voice.name, voice.lang);
            return voice;
        }
        // Priority 3: Fallback to Russian for Ukrainian (if available)
        if (lang === 'uk') {
            voice = availableVoices.find((v) => v.lang.startsWith('ru'));
            if (voice) {
                console.log('[TTS] Voice found (fallback ru):', voice.name, voice.lang);
                return voice;
            }
        }
        // Priority 4: Default system voice
        console.warn('[TTS] No matching voice, using default');
        return availableVoices[0] || null;
    }, [availableVoices]);
    // ============================================================================
    // Browser TTS (Speech Synthesis)
    // ============================================================================
    const speakBrowser = (0, react_1.useCallback)((text, lang) => __awaiter(this, void 0, void 0, function* () {
        if (!('speechSynthesis' in window)) {
            throw new Error('Speech Synthesis не підтримується');
        }
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getVoiceByLanguage(lang);
        if (voice) {
            utterance.voice = voice;
        }
        utterance.lang = lang === 'uk' ? 'uk-UA' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onstart = () => {
            console.log('[TTS] Started speaking');
            setIsSpeaking(true);
            setHeadAnimation({ speaking: true, intensity: 0.7 });
        };
        utterance.onend = () => {
            console.log('[TTS] Finished speaking');
            setIsSpeaking(false);
            setHeadAnimation({ speaking: false, intensity: 0 });
            utteranceRef.current = null;
        };
        utterance.onerror = (event) => {
            console.error('[TTS] Error:', event.error);
            setError(`Помилка TTS: ${event.error}`);
            setIsSpeaking(false);
            setHeadAnimation({ speaking: false, intensity: 0 });
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }), [getVoiceByLanguage, setHeadAnimation]);
    // ============================================================================
    // Fallback TTS (Backend Coqui API)
    // ============================================================================
    const speakFallback = (0, react_1.useCallback)((text, lang) => __awaiter(this, void 0, void 0, function* () {
        try {
            setIsSpeaking(true);
            setHeadAnimation({ speaking: true, intensity: 0.7 });
            const langParam = lang === 'uk' ? 'uk' : 'en';
            const response = yield fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=${langParam}`, {
                method: 'GET',
                headers: {
                    Accept: 'audio/wav',
                },
            });
            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status}`);
            }
            const blob = yield response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => {
                console.log('[TTS] Finished speaking (fallback)');
                setIsSpeaking(false);
                setHeadAnimation({ speaking: false, intensity: 0 });
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
            };
            audio.onerror = (err) => {
                console.error('[TTS] Audio playback error:', err);
                setError('Помилка відтворення аудіо');
                setIsSpeaking(false);
                setHeadAnimation({ speaking: false, intensity: 0 });
                URL.revokeObjectURL(audioUrl);
            };
            yield audio.play();
        }
        catch (err) {
            console.error('[TTS] Fallback error:', err);
            setError(err.message || 'Помилка TTS fallback');
            setIsSpeaking(false);
            setHeadAnimation({ speaking: false, intensity: 0 });
        }
    }), [setHeadAnimation]);
    // ============================================================================
    // Public Methods
    // ============================================================================
    const speak = (0, react_1.useCallback)((text, lang) => __awaiter(this, void 0, void 0, function* () {
        if (!text.trim()) {
            console.warn('[TTS] Empty text, skipping');
            return;
        }
        const targetLang = lang || language;
        setError(null);
        try {
            if (supported === 'browser') {
                yield speakBrowser(text, targetLang);
            }
            else if (supported === 'fallback') {
                yield speakFallback(text, targetLang);
            }
            else {
                throw new Error('TTS не підтримується');
            }
        }
        catch (err) {
            console.error('[TTS] Speak error:', err);
            setError(err.message || 'Помилка озвучування');
        }
    }), [language, supported, speakBrowser, speakFallback]);
    const stop = (0, react_1.useCallback)(() => {
        if (supported === 'browser' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
        setHeadAnimation({ speaking: false, intensity: 0 });
        utteranceRef.current = null;
    }, [supported, setHeadAnimation]);
    const pause = (0, react_1.useCallback)(() => {
        if (supported === 'browser' && 'speechSynthesis' in window) {
            window.speechSynthesis.pause();
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [supported]);
    const resume = (0, react_1.useCallback)(() => {
        if (supported === 'browser' && 'speechSynthesis' in window) {
            window.speechSynthesis.resume();
        }
        if (audioRef.current) {
            audioRef.current.play();
        }
    }, [supported]);
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
        isSpeaking,
        error,
        speak,
        stop,
        pause,
        resume,
        availableVoices,
    };
}
exports.useTTS = useTTS;
