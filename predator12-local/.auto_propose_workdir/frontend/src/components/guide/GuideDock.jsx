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
const framer_motion_1 = require("framer-motion");
const appEventStore_1 = require("../../stores/appEventStore");
const nexusTheme_1 = require("../../theme/nexusTheme");
const GuideDock = ({ currentModule = 'dashboard', systemHealth = 'optimal', cpuLoad = 0.3, memoryUsage = 0.4 }) => {
    const { guide, setGuideMode, activateGuide, deactivateGuide, updateLastInteraction } = (0, appEventStore_1.useAppEventStore)();
    const [settingsOpen, setSettingsOpen] = (0, react_1.useState)(false);
    const [voiceEnabled, setVoiceEnabled] = (0, react_1.useState)(false);
    const [micEnabled, setMicEnabled] = (0, react_1.useState)(false);
    const [position, setPosition] = (0, react_1.useState)({ bottom: 24, right: 24 });
    const dockRef = (0, react_1.useRef)(null);
    const settingsAnchorRef = (0, react_1.useRef)(null);
    // Collision avoidance - check for overlapping elements
    (0, react_1.useEffect)(() => {
        const checkCollisions = () => {
            if (!dockRef.current)
                return;
            const dockRect = dockRef.current.getBoundingClientRect();
            const elements = document.querySelectorAll('button, [role="button"], .fab, .floating');
            let hasCollision = false;
            elements.forEach(element => {
                var _a;
                if (element === dockRef.current || ((_a = dockRef.current) === null || _a === void 0 ? void 0 : _a.contains(element)))
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
    return (<>
      {/* Main Guide Dock */}
      <material_1.Box ref={dockRef} sx={{
            position: 'fixed',
            bottom: position.bottom,
            right: position.right,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1
        }}>
        {/* 3D Guide Face */}
        <framer_motion_1.AnimatePresence>
          {guide.isActive && guide.mode !== 'silent' && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} transition={{ duration: 0.3, ease: 'backOut' }}>
              {/*
            <HolographicAIFace
              isActive={true}
              isSpeaking={false}
              emotion={getEmotionFromHealth() as any}
              message={getGuideMessage()}
              intensity={0.7}
              size="small"
              enableGlitch={systemHealth === 'critical'}
              enableAura={true}
              enableDataStream={systemHealth === 'optimal'}
              enableSoundWaves={false}
              enableEnergyRings={false}
              systemHealth={faceHealth}
              cpuLoad={cpuLoad}
              memoryUsage={memoryUsage}
              autoPosition={false}
              fixedPosition={{ top: -180, right: 0 }}
            />
            */}
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>

        {/* Control Stack */}
        <material_1.Stack direction="column" spacing={1} alignItems="center">
          {/* Settings Button */}
          <material_1.Tooltip title="Налаштування гіда" placement="left">
            <material_1.IconButton ref={settingsAnchorRef} onClick={() => setSettingsOpen(true)} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}60`,
            color: nexusTheme_1.nexusColors.frost,
            width: 44,
            height: 44,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}80`,
                transform: 'scale(1.05)'
            },
            transition: 'all 0.3s ease'
        }}>
              <icons_material_1.Settings fontSize="small"/>
            </material_1.IconButton>
          </material_1.Tooltip>

          {/* Main Guide FAB */}
          <material_1.Tooltip title={guide.isActive ? 'Вимкнути гіда' : 'Активувати AI гіда'} placement="left">
            <material_1.Fab color="primary" onClick={handleGuideToggle} sx={{
            backgroundColor: guide.isActive ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.sapphire,
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': {
                backgroundColor: guide.isActive ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.quantum,
                transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 20px ${guide.isActive ? nexusTheme_1.nexusColors.success + '40' : nexusTheme_1.nexusColors.sapphire + '40'}`,
            border: `2px solid ${guide.isActive ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.sapphire}`
        }}>
              <framer_motion_1.motion.div animate={{
            rotate: guide.isActive ? 360 : 0,
            scale: guide.isActive ? [1, 1.1, 1] : 1
        }} transition={{
            rotate: { duration: 0.5 },
            scale: { duration: 1, repeat: guide.isActive ? Infinity : 0, repeatType: 'reverse' }
        }}>
                <icons_material_1.Assistant />
              </framer_motion_1.motion.div>
            </material_1.Fab>
          </material_1.Tooltip>
        </material_1.Stack>
      </material_1.Box>

      {/* Settings Popover */}
      <material_1.Popover open={settingsOpen} anchorEl={settingsAnchorRef.current} onClose={() => setSettingsOpen(false)} anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }} transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }} PaperProps={{
            sx: {
                width: 320,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }
        }}>
        <material_1.Box sx={{ p: 3 }}>
          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
              Налаштування гіда
            </material_1.Typography>
            <material_1.IconButton size="small" onClick={() => setSettingsOpen(false)} sx={{ color: nexusTheme_1.nexusColors.shadow }}>
              <icons_material_1.Close fontSize="small"/>
            </material_1.IconButton>
          </material_1.Box>

          <material_1.Divider sx={{ borderColor: nexusTheme_1.nexusColors.quantum, mb: 2 }}/>

          {/* Guide Mode */}
          <material_1.Box sx={{ mb: 3 }}>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
              Режим роботи
            </material_1.Typography>
            <material_1.Stack direction="row" spacing={1}>
              {['passive', 'guide', 'silent'].map((mode) => (<material_1.Chip key={mode} label={mode === 'passive' ? 'Пасивний' : mode === 'guide' ? 'Активний' : 'Вимкнений'} variant={guide.mode === mode ? 'filled' : 'outlined'} onClick={() => setGuideMode(mode)} sx={{
                backgroundColor: guide.mode === mode ? `${nexusTheme_1.nexusColors.sapphire}40` : 'transparent',
                borderColor: nexusTheme_1.nexusColors.quantum,
                color: nexusTheme_1.nexusColors.frost,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`
                }
            }}/>))}
            </material_1.Stack>
          </material_1.Box>

          {/* Voice Controls */}
          <material_1.Box sx={{ mb: 2 }}>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
              Голосові функції
            </material_1.Typography>

            <material_1.FormControlLabel control={<material_1.Switch checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} color="primary"/>} label={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {voiceEnabled ? <icons_material_1.VolumeUp fontSize="small"/> : <icons_material_1.VolumeOff fontSize="small"/>}
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    Озвучування TTS
                  </material_1.Typography>
                </material_1.Box>}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={micEnabled} onChange={(e) => setMicEnabled(e.target.checked)} color="primary"/>} label={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {micEnabled ? <icons_material_1.Mic fontSize="small"/> : <icons_material_1.MicOff fontSize="small"/>}
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    Голосовий ввід
                  </material_1.Typography>
                </material_1.Box>}/>
          </material_1.Box>

          {/* Current Status */}
          <material_1.Box sx={{ mt: 2, p: 2, backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`, borderRadius: 1 }}>
            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
              Поточний модуль: <strong>{currentModule}</strong><br />
              Статус системи: <strong>{systemHealth}</strong>
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
      </material_1.Popover>
    </>);
};
exports.default = GuideDock;
