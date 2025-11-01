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
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const EnhancedContextualChat_1 = __importDefault(require("./EnhancedContextualChat"));
const Enhanced3DGuide = ({ isVisible = true, onToggleVisibility, systemHealth = 'optimal', agentsCount = 26, activeAgentsCount = 22 }) => {
    const [showChat, setShowChat] = (0, react_1.useState)(false);
    const [currentMessage, setCurrentMessage] = (0, react_1.useState)('🚀 Система Predator готова до роботи');
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    // Автоматичні повідомлення на основі стану системи
    (0, react_1.useEffect)(() => {
        const messages = {
            optimal: [
                '🤖 Всі системи функціонують оптимально',
                `📊 ${activeAgentsCount}/${agentsCount} агентів активні`,
                '⚡ AI моделі готові до роботи',
                '🛡️ Безпека системи забезпечена',
                '🔄 Самовдосконалення активне'
            ],
            degraded: [
                '⚠️ Виявлено деградацію продуктивності',
                '🔧 Рекомендую перевірити агентів',
                '📈 Автовиправлення в процесі',
                '🔍 Діагностика проблемних модулів'
            ],
            critical: [
                '🔴 Критичні проблеми в системі!',
                '🚨 Потрібна негайна увага',
                '⛑️ Активую аварійні протоколи',
                '🔧 Запускаю процедури відновлення'
            ]
        };
        const systemMessages = messages[systemHealth];
        let currentIndex = 0;
        const interval = setInterval(() => {
            setCurrentMessage(systemMessages[currentIndex]);
            currentIndex = (currentIndex + 1) % systemMessages.length;
        }, 8000);
        return () => clearInterval(interval);
    }, [systemHealth, agentsCount, activeAgentsCount]);
    const handleSpeak = () => {
        setIsSpeaking(true);
        // Тут можна додати TTS функціональність
        setTimeout(() => setIsSpeaking(false), 3000);
    };
    const getHealthColor = () => {
        switch (systemHealth) {
            case 'optimal': return nexusTheme_1.nexusColors.emerald;
            case 'degraded': return nexusTheme_1.nexusColors.warning;
            case 'critical': return nexusTheme_1.nexusColors.crimson;
            default: return nexusTheme_1.nexusColors.shadow;
        }
    };
    const getHealthEmoji = () => {
        switch (systemHealth) {
            case 'optimal': return '🟢';
            case 'degraded': return '🟡';
            case 'critical': return '🔴';
            default: return '⚪';
        }
    };
    if (!isVisible) {
        return (<material_1.Box sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000
            }}>
        <material_1.Tooltip title="Показати 3D гіда">
          <material_1.IconButton onClick={onToggleVisibility} sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.sapphire})`,
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.amethyst})`,
                }
            }}>
            <icons_material_1.Psychology />
          </material_1.IconButton>
        </material_1.Tooltip>
      </material_1.Box>);
    }
    return (<>
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
        }}>
        <material_1.Paper elevation={8} sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
            border: `2px solid ${getHealthColor()}60`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            minWidth: 320,
            maxWidth: 400
        }}>
          {/* Header */}
          <material_1.Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.shadow}40`,
            background: `linear-gradient(90deg, ${getHealthColor()}20, transparent)`
        }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <material_1.Typography sx={{ fontSize: '1.2rem' }}>
                {getHealthEmoji()}
              </material_1.Typography>
              <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontWeight: 600,
            fontSize: '1rem'
        }}>
                Nexus Guide AI
              </material_1.Typography>
            </material_1.Box>

            <material_1.Box sx={{ display: 'flex', gap: 0.5 }}>
              <material_1.Tooltip title="Озвучити">
                <material_1.IconButton size="small" onClick={handleSpeak}>
                  <icons_material_1.VolumeUp sx={{ color: nexusTheme_1.nexusColors.frost, fontSize: '1.1rem' }}/>
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title="Чат">
                <material_1.IconButton size="small" onClick={() => setShowChat(!showChat)}>
                  <icons_material_1.Help sx={{ color: nexusTheme_1.nexusColors.frost, fontSize: '1.1rem' }}/>
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title="Налаштування">
                <material_1.IconButton size="small">
                  <icons_material_1.Settings sx={{ color: nexusTheme_1.nexusColors.frost, fontSize: '1.1rem' }}/>
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title="Приховати гіда">
                <material_1.IconButton size="small" onClick={onToggleVisibility}>
                  <icons_material_1.VisibilityOff sx={{ color: nexusTheme_1.nexusColors.frost, fontSize: '1.1rem' }}/>
                </material_1.IconButton>
              </material_1.Tooltip>
            </material_1.Box>
          </material_1.Box>

          {/* 3D Face */}
          <material_1.Box sx={{ height: 180, position: 'relative', overflow: 'hidden' }}>
            <div /> /* HolographicAIFace
      isActive={true}
      isSpeaking={isSpeaking}
      emotion={systemHealth === 'optimal' ? 'neutral' :
              systemHealth === 'degraded' ? 'processing' : 'alert'}
      message={currentMessage}
      size="medium"
      enableGlitch={systemHealth !== 'optimal'}
      enableAura={true}
      enableDataStream={true}
      systemHealth={systemHealth === 'degraded' ? 'warning' : systemHealth}
      cpuLoad={0.35}
      memoryUsage={0.28}
    />
  </Box>

  {/* Status Info *//* HolographicAIFace
              isActive={true}
              isSpeaking={isSpeaking}
              emotion={systemHealth === 'optimal' ? 'neutral' :
            systemHealth === 'degraded' ? 'processing' : 'alert'}
              message={currentMessage}
              size="medium"
              enableGlitch={systemHealth !== 'optimal'}
              enableAura={true}
              enableDataStream={true}
              systemHealth={systemHealth === 'degraded' ? 'warning' : systemHealth}
              cpuLoad={0.35}
              memoryUsage={0.28}
            />
          </material_1.Box>

          {/* Status Info */}
          <material_1.Box sx={{ p: 2 }}>
            <material_1.Typography variant="body2" sx={{
            color: nexusTheme_1.nexusColors.frost,
            mb: 1.5,
            textAlign: 'center',
            lineHeight: 1.4,
            fontSize: '0.9rem'
        }}>
              {currentMessage}
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <material_1.Chip size="small" label={`${activeAgentsCount}/${agentsCount} агентів`} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
            color: nexusTheme_1.nexusColors.quantum,
            fontSize: '0.7rem'
        }}/>
              <material_1.Chip size="small" label="48 AI моделей" sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`,
            color: nexusTheme_1.nexusColors.sapphire,
            fontSize: '0.7rem'
        }}/>
              <material_1.Chip size="small" label={systemHealth} sx={{
            backgroundColor: `${getHealthColor()}20`,
            color: getHealthColor(),
            fontSize: '0.7rem'
        }}/>
            </material_1.Box>
          </material_1.Box>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Chat Panel */}
      <framer_motion_1.AnimatePresence>
        {showChat && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{
                position: 'fixed',
                bottom: 20,
                right: 360,
                zIndex: 999,
            }}>
            <EnhancedContextualChat_1.default open={showChat} onClose={() => setShowChat(false)} currentModule="system_status" systemHealth={systemHealth === 'degraded' ? 'degraded' : systemHealth} onNavigate={(module) => {
                console.log('Navigate to:', module);
                setCurrentMessage(`🎯 Переходжу до модуля: ${module}`);
            }} onHealthCheck={() => {
                console.log('Health check requested');
                setCurrentMessage('🔍 Запускаю перевірку здоров\'я системи...');
            }}/>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </>);
};
exports.default = Enhanced3DGuide;
