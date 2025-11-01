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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const I18nProvider_1 = require("../../i18n/I18nProvider");
const modelRegistry_1 = require("../../services/modelRegistry");
const MASAgentGrid = ({ onAgentAction, onShowLogs, realTimeMode = true }) => {
    const { t } = (0, I18nProvider_1.useI18n)();
    const [agents, setAgents] = (0, react_1.useState)([]);
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [competitionActive, setCompetitionActive] = (0, react_1.useState)(false);
    const [arbiterResults, setArbiterResults] = (0, react_1.useState)({});
    // Agent icons mapping
    const agentIcons = (0, react_1.useMemo)(() => ({
        'ChiefOrchestrator': icons_material_1.Psychology,
        'QueryPlanner': icons_material_1.Router,
        'ModelRouter': icons_material_1.Router,
        'Arbiter': icons_material_1.Gavel,
        'NexusGuide': icons_material_1.Assistant,
        'DatasetIngest': icons_material_1.CloudUpload,
        'DataQuality': icons_material_1.Assessment,
        'SchemaMapper': icons_material_1.Transform,
        'ETLOrchestrator': icons_material_1.Hub,
        'Indexer': icons_material_1.Search,
        'Embedding': icons_material_1.DataArray,
        'OSINTCrawler': icons_material_1.TravelExplore,
        'GraphBuilder': icons_material_1.AccountTree,
        'Anomaly': icons_material_1.Warning,
        'Forecast': icons_material_1.TrendingUp,
        'Simulator': icons_material_1.Science,
        'SyntheticData': icons_material_1.DataArray,
        'ReportExport': icons_material_1.FileDownload,
        'BillingGate': icons_material_1.AttachMoney,
        'PIIGuardian': icons_material_1.Security,
        'AutoHeal': icons_material_1.Healing,
        'SelfDiagnosis': icons_material_1.BugReport,
        'SelfImprovement': icons_material_1.AutoAwesome,
        'RedTeam': icons_material_1.Shield,
        'ComplianceMonitor': icons_material_1.Security,
        'PerformanceOptimizer': icons_material_1.TrendingUp
    }), []);
    // Ініціалізація агентів з реального API
    (0, react_1.useEffect)(() => {
        // TODO: Замінити на реальний API-виклик, наприклад nexusAPI.getAgents()
        // setAgents(await nexusAPI.getAgents());
    }, []);
    // Real-time updates simulation
    (0, react_1.useEffect)(() => {
        if (!realTimeMode)
            return;
        const interval = setInterval(() => {
            setAgents(prev => prev.map(agent => (Object.assign(Object.assign({}, agent), { metrics: Object.assign(Object.assign({}, agent.metrics), { cpu: Math.max(0, Math.min(100, agent.metrics.cpu + (Math.random() - 0.5) * 10)), memory: Math.max(0, Math.min(100, agent.metrics.memory + (Math.random() - 0.5) * 5)), latency: Math.max(0, agent.metrics.latency + (Math.random() - 0.5) * 50), throughput: Math.max(0, agent.metrics.throughput + (Math.random() - 0.5) * 20), errorRate: Math.max(0, agent.metrics.errorRate + (Math.random() - 0.5) * 0.1) }), lastSeen: agent.status === 'active' ? new Date().toISOString() : agent.lastSeen }))));
        }, 3000);
        return () => clearInterval(interval);
    }, [realTimeMode]);
    // Use scenarios from model registry service
    const competitionScenarios = (0, react_1.useMemo)(() => modelRegistry_1.COMPETITION_SCENARIOS, []);
    const [currentScenario, setCurrentScenario] = (0, react_1.useState)(0);
    // Competition simulation for Arbiter
    (0, react_1.useEffect)(() => {
        if (!competitionActive)
            return;
        const scenario = competitionScenarios[currentScenario];
        const timeout = setTimeout(() => {
            const results = (0, modelRegistry_1.simulateCompetitionResults)(scenario);
            setArbiterResults(results);
            setCompetitionActive(false);
        }, 7000); // 7 seconds for realistic competition time
        return () => clearTimeout(timeout);
    }, [competitionActive, currentScenario, competitionScenarios]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusTheme_1.nexusColors.emerald;
            case 'degraded': return '#FFA726';
            case 'down': return nexusTheme_1.nexusColors.crimson;
            case 'paused': return nexusTheme_1.nexusColors.nebula;
            default: return nexusTheme_1.nexusColors.shadow;
        }
    };
    const getHealthColor = (health) => {
        if (health >= 90)
            return nexusTheme_1.nexusColors.emerald;
        if (health >= 70)
            return '#FFA726';
        if (health >= 40)
            return '#FF7043';
        return nexusTheme_1.nexusColors.crimson;
    };
    const handleAgentAction = (agentId, action) => {
        if (action === 'start-competition' && agentId === 'arbiter') {
            setCompetitionActive(true);
            setArbiterResults({});
            // Cycle through scenarios
            setCurrentScenario(prev => (prev + 1) % competitionScenarios.length);
        }
        onAgentAction === null || onAgentAction === void 0 ? void 0 : onAgentAction(agentId, action);
    };
    const coreAgents = agents.filter(a => a.category === 'core');
    const specializedAgents = agents.filter(a => a.category === 'specialized');
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Header with global stats */}
      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="h4" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron',
            mb: 2,
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
          {t('mas.title')}
        </material_1.Typography>

        <material_1.Grid container spacing={2} sx={{ mb: 3 }}>
          <material_1.Grid item xs={12} md={2.4}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.emerald}20, ${nexusTheme_1.nexusColors.emerald}10)`,
            border: `1px solid ${nexusTheme_1.nexusColors.emerald}60`
        }}>
              <material_1.CardContent sx={{ py: 1.5 }}>
                <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.emerald, fontFamily: 'Orbitron' }}>
                  {agents.filter(a => a.status === 'active').length}
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  {t('mas.active')}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={2.4}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}20, ${nexusTheme_1.nexusColors.sapphire}10)`,
            border: `1px solid ${nexusTheme_1.nexusColors.sapphire}60`
        }}>
              <material_1.CardContent sx={{ py: 1.5 }}>
                <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.sapphire, fontFamily: 'Orbitron' }}>
                  {agents.reduce((sum, a) => sum + a.metrics.totalCalls, 0).toLocaleString()}
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  {t('mas.totalCalls')}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={2.4}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.quantum}20, ${nexusTheme_1.nexusColors.quantum}10)`,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}60`
        }}>
              <material_1.CardContent sx={{ py: 1.5 }}>
                <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.quantum, fontFamily: 'Orbitron' }}>
                  ${agents.reduce((sum, a) => sum + a.metrics.costPerHour, 0).toFixed(1)}/h
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  {t('mas.totalCost')}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={2.4}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.nebula}20, ${nexusTheme_1.nexusColors.nebula}10)`,
            border: `1px solid ${nexusTheme_1.nexusColors.nebula}60`
        }}>
              <material_1.CardContent sx={{ py: 1.5 }}>
                <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.nebula, fontFamily: 'Orbitron' }}>
                  {(0, modelRegistry_1.getTotalModelsCount)()}
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  Безплатних моделей
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} md={2.4}>
            <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.crimson}20, ${nexusTheme_1.nexusColors.crimson}10)`,
            border: `1px solid ${nexusTheme_1.nexusColors.crimson}60`
        }}>
              <material_1.CardContent sx={{ py: 1.5 }}>
                <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.crimson, fontFamily: 'Orbitron' }}>
                  {agents.filter(a => a.status === 'down' || a.status === 'degraded').length}
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  {t('mas.issues')}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>

        {/* Competition Alert for Arbiter */}
        <framer_motion_1.AnimatePresence>
          {competitionActive && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <material_1.Alert severity="info" sx={{
                mb: 2,
                background: `${nexusTheme_1.nexusColors.sapphire}20`,
                border: `1px solid ${nexusTheme_1.nexusColors.sapphire}`,
                color: nexusTheme_1.nexusColors.frost
            }}>
                {competitionScenarios[currentScenario].title}: {competitionScenarios[currentScenario].models.map(modelRegistry_1.formatModelName).join(' vs ')}
                <br />
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                  Тестуємо: {competitionScenarios[currentScenario].tasks.join(', ')} • Доступно {(0, modelRegistry_1.getTotalModelsCount)()} безплатних моделей
                </material_1.Typography>
              </material_1.Alert>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </material_1.Box>

      {/* Core Agents */}
      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2, fontFamily: 'Orbitron' }}>
        {t('mas.coreAgents')} ({coreAgents.length})
      </material_1.Typography>

      <material_1.Grid container spacing={2} sx={{ mb: 4 }}>
        {coreAgents.map((agent) => {
            const IconComponent = agentIcons[agent.name];
            return (<material_1.Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
              <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <material_1.Card sx={{
                    background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                    border: `2px solid ${getStatusColor(agent.status)}60`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                        borderColor: getStatusColor(agent.status),
                        boxShadow: `0 4px 20px ${getStatusColor(agent.status)}40`
                    }
                }} onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}>
                  <material_1.CardContent>
                    {/* Header with icon and status */}
                    <material_1.Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <material_1.Badge badgeContent={agent.isArbitrating ? '⚖️' : undefined} sx={{ '& .MuiBadge-badge': { backgroundColor: nexusTheme_1.nexusColors.sapphire } }}>
                        <material_1.Avatar sx={{
                    backgroundColor: `${getStatusColor(agent.status)}20`,
                    border: `1px solid ${getStatusColor(agent.status)}`
                }}>
                          <IconComponent sx={{ color: getStatusColor(agent.status) }}/>
                        </material_1.Avatar>
                      </material_1.Badge>

                      <material_1.Box sx={{ flex: 1 }}>
                        <material_1.Typography variant="subtitle1" sx={{
                    color: nexusTheme_1.nexusColors.frost,
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                          {agent.name}
                        </material_1.Typography>
                        <material_1.Chip label={agent.status.toUpperCase()} size="small" sx={{
                    backgroundColor: `${getStatusColor(agent.status)}20`,
                    color: getStatusColor(agent.status),
                    fontSize: '0.7rem',
                    height: 18
                }}/>
                      </material_1.Box>
                    </material_1.Stack>

                    {/* Health and metrics */}
                    <material_1.Box sx={{ mb: 1.5 }}>
                      <material_1.Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                          {t('mas.health')}
                        </material_1.Typography>
                        <material_1.Typography variant="caption" sx={{ color: getHealthColor(agent.health) }}>
                          {agent.health}%
                        </material_1.Typography>
                      </material_1.Stack>
                      <material_1.LinearProgress variant="determinate" value={agent.health} sx={{
                    height: 4,
                    backgroundColor: nexusTheme_1.nexusColors.quantum + '40',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: getHealthColor(agent.health)
                    }
                }}/>
                    </material_1.Box>

                    {/* Current task */}
                    {agent.currentTask && (<material_1.Typography variant="caption" sx={{
                        color: nexusTheme_1.nexusColors.nebula,
                        display: 'block',
                        mb: 1,
                        minHeight: '2.5em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        📋 {agent.currentTask}
                      </material_1.Typography>)}

                    {/* Quick metrics */}
                    <material_1.Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <material_1.Box>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>CPU</material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 'bold' }}>
                          {agent.metrics.cpu.toFixed(0)}%
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Box>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>MEM</material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 'bold' }}>
                          {agent.metrics.memory.toFixed(0)}%
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Box>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>COST</material_1.Typography>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 'bold' }}>
                          ${agent.metrics.costPerHour.toFixed(1)}/h
                        </material_1.Typography>
                      </material_1.Box>
                    </material_1.Stack>

                    {/* Model profile */}
                    <material_1.Chip label={agent.modelProfile} size="small" variant="outlined" sx={{
                    borderColor: nexusTheme_1.nexusColors.quantum,
                    color: nexusTheme_1.nexusColors.frost,
                    fontSize: '0.7rem',
                    height: 20
                }}/>

                    {/* Expanded details */}
                    <framer_motion_1.AnimatePresence>
                      {selectedAgent === agent.id && (<framer_motion_1.motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                          <material_1.Divider sx={{ my: 2, borderColor: nexusTheme_1.nexusColors.quantum }}/>

                          {/* Detailed metrics */}
                          <material_1.Stack spacing={1}>
                            <material_1.Stack direction="row" justifyContent="space-between">
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                {t('mas.latency')}
                              </material_1.Typography>
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                                {agent.metrics.latency.toFixed(0)}ms
                              </material_1.Typography>
                            </material_1.Stack>
                            <material_1.Stack direction="row" justifyContent="space-between">
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                {t('mas.throughput')}
                              </material_1.Typography>
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                                {agent.metrics.throughput.toFixed(0)}/min
                              </material_1.Typography>
                            </material_1.Stack>
                            <material_1.Stack direction="row" justifyContent="space-between">
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                {t('mas.errorRate')}
                              </material_1.Typography>
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                                {agent.metrics.errorRate.toFixed(2)}%
                              </material_1.Typography>
                            </material_1.Stack>
                            <material_1.Stack direction="row" justifyContent="space-between">
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                {t('mas.totalCalls')}
                              </material_1.Typography>
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                                {agent.metrics.totalCalls.toLocaleString()}
                              </material_1.Typography>
                            </material_1.Stack>
                          </material_1.Stack>

                          {/* Competition results for Arbiter */}
                          {agent.id === 'arbiter' && Object.keys(arbiterResults).length > 0 && (<material_1.Box sx={{ mt: 2, p: 1, backgroundColor: nexusTheme_1.nexusColors.sapphire + '20', borderRadius: 1 }}>
                              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.sapphire, fontWeight: 'bold' }}>
                                🏆 Результати змагання:
                              </material_1.Typography>
                              {Object.entries(arbiterResults)
                            .sort((a, b) => b[1] - a[1]) // Sort by score descending
                            .map(([model, score], index) => (<material_1.Stack key={model} direction="row" justifyContent="space-between" alignItems="center">
                                  <material_1.Stack direction="row" alignItems="center" spacing={1}>
                                    <material_1.Typography variant="caption" sx={{
                                color: index === 0 ? nexusTheme_1.nexusColors.quantum : nexusTheme_1.nexusColors.frost,
                                fontWeight: index === 0 ? 'bold' : 'normal'
                            }}>
                                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {(0, modelRegistry_1.formatModelName)(model)}
                                    </material_1.Typography>
                                  </material_1.Stack>
                                  <material_1.Typography variant="caption" sx={{
                                color: index === 0 ? nexusTheme_1.nexusColors.quantum : nexusTheme_1.nexusColors.emerald,
                                fontWeight: 'bold'
                            }}>
                                    {score.toFixed(1)}%
                                  </material_1.Typography>
                                </material_1.Stack>))}
                            </material_1.Box>)}

                          {/* Action buttons */}
                          <material_1.Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <material_1.Tooltip title={t('mas.showLogs')}>
                              <material_1.IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        onShowLogs === null || onShowLogs === void 0 ? void 0 : onShowLogs(agent.id);
                    }} sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                                <icons_material_1.Info fontSize="small"/>
                              </material_1.IconButton>
                            </material_1.Tooltip>

                            {agent.status === 'active' && (<material_1.Tooltip title={t('mas.pause')}>
                                <material_1.IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.id, 'pause');
                        }} sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                                  <icons_material_1.Pause fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>)}

                            {(agent.status === 'paused' || agent.status === 'down') && (<material_1.Tooltip title={t('mas.start')}>
                                <material_1.IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.id, 'start');
                        }} sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                                  <icons_material_1.PlayArrow fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>)}

                            <material_1.Tooltip title={t('mas.restart')}>
                              <material_1.IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        handleAgentAction(agent.id, 'restart');
                    }} sx={{ color: nexusTheme_1.nexusColors.quantum }}>
                                <icons_material_1.Refresh fontSize="small"/>
                              </material_1.IconButton>
                            </material_1.Tooltip>

                            {agent.id === 'arbiter' && !competitionActive && (<material_1.Stack direction="row" spacing={0.5}>
                                <material_1.Button size="small" variant="outlined" onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction('arbiter', 'start-competition');
                        }} sx={{
                            borderColor: nexusTheme_1.nexusColors.sapphire,
                            color: nexusTheme_1.nexusColors.sapphire,
                            fontSize: '0.7rem'
                        }}>
                                  🏆 Змагання
                                </material_1.Button>
                                <material_1.Tooltip title="Переглянути каталог моделей">
                                  <material_1.IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open ModelCatalog modal
                        }} sx={{ color: nexusTheme_1.nexusColors.quantum }}>
                                    <icons_material_1.Info fontSize="small"/>
                                  </material_1.IconButton>
                                </material_1.Tooltip>
                              </material_1.Stack>)}
                          </material_1.Stack>
                        </framer_motion_1.motion.div>)}
                    </framer_motion_1.AnimatePresence>
                  </material_1.CardContent>
                </material_1.Card>
              </framer_motion_1.motion.div>
            </material_1.Grid>);
        })}
      </material_1.Grid>

      {/* Specialized Agents */}
      <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2, fontFamily: 'Orbitron' }}>
        {t('mas.specializedAgents')} ({specializedAgents.length})
      </material_1.Typography>

      <material_1.Grid container spacing={2}>
        {specializedAgents.map((agent) => {
            const IconComponent = agentIcons[agent.name];
            return (<material_1.Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
              <framer_motion_1.motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <material_1.Card sx={{
                    background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                    border: `2px solid ${getStatusColor(agent.status)}60`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: getStatusColor(agent.status),
                        boxShadow: `0 4px 20px ${getStatusColor(agent.status)}40`
                    }
                }} onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}>
                  <material_1.CardContent>
                    {/* Similar structure as core agents but more compact */}
                    <material_1.Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <material_1.Avatar sx={{
                    backgroundColor: `${getStatusColor(agent.status)}20`,
                    border: `1px solid ${getStatusColor(agent.status)}`,
                    width: 32,
                    height: 32
                }}>
                        <IconComponent sx={{ color: getStatusColor(agent.status), fontSize: '1rem' }}/>
                      </material_1.Avatar>

                      <material_1.Box sx={{ flex: 1 }}>
                        <material_1.Typography variant="subtitle2" sx={{
                    color: nexusTheme_1.nexusColors.frost,
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                }}>
                          {agent.name}
                        </material_1.Typography>
                        <material_1.Chip label={agent.status.toUpperCase()} size="small" sx={{
                    backgroundColor: `${getStatusColor(agent.status)}20`,
                    color: getStatusColor(agent.status),
                    fontSize: '0.6rem',
                    height: 16
                }}/>
                      </material_1.Box>
                    </material_1.Stack>

                    {agent.currentTask && (<material_1.Typography variant="caption" sx={{
                        color: nexusTheme_1.nexusColors.nebula,
                        display: 'block',
                        mb: 1,
                        minHeight: '2em',
                        fontSize: '0.7rem'
                    }}>
                        {agent.currentTask}
                      </material_1.Typography>)}

                    <material_1.Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <material_1.Chip label={`${agent.metrics.cpu.toFixed(0)}% CPU`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 18 }}/>
                      <material_1.Chip label={`$${agent.metrics.costPerHour.toFixed(1)}/h`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 18 }}/>
                    </material_1.Stack>
                  </material_1.CardContent>
                </material_1.Card>
              </framer_motion_1.motion.div>
            </material_1.Grid>);
        })}
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = MASAgentGrid;
