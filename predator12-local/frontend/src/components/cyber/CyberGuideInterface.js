import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper, Chip, Avatar, Fab, Dialog, DialogContent, Switch, FormControlLabel, Slider } from '@mui/material';
import { VolumeUp, VolumeOff, Mic, MicOff, Gesture, Settings as SettingsIcon, Close, Psychology, RecordVoiceOver } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
// Компонент голографічного ефекту
const HolographicOverlay = ({ effect, isActive }) => {
    const overlayRef = useRef(null);
    useEffect(() => {
        if (!overlayRef.current || !effect.enabled || !isActive)
            return;
        const overlay = overlayRef.current;
        let animationId;
        const animate = () => {
            if (effect.glitch) {
                const glitchValue = Math.sin(Date.now() * 0.01) * 0.5;
                overlay.style.filter = `hue-rotate(${glitchValue * 10}deg) brightness(${1 + glitchValue * 0.1})`;
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationId);
    }, [effect, isActive]);
    if (!effect.enabled || !isActive)
        return null;
    return (_jsx(Box, { ref: overlayRef, sx: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: effect.scanlines ? `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
          )
        ` : 'none',
            opacity: effect.intensity / 100,
            zIndex: 1000
        }, children: effect.particles && (_jsx(Box, { sx: {
                width: '100%',
                height: '100%',
                background: `
              radial-gradient(circle at 20% 50%, rgba(0,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,0,100,0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(0,255,100,0.1) 0%, transparent 50%)
            `,
                animation: 'particleFlow 15s ease-in-out infinite'
            } })) }));
};
// Компонент кібер-обличчя
const CyberFace = ({ emotion, isSpeaking, transparency }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = 200;
        canvas.height = 200;
        let animationId;
        const drawFace = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const time = Date.now() * 0.003;
            // Основне кібер-обличчя
            ctx.strokeStyle = `rgba(0, 255, 255, ${transparency})`;
            ctx.lineWidth = 2;
            // Зовнішній контур
            ctx.beginPath();
            ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
            ctx.stroke();
            // Очі залежно від емоції
            const eyeGlow = isSpeaking ? Math.sin(time * 5) * 0.3 + 0.7 : 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${eyeGlow * transparency})`;
            if (emotion === 'happy') {
                // Веселі очі
                ctx.beginPath();
                ctx.arc(centerX - 25, centerY - 15, 8, 0, Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX + 25, centerY - 15, 8, 0, Math.PI);
                ctx.stroke();
            }
            else if (emotion === 'focused') {
                // Сфокусовані очі
                ctx.fillRect(centerX - 30, centerY - 20, 10, 2);
                ctx.fillRect(centerX + 20, centerY - 20, 10, 2);
            }
            else {
                // Нейтральні очі
                ctx.beginPath();
                ctx.arc(centerX - 25, centerY - 15, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + 25, centerY - 15, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            // Рот залежно від мовлення
            if (isSpeaking) {
                const mouthAnimation = Math.sin(time * 8) * 10;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY + 20, 15 + mouthAnimation, 8, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.arc(centerX, centerY + 20, 5, 0, Math.PI);
                ctx.stroke();
            }
            // Додаткові кібер-елементи
            ctx.strokeStyle = `rgba(255, 0, 100, ${transparency * 0.6})`;
            ctx.lineWidth = 1;
            // Кібер-сітка
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + time;
                const x1 = centerX + Math.cos(angle) * 60;
                const y1 = centerY + Math.sin(angle) * 60;
                const x2 = centerX + Math.cos(angle) * 90;
                const y2 = centerY + Math.sin(angle) * 90;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            animationId = requestAnimationFrame(drawFace);
        };
        drawFace();
        return () => cancelAnimationFrame(animationId);
    }, [emotion, isSpeaking, transparency]);
    return (_jsx("canvas", { ref: canvasRef, style: {
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))',
            borderRadius: '50%'
        } }));
};
// Основний компонент кібер-гіда
const CyberGuideInterface = () => {
    const [guideState, setGuideState] = useState({
        isActive: false,
        isListening: false,
        isSpeaking: false,
        currentEmotion: 'neutral',
        personality: 'friendly',
        language: 'uk',
        voiceEnabled: true,
        gestureEnabled: true,
        eyeTrackingEnabled: false,
        adaptiveMode: true,
        transparency: 0.8
    });
    const [hologramEffect, setHologramEffect] = useState({
        enabled: true,
        intensity: 60,
        particles: true,
        glitch: true,
        scanlines: true
    });
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('Вітаю! Я ваш кібер-гід по системі Predator Analytics.');
    // Жести
    const gestureCommands = [
        {
            name: 'Подвійний клік',
            pattern: 'double-tap',
            action: () => setGuideState(prev => ({ ...prev, isActive: !prev.isActive })),
            description: 'Активувати/деактивувати гіда'
        },
        {
            name: 'Свайп вправо',
            pattern: 'swipe-right',
            action: () => setCurrentMessage('Переходжу до наступного модуля...'),
            description: 'Наступний модуль'
        },
        {
            name: 'Тривале натискання',
            pattern: 'long-press',
            action: () => setSettingsOpen(true),
            description: 'Відкрити налаштування'
        }
    ];
    // Голосові команди
    const voiceCommands = [
        { command: 'привіт', action: () => setCurrentMessage('Привіт! Чим можу допомогти?') },
        { command: 'допомога', action: () => setCurrentMessage('Ось список доступних команд...') },
        { command: 'статус', action: () => setCurrentMessage('Система працює в оптимальному режимі') },
        { command: 'налаштування', action: () => setSettingsOpen(true) }
    ];
    // Адаптивні підказки
    const adaptiveHints = [
        'Спробуйте подвійний клік для активації гіда',
        'Використовуйте голосові команди для кращого контролю',
        'Налаштуйте прозорість для комфортного використання',
        'Увімкніть жести для інтуїтивного управління'
    ];
    const [currentHint, setCurrentHint] = useState(0);
    useEffect(() => {
        if (guideState.adaptiveMode) {
            const interval = setInterval(() => {
                setCurrentHint(prev => (prev + 1) % adaptiveHints.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [guideState.adaptiveMode]);
    // Симуляція голосового синтезу
    const speak = (text) => {
        if (!guideState.voiceEnabled)
            return;
        setGuideState(prev => ({ ...prev, isSpeaking: true }));
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = guideState.language === 'uk' ? 'uk-UA' : 'en-US';
            utterance.onend = () => setGuideState(prev => ({ ...prev, isSpeaking: false }));
            speechSynthesis.speak(utterance);
        }
        else {
            setTimeout(() => setGuideState(prev => ({ ...prev, isSpeaking: false })), 2000);
        }
    };
    // Симуляція розпізнавання голосу
    const startListening = () => {
        if (!guideState.voiceEnabled)
            return;
        setGuideState(prev => ({ ...prev, isListening: true }));
        // Симуляція
        setTimeout(() => {
            setGuideState(prev => ({ ...prev, isListening: false }));
            setCurrentMessage('Команду розпізнано успішно!');
            speak('Команду розпізнано успішно!');
        }, 3000);
    };
    if (!guideState.isActive) {
        return (_jsx(Fab, { color: "primary", onClick: () => setGuideState(prev => ({ ...prev, isActive: true })), sx: {
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                    transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease',
                zIndex: 1000
            }, children: _jsx(Psychology, {}) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(HolographicOverlay, { effect: hologramEffect, isActive: guideState.isActive }), _jsx(AnimatePresence, { children: guideState.isActive && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.8, x: 100 }, animate: { opacity: 1, scale: 1, x: 0 }, exit: { opacity: 0, scale: 0.8, x: 100 }, transition: { duration: 0.5, ease: 'easeInOut' }, style: {
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1001
                    }, children: _jsxs(Paper, { elevation: 24, sx: {
                            p: 3,
                            background: `linear-gradient(135deg, 
                  rgba(0, 20, 40, ${guideState.transparency}) 0%, 
                  rgba(0, 10, 30, ${guideState.transparency}) 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid rgba(0, 255, 255, 0.3)`,
                            borderRadius: '20px',
                            boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 0 0 1px rgba(0, 255, 255, 0.2)
                `,
                            minWidth: 320,
                            maxWidth: 400
                        }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(Avatar, { sx: {
                                            background: 'transparent',
                                            border: `2px solid ${nexusColors.emerald}`,
                                            mr: 2
                                        }, children: _jsx(CyberFace, { emotion: guideState.currentEmotion, isSpeaking: guideState.isSpeaking, transparency: guideState.transparency }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.emerald }, children: "\u041A\u0456\u0431\u0435\u0440-\u0413\u0456\u0434 NEXUS" }), _jsx(Chip, { size: "small", label: guideState.personality, sx: {
                                                    background: `rgba(0, 255, 255, 0.2)`,
                                                    color: nexusColors.emerald,
                                                    fontSize: '0.7rem'
                                                } })] }), _jsxs(Box, { children: [_jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", children: _jsx(IconButton, { size: "small", onClick: () => setSettingsOpen(true), sx: { color: nexusColors.emerald }, children: _jsx(SettingsIcon, {}) }) }), _jsx(Tooltip, { title: "\u0417\u0430\u043A\u0440\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", onClick: () => setGuideState(prev => ({ ...prev, isActive: false })), sx: { color: nexusColors.sapphire }, children: _jsx(Close, {}) }) })] })] }), _jsx(Paper, { sx: {
                                    p: 2,
                                    mb: 2,
                                    background: 'rgba(0, 255, 255, 0.1)',
                                    border: '1px solid rgba(0, 255, 255, 0.2)',
                                    borderRadius: '10px'
                                }, children: _jsx(Typography, { variant: "body2", sx: {
                                        color: nexusColors.frost,
                                        lineHeight: 1.5,
                                        animation: guideState.isSpeaking ? 'pulse 1s ease-in-out infinite' : 'none'
                                    }, children: currentMessage }) }), guideState.adaptiveMode && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow, mb: 1, display: 'block' }, children: "\uD83D\uDCA1 \u041F\u0456\u0434\u043A\u0430\u0437\u043A\u0430:" }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontSize: '0.8rem' }, children: adaptiveHints[currentHint] })] })), _jsxs(Box, { sx: { display: 'flex', gap: 1, justifyContent: 'center' }, children: [_jsx(Tooltip, { title: guideState.voiceEnabled ? "Вимкнути голос" : "Увімкнути голос", children: _jsx(IconButton, { color: guideState.voiceEnabled ? "primary" : "default", onClick: () => setGuideState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled })), sx: {
                                                background: guideState.voiceEnabled ? 'rgba(0, 255, 255, 0.2)' : 'transparent'
                                            }, children: guideState.voiceEnabled ? _jsx(VolumeUp, {}) : _jsx(VolumeOff, {}) }) }), _jsx(Tooltip, { title: guideState.isListening ? "Зупинити прослуховування" : "Почати прослуховування", children: _jsx(IconButton, { color: guideState.isListening ? "secondary" : "default", onClick: guideState.isListening ? () => setGuideState(prev => ({ ...prev, isListening: false })) : startListening, sx: {
                                                background: guideState.isListening ? 'rgba(255, 0, 100, 0.2)' : 'transparent',
                                                animation: guideState.isListening ? 'pulse 1s ease-in-out infinite' : 'none'
                                            }, children: guideState.isListening ? _jsx(MicOff, {}) : _jsx(Mic, {}) }) }), _jsx(Tooltip, { title: guideState.gestureEnabled ? "Вимкнути жести" : "Увімкнути жести", children: _jsx(IconButton, { color: guideState.gestureEnabled ? "primary" : "default", onClick: () => setGuideState(prev => ({ ...prev, gestureEnabled: !prev.gestureEnabled })), sx: {
                                                background: guideState.gestureEnabled ? 'rgba(0, 255, 255, 0.2)' : 'transparent'
                                            }, children: _jsx(Gesture, {}) }) }), _jsx(Tooltip, { title: "\u0413\u043E\u0432\u043E\u0440\u0438\u0442\u0438 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F", children: _jsx(IconButton, { onClick: () => speak(currentMessage), disabled: guideState.isSpeaking, sx: { color: nexusColors.emerald }, children: _jsx(RecordVoiceOver, {}) }) })] })] }) })) }), _jsx(Dialog, { open: settingsOpen, onClose: () => setSettingsOpen(false), maxWidth: "sm", fullWidth: true, PaperProps: {
                    sx: {
                        background: `linear-gradient(135deg, 
              rgba(0, 20, 40, 0.95) 0%, 
              rgba(0, 10, 30, 0.95) 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid rgba(0, 255, 255, 0.3)`,
                    }
                }, children: _jsxs(DialogContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.emerald, mb: 3 }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u041A\u0456\u0431\u0435\u0440-\u0413\u0456\u0434\u0430" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, mb: 2 }, children: ["\u041F\u0440\u043E\u0437\u043E\u0440\u0456\u0441\u0442\u044C: ", Math.round(guideState.transparency * 100), "%"] }), _jsx(Slider, { value: guideState.transparency, onChange: (_, value) => setGuideState(prev => ({ ...prev, transparency: value })), min: 0.2, max: 1, step: 0.1, sx: {
                                        color: nexusColors.emerald,
                                        '& .MuiSlider-thumb': {
                                            background: nexusColors.emerald
                                        }
                                    } })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, mb: 2 }, children: ["\u0406\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u0456\u0441\u0442\u044C \u0433\u043E\u043B\u043E\u0433\u0440\u0430\u043C\u0438: ", hologramEffect.intensity, "%"] }), _jsx(Slider, { value: hologramEffect.intensity, onChange: (_, value) => setHologramEffect(prev => ({ ...prev, intensity: value })), min: 0, max: 100, step: 10, sx: {
                                        color: nexusColors.sapphire,
                                        '& .MuiSlider-thumb': {
                                            background: nexusColors.sapphire
                                        }
                                    } })] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: guideState.adaptiveMode, onChange: (e) => setGuideState(prev => ({ ...prev, adaptiveMode: e.target.checked })), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: nexusColors.emerald } } }), label: "\u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C", sx: { color: nexusColors.frost } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: hologramEffect.particles, onChange: (e) => setHologramEffect(prev => ({ ...prev, particles: e.target.checked })), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: nexusColors.emerald } } }), label: "\u0427\u0430\u0441\u0442\u0438\u043D\u043A\u0438 \u0433\u043E\u043B\u043E\u0433\u0440\u0430\u043C\u0438", sx: { color: nexusColors.frost } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: hologramEffect.glitch, onChange: (e) => setHologramEffect(prev => ({ ...prev, glitch: e.target.checked })), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: nexusColors.emerald } } }), label: "\u0413\u043B\u0456\u0442\u0447 \u0435\u0444\u0435\u043A\u0442\u0438", sx: { color: nexusColors.frost } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: guideState.eyeTrackingEnabled, onChange: (e) => setGuideState(prev => ({ ...prev, eyeTrackingEnabled: e.target.checked })), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: nexusColors.emerald } } }), label: "\u0412\u0456\u0434\u0441\u0442\u0435\u0436\u0435\u043D\u043D\u044F \u043F\u043E\u0433\u043B\u044F\u0434\u0443 (\u0435\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u043E)", sx: { color: nexusColors.frost } })] })] }) }), _jsx("style", { children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes particleFlow {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          33% { transform: translateX(30px) translateY(-20px) rotate(120deg); }
          66% { transform: translateX(-20px) translateY(30px) rotate(240deg); }
        }
      ` })] }));
};
export default CyberGuideInterface;
