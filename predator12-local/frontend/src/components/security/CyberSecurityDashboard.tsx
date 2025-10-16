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
  Paper,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VpnKey as VpnKeyIcon,
  Fingerprint as FingerprintIcon,
  Gavel as GavelIcon,
  BugReport as BugReportIcon,
  NetworkCheck as NetworkIcon,
  Storage as StorageIcon,
  Computer as ComputerIcon,
  PhoneAndroid as PhoneIcon,
  Router as RouterIcon,
  Cloud as CloudIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'mitigated' | 'investigating';
  mitigationSteps?: string[];
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: any;
  color: string;
  description: string;
}

const CyberSecurityDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [scanActive, setScanActive] = useState(false);
  const [threatDialogOpen, setThreatDialogOpen] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<SecurityThreat | null>(null);
  const [lastScan, setLastScan] = useState(new Date());

  // Генерація загроз для демонстрації
  const generateThreats = (): SecurityThreat[] => [
    {
      id: '1',
      type: 'Підозрілий трафік',
      severity: 'high',
      source: '192.168.1.100',
      target: 'Web Server',
      description: 'Виявлено незвичайну кількість запитів з одного IP',
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      status: 'active',
      mitigationSteps: ['Блокувати IP', 'Аналіз логів', 'Оновити правила фаєрволу']
    },
    {
      id: '2',
      type: 'Спроба злому',
      severity: 'critical',
      source: 'External',
      target: 'SSH Service',
      description: 'Множинні невдалі спроби входу в SSH',
      timestamp: new Date(Date.now() - Math.random() * 7200000),
      status: 'investigating',
      mitigationSteps: ['Змінити порт SSH', 'Увімкнути 2FA', 'Заборонити root доступ']
    },
    {
      id: '3',
      type: 'Malware підпис',
      severity: 'medium',
      source: 'Email Attachment',
      target: 'Workstation #5',
      description: 'Знайдено потенційно шкідливий файл',
      timestamp: new Date(Date.now() - Math.random() * 1800000),
      status: 'mitigated',
      mitigationSteps: ['Видалити файл', 'Сканувати систему', 'Оновити антивірус']
    },
    {
      id: '4',
      type: 'DDoS атака',
      severity: 'high',
      source: 'Multiple IPs',
      target: 'Load Balancer',
      description: 'Високе навантаження з множинних джерел',
      timestamp: new Date(Date.now() - Math.random() * 600000),
      status: 'active',
      mitigationSteps: ['Увімкнути DDoS protection', 'Масштабувати ресурси', 'Фільтрувати трафік']
    }
  ];

  const [threats, setThreats] = useState<SecurityThreat[]>(generateThreats());

  // Метрики безпеки
  const securityMetrics: SecurityMetric[] = [
    {
      id: 'firewall',
      name: 'Стан Фаєрволу',
      value: 98,
      maxValue: 100,
      unit: '%',
      status: 'good',
      icon: ShieldIcon,
      color: nexusColors.success.main,
      description: 'Фаєрвол працює стабільно'
    },
    {
      id: 'antivirus',
      name: 'Антивірусний захист',
      value: 95,
      maxValue: 100,
      unit: '%',
      status: 'good',
      icon: SecurityIcon,
      color: nexusColors.success.main,
      description: 'Антивірус активний та оновлений'
    },
    {
      id: 'intrusion',
      name: 'Система детекції вторгнень',
      value: 87,
      maxValue: 100,
      unit: '%',
      status: 'warning',
      icon: VisibilityIcon,
      color: nexusColors.warning.main,
      description: 'IDS потребує оновлення правил'
    },
    {
      id: 'encryption',
      name: 'Рівень шифрування',
      value: 100,
      maxValue: 100,
      unit: '%',
      status: 'good',
      icon: LockIcon,
      color: nexusColors.success.main,
      description: 'Всі з\'єднання зашифровані'
    },
    {
      id: 'vulnerabilities',
      name: 'Відомі вразливості',
      value: 3,
      maxValue: 10,
      unit: '',
      status: 'warning',
      icon: BugReportIcon,
      color: nexusColors.warning.main,
      description: '3 критичні вразливості потребують патчів'
    },
    {
      id: 'compliance',
      name: 'Відповідність стандартам',
      value: 92,
      maxValue: 100,
      unit: '%',
      status: 'good',
      icon: GavelIcon,
      color: nexusColors.success.main,
      description: 'Відповідає стандартам ISO 27001'
    }
  ];

  // Оновлення загроз
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setThreats(prev => {
          const newThreats = generateThreats();
          return [...prev.slice(-2), ...newThreats.slice(0, 1)];
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return nexusColors.error.main;
      case 'high':
        return nexusColors.warning.main;
      case 'medium':
        return nexusColors.info.main;
      case 'low':
        return nexusColors.success.main;
      default:
        return nexusColors.text.secondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon sx={{ color: nexusColors.error.main }} />;
      case 'high':
        return <WarningIcon sx={{ color: nexusColors.warning.main }} />;
      case 'medium':
        return <InfoIcon sx={{ color: nexusColors.info.main }} />;
      case 'low':
        return <CheckCircleIcon sx={{ color: nexusColors.success.main }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return nexusColors.error.main;
      case 'investigating':
        return nexusColors.warning.main;
      case 'mitigated':
        return nexusColors.success.main;
      default:
        return nexusColors.text.secondary;
    }
  };

  const runSecurityScan = async () => {
    setScanActive(true);
    setLastScan(new Date());

    // Симуляція сканування
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Оновлення загроз після сканування
    const newThreats = generateThreats().slice(0, 2);
    setThreats(prev => [...prev, ...newThreats]);

    setScanActive(false);
  };

  const renderSecurityMetrics = () => (
    <Grid container spacing={3}>
      {securityMetrics.map((metric) => (
        <Grid item xs={12} sm={6} md={4} key={metric.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${metric.color}30`,
                borderRadius: 3,
                '&:hover': {
                  boxShadow: `0 10px 30px ${metric.color}40`,
                  border: `1px solid ${metric.color}60`
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(45deg, ${metric.color}40, ${metric.color}60)`,
                      width: 50,
                      height: 50
                    }}
                  >
                    <metric.icon sx={{ color: metric.color }} />
                  </Avatar>

                  <Chip
                    label={metric.status === 'good' ? 'Добре' : metric.status === 'warning' ? 'Увага' : 'Критично'}
                    sx={{
                      background: `${metric.color}20`,
                      color: metric.color,
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    color: nexusColors.text.primary,
                    fontWeight: 'bold',
                    mb: 1,
                    background: `linear-gradient(45deg, ${metric.color}, ${nexusColors.accent.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {metric.value}{metric.unit}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ color: nexusColors.text.primary, mb: 1, fontWeight: 600 }}
                >
                  {metric.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: nexusColors.text.secondary, mb: 2 }}
                >
                  {metric.description}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={(metric.value / metric.maxValue) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    background: `${nexusColors.primary.dark}30`,
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${metric.color}60, ${metric.color})`
                    }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  const renderThreatsList = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusColors.accent.main}30`,
        borderRadius: 3,
        mt: 3
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}
          >
            🚨 Активні Загрози
          </Typography>
          <Button
            variant="outlined"
            startIcon={scanActive ? <Stop /> : <PlayIcon />}
            onClick={runSecurityScan}
            disabled={scanActive}
            sx={{
              borderColor: nexusColors.accent.main,
              color: nexusColors.accent.main,
              '&:hover': {
                borderColor: nexusColors.accent.light,
                background: `${nexusColors.accent.main}20`
              }
            }}
          >
            {scanActive ? 'Сканування...' : 'Запустити сканування'}
          </Button>
        </Box>

        {scanActive && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
              Сканування безпеки в процесі...
            </Typography>
            <LinearProgress
              sx={{
                height: 4,
                borderRadius: 2,
                background: `${nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`
                }
              }}
            />
          </Box>
        )}

        <List>
          {threats.slice(0, 6).map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ListItem
                sx={{
                  background: `${nexusColors.secondary.dark}20`,
                  borderRadius: 2,
                  mb: 1,
                  border: `1px solid ${getSeverityColor(threat.severity)}30`,
                  '&:hover': {
                    background: `${nexusColors.secondary.dark}40`,
                    border: `1px solid ${getSeverityColor(threat.severity)}60`
                  },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedThreat(threat);
                  setThreatDialogOpen(true);
                }}
              >
                <ListItemIcon>
                  {getSeverityIcon(threat.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}
                      >
                        {threat.type}
                      </Typography>
                      <Chip
                        label={threat.severity.toUpperCase()}
                        size="small"
                        sx={{
                          background: getSeverityColor(threat.severity),
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip
                        label={threat.status}
                        size="small"
                        sx={{
                          background: `${getStatusColor(threat.status)}20`,
                          color: getStatusColor(threat.status),
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: nexusColors.text.secondary }}
                      >
                        {threat.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: nexusColors.text.secondary }}
                      >
                        {threat.source} → {threat.target} • {threat.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </motion.div>
          ))}
        </List>

        <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mt: 2, textAlign: 'center' }}>
          Останнє сканування: {lastScan.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderNetworkMap = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusColors.accent.main}30`,
        borderRadius: 3,
        mt: 3
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: nexusColors.text.primary, fontWeight: 'bold', mb: 3 }}
        >
          🌐 Карта Мережі
        </Typography>

        <Grid container spacing={3}>
          {[
            { name: 'Web Server', status: 'secure', icon: CloudIcon, connections: 45 },
            { name: 'Database', status: 'warning', icon: StorageIcon, connections: 12 },
            { name: 'Router', status: 'secure', icon: RouterIcon, connections: 23 },
            { name: 'Workstations', status: 'secure', icon: ComputerIcon, connections: 67 },
            { name: 'Mobile Devices', status: 'warning', icon: PhoneIcon, connections: 34 },
            { name: 'IoT Devices', status: 'critical', icon: NetworkIcon, connections: 89 }
          ].map((device, index) => (
            <Grid item xs={12} sm={6} md={4} key={device.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background: `${nexusColors.secondary.dark}30`,
                    border: `1px solid ${
                      device.status === 'secure' ? nexusColors.success.main :
                      device.status === 'warning' ? nexusColors.warning.main :
                      nexusColors.error.main
                    }30`,
                    borderRadius: 2,
                    textAlign: 'center',
                    '&:hover': {
                      background: `${nexusColors.secondary.dark}50`,
                      transform: 'translateY(-5px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Avatar
                    sx={{
                      background: `linear-gradient(45deg, ${
                        device.status === 'secure' ? nexusColors.success.main :
                        device.status === 'warning' ? nexusColors.warning.main :
                        nexusColors.error.main
                      }40, ${
                        device.status === 'secure' ? nexusColors.success.main :
                        device.status === 'warning' ? nexusColors.warning.main :
                        nexusColors.error.main
                      }60)`,
                      margin: '0 auto',
                      mb: 1
                    }}
                  >
                    <device.icon />
                  </Avatar>
                  <Typography
                    variant="body1"
                    sx={{ color: nexusColors.text.primary, fontWeight: 'bold', mb: 1 }}
                  >
                    {device.name}
                  </Typography>
                  <Chip
                    label={device.status}
                    size="small"
                    sx={{
                      background: `${
                        device.status === 'secure' ? nexusColors.success.main :
                        device.status === 'warning' ? nexusColors.warning.main :
                        nexusColors.error.main
                      }20`,
                      color: device.status === 'secure' ? nexusColors.success.main :
                             device.status === 'warning' ? nexusColors.warning.main :
                             nexusColors.error.main,
                      mb: 1
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: nexusColors.text.secondary }}
                  >
                    {device.connections} з'єднань
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.error.main}, ${nexusColors.warning.main})`,
              width: 60,
              height: 60
            }}
          >
            <SecurityIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: nexusColors.text.primary,
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${nexusColors.error.main}, ${nexusColors.warning.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🛡️ Центр Кібербезпеки
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.secondary }}
            >
              Моніторинг загроз та захист системи
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Вкладки */}
      <Paper
        sx={{
          background: `${nexusColors.primary.dark}60`,
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          mb: 3
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.text.secondary,
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: nexusColors.error.main
              }
            },
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${nexusColors.error.main}, ${nexusColors.warning.main})`
            }
          }}
        >
          <Tab label="🛡️ Огляд" />
          <Tab label="🚨 Загрози" />
          <Tab label="🌐 Мережа" />
          <Tab label="📊 Звіти" />
        </Tabs>
      </Paper>

      {/* Контент вкладок */}
      <AnimatePresence mode="wait">
        {currentTab === 0 && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            {renderSecurityMetrics()}
          </motion.div>
        )}

        {currentTab === 1 && (
          <motion.div
            key="threats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            {renderThreatsList()}
          </motion.div>
        )}

        {currentTab === 2 && (
          <motion.div
            key="network"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            {renderNetworkMap()}
          </motion.div>
        )}

        {currentTab === 3 && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.accent.main}30`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                📊 Звіти та Аналітика
              </Typography>
              <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                Детальні звіти безпеки та статистика загроз
              </Typography>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.error.main}, ${nexusColors.warning.main})`,
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5
                }}
              >
                Генерувати звіт
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Діалог деталей загрози */}
      <Dialog
        open={threatDialogOpen}
        onClose={() => setThreatDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}95, ${nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }
        }}
      >
        {selectedThreat && (
          <>
            <DialogTitle sx={{
              color: nexusColors.text.primary,
              borderBottom: `1px solid ${nexusColors.accent.main}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              {getSeverityIcon(selectedThreat.severity)}
              Деталі Загрози: {selectedThreat.type}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                    Джерело:
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    {selectedThreat.source}
                  </Typography>

                  <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                    Ціль:
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    {selectedThreat.target}
                  </Typography>

                  <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                    Час виявлення:
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary }}>
                    {selectedThreat.timestamp.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                    Опис:
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    {selectedThreat.description}
                  </Typography>

                  {selectedThreat.mitigationSteps && (
                    <>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                        Кроки нейтралізації:
                      </Typography>
                      <List dense>
                        {selectedThreat.mitigationSteps.map((step, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Typography variant="body2" sx={{ color: nexusColors.accent.main }}>
                                {index + 1}.
                              </Typography>
                            </ListItemIcon>
                            <ListItemText
                              primary={step}
                              sx={{ '& .MuiListItemText-primary': { color: nexusColors.text.primary } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusColors.accent.main}30` }}>
              <Button
                onClick={() => setThreatDialogOpen(false)}
                sx={{ color: nexusColors.text.secondary }}
              >
                Закрити
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                  color: 'white'
                }}
              >
                Застосувати заходи
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CyberSecurityDashboard;
