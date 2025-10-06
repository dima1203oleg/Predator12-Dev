import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, FormControl, InputLabel, Select, MenuItem, TextField, Chip, Alert, IconButton, Tooltip, Switch, FormControlLabel, LinearProgress } from '@mui/material';
import { Search as SearchIcon, Dashboard as DashboardIcon, Refresh as RefreshIcon, Fullscreen as FullscreenIcon, Settings as SettingsIcon, FilterList as FilterIcon, BarChart as ChartIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const OpenSearchModule = () => {
    const [selectedDashboard, setSelectedDashboard] = useState('');
    const [searchQuery, setSearchQuery] = useState({
        index: 'logs-*',
        query: '*',
        timeRange: {
            from: 'now-1h',
            to: 'now'
        },
        filters: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [ssoEnabled, setSsoEnabled] = useState(true);
    const [embedMode, setEmbedMode] = useState(true);
    const [customTheme, setCustomTheme] = useState(true);
    // Sample dashboards
    const dashboards = [
        {
            id: 'security-overview',
            name: 'Security Overview',
            description: 'Comprehensive security monitoring dashboard',
            category: 'Security',
            lastModified: new Date('2024-01-16T10:30:00'),
            isDefault: true
        },
        {
            id: 'system-performance',
            name: 'System Performance',
            description: 'Infrastructure and application performance metrics',
            category: 'Performance',
            lastModified: new Date('2024-01-16T09:15:00'),
            isDefault: false
        },
        {
            id: 'user-analytics',
            name: 'User Analytics',
            description: 'User behavior and engagement analytics',
            category: 'Analytics',
            lastModified: new Date('2024-01-15T16:45:00'),
            isDefault: false
        },
        {
            id: 'network-monitoring',
            name: 'Network Monitoring',
            description: 'Network traffic and connectivity monitoring',
            category: 'Network',
            lastModified: new Date('2024-01-15T14:20:00'),
            isDefault: false
        },
        {
            id: 'application-logs',
            name: 'Application Logs',
            description: 'Centralized application logging and error tracking',
            category: 'Logs',
            lastModified: new Date('2024-01-16T08:00:00'),
            isDefault: false
        }
    ];
    const indices = [
        'logs-*',
        'metrics-*',
        'security-*',
        'network-*',
        'application-*'
    ];
    const timeRanges = [
        { label: 'Last 15 minutes', value: 'now-15m' },
        { label: 'Last 1 hour', value: 'now-1h' },
        { label: 'Last 4 hours', value: 'now-4h' },
        { label: 'Last 24 hours', value: 'now-24h' },
        { label: 'Last 7 days', value: 'now-7d' },
        { label: 'Last 30 days', value: 'now-30d' }
    ];
    useEffect(() => {
        // Set default dashboard
        if (dashboards.length > 0) {
            const defaultDashboard = dashboards.find(d => d.isDefault) || dashboards[0];
            setSelectedDashboard(defaultDashboard.id);
        }
    }, []);
    const handleDashboardChange = (dashboardId) => {
        setIsLoading(true);
        setSelectedDashboard(dashboardId);
        // Simulate loading
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };
    const handleSearch = () => {
        setIsLoading(true);
        console.log('Executing search:', searchQuery);
        // Simulate search execution
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };
    const addFilter = () => {
        setSearchQuery(prev => ({
            ...prev,
            filters: [
                ...prev.filters,
                { field: 'level', operator: 'is', value: 'ERROR' }
            ]
        }));
    };
    const removeFilter = (index) => {
        setSearchQuery(prev => ({
            ...prev,
            filters: prev.filters.filter((_, i) => i !== index)
        }));
    };
    const generateOpenSearchUrl = () => {
        // In production, this would generate the actual OpenSearch Dashboard URL
        const baseUrl = 'http://localhost:5601'; // OpenSearch Dashboard URL
        const dashboard = dashboards.find(d => d.id === selectedDashboard);
        if (dashboard) {
            return `${baseUrl}/app/dashboards#/view/${dashboard.id}`;
        }
        return `${baseUrl}/app/home`;
    };
    const selectedDashboardData = dashboards.find(d => d.id === selectedDashboard);
    return (_jsx(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Typography, { variant: "h4", sx: {
                        mb: 3,
                        color: nexusColors.info,
                        fontFamily: 'Orbitron',
                        textShadow: `0 0 10px ${nexusColors.info}`
                    }, children: [_jsx(SearchIcon, { sx: { mr: 2, verticalAlign: 'middle' } }), "\u0410\u043D\u0430\u043B\u0456\u0442\u0438\u0447\u043D\u0430 \u041F\u0430\u043B\u0443\u0431\u0430"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, xs: 12, md: 4, children: [_jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.emerald }, children: [_jsx(DashboardIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u041F\u0430\u043D\u0435\u043B\u044C \u0423\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F"] }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0414\u0430\u0448\u0431\u043E\u0440\u0434" }), _jsx(Select, { value: selectedDashboard, onChange: (e) => handleDashboardChange(e.target.value), sx: { color: nexusColors.frost }, children: dashboards.map((dashboard) => (_jsx(MenuItem, { value: dashboard.id, children: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: dashboard.name }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: dashboard.category })] }) }, dashboard.id))) })] }), selectedDashboardData && (_jsxs(Box, { sx: { mb: 2, p: 2, border: `1px solid ${nexusColors.quantum}`, borderRadius: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, mb: 1 }, children: selectedDashboardData.description }), _jsx(Chip, { label: selectedDashboardData.category, size: "small", sx: {
                                                            backgroundColor: nexusColors.sapphire,
                                                            color: nexusColors.frost,
                                                            mr: 1
                                                        } }), selectedDashboardData.isDefault && (_jsx(Chip, { label: "Default", size: "small", sx: {
                                                            backgroundColor: nexusColors.emerald,
                                                            color: nexusColors.frost
                                                        } })), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow, display: 'block', mt: 1 }, children: ["\u041E\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ", selectedDashboardData.lastModified.toLocaleString()] })] })), _jsxs(Box, { sx: { display: 'flex', gap: 1, mb: 2 }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: () => handleDashboardChange(selectedDashboard), size: "small", children: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438" }), _jsx(Tooltip, { title: "\u041F\u043E\u0432\u043D\u043E\u0435\u043A\u0440\u0430\u043D\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, children: _jsx(FullscreenIcon, {}) }) }), _jsx(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.warning }, children: _jsx(SettingsIcon, {}) }) })] }), _jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.amethyst, mb: 1 }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0406\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0456\u0457" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: ssoEnabled, onChange: (e) => setSsoEnabled(e.target.checked), sx: {
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: nexusColors.emerald,
                                                        },
                                                    } }), label: "SSO Authentication", sx: { color: nexusColors.nebula, display: 'block', mb: 1 } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: embedMode, onChange: (e) => setEmbedMode(e.target.checked), sx: {
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: nexusColors.emerald,
                                                        },
                                                    } }), label: "Embedded Mode", sx: { color: nexusColors.nebula, display: 'block', mb: 1 } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: customTheme, onChange: (e) => setCustomTheme(e.target.checked), sx: {
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: nexusColors.emerald,
                                                        },
                                                    } }), label: "Nexus Theme", sx: { color: nexusColors.nebula, display: 'block' } })] }) }), _jsx(Card, { className: "holographic", sx: { mt: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.sapphire }, children: [_jsx(FilterIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u0428\u0432\u0438\u0434\u043A\u0438\u0439 \u041F\u043E\u0448\u0443\u043A"] }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0406\u043D\u0434\u0435\u043A\u0441" }), _jsx(Select, { value: searchQuery.index, onChange: (e) => setSearchQuery(prev => ({ ...prev, index: e.target.value })), sx: { color: nexusColors.frost }, size: "small", children: indices.map((index) => (_jsx(MenuItem, { value: index, children: index }, index))) })] }), _jsx(TextField, { fullWidth: true, label: "Query", value: searchQuery.query, onChange: (e) => setSearchQuery(prev => ({ ...prev, query: e.target.value })), placeholder: "Enter search query...", size: "small", sx: { mb: 2 } }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0427\u0430\u0441\u043E\u0432\u0438\u0439 \u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D" }), _jsx(Select, { value: searchQuery.timeRange.from, onChange: (e) => setSearchQuery(prev => ({
                                                            ...prev,
                                                            timeRange: { ...prev.timeRange, from: e.target.value }
                                                        })), sx: { color: nexusColors.frost }, size: "small", children: timeRanges.map((range) => (_jsx(MenuItem, { value: range.value, children: range.label }, range.value))) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "\u0424\u0456\u043B\u044C\u0442\u0440\u0438" }), _jsx(Button, { size: "small", onClick: addFilter, sx: { color: nexusColors.emerald }, children: "\u0414\u043E\u0434\u0430\u0442\u0438" })] }), searchQuery.filters.map((filter, index) => (_jsx(Chip, { label: `${filter.field} ${filter.operator} ${filter.value}`, onDelete: () => removeFilter(index), size: "small", sx: {
                                                            backgroundColor: nexusColors.amethyst,
                                                            color: nexusColors.frost,
                                                            mr: 1,
                                                            mb: 1
                                                        } }, index)))] }), _jsx(Button, { variant: "contained", startIcon: _jsx(SearchIcon, {}), onClick: handleSearch, disabled: isLoading, fullWidth: true, sx: {
                                                    backgroundColor: nexusColors.sapphire,
                                                    '&:hover': { backgroundColor: nexusColors.sapphire + 'CC' }
                                                }, children: "\u0412\u0438\u043A\u043E\u043D\u0430\u0442\u0438 \u041F\u043E\u0448\u0443\u043A" })] }) })] }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: [_jsx(ChartIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "OpenSearch Dashboard"] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [ssoEnabled && (_jsx(Chip, { label: "SSO Active", size: "small", sx: {
                                                                backgroundColor: nexusColors.emerald,
                                                                color: nexusColors.frost
                                                            } })), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: generateOpenSearchUrl() })] })] }), isLoading && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(LinearProgress, { sx: {
                                                        backgroundColor: nexusColors.darkMatter,
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: nexusColors.sapphire,
                                                        },
                                                    } }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0434\u0430\u0448\u0431\u043E\u0440\u0434\u0443..." })] })), embedMode ? (_jsxs(Box, { sx: {
                                                width: '100%',
                                                height: 600,
                                                border: `2px solid ${nexusColors.quantum}`,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                background: customTheme
                                                    ? `linear-gradient(135deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                                                    : '#ffffff'
                                            }, children: [_jsxs(Box, { sx: {
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        p: 2
                                                    }, children: [_jsxs(Box, { sx: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mb: 2,
                                                                pb: 1,
                                                                borderBottom: `1px solid ${nexusColors.quantum}`
                                                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: customTheme ? nexusColors.frost : '#333' }, children: selectedDashboardData?.name || 'Dashboard' }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Chip, { label: "Live", size: "small", color: "success" }), _jsx(Chip, { label: searchQuery.timeRange.from, size: "small" })] })] }), _jsxs(Grid, { container: true, spacing: 2, sx: { flex: 1 }, children: [_jsx(Grid, { item: true, xs: 6, children: _jsxs(Box, { sx: {
                                                                            height: 200,
                                                                            border: `1px solid ${nexusColors.quantum}`,
                                                                            borderRadius: 1,
                                                                            p: 2,
                                                                            background: customTheme ? nexusColors.darkMatter + '40' : '#f5f5f5'
                                                                        }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: customTheme ? nexusColors.frost : '#333', mb: 1 }, children: "Events Over Time" }), _jsx(Box, { sx: {
                                                                                    height: '80%',
                                                                                    display: 'flex',
                                                                                    alignItems: 'end',
                                                                                    justifyContent: 'space-around',
                                                                                    gap: 1
                                                                                }, children: [40, 65, 30, 80, 45, 70, 55].map((height, i) => (_jsx(Box, { sx: {
                                                                                        width: 20,
                                                                                        height: `${height}%`,
                                                                                        backgroundColor: nexusColors.sapphire,
                                                                                        borderRadius: '2px 2px 0 0'
                                                                                    } }, i))) })] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(Box, { sx: {
                                                                            height: 200,
                                                                            border: `1px solid ${nexusColors.quantum}`,
                                                                            borderRadius: 1,
                                                                            p: 2,
                                                                            background: customTheme ? nexusColors.darkMatter + '40' : '#f5f5f5'
                                                                        }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: customTheme ? nexusColors.frost : '#333', mb: 1 }, children: "Top Sources" }), _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1 }, children: ['application.log', 'security.log', 'system.log', 'network.log'].map((source, i) => (_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "body2", sx: { color: customTheme ? nexusColors.nebula : '#666' }, children: source }), _jsx(Typography, { variant: "body2", sx: { color: customTheme ? nexusColors.frost : '#333' }, children: Math.floor(Math.random() * 1000) })] }, source))) })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Box, { sx: {
                                                                            height: 250,
                                                                            border: `1px solid ${nexusColors.quantum}`,
                                                                            borderRadius: 1,
                                                                            p: 2,
                                                                            background: customTheme ? nexusColors.darkMatter + '40' : '#f5f5f5'
                                                                        }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: customTheme ? nexusColors.frost : '#333', mb: 1 }, children: "Recent Events" }), _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1, height: '90%', overflow: 'auto' }, children: Array.from({ length: 8 }, (_, i) => (_jsxs(Box, { sx: {
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        p: 1,
                                                                                        border: `1px solid ${nexusColors.quantum}40`,
                                                                                        borderRadius: 1
                                                                                    }, children: [_jsx(Typography, { variant: "body2", sx: { color: customTheme ? nexusColors.nebula : '#666' }, children: new Date(Date.now() - i * 60000).toLocaleTimeString() }), _jsxs(Typography, { variant: "body2", sx: { color: customTheme ? nexusColors.frost : '#333' }, children: ["Event ", i + 1, " - Sample log entry"] }), _jsx(Chip, { label: ['INFO', 'WARN', 'ERROR'][i % 3], size: "small", sx: {
                                                                                                backgroundColor: ['INFO', 'WARN', 'ERROR'][i % 3] === 'ERROR'
                                                                                                    ? nexusColors.crimson
                                                                                                    : ['INFO', 'WARN', 'ERROR'][i % 3] === 'WARN'
                                                                                                        ? nexusColors.warning
                                                                                                        : nexusColors.emerald,
                                                                                                color: nexusColors.frost
                                                                                            } })] }, i))) })] }) })] })] }), _jsx(Box, { sx: {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'rgba(0,0,0,0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        opacity: isLoading ? 1 : 0,
                                                        transition: 'opacity 0.3s ease',
                                                        pointerEvents: isLoading ? 'auto' : 'none'
                                                    }, children: _jsxs(Box, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.emerald, mb: 1 }, children: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0456\u0437\u0430\u0446\u0456\u044F \u0437 OpenSearch..." }), _jsx(LinearProgress, { sx: {
                                                                    width: 200,
                                                                    backgroundColor: nexusColors.darkMatter,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: nexusColors.emerald,
                                                                    },
                                                                } })] }) })] })) : (_jsxs(Alert, { severity: "info", sx: { mb: 2 }, children: ["Embedded mode disabled.", _jsx(Button, { href: generateOpenSearchUrl(), target: "_blank", sx: { ml: 1, color: nexusColors.sapphire }, children: "Open in new tab" })] }))] }) }) })] })] }) }));
};
