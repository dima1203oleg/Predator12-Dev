// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Code,
  Psychology,
  Speed,
  Security,
  Analytics,
  Insights,
  Star,
  TrendingUp,
  Lightbulb,
  Timer,
  CheckCircle,
  Warning,
  Error,
  Info,
  Search,
  FilterList,
  Refresh,
  Download,
  Share,
  AutoAwesome
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'system' | 'ai' | 'user' | 'business';
  icon: React.ReactNode;
  color: string;
  description: string;
  recommendations?: string[];
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: Date;
  actionable: boolean;
  metric?: string;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'ai-efficiency',
    name: 'AI Ефективність',
    value: 94.2,
    unit: '%',
    trend: 'up',
    category: 'ai',
    icon: <Psychology />,
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
    icon: <Speed />,
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
    icon: <Security />,
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
    icon: <Star />,
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
    icon: <TrendingUp />,
    color: '#4CAF50',
    description: 'Загальний економічний ефект',
    recommendations: [
      'Розширити сферу застосування',
      'Інтегрувати з іншими системами',
      'Автоматизувати більше процесів'
    ]
  }
];

const sampleInsights: InsightData[] = [
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

interface SmartAnalyticsHubProps {
  onMetricClick?: (metric: PerformanceMetric) => void;
  onInsightAction?: (insight: InsightData) => void;
}

export const SmartAnalyticsHub: React.FC<SmartAnalyticsHubProps> = ({
  onMetricClick,
  onInsightAction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [insights, setInsights] = useState<InsightData[]>(sampleInsights);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        // Simulate data updates
        setInsights(prev => prev.map(insight => ({
          ...insight,
          timestamp: new Date(insight.timestamp.getTime() + Math.random() * 60000)
        })));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const categories = ['all', 'system', 'ai', 'user', 'business'];

  const filteredMetrics = performanceMetrics.filter(metric =>
    (selectedCategory === 'all' || metric.category === selectedCategory) &&
    metric.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInsights = insights.filter(insight =>
    insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <Error />;
      case 'medium': return <Warning />;
      case 'low': return <Info />;
      default: return <Info />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ color: '#4CAF50' }} />;
      case 'down': return <TrendingUp sx={{ color: '#F44336', transform: 'rotate(180deg)' }} />;
      case 'stable': return <CheckCircle sx={{ color: '#FF9800' }} />;
      default: return <CheckCircle />;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          🧠 Smart Analytics Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Розумна аналітика та інсайти системи
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Пошук метрик та інсайтів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 250 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category === 'all' ? 'Всі' : category.toUpperCase()}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{
                ...(selectedCategory === category && {
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                })
              }}
            />
          ))}
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Оновлено: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Автооновлення">
            <IconButton
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
              sx={{
                color: autoRefresh ? '#4CAF50' : 'text.secondary'
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Performance Metrics Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics />
          Ключові метрики продуктивності
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2
          }}
        >
          {filteredMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }
                }}
                onClick={() => {
                  setSelectedMetric(metric);
                  onMetricClick?.(metric);
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: metric.color,
                          width: 50,
                          height: 50
                        }}
                      >
                        {metric.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {metric.name}
                        </Typography>
                        <Chip
                          label={metric.category.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: metric.color,
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                    {getTrendIcon(metric.trend)}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: metric.color,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1
                      }}
                    >
                      {metric.value}
                      <Typography
                        variant="h6"
                        component="span"
                        sx={{ color: 'text.secondary' }}
                      >
                        {metric.unit}
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {metric.description}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={metric.unit === '%' ? metric.value : Math.min(metric.value / 200 * 100, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color,
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Smart Insights */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lightbulb />
          Розумні інсайти та рекомендації
        </Typography>

        <List sx={{ bgcolor: 'transparent' }}>
          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(10px)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <ListItem
                  sx={{
                    p: 3,
                    flexDirection: 'column',
                    alignItems: 'stretch'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getImpactColor(insight.impact),
                          width: 40,
                          height: 40
                        }}
                      >
                        {getImpactIcon(insight.impact)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {insight.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={insight.impact.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getImpactColor(insight.impact),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                          <Chip
                            label={insight.category}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {insight.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{ mb: 2, color: 'text.secondary' }}
                  >
                    {insight.description}
                  </Typography>

                  {insight.actionable && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AutoAwesome />}
                        onClick={() => onInsightAction?.(insight)}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        Виконати дію
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Share />}
                      >
                        Поділитися
                      </Button>
                    </Box>
                  )}
                </ListItem>
              </Card>
            </motion.div>
          ))}
        </List>
      </Box>

      {/* Metric Detail Dialog */}
      <AnimatePresence>
        {selectedMetric && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
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
            }}
            onClick={() => setSelectedMetric(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card
                sx={{
                  width: { xs: '90%', sm: 500 },
                  maxHeight: '80vh',
                  overflow: 'auto',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: selectedMetric.color,
                        width: 60,
                        height: 60
                      }}
                    >
                      {selectedMetric.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedMetric.name}
                      </Typography>
                      <Typography variant="h3" sx={{ color: selectedMetric.color }}>
                        {selectedMetric.value} {selectedMetric.unit}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                    {selectedMetric.description}
                  </Typography>

                  {selectedMetric.recommendations && (
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Рекомендації:
                      </Typography>
                      <List>
                        {selectedMetric.recommendations.map((rec, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon>
                              <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={rec}
                              sx={{ color: 'rgba(255,255,255,0.8)' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedMetric(null)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      Закрити
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SmartAnalyticsHub;
