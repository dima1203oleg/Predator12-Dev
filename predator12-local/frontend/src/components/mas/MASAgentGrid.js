import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Avatar, LinearProgress, IconButton, Tooltip, Button, Stack, Divider, Badge, Alert } from '@mui/material';
import { Psychology as PsychologyIcon, Router as RouterIcon, Gavel as GavelIcon, Assistant as GuideIcon, CloudUpload as IngestIcon, Assessment as QualityIcon, Transform as MapperIcon, Hub as ETLIcon, Search as IndexIcon, DataArray as EmbedIcon, TravelExplore as OSINTIcon, AccountTree as GraphIcon, Warning as AnomalyIcon, TrendingUp as ForecastIcon, Science as SimulatorIcon, DataArray as SyntheticIcon, FileDownload as ExportIcon, AttachMoney as BillingIcon, Security as PIIIcon, Healing as HealIcon, BugReport as DiagnosisIcon, AutoAwesome as ImprovementIcon, Shield as RedTeamIcon, Security, TrendingUp, Refresh as RefreshIcon, Info as InfoIcon, Pause as PauseIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import { COMPETITION_SCENARIOS, AGENT_MODEL_ASSIGNMENTS, simulateCompetitionResults, formatModelName, getTotalModelsCount } from '../../services/modelRegistry';
const MASAgentGrid = ({ onAgentAction, onShowLogs, realTimeMode = true }) => {
    const { t } = useI18n();
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [competitionActive, setCompetitionActive] = useState(false);
    const [arbiterResults, setArbiterResults] = useState({});
    // Agent icons mapping
    const agentIcons = useMemo(() => ({
        'ChiefOrchestrator': PsychologyIcon,
        'QueryPlanner': RouterIcon,
        'ModelRouter': RouterIcon,
        'Arbiter': GavelIcon,
        'NexusGuide': GuideIcon,
        'DatasetIngest': IngestIcon,
        'DataQuality': QualityIcon,
        'SchemaMapper': MapperIcon,
        'ETLOrchestrator': ETLIcon,
        'Indexer': IndexIcon,
        'Embedding': EmbedIcon,
        'OSINTCrawler': OSINTIcon,
        'GraphBuilder': GraphIcon,
        'Anomaly': AnomalyIcon,
        'Forecast': ForecastIcon,
        'Simulator': SimulatorIcon,
        'SyntheticData': SyntheticIcon,
        'ReportExport': ExportIcon,
        'BillingGate': BillingIcon,
        'PIIGuardian': PIIIcon,
        'AutoHeal': HealIcon,
        'SelfDiagnosis': DiagnosisIcon,
        'SelfImprovement': ImprovementIcon,
        'RedTeam': RedTeamIcon,
        'ComplianceMonitor': Security,
        'PerformanceOptimizer': TrendingUp
    }), []);
    // Initialize mock agents data (in production would come from API)
    useEffect(() => {
        const mockAgents = [
            // Core Agents (16) - using model assignments from registry
            {
                id: 'orchestrator',
                name: 'ChiefOrchestrator',
                category: 'core',
                status: 'active',
                health: 95,
                lastSeen: new Date().toISOString(),
                currentTask: 'Managing agent task graph',
                metrics: { cpu: 15, memory: 32, latency: 120, throughput: 450, errorRate: 0.1, costPerHour: 2.5, totalCalls: 15420 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['ChiefOrchestrator']
            },
            {
                id: 'query-planner',
                name: 'QueryPlanner',
                category: 'core',
                status: 'active',
                health: 88,
                lastSeen: new Date().toISOString(),
                currentTask: 'Routing complex analytics query',
                metrics: { cpu: 22, memory: 28, latency: 95, throughput: 320, errorRate: 0.2, costPerHour: 1.8, totalCalls: 8930 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['QueryPlanner'],
                fallbackModel: 'microsoft/phi-4-reasoning'
            },
            {
                id: 'model-router',
                name: 'ModelRouter',
                category: 'core',
                status: 'active',
                health: 92,
                lastSeen: new Date().toISOString(),
                currentTask: `Selecting optimal model from ${getTotalModelsCount()} options`,
                metrics: { cpu: 8, memory: 18, latency: 45, throughput: 890, errorRate: 0.05, costPerHour: 0.9, totalCalls: 25670 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['ModelRouter']
            },
            {
                id: 'arbiter',
                name: 'Arbiter',
                category: 'core',
                status: 'active',
                health: 89,
                lastSeen: new Date().toISOString(),
                currentTask: 'Judging model competition',
                metrics: { cpu: 35, memory: 45, latency: 180, throughput: 150, errorRate: 0.15, costPerHour: 3.2, totalCalls: 4560 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['Arbiter'],
                isArbitrating: true,
                competitionScore: 87
            },
            {
                id: 'nexus-guide',
                name: 'NexusGuide',
                category: 'core',
                status: 'active',
                health: 94,
                lastSeen: new Date().toISOString(),
                currentTask: 'Providing contextual assistance',
                metrics: { cpu: 12, memory: 24, latency: 85, throughput: 280, errorRate: 0.08, costPerHour: 1.5, totalCalls: 12340 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['NexusGuide']
            },
            {
                id: 'dataset-ingest',
                name: 'DatasetIngest',
                category: 'core',
                status: 'active',
                health: 96,
                lastSeen: new Date().toISOString(),
                currentTask: 'Processing 2.3GB customs data',
                metrics: { cpu: 45, memory: 68, latency: 2400, throughput: 89, errorRate: 0.02, costPerHour: 0.8, totalCalls: 890 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['DatasetIngest']
            },
            {
                id: 'data-quality',
                name: 'DataQuality',
                category: 'core',
                status: 'degraded',
                health: 71,
                lastSeen: new Date().toISOString(),
                currentTask: 'Profiling data completeness',
                metrics: { cpu: 28, memory: 52, latency: 1200, throughput: 125, errorRate: 1.2, costPerHour: 0.6, totalCalls: 3450 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['DataQuality']
            },
            {
                id: 'schema-mapper',
                name: 'SchemaMapper',
                category: 'core',
                status: 'active',
                health: 85,
                lastSeen: new Date().toISOString(),
                currentTask: 'Normalizing entity schemas',
                metrics: { cpu: 31, memory: 38, latency: 350, throughput: 195, errorRate: 0.25, costPerHour: 1.2, totalCalls: 6780 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['SchemaMapper']
            },
            {
                id: 'etl-orchestrator',
                name: 'ETLOrchestrator',
                category: 'core',
                status: 'active',
                health: 91,
                lastSeen: new Date().toISOString(),
                currentTask: 'Running DAG pipeline execution',
                metrics: { cpu: 18, memory: 34, latency: 890, throughput: 67, errorRate: 0.18, costPerHour: 0.7, totalCalls: 2340 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['ETLOrchestrator']
            },
            {
                id: 'indexer',
                name: 'Indexer',
                category: 'core',
                status: 'active',
                health: 93,
                lastSeen: new Date().toISOString(),
                currentTask: 'Indexing to OpenSearch clusters',
                metrics: { cpu: 25, memory: 41, latency: 450, throughput: 234, errorRate: 0.12, costPerHour: 0.9, totalCalls: 8920 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['Indexer']
            },
            {
                id: 'embedding',
                name: 'Embedding',
                category: 'core',
                status: 'active',
                health: 97,
                lastSeen: new Date().toISOString(),
                currentTask: 'Generating vector embeddings',
                metrics: { cpu: 42, memory: 56, latency: 180, throughput: 890, errorRate: 0.03, costPerHour: 2.8, totalCalls: 34570 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['Embedding']
            },
            {
                id: 'osint-crawler',
                name: 'OSINTCrawler',
                category: 'core',
                status: 'active',
                health: 82,
                lastSeen: new Date().toISOString(),
                currentTask: 'Crawling telegram channels',
                metrics: { cpu: 38, memory: 47, latency: 3200, throughput: 45, errorRate: 0.85, costPerHour: 1.1, totalCalls: 1560 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['OSINTCrawler']
            },
            {
                id: 'graph-builder',
                name: 'GraphBuilder',
                category: 'core',
                status: 'active',
                health: 86,
                lastSeen: new Date().toISOString(),
                currentTask: 'Building lobbying networks',
                metrics: { cpu: 51, memory: 72, latency: 2800, throughput: 23, errorRate: 0.32, costPerHour: 4.5, totalCalls: 670 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['GraphBuilder']
            },
            {
                id: 'anomaly',
                name: 'Anomaly',
                category: 'core',
                status: 'active',
                health: 90,
                lastSeen: new Date().toISOString(),
                currentTask: 'Detecting customs fraud patterns',
                metrics: { cpu: 29, memory: 35, latency: 650, throughput: 156, errorRate: 0.22, costPerHour: 1.3, totalCalls: 4530 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['Anomaly']
            },
            {
                id: 'forecast',
                name: 'Forecast',
                category: 'core',
                status: 'active',
                health: 88,
                lastSeen: new Date().toISOString(),
                currentTask: 'Predicting trade volumes',
                metrics: { cpu: 34, memory: 48, latency: 1100, throughput: 89, errorRate: 0.18, costPerHour: 1.6, totalCalls: 2890 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['Forecast']
            },
            {
                id: 'simulator',
                name: 'Simulator',
                category: 'core',
                status: 'active',
                health: 84,
                lastSeen: new Date().toISOString(),
                currentTask: 'Running tax policy scenarios',
                metrics: { cpu: 46, memory: 61, latency: 4500, throughput: 12, errorRate: 0.41, costPerHour: 5.2, totalCalls: 230 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['Simulator']
            },
            // Specialized Agents (8) - using model assignments from registry
            {
                id: 'synthetic-data',
                name: 'SyntheticData',
                category: 'specialized',
                status: 'paused',
                health: 0,
                lastSeen: new Date(Date.now() - 300000).toISOString(),
                currentTask: undefined,
                metrics: { cpu: 0, memory: 5, latency: 0, throughput: 0, errorRate: 0, costPerHour: 0, totalCalls: 0 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['SyntheticData']
            },
            {
                id: 'report-export',
                name: 'ReportExport',
                category: 'specialized',
                status: 'active',
                health: 95,
                lastSeen: new Date().toISOString(),
                currentTask: 'Generating PDF report',
                metrics: { cpu: 22, memory: 31, latency: 2200, throughput: 34, errorRate: 0.12, costPerHour: 0.8, totalCalls: 1240 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['ReportExport']
            },
            {
                id: 'billing-gate',
                name: 'BillingGate',
                category: 'specialized',
                status: 'active',
                health: 98,
                lastSeen: new Date().toISOString(),
                currentTask: 'Monitoring quotas and costs',
                metrics: { cpu: 8, memory: 15, latency: 45, throughput: 567, errorRate: 0.02, costPerHour: 0.3, totalCalls: 18920 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['BillingGate']
            },
            {
                id: 'pii-guardian',
                name: 'PIIGuardian',
                category: 'specialized',
                status: 'active',
                health: 96,
                lastSeen: new Date().toISOString(),
                currentTask: 'Masking sensitive data',
                metrics: { cpu: 15, memory: 23, latency: 120, throughput: 345, errorRate: 0.05, costPerHour: 0.6, totalCalls: 9870 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['PIIGuardian']
            },
            {
                id: 'auto-heal',
                name: 'AutoHeal',
                category: 'specialized',
                status: 'active',
                health: 89,
                lastSeen: new Date().toISOString(),
                currentTask: 'Monitoring service health',
                metrics: { cpu: 12, memory: 19, latency: 200, throughput: 123, errorRate: 0.08, costPerHour: 1.1, totalCalls: 3450 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['AutoHeal']
            },
            {
                id: 'self-diagnosis',
                name: 'SelfDiagnosis',
                category: 'specialized',
                status: 'active',
                health: 87,
                lastSeen: new Date().toISOString(),
                currentTask: 'Analyzing system logs',
                metrics: { cpu: 25, memory: 34, latency: 450, throughput: 78, errorRate: 0.15, costPerHour: 0.9, totalCalls: 2340 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['SelfDiagnosis']
            },
            {
                id: 'self-improvement',
                name: 'SelfImprovement',
                category: 'specialized',
                status: 'degraded',
                health: 65,
                lastSeen: new Date().toISOString(),
                currentTask: 'Analyzing model drift',
                metrics: { cpu: 31, memory: 45, latency: 1800, throughput: 23, errorRate: 1.5, costPerHour: 2.2, totalCalls: 890 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['SelfImprovement']
            },
            {
                id: 'red-team',
                name: 'RedTeam',
                category: 'specialized',
                status: 'down',
                health: 0,
                lastSeen: new Date(Date.now() - 1800000).toISOString(),
                currentTask: undefined,
                metrics: { cpu: 0, memory: 8, latency: 0, throughput: 0, errorRate: 100, costPerHour: 0, totalCalls: 0 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['RedTeam']
            },
            {
                id: 'compliance-monitor',
                name: 'ComplianceMonitor',
                category: 'specialized',
                status: 'active',
                health: 93,
                lastSeen: new Date().toISOString(),
                currentTask: 'Monitoring GDPR compliance',
                metrics: { cpu: 18, memory: 26, latency: 350, throughput: 167, errorRate: 0.09, costPerHour: 0.7, totalCalls: 5670 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['ComplianceMonitor'] || 'microsoft/phi-3-mini-4k-instruct'
            },
            {
                id: 'performance-optimizer',
                name: 'PerformanceOptimizer',
                category: 'specialized',
                status: 'active',
                health: 91,
                lastSeen: new Date().toISOString(),
                currentTask: 'Optimizing model latency',
                metrics: { cpu: 24, memory: 38, latency: 280, throughput: 203, errorRate: 0.06, costPerHour: 1.4, totalCalls: 8930 },
                modelProfile: AGENT_MODEL_ASSIGNMENTS['PerformanceOptimizer'] || 'qwen/qwen2.5-14b-instruct'
            }
        ];
        setAgents(mockAgents);
    }, []);
    // Real-time updates simulation
    useEffect(() => {
        if (!realTimeMode)
            return;
        const interval = setInterval(() => {
            setAgents(prev => prev.map(agent => ({
                ...agent,
                metrics: {
                    ...agent.metrics,
                    cpu: Math.max(0, Math.min(100, agent.metrics.cpu + (Math.random() - 0.5) * 10)),
                    memory: Math.max(0, Math.min(100, agent.metrics.memory + (Math.random() - 0.5) * 5)),
                    latency: Math.max(0, agent.metrics.latency + (Math.random() - 0.5) * 50),
                    throughput: Math.max(0, agent.metrics.throughput + (Math.random() - 0.5) * 20),
                    errorRate: Math.max(0, agent.metrics.errorRate + (Math.random() - 0.5) * 0.1)
                },
                lastSeen: agent.status === 'active' ? new Date().toISOString() : agent.lastSeen
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, [realTimeMode]);
    // Use scenarios from model registry service
    const competitionScenarios = useMemo(() => COMPETITION_SCENARIOS, []);
    const [currentScenario, setCurrentScenario] = useState(0);
    // Competition simulation for Arbiter
    useEffect(() => {
        if (!competitionActive)
            return;
        const scenario = competitionScenarios[currentScenario];
        const timeout = setTimeout(() => {
            const results = simulateCompetitionResults(scenario);
            setArbiterResults(results);
            setCompetitionActive(false);
        }, 7000); // 7 seconds for realistic competition time
        return () => clearTimeout(timeout);
    }, [competitionActive, currentScenario, competitionScenarios]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusColors.emerald;
            case 'degraded': return '#FFA726';
            case 'down': return nexusColors.crimson;
            case 'paused': return nexusColors.nebula;
            default: return nexusColors.shadow;
        }
    };
    const getHealthColor = (health) => {
        if (health >= 90)
            return nexusColors.emerald;
        if (health >= 70)
            return '#FFA726';
        if (health >= 40)
            return '#FF7043';
        return nexusColors.crimson;
    };
    const handleAgentAction = (agentId, action) => {
        if (action === 'start-competition' && agentId === 'arbiter') {
            setCompetitionActive(true);
            setArbiterResults({});
            // Cycle through scenarios
            setCurrentScenario(prev => (prev + 1) % competitionScenarios.length);
        }
        onAgentAction?.(agentId, action);
    };
    const coreAgents = agents.filter(a => a.category === 'core');
    const specializedAgents = agents.filter(a => a.category === 'specialized');
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "h4", sx: {
                            color: nexusColors.frost,
                            fontFamily: 'Orbitron',
                            mb: 2,
                            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }, children: t('mas.title') }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [_jsx(Grid, { item: true, xs: 12, md: 2.4, children: _jsx(Card, { sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.emerald}20, ${nexusColors.emerald}10)`,
                                        border: `1px solid ${nexusColors.emerald}60`
                                    }, children: _jsxs(CardContent, { sx: { py: 1.5 }, children: [_jsx(Typography, { variant: "h5", sx: { color: nexusColors.emerald, fontFamily: 'Orbitron' }, children: agents.filter(a => a.status === 'active').length }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: t('mas.active') })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 2.4, children: _jsx(Card, { sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.sapphire}20, ${nexusColors.sapphire}10)`,
                                        border: `1px solid ${nexusColors.sapphire}60`
                                    }, children: _jsxs(CardContent, { sx: { py: 1.5 }, children: [_jsx(Typography, { variant: "h5", sx: { color: nexusColors.sapphire, fontFamily: 'Orbitron' }, children: agents.reduce((sum, a) => sum + a.metrics.totalCalls, 0).toLocaleString() }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: t('mas.totalCalls') })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 2.4, children: _jsx(Card, { sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.quantum}20, ${nexusColors.quantum}10)`,
                                        border: `1px solid ${nexusColors.quantum}60`
                                    }, children: _jsxs(CardContent, { sx: { py: 1.5 }, children: [_jsxs(Typography, { variant: "h5", sx: { color: nexusColors.quantum, fontFamily: 'Orbitron' }, children: ["$", agents.reduce((sum, a) => sum + a.metrics.costPerHour, 0).toFixed(1), "/h"] }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: t('mas.totalCost') })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 2.4, children: _jsx(Card, { sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.nebula}20, ${nexusColors.nebula}10)`,
                                        border: `1px solid ${nexusColors.nebula}60`
                                    }, children: _jsxs(CardContent, { sx: { py: 1.5 }, children: [_jsx(Typography, { variant: "h5", sx: { color: nexusColors.nebula, fontFamily: 'Orbitron' }, children: getTotalModelsCount() }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: "\u0411\u0435\u0437\u043F\u043B\u0430\u0442\u043D\u0438\u0445 \u043C\u043E\u0434\u0435\u043B\u0435\u0439" })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 2.4, children: _jsx(Card, { sx: {
                                        background: `linear-gradient(135deg, ${nexusColors.crimson}20, ${nexusColors.crimson}10)`,
                                        border: `1px solid ${nexusColors.crimson}60`
                                    }, children: _jsxs(CardContent, { sx: { py: 1.5 }, children: [_jsx(Typography, { variant: "h5", sx: { color: nexusColors.crimson, fontFamily: 'Orbitron' }, children: agents.filter(a => a.status === 'down' || a.status === 'degraded').length }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: t('mas.issues') })] }) }) })] }), _jsx(AnimatePresence, { children: competitionActive && (_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, children: _jsxs(Alert, { severity: "info", sx: {
                                    mb: 2,
                                    background: `${nexusColors.sapphire}20`,
                                    border: `1px solid ${nexusColors.sapphire}`,
                                    color: nexusColors.frost
                                }, children: [competitionScenarios[currentScenario].title, ": ", competitionScenarios[currentScenario].models.map(formatModelName).join(' vs '), _jsx("br", {}), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: ["\u0422\u0435\u0441\u0442\u0443\u0454\u043C\u043E: ", competitionScenarios[currentScenario].tasks.join(', '), " \u2022 \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E ", getTotalModelsCount(), " \u0431\u0435\u0437\u043F\u043B\u0430\u0442\u043D\u0438\u0445 \u043C\u043E\u0434\u0435\u043B\u0435\u0439"] })] }) })) })] }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2, fontFamily: 'Orbitron' }, children: [t('mas.coreAgents'), " (", coreAgents.length, ")"] }), _jsx(Grid, { container: true, spacing: 2, sx: { mb: 4 }, children: coreAgents.map((agent) => {
                    const IconComponent = agentIcons[agent.name];
                    return (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(motion.div, { whileHover: { scale: 1.02 }, transition: { duration: 0.2 }, children: _jsx(Card, { sx: {
                                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                                    border: `2px solid ${getStatusColor(agent.status)}60`,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'visible',
                                    '&:hover': {
                                        borderColor: getStatusColor(agent.status),
                                        boxShadow: `0 4px 20px ${getStatusColor(agent.status)}40`
                                    }
                                }, onClick: () => setSelectedAgent(selectedAgent === agent.id ? null : agent.id), children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 1.5 }, children: [_jsx(Badge, { badgeContent: agent.isArbitrating ? '⚖️' : undefined, sx: { '& .MuiBadge-badge': { backgroundColor: nexusColors.sapphire } }, children: _jsx(Avatar, { sx: {
                                                            backgroundColor: `${getStatusColor(agent.status)}20`,
                                                            border: `1px solid ${getStatusColor(agent.status)}`
                                                        }, children: _jsx(IconComponent, { sx: { color: getStatusColor(agent.status) } }) }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                                                color: nexusColors.frost,
                                                                fontWeight: 'bold',
                                                                fontSize: '0.9rem'
                                                            }, children: agent.name }), _jsx(Chip, { label: agent.status.toUpperCase(), size: "small", sx: {
                                                                backgroundColor: `${getStatusColor(agent.status)}20`,
                                                                color: getStatusColor(agent.status),
                                                                fontSize: '0.7rem',
                                                                height: 18
                                                            } })] })] }), _jsxs(Box, { sx: { mb: 1.5 }, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", sx: { mb: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: t('mas.health') }), _jsxs(Typography, { variant: "caption", sx: { color: getHealthColor(agent.health) }, children: [agent.health, "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: agent.health, sx: {
                                                        height: 4,
                                                        backgroundColor: nexusColors.quantum + '40',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: getHealthColor(agent.health)
                                                        }
                                                    } })] }), agent.currentTask && (_jsxs(Typography, { variant: "caption", sx: {
                                                color: nexusColors.nebula,
                                                display: 'block',
                                                mb: 1,
                                                minHeight: '2.5em',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }, children: ["\uD83D\uDCCB ", agent.currentTask] })), _jsxs(Stack, { direction: "row", spacing: 2, sx: { mb: 1 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: "CPU" }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 'bold' }, children: [agent.metrics.cpu.toFixed(0), "%"] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: "MEM" }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 'bold' }, children: [agent.metrics.memory.toFixed(0), "%"] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: "COST" }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 'bold' }, children: ["$", agent.metrics.costPerHour.toFixed(1), "/h"] })] })] }), _jsx(Chip, { label: agent.modelProfile, size: "small", variant: "outlined", sx: {
                                                borderColor: nexusColors.quantum,
                                                color: nexusColors.frost,
                                                fontSize: '0.7rem',
                                                height: 20
                                            } }), _jsx(AnimatePresence, { children: selectedAgent === agent.id && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, children: [_jsx(Divider, { sx: { my: 2, borderColor: nexusColors.quantum } }), _jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: t('mas.latency') }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [agent.metrics.latency.toFixed(0), "ms"] })] }), _jsxs(Stack, { direction: "row", justifyContent: "space-between", children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: t('mas.throughput') }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [agent.metrics.throughput.toFixed(0), "/min"] })] }), _jsxs(Stack, { direction: "row", justifyContent: "space-between", children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: t('mas.errorRate') }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [agent.metrics.errorRate.toFixed(2), "%"] })] }), _jsxs(Stack, { direction: "row", justifyContent: "space-between", children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: t('mas.totalCalls') }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: agent.metrics.totalCalls.toLocaleString() })] })] }), agent.id === 'arbiter' && Object.keys(arbiterResults).length > 0 && (_jsxs(Box, { sx: { mt: 2, p: 1, backgroundColor: nexusColors.sapphire + '20', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.sapphire, fontWeight: 'bold' }, children: "\uD83C\uDFC6 \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438 \u0437\u043C\u0430\u0433\u0430\u043D\u043D\u044F:" }), Object.entries(arbiterResults)
                                                                .sort((a, b) => b[1] - a[1]) // Sort by score descending
                                                                .map(([model, score], index) => (_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsx(Stack, { direction: "row", alignItems: "center", spacing: 1, children: _jsxs(Typography, { variant: "caption", sx: {
                                                                                color: index === 0 ? nexusColors.quantum : nexusColors.frost,
                                                                                fontWeight: index === 0 ? 'bold' : 'normal'
                                                                            }, children: [index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉', " ", formatModelName(model)] }) }), _jsxs(Typography, { variant: "caption", sx: {
                                                                            color: index === 0 ? nexusColors.quantum : nexusColors.emerald,
                                                                            fontWeight: 'bold'
                                                                        }, children: [score.toFixed(1), "%"] })] }, model)))] })), _jsxs(Stack, { direction: "row", spacing: 1, sx: { mt: 2 }, children: [_jsx(Tooltip, { title: t('mas.showLogs'), children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        onShowLogs?.(agent.id);
                                                                    }, sx: { color: nexusColors.sapphire }, children: _jsx(InfoIcon, { fontSize: "small" }) }) }), agent.status === 'active' && (_jsx(Tooltip, { title: t('mas.pause'), children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleAgentAction(agent.id, 'pause');
                                                                    }, sx: { color: nexusColors.nebula }, children: _jsx(PauseIcon, { fontSize: "small" }) }) })), (agent.status === 'paused' || agent.status === 'down') && (_jsx(Tooltip, { title: t('mas.start'), children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleAgentAction(agent.id, 'start');
                                                                    }, sx: { color: nexusColors.emerald }, children: _jsx(PlayIcon, { fontSize: "small" }) }) })), _jsx(Tooltip, { title: t('mas.restart'), children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleAgentAction(agent.id, 'restart');
                                                                    }, sx: { color: nexusColors.quantum }, children: _jsx(RefreshIcon, { fontSize: "small" }) }) }), agent.id === 'arbiter' && !competitionActive && (_jsxs(Stack, { direction: "row", spacing: 0.5, children: [_jsx(Button, { size: "small", variant: "outlined", onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            handleAgentAction('arbiter', 'start-competition');
                                                                        }, sx: {
                                                                            borderColor: nexusColors.sapphire,
                                                                            color: nexusColors.sapphire,
                                                                            fontSize: '0.7rem'
                                                                        }, children: "\uD83C\uDFC6 \u0417\u043C\u0430\u0433\u0430\u043D\u043D\u044F" }), _jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u043C\u043E\u0434\u0435\u043B\u0435\u0439", children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                // TODO: Open ModelCatalog modal
                                                                            }, sx: { color: nexusColors.quantum }, children: _jsx(InfoIcon, { fontSize: "small" }) }) })] }))] })] })) })] }) }) }) }, agent.id));
                }) }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2, fontFamily: 'Orbitron' }, children: [t('mas.specializedAgents'), " (", specializedAgents.length, ")"] }), _jsx(Grid, { container: true, spacing: 2, children: specializedAgents.map((agent) => {
                    const IconComponent = agentIcons[agent.name];
                    return (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(motion.div, { whileHover: { scale: 1.02 }, transition: { duration: 0.2 }, children: _jsx(Card, { sx: {
                                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                                    border: `2px solid ${getStatusColor(agent.status)}60`,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: getStatusColor(agent.status),
                                        boxShadow: `0 4px 20px ${getStatusColor(agent.status)}40`
                                    }
                                }, onClick: () => setSelectedAgent(selectedAgent === agent.id ? null : agent.id), children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { mb: 1 }, children: [_jsx(Avatar, { sx: {
                                                        backgroundColor: `${getStatusColor(agent.status)}20`,
                                                        border: `1px solid ${getStatusColor(agent.status)}`,
                                                        width: 32,
                                                        height: 32
                                                    }, children: _jsx(IconComponent, { sx: { color: getStatusColor(agent.status), fontSize: '1rem' } }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Typography, { variant: "subtitle2", sx: {
                                                                color: nexusColors.frost,
                                                                fontWeight: 'bold',
                                                                fontSize: '0.8rem'
                                                            }, children: agent.name }), _jsx(Chip, { label: agent.status.toUpperCase(), size: "small", sx: {
                                                                backgroundColor: `${getStatusColor(agent.status)}20`,
                                                                color: getStatusColor(agent.status),
                                                                fontSize: '0.6rem',
                                                                height: 16
                                                            } })] })] }), agent.currentTask && (_jsx(Typography, { variant: "caption", sx: {
                                                color: nexusColors.nebula,
                                                display: 'block',
                                                mb: 1,
                                                minHeight: '2em',
                                                fontSize: '0.7rem'
                                            }, children: agent.currentTask })), _jsxs(Stack, { direction: "row", spacing: 1, sx: { mb: 1 }, children: [_jsx(Chip, { label: `${agent.metrics.cpu.toFixed(0)}% CPU`, size: "small", variant: "outlined", sx: { fontSize: '0.6rem', height: 18 } }), _jsx(Chip, { label: `$${agent.metrics.costPerHour.toFixed(1)}/h`, size: "small", variant: "outlined", sx: { fontSize: '0.6rem', height: 18 } })] })] }) }) }) }, agent.id));
                }) })] }));
};
export default MASAgentGrid;
