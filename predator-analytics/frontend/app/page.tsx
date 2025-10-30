'use client';

import { useState, Suspense } from 'react';
import { AIAvatar } from '@/components/AIAvatar';
import { VoiceControls } from '@/components/VoiceControls';
import { ChatInterface } from '@/components/ChatInterface';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Predator Analytics
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {isProcessing ? 'Обробка...' : 'Готовий до роботи'}
              </span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: 3D Avatar */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                AI Асистент
              </h2>

              {/* 3D Avatar Container */}
              <div className="aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/5">
                <Suspense
                  fallback={
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    </div>
                  }
                >
                  <AIAvatar
                    isListening={isListening}
                    isProcessing={isProcessing}
                  />
                </Suspense>
              </div>

              {/* Voice Controls */}
              <VoiceControls
                isListening={isListening}
                onToggleListening={() => setIsListening(!isListening)}
                transcript={transcript}
              />
            </div>
          </div>

          {/* Right: Chat & Analytics */}
          <div className="space-y-6">
            {/* Chat Interface */}
            <ChatInterface
              onTranscript={setTranscript}
              onProcessingChange={setIsProcessing}
            />

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Швидкі дії
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-white transition-all">
                  Аналіз даних
                </button>
                <button className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg text-white transition-all">
                  Навчання моделі
                </button>
                <button className="px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-lg text-white transition-all">
                  Перевірка даних
                </button>
                <button className="px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-white transition-all">
                  Звіти
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
