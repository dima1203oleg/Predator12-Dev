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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusCore = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const NexusNavigation_1 = require("./NexusNavigation");
const I18nProvider_1 = require("../../i18n/I18nProvider");
const NotificationHub_1 = __importDefault(require("../notifications/NotificationHub"));
const EnhancedDashboard_1 = __importDefault(require("../dashboard/EnhancedDashboard"));
const SuperEnhancedDashboard_1 = __importDefault(require("../dashboard/SuperEnhancedDashboard"));
const appEventStore_1 = require("../../stores/appEventStore");
// Реальні модулі замість заглушок
const ETLModule_1 = __importDefault(require("../modules/ETLModule"));
const ChronoModule_1 = __importDefault(require("../modules/ChronoModule"));
const SimulatorModule_1 = __importDefault(require("../modules/SimulatorModule"));
const AdminModule_1 = require("../modules/AdminModule");
const OpenSearchModule_1 = require("../modules/OpenSearchModule");
const SelfImprovementDashboard_1 = __importDefault(require("../dashboard/SelfImprovementDashboard"));
// Нові кібер-компоненти з ТЗ
const MASupervisor_1 = __importDefault(require("../modules/MASupervisor"));
const CyberFaceAI_1 = __importDefault(require("../ai/CyberFaceAI"));
// Покращені модулі
const AdvancedAISystem_1 = __importDefault(require("../modules/AdvancedAISystem"));
const RealtimeAnalyticsEngine_1 = __importDefault(require("../modules/RealtimeAnalyticsEngine"));
const CyberSecurityMonitor_1 = __importDefault(require("../modules/CyberSecurityMonitor"));
// Компоненти реальних модулів тепер імпортовані вище
// Компонент для рендерингу активного модуля
const ModuleRenderer = () => {
    const { activeModule } = (0, NexusNavigation_1.useNexus)();
    const { t } = (0, I18nProvider_1.useTranslation)();
    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard':
                return <SuperEnhancedDashboard_1.default />;
            case 'mas':
                return (<MASupervisor_1.default agents={[
                        {
                            id: 'etl-1',
                            name: 'ETL Primary',
                            type: 'etl',
                            status: 'active',
                            position: [2, 0, 0],
                            metrics: { rps: 120, errors: 2, latency: 45, budget: 85, cpuUsage: 65, memoryUsage: 72 },
                            selfHealing: { enabled: true, lastAction: 'restart', actionCount: 3 },
                            policies: { maxRps: 200, maxErrors: 10, maxLatency: 100, autoRestart: true }
                        },
                        {
                            id: 'osint-1',
                            name: 'OSINT Collector',
                            type: 'osint',
                            status: 'active',
                            position: [-2, 0, 0],
                            metrics: { rps: 85, errors: 0, latency: 120, budget: 92, cpuUsage: 45, memoryUsage: 58 },
                            selfHealing: { enabled: true, lastAction: 'optimize', actionCount: 1 },
                            policies: { maxRps: 150, maxErrors: 5, maxLatency: 200, autoRestart: true }
                        },
                        // Додаткові агенти...
                    ]} onAgentAction={(agentId, action) => {
                        console.log(`Agent ${agentId}: ${action}`);
                    }}/>);
            case 'etl':
                return <ETLModule_1.default />;
            case 'chrono':
                return <ChronoModule_1.default />;
            case 'simulator':
                return <SimulatorModule_1.default />;
            case 'opensearch':
                return <OpenSearchModule_1.OpenSearchModule />;
            case 'admin':
                return <AdminModule_1.AdminModule />;
            case 'self-improvement':
                return <SelfImprovementDashboard_1.default />;
            case 'data-flow':
                return (<material_1.Box sx={{
                        p: 4,
                        color: nexusTheme_1.nexusColors.frost,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
            <material_1.Typography variant="h5" fontWeight={600}>
              Data Flow Map тимчасово недоступний
            </material_1.Typography>
            <material_1.Typography variant="body1" sx={{ opacity: 0.8 }}>
              3D-візуалізація потоків даних зараз вимкнена, щоб стабілізувати інтерфейс. Ми повернемо її після оновлення залежностей.
            </material_1.Typography>
          </material_1.Box>);
            case 'ai-system':
                return (<AdvancedAISystem_1.default agents={[
                        {
                            id: 'ai-analyzer',
                            name: 'Data Analyzer',
                            type: 'analyzer',
                            status: 'processing',
                            position: [2, 2, 0],
                            intelligence: 95,
                            efficiency: 88,
                            reliability: 92,
                            learningRate: 75,
                            connections: ['ai-predictor', 'ai-optimizer'],
                            capabilities: ['Pattern Recognition', 'Anomaly Detection', 'Data Mining'],
                            currentTask: 'Analyzing ETL data patterns',
                            insights: [
                                'Detected 3% increase in data quality',
                                'Found optimization opportunity in pipeline stage 2',
                                'Identified potential data source correlation'
                            ],
                            predictedActions: ['Optimize pipeline', 'Scale resources']
                        },
                        {
                            id: 'ai-predictor',
                            name: 'Trend Predictor',
                            type: 'predictor',
                            status: 'learning',
                            position: [-2, 2, 0],
                            intelligence: 89,
                            efficiency: 94,
                            reliability: 87,
                            learningRate: 92,
                            connections: ['ai-analyzer', 'ai-learner'],
                            capabilities: ['Forecasting', 'Trend Analysis', 'Risk Assessment'],
                            currentTask: 'Predicting system load for next 24h',
                            insights: [
                                'Expected 15% load increase at 14:00',
                                'Potential bottleneck in API gateway',
                                'Recommended scaling window: 13:30-16:00'
                            ],
                            predictedActions: ['Auto-scale', 'Load balance']
                        },
                        {
                            id: 'ai-optimizer',
                            name: 'Performance Optimizer',
                            type: 'optimizer',
                            status: 'active',
                            position: [0, -2, 0],
                            intelligence: 91,
                            efficiency: 96,
                            reliability: 89,
                            learningRate: 68,
                            connections: ['ai-analyzer', 'ai-protector'],
                            capabilities: ['Resource Optimization', 'Performance Tuning', 'Cost Reduction'],
                            currentTask: 'Optimizing database queries',
                            insights: [
                                'Reduced query time by 23%',
                                'Optimized 12 slow queries',
                                'Saved $45/day in compute costs'
                            ],
                            predictedActions: ['Index optimization', 'Cache tuning']
                        },
                        {
                            id: 'ai-protector',
                            name: 'Security Guardian',
                            type: 'protector',
                            status: 'alert',
                            position: [-2, -2, 0],
                            intelligence: 93,
                            efficiency: 85,
                            reliability: 98,
                            learningRate: 71,
                            connections: ['ai-optimizer', 'ai-learner'],
                            capabilities: ['Threat Detection', 'Vulnerability Scanning', 'Incident Response'],
                            currentTask: 'Monitoring for security threats',
                            insights: [
                                'Blocked 247 suspicious requests',
                                'Updated 5 security rules',
                                'Zero successful intrusions detected'
                            ],
                            predictedActions: ['Update firewall', 'Scan vulnerabilities']
                        },
                        {
                            id: 'ai-learner',
                            name: 'Continuous Learner',
                            type: 'learner',
                            status: 'learning',
                            position: [2, -2, 0],
                            intelligence: 87,
                            efficiency: 79,
                            reliability: 91,
                            learningRate: 98,
                            connections: ['ai-predictor', 'ai-protector'],
                            capabilities: ['Machine Learning', 'Model Training', 'Knowledge Synthesis'],
                            currentTask: 'Training new anomaly detection model',
                            insights: [
                                'Improved model accuracy to 94.2%',
                                'Learned 156 new patterns',
                                'Reduced false positives by 18%'
                            ],
                            predictedActions: ['Deploy model', 'Collect feedback']
                        }
                    ]} onAgentInteraction={(agentId, action) => {
                        console.log(`AI Agent ${agentId}: ${action}`);
                    }} onSystemOptimization={() => {
                        console.log('AI System optimization triggered');
                    }} showPredictions={true}/>);
            case 'analytics':
                return (<RealtimeAnalyticsEngine_1.default dataStreams={[
                        {
                            id: 'metrics-stream',
                            name: 'System Metrics',
                            type: 'metrics',
                            position: [5, 0, 0],
                            velocity: [-0.5, 0, 0],
                            intensity: 0.8,
                            frequency: 2,
                            dataPoints: [85, 92, 78, 95, 88],
                            status: 'normal',
                            source: 'monitoring',
                            destination: 'analytics-hub',
                            latency: 12,
                            throughput: 45.2,
                            errors: 0
                        },
                        {
                            id: 'logs-stream',
                            name: 'Application Logs',
                            type: 'logs',
                            position: [-5, 2, 0],
                            velocity: [0.3, -0.2, 0],
                            intensity: 0.6,
                            frequency: 1.5,
                            dataPoints: [234, 198, 267, 245, 289],
                            status: 'warning',
                            source: 'applications',
                            destination: 'analytics-hub',
                            latency: 8,
                            throughput: 78.5,
                            errors: 3
                        },
                        {
                            id: 'events-stream',
                            name: 'User Events',
                            type: 'events',
                            position: [0, 5, 0],
                            velocity: [0, -0.4, 0],
                            intensity: 0.9,
                            frequency: 3,
                            dataPoints: [1245, 1567, 1389, 1623, 1456],
                            status: 'normal',
                            source: 'frontend',
                            destination: 'analytics-hub',
                            latency: 15,
                            throughput: 123.7,
                            errors: 1
                        },
                        {
                            id: 'predictions-stream',
                            name: 'AI Predictions',
                            type: 'predictions',
                            position: [3, -3, 0],
                            velocity: [-0.2, 0.3, 0],
                            intensity: 0.7,
                            frequency: 1,
                            dataPoints: [67, 74, 69, 78, 71],
                            status: 'normal',
                            source: 'ai-engine',
                            destination: 'analytics-hub',
                            latency: 25,
                            throughput: 34.1,
                            errors: 0
                        }
                    ]} metrics={[
                        {
                            id: 'cpu-usage',
                            name: 'CPU Usage',
                            value: 67.3,
                            unit: '%',
                            trend: 'up',
                            threshold: { min: 0, max: 80 },
                            history: [65, 68, 71, 69, 67],
                            category: 'performance'
                        },
                        {
                            id: 'memory-usage',
                            name: 'Memory Usage',
                            value: 72.8,
                            unit: '%',
                            trend: 'stable',
                            threshold: { min: 0, max: 85 },
                            history: [71, 73, 72, 74, 73],
                            category: 'performance'
                        },
                        {
                            id: 'response-time',
                            name: 'Avg Response Time',
                            value: 145,
                            unit: 'ms',
                            trend: 'down',
                            threshold: { min: 0, max: 200 },
                            history: [165, 152, 148, 143, 145],
                            category: 'performance'
                        },
                        {
                            id: 'error-rate',
                            name: 'Error Rate',
                            value: 0.12,
                            unit: '%',
                            trend: 'down',
                            threshold: { min: 0, max: 1 },
                            history: [0.18, 0.15, 0.13, 0.11, 0.12],
                            category: 'quality'
                        },
                        {
                            id: 'throughput',
                            name: 'Requests/sec',
                            value: 847,
                            unit: '/s',
                            trend: 'up',
                            threshold: { min: 0, max: 1000 },
                            history: [823, 834, 841, 839, 847],
                            category: 'performance'
                        },
                        {
                            id: 'security-score',
                            name: 'Security Score',
                            value: 94.5,
                            unit: '/100',
                            trend: 'stable',
                            threshold: { min: 90, max: 100 },
                            history: [94, 95, 94, 94, 95],
                            category: 'security'
                        }
                    ]} onStreamSelect={(streamId) => console.log('Stream selected:', streamId)} onMetricAlert={(metric) => console.log('Metric alert:', metric.name)} autoOptimize={true} showPredictions={true}/>);
            case 'security':
                return (<CyberSecurityMonitor_1.default threats={[
                        {
                            id: 'threat-001',
                            name: 'Suspicious Login Attempts',
                            type: 'intrusion',
                            severity: 'high',
                            position: [3, 2, 1],
                            size: 0.8,
                            detected: new Date(Date.now() - 1000 * 60 * 15),
                            source: '192.168.1.45',
                            target: 'auth-service',
                            status: 'active',
                            confidence: 87,
                            impact: 65,
                            details: 'Multiple failed login attempts detected from suspicious IP'
                        },
                        {
                            id: 'threat-002',
                            name: 'DDoS Attack Vector',
                            type: 'ddos',
                            severity: 'critical',
                            position: [-2, 3, -1],
                            size: 1.2,
                            detected: new Date(Date.now() - 1000 * 60 * 5),
                            source: 'botnet-cluster',
                            target: 'api-gateway',
                            status: 'contained',
                            confidence: 95,
                            impact: 89,
                            details: 'High-volume request pattern indicating DDoS attack'
                        },
                        {
                            id: 'threat-003',
                            name: 'Malware Signature',
                            type: 'malware',
                            severity: 'medium',
                            position: [1, -2, 2],
                            size: 0.6,
                            detected: new Date(Date.now() - 1000 * 60 * 30),
                            source: 'email-attachment',
                            target: 'workstation-12',
                            status: 'neutralized',
                            confidence: 78,
                            impact: 42,
                            details: 'Known malware signature detected in email attachment'
                        },
                        {
                            id: 'threat-004',
                            name: 'Data Exfiltration Attempt',
                            type: 'anomaly',
                            severity: 'high',
                            position: [-3, -1, 0],
                            size: 0.9,
                            detected: new Date(Date.now() - 1000 * 60 * 8),
                            source: 'internal-user',
                            target: 'database-cluster',
                            status: 'investigating',
                            confidence: 71,
                            impact: 78,
                            details: 'Unusual data access pattern detected'
                        }
                    ]} metrics={[
                        {
                            id: 'firewall-status',
                            name: 'Firewall',
                            value: 98.5,
                            unit: '%',
                            threshold: 95,
                            status: 'safe',
                            category: 'firewall',
                            history: [98, 99, 98, 97, 99],
                            lastUpdate: new Date()
                        },
                        {
                            id: 'intrusion-detection',
                            name: 'IDS/IPS',
                            value: 94.2,
                            unit: '%',
                            threshold: 90,
                            status: 'safe',
                            category: 'intrusion',
                            history: [93, 94, 95, 94, 94],
                            lastUpdate: new Date()
                        },
                        {
                            id: 'antivirus-coverage',
                            name: 'Antivirus',
                            value: 99.7,
                            unit: '%',
                            threshold: 95,
                            status: 'safe',
                            category: 'antivirus',
                            history: [99, 100, 99, 99, 100],
                            lastUpdate: new Date()
                        },
                        {
                            id: 'network-security',
                            name: 'Network',
                            value: 87.3,
                            unit: '%',
                            threshold: 85,
                            status: 'warning',
                            category: 'network',
                            history: [89, 88, 87, 86, 87],
                            lastUpdate: new Date()
                        },
                        {
                            id: 'access-control',
                            name: 'Access Control',
                            value: 91.8,
                            unit: '%',
                            threshold: 90,
                            status: 'safe',
                            category: 'access',
                            history: [91, 92, 91, 92, 92],
                            lastUpdate: new Date()
                        },
                        {
                            id: 'vulnerability-score',
                            name: 'Vulnerabilities',
                            value: 76.4,
                            unit: '%',
                            threshold: 80,
                            status: 'warning',
                            category: 'network',
                            history: [78, 77, 76, 75, 76],
                            lastUpdate: new Date()
                        }
                    ]} onThreatAction={(threatId, action) => {
                        console.log(`Threat ${threatId}: ${action}`);
                    }} onMetricAlert={(metric) => {
                        console.log(`Security metric alert: ${metric.name}`);
                    }} realTimeScanning={true} autoResponse={false}/>);
            default:
                return <EnhancedDashboard_1.default />;
        }
    };
    return (<framer_motion_1.AnimatePresence mode="wait">
      <framer_motion_1.motion.div key={activeModule} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ width: '100%', height: '100%' }}>
        {renderModule()}
      </framer_motion_1.motion.div>
    </framer_motion_1.AnimatePresence>);
};
// Офлайн індикатор
const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = (0, react_1.useState)(navigator.onLine);
    const { t } = (0, I18nProvider_1.useTranslation)();
    const { addEvent } = (0, appEventStore_1.useAppEventStore)();
    (0, react_1.useEffect)(() => {
        const handleOnline = () => {
            setIsOnline(true);
            addEvent({ type: 'NETWORK_OFFLINE' }, t('offline.title'), t('notifications.types.info'), 'info');
        };
        const handleOffline = () => {
            setIsOnline(false);
            addEvent({ type: 'NETWORK_OFFLINE' }, t('offline.title'), t('offline.message'), 'error', [{
                    label: t('offline.retry'),
                    action: () => window.location.reload()
                }]);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addEvent, t]);
    if (isOnline)
        return null;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: nexusTheme_1.nexusColors.error,
            color: 'white',
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 'bold'
        }}>
      🔴 {t('offline.message')} • {t('offline.cache_mode')}
    </framer_motion_1.motion.div>);
};
// Головний layout компонент
const NexusLayout = () => {
    const { isDrawerOpen, setActiveModule, activeModule } = (0, NexusNavigation_1.useNexus)();
    const { language, setLanguage } = (0, I18nProvider_1.useTranslation)();
    // Обробник команд від AI асистента
    const handleAICommand = (command) => {
        switch (command) {
            case 'navigate_mas':
                setActiveModule('mas');
                break;
            case 'navigate_etl':
                setActiveModule('etl');
                break;
            case 'navigate_security':
                setActiveModule('security');
                break;
            case 'show_status':
                setActiveModule('dashboard');
                break;
            default:
                console.log('Unknown AI command:', command);
        }
    };
    return (<material_1.Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <material_1.CssBaseline />

      {/* Офлайн індикатор */}
      <OfflineIndicator />

      {/* Навігаційна панель */}
      <NexusNavigation_1.NexusNavigation />

      {/* Основний контент */}
      <material_1.Box component="main" sx={{
            flexGrow: 1,
            width: `calc(100% - ${isDrawerOpen ? '280px' : '80px'})`,
            transition: 'width 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
        {/* Language Switcher */}
        <material_1.Box sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1200,
            display: 'flex',
            gap: 1
        }}>
          <material_1.Tooltip title="Перемикач мови / Language Switcher">
            <material_1.IconButton onClick={() => setLanguage(language === 'UA' ? 'EN' : 'UA')} sx={{
            bgcolor: `${nexusTheme_1.nexusColors.obsidian}90`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
            backdropFilter: 'blur(10px)',
            color: nexusTheme_1.nexusColors.frost,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
                bgcolor: `${nexusTheme_1.nexusColors.quantum}20`,
                borderColor: nexusTheme_1.nexusColors.quantum
            }
        }}>
              <icons_material_1.Language />
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: `${nexusTheme_1.nexusColors.obsidian}90`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
            borderRadius: 1,
            backdropFilter: 'blur(10px)',
            px: 2,
            color: nexusTheme_1.nexusColors.frost,
            fontSize: '0.9rem',
            fontFamily: 'Orbitron, monospace'
        }}>
            {language}
          </material_1.Box>
        </material_1.Box>

        {/* Модуль контент */}
        <ModuleRenderer />

        {/* Notification Hub */}
        <NotificationHub_1.default />

        {/* CyberFace AI Assistant */}
        <CyberFaceAI_1.default onCommand={handleAICommand} systemStatus={{
            health: 95,
            activeModules: [activeModule],
            alerts: 2
        }} position="bottom-right"/>
      </material_1.Box>
    </material_1.Box>);
};
// Кореневий компонент з провайдниками
const NexusCore = ({ userRole = 'Analyst', defaultModule = 'dashboard', defaultLanguage = 'UA' }) => {
    return (<material_1.ThemeProvider theme={nexusTheme_1.nexusTheme}>
      <I18nProvider_1.I18nProvider defaultLanguage={defaultLanguage}>
        <NexusNavigation_1.NexusProvider userRole={userRole} defaultModule={defaultModule}>
          <NexusLayout />
        </NexusNavigation_1.NexusProvider>
      </I18nProvider_1.I18nProvider>
    </material_1.ThemeProvider>);
};
exports.NexusCore = NexusCore;
exports.default = exports.NexusCore;
