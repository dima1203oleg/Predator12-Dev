// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  Typography,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  Chip
} from '@mui/material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend
);
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Memory,
  Storage,
  NetworkCheck,
  Timeline,
  Analytics,
  Refresh,
  Settings,
  Download,
  Fullscreen,
  Warning,
  ErrorOutline,
  CheckCircleOutline
} from '@mui/icons-material';

interface Props {
  systemData: any;
  realtimeMetrics?: any;
  isConnected?: boolean;
}

// Animated Metric Card Component
const MetricCard = ({ title, value, unit, icon, color, trend, chart }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const getProgressValue = (value: string) => {
    return parseInt(value.replace('%', '')) || 0;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return '#ff4444';
    if (trend < 0) return '#44ff44';
    return '#ffff44';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          p: 3,
          background: isHovered
            ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`
            : 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,30,60,0.8) 100%)',
          border: `2px solid ${isHovered ? color : 'rgba(0,255,255,0.3)'}`,
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isHovered
            ? `0 12px 40px ${color}40`
            : '0 4px 16px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                bgcolor: `${color}20`,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
            </Box>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>

          {trend !== undefined && (
            <Chip
              icon={<TrendingUp />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              sx={{
                bgcolor: `${getTrendColor(trend)}20`,
                color: getTrendColor(trend),
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>

        <Typography variant="h3" sx={{ color, fontWeight: 'bold', mb: 1 }}>
          {value}
          <Typography component="span" variant="h6" sx={{ color: '#cccccc', ml: 1 }}>
            {unit}
          </Typography>
        </Typography>

        {unit === '%' && (
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={getProgressValue(value)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  boxShadow: `0 0 15px ${color}`,
                  transition: 'all 0.3s ease'
                }
              }}
            />
          </Box>
        )}

        {chart && (
          <Box mt={2} height={60}>
            <Line
              data={chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { display: false },
                  y: { display: false }
                },
                elements: {
                  point: { radius: 0 },
                  line: { tension: 0.4 }
                }
              }}
            />
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

// Real-time Chart Component
const RealtimeChart = ({ title, data, type = 'line' }: any) => {
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#ffffff' }
      },
      title: {
        display: true,
        text: title,
        color: '#00ffff',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#cccccc' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#cccccc' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const ChartComponent = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 3,
          height: 400,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
          border: '1px solid rgba(0,255,255,0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)'
        }}
      >
        <ChartComponent data={data} options={chartOptions} />
      </Paper>
    </motion.div>
  );
};

// System Status Indicator
const SystemStatusIndicator = ({ status, label }: any) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'excellent':
        return { color: '#00ff00', icon: <CheckCircleOutline />, label: 'Відмінно' };
      case 'good':
        return { color: '#ffff00', icon: <CheckCircleOutline />, label: 'Добре' };
      case 'warning':
        return { color: '#ff8800', icon: <Warning />, label: 'Попередження' };
      case 'critical':
        return { color: '#ff0000', icon: <ErrorOutline />, label: 'Критично' };
      default:
        return { color: '#00ffff', icon: <CheckCircleOutline />, label: 'Невідомо' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <Box display="flex" alignItems="center" sx={{ p: 2 }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {React.cloneElement(config.icon, {
            sx: {
              color: config.color,
              fontSize: 32,
              filter: `drop-shadow(0 0 10px ${config.color})`
            }
          })}
        </motion.div>
        <Box ml={2}>
          <Typography variant="body2" sx={{ color: '#cccccc' }}>
            {label}
          </Typography>
          <Typography variant="h6" sx={{ color: config.color, fontWeight: 'bold' }}>
            {config.label}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export const RealtimeSystemMonitor: React.FC<Props> = ({ systemData }) => {
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const [networkHistory, setNetworkHistory] = useState<number[]>([]);

  // Mock real-time data generation
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      setCpuHistory(prev => {
        const newData = [...prev, Math.random() * 100];
        return newData.slice(-20); // Keep only last 20 points
      });

      setMemoryHistory(prev => {
        const newData = [...prev, 40 + Math.random() * 40];
        return newData.slice(-20);
      });

      setNetworkHistory(prev => {
        const newData = [...prev, Math.random() * 1000];
        return newData.slice(-20);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  // Chart data configurations
  const cpuChartData = {
    labels: Array.from({ length: cpuHistory.length }, (_, i) => `${i}s`),
    datasets: [{
      label: 'CPU Usage',
      data: cpuHistory,
      borderColor: '#ff6b6b',
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const memoryChartData = {
    labels: Array.from({ length: memoryHistory.length }, (_, i) => `${i}s`),
    datasets: [{
      label: 'Memory Usage',
      data: memoryHistory,
      borderColor: '#4ecdc4',
      backgroundColor: 'rgba(78, 205, 196, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const containerStatusData = {
    labels: ['Активні', 'Ініціалізуються', 'Помилки'],
    datasets: [{
      data: [24, 2, 1],
      backgroundColor: ['#00ff00', '#ffff00', '#ff0000'],
      borderColor: ['#00ff0080', '#ffff0080', '#ff000080'],
      borderWidth: 2
    }]
  };

  const agentPerformanceData = {
    labels: ['SelfHealing', 'AutoImprove', 'Diagnosis', 'ContainerHealer'],
    datasets: [{
      label: 'Покращення за годину',
      data: [12, 8, 6, 15],
      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
      borderColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
      borderWidth: 2
    }]
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
              📊 Реалтайм Моніторинг Системи
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ffff',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ffff',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: '#ffffff' }}>
                  Реальний час
                </Typography>
              }
            />
          </Box>
        </Paper>
      </motion.div>

      {/* System Status Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <SystemStatusIndicator status="excellent" label="Загальний стан" />
        </Grid>
        <Grid item xs={12} md={3}>
          <SystemStatusIndicator status="good" label="Продуктивність" />
        </Grid>
        <Grid item xs={12} md={3}>
          <SystemStatusIndicator status="excellent" label="Безпека" />
        </Grid>
        <Grid item xs={12} md={3}>
          <SystemStatusIndicator status="good" label="Мережа" />
        </Grid>
      </Grid>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="CPU"
            value="23"
            unit="%"
            icon={<Speed />}
            color="#ff6b6b"
            trend={-2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Пам'ять"
            value="58"
            unit="%"
            icon={<Memory />}
            color="#4ecdc4"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Диск"
            value="342"
            unit="GB"
            icon={<Storage />}
            color="#45b7d1"
            trend={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Мережа"
            value="1.2"
            unit="GB/s"
            icon={<NetworkCheck />}
            color="#96ceb4"
            trend={8}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RealtimeChart
            title="CPU Використання (Реальний час)"
            data={cpuChartData}
            type="line"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RealtimeChart
            title="Пам'ять (Реальний час)"
            data={memoryChartData}
            type="line"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RealtimeChart
            title="Статус Контейнерів"
            data={containerStatusData}
            type="doughnut"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RealtimeChart
            title="Продуктивність Агентів"
            data={agentPerformanceData}
            type="bar"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
