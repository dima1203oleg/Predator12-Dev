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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusAPI_1 = require("../../services/nexusAPI");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AIAssistant = ({ onSpeakingChange }) => {
    const [messages, setMessages] = (0, react_1.useState)([
        {
            id: '1',
            text: 'Вітаю в Nexus Core! Я ваш AI-провідник. Готовий допомогти з навігацією системою, аналізом даних та управлінням агентами.',
            sender: 'ai',
            timestamp: new Date(),
            action: 'welcome'
        }
    ]);
    const [inputText, setInputText] = (0, react_1.useState)('');
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    const messagesEndRef = (0, react_1.useRef)(null);
    // Voice recognition setup
    const recognition = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'uk-UA';
            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSendMessage(transcript);
            };
            recognition.current.onend = () => {
                setIsListening(false);
            };
            recognition.current.onerror = () => {
                setIsListening(false);
            };
        }
    }, []);
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            setIsSpeaking(true);
            onSpeakingChange === null || onSpeakingChange === void 0 ? void 0 : onSpeakingChange(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uk-UA';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            utterance.onend = () => { setIsSpeaking(false); onSpeakingChange === null || onSpeakingChange === void 0 ? void 0 : onSpeakingChange(false); };
            utterance.onerror = () => { setIsSpeaking(false); onSpeakingChange === null || onSpeakingChange === void 0 ? void 0 : onSpeakingChange(false); };
            speechSynthesis.speak(utterance);
        }
    };
    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            onSpeakingChange === null || onSpeakingChange === void 0 ? void 0 : onSpeakingChange(false);
        }
    };
    const handleSendMessage = (text) => __awaiter(void 0, void 0, void 0, function* () {
        const messageText = text || inputText.trim();
        if (!messageText || isProcessing)
            return;
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsProcessing(true);
        try {
            // Send to AI API
            const response = yield nexusAPI_1.nexusAPI.sendAIQuery(messageText);
            // Add AI response
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'ai',
                timestamp: new Date(),
                action: response.action
            };
            setMessages(prev => [...prev, aiMessage]);
            // Text-to-speech for AI response
            speakText(response.response);
        }
        catch (error) {
            console.error('AI Assistant error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Вибачте, виникла помилка при обробці запиту. Спробуйте ще раз.',
                sender: 'ai',
                timestamp: new Date(),
                action: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsProcessing(false);
        }
    });
    const startListening = () => {
        if (recognition.current && !isListening) {
            setIsListening(true);
            recognition.current.start();
        }
    };
    const stopListening = () => {
        if (recognition.current && isListening) {
            recognition.current.stop();
            setIsListening(false);
        }
    };
    const quickCommands = [
        { label: 'Статус системи', command: 'показати статус системи' },
        { label: 'Агенти', command: 'показати агентів' },
        { label: 'Аномалії', command: 'знайти аномалії' },
        { label: 'Безпека', command: 'перевірити безпеку' }
    ];
    const getMessageColor = (sender, action) => {
        if (sender === 'ai') {
            switch (action) {
                case 'status': return nexusTheme_1.nexusColors.emerald;
                case 'agents': return nexusTheme_1.nexusColors.sapphire;
                case 'anomalies': return nexusTheme_1.nexusColors.warning;
                case 'security': return nexusTheme_1.nexusColors.crimson;
                case 'error': return nexusTheme_1.nexusColors.error;
                default: return nexusTheme_1.nexusColors.amethyst;
            }
        }
        return nexusTheme_1.nexusColors.frost;
    };
    return (<material_1.Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E6)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            overflow: 'hidden'
        }}>
      {/* Header */}
      <material_1.Box sx={{
            p: 2,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <icons_material_1.Psychology sx={{ color: nexusTheme_1.nexusColors.amethyst, fontSize: 28 }}/>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
            Nexus AI Assistant
          </material_1.Typography>
          <material_1.Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <div className="pulse-element" style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: nexusTheme_1.nexusColors.success
        }}/>
            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
              Online
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
      </material_1.Box>

      {/* Quick Commands */}
      <material_1.Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {quickCommands.map((cmd) => (<material_1.Chip key={cmd.label} label={cmd.label} size="small" onClick={() => handleSendMessage(cmd.command)} sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}40`,
                color: nexusTheme_1.nexusColors.nebula,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
                    borderColor: nexusTheme_1.nexusColors.emerald
                }
            }}/>))}
      </material_1.Box>

      {/* Messages */}
      <material_1.Box sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1,
            '&::-webkit-scrollbar': {
                width: '6px'
            },
            '&::-webkit-scrollbar-track': {
                background: nexusTheme_1.nexusColors.obsidian
            },
            '&::-webkit-scrollbar-thumb': {
                background: nexusTheme_1.nexusColors.emerald,
                borderRadius: '3px'
            }
        }}>
        <material_1.List>
          <framer_motion_1.AnimatePresence>
            {messages.map((message) => (<framer_motion_1.motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <material_1.ListItem sx={{
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
            }}>
                  <material_1.Paper sx={{
                p: 2,
                maxWidth: '80%',
                backgroundColor: message.sender === 'user'
                    ? `${nexusTheme_1.nexusColors.sapphire}20`
                    : `${nexusTheme_1.nexusColors.obsidian}80`,
                border: `1px solid ${getMessageColor(message.sender, message.action)}40`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <material_1.ListItemText primary={message.text} secondary={message.timestamp.toLocaleTimeString()} sx={{
                '& .MuiListItemText-primary': {
                    color: getMessageColor(message.sender, message.action),
                    fontFamily: 'Fira Code',
                    fontSize: '0.9rem'
                },
                '& .MuiListItemText-secondary': {
                    color: nexusTheme_1.nexusColors.shadow,
                    fontSize: '0.75rem'
                }
            }}/>
                      {message.sender === 'ai' && (<material_1.Tooltip title="Озвучити повідомлення">
                          <material_1.IconButton size="small" onClick={() => speakText(message.text)} sx={{
                    color: nexusTheme_1.nexusColors.emerald,
                    ml: 1,
                    '&:hover': { backgroundColor: nexusTheme_1.nexusColors.emerald + '20' }
                }}>
                            <icons_material_1.VolumeUp fontSize="small"/>
                          </material_1.IconButton>
                        </material_1.Tooltip>)}
                    </material_1.Box>
                  </material_1.Paper>
                </material_1.ListItem>
              </framer_motion_1.motion.div>))}
          </framer_motion_1.AnimatePresence>
          {isProcessing && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <material_1.ListItem sx={{ justifyContent: 'flex-start' }}>
                <material_1.Paper sx={{
                p: 2,
                backgroundColor: `${nexusTheme_1.nexusColors.obsidian}80`,
                border: `1px solid ${nexusTheme_1.nexusColors.amethyst}40`,
                borderRadius: 2
            }}>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <div className="loading-spinner"/>
                    <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.amethyst }}>
                      Обробляю запит...
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Paper>
              </material_1.ListItem>
            </framer_motion_1.motion.div>)}
        </material_1.List>
        <div ref={messagesEndRef}/>
      </material_1.Box>

      {/* Input */}
      <material_1.Box sx={{
            p: 2,
            borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
        }}>
        <material_1.Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <material_1.TextField fullWidth variant="outlined" placeholder="Введіть запит або використайте голос..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isProcessing} sx={{
            '& .MuiOutlinedInput-root': {
                backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
                color: nexusTheme_1.nexusColors.frost,
                '& fieldset': {
                    borderColor: nexusTheme_1.nexusColors.quantum
                },
                '&:hover fieldset': {
                    borderColor: nexusTheme_1.nexusColors.emerald
                },
                '&.Mui-focused fieldset': {
                    borderColor: nexusTheme_1.nexusColors.emerald
                }
            }
        }}/>
          <material_1.IconButton onClick={isListening ? stopListening : startListening} sx={{
            color: isListening ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.emerald,
            backgroundColor: `${isListening ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.emerald}20`,
            '&:hover': {
                backgroundColor: `${isListening ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.emerald}30`
            }
        }}>
            {isListening ? <icons_material_1.MicOff /> : <icons_material_1.Mic />}
          </material_1.IconButton>
          {isSpeaking && (<material_1.Tooltip title="Зупинити мовлення">
              <material_1.IconButton onClick={stopSpeaking} sx={{
                color: nexusTheme_1.nexusColors.warning,
                backgroundColor: `${nexusTheme_1.nexusColors.warning}20`,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.warning}30`
                }
            }}>
                <icons_material_1.Close />
              </material_1.IconButton>
            </material_1.Tooltip>)}
          <material_1.IconButton onClick={() => handleSendMessage()} disabled={!inputText.trim() || isProcessing} sx={{
            color: nexusTheme_1.nexusColors.sapphire,
            backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.sapphire}30`
            }
        }}>
            <icons_material_1.Send />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = AIAssistant;
