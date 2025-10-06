import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Trail, Sparkles, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { useHotkeys } from 'react-hotkeys-hook';
import * as THREE from 'three';
import { Box, Typography, Card, CardContent, CardActions, Button, Chip, LinearProgress, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, Grid, Paper, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BlockIcon from '@mui/icons-material/Block';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// 3D агент у вулику
const AgentNode = ({ agent, onClick, isSelected, hiveCenter }) => {
    const meshRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    // Анімація "дихання" вулика та міграції при навантаженні
    useFrame((state, delta) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            // Пульсація залежно від статусу
            let pulse = Math.sin(time * 2) * 0.1 + 1;
            if (agent.status === 'overloaded') {
                pulse = Math.sin(time * 5) * 0.3 + 1.2;
            }
            else if (agent.status === 'error') {
                pulse = Math.sin(time * 8) * 0.4 + 1.3;
            }
            meshRef.current.scale.setScalar(pulse * (isSelected ? 1.5 : 1));
            // Орбітальне обертання навколо центру
            const radius = 5 + agent.metrics.cpuUsage * 2; // Відстань залежить від навантаження
            const speed = agent.status === 'active' ? 0.5 : 0.1;
            const angle = time * speed + agent.id.length; // Унікальний кут для кожного агента
            meshRef.current.position.x = hiveCenter[0] + Math.cos(angle) * radius;
            meshRef.current.position.z = hiveCenter[2] + Math.sin(angle) * radius;
            meshRef.current.position.y = hiveCenter[1] + Math.sin(time + agent.id.length) * 2;
        }
    });
    // Кольори залежно від типу та статусу
    const getAgentColor = () => {
        if (agent.status === 'error')
            return '#ff0066';
        if (agent.status === 'overloaded')
            return '#ff6600';
        if (agent.status === 'blocked')
            return '#666666';
        switch (agent.type) {
            case 'etl': return '#00ff66';
            case 'osint': return '#0099ff';
            case 'graph': return '#9900ff';
            case 'forecast': return '#ffaa00';
            case 'security': return '#ff0099';
            case 'analytics': return '#00ffaa';
            default: return '#ffffff';
        }
    };
    const getStatusIcon = () => {
        switch (agent.status) {
            case 'active': return '⚡';
            case 'idle': return '💤';
            case 'overloaded': return '🔥';
            case 'error': return '❌';
            case 'blocked': return '🚫';
            default: return '❓';
        }
    };
    return (_jsxs("group", { position: agent.position, children: [_jsxs("mesh", { ref: meshRef, onClick: onClick, onPointerOver: () => setHovered(true), onPointerOut: () => setHovered(false), children: [_jsx("sphereGeometry", { args: [0.5, 16, 16] }), _jsx("meshStandardMaterial", { color: getAgentColor(), transparent: true, opacity: hovered ? 0.9 : 0.7, emissive: getAgentColor(), emissiveIntensity: hovered ? 0.4 : agent.status === 'active' ? 0.2 : 0.1 })] }), agent.status === 'active' && (_jsx(Sparkles, { count: 15, scale: [1.5, 1.5, 1.5], size: 0.5, speed: 0.4, color: getAgentColor() })), agent.status === 'overloaded' && (_jsx(Trail, { width: 2, length: 8, color: new THREE.Color('#ff6600'), attenuation: (t) => t * t, children: _jsxs("mesh", { children: [_jsx("sphereGeometry", { args: [0.1, 8, 8] }), _jsx("meshBasicMaterial", { color: "#ff6600" })] }) })), _jsx(Html, { position: [0, 1, 0], center: true, children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, style: {
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: getAgentColor(),
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        border: `1px solid ${getAgentColor()}`,
                        textAlign: 'center',
                        minWidth: '100px',
                        boxShadow: `0 0 10px ${getAgentColor()}50`
                    }, children: [_jsxs("div", { style: { fontSize: '14px', marginBottom: '2px' }, children: [getStatusIcon(), " ", agent.name] }), _jsxs("div", { style: { fontSize: '9px', opacity: 0.8 }, children: [agent.metrics.rps, " RPS | ", agent.metrics.latency, "ms"] }), _jsxs("div", { style: { fontSize: '9px', opacity: 0.8 }, children: ["CPU: ", agent.metrics.cpuUsage, "% | Err: ", agent.metrics.errors] }), agent.selfHealing.enabled && (_jsx("div", { style: { fontSize: '8px', color: '#00ff66' }, children: "\uD83E\uDE79 Self-Healing" }))] }) })] }));
};
// Головний компонент MAS Supervisor
const MASupervisor = ({ agents, onAgentAction, onPolicyUpdate, enableVoiceControl = true }) => {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [showSelfHealingLogs, setShowSelfHealingLogs] = useState(false);
    const [autoHealEnabled, setAutoHealEnabled] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const hiveCenter = [0, 0, 0];
    // Обробка кліку по агенту
    const handleAgentClick = useCallback((agent) => {
        setSelectedAgent(agent);
    }, []);
    // Дії з агентами
    const handleAgentAction = useCallback((action) => {
        if (!selectedAgent)
            return;
        onAgentAction?.(selectedAgent.id, action);
        setSnackbar({
            open: true,
            message: `Агент ${selectedAgent.name}: ${action}`,
            severity: action === 'restart' || action === 'unblock' ? 'success' : 'warning'
        });
        if (action === 'configure') {
            setShowConfigDialog(true);
        }
    }, [selectedAgent, onAgentAction]);
    // Жести
    const bind = useGesture({
        onDoubleClick: () => {
            setSelectedAgent(null);
        }
    });
    // Гарячі клавіші
    useHotkeys('escape', () => setSelectedAgent(null));
    useHotkeys('r', () => selectedAgent && handleAgentAction('restart'));
    useHotkeys('b', () => selectedAgent && handleAgentAction('block'));
    useHotkeys('c', () => selectedAgent && handleAgentAction('configure'));
    // Статистика вулика
    const hiveStats = {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        errorAgents: agents.filter(a => a.status === 'error').length,
        overloadedAgents: agents.filter(a => a.status === 'overloaded').length,
        averageRps: Math.round(agents.reduce((sum, a) => sum + a.metrics.rps, 0) / agents.length),
        totalErrors: agents.reduce((sum, a) => sum + a.metrics.errors, 0)
    };
    return (_jsxs(Box, { sx: { display: 'flex', height: '100vh', background: '#0a0a0f' }, children: [_jsxs(Paper, { elevation: 3, sx: {
                    width: 350,
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #333',
                    p: 2,
                    overflowY: 'auto'
                }, children: [_jsx(Card, { sx: { background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ff66', mb: 2 }, children: "\uD83D\uDC1D \u0421\u0442\u0430\u043D \u0412\u0443\u043B\u0438\u043A\u0430" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0412\u0441\u044C\u043E\u0433\u043E \u0430\u0433\u0435\u043D\u0442\u0456\u0432: ", _jsx("span", { style: { color: '#00ff66' }, children: hiveStats.totalAgents })] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0445: ", _jsx("span", { style: { color: '#00ff66' }, children: hiveStats.activeAgents })] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u041F\u043E\u043C\u0438\u043B\u043E\u043A: ", _jsx("span", { style: { color: '#ff6600' }, children: hiveStats.errorAgents })] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u041F\u0435\u0440\u0435\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u0438\u0445: ", _jsx("span", { style: { color: '#ff6600' }, children: hiveStats.overloadedAgents })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0421\u0435\u0440\u0435\u0434\u043D\u0456\u0439 RPS: ", _jsx("span", { style: { color: '#00ff66' }, children: hiveStats.averageRps })] }) })] })] }) }), _jsx(Card, { sx: { background: 'rgba(0, 0, 0, 0.7)', border: '1px solid #333', mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ff66', mb: 2 }, children: "\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0456 \u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: autoHealEnabled, onChange: (e) => setAutoHealEnabled(e.target.checked), sx: {
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#00ff66'
                                            }
                                        } }), label: "Auto-Healing", sx: { color: '#ccc', display: 'block', mb: 1 } }), _jsx(Button, { startIcon: _jsx(HealthAndSafetyIcon, {}), onClick: () => setShowSelfHealingLogs(true), sx: {
                                        color: '#00ff66',
                                        border: '1px solid #00ff66',
                                        mb: 1,
                                        width: '100%'
                                    }, children: "\u0416\u0443\u0440\u043D\u0430\u043B \u0421\u0430\u043C\u043E\u0432\u0438\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044C" })] }) }), _jsx(AnimatePresence, { children: selectedAgent && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, children: _jsxs(Card, { sx: { background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', mb: 2 }, children: [_jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { color: '#00ff66', display: 'flex', alignItems: 'center', gap: 1 }, children: [selectedAgent.status === 'active' && _jsx(CheckCircleIcon, {}), selectedAgent.status === 'error' && _jsx(ErrorIcon, {}), selectedAgent.status === 'overloaded' && _jsx(WarningIcon, {}), selectedAgent.name] }), _jsx(Chip, { label: selectedAgent.type, size: "small", sx: { background: '#00ff66', color: '#000', mb: 2 } }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc', mb: 1 }, children: ["\u0421\u0442\u0430\u0442\u0443\u0441: ", _jsx("span", { style: { color: selectedAgent.status === 'active' ? '#00ff66' : '#ff6600' }, children: selectedAgent.status })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["RPS: ", selectedAgent.metrics.rps] }), _jsx(LinearProgress, { variant: "determinate", value: (selectedAgent.metrics.rps / selectedAgent.policies.maxRps) * 100, sx: {
                                                            mb: 1,
                                                            '& .MuiLinearProgress-bar': { backgroundColor: '#00ff66' }
                                                        } }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["CPU: ", selectedAgent.metrics.cpuUsage, "%"] }), _jsx(LinearProgress, { variant: "determinate", value: selectedAgent.metrics.cpuUsage, sx: {
                                                            mb: 1,
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: selectedAgent.metrics.cpuUsage > 80 ? '#ff6600' : '#00ff66'
                                                            }
                                                        } }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u041F\u0430\u043C'\u044F\u0442\u044C: ", selectedAgent.metrics.memoryUsage, "%"] }), _jsx(LinearProgress, { variant: "determinate", value: selectedAgent.metrics.memoryUsage, sx: {
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: selectedAgent.metrics.memoryUsage > 80 ? '#ff6600' : '#00ff66'
                                                            }
                                                        } })] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0417\u0430\u0442\u0440\u0438\u043C\u043A\u0430: ", selectedAgent.metrics.latency, "ms"] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u041F\u043E\u043C\u0438\u043B\u043A\u0438: ", selectedAgent.metrics.errors] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0411\u044E\u0434\u0436\u0435\u0442: $", selectedAgent.metrics.budget] })] }), _jsxs(CardActions, { children: [_jsx(Button, { size: "small", startIcon: _jsx(RestartAltIcon, {}), onClick: () => handleAgentAction('restart'), sx: { color: '#00ff66' }, children: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A" }), _jsx(Button, { size: "small", startIcon: selectedAgent.status === 'blocked' ? _jsx(PlayArrowIcon, {}) : _jsx(BlockIcon, {}), onClick: () => handleAgentAction(selectedAgent.status === 'blocked' ? 'unblock' : 'block'), sx: { color: selectedAgent.status === 'blocked' ? '#00ff66' : '#ff6600' }, children: selectedAgent.status === 'blocked' ? 'Розблокувати' : 'Блокувати' }), _jsx(Button, { size: "small", startIcon: _jsx(SettingsIcon, {}), onClick: () => handleAgentAction('configure'), sx: { color: '#0099ff' }, children: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" })] })] }) })) }), _jsx(Typography, { variant: "h6", sx: { color: '#00ff66', mb: 1 }, children: "\u0410\u0433\u0435\u043D\u0442\u0438 \u0437\u0430 \u0442\u0438\u043F\u0430\u043C\u0438" }), _jsx(List, { dense: true, children: ['etl', 'osint', 'graph', 'forecast', 'security', 'analytics'].map(type => {
                            const typeAgents = agents.filter(a => a.type === type);
                            const activeCount = typeAgents.filter(a => a.status === 'active').length;
                            return (_jsxs(ListItem, { sx: { border: '1px solid #333', borderRadius: 1, mb: 1 }, children: [_jsx(ListItemText, { primary: `${type.toUpperCase()} (${typeAgents.length})`, secondary: `Активних: ${activeCount}`, primaryTypographyProps: { color: '#00ff66', fontSize: '14px' }, secondaryTypographyProps: { color: '#ccc', fontSize: '12px' } }), _jsx(ListItemSecondaryAction, { children: _jsx(Chip, { label: activeCount, size: "small", color: activeCount === typeAgents.length ? 'success' : 'warning' }) })] }, type));
                        }) })] }), _jsxs(Box, { ...bind(), sx: { flex: 1, position: 'relative' }, children: [_jsxs(Canvas, { camera: { position: [0, 5, 15], fov: 75 }, style: { width: '100%', height: '100%' }, children: [_jsx("ambientLight", { intensity: 0.3 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 0.8, color: "#00ff66" }), _jsx("pointLight", { position: [-10, -10, -10], intensity: 0.5, color: "#0099ff" }), _jsx("spotLight", { position: [0, 20, 0], intensity: 1, color: "#ffffff", angle: Math.PI / 4 }), _jsxs("mesh", { position: hiveCenter, children: [_jsx("sphereGeometry", { args: [0.3, 16, 16] }), _jsx("meshStandardMaterial", { color: "#ffaa00", emissive: "#ffaa00", emissiveIntensity: 0.3, transparent: true, opacity: 0.8 })] }), agents.map(agent => (_jsx(AgentNode, { agent: agent, onClick: () => handleAgentClick(agent), isSelected: selectedAgent?.id === agent.id, hiveCenter: hiveCenter }, agent.id))), _jsx(OrbitControls, { autoRotate: !selectedAgent, autoRotateSpeed: 0.3, enableZoom: true, enablePan: true, maxDistance: 25, minDistance: 8 })] }), _jsxs(Box, { sx: {
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            right: 16,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }, children: [_jsx(Typography, { variant: "caption", sx: {
                                    color: '#666',
                                    fontFamily: 'monospace',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    padding: '4px 8px',
                                    borderRadius: 1
                                }, children: "ESC: \u0441\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 | R: \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A | B: \u0431\u043B\u043E\u043A\u0443\u0432\u0430\u0442\u0438 | C: \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F" }), _jsxs(Typography, { variant: "caption", sx: {
                                    color: '#00ff66',
                                    fontFamily: 'monospace',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    padding: '4px 8px',
                                    borderRadius: 1
                                }, children: ["\uD83D\uDC1D \u0412\u0443\u043B\u0438\u043A \u0437\u0434\u043E\u0440\u043E\u0432\u0438\u0439: ", hiveStats.activeAgents, "/", hiveStats.totalAgents] })] })] }), _jsxs(Dialog, { open: showConfigDialog, onClose: () => setShowConfigDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { color: '#00ff66' }, children: ["\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0430\u0433\u0435\u043D\u0442\u0430: ", selectedAgent?.name] }), _jsx(DialogContent, { children: selectedAgent && (_jsxs(Box, { sx: { pt: 1 }, children: [_jsx(TextField, { fullWidth: true, label: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0438\u0439 RPS", type: "number", defaultValue: selectedAgent.policies.maxRps, margin: "normal" }), _jsx(TextField, { fullWidth: true, label: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0456 \u043F\u043E\u043C\u0438\u043B\u043A\u0438", type: "number", defaultValue: selectedAgent.policies.maxErrors, margin: "normal" }), _jsx(TextField, { fullWidth: true, label: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430 \u0437\u0430\u0442\u0440\u0438\u043C\u043A\u0430 (\u043C\u0441)", type: "number", defaultValue: selectedAgent.policies.maxLatency, margin: "normal" }), _jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: selectedAgent.policies.autoRestart }), label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0438\u0439 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A", sx: { mt: 2 } })] })) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setShowConfigDialog(false), children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }), _jsx(Button, { onClick: () => setShowConfigDialog(false), sx: { color: '#00ff66' }, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438" })] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 3000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: _jsx(Alert, { severity: snackbar.severity, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: snackbar.message }) })] }));
};
export default MASupervisor;
