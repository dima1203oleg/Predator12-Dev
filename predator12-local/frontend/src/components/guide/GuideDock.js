import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, Fab, Stack, Tooltip, Switch, FormControlLabel, Popover, Typography, Chip, Divider, IconButton } from '@mui/material';
import { Assistant as GuideIcon, Settings as SettingsIcon, VolumeUp as VolumeIcon, VolumeOff as VolumeOffIcon, Mic as MicIcon, MicOff as MicOffIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppEventStore } from '../../stores/appEventStore';
import { nexusColors } from '../../theme/nexusTheme';
import { HolographicAIFace } from '../nexus_visuals/HolographicAIFace';
const GuideDock = ({ currentModule = 'dashboard', systemHealth = 'optimal', cpuLoad = 0.3, memoryUsage = 0.4 }) => {
    const { guide, setGuideMode, activateGuide, deactivateGuide, updateLastInteraction } = useAppEventStore();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [position, setPosition] = useState({ bottom: 24, right: 24 });
    const dockRef = useRef(null);
    const settingsAnchorRef = useRef(null);
    // Collision avoidance - check for overlapping elements
    useEffect(() => {
        const checkCollisions = () => {
            if (!dockRef.current)
                return;
            const dockRect = dockRef.current.getBoundingClientRect();
            const elements = document.querySelectorAll('button, [role="button"], .fab, .floating');
            let hasCollision = false;
            elements.forEach(element => {
                if (element === dockRef.current || dockRef.current?.contains(element))
                    return;
                const rect = element.getBoundingClientRect();
                const collision = !(rect.right < dockRect.left ||
                    rect.left > dockRect.right ||
                    rect.bottom < dockRect.top ||
                    rect.top > dockRect.bottom);
                if (collision)
                    hasCollision = true;
            });
            // Adjust position if collision detected
            if (hasCollision) {
                const viewport = { width: window.innerWidth, height: window.innerHeight };
                // Try higher position on right first
                const newBottom = Math.min(Math.max(120, position.bottom + 96), viewport.height - 200);
                setPosition({ bottom: newBottom, right: 24 });
            }
            else {
                // Keep default dock
                setPosition({ bottom: 24, right: 24 });
            }
        };
        checkCollisions();
        window.addEventListener('resize', checkCollisions);
        const interval = setInterval(checkCollisions, 2000);
        return () => {
            window.removeEventListener('resize', checkCollisions);
            clearInterval(interval);
        };
    }, [position.bottom]);
    const handleGuideToggle = () => {
        if (guide.isActive) {
            deactivateGuide();
        }
        else {
            activateGuide(currentModule);
        }
        updateLastInteraction();
    };
    const getGuideMessage = () => {
        if (guide.mode === 'silent')
            return '';
        switch (systemHealth) {
            case 'unknown':
                return '🔍 Статус системи невідомий. Натисніть "Перевірити" або відкрийте журнали для діагностики.';
            case 'critical':
                return '🚨 КРИТИЧНО! Система потребує негайного втручання. Рекомендую перевірити логи.';
            case 'degraded':
                return '⚠️ Система працює з обмеженнями. Варто проаналізувати метрики продуктивності.';
            case 'optimal':
                return `✅ Система працює нормально. Модуль "${currentModule}" готовий до роботи.`;
            default:
                return 'AI Гід готовий допомогти з навігацією та поясненнями.';
        }
    };
    const getEmotionFromHealth = () => {
        switch (systemHealth) {
            case 'critical': return 'error';
            case 'degraded': return 'alert';
            case 'unknown': return 'processing';
            case 'optimal': return 'success';
            default: return 'neutral';
        }
    };
    const faceHealth = systemHealth === 'critical' ? 'critical' :
        systemHealth === 'optimal' ? 'optimal' : 'warning';
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { ref: dockRef, sx: {
                    position: 'fixed',
                    bottom: position.bottom,
                    right: position.right,
                    zIndex: 1300,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 1
                }, children: [_jsx(AnimatePresence, { children: guide.isActive && guide.mode !== 'silent' && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.8, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8, y: 20 }, transition: { duration: 0.3, ease: 'backOut' }, children: _jsx(HolographicAIFace, { isActive: true, isSpeaking: false, emotion: getEmotionFromHealth(), message: getGuideMessage(), intensity: 0.7, size: "small", enableGlitch: systemHealth === 'critical', enableAura: true, enableDataStream: systemHealth === 'optimal', enableSoundWaves: false, enableEnergyRings: false, systemHealth: faceHealth, cpuLoad: cpuLoad, memoryUsage: memoryUsage, autoPosition: false, fixedPosition: { top: -180, right: 0 } }) })) }), _jsxs(Stack, { direction: "column", spacing: 1, alignItems: "center", children: [_jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0433\u0456\u0434\u0430", placement: "left", children: _jsx(IconButton, { ref: settingsAnchorRef, onClick: () => setSettingsOpen(true), sx: {
                                        backgroundColor: `${nexusColors.quantum}60`,
                                        color: nexusColors.frost,
                                        width: 44,
                                        height: 44,
                                        '&:hover': {
                                            backgroundColor: `${nexusColors.quantum}80`,
                                            transform: 'scale(1.05)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }, children: _jsx(SettingsIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: guide.isActive ? 'Вимкнути гіда' : 'Активувати AI гіда', placement: "left", children: _jsx(Fab, { color: "primary", onClick: handleGuideToggle, sx: {
                                        backgroundColor: guide.isActive ? nexusColors.success : nexusColors.sapphire,
                                        color: 'white',
                                        width: 56,
                                        height: 56,
                                        '&:hover': {
                                            backgroundColor: guide.isActive ? nexusColors.emerald : nexusColors.quantum,
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.3s ease',
                                        boxShadow: `0 4px 20px ${guide.isActive ? nexusColors.success + '40' : nexusColors.sapphire + '40'}`,
                                        border: `2px solid ${guide.isActive ? nexusColors.success : nexusColors.sapphire}`
                                    }, children: _jsx(motion.div, { animate: {
                                            rotate: guide.isActive ? 360 : 0,
                                            scale: guide.isActive ? [1, 1.1, 1] : 1
                                        }, transition: {
                                            rotate: { duration: 0.5 },
                                            scale: { duration: 1, repeat: guide.isActive ? Infinity : 0, repeatType: 'reverse' }
                                        }, children: _jsx(GuideIcon, {}) }) }) })] })] }), _jsx(Popover, { open: settingsOpen, anchorEl: settingsAnchorRef.current, onClose: () => setSettingsOpen(false), anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                }, transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }, PaperProps: {
                    sx: {
                        width: 320,
                        background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                        border: `1px solid ${nexusColors.quantum}`,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                    }
                }, children: _jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0433\u0456\u0434\u0430" }), _jsx(IconButton, { size: "small", onClick: () => setSettingsOpen(false), sx: { color: nexusColors.shadow }, children: _jsx(CloseIcon, { fontSize: "small" }) })] }), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, mb: 1 }, children: "\u0420\u0435\u0436\u0438\u043C \u0440\u043E\u0431\u043E\u0442\u0438" }), _jsx(Stack, { direction: "row", spacing: 1, children: ['passive', 'guide', 'silent'].map((mode) => (_jsx(Chip, { label: mode === 'passive' ? 'Пасивний' : mode === 'guide' ? 'Активний' : 'Вимкнений', variant: guide.mode === mode ? 'filled' : 'outlined', onClick: () => setGuideMode(mode), sx: {
                                            backgroundColor: guide.mode === mode ? `${nexusColors.sapphire}40` : 'transparent',
                                            borderColor: nexusColors.quantum,
                                            color: nexusColors.frost,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: `${nexusColors.sapphire}20`
                                            }
                                        } }, mode))) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, mb: 1 }, children: "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u0456 \u0444\u0443\u043D\u043A\u0446\u0456\u0457" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: voiceEnabled, onChange: (e) => setVoiceEnabled(e.target.checked), color: "primary" }), label: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [voiceEnabled ? _jsx(VolumeIcon, { fontSize: "small" }) : _jsx(VolumeOffIcon, { fontSize: "small" }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: "\u041E\u0437\u0432\u0443\u0447\u0443\u0432\u0430\u043D\u043D\u044F TTS" })] }) }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: micEnabled, onChange: (e) => setMicEnabled(e.target.checked), color: "primary" }), label: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [micEnabled ? _jsx(MicIcon, { fontSize: "small" }) : _jsx(MicOffIcon, { fontSize: "small" }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u0438\u0439 \u0432\u0432\u0456\u0434" })] }) })] }), _jsx(Box, { sx: { mt: 2, p: 2, backgroundColor: `${nexusColors.quantum}20`, borderRadius: 1 }, children: _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: ["\u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u043C\u043E\u0434\u0443\u043B\u044C: ", _jsx("strong", { children: currentModule }), _jsx("br", {}), "\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u0438\u0441\u0442\u0435\u043C\u0438: ", _jsx("strong", { children: systemHealth })] }) })] }) })] }));
};
export default GuideDock;
