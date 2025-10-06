import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Fab, Tooltip, Badge, Box } from '@mui/material';
import { Psychology, Settings, VolumeUp, VolumeOff } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useModuleGuide } from './GuideContext';
import { GuideSettingsManager } from './GuideSettingsManager';
const GuideFloatingButton = ({ module, position = 'bottom-right', hasNotifications = false, notificationCount = 0 }) => {
    const { showGuide, isVisible, settings } = useModuleGuide(module);
    const [showSettings, setShowSettings] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const getPositionStyles = () => {
        const baseStyles = {
            position: 'fixed',
            zIndex: 1000
        };
        switch (position) {
            case 'bottom-right':
                return { ...baseStyles, bottom: 24, right: 24 };
            case 'bottom-left':
                return { ...baseStyles, bottom: 24, left: 24 };
            case 'top-right':
                return { ...baseStyles, top: 24, right: 24 };
            case 'top-left':
                return { ...baseStyles, top: 24, left: 24 };
            default:
                return { ...baseStyles, bottom: 24, right: 24 };
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: getPositionStyles(), children: [_jsx(motion.div, { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 }, onHoverStart: () => setIsHovered(true), onHoverEnd: () => setIsHovered(false), children: _jsx(Tooltip, { title: `AI Гід • ${module.toUpperCase()}`, placement: "left", arrow: true, children: _jsx(Badge, { badgeContent: hasNotifications ? notificationCount : 0, color: "error", invisible: !hasNotifications || notificationCount === 0, children: _jsx(Fab, { onClick: showGuide, sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`,
                                        color: nexusColors.frost,
                                        boxShadow: `0 8px 32px ${nexusColors.amethyst}40`,
                                        border: `2px solid ${nexusColors.quantum}`,
                                        width: 64,
                                        height: 64,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                                            boxShadow: `0 12px 40px ${nexusColors.sapphire}60`,
                                            transform: 'translateY(-2px)'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0px)'
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }, children: _jsx(Psychology, { sx: { fontSize: 32 } }) }) }) }) }), _jsx(AnimatePresence, { children: isHovered && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 }, transition: { duration: 0.2 }, style: {
                                position: 'absolute',
                                bottom: 80,
                                right: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8
                            }, children: [_jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", placement: "left", children: _jsx(Fab, { size: "small", onClick: () => setShowSettings(true), sx: {
                                            backgroundColor: `${nexusColors.quantum}80`,
                                            color: nexusColors.frost,
                                            border: `1px solid ${nexusColors.quantum}`,
                                            '&:hover': {
                                                backgroundColor: `${nexusColors.quantum}CC`,
                                                transform: 'scale(1.05)'
                                            }
                                        }, children: _jsx(Settings, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: settings.voice.synthesis ? "Вимкнути звук" : "Увімкнути звук", placement: "left", children: _jsx(Fab, { size: "small", sx: {
                                            backgroundColor: settings.voice.synthesis ?
                                                `${nexusColors.success}40` : `${nexusColors.shadow}40`,
                                            color: settings.voice.synthesis ? nexusColors.success : nexusColors.shadow,
                                            border: `1px solid ${settings.voice.synthesis ? nexusColors.success : nexusColors.shadow}`,
                                            '&:hover': {
                                                backgroundColor: settings.voice.synthesis ?
                                                    `${nexusColors.success}60` : `${nexusColors.shadow}60`,
                                                transform: 'scale(1.05)'
                                            }
                                        }, children: settings.voice.synthesis ?
                                            _jsx(VolumeUp, { fontSize: "small" }) :
                                            _jsx(VolumeOff, { fontSize: "small" }) }) })] })) }), isVisible && (_jsx(Box, { sx: {
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: nexusColors.success,
                            boxShadow: `0 0 12px ${nexusColors.success}`,
                            animation: 'pulse 2s infinite'
                        } })), _jsx(Box, { sx: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: isHovered ? 120 : 80,
                            height: isHovered ? 120 : 80,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${nexusColors.amethyst}20, transparent)`,
                            pointerEvents: 'none',
                            transition: 'all 0.3s ease',
                            zIndex: -1
                        } })] }), _jsx(GuideSettingsManager, { open: showSettings, onClose: () => setShowSettings(false), settings: settings, onSettingsChange: () => { }, onResetDefaults: () => { } }), _jsx("style", { children: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
      ` })] }));
};
export default GuideFloatingButton;
