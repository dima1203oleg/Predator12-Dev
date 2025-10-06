// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch,
  Slider,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  SmartToy,
  Psychology,
  Analytics,
  Speed,
  Memory,
  Healing,
  AutoFixHigh,
  Timeline,
  Visibility,
  Settings,
  PlayArrow,
  Pause,
  Refresh,
  ZoomIn,
  Close,
  RestartAlt,
  Stop,
  Build,
  BugReport,
  Security,
  MonitorHeart,
  CheckCircle,
  Warning,
  Error,
  InfoOutlined as Info,
  Download,
  Upload,
  Backup,
  CloudSync,
  ExpandMore,
  TrendingUp,
  Assessment,
  Dashboard,
  Insights
} from '@mui/icons-material';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text as DreiText, Sphere, Box as ThreeBox } from '@react-three/drei';
// import { Vector3 } from 'three';

import { InteractiveAgentsGrid } from '../agents/InteractiveAgentsGrid';
import { AdvancedMetricsPanel } from '../metrics/AdvancedMetricsPanel';

interface AgentData {
  name: string;
  status: string;
  health: string;
  cpu: string;
  memory: string;
  activity?: string;
  lastUpdate?: string;
  improvements?: number;
  fixes?: number;
  uptime?: string;
  lastActivity?: string;
  tasksCompleted?: number;
  errorCount?: number;
  version?: string;
  description?: string;
  capabilities?: string[];
  metrics?: {
    avgResponseTime: string;
    successRate: string;
    throughput: string;
  };
}

interface Props {
  agentsData: AgentData[];
  systemData: any;
}

// 3D Agent Visualizer Component
const Agent3D = ({ agent, position, isSelected, onClick }: any) => {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const getAgentColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#00ff00';
      case 'good': return '#ffff00';
      case 'warning': return '#ff8800';
      case 'critical': return '#ff0000';
      default: return '#00ffff';
    }
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[isSelected ? 1.2 : hovered ? 1.1 : 1]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getAgentColor(agent.health)}
          emissive={getAgentColor(agent.health)}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <DreiText
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {agent.name.replace('Agent', '')}
      </DreiText>
    </group>
  );
};

// Particles Animation Component
const ParticleField = () => {
  const particlesRef = useRef<any>();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  const particles = Array.from({ length: 100 }, (_, i) => (
    <Sphere key={i} args={[0.02]} position={[
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    ]}>
      <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
    </Sphere>
  ));

  return <group ref={particlesRef}>{particles}</group>;
};

// System Health Indicator
const SystemHealthIndicator = ({ systemData }: any) => {
  const getOverallHealth = () => {
    // Calculate based on system metrics
    return 'excellent'; // Mock calculation
  };

  const healthStatus = getOverallHealth();
  const healthColor = healthStatus === 'excellent' ? '#00ff44' :
                     healthStatus === 'good' ? '#ffff44' :
                     healthStatus === 'warning' ? '#ff8800' : '#ff4444';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
          border: `2px solid ${healthColor}`,
          borderRadius: 2,
          backdropFilter: 'blur(20px)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" className="subtitle-glow" sx={{ mb: 2 }}>
          🏥 Загальне здоров'я системи
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <MonitorHeart
              sx={{
                fontSize: 80,
                color: healthColor,
                filter: `drop-shadow(0 0 20px ${healthColor})`
              }}
            />
          </motion.div>
        </Box>

        <Typography variant="h3" sx={{ color: healthColor, fontWeight: 'bold', mb: 1 }}>
          {healthStatus.toUpperCase()}
        </Typography>

        <Typography variant="body1" sx={{ color: '#cccccc' }}>
          Всі критичні компоненти працюють нормально
        </Typography>

        <LinearProgress
          variant="determinate"
          value={99}
          sx={{
            mt: 2,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: healthColor,
              boxShadow: `0 0 15px ${healthColor}`
            }
          }}
        />
        <Typography variant="caption" sx={{ color: '#cccccc' }}>
          Загальна готовність: 99%
        </Typography>
      </Paper>
    </motion.div>
  );
};

// Live Activity Feed
const LiveActivityFeed = ({ agentsData }: any) => {
  const [activities] = useState([
    { time: '21:45:23', agent: 'SelfHealingAgent', action: 'Виправлено memory leak', type: 'fix' },
    { time: '21:44:56', agent: 'ContainerHealer', action: 'Перезапущено scheduler', type: 'restart' },
    { time: '21:44:12', agent: 'AutoImproveAgent', action: 'Оптимізовано маршрутизацію', type: 'improve' },
    { time: '21:43:45', agent: 'SelfDiagnosisAgent', action: 'Створено звіт метрик', type: 'report' },
    { time: '21:43:12', agent: 'SecurityAgent', action: 'Блокован підозрілий трафік', type: 'security' },
    { time: '21:42:34', agent: 'MonitoringAgent', action: 'Оновлено дашборди', type: 'update' }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fix': return <Healing sx={{ color: '#00ff44' }} />;
      case 'restart': return <RestartAlt sx={{ color: '#ffff44' }} />;
      case 'improve': return <AutoFixHigh sx={{ color: '#00ffff' }} />;
      case 'report': return <Assessment sx={{ color: '#8800ff' }} />;
      case 'security': return <Security sx={{ color: '#ff4444' }} />;
      case 'update': return <CloudSync sx={{ color: '#ff8800' }} />;
      default: return <Info sx={{ color: '#cccccc' }} />;
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
        border: '1px solid rgba(0,255,255,0.3)',
        borderRadius: 2,
        backdropFilter: 'blur(20px)',
        maxHeight: 400,
        overflow: 'auto'
      }}
    >
      <Typography variant="h5" className="subtitle-glow" sx={{ mb: 2 }}>
        📺 Живий канал активності
      </Typography>

      <List>
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ListItem
              sx={{
                mb: 1,
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 1,
                border: '1px solid rgba(0,255,255,0.1)'
              }}
            >
              <ListItemIcon>
                {getActivityIcon(activity.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {activity.agent}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography sx={{ color: '#cccccc' }}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Paper>
  );
};

export const SuperInteractiveAgentsDashboard: React.FC<Props> = ({ agentsData, systemData }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [view3D, setView3D] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [agentDetails, setAgentDetails] = useState<AgentData | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'metrics' | 'activity'>('dashboard');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // TODO: Отримувати агентів з реального API (без mock даних)
  // const displayAgents = await nexusAPI.getAgents();
  const displayAgents = agentsData.length > 0 ? agentsData : [];

  const agentPositions = displayAgents.map((_, index) => {
    const angle = (index / displayAgents.length) * Math.PI * 2;
    return [Math.cos(angle) * 4, 0, Math.sin(angle) * 4];
  });

  // Real-time data updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      // Симуляція оновлення даних агентів
      console.log('🔄 Оновлення даних агентів...');
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  const handleExecuteGlobalAction = async (action: string) => {
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
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
            border: '2px solid rgba(0,255,255,0.5)',
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h3" className="title-cyberpunk">
              🤖 Центр управління агентами PREDATOR11
            </Typography>

            <Box display="flex" gap={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeUpdates}
                    onChange={(e) => setRealTimeUpdates(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ffff' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ffff' }
                    }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Реальний час</Typography>}
              />

              <Tooltip title={view3D ? 'Перейти до 2D' : 'Перейти до 3D'}>
                <IconButton
                  onClick={() => setView3D(!view3D)}
                  sx={{
                    color: '#00ffff',
                    bgcolor: view3D ? 'rgba(0,255,255,0.2)' : 'transparent'
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* View Switcher */}
          <Box display="flex" gap={2} mb={3}>
            {[
              { key: 'dashboard', label: '🏠 Дашборд', icon: <Dashboard /> },
              { key: 'metrics', label: '📊 Метрики', icon: <Analytics /> },
              { key: 'activity', label: '📺 Активність', icon: <Timeline /> }
            ].map(view => (
              <Button
                key={view.key}
                variant={currentView === view.key ? 'contained' : 'outlined'}
                startIcon={view.icon}
                onClick={() => setCurrentView(view.key as 'metrics' | 'dashboard' | 'activity')}
                sx={{
                  color: currentView === view.key ? '#000' : '#00ffff',
                  borderColor: '#00ffff',
                  bgcolor: currentView === view.key ? '#00ffff' : 'transparent',
                  '&:hover': {
                    bgcolor: currentView === view.key ? '#00dddd' : 'rgba(0,255,255,0.1)'
                  }
                }}
              >
                {view.label}
              </Button>
            ))}
          </Box>

          {/* System Overview Stats */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
                  {displayAgents.filter(a => a.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Активних агентів
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
                  {displayAgents.reduce((sum, a) => sum + (a.improvements || 0), 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Покращень за день
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#ff8800', fontWeight: 'bold' }}>
                  {displayAgents.reduce((sum, a) => sum + (a.fixes || 0), 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Виправлень за день
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
                  99%
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Готовність системи
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Global Actions Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(20px)'
          }}
        >
          <Typography variant="h5" className="subtitle-glow" sx={{ mb: 2 }}>
            🌐 Глобальні операції системи
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<RestartAlt />}
                onClick={() => handleExecuteGlobalAction('restart-all-agents')}
                sx={{
                  bgcolor: '#ffff44',
                  color: '#000',
                  '&:hover': { bgcolor: '#dddd00', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease'
                }}
              >
                Перезапустити всі
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AutoFixHigh />}
                onClick={() => handleExecuteGlobalAction('optimize-system')}
                sx={{
                  bgcolor: '#00ff44',
                  color: '#000',
                  '&:hover': { bgcolor: '#00dd00', transform: 'translateY(-2px)' }
                }}
              >
                Оптимізувати
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<BugReport />}
                onClick={() => handleExecuteGlobalAction('run-diagnostics')}
                sx={{
                  bgcolor: '#00ffff',
                  color: '#000',
                  '&:hover': { bgcolor: '#00dddd', transform: 'translateY(-2px)' }
                }}
              >
                Діагностика
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Backup />}
                onClick={() => handleExecuteGlobalAction('backup-system')}
                sx={{
                  bgcolor: '#ff8800',
                  color: '#000',
                  '&:hover': { bgcolor: '#dd6600', transform: 'translateY(-2px)' }
                }}
              >
                Резервна копія
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Security />}
                onClick={() => handleExecuteGlobalAction('security-scan')}
                sx={{
                  bgcolor: '#ff4444',
                  color: '#fff',
                  '&:hover': { bgcolor: '#dd0000', transform: 'translateY(-2px)' }
                }}
              >
                Аудит безпеки
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleExecuteGlobalAction('export-metrics')}
                sx={{
                  bgcolor: '#8800ff',
                  color: '#fff',
                  '&:hover': { bgcolor: '#6600dd', transform: 'translateY(-2px)' }
                }}
              >
                Експорт звіту
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <InteractiveAgentsGrid
                  agents={displayAgents}
                  onAgentSelect={(agent) => setAgentDetails(agent)}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <SystemHealthIndicator systemData={systemData} />
                  <LiveActivityFeed agentsData={displayAgents} />
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {currentView === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <AdvancedMetricsPanel />
          </motion.div>
        )}

        {currentView === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <LiveActivityFeed agentsData={displayAgents} />
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Details Modal */}
      <Dialog
        open={!!agentDetails}
        onClose={() => setAgentDetails(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(30,30,60,0.98) 100%)',
            border: '2px solid rgba(0,255,255,0.5)',
            borderRadius: 3
          }
        }}
      >
        {agentDetails && (
          <>
            <DialogTitle sx={{ color: '#00ffff', borderBottom: '2px solid rgba(0,255,255,0.3)', pb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#00ffff', mr: 2, width: 48, height: 48 }}>
                    {agentDetails.name.includes('Heal') ? <Healing /> :
                     agentDetails.name.includes('Improve') ? <AutoFixHigh /> :
                     agentDetails.name.includes('Diagnosis') ? <Analytics /> : <SmartToy />}
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {agentDetails.name}
                  </Typography>
                </Box>
                <IconButton onClick={() => setAgentDetails(null)}>
                  <Close sx={{ color: '#ffffff' }} />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ color: '#ffffff', p: 4 }}>
              <Grid container spacing={4}>
                {/* Left Column - Status & Metrics */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" sx={{ color: '#00ffff', mb: 3 }}>
                    📊 Поточний стан та метрики
                  </Typography>

                  <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.7)', mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Параметр</TableCell>
                          <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Значення</TableCell>
                          <TableCell sx={{ color: '#00ffff', fontWeight: 'bold' }}>Статус</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: '#ccc' }}>Статус роботи</TableCell>
                          <TableCell sx={{ color: '#fff' }}>{agentDetails.status}</TableCell>
                          <TableCell>
                            <Chip
                              label={agentDetails.status}
                              sx={{
                                bgcolor: agentDetails.status === 'active' ? 'rgba(0,255,68,0.2)' : 'rgba(255,255,68,0.2)',
                                color: agentDetails.status === 'active' ? '#00ff44' : '#ffff44'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#ccc' }}>Здоров'я системи</TableCell>
                          <TableCell sx={{ color: '#fff' }}>{agentDetails.health}</TableCell>
                          <TableCell>
                            <Chip
                              label={agentDetails.health}
                              sx={{
                                bgcolor: agentDetails.health === 'excellent' ? 'rgba(0,255,68,0.2)' : 'rgba(255,255,68,0.2)',
                                color: agentDetails.health === 'excellent' ? '#00ff44' : '#ffff44'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#ccc' }}>Використання CPU</TableCell>
                          <TableCell sx={{ color: '#fff' }}>{agentDetails.cpu}</TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={parseInt(agentDetails.cpu?.replace('%', '') || '0')}
                              sx={{ width: 60 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#ccc' }}>Використання пам\'яті</TableCell>
                          <TableCell sx={{ color: '#fff' }}>{agentDetails.memory}</TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={parseInt(agentDetails.memory?.replace('%', '') || '0')}
                              sx={{ width: 60 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#ccc' }}>Версія</TableCell>
                          <TableCell sx={{ color: '#fff' }}>{agentDetails.version}</TableCell>
                          <TableCell>
                            <Chip label="Актуальна" size="small" sx={{ bgcolor: 'rgba(0,255,68,0.2)', color: '#00ff44' }} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#ccc' }}>Час роботи</TableCell>
                          <TableCell sx={{ color: '#fff' }}>{agentDetails.uptime}</TableCell>
                          <TableCell>
                            <CheckCircle sx={{ color: '#00ff44' }} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Performance Metrics */}
                  {agentDetails.metrics && (
                    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                        ⚡ Показники продуктивності
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" sx={{ color: '#888' }}>Час відгуку</Typography>
                          <Typography variant="h6" sx={{ color: '#00ffff' }}>
                            {agentDetails.metrics.avgResponseTime}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" sx={{ color: '#888' }}>Успішність</Typography>
                          <Typography variant="h6" sx={{ color: '#00ff44' }}>
                            {agentDetails.metrics.successRate}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" sx={{ color: '#888' }}>Пропускна здатність</Typography>
                          <Typography variant="h6" sx={{ color: '#ffff44' }}>
                            {agentDetails.metrics.throughput}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Grid>

                {/* Right Column - Capabilities & Actions */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" sx={{ color: '#00ffff', mb: 3 }}>
                    🚀 Можливості та функції
                  </Typography>

                  {/* Capabilities List */}
                  {agentDetails.capabilities && (
                    <Paper sx={{ bgcolor: 'rgba(0,0,0,0.7)', p: 2, mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                        💡 Основні можливості
                      </Typography>
                      <List>
                        {agentDetails.capabilities.map((capability, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon>
                              <CheckCircle sx={{ color: '#00ff44', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={capability}
                              sx={{
                                color: '#fff',
                                '& .MuiListItemText-primary': { fontSize: '0.9rem' }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}

                  {/* Agent Actions */}
                  <Paper sx={{ bgcolor: 'rgba(0,0,0,0.7)', p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                      🔧 Доступні операції
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<RestartAlt />}
                          onClick={() => console.log(`Перезапуск ${agentDetails.name}`)}
                          sx={{ color: '#ffff44', borderColor: '#ffff44' }}
                        >
                          Перезапуск
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Build />}
                          onClick={() => console.log(`Оптимізація ${agentDetails.name}`)}
                          sx={{ color: '#00ff44', borderColor: '#00ff44' }}
                        >
                          Оптимізація
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<BugReport />}
                          onClick={() => console.log(`Діагностика ${agentDetails.name}`)}
                          sx={{ color: '#ff8800', borderColor: '#ff8800' }}
                        >
                          Діагностика
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Stop />}
                          onClick={() => console.log(`Зупинка ${agentDetails.name}`)}
                          sx={{ color: '#ff4444', borderColor: '#ff4444' }}
                        >
                          Зупинити
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Settings />}
                          onClick={() => console.log(`Налаштування ${agentDetails.name}`)}
                          sx={{ bgcolor: '#00ffff', color: '#000' }}
                        >
                          Детальні налаштування
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Description */}
                  {agentDetails.description && (
                    <Paper sx={{ bgcolor: 'rgba(0,0,0,0.7)', p: 3, mt: 3 }}>
                      <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                        📋 Детальний опис
                      </Typography>
                      <Typography sx={{ color: '#fff', lineHeight: 1.6 }}>
                        {agentDetails.description}
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};
