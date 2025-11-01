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
exports.RealtimeSystemMonitor = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const react_chartjs_2_1 = require("react-chartjs-2");
const chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const icons_material_1 = require("@mui/icons-material");
// Animated Metric Card Component
const MetricCard = ({ title, value, unit, icon, color, trend, chart }) => {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    const getProgressValue = (value) => {
        return parseInt(value.replace('%', '')) || 0;
    };
    const getTrendColor = (trend) => {
        if (trend > 0)
            return '#ff4444';
        if (trend < 0)
            return '#44ff44';
        return '#ffff44';
    };
    return (<framer_motion_1.motion.div whileHover={{ scale: 1.03, y: -5 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} transition={{ duration: 0.3 }}>
      <material_1.Card sx={{
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
        }}>
        {/* Animated Background Glow */}
        <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 0.1 : 0 }} transition={{ duration: 0.3 }} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
            pointerEvents: 'none'
        }}/>

        <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <material_1.Box display="flex" alignItems="center">
            <material_1.Box sx={{
            p: 1,
            borderRadius: '50%',
            bgcolor: `${color}20`,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
              {react_1.default.cloneElement(icon, { sx: { color, fontSize: 28 } })}
            </material_1.Box>
            <material_1.Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {title}
            </material_1.Typography>
          </material_1.Box>

          {trend !== undefined && (<material_1.Chip icon={<icons_material_1.TrendingUp />} label={`${trend > 0 ? '+' : ''}${trend}%`} size="small" sx={{
                bgcolor: `${getTrendColor(trend)}20`,
                color: getTrendColor(trend),
                fontWeight: 'bold'
            }}/>)}
        </material_1.Box>

        <material_1.Typography variant="h3" sx={{ color, fontWeight: 'bold', mb: 1 }}>
          {value}
          <material_1.Typography component="span" variant="h6" sx={{ color: '#cccccc', ml: 1 }}>
            {unit}
          </material_1.Typography>
        </material_1.Typography>

        {unit === '%' && (<material_1.Box mt={2}>
            <material_1.LinearProgress variant="determinate" value={getProgressValue(value)} sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                    backgroundColor: color,
                    boxShadow: `0 0 15px ${color}`,
                    transition: 'all 0.3s ease'
                }
            }}/>
          </material_1.Box>)}

        {chart && (<material_1.Box mt={2} height={60}>
            <react_chartjs_2_1.Line data={chart} options={{
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
            }}/>
          </material_1.Box>)}
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
// Real-time Chart Component
const RealtimeChart = ({ title, data, type = 'line' }) => {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
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
    const ChartComponent = type === 'bar' ? react_chartjs_2_1.Bar : type === 'doughnut' ? react_chartjs_2_1.Doughnut : react_chartjs_2_1.Line;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <material_1.Paper sx={{
            p: 3,
            height: 400,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)'
        }}>
        <ChartComponent data={data} options={chartOptions}/>
      </material_1.Paper>
    </framer_motion_1.motion.div>);
};
// System Status Indicator
const SystemStatusIndicator = ({ status, label }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'excellent':
                return { color: '#00ff00', icon: <icons_material_1.CheckCircleOutline />, label: 'Відмінно' };
            case 'good':
                return { color: '#ffff00', icon: <icons_material_1.CheckCircleOutline />, label: 'Добре' };
            case 'warning':
                return { color: '#ff8800', icon: <icons_material_1.Warning />, label: 'Попередження' };
            case 'critical':
                return { color: '#ff0000', icon: <icons_material_1.ErrorOutline />, label: 'Критично' };
            default:
                return { color: '#00ffff', icon: <icons_material_1.CheckCircleOutline />, label: 'Невідомо' };
        }
    };
    const config = getStatusConfig(status);
    return (<framer_motion_1.motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
      <material_1.Box display="flex" alignItems="center" sx={{ p: 2 }}>
        <framer_motion_1.motion.div animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
        }} transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }}>
          {react_1.default.cloneElement(config.icon, {
            sx: {
                color: config.color,
                fontSize: 32,
                filter: `drop-shadow(0 0 10px ${config.color})`
            }
        })}
        </framer_motion_1.motion.div>
        <material_1.Box ml={2}>
          <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
            {label}
          </material_1.Typography>
          <material_1.Typography variant="h6" sx={{ color: config.color, fontWeight: 'bold' }}>
            {config.label}
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>
    </framer_motion_1.motion.div>);
};
const RealtimeSystemMonitor = ({ systemData }) => {
    const [realTimeMode, setRealTimeMode] = (0, react_1.useState)(true);
    const [cpuHistory, setCpuHistory] = (0, react_1.useState)([]);
    const [memoryHistory, setMemoryHistory] = (0, react_1.useState)([]);
    const [networkHistory, setNetworkHistory] = (0, react_1.useState)([]);
    // Mock real-time data generation
    (0, react_1.useEffect)(() => {
        if (!realTimeMode)
            return;
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
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <material_1.Paper sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)'
        }}>
          <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
            <material_1.Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
              📊 Реалтайм Моніторинг Системи
            </material_1.Typography>
            <material_1.FormControlLabel control={<material_1.Switch checked={realTimeMode} onChange={(e) => setRealTimeMode(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00ffff',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00ffff',
                },
            }}/>} label={<material_1.Typography sx={{ color: '#ffffff' }}>
                  Реальний час
                </material_1.Typography>}/>
          </material_1.Box>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* System Status Overview */}
      <material_1.Grid container spacing={3} mb={3}>
        <material_1.Grid item xs={12} md={3}>
          <SystemStatusIndicator status="excellent" label="Загальний стан"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} md={3}>
          <SystemStatusIndicator status="good" label="Продуктивність"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} md={3}>
          <SystemStatusIndicator status="excellent" label="Безпека"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} md={3}>
          <SystemStatusIndicator status="good" label="Мережа"/>
        </material_1.Grid>
      </material_1.Grid>

      {/* Metrics Cards */}
      <material_1.Grid container spacing={3} mb={3}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="CPU" value="23" unit="%" icon={<icons_material_1.Speed />} color="#ff6b6b" trend={-2}/>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Пам'ять" value="58" unit="%" icon={<icons_material_1.Memory />} color="#4ecdc4" trend={5}/>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Диск" value="342" unit="GB" icon={<icons_material_1.Storage />} color="#45b7d1" trend={0}/>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Мережа" value="1.2" unit="GB/s" icon={<icons_material_1.NetworkCheck />} color="#96ceb4" trend={8}/>
        </material_1.Grid>
      </material_1.Grid>

      {/* Charts */}
      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12} md={6}>
          <RealtimeChart title="CPU Використання (Реальний час)" data={cpuChartData} type="line"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} md={6}>
          <RealtimeChart title="Пам'ять (Реальний час)" data={memoryChartData} type="line"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} md={6}>
          <RealtimeChart title="Статус Контейнерів" data={containerStatusData} type="doughnut"/>
        </material_1.Grid>
        <material_1.Grid item xs={12} md={6}>
          <RealtimeChart title="Продуктивність Агентів" data={agentPerformanceData} type="bar"/>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
exports.RealtimeSystemMonitor = RealtimeSystemMonitor;
