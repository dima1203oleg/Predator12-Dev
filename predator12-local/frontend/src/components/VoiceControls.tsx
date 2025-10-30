import React, { useEffect, useRef, useState } from 'react';
import Speech from '../utils/speech';

const VoiceControls: React.FC = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const stopRef = useRef<() => void | null>(null);

  useEffect(() => {
    // warm up voices (some browsers require a user gesture)
    if (Speech.isTtsSupported()) {
      Speech.listAvailableVoices();
    }
  }, []);

  const handleSpeak = async () => {
    await Speech.speak('Привіт! Це тест українського голосового синтезу.', { lang: 'uk-UA' });
  };

  const handleStart = () => {
    setTranscript('');
    setListening(true);
    stopRef.current = Speech.startRecognition(
      (text, isFinal) => {
        setTranscript((prev) => (isFinal ? prev + ' ' + text : text));
        if (isFinal) {
          setListening(false);
        }
      },
      (err) => {
        console.error('STT error', err);
        setListening(false);
      },
      { lang: 'uk-UA', interimResults: true, continuous: false }
    );
  };

  const handleStop = () => {
    if (stopRef.current) stopRef.current();
    setListening(false);
  };

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <h4>Голосовий контролер (українська)</h4>
      <div style={{ marginBottom: 8 }}>
        <button onClick={handleSpeak}>Програти тест TTS</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        {!listening && <button onClick={handleStart}>Почати STT</button>}
        {listening && <button onClick={handleStop}>Зупинити STT</button>}
      </div>

      <div>
        <strong>Розпізнаний текст:</strong>
        <div style={{ marginTop: 8, minHeight: 40 }}>{transcript}</div>
      </div>
    </div>
  );
};

export default VoiceControls;
