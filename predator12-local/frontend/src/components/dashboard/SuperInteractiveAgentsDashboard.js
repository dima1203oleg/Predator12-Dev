import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Grid, Typography, Chip, LinearProgress, IconButton, Tooltip, Paper, Avatar, Button, Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemIcon, ListItemText, FormControlLabel, Switch } from '@mui/material';
import { SmartToy, Analytics, Healing, AutoFixHigh, Timeline, Visibility, Settings, Close, RestartAlt, Stop, Build, BugReport, Security, MonitorHeart, CheckCircle, InfoOutlined as Info, Download, Backup, CloudSync, Assessment, Dashboard } from '@mui/icons-material';
import { useFrame } from '@react-three/fiber';
import { Text as DreiText, Sphere } from '@react-three/drei';
// import { Vector3 } from 'three';
import { InteractiveAgentsGrid } from '../agents/InteractiveAgentsGrid';
import { AdvancedMetricsPanel } from '../metrics/AdvancedMetricsPanel';
// 3D Agent Visualizer Component
const Agent3D = ({ agent, position, isSelected, onClick }) => {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
        }
    });
    const getAgentColor = (health) => {
        switch (health) {
            case 'excellent': return '#00ff00';
            case 'good': return '#ffff00';
            case 'warning': return '#ff8800';
            case 'critical': return '#ff0000';
            default: return '#00ffff';
        }
    };
    return (_jsxs("group", { position: position, children: [_jsx(Sphere, { ref: meshRef, args: [isSelected ? 1.2 : hovered ? 1.1 : 1], onClick: onClick, onPointerOver: () => setHovered(true), onPointerOut: () => setHovered(false), children: _jsx("meshStandardMaterial", { color: getAgentColor(agent.health), emissive: getAgentColor(agent.health), emissiveIntensity: isSelected ? 0.5 : hovered ? 0.3 : 0.1, transparent: true, opacity: 0.8 }) }), _jsx(DreiText, { position: [0, -1.5, 0], fontSize: 0.3, color: "#ffffff", anchorX: "center", anchorY: "middle", children: agent.name.replace('Agent', '') })] }));
};
// Particles Animation Component
const ParticleField = () => {
    const particlesRef = useRef();
    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.001;
        }
    });
    const particles = Array.from({ length: 100 }, (_, i) => (_jsx(Sphere, { args: [0.02], position: [
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        ], children: _jsx("meshBasicMaterial", { color: "#00ffff", transparent: true, opacity: 0.3 }) }, i)));
    return _jsx("group", { ref: particlesRef, children: particles });
};
// System Health Indicator
const SystemHealthIndicator = ({ systemData }) => {
    const getOverallHealth = () => {
        // Calculate based on system metrics
        return 'excellent'; // Mock calculation
    };
    const healthStatus = getOverallHealth();
    const healthColor = healthStatus === 'excellent' ? '#00ff44' :
        healthStatus === 'good' ? '#ffff44' :
            healthStatus === 'warning' ? '#ff8800' : '#ff4444';
    return (_jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8 }, children: _jsxs(Paper, { sx: {
                p: 3,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
                border: `2px solid ${healthColor}`,
                borderRadius: 2,
                backdropFilter: 'blur(20px)',
                textAlign: 'center'
            }, children: [_jsx(Typography, { variant: "h5", className: "subtitle-glow", sx: { mb: 2 }, children: "\uD83C\uDFE5 \u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0435 \u0437\u0434\u043E\u0440\u043E\u0432'\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", mb: 2, children: _jsx(motion.div, { animate: {
                            scale: [1, 1.1, 1],
                            rotate: [0, 360, 0]
                        }, transition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }, children: _jsx(MonitorHeart, { sx: {
                                fontSize: 80,
                                color: healthColor,
                                filter: `drop-shadow(0 0 20px ${healthColor})`
                            } }) }) }), _jsx(Typography, { variant: "h3", sx: { color: healthColor, fontWeight: 'bold', mb: 1 }, children: healthStatus.toUpperCase() }), _jsx(Typography, { variant: "body1", sx: { color: '#cccccc' }, children: "\u0412\u0441\u0456 \u043A\u0440\u0438\u0442\u0438\u0447\u043D\u0456 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0438 \u043F\u0440\u0430\u0446\u044E\u044E\u0442\u044C \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E" }), _jsx(LinearProgress, { variant: "determinate", value: 99, sx: {
                        mt: 2,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: healthColor,
                            boxShadow: `0 0 15px ${healthColor}`
                        }
                    } }), _jsx(Typography, { variant: "caption", sx: { color: '#cccccc' }, children: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0430 \u0433\u043E\u0442\u043E\u0432\u043D\u0456\u0441\u0442\u044C: 99%" })] }) }));
};
// Live Activity Feed
const LiveActivityFeed = ({ agentsData }) => {
    const [activities] = useState([
        { time: '21:45:23', agent: 'SelfHealingAgent', action: 'Виправлено memory leak', type: 'fix' },
        { time: '21:44:56', agent: 'ContainerHealer', action: 'Перезапущено scheduler', type: 'restart' },
        { time: '21:44:12', agent: 'AutoImproveAgent', action: 'Оптимізовано маршрутизацію', type: 'improve' },
        { time: '21:43:45', agent: 'SelfDiagnosisAgent', action: 'Створено звіт метрик', type: 'report' },
        { time: '21:43:12', agent: 'SecurityAgent', action: 'Блокован підозрілий трафік', type: 'security' },
        { time: '21:42:34', agent: 'MonitoringAgent', action: 'Оновлено дашборди', type: 'update' }
    ]);
    const getActivityIcon = (type) => {
        switch (type) {
            case 'fix': return _jsx(Healing, { sx: { color: '#00ff44' } });
            case 'restart': return _jsx(RestartAlt, { sx: { color: '#ffff44' } });
            case 'improve': return _jsx(AutoFixHigh, { sx: { color: '#00ffff' } });
            case 'report': return _jsx(Assessment, { sx: { color: '#8800ff' } });
            case 'security': return _jsx(Security, { sx: { color: '#ff4444' } });
            case 'update': return _jsx(CloudSync, { sx: { color: '#ff8800' } });
            default: return _jsx(Info, { sx: { color: '#cccccc' } });
        }
    };
    return (_jsxs(Paper, { sx: {
            p: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(20px)',
            maxHeight: 400,
            overflow: 'auto'
        }, children: [_jsx(Typography, { variant: "h5", className: "subtitle-glow", sx: { mb: 2 }, children: "\uD83D\uDCFA \u0416\u0438\u0432\u0438\u0439 \u043A\u0430\u043D\u0430\u043B \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0456" }), _jsx(List, { children: activities.map((activity, index) => (_jsx(motion.div, { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: index * 0.1 }, children: _jsxs(ListItem, { sx: {
                            mb: 1,
                            bgcolor: 'rgba(0,0,0,0.3)',
                            borderRadius: 1,
                            border: '1px solid rgba(0,255,255,0.1)'
                        }, children: [_jsx(ListItemIcon, { children: getActivityIcon(activity.type) }), _jsx(ListItemText, { primary: _jsx(Typography, { sx: { color: '#ffffff', fontWeight: 'bold' }, children: activity.agent }), secondary: _jsxs(Box, { children: [_jsx(Typography, { sx: { color: '#cccccc' }, children: activity.action }), _jsx(Typography, { variant: "caption", sx: { color: '#888' }, children: activity.time })] }) })] }) }, index))) })] }));
};
export const SuperInteractiveAgentsDashboard = ({ agentsData, systemData }) => {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [view3D, setView3D] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showParticles, setShowParticles] = useState(true);
    const [agentDetails, setAgentDetails] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [realTimeUpdates, setRealTimeUpdates] = useState(true);
    // Enhanced mock data з повною інформацією
    const displayAgents = agentsData.length > 0 ? agentsData.map(agent => ({
        ...agent,
        version: '2.1.0',
        uptime: '72h 15m',
        lastActivity: '2 хв тому',
        tasksCompleted: Math.floor(Math.random() * 1000) + 100,
        errorCount: Math.floor(Math.random() * 5),
        description: `Агент ${agent.name} відповідає за автоматичне ${agent.name.includes('Heal') ? 'лікування та відновлення' : agent.name.includes('Improve') ? 'покращення та оптимізацію' : 'діагностику та моніторинг'} системи PREDATOR11.`,
        capabilities: [
            'Реалтайм моніторинг',
            'Автоматичне виправлення помилок',
            'Машинне навчання',
            'Predictive analytics',
            'Self-healing algorithms'
        ],
        metrics: {
            avgResponseTime: `${Math.floor(Math.random() * 100) + 10}ms`,
            successRate: `${Math.floor(Math.random() * 10) + 90}%`,
            throughput: `${Math.floor(Math.random() * 1000) + 500}/sec`
        }
    })) : [
        {
            name: 'SelfHealingAgent',
            status: 'active',
            health: 'excellent',
            cpu: '6%',
            memory: '39%',
            improvements: 12,
            fixes: 9,
            version: '2.1.0',
            uptime: '72h 15m',
            lastActivity: '2 хв тому',
            tasksCompleted: 847,
            errorCount: 0,
            description: 'Провідний агент системи автоматичного лікування та відновлення. Виявляє збої, усуває проблеми та забезпечує стабільність роботи всієї інфраструктури PREDATOR11.',
            capabilities: [
                'Автоматичне виявлення збоїв системи',
                'Самовідновлення критичних сервісів',
                'Health monitoring в реальному часі',
                'Emergency response та disaster recovery',
                'Failover management та load balancing',
                'Memory leak detection та усунення',
                'Container orchestration',
                'Predictive failure analysis'
            ],
            metrics: {
                avgResponseTime: '45ms',
                successRate: '99.2%',
                throughput: '1,247/sec'
            }
        },
        {
            name: 'AutoImproveAgent',
            status: 'active',
            health: 'good',
            cpu: '15%',
            memory: '57%',
            improvements: 8,
            fixes: 3,
            version: '2.0.5',
            uptime: '68h 42m',
            lastActivity: '1 хв тому',
            tasksCompleted: 623,
            errorCount: 2,
            description: 'Спеціалізований агент для постійного покращення та оптимізації системи. Аналізує продуктивність, рефакторить код та підвищує ефективність алгоритмів.',
            capabilities: [
                'Performance optimization та tuning',
                'Автоматичний code refactoring',
                'Algorithm enhancement та покращення',
                'Resource management та оптимізація',
                'Continuous improvement процеси',
                'ML model optimization',
                'Query optimization',
                'Cache management та warming'
            ],
            metrics: {
                avgResponseTime: '78ms',
                successRate: '95.8%',
                throughput: '892/sec'
            }
        },
        {
            name: 'SelfDiagnosisAgent',
            status: 'active',
            health: 'excellent',
            cpu: '12%',
            memory: '42%',
            improvements: 5,
            fixes: 7,
            version: '2.1.2',
            uptime: '71h 33m',
            lastActivity: '30 сек тому',
            tasksCompleted: 1156,
            errorCount: 1,
            description: 'Експертний агент діагностики та аналітики. Постійно моніторить стан системи, виявляє аномалії та прогнозує потенційні проблеми.',
            capabilities: [
                'System diagnostics та deep analysis',
                'Predictive analytics та forecasting',
                'Anomaly detection та pattern recognition',
                'Performance monitoring та profiling',
                'Health assessment та scoring',
                'Root cause analysis',
                'Trend analysis та insights',
                'Automated reporting та alerting'
            ],
            metrics: {
                avgResponseTime: '32ms',
                successRate: '98.7%',
                throughput: '1,543/sec'
            }
        },
        {
            name: 'ContainerHealer',
            status: 'active',
            health: 'excellent',
            cpu: '8%',
            memory: '28%',
            improvements: 15,
            fixes: 22,
            version: '1.9.8',
            uptime: '156h 12m',
            lastActivity: '45 сек тому',
            tasksCompleted: 2047,
            errorCount: 0,
            description: 'Найбільш досвідчений агент для управління Docker контейнерами. Забезпечує стабільність інфраструктури через автоматичне лікування та оптимізацію.',
            capabilities: [
                'Container health monitoring',
                'Автоматичні restart policies',
                'Dynamic resource scaling',
                'Advanced health checks',
                'Disaster recovery procedures',
                'Log analysis та troubleshooting',
                'Performance tuning',
                'Security compliance monitoring'
            ],
            metrics: {
                avgResponseTime: '23ms',
                successRate: '99.8%',
                throughput: '2,156/sec'
            }
        },
        {
            name: 'SecurityAgent',
            status: 'active',
            health: 'good',
            cpu: '18%',
            memory: '63%',
            improvements: 6,
            fixes: 11,
            version: '3.0.1',
            uptime: '89h 27m',
            lastActivity: '15 сек тому',
            tasksCompleted: 394,
            errorCount: 3,
            description: 'Агент безпеки найвищого рівня. Захищає систему від загроз, проводить аудити безпеки та забезпечує дотримання security policies.',
            capabilities: [
                'Real-time threat detection',
                'Vulnerability scanning та assessment',
                'Access control та authentication',
                'Security audit logging',
                'Incident response та containment',
                'Penetration testing',
                'Compliance monitoring',
                'Encryption management'
            ],
            metrics: {
                avgResponseTime: '156ms',
                successRate: '94.3%',
                throughput: '456/sec'
            }
        },
        {
            name: 'MonitoringAgent',
            status: 'idle',
            health: 'warning',
            cpu: '3%',
            memory: '21%',
            improvements: 2,
            fixes: 1,
            version: '1.8.3',
            uptime: '12h 8m',
            lastActivity: '5 хв тому',
            tasksCompleted: 78,
            errorCount: 7,
            description: 'Агент збору метрик та моніторингу. Відповідає за збір, аналіз та візуалізацію даних про продуктивність системи.',
            capabilities: [
                'Comprehensive metrics collection',
                'Alert management та escalation',
                'Dashboard generation та customization',
                'Trend analysis та forecasting',
                'Automated reporting',
                'SLA monitoring',
                'Capacity planning',
                'Performance benchmarking'
            ],
            metrics: {
                avgResponseTime: '234ms',
                successRate: '87.2%',
                throughput: '234/sec'
            }
        }
    ];
    const agentPositions = displayAgents.map((_, index) => {
        const angle = (index / displayAgents.length) * Math.PI * 2;
        return [Math.cos(angle) * 4, 0, Math.sin(angle) * 4];
    });
    // Real-time data updates
    useEffect(() => {
        if (!realTimeUpdates)
            return;
        const interval = setInterval(() => {
            // Симуляція оновлення даних агентів
            console.log('🔄 Оновлення даних агентів...');
        }, 5000);
        return () => clearInterval(interval);
    }, [realTimeUpdates]);
    const handleExecuteGlobalAction = async (action) => {
        console.log(`🌐 Виконується глобальна дія: ${action}`);
        // Реальна функціональність для кожної кнопки
        switch (action) {
            case 'restart-all-agents':
                console.log('🔄 Перезапуск всіх агентів...');
                // Тут буде реальний API виклик
                break;
            case 'optimize-system':
                console.log('⚡ Оптимізація системи...');
                // Тут буде виклик оптимізації
                break;
            case 'run-diagnostics':
                console.log('🔍 Запуск повної діагностики...');
                // Тут буде діагностика
                break;
            case 'backup-system':
                console.log('💾 Створення резервної копії...');
                // Тут буде backup
                break;
            case 'security-scan':
                console.log('🛡️ Запуск сканування безпеки...');
                // Тут буде security scan
                break;
            case 'export-metrics':
                console.log('📊 Експорт метрик...');
                // Тут буде експорт
                break;
        }
    };
    return (_jsxs(Box, { sx: { p: 3, minHeight: '100vh' }, children: [_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, children: _jsxs(Paper, { sx: {
                        p: 4,
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
                        border: '2px solid rgba(0,255,255,0.5)',
                        borderRadius: 3,
                        backdropFilter: 'blur(20px)'
                    }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h3", className: "title-cyberpunk", children: "\uD83E\uDD16 \u0426\u0435\u043D\u0442\u0440 \u0443\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F \u0430\u0433\u0435\u043D\u0442\u0430\u043C\u0438 PREDATOR11" }), _jsxs(Box, { display: "flex", gap: 2, alignItems: "center", children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: realTimeUpdates, onChange: (e) => setRealTimeUpdates(e.target.checked), sx: {
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ffff' },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ffff' }
                                                } }), label: _jsx(Typography, { sx: { color: '#ffffff' }, children: "\u0420\u0435\u0430\u043B\u044C\u043D\u0438\u0439 \u0447\u0430\u0441" }) }), _jsx(Tooltip, { title: view3D ? 'Перейти до 2D' : 'Перейти до 3D', children: _jsx(IconButton, { onClick: () => setView3D(!view3D), sx: {
                                                    color: '#00ffff',
                                                    bgcolor: view3D ? 'rgba(0,255,255,0.2)' : 'transparent'
                                                }, children: _jsx(Visibility, {}) }) })] })] }), _jsx(Box, { display: "flex", gap: 2, mb: 3, children: [
                                { key: 'dashboard', label: '🏠 Дашборд', icon: _jsx(Dashboard, {}) },
                                { key: 'metrics', label: '📊 Метрики', icon: _jsx(Analytics, {}) },
                                { key: 'activity', label: '📺 Активність', icon: _jsx(Timeline, {}) }
                            ].map(view => (_jsx(Button, { variant: currentView === view.key ? 'contained' : 'outlined', startIcon: view.icon, onClick: () => setCurrentView(view.key), sx: {
                                    color: currentView === view.key ? '#000' : '#00ffff',
                                    borderColor: '#00ffff',
                                    bgcolor: currentView === view.key ? '#00ffff' : 'transparent',
                                    '&:hover': {
                                        bgcolor: currentView === view.key ? '#00dddd' : 'rgba(0,255,255,0.1)'
                                    }
                                }, children: view.label }, view.key))) }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#00ff44', fontWeight: 'bold' }, children: displayAgents.filter(a => a.status === 'active').length }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0445 \u0430\u0433\u0435\u043D\u0442\u0456\u0432" })] }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#ffff44', fontWeight: 'bold' }, children: displayAgents.reduce((sum, a) => sum + (a.improvements || 0), 0) }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u041F\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u044C \u0437\u0430 \u0434\u0435\u043D\u044C" })] }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#ff8800', fontWeight: 'bold' }, children: displayAgents.reduce((sum, a) => sum + (a.fixes || 0), 0) }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0412\u0438\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044C \u0437\u0430 \u0434\u0435\u043D\u044C" })] }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#00ffff', fontWeight: 'bold' }, children: "99%" }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0413\u043E\u0442\u043E\u0432\u043D\u0456\u0441\u0442\u044C \u0441\u0438\u0441\u0442\u0435\u043C\u0438" })] }) })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.2 }, children: _jsxs(Paper, { sx: {
                        p: 3,
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
                        border: '1px solid rgba(0,255,255,0.3)',
                        borderRadius: 2,
                        backdropFilter: 'blur(20px)'
                    }, children: [_jsx(Typography, { variant: "h5", className: "subtitle-glow", sx: { mb: 2 }, children: "\uD83C\uDF10 \u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0456 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0457 \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(RestartAlt, {}), onClick: () => handleExecuteGlobalAction('restart-all-agents'), sx: {
                                            bgcolor: '#ffff44',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#dddd00', transform: 'translateY(-2px)' },
                                            transition: 'all 0.3s ease'
                                        }, children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u0432\u0441\u0456" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(AutoFixHigh, {}), onClick: () => handleExecuteGlobalAction('optimize-system'), sx: {
                                            bgcolor: '#00ff44',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#00dd00', transform: 'translateY(-2px)' }
                                        }, children: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0443\u0432\u0430\u0442\u0438" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(BugReport, {}), onClick: () => handleExecuteGlobalAction('run-diagnostics'), sx: {
                                            bgcolor: '#00ffff',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#00dddd', transform: 'translateY(-2px)' }
                                        }, children: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(Backup, {}), onClick: () => handleExecuteGlobalAction('backup-system'), sx: {
                                            bgcolor: '#ff8800',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#dd6600', transform: 'translateY(-2px)' }
                                        }, children: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430 \u043A\u043E\u043F\u0456\u044F" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(Security, {}), onClick: () => handleExecuteGlobalAction('security-scan'), sx: {
                                            bgcolor: '#ff4444',
                                            color: '#fff',
                                            '&:hover': { bgcolor: '#dd0000', transform: 'translateY(-2px)' }
                                        }, children: "\u0410\u0443\u0434\u0438\u0442 \u0431\u0435\u0437\u043F\u0435\u043A\u0438" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(Download, {}), onClick: () => handleExecuteGlobalAction('export-metrics'), sx: {
                                            bgcolor: '#8800ff',
                                            color: '#fff',
                                            '&:hover': { bgcolor: '#6600dd', transform: 'translateY(-2px)' }
                                        }, children: "\u0415\u043A\u0441\u043F\u043E\u0440\u0442 \u0437\u0432\u0456\u0442\u0443" }) })] })] }) }), _jsxs(AnimatePresence, { mode: "wait", children: [currentView === 'dashboard' && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.5 }, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(InteractiveAgentsGrid, { agents: displayAgents, onAgentSelect: (agent) => setAgentDetails(agent) }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsxs(Box, { display: "flex", flexDirection: "column", gap: 3, children: [_jsx(SystemHealthIndicator, { systemData: systemData }), _jsx(LiveActivityFeed, { agentsData: displayAgents })] }) })] }) }, "dashboard")), currentView === 'metrics' && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.5 }, children: _jsx(AdvancedMetricsPanel, {}) }, "metrics")), currentView === 'activity' && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.5 }, children: _jsx(Grid, { container: true, spacing: 3, children: _jsx(Grid, { item: true, xs: 12, children: _jsx(LiveActivityFeed, { agentsData: displayAgents }) }) }) }, "activity"))] }), _jsx(Dialog, { open: !!agentDetails, onClose: () => setAgentDetails(null), maxWidth: "lg", fullWidth: true, PaperProps: {
                    sx: {
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(30,30,60,0.98) 100%)',
                        border: '2px solid rgba(0,255,255,0.5)',
                        borderRadius: 3
                    }
                }, children: agentDetails && (_jsxs(_Fragment, { children: [_jsx(DialogTitle, { sx: { color: '#00ffff', borderBottom: '2px solid rgba(0,255,255,0.3)', pb: 2 }, children: _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(Avatar, { sx: { bgcolor: '#00ffff', mr: 2, width: 48, height: 48 }, children: agentDetails.name.includes('Heal') ? _jsx(Healing, {}) :
                                                    agentDetails.name.includes('Improve') ? _jsx(AutoFixHigh, {}) :
                                                        agentDetails.name.includes('Diagnosis') ? _jsx(Analytics, {}) : _jsx(SmartToy, {}) }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: agentDetails.name })] }), _jsx(IconButton, { onClick: () => setAgentDetails(null), children: _jsx(Close, { sx: { color: '#ffffff' } }) })] }) }), _jsx(DialogContent, { sx: { color: '#ffffff', p: 4 }, children: _jsxs(Grid, { container: true, spacing: 4, children: [_jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "h5", sx: { color: '#00ffff', mb: 3 }, children: "\uD83D\uDCCA \u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0441\u0442\u0430\u043D \u0442\u0430 \u043C\u0435\u0442\u0440\u0438\u043A\u0438" }), _jsx(TableContainer, { component: Paper, sx: { bgcolor: 'rgba(0,0,0,0.7)', mb: 3 }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#00ffff', fontWeight: 'bold' }, children: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440" }), _jsx(TableCell, { sx: { color: '#00ffff', fontWeight: 'bold' }, children: "\u0417\u043D\u0430\u0447\u0435\u043D\u043D\u044F" }), _jsx(TableCell, { sx: { color: '#00ffff', fontWeight: 'bold' }, children: "\u0421\u0442\u0430\u0442\u0443\u0441" })] }) }), _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0440\u043E\u0431\u043E\u0442\u0438" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agentDetails.status }), _jsx(TableCell, { children: _jsx(Chip, { label: agentDetails.status, sx: {
                                                                                    bgcolor: agentDetails.status === 'active' ? 'rgba(0,255,68,0.2)' : 'rgba(255,255,68,0.2)',
                                                                                    color: agentDetails.status === 'active' ? '#00ff44' : '#ffff44'
                                                                                } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0417\u0434\u043E\u0440\u043E\u0432'\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agentDetails.health }), _jsx(TableCell, { children: _jsx(Chip, { label: agentDetails.health, sx: {
                                                                                    bgcolor: agentDetails.health === 'excellent' ? 'rgba(0,255,68,0.2)' : 'rgba(255,255,68,0.2)',
                                                                                    color: agentDetails.health === 'excellent' ? '#00ff44' : '#ffff44'
                                                                                } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F CPU" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agentDetails.cpu }), _jsx(TableCell, { children: _jsx(LinearProgress, { variant: "determinate", value: parseInt(agentDetails.cpu?.replace('%', '') || '0'), sx: { width: 60 } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F \u043F\u0430\u043C\\'\u044F\u0442\u0456" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agentDetails.memory }), _jsx(TableCell, { children: _jsx(LinearProgress, { variant: "determinate", value: parseInt(agentDetails.memory?.replace('%', '') || '0'), sx: { width: 60 } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0412\u0435\u0440\u0441\u0456\u044F" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agentDetails.version }), _jsx(TableCell, { children: _jsx(Chip, { label: "\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u0430", size: "small", sx: { bgcolor: 'rgba(0,255,68,0.2)', color: '#00ff44' } }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0427\u0430\u0441 \u0440\u043E\u0431\u043E\u0442\u0438" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agentDetails.uptime }), _jsx(TableCell, { children: _jsx(CheckCircle, { sx: { color: '#00ff44' } }) })] })] })] }) }), agentDetails.metrics && (_jsxs(Box, { sx: { p: 3, bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\u26A1 \u041F\u043E\u043A\u0430\u0437\u043D\u0438\u043A\u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0456" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 4, children: [_jsx(Typography, { variant: "body2", sx: { color: '#888' }, children: "\u0427\u0430\u0441 \u0432\u0456\u0434\u0433\u0443\u043A\u0443" }), _jsx(Typography, { variant: "h6", sx: { color: '#00ffff' }, children: agentDetails.metrics.avgResponseTime })] }), _jsxs(Grid, { item: true, xs: 4, children: [_jsx(Typography, { variant: "body2", sx: { color: '#888' }, children: "\u0423\u0441\u043F\u0456\u0448\u043D\u0456\u0441\u0442\u044C" }), _jsx(Typography, { variant: "h6", sx: { color: '#00ff44' }, children: agentDetails.metrics.successRate })] }), _jsxs(Grid, { item: true, xs: 4, children: [_jsx(Typography, { variant: "body2", sx: { color: '#888' }, children: "\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u043D\u0430 \u0437\u0434\u0430\u0442\u043D\u0456\u0441\u0442\u044C" }), _jsx(Typography, { variant: "h6", sx: { color: '#ffff44' }, children: agentDetails.metrics.throughput })] })] })] }))] }), _jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "h5", sx: { color: '#00ffff', mb: 3 }, children: "\uD83D\uDE80 \u041C\u043E\u0436\u043B\u0438\u0432\u043E\u0441\u0442\u0456 \u0442\u0430 \u0444\u0443\u043D\u043A\u0446\u0456\u0457" }), agentDetails.capabilities && (_jsxs(Paper, { sx: { bgcolor: 'rgba(0,0,0,0.7)', p: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\uD83D\uDCA1 \u041E\u0441\u043D\u043E\u0432\u043D\u0456 \u043C\u043E\u0436\u043B\u0438\u0432\u043E\u0441\u0442\u0456" }), _jsx(List, { children: agentDetails.capabilities.map((capability, index) => (_jsxs(ListItem, { sx: { py: 0.5 }, children: [_jsx(ListItemIcon, { children: _jsx(CheckCircle, { sx: { color: '#00ff44', fontSize: 20 } }) }), _jsx(ListItemText, { primary: capability, sx: {
                                                                        color: '#fff',
                                                                        '& .MuiListItemText-primary': { fontSize: '0.9rem' }
                                                                    } })] }, index))) })] })), _jsxs(Paper, { sx: { bgcolor: 'rgba(0,0,0,0.7)', p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\uD83D\uDD27 \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u0456 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0457" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(Button, { fullWidth: true, variant: "outlined", startIcon: _jsx(RestartAlt, {}), onClick: () => console.log(`Перезапуск ${agentDetails.name}`), sx: { color: '#ffff44', borderColor: '#ffff44' }, children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A" }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Button, { fullWidth: true, variant: "outlined", startIcon: _jsx(Build, {}), onClick: () => console.log(`Оптимізація ${agentDetails.name}`), sx: { color: '#00ff44', borderColor: '#00ff44' }, children: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0430\u0446\u0456\u044F" }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Button, { fullWidth: true, variant: "outlined", startIcon: _jsx(BugReport, {}), onClick: () => console.log(`Діагностика ${agentDetails.name}`), sx: { color: '#ff8800', borderColor: '#ff8800' }, children: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430" }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Button, { fullWidth: true, variant: "outlined", startIcon: _jsx(Stop, {}), onClick: () => console.log(`Зупинка ${agentDetails.name}`), sx: { color: '#ff4444', borderColor: '#ff4444' }, children: "\u0417\u0443\u043F\u0438\u043D\u0438\u0442\u0438" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(Settings, {}), onClick: () => console.log(`Налаштування ${agentDetails.name}`), sx: { bgcolor: '#00ffff', color: '#000' }, children: "\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }) })] })] }), agentDetails.description && (_jsxs(Paper, { sx: { bgcolor: 'rgba(0,0,0,0.7)', p: 3, mt: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\uD83D\uDCCB \u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0438\u0439 \u043E\u043F\u0438\u0441" }), _jsx(Typography, { sx: { color: '#fff', lineHeight: 1.6 }, children: agentDetails.description })] }))] })] }) })] })) })] }));
};
