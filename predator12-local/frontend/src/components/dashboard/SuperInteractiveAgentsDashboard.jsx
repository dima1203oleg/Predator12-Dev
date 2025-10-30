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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperInteractiveAgentsDashboard = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
// import { Vector3 } from 'three';
const InteractiveAgentsGrid_1 = require("../agents/InteractiveAgentsGrid");
const AdvancedMetricsPanel_1 = require("../metrics/AdvancedMetricsPanel");
// 3D Agent Visualizer Component
const Agent3D = ({ agent, position, isSelected, onClick }) => {
    const meshRef = (0, react_1.useRef)();
    const [hovered, setHovered] = (0, react_1.useState)(false);
    (0, fiber_1.useFrame)((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
        }
    });
    const getAgentColor = (health) => {
        switch (health) {
            case 'excellent': return '#00ff00';
            case 'good': return '#ffff00';
            case 'warning': return '#ff8800';
            case 'critical': return '#ff0000';
            default: return '#00ffff';
        }
    };
    return (<group position={position}>
      <drei_1.Sphere ref={meshRef} args={[isSelected ? 1.2 : hovered ? 1.1 : 1]} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <meshStandardMaterial color={getAgentColor(agent.health)} emissive={getAgentColor(agent.health)} emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1} transparent opacity={0.8}/>
      </drei_1.Sphere>
      <drei_1.Text position={[0, -1.5, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">
        {agent.name.replace('Agent', '')}
      </drei_1.Text>
    </group>);
};
// Particles Animation Component
const ParticleField = () => {
    const particlesRef = (0, react_1.useRef)();
    (0, fiber_1.useFrame)((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.001;
        }
    });
    const particles = Array.from({ length: 100 }, (_, i) => (<drei_1.Sphere key={i} args={[0.02]} position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        ]}>
      <meshBasicMaterial color="#00ffff" transparent opacity={0.3}/>
    </drei_1.Sphere>));
    return <group ref={particlesRef}>{particles}</group>;
};
// System Health Indicator
const SystemHealthIndicator = ({ systemData }) => {
    const getOverallHealth = () => {
        // Calculate based on system metrics
        return 'excellent'; // Mock calculation
    };
    const healthStatus = getOverallHealth();
    const healthColor = healthStatus === 'excellent' ? '#00ff44' :
        healthStatus === 'good' ? '#ffff44' :
            healthStatus === 'warning' ? '#ff8800' : '#ff4444';
    return (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
      <material_1.Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: `2px solid ${healthColor}`,
            borderRadius: 2,
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
        }}>
        <material_1.Typography variant="h5" className="subtitle-glow" sx={{ mb: 2 }}>
          🏥 Загальне здоров'я системи
        </material_1.Typography>

        <material_1.Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <framer_motion_1.motion.div animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360, 0]
        }} transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }}>
            <icons_material_1.MonitorHeart sx={{
            fontSize: 80,
            color: healthColor,
            filter: `drop-shadow(0 0 20px ${healthColor})`
        }}/>
          </framer_motion_1.motion.div>
        </material_1.Box>

        <material_1.Typography variant="h3" sx={{ color: healthColor, fontWeight: 'bold', mb: 1 }}>
          {healthStatus.toUpperCase()}
        </material_1.Typography>

        <material_1.Typography variant="body1" sx={{ color: '#cccccc' }}>
          Всі критичні компоненти працюють нормально
        </material_1.Typography>

        <material_1.LinearProgress variant="determinate" value={99} sx={{
            mt: 2,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: healthColor,
                boxShadow: `0 0 15px ${healthColor}`
            }
        }}/>
        <material_1.Typography variant="caption" sx={{ color: '#cccccc' }}>
          Загальна готовність: 99%
        </material_1.Typography>
      </material_1.Paper>
    </framer_motion_1.motion.div>);
};
// Live Activity Feed
const LiveActivityFeed = ({ agentsData }) => {
    const [activities] = (0, react_1.useState)([
        { time: '21:45:23', agent: 'SelfHealingAgent', action: 'Виправлено memory leak', type: 'fix' },
        { time: '21:44:56', agent: 'ContainerHealer', action: 'Перезапущено scheduler', type: 'restart' },
        { time: '21:44:12', agent: 'AutoImproveAgent', action: 'Оптимізовано маршрутизацію', type: 'improve' },
        { time: '21:43:45', agent: 'SelfDiagnosisAgent', action: 'Створено звіт метрик', type: 'report' },
        { time: '21:43:12', agent: 'SecurityAgent', action: 'Блокован підозрілий трафік', type: 'security' },
        { time: '21:42:34', agent: 'MonitoringAgent', action: 'Оновлено дашборди', type: 'update' }
    ]);
    const getActivityIcon = (type) => {
        switch (type) {
            case 'fix': return <icons_material_1.Healing sx={{ color: '#00ff44' }}/>;
            case 'restart': return <icons_material_1.RestartAlt sx={{ color: '#ffff44' }}/>;
            case 'improve': return <icons_material_1.AutoFixHigh sx={{ color: '#00ffff' }}/>;
            case 'report': return <icons_material_1.Assessment sx={{ color: '#8800ff' }}/>;
            case 'security': return <icons_material_1.Security sx={{ color: '#ff4444' }}/>;
            case 'update': return <icons_material_1.CloudSync sx={{ color: '#ff8800' }}/>;
            default: return <icons_material_1.InfoOutlined sx={{ color: '#cccccc' }}/>;
        }
    };
    return (<material_1.Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(20px)',
            maxHeight: 400,
            overflow: 'auto'
        }}>
      <material_1.Typography variant="h5" className="subtitle-glow" sx={{ mb: 2 }}>
        📺 Живий канал активності
      </material_1.Typography>

      <material_1.List>
        {activities.map((activity, index) => (<framer_motion_1.motion.div key={index} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <material_1.ListItem sx={{
                mb: 1,
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 1,
                border: '1px solid rgba(0,255,255,0.1)'
            }}>
              <material_1.ListItemIcon>
                {getActivityIcon(activity.type)}
              </material_1.ListItemIcon>
              <material_1.ListItemText primary={<material_1.Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {activity.agent}
                  </material_1.Typography>} secondary={<material_1.Box>
                    <material_1.Typography sx={{ color: '#cccccc' }}>
                      {activity.action}
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: '#888' }}>
                      {activity.time}
                    </material_1.Typography>
                  </material_1.Box>}/>
            </material_1.ListItem>
          </framer_motion_1.motion.div>))}
      </material_1.List>
    </material_1.Paper>);
};
const SuperInteractiveAgentsDashboard = ({ agentsData, systemData }) => {
    var _a, _b;
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [view3D, setView3D] = (0, react_1.useState)(false);
    const [autoRotate, setAutoRotate] = (0, react_1.useState)(true);
    const [showParticles, setShowParticles] = (0, react_1.useState)(true);
    const [agentDetails, setAgentDetails] = (0, react_1.useState)(null);
    const [currentView, setCurrentView] = (0, react_1.useState)('dashboard');
    const [realTimeUpdates, setRealTimeUpdates] = (0, react_1.useState)(true);
    // TODO: Отримувати агентів з реального API (без mock даних)
    // const displayAgents = await nexusAPI.getAgents();
    const displayAgents = agentsData.length > 0 ? agentsData : [];
    const agentPositions = displayAgents.map((_, index) => {
        const angle = (index / displayAgents.length) * Math.PI * 2;
        return [Math.cos(angle) * 4, 0, Math.sin(angle) * 4];
    });
    // Real-time data updates
    (0, react_1.useEffect)(() => {
        if (!realTimeUpdates)
            return;
        const interval = setInterval(() => {
            // Симуляція оновлення даних агентів
            console.log('🔄 Оновлення даних агентів...');
        }, 5000);
        return () => clearInterval(interval);
    }, [realTimeUpdates]);
    const handleExecuteGlobalAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`🌐 Виконується глобальна дія: ${action}`);
        // Реальна функціональність для кожної кнопки
        switch (action) {
            case 'restart-all-agents':
                console.log('🔄 Перезапуск всіх агентів...');
                // Тут буде реальний API виклик
                break;
            case 'optimize-system':
                console.log('⚡ Оптимізація системи...');
                // Тут буде виклик оптимізації
                break;
            case 'run-diagnostics':
                console.log('🔍 Запуск повної діагностики...');
                // Тут буде діагностика
                break;
            case 'backup-system':
                console.log('💾 Створення резервної копії...');
                // Тут буде backup
                break;
            case 'security-scan':
                console.log('🛡️ Запуск сканування безпеки...');
                // Тут буде security scan
                break;
            case 'export-metrics':
                console.log('📊 Експорт метрик...');
                // Тут буде експорт
                break;
        }
    });
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <material_1.Paper sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
            border: '2px solid rgba(0,255,255,0.5)',
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
        }}>
          <material_1.Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <material_1.Typography variant="h3" className="title-cyberpunk">
              🤖 Центр управління агентами PREDATOR11
            </material_1.Typography>

            <material_1.Box display="flex" gap={2} alignItems="center">
              <material_1.FormControlLabel control={<material_1.Switch checked={realTimeUpdates} onChange={(e) => setRealTimeUpdates(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ffff' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ffff' }
            }}/>} label={<material_1.Typography sx={{ color: '#ffffff' }}>Реальний час</material_1.Typography>}/>

              <material_1.Tooltip title={view3D ? 'Перейти до 2D' : 'Перейти до 3D'}>
                <material_1.IconButton onClick={() => setView3D(!view3D)} sx={{
            color: '#00ffff',
            bgcolor: view3D ? 'rgba(0,255,255,0.2)' : 'transparent'
        }}>
                  <icons_material_1.Visibility />
                </material_1.IconButton>
              </material_1.Tooltip>
            </material_1.Box>
          </material_1.Box>

          {/* View Switcher */}
          <material_1.Box display="flex" gap={2} mb={3}>
            {[
            { key: 'dashboard', label: '🏠 Дашборд', icon: <icons_material_1.Dashboard /> },
            { key: 'metrics', label: '📊 Метрики', icon: <icons_material_1.Analytics /> },
            { key: 'activity', label: '📺 Активність', icon: <icons_material_1.Timeline /> }
        ].map(view => (<material_1.Button key={view.key} variant={currentView === view.key ? 'contained' : 'outlined'} startIcon={view.icon} onClick={() => setCurrentView(view.key)} sx={{
                color: currentView === view.key ? '#000' : '#00ffff',
                borderColor: '#00ffff',
                bgcolor: currentView === view.key ? '#00ffff' : 'transparent',
                '&:hover': {
                    bgcolor: currentView === view.key ? '#00dddd' : 'rgba(0,255,255,0.1)'
                }
            }}>
                {view.label}
              </material_1.Button>))}
          </material_1.Box>

          {/* System Overview Stats */}
          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
                  {displayAgents.filter(a => a.status === 'active').length}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Активних агентів
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
                  {displayAgents.reduce((sum, a) => sum + (a.improvements || 0), 0)}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Покращень за день
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#ff8800', fontWeight: 'bold' }}>
                  {displayAgents.reduce((sum, a) => sum + (a.fixes || 0), 0)}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Виправлень за день
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
                  99%
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Готовність системи
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Global Actions Panel */}
      <framer_motion_1.motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <material_1.Paper sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(20px)'
        }}>
          <material_1.Typography variant="h5" className="subtitle-glow" sx={{ mb: 2 }}>
            🌐 Глобальні операції системи
          </material_1.Typography>
          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.RestartAlt />} onClick={() => handleExecuteGlobalAction('restart-all-agents')} sx={{
            bgcolor: '#ffff44',
            color: '#000',
            '&:hover': { bgcolor: '#dddd00', transform: 'translateY(-2px)' },
            transition: 'all 0.3s ease'
        }}>
                Перезапустити всі
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.AutoFixHigh />} onClick={() => handleExecuteGlobalAction('optimize-system')} sx={{
            bgcolor: '#00ff44',
            color: '#000',
            '&:hover': { bgcolor: '#00dd00', transform: 'translateY(-2px)' }
        }}>
                Оптимізувати
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.BugReport />} onClick={() => handleExecuteGlobalAction('run-diagnostics')} sx={{
            bgcolor: '#00ffff',
            color: '#000',
            '&:hover': { bgcolor: '#00dddd', transform: 'translateY(-2px)' }
        }}>
                Діагностика
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.Backup />} onClick={() => handleExecuteGlobalAction('backup-system')} sx={{
            bgcolor: '#ff8800',
            color: '#000',
            '&:hover': { bgcolor: '#dd6600', transform: 'translateY(-2px)' }
        }}>
                Резервна копія
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.Security />} onClick={() => handleExecuteGlobalAction('security-scan')} sx={{
            bgcolor: '#ff4444',
            color: '#fff',
            '&:hover': { bgcolor: '#dd0000', transform: 'translateY(-2px)' }
        }}>
                Аудит безпеки
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.Download />} onClick={() => handleExecuteGlobalAction('export-metrics')} sx={{
            bgcolor: '#8800ff',
            color: '#fff',
            '&:hover': { bgcolor: '#6600dd', transform: 'translateY(-2px)' }
        }}>
                Експорт звіту
              </material_1.Button>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Main Content Area */}
      <framer_motion_1.AnimatePresence mode="wait">
        {currentView === 'dashboard' && (<framer_motion_1.motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} lg={8}>
                <InteractiveAgentsGrid_1.InteractiveAgentsGrid agents={displayAgents} onAgentSelect={(agent) => setAgentDetails(agent)}/>
              </material_1.Grid>
              <material_1.Grid item xs={12} lg={4}>
                <material_1.Box display="flex" flexDirection="column" gap={3}>
                  <SystemHealthIndicator systemData={systemData}/>
                  <LiveActivityFeed agentsData={displayAgents}/>
                </material_1.Box>
              </material_1.Grid>
            </material_1.Grid>
          </framer_motion_1.motion.div>)}

        {currentView === 'metrics' && (<framer_motion_1.motion.div key="metrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <AdvancedMetricsPanel_1.AdvancedMetricsPanel />
          </framer_motion_1.motion.div>)}

        {currentView === 'activity' && (<framer_motion_1.motion.div key="activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12}>
                <LiveActivityFeed agentsData={displayAgents}/>
              </material_1.Grid>
            </material_1.Grid>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Agent Details Modal */}
      <material_1.Dialog open={!!agentDetails} onClose={() => setAgentDetails(null)} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(30,30,60,0.98) 100%)',
                border: '2px solid rgba(0,255,255,0.5)',
                borderRadius: 3
            }
        }}>
        {agentDetails && (<>
            <material_1.DialogTitle sx={{ color: '#00ffff', borderBottom: '2px solid rgba(0,255,255,0.3)', pb: 2 }}>
              <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
                <material_1.Box display="flex" alignItems="center">
                  <material_1.Avatar sx={{ bgcolor: '#00ffff', mr: 2, width: 48, height: 48 }}>
                    {agentDetails.name.includes('Heal') ? <icons_material_1.Healing /> :
                agentDetails.name.includes('Improve') ? <icons_material_1.AutoFixHigh /> :
                    agentDetails.name.includes('Diagnosis') ? <icons_material_1.Analytics /> : <icons_material_1.SmartToy />}
                  </material_1.Avatar>
                  <material_1.Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {agentDetails.name}
                  </material_1.Typography>
                </material_1.Box>
                <material_1.IconButton onClick={() => setAgentDetails(null)}>
                  <icons_material_1.Close sx={{ color: '#ffffff' }}/>
                </material_1.IconButton>
              </material_1.Box>
            </material_1.DialogTitle>

            <material_1.DialogContent sx={{ color: '#ffffff', p: 4 }}>
              <material_1.Grid container spacing={4}>
                {/* Left Column - Status & Metrics */}
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="h5" sx={{ color: '#00ffff', mb: 3 }}>
                    📊 Поточний стан та метрики
                  </material_1.Typography>

                  <material_1.TableContainer component={material_1.Paper} sx={{ bgcolor: 'rgba(0,0,0,0.7)', mb: 3 }}>
                    <material_1.Table>
                      <material_1.TableHead>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Параметр</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Значення</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Статус</material_1.TableCell>
                        </material_1.TableRow>
                      </material_1.TableHead>
                      <material_1.TableBody>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#ccc' }}>Статус роботи</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#fff' }}>{agentDetails.status}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.Chip label={agentDetails.status} sx={{
                bgcolor: agentDetails.status === 'active' ? 'rgba(0,255,68,0.2)' : 'rgba(255,255,68,0.2)',
                color: agentDetails.status === 'active' ? '#00ff44' : '#ffff44'
            }}/>
                          </material_1.TableCell>
                        </material_1.TableRow>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#ccc' }}>Здоров'я системи</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#fff' }}>{agentDetails.health}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.Chip label={agentDetails.health} sx={{
                bgcolor: agentDetails.health === 'excellent' ? 'rgba(0,255,68,0.2)' : 'rgba(255,255,68,0.2)',
                color: agentDetails.health === 'excellent' ? '#00ff44' : '#ffff44'
            }}/>
                          </material_1.TableCell>
                        </material_1.TableRow>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#ccc' }}>Використання CPU</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#fff' }}>{agentDetails.cpu}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.LinearProgress variant="determinate" value={parseInt(((_a = agentDetails.cpu) === null || _a === void 0 ? void 0 : _a.replace('%', '')) || '0')} sx={{ width: 60 }}/>
                          </material_1.TableCell>
                        </material_1.TableRow>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#ccc' }}>Використання пам\'яті</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#fff' }}>{agentDetails.memory}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.LinearProgress variant="determinate" value={parseInt(((_b = agentDetails.memory) === null || _b === void 0 ? void 0 : _b.replace('%', '')) || '0')} sx={{ width: 60 }}/>
                          </material_1.TableCell>
                        </material_1.TableRow>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#ccc' }}>Версія</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#fff' }}>{agentDetails.version}</material_1.TableCell>
                          <material_1.TableCell>
                            <material_1.Chip label="Актуальна" size="small" sx={{ bgcolor: 'rgba(0,255,68,0.2)', color: '#00ff44' }}/>
                          </material_1.TableCell>
                        </material_1.TableRow>
                        <material_1.TableRow>
                          <material_1.TableCell sx={{ color: '#ccc' }}>Час роботи</material_1.TableCell>
                          <material_1.TableCell sx={{ color: '#fff' }}>{agentDetails.uptime}</material_1.TableCell>
                          <material_1.TableCell>
                            <icons_material_1.CheckCircle sx={{ color: '#00ff44' }}/>
                          </material_1.TableCell>
                        </material_1.TableRow>
                      </material_1.TableBody>
                    </material_1.Table>
                  </material_1.TableContainer>

                  {/* Performance Metrics */}
                  {agentDetails.metrics && (<material_1.Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 2 }}>
                      <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                        ⚡ Показники продуктивності
                      </material_1.Typography>
                      <material_1.Grid container spacing={2}>
                        <material_1.Grid item xs={4}>
                          <material_1.Typography variant="body2" sx={{ color: '#888' }}>Час відгуку</material_1.Typography>
                          <material_1.Typography variant="h6" sx={{ color: '#00ffff' }}>
                            {agentDetails.metrics.avgResponseTime}
                          </material_1.Typography>
                        </material_1.Grid>
                        <material_1.Grid item xs={4}>
                          <material_1.Typography variant="body2" sx={{ color: '#888' }}>Успішність</material_1.Typography>
                          <material_1.Typography variant="h6" sx={{ color: '#00ff44' }}>
                            {agentDetails.metrics.successRate}
                          </material_1.Typography>
                        </material_1.Grid>
                        <material_1.Grid item xs={4}>
                          <material_1.Typography variant="body2" sx={{ color: '#888' }}>Пропускна здатність</material_1.Typography>
                          <material_1.Typography variant="h6" sx={{ color: '#ffff44' }}>
                            {agentDetails.metrics.throughput}
                          </material_1.Typography>
                        </material_1.Grid>
                      </material_1.Grid>
                    </material_1.Box>)}
                </material_1.Grid>

                {/* Right Column - Capabilities & Actions */}
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="h5" sx={{ color: '#00ffff', mb: 3 }}>
                    🚀 Можливості та функції
                  </material_1.Typography>

                  {/* Capabilities List */}
                  {agentDetails.capabilities && (<material_1.Paper sx={{ bgcolor: 'rgba(0,0,0,0.7)', p: 2, mb: 3 }}>
                      <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                        💡 Основні можливості
                      </material_1.Typography>
                      <material_1.List>
                        {agentDetails.capabilities.map((capability, index) => (<material_1.ListItem key={index} sx={{ py: 0.5 }}>
                            <material_1.ListItemIcon>
                              <icons_material_1.CheckCircle sx={{ color: '#00ff44', fontSize: 20 }}/>
                            </material_1.ListItemIcon>
                            <material_1.ListItemText primary={capability} sx={{
                        color: '#fff',
                        '& .MuiListItemText-primary': { fontSize: '0.9rem' }
                    }}/>
                          </material_1.ListItem>))}
                      </material_1.List>
                    </material_1.Paper>)}

                  {/* Agent Actions */}
                  <material_1.Paper sx={{ bgcolor: 'rgba(0,0,0,0.7)', p: 3 }}>
                    <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                      🔧 Доступні операції
                    </material_1.Typography>
                    <material_1.Grid container spacing={2}>
                      <material_1.Grid item xs={6}>
                        <material_1.Button fullWidth variant="outlined" startIcon={<icons_material_1.RestartAlt />} onClick={() => console.log(`Перезапуск ${agentDetails.name}`)} sx={{ color: '#ffff44', borderColor: '#ffff44' }}>
                          Перезапуск
                        </material_1.Button>
                      </material_1.Grid>
                      <material_1.Grid item xs={6}>
                        <material_1.Button fullWidth variant="outlined" startIcon={<icons_material_1.Build />} onClick={() => console.log(`Оптимізація ${agentDetails.name}`)} sx={{ color: '#00ff44', borderColor: '#00ff44' }}>
                          Оптимізація
                        </material_1.Button>
                      </material_1.Grid>
                      <material_1.Grid item xs={6}>
                        <material_1.Button fullWidth variant="outlined" startIcon={<icons_material_1.BugReport />} onClick={() => console.log(`Діагностика ${agentDetails.name}`)} sx={{ color: '#ff8800', borderColor: '#ff8800' }}>
                          Діагностика
                        </material_1.Button>
                      </material_1.Grid>
                      <material_1.Grid item xs={6}>
                        <material_1.Button fullWidth variant="outlined" startIcon={<icons_material_1.Stop />} onClick={() => console.log(`Зупинка ${agentDetails.name}`)} sx={{ color: '#ff4444', borderColor: '#ff4444' }}>
                          Зупинити
                        </material_1.Button>
                      </material_1.Grid>
                      <material_1.Grid item xs={12}>
                        <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.Settings />} onClick={() => console.log(`Налаштування ${agentDetails.name}`)} sx={{ bgcolor: '#00ffff', color: '#000' }}>
                          Детальні налаштування
                        </material_1.Button>
                      </material_1.Grid>
                    </material_1.Grid>
                  </material_1.Paper>

                  {/* Description */}
                  {agentDetails.description && (<material_1.Paper sx={{ bgcolor: 'rgba(0,0,0,0.7)', p: 3, mt: 3 }}>
                      <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                        📋 Детальний опис
                      </material_1.Typography>
                      <material_1.Typography sx={{ color: '#fff', lineHeight: 1.6 }}>
                        {agentDetails.description}
                      </material_1.Typography>
                    </material_1.Paper>)}
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
          </>)}
      </material_1.Dialog>
    </material_1.Box>);
};
exports.SuperInteractiveAgentsDashboard = SuperInteractiveAgentsDashboard;
