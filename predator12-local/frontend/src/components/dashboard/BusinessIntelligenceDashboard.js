import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Tabs, Tab, Alert, Chip, List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton } from '@mui/material';
import { AccountBalance as BankIcon, Business as BusinessIcon, TrendingUp as TrendIcon, Security as SecurityIcon, Warning as WarningIcon, CheckCircle as SuccessIcon, Error as ErrorIcon, Info as InfoIcon, Download as ExportIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
const BusinessIntelligenceDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [alerts, setAlerts] = useState([]);
    const [investigations, setInvestigations] = useState([]);
    const [marketData, setMarketData] = useState([]);
    // Симуляція даних
    useEffect(() => {
        const timer = setInterval(() => {
            // Генерація нових алертів
            const newAlerts = generateRandomAlerts();
            setAlerts(prev => [...newAlerts, ...prev.slice(0, 19)]);
            // Оновлення ринкових даних
            const newMarketData = generateMarketData();
            setMarketData(prev => [...prev.slice(-29), newMarketData]);
            // Оновлення розслідувань
            if (Math.random() < 0.2) {
                const newInvestigation = generateInvestigation();
                setInvestigations(prev => [newInvestigation, ...prev.slice(0, 9)]);
            }
        }, 3000);
        return () => clearInterval(timer);
    }, []);
    const generateRandomAlerts = () => {
        const alertTypes = [
            {
                type: 'suspicious_transaction',
                message: 'Підозріла транзакція $1.2M через криптовалюту',
                severity: 'high',
                category: 'banking',
                confidence: 92.5
            },
            {
                type: 'procurement_fraud',
                message: 'Виявлено завищення цін у держзакупівлі на 280%',
                severity: 'critical',
                category: 'government',
                confidence: 89.1
            },
            {
                type: 'market_manipulation',
                message: 'Можлива маніпуляція акціями ENERGY сектору',
                severity: 'medium',
                category: 'market',
                confidence: 76.3
            },
            {
                type: 'tax_evasion',
                message: 'Схема мінімізації податків через офшори',
                severity: 'high',
                category: 'finance',
                confidence: 84.7
            }
        ];
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        return [{
                ...randomAlert,
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                status: 'new'
            }];
    };
    const generateMarketData = () => ({
        time: new Date().toLocaleTimeString(),
        suspiciousVolume: Math.random() * 100,
        riskScore: Math.random() * 100,
        compliance: 85 + Math.random() * 15,
        investigations: Math.floor(Math.random() * 10)
    });
    const generateInvestigation = () => ({
        id: Date.now(),
        title: `Розслідування #${Math.floor(Math.random() * 9999)}`,
        type: ['Банківське шахрайство', 'Корупція в держсекторі', 'Ринкові маніпуляції'][Math.floor(Math.random() * 3)],
        status: ['В процесі', 'Аналіз', 'Перевірка'][Math.floor(Math.random() * 3)],
        priority: ['Висока', 'Критична', 'Середня'][Math.floor(Math.random() * 3)],
        evidence: Math.floor(Math.random() * 50) + 10,
        timestamp: new Date().toLocaleString()
    });
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return _jsx(ErrorIcon, { sx: { color: '#f44336' } });
            case 'high': return _jsx(WarningIcon, { sx: { color: '#ff9800' } });
            case 'medium': return _jsx(InfoIcon, { sx: { color: '#2196f3' } });
            case 'low': return _jsx(SuccessIcon, { sx: { color: '#4caf50' } });
            default: return _jsx(InfoIcon, {});
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#f44336';
            case 'high': return '#ff9800';
            case 'medium': return '#2196f3';
            case 'low': return '#4caf50';
            default: return '#9e9e9e';
        }
    };
    const TabPanel = ({ children, value, index }) => (_jsx("div", { hidden: value !== index, children: value === index && _jsx(Box, { sx: { p: 3 }, children: children }) }));
    return (_jsxs(Box, { sx: { p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold', color: '#1976d2' }, children: "\uD83D\uDCBC Business Intelligence Hub" }), _jsx(Typography, { variant: "subtitle1", color: "text.secondary", children: "\u0420\u043E\u0437\u0448\u0438\u0440\u0435\u043D\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0431\u0456\u0437\u043D\u0435\u0441-\u0430\u043D\u0430\u043B\u0456\u0442\u0438\u043A\u0438 \u0442\u0430 \u0434\u0435\u0442\u0435\u043A\u0446\u0456\u0457 \u0441\u0445\u0435\u043C" })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(ExportIcon, {}), children: "\u0415\u043A\u0441\u043F\u043E\u0440\u0442" }), _jsx(IconButton, { color: "primary", children: _jsx(RefreshIcon, {}) })] })] }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(Tabs, { value: activeTab, onChange: (_, newValue) => setActiveTab(newValue), variant: "scrollable", scrollButtons: "auto", children: [_jsx(Tab, { icon: _jsx(BankIcon, {}), label: "\u0411\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u0438\u0439 \u0441\u0435\u043A\u0442\u043E\u0440" }), _jsx(Tab, { icon: _jsx(BusinessIcon, {}), label: "\u0414\u0435\u0440\u0436\u0430\u0432\u043D\u0438\u0439 \u0441\u0435\u043A\u0442\u043E\u0440" }), _jsx(Tab, { icon: _jsx(TrendIcon, {}), label: "\u0420\u0438\u043D\u043A\u043E\u0432\u0430 \u0430\u043D\u0430\u043B\u0456\u0442\u0438\u043A\u0430" }), _jsx(Tab, { icon: _jsx(SecurityIcon, {}), label: "\u0420\u043E\u0437\u0441\u043B\u0456\u0434\u0443\u0432\u0430\u043D\u043D\u044F" })] }) }), _jsx(TabPanel, { value: activeTab, index: 0, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83D\uDEA8 \u041A\u0440\u0438\u0442\u0438\u0447\u043D\u0456 \u0430\u043B\u0435\u0440\u0442\u0438" }), _jsx(List, { dense: true, children: alerts.filter(a => a.category === 'banking').slice(0, 5).map((alert) => (_jsx(motion.div, { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, children: _jsxs(ListItem, { children: [_jsx(ListItemIcon, { children: getSeverityIcon(alert.severity) }), _jsx(ListItemText, { primary: alert.message, secondary: `${alert.timestamp} • Впевненість: ${alert.confidence}%` })] }) }, alert.id))) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83D\uDCCA \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0434\u0435\u0442\u0435\u043A\u0446\u0456\u0457" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { data: marketData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "suspiciousVolume", stroke: "#f44336", fill: "#f44336", fillOpacity: 0.3, name: "\u041F\u0456\u0434\u043E\u0437\u0440\u0456\u043B\u0438\u0439 \u043E\u0431\u0441\u044F\u0433" })] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83C\uDFE6 \u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0438\u0439 \u0430\u043D\u0430\u043B\u0456\u0437 \u0431\u0430\u043D\u043A\u0456\u0432\u0441\u044C\u043A\u0438\u0445 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0439" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Alert, { severity: "error", children: [_jsx(Typography, { variant: "h4", children: "127" }), _jsx(Typography, { variant: "body2", children: "\u041F\u0456\u0434\u043E\u0437\u0440\u0456\u043B\u0456 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0456\u0457" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Alert, { severity: "warning", children: [_jsx(Typography, { variant: "h4", children: "43" }), _jsx(Typography, { variant: "body2", children: "\u0421\u0445\u0435\u043C\u0438 \u0432\u0456\u0434\u043C\u0438\u0432\u0430\u043D\u043D\u044F" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Alert, { severity: "info", children: [_jsx(Typography, { variant: "h4", children: "$8.2M" }), _jsx(Typography, { variant: "body2", children: "\u0417\u0430\u0431\u043B\u043E\u043A\u043E\u0432\u0430\u043D\u0430 \u0441\u0443\u043C\u0430" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Alert, { severity: "success", children: [_jsx(Typography, { variant: "h4", children: "94.7%" }), _jsx(Typography, { variant: "body2", children: "\u0422\u043E\u0447\u043D\u0456\u0441\u0442\u044C \u0434\u0435\u0442\u0435\u043A\u0446\u0456\u0457" })] }) })] })] }) }) })] }) }), _jsx(TabPanel, { value: activeTab, index: 1, children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83C\uDFDB\uFE0F \u041C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433 \u0434\u0435\u0440\u0436\u0437\u0430\u043A\u0443\u043F\u0456\u0432\u0435\u043B\u044C" }), _jsx(TableContainer, { children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0422\u0435\u043D\u0434\u0435\u0440" }), _jsx(TableCell, { children: "\u0421\u0443\u043C\u0430" }), _jsx(TableCell, { children: "\u0420\u0438\u0437\u0438\u043A" }), _jsx(TableCell, { children: "\u0421\u0442\u0430\u0442\u0443\u0441" })] }) }), _jsx(TableBody, { children: [
                                                            { tender: 'Будівництво доріг', amount: '₴12.5M', risk: 'Високий', status: 'Розслідування' },
                                                            { tender: 'IT обладнання', amount: '₴3.2M', risk: 'Середній', status: 'Моніторинг' },
                                                            { tender: 'Медичне обладнання', amount: '₴8.7M', risk: 'Критичний', status: 'Блокування' }
                                                        ].map((row, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: row.tender }), _jsx(TableCell, { children: row.amount }), _jsx(TableCell, { children: _jsx(Chip, { label: row.risk, color: row.risk === 'Критичний' ? 'error' : row.risk === 'Високий' ? 'warning' : 'info', size: "small" }) }), _jsx(TableCell, { children: row.status })] }, index))) })] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83D\uDCC8 \u041A\u043E\u0440\u0443\u043F\u0446\u0456\u0439\u043D\u0456 \u0440\u0438\u0437\u0438\u043A\u0438" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: [
                                                            { name: 'Високий', value: 35, fill: '#f44336' },
                                                            { name: 'Середній', value: 45, fill: '#ff9800' },
                                                            { name: 'Низький', value: 20, fill: '#4caf50' }
                                                        ], cx: "50%", cy: "50%", outerRadius: 60, dataKey: "value", label: true }), _jsx(Tooltip, {})] }) })] }) }) })] }) }), _jsx(TabPanel, { value: activeTab, index: 2, children: _jsx(Grid, { container: true, spacing: 3, children: _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83D\uDCCA \u0420\u0438\u043D\u043A\u043E\u0432\u0456 \u0442\u0440\u0435\u043D\u0434\u0438 \u0442\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u0438" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: marketData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "riskScore", stroke: "#2196f3", strokeWidth: 2, name: "\u0420\u0438\u0437\u0438\u043A-\u0441\u043A\u043E\u0440" }), _jsx(Line, { type: "monotone", dataKey: "compliance", stroke: "#4caf50", strokeWidth: 2, name: "\u0412\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u043D\u0456\u0441\u0442\u044C" })] }) })] }) }) }) }) }), _jsx(TabPanel, { value: activeTab, index: 3, children: _jsx(Grid, { container: true, spacing: 3, children: _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\uD83D\uDD0D \u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u0440\u043E\u0437\u0441\u043B\u0456\u0434\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "\u0422\u0438\u043F" }), _jsx(TableCell, { children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { children: "\u041F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442" }), _jsx(TableCell, { children: "\u0414\u043E\u043A\u0430\u0437\u0438" }), _jsx(TableCell, { children: "\u0414\u0430\u0442\u0430" })] }) }), _jsx(TableBody, { children: investigations.map((investigation) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: investigation.title }), _jsx(TableCell, { children: investigation.type }), _jsx(TableCell, { children: _jsx(Chip, { label: investigation.status, size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: investigation.priority, color: investigation.priority === 'Критична' ? 'error' : investigation.priority === 'Висока' ? 'warning' : 'default', size: "small" }) }), _jsxs(TableCell, { children: [investigation.evidence, " \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0456\u0432"] }), _jsx(TableCell, { children: investigation.timestamp })] }, investigation.id))) })] }) })] }) }) }) }) })] }));
};
export default BusinessIntelligenceDashboard;
