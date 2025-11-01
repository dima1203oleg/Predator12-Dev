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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusCore = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const icons_material_1 = require("@mui/icons-material");
const NexusSidebar_1 = require("./NexusSidebar");
const nexusTheme_1 = require("../../theme/nexusTheme");
const AISupervisionModule_1 = __importDefault(require("./AISupervisionModule"));
const ChronoSpatialModule_1 = __importDefault(require("./ChronoSpatialModule"));
const RealitySimulatorModule_1 = __importDefault(require("./RealitySimulatorModule"));
const AdminModule_1 = __importDefault(require("./AdminModule"));
const DataOpsModule_1 = __importDefault(require("./DataOpsModule"));
const OpenSearchModule_1 = require("./OpenSearchModule");
const AIAssistant_1 = __importDefault(require("../nexus_visuals/AIAssistant"));
const EnhancedDashboard_1 = __importDefault(require("../nexus_visuals/EnhancedDashboard"));
// Gradually enabling new features - using CSS version for visibility
const CSSCosmicDust_1 = require("../effects/CSSCosmicDust");
// import { PhantomScanner } from '../effects/PhantomScanner';
// import { soundSystem, initializeSoundSystem, playAmbient, playActivation, playClick } from '../../utils/soundSystem';
const nexusModules = [
    { id: 'dashboard', label: 'Міст Управління', icon: <icons_material_1.Dashboard />, description: 'Центральний командний центр', color: nexusTheme_1.nexusColors.emerald },
    { id: 'ai-supervision', label: 'Орбітальний Вулик ШІ', icon: <icons_material_1.Psychology />, description: 'Моніторинг агентів MAS', color: nexusTheme_1.nexusColors.sapphire },
    { id: 'dataops', label: 'Фабрика Даних', icon: <icons_material_1.Storage />, description: 'Телепортація та ETL', color: nexusTheme_1.nexusColors.amethyst },
    { id: 'chrono-spatial', label: 'Хроно-Аналіз', icon: <icons_material_1.Timeline />, description: '4D візуалізація подій', color: nexusTheme_1.nexusColors.success },
    { id: 'reality-simulator', label: 'Симулятор Реальностей', icon: <icons_material_1.Science />, description: 'What-if моделювання', color: nexusTheme_1.nexusColors.warning },
    { id: 'opensearch', label: 'Аналітична Палуба', icon: <icons_material_1.Search />, description: 'OpenSearch Dashboard', color: nexusTheme_1.nexusColors.info },
    { id: 'admin', label: 'Святилище Архітектора', icon: <icons_material_1.AdminPanelSettings />, description: 'Системне управління', color: nexusTheme_1.nexusColors.crimson }
];
const NexusCore = () => {
    var _a;
    const [activeModule, setActiveModule] = (0, react_1.useState)('dashboard');
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(true);
    const [aiAssistantOpen, setAiAssistantOpen] = (0, react_1.useState)(false);
    const [aiAssistantSpeaking, setAiAssistantSpeaking] = (0, react_1.useState)(false);
    // Temporarily disabled for debugging
    // const [soundEnabled, setSoundEnabled] = useState(false);
    // const [scannerActive, setScannerActive] = useState(false);
    // const [initialized, setInitialized] = useState(false);
    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard':
                return <EnhancedDashboard_1.default isSpeaking={aiAssistantSpeaking}/>;
            case 'ai-supervision':
                return <AISupervisionModule_1.default />;
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
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 30%, #ff006650 60%, ${nexusTheme_1.nexusColors.darkMatter} 100%)`,
            overflow: 'hidden',
            border: '5px solid #00ff00',
            boxShadow: 'inset 0 0 50px #ff00ff'
        }}>
      <material_1.AppBar position="fixed" sx={{ zIndex: 1300, background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`, boxShadow: `0 4px 20px ${nexusTheme_1.nexusColors.quantum}` }}>
        <material_1.Toolbar>
          <material_1.IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 2 }}>
            <icons_material_1.Menu />
          </material_1.IconButton>
          <material_1.Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Orbitron' }}>
            {((_a = nexusModules.find(m => m.id === activeModule)) === null || _a === void 0 ? void 0 : _a.label) || 'NEXUS CORE'}
          </material_1.Typography>
          <material_1.Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <material_1.Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: nexusTheme_1.nexusColors.success, boxShadow: `0 0 10px ${nexusTheme_1.nexusColors.success}`, animation: 'pulse 2s infinite' }}/>
          </material_1.Box>
        </material_1.Toolbar>
      </material_1.AppBar>

      <NexusSidebar_1.NexusSidebar open={sidebarOpen} modules={nexusModules} activeModule={activeModule} onModuleSelect={setActiveModule}/>

      <material_1.Box component="main" sx={{ flexGrow: 1, pt: 8, pl: sidebarOpen ? '280px' : '80px', transition: 'padding-left 0.3s ease', height: '100vh', overflow: 'hidden', position: 'relative' }}>

        {/* ТЕСТ - ЦЕ ПОВИННО БУТИ ВИДНО! */}
        <material_1.Box sx={{
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
        </material_1.Box>

        {/* Cosmic Dust Background - CSS Version */}
        <CSSCosmicDust_1.CSSCosmicDust particleCount={50}/>

        <framer_motion_1.AnimatePresence mode="wait">
          <framer_motion_1.motion.div key={activeModule} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ height: '100%' }}>
            {renderModule()}
          </framer_motion_1.motion.div>
        </framer_motion_1.AnimatePresence>
      </material_1.Box>

      <material_1.Fab sx={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: nexusTheme_1.nexusColors.amethyst, color: nexusTheme_1.nexusColors.frost, '&:hover': { backgroundColor: nexusTheme_1.nexusColors.amethyst, boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.amethyst}60` }, '&::before': { content: '""', position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.amethyst}, ${nexusTheme_1.nexusColors.sapphire})`, borderRadius: '50%', zIndex: -1, opacity: 0.7, animation: 'pulse 2s infinite' } }} onClick={() => setAiAssistantOpen(true)}>
        <icons_material_1.Psychology />
      </material_1.Fab>

      <material_1.Dialog open={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', maxHeight: '80vh' } }}>
        <material_1.DialogContent sx={{ p: 0 }}>
          <AIAssistant_1.default onSpeakingChange={setAiAssistantSpeaking}/>
        </material_1.DialogContent>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.NexusCore = NexusCore;
