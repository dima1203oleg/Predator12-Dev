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
const nexusTheme_1 = require("../../theme/nexusTheme");
const GuideContext_1 = require("./GuideContext");
const GuideSettingsManager_1 = require("./GuideSettingsManager");
const GuideFloatingButton = ({ module, position = 'bottom-right', hasNotifications = false, notificationCount = 0 }) => {
    const { showGuide, isVisible, settings } = (0, GuideContext_1.useModuleGuide)(module);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    const getPositionStyles = () => {
        const baseStyles = {
            position: 'fixed',
            zIndex: 1000
        };
        switch (position) {
            case 'bottom-right':
                return Object.assign(Object.assign({}, baseStyles), { bottom: 24, right: 24 });
            case 'bottom-left':
                return Object.assign(Object.assign({}, baseStyles), { bottom: 24, left: 24 });
            case 'top-right':
                return Object.assign(Object.assign({}, baseStyles), { top: 24, right: 24 });
            case 'top-left':
                return Object.assign(Object.assign({}, baseStyles), { top: 24, left: 24 });
            default:
                return Object.assign(Object.assign({}, baseStyles), { bottom: 24, right: 24 });
        }
    };
    return (<>
      <material_1.Box sx={getPositionStyles()}>
        <framer_motion_1.motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
          <material_1.Tooltip title={`AI Гід • ${module.toUpperCase()}`} placement="left" arrow>
            <material_1.Badge badgeContent={hasNotifications ? notificationCount : 0} color="error" invisible={!hasNotifications || notificationCount === 0}>
              <material_1.Fab onClick={showGuide} sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.sapphire})`,
            color: nexusTheme_1.nexusColors.frost,
            boxShadow: `0 8px 32px ${nexusTheme_1.nexusColors.amethyst}40`,
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
            width: 64,
            height: 64,
            '&:hover': {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`,
                boxShadow: `0 12px 40px ${nexusTheme_1.nexusColors.sapphire}60`,
                transform: 'translateY(-2px)'
            },
            '&:active': {
                transform: 'translateY(0px)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
                <icons_material_1.Psychology sx={{ fontSize: 32 }}/>
              </material_1.Fab>
            </material_1.Badge>
          </material_1.Tooltip>
        </framer_motion_1.motion.div>

        {/* Дополнительные кнопки при наведении */}
        <framer_motion_1.AnimatePresence>
          {isHovered && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} style={{
                position: 'absolute',
                bottom: 80,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
            }}>
              {/* Кнопка настроек */}
              <material_1.Tooltip title="Налаштування" placement="left">
                <material_1.Fab size="small" onClick={() => setShowSettings(true)} sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}80`,
                color: nexusTheme_1.nexusColors.frost,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.quantum}CC`,
                    transform: 'scale(1.05)'
                }
            }}>
                  <icons_material_1.Settings fontSize="small"/>
                </material_1.Fab>
              </material_1.Tooltip>

              {/* Кнопка звука */}
              <material_1.Tooltip title={settings.voice.synthesis ? "Вимкнути звук" : "Увімкнути звук"} placement="left">
                <material_1.Fab size="small" sx={{
                backgroundColor: settings.voice.synthesis ?
                    `${nexusTheme_1.nexusColors.success}40` : `${nexusTheme_1.nexusColors.shadow}40`,
                color: settings.voice.synthesis ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.shadow,
                border: `1px solid ${settings.voice.synthesis ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.shadow}`,
                '&:hover': {
                    backgroundColor: settings.voice.synthesis ?
                        `${nexusTheme_1.nexusColors.success}60` : `${nexusTheme_1.nexusColors.shadow}60`,
                    transform: 'scale(1.05)'
                }
            }}>
                  {settings.voice.synthesis ?
                <icons_material_1.VolumeUp fontSize="small"/> :
                <icons_material_1.VolumeOff fontSize="small"/>}
                </material_1.Fab>
              </material_1.Tooltip>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>

        {/* Индикатор активности */}
        {isVisible && (<material_1.Box sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: nexusTheme_1.nexusColors.success,
                boxShadow: `0 0 12px ${nexusTheme_1.nexusColors.success}`,
                animation: 'pulse 2s infinite'
            }}/>)}

        {/* Глоу эффект */}
        <material_1.Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isHovered ? 120 : 80,
            height: isHovered ? 120 : 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${nexusTheme_1.nexusColors.amethyst}20, transparent)`,
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
            zIndex: -1
        }}/>
      </material_1.Box>

      {/* Настройки гида */}
      <GuideSettingsManager_1.GuideSettingsManager open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={() => { }} // Will be handled by context
     onResetDefaults={() => { }} // Will be handled by context
    />

      {/* CSS для анимации */}
      <style>{`
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
      `}</style>
    </>);
};
exports.default = GuideFloatingButton;
