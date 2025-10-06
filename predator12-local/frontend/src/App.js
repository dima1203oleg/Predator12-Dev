import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline, Box, Button, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusTheme } from './theme/nexusTheme';
// Імпорт нових надкрутих компонентів (без 3D поки що)
import { SuperInteractiveAgentsDashboard } from './components/dashboard/SuperInteractiveAgentsDashboard';
import { RealtimeSystemMonitor } from './components/monitoring/RealtimeSystemMonitor';
import { AdvancedMetricsPanel } from './components/metrics/AdvancedMetricsPanel';
// Тимчасово використовуємо mock дані замість API
// import { useAgentsStatus, useSystemStatus, useRealTimeMetrics } from './services/agentsAPI';
// ...existing imports...
import { AIAssistant } from './components/AIAssistant/AIAssistant';
import { AIAssistantFAB } from './components/AIAssistant/AIAssistantFAB';
import Enhanced3DGuide from './components/guide/Enhanced3DGuide';
import './styles/nexus-global.css';
import './styles/cyberpunk-ui.css';
function App() {
    const [currentView, setCurrentView] = useState('agents-dashboard');
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    const [aiAssistantMinimized, setAiAssistantMinimized] = useState(false);
    const [enhanced3DGuideVisible, setEnhanced3DGuideVisible] = useState(true);
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
                return (_jsx(SuperInteractiveAgentsDashboard, { agentsData: agentsData, systemData: systemData }));
            case 'system-monitor':
                return (_jsx(RealtimeSystemMonitor, { systemData: systemData }));
            case 'metrics':
                return (_jsx(AdvancedMetricsPanel, {}));
            default:
                return (_jsx(SuperInteractiveAgentsDashboard, { agentsData: agentsData, systemData: systemData }));
        }
    };
    return (_jsxs(ThemeProvider, { theme: nexusTheme, children: [_jsx(CssBaseline, {}), _jsxs(Box, { sx: {
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }, children: [_jsx(motion.div, { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.8, ease: "easeOut" }, style: {
                            position: 'fixed',
                            top: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            background: 'rgba(0, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 20,
                            padding: '10px 20px',
                            border: '1px solid rgba(0, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2)'
                        }, children: [
                            { key: 'agents-dashboard', label: '🤖 Агенти', color: '#00ffff' },
                            { key: 'system-monitor', label: '📊 Моніторинг', color: '#00ff44' },
                            { key: 'metrics', label: '📈 Метрики', color: '#ff6b6b' }
                        ].map((view) => (_jsx(Button, { onClick: () => setCurrentView(view.key), sx: {
                                mx: 1,
                                color: currentView === view.key ? '#000000' : '#ffffff',
                                backgroundColor: currentView === view.key ? view.color : 'transparent',
                                border: `1px solid ${view.color}`,
                                '&:hover': {
                                    backgroundColor: `${view.color}20`,
                                    transform: 'scale(1.05)',
                                    boxShadow: `0 0 20px ${view.color}40`
                                },
                                transition: 'all 0.3s ease',
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }, children: view.label }, view.key))) }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -50 }, transition: { duration: 0.5 }, style: { paddingTop: '80px' }, children: renderCurrentView() }, currentView) }), _jsx(AnimatePresence, { children: aiAssistantOpen && (_jsx(AIAssistant, { isOpen: aiAssistantOpen, onClose: () => setAiAssistantOpen(false), isMinimized: aiAssistantMinimized, onMinimize: handleAIAssistantMinimize })) }), !aiAssistantOpen && (_jsx(AIAssistantFAB, { onClick: handleAIAssistantToggle })), _jsx(Enhanced3DGuide, { isVisible: enhanced3DGuideVisible, onToggleVisibility: () => setEnhanced3DGuideVisible(!enhanced3DGuideVisible), systemHealth: "optimal", agentsCount: 4, activeAgentsCount: 4 }), _jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 1 }, style: {
                            position: 'fixed',
                            bottom: 20,
                            right: 20,
                            zIndex: 100
                        }, children: _jsxs(Box, { sx: {
                                p: 2,
                                bgcolor: 'rgba(0, 0, 0, 0.8)',
                                border: '1px solid rgba(0, 255, 255, 0.3)',
                                borderRadius: 2,
                                backdropFilter: 'blur(20px)',
                                minWidth: 200
                            }, children: [_jsx(Typography, { variant: "caption", sx: { color: '#cccccc', display: 'block' }, children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 PREDATOR11" }), _jsxs(Typography, { variant: "body2", sx: { color: '#00ffff', fontWeight: 'bold' }, children: [agentsData.filter(a => a.status === 'active').length, "/", agentsData.length, " \u0430\u0433\u0435\u043D\u0442\u0456\u0432 \u0430\u043A\u0442\u0438\u0432\u043D\u0456"] }), _jsx(Typography, { variant: "caption", sx: { color: '#00ff44' }, children: "\uD83D\uDFE2 \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u043F\u0440\u0430\u0446\u044E\u0454" })] }) })] })] }));
}
export default App;
