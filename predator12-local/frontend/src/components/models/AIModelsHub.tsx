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
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Alert,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Cloud as CloudIcon,
  Computer as ComputerIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

// Моковані дані моделей ШІ
const aiModelsData = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    category: 'Language Model',
    status: 'online',
    performance: 96.8,
    latency: 150,
    requests: 15420,
    tokens: 2450000,
    accuracy: 94.5,
    cost: 0.03,
    parameters: '175B',
    version: '2024-04-09',
    capabilities: ['text-generation', 'reasoning', 'coding', 'analysis'],
    maxTokens: 128000,
    temperature: 0.7,
    description: 'Найновіша модель GPT-4 з покращеною швидкістю та ефективністю'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'Language Model',
    status: 'online',
    performance: 95.2,
    latency: 180,
    requests: 8930,
    tokens: 1850000,
    accuracy: 96.1,
    cost: 0.015,
    parameters: '200B',
    version: '2024-06-20',
    capabilities: ['text-generation', 'analysis', 'reasoning', 'safety'],
    maxTokens: 200000,
    temperature: 0.6,
    description: 'Найпотужніша модель Claude з розширеними можливостями аналізу'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    category: 'Multimodal',
    status: 'online',
    performance: 92.4,
    latency: 120,
    requests: 12680,
    tokens: 3200000,
    accuracy: 91.8,
    cost: 0.0005,
    parameters: '137B',
    version: '1.5',
    capabilities: ['text-generation', 'vision', 'multimodal', 'coding'],
    maxTokens: 1000000,
    temperature: 0.9,
    description: 'Мультимодальна модель з підтримкою тексту та зображень'
  },
  {
    id: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    category: 'Open Source',
    status: 'online',
    performance: 89.6,
    latency: 220,
    requests: 5640,
    tokens: 980000,
    accuracy: 88.3,
    cost: 0.0008,
    parameters: '70B',
    version: '3.1',
    capabilities: ['text-generation', 'reasoning', 'multilingual', 'coding'],
    maxTokens: 128000,
    temperature: 0.8,
    description: 'Відкрита модель Meta з відмінними можливостями генерації'
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    category: 'Command Model',
    status: 'maintenance',
    performance: 0,
    latency: 0,
    requests: 0,
    tokens: 0,
    accuracy: 85.7,
    cost: 0.003,
    parameters: '104B',
    version: '2024-04',
    capabilities: ['rag', 'search', 'generation', 'summarization'],
    maxTokens: 128000,
    temperature: 0.3,
    description: 'Спеціалізована модель для RAG та пошукових завдань'
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    category: 'Language Model',
    status: 'online',
    performance: 87.3,
    latency: 190,
    requests: 3210,
    tokens: 750000,
    accuracy: 89.2,
    cost: 0.008,
    parameters: '175B',
    version: '2024-02-26',
    capabilities: ['text-generation', 'reasoning', 'multilingual', 'function-calling'],
    maxTokens: 32000,
    temperature: 0.7,
    description: 'Європейська модель з сильними можливостями багатомовності'
  }
];

function AIModelsHub() {
  const [models, setModels] = useState(aiModelsData);
  const [selectedModel, setSelectedModel] = useState(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('performance');

  // Фільтрація та сортування моделей
  const filteredModels = models
    .filter(model => filterStatus === 'all' || model.status === filterStatus)
    .filter(model => filterCategory === 'all' || model.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performance - a.performance;
        case 'latency':
          return a.latency - b.latency;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'requests':
          return b.requests - a.requests;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return nexusColors.success.main;
      case 'maintenance':
        return nexusColors.warning.main;
      case 'offline':
        return nexusColors.error.main;
      case 'loading':
        return nexusColors.info.main;
      default:
        return nexusColors.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon />;
      case 'maintenance':
        return <WarningIcon />;
      case 'offline':
        return <ErrorIcon />;
      case 'loading':
        return <RefreshIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Language Model':
        return <PsychologyIcon />;
      case 'Multimodal':
        return <MemoryIcon />;
      case 'Open Source':
        return <CloudIcon />;
      case 'Command Model':
        return <ComputerIcon />;
      default:
        return <MemoryIcon />;
    }
  };

  const handleModelAction = (modelId, action) => {
    setModels(prev => prev.map(model => {
      if (model.id === modelId) {
        switch (action) {
          case 'start':
            return { ...model, status: 'online' };
          case 'stop':
            return { ...model, status: 'offline' };
          case 'restart':
            return { ...model, status: 'loading' };
          default:
            return model;
        }
      }
      return model;
    }));
  };

  // Статистика загалом
  const totalModels = models.length;
  const onlineModels = models.filter(m => m.status === 'online').length;
  const totalRequests = models.reduce((sum, m) => sum + m.requests, 0);
  const avgLatency = models.filter(m => m.status === 'online').reduce((sum, m) => sum + m.latency, 0) / onlineModels || 0;

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
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}20, ${nexusColors.background.paper}90)`,
            border: `1px solid ${nexusColors.primary.main}30`,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2,
              fontFamily: 'Orbitron'
            }}
          >
            🧠 ХАБ ШІ МОДЕЛЕЙ
          </Typography>
          <Typography variant="h6" sx={{ color: nexusColors.text.secondary }}>
            Управління та моніторинг {totalModels} моделей штучного інтелекту
          </Typography>
        </Paper>
      </motion.div>

      {/* Панель статистики */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `${nexusColors.success.main}10`, border: `1px solid ${nexusColors.success.main}30` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: nexusColors.success.main, fontWeight: 'bold' }}>
                  {onlineModels}/{totalModels}
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Моделей онлайн
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `${nexusColors.primary.main}10`, border: `1px solid ${nexusColors.primary.main}30` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                  {totalRequests.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Загальних запитів
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `${nexusColors.warning.main}10`, border: `1px solid ${nexusColors.warning.main}30` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: nexusColors.warning.main, fontWeight: 'bold' }}>
                  {avgLatency.toFixed(0)}ms
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Середня затримка
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `${nexusColors.accent.main}10`, border: `1px solid ${nexusColors.accent.main}30` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: nexusColors.accent.main, fontWeight: 'bold' }}>
                  96.2%
                </Typography>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Uptime
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Панель фільтрів */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card sx={{ mb: 3, background: `${nexusColors.background.paper}95`, border: `1px solid ${nexusColors.primary.main}30` }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: nexusColors.text.secondary }}>Статус</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Статус"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ color: nexusColors.text.primary }}
                  >
                    <MenuItem value="all">Всі моделі</MenuItem>
                    <MenuItem value="online">Онлайн</MenuItem>
                    <MenuItem value="maintenance">Обслуговування</MenuItem>
                    <MenuItem value="offline">Офлайн</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: nexusColors.text.secondary }}>Категорія</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Категорія"
                    onChange={(e) => setFilterCategory(e.target.value)}
                    sx={{ color: nexusColors.text.primary }}
                  >
                    <MenuItem value="all">Всі категорії</MenuItem>
                    <MenuItem value="Language Model">Мовні моделі</MenuItem>
                    <MenuItem value="Multimodal">Мультимодальні</MenuItem>
                    <MenuItem value="Open Source">Відкритий код</MenuItem>
                    <MenuItem value="Command Model">Командні</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: nexusColors.text.secondary }}>Сортування</InputLabel>
                  <Select
                    value={sortBy}
                    label="Сортування"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ color: nexusColors.text.primary }}
                  >
                    <MenuItem value="performance">За продуктивністю</MenuItem>
                    <MenuItem value="latency">За швидкістю</MenuItem>
                    <MenuItem value="accuracy">За точністю</MenuItem>
                    <MenuItem value="requests">За запитами</MenuItem>
                    <MenuItem value="name">За назвою</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
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
              <Grid item xs={12} sm={6} md={2.4}>
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
                  Додати модель
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Сітка моделей */}
      <Grid container spacing={3}>
        {filteredModels.map((model, index) => (
          <Grid item xs={12} lg={6} xl={4} key={model.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${getStatusColor(model.status)}10, ${nexusColors.background.paper}90)`,
                  border: `1px solid ${getStatusColor(model.status)}30`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${getStatusColor(model.status)}60`,
                    boxShadow: `0 8px 25px ${getStatusColor(model.status)}20`
                  }
                }}
                onClick={() => setSelectedModel(model)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Заголовок моделі */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: `linear-gradient(45deg, ${getStatusColor(model.status)}, ${getStatusColor(model.status)}80)`,
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {getCategoryIcon(model.category)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                        {model.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        {model.provider} • {model.category}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(model.status)}
                      label={model.status}
                      size="small"
                      sx={{
                        background: `${getStatusColor(model.status)}20`,
                        color: getStatusColor(model.status),
                        border: `1px solid ${getStatusColor(model.status)}50`
                      }}
                    />
                  </Box>

                  {/* Метрики */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Продуктивність
                      </Typography>
                      <Typography variant="h6" sx={{ color: getStatusColor(model.status), fontWeight: 'bold' }}>
                        {model.performance}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Затримка
                      </Typography>
                      <Typography variant="h6" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                        {model.latency}ms
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Прогрес бар продуктивності */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                      Точність: {model.accuracy}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={model.accuracy}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        background: `${nexusColors.background.surface}`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${getStatusColor(model.status)}, ${getStatusColor(model.status)}60)`,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  {/* Статистика */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Запитів: {model.requests.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                        Параметрів: {model.parameters}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Можливості */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                      Можливості:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {model.capabilities.slice(0, 2).map((capability) => (
                        <Chip
                          key={capability}
                          label={capability}
                          size="small"
                          sx={{
                            background: `${nexusColors.accent.main}15`,
                            color: nexusColors.accent.main,
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                      {model.capabilities.length > 2 && (
                        <Chip
                          label={`+${model.capabilities.length - 2}`}
                          size="small"
                          sx={{
                            background: `${nexusColors.text.secondary}15`,
                            color: nexusColors.text.secondary,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Дії */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Tooltip title="Запустити">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelAction(model.id, 'start');
                        }}
                        sx={{ color: nexusColors.success.main }}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Зупинити">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelAction(model.id, 'stop');
                        }}
                        sx={{ color: nexusColors.error.main }}
                      >
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Перезапустити">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelAction(model.id, 'restart');
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
                          setSelectedModel(model);
                          setConfigDialog(true);
                        }}
                        sx={{ color: nexusColors.text.secondary }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Вартість */}
                  <Typography variant="caption" sx={{ color: nexusColors.text.secondary, display: 'block', mt: 1 }}>
                    Вартість: ${model.cost}/1K токенів
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Діалог деталей моделі */}
      <Dialog
        open={selectedModel !== null && !configDialog}
        onClose={() => setSelectedModel(null)}
        maxWidth="lg"
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
        {selectedModel && (
          <>
            <DialogTitle sx={{ color: nexusColors.text.primary, borderBottom: `1px solid ${nexusColors.accent.main}30` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    background: `linear-gradient(45deg, ${getStatusColor(selectedModel.status)}, ${getStatusColor(selectedModel.status)}80)`,
                    width: 56,
                    height: 56
                  }}
                >
                  {getCategoryIcon(selectedModel.category)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedModel.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.secondary }}>
                    {selectedModel.provider} • {selectedModel.category}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(selectedModel.status)}
                  label={selectedModel.status.toUpperCase()}
                  sx={{
                    background: `${getStatusColor(selectedModel.status)}20`,
                    color: getStatusColor(selectedModel.status),
                    border: `1px solid ${getStatusColor(selectedModel.status)}50`,
                    ml: 'auto'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                {selectedModel.description}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    📊 Метрики продуктивності
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Продуктивність"
                        secondary={`${selectedModel.performance}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: getStatusColor(selectedModel.status), fontWeight: 'bold' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Затримка"
                        secondary={`${selectedModel.latency}ms`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Точність"
                        secondary={`${selectedModel.accuracy}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Запитів оброблено"
                        secondary={selectedModel.requests.toLocaleString()}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    ⚙️ Технічні характеристики
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Параметрів"
                        secondary={selectedModel.parameters}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Максимум токенів"
                        secondary={selectedModel.maxTokens.toLocaleString()}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Версія"
                        secondary={selectedModel.version}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Вартість за 1K токенів"
                        secondary={`$${selectedModel.cost}`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    🛠️ Можливості
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedModel.capabilities.map((capability) => (
                      <Chip
                        key={capability}
                        label={capability}
                        sx={{
                          background: `${nexusColors.accent.main}20`,
                          color: nexusColors.accent.main,
                          border: `1px solid ${nexusColors.accent.main}40`
                        }}
                      />
                    ))}
                  </Box>
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
          ⚙️ Налаштування моделі
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Функція налаштування моделей буде реалізована у наступній версії
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AIModelsHub;
