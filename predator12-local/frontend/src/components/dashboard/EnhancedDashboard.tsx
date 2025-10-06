// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Container,
  Alert,
  AlertTitle,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useAppEventStore } from '../../stores/appEventStore';
import HealthCard from './HealthCard';
import AgentStatusCard from './AgentStatusCard';
import NotificationHub from '../notifications/NotificationHub';
import GuideDock from '../guide/GuideDock';
import { nexusAPI } from '../../services/nexusAPI';

const EnhancedDashboard: React.FC = () => {
  const { addEvent, activateGuide } = useAppEventStore();
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Завантаження даних
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with real API calls when backend is ready
      const healthData: any = { 
        status: 'optimal', 
        cpu: 45, 
        memory: 62, 
        activeAgents: 12,
        reasons: [] 
      };
      const agentsData: any[] = [];

      setSystemHealth(healthData);
      setAgents(agentsData);
      setLastUpdated(new Date());

      // Генеруємо події для unknown станів
      if (healthData.status === 'unknown') {
        healthData.reasons.forEach((reason: string) => {
          addEvent(
            { type: 'HEALTH_UNKNOWN', source: 'backend', hint: reason },
            'Невідомий стан системи',
            `Невизначений стан системи: ${reason}`,
            'warn'
          );
        });
      }

      // Перевіряємо агентів
      const downAgents = agentsData.filter(a => a.status === 'down');
      downAgents.forEach(agent => {
        addEvent(
          { type: 'AGENT_DOWN', agentId: agent.id },
          'Агент недоступний',
          `Агент ${agent.name} недоступний`,
          'error'
        );
      });

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      addEvent(
        { type: 'NETWORK_OFFLINE' },
        'Помилка мережі',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Обробники дій
  const handleRefresh = () => {
    loadDashboardData();
    activateGuide('dashboard');
  };

  const handleRestartAgent = async (agentId: string) => {
    try {
      // TODO: Implement real restart when backend is ready
      console.log('Restarting agent:', agentId);
      
      addEvent(
        { type: 'ACTION_REQUIRED', cta: { label: 'Перезапуск', run: () => {} } },
        'Перезапуск агента',
        `Agent ${agentId} restart initiated`,
        'success'
      );

      // Оновлюємо дані через кілька секунд
      setTimeout(loadDashboardData, 2000);
    } catch (err) {
      console.error('Restart agent error:', err);
    }
  };

  const handleViewLogs = (agentId: string) => {
    activateGuide('logs');
    addEvent(
      { type: 'ACTION_REQUIRED', cta: { label: 'Відкрити логи', run: () => {} } },
      'Перегляд логів',
      `Відкриваємо логи агента ${agentId}`,
      'info'
    );
  };

  const handleOpenSettings = (componentName?: string) => {
    activateGuide('settings');
    addEvent(
      { type: 'ACTION_REQUIRED', cta: { label: 'Налаштування', run: () => {} } },
      'Відкриття налаштувань',
      `Відкриваємо налаштування ${componentName || 'системи'}`,
      'info'
    );
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Початкове завантаження даних
  useEffect(() => {
    loadDashboardData();
    
    // Автооновлення кожні 30 секунд
    const interval = setInterval(loadDashboardData, 30000);
    
    // TODO: Реальний WebSocket для подій реального часу
    // const ws = nexusAPI.connectWebSocket((event: any) => {
    //   let message = '';
    //   let level: 'info' | 'success' | 'warn' | 'error' = 'info';
    //   
    //   switch (event.type) {
    //     case 'HEALTH_UNKNOWN':
    //       message = `Компонент ${event.source} не відповідає`;
    //       level = 'warn';
    //       break;
    //     case 'AGENT_DOWN':
    //       message = `Агент ${event.agentId} припинив роботу`;
    //       level = 'error';
    //       break;
    //     case 'NETWORK_OFFLINE':
    //       message = 'Втрачено мережеве підключення';
    //       level = 'error';
    //       break;
    //     case 'ACTION_REQUIRED':
    //       message = 'Потрібна дія користувача';
    //       level = 'warn';
    //       break;
    //   }
    //   
    //   if (message) {
    //     addEvent(event, 'Системна подія', message, level);
    //   }
    // });

    return () => {
      clearInterval(interval);
      // ws?.close();
    };
  }, [addEvent]);

  // Обробка fullscreen режиму
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${nexusColors.obsidian} 0%, ${nexusColors.darkMatter} 50%, ${nexusColors.obsidian} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background effects */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${nexusColors.quantum}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${nexusColors.sapphire}10 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${nexusColors.nebula}05 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      />

      {/* Header */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 3, pb: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: nexusColors.frost, 
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 700,
                  textShadow: `0 0 20px ${nexusColors.quantum}50`,
                  background: `linear-gradient(45deg, ${nexusColors.frost}, ${nexusColors.quantum})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Міст Управління
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: nexusColors.nebula, 
                  mt: 1,
                  opacity: 0.8
                }}
              >
                Predator11 • Multi-Agent System Dashboard
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Last updated indicator */}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: nexusColors.nebula, 
                  opacity: 0.7 
                }}
              >
                Оновлено: {lastUpdated.toLocaleTimeString('uk-UA')}
              </Typography>

              <Tooltip title="Оновити дані">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    color: nexusColors.quantum,
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': {
                      backgroundColor: `${nexusColors.quantum}20`
                    }
                  }}
                >
                  <RefreshIcon sx={{ 
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={isFullscreen ? 'Вийти з повноекранного режиму' : 'Повноекранний режим'}>
                <IconButton
                  onClick={handleFullscreenToggle}
                  sx={{
                    color: nexusColors.frost,
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': {
                      backgroundColor: `${nexusColors.frost}20`
                    }
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Налаштування системи">
                <IconButton
                  onClick={() => handleOpenSettings()}
                  sx={{
                    color: nexusColors.nebula,
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': {
                      backgroundColor: `${nexusColors.nebula}20`
                    }
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: `${nexusColors.error}15`,
                border: `1px solid ${nexusColors.error}40`,
                '& .MuiAlert-icon': { color: nexusColors.error }
              }}
              action={
                <IconButton
                  onClick={loadDashboardData}
                  size="small"
                  sx={{ color: nexusColors.error }}
                >
                  <RefreshIcon />
                </IconButton>
              }
            >
              <AlertTitle sx={{ color: nexusColors.frost }}>Помилка завантаження</AlertTitle>
              <Typography sx={{ color: nexusColors.nebula }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Dashboard Grid */}
        <Grid container spacing={3}>
          {/* System Health */}
          <Grid item xs={12} md={6} lg={4}>
            <HealthCard
              title="Стан системи"
              status={systemHealth?.status || 'unknown'}
              metric={systemHealth?.status === 'ok' ? 0.95 : systemHealth?.status === 'degraded' ? 0.7 : undefined}
              details={systemHealth ? `Status: ${systemHealth.status}` : undefined}
              reasons={systemHealth?.reasons}
              onRecheck={loadDashboardData}
              onOpenLogs={() => handleViewLogs('system')}
              onOpenSettings={() => handleOpenSettings('система')}
              loading={loading}
              lastUpdated={lastUpdated}
              helpText="Загальний стан всіх компонентів системи"
              quickActions={systemHealth?.status === 'unknown' ? [
                {
                  label: 'Діагностика',
                  action: () => {
                    activateGuide('diagnostics');
                    addEvent(
                      { type: 'ACTION_REQUIRED', cta: { label: 'Запуск діагностики', run: () => {} } },
                      'Системна діагностика',
                      'Запускаємо повну діагностику системи...',
                      'info'
                    );
                  },
                  primary: true
                }
              ] : []}
            />
          </Grid>

          {/* Components Health */}
          {systemHealth?.components?.map((component: any, index: number) => (
            <Grid item xs={12} md={6} lg={4} key={component.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <HealthCard
                  title={component.name}
                  status={component.status}
                  reasons={component.reasons}
                  onRecheck={loadDashboardData}
                  onOpenLogs={() => handleViewLogs(component.name)}
                  onOpenSettings={() => handleOpenSettings(component.name)}
                  loading={loading}
                  lastUpdated={component.lastCheck}
                  quickActions={[]}
                />
              </motion.div>
            </Grid>
          ))}

          {/* Agents Status */}
          <Grid item xs={12} lg={8}>
            <AgentStatusCard
              agents={agents}
              onRestartAgent={handleRestartAgent}
              onViewLogs={handleViewLogs}
              onOpenSettings={handleOpenSettings}
              loading={loading}
            />
          </Grid>

          {/* Additional metrics can be added here */}
        </Grid>
      </Container>

      {/* Fixed UI elements */}
      <NotificationHub />
      <GuideDock 
        currentModule="dashboard"
        systemHealth={systemHealth?.status}
      />
    </Box>
  );
};

export default EnhancedDashboard;
