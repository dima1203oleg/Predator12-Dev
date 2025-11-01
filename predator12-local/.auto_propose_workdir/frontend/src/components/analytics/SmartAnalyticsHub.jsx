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
exports.SmartAnalyticsHub = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const performanceMetrics = [
    {
        id: 'ai-efficiency',
        name: 'AI Ефективність',
        value: 94.2,
        unit: '%',
        trend: 'up',
        category: 'ai',
        icon: <icons_material_1.Psychology />,
        color: '#4CAF50',
        description: 'Загальна ефективність роботи AI агентів',
        recommendations: [
            'Оптимізувати алгоритми обробки',
            'Збільшити обчислювальні ресурси',
            'Покращити якість тренувальних даних'
        ]
    },
    {
        id: 'system-performance',
        name: 'Продуктивність',
        value: 87.5,
        unit: '%',
        trend: 'stable',
        category: 'system',
        icon: <icons_material_1.Speed />,
        color: '#2196F3',
        description: 'Загальна продуктивність системи',
        recommendations: [
            'Очистити кеш системи',
            'Оптимізувати база даних',
            'Перевірити мережеві з\'єднання'
        ]
    },
    {
        id: 'security-score',
        name: 'Безпека',
        value: 98.1,
        unit: '%',
        trend: 'up',
        category: 'system',
        icon: <icons_material_1.Security />,
        color: '#4CAF50',
        description: 'Рівень захищеності системи',
        recommendations: [
            'Оновити сертифікати безпеки',
            'Провести аудит доступу',
            'Налаштувати додаткові алерти'
        ]
    },
    {
        id: 'user-satisfaction',
        name: 'Задоволеність',
        value: 92.8,
        unit: '%',
        trend: 'up',
        category: 'user',
        icon: <icons_material_1.Star />,
        color: '#FF9800',
        description: 'Рівень задоволеності користувачів',
        recommendations: [
            'Покращити інтерфейс користувача',
            'Додати нові функції',
            'Оптимізувати швидкість відповіді'
        ]
    },
    {
        id: 'business-impact',
        name: 'Бізнес Вплив',
        value: 156.3,
        unit: 'M₴',
        trend: 'up',
        category: 'business',
        icon: <icons_material_1.TrendingUp />,
        color: '#4CAF50',
        description: 'Загальний економічний ефект',
        recommendations: [
            'Розширити сферу застосування',
            'Інтегрувати з іншими системами',
            'Автоматизувати більше процесів'
        ]
    }
];
const sampleInsights = [
    {
        id: '1',
        title: 'Пікова навантага о 14:00',
        description: 'Система показує найвищу активність о 14:00. Рекомендується додати ресурси.',
        impact: 'high',
        category: 'Продуктивність',
        timestamp: new Date(),
        actionable: true,
        metric: 'system-performance'
    },
    {
        id: '2',
        title: 'AI агенти покращили ефективність',
        description: 'За останній тиждень ефективність AI агентів зросла на 12%.',
        impact: 'medium',
        category: 'AI',
        timestamp: new Date(Date.now() - 3600000),
        actionable: false,
        metric: 'ai-efficiency'
    },
    {
        id: '3',
        title: 'Нові потенційні загрози виявлено',
        description: 'Система безпеки виявила 3 нові потенційні загрози. Потрібна увага.',
        impact: 'high',
        category: 'Безпека',
        timestamp: new Date(Date.now() - 7200000),
        actionable: true,
        metric: 'security-score'
    }
];
const SmartAnalyticsHub = ({ onMetricClick, onInsightAction }) => {
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [insights, setInsights] = (0, react_1.useState)(sampleInsights);
    const [selectedMetric, setSelectedMetric] = (0, react_1.useState)(null);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const [lastUpdate, setLastUpdate] = (0, react_1.useState)(new Date());
    // Auto-refresh logic
    (0, react_1.useEffect)(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                setLastUpdate(new Date());
                // Simulate data updates
                setInsights(prev => prev.map(insight => (Object.assign(Object.assign({}, insight), { timestamp: new Date(insight.timestamp.getTime() + Math.random() * 60000) }))));
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);
    const categories = ['all', 'system', 'ai', 'user', 'business'];
    const filteredMetrics = performanceMetrics.filter(metric => (selectedCategory === 'all' || metric.category === selectedCategory) &&
        metric.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredInsights = insights.filter(insight => insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'high': return '#F44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#2196F3';
        }
    };
    const getImpactIcon = (impact) => {
        switch (impact) {
            case 'high': return <icons_material_1.Error />;
            case 'medium': return <icons_material_1.Warning />;
            case 'low': return <icons_material_1.Info />;
            default: return <icons_material_1.Info />;
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <icons_material_1.TrendingUp sx={{ color: '#4CAF50' }}/>;
            case 'down': return <icons_material_1.TrendingUp sx={{ color: '#F44336', transform: 'rotate(180deg)' }}/>;
            case 'stable': return <icons_material_1.CheckCircle sx={{ color: '#FF9800' }}/>;
            default: return <icons_material_1.CheckCircle />;
        }
    };
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="h4" sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
        }}>
          🧠 Smart Analytics Hub
        </material_1.Typography>
        <material_1.Typography variant="subtitle1" color="text.secondary">
          Розумна аналітика та інсайти системи
        </material_1.Typography>
      </material_1.Box>

      {/* Controls */}
      <material_1.Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <material_1.TextField size="small" placeholder="Пошук метрик та інсайтів..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{
            startAdornment: (<material_1.InputAdornment position="start">
                <icons_material_1.Search />
              </material_1.InputAdornment>)
        }} sx={{ minWidth: 250 }}/>

        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          {categories.map((category) => (<material_1.Chip key={category} label={category === 'all' ? 'Всі' : category.toUpperCase()} onClick={() => setSelectedCategory(category)} variant={selectedCategory === category ? 'filled' : 'outlined'} sx={Object.assign({}, (selectedCategory === category && {
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }))}/>))}
        </material_1.Box>

        <material_1.Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <material_1.Typography variant="caption" color="text.secondary">
            Оновлено: {lastUpdate.toLocaleTimeString()}
          </material_1.Typography>
          <material_1.Tooltip title="Автооновлення">
            <material_1.IconButton size="small" onClick={() => setAutoRefresh(!autoRefresh)} sx={{
            color: autoRefresh ? '#4CAF50' : 'text.secondary'
        }}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Box>

      {/* Performance Metrics Grid */}
      <material_1.Box sx={{ mb: 4 }}>
        <material_1.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <icons_material_1.Analytics />
          Ключові метрики продуктивності
        </material_1.Typography>

        <material_1.Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2
        }}>
          {filteredMetrics.map((metric, index) => (<framer_motion_1.motion.div key={metric.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <material_1.Card sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }
            }} onClick={() => {
                setSelectedMetric(metric);
                onMetricClick === null || onMetricClick === void 0 ? void 0 : onMetricClick(metric);
            }}>
                <material_1.CardContent sx={{ p: 3 }}>
                  <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <material_1.Avatar sx={{
                bgcolor: metric.color,
                width: 50,
                height: 50
            }}>
                        {metric.icon}
                      </material_1.Avatar>
                      <material_1.Box>
                        <material_1.Typography variant="h6" fontWeight="bold">
                          {metric.name}
                        </material_1.Typography>
                        <material_1.Chip label={metric.category.toUpperCase()} size="small" sx={{
                bgcolor: metric.color,
                color: 'white',
                fontSize: '0.7rem'
            }}/>
                      </material_1.Box>
                    </material_1.Box>
                    {getTrendIcon(metric.trend)}
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="h3" sx={{
                color: metric.color,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'baseline',
                gap: 1
            }}>
                      {metric.value}
                      <material_1.Typography variant="h6" component="span" sx={{ color: 'text.secondary' }}>
                        {metric.unit}
                      </material_1.Typography>
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.description}
                  </material_1.Typography>

                  <material_1.LinearProgress variant="determinate" value={metric.unit === '%' ? metric.value : Math.min(metric.value / 200 * 100, 100)} sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                    backgroundColor: metric.color,
                    borderRadius: 3
                }
            }}/>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>))}
        </material_1.Box>
      </material_1.Box>

      {/* Smart Insights */}
      <material_1.Box>
        <material_1.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <icons_material_1.Lightbulb />
          Розумні інсайти та рекомендації
        </material_1.Typography>

        <material_1.List sx={{ bgcolor: 'transparent' }}>
          {filteredInsights.map((insight, index) => (<framer_motion_1.motion.div key={insight.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
              <material_1.Card sx={{
                mb: 2,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateX(10px)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                }
            }}>
                <material_1.ListItem sx={{
                p: 3,
                flexDirection: 'column',
                alignItems: 'stretch'
            }}>
                  <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <material_1.Avatar sx={{
                bgcolor: getImpactColor(insight.impact),
                width: 40,
                height: 40
            }}>
                        {getImpactIcon(insight.impact)}
                      </material_1.Avatar>
                      <material_1.Box>
                        <material_1.Typography variant="h6" fontWeight="bold">
                          {insight.title}
                        </material_1.Typography>
                        <material_1.Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <material_1.Chip label={insight.impact.toUpperCase()} size="small" sx={{
                bgcolor: getImpactColor(insight.impact),
                color: 'white',
                fontSize: '0.7rem'
            }}/>
                          <material_1.Chip label={insight.category} size="small" variant="outlined"/>
                        </material_1.Box>
                      </material_1.Box>
                    </material_1.Box>
                    <material_1.Typography variant="caption" color="text.secondary">
                      {insight.timestamp.toLocaleTimeString()}
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                    {insight.description}
                  </material_1.Typography>

                  {insight.actionable && (<material_1.Box sx={{ display: 'flex', gap: 1 }}>
                      <material_1.Button variant="contained" size="small" startIcon={<icons_material_1.AutoAwesome />} onClick={() => onInsightAction === null || onInsightAction === void 0 ? void 0 : onInsightAction(insight)} sx={{
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                }}>
                        Виконати дію
                      </material_1.Button>
                      <material_1.Button variant="outlined" size="small" startIcon={<icons_material_1.Share />}>
                        Поділитися
                      </material_1.Button>
                    </material_1.Box>)}
                </material_1.ListItem>
              </material_1.Card>
            </framer_motion_1.motion.div>))}
        </material_1.List>
      </material_1.Box>

      {/* Metric Detail Dialog */}
      <framer_motion_1.AnimatePresence>
        {selectedMetric && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }} onClick={() => setSelectedMetric(null)}>
            <framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <material_1.Card sx={{
                width: { xs: '90%', sm: 500 },
                maxHeight: '80vh',
                overflow: 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <material_1.CardContent sx={{ p: 3 }}>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <material_1.Avatar sx={{
                bgcolor: selectedMetric.color,
                width: 60,
                height: 60
            }}>
                      {selectedMetric.icon}
                    </material_1.Avatar>
                    <material_1.Box>
                      <material_1.Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedMetric.name}
                      </material_1.Typography>
                      <material_1.Typography variant="h3" sx={{ color: selectedMetric.color }}>
                        {selectedMetric.value} {selectedMetric.unit}
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.Box>

                  <material_1.Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                    {selectedMetric.description}
                  </material_1.Typography>

                  {selectedMetric.recommendations && (<material_1.Box>
                      <material_1.Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Рекомендації:
                      </material_1.Typography>
                      <material_1.List>
                        {selectedMetric.recommendations.map((rec, index) => (<material_1.ListItem key={index} sx={{ py: 0.5 }}>
                            <material_1.ListItemIcon>
                              <icons_material_1.CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }}/>
                            </material_1.ListItemIcon>
                            <material_1.ListItemText primary={rec} sx={{ color: 'rgba(255,255,255,0.8)' }}/>
                          </material_1.ListItem>))}
                      </material_1.List>
                    </material_1.Box>)}

                  <material_1.Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <material_1.Button variant="contained" onClick={() => setSelectedMetric(null)} sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                }
            }}>
                      Закрити
                    </material_1.Button>
                  </material_1.Box>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </material_1.Box>);
};
exports.SmartAnalyticsHub = SmartAnalyticsHub;
exports.default = exports.SmartAnalyticsHub;
