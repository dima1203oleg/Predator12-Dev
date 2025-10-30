import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInputProps {
  onCommand: (command: string) => void;
  onListeningChange: (isListening: boolean) => void;
  placeholder: string;
}

/**
 * Компонент голосового вводу для CYBER-ACE
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
  onCommand,
  onListeningChange,
  placeholder
}) => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Ініціалізація Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = i18n.language === 'uk' ? 'uk-UA' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setTranscript(final.trim());
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(t('voice.error.' + event.error));
        setIsListening(false);
        onListeningChange(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Перезапустити якщо ще слухаємо
          recognitionRef.current?.start();
        }
      };
    } else {
      setError(t('voice.error.notSupported'));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [i18n.language, t]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError(t('voice.error.notSupported'));
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      onListeningChange(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError(t('voice.error.failed'));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      onListeningChange(false);

      // Відправити команду якщо є текст
      if (transcript) {
        onCommand(transcript);
        setTranscript('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onCommand(transcript);
      setTranscript('');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="voice-input-container">
      <form onSubmit={handleSubmit} className="voice-input-form">
        {/* Текстове поле */}
        <div className="input-wrapper">
          <input
            type="text"
            className="voice-input"
            value={transcript || interimTranscript}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={isListening}
          />

          {/* Анімація прослуховування */}
          {isListening && (
            <motion.div
              className="listening-animation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="wave-container">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="wave-bar"
                    animate={{
                      scaleY: [1, 2, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Кнопки */}
        <div className="voice-input-actions">
          {/* Кнопка мікрофону */}
          <motion.button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!!error && error !== t('voice.error.notSupported')}
          >
            {isListening ? '⏸️' : '🎤'}
          </motion.button>

          {/* Кнопка відправки */}
          <motion.button
            type="submit"
            className="send-btn"
            disabled={!transcript.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('voice.send')}
          </motion.button>
        </div>
      </form>

      {/* Помилки */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="voice-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Підказки */}
      {!isListening && !transcript && (
        <div className="voice-hints">
          <span className="hint">{t('voice.hint1')}</span>
          <span className="hint">{t('voice.hint2')}</span>
          <span className="hint">{t('voice.hint3')}</span>
        </div>
      )}
    </div>
  );
};
