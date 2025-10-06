import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, IconButton, LinearProgress, Chip, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Tabs, Tab } from '@mui/material';
import { SmartToy as AgentIcon, Warning as WarningIcon, CheckCircle as CheckIcon, PlayArrow as PlayIcon, Pause as PauseIcon, Refresh as RefreshIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon, Upload as UploadIcon, Search as SearchIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
// Кібер-гід компонент
import HolographicGuide from '../guide/HolographicGuide';
const SuperEnhancedDashboard = () => {
    // Стани компонента
    const [activeTab, setActiveTab] = useState(0);
    const [systemRunning, setSystemRunning] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    // Дані системи
    const [systemMetrics, setSystemMetrics] = useState([]);
    const [agents, setAgents] = useState([
        {
            id: 'self-improvement',
            name: 'Self Improvement Agent',
            status: 'active',
            performance: 95.2,
            tasks: 156,
            uptime: '2d 14h 32m',
            lastActivity: '2 seconds ago'
        },
        {
            id: 'auto-heal',
            name: 'Auto Heal Agent',
            status: 'active',
            performance: 98.7,
            tasks: 89,
            uptime: '2d 14h 32m',
            lastActivity: '5 seconds ago'
        },
        {
            id: 'performance-optimizer',
            name: 'Performance Optimizer',
            status: 'active',
            performance: 92.4,
            tasks: 234,
            uptime: '2d 14h 32m',
            lastActivity: '1 second ago'
        },
        {
            id: 'security-monitor',
            name: 'Security Monitor',
            status: 'active',
            performance: 96.8,
            tasks: 45,
            uptime: '2d 14h 32m',
            lastActivity: '3 seconds ago'
        },
        {
            id: 'data-quality',
            name: 'Data Quality Agent',
            status: 'active',
            performance: 94.1,
            tasks: 178,
            uptime: '2d 14h 32m',
            lastActivity: '4 seconds ago'
        }
    ]);
    const [businessInsights, setBusinessInsights] = useState([
        {
            id: '1',
            title: 'Підозрілі банківські транзакції',
            description: 'Виявлено 15 операцій на суму $2.3M з ознаками відмивання коштів',
            confidence: 94.5,
            category: 'banking',
            severity: 'high',
            timestamp: '10 хвилин тому',
            actions: ['Блокувати рахунки', 'Повідомити регулятора', 'Глибокий аналіз']
        },
        {
            id: '2',
            title: 'Корупційна схема в держзакупівлях',
            description: 'Детектовано завищення цін на 340% в тендерах Міністерства',
            confidence: 89.2,
            category: 'government',
            severity: 'critical',
            timestamp: '25 хвилин тому',
            actions: ['Звіт в НАБУ', 'Медіа-публікація', 'Юридична оцінка']
        },
        {
            id: '3',
            title: 'Ринкова аномалія IT-сектору',
            description: 'Прогнозується падіння акцій IT-компаній на 12-18% в Q4',
            confidence: 87.3,
            category: 'market',
            severity: 'medium',
            timestamp: '45 хвилин тому',
            actions: ['Коригувати портфель', 'Хеджувати ризики', 'Поглибити аналіз']
        }
    ]);
    // Генерація метрик системи
    useEffect(() => {
        const generateMetrics = () => {
            const now = new Date();
            const metric = {
                timestamp: now.toLocaleTimeString(),
                cpu: 20 + Math.random() * 60,
                memory: 30 + Math.random() * 50,
                network: 10 + Math.random() * 40,
                agents: agents.filter(a => a.status === 'active').length
            };
            setSystemMetrics(prev => [...prev.slice(-19), metric]);
        };
        generateMetrics();
        const interval = setInterval(generateMetrics, refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [refreshInterval, agents]);
    // Симуляція оновлення агентів
    useEffect(() => {
        if (!autoRefresh || !systemRunning)
            return;
        const updateAgents = () => {
            setAgents(prev => prev.map(agent => ({
                ...agent,
                performance: Math.max(85, Math.min(100, agent.performance + (Math.random() - 0.5) * 2)),
                tasks: agent.tasks + Math.floor(Math.random() * 3),
                lastActivity: ['1 second ago', '2 seconds ago', '3 seconds ago'][Math.floor(Math.random() * 3)]
            })));
        };
        const interval = setInterval(updateAgents, 3000);
        return () => clearInterval(interval);
    }, [autoRefresh, systemRunning]);
    // Функції керування
    const handleStartStop = () => {
        setSystemRunning(!systemRunning);
    };
    const handleRefresh = () => {
        window.location.reload();
    };
    const handleAgentClick = (agentId) => {
        setSelectedAgent(agentId);
        setDialogOpen(true);
    };
    const handleActionClick = (action, insightId) => {
        alert(`Виконується дія: "${action}" для інсайту ${insightId}`);
    };
    // Фільтрація інсайтів
    const filteredInsights = businessInsights.filter(insight => {
        const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            insight.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || insight.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    // Кольори для статусів
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'idle': return '#FF9800';
            case 'error': return '#F44336';
            case 'maintenance': return '#2196F3';
            default: return '#9E9E9E';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#F44336';
            case 'high': return '#FF5722';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'banking': return '🏦';
            case 'government': return '🏛️';
            case 'market': return '📈';
            case 'security': return '🛡️';
            default: return '💼';
        }
    };
    return (_jsxs(Box, { sx: { p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", fontWeight: "bold", color: "primary", children: "\uD83E\uDD16 Predator Analytics Nexus" }), _jsx(Typography, { variant: "subtitle1", color: "text.secondary", children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0431\u0435\u0437\u043F\u0435\u0440\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u0441\u0430\u043C\u043E\u0432\u0434\u043E\u0441\u043A\u043E\u043D\u0430\u043B\u0435\u043D\u043D\u044F \u0442\u0430 \u0431\u0456\u0437\u043D\u0435\u0441-\u0430\u043D\u0430\u043B\u0456\u0442\u0438\u043A\u0438" })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked), color: "primary" }), label: "\u0410\u0432\u0442\u043E-\u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044F" }), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "\u0406\u043D\u0442\u0435\u0440\u0432\u0430\u043B" }), _jsxs(Select, { value: refreshInterval, onChange: (e) => setRefreshInterval(Number(e.target.value)), label: "\u0406\u043D\u0442\u0435\u0440\u0432\u0430\u043B", children: [_jsx(MenuItem, { value: 1, children: "1 \u0441\u0435\u043A" }), _jsx(MenuItem, { value: 5, children: "5 \u0441\u0435\u043A" }), _jsx(MenuItem, { value: 10, children: "10 \u0441\u0435\u043A" }), _jsx(MenuItem, { value: 30, children: "30 \u0441\u0435\u043A" })] })] }), _jsx(Tooltip, { title: systemRunning ? 'Зупинити систему' : 'Запустити систему', children: _jsx(IconButton, { onClick: handleStartStop, color: systemRunning ? 'error' : 'success', size: "large", children: systemRunning ? _jsx(PauseIcon, {}) : _jsx(PlayIcon, {}) }) }), _jsx(Tooltip, { title: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438", children: _jsx(IconButton, { onClick: handleRefresh, color: "primary", children: _jsx(RefreshIcon, {}) }) })] })] }), _jsx(Card, { sx: { mb: 3, bgcolor: systemRunning ? '#e8f5e8' : '#ffebee' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [systemRunning ? _jsx(CheckIcon, { color: "success" }) : _jsx(WarningIcon, { color: "error" }), _jsxs(Typography, { variant: "h6", children: ["\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u0438\u0441\u0442\u0435\u043C\u0438: ", systemRunning ? '🟢 Активна' : '🔴 Зупинена'] }), _jsx(Chip, { label: `${agents.filter(a => a.status === 'active').length}/${agents.length} агентів активні`, color: systemRunning ? 'success' : 'default' })] }) }) }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(Tabs, { value: activeTab, onChange: (e, value) => setActiveTab(value), children: [_jsx(Tab, { label: "\uD83D\uDCCA \u041E\u0433\u043B\u044F\u0434 \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsx(Tab, { label: "\uD83E\uDD16 \u0410\u0433\u0435\u043D\u0442\u0438" }), _jsx(Tab, { label: "\uD83D\uDCBC \u0411\u0456\u0437\u043D\u0435\u0441-\u0456\u043D\u0441\u0430\u0439\u0442\u0438" }), _jsx(Tab, { label: "\uD83D\uDCC8 \u0410\u043D\u0430\u043B\u0456\u0442\u0438\u043A\u0430" }), _jsx(Tab, { label: "\u2699\uFE0F \u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" })] }) }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, children: [activeTab === 0 && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { sx: { background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)', color: '#fff' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { color: '#00ff66', textAlign: 'center' }, children: "\uD83E\uDD16 \u041A\u0456\u0431\u0435\u0440-\u0413\u0456\u0434 Nexus" }), _jsx(HolographicGuide, { onVoiceCommand: (command) => {
                                                        console.log('Voice command:', command);
                                                        // Тут можна додати обробку голосових команд
                                                    }, onTextInput: (text) => {
                                                        console.log('Text input:', text);
                                                    }, currentTask: "\u041C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433 \u0441\u0438\u0441\u0442\u0435\u043C\u0438", systemStatus: systemRunning ? 'normal' : 'warning', personalizedHints: [
                                                        'Спробуйте сказати "покажи статус агентів"',
                                                        'Натисніть пробіл для активації голосового вводу',
                                                        'Система працює в оптимальному режимі',
                                                        'Рекомендую перевірити останні інсайти'
                                                    ] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u0456 \u043C\u0435\u0442\u0440\u0438\u043A\u0438 \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0447\u0430\u0441\u0456" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: systemMetrics, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "timestamp" }), _jsx(YAxis, {}), _jsx(RechartsTooltip, {}), _jsx(Line, { type: "monotone", dataKey: "cpu", stroke: "#ff7300", name: "CPU %" }), _jsx(Line, { type: "monotone", dataKey: "memory", stroke: "#8884d8", name: "Memory %" }), _jsx(Line, { type: "monotone", dataKey: "network", stroke: "#82ca9d", name: "Network %" })] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { sx: { bgcolor: '#e3f2fd' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h4", color: "primary", children: agents.filter(a => a.status === 'active').length }), _jsx(Typography, { color: "text.secondary", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u0430\u0433\u0435\u043D\u0442\u0438" })] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { sx: { bgcolor: '#f3e5f5' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h4", color: "secondary", children: businessInsights.length }), _jsx(Typography, { color: "text.secondary", children: "\u041D\u043E\u0432\u0456 \u0456\u043D\u0441\u0430\u0439\u0442\u0438" })] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { sx: { bgcolor: '#e8f5e8' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h4", style: { color: '#4CAF50' }, children: "98.5%" }), _jsx(Typography, { color: "text.secondary", children: "Uptime \u0441\u0438\u0441\u0442\u0435\u043C\u0438" })] }) }) })] }) })] })), activeTab === 1 && (_jsx(Grid, { container: true, spacing: 3, children: agents.map((agent) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(Card, { sx: {
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.02)' }
                                    }, onClick: () => handleAgentClick(agent.id), children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(Avatar, { sx: { bgcolor: getStatusColor(agent.status), mr: 2 }, children: _jsx(AgentIcon, {}) }), _jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsx(Typography, { variant: "h6", noWrap: true, children: agent.name }), _jsx(Chip, { label: agent.status, size: "small", sx: {
                                                                    bgcolor: getStatusColor(agent.status),
                                                                    color: 'white',
                                                                    textTransform: 'capitalize'
                                                                } })] })] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: ["\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", agent.performance.toFixed(1), "%"] }), _jsx(LinearProgress, { variant: "determinate", value: agent.performance, sx: { mb: 2 } }), _jsxs(Typography, { variant: "caption", display: "block", children: ["\uD83D\uDCCB \u0417\u0430\u0432\u0434\u0430\u043D\u044C: ", agent.tasks] }), _jsxs(Typography, { variant: "caption", display: "block", children: ["\u23F1\uFE0F Uptime: ", agent.uptime] }), _jsxs(Typography, { variant: "caption", display: "block", children: ["\uD83D\uDD04 \u041E\u0441\u0442\u0430\u043D\u043D\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", agent.lastActivity] })] }) }) }, agent.id))) })), activeTab === 2 && (_jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 3 }, children: [_jsx(TextField, { placeholder: "\u041F\u043E\u0448\u0443\u043A \u0456\u043D\u0441\u0430\u0439\u0442\u0456\u0432...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), InputProps: {
                                                startAdornment: _jsx(SearchIcon, { sx: { mr: 1, color: 'text.secondary' } })
                                            }, sx: { flexGrow: 1 } }), _jsxs(FormControl, { sx: { minWidth: 200 }, children: [_jsx(InputLabel, { children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F" }), _jsxs(Select, { value: filterCategory, onChange: (e) => setFilterCategory(e.target.value), label: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F", children: [_jsx(MenuItem, { value: "all", children: "\u0412\u0441\u0456 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457" }), _jsx(MenuItem, { value: "banking", children: "\uD83C\uDFE6 \u0411\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u0430" }), _jsx(MenuItem, { value: "government", children: "\uD83C\uDFDB\uFE0F \u0414\u0435\u0440\u0436\u0430\u0432\u043D\u0430" }), _jsx(MenuItem, { value: "market", children: "\uD83D\uDCC8 \u0420\u0438\u043D\u043A\u043E\u0432\u0430" }), _jsx(MenuItem, { value: "security", children: "\uD83D\uDEE1\uFE0F \u0411\u0435\u0437\u043F\u0435\u043A\u0430" })] })] })] }), _jsx(Grid, { container: true, spacing: 3, children: filteredInsights.map((insight) => (_jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsxs(Typography, { variant: "h6", children: [getCategoryIcon(insight.category), " ", insight.title] }), _jsx(Chip, { label: insight.severity, size: "small", sx: {
                                                                            bgcolor: getSeverityColor(insight.severity),
                                                                            color: 'white',
                                                                            textTransform: 'capitalize'
                                                                        } }), _jsx(Chip, { label: `${insight.confidence.toFixed(1)}% впевненості`, variant: "outlined", size: "small" })] }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: insight.timestamp })] }), _jsx(Typography, { variant: "body1", paragraph: true, children: insight.description }), _jsx(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap' }, children: insight.actions.map((action, index) => (_jsx(Button, { variant: "outlined", size: "small", onClick: () => handleActionClick(action, insight.id), children: action }, index))) })] }) }) }, insight.id))) })] })), activeTab === 3 && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0420\u043E\u0437\u043F\u043E\u0434\u0456\u043B \u0442\u0438\u043F\u0456\u0432 \u0456\u043D\u0441\u0430\u0439\u0442\u0456\u0432" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: [
                                                                    { name: 'Банківські', value: 35, fill: '#8884d8' },
                                                                    { name: 'Державні', value: 25, fill: '#82ca9d' },
                                                                    { name: 'Ринкові', value: 30, fill: '#ffc658' },
                                                                    { name: 'Безпека', value: 10, fill: '#ff7300' }
                                                                ], cx: "50%", cy: "50%", outerRadius: 80, dataKey: "value" }), _jsx(RechartsTooltip, {})] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C \u0430\u0433\u0435\u043D\u0442\u0456\u0432" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: agents, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 100 }), _jsx(YAxis, {}), _jsx(RechartsTooltip, {}), _jsx(Bar, { dataKey: "performance", fill: "#8884d8" })] }) })] }) }) })] })), activeTab === 4 && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0456 \u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044F \u0430\u0433\u0435\u043D\u0442\u0456\u0432" }), _jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "Real-time \u043C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433" }), _jsx(FormControlLabel, { control: _jsx(Switch, {}), label: "Debug \u0440\u0435\u0436\u0438\u043C" }), _jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "\u0417\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u043D\u044F \u043B\u043E\u0433\u0456\u0432" })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0414\u0456\u0457 \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(DownloadIcon, {}), children: "\u0415\u043A\u0441\u043F\u043E\u0440\u0442 \u0434\u0430\u043D\u0438\u0445" }), _jsx(Button, { variant: "contained", startIcon: _jsx(UploadIcon, {}), children: "\u0406\u043C\u043F\u043E\u0440\u0442 \u043A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u0457" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0430\u0433\u0435\u043D\u0442\u0456\u0432" }), _jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(DeleteIcon, {}), children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438 \u043B\u043E\u0433\u0438" })] })] }) }) })] }))] }, activeTab) }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["\u0414\u0435\u0442\u0430\u043B\u0456 \u0430\u0433\u0435\u043D\u0442\u0430: ", selectedAgent && agents.find(a => a.id === selectedAgent)?.name] }), _jsx(DialogContent, { children: selectedAgent && (_jsxs(Box, { sx: { pt: 2 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0456" }), _jsx(LinearProgress, { variant: "determinate", value: agents.find(a => a.id === selectedAgent)?.performance || 0, sx: { mb: 2 } }), _jsx(Typography, { variant: "body2", paragraph: true, children: "\u0410\u0433\u0435\u043D\u0442 \u043F\u0440\u0430\u0446\u044E\u0454 \u0441\u0442\u0430\u0431\u0456\u043B\u044C\u043D\u043E \u0437 \u0432\u0438\u0441\u043E\u043A\u043E\u044E \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044E. \u0412\u0438\u043A\u043E\u043D\u0443\u0454 \u0437\u0430\u0432\u0434\u0430\u043D\u043D\u044F \u0441\u0430\u043C\u043E\u0432\u0434\u043E\u0441\u043A\u043E\u043D\u0430\u043B\u0435\u043D\u043D\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438 \u0432 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E\u043C\u0443 \u0440\u0435\u0436\u0438\u043C\u0456." }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mt: 2 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(ViewIcon, {}), children: "\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u043B\u043E\u0433\u0438" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(EditIcon, {}), children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438" })] })] })) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setDialogOpen(false), children: "\u0417\u0430\u043A\u0440\u0438\u0442\u0438" }) })] })] }));
};
export default SuperEnhancedDashboard;
