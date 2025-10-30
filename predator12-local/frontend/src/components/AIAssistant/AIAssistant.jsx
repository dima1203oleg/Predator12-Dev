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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistant = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AIAssistant = ({ isOpen, onClose, isMinimized, onMinimize }) => {
    const [messages, setMessages] = (0, react_1.useState)([
        {
            id: '1',
            type: 'assistant',
            content: 'Вітаю! Я ваш AI-асистент Nexus. Можу допомогти з навігацією по системі, аналізом даних та відповідями на питання. Як можу допомогти?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = (0, react_1.useState)('');
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    const [voiceEnabled, setVoiceEnabled] = (0, react_1.useState)(true);
    const [autoSpeak, setAutoSpeak] = (0, react_1.useState)(false);
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const messagesEndRef = (0, react_1.useRef)(null);
    const recognitionRef = (0, react_1.useRef)(null);
    const synthRef = (0, react_1.useRef)(null);
    // Initialize speech recognition and synthesis
    (0, react_1.useEffect)(() => {
        // Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'uk-UA'; // Ukrainian
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
        // Speech Synthesis
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);
    // Auto-scroll to bottom
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    const handleSpeak = (text) => {
        if (!synthRef.current || !voiceEnabled)
            return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uk-UA';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synthRef.current.speak(utterance);
    };
    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };
    const generateAIResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();
        // Simple rule-based responses (in production, use actual AI API)
        if (lowerMessage.includes('навігація') || lowerMessage.includes('модуль')) {
            return 'Nexus Core має кілька модулів: Хроно-просторовий Аналіз для 4D візуалізації подій, AI Supervision для моніторингу агентів, DataOps для управління даними, Reality Simulator для моделювання сценаріїв, та OpenSearch Dashboard для аналітики. Який модуль вас цікавить?';
        }
        if (lowerMessage.includes('дані') || lowerMessage.includes('аналіз')) {
            return 'Для роботи з даними рекомендую модуль DataOps - там ви можете завантажувати файли, налаштовувати ETL конвеєри та генерувати синтетичні дані. Також корисний модуль Хроно-просторового Аналізу для візуалізації геоданих у часі.';
        }
        if (lowerMessage.includes('симуляція') || lowerMessage.includes('моделювання')) {
            return 'Reality Simulator дозволяє створювати what-if сценарії з різними типами моделей: Monte Carlo, Agent-based, System Dynamics та Discrete Event. Ви можете налаштувати параметри та запустити симуляцію для прогнозування результатів.';
        }
        if (lowerMessage.includes('агенти') || lowerMessage.includes('ai')) {
            return 'AI Supervision модуль показує стан всіх агентів системи у 3D візуалізації. Ви можете моніторити продуктивність, перезапускати агентів та переглядати статистику роботи мульти-агентної системи.';
        }
        if (lowerMessage.includes('пошук') || lowerMessage.includes('opensearch')) {
            return 'OpenSearch Dashboard інтегрований в Nexus Core з підтримкою SSO та кастомної теми. Ви можете створювати дашборди, виконувати пошукові запити та аналізувати логи в реальному часі.';
        }
        if (lowerMessage.includes('допомога') || lowerMessage.includes('help')) {
            return 'Я можу допомогти з: навігацією по модулях Nexus Core, поясненням функцій системи, рекомендаціями по аналізу даних, налаштуванням симуляцій та загальними питаннями по роботі з платформою. Що саме вас цікавить?';
        }
        // Default responses
        const defaultResponses = [
            'Цікаве питання! Дозвольте мені проаналізувати це в контексті Nexus Core системи.',
            'Розумію ваш запит. Рекомендую перевірити відповідні модулі для детальнішої інформації.',
            'Це важливе питання для аналітичної платформи. Чи можете уточнити, який саме аспект вас цікавить?',
            'Nexus Core має потужні можливості для вирішення таких завдань. Давайте розглянемо варіанти.'
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };
    const handleSendMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!inputMessage.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date(),
            isVoice: isListening
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        // Simulate AI thinking time
        setTimeout(() => {
            const aiResponse = generateAIResponse(userMessage.content);
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
            // Auto-speak if enabled
            if (autoSpeak && voiceEnabled) {
                handleSpeak(aiResponse);
            }
        }, 1000 + Math.random() * 2000);
    });
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const quickActions = [
        'Показати модулі системи',
        'Як працювати з даними?',
        'Запустити симуляцію',
        'Статус агентів',
        'Допомога по навігації'
    ];
    if (!isOpen)
        return null;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3 }}>
      <material_1.Paper elevation={24} sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: isMinimized ? 300 : 400,
            height: isMinimized ? 60 : 600,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E6)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 3,
            boxShadow: `0 0 30px ${nexusTheme_1.nexusColors.emerald}30`,
            zIndex: 1400,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
        {/* Header */}
        <material_1.Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.emerald}20, transparent)`
        }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <icons_material_1.Psychology sx={{ color: nexusTheme_1.nexusColors.emerald }}/>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
              Nexus AI
            </material_1.Typography>
            {isSpeaking && (<material_1.Chip label="Speaking" size="small" sx={{
                backgroundColor: nexusTheme_1.nexusColors.sapphire,
                color: nexusTheme_1.nexusColors.frost,
                animation: 'pulse 1s infinite'
            }}/>)}
          </material_1.Box>

          <material_1.Box sx={{ display: 'flex', gap: 0.5 }}>
            <material_1.Tooltip title="Settings">
              <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                <icons_material_1.Settings fontSize="small"/>
              </material_1.IconButton>
            </material_1.Tooltip>
            <material_1.Tooltip title={isMinimized ? "Expand" : "Minimize"}>
              <material_1.IconButton size="small" onClick={onMinimize} sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                <icons_material_1.Minimize fontSize="small"/>
              </material_1.IconButton>
            </material_1.Tooltip>
            <material_1.Tooltip title="Close">
              <material_1.IconButton size="small" onClick={onClose} sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                <icons_material_1.Close fontSize="small"/>
              </material_1.IconButton>
            </material_1.Tooltip>
          </material_1.Box>
        </material_1.Box>

        <material_1.Collapse in={!isMinimized}>
          {/* Settings */}
          <material_1.Box sx={{ p: 1, borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}40` }}>
            <material_1.Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <material_1.FormControlLabel control={<material_1.Switch checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} size="small" sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="Voice" sx={{ color: nexusTheme_1.nexusColors.nebula, fontSize: '0.8rem' }}/>
              <material_1.FormControlLabel control={<material_1.Switch checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} size="small" sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald,
                },
            }}/>} label="Auto-speak" sx={{ color: nexusTheme_1.nexusColors.nebula, fontSize: '0.8rem' }}/>
            </material_1.Box>
          </material_1.Box>

          {/* Messages */}
          <material_1.Box sx={{
            height: 400,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>
            {messages.map((message) => (<framer_motion_1.motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <material_1.Box sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
            }}>
                  <material_1.Paper sx={{
                p: 1.5,
                maxWidth: '80%',
                background: message.type === 'user'
                    ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}40, ${nexusTheme_1.nexusColors.sapphire}20)`
                    : `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}40, ${nexusTheme_1.nexusColors.emerald}20)`,
                border: `1px solid ${message.type === 'user' ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.emerald}40`,
                borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
            }}>
                    <material_1.Typography variant="body2" sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontSize: '0.9rem',
                lineHeight: 1.4
            }}>
                      {message.content}
                    </material_1.Typography>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.shadow,
                fontSize: '0.7rem'
            }}>
                        {message.timestamp.toLocaleTimeString()}
                      </material_1.Typography>
                      {message.type === 'assistant' && voiceEnabled && (<material_1.IconButton size="small" onClick={() => handleSpeak(message.content)} sx={{ color: nexusTheme_1.nexusColors.emerald, ml: 1 }}>
                          <icons_material_1.VolumeUp fontSize="small"/>
                        </material_1.IconButton>)}
                      {message.isVoice && (<material_1.Chip label="🎤" size="small" sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    ml: 0.5
                }}/>)}
                    </material_1.Box>
                  </material_1.Paper>
                </material_1.Box>
              </framer_motion_1.motion.div>))}

            {isTyping && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <material_1.Paper sx={{
                p: 1.5,
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}40, ${nexusTheme_1.nexusColors.emerald}20)`,
                border: `1px solid ${nexusTheme_1.nexusColors.emerald}40`,
                borderRadius: '16px 16px 16px 4px'
            }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                      <span className="typing-dots">Думаю</span>...
                    </material_1.Typography>
                  </material_1.Paper>
                </material_1.Box>
              </framer_motion_1.motion.div>)}

            <div ref={messagesEndRef}/>
          </material_1.Box>

          {/* Quick Actions */}
          <material_1.Box sx={{ p: 1, borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}40` }}>
            <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {quickActions.map((action) => (<material_1.Chip key={action} label={action} size="small" onClick={() => setInputMessage(action)} sx={{
                backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                color: nexusTheme_1.nexusColors.nebula,
                fontSize: '0.7rem',
                '&:hover': {
                    backgroundColor: nexusTheme_1.nexusColors.quantum,
                    color: nexusTheme_1.nexusColors.frost
                }
            }}/>))}
            </material_1.Box>
          </material_1.Box>

          {/* Input */}
          <material_1.Box sx={{
            p: 2,
            borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.darkMatter}80, transparent)`
        }}>
            <material_1.Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <material_1.TextField fullWidth multiline maxRows={3} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Введіть повідомлення або використайте голос..." variant="outlined" size="small" sx={{
            '& .MuiOutlinedInput-root': {
                backgroundColor: nexusTheme_1.nexusColors.darkMatter + '40',
                '& fieldset': {
                    borderColor: nexusTheme_1.nexusColors.quantum,
                },
                '&:hover fieldset': {
                    borderColor: nexusTheme_1.nexusColors.emerald,
                },
                '&.Mui-focused fieldset': {
                    borderColor: nexusTheme_1.nexusColors.emerald,
                },
            },
            '& .MuiInputBase-input': {
                color: nexusTheme_1.nexusColors.frost,
            },
        }}/>

              {voiceEnabled && (<material_1.Tooltip title={isListening ? "Stop listening" : "Voice input"}>
                  <material_1.IconButton onClick={handleVoiceInput} sx={{
                color: isListening ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.emerald,
                backgroundColor: isListening ? nexusTheme_1.nexusColors.crimson + '20' : 'transparent',
                '&:hover': {
                    backgroundColor: isListening ? nexusTheme_1.nexusColors.crimson + '40' : nexusTheme_1.nexusColors.emerald + '20'
                }
            }}>
                    {isListening ? <icons_material_1.MicOff /> : <icons_material_1.Mic />}
                  </material_1.IconButton>
                </material_1.Tooltip>)}

              {isSpeaking ? (<material_1.Tooltip title="Stop speaking">
                  <material_1.IconButton onClick={stopSpeaking} sx={{ color: nexusTheme_1.nexusColors.warning }}>
                    <icons_material_1.VolumeOff />
                  </material_1.IconButton>
                </material_1.Tooltip>) : (<material_1.Tooltip title="Send message">
                  <material_1.IconButton onClick={handleSendMessage} disabled={!inputMessage.trim()} sx={{
                color: nexusTheme_1.nexusColors.sapphire,
                '&:disabled': { color: nexusTheme_1.nexusColors.shadow }
            }}>
                    <icons_material_1.Send />
                  </material_1.IconButton>
                </material_1.Tooltip>)}
            </material_1.Box>
          </material_1.Box>
        </material_1.Collapse>
      </material_1.Paper>
    </framer_motion_1.motion.div>);
};
exports.AIAssistant = AIAssistant;
