import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Grid, Typography, Chip, Card, CardContent } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';
import { AGENT_MODEL_ASSIGNMENTS } from '../../services/modelRegistry';
const QuickAgentsView = ({ onAgentClick }) => {
    // Всі 26 агентів
    const allAgents = [
        // Core Agents (16)
        { id: 'ChiefOrchestrator', category: 'core', status: 'active', health: 95 },
        { id: 'QueryPlanner', category: 'core', status: 'active', health: 88 },
        { id: 'ModelRouter', category: 'core', status: 'active', health: 92 },
        { id: 'Arbiter', category: 'core', status: 'active', health: 89 },
        { id: 'NexusGuide', category: 'core', status: 'active', health: 94 },
        { id: 'DatasetIngest', category: 'core', status: 'active', health: 96 },
        { id: 'DataQuality', category: 'core', status: 'degraded', health: 71 },
        { id: 'SchemaMapper', category: 'core', status: 'active', health: 85 },
        { id: 'ETLOrchestrator', category: 'core', status: 'active', health: 91 },
        { id: 'Indexer', category: 'core', status: 'active', health: 93 },
        { id: 'Embedding', category: 'core', status: 'active', health: 97 },
        { id: 'OSINTCrawler', category: 'core', status: 'active', health: 82 },
        { id: 'GraphBuilder', category: 'core', status: 'active', health: 86 },
        { id: 'Anomaly', category: 'core', status: 'active', health: 90 },
        { id: 'Forecast', category: 'core', status: 'active', health: 88 },
        { id: 'Simulator', category: 'core', status: 'active', health: 84 },
        // Specialized Agents (10)
        { id: 'SyntheticData', category: 'specialized', status: 'paused', health: 0 },
        { id: 'ReportExport', category: 'specialized', status: 'active', health: 95 },
        { id: 'BillingGate', category: 'specialized', status: 'active', health: 98 },
        { id: 'PIIGuardian', category: 'specialized', status: 'active', health: 96 },
        { id: 'AutoHeal', category: 'specialized', status: 'active', health: 89 },
        { id: 'SelfDiagnosis', category: 'specialized', status: 'active', health: 87 },
        { id: 'SelfImprovement', category: 'specialized', status: 'degraded', health: 65 },
        { id: 'RedTeam', category: 'specialized', status: 'down', health: 0 },
        { id: 'ComplianceMonitor', category: 'specialized', status: 'active', health: 93 },
        { id: 'PerformanceOptimizer', category: 'specialized', status: 'active', health: 91 }
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusColors.emerald;
            case 'degraded': return nexusColors.warning;
            case 'paused': return nexusColors.shadow;
            case 'down': return nexusColors.crimson;
            default: return nexusColors.shadow;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'active': return '🟢';
            case 'degraded': return '🟡';
            case 'paused': return '⏸️';
            case 'down': return '🔴';
            default: return '⚪';
        }
    };
    const getCategoryEmoji = (category) => {
        return category === 'core' ? '🎯' : '🔧';
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Typography, { variant: "h5", sx: {
                    mb: 3,
                    color: nexusColors.frost,
                    textAlign: 'center',
                    background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }, children: ["\uD83E\uDD16 \u0412\u0441\u0456 ", allAgents.length, " \u0430\u0433\u0435\u043D\u0442\u0456\u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0438"] }), _jsx(Grid, { container: true, spacing: 2, children: allAgents.map((agent) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}CC, ${nexusColors.darkMatter}AA)`,
                            border: `1px solid ${getStatusColor(agent.status)}40`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 25px ${getStatusColor(agent.status)}30`,
                                border: `1px solid ${getStatusColor(agent.status)}80`
                            }
                        }, onClick: () => onAgentClick?.(agent.id), children: _jsxs(CardContent, { sx: { p: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [_jsxs(Typography, { sx: { fontSize: '0.9rem' }, children: [getCategoryEmoji(agent.category), " ", getStatusEmoji(agent.status)] }), _jsx(Typography, { variant: "body2", sx: {
                                                ml: 1,
                                                fontWeight: 600,
                                                color: nexusColors.frost,
                                                fontSize: '0.8rem'
                                            }, children: agent.id })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Chip, { size: "small", label: agent.status, sx: {
                                                backgroundColor: `${getStatusColor(agent.status)}20`,
                                                color: getStatusColor(agent.status),
                                                fontSize: '0.7rem',
                                                height: 20
                                            } }), _jsxs(Typography, { variant: "caption", sx: {
                                                color: agent.health > 80 ? nexusColors.emerald :
                                                    agent.health > 50 ? nexusColors.warning : nexusColors.crimson,
                                                fontWeight: 600
                                            }, children: [agent.health, "%"] })] }), _jsx(Typography, { variant: "caption", sx: {
                                        color: nexusColors.shadow,
                                        display: 'block',
                                        mt: 1,
                                        fontSize: '0.7rem'
                                    }, children: AGENT_MODEL_ASSIGNMENTS[agent.id] || 'No model assigned' })] }) }) }, agent.id))) }), _jsx(Box, { sx: { mt: 3, textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.shadow }, children: ["Core: ", allAgents.filter(a => a.category === 'core').length, " | Specialized: ", allAgents.filter(a => a.category === 'specialized').length, " | Active: ", allAgents.filter(a => a.status === 'active').length] }) })] }));
};
export default QuickAgentsView;
