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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  DataObject as DataIcon,
  Transform as TransformIcon,
  Storage as StorageIcon,
  Assessment as ReportIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Типи для ETL
interface ETLPipeline {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'scheduled';
  progress: number;
  source: string;
  target: string;
  recordsProcessed: number;
  totalRecords: number;
  startTime: string;
  estimatedTime: string;
  lastRun: string;
  nextRun?: string;
}

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'stream';
  status: 'connected' | 'disconnected' | 'error';
  connectionString: string;
  lastTest: string;
}

interface TransformationRule {
  id: string;
  name: string;
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'validate';
  description: string;
  enabled: boolean;
  config: any;
}

const SuperETLModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPipelineDialog, setNewPipelineDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Стани ETL
  const [pipelines, setPipelines] = useState<ETLPipeline[]>([
    {
      id: 'bank-transactions',
      name: 'Аналіз банківських транзакцій',
      status: 'running',
      progress: 67,
      source: 'Bank API',
      target: 'Analytics DB',
      recordsProcessed: 1247000,
      totalRecords: 1850000,
      startTime: '14:32:15',
      estimatedTime: '23 хв',
      lastRun: '10 хвилин тому',
      nextRun: 'Безперервно'
    },
    {
      id: 'gov-contracts',
      name: 'Держзакупівлі та тендери',
      status: 'running',
      progress: 89,
      source: 'ProZorro API',
      target: 'Compliance DB',
      recordsProcessed: 45600,
      totalRecords: 51200,
      startTime: '12:15:30',
      estimatedTime: '5 хв',
      lastRun: '2 години тому',
      nextRun: 'Щогодини'
    },
    {
      id: 'market-data',
      name: 'Ринкові дані та котирування',
      status: 'scheduled',
      progress: 0,
      source: 'Yahoo Finance',
      target: 'Market DB',
      recordsProcessed: 0,
      totalRecords: 125000,
      startTime: '-',
      estimatedTime: '15 хв',
      lastRun: '1 година тому',
      nextRun: 'Завтра 09:00'
    },
    {
      id: 'security-logs',
      name: 'Логи безпеки та аудит',
      status: 'error',
      progress: 34,
      source: 'Security Systems',
      target: 'SIEM DB',
      recordsProcessed: 89000,
      totalRecords: 260000,
      startTime: '13:45:22',
      estimatedTime: '-',
      lastRun: '30 хвилин тому',
      nextRun: 'Після виправлення'
    }
  ]);

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 'bank-api',
      name: 'Bank Core API',
      type: 'api',
      status: 'connected',
      connectionString: 'https://api.bank.com/v1',
      lastTest: '2 хвилини тому'
    },
    {
      id: 'prozorro',
      name: 'ProZorro Database',
      type: 'database',
      status: 'connected',
      connectionString: 'postgres://prozorro.gov.ua:5432/tenders',
      lastTest: '5 хвилин тому'
    },
    {
      id: 'market-feed',
      name: 'Market Data Feed',
      type: 'stream',
      status: 'connected',
      connectionString: 'kafka://market-stream:9092/quotes',
      lastTest: '1 хвилина тому'
    },
    {
      id: 'security-syslog',
      name: 'Security Syslog',
      type: 'file',
      status: 'error',
      connectionString: '/var/log/security/*.log',
      lastTest: '15 хвилин тому'
    }
  ]);

  const [transformationRules] = useState<TransformationRule[]>([
    {
      id: 'suspicious-transactions',
      name: 'Детекція підозрілих транзакцій',
      type: 'filter',
      description: 'Фільтрує транзакції > $10K між фізособами',
      enabled: true,
      config: { amount: 10000, type: 'p2p' }
    },
    {
      id: 'price-anomaly',
      name: 'Аномалії цін в тендерах',
      type: 'validate',
      description: 'Перевіряє завищення цін на 200%+',
      enabled: true,
      config: { threshold: 2.0 }
    },
    {
      id: 'risk-scoring',
      name: 'Розрахунок ризик-скору',
      type: 'aggregate',
      description: 'Агрегує фактори ризику по контрагентах',
      enabled: true,
      config: { factors: ['amount', 'frequency', 'geography'] }
    }
  ]);

  // Дані для графіків
  const [performanceData, setPerformanceData] = useState([
    { time: '12:00', throughput: 1200, errors: 2 },
    { time: '12:15', throughput: 1350, errors: 1 },
    { time: '12:30', throughput: 1180, errors: 3 },
    { time: '12:45', throughput: 1420, errors: 0 },
    { time: '13:00', throughput: 1380, errors: 1 },
    { time: '13:15', throughput: 1250, errors: 2 },
    { time: '13:30', throughput: 1400, errors: 0 }
  ]);

  // Симуляція оновлення прогресу
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.status === 'running') {
          const newProgress = Math.min(100, pipeline.progress + Math.random() * 2);
          const newProcessed = Math.floor((newProgress / 100) * pipeline.totalRecords);
          return {
            ...pipeline,
            progress: newProgress,
            recordsProcessed: newProcessed
          };
        }
        return pipeline;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Функції керування
  const handlePipelineAction = (pipelineId: string, action: 'start' | 'stop' | 'restart') => {
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id === pipelineId) {
        switch (action) {
          case 'start':
            return { ...pipeline, status: 'running' as const };
          case 'stop':
            return { ...pipeline, status: 'stopped' as const };
          case 'restart':
            return { ...pipeline, status: 'running' as const, progress: 0 };
          default:
            return pipeline;
        }
      }
      return pipeline;
    }));

    alert(`Дія "${action}" виконана для пайплайну ${pipelineId}`);
  };

  const handleTestConnection = (sourceId: string) => {
    setDataSources(prev => prev.map(source => {
      if (source.id === sourceId) {
        return { ...source, lastTest: 'Зараз тестується...' };
      }
      return source;
    }));

    setTimeout(() => {
      setDataSources(prev => prev.map(source => {
        if (source.id === sourceId) {
          return {
            ...source,
            status: Math.random() > 0.2 ? 'connected' : 'error',
            lastTest: 'Щойно'
          };
        }
        return source;
      }));
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': case 'connected': return '#4CAF50';
      case 'stopped': case 'disconnected': return '#FF9800';
      case 'error': return '#F44336';
      case 'scheduled': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': case 'connected': return <CheckIcon />;
      case 'stopped': case 'disconnected': return <PauseIcon />;
      case 'error': return <ErrorIcon />;
      case 'scheduled': return <ScheduleIcon />;
      default: return <InfoIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return <StorageIcon />;
      case 'api': return <DataIcon />;
      case 'file': return <UploadIcon />;
      case 'stream': return <TransformIcon />;
      default: return <DataIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            📊 ETL Pipeline Manager
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Керування потоками даних та трансформаціями
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewPipelineDialog(true)}
          >
            Новий пайплайн
          </Button>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Імпорт
          </Button>
          <Button variant="outlined" startIcon={<SettingsIcon />}>
            Налаштування
          </Button>
        </Box>
      </Box>

      {/* Швидка статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {pipelines.filter(p => p.status === 'running').length}
              </Typography>
              <Typography color="text.secondary">Активні пайплайни</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {pipelines.reduce((sum, p) => sum + p.recordsProcessed, 0).toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Записів оброблено</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h4" color="primary">
                {dataSources.filter(s => s.status === 'connected').length}/{dataSources.length}
              </Typography>
              <Typography color="text.secondary">Джерела підключені</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent>
              <Typography variant="h4" color="error.main">
                {pipelines.filter(p => p.status === 'error').length}
              </Typography>
              <Typography color="text.secondary">Помилки</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Вкладки */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <Tab label="📊 Пайплайни" />
          <Tab label="🔌 Джерела даних" />
          <Tab label="⚙️ Трансформації" />
          <Tab label="📈 Моніторинг" />
          <Tab label="📋 Логи" />
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
          {/* Вкладка "Пайплайни" */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {pipelines.map((pipeline) => (
                <Grid item xs={12} key={pipeline.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getStatusIcon(pipeline.status)}
                          <Box>
                            <Typography variant="h6">{pipeline.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pipeline.source} → {pipeline.target}
                            </Typography>
                          </Box>
                          <Chip
                            label={pipeline.status}
                            sx={{
                              bgcolor: getStatusColor(pipeline.status),
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            color="success"
                            onClick={() => handlePipelineAction(pipeline.id, 'start')}
                            disabled={pipeline.status === 'running'}
                          >
                            <PlayIcon />
                          </IconButton>
                          <IconButton
                            color="warning"
                            onClick={() => handlePipelineAction(pipeline.id, 'stop')}
                            disabled={pipeline.status === 'stopped'}
                          >
                            <PauseIcon />
                          </IconButton>
                          <IconButton
                            color="info"
                            onClick={() => handlePipelineAction(pipeline.id, 'restart')}
                          >
                            <RefreshIcon />
                          </IconButton>
                          <IconButton onClick={() => {
                            setSelectedPipeline(pipeline.id);
                            setDialogOpen(true);
                          }}>
                            <ViewIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {pipeline.status === 'running' && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              Прогрес: {pipeline.progress.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">
                              {pipeline.recordsProcessed.toLocaleString()} / {pipeline.totalRecords.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pipeline.progress} />
                        </Box>
                      )}

                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">
                            Початок
                          </Typography>
                          <Typography variant="body2">{pipeline.startTime}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">
                            Залишилось
                          </Typography>
                          <Typography variant="body2">{pipeline.estimatedTime}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">
                            Останній запуск
                          </Typography>
                          <Typography variant="body2">{pipeline.lastRun}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary">
                            Наступний
                          </Typography>
                          <Typography variant="body2">{pipeline.nextRun}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Вкладка "Джерела даних" */}
          {activeTab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Джерело</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Підключення</TableCell>
                    <TableCell>Останній тест</TableCell>
                    <TableCell>Дії</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(source.type)}
                          {source.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={source.type} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={source.status}
                          sx={{
                            bgcolor: getStatusColor(source.status),
                            color: 'white'
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {source.connectionString}
                        </Typography>
                      </TableCell>
                      <TableCell>{source.lastTest}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => handleTestConnection(source.id)}
                          >
                            Тест
                          </Button>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Вкладка "Трансформації" */}
          {activeTab === 2 && (
            <Box>
              {transformationRules.map((rule) => (
                <Accordion key={rule.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Switch checked={rule.enabled} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{rule.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.description}
                        </Typography>
                      </Box>
                      <Chip label={rule.type} variant="outlined" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="body2">
                        Конфігурація правила трансформації:
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {JSON.stringify(rule.config, null, 2)}
                        </Typography>
                      </Paper>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" startIcon={<EditIcon />}>
                          Редагувати
                        </Button>
                        <Button variant="outlined" startIcon={<PlayIcon />}>
                          Тестувати
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* Вкладка "Моніторинг" */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Продуктивність в реальному часі
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="throughput" stroke="#8884d8" name="Записів/хв" />
                        <Line type="monotone" dataKey="errors" stroke="#ff7300" name="Помилки" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Статистика по типах
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Банківські', count: 1247000 },
                        { name: 'Державні', count: 45600 },
                        { name: 'Ринкові', count: 125000 },
                        { name: 'Безпека', count: 89000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Вкладка "Логи" */}
          {activeTab === 4 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Логи виконання
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#000', color: '#00ff00', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body2" component="pre">
{`[14:32:15] INFO - Pipeline "bank-transactions" started
[14:32:16] INFO - Connected to Bank API successfully
[14:32:17] INFO - Starting data extraction...
[14:35:22] INFO - Extracted 50,000 records in batch 1
[14:38:45] INFO - Applied transformation rule: suspicious-transactions
[14:38:46] WARN - Found 23 suspicious transactions in batch 1
[14:41:12] INFO - Extracted 50,000 records in batch 2
[14:44:33] INFO - Applied transformation rule: risk-scoring
[14:44:35] INFO - Calculated risk scores for 100,000 records
[14:47:11] INFO - Loading batch 1 to Analytics DB...
[14:47:15] INFO - Successfully loaded 49,977 records (23 filtered)
[14:50:22] INFO - Pipeline progress: 67% complete
[14:50:23] INFO - ETA: 23 minutes remaining`}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Діалог деталей пайплайну */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Деталі пайплайну: {selectedPipeline && pipelines.find(p => p.id === selectedPipeline)?.name}
        </DialogTitle>
        <DialogContent>
          {selectedPipeline && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Деталі виконання
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Статус:
                  </Typography>
                  <Typography variant="body1">
                    {pipelines.find(p => p.id === selectedPipeline)?.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Прогрес:
                  </Typography>
                  <Typography variant="body1">
                    {pipelines.find(p => p.id === selectedPipeline)?.progress.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>

      {/* Діалог створення нового пайплайну */}
      <Dialog open={newPipelineDialog} onClose={() => setNewPipelineDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Створити новий ETL пайплайн</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ pt: 2 }}>
            <Step>
              <StepLabel>Базова інформація</StepLabel>
              <StepContent>
                <TextField
                  fullWidth
                  label="Назва пайплайну"
                  placeholder="Введіть назву..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Опис"
                  placeholder="Опишіть призначення пайплайну..."
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" onClick={() => setActiveStep(1)}>
                  Далі
                </Button>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Джерело даних</StepLabel>
              <StepContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Тип джерела</InputLabel>
                  <Select label="Тип джерела">
                    <MenuItem value="api">REST API</MenuItem>
                    <MenuItem value="database">База даних</MenuItem>
                    <MenuItem value="file">Файли</MenuItem>
                    <MenuItem value="stream">Потік даних</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Рядок підключення"
                  placeholder="Введіть URL або шлях..."
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => setActiveStep(0)}>Назад</Button>
                  <Button variant="contained" onClick={() => setActiveStep(2)}>
                    Далі
                  </Button>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Налаштування</StepLabel>
              <StepContent>
                <FormControlLabel
                  control={<Switch />}
                  label="Автоматичний запуск"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Моніторинг помилок"
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button onClick={() => setActiveStep(1)}>Назад</Button>
                  <Button variant="contained">Створити</Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewPipelineDialog(false);
            setActiveStep(0);
          }}>
            Скасувати
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperETLModule;
