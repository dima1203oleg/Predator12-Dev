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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedMetricsPanel = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const MetricCard = ({ title, value, trend, icon, color = '#00d4ff' }) => {
    return (<material_1.Card style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${color}30`,
            transition: 'all 0.3s ease',
        }}>
      <material_1.CardContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color }}>{icon}</div>
          {trend !== undefined && (<material_1.Chip label={`${trend > 0 ? '+' : ''}${trend}%`} size="small" style={{
                backgroundColor: trend > 0 ? '#00ff0030' : '#ff000030',
                color: trend > 0 ? '#00ff00' : '#ff0000',
            }}/>)}
        </div>
        <material_1.Typography variant="h6" style={{ color: '#ffffff', marginBottom: 8 }}>
          {title}
        </material_1.Typography>
        <material_1.Typography variant="h4" style={{ color, fontWeight: 'bold' }}>
          {value}
        </material_1.Typography>
      </material_1.CardContent>
    </material_1.Card>);
};
const AdvancedMetricsPanel = () => {
    const [metrics, setMetrics] = (0, react_1.useState)({
        totalRequests: 0,
        avgResponseTime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        activeAgents: 0,
        successRate: 0,
    });
    (0, react_1.useEffect)(() => {
        const fetchMetrics = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // TODO: Замінити на реальний API виклик
                // const response = await fetch('/api/metrics');
                // const data = await response.json();
                // setMetrics(data);
                setMetrics({
                    totalRequests: 0,
                    avgResponseTime: 0,
                    cpuUsage: 0,
                    memoryUsage: 0,
                    activeAgents: 0,
                    successRate: 0,
                });
            }
            catch (error) {
                console.error('Failed to fetch metrics:', error);
            }
        });
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);
    return (<div>
      <material_1.Typography variant="h5" style={{
            color: '#00d4ff',
            marginBottom: 24,
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(0,212,255,0.5)',
        }}>
        📊 Розширена панель метрик
      </material_1.Typography>

      <material_1.Grid container spacing={3}>
        <material_1.Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Загальна кількість запитів" value={metrics.totalRequests.toLocaleString()} trend={12} icon={<icons_material_1.Assessment style={{ fontSize: 32 }}/>} color="#00d4ff"/>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Середній час відповіді" value={`${metrics.avgResponseTime}ms`} trend={-5} icon={<icons_material_1.Speed style={{ fontSize: 32 }}/>} color="#00ff88"/>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Використання CPU" value={`${metrics.cpuUsage}%`} trend={3} icon={<icons_material_1.TrendingUp style={{ fontSize: 32 }}/>} color="#ff9900"/>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Використання пам'яті" value={`${metrics.memoryUsage}%`} trend={-2} icon={<icons_material_1.Memory style={{ fontSize: 32 }}/>} color="#ff00ff"/>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Активні агенти" value={metrics.activeAgents} trend={8} icon={<icons_material_1.Assessment style={{ fontSize: 32 }}/>} color="#00ffff"/>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Успішність" value={`${metrics.successRate}%`} trend={1} icon={<icons_material_1.TrendingUp style={{ fontSize: 32 }}/>} color="#00ff00"/>
        </material_1.Grid>
      </material_1.Grid>

      <material_1.Paper style={{
            padding: 24,
            marginTop: 24,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,212,255,0.3)',
        }}>
        <material_1.Typography variant="h6" style={{ color: '#00d4ff', marginBottom: 16 }}>
          Тенденції системи
        </material_1.Typography>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <material_1.Typography variant="body2" style={{ color: '#ffffff' }}>
              CPU Load
            </material_1.Typography>
            <material_1.Typography variant="body2" style={{ color: '#00d4ff' }}>
              {metrics.cpuUsage}%
            </material_1.Typography>
          </div>
          <material_1.LinearProgress variant="determinate" value={metrics.cpuUsage} style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,212,255,0.2)',
        }} sx={{
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#00d4ff',
            },
        }}/>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <material_1.Typography variant="body2" style={{ color: '#ffffff' }}>
              Memory Usage
            </material_1.Typography>
            <material_1.Typography variant="body2" style={{ color: '#ff9900' }}>
              {metrics.memoryUsage}%
            </material_1.Typography>
          </div>
          <material_1.LinearProgress variant="determinate" value={metrics.memoryUsage} style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,153,0,0.2)',
        }} sx={{
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#ff9900',
            },
        }}/>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <material_1.Typography variant="body2" style={{ color: '#ffffff' }}>
              Success Rate
            </material_1.Typography>
            <material_1.Typography variant="body2" style={{ color: '#00ff00' }}>
              {metrics.successRate}%
            </material_1.Typography>
          </div>
          <material_1.LinearProgress variant="determinate" value={metrics.successRate} style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,255,0,0.2)',
        }} sx={{
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ff00',
            },
        }}/>
        </div>
      </material_1.Paper>
    </div>);
};
exports.AdvancedMetricsPanel = AdvancedMetricsPanel;
