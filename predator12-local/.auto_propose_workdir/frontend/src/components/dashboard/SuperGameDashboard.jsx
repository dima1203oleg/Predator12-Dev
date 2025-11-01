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
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
// Моковані дані для демонстрації
const systemMetrics = {
    cpu: { usage: 45, cores: 16, temperature: 65 },
    memory: { used: 12.5, total: 32, usage: 39 },
    storage: { used: 750, total: 2000, usage: 37.5 },
    network: { download: 125.6, upload: 45.2, latency: 12 },
    gpu: { usage: 78, memory: 8.5, temperature: 72 }
};
const aiAgents = [
    { id: 1, name: 'Nexus Prime', status: 'active', accuracy: 98.5, tasks: 1247 },
    { id: 2, name: 'Data Analyzer', status: 'processing', accuracy: 94.2, tasks: 856 },
    { id: 3, name: 'Security Guardian', status: 'monitoring', accuracy: 99.1, tasks: 2341 },
    { id: 4, name: 'Pattern Detector', status: 'learning', accuracy: 87.8, tasks: 534 },
    { id: 5, name: 'Anomaly Hunter', status: 'active', accuracy: 96.3, tasks: 1098 }
];
const aiModels = [
    { name: 'GPT-4 Turbo', provider: 'OpenAI', status: 'online', latency: 150 },
    { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', status: 'online', latency: 180 },
    { name: 'Gemini Pro', provider: 'Google', status: 'online', latency: 120 },
    { name: 'Llama 3.1 70B', provider: 'Meta', status: 'online', latency: 220 },
    { name: 'Command R+', provider: 'Cohere', status: 'maintenance', latency: 0 }
];
function SuperGameDashboard() {
    const [realTimeData, setRealTimeData] = (0, react_1.useState)(systemMetrics);
    const [expandedPanel, setExpandedPanel] = (0, react_1.useState)('system');
    const [isRefreshing, setIsRefreshing] = (0, react_1.useState)(false);
    // Симуляція реального часу
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            setRealTimeData(prev => (Object.assign(Object.assign({}, prev), { cpu: Object.assign(Object.assign({}, prev.cpu), { usage: Math.max(20, Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10)) }), memory: Object.assign(Object.assign({}, prev.memory), { usage: Math.max(20, Math.min(85, prev.memory.usage + (Math.random() - 0.5) * 5)) }), gpu: Object.assign(Object.assign({}, prev.gpu), { usage: Math.max(30, Math.min(95, prev.gpu.usage + (Math.random() - 0.5) * 15)) }) })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'online':
                return nexusTheme_1.nexusColors.success.main;
            case 'processing':
            case 'learning':
                return nexusTheme_1.nexusColors.warning.main;
            case 'monitoring':
                return nexusTheme_1.nexusColors.info.main;
            case 'maintenance':
                return nexusTheme_1.nexusColors.error.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 2000);
    };
    const MetricCard = ({ title, value, unit, progress, icon: Icon, color, trend }) => (<framer_motion_1.motion.div whileHover={{ scale: 1.03, rotateY: 5 }} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <material_1.Card sx={{
            background: `linear-gradient(135deg, ${color}20, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${color}40`,
            borderRadius: 4,
            overflow: 'visible',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${color}, ${color}80)`,
                borderRadius: '16px 16px 0 0'
            }
        }}>
        <material_1.CardContent sx={{ p: 3 }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <framer_motion_1.motion.div animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
        }} transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
        }}>
              <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${color}, ${color}80)`,
            width: 56,
            height: 56,
            boxShadow: `0 8px 25px ${color}40`
        }}>
                <Icon sx={{ fontSize: '1.8rem' }}/>
              </material_1.Avatar>
            </framer_motion_1.motion.div>
            {trend && (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                <material_1.Chip icon={<icons_material_1.TrendingUp />} label={`${trend > 0 ? '+' : ''}${trend}%`} size="small" color={trend > 0 ? 'success' : 'error'} variant="outlined" sx={{
                background: trend > 0 ? `${nexusTheme_1.nexusColors.success.main}20` : `${nexusTheme_1.nexusColors.error.main}20`,
                fontWeight: 'bold'
            }}/>
              </framer_motion_1.motion.div>)}
          </material_1.Box>

          <framer_motion_1.motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
            <material_1.Typography variant="h3" sx={{
            color: color,
            fontWeight: 'bold',
            mb: 1,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${color}50`
        }}>
              {value}{unit}
            </material_1.Typography>
          </framer_motion_1.motion.div>

          <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2, fontWeight: 'medium' }}>
            {title}
          </material_1.Typography>

          <framer_motion_1.motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
            <material_1.LinearProgress variant="determinate" value={progress} sx={{
            height: 8,
            borderRadius: 4,
            background: `${nexusTheme_1.nexusColors.background.surface}`,
            '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${color}, ${color}60)`,
                borderRadius: 4,
                boxShadow: `0 0 10px ${color}50`
            }
        }}/>
          </framer_motion_1.motion.div>

          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mt: 1, display: 'block' }}>
            {progress.toFixed(1)}% використання
          </material_1.Typography>
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
    return (<material_1.Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto', position: 'relative' }}>
      {/* Анімований фон */}
      <material_1.Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: -1,
            background: `radial-gradient(circle at 20% 80%, ${nexusTheme_1.nexusColors.primary.main}15 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, ${nexusTheme_1.nexusColors.accent.main}15 0%, transparent 50%),
                       radial-gradient(circle at 40% 40%, ${nexusTheme_1.nexusColors.secondary.main}10 0%, transparent 50%)`
        }}/>

      {/* Заголовок з анімацією */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <material_1.Paper elevation={0} sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}30, ${nexusTheme_1.nexusColors.accent.dark}20)`,
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}40`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${nexusTheme_1.nexusColors.primary.main}20, transparent)`,
                animation: 'shimmer 3s infinite'
            }
        }}>
          <framer_motion_1.motion.div animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
        }} transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
        }}>
            <material_1.Typography variant="h2" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 2,
            fontFamily: 'Orbitron',
            fontSize: { xs: '2rem', md: '3rem' },
            textShadow: `0 0 30px ${nexusTheme_1.nexusColors.accent.main}50`
        }}>
              🎮 NEXUS CORE V3 ULTRA DASHBOARD
            </material_1.Typography>
          </framer_motion_1.motion.div>

          <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, opacity: 0.9 }}>
            Ігровий Веб-Пульт • Реальний час • {aiAgents.length} ШІ агентів • {aiModels.length} моделей
          </material_1.Typography>

          {/* Лічильники в заголовку */}
          <material_1.Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
            {[
            { label: 'Активні агенти', value: aiAgents.filter(a => a.status === 'active').length, color: nexusTheme_1.nexusColors.success.main },
            { label: 'Онлайн моделі', value: aiModels.filter(m => m.status === 'online').length, color: nexusTheme_1.nexusColors.primary.main },
            { label: 'Завдань виконано', value: '2.1K', color: nexusTheme_1.nexusColors.accent.main }
        ].map((stat, index) => (<framer_motion_1.motion.div key={stat.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
                <material_1.Chip label={`${stat.label}: ${stat.value}`} sx={{
                background: `${stat.color}20`,
                color: stat.color,
                border: `1px solid ${stat.color}50`,
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1
            }}/>
              </framer_motion_1.motion.div>))}
          </material_1.Box>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Метрики системи з анімаціями */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
        <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
          <material_1.Grid item xs={12} sm={6} lg={2.4}>
            <MetricCard title="CPU Потужність" value={realTimeData.cpu.usage.toFixed(1)} unit="%" progress={realTimeData.cpu.usage} icon={icons_material_1.Speed} color={nexusTheme_1.nexusColors.primary.main} trend={2.1}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2.4}>
            <MetricCard title="RAM Використання" value={realTimeData.memory.usage.toFixed(1)} unit="%" progress={realTimeData.memory.usage} icon={icons_material_1.Memory} color={nexusTheme_1.nexusColors.secondary.main} trend={-0.8}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2.4}>
            <MetricCard title="GPU Навантаження" value={realTimeData.gpu.usage.toFixed(1)} unit="%" progress={realTimeData.gpu.usage} icon={icons_material_1.Computer} color={nexusTheme_1.nexusColors.accent.main} trend={5.2}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2.4}>
            <MetricCard title="Дисковий простір" value={realTimeData.storage.usage.toFixed(1)} unit="%" progress={realTimeData.storage.usage} icon={icons_material_1.Storage} color={nexusTheme_1.nexusColors.warning.main} trend={0.3}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2.4}>
            <MetricCard title="Мережа" value={realTimeData.network.latency} unit="ms" progress={Math.max(0, 100 - realTimeData.network.latency)} icon={icons_material_1.NetworkCheck} color={nexusTheme_1.nexusColors.success.main} trend={-1.2}/>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>

      {/* Швидкі дії з анімованими кнопками */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}>
        <material_1.Paper elevation={0} sx={{
            p: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.secondary.dark}20, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.secondary.main}30`,
            textAlign: 'center',
            mb: 4
        }}>
          <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3, fontFamily: 'Orbitron' }}>
            🎯 Швидкі дії системи
          </material_1.Typography>

          <material_1.Grid container spacing={2} justifyContent="center">
            {[
            { label: 'Запустити всі агенти', icon: icons_material_1.Rocket, color: nexusTheme_1.nexusColors.success.main, action: 'launch' },
            { label: 'Оптимізувати систему', icon: icons_material_1.AutoAwesome, color: nexusTheme_1.nexusColors.primary.main, action: 'optimize' },
            { label: 'Експорт звітів', icon: icons_material_1.Star, color: nexusTheme_1.nexusColors.warning.main, action: 'export' },
            { label: 'Безпека-скан', icon: icons_material_1.Security, color: nexusTheme_1.nexusColors.error.main, action: 'security' }
        ].map((action, index) => (<material_1.Grid item key={action.label}>
                <framer_motion_1.motion.div whileHover={{ scale: 1.05, rotateZ: 2 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 + index * 0.1 }}>
                  <material_1.Button variant="outlined" size="large" startIcon={<action.icon />} sx={{
                borderColor: `${action.color}50`,
                color: action.color,
                background: `${action.color}10`,
                minWidth: 200,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 3,
                '&:hover': {
                    background: `${action.color}20`,
                    borderColor: action.color,
                    boxShadow: `0 8px 25px ${action.color}30`,
                    transform: 'translateY(-2px)'
                }
            }} onClick={() => console.log(`Виконую: ${action.action}`)}>
                    {action.label}
                  </material_1.Button>
                </framer_motion_1.motion.div>
              </material_1.Grid>))}
          </material_1.Grid>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* FAB для оновлення */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, duration: 0.5 }}>
        <material_1.Fab color="primary" onClick={handleRefresh} sx={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.dark}, ${nexusTheme_1.nexusColors.accent.dark})`,
                transform: 'scale(1.1) rotate(180deg)'
            },
            transition: 'all 0.3s ease',
            zIndex: 997
        }}>
          <framer_motion_1.motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}>
            <icons_material_1.Refresh />
          </framer_motion_1.motion.div>
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* CSS для анімацій */}
      <style jsx>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </material_1.Box>);
}
exports.default = SuperGameDashboard;
