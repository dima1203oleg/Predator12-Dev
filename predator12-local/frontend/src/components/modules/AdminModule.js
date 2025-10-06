import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, Switch, FormControlLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { AdminPanelSettings as AdminIcon, Person as UserIcon, Key as KeyIcon, Memory as MemoryIcon, Speed as PerformanceIcon, Security as SecurityIcon, Refresh as RefreshIcon, Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, PlayArrow as StartIcon, Stop as StopIcon, Visibility as ViewIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const AdminModule = () => {
    const [selectedTab, setSelectedTab] = useState('users');
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [keyDialogOpen, setKeyDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    // Sample data
    const users = [
        {
            id: '1',
            username: 'admin',
            email: 'admin@predator.ai',
            role: 'Administrator',
            status: 'active',
            lastLogin: new Date('2024-01-16T14:30:00')
        },
        {
            id: '2',
            username: 'analyst1',
            email: 'analyst@predator.ai',
            role: 'Analyst',
            status: 'active',
            lastLogin: new Date('2024-01-16T13:15:00')
        },
        {
            id: '3',
            username: 'operator',
            email: 'operator@predator.ai',
            role: 'Operator',
            status: 'inactive',
            lastLogin: new Date('2024-01-15T16:45:00')
        }
    ];
    const apiKeys = [
        {
            id: '1',
            name: 'Production API',
            key: 'pk_live_****************************',
            permissions: ['read', 'write', 'admin'],
            createdAt: new Date('2024-01-10T10:00:00'),
            expiresAt: new Date('2024-12-31T23:59:59'),
            lastUsed: new Date('2024-01-16T12:00:00'),
            isActive: true
        },
        {
            id: '2',
            name: 'Analytics Service',
            key: 'pk_test_****************************',
            permissions: ['read'],
            createdAt: new Date('2024-01-12T14:30:00'),
            lastUsed: new Date('2024-01-16T10:30:00'),
            isActive: true
        },
        {
            id: '3',
            name: 'Legacy Integration',
            key: 'pk_legacy_************************',
            permissions: ['read', 'write'],
            createdAt: new Date('2023-12-01T09:00:00'),
            expiresAt: new Date('2024-06-01T00:00:00'),
            isActive: false
        }
    ];
    const services = [
        {
            id: '1',
            name: 'Nexus Core API',
            status: 'running',
            cpu: 15.2,
            memory: 68.5,
            uptime: '5d 12h 30m',
            port: 8000
        },
        {
            id: '2',
            name: 'OpenSearch',
            status: 'running',
            cpu: 25.8,
            memory: 82.1,
            uptime: '5d 12h 28m',
            port: 9200
        },
        {
            id: '3',
            name: 'Redis Cache',
            status: 'running',
            cpu: 3.1,
            memory: 12.4,
            uptime: '5d 12h 31m',
            port: 6379
        },
        {
            id: '4',
            name: 'Celery Worker',
            status: 'running',
            cpu: 8.7,
            memory: 45.2,
            uptime: '2h 15m'
        },
        {
            id: '5',
            name: 'Prometheus',
            status: 'error',
            cpu: 0,
            memory: 0,
            uptime: '0m',
            port: 9090
        }
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'running':
                return nexusColors.emerald;
            case 'inactive':
            case 'stopped':
                return nexusColors.shadow;
            case 'suspended':
            case 'error':
                return nexusColors.crimson;
            case 'starting':
                return nexusColors.warning;
            default:
                return nexusColors.nebula;
        }
    };
    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'administrator':
                return nexusColors.crimson;
            case 'analyst':
                return nexusColors.sapphire;
            case 'operator':
                return nexusColors.emerald;
            default:
                return nexusColors.nebula;
        }
    };
    const handleServiceAction = (serviceId, action) => {
        console.log(`${action} service ${serviceId}`);
        // In production, this would call the actual service management API
    };
    const renderUsersTab = () => (_jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: [_jsx(UserIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u0423\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F \u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430\u043C\u0438"] }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => setUserDialogOpen(true), sx: {
                                backgroundColor: nexusColors.emerald,
                                '&:hover': { backgroundColor: nexusColors.emerald + 'CC' }
                            }, children: "\u0414\u043E\u0434\u0430\u0442\u0438 \u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430" })] }), _jsx(TableContainer, { component: Paper, sx: { backgroundColor: 'transparent' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0420\u043E\u043B\u044C" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0432\u0445\u0456\u0434" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0414\u0456\u0457" })] }) }), _jsx(TableBody, { children: users.map((user) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Avatar, { sx: {
                                                            backgroundColor: nexusColors.sapphire,
                                                            width: 32,
                                                            height: 32
                                                        }, children: user.username.charAt(0).toUpperCase() }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: user.username }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: user.email })] })] }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Chip, { label: user.role, size: "small", sx: {
                                                    backgroundColor: getRoleColor(user.role),
                                                    color: nexusColors.frost
                                                } }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Chip, { label: user.status, size: "small", sx: {
                                                    backgroundColor: getStatusColor(user.status),
                                                    color: nexusColors.frost
                                                } }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: user.lastLogin.toLocaleString() }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, children: _jsx(ViewIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.warning }, onClick: () => {
                                                                setSelectedUser(user);
                                                                setUserDialogOpen(true);
                                                            }, children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.crimson }, children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }) })] }, user.id))) })] }) })] }) }));
    const renderAPIKeysTab = () => (_jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: [_jsx(KeyIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "API \u041A\u043B\u044E\u0447\u0456"] }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => setKeyDialogOpen(true), sx: {
                                backgroundColor: nexusColors.sapphire,
                                '&:hover': { backgroundColor: nexusColors.sapphire + 'CC' }
                            }, children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u041A\u043B\u044E\u0447" })] }), _jsx(List, { children: apiKeys.map((key) => (_jsxs(ListItem, { sx: {
                            border: `1px solid ${nexusColors.quantum}`,
                            borderRadius: 2,
                            mb: 1,
                            backgroundColor: nexusColors.darkMatter + '40'
                        }, children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { sx: {
                                        backgroundColor: key.isActive ? nexusColors.emerald : nexusColors.shadow,
                                        width: 40,
                                        height: 40
                                    }, children: _jsx(KeyIcon, {}) }) }), _jsx(ListItemText, { primary: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Typography, { variant: "body1", sx: { color: nexusColors.frost }, children: key.name }), _jsx(Chip, { label: key.isActive ? 'Active' : 'Inactive', size: "small", sx: {
                                                backgroundColor: key.isActive ? nexusColors.emerald : nexusColors.shadow,
                                                color: nexusColors.frost
                                            } })] }), secondary: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, fontFamily: 'monospace' }, children: key.key }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: ["Permissions: ", key.permissions.join(', '), " | Created: ", key.createdAt.toLocaleDateString(), " |", key.lastUsed && ` Last used: ${key.lastUsed.toLocaleString()}`] })] }) }), _jsx(ListItemSecondaryAction, { children: _jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, children: _jsx(ViewIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.warning }, children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.crimson }, children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }) })] }, key.id))) })] }) }));
    const renderServicesTab = () => (_jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: [_jsx(MemoryIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u0456 \u0421\u0435\u0440\u0432\u0456\u0441\u0438"] }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), sx: { color: nexusColors.emerald }, children: "\u041E\u043D\u043E\u0432\u0438\u0442\u0438 \u0421\u0442\u0430\u0442\u0443\u0441" })] }), _jsx(Grid, { container: true, spacing: 2, children: services.map((service) => (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                                background: `linear-gradient(135deg, ${nexusColors.darkMatter}80, ${nexusColors.obsidian}60)`,
                                border: `1px solid ${getStatusColor(service.status)}40`,
                                borderRadius: 2
                            }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: service.name }), _jsx(Chip, { label: service.status, size: "small", sx: {
                                                    backgroundColor: getStatusColor(service.status),
                                                    color: nexusColors.frost
                                                } })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "CPU Usage" }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: [service.cpu, "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: service.cpu, sx: {
                                                    backgroundColor: nexusColors.darkMatter,
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: service.cpu > 80 ? nexusColors.crimson :
                                                            service.cpu > 50 ? nexusColors.warning : nexusColors.emerald,
                                                    },
                                                } })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "Memory Usage" }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: [service.memory, "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: service.memory, sx: {
                                                    backgroundColor: nexusColors.darkMatter,
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: service.memory > 80 ? nexusColors.crimson :
                                                            service.memory > 50 ? nexusColors.warning : nexusColors.sapphire,
                                                    },
                                                } })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: ["Uptime: ", service.uptime] }), service.port && (_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: ["Port: ", service.port] }))] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [service.status === 'running' ? (_jsx(Button, { size: "small", startIcon: _jsx(StopIcon, {}), onClick: () => handleServiceAction(service.id, 'stop'), sx: { color: nexusColors.crimson }, children: "Stop" })) : (_jsx(Button, { size: "small", startIcon: _jsx(StartIcon, {}), onClick: () => handleServiceAction(service.id, 'start'), sx: { color: nexusColors.emerald }, children: "Start" })), _jsx(Button, { size: "small", startIcon: _jsx(RefreshIcon, {}), onClick: () => handleServiceAction(service.id, 'restart'), sx: { color: nexusColors.warning }, children: "Restart" })] })] }) }) }, service.id))) })] }) }));
    const renderSettingsTab = () => (_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.frost }, children: [_jsx(SecurityIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0411\u0435\u0437\u043F\u0435\u043A\u0438"] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "\u0414\u0432\u043E\u0444\u0430\u043A\u0442\u043E\u0440\u043D\u0430 \u0430\u0432\u0442\u0435\u043D\u0442\u0438\u0444\u0456\u043A\u0430\u0446\u0456\u044F", sx: { color: nexusColors.nebula } }), _jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "\u041B\u043E\u0433\u0443\u0432\u0430\u043D\u043D\u044F API \u0437\u0430\u043F\u0438\u0442\u0456\u0432", sx: { color: nexusColors.nebula } }), _jsx(FormControlLabel, { control: _jsx(Switch, {}), label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0435 \u0431\u043B\u043E\u043A\u0443\u0432\u0430\u043D\u043D\u044F \u043F\u0456\u0434\u043E\u0437\u0440\u0456\u043B\u0438\u0445 IP", sx: { color: nexusColors.nebula } }), _jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "\u0428\u0438\u0444\u0440\u0443\u0432\u0430\u043D\u043D\u044F \u0434\u0430\u043D\u0438\u0445 \u0432 \u0441\u043F\u043E\u043A\u043E\u0457", sx: { color: nexusColors.nebula } })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.frost }, children: [_jsx(PerformanceIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0456"] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(TextField, { label: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430 \u043A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0437'\u0454\u0434\u043D\u0430\u043D\u044C", type: "number", defaultValue: 1000, size: "small", fullWidth: true }), _jsx(TextField, { label: "Timeout \u0437\u0430\u043F\u0438\u0442\u0456\u0432 (\u0441\u0435\u043A)", type: "number", defaultValue: 30, size: "small", fullWidth: true }), _jsx(TextField, { label: "\u0420\u043E\u0437\u043C\u0456\u0440 \u043A\u0435\u0448\u0443 (MB)", type: "number", defaultValue: 512, size: "small", fullWidth: true }), _jsx(FormControlLabel, { control: _jsx(Switch, { defaultChecked: true }), label: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0435 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0443\u0432\u0430\u043D\u043D\u044F", sx: { color: nexusColors.nebula } })] })] }) }) })] }));
    return (_jsx(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Typography, { variant: "h4", sx: {
                        mb: 3,
                        color: nexusColors.crimson,
                        fontFamily: 'Orbitron',
                        textShadow: `0 0 10px ${nexusColors.crimson}`
                    }, children: [_jsx(AdminIcon, { sx: { mr: 2, verticalAlign: 'middle' } }), "\u0421\u0432\u044F\u0442\u0438\u043B\u0438\u0449\u0435 \u0410\u0440\u0445\u0456\u0442\u0435\u043A\u0442\u043E\u0440\u0430"] }), _jsx(Box, { sx: { mb: 3, display: 'flex', gap: 1 }, children: [
                        { id: 'users', label: 'Користувачі', icon: _jsx(UserIcon, {}) },
                        { id: 'keys', label: 'API Ключі', icon: _jsx(KeyIcon, {}) },
                        { id: 'services', label: 'Сервіси', icon: _jsx(MemoryIcon, {}) },
                        { id: 'settings', label: 'Налаштування', icon: _jsx(SettingsIcon, {}) }
                    ].map((tab) => (_jsx(Button, { variant: selectedTab === tab.id ? 'contained' : 'outlined', startIcon: tab.icon, onClick: () => setSelectedTab(tab.id), sx: {
                            backgroundColor: selectedTab === tab.id ? nexusColors.crimson : 'transparent',
                            borderColor: nexusColors.crimson,
                            color: selectedTab === tab.id ? nexusColors.frost : nexusColors.crimson,
                            '&:hover': {
                                backgroundColor: selectedTab === tab.id ? nexusColors.crimson + 'CC' : nexusColors.crimson + '20'
                            }
                        }, children: tab.label }, tab.id))) }), selectedTab === 'users' && renderUsersTab(), selectedTab === 'keys' && renderAPIKeysTab(), selectedTab === 'services' && renderServicesTab(), selectedTab === 'settings' && renderSettingsTab(), _jsxs(Dialog, { open: userDialogOpen, onClose: () => setUserDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { color: nexusColors.emerald }, children: selectedUser ? 'Редагувати Користувача' : 'Додати Користувача' }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }, children: [_jsx(TextField, { label: "\u0406\u043C'\u044F \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430", defaultValue: selectedUser?.username || '', fullWidth: true }), _jsx(TextField, { label: "Email", type: "email", defaultValue: selectedUser?.email || '', fullWidth: true }), _jsxs(TextField, { label: "\u0420\u043E\u043B\u044C", select: true, defaultValue: selectedUser?.role || 'Analyst', fullWidth: true, SelectProps: { native: true }, children: [_jsx("option", { value: "Administrator", children: "Administrator" }), _jsx("option", { value: "Analyst", children: "Analyst" }), _jsx("option", { value: "Operator", children: "Operator" }), _jsx("option", { value: "Viewer", children: "Viewer" })] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setUserDialogOpen(false), children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }), _jsx(Button, { variant: "contained", sx: { backgroundColor: nexusColors.emerald }, onClick: () => setUserDialogOpen(false), children: selectedUser ? 'Зберегти' : 'Створити' })] })] }), _jsxs(Dialog, { open: keyDialogOpen, onClose: () => setKeyDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { color: nexusColors.sapphire }, children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 API \u041A\u043B\u044E\u0447" }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }, children: [_jsx(TextField, { label: "\u041D\u0430\u0437\u0432\u0430 \u043A\u043B\u044E\u0447\u0430", fullWidth: true, placeholder: "\u041D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434: Production API" }), _jsxs(TextField, { label: "\u0414\u043E\u0437\u0432\u043E\u043B\u0438", select: true, fullWidth: true, SelectProps: {
                                            native: true,
                                            multiple: true
                                        }, children: [_jsx("option", { value: "read", children: "Read" }), _jsx("option", { value: "write", children: "Write" }), _jsx("option", { value: "admin", children: "Admin" })] }), _jsx(TextField, { label: "\u0422\u0435\u0440\u043C\u0456\u043D \u0434\u0456\u0457 (\u0434\u043D\u0456\u0432)", type: "number", defaultValue: 365, fullWidth: true })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setKeyDialogOpen(false), children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }), _jsx(Button, { variant: "contained", sx: { backgroundColor: nexusColors.sapphire }, onClick: () => setKeyDialogOpen(false), children: "\u0421\u0442\u0432\u043E\u0440\u0438\u0442\u0438 \u041A\u043B\u044E\u0447" })] })] })] }) }));
};
