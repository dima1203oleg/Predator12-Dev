import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HolographicAIFace } from './HolographicAIFaceV2';
import EnhancedContextualChat from './EnhancedContextualChat';
import GuideSettingsPanel from './GuideSettingsPanel';
import { useI18n } from '../../i18n/I18nProvider';
import { useAppEventStore } from '../../stores/appEventStore';
import { Settings, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
const GuideCore = ({ currentModule, systemHealth, cpuLoad, memoryUsage, onNavigateToModule, onShowLogs, onHealthCheck, collisionAvoidanceElements = [] }) => {
    const { t } = useI18n();
    const { addEvent } = useAppEventStore();
    const translateOrFallback = useCallback((key, fallback) => {
        const value = t(key);
        return value === key ? fallback : value;
    }, [t]);
    const [guideState, setGuideState] = useState({
        isActive: true,
        isMinimized: false,
        showSettings: false,
        showChat: false,
        currentEmotion: 'neutral',
        contextualHints: [],
        performanceMode: 'balanced'
    });
    const [position, setPosition] = useState({
        x: window.innerWidth - 320,
        y: 100,
        isDragging: false
    });
    const dragRef = useRef(null);
    const frameRef = useRef();
    const performanceRef = useRef({ fps: 60, frameTime: 0 });
    const avoidanceSelectors = useMemo(() => ['[data-critical="true"]', ...collisionAvoidanceElements], [collisionAvoidanceElements]);
    // Performance monitoring
    const monitorPerformance = useCallback(() => {
        const start = performance.now();
        frameRef.current = requestAnimationFrame(() => {
            const end = performance.now();
            performanceRef.current.frameTime = end - start;
            performanceRef.current.fps = Math.round(1000 / (end - start));
            // Auto-adjust performance mode
            if (performanceRef.current.fps < 30 && guideState.performanceMode !== 'low') {
                setGuideState(prev => ({ ...prev, performanceMode: 'low' }));
                addEvent({ type: 'HEALTH_UNKNOWN', source: 'backend', hint: 'Low FPS detected' }, t('guide.performance.title'), t('guide.performance.autoAdjusted'), 'warn');
            }
            monitorPerformance();
        });
    }, [guideState.performanceMode, addEvent, t]);
    useEffect(() => {
        monitorPerformance();
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [monitorPerformance]);
    // Collision detection with UI elements
    const checkCollisions = useCallback(() => {
        if (!dragRef.current)
            return;
        const guideRect = dragRef.current.getBoundingClientRect();
        const criticalElements = avoidanceSelectors
            .flatMap(selector => Array.from(document.querySelectorAll(selector)))
            .filter((element) => !!element && element !== dragRef.current);
        criticalElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isColliding = !(guideRect.right < rect.left ||
                guideRect.left > rect.right ||
                guideRect.bottom < rect.top ||
                guideRect.top > rect.bottom);
            if (isColliding) {
                // Auto-reposition to avoid collision
                const newX = rect.right + 10;
                const newY = rect.top;
                setPosition(prev => {
                    const deltaX = Math.abs(prev.x - newX);
                    const deltaY = Math.abs(prev.y - newY);
                    if (deltaX < 1 && deltaY < 1) {
                        return prev;
                    }
                    return { ...prev, x: newX, y: newY };
                });
            }
        });
    }, [avoidanceSelectors]);
    // Contextual hint generation
    const generateContextualHints = useCallback((context) => {
        const hints = {
            dashboard: [
                t('guide.hints.dashboard.overview'),
                t('guide.hints.dashboard.metrics'),
                t('guide.hints.dashboard.filters')
            ],
            agents: [
                t('guide.hints.agents.status'),
                t('guide.hints.agents.deploy'),
                t('guide.hints.agents.monitor')
            ],
            etl: [
                t('guide.hints.etl.pipeline'),
                t('guide.hints.etl.schedule'),
                t('guide.hints.etl.logs')
            ]
        };
        setGuideState(prev => ({
            ...prev,
            contextualHints: hints[context] || []
        }));
    }, [t]);
    useEffect(() => {
        generateContextualHints(currentModule);
    }, [currentModule, generateContextualHints]);
    useEffect(() => {
        const emotion = (() => {
            switch (systemHealth) {
                case 'optimal':
                    return 'happy';
                case 'critical':
                    return 'concerned';
                case 'degraded':
                    return 'thinking';
                default:
                    return 'neutral';
            }
        })();
        setGuideState(prev => ({ ...prev, currentEmotion: emotion }));
    }, [systemHealth]);
    useEffect(() => {
        if (cpuLoad > 0.85 || memoryUsage > 0.9) {
            setGuideState(prev => (prev.performanceMode === 'low' ? prev : { ...prev, performanceMode: 'low' }));
        }
        else if (cpuLoad < 0.4 && memoryUsage < 0.5) {
            setGuideState(prev => (prev.performanceMode === 'balanced' ? prev : { ...prev, performanceMode: 'balanced' }));
        }
    }, [cpuLoad, memoryUsage]);
    useEffect(() => {
        checkCollisions();
    }, [checkCollisions, position.x, position.y]);
    useEffect(() => {
        const handleResize = () => checkCollisions();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [checkCollisions]);
    // Voice command integration
    const handleVoiceCommand = useCallback((command) => {
        const commands = {
            'show_dashboard': () => {
                onNavigateToModule('dashboard');
                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Navigate to Dashboard', target: 'dashboard' } }, t('guide.navigation.title'), t('guide.navigation.dashboard'), 'info');
            },
            'show_agents': () => {
                onNavigateToModule('agents');
                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Navigate to Agents', target: 'agents' } }, t('guide.navigation.title'), t('guide.navigation.agents'), 'info');
            },
            'show_logs': () => onShowLogs(),
            'run_health_check': () => onHealthCheck(),
            'minimize_guide': () => setGuideState(prev => ({ ...prev, isMinimized: true })),
            'show_help': () => setGuideState(prev => ({ ...prev, showChat: true }))
        };
        const action = commands[command.toLowerCase().replace(/\s+/g, '_')];
        if (action) {
            action();
            setGuideState(prev => ({ ...prev, currentEmotion: 'happy' }));
        }
    }, [addEvent, t, onNavigateToModule, onShowLogs, onHealthCheck]);
    const toggleChat = useCallback(() => {
        setGuideState(prev => ({ ...prev, showChat: !prev.showChat }));
    }, []);
    const toggleSettings = useCallback(() => {
        setGuideState(prev => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);
    const toggleMinimize = useCallback(() => {
        setGuideState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }, []);
    // Memoized guide container style
    const guideContainerStyle = useMemo(() => ({
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        pointerEvents: 'auto'
    }), [position.x, position.y]);
    if (!guideState.isActive)
        return null;
    return (_jsxs("div", { style: guideContainerStyle, ref: dragRef, children: [_jsxs(motion.div, { className: "guide-container bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl", initial: { opacity: 0, scale: 0.8 }, animate: {
                    opacity: 1,
                    scale: guideState.isMinimized ? 0.7 : 1,
                    height: guideState.isMinimized ? 80 : 'auto'
                }, transition: { type: "spring", stiffness: 300, damping: 30 }, style: {
                    width: guideState.isMinimized ? 200 : 300,
                    minHeight: guideState.isMinimized ? 80 : 400
                }, children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b border-slate-700/50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm font-medium text-slate-200", children: t('guide.title') })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { onClick: toggleChat, className: "p-1 text-slate-400 hover:text-slate-200 transition-colors", title: t('guide.chat.toggle'), children: _jsx(MessageCircle, { size: 16 }) }), _jsx("button", { onClick: toggleSettings, className: "p-1 text-slate-400 hover:text-slate-200 transition-colors", title: t('guide.settings.toggle'), children: _jsx(Settings, { size: 16 }) }), _jsx("button", { onClick: toggleMinimize, className: "p-1 text-slate-400 hover:text-slate-200 transition-colors", title: guideState.isMinimized ? t('guide.maximize') : t('guide.minimize'), children: guideState.isMinimized ? _jsx(Maximize2, { size: 16 }) : _jsx(Minimize2, { size: 16 }) })] })] }), !guideState.isMinimized && (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-4", children: _jsx(HolographicAIFace, { emotion: guideState.currentEmotion, isActive: guideState.isActive, performanceMode: guideState.performanceMode, onEmotionChange: (emotion) => setGuideState(prev => ({ ...prev, currentEmotion: emotion })) }) }), guideState.contextualHints.length > 0 && (_jsxs("div", { className: "px-4 pb-2", children: [_jsx("div", { className: "text-xs text-slate-400 mb-2", children: t('guide.hints.title') }), _jsx("div", { className: "space-y-1", children: guideState.contextualHints.slice(0, 3).map((hint, index) => (_jsx("div", { className: "text-xs text-slate-300 bg-slate-800/50 px-2 py-1 rounded", children: hint }, index))) })] })), _jsxs("div", { className: "px-4 pb-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-slate-500", children: [t('guide.performance.mode'), ": ", guideState.performanceMode] }), _jsxs("span", { className: "text-slate-500", children: ["FPS: ", performanceRef.current.fps] })] }), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500 mt-1", children: [_jsxs("span", { children: [translateOrFallback('guide.metrics.cpu', 'CPU'), ": ", Math.round(cpuLoad * 100), "%"] }), _jsxs("span", { children: [translateOrFallback('guide.metrics.memory', 'Memory'), ": ", Math.round(memoryUsage * 100), "%"] })] }), _jsxs("div", { className: "text-xs text-slate-400 mt-2", children: [translateOrFallback('guide.health.status', 'System health'), ":", _jsx("span", { className: "ml-1 capitalize", children: translateOrFallback(`guide.health.${systemHealth}`, systemHealth) })] })] })] }))] }), _jsx(AnimatePresence, { children: guideState.showChat && (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: "absolute top-0 right-full mr-4 w-96", children: _jsx(EnhancedContextualChat, { onVoiceCommand: handleVoiceCommand, onClose: () => setGuideState(prev => ({ ...prev, showChat: false })), currentContext: "general" }) })) }), _jsx(AnimatePresence, { children: guideState.showSettings && (_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "absolute bottom-full mb-4 left-0 w-80", children: _jsx(GuideSettingsPanel, { onClose: () => setGuideState(prev => ({ ...prev, showSettings: false })), onPerformanceModeChange: (mode) => setGuideState(prev => ({ ...prev, performanceMode: mode })), currentPerformanceMode: guideState.performanceMode }) })) })] }));
};
export default GuideCore;
