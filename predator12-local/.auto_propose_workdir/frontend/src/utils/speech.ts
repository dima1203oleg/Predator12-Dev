// Lightweight TTS / STT helpers with Ukrainian defaults
// Uses Web Speech API: speechSynthesis and SpeechRecognition (webkit fallback)

type SpeakOptions = {
  lang?: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

type RecognitionOptions = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  maxAlternatives?: number;
};

const DEFAULT_LANG = 'uk-UA';

function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function listAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    // trigger population
    window.speechSynthesis.getVoices();
  }
  return window.speechSynthesis.getVoices() || [];
}

function chooseVoice(lang = DEFAULT_LANG, preferredName?: string): SpeechSynthesisVoice | null {
  const voices = listAvailableVoices();
  if (!voices || voices.length === 0) return null;

  if (preferredName) {
    const byName = voices.find((v) => v.name === preferredName);
    if (byName) return byName;
  }

  const exact = voices.find((v) => v.lang && v.lang.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;

  const short = lang.split('-')[0];
  const byShort = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(short));
  if (byShort) return byShort;

  return voices.find((v) => !!v.name) || voices[0] || null;
}

async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isTtsSupported()) {
    console.warn('TTS not supported in this browser');
    return;
  }

  const { lang = DEFAULT_LANG, voiceName, rate = 1, pitch = 1, volume = 1 } = opts;

  // Ensure voices are loaded
  await new Promise((res) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) return res(undefined);
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      res(undefined);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(handler, 500);
  });

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;

  const voice = chooseVoice(lang, voiceName);
  if (voice) utter.voice = voice;

  return new Promise((resolve, reject) => {
    utter.onend = () => resolve();
    utter.onerror = (e) => reject(e);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

function isSttSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (err: Error | string) => void,
  opts: RecognitionOptions = {}
): () => void {
  if (!isSttSupported()) {
    onError('STT not supported in this browser');
    return () => {};
  }

  // @ts-ignore
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog: SpeechRecognition = new Recognition();
  recog.lang = opts.lang || DEFAULT_LANG;
  recog.interimResults = !!opts.interimResults;
  recog.continuous = !!opts.continuous;
  if (typeof opts.maxAlternatives === 'number') (recog as any).maxAlternatives = opts.maxAlternatives;

  recog.onresult = (ev: SpeechRecognitionEvent) => {
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const res = ev.results[i];
      const text = res[0]?.transcript || '';
      const isFinal = res.isFinal;
      onResult(text.trim(), isFinal);
    }
  };

  recog.onerror = (e) => {
    // @ts-ignore
    const err = e.error || e.message || e;
    onError(err);
  };

  try {
    recog.start();
  } catch (e) {
    onError(e as Error);
  }

  return () => {
    try {
      recog.stop();
    } catch (e) {
      /* ignore */
    }
  };
}

export default {
  isTtsSupported,
  listAvailableVoices,
  speak,
  isSttSupported,
  startRecognition
};
// Utility wrapper for browser TTS (SpeechSynthesis) and STT (SpeechRecognition)
// Defaults to Ukrainian locale 'uk-UA'.
// Provides simple fallbacks and consistent API for React components.

type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
};

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSttSupported(): boolean {
  // SpeechRecognition prefixes
  const w = window as any;
  return typeof window !== 'undefined' && (!!w.SpeechRecognition || !!w.webkitSpeechRecognition);
}

export async function speak(text: string, opts: SpeakOptions = {}) {
  const { lang = 'uk-UA', rate = 1, pitch = 1, volume = 1, voiceName } = opts;

  if (!isTtsSupported()) {
    // Fallback: try backend TTS test endpoint (voice-providers) — best-effort
    try {
      const res = await fetch('/api/voice-providers/providers');
      if (!res.ok) throw new Error('no-tts-backend');
      const providers = await res.json();
      const provider = providers.find((p: any) => p.category === 'tts' && p.languages?.includes(lang));
      if (provider) {
        // Use backend test endpoint to generate audio (the API currently simulates tests).
        await fetch(`/api/voice-providers/${provider.id}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider_id: provider.id, test_type: 'tts', text, language: lang })
        });
      }
    } catch (e) {
      console.warn('TTS not available in browser and backend fallback failed', e);
    }

    return;
  }

  return new Promise<void>((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;

    const voices = window.speechSynthesis.getVoices() || [];
    if (voiceName) {
      const v = voices.find((x) => x.name === voiceName);
      if (v) utter.voice = v;
    } else {
      // try to pick a Ukrainian voice if available
      const uk = voices.find((x) => (x.lang || '').toLowerCase().startsWith('uk'));
      if (uk) utter.voice = uk;
    }

    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

export function listAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  return window.speechSynthesis.getVoices();
}

type SttOptions = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  maxAlternatives?: number;
};

export function startRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  opts: SttOptions = {}
) {
  const { lang = 'uk-UA', interimResults = true, continuous = false, maxAlternatives = 1 } = opts;

  if (!isSttSupported()) {
    onError && onError(new Error('SpeechRecognition not supported in this browser'));
    return () => {};
  }

  const w = window as any;
  const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
  const recog = new Rec();
  recog.lang = lang;
  recog.interimResults = interimResults;
  recog.continuous = continuous;
  recog.maxAlternatives = maxAlternatives;

  recog.onresult = (ev: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = ev.resultIndex; i < ev.results.length; ++i) {
      const res = ev.results[i];
      if (res.isFinal) finalTranscript += res[0].transcript;
      else interimTranscript += res[0].transcript;
    }

    if (finalTranscript) onResult(finalTranscript.trim(), true);
    else if (interimTranscript) onResult(interimTranscript.trim(), false);
  };

  recog.onerror = (e: any) => {
    onError && onError(e);
  };

  recog.start();

  return () => {
    try {
      recog.stop();
    } catch (e) {
      /* ignore */
    }
  };
}

export default {
  isTtsSupported,
  isSttSupported,
  speak,
  listAvailableVoices,
  startRecognition
};
