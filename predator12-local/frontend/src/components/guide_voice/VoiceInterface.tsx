// @ts-nocheck
import { useState, useEffect } from 'react';

const useVoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'uk-UA';
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript + ' ');
        } else {
          interimTranscript += transcript;
        }
      }
      // Update UI with interim results
    };
    
    recognition.start();
    setIsListening(true);
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  const speak = (text: string, lang = 'uk') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak
  };
};

export default useVoiceInterface;
