import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, Chip, Button, Stack } from '@mui/material';
import { DataObject, PlayArrow, Pause, Settings, Refresh } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
const ETLModule = () => {
    const [pipelines] = useState([
        {
            id: 'customs-data',
            name: 'Customs Data Ingestion',
            status: 'running',
            progress: 75,
            lastRun: '2 хв тому',
            recordsProcessed: 15420
        },
        {
            id: 'osint-crawler',
            name: 'OSINT Social Crawler',
            status: 'running',
            progress: 45,
            lastRun: '5 хв тому',
            recordsProcessed: 8930
        },
        {
            id: 'telegram-parser',
            name: 'Telegram Channel Parser',
            status: 'stopped',
            progress: 0,
            lastRun: '30 хв тому',
            recordsProcessed: 0
        },
        {
            id: 'financial-sync',
            name: 'Financial Data Sync',
            status: 'error',
            progress: 23,
            lastRun: '1 год тому',
            recordsProcessed: 3450
        }
    ]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return nexusColors.success;
            case 'stopped': return nexusColors.shadow;
            case 'error': return nexusColors.error;
            case 'pending': return nexusColors.warning;
            default: return nexusColors.frost;
        }
    };
    const getStatusEmoji = (status) => {
        switch (status) {
            case 'running': return '▶️';
            case 'stopped': return '⏸️';
            case 'error': return '❌';
            case 'pending': return '⏳';
            default: return '❔';
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h4", sx: {
                    mb: 3,
                    color: nexusColors.frost,
                    textAlign: 'center',
                    background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }, children: "\uD83C\uDFED \u0424\u0430\u0431\u0440\u0438\u043A\u0430 \u0414\u0430\u043D\u0438\u0445 ETL" }), _jsx(Grid, { container: true, spacing: 3, children: pipelines.map((pipeline) => (_jsx(Grid, { item: true, xs: 12, md: 6, lg: 4, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                            border: `1px solid ${getStatusColor(pipeline.status)}40`,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 25px ${getStatusColor(pipeline.status)}30`
                            }
                        }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(DataObject, { sx: { color: nexusColors.sapphire, mr: 1 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, flexGrow: 1 }, children: pipeline.name }), _jsx(Typography, { sx: { fontSize: '1.2rem' }, children: getStatusEmoji(pipeline.status) })] }), _jsx(Chip, { size: "small", label: pipeline.status, sx: {
                                        backgroundColor: `${getStatusColor(pipeline.status)}20`,
                                        color: getStatusColor(pipeline.status),
                                        mb: 2
                                    } }), pipeline.status === 'running' && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: ["\u041F\u0440\u043E\u0433\u0440\u0435\u0441: ", pipeline.progress, "%"] }), _jsx(LinearProgress, { variant: "determinate", value: pipeline.progress, sx: {
                                                bgcolor: `${nexusColors.shadow}40`,
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: nexusColors.emerald
                                                }
                                            } })] })), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\uD83D\uDCCA \u0417\u0430\u043F\u0438\u0441\u0456\u0432 \u043E\u0431\u0440\u043E\u0431\u043B\u0435\u043D\u043E: ", pipeline.recordsProcessed.toLocaleString()] }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow, display: 'block', mb: 2 }, children: ["\uD83D\uDD50 \u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0437\u0430\u043F\u0443\u0441\u043A: ", pipeline.lastRun] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { size: "small", variant: "contained", startIcon: pipeline.status === 'running' ? _jsx(Pause, {}) : _jsx(PlayArrow, {}), sx: {
                                                background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                                                '&:hover': {
                                                    background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`
                                                }
                                            }, children: pipeline.status === 'running' ? 'Пауза' : 'Запуск' }), _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(Refresh, {}), sx: {
                                                borderColor: nexusColors.emerald,
                                                color: nexusColors.emerald,
                                                '&:hover': {
                                                    borderColor: nexusColors.sapphire,
                                                    color: nexusColors.sapphire
                                                }
                                            }, children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A" }), _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(Settings, {}), sx: {
                                                borderColor: nexusColors.amethyst,
                                                color: nexusColors.amethyst,
                                                '&:hover': {
                                                    borderColor: nexusColors.sapphire,
                                                    color: nexusColors.sapphire
                                                }
                                            }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" })] })] }) }) }, pipeline.id))) }), _jsx(Box, { sx: { mt: 4, textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: ["\u0410\u043A\u0442\u0438\u0432\u043D\u0456: ", pipelines.filter(p => p.status === 'running').length, " | \u0417\u0443\u043F\u0438\u043D\u0435\u043D\u0456: ", pipelines.filter(p => p.status === 'stopped').length, " | \u041F\u043E\u043C\u0438\u043B\u043A\u0438: ", pipelines.filter(p => p.status === 'error').length] }) })] }));
};
export default ETLModule;
