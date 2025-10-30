/**
 * AssistantPage - AI Assistant Entry Screen
 * Main page component that orchestrates all assistant functionality
 */

import React, { useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssistantStore } from './state/assistantStore';
import { useASR } from './hooks/useASR';
import { useTTS } from './hooks/useTTS';
import { useAssistantAPI } from './hooks/useAssistantAPI';
import './i18n'; // Initialize i18n with Ukrainian default
import './assistant.css';

// Lazy load heavy components
const Head3D = React.lazy(() => import('./components/Head3D'));
const ChatPanel = React.lazy(() => import('./components/ChatPanel'));
const NetworkPanel = React.lazy(() => import('./components/NetworkPanel'));
const RiskBanner = React.lazy(() => import('./components/RiskBanner'));

// ============================================================================
// Loading Fallbacks
// ============================================================================

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="spinner"></div>
  </div>
);

const Head3DFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center w-full h-full bg-nexus-dark">
      <div className="text-center">
        <div className="text-cyan-400 text-4xl mb-4 animate-pulse-glow">⚡</div>
        <p className="text-gray-400">{t('assistant.loading')}</p>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const locale = useAssistantStore((s) => s.locale);
  const setLocale = useAssistantStore((s) => s.setLocale);
  const chat = useAssistantStore((s) => s.chat);
  const mic = useAssistantStore((s) => s.mic);

  const asr = useASR();
  const tts = useTTS();
  const api = useAssistantAPI();

  // ============================================================================
  // Sync i18n with store
  // ============================================================================

  useEffect(() => {
    const lang = locale.split('-')[0];
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [locale, i18n]);

  // ============================================================================
  // Initialize
  // ============================================================================

  useEffect(() => {
    console.log('[AssistantPage] Mounted');

    // Load initial data
    api.fetchAlerts().then((alerts) => {
      if (alerts) {
        useAssistantStore.getState().setAlerts(alerts);
      }
    });

    return () => {
      console.log('[AssistantPage] Unmounted');
      asr.stop();
      tts.stop();
    };
  }, []);

  // ============================================================================
  // Auto-TTS for assistant messages
  // ============================================================================

  useEffect(() => {
    const lastMessage = chat.history[chat.history.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !tts.isSpeaking) {
      const lang = locale.startsWith('uk') ? 'uk' : 'en';
      tts.speak(lastMessage.content, lang);
    }
  }, [chat.history, tts.isSpeaking, locale]);

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // M - Toggle microphone
      if (e.key === 'm' || e.key === 'M') {
        if (document.activeElement?.tagName === 'INPUT') return;
        e.preventDefault();
        if (mic.enabled) {
          asr.stop();
        } else {
          asr.start();
        }
      }

      // Escape - Stop everything
      if (e.key === 'Escape') {
        asr.stop();
        tts.stop();
      }

      // Ctrl+L - Clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        useAssistantStore.getState().clearChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [asr, tts, mic.enabled]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="h-screen flex flex-col bg-nexus-dark text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-nexus bg-nexus-panel">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-nexus-cyan">{t('assistant.title')}</h1>
          <span className="text-xs text-gray-500">
            {t('assistant.subtitle')}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Language switcher (Ukrainian first) */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            className="bg-gray-900 border border-nexus rounded px-3 py-1 text-sm text-gray-100 focus:outline-none focus:border-cyan-400"
            aria-label={t('assistant.languageSelect')}
            title={t('assistant.languageSelect')}
          >
            <option value="uk-UA">🇺🇦 Українська</option>
            <option value="en-US">🇬🇧 English</option>
          </select>

          {/* Status indicators */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`flex items-center gap-1 ${asr.supported === 'browser' ? 'text-green-500' : 'text-yellow-500'}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>ASR</span>
            </div>
            <div className={`flex items-center gap-1 ${tts.supported === 'browser' ? 'text-green-500' : 'text-yellow-500'}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>TTS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* Left: Chat Panel */}
        <Suspense fallback={<LoadingSpinner />}>
          <ChatPanel />
        </Suspense>

        {/* Center: 3D Head */}
        <Suspense fallback={<Head3DFallback />}>
          <Head3D />
        </Suspense>

        {/* Right: Network Graph */}
        <Suspense fallback={<LoadingSpinner />}>
          <NetworkPanel />
        </Suspense>
      </main>

      {/* Bottom: Risk Banner */}
      <Suspense fallback={null}>
        <RiskBanner />
      </Suspense>

      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 text-xs text-cyan-400 font-mono bg-black/80 p-3 rounded border border-cyan-500/30 max-w-xs">
          <div className="font-bold mb-2">Debug Info</div>
          <div>Locale: {locale}</div>
          <div>ASR: {asr.supported} {mic.enabled && '(active)'}</div>
          <div>TTS: {tts.supported} {tts.isSpeaking && '(speaking)'}</div>
          <div>Messages: {chat.history.length}</div>
          <div>Loading: {chat.loading ? 'yes' : 'no'}</div>
          <div className="mt-2 pt-2 border-t border-cyan-500/30 text-gray-500">
            <div className="font-semibold mb-1">Shortcuts:</div>
            <div>M - mic toggle</div>
            <div>Esc - stop all</div>
            <div>Ctrl+L - clear chat</div>
          </div>
        </div>
      )}
    </div>
  );
}
