import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  SmartToy as AgentsIcon,
  Storage as DataOpsIcon
} from '@mui/icons-material';
import { nexusColors } from '../theme/nexusTheme';

const DRAWER_WIDTH = 280;

type MenuItem = {
  path: string;
  textUk: string;
  textEn: string;
  icon: React.ReactNode;
  color: string;
  badge?: number;
};

const MENU_ITEMS: MenuItem[] = [
  {
    path: '/dashboard',
    textUk: 'Головна',
    textEn: 'Dashboard',
    icon: <DashboardIcon />,
    color: nexusColors.sapphire
  },
  {
    path: '/agents',
    textUk: 'Агенти',
    textEn: 'Agents',
    icon: <AgentsIcon />,
    color: nexusColors.emerald,
    badge: 26
  },
  {
    path: '/dataops',
    textUk: 'Дані',
    textEn: 'DataOps',
    icon: <DataOpsIcon />,
    color: nexusColors.quantum
  },
  {
    path: '/security',
    textUk: 'Безпека',
    textEn: 'Security',
    icon: <SecurityIcon />,
    color: nexusColors.nebula
  }
];

const SETTINGS_ITEM: MenuItem = {
  path: '/settings',
  textUk: 'Налаштування',
  textEn: 'Settings',
  icon: <SettingsIcon />,
  color: nexusColors.shadow
};

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const currentItem = useMemo(
    () => MENU_ITEMS.find(item => location.pathname.startsWith(item.path)) ?? MENU_ITEMS[0],
    [location.pathname]
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: `linear-gradient(180deg, ${nexusColors.obsidian} 0%, ${nexusColors.darkMatter} 100%)`,
        color: nexusColors.frost
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
            color: nexusColors.obsidian,
            fontWeight: 700
          }}
        >
          NX
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron, monospace', fontWeight: 600 }}>
            Predator Nexus
          </Typography>
          <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
            Command Center
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: `${nexusColors.quantum}40`, mx: 3 }} />

      <List sx={{ flexGrow: 1, py: 2 }}>
        {MENU_ITEMS.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => handleNavigate(item.path)}
              sx={{
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
              }}
            >
              <ListItemIcon sx={{ color: isActive ? item.color : nexusColors.shadow }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="primary">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.textUk}
                secondary={item.textEn}
                primaryTypographyProps={{
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? item.color : nexusColors.frost
                }}
                secondaryTypographyProps={{
                  fontSize: '0.65rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: nexusColors.shadow
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: `${nexusColors.quantum}20`, mx: 3 }} />

      <List sx={{ py: 2 }}>
        <ListItemButton
          onClick={() => handleNavigate(SETTINGS_ITEM.path)}
          sx={{
            mx: 2,
            borderRadius: 2,
            border: `1px solid ${nexusColors.shadow}30`,
            '&:hover': {
              borderColor: `${nexusColors.quantum}60`
            }
          }}
        >
          <ListItemIcon sx={{ color: nexusColors.shadow }}>{SETTINGS_ITEM.icon}</ListItemIcon>
          <ListItemText
            primary={SETTINGS_ITEM.textUk}
            secondary={SETTINGS_ITEM.textEn}
            primaryTypographyProps={{ fontFamily: 'Orbitron, monospace', fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.65rem', letterSpacing: 1, color: nexusColors.shadow }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: `linear-gradient(90deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}F0)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${nexusColors.quantum}40`,
          boxShadow: `0 4px 20px ${nexusColors.obsidian}80`
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(prev => !prev)}
            sx={{ mr: 2, color: nexusColors.frost }}
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                background: `${nexusColors.success}20`,
                color: nexusColors.success,
                border: `1px solid ${nexusColors.success}`,
                fontWeight: 600,
                animation: 'pulse 2s infinite'
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron, monospace', lineHeight: 1 }}>
                {currentItem.textUk}
              </Typography>
              <Typography variant="caption" sx={{ color: nexusColors.shadow, letterSpacing: 2 }}>
                {currentItem.textEn}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setDarkMode(prev => !prev)} sx={{ color: nexusColors.frost }}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <IconButton sx={{ color: nexusColors.frost }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: `linear-gradient(135deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                cursor: 'pointer'
              }}
            >
              AI
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`,
          position: 'relative',
          transition: 'margin 0.3s ease',
          marginLeft: drawerOpen && !isMobile ? 0 : `-${DRAWER_WIDTH}px`
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: 'calc(100vh - 64px)' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  );
};

export default MainLayout;
