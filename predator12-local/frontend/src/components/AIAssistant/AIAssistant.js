import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Chip, Tooltip, Switch, FormControlLabel, Collapse } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon, Send as SendIcon, VolumeUp as SpeakIcon, VolumeOff as MuteIcon, Psychology as AIIcon, Close as CloseIcon, Minimize as MinimizeIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const AIAssistant = ({ isOpen, onClose, isMinimized, onMinimize }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            type: 'assistant',
            content: 'Вітаю! Я ваш AI-асистент Nexus. Можу допомогти з навігацією по системі, аналізом даних та відповідями на питання. Як можу допомогти?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(null);
    // Initialize speech recognition and synthesis
    useEffect(() => {
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
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    const handleSendMessage = async () => {
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
    };
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
    return (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, transition: { duration: 0.3 }, children: _jsxs(Paper, { elevation: 24, sx: {
                position: 'fixed',
                bottom: 20,
                right: 20,
                width: isMinimized ? 300 : 400,
                height: isMinimized ? 60 : 600,
                background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E6)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusColors.quantum}`,
                borderRadius: 3,
                boxShadow: `0 0 30px ${nexusColors.emerald}30`,
                zIndex: 1400,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
            }, children: [_jsxs(Box, { sx: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderBottom: `1px solid ${nexusColors.quantum}`,
                        background: `linear-gradient(90deg, ${nexusColors.emerald}20, transparent)`
                    }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(AIIcon, { sx: { color: nexusColors.emerald } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "Nexus AI" }), isSpeaking && (_jsx(Chip, { label: "Speaking", size: "small", sx: {
                                        backgroundColor: nexusColors.sapphire,
                                        color: nexusColors.frost,
                                        animation: 'pulse 1s infinite'
                                    } }))] }), _jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(Tooltip, { title: "Settings", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.nebula }, children: _jsx(SettingsIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: isMinimized ? "Expand" : "Minimize", children: _jsx(IconButton, { size: "small", onClick: onMinimize, sx: { color: nexusColors.nebula }, children: _jsx(MinimizeIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Close", children: _jsx(IconButton, { size: "small", onClick: onClose, sx: { color: nexusColors.nebula }, children: _jsx(CloseIcon, { fontSize: "small" }) }) })] })] }), _jsxs(Collapse, { in: !isMinimized, children: [_jsx(Box, { sx: { p: 1, borderBottom: `1px solid ${nexusColors.quantum}40` }, children: _jsxs(Box, { sx: { display: 'flex', gap: 2, alignItems: 'center' }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: voiceEnabled, onChange: (e) => setVoiceEnabled(e.target.checked), size: "small", sx: {
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: nexusColors.emerald,
                                                },
                                            } }), label: "Voice", sx: { color: nexusColors.nebula, fontSize: '0.8rem' } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: autoSpeak, onChange: (e) => setAutoSpeak(e.target.checked), size: "small", sx: {
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: nexusColors.emerald,
                                                },
                                            } }), label: "Auto-speak", sx: { color: nexusColors.nebula, fontSize: '0.8rem' } })] }) }), _jsxs(Box, { sx: {
                                height: 400,
                                overflowY: 'auto',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }, children: [messages.map((message) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: _jsx(Box, { sx: {
                                            display: 'flex',
                                            justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                                            mb: 1
                                        }, children: _jsxs(Paper, { sx: {
                                                p: 1.5,
                                                maxWidth: '80%',
                                                background: message.type === 'user'
                                                    ? `linear-gradient(45deg, ${nexusColors.sapphire}40, ${nexusColors.sapphire}20)`
                                                    : `linear-gradient(45deg, ${nexusColors.emerald}40, ${nexusColors.emerald}20)`,
                                                border: `1px solid ${message.type === 'user' ? nexusColors.sapphire : nexusColors.emerald}40`,
                                                borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                                            }, children: [_jsx(Typography, { variant: "body2", sx: {
                                                        color: nexusColors.frost,
                                                        fontSize: '0.9rem',
                                                        lineHeight: 1.4
                                                    }, children: message.content }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: {
                                                                color: nexusColors.shadow,
                                                                fontSize: '0.7rem'
                                                            }, children: message.timestamp.toLocaleTimeString() }), message.type === 'assistant' && voiceEnabled && (_jsx(IconButton, { size: "small", onClick: () => handleSpeak(message.content), sx: { color: nexusColors.emerald, ml: 1 }, children: _jsx(SpeakIcon, { fontSize: "small" }) })), message.isVoice && (_jsx(Chip, { label: "\uD83C\uDFA4", size: "small", sx: {
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                ml: 0.5
                                                            } }))] })] }) }) }, message.id))), isTyping && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'flex-start' }, children: _jsx(Paper, { sx: {
                                                p: 1.5,
                                                background: `linear-gradient(45deg, ${nexusColors.emerald}40, ${nexusColors.emerald}20)`,
                                                border: `1px solid ${nexusColors.emerald}40`,
                                                borderRadius: '16px 16px 16px 4px'
                                            }, children: _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: [_jsx("span", { className: "typing-dots", children: "\u0414\u0443\u043C\u0430\u044E" }), "..."] }) }) }) })), _jsx("div", { ref: messagesEndRef })] }), _jsx(Box, { sx: { p: 1, borderTop: `1px solid ${nexusColors.quantum}40` }, children: _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: quickActions.map((action) => (_jsx(Chip, { label: action, size: "small", onClick: () => setInputMessage(action), sx: {
                                        backgroundColor: nexusColors.darkMatter,
                                        color: nexusColors.nebula,
                                        fontSize: '0.7rem',
                                        '&:hover': {
                                            backgroundColor: nexusColors.quantum,
                                            color: nexusColors.frost
                                        }
                                    } }, action))) }) }), _jsx(Box, { sx: {
                                p: 2,
                                borderTop: `1px solid ${nexusColors.quantum}`,
                                background: `linear-gradient(90deg, ${nexusColors.darkMatter}80, transparent)`
                            }, children: _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'flex-end' }, children: [_jsx(TextField, { fullWidth: true, multiline: true, maxRows: 3, value: inputMessage, onChange: (e) => setInputMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u0430\u0431\u043E \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u0439\u0442\u0435 \u0433\u043E\u043B\u043E\u0441...", variant: "outlined", size: "small", sx: {
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: nexusColors.darkMatter + '40',
                                                '& fieldset': {
                                                    borderColor: nexusColors.quantum,
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: nexusColors.emerald,
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: nexusColors.emerald,
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                color: nexusColors.frost,
                                            },
                                        } }), voiceEnabled && (_jsx(Tooltip, { title: isListening ? "Stop listening" : "Voice input", children: _jsx(IconButton, { onClick: handleVoiceInput, sx: {
                                                color: isListening ? nexusColors.crimson : nexusColors.emerald,
                                                backgroundColor: isListening ? nexusColors.crimson + '20' : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: isListening ? nexusColors.crimson + '40' : nexusColors.emerald + '20'
                                                }
                                            }, children: isListening ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) }) })), isSpeaking ? (_jsx(Tooltip, { title: "Stop speaking", children: _jsx(IconButton, { onClick: stopSpeaking, sx: { color: nexusColors.warning }, children: _jsx(MuteIcon, {}) }) })) : (_jsx(Tooltip, { title: "Send message", children: _jsx(IconButton, { onClick: handleSendMessage, disabled: !inputMessage.trim(), sx: {
                                                color: nexusColors.sapphire,
                                                '&:disabled': { color: nexusColors.shadow }
                                            }, children: _jsx(SendIcon, {}) }) }))] }) })] })] }) }));
};
