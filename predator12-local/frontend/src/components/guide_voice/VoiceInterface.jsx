"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = require("react");
const useVoiceInterface = () => {
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [transcript, setTranscript] = (0, react_1.useState)('');
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window))
            return;
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'uk-UA';
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    setTranscript(prev => prev + transcript + ' ');
                }
                else {
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
    const speak = (text, lang = 'uk') => {
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
exports.default = useVoiceInterface;
