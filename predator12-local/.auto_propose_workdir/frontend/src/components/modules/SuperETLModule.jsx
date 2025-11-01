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
const recharts_1 = require("recharts");
const framer_motion_1 = require("framer-motion");
const SuperETLModule = () => {
    var _a, _b, _c;
    const [activeTab, setActiveTab] = (0, react_1.useState)(0);
    const [selectedPipeline, setSelectedPipeline] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [newPipelineDialog, setNewPipelineDialog] = (0, react_1.useState)(false);
    const [activeStep, setActiveStep] = (0, react_1.useState)(0);
    // Стани ETL
    const [pipelines, setPipelines] = (0, react_1.useState)([
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
    const [dataSources, setDataSources] = (0, react_1.useState)([
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
    const [transformationRules] = (0, react_1.useState)([
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
    const [performanceData, setPerformanceData] = (0, react_1.useState)([
        { time: '12:00', throughput: 1200, errors: 2 },
        { time: '12:15', throughput: 1350, errors: 1 },
        { time: '12:30', throughput: 1180, errors: 3 },
        { time: '12:45', throughput: 1420, errors: 0 },
        { time: '13:00', throughput: 1380, errors: 1 },
        { time: '13:15', throughput: 1250, errors: 2 },
        { time: '13:30', throughput: 1400, errors: 0 }
    ]);
    // Симуляція оновлення прогресу
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            setPipelines(prev => prev.map(pipeline => {
                if (pipeline.status === 'running') {
                    const newProgress = Math.min(100, pipeline.progress + Math.random() * 2);
                    const newProcessed = Math.floor((newProgress / 100) * pipeline.totalRecords);
                    return Object.assign(Object.assign({}, pipeline), { progress: newProgress, recordsProcessed: newProcessed });
                }
                return pipeline;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // Функції керування
    const handlePipelineAction = (pipelineId, action) => {
        setPipelines(prev => prev.map(pipeline => {
            if (pipeline.id === pipelineId) {
                switch (action) {
                    case 'start':
                        return Object.assign(Object.assign({}, pipeline), { status: 'running' });
                    case 'stop':
                        return Object.assign(Object.assign({}, pipeline), { status: 'stopped' });
                    case 'restart':
                        return Object.assign(Object.assign({}, pipeline), { status: 'running', progress: 0 });
                    default:
                        return pipeline;
                }
            }
            return pipeline;
        }));
        alert(`Дія "${action}" виконана для пайплайну ${pipelineId}`);
    };
    const handleTestConnection = (sourceId) => {
        setDataSources(prev => prev.map(source => {
            if (source.id === sourceId) {
                return Object.assign(Object.assign({}, source), { lastTest: 'Зараз тестується...' });
            }
            return source;
        }));
        setTimeout(() => {
            setDataSources(prev => prev.map(source => {
                if (source.id === sourceId) {
                    return Object.assign(Object.assign({}, source), { status: Math.random() > 0.2 ? 'connected' : 'error', lastTest: 'Щойно' });
                }
                return source;
            }));
        }, 2000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'running':
            case 'connected': return '#4CAF50';
            case 'stopped':
            case 'disconnected': return '#FF9800';
            case 'error': return '#F44336';
            case 'scheduled': return '#2196F3';
            default: return '#9E9E9E';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'running':
            case 'connected': return <icons_material_1.CheckCircle />;
            case 'stopped':
            case 'disconnected': return <icons_material_1.Pause />;
            case 'error': return <icons_material_1.Error />;
            case 'scheduled': return <icons_material_1.Schedule />;
            default: return <icons_material_1.Info />;
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'database': return <icons_material_1.Storage />;
            case 'api': return <icons_material_1.DataObject />;
            case 'file': return <icons_material_1.Upload />;
            case 'stream': return <icons_material_1.Transform />;
            default: return <icons_material_1.DataObject />;
        }
    };
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <material_1.Box>
          <material_1.Typography variant="h4" fontWeight="bold" color="primary">
            📊 ETL Pipeline Manager
          </material_1.Typography>
          <material_1.Typography variant="subtitle1" color="text.secondary">
            Керування потоками даних та трансформаціями
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={() => setNewPipelineDialog(true)}>
            Новий пайплайн
          </material_1.Button>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Upload />}>
            Імпорт
          </material_1.Button>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Settings />}>
            Налаштування
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      {/* Швидка статистика */}
      <material_1.Grid container spacing={3} sx={{ mb: 3 }}>
        <material_1.Grid item xs={12} sm={3}>
          <material_1.Card sx={{ bgcolor: '#e8f5e8' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h4" color="success.main">
                {pipelines.filter(p => p.status === 'running').length}
              </material_1.Typography>
              <material_1.Typography color="text.secondary">Активні пайплайни</material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={3}>
          <material_1.Card sx={{ bgcolor: '#fff3e0' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h4" color="warning.main">
                {pipelines.reduce((sum, p) => sum + p.recordsProcessed, 0).toLocaleString()}
              </material_1.Typography>
              <material_1.Typography color="text.secondary">Записів оброблено</material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={3}>
          <material_1.Card sx={{ bgcolor: '#e3f2fd' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h4" color="primary">
                {dataSources.filter(s => s.status === 'connected').length}/{dataSources.length}
              </material_1.Typography>
              <material_1.Typography color="text.secondary">Джерела підключені</material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={3}>
          <material_1.Card sx={{ bgcolor: '#fce4ec' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h4" color="error.main">
                {pipelines.filter(p => p.status === 'error').length}
              </material_1.Typography>
              <material_1.Typography color="text.secondary">Помилки</material_1.Typography>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>

      {/* Вкладки */}
      <material_1.Card sx={{ mb: 3 }}>
        <material_1.Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <material_1.Tab label="📊 Пайплайни"/>
          <material_1.Tab label="🔌 Джерела даних"/>
          <material_1.Tab label="⚙️ Трансформації"/>
          <material_1.Tab label="📈 Моніторинг"/>
          <material_1.Tab label="📋 Логи"/>
        </material_1.Tabs>
      </material_1.Card>

      {/* Вміст вкладок */}
      <framer_motion_1.AnimatePresence mode="wait">
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          {/* Вкладка "Пайплайни" */}
          {activeTab === 0 && (<material_1.Grid container spacing={3}>
              {pipelines.map((pipeline) => (<material_1.Grid item xs={12} key={pipeline.id}>
                  <material_1.Card>
                    <material_1.CardContent>
                      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getStatusIcon(pipeline.status)}
                          <material_1.Box>
                            <material_1.Typography variant="h6">{pipeline.name}</material_1.Typography>
                            <material_1.Typography variant="body2" color="text.secondary">
                              {pipeline.source} → {pipeline.target}
                            </material_1.Typography>
                          </material_1.Box>
                          <material_1.Chip label={pipeline.status} sx={{
                    bgcolor: getStatusColor(pipeline.status),
                    color: 'white',
                    textTransform: 'capitalize'
                }}/>
                        </material_1.Box>

                        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                          <material_1.IconButton color="success" onClick={() => handlePipelineAction(pipeline.id, 'start')} disabled={pipeline.status === 'running'}>
                            <icons_material_1.PlayArrow />
                          </material_1.IconButton>
                          <material_1.IconButton color="warning" onClick={() => handlePipelineAction(pipeline.id, 'stop')} disabled={pipeline.status === 'stopped'}>
                            <icons_material_1.Pause />
                          </material_1.IconButton>
                          <material_1.IconButton color="info" onClick={() => handlePipelineAction(pipeline.id, 'restart')}>
                            <icons_material_1.Refresh />
                          </material_1.IconButton>
                          <material_1.IconButton onClick={() => {
                    setSelectedPipeline(pipeline.id);
                    setDialogOpen(true);
                }}>
                            <icons_material_1.Visibility />
                          </material_1.IconButton>
                        </material_1.Box>
                      </material_1.Box>

                      {pipeline.status === 'running' && (<material_1.Box sx={{ mb: 2 }}>
                          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <material_1.Typography variant="body2">
                              Прогрес: {pipeline.progress.toFixed(1)}%
                            </material_1.Typography>
                            <material_1.Typography variant="body2">
                              {pipeline.recordsProcessed.toLocaleString()} / {pipeline.totalRecords.toLocaleString()}
                            </material_1.Typography>
                          </material_1.Box>
                          <material_1.LinearProgress variant="determinate" value={pipeline.progress}/>
                        </material_1.Box>)}

                      <material_1.Grid container spacing={2}>
                        <material_1.Grid item xs={6} sm={3}>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Початок
                          </material_1.Typography>
                          <material_1.Typography variant="body2">{pipeline.startTime}</material_1.Typography>
                        </material_1.Grid>
                        <material_1.Grid item xs={6} sm={3}>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Залишилось
                          </material_1.Typography>
                          <material_1.Typography variant="body2">{pipeline.estimatedTime}</material_1.Typography>
                        </material_1.Grid>
                        <material_1.Grid item xs={6} sm={3}>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Останній запуск
                          </material_1.Typography>
                          <material_1.Typography variant="body2">{pipeline.lastRun}</material_1.Typography>
                        </material_1.Grid>
                        <material_1.Grid item xs={6} sm={3}>
                          <material_1.Typography variant="caption" color="text.secondary">
                            Наступний
                          </material_1.Typography>
                          <material_1.Typography variant="body2">{pipeline.nextRun}</material_1.Typography>
                        </material_1.Grid>
                      </material_1.Grid>
                    </material_1.CardContent>
                  </material_1.Card>
                </material_1.Grid>))}
            </material_1.Grid>)}

          {/* Вкладка "Джерела даних" */}
          {activeTab === 1 && (<material_1.TableContainer component={material_1.Paper}>
              <material_1.Table>
                <material_1.TableHead>
                  <material_1.TableRow>
                    <material_1.TableCell>Джерело</material_1.TableCell>
                    <material_1.TableCell>Тип</material_1.TableCell>
                    <material_1.TableCell>Статус</material_1.TableCell>
                    <material_1.TableCell>Підключення</material_1.TableCell>
                    <material_1.TableCell>Останній тест</material_1.TableCell>
                    <material_1.TableCell>Дії</material_1.TableCell>
                  </material_1.TableRow>
                </material_1.TableHead>
                <material_1.TableBody>
                  {dataSources.map((source) => (<material_1.TableRow key={source.id}>
                      <material_1.TableCell>
                        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(source.type)}
                          {source.name}
                        </material_1.Box>
                      </material_1.TableCell>
                      <material_1.TableCell>
                        <material_1.Chip label={source.type} variant="outlined" size="small"/>
                      </material_1.TableCell>
                      <material_1.TableCell>
                        <material_1.Chip label={source.status} sx={{
                    bgcolor: getStatusColor(source.status),
                    color: 'white'
                }} size="small"/>
                      </material_1.TableCell>
                      <material_1.TableCell>
                        <material_1.Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {source.connectionString}
                        </material_1.Typography>
                      </material_1.TableCell>
                      <material_1.TableCell>{source.lastTest}</material_1.TableCell>
                      <material_1.TableCell>
                        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                          <material_1.Button size="small" onClick={() => handleTestConnection(source.id)}>
                            Тест
                          </material_1.Button>
                          <material_1.IconButton size="small">
                            <icons_material_1.Edit />
                          </material_1.IconButton>
                          <material_1.IconButton size="small" color="error">
                            <icons_material_1.Delete />
                          </material_1.IconButton>
                        </material_1.Box>
                      </material_1.TableCell>
                    </material_1.TableRow>))}
                </material_1.TableBody>
              </material_1.Table>
            </material_1.TableContainer>)}

          {/* Вкладка "Трансформації" */}
          {activeTab === 2 && (<material_1.Box>
              {transformationRules.map((rule) => (<material_1.Accordion key={rule.id}>
                  <material_1.AccordionSummary expandIcon={<icons_material_1.ExpandMore />}>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <material_1.Switch checked={rule.enabled}/>
                      <material_1.Box sx={{ flexGrow: 1 }}>
                        <material_1.Typography variant="h6">{rule.name}</material_1.Typography>
                        <material_1.Typography variant="body2" color="text.secondary">
                          {rule.description}
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Chip label={rule.type} variant="outlined"/>
                    </material_1.Box>
                  </material_1.AccordionSummary>
                  <material_1.AccordionDetails>
                    <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <material_1.Typography variant="body2">
                        Конфігурація правила трансформації:
                      </material_1.Typography>
                      <material_1.Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <material_1.Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {JSON.stringify(rule.config, null, 2)}
                        </material_1.Typography>
                      </material_1.Paper>
                      <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                        <material_1.Button variant="outlined" startIcon={<icons_material_1.Edit />}>
                          Редагувати
                        </material_1.Button>
                        <material_1.Button variant="outlined" startIcon={<icons_material_1.PlayArrow />}>
                          Тестувати
                        </material_1.Button>
                      </material_1.Box>
                    </material_1.Box>
                  </material_1.AccordionDetails>
                </material_1.Accordion>))}
            </material_1.Box>)}

          {/* Вкладка "Моніторинг" */}
          {activeTab === 3 && (<material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} md={8}>
                <material_1.Card>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" gutterBottom>
                      Продуктивність в реальному часі
                    </material_1.Typography>
                    <recharts_1.ResponsiveContainer width="100%" height={300}>
                      <recharts_1.LineChart data={performanceData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                        <recharts_1.XAxis dataKey="time"/>
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip />
                        <recharts_1.Line type="monotone" dataKey="throughput" stroke="#8884d8" name="Записів/хв"/>
                        <recharts_1.Line type="monotone" dataKey="errors" stroke="#ff7300" name="Помилки"/>
                      </recharts_1.LineChart>
                    </recharts_1.ResponsiveContainer>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>

              <material_1.Grid item xs={12} md={4}>
                <material_1.Card>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" gutterBottom>
                      Статистика по типах
                    </material_1.Typography>
                    <recharts_1.ResponsiveContainer width="100%" height={300}>
                      <recharts_1.BarChart data={[
                { name: 'Банківські', count: 1247000 },
                { name: 'Державні', count: 45600 },
                { name: 'Ринкові', count: 125000 },
                { name: 'Безпека', count: 89000 }
            ]}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                        <recharts_1.XAxis dataKey="name"/>
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip />
                        <recharts_1.Bar dataKey="count" fill="#8884d8"/>
                      </recharts_1.BarChart>
                    </recharts_1.ResponsiveContainer>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>
            </material_1.Grid>)}

          {/* Вкладка "Логи" */}
          {activeTab === 4 && (<material_1.Card>
              <material_1.CardContent>
                <material_1.Typography variant="h6" gutterBottom>
                  Логи виконання
                </material_1.Typography>
                <material_1.Paper sx={{ p: 2, bgcolor: '#000', color: '#00ff00', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                  <material_1.Typography variant="body2" component="pre">
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
                  </material_1.Typography>
                </material_1.Paper>
              </material_1.CardContent>
            </material_1.Card>)}
        </framer_motion_1.motion.div>
      </framer_motion_1.AnimatePresence>

      {/* Діалог деталей пайплайну */}
      <material_1.Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <material_1.DialogTitle>
          Деталі пайплайну: {selectedPipeline && ((_a = pipelines.find(p => p.id === selectedPipeline)) === null || _a === void 0 ? void 0 : _a.name)}
        </material_1.DialogTitle>
        <material_1.DialogContent>
          {selectedPipeline && (<material_1.Box sx={{ pt: 2 }}>
              <material_1.Typography variant="h6" gutterBottom>
                Деталі виконання
              </material_1.Typography>
              <material_1.Grid container spacing={2}>
                <material_1.Grid item xs={6}>
                  <material_1.Typography variant="body2" color="text.secondary">
                    Статус:
                  </material_1.Typography>
                  <material_1.Typography variant="body1">
                    {(_b = pipelines.find(p => p.id === selectedPipeline)) === null || _b === void 0 ? void 0 : _b.status}
                  </material_1.Typography>
                </material_1.Grid>
                <material_1.Grid item xs={6}>
                  <material_1.Typography variant="body2" color="text.secondary">
                    Прогрес:
                  </material_1.Typography>
                  <material_1.Typography variant="body1">
                    {(_c = pipelines.find(p => p.id === selectedPipeline)) === null || _c === void 0 ? void 0 : _c.progress.toFixed(1)}%
                  </material_1.Typography>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.Box>)}
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setDialogOpen(false)}>Закрити</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Діалог створення нового пайплайну */}
      <material_1.Dialog open={newPipelineDialog} onClose={() => setNewPipelineDialog(false)} maxWidth="md" fullWidth>
        <material_1.DialogTitle>Створити новий ETL пайплайн</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Stepper activeStep={activeStep} orientation="vertical" sx={{ pt: 2 }}>
            <material_1.Step>
              <material_1.StepLabel>Базова інформація</material_1.StepLabel>
              <material_1.StepContent>
                <material_1.TextField fullWidth label="Назва пайплайну" placeholder="Введіть назву..." sx={{ mb: 2 }}/>
                <material_1.TextField fullWidth label="Опис" placeholder="Опишіть призначення пайплайну..." multiline rows={3} sx={{ mb: 2 }}/>
                <material_1.Button variant="contained" onClick={() => setActiveStep(1)}>
                  Далі
                </material_1.Button>
              </material_1.StepContent>
            </material_1.Step>
            <material_1.Step>
              <material_1.StepLabel>Джерело даних</material_1.StepLabel>
              <material_1.StepContent>
                <material_1.FormControl fullWidth sx={{ mb: 2 }}>
                  <material_1.InputLabel>Тип джерела</material_1.InputLabel>
                  <material_1.Select label="Тип джерела">
                    <material_1.MenuItem value="api">REST API</material_1.MenuItem>
                    <material_1.MenuItem value="database">База даних</material_1.MenuItem>
                    <material_1.MenuItem value="file">Файли</material_1.MenuItem>
                    <material_1.MenuItem value="stream">Потік даних</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
                <material_1.TextField fullWidth label="Рядок підключення" placeholder="Введіть URL або шлях..." sx={{ mb: 2 }}/>
                <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                  <material_1.Button onClick={() => setActiveStep(0)}>Назад</material_1.Button>
                  <material_1.Button variant="contained" onClick={() => setActiveStep(2)}>
                    Далі
                  </material_1.Button>
                </material_1.Box>
              </material_1.StepContent>
            </material_1.Step>
            <material_1.Step>
              <material_1.StepLabel>Налаштування</material_1.StepLabel>
              <material_1.StepContent>
                <material_1.FormControlLabel control={<material_1.Switch />} label="Автоматичний запуск"/>
                <material_1.FormControlLabel control={<material_1.Switch />} label="Моніторинг помилок"/>
                <material_1.Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <material_1.Button onClick={() => setActiveStep(1)}>Назад</material_1.Button>
                  <material_1.Button variant="contained">Створити</material_1.Button>
                </material_1.Box>
              </material_1.StepContent>
            </material_1.Step>
          </material_1.Stepper>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => {
            setNewPipelineDialog(false);
            setActiveStep(0);
        }}>
            Скасувати
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = SuperETLModule;
