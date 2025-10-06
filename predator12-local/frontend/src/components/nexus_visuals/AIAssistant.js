import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, List, ListItem, ListItemText, Chip, Tooltip } from '@mui/material';
import { Send as SendIcon, Mic as MicIcon, MicOff as MicOffIcon, Psychology as AIIcon, VolumeUp as SpeakIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusAPI } from '../../services/nexusAPI';
import { nexusColors } from '../../theme/nexusTheme';
const AIAssistant = ({ onSpeakingChange }) => {
    const [messages, setMessages] = useState([
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
    const messagesEndRef = useRef(null);
    // Voice recognition setup
    const recognition = useRef(null);
    useEffect(() => {
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
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const speakText = (text) => {
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
    const handleSendMessage = async (text) => {
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
            const response = await nexusAPI.sendAIQuery(messageText);
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
    const getMessageColor = (sender, action) => {
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
    return (_jsxs(Box, { sx: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E6)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${nexusColors.quantum}`,
            borderRadius: 2,
            overflow: 'hidden'
        }, children: [_jsx(Box, { sx: {
                    p: 2,
                    borderBottom: `1px solid ${nexusColors.quantum}`,
                    background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(AIIcon, { sx: { color: nexusColors.amethyst, fontSize: 28 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "Nexus AI Assistant" }), _jsxs(Box, { sx: { ml: 'auto', display: 'flex', gap: 1 }, children: [_jsx("div", { className: "pulse-element", style: {
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: nexusColors.success
                                    } }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "Online" })] })] }) }), _jsx(Box, { sx: { p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }, children: quickCommands.map((cmd) => (_jsx(Chip, { label: cmd.label, size: "small", onClick: () => handleSendMessage(cmd.command), sx: {
                        backgroundColor: `${nexusColors.quantum}40`,
                        color: nexusColors.nebula,
                        border: `1px solid ${nexusColors.quantum}`,
                        '&:hover': {
                            backgroundColor: `${nexusColors.emerald}20`,
                            borderColor: nexusColors.emerald
                        }
                    } }, cmd.label))) }), _jsxs(Box, { sx: {
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
                }, children: [_jsxs(List, { children: [_jsx(AnimatePresence, { children: messages.map((message) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, children: _jsx(ListItem, { sx: {
                                            flexDirection: 'column',
                                            alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                            mb: 1
                                        }, children: _jsx(Paper, { sx: {
                                                p: 2,
                                                maxWidth: '80%',
                                                backgroundColor: message.sender === 'user'
                                                    ? `${nexusColors.sapphire}20`
                                                    : `${nexusColors.obsidian}80`,
                                                border: `1px solid ${getMessageColor(message.sender, message.action)}40`,
                                                borderRadius: 2,
                                                backdropFilter: 'blur(10px)'
                                            }, children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }, children: [_jsx(ListItemText, { primary: message.text, secondary: message.timestamp.toLocaleTimeString(), sx: {
                                                            '& .MuiListItemText-primary': {
                                                                color: getMessageColor(message.sender, message.action),
                                                                fontFamily: 'Fira Code',
                                                                fontSize: '0.9rem'
                                                            },
                                                            '& .MuiListItemText-secondary': {
                                                                color: nexusColors.shadow,
                                                                fontSize: '0.75rem'
                                                            }
                                                        } }), message.sender === 'ai' && (_jsx(Tooltip, { title: "\u041E\u0437\u0432\u0443\u0447\u0438\u0442\u0438 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F", children: _jsx(IconButton, { size: "small", onClick: () => speakText(message.text), sx: {
                                                                color: nexusColors.emerald,
                                                                ml: 1,
                                                                '&:hover': { backgroundColor: nexusColors.emerald + '20' }
                                                            }, children: _jsx(SpeakIcon, { fontSize: "small" }) }) }))] }) }) }) }, message.id))) }), isProcessing && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsx(ListItem, { sx: { justifyContent: 'flex-start' }, children: _jsx(Paper, { sx: {
                                            p: 2,
                                            backgroundColor: `${nexusColors.obsidian}80`,
                                            border: `1px solid ${nexusColors.amethyst}40`,
                                            borderRadius: 2
                                        }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx("div", { className: "loading-spinner" }), _jsx(Typography, { sx: { color: nexusColors.amethyst }, children: "\u041E\u0431\u0440\u043E\u0431\u043B\u044F\u044E \u0437\u0430\u043F\u0438\u0442..." })] }) }) }) }))] }), _jsx("div", { ref: messagesEndRef })] }), _jsx(Box, { sx: {
                    p: 2,
                    borderTop: `1px solid ${nexusColors.quantum}`,
                    background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                }, children: _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u0437\u0430\u043F\u0438\u0442 \u0430\u0431\u043E \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u0439\u0442\u0435 \u0433\u043E\u043B\u043E\u0441...", value: inputText, onChange: (e) => setInputText(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSendMessage(), disabled: isProcessing, sx: {
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
                            } }), _jsx(IconButton, { onClick: isListening ? stopListening : startListening, sx: {
                                color: isListening ? nexusColors.crimson : nexusColors.emerald,
                                backgroundColor: `${isListening ? nexusColors.crimson : nexusColors.emerald}20`,
                                '&:hover': {
                                    backgroundColor: `${isListening ? nexusColors.crimson : nexusColors.emerald}30`
                                }
                            }, children: isListening ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) }), isSpeaking && (_jsx(Tooltip, { title: "\u0417\u0443\u043F\u0438\u043D\u0438\u0442\u0438 \u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F", children: _jsx(IconButton, { onClick: stopSpeaking, sx: {
                                    color: nexusColors.warning,
                                    backgroundColor: `${nexusColors.warning}20`,
                                    '&:hover': {
                                        backgroundColor: `${nexusColors.warning}30`
                                    }
                                }, children: _jsx(CloseIcon, {}) }) })), _jsx(IconButton, { onClick: () => handleSendMessage(), disabled: !inputText.trim() || isProcessing, sx: {
                                color: nexusColors.sapphire,
                                backgroundColor: `${nexusColors.sapphire}20`,
                                '&:hover': {
                                    backgroundColor: `${nexusColors.sapphire}30`
                                }
                            }, children: _jsx(SendIcon, {}) })] }) })] }));
};
export default AIAssistant;
