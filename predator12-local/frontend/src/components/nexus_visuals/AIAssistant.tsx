// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Tooltip,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Psychology as AIIcon,
  VolumeUp as SpeakIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusAPI } from '../../services/nexusAPI';
import { nexusColors } from '../../theme/nexusTheme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  action?: string;
}

interface AIAssistantProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onSpeakingChange }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Вітаю в Nexus Core! Я ваш AI-провідник. Готовий допомогти з навігацією системою, аналізом даних та управлінням агентами.',
      sender: 'ai',
      timestamp: new Date(),
      action: 'welcome'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice recognition setup
  const recognition = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'uk-UA';

      recognition.current.onresult = (event: any) => {
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'uk-UA';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      utterance.onend = () => { setIsSpeaking(false); onSpeakingChange?.(false); };
      utterance.onerror = () => { setIsSpeaking(false); onSpeakingChange?.(false); };
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isProcessing) return;

    // Add user message
    const userMessage: Message = {
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
      const response = await nexusAPI.sendAIQuery(messageText);

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'ai',
        timestamp: new Date(),
        action: response.action
      };

      setMessages(prev => [...prev, aiMessage]);

      // Text-to-speech for AI response
      speakText(response.response);

    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Вибачте, виникла помилка при обробці запиту. Спробуйте ще раз.',
        sender: 'ai',
        timestamp: new Date(),
        action: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

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

  const getMessageColor = (sender: string, action?: string) => {
    if (sender === 'ai') {
      switch (action) {
        case 'status': return nexusColors.emerald;
        case 'agents': return nexusColors.sapphire;
        case 'anomalies': return nexusColors.warning;
        case 'security': return nexusColors.crimson;
        case 'error': return nexusColors.error;
        default: return nexusColors.amethyst;
      }
    }
    return nexusColors.frost;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E6)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${nexusColors.quantum}`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${nexusColors.quantum}`,
          background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AIIcon sx={{ color: nexusColors.amethyst, fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
            Nexus AI Assistant
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <div
              className="pulse-element"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: nexusColors.success
              }}
            />
            <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
              Online
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Commands */}
      <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {quickCommands.map((cmd) => (
          <Chip
            key={cmd.label}
            label={cmd.label}
            size="small"
            onClick={() => handleSendMessage(cmd.command)}
            sx={{
              backgroundColor: `${nexusColors.quantum}40`,
              color: nexusColors.nebula,
              border: `1px solid ${nexusColors.quantum}`,
              '&:hover': {
                backgroundColor: `${nexusColors.emerald}20`,
                borderColor: nexusColors.emerald
              }
            }}
          />
        ))}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: nexusColors.obsidian
          },
          '&::-webkit-scrollbar-thumb': {
            background: nexusColors.emerald,
            borderRadius: '3px'
          }
        }}
      >
        <List>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      backgroundColor: message.sender === 'user'
                        ? `${nexusColors.sapphire}20`
                        : `${nexusColors.obsidian}80`,
                      border: `1px solid ${getMessageColor(message.sender, message.action)}40`,
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <ListItemText
                        primary={message.text}
                        secondary={message.timestamp.toLocaleTimeString()}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: getMessageColor(message.sender, message.action),
                            fontFamily: 'Fira Code',
                            fontSize: '0.9rem'
                          },
                          '& .MuiListItemText-secondary': {
                            color: nexusColors.shadow,
                            fontSize: '0.75rem'
                          }
                        }}
                      />
                      {message.sender === 'ai' && (
                        <Tooltip title="Озвучити повідомлення">
                          <IconButton
                            size="small"
                            onClick={() => speakText(message.text)}
                            sx={{ 
                              color: nexusColors.emerald,
                              ml: 1,
                              '&:hover': { backgroundColor: nexusColors.emerald + '20' }
                            }}
                          >
                            <SpeakIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Paper>
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ListItem sx={{ justifyContent: 'flex-start' }}>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: `${nexusColors.obsidian}80`,
                    border: `1px solid ${nexusColors.amethyst}40`,
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <div className="loading-spinner" />
                    <Typography sx={{ color: nexusColors.amethyst }}>
                      Обробляю запит...
                    </Typography>
                  </Box>
                </Paper>
              </ListItem>
            </motion.div>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${nexusColors.quantum}`,
          background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Введіть запит або використайте голос..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isProcessing}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: `${nexusColors.obsidian}60`,
                color: nexusColors.frost,
                '& fieldset': {
                  borderColor: nexusColors.quantum
                },
                '&:hover fieldset': {
                  borderColor: nexusColors.emerald
                },
                '&.Mui-focused fieldset': {
                  borderColor: nexusColors.emerald
                }
              }
            }}
          />
          <IconButton
            onClick={isListening ? stopListening : startListening}
            sx={{
              color: isListening ? nexusColors.crimson : nexusColors.emerald,
              backgroundColor: `${isListening ? nexusColors.crimson : nexusColors.emerald}20`,
              '&:hover': {
                backgroundColor: `${isListening ? nexusColors.crimson : nexusColors.emerald}30`
              }
            }}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          {isSpeaking && (
            <Tooltip title="Зупинити мовлення">
              <IconButton
                onClick={stopSpeaking}
                sx={{
                  color: nexusColors.warning,
                  backgroundColor: `${nexusColors.warning}20`,
                  '&:hover': {
                    backgroundColor: `${nexusColors.warning}30`
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            sx={{
              color: nexusColors.sapphire,
              backgroundColor: `${nexusColors.sapphire}20`,
              '&:hover': {
                backgroundColor: `${nexusColors.sapphire}30`
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistant;
