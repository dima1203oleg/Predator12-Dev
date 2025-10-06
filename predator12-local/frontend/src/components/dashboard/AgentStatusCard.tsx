// @ts-nocheck
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Tooltip,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  CheckCircle as ActiveIcon,
  Error as DownIcon,
  Warning as DegradedIcon,
  Refresh as RefreshIcon,
  Timeline as LogsIcon,
  Settings as SettingsIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useAppEventStore } from '../../stores/appEventStore';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'down' | 'degraded' | 'starting';
  type: 'etl' | 'security' | 'analytics' | 'monitor' | 'bridge';
  health?: number;
  lastSeen?: Date;
  cpu?: number;
  memory?: number;
  tasks?: {
    active: number;
    completed: number;
    failed: number;
  };
}

interface AgentStatusCardProps {
  agents: Agent[];
  onRestartAgent?: (agentId: string) => void;
  onViewLogs?: (agentId: string) => void;
  onOpenSettings?: (agentId: string) => void;
  loading?: boolean;
}

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({
  agents,
  onRestartAgent,
  onViewLogs,
  onOpenSettings,
  loading = false
}) => {
  const { addEvent } = useAppEventStore();

  const getAgentTypeColor = (type: Agent['type']) => {
    const colors = {
      etl: nexusColors.sapphire,
      security: nexusColors.error,
      analytics: nexusColors.quantum,
      monitor: nexusColors.success,
      bridge: nexusColors.warning
    };
    return colors[type] || nexusColors.frost;
  };

  const getAgentTypeLabel = (type: Agent['type']) => {
    const labels = {
      etl: 'ETL',
      security: 'Безпека',
      analytics: 'Аналітика',
      monitor: 'Моніторинг',
      bridge: 'Інтеграція'
    };
    return labels[type] || type.toUpperCase();
  };

  const getStatusConfig = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return {
          color: nexusColors.success,
          icon: <ActiveIcon />,
          label: 'Активний',
          bgColor: `${nexusColors.success}15`
        };
      case 'degraded':
        return {
          color: nexusColors.warning,
          icon: <DegradedIcon />,
          label: 'Обмежено',
          bgColor: `${nexusColors.warning}15`
        };
      case 'down':
        return {
          color: nexusColors.error,
          icon: <DownIcon />,
          label: 'Недоступний',
          bgColor: `${nexusColors.error}15`
        };
      case 'starting':
      default:
        return {
          color: nexusColors.nebula,
          icon: <RefreshIcon />,
          label: 'Запуск',
          bgColor: `${nexusColors.nebula}15`
        };
    }
  };

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalAgents = agents.length;
  const healthPercentage = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;

  const overallStatus = 
    healthPercentage === 100 ? 'optimal' :
    healthPercentage >= 70 ? 'degraded' :
    healthPercentage >= 30 ? 'critical' : 'down';

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'optimal': return nexusColors.success;
      case 'degraded': return nexusColors.warning;
      case 'critical': return nexusColors.error;
      case 'down': return nexusColors.error;
      default: return nexusColors.nebula;
    }
  };

  const handleAgentAction = (action: string, agent: Agent) => {
    switch (action) {
      case 'restart':
        onRestartAgent?.(agent.id);
        addEvent(
          { type: 'ACTION_REQUIRED', cta: { label: 'Перезапуск агента', run: () => {} } },
          'Перезапуск агента',
          `Перезапуск агента: ${agent.name}`,
          'info'
        );
        break;
      case 'logs':
        onViewLogs?.(agent.id);
        break;
      case 'settings':
        onOpenSettings?.(agent.id);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${nexusColors.obsidian}E0, ${nexusColors.darkMatter}D0)`,
          border: `1px solid ${getOverallStatusColor()}60`,
          borderRadius: 2,
          position: 'relative',
          minHeight: 300,
          '&:hover': {
            border: `1px solid ${getOverallStatusColor()}80`,
            boxShadow: `0 8px 32px ${getOverallStatusColor()}20`
          },
          transition: 'all 0.3s ease'
        }}
      >
        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: 4,
            background: `linear-gradient(90deg, ${getOverallStatusColor()}, ${getOverallStatusColor()}80)`,
            borderRadius: '4px 4px 0 0'
          }}
        />

        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AgentIcon sx={{ color: getOverallStatusColor() }} />
              <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                Агенти MAS
              </Typography>
            </Box>

            <Chip
              label={`${activeAgents}/${totalAgents}`}
              size="small"
              sx={{
                backgroundColor: `${getOverallStatusColor()}15`,
                color: getOverallStatusColor(),
                fontWeight: 'bold',
                border: `1px solid ${getOverallStatusColor()}40`
              }}
            />
          </Box>

          {/* Overall health */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                Загальне здоров'я системи
              </Typography>
              <Typography variant="body2" sx={{ color: getOverallStatusColor(), fontWeight: 'bold' }}>
                {Math.round(healthPercentage)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={healthPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${nexusColors.shadow}40`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getOverallStatusColor(),
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {/* Loading indicator */}
          {loading && (
            <LinearProgress
              sx={{
                mb: 2,
                backgroundColor: `${nexusColors.quantum}40`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: nexusColors.quantum
                }
              }}
            />
          )}

          {/* Agents list */}
          <Stack spacing={1.5} sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
            {agents.map((agent) => {
              const statusConfig = getStatusConfig(agent.status);
              const typeColor = getAgentTypeColor(agent.type);

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: `1px solid ${statusConfig.color}30`,
                      borderRadius: 1,
                      backgroundColor: `${statusConfig.color}05`,
                      '&:hover': {
                        backgroundColor: `${statusConfig.color}10`,
                        border: `1px solid ${statusConfig.color}60`
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Agent info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: `${typeColor}20`,
                          border: `1px solid ${typeColor}60`
                        }}
                      >
                        <AgentIcon sx={{ fontSize: 16, color: typeColor }} />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 'bold' }}>
                            {agent.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={getAgentTypeLabel(agent.type)}
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: `${typeColor}20`,
                              color: typeColor,
                              border: `1px solid ${typeColor}40`
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            <Typography variant="caption" sx={{ color: statusConfig.color }}>
                              {statusConfig.label}
                            </Typography>
                          </Box>

                          {agent.lastSeen && (
                            <Typography variant="caption" sx={{ color: nexusColors.nebula, opacity: 0.7 }}>
                              • {agent.lastSeen.toLocaleTimeString('uk-UA')}
                            </Typography>
                          )}
                        </Box>

                        {/* Performance indicators */}
                        {(agent.cpu !== undefined || agent.memory !== undefined) && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {agent.cpu !== undefined && (
                              <Typography variant="caption" sx={{ color: nexusColors.frost, opacity: 0.8 }}>
                                CPU: {Math.round(agent.cpu * 100)}%
                              </Typography>
                            )}
                            {agent.memory !== undefined && (
                              <Typography variant="caption" sx={{ color: nexusColors.frost, opacity: 0.8 }}>
                                RAM: {Math.round(agent.memory * 100)}%
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={0.5}>
                      {agent.status === 'down' && onRestartAgent && (
                        <Tooltip title="Перезапустити агента">
                          <IconButton
                            size="small"
                            onClick={() => handleAgentAction('restart', agent)}
                            sx={{
                              color: nexusColors.sapphire,
                              minWidth: 44, // WCAG compliance
                              minHeight: 44,
                              '&:hover': {
                                backgroundColor: `${nexusColors.sapphire}20`
                              }
                            }}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onViewLogs && (
                        <Tooltip title="Логи агента">
                          <IconButton
                            size="small"
                            onClick={() => handleAgentAction('logs', agent)}
                            sx={{
                              color: nexusColors.frost,
                              minWidth: 44,
                              minHeight: 44,
                              '&:hover': {
                                backgroundColor: `${nexusColors.quantum}20`
                              }
                            }}
                          >
                            <LogsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {onOpenSettings && (
                        <Tooltip title="Налаштування агента">
                          <IconButton
                            size="small"
                            onClick={() => handleAgentAction('settings', agent)}
                            sx={{
                              color: nexusColors.frost,
                              minWidth: 44,
                              minHeight: 44,
                              '&:hover': {
                                backgroundColor: `${nexusColors.quantum}20`
                              }
                            }}
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                </motion.div>
              );
            })}
          </Stack>

          {/* Quick actions */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: `1px solid ${nexusColors.shadow}40` }}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => addEvent(
                { type: 'ACTION_REQUIRED', cta: { label: 'Оновити статус', run: () => {} } },
                'Оновлення агентів',
                'Оновлення статусу всіх агентів...',
                'info'
              )}
              disabled={loading}
              variant="outlined"
              sx={{
                color: nexusColors.frost,
                borderColor: nexusColors.frost,
                minHeight: 44,
                flex: 1,
                '&:hover': {
                  backgroundColor: `${nexusColors.quantum}20`,
                  borderColor: nexusColors.quantum
                }
              }}
            >
              Оновити всі
            </Button>

            <Button
              size="small"
              startIcon={<PerformanceIcon />}
              onClick={() => addEvent(
                { type: 'ACTION_REQUIRED', cta: { label: 'Запустити діагностику', run: () => {} } },
                'Діагностика агентів',
                'Запуск повної діагностики агентів...',
                'info'
              )}
              variant="outlined"
              sx={{
                color: nexusColors.sapphire,
                borderColor: nexusColors.sapphire,
                minHeight: 44,
                flex: 1,
                '&:hover': {
                  backgroundColor: `${nexusColors.sapphire}20`,
                  borderColor: nexusColors.sapphire
                }
              }}
            >
              Діагностика
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgentStatusCard;
