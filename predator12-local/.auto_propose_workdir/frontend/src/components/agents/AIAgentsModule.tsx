// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Divider,
  Alert,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Smart as SmartIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

// Моковані дані ШІ агентів
const aiAgentsData = [
  {
    id: 'nexus-prime',
    name: 'Nexus Prime',
    type: 'Головний Координатор',
    status: 'active',
    performance: 98.5,
    tasks: 1247,
    accuracy: 99.2,
    uptime: '24/7',
    memory: 2.4,
    cpu: 35,
    capabilities: ['reasoning', 'planning', 'coordination', 'analysis'],
    lastUpdate: '2 хв тому',
    description: 'Головний ШІ агент системи, координує роботу всіх інших агентів'
  },
  {
    id: 'data-analyzer',
    name: 'Data Analyzer',
    type: 'Аналітик Даних',
    status: 'processing',
    performance: 94.2,
    tasks: 856,
    accuracy: 96.8,
    uptime: '23.5h',
    memory: 1.8,
    cpu: 67,
    capabilities: ['data-mining', 'pattern-recognition', 'statistics', 'visualization'],
    lastUpdate: '30 сек тому',
    description: 'Спеціалізований агент для аналізу великих даних та виявлення закономірностей'
  },
  {
    id: 'security-guardian',
    name: 'Security Guardian',
    type: 'Охоронець Безпеки',
    status: 'monitoring',
    performance: 99.1,
    tasks: 2341,
    accuracy: 99.8,
    uptime: '24/7',
    memory: 1.2,
    cpu: 28,
    capabilities: ['threat-detection', 'anomaly-detection', 'encryption', 'access-control'],
    lastUpdate: '1 хв тому',
    description: 'Забезпечує безпеку системи та моніторить загрози в реальному часі'
  },
  {
    id: 'pattern-detector',
    name: 'Pattern Detector',
    type: 'Детектор Шаблонів',
    status: 'learning',
    performance: 87.8,
    tasks: 534,
    accuracy: 91.5,
    uptime: '18.2h',
    memory: 3.1,
    cpu: 89,
    capabilities: ['machine-learning', 'pattern-matching', 'prediction', 'optimization'],
    lastUpdate: '5 хв тому',
    description: 'Навчається на нових даних та виявляє складні шаблони поведінки'
  },
  {
    id: 'anomaly-hunter',
    name: 'Anomaly Hunter',
    type: 'Мисливець Аномалій',
    status: 'active',
    performance: 96.3,
    tasks: 1098,
    accuracy: 94.7,
    uptime: '22.1h',
    memory: 2.7,
    cpu: 45,
    capabilities: ['outlier-detection', 'statistical-analysis', 'alert-system', 'investigation'],
    lastUpdate: '15 сек тому',
    description: 'Виявляє аномалії та незвичайну активність в системі'
  },
  {
    id: 'nlp-processor',
    name: 'NLP Processor',
    type: 'Обробник Мови',
    status: 'active',
    performance: 92.4,
    tasks: 1876,
    accuracy: 88.9,
    uptime: '21.7h',
    memory: 4.2,
    cpu: 72,
    capabilities: ['text-analysis', 'sentiment-analysis', 'translation', 'summarization'],
    lastUpdate: '45 сек тому',
    description: 'Обробляє та аналізує природну мову, виконує переклади та резюмування'
  },
  {
    id: 'vision-analyst',
    name: 'Vision Analyst',
    type: 'Аналітик Зображень',
    status: 'processing',
    performance: 89.7,
    tasks: 632,
    accuracy: 93.3,
    uptime: '19.3h',
    memory: 5.8,
    cpu: 91,
    capabilities: ['image-recognition', 'object-detection', 'video-analysis', 'feature-extraction'],
    lastUpdate: '2 хв тому',
    description: 'Аналізує зображення та відео, розпізнає об\'єкти та виділяє ключові ознаки'
  },
  {
    id: 'quantum-optimizer',
    name: 'Quantum Optimizer',
    type: 'Квантовий Оптимізатор',
    status: 'standby',
    performance: 76.2,
    tasks: 89,
    accuracy: 85.1,
    uptime: '6.8h',
    memory: 1.9,
    cpu: 12,
    capabilities: ['quantum-computing', 'optimization', 'simulation', 'cryptography'],
    lastUpdate: '12 хв тому',
    description: 'Експериментальний агент з квантовими алгоритмами оптимізації'
  }
];

function AIAgentsModule() {
  const [agents, setAgents] = useState(aiAgentsData);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('performance');

  // Фільтрація та сортування агентів
  const filteredAgents = agents
    .filter(agent => filterStatus === 'all' || agent.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performance - a.performance;
        case 'tasks':
          return b.tasks - a.tasks;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return nexusColors.success.main;
      case 'processing':
        return nexusColors.warning.main;
      case 'learning':
        return nexusColors.info.main;
      case 'monitoring':
        return nexusColors.primary.main;
      case 'standby':
        return nexusColors.text.secondary;
      default:
        return nexusColors.error.main;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'processing':
        return <PlayIcon />;
      case 'learning':
        return <SmartIcon />;
      case 'monitoring':
        return <VisibilityIcon />;
      case 'standby':
        return <PauseIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const handleAgentAction = (agentId, action) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        switch (action) {
          case 'start':
            return { ...agent, status: 'active' };
          case 'pause':
            return { ...agent, status: 'standby' };
          case 'stop':
            return { ...agent, status: 'offline' };
          case 'restart':
            return { ...agent, status: 'processing', lastUpdate: 'щойно' };
          default:
            return agent;
        }
      }
      return agent;
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      {/* Заголовок модуля */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${nexusColors.accent.dark}20, ${nexusColors.background.paper}90)`,
            border: `1px solid ${nexusColors.accent.main}30`,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2,
              fontFamily: 'Orbitron'
            }}
          >
            🤖 ШІ АГЕНТИ ПАНЕЛЬ
          </Typography>
          <Typography variant="h6" sx={{ color: nexusColors.text.secondary }}>
            Управління та моніторинг {agents.length} штучних інтелектів системи
          </Typography>
        </Paper>
      </motion.div>

      {/* Панель фільтрів та контролів */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card sx={{ mb: 3, background: `${nexusColors.background.paper}95`, border: `1px solid ${nexusColors.primary.main}30` }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: nexusColors.text.secondary }}>Статус</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Статус"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ color: nexusColors.text.primary }}
                  >
                    <MenuItem value="all">Всі агенти</MenuItem>
                    <MenuItem value="active">Активні</MenuItem>
                    <MenuItem value="processing">Обробка</MenuItem>
                    <MenuItem value="learning">Навчання</MenuItem>
                    <MenuItem value="monitoring">Моніторинг</MenuItem>
                    <MenuItem value="standby">Очікування</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: nexusColors.text.secondary }}>Сортування</InputLabel>
                  <Select
                    value={sortBy}
                    label="Сортування"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ color: nexusColors.text.primary }}
                  >
                    <MenuItem value="performance">За продуктивністю</MenuItem>
                    <MenuItem value="tasks">За завданнями</MenuItem>
                    <MenuItem value="accuracy">За точністю</MenuItem>
                    <MenuItem value="name">За назвою</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  fullWidth
                  sx={{
                    borderColor: nexusColors.primary.main,
                    color: nexusColors.primary.main,
                    '&:hover': {
                      background: `${nexusColors.primary.main}20`,
                      borderColor: nexusColors.primary.light
                    }
                  }}
                  onClick={() => window.location.reload()}
                >
                  Оновити
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{
                    background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${nexusColors.accent.dark}, ${nexusColors.primary.dark})`
                    }
                  }}
                  onClick={() => setConfigDialog(true)}
                >
                  Новий агент
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Сітка агентів */}
      <Grid container spacing={3}>
        {filteredAgents.map((agent, index) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={agent.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${getStatusColor(agent.status)}10, ${nexusColors.background.paper}90)`,
                  border: `1px solid ${getStatusColor(agent.status)}30`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${getStatusColor(agent.status)}60`,
                    boxShadow: `0 8px 25px ${getStatusColor(agent.status)}20`
                  }
                }}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Заголовок агента */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: `linear-gradient(45deg, ${getStatusColor(agent.status)}, ${getStatusColor(agent.status)}80)`,
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      <PsychologyIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                        {agent.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        {agent.type}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(agent.status)}
                      label={agent.status}
                      size="small"
                      sx={{
                        background: `${getStatusColor(agent.status)}20`,
                        color: getStatusColor(agent.status),
                        border: `1px solid ${getStatusColor(agent.status)}50`
                      }}
                    />
                  </Box>

                  {/* Метрики */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Продуктивність
                      </Typography>
                      <Typography variant="h6" sx={{ color: getStatusColor(agent.status), fontWeight: 'bold' }}>
                        {agent.performance}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Завдання
                      </Typography>
                      <Typography variant="h6" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                        {agent.tasks}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Прогрес бар */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                      Точність: {agent.accuracy}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={agent.accuracy}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        background: `${nexusColors.background.surface}`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${getStatusColor(agent.status)}, ${getStatusColor(agent.status)}60)`,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  {/* Ресурси */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MemoryIcon sx={{ fontSize: 16, color: nexusColors.text.secondary, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          {agent.memory}GB
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpeedIcon sx={{ fontSize: 16, color: nexusColors.text.secondary, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          {agent.cpu}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Дії */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Tooltip title="Запустити">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentAction(agent.id, 'start');
                        }}
                        sx={{ color: nexusColors.success.main }}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Пауза">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentAction(agent.id, 'pause');
                        }}
                        sx={{ color: nexusColors.warning.main }}
                      >
                        <PauseIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Перезапустити">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentAction(agent.id, 'restart');
                        }}
                        sx={{ color: nexusColors.primary.main }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Налаштування">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(agent);
                          setConfigDialog(true);
                        }}
                        sx={{ color: nexusColors.text.secondary }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Останнє оновлення */}
                  <Typography variant="caption" sx={{ color: nexusColors.text.secondary, display: 'block', mt: 1 }}>
                    Оновлено: {agent.lastUpdate}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Діалог деталей агента */}
      <Dialog
        open={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}95, ${nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }
        }}
      >
        {selectedAgent && (
          <>
            <DialogTitle sx={{ color: nexusColors.text.primary, borderBottom: `1px solid ${nexusColors.accent.main}30` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    background: `linear-gradient(45deg, ${getStatusColor(selectedAgent.status)}, ${getStatusColor(selectedAgent.status)}80)`,
                    width: 56,
                    height: 56
                  }}
                >
                  <PsychologyIcon sx={{ fontSize: '2rem' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedAgent.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.secondary }}>
                    {selectedAgent.type}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(selectedAgent.status)}
                  label={selectedAgent.status.toUpperCase()}
                  sx={{
                    background: `${getStatusColor(selectedAgent.status)}20`,
                    color: getStatusColor(selectedAgent.status),
                    border: `1px solid ${getStatusColor(selectedAgent.status)}50`,
                    ml: 'auto'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                {selectedAgent.description}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    📊 Метрики
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Продуктивність"
                        secondary={`${selectedAgent.performance}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: getStatusColor(selectedAgent.status), fontWeight: 'bold' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Виконано завдань"
                        secondary={selectedAgent.tasks}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Точність"
                        secondary={`${selectedAgent.accuracy}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Час роботи"
                        secondary={selectedAgent.uptime}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    🛠️ Можливості
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedAgent.capabilities.map((capability) => (
                      <Chip
                        key={capability}
                        label={capability}
                        size="small"
                        sx={{
                          background: `${nexusColors.accent.main}20`,
                          color: nexusColors.accent.main,
                          border: `1px solid ${nexusColors.accent.main}40`
                        }}
                      />
                    ))}
                  </Box>

                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mt: 3, mb: 2 }}>
                    💾 Ресурси
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <MemoryIcon sx={{ color: nexusColors.primary.main }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Пам'ять"
                        secondary={`${selectedAgent.memory} GB`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon sx={{ color: nexusColors.warning.main }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="CPU"
                        secondary={`${selectedAgent.cpu}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Діалог конфігурації */}
      <Dialog
        open={configDialog}
        onClose={() => setConfigDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}95, ${nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: nexusColors.text.primary }}>
          ⚙️ Налаштування агента
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Функція налаштування агентів буде реалізована у наступній версії
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AIAgentsModule;
