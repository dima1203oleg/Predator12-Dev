"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullNexusCore = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const icons_material_1 = require("@mui/icons-material");
const NexusSidebar_1 = require("./NexusSidebar");
const nexusTheme_1 = require("../../theme/nexusTheme");
const NexusVisualEffects_1 = require("../effects/NexusVisualEffects");
// Import all modules
const AISupervisionModule_1 = __importDefault(require("./AISupervisionModule"));
const ChronoSpatialModule_1 = __importDefault(require("./ChronoSpatialModule"));
const RealitySimulatorModule_1 = __importDefault(require("./RealitySimulatorModule"));
const AdminModule_1 = __importDefault(require("./AdminModule"));
const DataOpsModule_1 = __importDefault(require("./DataOpsModule"));
const OpenSearchModule_1 = require("./OpenSearchModule");
const CyberSecurityMonitor_1 = __importDefault(require("../modules/CyberSecurityMonitor"));
// Import enhanced components
const EnhancedDashboard_1 = __importDefault(require("../nexus_visuals/EnhancedDashboard"));
const AIAssistant_1 = __importDefault(require("../nexus_visuals/AIAssistant"));
// Import sound system
const soundSystem_1 = require("../../utils/soundSystem");
const nexusModules = [
    { id: 'dashboard', label: 'Міст Управління', icon: <icons_material_1.Dashboard />, description: 'Центральний командний центр', color: nexusTheme_1.nexusColors.emerald },
    { id: 'ai-supervision', label: 'Орбітальний Вулик ШІ', icon: <icons_material_1.Psychology />, description: 'Моніторинг 26 агентів MAS', color: nexusTheme_1.nexusColors.sapphire },
    { id: 'security', label: 'Кібер-Захист', icon: <icons_material_1.Security />, description: 'Моніторинг загроз та захист', color: nexusTheme_1.nexusColors.crimson },
    { id: 'dataops', label: 'Фабрика Даних', icon: <icons_material_1.Storage />, description: 'Телепортація та ETL', color: nexusTheme_1.nexusColors.amethyst },
    { id: 'chrono-spatial', label: 'Хроно-Аналіз', icon: <icons_material_1.Timeline />, description: '4D візуалізація подій', color: nexusTheme_1.nexusColors.success },
    { id: 'reality-simulator', label: 'Симулятор Реальностей', icon: <icons_material_1.Science />, description: 'What-if моделювання', color: nexusTheme_1.nexusColors.warning },
    { id: 'opensearch', label: 'Аналітична Палуба', icon: <icons_material_1.Search />, description: 'OpenSearch Dashboard', color: nexusTheme_1.nexusColors.info },
    { id: 'admin', label: 'Святилище Архітектора', icon: <icons_material_1.AdminPanelSettings />, description: 'Системне управління', color: nexusTheme_1.nexusColors.crimson }
];
// Mock data for CyberSecurityMonitor
const mockThreats = [
    {
        id: '1',
        name: 'Quantum Intrusion Alpha',
        type: 'intrusion',
        severity: 'critical',
        position: [2, 1, -1],
        size: 0.3,
        detected: new Date(),
        source: '192.168.1.100',
        target: 'Core Database',
        status: 'active',
        confidence: 95,
        impact: 85,
        details: 'Detected advanced persistent threat attempting to breach quantum encryption'
    },
    {
        id: '2',
        name: 'Neural Network Anomaly',
        type: 'anomaly',
        severity: 'high',
        position: [-1.5, 0.5, 2],
        size: 0.25,
        detected: new Date(),
        source: 'AI Agent 07',
        target: 'Neural Hub',
        status: 'investigating',
        confidence: 78,
        impact: 65,
        details: 'Unusual pattern detected in neural network behavior'
    },
    {
        id: '3',
        name: 'Data Exfiltration Bot',
        type: 'malware',
        severity: 'medium',
        position: [0, -2, 1.5],
        size: 0.2,
        detected: new Date(),
        source: 'External IP',
        target: 'Data Warehouse',
        status: 'contained',
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
        status: 'safe',
        category: 'firewall',
        history: [95, 96, 97, 98, 98.5],
        lastUpdate: new Date()
    },
    {
        id: '2',
        name: 'Intrusion Detection',
        value: 87.2,
        unit: '%',
        threshold: 90,
        status: 'warning',
        category: 'intrusion',
        history: [90, 89, 88, 87, 87.2],
        lastUpdate: new Date()
    },
    {
        id: '3',
        name: 'Network Security',
        value: 92.8,
        unit: '%',
        threshold: 85,
        status: 'safe',
        category: 'network',
        history: [88, 90, 91, 92, 92.8],
        lastUpdate: new Date()
    },
    {
        id: '4',
        name: 'Access Control',
        value: 99.1,
        unit: '%',
        threshold: 95,
        status: 'safe',
        category: 'access',
        history: [96, 97, 98, 99, 99.1],
        lastUpdate: new Date()
    }
];
const FullNexusCore = () => {
    var _a;
    const [activeModule, setActiveModule] = (0, react_1.useState)('dashboard');
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(true);
    const [aiAssistantOpen, setAiAssistantOpen] = (0, react_1.useState)(false);
    const [aiAssistantSpeaking, setAiAssistantSpeaking] = (0, react_1.useState)(false);
    const [soundEnabled, setSoundEnabled] = (0, react_1.useState)(false);
    const [scannerActive, setScannerActive] = (0, react_1.useState)(false);
    const [initialized, setInitialized] = (0, react_1.useState)(false);
    // Initialize sound system on first user interaction
    (0, react_1.useEffect)(() => {
        const handleFirstInteraction = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!initialized) {
                yield (0, soundSystem_1.initializeSoundSystem)();
                setInitialized(true);
                if (soundEnabled) {
                    (0, soundSystem_1.playAmbient)();
                }
            }
        });
        window.addEventListener('click', handleFirstInteraction, { once: true });
        return () => window.removeEventListener('click', handleFirstInteraction);
    }, [initialized, soundEnabled]);
    // Handle sound toggle
    (0, react_1.useEffect)(() => {
        soundSystem_1.soundSystem.setEnabled(soundEnabled);
        if (soundEnabled && initialized) {
            (0, soundSystem_1.playAmbient)();
        }
    }, [soundEnabled, initialized]);
    // Play activation sound on module change
    const handleModuleChange = (module) => {
        setActiveModule(module);
        (0, soundSystem_1.playActivation)();
        setScannerActive(true);
        setTimeout(() => setScannerActive(false), 3000);
    };
    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard':
                return <EnhancedDashboard_1.default isSpeaking={aiAssistantSpeaking}/>;
            case 'ai-supervision':
                return <AISupervisionModule_1.default />;
            case 'security':
                return (<CyberSecurityMonitor_1.default threats={mockThreats} metrics={mockMetrics} onThreatAction={(threatId, action) => {
                        console.log(`Threat ${threatId}: ${action}`);
                        (0, soundSystem_1.playActivation)();
                    }} onMetricAlert={(metric) => {
                        console.log(`Alert for metric: ${metric.name}`);
                    }} realTimeScanning={true} autoResponse={false}/>);
            case 'dataops':
                return <DataOpsModule_1.default />;
            case 'chrono-spatial':
                return <ChronoSpatialModule_1.default />;
            case 'reality-simulator':
                return <RealitySimulatorModule_1.default />;
            case 'opensearch':
                return <OpenSearchModule_1.OpenSearchModule />;
            case 'admin':
                return <AdminModule_1.default />;
            default:
                return null;
        }
    };
    return (<material_1.Box sx={{
            height: '100vh',
            display: 'flex',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 50%, ${nexusTheme_1.nexusColors.darkMatter} 100%)`,
            overflow: 'hidden',
            position: 'relative'
        }}>
      {/* Nexus Visual Effects */}
      <NexusVisualEffects_1.NexusVisualEffects showCosmicDust={true} showHolographicFrames={true} showScanLines={true}/>

      <material_1.AppBar position="fixed" sx={{
            zIndex: 1300,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            boxShadow: `0 4px 20px ${nexusTheme_1.nexusColors.quantum}`
        }}>
        <material_1.Toolbar>
          <material_1.IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 2 }}>
            <icons_material_1.Menu />
          </material_1.IconButton>
          <material_1.Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Orbitron' }}>
            {((_a = nexusModules.find(m => m.id === activeModule)) === null || _a === void 0 ? void 0 : _a.label) || 'NEXUS CORE'}
          </material_1.Typography>
          <material_1.Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <material_1.FormControlLabel control={<material_1.Switch checked={soundEnabled} onChange={(e) => {
                setSoundEnabled(e.target.checked);
                (0, soundSystem_1.playClick)();
            }} size="small" sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.emerald
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: nexusTheme_1.nexusColors.emerald
                }
            }}/>} label={<material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {soundEnabled ? <icons_material_1.VolumeUp fontSize="small"/> : <icons_material_1.VolumeOff fontSize="small"/>}
                  <material_1.Typography variant="caption">Sound</material_1.Typography>
                </material_1.Box>} sx={{ mr: 2 }}/>
            <material_1.Box sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: nexusTheme_1.nexusColors.success,
            boxShadow: `0 0 10px ${nexusTheme_1.nexusColors.success}`,
            animation: 'pulse 2s infinite'
        }}/>
          </material_1.Box>
        </material_1.Toolbar>
      </material_1.AppBar>

      <NexusSidebar_1.NexusSidebar open={sidebarOpen} modules={nexusModules} activeModule={activeModule} onModuleSelect={handleModuleChange}/>

      <material_1.Box component="main" sx={{
            flexGrow: 1,
            pt: 8,
            pl: sidebarOpen ? '280px' : '80px',
            transition: 'padding-left 0.3s ease',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative'
        }}>
        <framer_motion_1.AnimatePresence mode="wait">
          <framer_motion_1.motion.div key={activeModule} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ height: '100%' }}>
            {renderModule()}
          </framer_motion_1.motion.div>
        </framer_motion_1.AnimatePresence>
      </material_1.Box>

      <material_1.Fab sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: nexusTheme_1.nexusColors.amethyst,
            color: nexusTheme_1.nexusColors.frost,
            '&:hover': {
                backgroundColor: nexusTheme_1.nexusColors.amethyst,
                boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.amethyst}60`
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.sapphire})`,
                borderRadius: '50%',
                zIndex: -1,
                opacity: 0.7,
                animation: 'pulse 2s infinite'
            }
        }} onClick={() => setAiAssistantOpen(true)}>
        <icons_material_1.Psychology />
      </material_1.Fab>

      <material_1.Dialog open={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                maxHeight: '80vh'
            }
        }}>
        <material_1.DialogContent sx={{ p: 0 }}>
          <AIAssistant_1.default onSpeakingChange={setAiAssistantSpeaking}/>
        </material_1.DialogContent>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.FullNexusCore = FullNexusCore;
exports.default = exports.FullNexusCore;
