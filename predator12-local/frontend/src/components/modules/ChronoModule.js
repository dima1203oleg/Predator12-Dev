import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, Grid, Card, Chip } from '@mui/material';
import { Timeline, TimelineItem, TimelineContent, TimelineSeparator, TimelineDot, TimelineConnector } from '@mui/lab';
import { TrendingUp, Warning, CheckCircle } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { nexusColors } from '../../theme/nexusTheme';
const ChronoModule = () => {
    const [timelineData, setTimelineData] = useState([
        { time: '00:00', imports: 120, exports: 95, anomalies: 2 },
        { time: '04:00', imports: 150, exports: 110, anomalies: 1 },
        { time: '08:00', imports: 280, exports: 190, anomalies: 0 },
        { time: '12:00', imports: 340, exports: 250, anomalies: 3 },
        { time: '16:00', imports: 290, exports: 220, anomalies: 1 },
        { time: '20:00', imports: 180, exports: 140, anomalies: 0 },
    ]);
    const [events] = useState([
        {
            id: '1',
            timestamp: '2025-09-27 14:30',
            title: 'Аномалія в імпорті',
            type: 'anomaly',
            value: 350,
            description: 'Різкий стрибок імпорту товарів з ЄС на 45%'
        },
        {
            id: '2',
            timestamp: '2025-09-27 12:15',
            title: 'Тренд зростання',
            type: 'trend',
            value: 280,
            description: 'Стабільне зростання експорту протягом 6 годин'
        },
        {
            id: '3',
            timestamp: '2025-09-27 09:45',
            title: 'Нормалізація показників',
            type: 'normal',
            value: 200,
            description: 'Повернення до нормальних значень після ранкового сплеску'
        },
        {
            id: '4',
            timestamp: '2025-09-27 06:20',
            title: 'Попередження системи',
            type: 'warning',
            value: 150,
            description: 'Виявлено підозрілі патерни в декларації товарів'
        }
    ]);
    const getEventIcon = (type) => {
        switch (type) {
            case 'anomaly': return _jsx(Warning, { sx: { color: nexusColors.error } });
            case 'trend': return _jsx(TrendingUp, { sx: { color: nexusColors.success } });
            case 'warning': return _jsx(Warning, { sx: { color: nexusColors.warning } });
            default: return _jsx(CheckCircle, { sx: { color: nexusColors.emerald } });
        }
    };
    const getEventColor = (type) => {
        switch (type) {
            case 'anomaly': return nexusColors.error;
            case 'trend': return nexusColors.success;
            case 'warning': return nexusColors.warning;
            default: return nexusColors.emerald;
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h4", sx: {
                    mb: 3,
                    color: nexusColors.frost,
                    textAlign: 'center',
                    background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }, children: "\uD83D\uDD50 \u0425\u0440\u043E\u043D\u043E-\u0410\u043D\u0430\u043B\u0456\u0437 4D" }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsxs(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                border: `1px solid ${nexusColors.amethyst}40`,
                                borderRadius: 2,
                                p: 2
                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\uD83D\uDCC8 \u0422\u0440\u0435\u043D\u0434\u0438 \u0456\u043C\u043F\u043E\u0440\u0442\u0443/\u0435\u043A\u0441\u043F\u043E\u0440\u0442\u0443 (24 \u0433\u043E\u0434\u0438\u043D\u0438)" }), _jsx(Box, { sx: { width: '100%', height: 300 }, children: _jsx(LineChart, { width: 800, height: 300, series: [
                                            {
                                                data: timelineData.map(item => item.imports),
                                                label: 'Імпорт',
                                                color: nexusColors.emerald
                                            },
                                            {
                                                data: timelineData.map(item => item.exports),
                                                label: 'Експорт',
                                                color: nexusColors.sapphire
                                            }
                                        ], xAxis: [{
                                                scaleType: 'point',
                                                data: timelineData.map(item => item.time)
                                            }], sx: {
                                            '& .MuiChartsAxis-line': {
                                                stroke: nexusColors.nebula
                                            },
                                            '& .MuiChartsAxis-tick': {
                                                stroke: nexusColors.nebula
                                            },
                                            '& .MuiChartsAxis-tickLabel': {
                                                fill: nexusColors.nebula
                                            }
                                        } }) })] }) }), _jsx(Grid, { item: true, xs: 12, lg: 4, children: _jsxs(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                                border: `1px solid ${nexusColors.amethyst}40`,
                                borderRadius: 2,
                                p: 2,
                                height: '360px',
                                overflow: 'auto'
                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 2 }, children: "\uD83C\uDFAF \u0425\u0440\u043E\u043D\u043E\u043B\u043E\u0433\u0456\u044F \u043F\u043E\u0434\u0456\u0439" }), _jsx(Timeline, { sx: { p: 0 }, children: events.map((event, index) => (_jsxs(TimelineItem, { children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { sx: { bgcolor: 'transparent', p: 0 }, children: getEventIcon(event.type) }), index < events.length - 1 && _jsx(TimelineConnector, { sx: { bgcolor: nexusColors.shadow } })] }), _jsx(TimelineContent, { children: _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, fontWeight: 600 }, children: event.title }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: event.timestamp }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block', mt: 0.5 }, children: event.description }), _jsx(Chip, { size: "small", label: `Значення: ${event.value}`, sx: {
                                                                mt: 1,
                                                                backgroundColor: `${getEventColor(event.type)}20`,
                                                                color: getEventColor(event.type),
                                                                fontSize: '0.7rem'
                                                            } })] }) })] }, event.id))) })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { sx: { background: `linear-gradient(45deg, ${nexusColors.success}20, ${nexusColors.emerald}10)`, border: `1px solid ${nexusColors.success}40`, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.success }, children: "\uD83D\uDCC8 \u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0438\u0439 \u0442\u0440\u0435\u043D\u0434" }), _jsx(Typography, { variant: "h4", sx: { color: nexusColors.frost }, children: "+12.5%" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "\u0417\u0430 \u043E\u0441\u0442\u0430\u043D\u043D\u0456 24 \u0433\u043E\u0434\u0438\u043D\u0438" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { sx: { background: `linear-gradient(45deg, ${nexusColors.error}20, ${nexusColors.crimson}10)`, border: `1px solid ${nexusColors.error}40`, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.error }, children: "\u26A0\uFE0F \u0410\u043D\u043E\u043C\u0430\u043B\u0456\u0457" }), _jsx(Typography, { variant: "h4", sx: { color: nexusColors.frost }, children: "7" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "\u0412\u0438\u044F\u0432\u043B\u0435\u043D\u043E \u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { sx: { background: `linear-gradient(45deg, ${nexusColors.sapphire}20, ${nexusColors.amethyst}10)`, border: `1px solid ${nexusColors.sapphire}40`, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.sapphire }, children: "\uD83D\uDD04 \u0410\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" }), _jsx(Typography, { variant: "h4", sx: { color: nexusColors.frost }, children: "1.2K" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0456\u0439/\u0433\u043E\u0434\u0438\u043D\u0443" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Card, { sx: { background: `linear-gradient(45deg, ${nexusColors.warning}20, ${nexusColors.emerald}10)`, border: `1px solid ${nexusColors.warning}40`, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.warning }, children: "\uD83C\uDFAF \u0422\u043E\u0447\u043D\u0456\u0441\u0442\u044C" }), _jsx(Typography, { variant: "h4", sx: { color: nexusColors.frost }, children: "94.8%" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "\u041F\u0440\u043E\u0433\u043D\u043E\u0437\u0443\u0432\u0430\u043D\u043D\u044F" })] }) })] }) })] })] }));
};
export default ChronoModule;
