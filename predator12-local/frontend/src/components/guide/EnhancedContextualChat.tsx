// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  LinearProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Navigation as NavIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import { HolographicAIFace } from './HolographicAIFaceV2';

interface ChatMessage {
  id: string;
  text: string;
  type: 'user' | 'guide' | 'system' | 'action';
  timestamp: Date;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'focused' | 'alert';
  actions?: Array<{
    label: string;
    action: () => void;
    type?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
  }>;
  isTyping?: boolean;
  context?: string;
}

interface EnhancedContextualChatProps {
  open: boolean;
  onClose: () => void;
  currentModule?: string;
  systemHealth?: 'optimal' | 'degraded' | 'unknown' | 'critical';
  onNavigate?: (module: string) => void;
  onHealthCheck?: () => void;
  onShowLogs?: () => void;
}

const EnhancedContextualChat: React.FC<EnhancedContextualChatProps> = ({
  open,
  onClose,
  currentModule = 'dashboard',
  systemHealth = 'optimal',
  onNavigate,
  onHealthCheck,
  onShowLogs
}) => {
  const { t } = useI18n();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // Включено за замовчуванням
  const [sttEnabled, setSttEnabled] = useState(true); // Включено за замовчуванням
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const speechRecognition = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize speech services
  useEffect(() => {
    // TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }
    
    // STT
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = t('guide.speechLang', 'uk-UA');
      
      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto-send voice input
        handleSendMessage(transcript);
      };
      
      speechRecognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [t]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage();
      setMessages([welcomeMessage]);
      
      if (ttsEnabled) {
        speak(welcomeMessage.text);
      }
    }
  }, [open, messages.length, currentModule, systemHealth, ttsEnabled]);
  
  // TTS functionality
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !speechSynthesis.current) return;
    
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
  const startListening = useCallback(() => {
    if (!sttEnabled || !speechRecognition.current || isListening) return;
    
    try {
      setIsListening(true);
      speechRecognition.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  }, [sttEnabled, isListening]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (speechRecognition.current && isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  // Generate contextual responses using AI models
  const generateResponse = useCallback(async (userInput: string): Promise<ChatMessage> => {
    const lowerInput = userInput.toLowerCase();
    const messageId = Date.now().toString();
    
    // Спроба використати AI модель для відповіді
    try {
      const agentsAPI = await import('../../services/agentsAPI');
      const response = await agentsAPI.default.processWithMultiLevelFeedback(
        'quick-agent', 
        {
          type: 'chat_response',
          input: userInput,
          context: {
            module: currentModule,
            systemHealth: systemHealth,
            language: t('guide.speechLang', 'uk')
          }
        }
      );
      
      if (response && response.content) {
        // Успішна відповідь від AI
        const aiMessage: ChatMessage = {
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
    } catch (error) {
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
          { label: t('modules.dashboard', 'Панель управління'), action: () => onNavigate?.('dashboard'), type: 'primary', icon: <NavIcon /> },
          { label: t('modules.mas', 'Орбітальний вузол ШІ'), action: () => onNavigate?.('mas'), type: 'secondary', icon: <PsychologyIcon /> },
          { label: t('modules.etl', 'Фабрика даних'), action: () => onNavigate?.('etl'), type: 'secondary', icon: <RefreshIcon /> }
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
          { label: t('guide.actions.checkHealth', 'Перевірити'), action: () => onHealthCheck?.(), type: 'primary' },
          { label: t('guide.actions.openLogs', 'Відкрити логи'), action: () => onShowLogs?.(), type: 'secondary' }
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
          { label: t('guide.actions.openMAS', 'Відкрити MAS'), action: () => onNavigate?.('mas'), type: 'primary' },
          { label: t('guide.actions.agentStatus', 'Статус агентів'), action: () => onNavigate?.('dashboard'), type: 'secondary' }
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
        { label: t('guide.quickActions.help', 'Допомога'), action: () => handleSendMessage('допомога'), type: 'secondary', icon: <HelpIcon /> }
      ]
    };
  }, [currentModule, systemHealth, onNavigate, onHealthCheck, onShowLogs, t]);
  
  // Generate welcome message
  const generateWelcomeMessage = useCallback((): ChatMessage => {
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
  const handleSendMessage = useCallback((text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage: ChatMessage = {
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
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
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
      icon: <NavIcon fontSize="small" />
    },
    { 
      label: t('guide.quick.status', 'Статус'), 
      action: () => handleSendMessage('статус системи'),
      icon: <RefreshIcon fontSize="small" />
    },
    { 
      label: t('guide.quick.help', 'Допомога'), 
      action: () => handleSendMessage('допомога'),
      icon: <HelpIcon fontSize="small" />
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${nexusColors.obsidian}F5, ${nexusColors.darkMatter}F0)`,
          border: `1px solid ${nexusColors.quantum}`,
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          minHeight: 500,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: `linear-gradient(90deg, ${nexusColors.quantum}20, transparent)`,
        borderBottom: `1px solid ${nexusColors.quantum}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <div/* HolographicAIFace
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
          {/* Voice controls */}
          <Tooltip title={ttsEnabled ? t('guide.tts.disable', 'Вимкнути озвучування') : t('guide.tts.enable', 'Увімкнути озвучування')}>
            <IconButton
              onClick={() => setTtsEnabled(!ttsEnabled)}
              sx={{ color: ttsEnabled ? nexusColors.emerald : nexusColors.shadow }}
            >
              {ttsEnabled ? <VolumeIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={sttEnabled ? t('guide.stt.disable', 'Вимкнути голосовий ввід') : t('guide.stt.enable', 'Увімкнути голосовий ввід')}>
            <IconButton
              onClick={() => setSttEnabled(!sttEnabled)}
              sx={{ color: sttEnabled ? nexusColors.sapphire : nexusColors.shadow }}
            >
              {sttEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={onClose} sx={{ color: nexusColors.shadow }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 400 }}>
        {/* Messages area */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background: message.type === 'user' 
                      ? `linear-gradient(135deg, ${nexusColors.sapphire}30, ${nexusColors.quantum}20)`
                      : `linear-gradient(135deg, ${nexusColors.quantum}20, ${nexusColors.obsidian}40)`,
                    border: `1px solid ${message.type === 'user' ? nexusColors.sapphire : nexusColors.quantum}`,
                    borderRadius: 2,
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography variant="body2" sx={{ color: nexusColors.frost, mb: 1 }}>
                    {message.text}
                  </Typography>
                  
                  {message.actions && message.actions.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {message.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          size="small"
                          variant={action.type === 'primary' ? 'contained' : 'outlined'}
                          color={action.type === 'danger' ? 'error' : 'primary'}
                          startIcon={action.icon}
                          onClick={action.action}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Stack>
                  )}
                  
                  <Typography variant="caption" sx={{ 
                    color: nexusColors.shadow, 
                    display: 'block',
                    mt: 1,
                    textAlign: message.type === 'user' ? 'right' : 'left'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Paper sx={{ 
                  p: 2, 
                  alignSelf: 'flex-start', 
                  background: `${nexusColors.quantum}20`,
                  border: `1px solid ${nexusColors.quantum}`,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CircularProgress size={16} sx={{ color: nexusColors.sapphire }} />
                  <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                    {t('guide.typing', 'Гід друкує...')}
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Quick actions */}
        <Box sx={{ p: 2, borderTop: `1px solid ${nexusColors.quantum}30` }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {quickActions.map((action, index) => (
              <Chip
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.action}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: nexusColors.quantum,
                  color: nexusColors.frost,
                  '&:hover': {
                    backgroundColor: `${nexusColors.quantum}30`
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        background: `linear-gradient(90deg, transparent, ${nexusColors.quantum}10)`,
        borderTop: `1px solid ${nexusColors.quantum}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('guide.inputPlaceholder', 'Напишіть ваше запитання або скажіть "допомога"...')}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: `${nexusColors.obsidian}60`,
                color: nexusColors.frost,
                '& fieldset': {
                  borderColor: nexusColors.quantum
                },
                '&:hover fieldset': {
                  borderColor: nexusColors.sapphire
                },
                '&.Mui-focused fieldset': {
                  borderColor: nexusColors.sapphire
                }
              }
            }}
          />
          
          {sttEnabled && (
            <Tooltip title={isListening ? t('guide.stt.stop', 'Зупинити прослуховування') : t('guide.stt.start', 'Почати прослуховування')}>
              <IconButton
                onClick={isListening ? stopListening : startListening}
                disabled={isTyping}
                sx={{ 
                  color: isListening ? nexusColors.crimson : nexusColors.sapphire,
                  backgroundColor: isListening ? `${nexusColors.crimson}20` : `${nexusColors.sapphire}20`
                }}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title={t('guide.send', 'Відправити повідомлення')}>
            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              sx={{
                color: nexusColors.emerald,
                backgroundColor: `${nexusColors.emerald}20`,
                '&:hover': {
                  backgroundColor: `${nexusColors.emerald}40`
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedContextualChat;
