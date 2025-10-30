"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const appEventStore_1 = require("../../stores/appEventStore");
const AgentStatusCard = ({ agents, onRestartAgent, onViewLogs, onOpenSettings, loading = false }) => {
    const { addEvent } = (0, appEventStore_1.useAppEventStore)();
    const getAgentTypeColor = (type) => {
        const colors = {
            etl: nexusTheme_1.nexusColors.sapphire,
            security: nexusTheme_1.nexusColors.error,
            analytics: nexusTheme_1.nexusColors.quantum,
            monitor: nexusTheme_1.nexusColors.success,
            bridge: nexusTheme_1.nexusColors.warning
        };
        return colors[type] || nexusTheme_1.nexusColors.frost;
    };
    const getAgentTypeLabel = (type) => {
        const labels = {
            etl: 'ETL',
            security: 'Безпека',
            analytics: 'Аналітика',
            monitor: 'Моніторинг',
            bridge: 'Інтеграція'
        };
        return labels[type] || type.toUpperCase();
    };
    const getStatusConfig = (status) => {
        switch (status) {
            case 'active':
                return {
                    color: nexusTheme_1.nexusColors.success,
                    icon: <icons_material_1.CheckCircle />,
                    label: 'Активний',
                    bgColor: `${nexusTheme_1.nexusColors.success}15`
                };
            case 'degraded':
                return {
                    color: nexusTheme_1.nexusColors.warning,
                    icon: <icons_material_1.Warning />,
                    label: 'Обмежено',
                    bgColor: `${nexusTheme_1.nexusColors.warning}15`
                };
            case 'down':
                return {
                    color: nexusTheme_1.nexusColors.error,
                    icon: <icons_material_1.Error />,
                    label: 'Недоступний',
                    bgColor: `${nexusTheme_1.nexusColors.error}15`
                };
            case 'starting':
            default:
                return {
                    color: nexusTheme_1.nexusColors.nebula,
                    icon: <icons_material_1.Refresh />,
                    label: 'Запуск',
                    bgColor: `${nexusTheme_1.nexusColors.nebula}15`
                };
        }
    };
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalAgents = agents.length;
    const healthPercentage = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;
    const overallStatus = healthPercentage === 100 ? 'optimal' :
        healthPercentage >= 70 ? 'degraded' :
            healthPercentage >= 30 ? 'critical' : 'down';
    const getOverallStatusColor = () => {
        switch (overallStatus) {
            case 'optimal': return nexusTheme_1.nexusColors.success;
            case 'degraded': return nexusTheme_1.nexusColors.warning;
            case 'critical': return nexusTheme_1.nexusColors.error;
            case 'down': return nexusTheme_1.nexusColors.error;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    const handleAgentAction = (action, agent) => {
        switch (action) {
            case 'restart':
                onRestartAgent === null || onRestartAgent === void 0 ? void 0 : onRestartAgent(agent.id);
                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Перезапуск агента', run: () => { } } }, 'Перезапуск агента', `Перезапуск агента: ${agent.name}`, 'info');
                break;
            case 'logs':
                onViewLogs === null || onViewLogs === void 0 ? void 0 : onViewLogs(agent.id);
                break;
            case 'settings':
                onOpenSettings === null || onOpenSettings === void 0 ? void 0 : onOpenSettings(agent.id);
                break;
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E0, ${nexusTheme_1.nexusColors.darkMatter}D0)`,
            border: `1px solid ${getOverallStatusColor()}60`,
            borderRadius: 2,
            position: 'relative',
            minHeight: 300,
            '&:hover': {
                border: `1px solid ${getOverallStatusColor()}80`,
                boxShadow: `0 8px 32px ${getOverallStatusColor()}20`
            },
            transition: 'all 0.3s ease'
        }}>
        {/* Status indicator */}
        <material_1.Box sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: 4,
            background: `linear-gradient(90deg, ${getOverallStatusColor()}, ${getOverallStatusColor()}80)`,
            borderRadius: '4px 4px 0 0'
        }}/>

        <material_1.CardContent sx={{ p: 3 }}>
          {/* Header */}
          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <icons_material_1.SmartToy sx={{ color: getOverallStatusColor() }}/>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                Агенти MAS
              </material_1.Typography>
            </material_1.Box>

            <material_1.Chip label={`${activeAgents}/${totalAgents}`} size="small" sx={{
            backgroundColor: `${getOverallStatusColor()}15`,
            color: getOverallStatusColor(),
            fontWeight: 'bold',
            border: `1px solid ${getOverallStatusColor()}40`
        }}/>
          </material_1.Box>

          {/* Overall health */}
          <material_1.Box sx={{ mb: 3 }}>
            <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Загальне здоров'я системи
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: getOverallStatusColor(), fontWeight: 'bold' }}>
                {Math.round(healthPercentage)}%
              </material_1.Typography>
            </material_1.Box>
            <material_1.LinearProgress variant="determinate" value={healthPercentage} sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: `${nexusTheme_1.nexusColors.shadow}40`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: getOverallStatusColor(),
                borderRadius: 3
            }
        }}/>
          </material_1.Box>

          {/* Loading indicator */}
          {loading && (<material_1.LinearProgress sx={{
                mb: 2,
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}40`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.quantum
                }
            }}/>)}

          {/* Agents list */}
          <material_1.Stack spacing={1.5} sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
            {agents.map((agent) => {
            const statusConfig = getStatusConfig(agent.status);
            const typeColor = getAgentTypeColor(agent.type);
            return (<framer_motion_1.motion.div key={agent.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  <material_1.Box sx={{
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
                }}>
                    {/* Agent info */}
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <material_1.Avatar sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${typeColor}20`,
                    border: `1px solid ${typeColor}60`
                }}>
                        <icons_material_1.SmartToy sx={{ fontSize: 16, color: typeColor }}/>
                      </material_1.Avatar>

                      <material_1.Box sx={{ flex: 1 }}>
                        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 'bold' }}>
                            {agent.name}
                          </material_1.Typography>
                          <material_1.Chip size="small" label={getAgentTypeLabel(agent.type)} sx={{
                    fontSize: '0.7rem',
                    height: 20,
                    backgroundColor: `${typeColor}20`,
                    color: typeColor,
                    border: `1px solid ${typeColor}40`
                }}/>
                        </material_1.Box>

                        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            <material_1.Typography variant="caption" sx={{ color: statusConfig.color }}>
                              {statusConfig.label}
                            </material_1.Typography>
                          </material_1.Box>

                          {agent.lastSeen && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, opacity: 0.7 }}>
                              • {agent.lastSeen.toLocaleTimeString('uk-UA')}
                            </material_1.Typography>)}
                        </material_1.Box>

                        {/* Performance indicators */}
                        {(agent.cpu !== undefined || agent.memory !== undefined) && (<material_1.Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {agent.cpu !== undefined && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost, opacity: 0.8 }}>
                                CPU: {Math.round(agent.cpu * 100)}%
                              </material_1.Typography>)}
                            {agent.memory !== undefined && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost, opacity: 0.8 }}>
                                RAM: {Math.round(agent.memory * 100)}%
                              </material_1.Typography>)}
                          </material_1.Box>)}
                      </material_1.Box>
                    </material_1.Box>

                    {/* Actions */}
                    <material_1.Stack direction="row" spacing={0.5}>
                      {agent.status === 'down' && onRestartAgent && (<material_1.Tooltip title="Перезапустити агента">
                          <material_1.IconButton size="small" onClick={() => handleAgentAction('restart', agent)} sx={{
                        color: nexusTheme_1.nexusColors.sapphire,
                        minWidth: 44,
                        minHeight: 44,
                        '&:hover': {
                            backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`
                        }
                    }}>
                            <icons_material_1.Refresh fontSize="small"/>
                          </material_1.IconButton>
                        </material_1.Tooltip>)}

                      {onViewLogs && (<material_1.Tooltip title="Логи агента">
                          <material_1.IconButton size="small" onClick={() => handleAgentAction('logs', agent)} sx={{
                        color: nexusTheme_1.nexusColors.frost,
                        minWidth: 44,
                        minHeight: 44,
                        '&:hover': {
                            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`
                        }
                    }}>
                            <icons_material_1.Timeline fontSize="small"/>
                          </material_1.IconButton>
                        </material_1.Tooltip>)}

                      {onOpenSettings && (<material_1.Tooltip title="Налаштування агента">
                          <material_1.IconButton size="small" onClick={() => handleAgentAction('settings', agent)} sx={{
                        color: nexusTheme_1.nexusColors.frost,
                        minWidth: 44,
                        minHeight: 44,
                        '&:hover': {
                            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`
                        }
                    }}>
                            <icons_material_1.Settings fontSize="small"/>
                          </material_1.IconButton>
                        </material_1.Tooltip>)}
                    </material_1.Stack>
                  </material_1.Box>
                </framer_motion_1.motion.div>);
        })}
          </material_1.Stack>

          {/* Quick actions */}
          <material_1.Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: `1px solid ${nexusTheme_1.nexusColors.shadow}40` }}>
            <material_1.Button size="small" startIcon={<icons_material_1.Refresh />} onClick={() => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Оновити статус', run: () => { } } }, 'Оновлення агентів', 'Оновлення статусу всіх агентів...', 'info')} disabled={loading} variant="outlined" sx={{
            color: nexusTheme_1.nexusColors.frost,
            borderColor: nexusTheme_1.nexusColors.frost,
            minHeight: 44,
            flex: 1,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
                borderColor: nexusTheme_1.nexusColors.quantum
            }
        }}>
              Оновити всі
            </material_1.Button>

            <material_1.Button size="small" startIcon={<icons_material_1.Speed />} onClick={() => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Запустити діагностику', run: () => { } } }, 'Діагностика агентів', 'Запуск повної діагностики агентів...', 'info')} variant="outlined" sx={{
            color: nexusTheme_1.nexusColors.sapphire,
            borderColor: nexusTheme_1.nexusColors.sapphire,
            minHeight: 44,
            flex: 1,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`,
                borderColor: nexusTheme_1.nexusColors.sapphire
            }
        }}>
              Діагностика
            </material_1.Button>
          </material_1.Stack>
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
exports.default = AgentStatusCard;
