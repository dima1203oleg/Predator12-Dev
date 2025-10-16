/**
 * useASR Hook - Automatic Speech Recognition
 * Supports Web Speech API (browser) + fallback to backend API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAssistantStore } from '../state/assistantStore';
import type { Language } from '../types';

// ============================================================================
// Types
// ============================================================================

type ASRMode = 'browser' | 'fallback' | 'none';

interface ASRResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseASRReturn {
  supported: ASRMode;
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  setLanguage: (lang: Language) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useASR(): UseASRReturn {
  const { locale, setMic, pushMessage, setMicLevel } = useAssistantStore();
  const [supported, setSupported] = useState<ASRMode>('none');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Language mapping
  const language: Language = locale.startsWith('uk') ? 'uk' : 'en';
  const speechLang = locale; // 'uk-UA' | 'en-US'

  // ============================================================================
  // Detect Support
  // ============================================================================

  useEffect(() => {
    const hasSpeechRecognition =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setSupported(hasSpeechRecognition ? 'browser' : 'fallback');
  }, []);

  // ============================================================================
  // VU Meter (Audio Level Detection)
  // ============================================================================

  const startVUMeter = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    } catch (err) {
      console.error('VU Meter error:', err);
      setError('Не вдалося отримати доступ до мікрофона');
    }
  }, [isListening, setMicLevel]);

  const stopVUMeter = useCallback(() => {
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

  const startBrowserASR = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech Recognition не підтримується');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.continuous = useAssistantStore.getState().mic.continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[ASR] Started', speechLang);
      setIsListening(true);
      setError(null);
      setMic({ enabled: true, status: 'listening' });
      startVUMeter();
    };

    recognition.onresult = (event: any) => {
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

    recognition.onerror = (event: any) => {
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

  const startFallbackASR = useCallback(async () => {
    // TODO: Implement backend ASR via /api/asr endpoint
    console.warn('[ASR] Fallback mode not implemented yet');
    setError('Fallback ASR не реалізовано. Використовуйте Chrome/Edge.');
  }, []);

  // ============================================================================
  // Public Methods
  // ============================================================================

  const start = useCallback(async () => {
    if (isListening) {
      console.warn('[ASR] Already listening');
      return;
    }

    setError(null);

    if (supported === 'browser') {
      startBrowserASR();
    } else if (supported === 'fallback') {
      await startFallbackASR();
    } else {
      setError('ASR не підтримується на цьому пристрої');
    }
  }, [isListening, supported, startBrowserASR, startFallbackASR]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stopVUMeter();
    setIsListening(false);
    setMic({ enabled: false, status: 'idle' });
  }, [setMic, stopVUMeter]);

  const setLanguage = useCallback(
    (lang: Language) => {
      if (isListening) {
        stop();
      }
      // Language will be updated via locale in store
    },
    [isListening, stop]
  );

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
    isListening,
    error,
    start,
    stop,
    setLanguage,
  };
}
