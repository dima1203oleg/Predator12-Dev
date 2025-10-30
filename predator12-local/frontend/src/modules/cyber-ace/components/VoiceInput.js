"use strict";
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
exports.VoiceInput = void 0;
const react_1 = __importStar(require("react"));
const react_i18next_1 = require("react-i18next");
const framer_motion_1 = require("framer-motion");
/**
 * Компонент голосового вводу для CYBER-ACE
 */
const VoiceInput = ({ onCommand, onListeningChange, placeholder }) => {
    const { t, i18n } = (0, react_i18next_1.useTranslation)();
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [transcript, setTranscript] = (0, react_1.useState)('');
    const [interimTranscript, setInterimTranscript] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)(null);
    const recognitionRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // Ініціалізація Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition ||
                window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
            recognitionRef.current.onresult = (event) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        final += transcript + ' ';
                    }
                    else {
                        interim += transcript;
                    }
                }
                if (final) {
                    setTranscript(final.trim());
                    setInterimTranscript('');
                }
                else {
                    setInterimTranscript(interim);
                }
            };
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setError(t('voice.error.' + event.error));
                setIsListening(false);
                onListeningChange(false);
            };
            recognitionRef.current.onend = () => {
                var _a;
                if (isListening) {
                    // Перезапустити якщо ще слухаємо
                    (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.start();
                }
            };
        }
        else {
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
        }
        catch (err) {
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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (transcript.trim()) {
            onCommand(transcript);
            setTranscript('');
        }
    };
    const handleTextChange = (e) => {
        setTranscript(e.target.value);
    };
    return (<div className="voice-input-container">
      <form onSubmit={handleSubmit} className="voice-input-form">
        {/* Текстове поле */}
        <div className="input-wrapper">
          <input type="text" className="voice-input" value={transcript || interimTranscript} onChange={handleTextChange} placeholder={placeholder} disabled={isListening}/>

          {/* Анімація прослуховування */}
          {isListening && (<framer_motion_1.motion.div className="listening-animation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="wave-container">
                {[...Array(5)].map((_, i) => (<framer_motion_1.motion.div key={i} className="wave-bar" animate={{
                    scaleY: [1, 2, 1],
                }} transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                }}/>))}
              </div>
            </framer_motion_1.motion.div>)}
        </div>

        {/* Кнопки */}
        <div className="voice-input-actions">
          {/* Кнопка мікрофону */}
          <framer_motion_1.motion.button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={isListening ? stopListening : startListening} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={!!error && error !== t('voice.error.notSupported')}>
            {isListening ? '⏸️' : '🎤'}
          </framer_motion_1.motion.button>

          {/* Кнопка відправки */}
          <framer_motion_1.motion.button type="submit" className="send-btn" disabled={!transcript.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {t('voice.send')}
          </framer_motion_1.motion.button>
        </div>
      </form>

      {/* Помилки */}
      <framer_motion_1.AnimatePresence>
        {error && (<framer_motion_1.motion.div className="voice-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            ⚠️ {error}
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Підказки */}
      {!isListening && !transcript && (<div className="voice-hints">
          <span className="hint">{t('voice.hint1')}</span>
          <span className="hint">{t('voice.hint2')}</span>
          <span className="hint">{t('voice.hint3')}</span>
        </div>)}
    </div>);
};
exports.VoiceInput = VoiceInput;
