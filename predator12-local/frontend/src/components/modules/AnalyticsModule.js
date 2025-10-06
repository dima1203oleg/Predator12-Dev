import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, Grid, Card, Button, Chip, Alert } from '@mui/material';
import { OpenInNew, Refresh, Search, FilterList, Analytics } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
const AnalyticsModule = () => {
    const [dashboardUrl] = useState('http://localhost:5601');
    const [isConnected, setIsConnected] = useState(true);
    const [searches] = useState([
        {
            id: 'customs-fraud',
            name: 'Пошук шахрайства',
            query: 'customs_fraud_detection',
            lastUsed: '10 хв тому',
            results: 247
        },
        {
            id: 'trade-anomalies',
            name: 'Торговельні аномалії',
            query: 'trade_volume_anomalies',
            lastUsed: '25 хв тому',
            results: 89
        },
        {
            id: 'compliance-check',
            name: 'Перевірка відповідності',
            query: 'compliance_violations',
            lastUsed: '1 год тому',
            results: 156
        }
    ]);
    const [indices] = useState([
        { name: 'customs-declarations', docs: 1234567, size: '2.3 GB', status: 'healthy' },
        { name: 'trade-transactions', docs: 890123, size: '1.8 GB', status: 'healthy' },
        { name: 'osint-data', docs: 456789, size: '980 MB', status: 'warning' },
        { name: 'fraud-patterns', docs: 78901, size: '450 MB', status: 'healthy' }
    ]);
    const handleOpenDashboard = () => {
        window.open(dashboardUrl, '_blank');
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return nexusColors.success;
            case 'warning': return nexusColors.warning;
            case 'error': return nexusColors.error;
            default: return nexusColors.frost;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'healthy': return '🟢';
            case 'warning': return '🟡';
            case 'error': return '🔴';
            default: return '⚪';
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h4", sx: {
                    mb: 3,
                    color: nexusColors.frost,
                    textAlign: 'center',
                    background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }, children: "\uD83D\uDD0D \u0410\u043D\u0430\u043B\u0456\u0442\u0438\u0447\u043D\u0430 \u041F\u0430\u043B\u0443\u0431\u0430 OpenSearch" }), _jsx(Alert, { severity: isConnected ? "success" : "error", sx: {
                    mb: 3,
                    background: isConnected ? `${nexusColors.success}20` : `${nexusColors.error}20`,
                    border: `1px solid ${isConnected ? nexusColors.success : nexusColors.error}40`,
                    color: nexusColors.frost
                }, children: isConnected ?
                    `✅ З'єднання з OpenSearch активне (${dashboardUrl})` :
                    `❌ Немає з'єднання з OpenSearch` }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                border: `1px solid ${nexusColors.sapphire}40`,
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center'
                            }, children: [_jsx(Typography, { variant: "h5", sx: { color: nexusColors.frost, mb: 2 }, children: "\uD83D\uDE80 \u0428\u0432\u0438\u0434\u043A\u0438\u0439 \u0434\u043E\u0441\u0442\u0443\u043F" }), _jsx(Typography, { variant: "body1", sx: { color: nexusColors.nebula, mb: 3 }, children: "\u0412\u0456\u0434\u043A\u0440\u0438\u0442\u0438 \u043F\u043E\u0432\u043D\u043E\u0444\u0443\u043D\u043A\u0446\u0456\u043E\u043D\u0430\u043B\u044C\u043D\u0443 OpenSearch Dashboard \u0434\u043B\u044F \u0433\u043B\u0438\u0431\u043E\u043A\u043E\u0433\u043E \u0430\u043D\u0430\u043B\u0456\u0437\u0443 \u0434\u0430\u043D\u0438\u0445" }), _jsx(Button, { variant: "contained", size: "large", startIcon: _jsx(OpenInNew, {}), onClick: handleOpenDashboard, sx: {
                                        background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                                        fontSize: '1.1rem',
                                        py: 1.5,
                                        px: 4,
                                        '&:hover': {
                                            background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`
                                        }
                                    }, children: "\u0412\u0456\u0434\u043A\u0440\u0438\u0442\u0438 OpenSearch Dashboard" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow, display: 'block', mt: 2 }, children: dashboardUrl })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                border: `1px solid ${nexusColors.emerald}40`,
                                borderRadius: 2,
                                p: 2
                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\u26A1 \u0428\u0432\u0438\u0434\u043A\u0456 \u043F\u043E\u0448\u0443\u043A\u0438" }), searches.map((search) => (_jsxs(Box, { sx: { mb: 2, p: 1.5, background: `${nexusColors.obsidian}80`, borderRadius: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 600 }, children: search.name }), _jsx(Chip, { size: "small", label: `${search.results} результатів`, sx: {
                                                        backgroundColor: `${nexusColors.emerald}20`,
                                                        color: nexusColors.emerald,
                                                        fontSize: '0.7rem'
                                                    } })] }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block', mb: 1 }, children: ["Query: ", search.query] }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: ["\u041E\u0441\u0442\u0430\u043D\u043D\u0454 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F: ", search.lastUsed] })] }, search.id))), _jsx(Button, { variant: "outlined", fullWidth: true, startIcon: _jsx(Search, {}), sx: {
                                        mt: 1,
                                        borderColor: nexusColors.emerald,
                                        color: nexusColors.emerald,
                                        '&:hover': {
                                            borderColor: nexusColors.sapphire,
                                            color: nexusColors.sapphire
                                        }
                                    }, children: "\u041D\u043E\u0432\u0438\u0439 \u043F\u043E\u0448\u0443\u043A" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                border: `1px solid ${nexusColors.amethyst}40`,
                                borderRadius: 2,
                                p: 2
                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\uD83D\uDCDA \u0421\u0442\u0430\u043D \u0456\u043D\u0434\u0435\u043A\u0441\u0456\u0432" }), _jsx(Grid, { container: true, spacing: 2, children: indices.map((index) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Box, { sx: {
                                                p: 2,
                                                background: `linear-gradient(135deg, ${nexusColors.obsidian}CC, ${nexusColors.darkMatter}80)`,
                                                border: `1px solid ${getStatusColor(index.status)}40`,
                                                borderRadius: 1,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 4px 15px ${getStatusColor(index.status)}30`
                                                }
                                            }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { sx: { fontSize: '1rem', mr: 1 }, children: getStatusEmoji(index.status) }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 600 }, children: index.name })] }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block' }, children: ["\uD83D\uDCC4 \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0456\u0432: ", index.docs.toLocaleString()] }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block' }, children: ["\uD83D\uDCBE \u0420\u043E\u0437\u043C\u0456\u0440: ", index.size] }), _jsx(Chip, { size: "small", label: index.status, sx: {
                                                        mt: 1,
                                                        backgroundColor: `${getStatusColor(index.status)}20`,
                                                        color: getStatusColor(index.status),
                                                        fontSize: '0.7rem'
                                                    } })] }) }, index.name))) })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(Analytics, {}), sx: {
                                        borderColor: nexusColors.sapphire,
                                        color: nexusColors.sapphire,
                                        '&:hover': {
                                            borderColor: nexusColors.emerald,
                                            color: nexusColors.emerald
                                        }
                                    }, children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u0432\u0456\u0437\u0443\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u044E" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(FilterList, {}), sx: {
                                        borderColor: nexusColors.amethyst,
                                        color: nexusColors.amethyst,
                                        '&:hover': {
                                            borderColor: nexusColors.sapphire,
                                            color: nexusColors.sapphire
                                        }
                                    }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u0442\u0438 \u0444\u0456\u043B\u044C\u0442\u0440\u0438" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(Refresh, {}), sx: {
                                        borderColor: nexusColors.emerald,
                                        color: nexusColors.emerald,
                                        '&:hover': {
                                            borderColor: nexusColors.warning,
                                            color: nexusColors.warning
                                        }
                                    }, children: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438 \u0434\u0430\u043D\u0456" })] }) })] })] }));
};
export default AnalyticsModule;
