import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Fab, Dialog, DialogContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Dashboard as DashboardIcon, Psychology as AIIcon, Storage as DataIcon, Timeline as ChronoIcon, Science as SimulatorIcon, Search as SearchIcon, AdminPanelSettings as AdminIcon, Menu as MenuIcon } from '@mui/icons-material';
import { NexusSidebar } from './NexusSidebar';
import { nexusColors } from '../../theme/nexusTheme';
import AISupervisionModule from './AISupervisionModule';
import ChronoSpatialModule from './ChronoSpatialModule';
import RealitySimulatorModule from './RealitySimulatorModule';
import AdminModule from './AdminModule';
import DataOpsModule from './DataOpsModule';
import { OpenSearchModule } from './OpenSearchModule';
import AIAssistant from '../nexus_visuals/AIAssistant';
import EnhancedDashboard from '../nexus_visuals/EnhancedDashboard';
const nexusModules = [
    { id: 'dashboard', label: 'Міст Управління', icon: _jsx(DashboardIcon, {}), description: 'Центральний командний центр', color: nexusColors.emerald },
    { id: 'ai-supervision', label: 'Орбітальний Вулик ШІ', icon: _jsx(AIIcon, {}), description: 'Моніторинг агентів MAS', color: nexusColors.sapphire },
    { id: 'dataops', label: 'Фабрика Даних', icon: _jsx(DataIcon, {}), description: 'Телепортація та ETL', color: nexusColors.amethyst },
    { id: 'chrono-spatial', label: 'Хроно-Аналіз', icon: _jsx(ChronoIcon, {}), description: '4D візуалізація подій', color: nexusColors.success },
    { id: 'reality-simulator', label: 'Симулятор Реальностей', icon: _jsx(SimulatorIcon, {}), description: 'What-if моделювання', color: nexusColors.warning },
    { id: 'opensearch', label: 'Аналітична Палуба', icon: _jsx(SearchIcon, {}), description: 'OpenSearch Dashboard', color: nexusColors.info },
    { id: 'admin', label: 'Святилище Архітектора', icon: _jsx(AdminIcon, {}), description: 'Системне управління', color: nexusColors.crimson }
];
export const NexusCore = () => {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    const [aiAssistantSpeaking, setAiAssistantSpeaking] = useState(false);
    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard':
                return _jsx(EnhancedDashboard, { isSpeaking: aiAssistantSpeaking });
            case 'ai-supervision':
                return _jsx(AISupervisionModule, {});
            case 'dataops':
                return _jsx(DataOpsModule, {});
            case 'chrono-spatial':
                return _jsx(ChronoSpatialModule, {});
            case 'reality-simulator':
                return _jsx(RealitySimulatorModule, {});
            case 'opensearch':
                return _jsx(OpenSearchModule, {});
            case 'admin':
                return _jsx(AdminModule, {});
            default:
                return null;
        }
    };
    return (_jsxs(Box, { sx: { height: '100vh', display: 'flex', background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`, overflow: 'hidden' }, children: [_jsx(AppBar, { position: "fixed", sx: { zIndex: 1300, background: `linear-gradient(90deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${nexusColors.quantum}`, boxShadow: `0 4px 20px ${nexusColors.quantum}` }, children: _jsxs(Toolbar, { children: [_jsx(IconButton, { edge: "start", color: "inherit", onClick: () => setSidebarOpen(!sidebarOpen), sx: { mr: 2 }, children: _jsx(MenuIcon, {}) }), _jsx(Typography, { variant: "h6", sx: { flexGrow: 1, fontFamily: 'Orbitron' }, children: nexusModules.find(m => m.id === activeModule)?.label || 'NEXUS CORE' }), _jsx(Box, { sx: { display: 'flex', gap: 1 }, children: _jsx(Box, { sx: { width: 12, height: 12, borderRadius: '50%', backgroundColor: nexusColors.success, boxShadow: `0 0 10px ${nexusColors.success}`, animation: 'pulse 2s infinite' } }) })] }) }), _jsx(NexusSidebar, { open: sidebarOpen, modules: nexusModules, activeModule: activeModule, onModuleSelect: setActiveModule }), _jsx(Box, { component: "main", sx: { flexGrow: 1, pt: 8, pl: sidebarOpen ? '280px' : '80px', transition: 'padding-left 0.3s ease', height: '100vh', overflow: 'hidden' }, children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, style: { height: '100%' }, children: renderModule() }, activeModule) }) }), _jsx(Fab, { sx: { position: 'fixed', bottom: 24, right: 24, backgroundColor: nexusColors.amethyst, color: nexusColors.frost, '&:hover': { backgroundColor: nexusColors.amethyst, boxShadow: `0 0 20px ${nexusColors.amethyst}60` }, '&::before': { content: '""', position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`, borderRadius: '50%', zIndex: -1, opacity: 0.7, animation: 'pulse 2s infinite' } }, onClick: () => setAiAssistantOpen(true), children: _jsx(AIIcon, {}) }), _jsx(Dialog, { open: aiAssistantOpen, onClose: () => setAiAssistantOpen(false), maxWidth: "md", fullWidth: true, PaperProps: { sx: { backgroundColor: 'transparent', boxShadow: 'none', maxHeight: '80vh' } }, children: _jsx(DialogContent, { sx: { p: 0 }, children: _jsx(AIAssistant, { onSpeakingChange: setAiAssistantSpeaking }) }) })] }));
};
