import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Container, Alert, AlertTitle, Fade, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, Settings as SettingsIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useAppEventStore } from '../../stores/appEventStore';
import HealthCard from './HealthCard';
import AgentStatusCard from './AgentStatusCard';
import NotificationHub from '../notifications/NotificationHub';
import GuideDock from '../guide/GuideDock';
import { mockAPI, apiUtils } from '../../services/mockAPI';
const EnhancedDashboard = () => {
    const { addEvent, activateGuide } = useAppEventStore();
    const [systemHealth, setSystemHealth] = useState(null);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Завантаження даних
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [healthData, agentsData] = await Promise.all([
                mockAPI.getSystemHealth(),
                mockAPI.getAgents()
            ]);
            setSystemHealth(healthData);
            setAgents(agentsData);
            setLastUpdated(new Date());
            // Генеруємо події для unknown станів
            if (healthData.status === 'unknown') {
                healthData.reasons.forEach(reason => {
                    addEvent({ type: 'HEALTH_UNKNOWN', source: 'backend', hint: reason }, 'Невідомий стан системи', `Невизначений стан системи: ${reason}`, 'warn');
                });
            }
            // Перевіряємо агентів
            const downAgents = agentsData.filter(a => a.status === 'down');
            downAgents.forEach(agent => {
                addEvent({ type: 'AGENT_DOWN', agentId: agent.id }, 'Агент недоступний', `Агент ${agent.name} недоступний`, 'error');
            });
        }
        catch (err) {
            const errorInfo = apiUtils.handleAPIError(err);
            setError(errorInfo.message);
            addEvent({ type: 'NETWORK_OFFLINE' }, 'Помилка мережі', errorInfo.message, 'error');
        }
        finally {
            setLoading(false);
        }
    };
    // Обробники дій
    const handleRefresh = () => {
        loadDashboardData();
        activateGuide('dashboard');
    };
    const handleRestartAgent = async (agentId) => {
        try {
            const result = await mockAPI.restartAgent(agentId);
            addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Перезапуск', run: () => { } } }, 'Перезапуск агента', result.message, result.success ? 'success' : 'error');
            if (result.success) {
                // Оновлюємо дані через кілька секунд
                setTimeout(loadDashboardData, 2000);
            }
        }
        catch (err) {
            console.error('Restart agent error:', err);
        }
    };
    const handleViewLogs = (agentId) => {
        activateGuide('logs');
        addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Відкрити логи', run: () => { } } }, 'Перегляд логів', `Відкриваємо логи агента ${agentId}`, 'info');
    };
    const handleOpenSettings = (componentName) => {
        activateGuide('settings');
        addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Налаштування', run: () => { } } }, 'Відкриття налаштувань', `Відкриваємо налаштування ${componentName || 'системи'}`, 'info');
    };
    const handleFullscreenToggle = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
            setIsFullscreen(true);
        }
        else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };
    // Початкове завантаження даних
    useEffect(() => {
        loadDashboardData();
        // Автооновлення кожні 30 секунд
        const interval = setInterval(loadDashboardData, 30000);
        // Мок WebSocket для подій реального часу
        const mockWS = mockAPI.createMockWebSocket((event) => {
            let message = '';
            let level = 'info';
            switch (event.type) {
                case 'HEALTH_UNKNOWN':
                    message = `Компонент ${event.source} не відповідає`;
                    level = 'warn';
                    break;
                case 'AGENT_DOWN':
                    message = `Агент ${event.agentId} припинив роботу`;
                    level = 'error';
                    break;
                case 'NETWORK_OFFLINE':
                    message = 'Втрачено мережеве підключення';
                    level = 'error';
                    break;
                case 'ACTION_REQUIRED':
                    message = 'Потрібна дія користувача';
                    level = 'warn';
                    break;
            }
            if (message) {
                addEvent(event, 'Системна подія', message, level);
            }
        });
        return () => {
            clearInterval(interval);
            mockWS.close();
        };
    }, [addEvent]);
    // Обробка fullscreen режиму
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);
    return (_jsxs(Box, { style: {
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${nexusColors.obsidian} 0%, ${nexusColors.darkMatter} 50%, ${nexusColors.obsidian} 100%)`,
            position: 'relative',
            overflow: 'hidden'
        }, children: [_jsx(Box, { sx: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
            radial-gradient(circle at 20% 80%, ${nexusColors.quantum}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${nexusColors.sapphire}10 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${nexusColors.nebula}05 0%, transparent 50%)
          `,
                    zIndex: 0
                } }), _jsxs(Container, { maxWidth: "xl", sx: { position: 'relative', zIndex: 1, pt: 3, pb: 2 }, children: [_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h3", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron, monospace',
                                                fontWeight: 700,
                                                textShadow: `0 0 20px ${nexusColors.quantum}50`,
                                                background: `linear-gradient(45deg, ${nexusColors.frost}, ${nexusColors.quantum})`,
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }, children: "\u041C\u0456\u0441\u0442 \u0423\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F" }), _jsx(Typography, { variant: "subtitle1", sx: {
                                                color: nexusColors.nebula,
                                                mt: 1,
                                                opacity: 0.8
                                            }, children: "Predator11 \u2022 Multi-Agent System Dashboard" })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsxs(Typography, { variant: "caption", sx: {
                                                color: nexusColors.nebula,
                                                opacity: 0.7
                                            }, children: ["\u041E\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ", lastUpdated.toLocaleTimeString('uk-UA')] }), _jsx(Tooltip, { title: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438 \u0434\u0430\u043D\u0456", children: _jsx(IconButton, { onClick: handleRefresh, disabled: loading, sx: {
                                                    color: nexusColors.quantum,
                                                    minWidth: 44,
                                                    minHeight: 44,
                                                    '&:hover': {
                                                        backgroundColor: `${nexusColors.quantum}20`
                                                    }
                                                }, children: _jsx(RefreshIcon, { sx: {
                                                        animation: loading ? 'spin 1s linear infinite' : 'none',
                                                        '@keyframes spin': {
                                                            from: { transform: 'rotate(0deg)' },
                                                            to: { transform: 'rotate(360deg)' }
                                                        }
                                                    } }) }) }), _jsx(Tooltip, { title: isFullscreen ? 'Вийти з повноекранного режиму' : 'Повноекранний режим', children: _jsx(IconButton, { onClick: handleFullscreenToggle, sx: {
                                                    color: nexusColors.frost,
                                                    minWidth: 44,
                                                    minHeight: 44,
                                                    '&:hover': {
                                                        backgroundColor: `${nexusColors.frost}20`
                                                    }
                                                }, children: _jsx(FullscreenIcon, {}) }) }), _jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438", children: _jsx(IconButton, { onClick: () => handleOpenSettings(), sx: {
                                                    color: nexusColors.nebula,
                                                    minWidth: 44,
                                                    minHeight: 44,
                                                    '&:hover': {
                                                        backgroundColor: `${nexusColors.nebula}20`
                                                    }
                                                }, children: _jsx(SettingsIcon, {}) }) })] })] }) }), error && (_jsx(Fade, { in: true, children: _jsxs(Alert, { severity: "error", sx: {
                                mb: 3,
                                backgroundColor: `${nexusColors.error}15`,
                                border: `1px solid ${nexusColors.error}40`,
                                '& .MuiAlert-icon': { color: nexusColors.error }
                            }, action: _jsx(IconButton, { onClick: loadDashboardData, size: "small", sx: { color: nexusColors.error }, children: _jsx(RefreshIcon, {}) }), children: [_jsx(AlertTitle, { sx: { color: nexusColors.frost }, children: "\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F" }), _jsx(Typography, { sx: { color: nexusColors.nebula }, children: error })] }) })), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, lg: 4, children: _jsx(HealthCard, { title: "\u0421\u0442\u0430\u043D \u0441\u0438\u0441\u0442\u0435\u043C\u0438", status: systemHealth?.status || 'unknown', metric: systemHealth?.status === 'ok' ? 0.95 : systemHealth?.status === 'degraded' ? 0.7 : undefined, details: systemHealth ? apiUtils.formatHealthMessage(systemHealth.status, systemHealth.reasons) : undefined, reasons: systemHealth?.reasons, onRecheck: loadDashboardData, onOpenLogs: () => handleViewLogs('system'), onOpenSettings: () => handleOpenSettings('система'), loading: loading, lastUpdated: lastUpdated, helpText: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0438\u0439 \u0441\u0442\u0430\u043D \u0432\u0441\u0456\u0445 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0456\u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0438", quickActions: systemHealth?.status === 'unknown' ? [
                                        {
                                            label: 'Діагностика',
                                            action: () => {
                                                activateGuide('diagnostics');
                                                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Запуск діагностики', run: () => { } } }, 'Системна діагностика', 'Запускаємо повну діагностику системи...', 'info');
                                            },
                                            primary: true
                                        }
                                    ] : [] }) }), systemHealth?.components?.map((component, index) => (_jsx(Grid, { item: true, xs: 12, md: 6, lg: 4, children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: index * 0.1 }, children: _jsx(HealthCard, { title: component.name, status: component.status, reasons: component.reasons, onRecheck: loadDashboardData, onOpenLogs: () => handleViewLogs(component.name), onOpenSettings: () => handleOpenSettings(component.name), loading: loading, lastUpdated: component.lastCheck, quickActions: apiUtils.getSuggestedActions(component.status, component.name) }) }) }, component.name))), _jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(AgentStatusCard, { agents: agents, onRestartAgent: handleRestartAgent, onViewLogs: handleViewLogs, onOpenSettings: handleOpenSettings, loading: loading }) })] })] }), _jsx(NotificationHub, {}), _jsx(GuideDock, { currentModule: "dashboard", systemHealth: systemHealth?.status })] }));
};
export default EnhancedDashboard;
