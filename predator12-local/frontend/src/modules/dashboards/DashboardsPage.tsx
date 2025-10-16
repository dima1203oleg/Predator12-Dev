// @ts-nocheck
/**
 * 📊 DASHBOARDS PAGE
 *
 * Вбудований OpenSearch Dashboards з маскуванням брендингу
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';
import DashboardEmbed from './DashboardEmbed';

// ============= TYPES =============

interface DashboardView {
  id: string;
  name: string;
  description: string;
  category: string;
  requiresPII: boolean;
  url: string;
}

// ============= MOCK DATA =============

const DASHBOARD_VIEWS: DashboardView[] = [
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

const DashboardsPage: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [showPII, setShowPII] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('analyst'); // Mock role
  const [availableViews, setAvailableViews] = useState<DashboardView[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const hasPIIAccess = userRole === 'admin' || userRole === 'analyst';

  useEffect(() => {
    // Filter views based on PII access
    const filtered = DASHBOARD_VIEWS.filter(view =>
      !view.requiresPII || (view.requiresPII && hasPIIAccess)
    );
    setAvailableViews(filtered);
  }, [hasPIIAccess]);

  const currentView = availableViews.find(v => v.id === selectedView);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.requestFullscreen?.();
    }
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      background: nexusColors.background.default
    }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{
            fontFamily: 'Orbitron',
            background: nexusColors.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            📊 Dashboards
          </Typography>
          <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
            Візуалізація даних та аналітика в реальному часі
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {hasPIIAccess && (
            <FormControlLabel
              control={
                <Switch
                  checked={showPII}
                  onChange={(e) => setShowPII(e.target.checked)}
                  icon={<VisibilityOffIcon />}
                  checkedIcon={<VisibilityIcon />}
                />
              }
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Показати чутливі дані</Typography>
                  <Chip
                    label="PII"
                    size="small"
                    color={showPII ? "error" : "default"}
                    sx={{ height: 20 }}
                  />
                </Stack>
              }
            />
          )}

          <Tooltip title="Оновити">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon sx={{ color: nexusColors.primary.main }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="На весь екран">
            <IconButton onClick={handleFullscreen} size="small">
              <FullscreenIcon sx={{ color: nexusColors.primary.main }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Налаштування">
            <IconButton size="small">
              <SettingsIcon sx={{ color: nexusColors.text.secondary }} />
            </IconButton>
          </Tooltip>

          <Chip
            label={`Role: ${userRole}`}
            size="small"
            sx={{
              backgroundColor: nexusColors.primary.glow,
              color: nexusColors.primary.main
            }}
          />
        </Stack>
      </Stack>

      {/* PII Warning */}
      {showPII && currentView?.requiresPII && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Увага: Ви переглядаєте дані з особистою інформацією (PII).
          Цей доступ буде зафіксовано в журналі аудиту.
        </Alert>
      )}

      {/* View Tabs */}
      <Card sx={{
        background: nexusColors.background.paper,
        border: `1px solid ${nexusColors.border.light}`,
        mb: 2
      }}>
        <Tabs
          value={selectedView}
          onChange={(_, value) => setSelectedView(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.text.secondary,
              '&.Mui-selected': {
                color: nexusColors.primary.main
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: nexusColors.primary.main
            }
          }}
        >
          {availableViews.map(view => (
            <Tab
              key={view.id}
              value={view.id}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{view.name}</span>
                  {view.requiresPII && (
                    <Chip
                      label="PII"
                      size="small"
                      color="error"
                      sx={{ height: 16, fontSize: '0.65rem' }}
                    />
                  )}
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Card>

      {/* Dashboard Embed */}
      {currentView && (
        <motion.div
          key={`${selectedView}-${refreshKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardEmbed
            url={currentView.url}
            showPII={showPII && currentView.requiresPII}
            title={currentView.name}
          />
        </motion.div>
      )}
    </Box>
  );
};

export default DashboardsPage;
