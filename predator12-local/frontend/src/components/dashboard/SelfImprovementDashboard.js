import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper, IconButton, Tooltip } from '@mui/material';
import { Psychology as BrainIcon, AutoFixHigh as HealIcon, Speed as OptimizeIcon, Assignment as DiagnosisIcon, TrendingUp as TrendIcon, Security as SecurityIcon, Refresh as RefreshIcon, PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
const SelfImprovementDashboard = () => {
    const [isRunning, setIsRunning] = useState(true);
    const [agents, setAgents] = useState([
        {
            id: 'self-improvement',
            name: 'Self Improvement',
            status: 'improving',
            improvements: 0,
            efficiency: 95.2,
            lastAction: 'Оптимізація алгоритму розподілу моделей',
            icon: BrainIcon,
            color: '#8B5CF6'
        },
        {
            id: 'auto-heal',
            name: 'Auto Heal',
            status: 'active',
            improvements: 0,
            efficiency: 98.7,
            lastAction: 'Виправлено витік пам\'яті в модулі ETL',
            icon: HealIcon,
            color: '#10B981'
        },
        {
            id: 'performance-optimizer',
            name: 'Performance Optimizer',
            status: 'active',
            improvements: 0,
            efficiency: 92.4,
            lastAction: 'Кешування результатів для повторних запитів',
            icon: OptimizeIcon,
            color: '#F59E0B'
        },
        {
            id: 'self-diagnosis',
            name: 'Self Diagnosis',
            status: 'active',
            improvements: 0,
            efficiency: 96.8,
            lastAction: 'Виявлено потенційну проблему з навантаженням',
            icon: DiagnosisIcon,
            color: '#EF4444'
        }
    ]);
    const [systemMetrics, setSystemMetrics] = useState([]);
    const [businessInsights, setBusinessInsights] = useState([]);
    // Симуляція роботи агентів
    useEffect(() => {
        if (!isRunning)
            return;
        const interval = setInterval(() => {
            // Оновлення агентів
            setAgents(prev => prev.map(agent => {
                const shouldImprove = Math.random() < 0.3; // 30% шансу на покращення
                if (shouldImprove) {
                    const improvements = [
                        'Оптимізація алгоритму розподілу моделей',
                        'Покращення accuracy прогнозування на 2.3%',
                        'Зменшення латентності відповіді на 150ms',
                        'Автоматичне налаштування параметрів',
                        'Оптимізація використання пам\'яті на 12%',
                        'Виправлено deadlock в черзі завдань',
                        'Відновлено з\'єднання з базою даних',
                        'Кешування результатів запитів',
                        'Паралелізація обробки в агентах'
                    ];
                    return {
                        ...agent,
                        status: 'improving',
                        improvements: agent.improvements + 1,
                        efficiency: Math.min(100, agent.efficiency + Math.random() * 2),
                        lastAction: improvements[Math.floor(Math.random() * improvements.length)]
                    };
                }
                return {
                    ...agent,
                    status: Math.random() < 0.8 ? 'active' : 'idle'
                };
            }));
            // Оновлення системних метрик
            const newMetric = {
                timestamp: new Date().toLocaleTimeString(),
                health: 85 + Math.random() * 15,
                performance: 80 + Math.random() * 20,
                efficiency: 88 + Math.random() * 12,
                learning: Math.random() * 100
            };
            setSystemMetrics(prev => [...prev.slice(-19), newMetric]);
            // Генерація бізнес-інсайтів
            if (Math.random() < 0.2) { // 20% шансу на новий інсайт
                const insights = [
                    {
                        type: 'Банківська схема',
                        description: 'Детектовано підозрілі транзакції на суму $2.3M',
                        severity: 'high'
                    },
                    {
                        type: 'Чиновницька корупція',
                        description: 'Виявлено нетипові фінансові потоки в держзакупівлях',
                        severity: 'critical'
                    },
                    {
                        type: 'Бізнес-прогнозування',
                        description: 'Прогноз падіння ринку IT-послуг на 12% в Q4',
                        severity: 'medium'
                    },
                    {
                        type: 'Податкова оптимізація',
                        description: 'Знайдено легальну схему економії $450K на податках',
                        severity: 'low'
                    }
                ];
                const insight = insights[Math.floor(Math.random() * insights.length)];
                const newInsight = {
                    id: Date.now().toString(),
                    ...insight,
                    confidence: 75 + Math.random() * 25,
                    timestamp: new Date().toLocaleTimeString()
                };
                setBusinessInsights(prev => [newInsight, ...prev.slice(0, 9)]);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [isRunning]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'improving': return '#8B5CF6';
            case 'active': return '#10B981';
            case 'idle': return '#6B7280';
            default: return '#6B7280';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#EF4444';
            case 'high': return '#F59E0B';
            case 'medium': return '#3B82F6';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };
    return (_jsxs(Box, { sx: { p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Avatar, { sx: { bgcolor: '#8B5CF6', width: 56, height: 56 }, children: _jsx(BrainIcon, { sx: { fontSize: 32 } }) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { color: 'white', fontWeight: 'bold' }, children: "\uD83E\uDD16 \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0421\u0430\u043C\u043E\u0432\u0434\u043E\u0441\u043A\u043E\u043D\u0430\u043B\u0435\u043D\u043D\u044F" }), _jsx(Typography, { variant: "subtitle1", sx: { color: 'rgba(255,255,255,0.8)' }, children: "Predator Analytics Nexus Core v2.0 - Live Dashboard" })] })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Tooltip, { title: isRunning ? 'Призупинити' : 'Запустити', children: _jsx(IconButton, { onClick: () => setIsRunning(!isRunning), sx: {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }, children: isRunning ? _jsx(PauseIcon, {}) : _jsx(PlayIcon, {}) }) }), _jsx(Tooltip, { title: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438", children: _jsx(IconButton, { sx: {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }, children: _jsx(RefreshIcon, {}) }) })] })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(Card, { sx: { bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(BrainIcon, { color: "primary" }), "\u0410\u0433\u0435\u043D\u0442\u0438 \u0421\u0430\u043C\u043E\u0432\u0434\u043E\u0441\u043A\u043E\u043D\u0430\u043B\u0435\u043D\u043D\u044F", _jsx(Chip, { label: `${agents.filter(a => a.status === 'active' || a.status === 'improving').length} активні`, color: "success", size: "small" })] }), _jsx(Grid, { container: true, spacing: 2, children: agents.map((agent) => (_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.3 }, children: _jsxs(Paper, { elevation: 2, sx: {
                                                        p: 2,
                                                        border: `2px solid ${getStatusColor(agent.status)}`,
                                                        bgcolor: agent.status === 'improving' ? `${agent.color}10` : 'white'
                                                    }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(Avatar, { sx: { bgcolor: agent.color, mr: 2 }, children: _jsx(agent.icon, {}) }), _jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", children: agent.name }), _jsx(Chip, { label: agent.status, size: "small", sx: {
                                                                                bgcolor: getStatusColor(agent.status),
                                                                                color: 'white',
                                                                                textTransform: 'capitalize'
                                                                            } })] })] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: ["\uD83D\uDCC8 \u041F\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u044C: ", agent.improvements] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["\u0415\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", agent.efficiency.toFixed(1), "%"] }), _jsx(LinearProgress, { variant: "determinate", value: agent.efficiency, sx: {
                                                                        mt: 1,
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: agent.color
                                                                        }
                                                                    } })] }), _jsxs(Typography, { variant: "caption", display: "block", sx: { fontStyle: 'italic' }, children: ["\uD83D\uDD27 ", agent.lastAction] })] }) }) }, agent.id))) })] }) }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsx(Card, { sx: { bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', height: 'fit-content' }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(SecurityIcon, { color: "primary" }), "\u0411\u0456\u0437\u043D\u0435\u0441-\u0406\u043D\u0441\u0430\u0439\u0442\u0438", _jsx(Chip, { label: `${businessInsights.length} активні`, color: "info", size: "small" })] }), _jsx(List, { dense: true, children: _jsx(AnimatePresence, { children: businessInsights.slice(0, 5).map((insight) => (_jsx(motion.div, { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 20, opacity: 0 }, transition: { duration: 0.3 }, children: _jsxs(ListItem, { sx: { px: 0 }, children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { sx: { bgcolor: getSeverityColor(insight.severity), width: 32, height: 32 }, children: _jsx(TrendIcon, { fontSize: "small" }) }) }), _jsx(ListItemText, { primary: _jsx(Typography, { variant: "body2", fontWeight: "bold", children: insight.type }), secondary: _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", display: "block", children: insight.description }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }, children: [_jsx(Chip, { label: `${insight.confidence.toFixed(0)}%`, size: "small", color: "primary", variant: "outlined" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: insight.timestamp })] })] }) })] }) }, insight.id))) }) }), businessInsights.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", textAlign: "center", sx: { py: 2 }, children: "\u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043D\u043D\u044F \u043D\u043E\u0432\u0438\u0445 \u0456\u043D\u0441\u0430\u0439\u0442\u0456\u0432..." }))] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { sx: { bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(TrendIcon, { color: "primary" }), "\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u0456 \u041C\u0435\u0442\u0440\u0438\u043A\u0438 \u0432 \u0420\u0435\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0427\u0430\u0441\u0456"] }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: systemMetrics, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "timestamp" }), _jsx(YAxis, { domain: [0, 100] }), _jsx(RechartsTooltip, {}), _jsx(Area, { type: "monotone", dataKey: "health", stackId: "1", stroke: "#10B981", fill: "#10B981", fillOpacity: 0.3, name: "\u0417\u0434\u043E\u0440\u043E\u0432'\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsx(Area, { type: "monotone", dataKey: "performance", stackId: "2", stroke: "#3B82F6", fill: "#3B82F6", fillOpacity: 0.3, name: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" }), _jsx(Area, { type: "monotone", dataKey: "efficiency", stackId: "3", stroke: "#8B5CF6", fill: "#8B5CF6", fillOpacity: 0.3, name: "\u0415\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" })] }) })] }) }) })] })] }));
};
export default SelfImprovementDashboard;
