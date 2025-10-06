import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Tooltip, Badge } from '@mui/material';
import { Dashboard as DashboardIcon, SmartToy as MASIcon, DataObject as ETLIcon, Timeline as ChronoIcon, Science as SimulatorIcon, Search as OpenSearchIcon, Security as AdminIcon, Menu as MenuIcon, ChevronLeft as CollapseIcon, AccountTree as DataFlowIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
// Конфігурація модулів згідно з ТЗ п.5
const NEXUS_MODULES = [
    {
        id: 'dashboard',
        title: 'Command Bridge',
        titleUA: 'Міст Управління',
        icon: _jsx(DashboardIcon, {}),
        description: 'System Health, Agents, Pipelines, Integrations',
        descriptionUA: 'Стан системи, Агенти, Конвеєри, Інтеграції',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'mas',
        title: 'AI Orbital Node',
        titleUA: 'Орбітальний Вузол ШІ',
        icon: _jsx(MASIcon, {}),
        description: 'Agent states, logs, restarts, health probes',
        descriptionUA: 'Стан агентів, логи, перезапуски, health-проби',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'etl',
        title: 'Data Factory',
        titleUA: 'Фабрика Даних',
        icon: _jsx(ETLIcon, {}),
        description: 'Queues, jobs, connector status, manual runs',
        descriptionUA: 'Черги, джоби, статус конекторів, manual run',
        roles: ['Admin', 'Analyst']
    },
    {
        id: 'chrono',
        title: 'Chrono Analysis',
        titleUA: 'Хроно-Аналіз',
        icon: _jsx(ChronoIcon, {}),
        description: '4D timelines, trends, anomalies',
        descriptionUA: '4D таймлайни, тренди, аномалії',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'simulator',
        title: 'Reality Simulator',
        titleUA: 'Симулятор Реальностей',
        icon: _jsx(SimulatorIcon, {}),
        description: 'What-if scenarios, execution, parameters',
        descriptionUA: 'What-if сценарії, запуск, параметри',
        roles: ['Admin', 'Analyst']
    },
    {
        id: 'opensearch',
        title: 'Analytics Deck',
        titleUA: 'Аналітична Палуба',
        icon: _jsx(OpenSearchIcon, {}),
        description: 'OpenSearch Dashboard integration',
        descriptionUA: 'Інтеграція OpenSearch Dashboard',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'admin',
        title: 'Architect Sanctuary',
        titleUA: 'Святилище Архітектора',
        icon: _jsx(AdminIcon, {}),
        description: 'Secrets, tokens, integrations, feature flags',
        descriptionUA: 'Секрети, токени, інтеграції, фіча-флаги',
        roles: ['Admin']
    },
    {
        id: 'self-improvement',
        title: 'AI Self-Evolution',
        titleUA: 'AI Самоеволюція',
        icon: _jsx(MASIcon, {}),
        description: 'Real-time self-improvement and business analytics',
        descriptionUA: 'Самовдосконалення та бізнес-аналітика в реальному часі',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'data-flow',
        title: 'Data Flow Map',
        titleUA: 'Карта Потоків Даних',
        icon: _jsx(DataFlowIcon, {}),
        description: '3D visualization of data flows and system connections',
        descriptionUA: '3D візуалізація потоків даних та зв\'язків системи',
        roles: ['Admin', 'Analyst', 'Viewer']
    }
];
const NexusContext = createContext(null);
export const useNexus = () => {
    const context = useContext(NexusContext);
    if (!context) {
        throw new Error('useNexus must be used within NexusProvider');
    }
    return context;
};
export const NexusProvider = ({ children, defaultModule = 'dashboard', userRole = 'Analyst' }) => {
    const [activeModule, setActiveModule] = useState(defaultModule);
    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [language, setLanguage] = useState('UA');
    const value = {
        activeModule,
        setActiveModule,
        isDrawerOpen,
        setDrawerOpen,
        userRole,
        language,
        setLanguage
    };
    return (_jsx(NexusContext.Provider, { value: value, children: children }));
};
const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;
export const NexusNavigation = () => {
    const { activeModule, setActiveModule, isDrawerOpen, setDrawerOpen, userRole, language } = useNexus();
    // Фільтруємо модулі за ролями користувача
    const availableModules = NEXUS_MODULES.filter(module => module.roles.includes(userRole));
    const handleModuleClick = (moduleId) => {
        setActiveModule(moduleId);
    };
    const getModuleStatus = (moduleId) => {
        // Mock статуси - в продакшені будуть з API
        const mockStatuses = {
            dashboard: 'ok',
            mas: 'warning',
            etl: 'ok',
            chrono: 'unknown',
            simulator: 'ok',
            opensearch: 'error',
            admin: 'ok',
            'self-improvement': 'ok',
            'data-flow': 'ok'
        };
        return mockStatuses[moduleId] || 'unknown';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'ok': return nexusColors.success;
            case 'warning': return nexusColors.warning;
            case 'error': return nexusColors.error;
            case 'unknown': return nexusColors.nebula;
            default: return nexusColors.frost;
        }
    };
    const getNotificationCount = (moduleId) => {
        // Mock notifications - в продакшені з Notification Hub
        const mockNotifications = {
            dashboard: 0,
            mas: 2,
            etl: 1,
            chrono: 0,
            simulator: 0,
            opensearch: 3,
            admin: 0,
            'self-improvement': 5,
            'data-flow': 1
        };
        return mockNotifications[moduleId] || 0;
    };
    return (_jsxs(Drawer, { variant: "permanent", sx: {
            width: isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
                boxSizing: 'border-box',
                background: `linear-gradient(180deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                borderRight: `1px solid ${nexusColors.quantum}40`,
                backdropFilter: 'blur(20px)',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }
        }, children: [_jsxs(Box, { sx: {
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${nexusColors.quantum}30`
                }, children: [_jsx(AnimatePresence, { children: isDrawerOpen && (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, children: _jsx(Typography, { variant: "h6", sx: {
                                    color: nexusColors.frost,
                                    fontFamily: 'Orbitron, monospace',
                                    fontWeight: 700,
                                    background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }, children: "NEXUS MODULES" }) })) }), _jsx(Tooltip, { title: isDrawerOpen ? 'Згорнути панель' : 'Розгорнути панель', children: _jsx(IconButton, { onClick: () => setDrawerOpen(!isDrawerOpen), sx: {
                                color: nexusColors.quantum,
                                minWidth: 44,
                                minHeight: 44,
                                '&:hover': {
                                    backgroundColor: `${nexusColors.quantum}20`,
                                    color: nexusColors.sapphire
                                }
                            }, children: isDrawerOpen ? _jsx(CollapseIcon, {}) : _jsx(MenuIcon, {}) }) })] }), _jsx(List, { sx: { px: 1, py: 2 }, children: availableModules.map((module, index) => {
                    const isActive = activeModule === module.id;
                    const status = getModuleStatus(module.id);
                    const notifications = getNotificationCount(module.id);
                    const statusColor = getStatusColor(status);
                    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: index * 0.05 }, children: _jsx(ListItem, { disablePadding: true, sx: { mb: 1 }, children: _jsx(Tooltip, { title: !isDrawerOpen ? (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 'bold' }, children: language === 'UA' ? module.titleUA : module.title }), _jsx(Typography, { variant: "caption", children: language === 'UA' ? module.descriptionUA : module.description }), notifications > 0 && (_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.warning }, children: ["\u2022 ", notifications, " \u0441\u043F\u043E\u0432\u0456\u0449\u0435\u043D\u044C"] }))] })) : '', placement: "right", arrow: true, children: _jsxs(ListItemButton, { selected: isActive, onClick: () => handleModuleClick(module.id), sx: {
                                        borderRadius: 2,
                                        minHeight: 56,
                                        bgcolor: isActive ? `${nexusColors.quantum}20` : 'transparent',
                                        border: `1px solid ${isActive ? nexusColors.quantum : 'transparent'}`,
                                        '&:hover': {
                                            bgcolor: `${nexusColors.sapphire}15`,
                                            border: `1px solid ${nexusColors.sapphire}40`
                                        },
                                        '&.Mui-selected': {
                                            bgcolor: `${nexusColors.quantum}25`,
                                            '&:hover': {
                                                bgcolor: `${nexusColors.quantum}30`
                                            }
                                        },
                                        transition: 'all 0.3s ease'
                                    }, children: [_jsxs(ListItemIcon, { sx: {
                                                minWidth: isDrawerOpen ? 40 : 'auto',
                                                mr: isDrawerOpen ? 2 : 0,
                                                color: isActive ? nexusColors.quantum : nexusColors.frost,
                                                position: 'relative'
                                            }, children: [_jsx(Box, { sx: {
                                                        position: 'absolute',
                                                        top: -4,
                                                        right: -4,
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: statusColor,
                                                        border: `1px solid ${nexusColors.obsidian}`,
                                                        boxShadow: `0 0 8px ${statusColor}80`
                                                    } }), notifications > 0 && (_jsx(Badge, { badgeContent: notifications, sx: {
                                                        '& .MuiBadge-badge': {
                                                            bgcolor: nexusColors.warning,
                                                            color: nexusColors.obsidian,
                                                            fontSize: '0.7rem',
                                                            minWidth: 16,
                                                            height: 16
                                                        }
                                                    }, children: module.icon })), notifications === 0 && module.icon] }), _jsx(AnimatePresence, { children: isDrawerOpen && (_jsx(motion.div, { initial: { opacity: 0, width: 0 }, animate: { opacity: 1, width: 'auto' }, exit: { opacity: 0, width: 0 }, transition: { duration: 0.3 }, style: { overflow: 'hidden' }, children: _jsx(ListItemText, { primary: language === 'UA' ? module.titleUA : module.title, secondary: language === 'UA' ? module.descriptionUA : module.description, primaryTypographyProps: {
                                                        sx: {
                                                            color: isActive ? nexusColors.quantum : nexusColors.frost,
                                                            fontFamily: 'Orbitron, monospace',
                                                            fontSize: '0.95rem',
                                                            fontWeight: isActive ? 600 : 400
                                                        }
                                                    }, secondaryTypographyProps: {
                                                        sx: {
                                                            color: nexusColors.nebula,
                                                            fontSize: '0.75rem',
                                                            opacity: 0.8
                                                        }
                                                    } }) })) })] }) }) }) }, module.id));
                }) }), _jsx(Box, { sx: {
                    mt: 'auto',
                    p: 2,
                    borderTop: `1px solid ${nexusColors.quantum}30`
                }, children: _jsx(AnimatePresence, { children: isDrawerOpen && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, children: [_jsx(Typography, { variant: "caption", sx: {
                                    color: nexusColors.nebula,
                                    opacity: 0.7,
                                    display: 'block'
                                }, children: "Predator Analytics v1.0" }), _jsxs(Typography, { variant: "caption", sx: {
                                    color: nexusColors.nebula,
                                    opacity: 0.5,
                                    display: 'block'
                                }, children: ["Role: ", userRole, " \u2022 Lang: ", language] })] })) }) })] }));
};
export default NexusNavigation;
