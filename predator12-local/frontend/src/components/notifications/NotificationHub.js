import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { IconButton, Badge, Popover, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Chip, Divider, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon, CheckCircle as SuccessIcon, PlayArrow as ActionIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppEventStore } from '../../stores/appEventStore';
import { nexusColors } from '../../theme/nexusTheme';
const NotificationHub = () => {
    const { events, unreadCount, markAsRead } = useAppEventStore();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const getEventIcon = (level) => {
        switch (level) {
            case 'error': return _jsx(ErrorIcon, { sx: { color: nexusColors.error } });
            case 'warn': return _jsx(WarningIcon, { sx: { color: nexusColors.warning } });
            case 'success': return _jsx(SuccessIcon, { sx: { color: nexusColors.success } });
            case 'action-required': return _jsx(ActionIcon, { sx: { color: nexusColors.sapphire } });
            default: return _jsx(InfoIcon, { sx: { color: nexusColors.frost } });
        }
    };
    const getEventColor = (level) => {
        switch (level) {
            case 'error': return nexusColors.error;
            case 'warn': return nexusColors.warning;
            case 'success': return nexusColors.success;
            case 'action-required': return nexusColors.sapphire;
            default: return nexusColors.frost;
        }
    };
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
        if (diff < 60)
            return `${diff}с тому`;
        if (diff < 3600)
            return `${Math.floor(diff / 60)}хв тому`;
        if (diff < 86400)
            return `${Math.floor(diff / 3600)}год тому`;
        return timestamp.toLocaleDateString('uk-UA');
    };
    const handleEventClick = (eventId) => {
        markAsRead(eventId);
    };
    return (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: "\u0426\u0435\u043D\u0442\u0440 \u0441\u043F\u043E\u0432\u0456\u0449\u0435\u043D\u044C", placement: "left", children: _jsx(IconButton, { onClick: handleClick, sx: {
                        color: nexusColors.frost,
                        '&:hover': {
                            backgroundColor: `${nexusColors.quantum}40`,
                            transform: 'scale(1.05)'
                        },
                        transition: 'all 0.3s ease',
                        minWidth: 44,
                        minHeight: 44 // WCAG compliance
                    }, children: _jsx(Badge, { badgeContent: unreadCount, color: "error", max: 99, children: _jsx(NotificationsIcon, {}) }) }) }), _jsx(Popover, { open: open, anchorEl: anchorEl, onClose: handleClose, anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                }, transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }, PaperProps: {
                    sx: {
                        width: 380,
                        maxHeight: 500,
                        background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                        border: `1px solid ${nexusColors.quantum}`,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                    }
                }, children: _jsxs(Box, { sx: { p: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: "\u0421\u043F\u043E\u0432\u0456\u0449\u0435\u043D\u043D\u044F" }), _jsx(Chip, { label: `${unreadCount} нових`, size: "small", sx: {
                                        backgroundColor: unreadCount > 0 ? `${nexusColors.error}20` : `${nexusColors.success}20`,
                                        color: unreadCount > 0 ? nexusColors.error : nexusColors.success
                                    } })] }), _jsx(Divider, { sx: { borderColor: nexusColors.quantum, mb: 2 } }), events.length === 0 ? (_jsx(Box, { sx: { textAlign: 'center', py: 4 }, children: _jsx(Typography, { variant: "body2", sx: { color: nexusColors.shadow }, children: "\u041D\u0435\u043C\u0430\u0454 \u0441\u043F\u043E\u0432\u0456\u0449\u0435\u043D\u044C" }) })) : (_jsx(List, { sx: { maxHeight: 350, overflow: 'auto', p: 0 }, children: _jsx(AnimatePresence, { children: events.slice(0, 10).map((event) => (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, children: [_jsxs(ListItem, { sx: {
                                                border: `1px solid ${!event.isRead ? getEventColor(event.level) + '40' : 'transparent'}`,
                                                borderRadius: 1,
                                                mb: 1,
                                                backgroundColor: !event.isRead ? `${getEventColor(event.level)}10` : 'transparent',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: `${nexusColors.quantum}20`
                                                }
                                            }, onClick: () => handleEventClick(event.id), children: [_jsx(ListItemIcon, { sx: { minWidth: 36 }, children: getEventIcon(event.level) }), _jsx(ListItemText, { primary: _jsx(Typography, { variant: "body2", sx: {
                                                            color: nexusColors.frost,
                                                            fontWeight: !event.isRead ? 'bold' : 'normal'
                                                        }, children: event.message }), secondary: _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: formatTimeAgo(event.timestamp) }) })] }), event.actions && event.actions.length > 0 && (_jsx(Box, { sx: { ml: 5, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }, children: event.actions.map((action, index) => (_jsx(Button, { size: "small", variant: action.type === 'primary' ? 'contained' : 'outlined', color: action.type === 'danger' ? 'error' : 'primary', onClick: (e) => {
                                                    e.stopPropagation();
                                                    action.action();
                                                    handleEventClick(event.id);
                                                }, sx: {
                                                    minHeight: 32,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'none',
                                                    borderRadius: 1
                                                }, children: action.label }, index))) }))] }, event.id))) }) }))] }) })] }));
};
export default NotificationHub;
