'use client';

import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VoiceControlsProps {
  isListening: boolean;
  onToggleListening: () => void;
  transcript: string;
}

export function VoiceControls({ isListening, onToggleListening, transcript }: VoiceControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (isListening) {
      // Simulate audio level for visual feedback
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  return (
    <div className="mt-6 space-y-4">
      {/* Voice Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={onToggleListening}
          className={`relative p-6 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
          
          {/* Pulse animation when listening */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-75" />
              <span className="absolute inset-0 rounded-full bg-purple-600 animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* Audio Level Indicator */}
      {isListening && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Рівень звуку</span>
            <span>{Math.round(audioLevel)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Ви сказали:</p>
          <p className="text-white">{transcript}</p>
        </div>
      )}

      {/* Speaker Controls */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
        <span className="text-sm text-gray-400">Звук відповідей</span>
        <button
          onClick={() => setIsSpeaking(!isSpeaking)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isSpeaking ? (
            <Volume2 className="w-5 h-5 text-green-500" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center text-sm text-gray-400">
        {isListening ? (
          <span className="text-purple-400">🎤 Слухаю...</span>
        ) : (
          <span>Натисніть мікрофон щоб почати</span>
        )}
      </div>
    </div>
  );
}
