// @ts-nocheck
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HolographicAIFace } from './HolographicAIFaceV2';
import EnhancedContextualChat from './EnhancedContextualChat';
import GuideSettingsPanel from './GuideSettingsPanel';
import { useI18n } from '../../i18n/I18nProvider';
import { useAppEventStore } from '../../stores/appEventStore';
import { Settings, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';

interface GuideState {
  isActive: boolean;
  isMinimized: boolean;
  showSettings: boolean;
  showChat: boolean;
  currentEmotion: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';
  contextualHints: string[];
  performanceMode: 'high' | 'balanced' | 'low';
}

interface GuidePosition {
  x: number;
  y: number;
  isDragging: boolean;
}

type SystemHealthState = 'optimal' | 'degraded' | 'unknown' | 'critical';

interface GuideCoreProps {
  currentModule: string;
  systemHealth: SystemHealthState;
  cpuLoad: number;
  memoryUsage: number;
  onNavigateToModule: (moduleId: string) => void;
  onShowLogs: () => void;
  onHealthCheck: () => void;
  collisionAvoidanceElements?: string[];
}

const GuideCore: React.FC<GuideCoreProps> = ({
  currentModule,
  systemHealth,
  cpuLoad,
  memoryUsage,
  onNavigateToModule,
  onShowLogs,
  onHealthCheck,
  collisionAvoidanceElements = []
}) => {
  const { t } = useI18n();
  const { addEvent } = useAppEventStore();

  const translateOrFallback = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const [guideState, setGuideState] = useState<GuideState>({
    isActive: true,
    isMinimized: false,
    showSettings: false,
    showChat: false,
    currentEmotion: 'neutral',
    contextualHints: [],
    performanceMode: 'balanced'
  });

  const [position, setPosition] = useState<GuidePosition>({
    x: window.innerWidth - 320,
    y: 100,
    isDragging: false
  });

  const dragRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const performanceRef = useRef({ fps: 60, frameTime: 0 });

  const avoidanceSelectors = useMemo(
    () => ['[data-critical="true"]', ...collisionAvoidanceElements],
    [collisionAvoidanceElements]
  );

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
        addEvent(
          { type: 'HEALTH_UNKNOWN', source: 'backend', hint: 'Low FPS detected' },
          t('guide.performance.title'),
          t('guide.performance.autoAdjusted'),
          'warn'
        );
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
    if (!dragRef.current) return;
    
    const guideRect = dragRef.current.getBoundingClientRect();
    const criticalElements = avoidanceSelectors
      .flatMap(selector => Array.from(document.querySelectorAll(selector)))
      .filter((element): element is Element => !!element && element !== dragRef.current);
    
    criticalElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isColliding = !(
        guideRect.right < rect.left ||
        guideRect.left > rect.right ||
        guideRect.bottom < rect.top ||
        guideRect.top > rect.bottom
      );
      
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
  const generateContextualHints = useCallback((context: string) => {
    const hints: Record<string, string[]> = {
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
    const emotion: GuideState['currentEmotion'] = (() => {
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
      setGuideState(prev => (
        prev.performanceMode === 'low' ? prev : { ...prev, performanceMode: 'low' }
      ));
    } else if (cpuLoad < 0.4 && memoryUsage < 0.5) {
      setGuideState(prev => (
        prev.performanceMode === 'balanced' ? prev : { ...prev, performanceMode: 'balanced' }
      ));
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
  const handleVoiceCommand = useCallback((command: string) => {
    const commands: Record<string, () => void> = {
      'show_dashboard': () => {
        onNavigateToModule('dashboard');
        addEvent(
          { type: 'ACTION_REQUIRED', cta: { label: 'Navigate to Dashboard', target: 'dashboard' } },
          t('guide.navigation.title'),
          t('guide.navigation.dashboard'),
          'info'
        );
      },
      'show_agents': () => {
        onNavigateToModule('agents');
        addEvent(
          { type: 'ACTION_REQUIRED', cta: { label: 'Navigate to Agents', target: 'agents' } },
          t('guide.navigation.title'),
          t('guide.navigation.agents'),
          'info'
        );
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
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    zIndex: 9999,
    pointerEvents: 'auto' as const
  }), [position.x, position.y]);

  if (!guideState.isActive) return null;

  return (
    <div style={guideContainerStyle} ref={dragRef}>
      <motion.div
        className="guide-container bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: guideState.isMinimized ? 0.7 : 1,
          height: guideState.isMinimized ? 80 : 'auto'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: guideState.isMinimized ? 200 : 300,
          minHeight: guideState.isMinimized ? 80 : 400
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-200">
              {t('guide.title')}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleChat}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={t('guide.chat.toggle')}
            >
              <MessageCircle size={16} />
            </button>
            
            <button
              onClick={toggleSettings}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={t('guide.settings.toggle')}
            >
              <Settings size={16} />
            </button>
            
            <button
              onClick={toggleMinimize}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={guideState.isMinimized ? t('guide.maximize') : t('guide.minimize')}
            >
              {guideState.isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
          </div>
        </div>

        {!guideState.isMinimized && (
          <>
            {/* AI Face */}
            <div className="p-4">
              <HolographicAIFace
                emotion={guideState.currentEmotion}
                isActive={guideState.isActive}
                performanceMode={guideState.performanceMode}
                fallbackMode={guideState.forceCanvasFallback}
                isSpeaking={isSpeaking}
                message={messages[messages.length - 1]?.content || ''}
                systemHealth={systemHealth}
                intensity={guideState.intensity}
                size={guideState.avatarSize}
                enableDataStream={guideState.effectsEnabled.dataStream}
                enableEnergyRings={guideState.effectsEnabled.energyRings}
                enableSoundWaves={guideState.effectsEnabled.soundWaves}
                onPerformanceChange={handlePerformanceChange}
              />
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
          </>
        )}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {guideState.showChat && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-0 right-full mr-4 w-96"
          >
            <EnhancedContextualChat
              onVoiceCommand={handleVoiceCommand}
              onClose={() => setGuideState(prev => ({ ...prev, showChat: false }))}
              currentContext="general"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {guideState.showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-full mb-4 left-0 w-80"
          >
            <GuideSettingsPanel
              onClose={() => setGuideState(prev => ({ ...prev, showSettings: false }))}
              onPerformanceModeChange={(mode: GuideState['performanceMode']) => setGuideState(prev => ({ ...prev, performanceMode: mode }))}
              currentPerformanceMode={guideState.performanceMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideCore;
