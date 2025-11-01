"use strict";
/**
 * AssistantPage - AI Assistant Entry Screen
 * Main page component that orchestrates all assistant functionality
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_i18next_1 = require("react-i18next");
const assistantStore_1 = require("./state/assistantStore");
const useASR_1 = require("./hooks/useASR");
const useTTS_1 = require("./hooks/useTTS");
const useAssistantAPI_1 = require("./hooks/useAssistantAPI");
require("./i18n"); // Initialize i18n with Ukrainian default
require("./assistant.css");
// Lazy load heavy components
const Head3D = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('./components/Head3D'))));
const ChatPanel = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('./components/ChatPanel'))));
const NetworkPanel = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('./components/NetworkPanel'))));
const RiskBanner = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('./components/RiskBanner'))));
// ============================================================================
// Loading Fallbacks
// ============================================================================
const LoadingSpinner = () => (<div className="flex items-center justify-center w-full h-full">
    <div className="spinner"></div>
  </div>);
const Head3DFallback = () => {
    const { t } = (0, react_i18next_1.useTranslation)();
    return (<div className="flex items-center justify-center w-full h-full bg-nexus-dark">
      <div className="text-center">
        <div className="text-cyan-400 text-4xl mb-4 animate-pulse-glow">⚡</div>
        <p className="text-gray-400">{t('assistant.loading')}</p>
      </div>
    </div>);
};
// ============================================================================
// Main Component
// ============================================================================
function AssistantPage() {
    const { t, i18n } = (0, react_i18next_1.useTranslation)();
    const locale = (0, assistantStore_1.useAssistantStore)((s) => s.locale);
    const setLocale = (0, assistantStore_1.useAssistantStore)((s) => s.setLocale);
    const chat = (0, assistantStore_1.useAssistantStore)((s) => s.chat);
    const mic = (0, assistantStore_1.useAssistantStore)((s) => s.mic);
    const asr = (0, useASR_1.useASR)();
    const tts = (0, useTTS_1.useTTS)();
    const api = (0, useAssistantAPI_1.useAssistantAPI)();
    // ============================================================================
    // Sync i18n with store
    // ============================================================================
    (0, react_1.useEffect)(() => {
        const lang = locale.split('-')[0];
        if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
        }
    }, [locale, i18n]);
    // ============================================================================
    // Initialize
    // ============================================================================
    (0, react_1.useEffect)(() => {
        console.log('[AssistantPage] Mounted');
        // Load initial data
        api.fetchAlerts().then((alerts) => {
            if (alerts) {
                assistantStore_1.useAssistantStore.getState().setAlerts(alerts);
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
    (0, react_1.useEffect)(() => {
        const lastMessage = chat.history[chat.history.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && !tts.isSpeaking) {
            const lang = locale.startsWith('uk') ? 'uk' : 'en';
            tts.speak(lastMessage.content, lang);
        }
    }, [chat.history, tts.isSpeaking, locale]);
    // ============================================================================
    // Keyboard Shortcuts
    // ============================================================================
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            var _a;
            // M - Toggle microphone
            if (e.key === 'm' || e.key === 'M') {
                if (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) === 'INPUT')
                    return;
                e.preventDefault();
                if (mic.enabled) {
                    asr.stop();
                }
                else {
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
                assistantStore_1.useAssistantStore.getState().clearChat();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [asr, tts, mic.enabled]);
    // ============================================================================
    // Render
    // ============================================================================
    return (<div className="h-screen flex flex-col bg-nexus-dark text-gray-100">
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
          <select value={locale} onChange={(e) => setLocale(e.target.value)} className="bg-gray-900 border border-nexus rounded px-3 py-1 text-sm text-gray-100 focus:outline-none focus:border-cyan-400" aria-label={t('assistant.languageSelect')} title={t('assistant.languageSelect')}>
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
        <react_1.Suspense fallback={<LoadingSpinner />}>
          <ChatPanel />
        </react_1.Suspense>

        {/* Center: 3D Head */}
        <react_1.Suspense fallback={<Head3DFallback />}>
          <Head3D />
        </react_1.Suspense>

        {/* Right: Network Graph */}
        <react_1.Suspense fallback={<LoadingSpinner />}>
          <NetworkPanel />
        </react_1.Suspense>
      </main>

      {/* Bottom: Risk Banner */}
      <react_1.Suspense fallback={null}>
        <RiskBanner />
      </react_1.Suspense>

      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === 'development' && (<div className="absolute bottom-4 right-4 text-xs text-cyan-400 font-mono bg-black/80 p-3 rounded border border-cyan-500/30 max-w-xs">
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
        </div>)}
    </div>);
}
exports.default = AssistantPage;
