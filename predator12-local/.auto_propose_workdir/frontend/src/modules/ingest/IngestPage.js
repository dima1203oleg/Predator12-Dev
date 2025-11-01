"use strict";
// @ts-nocheck
/**
 * 📥 INGEST HUB PAGE
 *
 * Єдиний центр завантажень: файли, посилання, Telegram, статуси
 */
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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
// Import tabs
const FileDropzone_1 = __importDefault(require("./FileDropzone"));
const LinkCollector_1 = __importDefault(require("./LinkCollector"));
const TelegramConnector_1 = __importDefault(require("./TelegramConnector"));
const TaskStream_1 = __importDefault(require("./TaskStream"));
const FlowCanvas_1 = __importDefault(require("./FlowCanvas"));
// ============= COMPONENT =============
const IngestPage = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('files');
    const [activeTasks, setActiveTasks] = (0, react_1.useState)(3); // Mock
    const tabs = [
        {
            value: 'files',
            label: 'Files',
            icon: <icons_material_1.CloudUpload />,
            description: 'CSV, XLSX, PDF, Image, Video'
        },
        {
            value: 'links',
            label: 'Links',
            icon: <icons_material_1.Link />,
            description: 'URL, RSS, Sitemap'
        },
        {
            value: 'telegram',
            label: 'Telegram',
            icon: <icons_material_1.Telegram />,
            description: '@channel, invite link'
        },
        {
            value: 'status',
            label: 'Status',
            icon: <icons_material_1.Assessment />,
            description: 'Черга, прогрес, логи',
            badge: activeTasks
        },
    ];
    return (<material_1.Box sx={{
            p: 3,
            minHeight: '100vh',
            background: nexusThemeV2_1.nexusColorsDark.background.default
        }}>
      {/* Header */}
      <material_1.Stack spacing={3} sx={{ mb: 3 }}>
        <material_1.Box>
          <material_1.Typography variant="h4" sx={{
            fontFamily: 'Orbitron',
            background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
        }}>
            📥 Ingest Hub
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
            Єдиний центр завантаження даних з різних джерел
          </material_1.Typography>
        </material_1.Box>

        {/* Flow Canvas - Mini Data Flow Visualization */}
        <FlowCanvas_1.default />
      </material_1.Stack>

      {/* Tabs Navigation */}
      <material_1.Card sx={{
            background: nexusThemeV2_1.nexusColorsDark.background.paper,
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
            mb: 3
        }}>
        <material_1.Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="fullWidth" sx={{
            '& .MuiTab-root': {
                color: nexusThemeV2_1.nexusColorsDark.text.secondary,
                minHeight: 80,
                '&.Mui-selected': {
                    color: nexusThemeV2_1.nexusColorsDark.primary.main
                }
            },
            '& .MuiTabs-indicator': {
                backgroundColor: nexusThemeV2_1.nexusColorsDark.primary.main,
                height: 3
            }
        }}>
          {tabs.map(tab => (<material_1.Tab key={tab.value} value={tab.value} label={<material_1.Stack spacing={0.5} alignItems="center">
                  <material_1.Badge badgeContent={tab.badge} color="error" invisible={!tab.badge}>
                    {tab.icon}
                  </material_1.Badge>
                  <material_1.Typography variant="body2" fontWeight={600}>
                    {tab.label}
                  </material_1.Typography>
                  <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                    {tab.description}
                  </material_1.Typography>
                </material_1.Stack>}/>))}
        </material_1.Tabs>
      </material_1.Card>

      {/* Tab Content */}
      <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab === 'files' && <FileDropzone_1.default />}
        {activeTab === 'links' && <LinkCollector_1.default />}
        {activeTab === 'telegram' && <TelegramConnector_1.default />}
        {activeTab === 'status' && <TaskStream_1.default onTaskCountChange={setActiveTasks}/>}
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.default = IngestPage;
