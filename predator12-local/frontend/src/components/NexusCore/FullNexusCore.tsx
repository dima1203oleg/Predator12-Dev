// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Fab, Dialog, DialogContent, Switch, FormControlLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dashboard as DashboardIcon,
  Psychology as AIIcon,
  Storage as DataIcon,
  Timeline as ChronoIcon,
  Science as SimulatorIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';

import { NexusSidebar } from './NexusSidebar';
import { nexusColors } from '../../theme/nexusTheme';
import { NexusModule, NexusMenuItem } from './nexusTypes';
import { NexusVisualEffects } from '../effects/NexusVisualEffects';

// Import all modules
import AISupervisionModule from './AISupervisionModule';
import ChronoSpatialModule from './ChronoSpatialModule';
import RealitySimulatorModule from './RealitySimulatorModule';
import AdminModule from './AdminModule';
import DataOpsModule from './DataOpsModule';
import { OpenSearchModule } from './OpenSearchModule';
import CyberSecurityMonitor from '../modules/CyberSecurityMonitor';

// Import enhanced components
import EnhancedDashboard from '../nexus_visuals/EnhancedDashboard';
import AIAssistant from '../nexus_visuals/AIAssistant';

// Import sound system
import { soundSystem, initializeSoundSystem, playAmbient, playActivation, playClick } from '../../utils/soundSystem';

const nexusModules: NexusMenuItem[] = [
  { id: 'dashboard', label: 'Міст Управління', icon: <DashboardIcon />, description: 'Центральний командний центр', color: nexusColors.emerald },
  { id: 'ai-supervision', label: 'Орбітальний Вулик ШІ', icon: <AIIcon />, description: 'Моніторинг 26 агентів MAS', color: nexusColors.sapphire },
  { id: 'security', label: 'Кібер-Захист', icon: <SecurityIcon />, description: 'Моніторинг загроз та захист', color: nexusColors.crimson },
  { id: 'dataops', label: 'Фабрика Даних', icon: <DataIcon />, description: 'Телепортація та ETL', color: nexusColors.amethyst },
  { id: 'chrono-spatial', label: 'Хроно-Аналіз', icon: <ChronoIcon />, description: '4D візуалізація подій', color: nexusColors.success },
  { id: 'reality-simulator', label: 'Симулятор Реальностей', icon: <SimulatorIcon />, description: 'What-if моделювання', color: nexusColors.warning },
  { id: 'opensearch', label: 'Аналітична Палуба', icon: <SearchIcon />, description: 'OpenSearch Dashboard', color: nexusColors.info },
  { id: 'admin', label: 'Святилище Архітектора', icon: <AdminIcon />, description: 'Системне управління', color: nexusColors.crimson }
];

// Mock data for CyberSecurityMonitor
const mockThreats = [
  {
    id: '1',
    name: 'Quantum Intrusion Alpha',
    type: 'intrusion' as const,
    severity: 'critical' as const,
    position: [2, 1, -1] as [number, number, number],
    size: 0.3,
    detected: new Date(),
    source: '192.168.1.100',
    target: 'Core Database',
    status: 'active' as const,
    confidence: 95,
    impact: 85,
    details: 'Detected advanced persistent threat attempting to breach quantum encryption'
  },
  {
    id: '2',
    name: 'Neural Network Anomaly',
    type: 'anomaly' as const,
    severity: 'high' as const,
    position: [-1.5, 0.5, 2] as [number, number, number],
    size: 0.25,
    detected: new Date(),
    source: 'AI Agent 07',
    target: 'Neural Hub',
    status: 'investigating' as const,
    confidence: 78,
    impact: 65,
    details: 'Unusual pattern detected in neural network behavior'
  },
  {
    id: '3',
    name: 'Data Exfiltration Bot',
    type: 'malware' as const,
    severity: 'medium' as const,
    position: [0, -2, 1.5] as [number, number, number],
    size: 0.2,
    detected: new Date(),
    source: 'External IP',
    target: 'Data Warehouse',
    status: 'contained' as const,
    confidence: 82,
    impact: 45,
    details: 'Automated bot attempting data extraction'
  }
];

const mockMetrics = [
  {
    id: '1',
    name: 'Firewall Status',
    value: 98.5,
    unit: '%',
    threshold: 95,
    status: 'safe' as const,
    category: 'firewall' as const,
    history: [95, 96, 97, 98, 98.5],
    lastUpdate: new Date()
  },
  {
    id: '2',
    name: 'Intrusion Detection',
    value: 87.2,
    unit: '%',
    threshold: 90,
    status: 'warning' as const,
    category: 'intrusion' as const,
    history: [90, 89, 88, 87, 87.2],
    lastUpdate: new Date()
  },
  {
    id: '3',
    name: 'Network Security',
    value: 92.8,
    unit: '%',
    threshold: 85,
    status: 'safe' as const,
    category: 'network' as const,
    history: [88, 90, 91, 92, 92.8],
    lastUpdate: new Date()
  },
  {
    id: '4',
    name: 'Access Control',
    value: 99.1,
    unit: '%',
    threshold: 95,
    status: 'safe' as const,
    category: 'access' as const,
    history: [96, 97, 98, 99, 99.1],
    lastUpdate: new Date()
  }
];

export const FullNexusCore: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NexusModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantSpeaking, setAiAssistantSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize sound system on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!initialized) {
        await initializeSoundSystem();
        setInitialized(true);
        if (soundEnabled) {
          playAmbient();
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [initialized, soundEnabled]);

  // Handle sound toggle
  useEffect(() => {
    soundSystem.setEnabled(soundEnabled);
    if (soundEnabled && initialized) {
      playAmbient();
    }
  }, [soundEnabled, initialized]);

  // Play activation sound on module change
  const handleModuleChange = (module: NexusModule) => {
    setActiveModule(module);
    playActivation();
    setScannerActive(true);
    setTimeout(() => setScannerActive(false), 3000);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <EnhancedDashboard isSpeaking={aiAssistantSpeaking} />;
      case 'ai-supervision':
        return <AISupervisionModule />;
      case 'security':
        return (
          <CyberSecurityMonitor
            threats={mockThreats}
            metrics={mockMetrics}
            onThreatAction={(threatId, action) => {
              console.log(`Threat ${threatId}: ${action}`);
              playActivation();
            }}
            onMetricAlert={(metric) => {
              console.log(`Alert for metric: ${metric.name}`);
            }}
            realTimeScanning={true}
            autoResponse={false}
          />
        );
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
      background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`, 
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Nexus Visual Effects */}
      <NexusVisualEffects 
        showCosmicDust={true}
        showHolographicFrames={true}
        showScanLines={true}
      />

      <AppBar position="fixed" sx={{ 
        zIndex: 1300, 
        background: `linear-gradient(90deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`, 
        backdropFilter: 'blur(20px)', 
        borderBottom: `1px solid ${nexusColors.quantum}`, 
        boxShadow: `0 4px 20px ${nexusColors.quantum}` 
      }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Orbitron' }}>
            {nexusModules.find(m => m.id === activeModule)?.label || 'NEXUS CORE'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked);
                    playClick();
                  }}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: nexusColors.emerald
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: nexusColors.emerald
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                  <Typography variant="caption">Sound</Typography>
                </Box>
              }
              sx={{ mr: 2 }}
            />
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: nexusColors.success, 
              boxShadow: `0 0 10px ${nexusColors.success}`, 
              animation: 'pulse 2s infinite' 
            }} />
          </Box>
        </Toolbar>
      </AppBar>

      <NexusSidebar 
        open={sidebarOpen} 
        modules={nexusModules} 
        activeModule={activeModule} 
        onModuleSelect={handleModuleChange} 
      />

      <Box component="main" sx={{ 
        flexGrow: 1, 
        pt: 8, 
        pl: sidebarOpen ? '280px' : '80px', 
        transition: 'padding-left 0.3s ease', 
        height: '100vh', 
        overflow: 'hidden', 
        position: 'relative' 
      }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeModule} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.3 }} 
            style={{ height: '100%' }}
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Fab sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        backgroundColor: nexusColors.amethyst, 
        color: nexusColors.frost, 
        '&:hover': { 
          backgroundColor: nexusColors.amethyst, 
          boxShadow: `0 0 20px ${nexusColors.amethyst}60` 
        }, 
        '&::before': { 
          content: '""', 
          position: 'absolute', 
          top: -2, 
          left: -2, 
          right: -2, 
          bottom: -2, 
          background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`, 
          borderRadius: '50%', 
          zIndex: -1, 
          opacity: 0.7, 
          animation: 'pulse 2s infinite' 
        } 
      }} onClick={() => setAiAssistantOpen(true)}>
        <AIIcon />
      </Fab>

      <Dialog 
        open={aiAssistantOpen} 
        onClose={() => setAiAssistantOpen(false)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            backgroundColor: 'transparent', 
            boxShadow: 'none', 
            maxHeight: '80vh' 
          } 
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <AIAssistant onSpeakingChange={setAiAssistantSpeaking} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FullNexusCore;
