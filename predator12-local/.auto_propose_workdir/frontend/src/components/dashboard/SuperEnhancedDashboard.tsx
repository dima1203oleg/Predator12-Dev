// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as AgentIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Інтерфейси даних
interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  agents: number;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'maintenance';
  performance: number;
  tasks: number;
  uptime: string;
  lastActivity: string;
}

interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'banking' | 'government' | 'market' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  actions: string[];
}

const SuperEnhancedDashboard: React.FC = () => {
  // Стани компонента
  const [activeTab, setActiveTab] = useState(0);
  const [systemRunning, setSystemRunning] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Дані системи
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'self-improvement',
      name: 'Self Improvement Agent',
      status: 'active',
      performance: 95.2,
      tasks: 156,
      uptime: '2d 14h 32m',
      lastActivity: '2 seconds ago'
    },
    {
      id: 'auto-heal',
      name: 'Auto Heal Agent',
      status: 'active',
      performance: 98.7,
      tasks: 89,
      uptime: '2d 14h 32m',
      lastActivity: '5 seconds ago'
    },
    {
      id: 'performance-optimizer',
      name: 'Performance Optimizer',
      status: 'active',
      performance: 92.4,
      tasks: 234,
      uptime: '2d 14h 32m',
      lastActivity: '1 second ago'
    },
    {
      id: 'security-monitor',
      name: 'Security Monitor',
      status: 'active',
      performance: 96.8,
      tasks: 45,
      uptime: '2d 14h 32m',
      lastActivity: '3 seconds ago'
    },
    {
      id: 'data-quality',
      name: 'Data Quality Agent',
      status: 'active',
      performance: 94.1,
      tasks: 178,
      uptime: '2d 14h 32m',
      lastActivity: '4 seconds ago'
    }
  ]);

  const [businessInsights, setBusinessInsights] = useState<BusinessInsight[]>([
    {
      id: '1',
      title: 'Підозрілі банківські транзакції',
      description: 'Виявлено 15 операцій на суму $2.3M з ознаками відмивання коштів',
      confidence: 94.5,
      category: 'banking',
      severity: 'high',
      timestamp: '10 хвилин тому',
      actions: ['Блокувати рахунки', 'Повідомити регулятора', 'Глибокий аналіз']
    },
    {
      id: '2',
      title: 'Корупційна схема в держзакупівлях',
      description: 'Детектовано завищення цін на 340% в тендерах Міністерства',
      confidence: 89.2,
      category: 'government',
      severity: 'critical',
      timestamp: '25 хвилин тому',
      actions: ['Звіт в НАБУ', 'Медіа-публікація', 'Юридична оцінка']
    },
    {
      id: '3',
      title: 'Ринкова аномалія IT-сектору',
      description: 'Прогнозується падіння акцій IT-компаній на 12-18% в Q4',
      confidence: 87.3,
      category: 'market',
      severity: 'medium',
      timestamp: '45 хвилин тому',
      actions: ['Коригувати портфель', 'Хеджувати ризики', 'Поглибити аналіз']
    }
  ]);

  // Генерація метрик системи
  useEffect(() => {
    const generateMetrics = () => {
      const now = new Date();
      const metric: SystemMetric = {
        timestamp: now.toLocaleTimeString(),
        cpu: 20 + Math.random() * 60,
        memory: 30 + Math.random() * 50,
        network: 10 + Math.random() * 40,
        agents: agents.filter(a => a.status === 'active').length
      };

      setSystemMetrics(prev => [...prev.slice(-19), metric]);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, agents]);

  // Симуляція оновлення агентів
  useEffect(() => {
    if (!autoRefresh || !systemRunning) return;

    const updateAgents = () => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        performance: Math.max(85, Math.min(100, agent.performance + (Math.random() - 0.5) * 2)),
        tasks: agent.tasks + Math.floor(Math.random() * 3),
        lastActivity: ['1 second ago', '2 seconds ago', '3 seconds ago'][Math.floor(Math.random() * 3)]
      })));
    };

    const interval = setInterval(updateAgents, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, systemRunning]);

  // Функції керування
  const handleStartStop = () => {
    if (systemRunning) {
      if (window.confirm('Ви впевнені, що хочете зупинити систему? Це призупинить роботу всіх агентів.')) {
        setSystemRunning(!systemRunning);
      }
    } else {
      setSystemRunning(!systemRunning);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId);
    setDialogOpen(true);
  };

  const handleActionClick = (action: string, insightId: string) => {
    alert(`Виконується дія: "${action}" для інсайту ${insightId}`);
  };

  // Додаткові функції для кнопок
  const handleExportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      systemMetrics,
      agents,
      businessInsights,
      systemConfig: {
        autoRefresh,
        refreshInterval,
        systemRunning
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predator-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.systemConfig) {
              setAutoRefresh(data.systemConfig.autoRefresh);
              setRefreshInterval(data.systemConfig.refreshInterval);
              alert('Конфігурацію успішно імпортовано!');
            }
          } catch (error) {
            alert('Помилка при імпорті файлу!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleRestartAgents = () => {
    if (window.confirm('Перезапустити всіх агентів? Це може вплинути на роботу системи.')) {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        performance: 100,
        lastActivity: 'just restarted',
        uptime: '0m'
      })));
      alert('Агенти успішно перезапущені!');
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Очистити всі логи? Ця дія незворотна.')) {
      setSystemMetrics([]);
      alert('Логи успішно очищені!');
    }
  };

  const handleViewAgentLogs = (agentId: string) => {
    alert(`Відкриваю логи для агента: ${agents.find(a => a.id === agentId)?.name}`);
  };

  const handleConfigureAgent = (agentId: string) => {
    alert(`Відкриваю налаштування для агента: ${agents.find(a => a.id === agentId)?.name}`);
  };

  const handleRestartAgent = (agentId: string) => {
    if (window.confirm(`Перезапустити агента ${agents.find(a => a.id === agentId)?.name}?`)) {
      setAgents(prev => prev.map(agent =>
        agent.id === agentId
          ? { ...agent, performance: 100, lastActivity: 'just restarted', uptime: '0m' }
          : agent
      ));
      alert('Агент успішно перезапущений!');
    }
  };

  // Фільтрація інсайтів
  const filteredInsights = businessInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || insight.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Кольори для статусів
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'idle': return '#FF9800';
      case 'error': return '#F44336';
      case 'maintenance': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'banking': return '🏦';
      case 'government': return '🏛️';
      case 'market': return '📈';
      case 'security': return '🛡️';
      default: return '💼';
    }
  };

  // Helper functions for rendering tabs
  const renderOverviewTab = (): JSX.Element => {
    return (
      <Grid container spacing={3}>
        {/* Статус системи */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)', color: '#fff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff66', textAlign: 'center', mb: 3 }}>
                🤖 Статус Nexus Core
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: systemRunning ? '#00ff66' : '#ff6666', mb: 1 }}>
                    {systemRunning ? '✓' : '✗'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ccc' }}>
                    Система {systemRunning ? 'Активна' : 'Зупинена'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>CPU:</Typography>
                  <Typography variant="body2" sx={{ color: '#00ff66' }}>
                    {systemMetrics.length > 0 ? `${systemMetrics[systemMetrics.length - 1]?.cpu.toFixed(1)}%` : '0%'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>Memory:</Typography>
                  <Typography variant="body2" sx={{ color: '#0099ff' }}>
                    {systemMetrics.length > 0 ? `${systemMetrics[systemMetrics.length - 1]?.memory.toFixed(1)}%` : '0%'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>Network:</Typography>
                  <Typography variant="body2" sx={{ color: '#82ca9d' }}>
                    {systemMetrics.length > 0 ? `${systemMetrics[systemMetrics.length - 1]?.network.toFixed(1)}%` : '0%'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>Agents:</Typography>
                  <Typography variant="body2" sx={{ color: '#ffaa00' }}>
                    {agents.filter(a => a.status === 'active').length}/{agents.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Системні метрики */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Системні метрики в реальному часі
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#ff7300" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#8884d8" name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#82ca9d" name="Network %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Швидкі статистики */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {agents.filter(a => a.status === 'active').length}
                  </Typography>
                  <Typography color="text.secondary">Активні агенти</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#f3e5f5' }}>
                <CardContent>
                  <Typography variant="h4" color="secondary">
                    {businessInsights.length}
                  </Typography>
                  <Typography color="text.secondary">Нові інсайти</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#e8f5e8' }}>
                <CardContent>
                  <Typography variant="h4" style={{ color: '#4CAF50' }}>
                    98.5%
                  </Typography>
                  <Typography color="text.secondary">Uptime системи</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderAgentsTab = (): JSX.Element => {
    const agentCardStyle = {
      cursor: 'pointer' as const,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'scale(1.02)' }
    };

    return (
      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} key={agent.id}>
            <Card
              sx={agentCardStyle}
              onClick={() => handleAgentClick(agent.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: getStatusColor(agent.status), mr: 2 }}>
                    <AgentIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" noWrap>
                      {agent.name}
                    </Typography>
                    <Chip
                      label={agent.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(agent.status),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Продуктивність: {agent.performance.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={agent.performance}
                  sx={{ mb: 2 }}
                />

                <Typography variant="caption" display="block">
                  📋 Завдань: {agent.tasks}
                </Typography>
                <Typography variant="caption" display="block">
                  ⏱️ Uptime: {agent.uptime}
                </Typography>
                <Typography variant="caption" display="block">
                  🔄 Остання активність: {agent.lastActivity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderInsightsTab = (): JSX.Element => {
    return (
      <Grid container spacing={3}>
        {filteredInsights.map((insight) => (
          <Grid item xs={12} key={insight.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">
                      {getCategoryIcon(insight.category)} {insight.title}
                    </Typography>
                    <Chip
                      label={insight.severity}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(insight.severity),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    />
                    <Chip
                      label={`${insight.confidence.toFixed(1)}% впевненості`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {insight.timestamp}
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph>
                  {insight.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {insight.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => handleActionClick(action, insight.id)}
                    >
                      {action}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderAnalyticsTab = (): JSX.Element => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Розподіл типів інсайтів
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Банківські', value: 35, fill: '#8884d8' },
                      { name: 'Державні', value: 25, fill: '#82ca9d' },
                      { name: 'Ринкові', value: 30, fill: '#ffc658' },
                      { name: 'Безпека', value: 10, fill: '#ff7300' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Продуктивність агентів
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="performance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderSettingsTab = (): JSX.Element => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Системні налаштування
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Автоматичні оновлення агентів"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Real-time моніторинг"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Debug режим"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Збереження логів"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Дії системи
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportData}
                >
                  Експорт даних
                </Button>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleImportConfig}
                >
                  Імпорт конфігурації
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRestartAgents}
                >
                  Перезапуск агентів
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearLogs}
                >
                  Очистити логи
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box component="div" sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Заголовок з контролами */}
      <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box component="div">
          <Typography variant="h4" fontWeight="bold" color="primary">
            🤖 Predator Analytics Nexus
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Система безперервного самовдосконалення та бізнес-аналітики
          </Typography>
        </Box>

        <Box component="div" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Авто-оновлення"
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Інтервал</InputLabel>
            <Select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              label="Інтервал"
            >
              <MenuItem value={1}>1 сек</MenuItem>
              <MenuItem value={5}>5 сек</MenuItem>
              <MenuItem value={10}>10 сек</MenuItem>
              <MenuItem value={30}>30 сек</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title={systemRunning ? 'Зупинити систему' : 'Запустити систему'}>
            <IconButton
              onClick={handleStartStop}
              color={systemRunning ? 'error' : 'success'}
              size="large"
            >
              {systemRunning ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Оновити">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Статус система */}
      <Card sx={{ mb: 3, bgcolor: systemRunning ? '#e8f5e8' : '#ffebee' }}>
        <CardContent>
          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {systemRunning ? <CheckIcon color="success" /> : <WarningIcon color="error" />}
            <Typography variant="h6">
              Статус системи: {systemRunning ? '🟢 Активна' : '🔴 Зупинена'}
            </Typography>
            <Chip
              label={`${agents.filter(a => a.status === 'active').length}/${agents.length} агентів активні`}
              color={systemRunning ? 'success' : 'default'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Вкладки */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <Tab label="📊 Огляд системи" />
          <Tab label="🤖 Агенти" />
          <Tab label="💼 Бізнес-інсайти" />
          <Tab label="📈 Аналітика" />
          <Tab label="⚙️ Налаштування" />
        </Tabs>
      </Card>

      {/* Вміст вкладок */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Вкладка "Огляд системи" */}
          {activeTab === 0 && renderOverviewTab()}

          {/* Вкладка "Агенти" */}
          {activeTab === 1 && renderAgentsTab()}

          {/* Вкладка "Бізнес-інсайти" */}
          {activeTab === 2 && renderInsightsTab()}

          {/* Вкладка "Аналітика" */}
          {activeTab === 3 && renderAnalyticsTab()}

          {/* Вкладка "Налаштування" */}
          {activeTab === 4 && renderSettingsTab()}
        </motion.div>
      </AnimatePresence>

      {/* Діалог деталей агента */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Деталі агента: {selectedAgent && agents.find(a => a.id === selectedAgent)?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Статистика продуктивності
              </Typography>
              <LinearProgress
                variant="determinate"
                value={agents.find(a => a.id === selectedAgent)?.performance || 0}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" paragraph>
                Агент працює стабільно з високою продуктивністю.
                Виконує завдання самовдосконалення системи в автоматичному режимі.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ViewIcon />}
                  onClick={() => handleViewAgentLogs(selectedAgent)}
                >
                  Переглянути логи
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleConfigureAgent(selectedAgent)}
                >
                  Налаштування
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleRestartAgent(selectedAgent)}
                >
                  Перезапустити
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperEnhancedDashboard;
