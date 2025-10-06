// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  CircularProgress,
  Badge,
  Divider
} from '@mui/material';
import {
  SmartToy,
  Psychology,
  Analytics,
  Healing,
  AutoFixHigh,
  Speed,
  Memory,
  Visibility,
  PlayArrow,
  Pause,
  RestartAlt,
  Settings,
  InfoOutlined,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Timeline,
  BugReport,
  Security,
  Refresh,
  Download,
  Upload,
  Stop,
  ExpandMore,
  Build,
  MonitorHeart,
  Storage,
  NetworkCheck,
  CloudSync,
  PowerSettingsNew,
  DeleteForever,
  Backup,
  RestoreFromTrash
} from '@mui/icons-material';

interface AgentData {
  name: string;
  status: string;
  health: string;
  cpu: string;
  memory: string;
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
  agents: AgentData[];
  onAgentSelect: (agent: AgentData) => void;
}

const AgentCard = ({ agent, onClick, isSelected }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'warning'}>({
    open: false, message: '', severity: 'success'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff44';
      case 'idle': return '#ffff44';
      case 'error': return '#ff4444';
      case 'restarting': return '#ff8800';
      case 'stopped': return '#666666';
      default: return '#00ffff';
    }
  };

  const getHealthLevel = (health: string) => {
    switch (health) {
      case 'excellent': return 100;
      case 'good': return 80;
      case 'warning': return 60;
      case 'critical': return 30;
      default: return 50;
    }
  };

  const getAgentIcon = (name: string) => {
    if (name.includes('Heal')) return <Healing />;
    if (name.includes('Improve')) return <AutoFixHigh />;
    if (name.includes('Diagnosis')) return <Analytics />;
    if (name.includes('Security')) return <Security />;
    if (name.includes('Monitor')) return <MonitorHeart />;
    return <SmartToy />;
  };

  const executeAgentAction = async (action: string) => {
    setActionLoading(action);
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 2000));

      let message = '';
      switch (action) {
        case 'restart':
          message = `Агент ${agent.name} успішно перезапущено`;
          break;
        case 'stop':
          message = `Агент ${agent.name} зупинено`;
          break;
        case 'optimize':
          message = `Агент ${agent.name} оптимізовано`;
          break;
        case 'diagnose':
          message = `Діагностика агента ${agent.name} завершена`;
          break;
        case 'backup':
          message = `Створено резервну копію агента ${agent.name}`;
          break;
        default:
          message = `Дія "${action}" виконана для агента ${agent.name}`;
      }

      setNotification({ open: true, message, severity: 'success' });
    } catch (error) {
      setNotification({
        open: true,
        message: `Помилка виконання дії "${action}" для агента ${agent.name}`,
        severity: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03, y: -8 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ duration: 0.3 }}
      >
        <Card
          onClick={onClick}
          className={`interactive-card ${isSelected ? 'cyber-border' : ''}`}
          sx={{
            p: 3,
            height: '100%',
            cursor: 'pointer',
            background: isSelected
              ? 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(0,150,255,0.1) 100%)'
              : 'rgba(0,0,0,0.8)',
            border: `2px solid ${isSelected ? '#00ffff' : 'rgba(0,255,255,0.3)'}`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            boxShadow: isHovered || isSelected
              ? `0 12px 40px ${getStatusColor(agent.status)}40`
              : '0 4px 16px rgba(0,0,0,0.3)',
            position: 'relative'
          }}
        >
          {/* Status Badge */}
          <Badge
            badgeContent={agent.errorCount || 0}
            color="error"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: getStatusColor(agent.status),
                borderRadius: '50%',
                animation: agent.status === 'active' ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
                boxShadow: `0 0 10px ${getStatusColor(agent.status)}`
              }}
            />
          </Badge>

          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                bgcolor: getStatusColor(agent.status),
                mr: 2,
                width: 56,
                height: 56,
                boxShadow: `0 0 20px ${getStatusColor(agent.status)}40`
              }}
            >
              {getAgentIcon(agent.name)}
            </Avatar>
            <Box flex={1}>
              <Typography
                variant="h6"
                className="subtitle-glow"
                sx={{ fontWeight: 'bold', mb: 0.5 }}
              >
                {agent.name}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={agent.status}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(agent.status)}20`,
                    color: getStatusColor(agent.status),
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${getStatusColor(agent.status)}`
                  }}
                />
                {agent.version && (
                  <Chip
                    label={`v${agent.version}`}
                    size="small"
                    variant="outlined"
                    sx={{ color: '#cccccc', borderColor: '#cccccc' }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Health Progress */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                Здоров'я: <span className={`status-${agent.health}`}>{agent.health}</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#cccccc' }}>
                {getHealthLevel(agent.health)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getHealthLevel(agent.health)}
              className="cyber-progress"
              sx={{
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(agent.status),
                }
              }}
            />
          </Box>

          {/* Resource Usage */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center">
                <Speed sx={{ color: '#ff6b6b', mr: 1, fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#cccccc', display: 'block' }}>
                    CPU: {agent.cpu}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseInt(agent.cpu?.replace('%', '') || '0')}
                    sx={{ width: 40, height: 3 }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center">
                <Memory sx={{ color: '#4ecdc4', mr: 1, fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#cccccc', display: 'block' }}>
                    RAM: {agent.memory}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseInt(agent.memory?.replace('%', '') || '0')}
                    sx={{ width: 40, height: 3 }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Performance Metrics */}
          {agent.metrics && (
            <Box mb={2}>
              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    Відгук
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
                    {agent.metrics.avgResponseTime}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    Успіх
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
                    {agent.metrics.successRate}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    Пропуск.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
                    {agent.metrics.throughput}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Stats and Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={1}>
              {agent.improvements && (
                <Chip
                  icon={<AutoFixHigh />}
                  label={agent.improvements}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,255,0,0.2)',
                    color: '#00ff44',
                    fontWeight: 'bold'
                  }}
                />
              )}
              {agent.fixes && (
                <Chip
                  icon={<Healing />}
                  label={agent.fixes}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,0,0.2)',
                    color: '#ffff44',
                    fontWeight: 'bold'
                  }}
                />
              )}
              {agent.tasksCompleted && (
                <Chip
                  icon={<CheckCircle />}
                  label={agent.tasksCompleted}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,255,255,0.2)',
                    color: '#00ffff',
                    fontWeight: 'bold'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" gap={1} mt={2}>
            <Tooltip title="Детальна інформація">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailsOpen(true);
                }}
                sx={{ color: '#00ffff' }}
              >
                <InfoOutlined />
              </IconButton>
            </Tooltip>

            <Tooltip title="Перезапустити агент">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  executeAgentAction('restart');
                }}
                disabled={actionLoading === 'restart'}
                sx={{ color: '#ffff44' }}
              >
                {actionLoading === 'restart' ? <CircularProgress size={16} /> : <RestartAlt />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Оптимізувати">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  executeAgentAction('optimize');
                }}
                disabled={actionLoading === 'optimize'}
                sx={{ color: '#00ff44' }}
              >
                {actionLoading === 'optimize' ? <CircularProgress size={16} /> : <Build />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Діагностика">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  executeAgentAction('diagnose');
                }}
                disabled={actionLoading === 'diagnose'}
                sx={{ color: '#ff8800' }}
              >
                {actionLoading === 'diagnose' ? <CircularProgress size={16} /> : <BugReport />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Uptime Info */}
          {agent.uptime && (
            <Box mt={1}>
              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                Uptime: {agent.uptime}
              </Typography>
              {agent.lastActivity && (
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  Остання активність: {agent.lastActivity}
                </Typography>
              )}
            </Box>
          )}
        </Card>
      </motion.div>

      {/* Detailed Info Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#00ffff', borderBottom: '1px solid rgba(0,255,255,0.3)' }}>
          <Box display="flex" alignItems="center">
            {getAgentIcon(agent.name)}
            <Typography variant="h5" sx={{ ml: 2 }}>
              {agent.name} - Детальна інформація
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ color: '#ffffff', mt: 2 }}>
          <Grid container spacing={3}>
            {/* General Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                Загальна інформація
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.5)' }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc' }}>Статус</TableCell>
                      <TableCell sx={{ color: getStatusColor(agent.status) }}>{agent.status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc' }}>Здоров'я</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{agent.health}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc' }}>Версія</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{agent.version || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc' }}>Uptime</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{agent.uptime || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc' }}>CPU</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{agent.cpu}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ccc' }}>Пам'ять</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{agent.memory}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Performance */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                Продуктивність
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                <Typography sx={{ color: '#fff' }}>Покращень: {agent.improvements || 0}</Typography>
                <Typography sx={{ color: '#fff' }}>Виправлень: {agent.fixes || 0}</Typography>
                <Typography sx={{ color: '#fff' }}>Завдань виконано: {agent.tasksCompleted || 0}</Typography>
                <Typography sx={{ color: '#fff' }}>Помилок: {agent.errorCount || 0}</Typography>
                {agent.metrics && (
                  <>
                    <Typography sx={{ color: '#fff' }}>Середній час відгуку: {agent.metrics.avgResponseTime}</Typography>
                    <Typography sx={{ color: '#fff' }}>Успішність: {agent.metrics.successRate}</Typography>
                    <Typography sx={{ color: '#fff' }}>Пропускна здатність: {agent.metrics.throughput}</Typography>
                  </>
                )}
              </Box>
            </Grid>

            {/* Capabilities */}
            {agent.capabilities && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Можливості
                </Typography>
                <List sx={{ bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                  {agent.capabilities.map((capability: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#00ff44' }} />
                      </ListItemIcon>
                      <ListItemText primary={capability} sx={{ color: '#fff' }} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}

            {/* Description */}
            {agent.description && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Опис
                </Typography>
                <Typography sx={{ color: '#fff', p: 2, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                  {agent.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid rgba(0,255,255,0.3)', pt: 2 }}>
          <Button
            onClick={() => executeAgentAction('backup')}
            disabled={actionLoading === 'backup'}
            startIcon={actionLoading === 'backup' ? <CircularProgress size={16} /> : <Backup />}
            sx={{ color: '#00ffff' }}
          >
            Резервна копія
          </Button>
          <Button
            onClick={() => executeAgentAction('stop')}
            disabled={actionLoading === 'stop'}
            startIcon={actionLoading === 'stop' ? <CircularProgress size={16} /> : <Stop />}
            sx={{ color: '#ff4444' }}
          >
            Зупинити
          </Button>
          <Button
            onClick={() => setDetailsOpen(false)}
            sx={{ color: '#ffffff' }}
          >
            Закрити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({...notification, open: false})}
      >
        <Alert
          onClose={() => setNotification({...notification, open: false})}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export const InteractiveAgentsGrid: React.FC<Props> = ({ agents, onAgentSelect }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [globalAction, setGlobalAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'warning'}>({
    open: false, message: '', severity: 'success'
  });

  // Enhanced mock data with full information
  const enhancedAgents = agents.length > 0 ? agents.map(agent => ({
    ...agent,
    version: '2.1.0',
    uptime: '72h 15m',
    lastActivity: '2 хв тому',
    tasksCompleted: Math.floor(Math.random() * 1000) + 100,
    errorCount: Math.floor(Math.random() * 5),
    description: `Агент ${agent.name} відповідає за автоматичне ${agent.name.includes('Heal') ? 'лікування та відновлення' : agent.name.includes('Improve') ? 'покращення та оптимізацію' : 'діагностику та моніторинг'} системи PREDATOR11.`,
    capabilities: [
      'Реалтайм моніторинг',
      'Автоматичне виправлення помилок',
      'Машинне навчання',
      'Predictive analytics',
      'Self-healing algorithms'
    ],
    metrics: {
      avgResponseTime: `${Math.floor(Math.random() * 100) + 10}ms`,
      successRate: `${Math.floor(Math.random() * 10) + 90}%`,
      throughput: `${Math.floor(Math.random() * 1000) + 500}/sec`
    }
  })) : [
    {
      name: 'SelfHealingAgent',
      status: 'active',
      health: 'excellent',
      cpu: '6%',
      memory: '39%',
      improvements: 12,
      fixes: 9,
      version: '2.1.0',
      uptime: '72h 15m',
      lastActivity: '2 хв тому',
      tasksCompleted: 847,
      errorCount: 0,
      description: 'Агент SelfHealingAgent відповідає за автоматичне лікування та відновлення системи PREDATOR11.',
      capabilities: [
        'Автоматичне виявлення збоїв',
        'Самовідновлення сервісів',
        'Health monitoring',
        'Emergency response',
        'Failover management'
      ],
      metrics: {
        avgResponseTime: '45ms',
        successRate: '99.2%',
        throughput: '1,247/sec'
      }
    },
    {
      name: 'AutoImproveAgent',
      status: 'active',
      health: 'good',
      cpu: '15%',
      memory: '57%',
      improvements: 8,
      fixes: 3,
      version: '2.0.5',
      uptime: '68h 42m',
      lastActivity: '1 хв тому',
      tasksCompleted: 623,
      errorCount: 2,
      description: 'Агент AutoImproveAgent відповідає за автоматичне покращення та оптимізацію системи PREDATOR11.',
      capabilities: [
        'Performance optimization',
        'Code refactoring',
        'Algorithm enhancement',
        'Resource management',
        'Continuous improvement'
      ],
      metrics: {
        avgResponseTime: '78ms',
        successRate: '95.8%',
        throughput: '892/sec'
      }
    },
    {
      name: 'SelfDiagnosisAgent',
      status: 'active',
      health: 'excellent',
      cpu: '12%',
      memory: '42%',
      improvements: 5,
      fixes: 7,
      version: '2.1.2',
      uptime: '71h 33m',
      lastActivity: '30 сек тому',
      tasksCompleted: 1156,
      errorCount: 1,
      description: 'Агент SelfDiagnosisAgent відповідає за автоматичну діагностику та моніторинг системи PREDATOR11.',
      capabilities: [
        'System diagnostics',
        'Predictive analytics',
        'Anomaly detection',
        'Performance monitoring',
        'Health assessment'
      ],
      metrics: {
        avgResponseTime: '32ms',
        successRate: '98.7%',
        throughput: '1,543/sec'
      }
    },
    {
      name: 'ContainerHealer',
      status: 'active',
      health: 'excellent',
      cpu: '8%',
      memory: '28%',
      improvements: 15,
      fixes: 22,
      version: '1.9.8',
      uptime: '156h 12m',
      lastActivity: '45 сек тому',
      tasksCompleted: 2047,
      errorCount: 0,
      description: 'Агент ContainerHealer відповідає за автоматичне лікування та управління Docker контейнерами.',
      capabilities: [
        'Container monitoring',
        'Auto-restart policies',
        'Resource scaling',
        'Health checks',
        'Disaster recovery'
      ],
      metrics: {
        avgResponseTime: '23ms',
        successRate: '99.8%',
        throughput: '2,156/sec'
      }
    },
    {
      name: 'SecurityAgent',
      status: 'active',
      health: 'good',
      cpu: '18%',
      memory: '63%',
      improvements: 6,
      fixes: 11,
      version: '3.0.1',
      uptime: '89h 27m',
      lastActivity: '15 сек тому',
      tasksCompleted: 394,
      errorCount: 3,
      description: 'Агент SecurityAgent відповідає за безпеку та захист системи PREDATOR11.',
      capabilities: [
        'Threat detection',
        'Vulnerability scanning',
        'Access control',
        'Audit logging',
        'Incident response'
      ],
      metrics: {
        avgResponseTime: '156ms',
        successRate: '94.3%',
        throughput: '456/sec'
      }
    },
    {
      name: 'MonitoringAgent',
      status: 'idle',
      health: 'warning',
      cpu: '3%',
      memory: '21%',
      improvements: 2,
      fixes: 1,
      version: '1.8.3',
      uptime: '12h 8m',
      lastActivity: '5 хв тому',
      tasksCompleted: 78,
      errorCount: 7,
      description: 'Агент MonitoringAgent відповідає за збір метрик та моніторинг системи PREDATOR11.',
      capabilities: [
        'Metrics collection',
        'Alert management',
        'Dashboard generation',
        'Trend analysis',
        'Reporting'
      ],
      metrics: {
        avgResponseTime: '234ms',
        successRate: '87.2%',
        throughput: '234/sec'
      }
    }
  ];

  const handleAgentClick = (agent: AgentData) => {
    setSelectedAgent(agent.name);
    onAgentSelect(agent);
  };

  const executeGlobalAction = async (action: string) => {
    setGlobalAction(action);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      let message = '';
      switch (action) {
        case 'restart-all':
          message = 'Всі агенти успішно перезапущені';
          break;
        case 'optimize-all':
          message = 'Виконано глобальну оптимізацію всіх агентів';
          break;
        case 'health-check':
          message = 'Перевірка здоров\'я всіх агентів завершена';
          break;
        case 'backup-all':
          message = 'Створено резервні копії всіх агентів';
          break;
        case 'update-all':
          message = 'Оновлення всіх агентів завершено';
          break;
        default:
          message = `Глобальна дія "${action}" виконана`;
      }

      setNotification({ open: true, message, severity: 'success' });
    } catch (error) {
      setNotification({
        open: true,
        message: `Помилка виконання глобальної дії "${action}"`,
        severity: 'error'
      });
    } finally {
      setGlobalAction(null);
    }
  };

  const filteredAgents = enhancedAgents.filter(agent =>
    filterStatus === 'all' || agent.status === filterStatus
  );

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'health':
        return b.health.localeCompare(a.health);
      case 'cpu':
        return parseInt(b.cpu.replace('%', '')) - parseInt(a.cpu.replace('%', ''));
      case 'memory':
        return parseInt(b.memory.replace('%', '')) - parseInt(a.memory.replace('%', ''));
      case 'fixes':
        return (b.fixes || 0) - (a.fixes || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <Box style={{ padding: 16 }}>
      {/* Header with Controls */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Typography variant="h4" className="title-cyberpunk">
          🤖 Система Агентів Самовдосконалення
        </Typography>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* Filter Controls */}
          <Box display="flex" gap={1}>
            {['all', 'active', 'idle', 'error'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterStatus(status)}
                sx={{
                  color: filterStatus === status ? '#000' : '#00ffff',
                  borderColor: '#00ffff',
                  bgcolor: filterStatus === status ? '#00ffff' : 'transparent'
                }}
              >
                {status === 'all' ? 'Всі' : status}
              </Button>
            ))}
          </Box>

          {/* Sort Controls */}
          <Box display="flex" gap={1}>
            {[
              { key: 'name', label: 'Ім\'я' },
              { key: 'health', label: 'Здоров\'я' },
              { key: 'cpu', label: 'CPU' },
              { key: 'fixes', label: 'Виправлення' }
            ].map(sort => (
              <Button
                key={sort.key}
                variant={sortBy === sort.key ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSortBy(sort.key)}
                sx={{
                  color: sortBy === sort.key ? '#000' : '#ffff44',
                  borderColor: '#ffff44',
                  bgcolor: sortBy === sort.key ? '#ffff44' : 'transparent'
                }}
              >
                {sort.label}
              </Button>
            ))}
          </Box>

          <Tooltip title={isPlaying ? 'Призупинити анімації' : 'Запустити анімації'}>
            <IconButton
              onClick={() => setIsPlaying(!isPlaying)}
              sx={{
                color: '#00ffff',
                '&:hover': {
                  bgcolor: 'rgba(0,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Global Actions Panel */}
      <Card
        className="glass-morphism"
        sx={{ p: 2, mb: 3 }}
      >
        <Typography variant="h6" className="subtitle-glow" sx={{ mb: 2 }}>
          🌐 Глобальні дії
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={globalAction === 'restart-all' ? <CircularProgress size={16} /> : <RestartAlt />}
            onClick={() => executeGlobalAction('restart-all')}
            disabled={!!globalAction}
            sx={{ bgcolor: '#ffff44', color: '#000', '&:hover': { bgcolor: '#dddd00' } }}
          >
            Перезапустити всі
          </Button>

          <Button
            variant="contained"
            startIcon={globalAction === 'optimize-all' ? <CircularProgress size={16} /> : <Build />}
            onClick={() => executeGlobalAction('optimize-all')}
            disabled={!!globalAction}
            sx={{ bgcolor: '#00ff44', color: '#000', '&:hover': { bgcolor: '#00dd00' } }}
          >
            Оптимізувати всі
          </Button>

          <Button
            variant="contained"
            startIcon={globalAction === 'health-check' ? <CircularProgress size={16} /> : <MonitorHeart />}
            onClick={() => executeGlobalAction('health-check')}
            disabled={!!globalAction}
            sx={{ bgcolor: '#00ffff', color: '#000', '&:hover': { bgcolor: '#00dddd' } }}
          >
            Перевірка здоров'я
          </Button>

          <Button
            variant="contained"
            startIcon={globalAction === 'backup-all' ? <CircularProgress size={16} /> : <Backup />}
            onClick={() => executeGlobalAction('backup-all')}
            disabled={!!globalAction}
            sx={{ bgcolor: '#ff8800', color: '#000', '&:hover': { bgcolor: '#dd6600' } }}
          >
            Резервні копії
          </Button>

          <Button
            variant="contained"
            startIcon={globalAction === 'update-all' ? <CircularProgress size={16} /> : <CloudSync />}
            onClick={() => executeGlobalAction('update-all')}
            disabled={!!globalAction}
            sx={{ bgcolor: '#8800ff', color: '#fff', '&:hover': { bgcolor: '#6600dd' } }}
          >
            Оновити всі
          </Button>
        </Box>
      </Card>

      {/* System Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
              {enhancedAgents.filter(a => a.status === 'active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Активних агентів
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
              {enhancedAgents.reduce((sum, a) => sum + (a.improvements || 0), 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Покращень за день
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#ff8800', fontWeight: 'bold' }}>
              {enhancedAgents.reduce((sum, a) => sum + (a.fixes || 0), 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Виправлень за день
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
              {Math.round(enhancedAgents.reduce((sum, a) => sum + parseInt(a.metrics?.successRate?.replace('%', '') || '0'), 0) / enhancedAgents.length)}%
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Середня успішність
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Agents Grid */}
      <Grid container spacing={3}>
        {sortedAgents.map((agent, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={agent.name}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <AgentCard
                agent={agent}
                onClick={() => handleAgentClick(agent)}
                isSelected={selectedAgent === agent.name}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Floating stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          position: 'fixed',
          bottom: 30,
          left: 30,
          zIndex: 100
        }}
      >
        <Card
          className="glass-morphism"
          sx={{ p: 2, minWidth: 250 }}
        >
          <Typography variant="subtitle2" className="subtitle-glow" sx={{ mb: 1 }}>
            📊 Реалтайм статистика
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff' }}>
            Всього агентів: {enhancedAgents.length}
          </Typography>
          <Typography variant="body2" sx={{ color: '#00ff44' }}>
            Активних: {enhancedAgents.filter(a => a.status === 'active').length}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ffff44' }}>
            Простоюють: {enhancedAgents.filter(a => a.status === 'idle').length}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ff4444' }}>
            З помилками: {enhancedAgents.filter(a => a.status === 'error').length}
          </Typography>
          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Typography variant="body2" sx={{ color: '#00ffff' }}>
            Завдань виконано: {enhancedAgents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#ff8800' }}>
            Загальних помилок: {enhancedAgents.reduce((sum, a) => sum + (a.errorCount || 0), 0)}
          </Typography>
        </Card>
      </motion.div>

      {/* Global Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({...notification, open: false})}
      >
        <Alert
          onClose={() => setNotification({...notification, open: false})}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
