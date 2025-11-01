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
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const useLocalFlag = (key, initial) => {
    const [flag, setFlag] = (0, react_1.useState)(() => {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : initial;
        }
        catch (_a) {
            return initial;
        }
    });
    (0, react_1.useEffect)(() => { try {
        localStorage.setItem(key, JSON.stringify(flag));
    }
    catch (_a) { } }, [key, flag]);
    return [flag, setFlag];
};
const GuidePanel = ({ onToggleListening, onToggleMute, onToggleCaptions, systemHealth, alertsCount = 0, agentsData = [], onQuickAction }) => {
    const [listening, setListening] = useLocalFlag('guide_listening', false);
    const [muted, setMuted] = useLocalFlag('guide_muted', false);
    const [captions, setCaptions] = useLocalFlag('guide_captions', true);
    const [helpMode, setHelpMode] = useLocalFlag('guide_help', false);
    const [predictiveMode, setPredictiveMode] = useLocalFlag('guide_predictive', true);
    const [stepIdx, setStepIdx] = (0, react_1.useState)(0);
    const [currentGesture, setCurrentGesture] = (0, react_1.useState)(null);
    const [smartTips, setSmartTips] = (0, react_1.useState)([]);
    const [showSmartPanel, setShowSmartPanel] = (0, react_1.useState)(false);
    // Розширений тур з жестами та швидкими діями
    const steps = (0, react_1.useMemo)(() => ([
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
    const [targetRect, setTargetRect] = (0, react_1.useState)(null);
    // Генерація розумних підказок на основі стану системи
    const generateSmartTips = (0, react_1.useCallback)(() => {
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
        const highCpuAgents = agentsData.filter(a => { var _a; return parseInt(((_a = a.cpu) === null || _a === void 0 ? void 0 : _a.replace('%', '')) || '0') > 80; });
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
    (0, react_1.useEffect)(() => {
        if (predictiveMode) {
            const tips = generateSmartTips();
            setSmartTips(tips);
        }
    }, [predictiveMode, generateSmartTips]);
    // Анімація жестів
    const performGesture = (0, react_1.useCallback)((gesture) => {
        setCurrentGesture(gesture);
        setTimeout(() => setCurrentGesture(null), 2000);
    }, []);
    // Кроки туру
    const nextStep = (0, react_1.useCallback)(() => {
        setStepIdx((i) => (i + 1) % steps.length);
        if (activeStep === null || activeStep === void 0 ? void 0 : activeStep.gesture)
            performGesture(activeStep.gesture);
    }, [steps.length, activeStep, performGesture]);
    const prevStep = (0, react_1.useCallback)(() => {
        setStepIdx((i) => (i - 1 + steps.length) % steps.length);
    }, [steps.length]);
    // Керування з клавіатури
    (0, react_1.useEffect)(() => {
        if (!helpMode)
            return;
        const onKey = (e) => {
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd' || e.key === 'Enter') {
                e.preventDefault();
                nextStep();
                if (activeStep === null || activeStep === void 0 ? void 0 : activeStep.gesture)
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
            else if (e.key === ' ' && (activeStep === null || activeStep === void 0 ? void 0 : activeStep.quickAction)) {
                e.preventDefault();
                onQuickAction === null || onQuickAction === void 0 ? void 0 : onQuickAction(activeStep.quickAction);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [helpMode, activeStep, nextStep, prevStep, performGesture, onQuickAction]);
    (0, react_1.useEffect)(() => {
        if (!helpMode)
            return setTargetRect(null);
        const el = document.querySelector((activeStep === null || activeStep === void 0 ? void 0 : activeStep.targetSelector) || '');
        if (el)
            setTargetRect(el.getBoundingClientRect());
        else
            setTargetRect(null);
        const onResize = () => {
            const el2 = document.querySelector((activeStep === null || activeStep === void 0 ? void 0 : activeStep.targetSelector) || '');
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
    return (<>
      {/* Основна панель керування */}
      <material_1.Box sx={{
            position: 'absolute',
            right: 16,
            bottom: 72,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: `${nexusTheme_1.nexusColors.obsidian}CC`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            p: 1
        }}>
        <material_1.Tooltip title={listening ? 'Зупинити прослуховування' : 'Голосовий ввід'}>
          <material_1.Badge variant="dot" color="error" invisible={!listening}>
            <material_1.IconButton onClick={() => { const v = !listening; setListening(v); onToggleListening === null || onToggleListening === void 0 ? void 0 : onToggleListening(v); }} sx={{ color: listening ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.emerald }}>
              {listening ? <icons_material_1.MicOff /> : <icons_material_1.Mic />}
            </material_1.IconButton>
          </material_1.Badge>
        </material_1.Tooltip>

        <material_1.Tooltip title={muted ? 'Увімкнути звук' : 'Вимкнути звук'}>
          <material_1.IconButton onClick={() => { const v = !muted; setMuted(v); onToggleMute === null || onToggleMute === void 0 ? void 0 : onToggleMute(v); }} sx={{ color: muted ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.sapphire }}>
            {muted ? <icons_material_1.VolumeOff /> : <icons_material_1.VolumeUp />}
          </material_1.IconButton>
        </material_1.Tooltip>

        <material_1.Tooltip title={captions ? 'Приховати субтитри' : 'Показувати субтитри'}>
          <material_1.IconButton onClick={() => { const v = !captions; setCaptions(v); onToggleCaptions === null || onToggleCaptions === void 0 ? void 0 : onToggleCaptions(v); }} sx={{ color: captions ? nexusTheme_1.nexusColors.amethyst : nexusTheme_1.nexusColors.nebula }}>
            <icons_material_1.ClosedCaption />
          </material_1.IconButton>
        </material_1.Tooltip>

        <material_1.Tooltip title="Розумні підказки">
          <material_1.Badge badgeContent={highPriorityTips.length} color="warning" invisible={highPriorityTips.length === 0}>
            <material_1.IconButton onClick={() => setShowSmartPanel(!showSmartPanel)} sx={{ color: showSmartPanel ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.frost }}>
              <icons_material_1.Psychology />
            </material_1.IconButton>
          </material_1.Badge>
        </material_1.Tooltip>

        <material_1.Tooltip title={helpMode ? 'Вимкнути режим допомоги' : 'Увімкнути режим допомоги'}>
          <material_1.IconButton onClick={() => { setHelpMode(!helpMode); setStepIdx(0); }} sx={{ color: helpMode ? nexusTheme_1.nexusColors.crimson : nexusTheme_1.nexusColors.emerald }}>
            <icons_material_1.Help />
          </material_1.IconButton>
        </material_1.Tooltip>

        <material_1.Tooltip title={predictiveMode ? 'Вимкнути предиктивні поради' : 'Увімкнути предиктивні поради'}>
          <material_1.IconButton onClick={() => setPredictiveMode(!predictiveMode)} sx={{ color: predictiveMode ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.shadow }}>
            <icons_material_1.AutoAwesome />
          </material_1.IconButton>
        </material_1.Tooltip>

        {/* Індикатор жесту */}
        {currentGesture && (<material_1.Chip icon={<icons_material_1.Gesture />} label={currentGesture} size="small" sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
                color: nexusTheme_1.nexusColors.emerald,
                animation: 'pulse 1s ease-in-out'
            }}/>)}
      </material_1.Box>

      {/* Панель розумних підказок */}
      {showSmartPanel && smartTips.length > 0 && (<material_1.Box sx={{
                position: 'absolute',
                right: 16,
                bottom: 130,
                zIndex: 31,
                width: 380,
                maxHeight: 400,
                background: `${nexusTheme_1.nexusColors.obsidian}F2`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                backdropFilter: 'blur(15px)',
                p: 2,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: nexusTheme_1.nexusColors.emerald, borderRadius: '2px' }
            }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <icons_material_1.TipsAndUpdates sx={{ color: nexusTheme_1.nexusColors.emerald, mr: 1 }}/>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
              Розумні підказки
            </material_1.Typography>
            <material_1.IconButton size="small" onClick={() => setShowSmartPanel(false)} sx={{ ml: 'auto', color: nexusTheme_1.nexusColors.nebula }}>
              ×
            </material_1.IconButton>
          </material_1.Box>

          {smartTips.map((tip, idx) => (<material_1.Box key={tip.id} sx={{
                    mb: 2,
                    p: 1.5,
                    border: `1px solid ${tip.type === 'warning' ? nexusTheme_1.nexusColors.warning :
                        tip.type === 'optimization' ? nexusTheme_1.nexusColors.sapphire :
                            tip.type === 'insight' ? nexusTheme_1.nexusColors.amethyst : nexusTheme_1.nexusColors.emerald}40`,
                    borderRadius: 2,
                    background: `${nexusTheme_1.nexusColors.darkMatter}40`
                }}>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <material_1.Chip label={tip.type} size="small" sx={{
                    backgroundColor: `${tip.type === 'warning' ? nexusTheme_1.nexusColors.warning :
                        tip.type === 'optimization' ? nexusTheme_1.nexusColors.sapphire :
                            tip.type === 'insight' ? nexusTheme_1.nexusColors.amethyst : nexusTheme_1.nexusColors.emerald}30`,
                    color: tip.type === 'warning' ? nexusTheme_1.nexusColors.warning :
                        tip.type === 'optimization' ? nexusTheme_1.nexusColors.sapphire :
                            tip.type === 'insight' ? nexusTheme_1.nexusColors.amethyst : nexusTheme_1.nexusColors.emerald,
                    fontSize: '0.7rem'
                }}/>
                <material_1.Typography variant="caption" sx={{ ml: 'auto', color: nexusTheme_1.nexusColors.shadow }}>
                  Приоритет: {tip.priority}
                </material_1.Typography>
              </material_1.Box>

              <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Fira Code', mb: 0.5 }}>
                {tip.title}
              </material_1.Typography>

              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1, fontSize: '0.8rem' }}>
                {tip.description}
              </material_1.Typography>

              <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                {tip.targetSelector && (<material_1.Button size="small" onClick={() => {
                        const el = document.querySelector(tip.targetSelector);
                        if (el)
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }} sx={{ color: nexusTheme_1.nexusColors.emerald, fontSize: '0.7rem' }}>
                    Показати
                  </material_1.Button>)}
                {tip.action && (<material_1.Button size="small" onClick={() => onQuickAction === null || onQuickAction === void 0 ? void 0 : onQuickAction(tip.action)} sx={{ color: nexusTheme_1.nexusColors.sapphire, fontSize: '0.7rem' }}>
                    Виправити
                  </material_1.Button>)}
                <material_1.Button size="small" onClick={() => setSmartTips(prev => prev.filter(t => t.id !== tip.id))} sx={{ color: nexusTheme_1.nexusColors.shadow, fontSize: '0.7rem' }}>
                  Приховати
                </material_1.Button>
              </material_1.Box>
            </material_1.Box>))}

          {smartTips.length === 0 && (<material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, textAlign: 'center', py: 2 }}>
              Система працює оптимально. Підказок немає.
            </material_1.Typography>)}
        </material_1.Box>)}

      {/* Тур: підсвічування елементів і підказка */}
      {helpMode && activeStep && targetRect && (<>
          {/* Підсвітка (маска) */}
          <material_1.Fade in>
            <material_1.Box sx={{
                position: 'fixed', inset: 0, zIndex: 29,
                background: 'rgba(0,0,0,0.6)'
            }} aria-hidden={!helpMode}/>
          </material_1.Fade>

          {/* Контур навколо цілі з анімованою рамкою */}
          <material_1.Box sx={{
                position: 'fixed',
                zIndex: 31,
                pointerEvents: 'none',
                top: targetRect.top - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
                borderRadius: 3,
                border: `3px solid ${nexusTheme_1.nexusColors.emerald}`,
                boxShadow: `0 0 0 1px ${nexusTheme_1.nexusColors.emerald}40, 0 0 32px ${nexusTheme_1.nexusColors.emerald}60, inset 0 0 16px ${nexusTheme_1.nexusColors.emerald}20`,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -6,
                    borderRadius: 'inherit',
                    background: `conic-gradient(${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.emerald})`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    animation: 'rotate 4s linear infinite'
                },
                '@keyframes rotate': {
                    to: { transform: 'rotate(360deg)' }
                }
            }} aria-label={`Крок туру: ${activeStep.title}`}/>

          {/* Підказка з покращеним дизайном */}
          <material_1.Box sx={{
                position: 'fixed',
                zIndex: 32,
                top: Math.min(targetRect.bottom + 16, window.innerHeight - 180),
                left: Math.min(Math.max(targetRect.left, 16), window.innerWidth - 380),
                width: 360,
                p: 2.5,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F8, ${nexusTheme_1.nexusColors.darkMatter}E6)`,
                border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 8px 32px ${nexusTheme_1.nexusColors.void}80`
            }} role="dialog" aria-modal="true" aria-label={`Пояснення: ${activeStep.title}`}>

            <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                {activeStep.title}
              </material_1.Typography>
              <material_1.Chip label={`${stepIdx + 1}/${steps.length}`} size="small" sx={{
                ml: 'auto',
                backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
                color: nexusTheme_1.nexusColors.emerald
            }}/>
            </material_1.Box>

            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 2, lineHeight: 1.5 }}>
              {activeStep.description}
            </material_1.Typography>

            {activeStep.quickAction && (<material_1.Box sx={{ mb: 2 }}>
                <material_1.Button size="small" startIcon={<icons_material_1.AutoAwesome />} onClick={() => onQuickAction === null || onQuickAction === void 0 ? void 0 : onQuickAction(activeStep.quickAction)} sx={{
                    color: nexusTheme_1.nexusColors.sapphire,
                    border: `1px solid ${nexusTheme_1.nexusColors.sapphire}60`,
                    backgroundColor: `${nexusTheme_1.nexusColors.sapphire}10`,
                    fontSize: '0.8rem',
                    '&:hover': { backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20` }
                }}>
                  Швидка дія
                </material_1.Button>
              </material_1.Box>)}

            <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

            <material_1.Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <material_1.Chip size="small" label="← Назад (A)" onClick={prevStep} sx={{ color: nexusTheme_1.nexusColors.frost, border: `1px solid ${nexusTheme_1.nexusColors.quantum}` }}/>
              <material_1.Chip size="small" label="Далі → (D)" onClick={nextStep} sx={{ color: nexusTheme_1.nexusColors.frost, border: `1px solid ${nexusTheme_1.nexusColors.quantum}` }}/>
              {activeStep.quickAction && (<material_1.Chip size="small" label="Дія (Space)" onClick={() => onQuickAction === null || onQuickAction === void 0 ? void 0 : onQuickAction(activeStep.quickAction)} sx={{ color: nexusTheme_1.nexusColors.sapphire, border: `1px solid ${nexusTheme_1.nexusColors.sapphire}60` }}/>)}
              <material_1.Chip size="small" label="Готово (Esc)" onClick={() => setHelpMode(false)} sx={{ ml: 'auto', color: nexusTheme_1.nexusColors.emerald, border: `1px solid ${nexusTheme_1.nexusColors.emerald}` }}/>
            </material_1.Box>
          </material_1.Box>
        </>)}

      {/* Спливаюче сповіщення про критичні поради */}
      {highPriorityTips.length > 0 && !showSmartPanel && (<material_1.Box sx={{
                position: 'absolute',
                right: 200,
                bottom: 72,
                zIndex: 28,
                p: 1.5,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.crimson}20, ${nexusTheme_1.nexusColors.warning}10)`,
                border: `1px solid ${nexusTheme_1.nexusColors.warning}60`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s ease-in-out infinite'
            }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <icons_material_1.NotificationsActive sx={{ color: nexusTheme_1.nexusColors.warning, fontSize: 18 }}/>
            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 'bold' }}>
              {highPriorityTips[0].title}
            </material_1.Typography>
            <material_1.Button size="small" onClick={() => setShowSmartPanel(true)} sx={{ color: nexusTheme_1.nexusColors.warning, fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}>
              Деталі
            </material_1.Button>
          </material_1.Box>
        </material_1.Box>)}
    </>);
};
exports.default = GuidePanel;
