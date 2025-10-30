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
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const getEmotionColor = (emotion) => {
    switch (emotion) {
        case 'excited': return nexusTheme_1.nexusColors.emerald;
        case 'concerned': return nexusTheme_1.nexusColors.warning;
        case 'analytical': return nexusTheme_1.nexusColors.sapphire;
        default: return nexusTheme_1.nexusColors.frost;
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
    const [displaySubtitle, setDisplaySubtitle] = (0, react_1.useState)(null);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const intervalRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
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
    return (<framer_motion_1.AnimatePresence>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} transition={{ duration: 0.3, ease: 'easeOut' }} style={Object.assign({ position: 'absolute', zIndex: 25, maxWidth: '60%', minWidth: '300px' }, positionStyles[position])}>
        <material_1.Box sx={{
            p: 2.5,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F5, ${nexusTheme_1.nexusColors.darkMatter}E8)`,
            border: `2px solid ${getEmotionColor(displaySubtitle.emotion)}60`,
            borderRadius: 3,
            backdropFilter: 'blur(15px)',
            boxShadow: `0 8px 32px ${nexusTheme_1.nexusColors.void}60, inset 0 0 20px ${getEmotionColor(displaySubtitle.emotion)}10`,
            position: 'relative',
            overflow: 'hidden'
        }}>
          {/* Прогрес-бар */}
          <material_1.Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${getEmotionColor(displaySubtitle.emotion)}, ${nexusTheme_1.nexusColors.sapphire})`,
            borderRadius: '0 3px 0 0',
            transition: 'width 0.05s linear'
        }}/>

          {/* Заголовок з іконкою спікера */}
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <material_1.Typography variant="body2" sx={{ mr: 1, fontSize: '16px' }}>
              {getSpeakerIcon(displaySubtitle.speaker)}
            </material_1.Typography>
            <material_1.Chip label={displaySubtitle.speaker === 'guide' ? 'Nexus Гід' :
            displaySubtitle.speaker === 'system' ? 'Система' : 'Користувач'} size="small" sx={{
            backgroundColor: `${getEmotionColor(displaySubtitle.emotion)}20`,
            color: getEmotionColor(displaySubtitle.emotion),
            fontFamily: 'Orbitron',
            fontSize: '0.7rem'
        }}/>
            {displaySubtitle.emotion && displaySubtitle.emotion !== 'neutral' && (<material_1.Chip label={displaySubtitle.emotion} size="small" sx={{
                ml: 1,
                backgroundColor: `${getEmotionColor(displaySubtitle.emotion)}15`,
                color: getEmotionColor(displaySubtitle.emotion),
                fontSize: '0.65rem'
            }}/>)}
            <material_1.Typography variant="caption" sx={{ ml: 'auto', color: nexusTheme_1.nexusColors.shadow }}>
              {displaySubtitle.timestamp.toLocaleTimeString()}
            </material_1.Typography>
          </material_1.Box>

          {/* Текст субтитрів з типографічними ефектами */}
          <material_1.Typography sx={Object.assign({ color: nexusTheme_1.nexusColors.frost, fontFamily: displaySubtitle.speaker === 'guide' ? 'Inter' : 'Fira Code', fontSize: position === 'center' ? '1.1rem' : '1rem', lineHeight: 1.4, textShadow: `0 0 8px ${getEmotionColor(displaySubtitle.emotion)}40` }, (displaySubtitle.text.length > 100 && {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            animation: `typewriter ${Math.min(3, displaySubtitle.text.length / 30)}s steps(${displaySubtitle.text.length}) 1 normal both`,
            '@keyframes typewriter': {
                'from': { width: 0 },
                'to': { width: '100%' }
            }
        }))}>
            {displaySubtitle.text}
          </material_1.Typography>

          {/* Додаткові візуальні ефекти залежно від емоції */}
          {displaySubtitle.emotion === 'excited' && (<material_1.Box sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: nexusTheme_1.nexusColors.emerald,
                boxShadow: `0 0 12px ${nexusTheme_1.nexusColors.emerald}`,
                animation: 'pulse 0.8s ease-in-out infinite'
            }}/>)}

          {displaySubtitle.emotion === 'concerned' && (<material_1.Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${nexusTheme_1.nexusColors.warning}60, transparent)`,
                animation: 'slideWarning 2s ease-in-out infinite',
                '@keyframes slideWarning': {
                    '0%, 100%': { transform: 'translateX(-100%)' },
                    '50%': { transform: 'translateX(100%)' }
                }
            }}/>)}
        </material_1.Box>
      </framer_motion_1.motion.div>
    </framer_motion_1.AnimatePresence>);
};
exports.default = LiveSubtitles;
