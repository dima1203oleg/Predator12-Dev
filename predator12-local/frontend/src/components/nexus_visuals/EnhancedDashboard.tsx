// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  IconButton
} from '@mui/material';
import {
  Security as SecurityIcon,
  DataUsage as DataIcon,
  Psychology as AIIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { nexusAPI, SystemStatus, Agent } from '../../services/nexusAPI';
import { nexusColors } from '../../theme/nexusTheme';
import AlertTicker from './AlertTicker';
import GuidePanel from '../guide/GuidePanel';
import ContextualChat from '../guide/ContextualChat';

type ContextualHealth = 'optimal' | 'degraded' | 'unknown' | 'critical';

const mapSystemHealth = (rawHealth?: string): ContextualHealth => {
  if (!rawHealth) {
    return 'unknown';
  }

  switch (rawHealth.toLowerCase()) {
    case 'optimal':
    case 'healthy':
      return 'optimal';
    case 'warning':
    case 'degraded':
    case 'caution':
      return 'degraded';
    case 'critical':
    case 'failure':
    case 'down':
      return 'critical';
    default:
      return 'unknown';
  }
};

const EnhancedDashboard: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    fetchData();

    // Set up WebSocket for real-time updates
    const ws = nexusAPI.connect3DStream((data) => {
      setRealTimeData(data);
    });

    // Periodic refresh
    const interval = setInterval(fetchData, 10000);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [statusData, agentsData] = await Promise.all([
        nexusAPI.getSystemStatus(),
        nexusAPI.getAgentsStatus()
      ]);

      setSystemStatus(statusData);
      setAgents(agentsData.agents);
      setRealTimeData({ etl_count: 3, data_volume: '1.2 TB' });
      setFailed(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFailed(true);
      setLoading(false);
      setSystemStatus({
        system_health: 'optimal',
        health: 'optimal',
        health_percentage: 95,
        active_agents: 12,
        quantum_events: 47,
        galactic_risks: 'minimal',
        data_teleportation: 'active',
        neural_network: 'operational',
        anomaly_chronicle: [
          {
            type: 'demo',
            level: 'info',
            location: 'Nexus Core',
            timestamp: new Date().toISOString()
          }
        ]
      });
      setAgents([
        { name: 'ETL-Agent-01', status: 'active', health: 'optimal', cpu: '45%', memory: '32%', type: 'etl' },
        { name: 'MAS-Agent-02', status: 'active', health: 'optimal', cpu: '67%', memory: '28%', type: 'mas' },
        { name: 'Security-Agent-03', status: 'warning', health: 'warning', cpu: '89%', memory: '71%', type: 'security' },
        { name: 'Data-Agent-04', status: 'active', health: 'optimal', cpu: '23%', memory: '19%', type: 'data' },
        { name: 'Analytics-Agent-05', status: 'active', health: 'optimal', cpu: '55%', memory: '41%', type: 'analytics' }
      ]);
      setRealTimeData({ etl_count: 3, data_volume: '1.2 TB' });
    }
  };

  const handleGuideAction = (action: string) => {
    switch (action) {
      case 'optimize-agents':
        console.log('Оптимізація агентів...');
        break;
      case 'restart-unhealthy':
        console.log('Перезапуск проблемних агентів...');
        break;
      case 'analyze-queues':
        console.log('Аналіз черг...');
        break;
      case 'clear-cache':
        console.log('Очищення кешу...');
        break;
      case 'apply-optimizations':
        console.log('Застосування оптимізацій...');
        break;
      case 'create-optimization-plan':
        console.log('Створення плану оптимізації...');
        break;
      case 'renew-certificates':
        console.log('Оновлення сертифікатів...');
        break;
      case 'security-audit':
        console.log('Повний аудит безпеки...');
        break;
      case 'deep-analysis':
        console.log('Глибший аналіз...');
        break;
      case 'show-metrics':
        console.log('Показ метрик...');
        break;
      case 'toggle-chat':
        setShowChat((v) => !v);
        break;
      default:
        console.log('Дія з чату:', action);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
          Завантаження дашборду...
        </Typography>
        <LinearProgress sx={{ color: nexusColors.emerald }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: `linear-gradient(135deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})` }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
          Enhanced Dashboard
        </Typography>
        <IconButton onClick={fetchData} sx={{ ml: 2, color: nexusColors.emerald }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {failed && (
        <Box sx={{ mb: 3, px: 2, py: 1.5, borderRadius: 2, border: `1px solid ${nexusColors.warning}60`, backgroundColor: `${nexusColors.warning}10` }}>
          <Typography variant="body2" sx={{ color: nexusColors.warning }}>
            Працюємо у демонстраційному режимі. Бекенд недоступний, показуємо мок-дані.
          </Typography>
        </Box>
      )}

      {/* Alert Ticker */}
      <AlertTicker
        filterSeverities={['warning', 'critical']}
      />

      {/* Main Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
        {/* System Status Card */}
        <Card sx={{
          backgroundColor: `${nexusColors.obsidian}60`,
          border: `1px solid ${nexusColors.quantum}`,
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ color: nexusColors.sapphire, mr: 1 }} />
              <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                System Status
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
              Overall Health: {systemStatus?.health || 'Unknown'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={systemStatus?.health_percentage || 0}
              sx={{
                backgroundColor: `${nexusColors.quantum}40`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: nexusColors.emerald
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Agents Status Card */}
        <Card sx={{
          backgroundColor: `${nexusColors.obsidian}60`,
          border: `1px solid ${nexusColors.quantum}`,
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AIIcon sx={{ color: nexusColors.amethyst, mr: 1 }} />
              <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                Agents Status
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
              Active: {agents.filter(a => a.status === 'active').length}/{agents.length}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {agents.slice(0, 5).map((agent, index) => (
                <Chip
                  key={index}
                  label={agent.name}
                  size="small"
                  sx={{
                    backgroundColor: agent.status === 'active' ? `${nexusColors.success}20` : `${nexusColors.warning}20`,
                    color: agent.status === 'active' ? nexusColors.success : nexusColors.warning
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Data Metrics Card */}
        <Card sx={{
          backgroundColor: `${nexusColors.obsidian}60`,
          border: `1px solid ${nexusColors.quantum}`,
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DataIcon sx={{ color: nexusColors.emerald, mr: 1 }} />
              <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                Data Metrics
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
              ETL Processes: {realTimeData?.etl_count || 0} active
            </Typography>
            <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
              Data Volume: {realTimeData?.data_volume || '0 GB'} processed
            </Typography>
          </CardContent>
        </Card>
      </Box>


      {/* Guide Panel */}
      <GuidePanel
        systemHealth={mapSystemHealth(systemStatus?.health)}
        agentsData={agents}
        onQuickAction={handleGuideAction}
        alertsCount={systemStatus?.anomaly_chronicle?.length || 0}
      />

      {/* Contextual Chat */}
      {showChat && (
        <ContextualChat
          visible={showChat}
          module="dashboard"
          systemHealth={mapSystemHealth(systemStatus?.health)}
          agentsData={agents}
          onAction={handleGuideAction}
        />
      )}
    </Box>
  );
};

export default EnhancedDashboard;
