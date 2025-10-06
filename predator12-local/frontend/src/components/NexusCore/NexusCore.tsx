// @ts-nocheck
import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Fab, Dialog, DialogContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dashboard as DashboardIcon,
  Psychology as AIIcon,
  Storage as DataIcon,
  Timeline as ChronoIcon,
  Science as SimulatorIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

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
import { NexusModule, NexusMenuItem } from './nexusTypes';
// Gradually enabling new features - using CSS version for visibility
import { CSSCosmicDust } from '../effects/CSSCosmicDust';
// import { PhantomScanner } from '../effects/PhantomScanner';
// import { soundSystem, initializeSoundSystem, playAmbient, playActivation, playClick } from '../../utils/soundSystem';

const nexusModules: NexusMenuItem[] = [
  { id: 'dashboard', label: 'Міст Управління', icon: <DashboardIcon />, description: 'Центральний командний центр', color: nexusColors.emerald },
  { id: 'ai-supervision', label: 'Орбітальний Вулик ШІ', icon: <AIIcon />, description: 'Моніторинг агентів MAS', color: nexusColors.sapphire },
  { id: 'dataops', label: 'Фабрика Даних', icon: <DataIcon />, description: 'Телепортація та ETL', color: nexusColors.amethyst },
  { id: 'chrono-spatial', label: 'Хроно-Аналіз', icon: <ChronoIcon />, description: '4D візуалізація подій', color: nexusColors.success },
  { id: 'reality-simulator', label: 'Симулятор Реальностей', icon: <SimulatorIcon />, description: 'What-if моделювання', color: nexusColors.warning },
  { id: 'opensearch', label: 'Аналітична Палуба', icon: <SearchIcon />, description: 'OpenSearch Dashboard', color: nexusColors.info },
  { id: 'admin', label: 'Святилище Архітектора', icon: <AdminIcon />, description: 'Системне управління', color: nexusColors.crimson }
];

export const NexusCore: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NexusModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantSpeaking, setAiAssistantSpeaking] = useState(false);
  // Temporarily disabled for debugging
  // const [soundEnabled, setSoundEnabled] = useState(false);
  // const [scannerActive, setScannerActive] = useState(false);
  // const [initialized, setInitialized] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <EnhancedDashboard isSpeaking={aiAssistantSpeaking} />;
      case 'ai-supervision':
        return <AISupervisionModule />;
      case 'dataops':
        return <DataOpsModule />;
      case 'chrono-spatial':
        return <ChronoSpatialModule />;
      case 'reality-simulator':
        return <RealitySimulatorModule />;
      case 'opensearch':
        return <OpenSearchModule />;
      case 'admin':
        return <AdminModule />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 30%, #ff006650 60%, ${nexusColors.darkMatter} 100%)`, 
      overflow: 'hidden',
      border: '5px solid #00ff00',
      boxShadow: 'inset 0 0 50px #ff00ff'
    }}>
      <AppBar position="fixed" sx={{ zIndex: 1300, background: `linear-gradient(90deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${nexusColors.quantum}`, boxShadow: `0 4px 20px ${nexusColors.quantum}` }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Orbitron' }}>
            {nexusModules.find(m => m.id === activeModule)?.label || 'NEXUS CORE'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: nexusColors.success, boxShadow: `0 0 10px ${nexusColors.success}`, animation: 'pulse 2s infinite' }} />
          </Box>
        </Toolbar>
      </AppBar>

      <NexusSidebar open={sidebarOpen} modules={nexusModules} activeModule={activeModule} onModuleSelect={setActiveModule} />

      <Box component="main" sx={{ flexGrow: 1, pt: 8, pl: sidebarOpen ? '280px' : '80px', transition: 'padding-left 0.3s ease', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        
        {/* ТЕСТ - ЦЕ ПОВИННО БУТИ ВИДНО! */}
        <Box sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 9999,
          background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
          color: '#ffffff',
          padding: '20px',
          borderRadius: '10px',
          border: '3px solid #ffff00',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px #000000',
          boxShadow: '0 0 20px #ff00ff',
          animation: 'pulse 1s infinite'
        }}>
          🚀 ПОКРАЩЕННЯ АКТИВНІ! 🚀
          <br />
          Якщо бачите це - все працює!
        </Box>

        {/* Cosmic Dust Background - CSS Version */}
        <CSSCosmicDust particleCount={50} />
        
        <AnimatePresence mode="wait">
          <motion.div key={activeModule} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ height: '100%' }}>
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Fab sx={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: nexusColors.amethyst, color: nexusColors.frost, '&:hover': { backgroundColor: nexusColors.amethyst, boxShadow: `0 0 20px ${nexusColors.amethyst}60` }, '&::before': { content: '""', position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`, borderRadius: '50%', zIndex: -1, opacity: 0.7, animation: 'pulse 2s infinite' } }} onClick={() => setAiAssistantOpen(true)}>
        <AIIcon />
      </Fab>

      <Dialog open={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', maxHeight: '80vh' } }}>
        <DialogContent sx={{ p: 0 }}>
          <AIAssistant onSpeakingChange={setAiAssistantSpeaking} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};