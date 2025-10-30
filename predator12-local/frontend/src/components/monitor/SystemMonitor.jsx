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
// Моковані дані системного моніторингу
const generateSystemData = () => ({
    cpu: {
        usage: Math.random() * 40 + 30,
        cores: 16,
        temperature: Math.random() * 20 + 50,
        frequency: Math.random() * 1000 + 3000,
        processes: Math.floor(Math.random() * 200) + 150
    },
    memory: {
        total: 32,
        used: Math.random() * 15 + 8,
        cached: Math.random() * 4 + 2,
        available: 0,
        swap: Math.random() * 2 + 1
    },
    storage: {
        total: 2000,
        used: Math.random() * 500 + 400,
        free: 0,
        readSpeed: Math.random() * 200 + 300,
        writeSpeed: Math.random() * 150 + 250
    },
    network: {
        download: Math.random() * 500 + 100,
        upload: Math.random() * 100 + 50,
        latency: Math.random() * 30 + 10,
        packetsReceived: Math.floor(Math.random() * 100000) + 50000,
        packetsSent: Math.floor(Math.random() * 80000) + 40000
    },
    gpu: {
        usage: Math.random() * 60 + 20,
        memory: Math.random() * 6 + 2,
        temperature: Math.random() * 25 + 60,
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
    const [systemData, setSystemData] = (0, react_1.useState)(generateSystemData());
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const [refreshInterval, setRefreshInterval] = (0, react_1.useState)(2000);
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    // Обчислення derived значень
    (0, react_1.useEffect)(() => {
        setSystemData(prev => (Object.assign(Object.assign({}, prev), { memory: Object.assign(Object.assign({}, prev.memory), { available: prev.memory.total - prev.memory.used }), storage: Object.assign(Object.assign({}, prev.storage), { free: prev.storage.total - prev.storage.used }) })));
    }, [systemData.memory.used, systemData.storage.used]);
    // Автоматичне оновлення
    (0, react_1.useEffect)(() => {
        if (!autoRefresh)
            return;
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
        if (usage < thresholds[0])
            return nexusTheme_1.nexusColors.success.main;
        if (usage < thresholds[1])
            return nexusTheme_1.nexusColors.warning.main;
        return nexusTheme_1.nexusColors.error.main;
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };
    const MetricCard = ({ title, value, unit, usage, icon: Icon, color, trend, details }) => (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
            {trend !== undefined && (<material_1.Chip icon={trend > 0 ? <icons_material_1.TrendingUp /> : <icons_material_1.TrendingDown />} label={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`} size="small" color={trend > 0 ? 'error' : 'success'} variant="outlined"/>)}
          </material_1.Box>

          <material_1.Typography variant="h4" sx={{
            color: color,
            fontWeight: 'bold',
            mb: 1,
            fontFamily: 'Orbitron'
        }}>
            {value}{unit}
          </material_1.Typography>

          <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
            {title}
          </material_1.Typography>

          {usage !== undefined && (<material_1.Box sx={{ mb: 2 }}>
              <material_1.LinearProgress variant="determinate" value={usage} sx={{
                height: 8,
                borderRadius: 4,
                background: `${nexusTheme_1.nexusColors.background.surface}`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getUsageColor(usage)}, ${getUsageColor(usage)}80)`,
                    borderRadius: 4
                }
            }}/>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mt: 1, display: 'block' }}>
                {usage.toFixed(1)}% використання
              </material_1.Typography>
            </material_1.Box>)}

          {details && (<material_1.Box>
              {details.map((detail, index) => (<material_1.Typography key={index} variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary, display: 'block' }}>
                  {detail}
                </material_1.Typography>))}
            </material_1.Box>)}
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
    return (<material_1.Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      {/* Заголовок */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <material_1.Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.secondary.dark}20, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.secondary.main}30`,
            textAlign: 'center'
        }}>
          <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.secondary.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 2,
            fontFamily: 'Orbitron'
        }}>
            💻 СИСТЕМНИЙ МОНІТОРИНГ
          </material_1.Typography>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
            Реальний час • Uptime: {systemData.system.uptime} • {systemData.system.runningServices} сервісів активних
          </material_1.Typography>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Алерти */}
      {alerts.length > 0 && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <material_1.Box sx={{ mb: 3 }}>
            {alerts.map((alert) => (<material_1.Alert key={alert.id} severity={alert.type} sx={{
                    mb: 1,
                    background: `${nexusTheme_1.nexusColors.warning.main}10`,
                    border: `1px solid ${nexusTheme_1.nexusColors.warning.main}30`
                }}>
                {alert.message}
              </material_1.Alert>))}
          </material_1.Box>
        </framer_motion_1.motion.div>)}

      {/* Панель контролів */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <material_1.Card sx={{ mb: 3, background: `${nexusTheme_1.nexusColors.background.paper}95`, border: `1px solid ${nexusTheme_1.nexusColors.primary.main}30` }}>
          <material_1.CardContent>
            <material_1.Grid container spacing={2} alignItems="center">
              <material_1.Grid item xs={12} sm={6} md={4}>
                <material_1.FormControlLabel control={<material_1.Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.primary.main,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: nexusTheme_1.nexusColors.primary.main,
                },
            }}/>} label={<material_1.Typography sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                      Автооновлення
                    </material_1.Typography>}/>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={4}>
                <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} fullWidth onClick={() => setSystemData(generateSystemData())} sx={{
            borderColor: nexusTheme_1.nexusColors.primary.main,
            color: nexusTheme_1.nexusColors.primary.main,
            '&:hover': {
                background: `${nexusTheme_1.nexusColors.primary.main}20`,
                borderColor: nexusTheme_1.nexusColors.primary.light
            }
        }}>
                  Оновити зараз
                </material_1.Button>
              </material_1.Grid>
              <material_1.Grid item xs={12} sm={6} md={4}>
                <material_1.Button variant="contained" startIcon={<icons_material_1.Settings />} fullWidth sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.dark}, ${nexusTheme_1.nexusColors.primary.dark})`
            }
        }}>
                  Налаштування
                </material_1.Button>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Основні метрики */}
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
        <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
          <material_1.Grid item xs={12} sm={6} lg={3}>
            <MetricCard title="CPU Потужність" value={systemData.cpu.usage.toFixed(1)} unit="%" usage={systemData.cpu.usage} icon={icons_material_1.Speed} color={getUsageColor(systemData.cpu.usage)} trend={Math.random() * 4 - 2} details={[
            `${systemData.cpu.cores} ядер`,
            `${systemData.cpu.frequency.toFixed(0)} MHz`,
            `${systemData.cpu.temperature.toFixed(1)}°C`
        ]}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={3}>
            <MetricCard title="Оперативна Пам'ять" value={systemData.memory.used.toFixed(1)} unit="GB" usage={(systemData.memory.used / systemData.memory.total) * 100} icon={icons_material_1.Memory} color={getUsageColor((systemData.memory.used / systemData.memory.total) * 100)} trend={Math.random() * 3 - 1.5} details={[
            `З ${systemData.memory.total}GB`,
            `Доступно: ${systemData.memory.available.toFixed(1)}GB`,
            `Кеш: ${systemData.memory.cached.toFixed(1)}GB`
        ]}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={3}>
            <MetricCard title="Дискове Сховище" value={systemData.storage.used.toFixed(0)} unit="GB" usage={(systemData.storage.used / systemData.storage.total) * 100} icon={icons_material_1.Storage} color={getUsageColor((systemData.storage.used / systemData.storage.total) * 100)} trend={Math.random() * 2 - 1} details={[
            `З ${systemData.storage.total}GB`,
            `Вільно: ${systemData.storage.free.toFixed(0)}GB`,
            `Читання: ${systemData.storage.readSpeed.toFixed(0)} MB/s`
        ]}/>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} lg={3}>
            <MetricCard title="Мережа" value={systemData.network.download.toFixed(0)} unit=" Mbps" usage={Math.min((systemData.network.download / 1000) * 100, 100)} icon={icons_material_1.NetworkCheck} color={nexusTheme_1.nexusColors.info.main} trend={Math.random() * 5 - 2.5} details={[
            `Відвантаження: ${systemData.network.upload.toFixed(0)} Mbps`,
            `Затримка: ${systemData.network.latency.toFixed(0)}ms`,
            `Пакетів: ${systemData.network.packetsReceived.toLocaleString()}`
        ]}/>
          </material_1.Grid>
        </material_1.Grid>
      </framer_motion_1.motion.div>

      {/* Додаткові метрики */}
      <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
        <material_1.Grid item xs={12} md={6}>
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.accent.dark}15, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            borderRadius: 3
        }}>
              <material_1.CardContent sx={{ p: 3 }}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                  🎮 GPU Статистика
                </material_1.Typography>

                <material_1.Grid container spacing={3}>
                  <material_1.Grid item xs={6}>
                    <material_1.Box sx={{ textAlign: 'center' }}>
                      <material_1.CircularProgress variant="determinate" value={systemData.gpu.usage} size={80} thickness={4} sx={{
            color: getUsageColor(systemData.gpu.usage),
            mb: 2
        }}/>
                      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                        Навантаження
                      </material_1.Typography>
                      <material_1.Typography variant="h4" sx={{ color: getUsageColor(systemData.gpu.usage), fontWeight: 'bold' }}>
                        {systemData.gpu.usage.toFixed(1)}%
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.Grid>
                  <material_1.Grid item xs={6}>
                    <material_1.List>
                      <material_1.ListItem sx={{ px: 0 }}>
                        <material_1.ListItemIcon>
                          <icons_material_1.Memory sx={{ color: nexusTheme_1.nexusColors.primary.main }}/>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary="Пам'ять GPU" secondary={`${systemData.gpu.memory.toFixed(1)} GB`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                      </material_1.ListItem>
                      <material_1.ListItem sx={{ px: 0 }}>
                        <material_1.ListItemIcon>
                          <icons_material_1.Thermostat sx={{ color: nexusTheme_1.nexusColors.warning.main }}/>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary="Температура" secondary={`${systemData.gpu.temperature.toFixed(1)}°C`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                      </material_1.ListItem>
                      <material_1.ListItem sx={{ px: 0 }}>
                        <material_1.ListItemIcon>
                          <icons_material_1.GraphicEq sx={{ color: nexusTheme_1.nexusColors.info.main }}/>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary="Вентилятор" secondary={`${systemData.gpu.fanSpeed.toFixed(0)}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                      </material_1.ListItem>
                    </material_1.List>
                  </material_1.Grid>
                </material_1.Grid>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>
        </material_1.Grid>

        <material_1.Grid item xs={12} md={6}>
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.success.dark}15, ${nexusTheme_1.nexusColors.background.paper}90)`,
            border: `1px solid ${nexusTheme_1.nexusColors.success.main}30`,
            borderRadius: 3
        }}>
              <material_1.CardContent sx={{ p: 3 }}>
                <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3 }}>
                  🛡️ Системна Інформація
                </material_1.Typography>

                <material_1.List>
                  <material_1.ListItem>
                    <material_1.ListItemIcon>
                      <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.success.main }}/>
                    </material_1.ListItemIcon>
                    <material_1.ListItemText primary="Статус безпеки" secondary="Захищено" primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.success.main, fontWeight: 'bold' }}/>
                  </material_1.ListItem>
                  <material_1.ListItem>
                    <material_1.ListItemIcon>
                      <icons_material_1.Computer sx={{ color: nexusTheme_1.nexusColors.primary.main }}/>
                    </material_1.ListItemIcon>
                    <material_1.ListItemText primary="Активних користувачів" secondary={systemData.system.activeUsers} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                  </material_1.ListItem>
                  <material_1.ListItem>
                    <material_1.ListItemIcon>
                      <icons_material_1.Settings sx={{ color: nexusTheme_1.nexusColors.accent.main }}/>
                    </material_1.ListItemIcon>
                    <material_1.ListItemText primary="Запущених сервісів" secondary={systemData.system.runningServices} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                  </material_1.ListItem>
                  <material_1.ListItem>
                    <material_1.ListItemIcon>
                      <icons_material_1.Speed sx={{ color: nexusTheme_1.nexusColors.warning.main }}/>
                    </material_1.ListItemIcon>
                    <material_1.ListItemText primary="Середнє навантаження" secondary={`${systemData.system.loadAverage.join(', ')}`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                  </material_1.ListItem>
                </material_1.List>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>
        </material_1.Grid>
      </material_1.Grid>

      {/* Статус оновлення */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}>
        <material_1.Paper elevation={0} sx={{
            p: 2,
            textAlign: 'center',
            background: `${nexusTheme_1.nexusColors.background.paper}95`,
            border: `1px solid ${nexusTheme_1.nexusColors.primary.main}20`,
            borderRadius: 2
        }}>
          <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
            Останнє оновлення: {systemData.system.lastUpdate.toLocaleTimeString()} •
            Автооновлення: {autoRefresh ? 'Увімкнено' : 'Вимкнено'} •
            Інтервал: {refreshInterval / 1000}с
          </material_1.Typography>
        </material_1.Paper>
      </framer_motion_1.motion.div>
    </material_1.Box>);
}
exports.default = SystemMonitor;
