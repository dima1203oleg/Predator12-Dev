import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
// Мінімальна тема
const minimalTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#000000',
            paper: '#111111'
        },
        text: {
            primary: '#E8F4FD'
        },
        primary: {
            main: '#38BDF8'
        }
    }
});
function MinimalApp() {
    const [currentView, setCurrentView] = useState('main');
    console.log('🟡 MinimalApp завантажено');
    return (_jsxs(ThemeProvider, { theme: minimalTheme, children: [_jsx(CssBaseline, {}), _jsxs(Box, { sx: {
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
                    color: '#E8F4FD',
                    display: 'flex',
                    flexDirection: 'column'
                }, children: [_jsx(AppBar, { position: "static", sx: { background: 'rgba(0,0,0,0.8)' }, children: _jsxs(Toolbar, { children: [_jsx(Typography, { variant: "h6", sx: { flexGrow: 1, color: '#38BDF8' }, children: "\uD83D\uDE80 PREDATOR11 - Minimal Interface" }), _jsx(Button, { color: "primary", variant: "outlined", onClick: () => setCurrentView(currentView === 'main' ? 'test' : 'main'), children: "\u041F\u0435\u0440\u0435\u043C\u043A\u043D\u0443\u0442\u0438 \u0432\u0438\u0433\u043B\u044F\u0434" })] }) }), _jsx(Box, { sx: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 3
                        }, children: currentView === 'main' ? (_jsxs(Box, { sx: { textAlign: 'center', maxWidth: 800 }, children: [_jsx(Typography, { variant: "h2", gutterBottom: true, sx: {
                                        background: 'linear-gradient(45deg, #38BDF8, #06B6D4)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginBottom: 3
                                    }, children: "Predator Analytics Nexus" }), _jsx(Typography, { variant: "h5", gutterBottom: true, sx: { color: '#94A3B8', marginBottom: 4 }, children: "Multi-Agent System v1.0" }), _jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }, children: [_jsx(Button, { variant: "contained", size: "large", onClick: () => setCurrentView('agents'), sx: {
                                                background: 'linear-gradient(45deg, #38BDF8, #06B6D4)',
                                                '&:hover': { background: 'linear-gradient(45deg, #0EA5E9, #0891B2)' }
                                            }, children: "\uD83E\uDD16 MAS \u0410\u0433\u0435\u043D\u0442\u0438" }), _jsx(Button, { variant: "outlined", size: "large", onClick: () => setCurrentView('dashboard'), sx: { borderColor: '#38BDF8', color: '#38BDF8' }, children: "\uD83D\uDCCA Dashboard" }), _jsx(Button, { variant: "outlined", size: "large", onClick: () => setCurrentView('guide'), sx: { borderColor: '#06B6D4', color: '#06B6D4' }, children: "\uD83C\uDFAF 3D Guide" })] })] })) : currentView === 'agents' ? (_jsxs(Box, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { color: '#38BDF8' }, children: "\uD83E\uDD16 MAS Agent System" }), _jsx(Box, { sx: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                        gap: 2,
                                        marginTop: 3,
                                        maxWidth: 800
                                    }, children: ['AutoHeal', 'SelfImprovement', 'SelfDiagnosis', 'ChiefOrchestrator'].map(agent => (_jsxs(Box, { sx: {
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            border: '1px solid rgba(56, 189, 248, 0.3)',
                                            borderRadius: 2,
                                            padding: 2,
                                            '&:hover': { background: 'rgba(56, 189, 248, 0.2)' }
                                        }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#38BDF8', marginBottom: 1 }, children: agent }), _jsx(Typography, { variant: "body2", sx: { color: '#94A3B8' }, children: "\u2705 \u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0439 \u2022 \uD83D\uDD0B 100%" })] }, agent))) }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentView('main'), sx: { marginTop: 3, borderColor: '#94A3B8', color: '#94A3B8' }, children: "\u2190 \u041F\u043E\u0432\u0435\u0440\u043D\u0443\u0442\u0438\u0441\u044F" })] })) : (_jsxs(Box, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { color: '#06B6D4' }, children: "\uD83D\uDCCA System Dashboard" }), _jsx(Box, { sx: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: 2,
                                        marginTop: 3,
                                        maxWidth: 600
                                    }, children: [
                                        { title: 'CPU', value: '45%', color: '#10B981' },
                                        { title: 'Memory', value: '67%', color: '#F59E0B' },
                                        { title: 'Active Agents', value: '24/24', color: '#38BDF8' },
                                        { title: 'Models', value: '48 Free', color: '#06B6D4' }
                                    ].map(metric => (_jsxs(Box, { sx: {
                                            background: 'rgba(0,0,0,0.5)',
                                            border: `1px solid ${metric.color}`,
                                            borderRadius: 2,
                                            padding: 2
                                        }, children: [_jsx(Typography, { variant: "body2", sx: { color: '#94A3B8' }, children: metric.title }), _jsx(Typography, { variant: "h5", sx: { color: metric.color }, children: metric.value })] }, metric.title))) }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentView('main'), sx: { marginTop: 3, borderColor: '#94A3B8', color: '#94A3B8' }, children: "\u2190 \u041F\u043E\u0432\u0435\u0440\u043D\u0443\u0442\u0438\u0441\u044F" })] })) }), _jsx(Box, { sx: {
                            textAlign: 'center',
                            padding: 2,
                            borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                        }, children: _jsxs(Typography, { variant: "caption", sx: { color: '#64748B' }, children: ["Predator11 \u2022 Minimal Interface \u2022 ", new Date().toLocaleTimeString()] }) })] })] }));
}
export default MinimalApp;
