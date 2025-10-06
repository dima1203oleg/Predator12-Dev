import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Grid, Card, Typography, LinearProgress, Switch, FormControlLabel, Paper } from '@mui/material';
import { TrendingUp, Speed, Memory, Storage, NetworkCheck } from '@mui/icons-material';
// Animated Metric Card Component
const MetricCard = ({ title, value, unit, icon, color, trend, chart }) => {
    const [isHovered, setIsHovered] = useState(false);
    const getProgressValue = (value) => {
        return parseInt(value.replace('%', '')) || 0;
    };
    const getTrendColor = (trend) => {
        if (trend > 0)
            return '#ff4444';
        if (trend < 0)
            return '#44ff44';
        return '#ffff44';
    };
    return (_jsx(motion.div, { whileHover: { scale: 1.03, y: -5 }, onHoverStart: () => setIsHovered(true), onHoverEnd: () => setIsHovered(false), transition: { duration: 0.3 }, children: _jsxs(Card, { sx: {
                p: 3,
                background: isHovered
                    ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`
                    : 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,30,60,0.8) 100%)',
                border: `2px solid ${isHovered ? color : 'rgba(0,255,255,0.3)'}`,
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isHovered
                    ? `0 12px 40px ${color}40`
                    : '0 4px 16px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
            }, children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: isHovered ? 0.1 : 0 }, transition: { duration: 0.3 }, style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
                        pointerEvents: 'none'
                    } }), _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, children: [_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(Box, { sx: {
                                        p: 1,
                                        borderRadius: '50%',
                                        bgcolor: `${color}20`,
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }, children: React.cloneElement(icon, { sx: { color, fontSize: 28 } }) }), _jsx(Typography, { variant: "h6", sx: { color: '#ffffff', fontWeight: 'bold' }, children: title })] }), trend !== undefined && (_jsx(Chip, { icon: _jsx(TrendingUp, {}), label: `${trend > 0 ? '+' : ''}${trend}%`, size: "small", sx: {
                                bgcolor: `${getTrendColor(trend)}20`,
                                color: getTrendColor(trend),
                                fontWeight: 'bold'
                            } }))] }), _jsxs(Typography, { variant: "h3", sx: { color, fontWeight: 'bold', mb: 1 }, children: [value, _jsx(Typography, { component: "span", variant: "h6", sx: { color: '#cccccc', ml: 1 }, children: unit })] }), unit === '%' && (_jsx(Box, { mt: 2, children: _jsx(LinearProgress, { variant: "determinate", value: getProgressValue(value), sx: {
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: color,
                                boxShadow: `0 0 15px ${color}`,
                                transition: 'all 0.3s ease'
                            }
                        } }) })), chart && (_jsx(Box, { mt: 2, height: 60, children: _jsx(Line, { data: chart, options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { display: false },
                                y: { display: false }
                            },
                            elements: {
                                point: { radius: 0 },
                                line: { tension: 0.4 }
                            }
                        } }) }))] }) }));
};
// Real-time Chart Component
const RealtimeChart = ({ title, data, type = 'line' }) => {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#ffffff' }
            },
            title: {
                display: true,
                text: title,
                color: '#00ffff',
                font: { size: 16, weight: 'bold' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#cccccc' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
                ticks: { color: '#cccccc' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };
    const ChartComponent = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line;
    return (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, children: _jsx(Paper, { sx: {
                p: 3,
                height: 400,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
                border: '1px solid rgba(0,255,255,0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)'
            }, children: _jsx(ChartComponent, { data: data, options: chartOptions }) }) }));
};
// System Status Indicator
const SystemStatusIndicator = ({ status, label }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'excellent':
                return { color: '#00ff00', icon: _jsx(CheckCircle, {}), label: 'Відмінно' };
            case 'good':
                return { color: '#ffff00', icon: _jsx(CheckCircle, {}), label: 'Добре' };
            case 'warning':
                return { color: '#ff8800', icon: _jsx(Warning, {}), label: 'Попередження' };
            case 'critical':
                return { color: '#ff0000', icon: _jsx(Error, {}), label: 'Критично' };
            default:
                return { color: '#00ffff', icon: _jsx(CheckCircle, {}), label: 'Невідомо' };
        }
    };
    const config = getStatusConfig(status);
    return (_jsx(motion.div, { whileHover: { scale: 1.1 }, transition: { duration: 0.2 }, children: _jsxs(Box, { display: "flex", alignItems: "center", sx: { p: 2 }, children: [_jsx(motion.div, { animate: {
                        scale: [1, 1.2, 1],
                        rotate: [0, 360, 0]
                    }, transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }, children: React.cloneElement(config.icon, {
                        sx: {
                            color: config.color,
                            fontSize: 32,
                            filter: `drop-shadow(0 0 10px ${config.color})`
                        }
                    }) }), _jsxs(Box, { ml: 2, children: [_jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: label }), _jsx(Typography, { variant: "h6", sx: { color: config.color, fontWeight: 'bold' }, children: config.label })] })] }) }));
};
export const RealtimeSystemMonitor = ({ systemData }) => {
    const [realTimeMode, setRealTimeMode] = useState(true);
    const [cpuHistory, setCpuHistory] = useState([]);
    const [memoryHistory, setMemoryHistory] = useState([]);
    const [networkHistory, setNetworkHistory] = useState([]);
    // Mock real-time data generation
    useEffect(() => {
        if (!realTimeMode)
            return;
        const interval = setInterval(() => {
            setCpuHistory(prev => {
                const newData = [...prev, Math.random() * 100];
                return newData.slice(-20); // Keep only last 20 points
            });
            setMemoryHistory(prev => {
                const newData = [...prev, 40 + Math.random() * 40];
                return newData.slice(-20);
            });
            setNetworkHistory(prev => {
                const newData = [...prev, Math.random() * 1000];
                return newData.slice(-20);
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [realTimeMode]);
    // Chart data configurations
    const cpuChartData = {
        labels: Array.from({ length: cpuHistory.length }, (_, i) => `${i}s`),
        datasets: [{
                label: 'CPU Usage',
                data: cpuHistory,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fill: true,
                tension: 0.4
            }]
    };
    const memoryChartData = {
        labels: Array.from({ length: memoryHistory.length }, (_, i) => `${i}s`),
        datasets: [{
                label: 'Memory Usage',
                data: memoryHistory,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                fill: true,
                tension: 0.4
            }]
    };
    const containerStatusData = {
        labels: ['Активні', 'Ініціалізуються', 'Помилки'],
        datasets: [{
                data: [24, 2, 1],
                backgroundColor: ['#00ff00', '#ffff00', '#ff0000'],
                borderColor: ['#00ff0080', '#ffff0080', '#ff000080'],
                borderWidth: 2
            }]
    };
    const agentPerformanceData = {
        labels: ['SelfHealing', 'AutoImprove', 'Diagnosis', 'ContainerHealer'],
        datasets: [{
                label: 'Покращення за годину',
                data: [12, 8, 6, 15],
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
                borderColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
                borderWidth: 2
            }]
    };
    return (_jsxs(Box, { sx: { p: 3, minHeight: '100vh' }, children: [_jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, children: _jsx(Paper, { sx: {
                        p: 3,
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
                        border: '1px solid rgba(0,255,255,0.3)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(20px)'
                    }, children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "h4", sx: { color: '#00ffff', fontWeight: 'bold' }, children: "\uD83D\uDCCA \u0420\u0435\u0430\u043B\u0442\u0430\u0439\u043C \u041C\u043E\u043D\u0456\u0442\u043E\u0440\u0438\u043D\u0433 \u0421\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: realTimeMode, onChange: (e) => setRealTimeMode(e.target.checked), sx: {
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#00ffff',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#00ffff',
                                        },
                                    } }), label: _jsx(Typography, { sx: { color: '#ffffff' }, children: "\u0420\u0435\u0430\u043B\u044C\u043D\u0438\u0439 \u0447\u0430\u0441" }) })] }) }) }), _jsxs(Grid, { container: true, spacing: 3, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(SystemStatusIndicator, { status: "excellent", label: "\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0438\u0439 \u0441\u0442\u0430\u043D" }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(SystemStatusIndicator, { status: "good", label: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(SystemStatusIndicator, { status: "excellent", label: "\u0411\u0435\u0437\u043F\u0435\u043A\u0430" }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(SystemStatusIndicator, { status: "good", label: "\u041C\u0435\u0440\u0435\u0436\u0430" }) })] }), _jsxs(Grid, { container: true, spacing: 3, mb: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(MetricCard, { title: "CPU", value: "23", unit: "%", icon: _jsx(Speed, {}), color: "#ff6b6b", trend: -2 }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(MetricCard, { title: "\u041F\u0430\u043C'\u044F\u0442\u044C", value: "58", unit: "%", icon: _jsx(Memory, {}), color: "#4ecdc4", trend: 5 }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(MetricCard, { title: "\u0414\u0438\u0441\u043A", value: "342", unit: "GB", icon: _jsx(Storage, {}), color: "#45b7d1", trend: 0 }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(MetricCard, { title: "\u041C\u0435\u0440\u0435\u0436\u0430", value: "1.2", unit: "GB/s", icon: _jsx(NetworkCheck, {}), color: "#96ceb4", trend: 8 }) })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(RealtimeChart, { title: "CPU \u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F (\u0420\u0435\u0430\u043B\u044C\u043D\u0438\u0439 \u0447\u0430\u0441)", data: cpuChartData, type: "line" }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(RealtimeChart, { title: "\u041F\u0430\u043C'\u044F\u0442\u044C (\u0420\u0435\u0430\u043B\u044C\u043D\u0438\u0439 \u0447\u0430\u0441)", data: memoryChartData, type: "line" }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(RealtimeChart, { title: "\u0421\u0442\u0430\u0442\u0443\u0441 \u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0456\u0432", data: containerStatusData, type: "doughnut" }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(RealtimeChart, { title: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C \u0410\u0433\u0435\u043D\u0442\u0456\u0432", data: agentPerformanceData, type: "bar" }) })] })] }));
};
