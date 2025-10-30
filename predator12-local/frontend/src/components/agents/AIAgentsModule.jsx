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
    const [agents, setAgents] = (0, react_1.useState)(aiAgentsData);
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [configDialog, setConfigDialog] = (0, react_1.useState)(false);
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [sortBy, setSortBy] = (0, react_1.useState)('performance');
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
                return nexusTheme_1.nexusColors.success.main;
            case 'processing':
                return nexusTheme_1.nexusColors.warning.main;
            case 'learning':
                return nexusTheme_1.nexusColors.info.main;
            case 'monitoring':
                return nexusTheme_1.nexusColors.primary.main;
            case 'standby':
                return nexusTheme_1.nexusColors.text.secondary;
            default:
                return nexusTheme_1.nexusColors.error.main;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <icons_material_1.CheckCircle />;
            case 'processing':
                return <icons_material_1.PlayArrow />;
            case 'learning':
                return <icons_material_1.Smart />;
            case 'monitoring':
                return <icons_material_1.Visibility />;
            case 'standby':
                return <icons_material_1.Pause />;
            default:
                return <icons_material_1.Error />;
        }
    };
    const handleAgentAction = (agentId, action) => {
        setAgents(prev => prev.map(agent => {
            if (agent.id === agentId) {
                switch (action) {
                    case 'start':
                        return Object.assign(Object.assign({}, agent), { status: 'active' });
                    case 'pause':
                        return Object.assign(Object.assign({}, agent), { status: 'standby' });
                    case 'stop':
                        return Object.assign(Object.assign({}, agent), { status: 'offline' });
                    case 'restart':
                        return Object.assign(Object.assign({}, agent), { status: 'processing', lastUpdate: 'щойно' });
                    default:
                        return agent;
                }
            }
            return agent;
        }));
    };
    return (<material_1.Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      {/* Заголовок модуля */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.accent.dark}20, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            textAlign: 'center'
        }}>
          <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 2,
            fontFamily: 'Orbitron'
        }}>
            🤖 ШІ АГЕНТИ ПАНЕЛЬ
          </material_1.Typography>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
            Управління та моніторинг {agents.length} штучних інтелектів системи
          </material_1.Typography>
        </Paper>
      </framer_motion_1.motion.div>

      {/* Панель фільтрів та контролів */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <material_1.Card sx={{ mb: 3, background: `${nexusTheme_1.nexusColors.background.paper}95`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
          <material_1.CardContent>
            <material_1.Grid container spacing={2} alignItems="center">
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Статус</material_1.InputLabel>
                  <material_1.Select value={filterStatus} label="Статус" onChange={(e) => setFilterStatus(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    <material_1.MenuItem value="all">Всі агенти</material_1.MenuItem>
                    <material_1.MenuItem value="active">Активні</material_1.MenuItem>
                    <material_1.MenuItem value="processing">Обробка</material_1.MenuItem>
                    <material_1.MenuItem value="learning">Навчання</material_1.MenuItem>
                    <material_1.MenuItem value="monitoring">Моніторинг</material_1.MenuItem>
                    <material_1.MenuItem value="standby">Очікування</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Сортування</material_1.InputLabel>
                  <material_1.Select value={sortBy} label="Сортування" onChange={(e) => setSortBy(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    <material_1.MenuItem value="performance">За продуктивністю</material_1.MenuItem>
                    <material_1.MenuItem value="tasks">За завданнями</material_1.MenuItem>
                    <material_1.MenuItem value="accuracy">За точністю</material_1.MenuItem>
                    <material_1.MenuItem value="name">За назвою</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
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
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} fullWidth sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.dark}, ${nexusTheme_1.nexusColors.primary.dark})`
            }
        }} onClick={() => setConfigDialog(true)}>
                  Новий агент
                </material_1.Button>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Сітка агентів */}
      <material_1.Grid container spacing={3}>
        {filteredAgents.map((agent, index) => (<material_1.Grid item xs={12} sm={6} lg={4} xl={3} key={agent.id}>
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ scale: 1.02 }}>
              <material_1.Card sx={{
                background: `linear-gradient(135deg, ${getStatusColor(agent.status)}10, ${nexusTheme_1.nexusColors.background.paper}90)`,
                border: `1px solid ${getStatusColor(agent.status)}30`,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    border: `1px solid ${getStatusColor(agent.status)}60`,
                    boxShadow: `0 8px 25px ${getStatusColor(agent.status)}20`
                }
            }} onClick={() => setSelectedAgent(agent)}>
                <material_1.CardContent sx={{ p: 3 }}>
                  {/* Заголовок агента */}
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${getStatusColor(agent.status)}, ${getStatusColor(agent.status)}80)`,
                mr: 2,
                width: 48,
                height: 48
            }}>
                      <icons_material_1.Psychology />
                    </material_1.Avatar>
                    <material_1.Box sx={{ flex: 1 }}>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                        {agent.name}
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        {agent.type}
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.Chip icon={getStatusIcon(agent.status)} label={agent.status} size="small" sx={{
                background: `${getStatusColor(agent.status)}20`,
                color: getStatusColor(agent.status),
                border: `1px solid ${getStatusColor(agent.status)}50`
            }}/>
                  </material_1.Box>

                  {/* Метрики */}
                  <material_1.Grid container spacing={2} sx={{ mb: 2 }}>
                    <material_1.Grid item xs={6}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Продуктивність
                      </material_1.Typography>
                      <material_1.Typography variant="h6" sx={{ color: getStatusColor(agent.status), fontWeight: 'bold' }}>
                        {agent.performance}%
                      </material_1.Typography>
                    </material_1.Grid>
                    <material_1.Grid item xs={6}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Завдання
                      </material_1.Typography>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                        {agent.tasks}
                      </material_1.Typography>
                    </material_1.Grid>
                  </material_1.Grid>

                  {/* Прогрес бар */}
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                      Точність: {agent.accuracy}%
                    </material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={agent.accuracy} sx={{
                height: 6,
                borderRadius: 3,
                background: `${nexusTheme_1.nexusColors.background.surface}`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getStatusColor(agent.status)}, ${getStatusColor(agent.status)}60)`,
                    borderRadius: 3
                }
            }}/>
                  </material_1.Box>

                  {/* Ресурси */}
                  <material_1.Grid container spacing={1} sx={{ mb: 2 }}>
                    <material_1.Grid item xs={6}>
                      <material_1.Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <icons_material_1.Memory sx={{ fontSize: 16, color: nexusTheme_1.nexusColors.text.secondary, mr: 0.5 }}/>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          {agent.memory}GB
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Grid>
                    <material_1.Grid item xs={6}>
                      <material_1.Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <icons_material_1.Speed sx={{ fontSize: 16, color: nexusTheme_1.nexusColors.text.secondary, mr: 0.5 }}/>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          {agent.cpu}%
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Grid>
                  </material_1.Grid>

                  {/* Дії */}
                  <material_1.Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <material_1.Tooltip title="Запустити">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleAgentAction(agent.id, 'start');
            }} sx={{ color: nexusTheme_1.nexusColors.success.main }}>
                        <icons_material_1.PlayArrow />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                    <material_1.Tooltip title="Пауза">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleAgentAction(agent.id, 'pause');
            }} sx={{ color: nexusTheme_1.nexusColors.warning.main }}>
                        <icons_material_1.Pause />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                    <material_1.Tooltip title="Перезапустити">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleAgentAction(agent.id, 'restart');
            }} sx={{ color: nexusTheme_1.nexusColors.primary.main }}>
                        <icons_material_1.Refresh />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                    <material_1.Tooltip title="Налаштування">
                      <material_1.IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(agent);
                setConfigDialog(true);
            }} sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        <icons_material_1.Settings />
                      </material_1.IconButton>
                    </material_1.Tooltip>
                  </material_1.Box>

                  {/* Останнє оновлення */}
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary, display: 'block', mt: 1 }}>
                    Оновлено: {agent.lastUpdate}
                  </material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Діалог деталей агента */}
      <material_1.Dialog open={selectedAgent !== null} onClose={() => setSelectedAgent(null)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3
            }
        }}>
        {selectedAgent && (<>
            <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.text.primary, borderBottom: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${getStatusColor(selectedAgent.status)}, ${getStatusColor(selectedAgent.status)}80)`,
                width: 56,
                height: 56
            }}>
                  <icons_material_1.Psychology sx={{ fontSize: '2rem' }}/>
                </material_1.Avatar>
                <material_1.Box>
                  <material_1.Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedAgent.name}
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                    {selectedAgent.type}
                  </material_1.Typography>
                </material_1.Box>
                <material_1.Chip icon={getStatusIcon(selectedAgent.status)} label={selectedAgent.status.toUpperCase()} sx={{
                background: `${getStatusColor(selectedAgent.status)}20`,
                color: getStatusColor(selectedAgent.status),
                border: `1px solid ${getStatusColor(selectedAgent.status)}50`,
                ml: 'auto'
            }}/>
              </material_1.Box>
            </material_1.DialogTitle>
            <material_1.DialogContent sx={{ pt: 3 }}>
              <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                {selectedAgent.description}
              </material_1.Typography>

              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    📊 Метрики
                  </material_1.Typography>
                  <material_1.List>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Продуктивність" secondary={`${selectedAgent.performance}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: getStatusColor(selectedAgent.status), fontWeight: 'bold' }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Виконано завдань" secondary={selectedAgent.tasks} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Точність" secondary={`${selectedAgent.accuracy}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Час роботи" secondary={selectedAgent.uptime} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                  </material_1.List>
                </material_1.Grid>

                <material_1.Grid item xs={12} md={6}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    🛠️ Можливості
                  </material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedAgent.capabilities.map((capability) => (<material_1.Chip key={capability} label={capability} size="small" sx={{
                    background: `${nexusTheme_1.nexusColors.accent.main}20`,
                    color: nexusTheme_1.nexusColors.accent.main,
                    border: `1px solid ${nexusTheme_1.nexusColors.accent.main}40`
                }}/>))}
                  </material_1.Box>

                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mt: 3, mb: 2 }}>
                    💾 Ресурси
                  </material_1.Typography>
                  <material_1.List>
                    <material_1.ListItem>
                      <material_1.ListItemIcon>
                        <icons_material_1.Memory sx={{ color: nexusTheme_1.nexusColors.primary.main }}/>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary="Пам'ять" secondary={`${selectedAgent.memory} GB`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemIcon>
                        <icons_material_1.Speed sx={{ color: nexusTheme_1.nexusColors.warning.main }}/>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary="CPU" secondary={`${selectedAgent.cpu}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                  </material_1.List>
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
          ⚙️ Налаштування агента
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Alert severity="info" sx={{ mb: 2 }}>
            Функція налаштування агентів буде реалізована у наступній версії
          </material_1.Alert>
        </material_1.DialogContent>
      </material_1.Dialog>
    </material_1.Box>);
}
exports.default = AIAgentsModule;
