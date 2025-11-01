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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Speed as SpeedIcon,
  Thermostat as ThermostatIcon,
  Battery as BatteryIcon,
  Wifi as WifiIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  GraphicEq as GraphicEqIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

// Моковані дані системного моніторингу
const generateSystemData = () => ({
  cpu: {
    usage: Math.random() * 40 + 30, // 30-70%
    cores: 16,
    temperature: Math.random() * 20 + 50, // 50-70°C
    frequency: Math.random() * 1000 + 3000, // 3-4 GHz
    processes: Math.floor(Math.random() * 200) + 150
  },
  memory: {
    total: 32,
    used: Math.random() * 15 + 8, // 8-23 GB
    cached: Math.random() * 4 + 2,
    available: 0,
    swap: Math.random() * 2 + 1
  },
  storage: {
    total: 2000,
    used: Math.random() * 500 + 400, // 400-900 GB
    free: 0,
    readSpeed: Math.random() * 200 + 300, // MB/s
    writeSpeed: Math.random() * 150 + 250
  },
  network: {
    download: Math.random() * 500 + 100, // Mbps
    upload: Math.random() * 100 + 50,
    latency: Math.random() * 30 + 10, // ms
    packetsReceived: Math.floor(Math.random() * 100000) + 50000,
    packetsSent: Math.floor(Math.random() * 80000) + 40000
  },
  gpu: {
    usage: Math.random() * 60 + 20, // 20-80%
    memory: Math.random() * 6 + 2, // GB
    temperature: Math.random() * 25 + 60, // 60-85°C
    fanSpeed: Math.random() * 30 + 40 // %
  },
  system: {
    uptime: '4d 12h 35m',
    loadAverage: [1.2, 1.5, 1.8],
    activeUsers: 3,
    runningServices: 127,
    securityStatus: 'secure',
    lastUpdate: new Date()
  }
});

function SystemMonitor() {
  const [systemData, setSystemData] = useState(generateSystemData());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [alerts, setAlerts] = useState([]);

  // Обчислення derived значень
  useEffect(() => {
    setSystemData(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        available: prev.memory.total - prev.memory.used
      },
      storage: {
        ...prev.storage,
        free: prev.storage.total - prev.storage.used
      }
    }));
  }, [systemData.memory.used, systemData.storage.used]);

  // Автоматичне оновлення
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSystemData(generateSystemData());

      // Генерація алертів
      const newAlerts = [];
      if (systemData.cpu.usage > 80) {
        newAlerts.push({ id: 'cpu-high', type: 'warning', message: 'Високе навантаження CPU' });
      }
      if (systemData.memory.used / systemData.memory.total > 0.85) {
        newAlerts.push({ id: 'memory-high', type: 'error', message: 'Критичне використання пам\'яті' });
      }
      if (systemData.cpu.temperature > 75) {
        newAlerts.push({ id: 'temp-high', type: 'warning', message: 'Висока температура CPU' });
      }
      setAlerts(newAlerts);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, systemData.cpu.usage, systemData.memory.used, systemData.cpu.temperature]);

  const getUsageColor = (usage, thresholds = [50, 80]) => {
    if (usage < thresholds[0]) return nexusColors.success.main;
    if (usage < thresholds[1]) return nexusColors.warning.main;
    return nexusColors.error.main;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const MetricCard = ({ title, value, unit, usage, icon: Icon, color, trend, details }) => (
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
                color={trend > 0 ? 'error' : 'success'}
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
            {value}{unit}
          </Typography>

          <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 2 }}>
            {title}
          </Typography>

          {usage !== undefined && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={usage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  background: `${nexusColors.background.surface}`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getUsageColor(usage)}, ${getUsageColor(usage)}80)`,
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: nexusColors.text.secondary, mt: 1, display: 'block' }}>
                {usage.toFixed(1)}% використання
              </Typography>
            </Box>
          )}

          {details && (
            <Box>
              {details.map((detail, index) => (
                <Typography key={index} variant="caption" sx={{ color: nexusColors.text.secondary, display: 'block' }}>
                  {detail}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
            background: `linear-gradient(135deg, ${nexusColors.secondary.dark}20, ${nexusColors.background.paper}90)`,
            border: `1px solid ${nexusColors.secondary.main}30`,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.secondary.main}, ${nexusColors.primary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2,
              fontFamily: 'Orbitron'
            }}
          >
            💻 СИСТЕМНИЙ МОНІТОРИНГ
          </Typography>
          <Typography variant="h6" sx={{ color: nexusColors.text.secondary }}>
            Реальний час • Uptime: {systemData.system.uptime} • {systemData.system.runningServices} сервісів активних
          </Typography>
        </Paper>
      </motion.div>

      {/* Алерти */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ mb: 3 }}>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.type}
                sx={{
                  mb: 1,
                  background: `${nexusColors.warning.main}10`,
                  border: `1px solid ${nexusColors.warning.main}30`
                }}
              >
                {alert.message}
              </Alert>
            ))}
          </Box>
        </motion.div>
      )}

      {/* Панель контролів */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card sx={{ mb: 3, background: `${nexusColors.background.paper}95`, border: `1px solid ${nexusColors.primary.main}30` }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: nexusColors.primary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: nexusColors.primary.main,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: nexusColors.text.primary }}>
                      Автооновлення
                    </Typography>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  fullWidth
                  onClick={() => setSystemData(generateSystemData())}
                  sx={{
                    borderColor: nexusColors.primary.main,
                    color: nexusColors.primary.main,
                    '&:hover': {
                      background: `${nexusColors.primary.main}20`,
                      borderColor: nexusColors.primary.light
                    }
                  }}
                >
                  Оновити зараз
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  fullWidth
                  sx={{
                    background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${nexusColors.accent.dark}, ${nexusColors.primary.dark})`
                    }
                  }}
                >
                  Налаштування
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Основні метрики */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="CPU Потужність"
              value={systemData.cpu.usage.toFixed(1)}
              unit="%"
              usage={systemData.cpu.usage}
              icon={SpeedIcon}
              color={getUsageColor(systemData.cpu.usage)}
              trend={Math.random() * 4 - 2}
              details={[
                `${systemData.cpu.cores} ядер`,
                `${systemData.cpu.frequency.toFixed(0)} MHz`,
                `${systemData.cpu.temperature.toFixed(1)}°C`
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Оперативна Пам'ять"
              value={systemData.memory.used.toFixed(1)}
              unit="GB"
              usage={(systemData.memory.used / systemData.memory.total) * 100}
              icon={MemoryIcon}
              color={getUsageColor((systemData.memory.used / systemData.memory.total) * 100)}
              trend={Math.random() * 3 - 1.5}
              details={[
                `З ${systemData.memory.total}GB`,
                `Доступно: ${systemData.memory.available.toFixed(1)}GB`,
                `Кеш: ${systemData.memory.cached.toFixed(1)}GB`
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Дискове Сховище"
              value={systemData.storage.used.toFixed(0)}
              unit="GB"
              usage={(systemData.storage.used / systemData.storage.total) * 100}
              icon={StorageIcon}
              color={getUsageColor((systemData.storage.used / systemData.storage.total) * 100)}
              trend={Math.random() * 2 - 1}
              details={[
                `З ${systemData.storage.total}GB`,
                `Вільно: ${systemData.storage.free.toFixed(0)}GB`,
                `Читання: ${systemData.storage.readSpeed.toFixed(0)} MB/s`
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Мережа"
              value={systemData.network.download.toFixed(0)}
              unit=" Mbps"
              usage={Math.min((systemData.network.download / 1000) * 100, 100)}
              icon={NetworkIcon}
              color={nexusColors.info.main}
              trend={Math.random() * 5 - 2.5}
              details={[
                `Відвантаження: ${systemData.network.upload.toFixed(0)} Mbps`,
                `Затримка: ${systemData.network.latency.toFixed(0)}ms`,
                `Пакетів: ${systemData.network.packetsReceived.toLocaleString()}`
              ]}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Додаткові метрики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.accent.dark}15, ${nexusColors.background.paper}90)`,
                border: `1px solid ${nexusColors.accent.main}30`,
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                  🎮 GPU Статистика
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={systemData.gpu.usage}
                        size={80}
                        thickness={4}
                        sx={{
                          color: getUsageColor(systemData.gpu.usage),
                          mb: 2
                        }}
                      />
                      <Typography variant="h6" sx={{ color: nexusColors.text.primary }}>
                        Навантаження
                      </Typography>
                      <Typography variant="h4" sx={{ color: getUsageColor(systemData.gpu.usage), fontWeight: 'bold' }}>
                        {systemData.gpu.usage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <MemoryIcon sx={{ color: nexusColors.primary.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Пам'ять GPU"
                          secondary={`${systemData.gpu.memory.toFixed(1)} GB`}
                          primaryTypographyProps={{ color: nexusColors.text.primary }}
                          secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ThermostatIcon sx={{ color: nexusColors.warning.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Температура"
                          secondary={`${systemData.gpu.temperature.toFixed(1)}°C`}
                          primaryTypographyProps={{ color: nexusColors.text.primary }}
                          secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <GraphicEqIcon sx={{ color: nexusColors.info.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Вентилятор"
                          secondary={`${systemData.gpu.fanSpeed.toFixed(0)}%`}
                          primaryTypographyProps={{ color: nexusColors.text.primary }}
                          secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.success.dark}15, ${nexusColors.background.paper}90)`,
                border: `1px solid ${nexusColors.success.main}30`,
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 3 }}>
                  🛡️ Системна Інформація
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: nexusColors.success.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Статус безпеки"
                      secondary="Захищено"
                      primaryTypographyProps={{ color: nexusColors.text.primary }}
                      secondaryTypographyProps={{ color: nexusColors.success.main, fontWeight: 'bold' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ComputerIcon sx={{ color: nexusColors.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Активних користувачів"
                      secondary={systemData.system.activeUsers}
                      primaryTypographyProps={{ color: nexusColors.text.primary }}
                      secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon sx={{ color: nexusColors.accent.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Запущених сервісів"
                      secondary={systemData.system.runningServices}
                      primaryTypographyProps={{ color: nexusColors.text.primary }}
                      secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon sx={{ color: nexusColors.warning.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Середнє навантаження"
                      secondary={`${systemData.system.loadAverage.join(', ')}`}
                      primaryTypographyProps={{ color: nexusColors.text.primary }}
                      secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Статус оновлення */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: 'center',
            background: `${nexusColors.background.paper}95`,
            border: `1px solid ${nexusColors.primary.main}20`,
            borderRadius: 2
          }}
        >
          <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
            Останнє оновлення: {systemData.system.lastUpdate.toLocaleTimeString()} •
            Автооновлення: {autoRefresh ? 'Увімкнено' : 'Вимкнено'} •
            Інтервал: {refreshInterval / 1000}с
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default SystemMonitor;
