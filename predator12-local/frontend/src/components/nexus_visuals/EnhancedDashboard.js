import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, IconButton } from '@mui/material';
import { Security as SecurityIcon, DataUsage as DataIcon, Psychology as AIIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { nexusAPI } from '../../services/nexusAPI';
import { nexusColors } from '../../theme/nexusTheme';
import AlertTicker from './AlertTicker';
import GuidePanel from '../guide/GuidePanel';
import ContextualChat from '../guide/ContextualChat';
const EnhancedDashboard = ({ isSpeaking }) => {
    const [systemStatus, setSystemStatus] = useState(null);
    const [agents, setAgents] = useState([]);
    const [realTimeData, setRealTimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(true);
    useEffect(() => {
        fetchData();
        // Set up WebSocket for real-time updates
        const ws = nexusAPI.connect3DStream((data) => {
            setRealTimeData(data);
        });
        // Periodic refresh
        const interval = setInterval(fetchData, 10000);
        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, []);
    const fetchData = async () => {
        try {
            const [statusData, agentsData] = await Promise.all([
                nexusAPI.getSystemStatus(),
                nexusAPI.getAgentsStatus()
            ]);
            setSystemStatus(statusData);
            setAgents(agentsData.agents);
            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };
    const handleGuideAction = (action) => {
        switch (action) {
            case 'optimize-agents':
                console.log('Оптимізація агентів...');
                break;
            case 'restart-unhealthy':
                console.log('Перезапуск проблемних агентів...');
                break;
            case 'analyze-queues':
                console.log('Аналіз черг...');
                break;
            case 'clear-cache':
                console.log('Очищення кешу...');
                break;
            case 'apply-optimizations':
                console.log('Застосування оптимізацій...');
                break;
            case 'create-optimization-plan':
                console.log('Створення плану оптимізації...');
                break;
            case 'renew-certificates':
                console.log('Оновлення сертифікатів...');
                break;
            case 'security-audit':
                console.log('Повний аудит безпеки...');
                break;
            case 'deep-analysis':
                console.log('Глибший аналіз...');
                break;
            case 'show-metrics':
                console.log('Показ метрик...');
                break;
            case 'toggle-chat':
                setShowChat((v) => !v);
                break;
            default:
                console.log('Дія з чату:', action);
        }
    };
    if (loading) {
        return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0434\u0430\u0448\u0431\u043E\u0440\u0434\u0443..." }), _jsx(LinearProgress, { sx: { color: nexusColors.emerald } })] }));
    }
    return (_jsxs(Box, { sx: { p: 3, minHeight: '100vh', background: `linear-gradient(135deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})` }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "Enhanced Dashboard" }), _jsx(IconButton, { onClick: fetchData, sx: { ml: 2, color: nexusColors.emerald }, children: _jsx(RefreshIcon, {}) })] }), _jsx(AlertTicker, { filterSeverities: ['warning', 'critical'] }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }, children: [_jsx(Card, { sx: {
                            backgroundColor: `${nexusColors.obsidian}60`,
                            border: `1px solid ${nexusColors.quantum}`,
                            backdropFilter: 'blur(10px)'
                        }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(SecurityIcon, { sx: { color: nexusColors.sapphire, mr: 1 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: "System Status" })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["Overall Health: ", systemStatus?.health || 'Unknown'] }), _jsx(LinearProgress, { variant: "determinate", value: systemStatus?.health_percentage || 0, sx: {
                                        backgroundColor: `${nexusColors.quantum}40`,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: nexusColors.emerald
                                        }
                                    } })] }) }), _jsx(Card, { sx: {
                            backgroundColor: `${nexusColors.obsidian}60`,
                            border: `1px solid ${nexusColors.quantum}`,
                            backdropFilter: 'blur(10px)'
                        }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(AIIcon, { sx: { color: nexusColors.amethyst, mr: 1 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: "Agents Status" })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["Active: ", agents.filter(a => a.status === 'active').length, "/", agents.length] }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: agents.slice(0, 5).map((agent, index) => (_jsx(Chip, { label: agent.name, size: "small", sx: {
                                            backgroundColor: agent.status === 'active' ? `${nexusColors.success}20` : `${nexusColors.warning}20`,
                                            color: agent.status === 'active' ? nexusColors.success : nexusColors.warning
                                        } }, index))) })] }) }), _jsx(Card, { sx: {
                            backgroundColor: `${nexusColors.obsidian}60`,
                            border: `1px solid ${nexusColors.quantum}`,
                            backdropFilter: 'blur(10px)'
                        }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(DataIcon, { sx: { color: nexusColors.emerald, mr: 1 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: "Data Metrics" })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["ETL Processes: ", realTimeData?.etl_count || 0, " active"] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: ["Data Volume: ", realTimeData?.data_volume || '0 GB', " processed"] })] }) })] }), _jsx(GuidePanel, { systemHealth: systemStatus?.health || 'unknown', agentsData: agents, onQuickAction: handleGuideAction, alertsCount: systemStatus?.anomaly_chronicle?.length || 0 }), showChat && (_jsx(ContextualChat, { visible: showChat, module: "dashboard", systemHealth: systemStatus?.health || 'unknown', agentsData: agents, onAction: handleGuideAction }))] }));
};
export default EnhancedDashboard;
