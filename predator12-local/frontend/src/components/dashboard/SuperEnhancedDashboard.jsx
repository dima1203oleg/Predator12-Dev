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
const SuperEnhancedDashboard = () => {
    var _a, _b;
    // Стани компонента
    const [activeTab, setActiveTab] = (0, react_1.useState)(0);
    const [systemRunning, setSystemRunning] = (0, react_1.useState)(true);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const [refreshInterval, setRefreshInterval] = (0, react_1.useState)(5);
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterCategory, setFilterCategory] = (0, react_1.useState)('all');
    // Дані системи
    const [systemMetrics, setSystemMetrics] = (0, react_1.useState)([]);
    const [agents, setAgents] = (0, react_1.useState)([
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
    const [businessInsights, setBusinessInsights] = (0, react_1.useState)([
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
    (0, react_1.useEffect)(() => {
        const generateMetrics = () => {
            const now = new Date();
            const metric = {
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
    (0, react_1.useEffect)(() => {
        if (!autoRefresh || !systemRunning)
            return;
        const updateAgents = () => {
            setAgents(prev => prev.map(agent => (Object.assign(Object.assign({}, agent), { performance: Math.max(85, Math.min(100, agent.performance + (Math.random() - 0.5) * 2)), tasks: agent.tasks + Math.floor(Math.random() * 3), lastActivity: ['1 second ago', '2 seconds ago', '3 seconds ago'][Math.floor(Math.random() * 3)] }))));
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
        }
        else {
            setSystemRunning(!systemRunning);
        }
    };
    const handleRefresh = () => {
        window.location.reload();
    };
    const handleAgentClick = (agentId) => {
        setSelectedAgent(agentId);
        setDialogOpen(true);
    };
    const handleActionClick = (action, insightId) => {
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
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    var _a;
                    try {
                        const data = JSON.parse((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
                        if (data.systemConfig) {
                            setAutoRefresh(data.systemConfig.autoRefresh);
                            setRefreshInterval(data.systemConfig.refreshInterval);
                            alert('Конфігурацію успішно імпортовано!');
                        }
                    }
                    catch (error) {
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
            setAgents(prev => prev.map(agent => (Object.assign(Object.assign({}, agent), { performance: 100, lastActivity: 'just restarted', uptime: '0m' }))));
            alert('Агенти успішно перезапущені!');
        }
    };
    const handleClearLogs = () => {
        if (window.confirm('Очистити всі логи? Ця дія незворотна.')) {
            setSystemMetrics([]);
            alert('Логи успішно очищені!');
        }
    };
    const handleViewAgentLogs = (agentId) => {
        var _a;
        alert(`Відкриваю логи для агента: ${(_a = agents.find(a => a.id === agentId)) === null || _a === void 0 ? void 0 : _a.name}`);
    };
    const handleConfigureAgent = (agentId) => {
        var _a;
        alert(`Відкриваю налаштування для агента: ${(_a = agents.find(a => a.id === agentId)) === null || _a === void 0 ? void 0 : _a.name}`);
    };
    const handleRestartAgent = (agentId) => {
        var _a;
        if (window.confirm(`Перезапустити агента ${(_a = agents.find(a => a.id === agentId)) === null || _a === void 0 ? void 0 : _a.name}?`)) {
            setAgents(prev => prev.map(agent => agent.id === agentId
                ? Object.assign(Object.assign({}, agent), { performance: 100, lastActivity: 'just restarted', uptime: '0m' }) : agent));
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
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'idle': return '#FF9800';
            case 'error': return '#F44336';
            case 'maintenance': return '#2196F3';
            default: return '#9E9E9E';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#F44336';
            case 'high': return '#FF5722';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'banking': return '🏦';
            case 'government': return '🏛️';
            case 'market': return '📈';
            case 'security': return '🛡️';
            default: return '💼';
        }
    };
    // Helper functions for rendering tabs
    const renderOverviewTab = () => {
        var _a, _b, _c;
        return (<material_1.Grid container spacing={3}>
        {/* Статус системи */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Card sx={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)', color: '#fff', height: '100%' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom sx={{ color: '#00ff66', textAlign: 'center', mb: 3 }}>
                🤖 Статус Nexus Core
              </material_1.Typography>
              <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <material_1.Box sx={{ textAlign: 'center' }}>
                  <material_1.Typography variant="h3" sx={{ color: systemRunning ? '#00ff66' : '#ff6666', mb: 1 }}>
                    {systemRunning ? '✓' : '✗'}
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: '#ccc' }}>
                    Система {systemRunning ? 'Активна' : 'Зупинена'}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>CPU:</material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: '#00ff66' }}>
                    {systemMetrics.length > 0 ? `${(_a = systemMetrics[systemMetrics.length - 1]) === null || _a === void 0 ? void 0 : _a.cpu.toFixed(1)}%` : '0%'}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>Memory:</material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: '#0099ff' }}>
                    {systemMetrics.length > 0 ? `${(_b = systemMetrics[systemMetrics.length - 1]) === null || _b === void 0 ? void 0 : _b.memory.toFixed(1)}%` : '0%'}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>Network:</material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: '#82ca9d' }}>
                    {systemMetrics.length > 0 ? `${(_c = systemMetrics[systemMetrics.length - 1]) === null || _c === void 0 ? void 0 : _c.network.toFixed(1)}%` : '0%'}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>Agents:</material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: '#ffaa00' }}>
                    {agents.filter(a => a.status === 'active').length}/{agents.length}
                  </material_1.Typography>
                </material_1.Box>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Системні метрики */}
        <material_1.Grid item xs={12} md={8}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Системні метрики в реальному часі
              </material_1.Typography>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.LineChart data={systemMetrics}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="timestamp"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Line type="monotone" dataKey="cpu" stroke="#ff7300" name="CPU %"/>
                  <recharts_1.Line type="monotone" dataKey="memory" stroke="#8884d8" name="Memory %"/>
                  <recharts_1.Line type="monotone" dataKey="network" stroke="#82ca9d" name="Network %"/>
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Швидкі статистики */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ bgcolor: '#e3f2fd' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h4" color="primary">
                    {agents.filter(a => a.status === 'active').length}
                  </material_1.Typography>
                  <material_1.Typography color="text.secondary">Активні агенти</material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ bgcolor: '#f3e5f5' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h4" color="secondary">
                    {businessInsights.length}
                  </material_1.Typography>
                  <material_1.Typography color="text.secondary">Нові інсайти</material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
            <material_1.Grid item xs={12}>
              <material_1.Card sx={{ bgcolor: '#e8f5e8' }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h4" style={{ color: '#4CAF50' }}>
                    98.5%
                  </material_1.Typography>
                  <material_1.Typography color="text.secondary">Uptime системи</material_1.Typography>
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Grid>);
    };
    const renderAgentsTab = () => {
        const agentCardStyle = {
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
        };
        return (<material_1.Grid container spacing={3}>
        {agents.map((agent) => (<material_1.Grid item xs={12} sm={6} md={4} key={agent.id}>
            <material_1.Card sx={agentCardStyle} onClick={() => handleAgentClick(agent.id)}>
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <material_1.Avatar sx={{ bgcolor: getStatusColor(agent.status), mr: 2 }}>
                    <icons_material_1.SmartToy />
                  </material_1.Avatar>
                  <material_1.Box sx={{ flexGrow: 1 }}>
                    <material_1.Typography variant="h6" noWrap>
                      {agent.name}
                    </material_1.Typography>
                    <material_1.Chip label={agent.status} size="small" sx={{
                    bgcolor: getStatusColor(agent.status),
                    color: 'white',
                    textTransform: 'capitalize'
                }}/>
                  </material_1.Box>
                </material_1.Box>

                <material_1.Typography variant="body2" color="text.secondary" gutterBottom>
                  Продуктивність: {agent.performance.toFixed(1)}%
                </material_1.Typography>
                <material_1.LinearProgress variant="determinate" value={agent.performance} sx={{ mb: 2 }}/>

                <material_1.Typography variant="caption" display="block">
                  📋 Завдань: {agent.tasks}
                </material_1.Typography>
                <material_1.Typography variant="caption" display="block">
                  ⏱️ Uptime: {agent.uptime}
                </material_1.Typography>
                <material_1.Typography variant="caption" display="block">
                  🔄 Остання активність: {agent.lastActivity}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>))}
      </material_1.Grid>);
    };
    const renderInsightsTab = () => {
        return (<material_1.Grid container spacing={3}>
        {filteredInsights.map((insight) => (<material_1.Grid item xs={12} key={insight.id}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <material_1.Typography variant="h6">
                      {getCategoryIcon(insight.category)} {insight.title}
                    </material_1.Typography>
                    <material_1.Chip label={insight.severity} size="small" sx={{
                    bgcolor: getSeverityColor(insight.severity),
                    color: 'white',
                    textTransform: 'capitalize'
                }}/>
                    <material_1.Chip label={`${insight.confidence.toFixed(1)}% впевненості`} variant="outlined" size="small"/>
                  </material_1.Box>
                  <material_1.Typography variant="caption" color="text.secondary">
                    {insight.timestamp}
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Typography variant="body1" paragraph>
                  {insight.description}
                </material_1.Typography>

                <material_1.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {insight.actions.map((action, index) => (<material_1.Button key={index} variant="outlined" size="small" onClick={() => handleActionClick(action, insight.id)}>
                      {action}
                    </material_1.Button>))}
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>))}
      </material_1.Grid>);
    };
    const renderAnalyticsTab = () => {
        return (<material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Розподіл типів інсайтів
              </material_1.Typography>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.PieChart>
                  <recharts_1.Pie data={[
                { name: 'Банківські', value: 35, fill: '#8884d8' },
                { name: 'Державні', value: 25, fill: '#82ca9d' },
                { name: 'Ринкові', value: 30, fill: '#ffc658' },
                { name: 'Безпека', value: 10, fill: '#ff7300' }
            ]} cx="50%" cy="50%" outerRadius={80} dataKey="value"/>
                  <recharts_1.Tooltip />
                </recharts_1.PieChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Продуктивність агентів
              </material_1.Typography>
              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.BarChart data={agents}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="name" angle={-45} textAnchor="end" height={100}/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip />
                  <recharts_1.Bar dataKey="performance" fill="#8884d8"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>);
    };
    const renderSettingsTab = () => {
        return (<material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Системні налаштування
              </material_1.Typography>
              <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Автоматичні оновлення агентів"/>
                <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Real-time моніторинг"/>
                <material_1.FormControlLabel control={<material_1.Switch />} label="Debug режим"/>
                <material_1.FormControlLabel control={<material_1.Switch defaultChecked/>} label="Збереження логів"/>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Дії системи
              </material_1.Typography>
              <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Download />} onClick={handleExportData}>
                  Експорт даних
                </material_1.Button>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Upload />} onClick={handleImportConfig}>
                  Імпорт конфігурації
                </material_1.Button>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={handleRestartAgents}>
                  Перезапуск агентів
                </material_1.Button>
                <material_1.Button variant="outlined" color="error" startIcon={<icons_material_1.Delete />} onClick={handleClearLogs}>
                  Очистити логи
                </material_1.Button>
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>);
    };
    return (<material_1.Box component="div" sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Заголовок з контролами */}
      <material_1.Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <material_1.Box component="div">
          <material_1.Typography variant="h4" fontWeight="bold" color="primary">
            🤖 Predator Analytics Nexus
          </material_1.Typography>
          <material_1.Typography variant="subtitle1" color="text.secondary">
            Система безперервного самовдосконалення та бізнес-аналітики
          </material_1.Typography>
        </material_1.Box>

        <material_1.Box component="div" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <material_1.FormControlLabel control={<material_1.Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} color="primary"/>} label="Авто-оновлення"/>

          <material_1.FormControl size="small" sx={{ minWidth: 120 }}>
            <material_1.InputLabel>Інтервал</material_1.InputLabel>
            <material_1.Select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} label="Інтервал">
              <material_1.MenuItem value={1}>1 сек</material_1.MenuItem>
              <material_1.MenuItem value={5}>5 сек</material_1.MenuItem>
              <material_1.MenuItem value={10}>10 сек</material_1.MenuItem>
              <material_1.MenuItem value={30}>30 сек</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>

          <material_1.Tooltip title={systemRunning ? 'Зупинити систему' : 'Запустити систему'}>
            <material_1.IconButton onClick={handleStartStop} color={systemRunning ? 'error' : 'success'} size="large">
              {systemRunning ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Оновити">
            <material_1.IconButton onClick={handleRefresh} color="primary">
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Box>

      {/* Статус система */}
      <material_1.Card sx={{ mb: 3, bgcolor: systemRunning ? '#e8f5e8' : '#ffebee' }}>
        <material_1.CardContent>
          <material_1.Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {systemRunning ? <icons_material_1.CheckCircle color="success"/> : <icons_material_1.Warning color="error"/>}
            <material_1.Typography variant="h6">
              Статус системи: {systemRunning ? '🟢 Активна' : '🔴 Зупинена'}
            </material_1.Typography>
            <material_1.Chip label={`${agents.filter(a => a.status === 'active').length}/${agents.length} агентів активні`} color={systemRunning ? 'success' : 'default'}/>
          </material_1.Box>
        </material_1.CardContent>
      </material_1.Card>

      {/* Вкладки */}
      <material_1.Card sx={{ mb: 3 }}>
        <material_1.Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <material_1.Tab label="📊 Огляд системи"/>
          <material_1.Tab label="🤖 Агенти"/>
          <material_1.Tab label="💼 Бізнес-інсайти"/>
          <material_1.Tab label="📈 Аналітика"/>
          <material_1.Tab label="⚙️ Налаштування"/>
        </material_1.Tabs>
      </material_1.Card>

      {/* Вміст вкладок */}
      <framer_motion_1.AnimatePresence mode="wait">
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
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
        </framer_motion_1.motion.div>
      </framer_motion_1.AnimatePresence>

      {/* Діалог деталей агента */}
      <material_1.Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <material_1.DialogTitle>
          Деталі агента: {selectedAgent && ((_a = agents.find(a => a.id === selectedAgent)) === null || _a === void 0 ? void 0 : _a.name)}
        </material_1.DialogTitle>
        <material_1.DialogContent>
          {selectedAgent && (<material_1.Box sx={{ pt: 2 }}>
              <material_1.Typography variant="h6" gutterBottom>
                Статистика продуктивності
              </material_1.Typography>
              <material_1.LinearProgress variant="determinate" value={((_b = agents.find(a => a.id === selectedAgent)) === null || _b === void 0 ? void 0 : _b.performance) || 0} sx={{ mb: 2 }}/>
              <material_1.Typography variant="body2" paragraph>
                Агент працює стабільно з високою продуктивністю.
                Виконує завдання самовдосконалення системи в автоматичному режимі.
              </material_1.Typography>

              <material_1.Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Visibility />} onClick={() => handleViewAgentLogs(selectedAgent)}>
                  Переглянути логи
                </material_1.Button>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Edit />} onClick={() => handleConfigureAgent(selectedAgent)}>
                  Налаштування
                </material_1.Button>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={() => handleRestartAgent(selectedAgent)}>
                  Перезапустити
                </material_1.Button>
              </material_1.Box>
            </material_1.Box>)}
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setDialogOpen(false)}>Закрити</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = SuperEnhancedDashboard;
