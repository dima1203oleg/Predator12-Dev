import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Grid, Card, Typography, Chip, Avatar, LinearProgress, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableRow, Paper, List, ListItem, ListItemIcon, ListItemText, Alert, Snackbar, CircularProgress, Badge, Divider } from '@mui/material';
import { SmartToy, Analytics, Healing, AutoFixHigh, Speed, Memory, PlayArrow, Pause, RestartAlt, InfoOutlined, CheckCircle, BugReport, Security, Stop, Build, MonitorHeart, CloudSync, Backup } from '@mui/icons-material';
const AgentCard = ({ agent, onClick, isSelected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [notification, setNotification] = useState({
        open: false, message: '', severity: 'success'
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#00ff44';
            case 'idle': return '#ffff44';
            case 'error': return '#ff4444';
            case 'restarting': return '#ff8800';
            case 'stopped': return '#666666';
            default: return '#00ffff';
        }
    };
    const getHealthLevel = (health) => {
        switch (health) {
            case 'excellent': return 100;
            case 'good': return 80;
            case 'warning': return 60;
            case 'critical': return 30;
            default: return 50;
        }
    };
    const getAgentIcon = (name) => {
        if (name.includes('Heal'))
            return _jsx(Healing, {});
        if (name.includes('Improve'))
            return _jsx(AutoFixHigh, {});
        if (name.includes('Diagnosis'))
            return _jsx(Analytics, {});
        if (name.includes('Security'))
            return _jsx(Security, {});
        if (name.includes('Monitor'))
            return _jsx(MonitorHeart, {});
        return _jsx(SmartToy, {});
    };
    const executeAgentAction = async (action) => {
        setActionLoading(action);
        try {
            // Симуляція API виклику
            await new Promise(resolve => setTimeout(resolve, 2000));
            let message = '';
            switch (action) {
                case 'restart':
                    message = `Агент ${agent.name} успішно перезапущено`;
                    break;
                case 'stop':
                    message = `Агент ${agent.name} зупинено`;
                    break;
                case 'optimize':
                    message = `Агент ${agent.name} оптимізовано`;
                    break;
                case 'diagnose':
                    message = `Діагностика агента ${agent.name} завершена`;
                    break;
                case 'backup':
                    message = `Створено резервну копію агента ${agent.name}`;
                    break;
                default:
                    message = `Дія "${action}" виконана для агента ${agent.name}`;
            }
            setNotification({ open: true, message, severity: 'success' });
        }
        catch (error) {
            setNotification({
                open: true,
                message: `Помилка виконання дії "${action}" для агента ${agent.name}`,
                severity: 'error'
            });
        }
        finally {
            setActionLoading(null);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(motion.div, { whileHover: { scale: 1.03, y: -8 }, whileTap: { scale: 0.98 }, onHoverStart: () => setIsHovered(true), onHoverEnd: () => setIsHovered(false), transition: { duration: 0.3 }, children: _jsxs(Card, { onClick: onClick, className: `interactive-card ${isSelected ? 'cyber-border' : ''}`, sx: {
                        p: 3,
                        height: '100%',
                        cursor: 'pointer',
                        background: isSelected
                            ? 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(0,150,255,0.1) 100%)'
                            : 'rgba(0,0,0,0.8)',
                        border: `2px solid ${isSelected ? '#00ffff' : 'rgba(0,255,255,0.3)'}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(20px)',
                        boxShadow: isHovered || isSelected
                            ? `0 12px 40px ${getStatusColor(agent.status)}40`
                            : '0 4px 16px rgba(0,0,0,0.3)',
                        position: 'relative'
                    }, children: [_jsx(Badge, { badgeContent: agent.errorCount || 0, color: "error", sx: { position: 'absolute', top: 8, right: 8 }, children: _jsx(Box, { sx: {
                                    width: 12,
                                    height: 12,
                                    bgcolor: getStatusColor(agent.status),
                                    borderRadius: '50%',
                                    animation: agent.status === 'active' ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
                                    boxShadow: `0 0 10px ${getStatusColor(agent.status)}`
                                } }) }), _jsxs(Box, { display: "flex", alignItems: "center", mb: 2, children: [_jsx(Avatar, { sx: {
                                        bgcolor: getStatusColor(agent.status),
                                        mr: 2,
                                        width: 56,
                                        height: 56,
                                        boxShadow: `0 0 20px ${getStatusColor(agent.status)}40`
                                    }, children: getAgentIcon(agent.name) }), _jsxs(Box, { flex: 1, children: [_jsx(Typography, { variant: "h6", className: "subtitle-glow", sx: { fontWeight: 'bold', mb: 0.5 }, children: agent.name }), _jsxs(Box, { display: "flex", gap: 1, flexWrap: "wrap", children: [_jsx(Chip, { label: agent.status, size: "small", sx: {
                                                        bgcolor: `${getStatusColor(agent.status)}20`,
                                                        color: getStatusColor(agent.status),
                                                        fontWeight: 'bold',
                                                        textShadow: `0 0 10px ${getStatusColor(agent.status)}`
                                                    } }), agent.version && (_jsx(Chip, { label: `v${agent.version}`, size: "small", variant: "outlined", sx: { color: '#cccccc', borderColor: '#cccccc' } }))] })] })] }), _jsxs(Box, { mb: 2, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [_jsxs(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: ["\u0417\u0434\u043E\u0440\u043E\u0432'\u044F: ", _jsx("span", { className: `status-${agent.health}`, children: agent.health })] }), _jsxs(Typography, { variant: "caption", sx: { color: '#cccccc' }, children: [getHealthLevel(agent.health), "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: getHealthLevel(agent.health), className: "cyber-progress", sx: {
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getStatusColor(agent.status),
                                        }
                                    } })] }), _jsxs(Grid, { container: true, spacing: 2, mb: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(Speed, { sx: { color: '#ff6b6b', mr: 1, fontSize: 18 } }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { color: '#cccccc', display: 'block' }, children: ["CPU: ", agent.cpu] }), _jsx(LinearProgress, { variant: "determinate", value: parseInt(agent.cpu?.replace('%', '') || '0'), sx: { width: 40, height: 3 } })] })] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(Memory, { sx: { color: '#4ecdc4', mr: 1, fontSize: 18 } }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { color: '#cccccc', display: 'block' }, children: ["RAM: ", agent.memory] }), _jsx(LinearProgress, { variant: "determinate", value: parseInt(agent.memory?.replace('%', '') || '0'), sx: { width: 40, height: 3 } })] })] }) })] }), agent.metrics && (_jsxs(Box, { mb: 2, children: [_jsx(Divider, { sx: { my: 1, borderColor: 'rgba(255,255,255,0.1)' } }), _jsxs(Grid, { container: true, spacing: 1, children: [_jsxs(Grid, { item: true, xs: 4, children: [_jsx(Typography, { variant: "caption", sx: { color: '#888', display: 'block' }, children: "\u0412\u0456\u0434\u0433\u0443\u043A" }), _jsx(Typography, { variant: "caption", sx: { color: '#00ffff', fontWeight: 'bold' }, children: agent.metrics.avgResponseTime })] }), _jsxs(Grid, { item: true, xs: 4, children: [_jsx(Typography, { variant: "caption", sx: { color: '#888', display: 'block' }, children: "\u0423\u0441\u043F\u0456\u0445" }), _jsx(Typography, { variant: "caption", sx: { color: '#00ff44', fontWeight: 'bold' }, children: agent.metrics.successRate })] }), _jsxs(Grid, { item: true, xs: 4, children: [_jsx(Typography, { variant: "caption", sx: { color: '#888', display: 'block' }, children: "\u041F\u0440\u043E\u043F\u0443\u0441\u043A." }), _jsx(Typography, { variant: "caption", sx: { color: '#ffff44', fontWeight: 'bold' }, children: agent.metrics.throughput })] })] })] })), _jsx(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: _jsxs(Box, { display: "flex", gap: 1, children: [agent.improvements && (_jsx(Chip, { icon: _jsx(AutoFixHigh, {}), label: agent.improvements, size: "small", sx: {
                                            bgcolor: 'rgba(0,255,0,0.2)',
                                            color: '#00ff44',
                                            fontWeight: 'bold'
                                        } })), agent.fixes && (_jsx(Chip, { icon: _jsx(Healing, {}), label: agent.fixes, size: "small", sx: {
                                            bgcolor: 'rgba(255,255,0,0.2)',
                                            color: '#ffff44',
                                            fontWeight: 'bold'
                                        } })), agent.tasksCompleted && (_jsx(Chip, { icon: _jsx(CheckCircle, {}), label: agent.tasksCompleted, size: "small", sx: {
                                            bgcolor: 'rgba(0,255,255,0.2)',
                                            color: '#00ffff',
                                            fontWeight: 'bold'
                                        } }))] }) }), _jsxs(Box, { display: "flex", gap: 1, mt: 2, children: [_jsx(Tooltip, { title: "\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0430 \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F", children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                            e.stopPropagation();
                                            setDetailsOpen(true);
                                        }, sx: { color: '#00ffff' }, children: _jsx(InfoOutlined, {}) }) }), _jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u0430\u0433\u0435\u043D\u0442", children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                            e.stopPropagation();
                                            executeAgentAction('restart');
                                        }, disabled: actionLoading === 'restart', sx: { color: '#ffff44' }, children: actionLoading === 'restart' ? _jsx(CircularProgress, { size: 16 }) : _jsx(RestartAlt, {}) }) }), _jsx(Tooltip, { title: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0443\u0432\u0430\u0442\u0438", children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                            e.stopPropagation();
                                            executeAgentAction('optimize');
                                        }, disabled: actionLoading === 'optimize', sx: { color: '#00ff44' }, children: actionLoading === 'optimize' ? _jsx(CircularProgress, { size: 16 }) : _jsx(Build, {}) }) }), _jsx(Tooltip, { title: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", children: _jsx(IconButton, { size: "small", onClick: (e) => {
                                            e.stopPropagation();
                                            executeAgentAction('diagnose');
                                        }, disabled: actionLoading === 'diagnose', sx: { color: '#ff8800' }, children: actionLoading === 'diagnose' ? _jsx(CircularProgress, { size: 16 }) : _jsx(BugReport, {}) }) })] }), agent.uptime && (_jsxs(Box, { mt: 1, children: [_jsxs(Typography, { variant: "caption", sx: { color: '#666', display: 'block' }, children: ["Uptime: ", agent.uptime] }), agent.lastActivity && (_jsxs(Typography, { variant: "caption", sx: { color: '#666', display: 'block' }, children: ["\u041E\u0441\u0442\u0430\u043D\u043D\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", agent.lastActivity] }))] }))] }) }), _jsxs(Dialog, { open: detailsOpen, onClose: () => setDetailsOpen(false), maxWidth: "md", fullWidth: true, PaperProps: {
                    sx: {
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
                        border: '1px solid rgba(0,255,255,0.3)',
                        borderRadius: 2
                    }
                }, children: [_jsx(DialogTitle, { sx: { color: '#00ffff', borderBottom: '1px solid rgba(0,255,255,0.3)' }, children: _jsxs(Box, { display: "flex", alignItems: "center", children: [getAgentIcon(agent.name), _jsxs(Typography, { variant: "h5", sx: { ml: 2 }, children: [agent.name, " - \u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0430 \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F"] })] }) }), _jsx(DialogContent, { sx: { color: '#ffffff', mt: 2 }, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0430 \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F" }), _jsx(TableContainer, { component: Paper, sx: { bgcolor: 'rgba(0,0,0,0.5)' }, children: _jsx(Table, { size: "small", children: _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { sx: { color: getStatusColor(agent.status) }, children: agent.status })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0417\u0434\u043E\u0440\u043E\u0432'\u044F" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agent.health })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u0412\u0435\u0440\u0441\u0456\u044F" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agent.version || 'N/A' })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "Uptime" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agent.uptime || 'N/A' })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "CPU" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agent.cpu })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#ccc' }, children: "\u041F\u0430\u043C'\u044F\u0442\u044C" }), _jsx(TableCell, { sx: { color: '#fff' }, children: agent.memory })] })] }) }) })] }), _jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" }), _jsxs(Box, { sx: { p: 2, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }, children: [_jsxs(Typography, { sx: { color: '#fff' }, children: ["\u041F\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u044C: ", agent.improvements || 0] }), _jsxs(Typography, { sx: { color: '#fff' }, children: ["\u0412\u0438\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044C: ", agent.fixes || 0] }), _jsxs(Typography, { sx: { color: '#fff' }, children: ["\u0417\u0430\u0432\u0434\u0430\u043D\u044C \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043E: ", agent.tasksCompleted || 0] }), _jsxs(Typography, { sx: { color: '#fff' }, children: ["\u041F\u043E\u043C\u0438\u043B\u043E\u043A: ", agent.errorCount || 0] }), agent.metrics && (_jsxs(_Fragment, { children: [_jsxs(Typography, { sx: { color: '#fff' }, children: ["\u0421\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u0447\u0430\u0441 \u0432\u0456\u0434\u0433\u0443\u043A\u0443: ", agent.metrics.avgResponseTime] }), _jsxs(Typography, { sx: { color: '#fff' }, children: ["\u0423\u0441\u043F\u0456\u0448\u043D\u0456\u0441\u0442\u044C: ", agent.metrics.successRate] }), _jsxs(Typography, { sx: { color: '#fff' }, children: ["\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u043D\u0430 \u0437\u0434\u0430\u0442\u043D\u0456\u0441\u0442\u044C: ", agent.metrics.throughput] })] }))] })] }), agent.capabilities && (_jsxs(Grid, { item: true, xs: 12, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\u041C\u043E\u0436\u043B\u0438\u0432\u043E\u0441\u0442\u0456" }), _jsx(List, { sx: { bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }, children: agent.capabilities.map((capability, index) => (_jsxs(ListItem, { children: [_jsx(ListItemIcon, { children: _jsx(CheckCircle, { sx: { color: '#00ff44' } }) }), _jsx(ListItemText, { primary: capability, sx: { color: '#fff' } })] }, index))) })] })), agent.description && (_jsxs(Grid, { item: true, xs: 12, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ffff', mb: 2 }, children: "\u041E\u043F\u0438\u0441" }), _jsx(Typography, { sx: { color: '#fff', p: 2, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }, children: agent.description })] }))] }) }), _jsxs(DialogActions, { sx: { borderTop: '1px solid rgba(0,255,255,0.3)', pt: 2 }, children: [_jsx(Button, { onClick: () => executeAgentAction('backup'), disabled: actionLoading === 'backup', startIcon: actionLoading === 'backup' ? _jsx(CircularProgress, { size: 16 }) : _jsx(Backup, {}), sx: { color: '#00ffff' }, children: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430 \u043A\u043E\u043F\u0456\u044F" }), _jsx(Button, { onClick: () => executeAgentAction('stop'), disabled: actionLoading === 'stop', startIcon: actionLoading === 'stop' ? _jsx(CircularProgress, { size: 16 }) : _jsx(Stop, {}), sx: { color: '#ff4444' }, children: "\u0417\u0443\u043F\u0438\u043D\u0438\u0442\u0438" }), _jsx(Button, { onClick: () => setDetailsOpen(false), sx: { color: '#ffffff' }, children: "\u0417\u0430\u043A\u0440\u0438\u0442\u0438" })] })] }), _jsx(Snackbar, { open: notification.open, autoHideDuration: 4000, onClose: () => setNotification({ ...notification, open: false }), children: _jsx(Alert, { onClose: () => setNotification({ ...notification, open: false }), severity: notification.severity, sx: { width: '100%' }, children: notification.message }) })] }));
};
export const InteractiveAgentsGrid = ({ agents, onAgentSelect }) => {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [globalAction, setGlobalAction] = useState(null);
    const [notification, setNotification] = useState({
        open: false, message: '', severity: 'success'
    });
    // Enhanced mock data with full information
    const enhancedAgents = agents.length > 0 ? agents.map(agent => ({
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
            description: 'Агент SelfHealingAgent відповідає за автоматичне лікування та відновлення системи PREDATOR11.',
            capabilities: [
                'Автоматичне виявлення збоїв',
                'Самовідновлення сервісів',
                'Health monitoring',
                'Emergency response',
                'Failover management'
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
            description: 'Агент AutoImproveAgent відповідає за автоматичне покращення та оптимізацію системи PREDATOR11.',
            capabilities: [
                'Performance optimization',
                'Code refactoring',
                'Algorithm enhancement',
                'Resource management',
                'Continuous improvement'
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
            description: 'Агент SelfDiagnosisAgent відповідає за автоматичну діагностику та моніторинг системи PREDATOR11.',
            capabilities: [
                'System diagnostics',
                'Predictive analytics',
                'Anomaly detection',
                'Performance monitoring',
                'Health assessment'
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
            description: 'Агент ContainerHealer відповідає за автоматичне лікування та управління Docker контейнерами.',
            capabilities: [
                'Container monitoring',
                'Auto-restart policies',
                'Resource scaling',
                'Health checks',
                'Disaster recovery'
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
            description: 'Агент SecurityAgent відповідає за безпеку та захист системи PREDATOR11.',
            capabilities: [
                'Threat detection',
                'Vulnerability scanning',
                'Access control',
                'Audit logging',
                'Incident response'
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
            description: 'Агент MonitoringAgent відповідає за збір метрик та моніторинг системи PREDATOR11.',
            capabilities: [
                'Metrics collection',
                'Alert management',
                'Dashboard generation',
                'Trend analysis',
                'Reporting'
            ],
            metrics: {
                avgResponseTime: '234ms',
                successRate: '87.2%',
                throughput: '234/sec'
            }
        }
    ];
    const handleAgentClick = (agent) => {
        setSelectedAgent(agent.name);
        onAgentSelect(agent);
    };
    const executeGlobalAction = async (action) => {
        setGlobalAction(action);
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            let message = '';
            switch (action) {
                case 'restart-all':
                    message = 'Всі агенти успішно перезапущені';
                    break;
                case 'optimize-all':
                    message = 'Виконано глобальну оптимізацію всіх агентів';
                    break;
                case 'health-check':
                    message = 'Перевірка здоров\'я всіх агентів завершена';
                    break;
                case 'backup-all':
                    message = 'Створено резервні копії всіх агентів';
                    break;
                case 'update-all':
                    message = 'Оновлення всіх агентів завершено';
                    break;
                default:
                    message = `Глобальна дія "${action}" виконана`;
            }
            setNotification({ open: true, message, severity: 'success' });
        }
        catch (error) {
            setNotification({
                open: true,
                message: `Помилка виконання глобальної дії "${action}"`,
                severity: 'error'
            });
        }
        finally {
            setGlobalAction(null);
        }
    };
    const filteredAgents = enhancedAgents.filter(agent => filterStatus === 'all' || agent.status === filterStatus);
    const sortedAgents = [...filteredAgents].sort((a, b) => {
        switch (sortBy) {
            case 'health':
                return b.health.localeCompare(a.health);
            case 'cpu':
                return parseInt(b.cpu.replace('%', '')) - parseInt(a.cpu.replace('%', ''));
            case 'memory':
                return parseInt(b.memory.replace('%', '')) - parseInt(a.memory.replace('%', ''));
            case 'fixes':
                return (b.fixes || 0) - (a.fixes || 0);
            default:
                return a.name.localeCompare(b.name);
        }
    });
    return (_jsxs(Box, { style: { padding: 16 }, children: [_jsxs(Box, { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }, children: [_jsx(Typography, { variant: "h4", className: "title-cyberpunk", children: "\uD83E\uDD16 \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0410\u0433\u0435\u043D\u0442\u0456\u0432 \u0421\u0430\u043C\u043E\u0432\u0434\u043E\u0441\u043A\u043E\u043D\u0430\u043B\u0435\u043D\u043D\u044F" }), _jsxs(Box, { display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", children: [_jsx(Box, { display: "flex", gap: 1, children: ['all', 'active', 'idle', 'error'].map(status => (_jsx(Button, { variant: filterStatus === status ? 'contained' : 'outlined', size: "small", onClick: () => setFilterStatus(status), sx: {
                                        color: filterStatus === status ? '#000' : '#00ffff',
                                        borderColor: '#00ffff',
                                        bgcolor: filterStatus === status ? '#00ffff' : 'transparent'
                                    }, children: status === 'all' ? 'Всі' : status }, status))) }), _jsx(Box, { display: "flex", gap: 1, children: [
                                    { key: 'name', label: 'Ім\'я' },
                                    { key: 'health', label: 'Здоров\'я' },
                                    { key: 'cpu', label: 'CPU' },
                                    { key: 'fixes', label: 'Виправлення' }
                                ].map(sort => (_jsx(Button, { variant: sortBy === sort.key ? 'contained' : 'outlined', size: "small", onClick: () => setSortBy(sort.key), sx: {
                                        color: sortBy === sort.key ? '#000' : '#ffff44',
                                        borderColor: '#ffff44',
                                        bgcolor: sortBy === sort.key ? '#ffff44' : 'transparent'
                                    }, children: sort.label }, sort.key))) }), _jsx(Tooltip, { title: isPlaying ? 'Призупинити анімації' : 'Запустити анімації', children: _jsx(IconButton, { onClick: () => setIsPlaying(!isPlaying), sx: {
                                        color: '#00ffff',
                                        '&:hover': {
                                            bgcolor: 'rgba(0,255,255,0.1)',
                                            transform: 'scale(1.1)'
                                        }
                                    }, children: isPlaying ? _jsx(Pause, {}) : _jsx(PlayArrow, {}) }) })] })] }), _jsxs(Card, { className: "glass-morphism", sx: { p: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h6", className: "subtitle-glow", sx: { mb: 2 }, children: "\uD83C\uDF10 \u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0456 \u0434\u0456\u0457" }), _jsxs(Box, { display: "flex", gap: 2, flexWrap: "wrap", children: [_jsx(Button, { variant: "contained", startIcon: globalAction === 'restart-all' ? _jsx(CircularProgress, { size: 16 }) : _jsx(RestartAlt, {}), onClick: () => executeGlobalAction('restart-all'), disabled: !!globalAction, sx: { bgcolor: '#ffff44', color: '#000', '&:hover': { bgcolor: '#dddd00' } }, children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u0432\u0441\u0456" }), _jsx(Button, { variant: "contained", startIcon: globalAction === 'optimize-all' ? _jsx(CircularProgress, { size: 16 }) : _jsx(Build, {}), onClick: () => executeGlobalAction('optimize-all'), disabled: !!globalAction, sx: { bgcolor: '#00ff44', color: '#000', '&:hover': { bgcolor: '#00dd00' } }, children: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0443\u0432\u0430\u0442\u0438 \u0432\u0441\u0456" }), _jsx(Button, { variant: "contained", startIcon: globalAction === 'health-check' ? _jsx(CircularProgress, { size: 16 }) : _jsx(MonitorHeart, {}), onClick: () => executeGlobalAction('health-check'), disabled: !!globalAction, sx: { bgcolor: '#00ffff', color: '#000', '&:hover': { bgcolor: '#00dddd' } }, children: "\u041F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0430 \u0437\u0434\u043E\u0440\u043E\u0432'\u044F" }), _jsx(Button, { variant: "contained", startIcon: globalAction === 'backup-all' ? _jsx(CircularProgress, { size: 16 }) : _jsx(Backup, {}), onClick: () => executeGlobalAction('backup-all'), disabled: !!globalAction, sx: { bgcolor: '#ff8800', color: '#000', '&:hover': { bgcolor: '#dd6600' } }, children: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0456 \u043A\u043E\u043F\u0456\u0457" }), _jsx(Button, { variant: "contained", startIcon: globalAction === 'update-all' ? _jsx(CircularProgress, { size: 16 }) : _jsx(CloudSync, {}), onClick: () => executeGlobalAction('update-all'), disabled: !!globalAction, sx: { bgcolor: '#8800ff', color: '#fff', '&:hover': { bgcolor: '#6600dd' } }, children: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438 \u0432\u0441\u0456" })] })] }), _jsxs(Grid, { container: true, spacing: 2, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { className: "glass-morphism", sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "h4", sx: { color: '#00ff44', fontWeight: 'bold' }, children: enhancedAgents.filter(a => a.status === 'active').length }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0445 \u0430\u0433\u0435\u043D\u0442\u0456\u0432" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { className: "glass-morphism", sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "h4", sx: { color: '#ffff44', fontWeight: 'bold' }, children: enhancedAgents.reduce((sum, a) => sum + (a.improvements || 0), 0) }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u041F\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u044C \u0437\u0430 \u0434\u0435\u043D\u044C" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { className: "glass-morphism", sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "h4", sx: { color: '#ff8800', fontWeight: 'bold' }, children: enhancedAgents.reduce((sum, a) => sum + (a.fixes || 0), 0) }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0412\u0438\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044C \u0437\u0430 \u0434\u0435\u043D\u044C" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { className: "glass-morphism", sx: { p: 2, textAlign: 'center' }, children: [_jsxs(Typography, { variant: "h4", sx: { color: '#00ffff', fontWeight: 'bold' }, children: [Math.round(enhancedAgents.reduce((sum, a) => sum + parseInt(a.metrics?.successRate?.replace('%', '') || '0'), 0) / enhancedAgents.length), "%"] }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u0443\u0441\u043F\u0456\u0448\u043D\u0456\u0441\u0442\u044C" })] }) })] }), _jsx(Grid, { container: true, spacing: 3, children: sortedAgents.map((agent, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: {
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "easeOut"
                        }, children: _jsx(AgentCard, { agent: agent, onClick: () => handleAgentClick(agent), isSelected: selectedAgent === agent.name }) }) }, agent.name))) }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8, delay: 0.5 }, style: {
                    position: 'fixed',
                    bottom: 30,
                    left: 30,
                    zIndex: 100
                }, children: _jsxs(Card, { className: "glass-morphism", sx: { p: 2, minWidth: 250 }, children: [_jsx(Typography, { variant: "subtitle2", className: "subtitle-glow", sx: { mb: 1 }, children: "\uD83D\uDCCA \u0420\u0435\u0430\u043B\u0442\u0430\u0439\u043C \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430" }), _jsxs(Typography, { variant: "body2", sx: { color: '#fff' }, children: ["\u0412\u0441\u044C\u043E\u0433\u043E \u0430\u0433\u0435\u043D\u0442\u0456\u0432: ", enhancedAgents.length] }), _jsxs(Typography, { variant: "body2", sx: { color: '#00ff44' }, children: ["\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0445: ", enhancedAgents.filter(a => a.status === 'active').length] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ffff44' }, children: ["\u041F\u0440\u043E\u0441\u0442\u043E\u044E\u044E\u0442\u044C: ", enhancedAgents.filter(a => a.status === 'idle').length] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ff4444' }, children: ["\u0417 \u043F\u043E\u043C\u0438\u043B\u043A\u0430\u043C\u0438: ", enhancedAgents.filter(a => a.status === 'error').length] }), _jsx(Divider, { sx: { my: 1, borderColor: 'rgba(255,255,255,0.2)' } }), _jsxs(Typography, { variant: "body2", sx: { color: '#00ffff' }, children: ["\u0417\u0430\u0432\u0434\u0430\u043D\u044C \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043E: ", enhancedAgents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0)] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ff8800' }, children: ["\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0438\u0445 \u043F\u043E\u043C\u0438\u043B\u043E\u043A: ", enhancedAgents.reduce((sum, a) => sum + (a.errorCount || 0), 0)] })] }) }), _jsx(Snackbar, { open: notification.open, autoHideDuration: 4000, onClose: () => setNotification({ ...notification, open: false }), children: _jsx(Alert, { onClose: () => setNotification({ ...notification, open: false }), severity: notification.severity, sx: { width: '100%' }, children: notification.message }) })] }));
};
