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
const framer_motion_1 = require("framer-motion");
const recharts_1 = require("recharts");
const SelfImprovementDashboard = () => {
    const [isRunning, setIsRunning] = (0, react_1.useState)(true);
    const [agents, setAgents] = (0, react_1.useState)([
        {
            id: 'self-improvement',
            name: 'Self Improvement',
            status: 'improving',
            improvements: 0,
            efficiency: 95.2,
            lastAction: 'Оптимізація алгоритму розподілу моделей',
            icon: icons_material_1.Psychology,
            color: '#8B5CF6'
        },
        {
            id: 'auto-heal',
            name: 'Auto Heal',
            status: 'active',
            improvements: 0,
            efficiency: 98.7,
            lastAction: 'Виправлено витік пам\'яті в модулі ETL',
            icon: icons_material_1.AutoFixHigh,
            color: '#10B981'
        },
        {
            id: 'performance-optimizer',
            name: 'Performance Optimizer',
            status: 'active',
            improvements: 0,
            efficiency: 92.4,
            lastAction: 'Кешування результатів для повторних запитів',
            icon: icons_material_1.Speed,
            color: '#F59E0B'
        },
        {
            id: 'self-diagnosis',
            name: 'Self Diagnosis',
            status: 'active',
            improvements: 0,
            efficiency: 96.8,
            lastAction: 'Виявлено потенційну проблему з навантаженням',
            icon: icons_material_1.Assignment,
            color: '#EF4444'
        }
    ]);
    const [systemMetrics, setSystemMetrics] = (0, react_1.useState)([]);
    const [businessInsights, setBusinessInsights] = (0, react_1.useState)([]);
    // Симуляція роботи агентів
    (0, react_1.useEffect)(() => {
        if (!isRunning)
            return;
        const interval = setInterval(() => {
            // Оновлення агентів
            setAgents(prev => prev.map(agent => {
                const shouldImprove = Math.random() < 0.3; // 30% шансу на покращення
                if (shouldImprove) {
                    const improvements = [
                        'Оптимізація алгоритму розподілу моделей',
                        'Покращення accuracy прогнозування на 2.3%',
                        'Зменшення латентності відповіді на 150ms',
                        'Автоматичне налаштування параметрів',
                        'Оптимізація використання пам\'яті на 12%',
                        'Виправлено deadlock в черзі завдань',
                        'Відновлено з\'єднання з базою даних',
                        'Кешування результатів запитів',
                        'Паралелізація обробки в агентах'
                    ];
                    return Object.assign(Object.assign({}, agent), { status: 'improving', improvements: agent.improvements + 1, efficiency: Math.min(100, agent.efficiency + Math.random() * 2), lastAction: improvements[Math.floor(Math.random() * improvements.length)] });
                }
                return Object.assign(Object.assign({}, agent), { status: Math.random() < 0.8 ? 'active' : 'idle' });
            }));
            // Оновлення системних метрик
            const newMetric = {
                timestamp: new Date().toLocaleTimeString(),
                health: 85 + Math.random() * 15,
                performance: 80 + Math.random() * 20,
                efficiency: 88 + Math.random() * 12,
                learning: Math.random() * 100
            };
            setSystemMetrics(prev => [...prev.slice(-19), newMetric]);
            // Генерація бізнес-інсайтів
            if (Math.random() < 0.2) { // 20% шансу на новий інсайт
                const insights = [
                    {
                        type: 'Банківська схема',
                        description: 'Детектовано підозрілі транзакції на суму $2.3M',
                        severity: 'high'
                    },
                    {
                        type: 'Чиновницька корупція',
                        description: 'Виявлено нетипові фінансові потоки в держзакупівлях',
                        severity: 'critical'
                    },
                    {
                        type: 'Бізнес-прогнозування',
                        description: 'Прогноз падіння ринку IT-послуг на 12% в Q4',
                        severity: 'medium'
                    },
                    {
                        type: 'Податкова оптимізація',
                        description: 'Знайдено легальну схему економії $450K на податках',
                        severity: 'low'
                    }
                ];
                const insight = insights[Math.floor(Math.random() * insights.length)];
                const newInsight = Object.assign(Object.assign({ id: Date.now().toString() }, insight), { confidence: 75 + Math.random() * 25, timestamp: new Date().toLocaleTimeString() });
                setBusinessInsights(prev => [newInsight, ...prev.slice(0, 9)]);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [isRunning]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'improving': return '#8B5CF6';
            case 'active': return '#10B981';
            case 'idle': return '#6B7280';
            default: return '#6B7280';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#EF4444';
            case 'high': return '#F59E0B';
            case 'medium': return '#3B82F6';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };
    return (<material_1.Box sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Заголовок */}
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.Avatar sx={{ bgcolor: '#8B5CF6', width: 56, height: 56 }}>
            <icons_material_1.Psychology sx={{ fontSize: 32 }}/>
          </material_1.Avatar>
          <material_1.Box>
            <material_1.Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              🤖 Система Самовдосконалення
            </material_1.Typography>
            <material_1.Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Predator Analytics Nexus Core v2.0 - Live Dashboard
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>

        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          <material_1.Tooltip title={isRunning ? 'Призупинити' : 'Запустити'}>
            <material_1.IconButton onClick={() => setIsRunning(!isRunning)} sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
        }}>
              {isRunning ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}
            </material_1.IconButton>
          </material_1.Tooltip>
          <material_1.Tooltip title="Оновити">
            <material_1.IconButton sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
        }}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Box>

      <material_1.Grid container spacing={3}>
        {/* Агенти самовдосконалення */}
        <material_1.Grid item xs={12} lg={8}>
          <material_1.Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <icons_material_1.Psychology color="primary"/>
                Агенти Самовдосконалення
                <material_1.Chip label={`${agents.filter(a => a.status === 'active' || a.status === 'improving').length} активні`} color="success" size="small"/>
              </material_1.Typography>

              <material_1.Grid container spacing={2}>
                {agents.map((agent) => (<material_1.Grid item xs={12} sm={6} key={agent.id}>
                    <framer_motion_1.motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                      <material_1.Paper elevation={2} sx={{
                p: 2,
                border: `2px solid ${getStatusColor(agent.status)}`,
                bgcolor: agent.status === 'improving' ? `${agent.color}10` : 'white'
            }}>
                        <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <material_1.Avatar sx={{ bgcolor: agent.color, mr: 2 }}>
                            <agent.icon />
                          </material_1.Avatar>
                          <material_1.Box sx={{ flexGrow: 1 }}>
                            <material_1.Typography variant="subtitle2" fontWeight="bold">
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
                          📈 Покращень: {agent.improvements}
                        </material_1.Typography>

                        <material_1.Box sx={{ mb: 2 }}>
                          <material_1.Typography variant="body2" color="text.secondary">
                            Ефективність: {agent.efficiency.toFixed(1)}%
                          </material_1.Typography>
                          <material_1.LinearProgress variant="determinate" value={agent.efficiency} sx={{
                mt: 1,
                '& .MuiLinearProgress-bar': {
                    bgcolor: agent.color
                }
            }}/>
                        </material_1.Box>

                        <material_1.Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                          🔧 {agent.lastAction}
                        </material_1.Typography>
                      </material_1.Paper>
                    </framer_motion_1.motion.div>
                  </material_1.Grid>))}
              </material_1.Grid>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Бізнес-інсайти */}
        <material_1.Grid item xs={12} lg={4}>
          <material_1.Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', height: 'fit-content' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <icons_material_1.Security color="primary"/>
                Бізнес-Інсайти
                <material_1.Chip label={`${businessInsights.length} активні`} color="info" size="small"/>
              </material_1.Typography>

              <material_1.List dense>
                <framer_motion_1.AnimatePresence>
                  {businessInsights.slice(0, 5).map((insight) => (<framer_motion_1.motion.div key={insight.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <material_1.ListItem sx={{ px: 0 }}>
                        <material_1.ListItemAvatar>
                          <material_1.Avatar sx={{ bgcolor: getSeverityColor(insight.severity), width: 32, height: 32 }}>
                            <icons_material_1.TrendingUp fontSize="small"/>
                          </material_1.Avatar>
                        </material_1.ListItemAvatar>
                        <material_1.ListItemText primary={<material_1.Typography variant="body2" fontWeight="bold">
                              {insight.type}
                            </material_1.Typography>} secondary={<material_1.Box>
                              <material_1.Typography variant="caption" display="block">
                                {insight.description}
                              </material_1.Typography>
                              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <material_1.Chip label={`${insight.confidence.toFixed(0)}%`} size="small" color="primary" variant="outlined"/>
                                <material_1.Typography variant="caption" color="text.secondary">
                                  {insight.timestamp}
                                </material_1.Typography>
                              </material_1.Box>
                            </material_1.Box>}/>
                      </material_1.ListItem>
                    </framer_motion_1.motion.div>))}
                </framer_motion_1.AnimatePresence>
              </material_1.List>

              {businessInsights.length === 0 && (<material_1.Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                  Очікування нових інсайтів...
                </material_1.Typography>)}
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Графіки системних метрик */}
        <material_1.Grid item xs={12}>
          <material_1.Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <icons_material_1.TrendingUp color="primary"/>
                Системні Метрики в Реальному Часі
              </material_1.Typography>

              <recharts_1.ResponsiveContainer width="100%" height={300}>
                <recharts_1.AreaChart data={systemMetrics}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="timestamp"/>
                  <recharts_1.YAxis domain={[0, 100]}/>
                  <recharts_1.Tooltip />
                  <recharts_1.Area type="monotone" dataKey="health" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Здоров'я системи"/>
                  <recharts_1.Area type="monotone" dataKey="performance" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Продуктивність"/>
                  <recharts_1.Area type="monotone" dataKey="efficiency" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Ефективність"/>
                </recharts_1.AreaChart>
              </recharts_1.ResponsiveContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = SelfImprovementDashboard;
