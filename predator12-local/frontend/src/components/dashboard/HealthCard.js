import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, Box, Typography, Button, Chip, LinearProgress, Stack, Tooltip, Alert, AlertTitle } from '@mui/material';
import { CheckCircle as HealthyIcon, Warning as WarningIcon, Error as ErrorIcon, HelpOutline as UnknownIcon, Refresh as RefreshIcon, Settings as SettingsIcon, Timeline as LogsIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useAppEventStore } from '../../stores/appEventStore';
const HealthCard = ({ title, status, metric, details, reasons = [], onRecheck, onOpenLogs, onOpenSettings, loading = false, lastUpdated, helpText, quickActions = [] }) => {
    const { addEvent } = useAppEventStore();
    const getStatusConfig = () => {
        switch (status) {
            case 'optimal':
                return {
                    color: nexusColors.success,
                    icon: _jsx(HealthyIcon, {}),
                    label: 'Оптимально',
                    bgColor: `${nexusColors.success}15`
                };
            case 'degraded':
                return {
                    color: nexusColors.warning,
                    icon: _jsx(WarningIcon, {}),
                    label: 'Обмежено',
                    bgColor: `${nexusColors.warning}15`
                };
            case 'critical':
                return {
                    color: nexusColors.error,
                    icon: _jsx(ErrorIcon, {}),
                    label: 'Критично',
                    bgColor: `${nexusColors.error}15`
                };
            case 'unknown':
            default:
                return {
                    color: nexusColors.nebula,
                    icon: _jsx(UnknownIcon, {}),
                    label: 'Невідомо',
                    bgColor: `${nexusColors.nebula}15`
                };
        }
    };
    const config = getStatusConfig();
    // Генерація пояснень для unknown станів
    const getUnknownExplanation = () => {
        if (status !== 'unknown')
            return null;
        const commonReasons = [
            'Недостатньо метрик для оцінки',
            'Таймаут підключення до сервісу',
            'Відсутні права доступу',
            'Сервіс не відповідає на запити',
            'Помилка в конфігурації'
        ];
        const explanation = reasons.length > 0 ? reasons : commonReasons.slice(0, 2);
        return {
            title: 'Чому статус невідомий?',
            reasons: explanation,
            suggestedActions: [
                {
                    label: 'Перевірити підключення',
                    action: () => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Перевірити мережу', run: () => { } } }, 'Перевірка підключення', 'Перевіряємо підключення до сервісу...', 'info'),
                    primary: true
                },
                {
                    label: 'Переглянути логи',
                    action: onOpenLogs || (() => { }),
                    icon: _jsx(LogsIcon, { fontSize: "small" })
                },
                {
                    label: 'Налаштування',
                    action: onOpenSettings || (() => { }),
                    icon: _jsx(SettingsIcon, { fontSize: "small" })
                }
            ]
        };
    };
    const unknownInfo = getUnknownExplanation();
    // Автоматична генерація CTA кнопок
    const getActionButtons = () => {
        const buttons = [...quickActions];
        // Додаємо стандартні дії для кожного статусу
        if (status === 'unknown' || status === 'critical') {
            buttons.unshift({
                label: 'Оновити',
                action: onRecheck || (() => { }),
                icon: _jsx(RefreshIcon, { fontSize: "small" }),
                primary: true
            });
        }
        if (status === 'degraded' || status === 'critical') {
            buttons.push({
                label: 'Діагностика',
                action: () => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Запустити діагностику', run: () => { } } }, 'Системна діагностика', 'Запускаємо системну діагностику...', 'info')
            });
        }
        return buttons.slice(0, 3); // Максимум 3 кнопки
    };
    const actionButtons = getActionButtons();
    const handleAction = (actionType) => {
        switch (actionType) {
            case 'recheck':
                onRecheck?.();
                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Recheck', run: () => { } } }, 'Перевірка стану', `Перевірка стану: ${title}`, 'info');
                break;
            case 'logs':
                onOpenLogs?.();
                break;
            case 'settings':
                onOpenSettings?.();
                break;
        }
    };
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, whileHover: { y: -2 }, children: _jsxs(Card, { sx: {
                background: `linear-gradient(135deg, ${nexusColors.obsidian}E0, ${nexusColors.darkMatter}D0)`,
                border: `1px solid ${config.color}60`,
                borderRadius: 2,
                position: 'relative',
                overflow: 'visible',
                minHeight: 180,
                '&:hover': {
                    border: `1px solid ${config.color}80`,
                    boxShadow: `0 8px 32px ${config.color}20`
                },
                transition: 'all 0.3s ease'
            }, children: [_jsx(Box, { sx: {
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        height: 4,
                        background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                        borderRadius: '4px 4px 0 0'
                    } }), _jsxs(CardContent, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Box, { sx: { color: config.color }, children: config.icon }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: title })] }), _jsx(Chip, { label: config.label, size: "small", sx: {
                                        backgroundColor: config.bgColor,
                                        color: config.color,
                                        fontWeight: 'bold',
                                        border: `1px solid ${config.color}40`
                                    } })] }), metric !== undefined && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: "\u0420\u0456\u0432\u0435\u043D\u044C" }), _jsxs(Typography, { variant: "body2", sx: { color: config.color, fontWeight: 'bold' }, children: [Math.round(metric * 100), "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: metric * 100, sx: {
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: `${nexusColors.shadow}40`,
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: config.color,
                                            borderRadius: 3
                                        }
                                    } })] })), details && (_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 2 }, children: details })), status === 'unknown' && reasons.length > 0 && (_jsxs(Alert, { severity: "info", sx: {
                                mb: 2,
                                backgroundColor: `${nexusColors.nebula}15`,
                                border: `1px solid ${nexusColors.nebula}40`,
                                '& .MuiAlert-icon': { color: nexusColors.nebula },
                                '& .MuiAlert-message': { color: nexusColors.frost }
                            }, children: [_jsx(AlertTitle, { sx: { color: nexusColors.frost, fontSize: '0.9rem' }, children: "\u0427\u043E\u043C\u0443 \u0441\u0442\u0430\u0442\u0443\u0441 \u043D\u0435\u0432\u0456\u0434\u043E\u043C\u0438\u0439?" }), _jsx(Stack, { spacing: 0.5, children: reasons.map((reason, index) => (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: ["\u2022 ", reason] }, index))) })] })), loading && (_jsx(LinearProgress, { sx: {
                                mb: 2,
                                backgroundColor: `${nexusColors.quantum}40`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: nexusColors.quantum
                                }
                            } })), actionButtons.length > 0 && (_jsx(Stack, { direction: "row", spacing: 1, justifyContent: "flex-end", sx: { mb: 2 }, children: actionButtons.map((action, index) => (_jsx(Tooltip, { title: action.label, placement: "top", children: _jsx(Button, { size: "small", onClick: action.action, disabled: loading, variant: action.primary ? 'contained' : 'outlined', startIcon: action.icon, sx: {
                                        color: action.primary ? nexusColors.obsidian : nexusColors.frost,
                                        backgroundColor: action.primary ? nexusColors.sapphire : 'transparent',
                                        borderColor: action.primary ? nexusColors.sapphire : nexusColors.frost,
                                        minHeight: 44, // WCAG 2.2 AA compliance
                                        minWidth: 44,
                                        '&:hover': {
                                            backgroundColor: action.primary
                                                ? `${nexusColors.sapphire}CC`
                                                : `${nexusColors.quantum}20`,
                                            borderColor: action.primary ? nexusColors.sapphire : nexusColors.quantum
                                        }
                                    }, children: action.label }) }, index))) })), lastUpdated && (_jsxs(Typography, { variant: "caption", sx: {
                                color: nexusColors.nebula,
                                opacity: 0.7,
                                display: 'block',
                                textAlign: 'right',
                                mb: 1
                            }, children: ["\u041E\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ", lastUpdated.toLocaleTimeString('uk-UA')] })), unknownInfo && (_jsxs(Box, { sx: { mt: 2, pt: 2, borderTop: `1px solid ${nexusColors.shadow}40` }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost, mb: 1 }, children: unknownInfo.title }), _jsx(Stack, { spacing: 1, children: unknownInfo.reasons.map((reason, index) => (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: ["\u2022 ", reason] }, index))) }), _jsx(Stack, { direction: "row", spacing: 1, sx: { mt: 1 }, children: unknownInfo.suggestedActions.map((action, index) => (_jsx(Button, { size: "small", onClick: action.action, variant: action.primary ? 'contained' : 'outlined', sx: {
                                            color: action.primary ? nexusColors.sapphire : nexusColors.frost,
                                            borderColor: action.primary ? nexusColors.sapphire : 'transparent',
                                            backgroundColor: action.primary ? `${nexusColors.sapphire}20` : 'transparent',
                                            minHeight: 32,
                                            flex: 1
                                        }, startIcon: action.icon, children: action.label }, index))) })] }))] })] }) }));
};
export default HealthCard;
