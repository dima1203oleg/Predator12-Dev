import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, IconButton, LinearProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Tabs, Tab, Stepper, Step, StepLabel, StepContent, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon, Refresh as RefreshIcon, Settings as SettingsIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Upload as UploadIcon, Schedule as ScheduleIcon, DataObject as DataIcon, Transform as TransformIcon, Storage as StorageIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Info as InfoIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
const SuperETLModule = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newPipelineDialog, setNewPipelineDialog] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    // Стани ETL
    const [pipelines, setPipelines] = useState([
        {
            id: 'bank-transactions',
            name: 'Аналіз банківських транзакцій',
            status: 'running',
            progress: 67,
            source: 'Bank API',
            target: 'Analytics DB',
            recordsProcessed: 1247000,
            totalRecords: 1850000,
            startTime: '14:32:15',
            estimatedTime: '23 хв',
            lastRun: '10 хвилин тому',
            nextRun: 'Безперервно'
        },
        {
            id: 'gov-contracts',
            name: 'Держзакупівлі та тендери',
            status: 'running',
            progress: 89,
            source: 'ProZorro API',
            target: 'Compliance DB',
            recordsProcessed: 45600,
            totalRecords: 51200,
            startTime: '12:15:30',
            estimatedTime: '5 хв',
            lastRun: '2 години тому',
            nextRun: 'Щогодини'
        },
        {
            id: 'market-data',
            name: 'Ринкові дані та котирування',
            status: 'scheduled',
            progress: 0,
            source: 'Yahoo Finance',
            target: 'Market DB',
            recordsProcessed: 0,
            totalRecords: 125000,
            startTime: '-',
            estimatedTime: '15 хв',
            lastRun: '1 година тому',
            nextRun: 'Завтра 09:00'
        },
        {
            id: 'security-logs',
            name: 'Логи безпеки та аудит',
            status: 'error',
            progress: 34,
            source: 'Security Systems',
            target: 'SIEM DB',
            recordsProcessed: 89000,
            totalRecords: 260000,
            startTime: '13:45:22',
            estimatedTime: '-',
            lastRun: '30 хвилин тому',
            nextRun: 'Після виправлення'
        }
    ]);
    const [dataSources, setDataSources] = useState([
        {
            id: 'bank-api',
            name: 'Bank Core API',
            type: 'api',
            status: 'connected',
            connectionString: 'https://api.bank.com/v1',
            lastTest: '2 хвилини тому'
        },
        {
            id: 'prozorro',
            name: 'ProZorro Database',
            type: 'database',
            status: 'connected',
            connectionString: 'postgres://prozorro.gov.ua:5432/tenders',
            lastTest: '5 хвилин тому'
        },
        {
            id: 'market-feed',
            name: 'Market Data Feed',
            type: 'stream',
            status: 'connected',
            connectionString: 'kafka://market-stream:9092/quotes',
            lastTest: '1 хвилина тому'
        },
        {
            id: 'security-syslog',
            name: 'Security Syslog',
            type: 'file',
            status: 'error',
            connectionString: '/var/log/security/*.log',
            lastTest: '15 хвилин тому'
        }
    ]);
    const [transformationRules] = useState([
        {
            id: 'suspicious-transactions',
            name: 'Детекція підозрілих транзакцій',
            type: 'filter',
            description: 'Фільтрує транзакції > $10K між фізособами',
            enabled: true,
            config: { amount: 10000, type: 'p2p' }
        },
        {
            id: 'price-anomaly',
            name: 'Аномалії цін в тендерах',
            type: 'validate',
            description: 'Перевіряє завищення цін на 200%+',
            enabled: true,
            config: { threshold: 2.0 }
        },
        {
            id: 'risk-scoring',
            name: 'Розрахунок ризик-скору',
            type: 'aggregate',
            description: 'Агрегує фактори ризику по контрагентах',
            enabled: true,
            config: { factors: ['amount', 'frequency', 'geography'] }
        }
    ]);
    // Дані для графіків
    const [performanceData, setPerformanceData] = useState([
        { time: '12:00', throughput: 1200, errors: 2 },
        { time: '12:15', throughput: 1350, errors: 1 },
        { time: '12:30', throughput: 1180, errors: 3 },
        { time: '12:45', throughput: 1420, errors: 0 },
        { time: '13:00', throughput: 1380, errors: 1 },
        { time: '13:15', throughput: 1250, errors: 2 },
        { time: '13:30', throughput: 1400, errors: 0 }
    ]);
    // Симуляція оновлення прогресу
    useEffect(() => {
        const interval = setInterval(() => {
            setPipelines(prev => prev.map(pipeline => {
                if (pipeline.status === 'running') {
                    const newProgress = Math.min(100, pipeline.progress + Math.random() * 2);
                    const newProcessed = Math.floor((newProgress / 100) * pipeline.totalRecords);
                    return {
                        ...pipeline,
                        progress: newProgress,
                        recordsProcessed: newProcessed
                    };
                }
                return pipeline;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // Функції керування
    const handlePipelineAction = (pipelineId, action) => {
        setPipelines(prev => prev.map(pipeline => {
            if (pipeline.id === pipelineId) {
                switch (action) {
                    case 'start':
                        return { ...pipeline, status: 'running' };
                    case 'stop':
                        return { ...pipeline, status: 'stopped' };
                    case 'restart':
                        return { ...pipeline, status: 'running', progress: 0 };
                    default:
                        return pipeline;
                }
            }
            return pipeline;
        }));
        alert(`Дія "${action}" виконана для пайплайну ${pipelineId}`);
    };
    const handleTestConnection = (sourceId) => {
        setDataSources(prev => prev.map(source => {
            if (source.id === sourceId) {
                return { ...source, lastTest: 'Зараз тестується...' };
            }
            return source;
        }));
        setTimeout(() => {
            setDataSources(prev => prev.map(source => {
                if (source.id === sourceId) {
                    return {
                        ...source,
                        status: Math.random() > 0.2 ? 'connected' : 'error',
                        lastTest: 'Щойно'
                    };
                }
                return source;
            }));
        }, 2000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'running':
            case 'connected': return '#4CAF50';
            case 'stopped':
            case 'disconnected': return '#FF9800';
            case 'error': return '#F44336';
            case 'scheduled': return '#2196F3';
            default: return '#9E9E9E';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'running':
            case 'connected': return _jsx(CheckIcon, {});
            case 'stopped':
            case 'disconnected': return _jsx(PauseIcon, {});
            case 'error': return _jsx(ErrorIcon, {});
            case 'scheduled': return _jsx(ScheduleIcon, {});
            default: return _jsx(InfoIcon, {});
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'database': return _jsx(StorageIcon, {});
            case 'api': return _jsx(DataIcon, {});
            case 'file': return _jsx(UploadIcon, {});
            case 'stream': return _jsx(TransformIcon, {});
            default: return _jsx(DataIcon, {});
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", fontWeight: "bold", color: "primary", children: "\uD83D\uDCCA ETL Pipeline Manager" }), _jsx(Typography, { variant: "subtitle1", color: "text.secondary", children: "\u041A\u0435\u0440\u0443\u0432\u0430\u043D\u043D\u044F \u043F\u043E\u0442\u043E\u043A\u0430\u043C\u0438 \u0434\u0430\u043D\u0438\u0445 \u0442\u0430 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F\u043C\u0438" })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => setNewPipelineDialog(true), children: "\u041D\u043E\u0432\u0438\u0439 \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(UploadIcon, {}), children: "\u0406\u043C\u043F\u043E\u0440\u0442" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(SettingsIcon, {}), children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" })] })] }), _jsxs(Grid, { container: true, spacing: 3, sx: { mb: 3 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(Card, { sx: { bgcolor: '#e8f5e8' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h4", color: "success.main", children: pipelines.filter(p => p.status === 'running').length }), _jsx(Typography, { color: "text.secondary", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u0438" })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(Card, { sx: { bgcolor: '#fff3e0' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h4", color: "warning.main", children: pipelines.reduce((sum, p) => sum + p.recordsProcessed, 0).toLocaleString() }), _jsx(Typography, { color: "text.secondary", children: "\u0417\u0430\u043F\u0438\u0441\u0456\u0432 \u043E\u0431\u0440\u043E\u0431\u043B\u0435\u043D\u043E" })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(Card, { sx: { bgcolor: '#e3f2fd' }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h4", color: "primary", children: [dataSources.filter(s => s.status === 'connected').length, "/", dataSources.length] }), _jsx(Typography, { color: "text.secondary", children: "\u0414\u0436\u0435\u0440\u0435\u043B\u0430 \u043F\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0456" })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(Card, { sx: { bgcolor: '#fce4ec' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h4", color: "error.main", children: pipelines.filter(p => p.status === 'error').length }), _jsx(Typography, { color: "text.secondary", children: "\u041F\u043E\u043C\u0438\u043B\u043A\u0438" })] }) }) })] }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(Tabs, { value: activeTab, onChange: (e, value) => setActiveTab(value), children: [_jsx(Tab, { label: "\uD83D\uDCCA \u041F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u0438" }), _jsx(Tab, { label: "\uD83D\uDD0C \u0414\u0436\u0435\u0440\u0435\u043B\u0430 \u0434\u0430\u043D\u0438\u0445" }), _jsx(Tab, { label: "\u2699\uFE0F \u0422\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0457" }), _jsx(Tab, { label: "\uD83D\uDCC8 \u041C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433" }), _jsx(Tab, { label: "\uD83D\uDCCB \u041B\u043E\u0433\u0438" })] }) }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, children: [activeTab === 0 && (_jsx(Grid, { container: true, spacing: 3, children: pipelines.map((pipeline) => (_jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [getStatusIcon(pipeline.status), _jsxs(Box, { children: [_jsx(Typography, { variant: "h6", children: pipeline.name }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [pipeline.source, " \u2192 ", pipeline.target] })] }), _jsx(Chip, { label: pipeline.status, sx: {
                                                                    bgcolor: getStatusColor(pipeline.status),
                                                                    color: 'white',
                                                                    textTransform: 'capitalize'
                                                                } })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(IconButton, { color: "success", onClick: () => handlePipelineAction(pipeline.id, 'start'), disabled: pipeline.status === 'running', children: _jsx(PlayIcon, {}) }), _jsx(IconButton, { color: "warning", onClick: () => handlePipelineAction(pipeline.id, 'stop'), disabled: pipeline.status === 'stopped', children: _jsx(PauseIcon, {}) }), _jsx(IconButton, { color: "info", onClick: () => handlePipelineAction(pipeline.id, 'restart'), children: _jsx(RefreshIcon, {}) }), _jsx(IconButton, { onClick: () => {
                                                                    setSelectedPipeline(pipeline.id);
                                                                    setDialogOpen(true);
                                                                }, children: _jsx(ViewIcon, {}) })] })] }), pipeline.status === 'running' && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsxs(Typography, { variant: "body2", children: ["\u041F\u0440\u043E\u0433\u0440\u0435\u0441: ", pipeline.progress.toFixed(1), "%"] }), _jsxs(Typography, { variant: "body2", children: [pipeline.recordsProcessed.toLocaleString(), " / ", pipeline.totalRecords.toLocaleString()] })] }), _jsx(LinearProgress, { variant: "determinate", value: pipeline.progress })] })), _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 6, sm: 3, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "\u041F\u043E\u0447\u0430\u0442\u043E\u043A" }), _jsx(Typography, { variant: "body2", children: pipeline.startTime })] }), _jsxs(Grid, { item: true, xs: 6, sm: 3, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "\u0417\u0430\u043B\u0438\u0448\u0438\u043B\u043E\u0441\u044C" }), _jsx(Typography, { variant: "body2", children: pipeline.estimatedTime })] }), _jsxs(Grid, { item: true, xs: 6, sm: 3, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0437\u0430\u043F\u0443\u0441\u043A" }), _jsx(Typography, { variant: "body2", children: pipeline.lastRun })] }), _jsxs(Grid, { item: true, xs: 6, sm: 3, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "\u041D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439" }), _jsx(Typography, { variant: "body2", children: pipeline.nextRun })] })] })] }) }) }, pipeline.id))) })), activeTab === 1 && (_jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0414\u0436\u0435\u0440\u0435\u043B\u043E" }), _jsx(TableCell, { children: "\u0422\u0438\u043F" }), _jsx(TableCell, { children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { children: "\u041F\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044F" }), _jsx(TableCell, { children: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0442\u0435\u0441\u0442" }), _jsx(TableCell, { children: "\u0414\u0456\u0457" })] }) }), _jsx(TableBody, { children: dataSources.map((source) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [getTypeIcon(source.type), source.name] }) }), _jsx(TableCell, { children: _jsx(Chip, { label: source.type, variant: "outlined", size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: source.status, sx: {
                                                            bgcolor: getStatusColor(source.status),
                                                            color: 'white'
                                                        }, size: "small" }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", sx: { fontFamily: 'monospace' }, children: source.connectionString }) }), _jsx(TableCell, { children: source.lastTest }), _jsx(TableCell, { children: _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { size: "small", onClick: () => handleTestConnection(source.id), children: "\u0422\u0435\u0441\u0442" }), _jsx(IconButton, { size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { size: "small", color: "error", children: _jsx(DeleteIcon, {}) })] }) })] }, source.id))) })] }) })), activeTab === 2 && (_jsx(Box, { children: transformationRules.map((rule) => (_jsxs(Accordion, { children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2, width: '100%' }, children: [_jsx(Switch, { checked: rule.enabled }), _jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsx(Typography, { variant: "h6", children: rule.name }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: rule.description })] }), _jsx(Chip, { label: rule.type, variant: "outlined" })] }) }), _jsx(AccordionDetails, { children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(Typography, { variant: "body2", children: "\u041A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u0457:" }), _jsx(Paper, { sx: { p: 2, bgcolor: '#f5f5f5' }, children: _jsx(Typography, { variant: "body2", sx: { fontFamily: 'monospace' }, children: JSON.stringify(rule.config, null, 2) }) }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(EditIcon, {}), children: "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(PlayIcon, {}), children: "\u0422\u0435\u0441\u0442\u0443\u0432\u0430\u0442\u0438" })] })] }) })] }, rule.id))) })), activeTab === 3 && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0447\u0430\u0441\u0456" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: performanceData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "throughput", stroke: "#8884d8", name: "\u0417\u0430\u043F\u0438\u0441\u0456\u0432/\u0445\u0432" }), _jsx(Line, { type: "monotone", dataKey: "errors", stroke: "#ff7300", name: "\u041F\u043E\u043C\u0438\u043B\u043A\u0438" })] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043F\u043E \u0442\u0438\u043F\u0430\u0445" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: [
                                                            { name: 'Банківські', count: 1247000 },
                                                            { name: 'Державні', count: 45600 },
                                                            { name: 'Ринкові', count: 125000 },
                                                            { name: 'Безпека', count: 89000 }
                                                        ], children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#8884d8" })] }) })] }) }) })] })), activeTab === 4 && (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u041B\u043E\u0433\u0438 \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043D\u044F" }), _jsx(Paper, { sx: { p: 2, bgcolor: '#000', color: '#00ff00', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }, children: _jsx(Typography, { variant: "body2", component: "pre", children: `[14:32:15] INFO - Pipeline "bank-transactions" started
[14:32:16] INFO - Connected to Bank API successfully
[14:32:17] INFO - Starting data extraction...
[14:35:22] INFO - Extracted 50,000 records in batch 1
[14:38:45] INFO - Applied transformation rule: suspicious-transactions
[14:38:46] WARN - Found 23 suspicious transactions in batch 1
[14:41:12] INFO - Extracted 50,000 records in batch 2
[14:44:33] INFO - Applied transformation rule: risk-scoring
[14:44:35] INFO - Calculated risk scores for 100,000 records
[14:47:11] INFO - Loading batch 1 to Analytics DB...
[14:47:15] INFO - Successfully loaded 49,977 records (23 filtered)
[14:50:22] INFO - Pipeline progress: 67% complete
[14:50:23] INFO - ETA: 23 minutes remaining` }) })] }) }))] }, activeTab) }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "lg", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["\u0414\u0435\u0442\u0430\u043B\u0456 \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u0443: ", selectedPipeline && pipelines.find(p => p.id === selectedPipeline)?.name] }), _jsx(DialogContent, { children: selectedPipeline && (_jsxs(Box, { sx: { pt: 2 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0414\u0435\u0442\u0430\u043B\u0456 \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043D\u044F" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u0421\u0442\u0430\u0442\u0443\u0441:" }), _jsx(Typography, { variant: "body1", children: pipelines.find(p => p.id === selectedPipeline)?.status })] }), _jsxs(Grid, { item: true, xs: 6, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441:" }), _jsxs(Typography, { variant: "body1", children: [pipelines.find(p => p.id === selectedPipeline)?.progress.toFixed(1), "%"] })] })] })] })) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setDialogOpen(false), children: "\u0417\u0430\u043A\u0440\u0438\u0442\u0438" }) })] }), _jsxs(Dialog, { open: newPipelineDialog, onClose: () => setNewPipelineDialog(false), maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u043D\u043E\u0432\u0438\u0439 ETL \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D" }), _jsx(DialogContent, { children: _jsxs(Stepper, { activeStep: activeStep, orientation: "vertical", sx: { pt: 2 }, children: [_jsxs(Step, { children: [_jsx(StepLabel, { children: "\u0411\u0430\u0437\u043E\u0432\u0430 \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F" }), _jsxs(StepContent, { children: [_jsx(TextField, { fullWidth: true, label: "\u041D\u0430\u0437\u0432\u0430 \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u0443", placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u043D\u0430\u0437\u0432\u0443...", sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u041E\u043F\u0438\u0441", placeholder: "\u041E\u043F\u0438\u0448\u0456\u0442\u044C \u043F\u0440\u0438\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u0443...", multiline: true, rows: 3, sx: { mb: 2 } }), _jsx(Button, { variant: "contained", onClick: () => setActiveStep(1), children: "\u0414\u0430\u043B\u0456" })] })] }), _jsxs(Step, { children: [_jsx(StepLabel, { children: "\u0414\u0436\u0435\u0440\u0435\u043B\u043E \u0434\u0430\u043D\u0438\u0445" }), _jsxs(StepContent, { children: [_jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { children: "\u0422\u0438\u043F \u0434\u0436\u0435\u0440\u0435\u043B\u0430" }), _jsxs(Select, { label: "\u0422\u0438\u043F \u0434\u0436\u0435\u0440\u0435\u043B\u0430", children: [_jsx(MenuItem, { value: "api", children: "REST API" }), _jsx(MenuItem, { value: "database", children: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u0438\u0445" }), _jsx(MenuItem, { value: "file", children: "\u0424\u0430\u0439\u043B\u0438" }), _jsx(MenuItem, { value: "stream", children: "\u041F\u043E\u0442\u0456\u043A \u0434\u0430\u043D\u0438\u0445" })] })] }), _jsx(TextField, { fullWidth: true, label: "\u0420\u044F\u0434\u043E\u043A \u043F\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044F", placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C URL \u0430\u0431\u043E \u0448\u043B\u044F\u0445...", sx: { mb: 2 } }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { onClick: () => setActiveStep(0), children: "\u041D\u0430\u0437\u0430\u0434" }), _jsx(Button, { variant: "contained", onClick: () => setActiveStep(2), children: "\u0414\u0430\u043B\u0456" })] })] })] }), _jsxs(Step, { children: [_jsx(StepLabel, { children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsxs(StepContent, { children: [_jsx(FormControlLabel, { control: _jsx(Switch, {}), label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0438\u0439 \u0437\u0430\u043F\u0443\u0441\u043A" }), _jsx(FormControlLabel, { control: _jsx(Switch, {}), label: "\u041C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433 \u043F\u043E\u043C\u0438\u043B\u043E\u043A" }), _jsxs(Box, { sx: { mt: 2, display: 'flex', gap: 1 }, children: [_jsx(Button, { onClick: () => setActiveStep(1), children: "\u041D\u0430\u0437\u0430\u0434" }), _jsx(Button, { variant: "contained", children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438" })] })] })] })] }) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => {
                                setNewPipelineDialog(false);
                                setActiveStep(0);
                            }, children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }) })] })] }));
};
export default SuperETLModule;
