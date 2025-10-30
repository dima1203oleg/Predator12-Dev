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
    const [models, setModels] = (0, react_1.useState)(aiModelsData);
    const [selectedModel, setSelectedModel] = (0, react_1.useState)(null);
    const [configDialog, setConfigDialog] = (0, react_1.useState)(false);
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [filterCategory, setFilterCategory] = (0, react_1.useState)('all');
    const [sortBy, setSortBy] = (0, react_1.useState)('performance');
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
                return nexusTheme_1.nexusColors.success.main;
            case 'maintenance':
                return nexusTheme_1.nexusColors.warning.main;
            case 'offline':
                return nexusTheme_1.nexusColors.error.main;
            case 'loading':
                return nexusTheme_1.nexusColors.info.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'online':
                return <icons_material_1.CheckCircle />;
            case 'maintenance':
                return <icons_material_1.Warning />;
            case 'offline':
                return <icons_material_1.Error />;
            case 'loading':
                return <icons_material_1.Refresh />;
            default:
                return <icons_material_1.Error />;
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Language Model':
                return <icons_material_1.Psychology />;
            case 'Multimodal':
                return <icons_material_1.Memory />;
            case 'Open Source':
                return <icons_material_1.Cloud />;
            case 'Command Model':
                return <icons_material_1.Computer />;
            default:
                return <icons_material_1.Memory />;
        }
    };
    const handleModelAction = (modelId, action) => {
        setModels(prev => prev.map(model => {
            if (model.id === modelId) {
                switch (action) {
                    case 'start':
                        return Object.assign(Object.assign({}, model), { status: 'online' });
                    case 'stop':
                        return Object.assign(Object.assign({}, model), { status: 'offline' });
                    case 'restart':
                        return Object.assign(Object.assign({}, model), { status: 'loading' });
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
    return (<material_1.Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      {/* Заголовок модуля */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}20, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30`,
            textAlign: 'center'
        }}>
          <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 2,
            fontFamily: 'Orbitron'
        }}>
            🧠 ХАБ ШІ МОДЕЛЕЙ
          </material_1.Typography>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
            Управління та моніторинг {totalModels} моделей штучного інтелекту
          </material_1.Typography>
        </Paper>
      </framer_motion_1.motion.div>

      {/* Панель статистики */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.success.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.success.main}30` }}>
              <material_1.CardContent sx={{ textAlign: 'center' }}>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.success.main, fontWeight: 'bold' }}>
                  {onlineModels}/{totalModels}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  Моделей онлайн
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.primary.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
              <material_1.CardContent sx={{ textAlign: 'center' }}>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                  {totalRequests.toLocaleString()}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  Загальних запитів
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.warning.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.warning.main}30` }}>
              <material_1.CardContent sx={{ textAlign: 'center' }}>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.warning.main, fontWeight: 'bold' }}>
                  {avgLatency.toFixed(0)}ms
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  Середня затримка
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.accent.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
              <material_1.CardContent sx={{ textAlign: 'center' }}>
                <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.accent.main, fontWeight: 'bold' }}>
                  96.2%
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  Uptime
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>

      {/* Панель фільтрів */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
        <material_1.Card sx={{ mb: 3, background: `${nexusTheme_1.nexusColors.background.paper}95`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
          <material_1.CardContent>
            <material_1.Grid container spacing={2} alignItems="center">
              <material_1.Grid item xs={12} sm={6} md={2.4}>
                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Статус</material_1.InputLabel>
                  <material_1.Select value={filterStatus} label="Статус" onChange={(e) => setFilterStatus(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    <material_1.MenuItem value="all">Всі моделі</material_1.MenuItem>
                    <material_1.MenuItem value="online">Онлайн</material_1.MenuItem>
                    <material_1.MenuItem value="maintenance">Обслуговування</material_1.MenuItem>
                    <material_1.MenuItem value="offline">Офлайн</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={2.4}>
                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Категорія</material_1.InputLabel>
                  <material_1.Select value={filterCategory} label="Категорія" onChange={(e) => setFilterCategory(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    <material_1.MenuItem value="all">Всі категорії</material_1.MenuItem>
                    <material_1.MenuItem value="Language Model">Мовні моделі</material_1.MenuItem>
                    <material_1.MenuItem value="Multimodal">Мультимодальні</material_1.MenuItem>
                    <material_1.MenuItem value="Open Source">Відкритий код</material_1.MenuItem>
                    <material_1.MenuItem value="Command Model">Командні</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={2.4}>
                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Сортування</material_1.InputLabel>
                  <material_1.Select value={sortBy} label="Сортування" onChange={(e) => setSortBy(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    <material_1.MenuItem value="performance">За продуктивністю</material_1.MenuItem>
                    <material_1.MenuItem value="latency">За швидкістю</material_1.MenuItem>
                    <material_1.MenuItem value="accuracy">За точністю</material_1.MenuItem>
                    <material_1.MenuItem value="requests">За запитами</material_1.MenuItem>
                    <material_1.MenuItem value="name">За назвою</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={2.4}>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} fullWidth sx={{
            borderColor: nexusTheme_1.nexusColors.primary.main,
            color: nexusTheme_1.nexusColors.primary.main,
            '&:hover': {
                background: `${nexusTheme_1.nexusColors.primary.main}20`,
                borderColor: nexusTheme_1.nexusColors.primary.light
            }
        }} onClick={() => window.location.reload()}>
                  Оновити
                </material_1.Button>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={2.4}>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} fullWidth sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.dark}, ${nexusTheme_1.nexusColors.primary.dark})`
            }
        }} onClick={() => setConfigDialog(true)}>
                  Додати модель
                </material_1.Button>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Сітка моделей */}
      <material_1.Grid container spacing={3}>
        {filteredModels.map((model, index) => (<material_1.Grid item xs={12} lg={6} xl={4} key={model.id}>
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ scale: 1.02 }}>
              <material_1.Card sx={{
                background: `linear-gradient(135deg, ${getStatusColor(model.status)}10, ${nexusTheme_1.nexusColors.background.paper}90)`,
                border: `1px solid ${getStatusColor(model.status)}30`,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    border: `1px solid ${getStatusColor(model.status)}60`,
                    boxShadow: `0 8px 25px ${getStatusColor(model.status)}20`
                }
            }} onClick={() => setSelectedModel(model)}>
                <material_1.CardContent sx={{ p: 3 }}>
                  {/* Заголовок моделі */}
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${getStatusColor(model.status)}, ${getStatusColor(model.status)}80)`,
                mr: 2,
                width: 48,
                height: 48
            }}>
                      {getCategoryIcon(model.category)}
                    </material_1.Avatar>
                    <material_1.Box sx={{ flex: 1 }}>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                        {model.name}
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        {model.provider} • {model.category}
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.Chip icon={getStatusIcon(model.status)} label={model.status} size="small" sx={{
                background: `${getStatusColor(model.status)}20`,
                color: getStatusColor(model.status),
                border: `1px solid ${getStatusColor(model.status)}50`
            }}/>
                  </material_1.Box>

                  {/* Метрики */}
                  <material_1.Grid container spacing={2} sx={{ mb: 2 }}>
                    <material_1.Grid item xs={6}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Продуктивність
                      </material_1.Typography>
                      <material_1.Typography variant="h6" sx={{ color: getStatusColor(model.status), fontWeight: 'bold' }}>
                        {model.performance}%
                      </material_1.Typography>
                    </material_1.Grid>
                    <material_1.Grid item xs={6}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Затримка
                      </material_1.Typography>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                        {model.latency}ms
                      </material_1.Typography>
                    </material_1.Grid>
                  </material_1.Grid>

                  {/* Прогрес бар продуктивності */}
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                      Точність: {model.accuracy}%
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={model.accuracy} sx={{
                height: 6,
                borderRadius: 3,
                background: `${nexusTheme_1.nexusColors.background.surface}`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getStatusColor(model.status)}, ${getStatusColor(model.status)}60)`,
                    borderRadius: 3
                }
            }}/>
                  </material_1.Box>

                  {/* Статистика */}
                  <material_1.Grid container spacing={1} sx={{ mb: 2 }}>
                    <material_1.Grid item xs={6}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Запитів: {model.requests.toLocaleString()}
                      </material_1.Typography>
                    </material_1.Grid>
                    <material_1.Grid item xs={6}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Параметрів: {model.parameters}
                      </material_1.Typography>
                    </material_1.Grid>
                  </material_1.Grid>

                  {/* Можливості */}
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                      Можливості:
                    </material_1.Typography>
                    <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {model.capabilities.slice(0, 2).map((capability) => (<material_1.Chip key={capability} label={capability} size="small" sx={{
                    background: `${nexusTheme_1.nexusColors.accent.main}15`,
                    color: nexusTheme_1.nexusColors.accent.main,
                    fontSize: '0.7rem'
                }}/>))}
                      {model.capabilities.length > 2 && (<material_1.Chip label={`+${model.capabilities.length - 2}`} size="small" sx={{
                    background: `${nexusTheme_1.nexusColors.text.secondary}15`,
                    color: nexusTheme_1.nexusColors.text.secondary,
                    fontSize: '0.7rem'
                }}/>)}
                    </material_1.Box>
                  </material_1.Box>

                  {/* Дії */}
                  <material_1.Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <material_1.Tooltip title="Запустити">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleModelAction(model.id, 'start');
            }} sx={{ color: nexusTheme_1.nexusColors.success.main }}>
                        <icons_material_1.PlayArrow />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                    <material_1.Tooltip title="Зупинити">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleModelAction(model.id, 'stop');
            }} sx={{ color: nexusTheme_1.nexusColors.error.main }}>
                        <icons_material_1.Stop />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                    <material_1.Tooltip title="Перезапустити">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleModelAction(model.id, 'restart');
            }} sx={{ color: nexusTheme_1.nexusColors.primary.main }}>
                        <icons_material_1.Refresh />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                    <material_1.Tooltip title="Налаштування">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                setSelectedModel(model);
                setConfigDialog(true);
            }} sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        <icons_material_1.Settings />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                  </material_1.Box>

                  {/* Вартість */}
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary, display: 'block', mt: 1 }}>
                    Вартість: ${model.cost}/1K токенів
                  </material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Діалог деталей моделі */}
      <material_1.Dialog open={selectedModel !== null && !configDialog} onClose={() => setSelectedModel(null)} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3
            }
        }}>
        {selectedModel && (<>
            <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.text.primary, borderBottom: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${getStatusColor(selectedModel.status)}, ${getStatusColor(selectedModel.status)}80)`,
                width: 56,
                height: 56
            }}>
                  {getCategoryIcon(selectedModel.category)}
                </material_1.Avatar>
                <material_1.Box>
                  <material_1.Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedModel.name}
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                    {selectedModel.provider} • {selectedModel.category}
                  </material_1.Typography>
                </material_1.Box>
                <material_1.Chip icon={getStatusIcon(selectedModel.status)} label={selectedModel.status.toUpperCase()} sx={{
                background: `${getStatusColor(selectedModel.status)}20`,
                color: getStatusColor(selectedModel.status),
                border: `1px solid ${getStatusColor(selectedModel.status)}50`,
                ml: 'auto'
            }}/>
              </material_1.Box>
            </material_1.DialogTitle>
            <material_1.DialogContent sx={{ pt: 3 }}>
              <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                {selectedModel.description}
              </material_1.Typography>

              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    📊 Метрики продуктивності
                  </material_1.Typography>
                  <material_1.List>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Продуктивність" secondary={`${selectedModel.performance}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: getStatusColor(selectedModel.status), fontWeight: 'bold' }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Затримка" secondary={`${selectedModel.latency}ms`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Точність" secondary={`${selectedModel.accuracy}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Запитів оброблено" secondary={selectedModel.requests.toLocaleString()} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                  </material_1.List>
                </material_1.Grid>

                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    ⚙️ Технічні характеристики
                  </material_1.Typography>
                  <material_1.List>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Параметрів" secondary={selectedModel.parameters} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Максимум токенів" secondary={selectedModel.maxTokens.toLocaleString()} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Версія" secondary={selectedModel.version} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Вартість за 1K токенів" secondary={`$${selectedModel.cost}`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                  </material_1.List>
                </material_1.Grid>

                <material_1.Grid item xs={12}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    🛠️ Можливості
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedModel.capabilities.map((capability) => (<material_1.Chip key={capability} label={capability} sx={{
                    background: `${nexusTheme_1.nexusColors.accent.main}20`,
                    color: nexusTheme_1.nexusColors.accent.main,
                    border: `1px solid ${nexusTheme_1.nexusColors.accent.main}40`
                }}/>))}
                  </material_1.Box>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
          </>)}
      </material_1.Dialog>

      {/* Діалог конфігурації */}
      <material_1.Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="sm" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3
            }
        }}>
        <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
          ⚙️ Налаштування моделі
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Alert severity="info" sx={{ mb: 2 }}>
            Функція налаштування моделей буде реалізована у наступній версії
          </material_1.Alert>
        </material_1.DialogContent>
      </material_1.Dialog>
    </material_1.Box>);
}
exports.default = AIModelsHub;
