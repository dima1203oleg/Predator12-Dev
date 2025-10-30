/**
 * useTTS Hook - Text-to-Speech
 * Supports speechSynthesis (browser) + fallback to Coqui TTS (backend)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAssistantStore } from '../state/assistantStore';
import type { Language } from '../types';

// ============================================================================
// Types
// ============================================================================

type TTSMode = 'browser' | 'fallback' | 'none';

interface UseTTSReturn {
  supported: TTSMode;
  isSpeaking: boolean;
  error: string | null;
  speak: (text: string, lang?: Language) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  availableVoices: SpeechSynthesisVoice[];
}

// ============================================================================
// Hook
// ============================================================================

export function useTTS(): UseTTSReturn {
  const { locale, setHeadAnimation } = useAssistantStore();
  const [supported, setSupported] = useState<TTSMode>('none');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Language mapping
  const language: Language = locale.startsWith('uk') ? 'uk' : 'en';

  // ============================================================================
  // Detect Support & Load Voices
  // ============================================================================

  useEffect(() => {
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

  const getVoiceByLanguage = useCallback(
    (lang: Language): SpeechSynthesisVoice | null => {
      if (!availableVoices.length) return null;

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
    },
    [availableVoices]
  );

  // ============================================================================
  // Browser TTS (Speech Synthesis)
  // ============================================================================

  const speakBrowser = useCallback(
    async (text: string, lang: Language) => {
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
    },
    [getVoiceByLanguage, setHeadAnimation]
  );

  // ============================================================================
  // Fallback TTS (Backend Coqui API)
  // ============================================================================

  const speakFallback = useCallback(
    async (text: string, lang: Language) => {
      try {
        setIsSpeaking(true);
        setHeadAnimation({ speaking: true, intensity: 0.7 });

        const langParam = lang === 'uk' ? 'uk' : 'en';
        const response = await fetch(
          `/api/tts?text=${encodeURIComponent(text)}&lang=${langParam}`,
          {
            method: 'GET',
            headers: {
              Accept: 'audio/wav',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }

        const blob = await response.blob();
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

        await audio.play();
      } catch (err: any) {
        console.error('[TTS] Fallback error:', err);
        setError(err.message || 'Помилка TTS fallback');
        setIsSpeaking(false);
        setHeadAnimation({ speaking: false, intensity: 0 });
      }
    },
    [setHeadAnimation]
  );

  // ============================================================================
  // Public Methods
  // ============================================================================

  const speak = useCallback(
    async (text: string, lang?: Language) => {
      if (!text.trim()) {
        console.warn('[TTS] Empty text, skipping');
        return;
      }

      const targetLang = lang || language;
      setError(null);

      try {
        if (supported === 'browser') {
          await speakBrowser(text, targetLang);
        } else if (supported === 'fallback') {
          await speakFallback(text, targetLang);
        } else {
          throw new Error('TTS не підтримується');
        }
      } catch (err: any) {
        console.error('[TTS] Speak error:', err);
        setError(err.message || 'Помилка озвучування');
      }
    },
    [language, supported, speakBrowser, speakFallback]
  );

  const stop = useCallback(() => {
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

  const pause = useCallback(() => {
    if (supported === 'browser' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [supported]);

  const resume = useCallback(() => {
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

  useEffect(() => {
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
