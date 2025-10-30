/**
 * ChatPanel Component - Chat Interface with Voice Controls
 *
 * Features:
 * - Message history with user/assistant roles
 * - Text input with voice button
 * - MicStatus integration (VU-meter)
 * - Loading states, error handling
 * - i18n support (UA/EN)
 * - Keyboard shortcuts (Enter, Shift+Enter, M for mic)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssistantStore } from '../state/assistantStore';
import { useASR } from '../hooks/useASR';
import { useTTS } from '../hooks/useTTS';
import { useAssistantAPI } from '../hooks/useAssistantAPI';
import MicStatus from './MicStatus';

export default function ChatPanel() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = useAssistantStore((s) => s.chat);
  const mic = useAssistantStore((s) => s.mic);
  const pushMessage = useAssistantStore((s) => s.pushMessage);
  const setMic = useAssistantStore((s) => s.setMic);

  const { start: startASR, stop: stopASR, supported: asrSupported } = useASR();
  const { speak } = useTTS();
  const { executeIntent } = useAssistantAPI();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.history]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return;

    pushMessage({ role: 'user', text: input });
    setInput('');

    try {
      const response = await executeIntent(input, []);
      if (response) {
        pushMessage({ role: 'assistant', text: response.answer });

        // TTS response
        speak(response.answer);
      }
    } catch (error) {
      pushMessage({ role: 'assistant', text: t('chat.error') });
    }
  };

  // Handle mic toggle
  const handleMicToggle = () => {
    if (mic.enabled) {
      stopASR();
      setMic({ enabled: false });
    } else {
      startASR();
      setMic({ enabled: true });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // M key for mic (when not in input)
      if (e.key === 'm' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleMicToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mic.enabled]);

  return (
    <div className="flex flex-col h-full bg-nexus-panel border-r border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <h2 className="text-lg font-bold text-cyan-400">
          {t('chat.title')}
        </h2>
        <MicStatus />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.history.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>{t('chat.empty')}</p>
            <p className="text-sm mt-2">{t('chat.hint')}</p>
          </div>
        )}

        {chat.history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-cyan-500/30'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text || msg.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {chat.loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-cyan-500/30 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-4 py-2 bg-gray-900 border border-cyan-500/30 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400
                       transition-colors"
            disabled={chat.loading}
          />

          {/* Mic Button */}
          <button
            onClick={handleMicToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mic.enabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={chat.loading || asrSupported === 'none'}
            title={t('chat.micTooltip')}
            aria-label={mic.enabled ? t('chat.micStop') : t('chat.micStart')}
          >
            {mic.enabled ? '⏹️' : '🎤'}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || chat.loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg
                       font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('chat.send')}
          >
            {t('chat.send')}
          </button>
        </div>

        {/* ASR Fallback Warning */}
        {asrSupported === 'fallback' && (
          <p className="text-xs text-yellow-500 mt-2">
            ⚠️ {t('chat.asrFallback')}
          </p>
        )}
        {asrSupported === 'none' && (
          <p className="text-xs text-red-500 mt-2">
            ❌ {t('chat.asrUnsupported')}
          </p>
        )}
      </div>
    </div>
  );
}
