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
const nexusTheme_1 = require("../../theme/nexusTheme");
const I18nProvider_1 = require("../../i18n/I18nProvider");
const EnhancedContextualChat = ({ open, onClose, currentModule = 'dashboard', systemHealth = 'optimal', onNavigate, onHealthCheck, onShowLogs }) => {
    const { t } = (0, I18nProvider_1.useI18n)();
    // State
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [inputText, setInputText] = (0, react_1.useState)('');
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const [ttsEnabled, setTtsEnabled] = (0, react_1.useState)(true); // Включено за замовчуванням
    const [sttEnabled, setSttEnabled] = (0, react_1.useState)(true); // Включено за замовчуванням
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    // Refs
    const messagesEndRef = (0, react_1.useRef)(null);
    const speechSynthesis = (0, react_1.useRef)(null);
    const speechRecognition = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    // Initialize speech services
    (0, react_1.useEffect)(() => {
        // TTS
        if ('speechSynthesis' in window) {
            speechSynthesis.current = window.speechSynthesis;
        }
        // STT
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            speechRecognition.current = new SpeechRecognition();
            speechRecognition.current.continuous = false;
            speechRecognition.current.interimResults = false;
            speechRecognition.current.lang = t('guide.speechLang', 'uk-UA');
            speechRecognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsListening(false);
                // Auto-send voice input
                handleSendMessage(transcript);
            };
            speechRecognition.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
            speechRecognition.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [t]);
    // Auto-scroll to bottom
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    // Initialize welcome message
    (0, react_1.useEffect)(() => {
        if (open && messages.length === 0) {
            const welcomeMessage = generateWelcomeMessage();
            setMessages([welcomeMessage]);
            if (ttsEnabled) {
                speak(welcomeMessage.text);
            }
        }
    }, [open, messages.length, currentModule, systemHealth, ttsEnabled]);
    // TTS functionality
    const speak = (0, react_1.useCallback)((text) => {
        if (!ttsEnabled || !speechSynthesis.current)
            return;
        speechSynthesis.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = t('guide.speechLang', 'uk-UA');
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.current.speak(utterance);
    }, [ttsEnabled, t]);
    // STT functionality
    const startListening = (0, react_1.useCallback)(() => {
        if (!sttEnabled || !speechRecognition.current || isListening)
            return;
        try {
            setIsListening(true);
            speechRecognition.current.start();
        }
        catch (error) {
            console.error('Failed to start speech recognition:', error);
            setIsListening(false);
        }
    }, [sttEnabled, isListening]);
    // Stop listening
    const stopListening = (0, react_1.useCallback)(() => {
        if (speechRecognition.current && isListening) {
            speechRecognition.current.stop();
            setIsListening(false);
        }
    }, [isListening]);
    // Generate contextual responses using AI models
    const generateResponse = (0, react_1.useCallback)((userInput) => __awaiter(void 0, void 0, void 0, function* () {
        const lowerInput = userInput.toLowerCase();
        const messageId = Date.now().toString();
        // Спроба використати AI модель для відповіді
        try {
            const agentsAPI = yield Promise.resolve().then(() => __importStar(require('../../services/agentsAPI')));
            const response = yield agentsAPI.default.processWithMultiLevelFeedback('quick-agent', {
                type: 'chat_response',
                input: userInput,
                context: {
                    module: currentModule,
                    systemHealth: systemHealth,
                    language: t('guide.speechLang', 'uk')
                }
            });
            if (response && response.content) {
                // Успішна відповідь від AI
                const aiMessage = {
                    id: messageId,
                    text: response.content,
                    type: 'guide',
                    timestamp: new Date(),
                    emotion: 'happy'
                };
                if (ttsEnabled) {
                    speak(response.content);
                }
                return aiMessage;
            }
        }
        catch (error) {
            console.warn('AI response failed, using fallback:', error);
        }
        // Fallback до статичних відповідей
        // Navigation requests
        if (lowerInput.includes('показати') && lowerInput.includes('модул')) {
            return {
                id: messageId,
                text: t('guide.responses.showModules', 'Ось доступні модулі системи. Оберіть потрібний для навігації.'),
                type: 'guide',
                timestamp: new Date(),
                emotion: 'happy',
                actions: [
                    { label: t('modules.dashboard', 'Панель управління'), action: () => onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate('dashboard'), type: 'primary', icon: <icons_material_1.Navigation /> },
                    { label: t('modules.mas', 'Орбітальний вузол ШІ'), action: () => onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate('mas'), type: 'secondary', icon: <icons_material_1.Psychology /> },
                    { label: t('modules.etl', 'Фабрика даних'), action: () => onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate('etl'), type: 'secondary', icon: <icons_material_1.Refresh /> }
                ]
            };
        }
        // System health requests
        if (lowerInput.includes('статус') || lowerInput.includes('стан') || lowerInput.includes('здоров\'я')) {
            const healthMessage = systemHealth === 'optimal'
                ? t('guide.responses.healthOptimal', 'Система працює нормально. Всі компоненти функціонують штатно.')
                : systemHealth === 'degraded'
                    ? t('guide.responses.healthDegraded', 'Виявлено деградацію продуктивності. Рекомендую перевірити логи.')
                    : systemHealth === 'critical'
                        ? t('guide.responses.healthCritical', 'КРИТИЧНИЙ стан! Потрібне негайне втручання.')
                        : t('guide.responses.healthUnknown', 'Статус системи невідомий. Перевіряю зв\'язок з моніторингом...');
            return {
                id: messageId,
                text: healthMessage,
                type: 'guide',
                timestamp: new Date(),
                emotion: systemHealth === 'critical' ? 'alert' : systemHealth === 'optimal' ? 'happy' : 'concerned',
                actions: systemHealth !== 'optimal' ? [
                    { label: t('guide.actions.checkHealth', 'Перевірити'), action: () => onHealthCheck === null || onHealthCheck === void 0 ? void 0 : onHealthCheck(), type: 'primary' },
                    { label: t('guide.actions.openLogs', 'Відкрити логи'), action: () => onShowLogs === null || onShowLogs === void 0 ? void 0 : onShowLogs(), type: 'secondary' }
                ] : []
            };
        }
        // Help requests
        if (lowerInput.includes('допомога') || lowerInput.includes('help') || lowerInput.includes('як')) {
            return {
                id: messageId,
                text: t('guide.responses.help', 'Я можу допомогти з навігацією, поясненням станів системи та швидкими діями. Питайте про модулі, статус, агентів або просто скажіть що потрібно зробити.'),
                type: 'guide',
                timestamp: new Date(),
                emotion: 'happy',
                actions: [
                    { label: t('guide.quickHelp.navigation', 'Навігація'), action: () => handleSendMessage('показати модулі'), type: 'secondary' },
                    { label: t('guide.quickHelp.status', 'Статус системи'), action: () => handleSendMessage('статус системи'), type: 'secondary' },
                    { label: t('guide.quickHelp.agents', 'Про агентів'), action: () => handleSendMessage('стан агентів'), type: 'secondary' }
                ]
            };
        }
        // Agents requests
        if (lowerInput.includes('агент') || lowerInput.includes('мас') || lowerInput.includes('ai')) {
            return {
                id: messageId,
                text: t('guide.responses.agents', 'Орбітальний вузол ШІ керує автономними агентами. Зараз активно 8 з 8 агентів.'),
                type: 'guide',
                timestamp: new Date(),
                emotion: 'focused',
                actions: [
                    { label: t('guide.actions.openMAS', 'Відкрити MAS'), action: () => onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate('mas'), type: 'primary' },
                    { label: t('guide.actions.agentStatus', 'Статус агентів'), action: () => onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate('dashboard'), type: 'secondary' }
                ]
            };
        }
        // Default response
        return {
            id: messageId,
            text: t('guide.responses.default', 'Розумію. Можете уточнити що саме вас цікавить? Я можу допомогти з навігацією, поясненням станів системи або швидкими діями.'),
            type: 'guide',
            timestamp: new Date(),
            emotion: 'neutral',
            actions: [
                { label: t('guide.quickActions.help', 'Допомога'), action: () => handleSendMessage('допомога'), type: 'secondary', icon: <icons_material_1.Help /> }
            ]
        };
    }), [currentModule, systemHealth, onNavigate, onHealthCheck, onShowLogs, t]);
    // Generate welcome message
    const generateWelcomeMessage = (0, react_1.useCallback)(() => {
        const contextMessage = systemHealth === 'optimal'
            ? t('guide.welcome.optimal', `Привіт! Я ваш AI-гід. Система працює нормально, модуль "${currentModule}" готовий до роботи.`)
            : systemHealth === 'critical'
                ? t('guide.welcome.critical', 'Привіт! Виявлено критичні проблеми в системі. Чим можу допомогти?')
                : systemHealth === 'degraded'
                    ? t('guide.welcome.degraded', 'Привіт! Система працює з обмеженнями. Рекомендую перевірити стан компонентів.')
                    : t('guide.welcome.unknown', 'Привіт! Статус системи невідомий. Перевіряю зв\'язок з компонентами...');
        return {
            id: 'welcome',
            text: contextMessage,
            type: 'guide',
            timestamp: new Date(),
            emotion: systemHealth === 'optimal' ? 'happy' : systemHealth === 'critical' ? 'alert' : 'neutral',
            context: currentModule,
            actions: [
                { label: t('guide.quickActions.showModules', 'Показати модулі'), action: () => handleSendMessage('показати модулі'), type: 'primary' },
                { label: t('guide.quickActions.systemStatus', 'Статус системи'), action: () => handleSendMessage('статус системи'), type: 'secondary' }
            ]
        };
    }, [currentModule, systemHealth, t]);
    // Handle sending messages
    const handleSendMessage = (0, react_1.useCallback)((text) => {
        const messageText = text || inputText.trim();
        if (!messageText)
            return;
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            text: messageText,
            type: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        // Show typing indicator
        setIsTyping(true);
        // Simulate processing delay
        setTimeout(() => {
            const response = generateResponse(messageText);
            setMessages(prev => [...prev, response]);
            setIsTyping(false);
            // Auto-speak response
            if (ttsEnabled && response.type === 'guide') {
                speak(response.text);
            }
        }, 1000 + Math.random() * 1000); // 1-2 second delay
    }, [inputText, generateResponse, ttsEnabled, speak]);
    // Handle key press
    const handleKeyPress = (0, react_1.useCallback)((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);
    // Quick action buttons
    const quickActions = [
        {
            label: t('guide.quick.modules', 'Модулі'),
            action: () => handleSendMessage('показати модулі'),
            icon: <icons_material_1.Navigation fontSize="small"/>
        },
        {
            label: t('guide.quick.status', 'Статус'),
            action: () => handleSendMessage('статус системи'),
            icon: <icons_material_1.Refresh fontSize="small"/>
        },
        {
            label: t('guide.quick.help', 'Допомога'),
            action: () => handleSendMessage('допомога'),
            icon: <icons_material_1.Help fontSize="small"/>
        }
    ];
    return (<material_1.Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F5, ${nexusTheme_1.nexusColors.darkMatter}F0)`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                minHeight: 500,
                maxHeight: '80vh'
            }
        }}>
      <material_1.DialogTitle sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.quantum}20, transparent)`,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.Box sx={{ position: 'relative' }}>
            <div /> /* HolographicAIFace
      isActive={true}
      isSpeaking={isSpeaking}
      emotion={systemHealth === 'optimal' ? 'success' : systemHealth === 'critical' ? 'error' : 'neutral'}
      size="small"
      fallbackMode={true} // Use Canvas for dialog
      enableAura={false}
      enableDataStream={false}
    />
  </Box>
  <Box>
    <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
      {t('guide.chatTitle', 'AI Гід')}
    </Typography>
    <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
      {t('guide.chatSubtitle', `Модуль: ${currentModule} • Статус: ${systemHealth}`)}
    </Typography>
  </Box>
</Box>

<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  {/* Voice controls *//* HolographicAIFace
              isActive={true}
              isSpeaking={isSpeaking}
              emotion={systemHealth === 'optimal' ? 'success' : systemHealth === 'critical' ? 'error' : 'neutral'}
              size="small"
              fallbackMode={true} // Use Canvas for dialog
     // Use Canvas for dialog
              enableAura={false}
              enableDataStream={false}
            />
          </material_1.Box>
          <material_1.Box>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
              {t('guide.chatTitle', 'AI Гід')}
            </material_1.Typography>
            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
              {t('guide.chatSubtitle', `Модуль: ${currentModule} • Статус: ${systemHealth}`)}
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>

        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Voice controls */}
          <material_1.Tooltip title={ttsEnabled ? t('guide.tts.disable', 'Вимкнути озвучування') : t('guide.tts.enable', 'Увімкнути озвучування')}>
            <material_1.IconButton onClick={() => setTtsEnabled(!ttsEnabled)} sx={{ color: ttsEnabled ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.shadow }}>
              {ttsEnabled ? <icons_material_1.VolumeUp /> : <icons_material_1.VolumeOff />}
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title={sttEnabled ? t('guide.stt.disable', 'Вимкнути голосовий ввід') : t('guide.stt.enable', 'Увімкнути голосовий ввід')}>
            <material_1.IconButton onClick={() => setSttEnabled(!sttEnabled)} sx={{ color: sttEnabled ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.shadow }}>
              {sttEnabled ? <icons_material_1.Mic /> : <icons_material_1.MicOff />}
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.IconButton onClick={onClose} sx={{ color: nexusTheme_1.nexusColors.shadow }}>
            <icons_material_1.Close />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.DialogTitle>

      <material_1.DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 400 }}>
        {/* Messages area */}
        <material_1.Box sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        }}>
          <framer_motion_1.AnimatePresence>
            {messages.map((message, index) => (<framer_motion_1.motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <material_1.Paper sx={{
                p: 2,
                background: message.type === 'user'
                    ? `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}30, ${nexusTheme_1.nexusColors.quantum}20)`
                    : `linear-gradient(135deg, ${nexusTheme_1.nexusColors.quantum}20, ${nexusTheme_1.nexusColors.obsidian}40)`,
                border: `1px solid ${message.type === 'user' ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backdropFilter: 'blur(10px)'
            }}>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                    {message.text}
                  </material_1.Typography>

                  {message.actions && message.actions.length > 0 && (<material_1.Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {message.actions.map((action, actionIndex) => (<material_1.Button key={actionIndex} size="small" variant={action.type === 'primary' ? 'contained' : 'outlined'} color={action.type === 'danger' ? 'error' : 'primary'} startIcon={action.icon} onClick={action.action} sx={{ fontSize: '0.75rem' }}>
                          {action.label}
                        </material_1.Button>))}
                    </material_1.Stack>)}

                  <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.shadow,
                display: 'block',
                mt: 1,
                textAlign: message.type === 'user' ? 'right' : 'left'
            }}>
                    {message.timestamp.toLocaleTimeString()}
                  </material_1.Typography>
                </material_1.Paper>
              </framer_motion_1.motion.div>))}
          </framer_motion_1.AnimatePresence>

          {/* Typing indicator */}
          <framer_motion_1.AnimatePresence>
            {isTyping && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <material_1.Paper sx={{
                p: 2,
                alignSelf: 'flex-start',
                background: `${nexusTheme_1.nexusColors.quantum}20`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                  <material_1.CircularProgress size={16} sx={{ color: nexusTheme_1.nexusColors.sapphire }}/>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                    {t('guide.typing', 'Гід друкує...')}
                  </material_1.Typography>
                </material_1.Paper>
              </framer_motion_1.motion.div>)}
          </framer_motion_1.AnimatePresence>

          <div ref={messagesEndRef}/>
        </material_1.Box>

        {/* Quick actions */}
        <material_1.Box sx={{ p: 2, borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}30` }}>
          <material_1.Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {quickActions.map((action, index) => (<material_1.Chip key={index} icon={action.icon} label={action.label} onClick={action.action} variant="outlined" size="small" sx={{
                borderColor: nexusTheme_1.nexusColors.quantum,
                color: nexusTheme_1.nexusColors.frost,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.quantum}30`
                }
            }}/>))}
          </material_1.Stack>
        </material_1.Box>
      </material_1.DialogContent>

      <material_1.DialogActions sx={{
            p: 2,
            background: `linear-gradient(90deg, transparent, ${nexusTheme_1.nexusColors.quantum}10)`,
            borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}`
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <material_1.TextField ref={inputRef} fullWidth multiline maxRows={3} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress} placeholder={t('guide.inputPlaceholder', 'Напишіть ваше запитання або скажіть "допомога"...')} variant="outlined" size="small" sx={{
            '& .MuiOutlinedInput-root': {
                backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
                color: nexusTheme_1.nexusColors.frost,
                '& fieldset': {
                    borderColor: nexusTheme_1.nexusColors.quantum
                },
                '&:hover fieldset': {
                    borderColor: nexusTheme_1.nexusColors.sapphire
                },
                '&.Mui-focused fieldset': {
                    borderColor: nexusTheme_1.nexusColors.sapphire
                }
            }
        }}/>

          {sttEnabled && (<material_1.Tooltip title={isListening ? t('guide.stt.stop', 'Зупинити прослуховування') : t('guide.stt.start', 'Почати прослуховування')}>
              <material_1.IconButton onClick={isListening ? stopListening : startListening} disabled={isTyping} sx={{
                color: isListening ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.sapphire,
                backgroundColor: isListening ? `${nexusTheme_1.nexusColors.crimson}20` : `${nexusTheme_1.nexusColors.sapphire}20`
            }}>
                {isListening ? <icons_material_1.MicOff /> : <icons_material_1.Mic />}
              </material_1.IconButton>
            </material_1.Tooltip>)}

          <material_1.Tooltip title={t('guide.send', 'Відправити повідомлення')}>
            <material_1.IconButton onClick={() => handleSendMessage()} disabled={!inputText.trim() || isTyping} sx={{
            color: nexusTheme_1.nexusColors.emerald,
            backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.emerald}40`
            }
        }}>
              <icons_material_1.Send />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.DialogActions>
    </material_1.Dialog>);
};
exports.default = EnhancedContextualChat;
