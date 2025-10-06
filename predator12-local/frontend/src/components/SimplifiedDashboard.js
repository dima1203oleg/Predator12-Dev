import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Grid, Card, Typography, Button, Chip, LinearProgress, Avatar, Paper, IconButton, Tooltip, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { SmartToy, Healing, AutoFixHigh, Analytics, RestartAlt, Build, BugReport, Settings } from '@mui/icons-material';
const AgentCard = ({ agent, onAction }) => {
    const [loading, setLoading] = useState(null);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#00ff44';
            case 'idle': return '#ffff44';
            case 'error': return '#ff4444';
            default: return '#00ffff';
        }
    };
    const getAgentIcon = (name) => {
        if (name.includes('Heal'))
            return _jsx(Healing, {});
        if (name.includes('Improve'))
            return _jsx(AutoFixHigh, {});
        if (name.includes('Diagnosis'))
            return _jsx(Analytics, {});
        return _jsx(SmartToy, {});
    };
    const executeAction = async (action) => {
        setLoading(action);
        await new Promise(resolve => setTimeout(resolve, 2000));
        onAction(agent.name, action);
        setLoading(null);
    };
    return (_jsx(motion.div, { whileHover: { scale: 1.02, y: -5 }, transition: { duration: 0.3 }, children: _jsxs(Card, { sx: {
                p: 3,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
                border: `2px solid ${getStatusColor(agent.status)}40`,
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                '&:hover': {
                    border: `2px solid ${getStatusColor(agent.status)}`,
                    boxShadow: `0 8px 32px ${getStatusColor(agent.status)}30`
                }
            }, children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 2, children: [_jsx(Avatar, { sx: {
                                bgcolor: getStatusColor(agent.status),
                                mr: 2,
                                width: 48,
                                height: 48
                            }, children: getAgentIcon(agent.name) }), _jsxs(Box, { flex: 1, children: [_jsx(Typography, { variant: "h6", sx: { color: '#ffffff', fontWeight: 'bold' }, children: agent.name }), _jsx(Chip, { label: agent.status, size: "small", sx: {
                                        bgcolor: `${getStatusColor(agent.status)}20`,
                                        color: getStatusColor(agent.status),
                                        fontWeight: 'bold'
                                    } })] })] }), _jsxs(Box, { mb: 2, children: [_jsxs(Typography, { variant: "body2", sx: { color: '#cccccc', mb: 1 }, children: ["\u0417\u0434\u043E\u0440\u043E\u0432'\u044F: ", agent.health] }), _jsx(LinearProgress, { variant: "determinate", value: agent.health === 'excellent' ? 100 : agent.health === 'good' ? 80 : 60, sx: {
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getStatusColor(agent.status)
                                }
                            } })] }), _jsxs(Grid, { container: true, spacing: 1, mb: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsxs(Typography, { variant: "caption", sx: { color: '#cccccc' }, children: ["CPU: ", agent.cpu] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(Typography, { variant: "caption", sx: { color: '#cccccc' }, children: ["RAM: ", agent.memory] }) })] }), (agent.improvements || agent.fixes) && (_jsxs(Box, { display: "flex", gap: 1, mb: 2, children: [agent.improvements && (_jsx(Chip, { icon: _jsx(AutoFixHigh, {}), label: agent.improvements, size: "small", sx: { bgcolor: 'rgba(0,255,0,0.2)', color: '#00ff44' } })), agent.fixes && (_jsx(Chip, { icon: _jsx(Healing, {}), label: agent.fixes, size: "small", sx: { bgcolor: 'rgba(255,255,0,0.2)', color: '#ffff44' } }))] })), _jsxs(Box, { display: "flex", gap: 1, justifyContent: "space-between", children: [_jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", onClick: () => executeAction('restart'), disabled: !!loading, sx: { color: '#ffff44' }, children: loading === 'restart' ? _jsx(Box, { className: "loading-spinner" }) : _jsx(RestartAlt, {}) }) }), _jsx(Tooltip, { title: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0443\u0432\u0430\u0442\u0438", children: _jsx(IconButton, { size: "small", onClick: () => executeAction('optimize'), disabled: !!loading, sx: { color: '#00ff44' }, children: loading === 'optimize' ? _jsx(Box, { className: "loading-spinner" }) : _jsx(Build, {}) }) }), _jsx(Tooltip, { title: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", children: _jsx(IconButton, { size: "small", onClick: () => executeAction('diagnose'), disabled: !!loading, sx: { color: '#ff8800' }, children: loading === 'diagnose' ? _jsx(Box, { className: "loading-spinner" }) : _jsx(BugReport, {}) }) }), _jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", children: _jsx(IconButton, { size: "small", onClick: () => executeAction('configure'), disabled: !!loading, sx: { color: '#00ffff' }, children: loading === 'configure' ? _jsx(Box, { className: "loading-spinner" }) : _jsx(Settings, {}) }) })] })] }) }));
};
const SimplifiedDashboard = () => {
    const [notification, setNotification] = useState({
        open: false, message: '', severity: 'success'
    });
    const agents = [
        {
            name: 'SelfHealingAgent',
            status: 'active',
            health: 'excellent',
            cpu: '6%',
            memory: '39%',
            improvements: 12,
            fixes: 9
        },
        {
            name: 'AutoImproveAgent',
            status: 'active',
            health: 'good',
            cpu: '15%',
            memory: '57%',
            improvements: 8,
            fixes: 3
        },
        {
            name: 'SelfDiagnosisAgent',
            status: 'active',
            health: 'excellent',
            cpu: '12%',
            memory: '42%',
            improvements: 5,
            fixes: 7
        },
        {
            name: 'ContainerHealer',
            status: 'active',
            health: 'excellent',
            cpu: '8%',
            memory: '28%',
            improvements: 15,
            fixes: 22
        }
    ];
    const handleAgentAction = (agentName, action) => {
        const actionMessages = {
            restart: `Агент ${agentName} успішно перезапущено`,
            optimize: `Агент ${agentName} оптимізовано`,
            diagnose: `Діагностика агента ${agentName} завершена`,
            configure: `Налаштування агента ${agentName} збережено`
        };
        setNotification({
            open: true,
            message: actionMessages[action] || `Дія ${action} виконана`,
            severity: 'success'
        });
        console.log(`✅ ${agentName}: ${action} виконано успішно`);
    };
    const handleGlobalAction = async (action) => {
        console.log(`🌐 Виконується: ${action}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const messages = {
            'restart-all': 'Всі агенти успішно перезапущені',
            'optimize-all': 'Глобальна оптимізація завершена',
            'health-check': 'Перевірка здоров\'я завершена',
            'backup': 'Резервна копія створена',
            'security-scan': 'Сканування безпеки завершено'
        };
        setNotification({
            open: true,
            message: messages[action] || 'Операція виконана',
            severity: 'success'
        });
    };
    return (_jsxs(Box, { sx: { p: 3, minHeight: '100vh' }, children: [_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, children: _jsxs(Paper, { sx: {
                        p: 4,
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
                        border: '2px solid rgba(0,255,255,0.5)',
                        borderRadius: 3,
                        backdropFilter: 'blur(20px)'
                    }, children: [_jsx(Typography, { variant: "h3", className: "title-cyberpunk", sx: { mb: 2 }, children: "\uD83E\uDD16 \u0426\u0435\u043D\u0442\u0440 \u0443\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F \u0430\u0433\u0435\u043D\u0442\u0430\u043C\u0438 PREDATOR11" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#00ff44', fontWeight: 'bold' }, children: agents.filter(a => a.status === 'active').length }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0445 \u0430\u0433\u0435\u043D\u0442\u0456\u0432" })] }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#ffff44', fontWeight: 'bold' }, children: agents.reduce((sum, a) => sum + (a.improvements || 0), 0) }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u041F\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u044C \u0437\u0430 \u0434\u0435\u043D\u044C" })] }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#ff8800', fontWeight: 'bold' }, children: agents.reduce((sum, a) => sum + (a.fixes || 0), 0) }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0412\u0438\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044C \u0437\u0430 \u0434\u0435\u043D\u044C" })] }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsxs(Box, { textAlign: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#00ffff', fontWeight: 'bold' }, children: "99%" }), _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "\u0413\u043E\u0442\u043E\u0432\u043D\u0456\u0441\u0442\u044C \u0441\u0438\u0441\u0442\u0435\u043C\u0438" })] }) })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.2 }, children: _jsxs(Paper, { sx: {
                        p: 3,
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
                        border: '1px solid rgba(0,255,255,0.3)',
                        borderRadius: 2,
                        backdropFilter: 'blur(20px)'
                    }, children: [_jsx(Typography, { variant: "h5", sx: { color: '#00ffff', mb: 2, fontWeight: 'bold' }, children: "\uD83C\uDF10 \u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0456 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0457" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(RestartAlt, {}), onClick: () => handleGlobalAction('restart-all'), sx: {
                                            bgcolor: '#ffff44',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#dddd00', transform: 'translateY(-2px)' }
                                        }, children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u0432\u0441\u0456" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(AutoFixHigh, {}), onClick: () => handleGlobalAction('optimize-all'), sx: {
                                            bgcolor: '#00ff44',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#00dd00', transform: 'translateY(-2px)' }
                                        }, children: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0443\u0432\u0430\u0442\u0438" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", startIcon: _jsx(BugReport, {}), onClick: () => handleGlobalAction('health-check'), sx: {
                                            bgcolor: '#00ffff',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#00dddd', transform: 'translateY(-2px)' }
                                        }, children: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", onClick: () => handleGlobalAction('backup'), sx: {
                                            bgcolor: '#ff8800',
                                            color: '#000',
                                            '&:hover': { bgcolor: '#dd6600', transform: 'translateY(-2px)' }
                                        }, children: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430 \u043A\u043E\u043F\u0456\u044F" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2, children: _jsx(Button, { fullWidth: true, variant: "contained", onClick: () => handleGlobalAction('security-scan'), sx: {
                                            bgcolor: '#ff4444',
                                            color: '#fff',
                                            '&:hover': { bgcolor: '#dd0000', transform: 'translateY(-2px)' }
                                        }, children: "\u0410\u0443\u0434\u0438\u0442 \u0431\u0435\u0437\u043F\u0435\u043A\u0438" }) })] })] }) }), _jsx(Grid, { container: true, spacing: 3, children: agents.map((agent, index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: index * 0.1 }, children: _jsx(AgentCard, { agent: agent, onAction: handleAgentAction }) }) }, agent.name))) }), _jsx(Snackbar, { open: notification.open, autoHideDuration: 3000, onClose: () => setNotification({ ...notification, open: false }), children: _jsx(Alert, { onClose: () => setNotification({ ...notification, open: false }), severity: notification.severity, children: notification.message }) })] }));
};
export default SimplifiedDashboard;
