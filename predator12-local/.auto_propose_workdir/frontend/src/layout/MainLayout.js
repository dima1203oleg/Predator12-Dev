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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainLayout = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../theme/nexusTheme");
const DRAWER_WIDTH = 280;
const MENU_ITEMS = [
    {
        path: '/dashboard',
        textUk: 'Головна',
        textEn: 'Dashboard',
        icon: <icons_material_1.Dashboard />,
        color: nexusTheme_1.nexusColors.sapphire
    },
    {
        path: '/agents',
        textUk: 'Агенти',
        textEn: 'Agents',
        icon: <icons_material_1.SmartToy />,
        color: nexusTheme_1.nexusColors.emerald,
        badge: 26
    },
    {
        path: '/dataops',
        textUk: 'Дані',
        textEn: 'DataOps',
        icon: <icons_material_1.Storage />,
        color: nexusTheme_1.nexusColors.quantum
    },
    {
        path: '/security',
        textUk: 'Безпека',
        textEn: 'Security',
        icon: <icons_material_1.Security />,
        color: nexusTheme_1.nexusColors.nebula
    }
];
const SETTINGS_ITEM = {
    path: '/settings',
    textUk: 'Налаштування',
    textEn: 'Settings',
    icon: <icons_material_1.Settings />,
    color: nexusTheme_1.nexusColors.shadow
};
const MainLayout = () => {
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('md'));
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const [drawerOpen, setDrawerOpen] = (0, react_1.useState)(true);
    const [darkMode, setDarkMode] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setDrawerOpen(!isMobile);
    }, [isMobile]);
    const currentItem = (0, react_1.useMemo)(() => { var _a; return (_a = MENU_ITEMS.find(item => location.pathname.startsWith(item.path))) !== null && _a !== void 0 ? _a : MENU_ITEMS[0]; }, [location.pathname]);
    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) {
            setDrawerOpen(false);
        }
    };
    const drawerContent = (<material_1.Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: `linear-gradient(180deg, ${nexusTheme_1.nexusColors.obsidian} 0%, ${nexusTheme_1.nexusColors.darkMatter} 100%)`,
            color: nexusTheme_1.nexusColors.frost
        }}>
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <material_1.Avatar sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            color: nexusTheme_1.nexusColors.obsidian,
            fontWeight: 700
        }}>
          NX
        </material_1.Avatar>
        <material_1.Box>
          <material_1.Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron, monospace', fontWeight: 600 }}>
            Predator Nexus
          </material_1.Typography>
          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
            Command Center
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>

      <material_1.Divider sx={{ borderColor: `${nexusTheme_1.nexusColors.quantum}40`, mx: 3 }}/>

      <material_1.List sx={{ flexGrow: 1, py: 2 }}>
        {MENU_ITEMS.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (<material_1.ListItemButton key={item.path} selected={isActive} onClick={() => handleNavigate(item.path)} sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: isActive ? `${item.color}20` : 'transparent',
                    border: isActive ? `1px solid ${item.color}60` : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: `${item.color}20`,
                        borderColor: `${item.color}40`
                    }
                }}>
              <material_1.ListItemIcon sx={{ color: isActive ? item.color : nexusTheme_1.nexusColors.shadow }}>
                {item.badge ? (<material_1.Badge badgeContent={item.badge} color="primary">
                    {item.icon}
                  </material_1.Badge>) : (item.icon)}
              </material_1.ListItemIcon>
              <material_1.ListItemText primary={item.textUk} secondary={item.textEn} primaryTypographyProps={{
                    fontFamily: 'Orbitron, monospace',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? item.color : nexusTheme_1.nexusColors.frost
                }} secondaryTypographyProps={{
                    fontSize: '0.65rem',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: nexusTheme_1.nexusColors.shadow
                }}/>
            </material_1.ListItemButton>);
        })}
      </material_1.List>

      <material_1.Divider sx={{ borderColor: `${nexusTheme_1.nexusColors.quantum}20`, mx: 3 }}/>

      <material_1.List sx={{ py: 2 }}>
        <material_1.ListItemButton onClick={() => handleNavigate(SETTINGS_ITEM.path)} sx={{
            mx: 2,
            borderRadius: 2,
            border: `1px solid ${nexusTheme_1.nexusColors.shadow}30`,
            '&:hover': {
                borderColor: `${nexusTheme_1.nexusColors.quantum}60`
            }
        }}>
          <material_1.ListItemIcon sx={{ color: nexusTheme_1.nexusColors.shadow }}>{SETTINGS_ITEM.icon}</material_1.ListItemIcon>
          <material_1.ListItemText primary={SETTINGS_ITEM.textUk} secondary={SETTINGS_ITEM.textEn} primaryTypographyProps={{ fontFamily: 'Orbitron, monospace', fontWeight: 500 }} secondaryTypographyProps={{ fontSize: '0.65rem', letterSpacing: 1, color: nexusTheme_1.nexusColors.shadow }}/>
        </material_1.ListItemButton>
      </material_1.List>
    </material_1.Box>);
    return (<material_1.Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <material_1.AppBar position="fixed" sx={{
            zIndex: theme.zIndex.drawer + 1,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}F0)`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
            boxShadow: `0 4px 20px ${nexusTheme_1.nexusColors.obsidian}80`
        }}>
        <material_1.Toolbar>
          <material_1.IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(prev => !prev)} sx={{ mr: 2, color: nexusTheme_1.nexusColors.frost }}>
            {drawerOpen ? <icons_material_1.Close /> : <icons_material_1.Menu />}
          </material_1.IconButton>

          <material_1.Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <material_1.Chip label="LIVE" size="small" sx={{
            background: `${nexusTheme_1.nexusColors.success}20`,
            color: nexusTheme_1.nexusColors.success,
            border: `1px solid ${nexusTheme_1.nexusColors.success}`,
            fontWeight: 600,
            animation: 'pulse 2s infinite'
        }}/>
            <material_1.Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron, monospace', lineHeight: 1 }}>
                {currentItem.textUk}
              </material_1.Typography>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, letterSpacing: 2 }}>
                {currentItem.textEn}
              </material_1.Typography>
            </material_1.Box>
          </material_1.Box>

          <material_1.Box sx={{ display: 'flex', gap: 1 }}>
            <material_1.IconButton onClick={() => setDarkMode(prev => !prev)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
              {darkMode ? <icons_material_1.Brightness7 /> : <icons_material_1.Brightness4 />}
            </material_1.IconButton>

            <material_1.IconButton sx={{ color: nexusTheme_1.nexusColors.frost }}>
              <material_1.Badge badgeContent={3} color="error">
                <icons_material_1.Notifications />
              </material_1.Badge>
            </material_1.IconButton>

            <material_1.Avatar sx={{
            width: 32,
            height: 32,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            cursor: 'pointer'
        }}>
              AI
            </material_1.Avatar>
          </material_1.Box>
        </material_1.Toolbar>
      </material_1.AppBar>

      <material_1.Drawer variant={isMobile ? 'temporary' : 'persistent'} open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                border: 'none'
            }
        }}>
        {drawerContent}
      </material_1.Drawer>

      <material_1.Box component="main" sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 50%, ${nexusTheme_1.nexusColors.darkMatter} 100%)`,
            position: 'relative',
            transition: 'margin 0.3s ease',
            marginLeft: drawerOpen && !isMobile ? 0 : `-${DRAWER_WIDTH}px`
        }}>
        <material_1.Toolbar />
        <framer_motion_1.AnimatePresence mode="wait">
          <framer_motion_1.motion.div key={location.pathname} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} style={{ height: 'calc(100vh - 64px)' }}>
            <react_router_dom_1.Outlet />
          </framer_motion_1.motion.div>
        </framer_motion_1.AnimatePresence>
      </material_1.Box>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </material_1.Box>);
};
exports.MainLayout = MainLayout;
exports.default = exports.MainLayout;
