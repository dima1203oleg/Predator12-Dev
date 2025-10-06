// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Divider,
  Badge,
  Alert
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Router as RouterIcon,
  Gavel as GavelIcon,
  Assistant as GuideIcon,
  CloudUpload as IngestIcon,
  Assessment as QualityIcon,
  Transform as MapperIcon,
  Hub as ETLIcon,
  Search as IndexIcon,
  DataArray as EmbedIcon,
  TravelExplore as OSINTIcon,
  AccountTree as GraphIcon,
  Warning as AnomalyIcon,
  TrendingUp as ForecastIcon,
  Science as SimulatorIcon,
  DataArray as SyntheticIcon,
  FileDownload as ExportIcon,
  AttachMoney as BillingIcon,
  Security as PIIIcon,
  Healing as HealIcon,
  BugReport as DiagnosisIcon,
  AutoAwesome as ImprovementIcon,
  Shield as RedTeamIcon,
  Security,
  TrendingUp,
  BugReport,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import { 
  COMPETITION_SCENARIOS, 
  AGENT_MODEL_ASSIGNMENTS, 
  getModelPerformance, 
  simulateCompetitionResults,
  formatModelName,
  getTotalModelsCount
} from '../../services/modelRegistry';

interface AgentMetrics {
  cpu: number;
  memory: number;
  latency: number;
  throughput: number;
  errorRate: number;
  costPerHour: number;
  totalCalls: number;
}

interface AgentStatus {
  id: string;
  name: string;
  category: 'core' | 'specialized';
  status: 'active' | 'degraded' | 'down' | 'paused';
  health: number; // 0-100
  lastSeen: string;
  currentTask?: string;
  metrics: AgentMetrics;
  modelProfile: string;
  fallbackModel?: string;
  isArbitrating?: boolean;
  competitionScore?: number;
}

interface MASAgentGridProps {
  onAgentAction?: (agentId: string, action: string) => void;
  onShowLogs?: (agentId: string) => void;
  realTimeMode?: boolean;
}

const MASAgentGrid: React.FC<MASAgentGridProps> = ({
  onAgentAction,
  onShowLogs,
  realTimeMode = true
}) => {
  const { t } = useI18n();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [competitionActive, setCompetitionActive] = useState(false);
  const [arbiterResults, setArbiterResults] = useState<Record<string, number>>({});

  // Agent icons mapping
  const agentIcons = useMemo(() => ({
    'ChiefOrchestrator': PsychologyIcon,
    'QueryPlanner': RouterIcon,
    'ModelRouter': RouterIcon,
    'Arbiter': GavelIcon,
    'NexusGuide': GuideIcon,
    'DatasetIngest': IngestIcon,
    'DataQuality': QualityIcon,
    'SchemaMapper': MapperIcon,
    'ETLOrchestrator': ETLIcon,
    'Indexer': IndexIcon,
    'Embedding': EmbedIcon,
    'OSINTCrawler': OSINTIcon,
    'GraphBuilder': GraphIcon,
    'Anomaly': AnomalyIcon,
    'Forecast': ForecastIcon,
    'Simulator': SimulatorIcon,
    'SyntheticData': SyntheticIcon,
    'ReportExport': ExportIcon,
    'BillingGate': BillingIcon,
    'PIIGuardian': PIIIcon,
    'AutoHeal': HealIcon,
    'SelfDiagnosis': DiagnosisIcon,
    'SelfImprovement': ImprovementIcon,
    'RedTeam': RedTeamIcon,
    'ComplianceMonitor': Security,
    'PerformanceOptimizer': TrendingUp
  }), []);

  // Ініціалізація агентів з реального API
  useEffect(() => {
    // TODO: Замінити на реальний API-виклик, наприклад nexusAPI.getAgents()
    // setAgents(await nexusAPI.getAgents());
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        metrics: {
          ...agent.metrics,
          cpu: Math.max(0, Math.min(100, agent.metrics.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(0, Math.min(100, agent.metrics.memory + (Math.random() - 0.5) * 5)),
          latency: Math.max(0, agent.metrics.latency + (Math.random() - 0.5) * 50),
          throughput: Math.max(0, agent.metrics.throughput + (Math.random() - 0.5) * 20),
          errorRate: Math.max(0, agent.metrics.errorRate + (Math.random() - 0.5) * 0.1)
        },
        lastSeen: agent.status === 'active' ? new Date().toISOString() : agent.lastSeen
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  // Use scenarios from model registry service
  const competitionScenarios = useMemo(() => COMPETITION_SCENARIOS, []);

  const [currentScenario, setCurrentScenario] = useState(0);

  // Competition simulation for Arbiter
  useEffect(() => {
    if (!competitionActive) return;

    const scenario = competitionScenarios[currentScenario];
    const timeout = setTimeout(() => {
      const results = simulateCompetitionResults(scenario);
      setArbiterResults(results);
      setCompetitionActive(false);
    }, 7000); // 7 seconds for realistic competition time

    return () => clearTimeout(timeout);
  }, [competitionActive, currentScenario, competitionScenarios]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return nexusColors.emerald;
      case 'degraded': return '#FFA726';
      case 'down': return nexusColors.crimson;
      case 'paused': return nexusColors.nebula;
      default: return nexusColors.shadow;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return nexusColors.emerald;
    if (health >= 70) return '#FFA726';
    if (health >= 40) return '#FF7043';
    return nexusColors.crimson;
  };

  const handleAgentAction = (agentId: string, action: string) => {
    if (action === 'start-competition' && agentId === 'arbiter') {
      setCompetitionActive(true);
      setArbiterResults({});
      // Cycle through scenarios
      setCurrentScenario(prev => (prev + 1) % competitionScenarios.length);
    }
    onAgentAction?.(agentId, action);
  };

  const coreAgents = agents.filter(a => a.category === 'core');
  const specializedAgents = agents.filter(a => a.category === 'specialized');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with global stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ 
          color: nexusColors.frost, 
          fontFamily: 'Orbitron', 
          mb: 2,
          background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t('mas.title')}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${nexusColors.emerald}20, ${nexusColors.emerald}10)`,
              border: `1px solid ${nexusColors.emerald}60`
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" sx={{ color: nexusColors.emerald, fontFamily: 'Orbitron' }}>
                  {agents.filter(a => a.status === 'active').length}
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                  {t('mas.active')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${nexusColors.sapphire}20, ${nexusColors.sapphire}10)`,
              border: `1px solid ${nexusColors.sapphire}60`
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" sx={{ color: nexusColors.sapphire, fontFamily: 'Orbitron' }}>
                  {agents.reduce((sum, a) => sum + a.metrics.totalCalls, 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                  {t('mas.totalCalls')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${nexusColors.quantum}20, ${nexusColors.quantum}10)`,
              border: `1px solid ${nexusColors.quantum}60`
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" sx={{ color: nexusColors.quantum, fontFamily: 'Orbitron' }}>
                  ${agents.reduce((sum, a) => sum + a.metrics.costPerHour, 0).toFixed(1)}/h
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                  {t('mas.totalCost')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${nexusColors.nebula}20, ${nexusColors.nebula}10)`,
              border: `1px solid ${nexusColors.nebula}60`
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" sx={{ color: nexusColors.nebula, fontFamily: 'Orbitron' }}>
                  {getTotalModelsCount()}
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                  Безплатних моделей
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${nexusColors.crimson}20, ${nexusColors.crimson}10)`,
              border: `1px solid ${nexusColors.crimson}60`
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" sx={{ color: nexusColors.crimson, fontFamily: 'Orbitron' }}>
                  {agents.filter(a => a.status === 'down' || a.status === 'degraded').length}
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                  {t('mas.issues')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Competition Alert for Arbiter */}
        <AnimatePresence>
          {competitionActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  background: `${nexusColors.sapphire}20`,
                  border: `1px solid ${nexusColors.sapphire}`,
                  color: nexusColors.frost
                }}
              >
                {competitionScenarios[currentScenario].title}: {competitionScenarios[currentScenario].models.map(formatModelName).join(' vs ')}
                <br />
                <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                  Тестуємо: {competitionScenarios[currentScenario].tasks.join(', ')} • Доступно {getTotalModelsCount()} безплатних моделей
                </Typography>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Core Agents */}
      <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2, fontFamily: 'Orbitron' }}>
        {t('mas.coreAgents')} ({coreAgents.length})
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {coreAgents.map((agent) => {
          const IconComponent = agentIcons[agent.name as keyof typeof agentIcons];
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                    border: `2px solid ${getStatusColor(agent.status)}60`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      borderColor: getStatusColor(agent.status),
                      boxShadow: `0 4px 20px ${getStatusColor(agent.status)}40`
                    }
                  }}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                >
                  <CardContent>
                    {/* Header with icon and status */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Badge
                        badgeContent={agent.isArbitrating ? '⚖️' : undefined}
                        sx={{ '& .MuiBadge-badge': { backgroundColor: nexusColors.sapphire } }}
                      >
                        <Avatar sx={{ 
                          backgroundColor: `${getStatusColor(agent.status)}20`,
                          border: `1px solid ${getStatusColor(agent.status)}`
                        }}>
                          <IconComponent sx={{ color: getStatusColor(agent.status) }} />
                        </Avatar>
                      </Badge>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ 
                          color: nexusColors.frost, 
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {agent.name}
                        </Typography>
                        <Chip
                          label={agent.status.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(agent.status)}20`,
                            color: getStatusColor(agent.status),
                            fontSize: '0.7rem',
                            height: 18
                          }}
                        />
                      </Box>
                    </Stack>

                    {/* Health and metrics */}
                    <Box sx={{ mb: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                          {t('mas.health')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: getHealthColor(agent.health) }}>
                          {agent.health}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={agent.health}
                        sx={{
                          height: 4,
                          backgroundColor: nexusColors.quantum + '40',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getHealthColor(agent.health)
                          }
                        }}
                      />
                    </Box>

                    {/* Current task */}
                    {agent.currentTask && (
                      <Typography variant="caption" sx={{ 
                        color: nexusColors.nebula, 
                        display: 'block',
                        mb: 1,
                        minHeight: '2.5em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        📋 {agent.currentTask}
                      </Typography>
                    )}

                    {/* Quick metrics */}
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: nexusColors.shadow }}>CPU</Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 'bold' }}>
                          {agent.metrics.cpu.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: nexusColors.shadow }}>MEM</Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 'bold' }}>
                          {agent.metrics.memory.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: nexusColors.shadow }}>COST</Typography>
                        <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 'bold' }}>
                          ${agent.metrics.costPerHour.toFixed(1)}/h
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Model profile */}
                    <Chip
                      label={agent.modelProfile}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: nexusColors.quantum,
                        color: nexusColors.frost,
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />

                    {/* Expanded details */}
                    <AnimatePresence>
                      {selectedAgent === agent.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Divider sx={{ my: 2, borderColor: nexusColors.quantum }} />
                          
                          {/* Detailed metrics */}
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                                {t('mas.latency')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                                {agent.metrics.latency.toFixed(0)}ms
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                                {t('mas.throughput')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                                {agent.metrics.throughput.toFixed(0)}/min
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                                {t('mas.errorRate')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                                {agent.metrics.errorRate.toFixed(2)}%
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                                {t('mas.totalCalls')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                                {agent.metrics.totalCalls.toLocaleString()}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Competition results for Arbiter */}
                          {agent.id === 'arbiter' && Object.keys(arbiterResults).length > 0 && (
                            <Box sx={{ mt: 2, p: 1, backgroundColor: nexusColors.sapphire + '20', borderRadius: 1 }}>
                              <Typography variant="caption" sx={{ color: nexusColors.sapphire, fontWeight: 'bold' }}>
                                🏆 Результати змагання:
                              </Typography>
                              {Object.entries(arbiterResults)
                                .sort((a, b) => b[1] - a[1]) // Sort by score descending
                                .map(([model, score], index) => (
                                <Stack key={model} direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="caption" sx={{ 
                                      color: index === 0 ? nexusColors.quantum : nexusColors.frost,
                                      fontWeight: index === 0 ? 'bold' : 'normal'
                                    }}>
                                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {formatModelName(model)}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="caption" sx={{ 
                                    color: index === 0 ? nexusColors.quantum : nexusColors.emerald,
                                    fontWeight: 'bold'
                                  }}>
                                    {score.toFixed(1)}%
                                  </Typography>
                                </Stack>
                              ))}
                            </Box>
                          )}

                          {/* Action buttons */}
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Tooltip title={t('mas.showLogs')}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShowLogs?.(agent.id);
                                }}
                                sx={{ color: nexusColors.sapphire }}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {agent.status === 'active' && (
                              <Tooltip title={t('mas.pause')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAgentAction(agent.id, 'pause');
                                  }}
                                  sx={{ color: nexusColors.nebula }}
                                >
                                  <PauseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {(agent.status === 'paused' || agent.status === 'down') && (
                              <Tooltip title={t('mas.start')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAgentAction(agent.id, 'start');
                                  }}
                                  sx={{ color: nexusColors.emerald }}
                                >
                                  <PlayIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title={t('mas.restart')}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAgentAction(agent.id, 'restart');
                                }}
                                sx={{ color: nexusColors.quantum }}
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {agent.id === 'arbiter' && !competitionActive && (
                              <Stack direction="row" spacing={0.5}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAgentAction('arbiter', 'start-competition');
                                  }}
                                  sx={{
                                    borderColor: nexusColors.sapphire,
                                    color: nexusColors.sapphire,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  🏆 Змагання
                                </Button>
                                <Tooltip title="Переглянути каталог моделей">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // TODO: Open ModelCatalog modal
                                    }}
                                    sx={{ color: nexusColors.quantum }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </Stack>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Specialized Agents */}
      <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2, fontFamily: 'Orbitron' }}>
        {t('mas.specializedAgents')} ({specializedAgents.length})
      </Typography>
      
      <Grid container spacing={2}>
        {specializedAgents.map((agent) => {
          const IconComponent = agentIcons[agent.name as keyof typeof agentIcons];
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
                    border: `2px solid ${getStatusColor(agent.status)}60`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: getStatusColor(agent.status),
                      boxShadow: `0 4px 20px ${getStatusColor(agent.status)}40`
                    }
                  }}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                >
                  <CardContent>
                    {/* Similar structure as core agents but more compact */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Avatar sx={{ 
                        backgroundColor: `${getStatusColor(agent.status)}20`,
                        border: `1px solid ${getStatusColor(agent.status)}`,
                        width: 32,
                        height: 32
                      }}>
                        <IconComponent sx={{ color: getStatusColor(agent.status), fontSize: '1rem' }} />
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: nexusColors.frost, 
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {agent.name}
                        </Typography>
                        <Chip
                          label={agent.status.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(agent.status)}20`,
                            color: getStatusColor(agent.status),
                            fontSize: '0.6rem',
                            height: 16
                          }}
                        />
                      </Box>
                    </Stack>

                    {agent.currentTask && (
                      <Typography variant="caption" sx={{ 
                        color: nexusColors.nebula, 
                        display: 'block',
                        mb: 1,
                        minHeight: '2em',
                        fontSize: '0.7rem'
                      }}>
                        {agent.currentTask}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={`${agent.metrics.cpu.toFixed(0)}% CPU`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                      <Chip
                        label={`$${agent.metrics.costPerHour.toFixed(1)}/h`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MASAgentGrid;
