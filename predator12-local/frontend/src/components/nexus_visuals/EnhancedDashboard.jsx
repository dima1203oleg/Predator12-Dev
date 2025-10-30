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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusAPI_1 = require("../../services/nexusAPI");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AlertTicker_1 = __importDefault(require("./AlertTicker"));
const GuidePanel_1 = __importDefault(require("../guide/GuidePanel"));
const ContextualChat_1 = __importDefault(require("../guide/ContextualChat"));
const mapSystemHealth = (rawHealth) => {
    if (!rawHealth) {
        return 'unknown';
    }
    switch (rawHealth.toLowerCase()) {
        case 'optimal':
        case 'healthy':
            return 'optimal';
        case 'warning':
        case 'degraded':
        case 'caution':
            return 'degraded';
        case 'critical':
        case 'failure':
        case 'down':
            return 'critical';
        default:
            return 'unknown';
    }
};
const EnhancedDashboard = ({ isSpeaking }) => {
    var _a;
    const [systemStatus, setSystemStatus] = (0, react_1.useState)(null);
    const [agents, setAgents] = (0, react_1.useState)([]);
    const [realTimeData, setRealTimeData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [failed, setFailed] = (0, react_1.useState)(false);
    const [showChat, setShowChat] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchData();
        // Set up WebSocket for real-time updates
        const ws = nexusAPI_1.nexusAPI.connect3DStream((data) => {
            setRealTimeData(data);
        });
        // Periodic refresh
        const interval = setInterval(fetchData, 10000);
        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, []);
    const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [statusData, agentsData] = yield Promise.all([
                nexusAPI_1.nexusAPI.getSystemStatus(),
                nexusAPI_1.nexusAPI.getAgentsStatus()
            ]);
            setSystemStatus(statusData);
            setAgents(agentsData.agents);
            setRealTimeData({ etl_count: 3, data_volume: '1.2 TB' });
            setFailed(false);
            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            setFailed(true);
            setLoading(false);
            setSystemStatus({
                system_health: 'optimal',
                health: 'optimal',
                health_percentage: 95,
                active_agents: 12,
                quantum_events: 47,
                galactic_risks: 'minimal',
                data_teleportation: 'active',
                neural_network: 'operational',
                anomaly_chronicle: [
                    {
                        type: 'demo',
                        level: 'info',
                        location: 'Nexus Core',
                        timestamp: new Date().toISOString()
                    }
                ]
            });
            setAgents([
                { name: 'ETL-Agent-01', status: 'active', health: 'optimal', cpu: '45%', memory: '32%', type: 'etl' },
                { name: 'MAS-Agent-02', status: 'active', health: 'optimal', cpu: '67%', memory: '28%', type: 'mas' },
                { name: 'Security-Agent-03', status: 'warning', health: 'warning', cpu: '89%', memory: '71%', type: 'security' },
                { name: 'Data-Agent-04', status: 'active', health: 'optimal', cpu: '23%', memory: '19%', type: 'data' },
                { name: 'Analytics-Agent-05', status: 'active', health: 'optimal', cpu: '55%', memory: '41%', type: 'analytics' }
            ]);
            setRealTimeData({ etl_count: 3, data_volume: '1.2 TB' });
        }
    });
    const handleGuideAction = (action) => {
        switch (action) {
            case 'optimize-agents':
                console.log('Оптимізація агентів...');
                break;
            case 'restart-unhealthy':
                console.log('Перезапуск проблемних агентів...');
                break;
            case 'analyze-queues':
                console.log('Аналіз черг...');
                break;
            case 'clear-cache':
                console.log('Очищення кешу...');
                break;
            case 'apply-optimizations':
                console.log('Застосування оптимізацій...');
                break;
            case 'create-optimization-plan':
                console.log('Створення плану оптимізації...');
                break;
            case 'renew-certificates':
                console.log('Оновлення сертифікатів...');
                break;
            case 'security-audit':
                console.log('Повний аудит безпеки...');
                break;
            case 'deep-analysis':
                console.log('Глибший аналіз...');
                break;
            case 'show-metrics':
                console.log('Показ метрик...');
                break;
            case 'toggle-chat':
                setShowChat((v) => !v);
                break;
            default:
                console.log('Дія з чату:', action);
        }
    };
    if (loading) {
        return (<material_1.Box sx={{ p: 3 }}>
        <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
          Завантаження дашборду...
        </material_1.Typography>
        <material_1.LinearProgress sx={{ color: nexusTheme_1.nexusColors.emerald }}/>
      </material_1.Box>);
    }
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh', background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})` }}>
      {/* Header */}
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
          Enhanced Dashboard
        </material_1.Typography>
        <material_1.IconButton onClick={fetchData} sx={{ ml: 2, color: nexusTheme_1.nexusColors.emerald }}>
          <icons_material_1.Refresh />
        </material_1.IconButton>
      </material_1.Box>

      {failed && (<material_1.Box sx={{ mb: 3, px: 2, py: 1.5, borderRadius: 2, border: `1px solid ${nexusTheme_1.nexusColors.warning}60`, backgroundColor: `${nexusTheme_1.nexusColors.warning}10` }}>
          <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.warning }}>
            Працюємо у демонстраційному режимі. Бекенд недоступний, показуємо мок-дані.
          </material_1.Typography>
        </material_1.Box>)}

      {/* Alert Ticker */}
      <AlertTicker_1.default filterSeverities={['warning', 'critical']}/>

      {/* Main Grid */}
      <material_1.Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
        {/* System Status Card */}
        <material_1.Card sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            backdropFilter: 'blur(10px)'
        }}>
          <material_1.CardContent>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <icons_material_1.Security sx={{ color: nexusTheme_1.nexusColors.sapphire, mr: 1 }}/>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                System Status
              </material_1.Typography>
            </material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
              Overall Health: {(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.health) || 'Unknown'}
            </material_1.Typography>
            <material_1.LinearProgress variant="determinate" value={(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.health_percentage) || 0} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}40`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.emerald
            }
        }}/>
          </material_1.CardContent>
        </material_1.Card>

        {/* Agents Status Card */}
        <material_1.Card sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            backdropFilter: 'blur(10px)'
        }}>
          <material_1.CardContent>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <icons_material_1.Psychology sx={{ color: nexusTheme_1.nexusColors.amethyst, mr: 1 }}/>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Agents Status
              </material_1.Typography>
            </material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
              Active: {agents.filter(a => a.status === 'active').length}/{agents.length}
            </material_1.Typography>
            <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {agents.slice(0, 5).map((agent, index) => (<material_1.Chip key={index} label={agent.name} size="small" sx={{
                backgroundColor: agent.status === 'active' ? `${nexusTheme_1.nexusColors.success}20` : `${nexusTheme_1.nexusColors.warning}20`,
                color: agent.status === 'active' ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.warning
            }}/>))}
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>

        {/* Data Metrics Card */}
        <material_1.Card sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            backdropFilter: 'blur(10px)'
        }}>
          <material_1.CardContent>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <icons_material_1.DataUsage sx={{ color: nexusTheme_1.nexusColors.emerald, mr: 1 }}/>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Data Metrics
              </material_1.Typography>
            </material_1.Box>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
              ETL Processes: {(realTimeData === null || realTimeData === void 0 ? void 0 : realTimeData.etl_count) || 0} active
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
              Data Volume: {(realTimeData === null || realTimeData === void 0 ? void 0 : realTimeData.data_volume) || '0 GB'} processed
            </material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>
      </material_1.Box>


      {/* Guide Panel */}
      <GuidePanel_1.default systemHealth={mapSystemHealth(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.health)} agentsData={agents} onQuickAction={handleGuideAction} alertsCount={((_a = systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.anomaly_chronicle) === null || _a === void 0 ? void 0 : _a.length) || 0}/>

      {/* Contextual Chat */}
      {showChat && (<ContextualChat_1.default visible={showChat} module="dashboard" systemHealth={mapSystemHealth(systemStatus === null || systemStatus === void 0 ? void 0 : systemStatus.health)} agentsData={agents} onAction={handleGuideAction}/>)}
    </material_1.Box>);
};
exports.default = EnhancedDashboard;
