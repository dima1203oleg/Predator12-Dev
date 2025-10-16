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
  Paper,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Memory as MemoryIcon,
  Computer as ComputerIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

// Моковані аналітичні дані
const generateAnalyticsData = () => ({
  overview: {
    totalRequests: Math.floor(Math.random() * 50000) + 100000,
    successRate: Math.random() * 10 + 85, // 85-95%
    avgResponseTime: Math.random() * 100 + 150, // 150-250ms
    activeUsers: Math.floor(Math.random() * 100) + 200,
    errorRate: Math.random() * 3 + 1, // 1-4%
    uptime: Math.random() * 2 + 97 // 97-99%
  },
  aiMetrics: {
    modelsOnline: 47,
    totalModels: 52,
    agentsActive: 32,
    totalAgents: 38,
    avgAccuracy: Math.random() * 5 + 92, // 92-97%
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
  const [analyticsData, setAnalyticsData] = useState(generateAnalyticsData());
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Автооновлення даних
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setAnalyticsData(generateAnalyticsData());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTrendColor = (value, threshold = 0) => {
    return value > threshold ? nexusColors.success.main : nexusColors.error.main;
  };

  const MetricOverviewCard = ({ title, value, unit, trend, icon: Icon, color, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15, ${nexusColors.background.paper}90)`,
          border: `1px solid ${color}30`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            border: `1px solid ${color}50`,
            boxShadow: `0 8px 25px ${color}20`
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                background: `linear-gradient(45deg, ${color}, ${color}80)`,
                width: 56,
                height: 56
              }}
            >
              <Icon sx={{ fontSize: '1.8rem' }} />
            </Avatar>
            {trend !== undefined && (
              <Chip
                icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`}
                size="small"
                color={trend > 0 ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: color,
              fontWeight: 'bold',
              mb: 1,
              fontFamily: 'Orbitron'
            }}
          >
            {typeof value === 'number' ? formatNumber(value) : value}{unit}
          </Typography>

          <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 1 }}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      {/* Заголовок */}
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
            background: `linear-gradient(135deg, ${nexusColors.warning.dark}20, ${nexusColors.background.paper}90)`,
            border: `1px solid ${nexusColors.warning.main}30`,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.warning.main}, ${nexusColors.accent.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2,
              fontFamily: 'Orbitron'
            }}
          >
            📊 АНАЛІТИЧНА ПАНЕЛЬ
          </Typography>
          <Typography variant="h6" sx={{ color: nexusColors.text.secondary }}>
            Детальна аналітика системи • Реальний час • Інтелектуальні інсайти
          </Typography>
        </Paper>
      </motion.div>

      {/* Контроли */}
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
                  <InputLabel sx={{ color: nexusColors.text.secondary }}>Період</InputLabel>
                  <Select
                    value={timeRange}
                    label="Період"
                    onChange={(e) => setTimeRange(e.target.value)}
                    sx={{ color: nexusColors.text.primary }}
                  >
                    <MenuItem value="1h">Остання година</MenuItem>
                    <MenuItem value="24h">Останні 24 години</MenuItem>
                    <MenuItem value="7d">Останні 7 днів</MenuItem>
                    <MenuItem value="30d">Останні 30 днів</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  fullWidth
                  onClick={() => setAnalyticsData(generateAnalyticsData())}
                  sx={{
                    borderColor: nexusColors.primary.main,
                    color: nexusColors.primary.main,
                    '&:hover': {
                      background: `${nexusColors.primary.main}20`
                    }
                  }}
                >
                  Оновити
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  sx={{
                    borderColor: nexusColors.accent.main,
                    color: nexusColors.accent.main,
                    '&:hover': {
                      background: `${nexusColors.accent.main}20`
                    }
                  }}
                >
                  Експорт
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  fullWidth
                  sx={{
                    background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${nexusColors.accent.dark}, ${nexusColors.primary.dark})`
                    }
                  }}
                >
                  Поділитися
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Огляд метрик */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard
              title="Загальних запитів"
              value={analyticsData.overview.totalRequests}
              unit=""
              trend={5.2}
              icon={AssessmentIcon}
              color={nexusColors.primary.main}
              subtitle="За останні 24 години"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard
              title="Успішних запитів"
              value={analyticsData.overview.successRate.toFixed(1)}
              unit="%"
              trend={0.8}
              icon={TrendingUpIcon}
              color={nexusColors.success.main}
              subtitle="Відсоток успішності"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard
              title="Час відповіді"
              value={analyticsData.overview.avgResponseTime.toFixed(0)}
              unit="ms"
              trend={-2.1}
              icon={SpeedIcon}
              color={nexusColors.warning.main}
              subtitle="Середній час"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard
              title="Активних користувачів"
              value={analyticsData.overview.activeUsers}
              unit=""
              trend={12.3}
              icon={PsychologyIcon}
              color={nexusColors.info.main}
              subtitle="Онлайн зараз"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard
              title="Uptime системи"
              value={analyticsData.overview.uptime.toFixed(2)}
              unit="%"
              trend={0.1}
              icon={ComputerIcon}
              color={nexusColors.accent.main}
              subtitle="Доступність"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <MetricOverviewCard
              title="Помилок"
              value={analyticsData.overview.errorRate.toFixed(1)}
              unit="%"
              trend={-0.5}
              icon={TrendingDownIcon}
              color={nexusColors.error.main}
              subtitle="Рівень помилок"
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Вкладки аналітики */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <Card sx={{ background: `${nexusColors.background.paper}95`, border: `1px solid ${nexusColors.primary.main}30` }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: nexusColors.text.secondary,
                  '&.Mui-selected': {
                    color: nexusColors.primary.main
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: nexusColors.primary.main
                }
              }}
            >
              <Tab label="🤖 ШІ Метрики" />
              <Tab label="📈 Продуктивність" />
              <Tab label="🏆 Топ Використання" />
              <Tab label="⚠️ Алерти" />
            </Tabs>
          </Box>

          {/* ШІ Метрики */}
          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: `${nexusColors.accent.main}10`, border: `1px solid ${nexusColors.accent.main}30` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                      🧠 Статус ШІ Моделей
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h3" sx={{ color: nexusColors.success.main, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.modelsOnline}
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Онлайн моделей
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h3" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.totalModels}
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Загальна кількість
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: `${nexusColors.primary.main}10`, border: `1px solid ${nexusColors.primary.main}30` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                      🤖 Статус ШІ Агентів
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h3" sx={{ color: nexusColors.success.main, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.agentsActive}
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Активних агентів
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h3" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.totalAgents}
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Загальна кількість
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ background: `${nexusColors.secondary.main}10`, border: `1px solid ${nexusColors.secondary.main}30` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                      📊 Загальна ефективність
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h4" sx={{ color: nexusColors.secondary.main, fontWeight: 'bold' }}>
                          {analyticsData.aiMetrics.avgAccuracy.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Середня точність
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h4" sx={{ color: nexusColors.warning.main, fontWeight: 'bold' }}>
                          {formatNumber(analyticsData.aiMetrics.processingTasks)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Завдань в обробці
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h4" sx={{ color: nexusColors.info.main, fontWeight: 'bold' }}>
                          95.8%
                        </Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                          Uptime ШІ системи
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Продуктивність */}
          <TabPanel value={selectedTab} index={1}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Графіки продуктивності будуть реалізовані у наступній версії з використанням Chart.js
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: `${nexusColors.primary.main}10`, border: `1px solid ${nexusColors.primary.main}30` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                      📈 Тренди CPU (24 години)
                    </Typography>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Середнє навантаження: {(analyticsData.performance.cpuTrend.reduce((a, b) => a + b, 0) / analyticsData.performance.cpuTrend.length).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: `${nexusColors.secondary.main}10`, border: `1px solid ${nexusColors.secondary.main}30` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                      🧠 Тренди пам'яті (24 години)
                    </Typography>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Середнє використання: {(analyticsData.performance.memoryTrend.reduce((a, b) => a + b, 0) / analyticsData.performance.memoryTrend.length).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Топ використання */}
          <TabPanel value={selectedTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                  🏆 Топ ШІ Моделей
                </Typography>
                <List>
                  {analyticsData.usage.topModels.map((model, index) => (
                    <ListItem key={model.name} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            background: `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`,
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={model.name}
                        secondary={`${formatNumber(model.requests)} запитів • ${model.percentage.toFixed(1)}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                  🤖 Топ ШІ Агентів
                </Typography>
                <List>
                  {analyticsData.usage.topAgents.map((agent, index) => (
                    <ListItem key={agent.name} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.secondary.main})`,
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={agent.name}
                        secondary={`${agent.tasks} завдань • ${agent.efficiency.toFixed(1)}% ефективність`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Алерти */}
          <TabPanel value={selectedTab} index={3}>
            <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 3 }}>
              ⚠️ Системні сповіщення
            </Typography>
            {analyticsData.alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.type}
                sx={{
                  mb: 2,
                  background: `${alert.type === 'warning' ? nexusColors.warning.main : alert.type === 'success' ? nexusColors.success.main : nexusColors.info.main}10`,
                  border: `1px solid ${alert.type === 'warning' ? nexusColors.warning.main : alert.type === 'success' ? nexusColors.success.main : nexusColors.info.main}30`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">{alert.message}</Typography>
                  <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                    {alert.time}
                  </Typography>
                </Box>
              </Alert>
            ))}
          </TabPanel>
        </Card>
      </motion.div>
    </Box>
  );
}

export default AnalyticsModule;
