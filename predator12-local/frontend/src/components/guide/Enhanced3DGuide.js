import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper, Chip } from '@mui/material';
import { VolumeUp, Settings, Help, Psychology, VisibilityOff } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { HolographicAIFace } from './HolographicAIFaceV2';
import EnhancedContextualChat from './EnhancedContextualChat';
const Enhanced3DGuide = ({ isVisible = true, onToggleVisibility, systemHealth = 'optimal', agentsCount = 26, activeAgentsCount = 22 }) => {
    const [showChat, setShowChat] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('🚀 Система Predator готова до роботи');
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Автоматичні повідомлення на основі стану системи
    useEffect(() => {
        const messages = {
            optimal: [
                '🤖 Всі системи функціонують оптимально',
                `📊 ${activeAgentsCount}/${agentsCount} агентів активні`,
                '⚡ AI моделі готові до роботи',
                '🛡️ Безпека системи забезпечена',
                '🔄 Самовдосконалення активне'
            ],
            degraded: [
                '⚠️ Виявлено деградацію продуктивності',
                '🔧 Рекомендую перевірити агентів',
                '📈 Автовиправлення в процесі',
                '🔍 Діагностика проблемних модулів'
            ],
            critical: [
                '🔴 Критичні проблеми в системі!',
                '🚨 Потрібна негайна увага',
                '⛑️ Активую аварійні протоколи',
                '🔧 Запускаю процедури відновлення'
            ]
        };
        const systemMessages = messages[systemHealth];
        let currentIndex = 0;
        const interval = setInterval(() => {
            setCurrentMessage(systemMessages[currentIndex]);
            currentIndex = (currentIndex + 1) % systemMessages.length;
        }, 8000);
        return () => clearInterval(interval);
    }, [systemHealth, agentsCount, activeAgentsCount]);
    const handleSpeak = () => {
        setIsSpeaking(true);
        // Тут можна додати TTS функціональність
        setTimeout(() => setIsSpeaking(false), 3000);
    };
    const getHealthColor = () => {
        switch (systemHealth) {
            case 'optimal': return nexusColors.emerald;
            case 'degraded': return nexusColors.warning;
            case 'critical': return nexusColors.crimson;
            default: return nexusColors.shadow;
        }
    };
    const getHealthEmoji = () => {
        switch (systemHealth) {
            case 'optimal': return '🟢';
            case 'degraded': return '🟡';
            case 'critical': return '🔴';
            default: return '⚪';
        }
    };
    if (!isVisible) {
        return (_jsx(Box, { sx: {
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000
            }, children: _jsx(Tooltip, { title: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 3D \u0433\u0456\u0434\u0430", children: _jsx(IconButton, { onClick: onToggleVisibility, sx: {
                        background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                        color: 'white',
                        width: 56,
                        height: 56,
                        '&:hover': {
                            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.amethyst})`,
                        }
                    }, children: _jsx(Psychology, {}) }) }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, style: {
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                }, children: _jsxs(Paper, { elevation: 8, sx: {
                        background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                        border: `2px solid ${getHealthColor()}60`,
                        borderRadius: 3,
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden',
                        minWidth: 320,
                        maxWidth: 400
                    }, children: [_jsxs(Box, { sx: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                borderBottom: `1px solid ${nexusColors.shadow}40`,
                                background: `linear-gradient(90deg, ${getHealthColor()}20, transparent)`
                            }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Typography, { sx: { fontSize: '1.2rem' }, children: getHealthEmoji() }), _jsx(Typography, { variant: "h6", sx: {
                                                color: nexusColors.frost,
                                                fontWeight: 600,
                                                fontSize: '1rem'
                                            }, children: "Nexus Guide AI" })] }), _jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(Tooltip, { title: "\u041E\u0437\u0432\u0443\u0447\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", onClick: handleSpeak, children: _jsx(VolumeUp, { sx: { color: nexusColors.frost, fontSize: '1.1rem' } }) }) }), _jsx(Tooltip, { title: "\u0427\u0430\u0442", children: _jsx(IconButton, { size: "small", onClick: () => setShowChat(!showChat), children: _jsx(Help, { sx: { color: nexusColors.frost, fontSize: '1.1rem' } }) }) }), _jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", children: _jsx(IconButton, { size: "small", children: _jsx(Settings, { sx: { color: nexusColors.frost, fontSize: '1.1rem' } }) }) }), _jsx(Tooltip, { title: "\u041F\u0440\u0438\u0445\u043E\u0432\u0430\u0442\u0438 \u0433\u0456\u0434\u0430", children: _jsx(IconButton, { size: "small", onClick: onToggleVisibility, children: _jsx(VisibilityOff, { sx: { color: nexusColors.frost, fontSize: '1.1rem' } }) }) })] })] }), _jsx(Box, { sx: { height: 180, position: 'relative', overflow: 'hidden' }, children: _jsx(HolographicAIFace, { isActive: true, isSpeaking: isSpeaking, emotion: systemHealth === 'optimal' ? 'neutral' :
                                    systemHealth === 'degraded' ? 'processing' : 'alert', message: currentMessage, size: "medium", enableGlitch: systemHealth !== 'optimal', enableAura: true, enableDataStream: true, systemHealth: systemHealth === 'degraded' ? 'warning' : systemHealth, cpuLoad: 0.35, memoryUsage: 0.28 }) }), _jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "body2", sx: {
                                        color: nexusColors.frost,
                                        mb: 1.5,
                                        textAlign: 'center',
                                        lineHeight: 1.4,
                                        fontSize: '0.9rem'
                                    }, children: currentMessage }), _jsxs(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }, children: [_jsx(Chip, { size: "small", label: `${activeAgentsCount}/${agentsCount} агентів`, sx: {
                                                backgroundColor: `${nexusColors.quantum}20`,
                                                color: nexusColors.quantum,
                                                fontSize: '0.7rem'
                                            } }), _jsx(Chip, { size: "small", label: "48 AI \u043C\u043E\u0434\u0435\u043B\u0435\u0439", sx: {
                                                backgroundColor: `${nexusColors.sapphire}20`,
                                                color: nexusColors.sapphire,
                                                fontSize: '0.7rem'
                                            } }), _jsx(Chip, { size: "small", label: systemHealth, sx: {
                                                backgroundColor: `${getHealthColor()}20`,
                                                color: getHealthColor(),
                                                fontSize: '0.7rem'
                                            } })] })] })] }) }), _jsx(AnimatePresence, { children: showChat && (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, style: {
                        position: 'fixed',
                        bottom: 20,
                        right: 360,
                        zIndex: 999,
                    }, children: _jsx(EnhancedContextualChat, { open: showChat, onClose: () => setShowChat(false), currentModule: "system_status", systemHealth: systemHealth === 'degraded' ? 'degraded' : systemHealth, onNavigate: (module) => {
                            console.log('Navigate to:', module);
                            setCurrentMessage(`🎯 Переходжу до модуля: ${module}`);
                        }, onHealthCheck: () => {
                            console.log('Health check requested');
                            setCurrentMessage('🔍 Запускаю перевірку здоров\'я системи...');
                        } }) })) })] }));
};
export default Enhanced3DGuide;
