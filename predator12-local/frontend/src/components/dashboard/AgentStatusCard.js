import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, Box, Typography, Button, Chip, Stack, Avatar, Tooltip, IconButton, LinearProgress } from '@mui/material';
import { SmartToy as AgentIcon, CheckCircle as ActiveIcon, Error as DownIcon, Warning as DegradedIcon, Refresh as RefreshIcon, Timeline as LogsIcon, Settings as SettingsIcon, Speed as PerformanceIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useAppEventStore } from '../../stores/appEventStore';
const AgentStatusCard = ({ agents, onRestartAgent, onViewLogs, onOpenSettings, loading = false }) => {
    const { addEvent } = useAppEventStore();
    const getAgentTypeColor = (type) => {
        const colors = {
            etl: nexusColors.sapphire,
            security: nexusColors.error,
            analytics: nexusColors.quantum,
            monitor: nexusColors.success,
            bridge: nexusColors.warning
        };
        return colors[type] || nexusColors.frost;
    };
    const getAgentTypeLabel = (type) => {
        const labels = {
            etl: 'ETL',
            security: 'Безпека',
            analytics: 'Аналітика',
            monitor: 'Моніторинг',
            bridge: 'Інтеграція'
        };
        return labels[type] || type.toUpperCase();
    };
    const getStatusConfig = (status) => {
        switch (status) {
            case 'active':
                return {
                    color: nexusColors.success,
                    icon: _jsx(ActiveIcon, {}),
                    label: 'Активний',
                    bgColor: `${nexusColors.success}15`
                };
            case 'degraded':
                return {
                    color: nexusColors.warning,
                    icon: _jsx(DegradedIcon, {}),
                    label: 'Обмежено',
                    bgColor: `${nexusColors.warning}15`
                };
            case 'down':
                return {
                    color: nexusColors.error,
                    icon: _jsx(DownIcon, {}),
                    label: 'Недоступний',
                    bgColor: `${nexusColors.error}15`
                };
            case 'starting':
            default:
                return {
                    color: nexusColors.nebula,
                    icon: _jsx(RefreshIcon, {}),
                    label: 'Запуск',
                    bgColor: `${nexusColors.nebula}15`
                };
        }
    };
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalAgents = agents.length;
    const healthPercentage = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;
    const overallStatus = healthPercentage === 100 ? 'optimal' :
        healthPercentage >= 70 ? 'degraded' :
            healthPercentage >= 30 ? 'critical' : 'down';
    const getOverallStatusColor = () => {
        switch (overallStatus) {
            case 'optimal': return nexusColors.success;
            case 'degraded': return nexusColors.warning;
            case 'critical': return nexusColors.error;
            case 'down': return nexusColors.error;
            default: return nexusColors.nebula;
        }
    };
    const handleAgentAction = (action, agent) => {
        switch (action) {
            case 'restart':
                onRestartAgent?.(agent.id);
                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Перезапуск агента', run: () => { } } }, 'Перезапуск агента', `Перезапуск агента: ${agent.name}`, 'info');
                break;
            case 'logs':
                onViewLogs?.(agent.id);
                break;
            case 'settings':
                onOpenSettings?.(agent.id);
                break;
        }
    };
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: _jsxs(Card, { sx: {
                background: `linear-gradient(135deg, ${nexusColors.obsidian}E0, ${nexusColors.darkMatter}D0)`,
                border: `1px solid ${getOverallStatusColor()}60`,
                borderRadius: 2,
                position: 'relative',
                minHeight: 300,
                '&:hover': {
                    border: `1px solid ${getOverallStatusColor()}80`,
                    boxShadow: `0 8px 32px ${getOverallStatusColor()}20`
                },
                transition: 'all 0.3s ease'
            }, children: [_jsx(Box, { sx: {
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        height: 4,
                        background: `linear-gradient(90deg, ${getOverallStatusColor()}, ${getOverallStatusColor()}80)`,
                        borderRadius: '4px 4px 0 0'
                    } }), _jsxs(CardContent, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(AgentIcon, { sx: { color: getOverallStatusColor() } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "\u0410\u0433\u0435\u043D\u0442\u0438 MAS" })] }), _jsx(Chip, { label: `${activeAgents}/${totalAgents}`, size: "small", sx: {
                                        backgroundColor: `${getOverallStatusColor()}15`,
                                        color: getOverallStatusColor(),
                                        fontWeight: 'bold',
                                        border: `1px solid ${getOverallStatusColor()}40`
                                    } })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0435 \u0437\u0434\u043E\u0440\u043E\u0432'\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsxs(Typography, { variant: "body2", sx: { color: getOverallStatusColor(), fontWeight: 'bold' }, children: [Math.round(healthPercentage), "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: healthPercentage, sx: {
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: `${nexusColors.shadow}40`,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getOverallStatusColor(),
                                            borderRadius: 3
                                        }
                                    } })] }), loading && (_jsx(LinearProgress, { sx: {
                                mb: 2,
                                backgroundColor: `${nexusColors.quantum}40`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: nexusColors.quantum
                                }
                            } })), _jsx(Stack, { spacing: 1.5, sx: { maxHeight: 300, overflowY: 'auto', pr: 1 }, children: agents.map((agent) => {
                                const statusConfig = getStatusConfig(agent.status);
                                const typeColor = getAgentTypeColor(agent.type);
                                return (_jsx(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.2 }, children: _jsxs(Box, { sx: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: `1px solid ${statusConfig.color}30`,
                                            borderRadius: 1,
                                            backgroundColor: `${statusConfig.color}05`,
                                            '&:hover': {
                                                backgroundColor: `${statusConfig.color}10`,
                                                border: `1px solid ${statusConfig.color}60`
                                            },
                                            transition: 'all 0.2s ease'
                                        }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2, flex: 1 }, children: [_jsx(Avatar, { sx: {
                                                            width: 32,
                                                            height: 32,
                                                            bgcolor: `${typeColor}20`,
                                                            border: `1px solid ${typeColor}60`
                                                        }, children: _jsx(AgentIcon, { sx: { fontSize: 16, color: typeColor } }) }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 'bold' }, children: agent.name }), _jsx(Chip, { size: "small", label: getAgentTypeLabel(agent.type), sx: {
                                                                            fontSize: '0.7rem',
                                                                            height: 20,
                                                                            backgroundColor: `${typeColor}20`,
                                                                            color: typeColor,
                                                                            border: `1px solid ${typeColor}40`
                                                                        } })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [statusConfig.icon, _jsx(Typography, { variant: "caption", sx: { color: statusConfig.color }, children: statusConfig.label })] }), agent.lastSeen && (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, opacity: 0.7 }, children: ["\u2022 ", agent.lastSeen.toLocaleTimeString('uk-UA')] }))] }), (agent.cpu !== undefined || agent.memory !== undefined) && (_jsxs(Box, { sx: { display: 'flex', gap: 1, mt: 0.5 }, children: [agent.cpu !== undefined && (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost, opacity: 0.8 }, children: ["CPU: ", Math.round(agent.cpu * 100), "%"] })), agent.memory !== undefined && (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost, opacity: 0.8 }, children: ["RAM: ", Math.round(agent.memory * 100), "%"] }))] }))] })] }), _jsxs(Stack, { direction: "row", spacing: 0.5, children: [agent.status === 'down' && onRestartAgent && (_jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u0430\u0433\u0435\u043D\u0442\u0430", children: _jsx(IconButton, { size: "small", onClick: () => handleAgentAction('restart', agent), sx: {
                                                                color: nexusColors.sapphire,
                                                                minWidth: 44, // WCAG compliance
                                                                minHeight: 44,
                                                                '&:hover': {
                                                                    backgroundColor: `${nexusColors.sapphire}20`
                                                                }
                                                            }, children: _jsx(RefreshIcon, { fontSize: "small" }) }) })), onViewLogs && (_jsx(Tooltip, { title: "\u041B\u043E\u0433\u0438 \u0430\u0433\u0435\u043D\u0442\u0430", children: _jsx(IconButton, { size: "small", onClick: () => handleAgentAction('logs', agent), sx: {
                                                                color: nexusColors.frost,
                                                                minWidth: 44,
                                                                minHeight: 44,
                                                                '&:hover': {
                                                                    backgroundColor: `${nexusColors.quantum}20`
                                                                }
                                                            }, children: _jsx(LogsIcon, { fontSize: "small" }) }) })), onOpenSettings && (_jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0430\u0433\u0435\u043D\u0442\u0430", children: _jsx(IconButton, { size: "small", onClick: () => handleAgentAction('settings', agent), sx: {
                                                                color: nexusColors.frost,
                                                                minWidth: 44,
                                                                minHeight: 44,
                                                                '&:hover': {
                                                                    backgroundColor: `${nexusColors.quantum}20`
                                                                }
                                                            }, children: _jsx(SettingsIcon, { fontSize: "small" }) }) }))] })] }) }, agent.id));
                            }) }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { mt: 2, pt: 2, borderTop: `1px solid ${nexusColors.shadow}40` }, children: [_jsx(Button, { size: "small", startIcon: _jsx(RefreshIcon, {}), onClick: () => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Оновити статус', run: () => { } } }, 'Оновлення агентів', 'Оновлення статусу всіх агентів...', 'info'), disabled: loading, variant: "outlined", sx: {
                                        color: nexusColors.frost,
                                        borderColor: nexusColors.frost,
                                        minHeight: 44,
                                        flex: 1,
                                        '&:hover': {
                                            backgroundColor: `${nexusColors.quantum}20`,
                                            borderColor: nexusColors.quantum
                                        }
                                    }, children: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438 \u0432\u0441\u0456" }), _jsx(Button, { size: "small", startIcon: _jsx(PerformanceIcon, {}), onClick: () => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Запустити діагностику', run: () => { } } }, 'Діагностика агентів', 'Запуск повної діагностики агентів...', 'info'), variant: "outlined", sx: {
                                        color: nexusColors.sapphire,
                                        borderColor: nexusColors.sapphire,
                                        minHeight: 44,
                                        flex: 1,
                                        '&:hover': {
                                            backgroundColor: `${nexusColors.sapphire}20`,
                                            borderColor: nexusColors.sapphire
                                        }
                                    }, children: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430" })] })] })] }) }));
};
export default AgentStatusCard;
