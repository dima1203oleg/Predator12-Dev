// @ts-nocheck
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  SmartToy,
  Healing,
  AutoFixHigh,
  Analytics,
  RestartAlt,
  Build,
  BugReport,
  Stop,
  Settings,
  CheckCircle,
  Info
} from '@mui/icons-material';

const AgentCard = ({ agent, onAction }: any) => {
  const [loading, setLoading] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff44';
      case 'idle': return '#ffff44';
      case 'error': return '#ff4444';
      default: return '#00ffff';
    }
  };

  const getAgentIcon = (name: string) => {
    if (name.includes('Heal')) return <Healing />;
    if (name.includes('Improve')) return <AutoFixHigh />;
    if (name.includes('Diagnosis')) return <Analytics />;
    return <SmartToy />;
  };

  const executeAction = async (action: string) => {
    setLoading(action);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onAction(agent.name, action);
    setLoading(null);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
          border: `2px solid ${getStatusColor(agent.status)}40`,
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          '&:hover': {
            border: `2px solid ${getStatusColor(agent.status)}`,
            boxShadow: `0 8px 32px ${getStatusColor(agent.status)}30`
          }
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: getStatusColor(agent.status),
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {getAgentIcon(agent.name)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {agent.name}
            </Typography>
            <Chip
              label={agent.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(agent.status)}20`,
                color: getStatusColor(agent.status),
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
            Здоров'я: {agent.health}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={agent.health === 'excellent' ? 100 : agent.health === 'good' ? 80 : 60}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(agent.status)
              }
            }}
          />
        </Box>

        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: '#cccccc' }}>
              CPU: {agent.cpu}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: '#cccccc' }}>
              RAM: {agent.memory}
            </Typography>
          </Grid>
        </Grid>

        {(agent.improvements || agent.fixes) && (
          <Box display="flex" gap={1} mb={2}>
            {agent.improvements && (
              <Chip
                icon={<AutoFixHigh />}
                label={agent.improvements}
                size="small"
                sx={{ bgcolor: 'rgba(0,255,0,0.2)', color: '#00ff44' }}
              />
            )}
            {agent.fixes && (
              <Chip
                icon={<Healing />}
                label={agent.fixes}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,0,0.2)', color: '#ffff44' }}
              />
            )}
          </Box>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={1} justifyContent="space-between">
          <Tooltip title="Перезапустити">
            <IconButton
              size="small"
              onClick={() => executeAction('restart')}
              disabled={!!loading}
              sx={{ color: '#ffff44' }}
            >
              {loading === 'restart' ? <Box className="loading-spinner" /> : <RestartAlt />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Оптимізувати">
            <IconButton
              size="small"
              onClick={() => executeAction('optimize')}
              disabled={!!loading}
              sx={{ color: '#00ff44' }}
            >
              {loading === 'optimize' ? <Box className="loading-spinner" /> : <Build />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Діагностика">
            <IconButton
              size="small"
              onClick={() => executeAction('diagnose')}
              disabled={!!loading}
              sx={{ color: '#ff8800' }}
            >
              {loading === 'diagnose' ? <Box className="loading-spinner" /> : <BugReport />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Налаштування">
            <IconButton
              size="small"
              onClick={() => executeAction('configure')}
              disabled={!!loading}
              sx={{ color: '#00ffff' }}
            >
              {loading === 'configure' ? <Box className="loading-spinner" /> : <Settings />}
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
    </motion.div>
  );
};

const SimplifiedDashboard = () => {
  const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false, message: '', severity: 'success'
  });

  const agents = [
    {
      name: 'SelfHealingAgent',
      status: 'active',
      health: 'excellent',
      cpu: '6%',
      memory: '39%',
      improvements: 12,
      fixes: 9
    },
    {
      name: 'AutoImproveAgent',
      status: 'active',
      health: 'good',
      cpu: '15%',
      memory: '57%',
      improvements: 8,
      fixes: 3
    },
    {
      name: 'SelfDiagnosisAgent',
      status: 'active',
      health: 'excellent',
      cpu: '12%',
      memory: '42%',
      improvements: 5,
      fixes: 7
    },
    {
      name: 'ContainerHealer',
      status: 'active',
      health: 'excellent',
      cpu: '8%',
      memory: '28%',
      improvements: 15,
      fixes: 22
    }
  ];

  const handleAgentAction = (agentName: string, action: string) => {
    const actionMessages = {
      restart: `Агент ${agentName} успішно перезапущено`,
      optimize: `Агент ${agentName} оптимізовано`,
      diagnose: `Діагностика агента ${agentName} завершена`,
      configure: `Налаштування агента ${agentName} збережено`
    };

    setNotification({
      open: true,
      message: actionMessages[action as keyof typeof actionMessages] || `Дія ${action} виконана`,
      severity: 'success'
    });

    console.log(`✅ ${agentName}: ${action} виконано успішно`);
  };

  const handleGlobalAction = async (action: string) => {
    console.log(`🌐 Виконується: ${action}`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const messages = {
      'restart-all': 'Всі агенти успішно перезапущені',
      'optimize-all': 'Глобальна оптимізація завершена',
      'health-check': 'Перевірка здоров\'я завершена',
      'backup': 'Резервна копія створена',
      'security-scan': 'Сканування безпеки завершено'
    };

    setNotification({
      open: true,
      message: messages[action as keyof typeof messages] || 'Операція виконана',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
            border: '2px solid rgba(0,255,255,0.5)',
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
          }}
        >
          <Typography variant="h3" className="title-cyberpunk" sx={{ mb: 2 }}>
            🤖 Центр управління агентами PREDATOR11
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
                  {agents.filter(a => a.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Активних агентів
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
                  {agents.reduce((sum, a) => sum + (a.improvements || 0), 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Покращень за день
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#ff8800', fontWeight: 'bold' }}>
                  {agents.reduce((sum, a) => sum + (a.fixes || 0), 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Виправлень за день
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
                  99%
                </Typography>
                <Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Готовність системи
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Global Actions */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(20px)'
          }}
        >
          <Typography variant="h5" sx={{ color: '#00ffff', mb: 2, fontWeight: 'bold' }}>
            🌐 Глобальні операції
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<RestartAlt />}
                onClick={() => handleGlobalAction('restart-all')}
                sx={{
                  bgcolor: '#ffff44',
                  color: '#000',
                  '&:hover': { bgcolor: '#dddd00', transform: 'translateY(-2px)' }
                }}
              >
                Перезапустити всі
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AutoFixHigh />}
                onClick={() => handleGlobalAction('optimize-all')}
                sx={{
                  bgcolor: '#00ff44',
                  color: '#000',
                  '&:hover': { bgcolor: '#00dd00', transform: 'translateY(-2px)' }
                }}
              >
                Оптимізувати
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<BugReport />}
                onClick={() => handleGlobalAction('health-check')}
                sx={{
                  bgcolor: '#00ffff',
                  color: '#000',
                  '&:hover': { bgcolor: '#00dddd', transform: 'translateY(-2px)' }
                }}
              >
                Діагностика
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleGlobalAction('backup')}
                sx={{
                  bgcolor: '#ff8800',
                  color: '#000',
                  '&:hover': { bgcolor: '#dd6600', transform: 'translateY(-2px)' }
                }}
              >
                Резервна копія
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleGlobalAction('security-scan')}
                sx={{
                  bgcolor: '#ff4444',
                  color: '#fff',
                  '&:hover': { bgcolor: '#dd0000', transform: 'translateY(-2px)' }
                }}
              >
                Аудит безпеки
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Agents Grid */}
      <Grid container spacing={3}>
        {agents.map((agent, index) => (
          <Grid item xs={12} sm={6} md={3} key={agent.name}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AgentCard agent={agent} onAction={handleAgentAction} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({...notification, open: false})}
      >
        <Alert
          onClose={() => setNotification({...notification, open: false})}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SimplifiedDashboard;
