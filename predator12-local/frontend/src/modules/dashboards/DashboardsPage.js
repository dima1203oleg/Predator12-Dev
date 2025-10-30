"use strict";
// @ts-nocheck
/**
 * 📊 DASHBOARDS PAGE
 *
 * Вбудований OpenSearch Dashboards з маскуванням брендингу
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
const DashboardEmbed_1 = __importDefault(require("./DashboardEmbed"));
// ============= MOCK DATA =============
const DASHBOARD_VIEWS = [
    {
        id: 'overview',
        name: 'System Overview',
        description: 'Загальний огляд системи',
        category: 'general',
        requiresPII: false,
        url: '/proxy/osd/app/dashboards#/view/system-overview'
    },
    {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Аналітика використання',
        category: 'analytics',
        requiresPII: false,
        url: '/proxy/osd/app/dashboards#/view/analytics'
    },
    {
        id: 'users',
        name: 'User Activity',
        description: 'Активність користувачів',
        category: 'users',
        requiresPII: true,
        url: '/proxy/osd/app/dashboards#/view/user-activity'
    },
    {
        id: 'security',
        name: 'Security Monitoring',
        description: 'Моніторинг безпеки',
        category: 'security',
        requiresPII: false,
        url: '/proxy/osd/app/dashboards#/view/security'
    }
];
// ============= COMPONENT =============
const DashboardsPage = () => {
    const [selectedView, setSelectedView] = (0, react_1.useState)('overview');
    const [showPII, setShowPII] = (0, react_1.useState)(false);
    const [userRole, setUserRole] = (0, react_1.useState)('analyst'); // Mock role
    const [availableViews, setAvailableViews] = (0, react_1.useState)([]);
    const [refreshKey, setRefreshKey] = (0, react_1.useState)(0);
    const hasPIIAccess = userRole === 'admin' || userRole === 'analyst';
    (0, react_1.useEffect)(() => {
        // Filter views based on PII access
        const filtered = DASHBOARD_VIEWS.filter(view => !view.requiresPII || (view.requiresPII && hasPIIAccess));
        setAvailableViews(filtered);
    }, [hasPIIAccess]);
    const currentView = availableViews.find(v => v.id === selectedView);
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };
    const handleFullscreen = () => {
        var _a;
        const iframe = document.querySelector('iframe');
        if (iframe) {
            (_a = iframe.requestFullscreen) === null || _a === void 0 ? void 0 : _a.call(iframe);
        }
    };
    return (<material_1.Box sx={{
            p: 3,
            minHeight: '100vh',
            background: nexusThemeV2_1.nexusColorsDark.background.default
        }}>
      {/* Header */}
      <material_1.Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <material_1.Box>
          <material_1.Typography variant="h4" sx={{
            fontFamily: 'Orbitron',
            background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
        }}>
            📊 Dashboards
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
            Візуалізація даних та аналітика в реальному часі
          </material_1.Typography>
        </material_1.Box>

        <material_1.Stack direction="row" spacing={2} alignItems="center">
          {hasPIIAccess && (<material_1.FormControlLabel control={<material_1.Switch checked={showPII} onChange={(e) => setShowPII(e.target.checked)} icon={<icons_material_1.VisibilityOff />} checkedIcon={<icons_material_1.Visibility />}/>} label={<material_1.Stack direction="row" spacing={1} alignItems="center">
                  <material_1.Typography variant="body2">Показати чутливі дані</material_1.Typography>
                  <material_1.Chip label="PII" size="small" color={showPII ? "error" : "default"} sx={{ height: 20 }}/>
                </material_1.Stack>}/>)}

          <material_1.Tooltip title="Оновити">
            <material_1.IconButton onClick={handleRefresh} size="small">
              <icons_material_1.Refresh sx={{ color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="На весь екран">
            <material_1.IconButton onClick={handleFullscreen} size="small">
              <icons_material_1.Fullscreen sx={{ color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Налаштування">
            <material_1.IconButton size="small">
              <icons_material_1.Settings sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}/>
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Chip label={`Role: ${userRole}`} size="small" sx={{
            backgroundColor: nexusThemeV2_1.nexusColorsDark.primary.glow,
            color: nexusThemeV2_1.nexusColorsDark.primary.main
        }}/>
        </material_1.Stack>
      </material_1.Stack>

      {/* PII Warning */}
      {showPII && (currentView === null || currentView === void 0 ? void 0 : currentView.requiresPII) && (<material_1.Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Увага: Ви переглядаєте дані з особистою інформацією (PII).
          Цей доступ буде зафіксовано в журналі аудиту.
        </material_1.Alert>)}

      {/* View Tabs */}
      <material_1.Card sx={{
            background: nexusThemeV2_1.nexusColorsDark.background.paper,
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
            mb: 2
        }}>
        <material_1.Tabs value={selectedView} onChange={(_, value) => setSelectedView(value)} variant="scrollable" scrollButtons="auto" sx={{
            '& .MuiTab-root': {
                color: nexusThemeV2_1.nexusColorsDark.text.secondary,
                '&.Mui-selected': {
                    color: nexusThemeV2_1.nexusColorsDark.primary.main
                }
            },
            '& .MuiTabs-indicator': {
                backgroundColor: nexusThemeV2_1.nexusColorsDark.primary.main
            }
        }}>
          {availableViews.map(view => (<material_1.Tab key={view.id} value={view.id} label={<material_1.Stack direction="row" spacing={1} alignItems="center">
                  <span>{view.name}</span>
                  {view.requiresPII && (<material_1.Chip label="PII" size="small" color="error" sx={{ height: 16, fontSize: '0.65rem' }}/>)}
                </material_1.Stack>}/>))}
        </material_1.Tabs>
      </material_1.Card>

      {/* Dashboard Embed */}
      {currentView && (<framer_motion_1.motion.div key={`${selectedView}-${refreshKey}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <DashboardEmbed_1.default url={currentView.url} showPII={showPII && currentView.requiresPII} title={currentView.name}/>
        </framer_motion_1.motion.div>)}
    </material_1.Box>);
};
exports.default = DashboardsPage;
