import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
const getEmotionColor = (emotion) => {
    switch (emotion) {
        case 'excited': return nexusColors.emerald;
        case 'concerned': return nexusColors.warning;
        case 'analytical': return nexusColors.sapphire;
        default: return nexusColors.frost;
    }
};
const getSpeakerIcon = (speaker) => {
    switch (speaker) {
        case 'guide': return '🤖';
        case 'system': return '⚡';
        case 'user': return '👤';
        default: return '💬';
    }
};
const LiveSubtitles = ({ currentSubtitle, showCaptions, position = 'center' }) => {
    const [displaySubtitle, setDisplaySubtitle] = useState(null);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef();
    useEffect(() => {
        if (currentSubtitle && showCaptions) {
            setDisplaySubtitle(currentSubtitle);
            setProgress(0);
            // Анімація прогресу відображення
            const duration = currentSubtitle.duration || Math.max(2000, currentSubtitle.text.length * 50);
            const step = 100 / (duration / 50);
            intervalRef.current = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(intervalRef.current);
                        setTimeout(() => setDisplaySubtitle(null), 500);
                        return 100;
                    }
                    return p + step;
                });
            }, 50);
        }
        else if (!showCaptions) {
            setDisplaySubtitle(null);
        }
        return () => {
            if (intervalRef.current)
                clearInterval(intervalRef.current);
        };
    }, [currentSubtitle, showCaptions]);
    if (!displaySubtitle || !showCaptions)
        return null;
    const positionStyles = {
        bottom: { bottom: 80, left: '50%', transform: 'translateX(-50%)' },
        center: { top: '50%', left: '50%', transform: 'translate(-50%, 50%)' },
        floating: { top: '30%', right: 60 }
    };
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0, y: 20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -20, scale: 0.9 }, transition: { duration: 0.3, ease: 'easeOut' }, style: {
                position: 'absolute',
                zIndex: 25,
                maxWidth: '60%',
                minWidth: '300px',
                ...positionStyles[position]
            }, children: _jsxs(Box, { sx: {
                    p: 2.5,
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F5, ${nexusColors.darkMatter}E8)`,
                    border: `2px solid ${getEmotionColor(displaySubtitle.emotion)}60`,
                    borderRadius: 3,
                    backdropFilter: 'blur(15px)',
                    boxShadow: `0 8px 32px ${nexusColors.void}60, inset 0 0 20px ${getEmotionColor(displaySubtitle.emotion)}10`,
                    position: 'relative',
                    overflow: 'hidden'
                }, children: [_jsx(Box, { sx: {
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: 3,
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${getEmotionColor(displaySubtitle.emotion)}, ${nexusColors.sapphire})`,
                            borderRadius: '0 3px 0 0',
                            transition: 'width 0.05s linear'
                        } }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1.5 }, children: [_jsx(Typography, { variant: "body2", sx: { mr: 1, fontSize: '16px' }, children: getSpeakerIcon(displaySubtitle.speaker) }), _jsx(Chip, { label: displaySubtitle.speaker === 'guide' ? 'Nexus Гід' :
                                    displaySubtitle.speaker === 'system' ? 'Система' : 'Користувач', size: "small", sx: {
                                    backgroundColor: `${getEmotionColor(displaySubtitle.emotion)}20`,
                                    color: getEmotionColor(displaySubtitle.emotion),
                                    fontFamily: 'Orbitron',
                                    fontSize: '0.7rem'
                                } }), displaySubtitle.emotion && displaySubtitle.emotion !== 'neutral' && (_jsx(Chip, { label: displaySubtitle.emotion, size: "small", sx: {
                                    ml: 1,
                                    backgroundColor: `${getEmotionColor(displaySubtitle.emotion)}15`,
                                    color: getEmotionColor(displaySubtitle.emotion),
                                    fontSize: '0.65rem'
                                } })), _jsx(Typography, { variant: "caption", sx: { ml: 'auto', color: nexusColors.shadow }, children: displaySubtitle.timestamp.toLocaleTimeString() })] }), _jsx(Typography, { sx: {
                            color: nexusColors.frost,
                            fontFamily: displaySubtitle.speaker === 'guide' ? 'Inter' : 'Fira Code',
                            fontSize: position === 'center' ? '1.1rem' : '1rem',
                            lineHeight: 1.4,
                            textShadow: `0 0 8px ${getEmotionColor(displaySubtitle.emotion)}40`,
                            // Ефект друкарської машинки для довгих текстів
                            ...(displaySubtitle.text.length > 100 && {
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                animation: `typewriter ${Math.min(3, displaySubtitle.text.length / 30)}s steps(${displaySubtitle.text.length}) 1 normal both`,
                                '@keyframes typewriter': {
                                    'from': { width: 0 },
                                    'to': { width: '100%' }
                                }
                            })
                        }, children: displaySubtitle.text }), displaySubtitle.emotion === 'excited' && (_jsx(Box, { sx: {
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: nexusColors.emerald,
                            boxShadow: `0 0 12px ${nexusColors.emerald}`,
                            animation: 'pulse 0.8s ease-in-out infinite'
                        } })), displaySubtitle.emotion === 'concerned' && (_jsx(Box, { sx: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: `linear-gradient(90deg, transparent, ${nexusColors.warning}60, transparent)`,
                            animation: 'slideWarning 2s ease-in-out infinite',
                            '@keyframes slideWarning': {
                                '0%, 100%': { transform: 'translateX(-100%)' },
                                '50%': { transform: 'translateX(100%)' }
                            }
                        } }))] }) }) }));
};
export default LiveSubtitles;
