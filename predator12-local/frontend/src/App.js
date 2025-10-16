import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CssBaseline, Box, Button, Typography, IconButton, Fade, Slide } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
// Нова система тем
import { NexusThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/theme/ThemeSwitcher';
// Потужні компоненти
import { SuperInteractiveAgentsDashboard } from './components/dashboard/SuperInteractiveAgentsDashboard';
import { RealtimeSystemMonitor } from './components/monitoring/RealtimeSystemMonitor';
import { AdvancedMetricsPanel } from './components/metrics/AdvancedMetricsPanel';
import { ModelProviderManager } from './components/models/ModelProviderManager';
import { DashboardsPage } from './modules/dashboards/DashboardsPage';
import { IngestPage } from './modules/ingest/IngestPage';
import { AIAssistant } from './components/AIAssistant/AIAssistant';
import { AIAssistantFAB } from './components/AIAssistant/AIAssistantFAB';
import Enhanced3DGuide from './components/guide/Enhanced3DGuide';
// Іконки
import {
  Dashboard, SmartToy, Monitoring, Analytics,
  Storage, CloudUpload, Settings, Gamepad2,
  Rocket, Stars, FlashOn
} from '@mui/icons-material';
import './styles/nexus-global.css';
import './styles/cyberpunk-ui.css';
function App() {
    const [currentView, setCurrentView] = useState('agents-dashboard');
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    const [aiAssistantMinimized, setAiAssistantMinimized] = useState(false);
    const [enhanced3DGuideVisible, setEnhanced3DGuideVisible] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [gameMode, setGameMode] = useState(false);

    // Enhanced navigation with gaming elements
    const navigationItems = [
        {
            key: 'agents-dashboard',
            label: 'AI Agents',
            icon: SmartToy,
            color: '#00ffff',
            description: 'Manage AI Agents',
            xp: 850,
            level: 12
        },
        {
            key: 'models',
            label: 'Model Hub',
            icon: Storage,
            color: '#8a2be2',
            description: 'AI Models & Providers',
            xp: 1200,
            level: 15
        },
        {
            key: 'system-monitor',
            label: 'System Monitor',
            icon: Monitoring,
            color: '#00ff44',
            description: 'Real-time Monitoring',
            xp: 650,
            level: 9
        },
        {
            key: 'metrics',
            label: 'Analytics',
            icon: Analytics,
            color: '#ff6b6b',
            description: 'Advanced Metrics',
            xp: 920,
            level: 13
        },
        {
            key: 'dashboards',
            label: 'Dashboards',
            icon: Dashboard,
            color: '#ffd700',
            description: 'Custom Dashboards',
            xp: 780,
            level: 11
        },
        {
            key: 'ingest',
            label: 'Data Ingest',
            icon: CloudUpload,
            color: '#ff9500',
            description: 'Data Ingestion Hub',
            xp: 1100,
            level: 14
        }
    ];
    // Mock data для демонстрації (буде замінено на реальні API виклики після встановлення пакетів)
    const [agentsData] = useState([
        {
            name: 'SelfHealingAgent',
            status: 'active',
            health: 'excellent',
            cpu: '6%',
            memory: '39%',
            improvements: 12,
            fixes: 9
        },
        {
            name: 'AutoImproveAgent',
            status: 'active',
            health: 'good',
            cpu: '15%',
            memory: '57%',
            improvements: 8,
            fixes: 3
        },
        {
            name: 'SelfDiagnosisAgent',
            status: 'active',
            health: 'excellent',
            cpu: '12%',
            memory: '42%',
            improvements: 5,
            fixes: 7
        },
        {
            name: 'ContainerHealer',
            status: 'active',
            health: 'excellent',
            cpu: '8%',
            memory: '28%',
            improvements: 15,
            fixes: 22
        }
    ]);
    const [systemData] = useState({
        overall_health: 'excellent',
        active_agents: 4,
        total_containers: 27,
        cpu_usage: 24,
        memory_usage: 58
    });
    const handleAIAssistantToggle = () => {
        if (aiAssistantOpen) {
            setAiAssistantOpen(false);
            setAiAssistantMinimized(false);
        }
        else {
            setAiAssistantOpen(true);
            setAiAssistantMinimized(false);
        }
    };
    const handleAIAssistantMinimize = () => {
        setAiAssistantMinimized(!aiAssistantMinimized);
    };
    const renderCurrentView = () => {
        switch (currentView) {
            case 'agents-dashboard':
                return _jsx(SuperInteractiveAgentsDashboard, { agentsData: agentsData, systemData: systemData });
            case 'models':
                return _jsx(ModelProviderManager, {});
            case 'system-monitor':
                return _jsx(RealtimeSystemMonitor, { systemData: systemData });
            case 'metrics':
                return _jsx(AdvancedMetricsPanel, {});
            case 'dashboards':
                return _jsx(DashboardsPage, {});
            case 'ingest':
                return _jsx(IngestPage, {});
            default:
                return _jsx(SuperInteractiveAgentsDashboard, { agentsData: agentsData, systemData: systemData });
        }
    };

    const GameModeToggle = () => (
        _jsx(motion.div, {
            whileHover: { scale: 1.1 },
            whileTap: { scale: 0.95 },
            children: _jsx(IconButton, {
                onClick: () => setGameMode(!gameMode),
                sx: {
                    background: gameMode ?
                        'linear-gradient(45deg, #ff6b35, #f7931e)' :
                        'linear-gradient(45deg, #1a1a2e, #16213e)',
                    border: gameMode ? '2px solid #ff6b35' : '2px solid #00ffff',
                    color: gameMode ? '#000' : '#00ffff',
                    '&:hover': {
                        boxShadow: gameMode ?
                            '0 0 30px #ff6b35' :
                            '0 0 30px #00ffff',
                        transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease'
                },
                children: gameMode ? _jsx(Stars, {}) : _jsx(Gamepad2, {})
            })
        })
    );

    return (_jsx(NexusThemeProvider, {
        defaultThemeId: "dark-cyber",
        children: _jsxs(Box, { sx: {
                minHeight: '100vh',
                background: gameMode ?
                    'linear-gradient(135deg, #0f0517 0%, #1a0a2e 50%, #271542 100%)' :
                    'linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #1a1f35 100%)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.5s ease'
            }, children: [
                _jsx(CssBaseline, {}),

                // Floating particles background
                _jsx(motion.div, {
                    initial: { opacity: 0 },
                    animate: { opacity: gameMode ? 1 : 0.3 },
                    transition: { duration: 1 },
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1
                    },
                    children: Array.from({ length: 50 }).map((_, i) =>
                        _jsx(motion.div, {
                            animate: {
                                y: [0, -20, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1]
                            },
                            transition: {
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            },
                            style: {
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: 4,
                                height: 4,
                                background: gameMode ? '#ff6b35' : '#00ffff',
                                borderRadius: '50%',
                                boxShadow: `0 0 10px ${gameMode ? '#ff6b35' : '#00ffff'}`
                            }
                        }, i)
                    )
                }),

                // Gaming-style top navigation
                _jsx(motion.div, {
                    initial: { y: -100, opacity: 0 },
                    animate: { y: 0, opacity: 1 },
                    transition: { duration: 0.8, ease: "easeOut" },
                    style: {
                        position: 'fixed',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        background: gameMode ?
                            'rgba(255, 107, 53, 0.1)' :
                            'rgba(0, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 25,
                        padding: '15px 25px',
                        border: gameMode ?
                            '2px solid rgba(255, 107, 53, 0.5)' :
                            '2px solid rgba(0, 255, 255, 0.5)',
                        boxShadow: gameMode ?
                            '0 8px 32px rgba(255, 107, 53, 0.3)' :
                            '0 8px 32px rgba(0, 255, 255, 0.3)'
                    },
                    children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [
                        navigationItems.map((item, index) => {
                            const IconComponent = item.icon;
                            const isActive = currentView === item.key;

                            return _jsxs(motion.div, {
                                whileHover: { y: -5 },
                                whileTap: { scale: 0.95 },
                                children: [
                                    _jsx(Button, {
                                        onClick: () => setCurrentView(item.key),
                                        startIcon: _jsx(IconComponent, {}),
                                        sx: {
                                            mx: 0.5,
                                            px: 3,
                                            py: 1.5,
                                            color: isActive ? '#000000' : '#ffffff',
                                            background: isActive ?
                                                `linear-gradient(45deg, ${item.color}, ${item.color}80)` :
                                                'transparent',
                                            border: `2px solid ${item.color}`,
                                            borderRadius: 3,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                background: `${item.color}20`,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 25px ${item.color}40`,
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: '-100%',
                                                    width: '100%',
                                                    height: '100%',
                                                    background: `linear-gradient(90deg, transparent, ${item.color}30, transparent)`,
                                                    animation: 'shimmer 0.6s ease-out'
                                                }
                                            },
                                            transition: 'all 0.3s ease',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            minWidth: 'auto'
                                        },
                                        children: [
                                            _jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: item.label }),
                                            gameMode && _jsxs(Box, { sx: { ml: 1, fontSize: '10px', opacity: 0.8 }, children: [
                                                _jsxs(Typography, { variant: "caption", sx: { color: 'inherit' }, children: ["LVL ", item.level] }),
                                                _jsx("br", {}),
                                                _jsxs(Typography, { variant: "caption", sx: { color: 'inherit' }, children: [item.xp, " XP"] })
                                            ] })
                                        ]
                                    })
                                ]
                            }, item.key);
                        }),
                        _jsx(Box, { sx: { ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.2)' }, children: _jsx(GameModeToggle, {}) })
                    ] })
                }),                 // Main content area with enhanced animations
                _jsx(AnimatePresence, { mode: "wait", children:
                    _jsx(motion.div, {
                        key: currentView,
                        initial: { opacity: 0, y: 50, scale: 0.95 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: -50, scale: 1.05 },
                        transition: {
                            duration: 0.6,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        },
                        style: {
                            paddingTop: '120px',
                            paddingBottom: '20px'
                        },
                        children: renderCurrentView()
                    })
                }),

                // AI Assistant with enhanced styling
                _jsx(AnimatePresence, { children: aiAssistantOpen && (
                    _jsx(motion.div, {
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1 },
                        exit: { opacity: 0, scale: 0.8 },
                        transition: { duration: 0.3 },
                        children: _jsx(AIAssistant, {
                            isOpen: aiAssistantOpen,
                            onClose: () => setAiAssistantOpen(false),
                            isMinimized: aiAssistantMinimized,
                            onMinimize: handleAIAssistantMinimize
                        })
                    })
                ) }),

                // Enhanced AI Assistant FAB
                !aiAssistantOpen && (
                    _jsx(motion.div, {
                        initial: { scale: 0 },
                        animate: { scale: 1 },
                        whileHover: { scale: 1.1 },
                        whileTap: { scale: 0.9 },
                        style: {
                            position: 'fixed',
                            bottom: 30,
                            left: 30,
                            zIndex: 1000
                        },
                        children: _jsx(AIAssistantFAB, { onClick: handleAIAssistantToggle })
                    })
                ),

                // Theme Switcher
                _jsx(ThemeSwitcher, {}),

                // Enhanced 3D Guide
                _jsx(Enhanced3DGuide, {
                    isVisible: enhanced3DGuideVisible,
                    onToggleVisibility: () => setEnhanced3DGuideVisible(!enhanced3DGuideVisible),
                    systemHealth: "optimal",
                    agentsCount: 6,
                    activeAgentsCount: 6
                }),

                // Gaming-style status panel
                _jsx(motion.div, {
                    initial: { opacity: 0, x: 50 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.8, delay: 0.5 },
                    style: {
                        position: 'fixed',
                        bottom: 30,
                        right: 30,
                        zIndex: 100
                    },
                    children: _jsx(Box, { sx: {
                        p: 3,
                        background: gameMode ?
                            'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(196, 76, 255, 0.1))' :
                            'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(138, 43, 226, 0.1))',
                        border: gameMode ?
                            '2px solid rgba(255, 107, 53, 0.3)' :
                            '2px solid rgba(0, 255, 255, 0.3)',
                        borderRadius: 4,
                        backdropFilter: 'blur(20px)',
                        minWidth: 280,
                        transition: 'all 0.3s ease'
                    }, children: [
                        _jsxs(Box, { sx: { mb: 2, textAlign: 'center' }, children: [
                            _jsx(Typography, {
                                variant: "h6",
                                sx: {
                                    color: gameMode ? '#ff6b35' : '#00ffff',
                                    fontWeight: 'bold',
                                    textShadow: gameMode ? '0 0 10px #ff6b35' : '0 0 10px #00ffff'
                                },
                                children: "🚀 PREDATOR12 NEXUS"
                            }),
                            gameMode && _jsx(Typography, {
                                variant: "caption",
                                sx: { color: '#ffd700', fontWeight: 'bold' },
                                children: "⭐ GAME MODE ACTIVE ⭐"
                            })
                        ] }),
                        _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [
                            _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "Active Modules:" }),
                            _jsx(Typography, {
                                variant: "body2",
                                sx: {
                                    color: gameMode ? '#ff6b35' : '#00ffff',
                                    fontWeight: 'bold'
                                },
                                children: `${navigationItems.length}/6`
                            })
                        ] }),
                        _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [
                            _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "AI Agents:" }),
                            _jsx(Typography, {
                                variant: "body2",
                                sx: {
                                    color: '#00ff44',
                                    fontWeight: 'bold'
                                },
                                children: `${agentsData.filter(a => a.status === 'active').length}/${agentsData.length}`
                            })
                        ] }),
                        _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 2 }, children: [
                            _jsx(Typography, { variant: "body2", sx: { color: '#cccccc' }, children: "System Status:" }),
                            _jsx(Typography, {
                                variant: "body2",
                                sx: {
                                    color: '#00ff44',
                                    fontWeight: 'bold'
                                },
                                children: "🟢 OPTIMAL"
                            })
                        ] }),
                        gameMode && _jsx(Box, { sx: {
                            textAlign: 'center',
                            pt: 2,
                            borderTop: '1px solid rgba(255, 107, 53, 0.3)'
                        }, children: [
                            _jsx(Typography, { variant: "caption", sx: { color: '#ffd700' }, children: "Total XP: 6,500" }),
                            _jsx("br", {}),
                            _jsx(Typography, { variant: "caption", sx: { color: '#ff6b35' }, children: "Next Level: 1,500 XP" })
                        ] })
                    ] })
                }),

                // Enhanced performance indicator
                _jsx(motion.div, {
                    initial: { opacity: 0, scale: 0 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.5, delay: 1 },
                    style: {
                        position: 'fixed',
                        top: 100,
                        right: 30,
                        zIndex: 100
                    },
                    children: _jsx(IconButton, {
                        sx: {
                            background: gameMode ?
                                'linear-gradient(45deg, #ff6b35, #c44cff)' :
                                'linear-gradient(45deg, #00ffff, #8a2be2)',
                            color: '#fff',
                            width: 60,
                            height: 60,
                            boxShadow: gameMode ?
                                '0 0 30px rgba(255, 107, 53, 0.5)' :
                                '0 0 30px rgba(0, 255, 255, 0.5)',
                            '&:hover': {
                                transform: 'scale(1.1) rotate(10deg)',
                                boxShadow: gameMode ?
                                    '0 0 40px rgba(255, 107, 53, 0.8)' :
                                    '0 0 40px rgba(0, 255, 255, 0.8)'
                            },
                            transition: 'all 0.3s ease'
                        },
                        children: _jsx(Rocket, { sx: { fontSize: 28 } })
                    })
                })
            ] })
        })
    }));
}
export default App;
