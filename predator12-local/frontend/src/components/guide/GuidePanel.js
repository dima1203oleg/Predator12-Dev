import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, Chip, Typography, Fade, Button, Badge, Divider } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon, ClosedCaption as CCIcon, Help as HelpIcon, VolumeOff as MuteIcon, VolumeUp as VolumeIcon, Psychology as BrainIcon, AutoAwesome as MagicIcon, NotificationsActive as AlertIcon, TipsAndUpdates as TipIcon, Gesture as GestureIcon } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
const useLocalFlag = (key, initial) => {
    const [flag, setFlag] = useState(() => {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : initial;
        }
        catch {
            return initial;
        }
    });
    useEffect(() => { try {
        localStorage.setItem(key, JSON.stringify(flag));
    }
    catch { } }, [key, flag]);
    return [flag, setFlag];
};
const GuidePanel = ({ onToggleListening, onToggleMute, onToggleCaptions, systemHealth, alertsCount = 0, agentsData = [], onQuickAction }) => {
    const [listening, setListening] = useLocalFlag('guide_listening', false);
    const [muted, setMuted] = useLocalFlag('guide_muted', false);
    const [captions, setCaptions] = useLocalFlag('guide_captions', true);
    const [helpMode, setHelpMode] = useLocalFlag('guide_help', false);
    const [predictiveMode, setPredictiveMode] = useLocalFlag('guide_predictive', true);
    const [stepIdx, setStepIdx] = useState(0);
    const [currentGesture, setCurrentGesture] = useState(null);
    const [smartTips, setSmartTips] = useState([]);
    const [showSmartPanel, setShowSmartPanel] = useState(false);
    // Розширений тур з жестами та швидкими діями
    const steps = useMemo(() => ([
        {
            id: 'pulse',
            targetSelector: '[data-tour="pulse"]',
            title: 'Пульс системи',
            description: 'Стан інфраструктури, кількість агентів та подій. Оновлюйте, щоб побачити актуальні значення.',
            gesture: 'point',
            quickAction: 'refresh-status'
        },
        {
            id: 'agents',
            targetSelector: '[data-tour="agents"]',
            title: 'Рій агентів',
            description: 'Стан і ресурси агентів MAS. Тут контролюємо навантаження CPU/пам\'яті та здоров\'я.',
            gesture: 'circle',
            quickAction: 'open-agents-detail'
        },
        {
            id: 'anomalies',
            targetSelector: '[data-tour="anomalies"]',
            title: 'Хроніка аномалій',
            description: 'Останні події/ризики. Відкрийте для деталей та реакцій.',
            gesture: 'tap',
            quickAction: 'analyze-anomalies'
        }
    ]), []);
    const activeStep = steps[stepIdx];
    const [targetRect, setTargetRect] = useState(null);
    // Генерація розумних підказок на основі стану системи
    const generateSmartTips = useCallback(() => {
        const tips = [];
        const now = new Date();
        // Аналіз здоров'я системи
        if (systemHealth === 'warning' || systemHealth === 'critical') {
            tips.push({
                id: 'health-warning',
                type: 'warning',
                title: 'Увага: стан системи потребує уваги',
                description: systemHealth === 'critical' ?
                    'Критичний стан системи. Рекомендую негайно перевірити агентів та логи.' :
                    'Система працює з попередженнями. Варто проаналізувати метрики.',
                targetSelector: '[data-tour="pulse"]',
                action: 'diagnose-system',
                priority: systemHealth === 'critical' ? 10 : 7,
                expires: new Date(now.getTime() + 30 * 60000) // 30 хв
            });
        }
        // Аналіз агентів
        const unhealthyAgents = agentsData.filter(a => a.health === 'warning' || a.health === 'critical');
        if (unhealthyAgents.length > 0) {
            tips.push({
                id: 'agents-unhealthy',
                type: 'warning',
                title: `${unhealthyAgents.length} агент${unhealthyAgents.length > 1 ? 'и' : ''} потребують уваги`,
                description: `Агенти з проблемами: ${unhealthyAgents.map(a => a.name).join(', ')}. Перевірте їх стан.`,
                targetSelector: '[data-tour="agents"]',
                action: 'fix-agents',
                priority: 8,
                expires: new Date(now.getTime() + 15 * 60000)
            });
        }
        // Оптимізація продуктивності
        const highCpuAgents = agentsData.filter(a => parseInt(a.cpu?.replace('%', '') || '0') > 80);
        if (highCpuAgents.length > 0) {
            tips.push({
                id: 'cpu-optimization',
                type: 'optimization',
                title: 'Можливості оптимізації CPU',
                description: `Високе навантаження CPU у ${highCpuAgents.length} агент${highCpuAgents.length > 1 ? 'ів' : 'а'}. Розгляньте масштабування.`,
                action: 'optimize-cpu',
                priority: 6,
                expires: new Date(now.getTime() + 60 * 60000)
            });
        }
        // Інсайти на основі алертів
        if (alertsCount > 10) {
            tips.push({
                id: 'high-alerts',
                type: 'insight',
                title: 'Підвищена активність алертів',
                description: `Зафіксовано ${alertsCount} подій. Це на 40% більше звичайного. Можливі причини: підвищене навантаження або зміни в конфігурації.`,
                action: 'analyze-alert-pattern',
                priority: 5
            });
        }
        // Рекомендації щодо покращень
        tips.push({
            id: 'daily-insight',
            type: 'suggestion',
            title: 'Денна рекомендація',
            description: 'Рекомендую налаштувати автоматичну індексацію даних о 02:00 для оптимальної продуктивності.',
            action: 'setup-auto-indexing',
            priority: 3,
            expires: new Date(now.getTime() + 24 * 60 * 60000)
        });
        return tips.filter(t => !t.expires || t.expires > now).sort((a, b) => b.priority - a.priority);
    }, [systemHealth, alertsCount, agentsData]);
    // Оновлення розумних підказок
    useEffect(() => {
        if (predictiveMode) {
            const tips = generateSmartTips();
            setSmartTips(tips);
        }
    }, [predictiveMode, generateSmartTips]);
    // Анімація жестів
    const performGesture = useCallback((gesture) => {
        setCurrentGesture(gesture);
        setTimeout(() => setCurrentGesture(null), 2000);
    }, []);
    // Кроки туру
    const nextStep = useCallback(() => {
        setStepIdx((i) => (i + 1) % steps.length);
        if (activeStep?.gesture)
            performGesture(activeStep.gesture);
    }, [steps.length, activeStep, performGesture]);
    const prevStep = useCallback(() => {
        setStepIdx((i) => (i - 1 + steps.length) % steps.length);
    }, [steps.length]);
    // Керування з клавіатури
    useEffect(() => {
        if (!helpMode)
            return;
        const onKey = (e) => {
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd' || e.key === 'Enter') {
                e.preventDefault();
                nextStep();
                if (activeStep?.gesture)
                    performGesture(activeStep.gesture);
            }
            else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
                e.preventDefault();
                prevStep();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                setHelpMode(false);
            }
            else if (e.key === ' ' && activeStep?.quickAction) {
                e.preventDefault();
                onQuickAction?.(activeStep.quickAction);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [helpMode, activeStep, nextStep, prevStep, performGesture, onQuickAction]);
    useEffect(() => {
        if (!helpMode)
            return setTargetRect(null);
        const el = document.querySelector(activeStep?.targetSelector || '');
        if (el)
            setTargetRect(el.getBoundingClientRect());
        else
            setTargetRect(null);
        const onResize = () => {
            const el2 = document.querySelector(activeStep?.targetSelector || '');
            if (el2)
                setTargetRect(el2.getBoundingClientRect());
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onResize, true);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize, true);
        };
    }, [helpMode, activeStep]);
    const highPriorityTips = smartTips.filter(t => t.priority >= 7);
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: {
                    position: 'absolute',
                    right: 16,
                    bottom: 72,
                    zIndex: 30,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    background: `${nexusColors.obsidian}CC`,
                    border: `1px solid ${nexusColors.quantum}`,
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)',
                    p: 1
                }, children: [_jsx(Tooltip, { title: listening ? 'Зупинити прослуховування' : 'Голосовий ввід', children: _jsx(Badge, { variant: "dot", color: "error", invisible: !listening, children: _jsx(IconButton, { onClick: () => { const v = !listening; setListening(v); onToggleListening?.(v); }, sx: { color: listening ? nexusColors.crimson : nexusColors.emerald }, children: listening ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) }) }) }), _jsx(Tooltip, { title: muted ? 'Увімкнути звук' : 'Вимкнути звук', children: _jsx(IconButton, { onClick: () => { const v = !muted; setMuted(v); onToggleMute?.(v); }, sx: { color: muted ? nexusColors.warning : nexusColors.sapphire }, children: muted ? _jsx(MuteIcon, {}) : _jsx(VolumeIcon, {}) }) }), _jsx(Tooltip, { title: captions ? 'Приховати субтитри' : 'Показувати субтитри', children: _jsx(IconButton, { onClick: () => { const v = !captions; setCaptions(v); onToggleCaptions?.(v); }, sx: { color: captions ? nexusColors.amethyst : nexusColors.nebula }, children: _jsx(CCIcon, {}) }) }), _jsx(Tooltip, { title: "\u0420\u043E\u0437\u0443\u043C\u043D\u0456 \u043F\u0456\u0434\u043A\u0430\u0437\u043A\u0438", children: _jsx(Badge, { badgeContent: highPriorityTips.length, color: "warning", invisible: highPriorityTips.length === 0, children: _jsx(IconButton, { onClick: () => setShowSmartPanel(!showSmartPanel), sx: { color: showSmartPanel ? nexusColors.warning : nexusColors.frost }, children: _jsx(BrainIcon, {}) }) }) }), _jsx(Tooltip, { title: helpMode ? 'Вимкнути режим допомоги' : 'Увімкнути режим допомоги', children: _jsx(IconButton, { onClick: () => { setHelpMode(!helpMode); setStepIdx(0); }, sx: { color: helpMode ? nexusColors.crimson : nexusColors.emerald }, children: _jsx(HelpIcon, {}) }) }), _jsx(Tooltip, { title: predictiveMode ? 'Вимкнути предиктивні поради' : 'Увімкнути предиктивні поради', children: _jsx(IconButton, { onClick: () => setPredictiveMode(!predictiveMode), sx: { color: predictiveMode ? nexusColors.success : nexusColors.shadow }, children: _jsx(MagicIcon, {}) }) }), currentGesture && (_jsx(Chip, { icon: _jsx(GestureIcon, {}), label: currentGesture, size: "small", sx: {
                            backgroundColor: `${nexusColors.emerald}20`,
                            color: nexusColors.emerald,
                            animation: 'pulse 1s ease-in-out'
                        } }))] }), showSmartPanel && smartTips.length > 0 && (_jsxs(Box, { sx: {
                    position: 'absolute',
                    right: 16,
                    bottom: 130,
                    zIndex: 31,
                    width: 380,
                    maxHeight: 400,
                    background: `${nexusColors.obsidian}F2`,
                    border: `1px solid ${nexusColors.quantum}`,
                    borderRadius: 2,
                    backdropFilter: 'blur(15px)',
                    p: 2,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: nexusColors.emerald, borderRadius: '2px' }
                }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(TipIcon, { sx: { color: nexusColors.emerald, mr: 1 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "\u0420\u043E\u0437\u0443\u043C\u043D\u0456 \u043F\u0456\u0434\u043A\u0430\u0437\u043A\u0438" }), _jsx(IconButton, { size: "small", onClick: () => setShowSmartPanel(false), sx: { ml: 'auto', color: nexusColors.nebula }, children: "\u00D7" })] }), smartTips.map((tip, idx) => (_jsxs(Box, { sx: {
                            mb: 2,
                            p: 1.5,
                            border: `1px solid ${tip.type === 'warning' ? nexusColors.warning :
                                tip.type === 'optimization' ? nexusColors.sapphire :
                                    tip.type === 'insight' ? nexusColors.amethyst : nexusColors.emerald}40`,
                            borderRadius: 2,
                            background: `${nexusColors.darkMatter}40`
                        }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [_jsx(Chip, { label: tip.type, size: "small", sx: {
                                            backgroundColor: `${tip.type === 'warning' ? nexusColors.warning :
                                                tip.type === 'optimization' ? nexusColors.sapphire :
                                                    tip.type === 'insight' ? nexusColors.amethyst : nexusColors.emerald}30`,
                                            color: tip.type === 'warning' ? nexusColors.warning :
                                                tip.type === 'optimization' ? nexusColors.sapphire :
                                                    tip.type === 'insight' ? nexusColors.amethyst : nexusColors.emerald,
                                            fontSize: '0.7rem'
                                        } }), _jsxs(Typography, { variant: "caption", sx: { ml: 'auto', color: nexusColors.shadow }, children: ["\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442: ", tip.priority] })] }), _jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, fontFamily: 'Fira Code', mb: 0.5 }, children: tip.title }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1, fontSize: '0.8rem' }, children: tip.description }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [tip.targetSelector && (_jsx(Button, { size: "small", onClick: () => {
                                            const el = document.querySelector(tip.targetSelector);
                                            if (el)
                                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }, sx: { color: nexusColors.emerald, fontSize: '0.7rem' }, children: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438" })), tip.action && (_jsx(Button, { size: "small", onClick: () => onQuickAction?.(tip.action), sx: { color: nexusColors.sapphire, fontSize: '0.7rem' }, children: "\u0412\u0438\u043F\u0440\u0430\u0432\u0438\u0442\u0438" })), _jsx(Button, { size: "small", onClick: () => setSmartTips(prev => prev.filter(t => t.id !== tip.id)), sx: { color: nexusColors.shadow, fontSize: '0.7rem' }, children: "\u041F\u0440\u0438\u0445\u043E\u0432\u0430\u0442\u0438" })] })] }, tip.id))), smartTips.length === 0 && (_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, textAlign: 'center', py: 2 }, children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u043F\u0440\u0430\u0446\u044E\u0454 \u043E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E. \u041F\u0456\u0434\u043A\u0430\u0437\u043E\u043A \u043D\u0435\u043C\u0430\u0454." }))] })), helpMode && activeStep && targetRect && (_jsxs(_Fragment, { children: [_jsx(Fade, { in: true, children: _jsx(Box, { sx: {
                                position: 'fixed', inset: 0, zIndex: 29,
                                background: 'rgba(0,0,0,0.6)'
                            }, "aria-hidden": !helpMode }) }), _jsx(Box, { sx: {
                            position: 'fixed',
                            zIndex: 31,
                            pointerEvents: 'none',
                            top: targetRect.top - 12,
                            left: targetRect.left - 12,
                            width: targetRect.width + 24,
                            height: targetRect.height + 24,
                            borderRadius: 3,
                            border: `3px solid ${nexusColors.emerald}`,
                            boxShadow: `0 0 0 1px ${nexusColors.emerald}40, 0 0 32px ${nexusColors.emerald}60, inset 0 0 16px ${nexusColors.emerald}20`,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: -6,
                                borderRadius: 'inherit',
                                background: `conic-gradient(${nexusColors.emerald}, ${nexusColors.sapphire}, ${nexusColors.amethyst}, ${nexusColors.emerald})`,
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'xor',
                                animation: 'rotate 4s linear infinite'
                            },
                            '@keyframes rotate': {
                                to: { transform: 'rotate(360deg)' }
                            }
                        }, "aria-label": `Крок туру: ${activeStep.title}` }), _jsxs(Box, { sx: {
                            position: 'fixed',
                            zIndex: 32,
                            top: Math.min(targetRect.bottom + 16, window.innerHeight - 180),
                            left: Math.min(Math.max(targetRect.left, 16), window.innerWidth - 380),
                            width: 360,
                            p: 2.5,
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}F8, ${nexusColors.darkMatter}E6)`,
                            border: `2px solid ${nexusColors.quantum}`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            boxShadow: `0 8px 32px ${nexusColors.void}80`
                        }, role: "dialog", "aria-modal": "true", "aria-label": `Пояснення: ${activeStep.title}`, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1.5 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: activeStep.title }), _jsx(Chip, { label: `${stepIdx + 1}/${steps.length}`, size: "small", sx: {
                                            ml: 'auto',
                                            backgroundColor: `${nexusColors.emerald}20`,
                                            color: nexusColors.emerald
                                        } })] }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 2, lineHeight: 1.5 }, children: activeStep.description }), activeStep.quickAction && (_jsx(Box, { sx: { mb: 2 }, children: _jsx(Button, { size: "small", startIcon: _jsx(MagicIcon, {}), onClick: () => onQuickAction?.(activeStep.quickAction), sx: {
                                        color: nexusColors.sapphire,
                                        border: `1px solid ${nexusColors.sapphire}60`,
                                        backgroundColor: `${nexusColors.sapphire}10`,
                                        fontSize: '0.8rem',
                                        '&:hover': { backgroundColor: `${nexusColors.sapphire}20` }
                                    }, children: "\u0428\u0432\u0438\u0434\u043A\u0430 \u0434\u0456\u044F" }) })), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx(Chip, { size: "small", label: "\u2190 \u041D\u0430\u0437\u0430\u0434 (A)", onClick: prevStep, sx: { color: nexusColors.frost, border: `1px solid ${nexusColors.quantum}` } }), _jsx(Chip, { size: "small", label: "\u0414\u0430\u043B\u0456 \u2192 (D)", onClick: nextStep, sx: { color: nexusColors.frost, border: `1px solid ${nexusColors.quantum}` } }), activeStep.quickAction && (_jsx(Chip, { size: "small", label: "\u0414\u0456\u044F (Space)", onClick: () => onQuickAction?.(activeStep.quickAction), sx: { color: nexusColors.sapphire, border: `1px solid ${nexusColors.sapphire}60` } })), _jsx(Chip, { size: "small", label: "\u0413\u043E\u0442\u043E\u0432\u043E (Esc)", onClick: () => setHelpMode(false), sx: { ml: 'auto', color: nexusColors.emerald, border: `1px solid ${nexusColors.emerald}` } })] })] })] })), highPriorityTips.length > 0 && !showSmartPanel && (_jsx(Box, { sx: {
                    position: 'absolute',
                    right: 200,
                    bottom: 72,
                    zIndex: 28,
                    p: 1.5,
                    background: `linear-gradient(135deg, ${nexusColors.crimson}20, ${nexusColors.warning}10)`,
                    border: `1px solid ${nexusColors.warning}60`,
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)',
                    animation: 'pulse 2s ease-in-out infinite'
                }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(AlertIcon, { sx: { color: nexusColors.warning, fontSize: 18 } }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, fontWeight: 'bold' }, children: highPriorityTips[0].title }), _jsx(Button, { size: "small", onClick: () => setShowSmartPanel(true), sx: { color: nexusColors.warning, fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }, children: "\u0414\u0435\u0442\u0430\u043B\u0456" })] }) }))] }));
};
export default GuidePanel;
