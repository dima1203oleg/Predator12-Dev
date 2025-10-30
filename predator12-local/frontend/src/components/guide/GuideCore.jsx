"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const HolographicAIFaceV2_1 = require("./HolographicAIFaceV2");
const EnhancedContextualChat_1 = __importDefault(require("./EnhancedContextualChat"));
const GuideSettingsPanel_1 = __importDefault(require("./GuideSettingsPanel"));
const I18nProvider_1 = require("../../i18n/I18nProvider");
const appEventStore_1 = require("../../stores/appEventStore");
const lucide_react_1 = require("lucide-react");
const GuideCore = ({ currentModule, systemHealth, cpuLoad, memoryUsage, onNavigateToModule, onShowLogs, onHealthCheck, collisionAvoidanceElements = [] }) => {
    var _a;
    const { t } = (0, I18nProvider_1.useI18n)();
    const { addEvent } = (0, appEventStore_1.useAppEventStore)();
    const translateOrFallback = (0, react_1.useCallback)((key, fallback) => {
        const value = t(key);
        return value === key ? fallback : value;
    }, [t]);
    const [guideState, setGuideState] = (0, react_1.useState)({
        isActive: true,
        isMinimized: false,
        showSettings: false,
        showChat: false,
        currentEmotion: 'neutral',
        contextualHints: [],
        performanceMode: 'balanced'
    });
    const [position, setPosition] = (0, react_1.useState)({
        x: window.innerWidth - 320,
        y: 100,
        isDragging: false
    });
    const dragRef = (0, react_1.useRef)(null);
    const frameRef = (0, react_1.useRef)();
    const performanceRef = (0, react_1.useRef)({ fps: 60, frameTime: 0 });
    const avoidanceSelectors = (0, react_1.useMemo)(() => ['[data-critical="true"]', ...collisionAvoidanceElements], [collisionAvoidanceElements]);
    // Performance monitoring
    const monitorPerformance = (0, react_1.useCallback)(() => {
        const start = performance.now();
        frameRef.current = requestAnimationFrame(() => {
            const end = performance.now();
            performanceRef.current.frameTime = end - start;
            performanceRef.current.fps = Math.round(1000 / (end - start));
            // Auto-adjust performance mode
            if (performanceRef.current.fps < 30 && guideState.performanceMode !== 'low') {
                setGuideState(prev => (Object.assign(Object.assign({}, prev), { performanceMode: 'low' })));
                addEvent({ type: 'HEALTH_UNKNOWN', source: 'backend', hint: 'Low FPS detected' }, t('guide.performance.title'), t('guide.performance.autoAdjusted'), 'warn');
            }
            monitorPerformance();
        });
    }, [guideState.performanceMode, addEvent, t]);
    (0, react_1.useEffect)(() => {
        monitorPerformance();
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [monitorPerformance]);
    // Collision detection with UI elements
    const checkCollisions = (0, react_1.useCallback)(() => {
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
                    return Object.assign(Object.assign({}, prev), { x: newX, y: newY });
                });
            }
        });
    }, [avoidanceSelectors]);
    // Contextual hint generation
    const generateContextualHints = (0, react_1.useCallback)((context) => {
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
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { contextualHints: hints[context] || [] })));
    }, [t]);
    (0, react_1.useEffect)(() => {
        generateContextualHints(currentModule);
    }, [currentModule, generateContextualHints]);
    (0, react_1.useEffect)(() => {
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
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { currentEmotion: emotion })));
    }, [systemHealth]);
    (0, react_1.useEffect)(() => {
        if (cpuLoad > 0.85 || memoryUsage > 0.9) {
            setGuideState(prev => (prev.performanceMode === 'low' ? prev : Object.assign(Object.assign({}, prev), { performanceMode: 'low' })));
        }
        else if (cpuLoad < 0.4 && memoryUsage < 0.5) {
            setGuideState(prev => (prev.performanceMode === 'balanced' ? prev : Object.assign(Object.assign({}, prev), { performanceMode: 'balanced' })));
        }
    }, [cpuLoad, memoryUsage]);
    (0, react_1.useEffect)(() => {
        checkCollisions();
    }, [checkCollisions, position.x, position.y]);
    (0, react_1.useEffect)(() => {
        const handleResize = () => checkCollisions();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [checkCollisions]);
    // Voice command integration
    const handleVoiceCommand = (0, react_1.useCallback)((command) => {
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
            'minimize_guide': () => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isMinimized: true }))),
            'show_help': () => setGuideState(prev => (Object.assign(Object.assign({}, prev), { showChat: true })))
        };
        const action = commands[command.toLowerCase().replace(/\s+/g, '_')];
        if (action) {
            action();
            setGuideState(prev => (Object.assign(Object.assign({}, prev), { currentEmotion: 'happy' })));
        }
    }, [addEvent, t, onNavigateToModule, onShowLogs, onHealthCheck]);
    const toggleChat = (0, react_1.useCallback)(() => {
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { showChat: !prev.showChat })));
    }, []);
    const toggleSettings = (0, react_1.useCallback)(() => {
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { showSettings: !prev.showSettings })));
    }, []);
    const toggleMinimize = (0, react_1.useCallback)(() => {
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { isMinimized: !prev.isMinimized })));
    }, []);
    // Memoized guide container style
    const guideContainerStyle = (0, react_1.useMemo)(() => ({
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        pointerEvents: 'auto'
    }), [position.x, position.y]);
    if (!guideState.isActive)
        return null;
    return (<div style={guideContainerStyle} ref={dragRef}>
      <framer_motion_1.motion.div className="guide-container bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl" initial={{ opacity: 0, scale: 0.8 }} animate={{
            opacity: 1,
            scale: guideState.isMinimized ? 0.7 : 1,
            height: guideState.isMinimized ? 80 : 'auto'
        }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{
            width: guideState.isMinimized ? 200 : 300,
            minHeight: guideState.isMinimized ? 80 : 400
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            <span className="text-sm font-medium text-slate-200">
              {t('guide.title')}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button onClick={toggleChat} className="p-1 text-slate-400 hover:text-slate-200 transition-colors" title={t('guide.chat.toggle')}>
              <lucide_react_1.MessageCircle size={16}/>
            </button>

            <button onClick={toggleSettings} className="p-1 text-slate-400 hover:text-slate-200 transition-colors" title={t('guide.settings.toggle')}>
              <lucide_react_1.Settings size={16}/>
            </button>

            <button onClick={toggleMinimize} className="p-1 text-slate-400 hover:text-slate-200 transition-colors" title={guideState.isMinimized ? t('guide.maximize') : t('guide.minimize')}>
              {guideState.isMinimized ? <lucide_react_1.Maximize2 size={16}/> : <lucide_react_1.Minimize2 size={16}/>}
            </button>
          </div>
        </div>

        {!guideState.isMinimized && (<>
            {/* AI Face */}
            <div className="p-4">
              <HolographicAIFaceV2_1.HolographicAIFace emotion={guideState.currentEmotion} isActive={guideState.isActive} performanceMode={guideState.performanceMode} fallbackMode={guideState.forceCanvasFallback} isSpeaking={isSpeaking} message={((_a = messages[messages.length - 1]) === null || _a === void 0 ? void 0 : _a.content) || ''} systemHealth={systemHealth} intensity={guideState.intensity} size={guideState.avatarSize} enableDataStream={guideState.effectsEnabled.dataStream} enableEnergyRings={guideState.effectsEnabled.energyRings} enableSoundWaves={guideState.effectsEnabled.soundWaves} onPerformanceChange={handlePerformanceChange}/>
            </div>

            {/* Performance Indicator */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                </span>
                <span className="text-slate-500">
                  FPS: {performanceRef.current.fps}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{translateOrFallback('guide.metrics.cpu', 'CPU')}: {Math.round(cpuLoad * 100)}%</span>
                <span>{translateOrFallback('guide.metrics.memory', 'Memory')}: {Math.round(memoryUsage * 100)}%</span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {translateOrFallback('guide.health.status', 'System health')}:
                <span className="ml-1 capitalize">{translateOrFallback(`guide.health.${systemHealth}`, systemHealth)}</span>
              </div>
            </div>
          </>)}
      </framer_motion_1.motion.div>

      {/* Chat Panel */}
      <framer_motion_1.AnimatePresence>
        {guideState.showChat && (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute top-0 right-full mr-4 w-96">
            <EnhancedContextualChat_1.default onVoiceCommand={handleVoiceCommand} onClose={() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { showChat: false })))} currentContext="general"/>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Settings Panel */}
      <framer_motion_1.AnimatePresence>
        {guideState.showSettings && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute bottom-full mb-4 left-0 w-80">
            <GuideSettingsPanel_1.default onClose={() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { showSettings: false })))} onPerformanceModeChange={(mode) => setGuideState(prev => (Object.assign(Object.assign({}, prev), { performanceMode: mode })))} currentPerformanceMode={guideState.performanceMode}/>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </div>);
};
exports.default = GuideCore;
