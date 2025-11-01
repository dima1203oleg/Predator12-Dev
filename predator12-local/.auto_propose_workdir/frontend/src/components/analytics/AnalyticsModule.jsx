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
// Моковані аналітичні дані
const generateAnalyticsData = () => ({
    overview: {
        totalRequests: Math.floor(Math.random() * 50000) + 100000,
        successRate: Math.random() * 10 + 85,
        avgResponseTime: Math.random() * 100 + 150,
        activeUsers: Math.floor(Math.random() * 100) + 200,
        errorRate: Math.random() * 3 + 1,
        uptime: Math.random() * 2 + 97 // 97-99%
    },
    aiMetrics: {
        modelsOnline: 47,
        totalModels: 52,
        agentsActive: 32,
        totalAgents: 38,
        avgAccuracy: Math.random() * 5 + 92,
        processingTasks: Math.floor(Math.random() * 500) + 1000
    },
    performance: {
        cpuTrend: Array.from({ length: 24 }, () => Math.random() * 40 + 30),
        memoryTrend: Array.from({ length: 24 }, () => Math.random() * 30 + 40),
        requestsTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10000) + 5000),
        latencyTrend: Array.from({ length: 24 }, () => Math.random() * 50 + 100)
    },
    usage: {
        topModels: [
            { name: 'GPT-4 Turbo', requests: 15420, percentage: 32.1 },
            { name: 'Claude 3.5 Sonnet', requests: 8930, percentage: 18.6 },
            { name: 'Gemini Pro', requests: 12680, percentage: 26.4 },
            { name: 'Llama 3.1 70B', requests: 5640, percentage: 11.7 },
            { name: 'Command R+', requests: 5330, percentage: 11.2 }
        ],
        topAgents: [
            { name: 'Nexus Prime', tasks: 1247, efficiency: 98.5 },
            { name: 'Security Guardian', tasks: 2341, efficiency: 99.1 },
            { name: 'NLP Processor', tasks: 1876, efficiency: 92.4 },
            { name: 'Anomaly Hunter', tasks: 1098, efficiency: 96.3 },
            { name: 'Data Analyzer', tasks: 856, efficiency: 94.2 }
        ]
    },
    alerts: [
        { id: 1, type: 'warning', message: 'Підвищене навантаження на GPU', time: '2 хв тому' },
        { id: 2, type: 'info', message: 'Оновлення моделі GPT-4 завершено', time: '15 хв тому' },
        { id: 3, type: 'success', message: 'Система досягла 99.8% uptime', time: '1 год тому' }
    ]
});
function AnalyticsModule() {
    const [analyticsData, setAnalyticsData] = (0, react_1.useState)(generateAnalyticsData());
    const [selectedTab, setSelectedTab] = (0, react_1.useState)(0);
    const [timeRange, setTimeRange] = (0, react_1.useState)('24h');
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    // Автооновлення даних
    (0, react_1.useEffect)(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            setAnalyticsData(generateAnalyticsData());
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh]);
    const formatNumber = (num) => {
        if (num >= 1000000)
            return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000)
            return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };
    const getTrendColor = (value, threshold = 0) => {
        return value > threshold ? nexusTheme_1.nexusColors.success.main : nexusTheme_1.nexusColors.error.main;
    };
    const MetricOverviewCard = ({ title, value, unit, trend, icon: Icon, color, subtitle }) => (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <material_1.Card sx={{
            background: `linear-gradient(135deg, ${color}15, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${color}30`,
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
                border: `1px solid ${color}50`,
                boxShadow: `0 8px 25px ${color}20`
            }
        }}>
        <material_1.CardContent sx={{ p: 3 }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${color}, ${color}80)`,
            width: 56,
            height: 56
        }}>
              <Icon sx={{ fontSize: '1.8rem' }}/>
            </material_1.Avatar>
            {trend !== undefined && (<material_1.Chip icon={trend > 0 ? <icons_material_1.TrendingUp /> : <icons_material_1.TrendingDown />} label={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`} size="small" color={trend > 0 ? 'success' : 'error'} variant="outlined"/>)}
          </material_1.Box>

          <material_1.Typography variant="h4" sx={{
            color: color,
            fontWeight: 'bold',
            mb: 1,
            fontFamily: 'Orbitron'
        }}>
            {typeof value === 'number' ? formatNumber(value) : value}{unit}
          </material_1.Typography>

          <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1 }}>
            {title}
          </material_1.Typography>

          {subtitle && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
              {subtitle}
            </material_1.Typography>)}
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
    const TabPanel = ({ children, value, index }) => (<div hidden={value !== index}>
      {value === index && <material_1.Box sx={{ pt: 3 }}>{children}</material_1.Box>}
    </div>);
    return (<material_1.Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      {/* Заголовок */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <material_1.Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.warning.dark}20, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.warning.main}30`,
            textAlign: 'center'
        }}>
          <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.warning.main}, ${nexusTheme_1.nexusColors.accent.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 2,
            fontFamily: 'Orbitron'
        }}>
            📊 АНАЛІТИЧНА ПАНЕЛЬ
          </material_1.Typography>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
            Детальна аналітика системи • Реальний час • Інтелектуальні інсайти
          </material_1.Typography>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Контроли */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <material_1.Card sx={{ mb: 3, background: `${nexusTheme_1.nexusColors.background.paper}95`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
          <material_1.CardContent>
            <material_1.Grid container spacing={2} alignItems="center">
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.FormControl fullWidth size="small">
                  <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Період</material_1.InputLabel>
                  <material_1.Select value={timeRange} label="Період" onChange={(e) => setTimeRange(e.target.value)} sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    <material_1.MenuItem value="1h">Остання година</material_1.MenuItem>
                    <material_1.MenuItem value="24h">Останні 24 години</material_1.MenuItem>
                    <material_1.MenuItem value="7d">Останні 7 днів</material_1.MenuItem>
                    <material_1.MenuItem value="30d">Останні 30 днів</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} fullWidth onClick={() => setAnalyticsData(generateAnalyticsData())} sx={{
            borderColor: nexusTheme_1.nexusColors.primary.main,
            color: nexusTheme_1.nexusColors.primary.main,
            '&:hover': {
                background: `${nexusTheme_1.nexusColors.primary.main}20`
            }
        }}>
                  Оновити
                </material_1.Button>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Download />} fullWidth sx={{
            borderColor: nexusTheme_1.nexusColors.accent.main,
            color: nexusTheme_1.nexusColors.accent.main,
            '&:hover': {
                background: `${nexusTheme_1.nexusColors.accent.main}20`
            }
        }}>
                  Експорт
                </material_1.Button>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Share />} fullWidth sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.dark}, ${nexusTheme_1.nexusColors.primary.dark})`
            }
        }}>
                  Поділитися
                </material_1.Button>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Огляд метрик */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
        <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
          <material_1.Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard title="Загальних запитів" value={analyticsData.overview.totalRequests} unit="" trend={5.2} icon={icons_material_1.Assessment} color={nexusTheme_1.nexusColors.primary.main} subtitle="За останні 24 години"/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard title="Успішних запитів" value={analyticsData.overview.successRate.toFixed(1)} unit="%" trend={0.8} icon={icons_material_1.TrendingUp} color={nexusTheme_1.nexusColors.success.main} subtitle="Відсоток успішності"/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard title="Час відповіді" value={analyticsData.overview.avgResponseTime.toFixed(0)} unit="ms" trend={-2.1} icon={icons_material_1.Speed} color={nexusTheme_1.nexusColors.warning.main} subtitle="Середній час"/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard title="Активних користувачів" value={analyticsData.overview.activeUsers} unit="" trend={12.3} icon={icons_material_1.Psychology} color={nexusTheme_1.nexusColors.info.main} subtitle="Онлайн зараз"/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard title="Uptime системи" value={analyticsData.overview.uptime.toFixed(2)} unit="%" trend={0.1} icon={icons_material_1.Computer} color={nexusTheme_1.nexusColors.accent.main} subtitle="Доступність"/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard title="Помилок" value={analyticsData.overview.errorRate.toFixed(1)} unit="%" trend={-0.5} icon={icons_material_1.TrendingDown} color={nexusTheme_1.nexusColors.error.main} subtitle="Рівень помилок"/>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>

      {/* Вкладки аналітики */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
        <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.background.paper}95`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
          <material_1.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <material_1.Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{
            '& .MuiTab-root': {
                color: nexusTheme_1.nexusColors.text.secondary,
                '&.Mui-selected': {
                    color: nexusTheme_1.nexusColors.primary.main
                }
            },
            '& .MuiTabs-indicator': {
                backgroundColor: nexusTheme_1.nexusColors.primary.main
            }
        }}>
              <material_1.Tab label="🤖 ШІ Метрики"/>
              <material_1.Tab label="📈 Продуктивність"/>
              <material_1.Tab label="🏆 Топ Використання"/>
              <material_1.Tab label="⚠️ Алерти"/>
            </material_1.Tabs>
          </material_1.Box>

          {/* ШІ Метрики */}
          <TabPanel value={selectedTab} index={0}>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.accent.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                      🧠 Статус ШІ Моделей
                    </material_1.Typography>
                    <material_1.Grid container spacing={2}>
                      <material_1.Grid item xs={6}>
                        <material_1.Typography variant="h3" sx={{ color: nexusTheme_1.nexusColors.success.main, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.modelsOnline}
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Онлайн моделей
                        </material_1.Typography>
                      </material_1.Grid>
                      <material_1.Grid item xs={6}>
                        <material_1.Typography variant="h3" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.totalModels}
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Загальна кількість
                        </material_1.Typography>
                      </material_1.Grid>
                    </material_1.Grid>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.primary.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                      🤖 Статус ШІ Агентів
                    </material_1.Typography>
                    <material_1.Grid container spacing={2}>
                      <material_1.Grid item xs={6}>
                        <material_1.Typography variant="h3" sx={{ color: nexusTheme_1.nexusColors.success.main, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.agentsActive}
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Активних агентів
                        </material_1.Typography>
                      </material_1.Grid>
                      <material_1.Grid item xs={6}>
                        <material_1.Typography variant="h3" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.totalAgents}
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Загальна кількість
                        </material_1.Typography>
                      </material_1.Grid>
                    </material_1.Grid>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>
              <material_1.Grid item xs={12}>
                <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.secondary.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.secondary.main}30` }}>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                      📊 Загальна ефективність
                    </material_1.Typography>
                    <material_1.Grid container spacing={3}>
                      <material_1.Grid item xs={12} sm={4}>
                        <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.secondary.main, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.avgAccuracy.toFixed(1)}%
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Середня точність
                        </material_1.Typography>
                      </material_1.Grid>
                      <material_1.Grid item xs={12} sm={4}>
                        <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.warning.main, fontWeight: 'bold' }}>
                          {formatNumber(analyticsData.aiMetrics.processingTasks)}
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Завдань в обробці
                        </material_1.Typography>
                      </material_1.Grid>
                      <material_1.Grid item xs={12} sm={4}>
                        <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.info.main, fontWeight: 'bold' }}>
                          95.8%
                        </material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                          Uptime ШІ системи
                        </material_1.Typography>
                      </material_1.Grid>
                    </material_1.Grid>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>
            </material_1.Grid>
          </TabPanel>

          {/* Продуктивність */}
          <TabPanel value={selectedTab} index={1}>
            <material_1.Alert severity="info" sx={{ mb: 3 }}>
              Графіки продуктивності будуть реалізовані у наступній версії з використанням Chart.js
            </material_1.Alert>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.primary.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                      📈 Тренди CPU (24 години)
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Середнє навантаження: {(analyticsData.performance.cpuTrend.reduce((a, b) => a + b, 0) / analyticsData.performance.cpuTrend.length).toFixed(1)}%
                    </material_1.Typography>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{ background: `${nexusTheme_1.nexusColors.secondary.main}10`, border: `1px solid ${nexusTheme_1.nexusColors.secondary.main}30` }}>
                  <material_1.CardContent>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                      🧠 Тренди пам'яті (24 години)
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Середнє використання: {(analyticsData.performance.memoryTrend.reduce((a, b) => a + b, 0) / analyticsData.performance.memoryTrend.length).toFixed(1)}%
                    </material_1.Typography>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>
            </material_1.Grid>
          </TabPanel>

          {/* Топ використання */}
          <TabPanel value={selectedTab} index={2}>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                  🏆 Топ ШІ Моделей
                </material_1.Typography>
                <material_1.List>
                  {analyticsData.usage.topModels.map((model, index) => (<material_1.ListItem key={model.name} sx={{ px: 0 }}>
                      <material_1.ListItemIcon>
                        <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`,
                width: 32,
                height: 32,
                fontSize: '0.8rem'
            }}>
                          {index + 1}
                        </material_1.Avatar>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary={model.name} secondary={`${formatNumber(model.requests)} запитів • ${model.percentage.toFixed(1)}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>))}
                </material_1.List>
              </material_1.Grid>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                  🤖 Топ ШІ Агентів
                </material_1.Typography>
                <material_1.List>
                  {analyticsData.usage.topAgents.map((agent, index) => (<material_1.ListItem key={agent.name} sx={{ px: 0 }}>
                      <material_1.ListItemIcon>
                        <material_1.Avatar sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.secondary.main})`,
                width: 32,
                height: 32,
                fontSize: '0.8rem'
            }}>
                          {index + 1}
                        </material_1.Avatar>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary={agent.name} secondary={`${agent.tasks} завдань • ${agent.efficiency.toFixed(1)}% ефективність`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>))}
                </material_1.List>
              </material_1.Grid>
            </material_1.Grid>
          </TabPanel>

          {/* Алерти */}
          <TabPanel value={selectedTab} index={3}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
              ⚠️ Системні сповіщення
            </material_1.Typography>
            {analyticsData.alerts.map((alert) => (<material_1.Alert key={alert.id} severity={alert.type} sx={{
                mb: 2,
                background: `${alert.type === 'warning' ? nexusTheme_1.nexusColors.warning.main : alert.type === 'success' ? nexusTheme_1.nexusColors.success.main : nexusTheme_1.nexusColors.info.main}10`,
                border: `1px solid ${alert.type === 'warning' ? nexusTheme_1.nexusColors.warning.main : alert.type === 'success' ? nexusTheme_1.nexusColors.success.main : nexusTheme_1.nexusColors.info.main}30`
            }}>
                <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <material_1.Typography variant="body1">{alert.message}</material_1.Typography>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                    {alert.time}
                  </material_1.Typography>
                </material_1.Box>
              </material_1.Alert>))}
          </TabPanel>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>);
}
exports.default = AnalyticsModule;
