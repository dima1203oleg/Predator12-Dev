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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveAgentsGrid = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AgentCard = ({ agent, onClick, isSelected }) => {
    var _a, _b;
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    const [detailsOpen, setDetailsOpen] = (0, react_1.useState)(false);
    const [actionLoading, setActionLoading] = (0, react_1.useState)(null);
    const [notification, setNotification] = (0, react_1.useState)({
        open: false, message: '', severity: 'success'
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#00ff44';
            case 'idle': return '#ffff44';
            case 'error': return '#ff4444';
            case 'restarting': return '#ff8800';
            case 'stopped': return '#666666';
            default: return '#00ffff';
        }
    };
    const getHealthLevel = (health) => {
        switch (health) {
            case 'excellent': return 100;
            case 'good': return 80;
            case 'warning': return 60;
            case 'critical': return 30;
            default: return 50;
        }
    };
    const getAgentIcon = (name) => {
        if (name.includes('Heal'))
            return <icons_material_1.Healing />;
        if (name.includes('Improve'))
            return <icons_material_1.AutoFixHigh />;
        if (name.includes('Diagnosis'))
            return <icons_material_1.Analytics />;
        if (name.includes('Security'))
            return <icons_material_1.Security />;
        if (name.includes('Monitor'))
            return <icons_material_1.MonitorHeart />;
        return <icons_material_1.SmartToy />;
    };
    const executeAgentAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
        setActionLoading(action);
        try {
            // Симуляція API виклику
            yield new Promise(resolve => setTimeout(resolve, 2000));
            let message = '';
            switch (action) {
                case 'restart':
                    message = `Агент ${agent.name} успішно перезапущено`;
                    break;
                case 'stop':
                    message = `Агент ${agent.name} зупинено`;
                    break;
                case 'optimize':
                    message = `Агент ${agent.name} оптимізовано`;
                    break;
                case 'diagnose':
                    message = `Діагностика агента ${agent.name} завершена`;
                    break;
                case 'backup':
                    message = `Створено резервну копію агента ${agent.name}`;
                    break;
                default:
                    message = `Дія "${action}" виконана для агента ${agent.name}`;
            }
            setNotification({ open: true, message, severity: 'success' });
        }
        catch (error) {
            setNotification({
                open: true,
                message: `Помилка виконання дії "${action}" для агента ${agent.name}`,
                severity: 'error'
            });
        }
        finally {
            setActionLoading(null);
        }
    });
    return (<>
      <framer_motion_1.motion.div whileHover={{ scale: 1.03, y: -8 }} whileTap={{ scale: 0.98 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} transition={{ duration: 0.3 }}>
        <material_1.Card onClick={onClick} className={`interactive-card ${isSelected ? 'cyber-border' : ''}`} sx={{
            p: 3,
            height: '100%',
            cursor: 'pointer',
            background: isSelected
                ? 'linear-gradient(135deg, rgba(0,255,255,0.2) 0%, rgba(0,150,255,0.1) 100%)'
                : 'rgba(0,0,0,0.8)',
            border: `2px solid ${isSelected ? '#00ffff' : 'rgba(0,255,255,0.3)'}`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            boxShadow: isHovered || isSelected
                ? `0 12px 40px ${getStatusColor(agent.status)}40`
                : '0 4px 16px rgba(0,0,0,0.3)',
            position: 'relative'
        }}>
          {/* Status Badge */}
          <material_1.Badge badgeContent={agent.errorCount || 0} color="error" sx={{ position: 'absolute', top: 8, right: 8 }}>
            <material_1.Box sx={{
            width: 12,
            height: 12,
            bgcolor: getStatusColor(agent.status),
            borderRadius: '50%',
            animation: agent.status === 'active' ? 'pulse-scale 1.5s ease-in-out infinite' : 'none',
            boxShadow: `0 0 10px ${getStatusColor(agent.status)}`
        }}/>
          </material_1.Badge>

          <material_1.Box display="flex" alignItems="center" mb={2}>
            <material_1.Avatar sx={{
            bgcolor: getStatusColor(agent.status),
            mr: 2,
            width: 56,
            height: 56,
            boxShadow: `0 0 20px ${getStatusColor(agent.status)}40`
        }}>
              {getAgentIcon(agent.name)}
            </material_1.Avatar>
            <material_1.Box flex={1}>
              <material_1.Typography variant="h6" className="subtitle-glow" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {agent.name}
              </material_1.Typography>
              <material_1.Box display="flex" gap={1} flexWrap="wrap">
                <material_1.Chip label={agent.status} size="small" sx={{
            bgcolor: `${getStatusColor(agent.status)}20`,
            color: getStatusColor(agent.status),
            fontWeight: 'bold',
            textShadow: `0 0 10px ${getStatusColor(agent.status)}`
        }}/>
                {agent.version && (<material_1.Chip label={`v${agent.version}`} size="small" variant="outlined" sx={{ color: '#cccccc', borderColor: '#cccccc' }}/>)}
              </material_1.Box>
            </material_1.Box>
          </material_1.Box>

          {/* Health Progress */}
          <material_1.Box mb={2}>
            <material_1.Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                Здоров'я: <span className={`status-${agent.health}`}>{agent.health}</span>
              </material_1.Typography>
              <material_1.Typography variant="caption" sx={{ color: '#cccccc' }}>
                {getHealthLevel(agent.health)}%
              </material_1.Typography>
            </material_1.Box>
            <material_1.LinearProgress variant="determinate" value={getHealthLevel(agent.health)} className="cyber-progress" sx={{
            '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(agent.status),
            }
        }}/>
          </material_1.Box>

          {/* Resource Usage */}
          <material_1.Grid container spacing={2} mb={2}>
            <material_1.Grid item xs={6}>
              <material_1.Box display="flex" alignItems="center">
                <icons_material_1.Speed sx={{ color: '#ff6b6b', mr: 1, fontSize: 18 }}/>
                <material_1.Box>
                  <material_1.Typography variant="caption" sx={{ color: '#cccccc', display: 'block' }}>
                    CPU: {agent.cpu}
                  </material_1.Typography>
                  <material_1.LinearProgress variant="determinate" value={parseInt(((_a = agent.cpu) === null || _a === void 0 ? void 0 : _a.replace('%', '')) || '0')} sx={{ width: 40, height: 3 }}/>
                </material_1.Box>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6}>
              <material_1.Box display="flex" alignItems="center">
                <icons_material_1.Memory sx={{ color: '#4ecdc4', mr: 1, fontSize: 18 }}/>
                <material_1.Box>
                  <material_1.Typography variant="caption" sx={{ color: '#cccccc', display: 'block' }}>
                    RAM: {agent.memory}
                  </material_1.Typography>
                  <material_1.LinearProgress variant="determinate" value={parseInt(((_b = agent.memory) === null || _b === void 0 ? void 0 : _b.replace('%', '')) || '0')} sx={{ width: 40, height: 3 }}/>
                </material_1.Box>
              </material_1.Box>
            </material_1.Grid>
          </material_1.Grid>

          {/* Performance Metrics */}
          {agent.metrics && (<material_1.Box mb={2}>
              <material_1.Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }}/>
              <material_1.Grid container spacing={1}>
                <material_1.Grid item xs={4}>
                  <material_1.Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    Відгук
                  </material_1.Typography>
                  <material_1.Typography variant="caption" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
                    {agent.metrics.avgResponseTime}
                  </material_1.Typography>
                </material_1.Grid>
                <material_1.Grid item xs={4}>
                  <material_1.Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    Успіх
                  </material_1.Typography>
                  <material_1.Typography variant="caption" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
                    {agent.metrics.successRate}
                  </material_1.Typography>
                </material_1.Grid>
                <material_1.Grid item xs={4}>
                  <material_1.Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    Пропуск.
                  </material_1.Typography>
                  <material_1.Typography variant="caption" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
                    {agent.metrics.throughput}
                  </material_1.Typography>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.Box>)}

          {/* Stats and Actions */}
          <material_1.Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <material_1.Box display="flex" gap={1}>
              {agent.improvements && (<material_1.Chip icon={<icons_material_1.AutoFixHigh />} label={agent.improvements} size="small" sx={{
                bgcolor: 'rgba(0,255,0,0.2)',
                color: '#00ff44',
                fontWeight: 'bold'
            }}/>)}
              {agent.fixes && (<material_1.Chip icon={<icons_material_1.Healing />} label={agent.fixes} size="small" sx={{
                bgcolor: 'rgba(255,255,0,0.2)',
                color: '#ffff44',
                fontWeight: 'bold'
            }}/>)}
              {agent.tasksCompleted && (<material_1.Chip icon={<icons_material_1.CheckCircle />} label={agent.tasksCompleted} size="small" sx={{
                bgcolor: 'rgba(0,255,255,0.2)',
                color: '#00ffff',
                fontWeight: 'bold'
            }}/>)}
            </material_1.Box>
          </material_1.Box>

          {/* Action Buttons */}
          <material_1.Box display="flex" gap={1} mt={2}>
            <material_1.Tooltip title="Детальна інформація">
              <material_1.IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            setDetailsOpen(true);
        }} sx={{ color: '#00ffff' }}>
                <icons_material_1.InfoOutlined />
              </material_1.IconButton>
            </material_1.Tooltip>

            <material_1.Tooltip title="Перезапустити агент">
              <material_1.IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            executeAgentAction('restart');
        }} disabled={actionLoading === 'restart'} sx={{ color: '#ffff44' }}>
                {actionLoading === 'restart' ? <material_1.CircularProgress size={16}/> : <icons_material_1.RestartAlt />}
              </material_1.IconButton>
            </material_1.Tooltip>

            <material_1.Tooltip title="Оптимізувати">
              <material_1.IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            executeAgentAction('optimize');
        }} disabled={actionLoading === 'optimize'} sx={{ color: '#00ff44' }}>
                {actionLoading === 'optimize' ? <material_1.CircularProgress size={16}/> : <icons_material_1.Build />}
              </material_1.IconButton>
            </material_1.Tooltip>

            <material_1.Tooltip title="Діагностика">
              <material_1.IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            executeAgentAction('diagnose');
        }} disabled={actionLoading === 'diagnose'} sx={{ color: '#ff8800' }}>
                {actionLoading === 'diagnose' ? <material_1.CircularProgress size={16}/> : <icons_material_1.BugReport />}
              </material_1.IconButton>
            </material_1.Tooltip>
          </material_1.Box>

          {/* Uptime Info */}
          {agent.uptime && (<material_1.Box mt={1}>
              <material_1.Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                Uptime: {agent.uptime}
              </material_1.Typography>
              {agent.lastActivity && (<material_1.Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  Остання активність: {agent.lastActivity}
                </material_1.Typography>)}
            </material_1.Box>)}
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Detailed Info Modal */}
      <material_1.Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
                border: '1px solid rgba(0,255,255,0.3)',
                borderRadius: 2
            }
        }}>
        <material_1.DialogTitle sx={{ color: '#00ffff', borderBottom: '1px solid rgba(0,255,255,0.3)' }}>
          <material_1.Box display="flex" alignItems="center">
            {getAgentIcon(agent.name)}
            <material_1.Typography variant="h5" sx={{ ml: 2 }}>
              {agent.name} - Детальна інформація
            </material_1.Typography>
          </material_1.Box>
        </material_1.DialogTitle>

        <material_1.DialogContent sx={{ color: '#ffffff', mt: 2 }}>
          <material_1.Grid container spacing={3}>
            {/* General Info */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                Загальна інформація
              </material_1.Typography>
              <material_1.TableContainer component={material_1.Paper} sx={{ bgcolor: 'rgba(0,0,0,0.5)' }}>
                <material_1.Table size="small">
                  <material_1.TableBody>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: '#ccc' }}>Статус</material_1.TableCell>
                      <material_1.TableCell sx={{ color: getStatusColor(agent.status) }}>{agent.status}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: '#ccc' }}>Здоров'я</material_1.TableCell>
                      <material_1.TableCell sx={{ color: '#fff' }}>{agent.health}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: '#ccc' }}>Версія</material_1.TableCell>
                      <material_1.TableCell sx={{ color: '#fff' }}>{agent.version || 'N/A'}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: '#ccc' }}>Uptime</material_1.TableCell>
                      <material_1.TableCell sx={{ color: '#fff' }}>{agent.uptime || 'N/A'}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: '#ccc' }}>CPU</material_1.TableCell>
                      <material_1.TableCell sx={{ color: '#fff' }}>{agent.cpu}</material_1.TableCell>
                    </material_1.TableRow>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: '#ccc' }}>Пам'ять</material_1.TableCell>
                      <material_1.TableCell sx={{ color: '#fff' }}>{agent.memory}</material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>
            </material_1.Grid>

            {/* Performance */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                Продуктивність
              </material_1.Typography>
              <material_1.Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                <material_1.Typography sx={{ color: '#fff' }}>Покращень: {agent.improvements || 0}</material_1.Typography>
                <material_1.Typography sx={{ color: '#fff' }}>Виправлень: {agent.fixes || 0}</material_1.Typography>
                <material_1.Typography sx={{ color: '#fff' }}>Завдань виконано: {agent.tasksCompleted || 0}</material_1.Typography>
                <material_1.Typography sx={{ color: '#fff' }}>Помилок: {agent.errorCount || 0}</material_1.Typography>
                {agent.metrics && (<>
                    <material_1.Typography sx={{ color: '#fff' }}>Середній час відгуку: {agent.metrics.avgResponseTime}</material_1.Typography>
                    <material_1.Typography sx={{ color: '#fff' }}>Успішність: {agent.metrics.successRate}</material_1.Typography>
                    <material_1.Typography sx={{ color: '#fff' }}>Пропускна здатність: {agent.metrics.throughput}</material_1.Typography>
                  </>)}
              </material_1.Box>
            </material_1.Grid>

            {/* Capabilities */}
            {agent.capabilities && (<material_1.Grid item xs={12}>
                <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Можливості
                </material_1.Typography>
                <material_1.List sx={{ bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                  {agent.capabilities.map((capability, index) => (<material_1.ListItem key={index}>
                      <material_1.ListItemIcon>
                        <icons_material_1.CheckCircle sx={{ color: '#00ff44' }}/>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary={capability} sx={{ color: '#fff' }}/>
                    </material_1.ListItem>))}
                </material_1.List>
              </material_1.Grid>)}

            {/* Description */}
            {agent.description && (<material_1.Grid item xs={12}>
                <material_1.Typography variant="h6" sx={{ color: '#00ffff', mb: 2 }}>
                  Опис
                </material_1.Typography>
                <material_1.Typography sx={{ color: '#fff', p: 2, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
                  {agent.description}
                </material_1.Typography>
              </material_1.Grid>)}
          </material_1.Grid>
        </material_1.DialogContent>

        <material_1.DialogActions sx={{ borderTop: '1px solid rgba(0,255,255,0.3)', pt: 2 }}>
          <material_1.Button onClick={() => executeAgentAction('backup')} disabled={actionLoading === 'backup'} startIcon={actionLoading === 'backup' ? <material_1.CircularProgress size={16}/> : <icons_material_1.Backup />} sx={{ color: '#00ffff' }}>
            Резервна копія
          </material_1.Button>
          <material_1.Button onClick={() => executeAgentAction('stop')} disabled={actionLoading === 'stop'} startIcon={actionLoading === 'stop' ? <material_1.CircularProgress size={16}/> : <icons_material_1.Stop />} sx={{ color: '#ff4444' }}>
            Зупинити
          </material_1.Button>
          <material_1.Button onClick={() => setDetailsOpen(false)} sx={{ color: '#ffffff' }}>
            Закрити
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Notification Snackbar */}
      <material_1.Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(Object.assign(Object.assign({}, notification), { open: false }))}>
        <material_1.Alert onClose={() => setNotification(Object.assign(Object.assign({}, notification), { open: false }))} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </material_1.Alert>
      </material_1.Snackbar>
    </>);
};
const InteractiveAgentsGrid = ({ agents, onAgentSelect }) => {
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [isPlaying, setIsPlaying] = (0, react_1.useState)(true);
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [sortBy, setSortBy] = (0, react_1.useState)('name');
    const [globalAction, setGlobalAction] = (0, react_1.useState)(null);
    const [notification, setNotification] = (0, react_1.useState)({
        open: false, message: '', severity: 'success'
    });
    // Enhanced mock data with full information
    const enhancedAgents = agents.length > 0 ? agents.map(agent => (Object.assign(Object.assign({}, agent), { version: '2.1.0', uptime: '72h 15m', lastActivity: '2 хв тому', tasksCompleted: Math.floor(Math.random() * 1000) + 100, errorCount: Math.floor(Math.random() * 5), description: `Агент ${agent.name} відповідає за автоматичне ${agent.name.includes('Heal') ? 'лікування та відновлення' : agent.name.includes('Improve') ? 'покращення та оптимізацію' : 'діагностику та моніторинг'} системи PREDATOR11.`, capabilities: [
            'Реалтайм моніторинг',
            'Автоматичне виправлення помилок',
            'Машинне навчання',
            'Predictive analytics',
            'Self-healing algorithms'
        ], metrics: {
            avgResponseTime: `${Math.floor(Math.random() * 100) + 10}ms`,
            successRate: `${Math.floor(Math.random() * 10) + 90}%`,
            throughput: `${Math.floor(Math.random() * 1000) + 500}/sec`
        } }))) : [
        {
            name: 'SelfHealingAgent',
            status: 'active',
            health: 'excellent',
            cpu: '6%',
            memory: '39%',
            improvements: 12,
            fixes: 9,
            version: '2.1.0',
            uptime: '72h 15m',
            lastActivity: '2 хв тому',
            tasksCompleted: 847,
            errorCount: 0,
            description: 'Агент SelfHealingAgent відповідає за автоматичне лікування та відновлення системи PREDATOR11.',
            capabilities: [
                'Автоматичне виявлення збоїв',
                'Самовідновлення сервісів',
                'Health monitoring',
                'Emergency response',
                'Failover management'
            ],
            metrics: {
                avgResponseTime: '45ms',
                successRate: '99.2%',
                throughput: '1,247/sec'
            }
        },
        {
            name: 'AutoImproveAgent',
            status: 'active',
            health: 'good',
            cpu: '15%',
            memory: '57%',
            improvements: 8,
            fixes: 3,
            version: '2.0.5',
            uptime: '68h 42m',
            lastActivity: '1 хв тому',
            tasksCompleted: 623,
            errorCount: 2,
            description: 'Агент AutoImproveAgent відповідає за автоматичне покращення та оптимізацію системи PREDATOR11.',
            capabilities: [
                'Performance optimization',
                'Code refactoring',
                'Algorithm enhancement',
                'Resource management',
                'Continuous improvement'
            ],
            metrics: {
                avgResponseTime: '78ms',
                successRate: '95.8%',
                throughput: '892/sec'
            }
        },
        {
            name: 'SelfDiagnosisAgent',
            status: 'active',
            health: 'excellent',
            cpu: '12%',
            memory: '42%',
            improvements: 5,
            fixes: 7,
            version: '2.1.2',
            uptime: '71h 33m',
            lastActivity: '30 сек тому',
            tasksCompleted: 1156,
            errorCount: 1,
            description: 'Агент SelfDiagnosisAgent відповідає за автоматичну діагностику та моніторинг системи PREDATOR11.',
            capabilities: [
                'System diagnostics',
                'Predictive analytics',
                'Anomaly detection',
                'Performance monitoring',
                'Health assessment'
            ],
            metrics: {
                avgResponseTime: '32ms',
                successRate: '98.7%',
                throughput: '1,543/sec'
            }
        },
        {
            name: 'ContainerHealer',
            status: 'active',
            health: 'excellent',
            cpu: '8%',
            memory: '28%',
            improvements: 15,
            fixes: 22,
            version: '1.9.8',
            uptime: '156h 12m',
            lastActivity: '45 сек тому',
            tasksCompleted: 2047,
            errorCount: 0,
            description: 'Агент ContainerHealer відповідає за автоматичне лікування та управління Docker контейнерами.',
            capabilities: [
                'Container monitoring',
                'Auto-restart policies',
                'Resource scaling',
                'Health checks',
                'Disaster recovery'
            ],
            metrics: {
                avgResponseTime: '23ms',
                successRate: '99.8%',
                throughput: '2,156/sec'
            }
        },
        {
            name: 'SecurityAgent',
            status: 'active',
            health: 'good',
            cpu: '18%',
            memory: '63%',
            improvements: 6,
            fixes: 11,
            version: '3.0.1',
            uptime: '89h 27m',
            lastActivity: '15 сек тому',
            tasksCompleted: 394,
            errorCount: 3,
            description: 'Агент SecurityAgent відповідає за безпеку та захист системи PREDATOR11.',
            capabilities: [
                'Threat detection',
                'Vulnerability scanning',
                'Access control',
                'Audit logging',
                'Incident response'
            ],
            metrics: {
                avgResponseTime: '156ms',
                successRate: '94.3%',
                throughput: '456/sec'
            }
        },
        {
            name: 'MonitoringAgent',
            status: 'idle',
            health: 'warning',
            cpu: '3%',
            memory: '21%',
            improvements: 2,
            fixes: 1,
            version: '1.8.3',
            uptime: '12h 8m',
            lastActivity: '5 хв тому',
            tasksCompleted: 78,
            errorCount: 7,
            description: 'Агент MonitoringAgent відповідає за збір метрик та моніторинг системи PREDATOR11.',
            capabilities: [
                'Metrics collection',
                'Alert management',
                'Dashboard generation',
                'Trend analysis',
                'Reporting'
            ],
            metrics: {
                avgResponseTime: '234ms',
                successRate: '87.2%',
                throughput: '234/sec'
            }
        }
    ];
    const handleAgentClick = (agent) => {
        setSelectedAgent(agent.name);
        onAgentSelect(agent);
    };
    const executeGlobalAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
        setGlobalAction(action);
        try {
            yield new Promise(resolve => setTimeout(resolve, 3000));
            let message = '';
            switch (action) {
                case 'restart-all':
                    message = 'Всі агенти успішно перезапущені';
                    break;
                case 'optimize-all':
                    message = 'Виконано глобальну оптимізацію всіх агентів';
                    break;
                case 'health-check':
                    message = 'Перевірка здоров\'я всіх агентів завершена';
                    break;
                case 'backup-all':
                    message = 'Створено резервні копії всіх агентів';
                    break;
                case 'update-all':
                    message = 'Оновлення всіх агентів завершено';
                    break;
                default:
                    message = `Глобальна дія "${action}" виконана`;
            }
            setNotification({ open: true, message, severity: 'success' });
        }
        catch (error) {
            setNotification({
                open: true,
                message: `Помилка виконання глобальної дії "${action}"`,
                severity: 'error'
            });
        }
        finally {
            setGlobalAction(null);
        }
    });
    const filteredAgents = enhancedAgents.filter(agent => filterStatus === 'all' || agent.status === filterStatus);
    const sortedAgents = [...filteredAgents].sort((a, b) => {
        switch (sortBy) {
            case 'health':
                return b.health.localeCompare(a.health);
            case 'cpu':
                return parseInt(b.cpu.replace('%', '')) - parseInt(a.cpu.replace('%', ''));
            case 'memory':
                return parseInt(b.memory.replace('%', '')) - parseInt(a.memory.replace('%', ''));
            case 'fixes':
                return (b.fixes || 0) - (a.fixes || 0);
            default:
                return a.name.localeCompare(b.name);
        }
    });
    return (<material_1.Box style={{ padding: 16 }}>
      {/* Header with Controls */}
      <material_1.Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <material_1.Typography variant="h4" className="title-cyberpunk">
          🤖 Система Агентів Самовдосконалення
        </material_1.Typography>

        <material_1.Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* Filter Controls */}
          <material_1.Box display="flex" gap={1}>
            {['all', 'active', 'idle', 'error'].map(status => (<material_1.Button key={status} variant={filterStatus === status ? 'contained' : 'outlined'} size="small" onClick={() => setFilterStatus(status)} sx={{
                color: filterStatus === status ? '#000' : '#00ffff',
                borderColor: '#00ffff',
                bgcolor: filterStatus === status ? '#00ffff' : 'transparent'
            }}>
                {status === 'all' ? 'Всі' : status}
              </material_1.Button>))}
          </material_1.Box>

          {/* Sort Controls */}
          <material_1.Box display="flex" gap={1}>
            {[
            { key: 'name', label: 'Ім\'я' },
            { key: 'health', label: 'Здоров\'я' },
            { key: 'cpu', label: 'CPU' },
            { key: 'fixes', label: 'Виправлення' }
        ].map(sort => (<material_1.Button key={sort.key} variant={sortBy === sort.key ? 'contained' : 'outlined'} size="small" onClick={() => setSortBy(sort.key)} sx={{
                color: sortBy === sort.key ? '#000' : '#ffff44',
                borderColor: '#ffff44',
                bgcolor: sortBy === sort.key ? '#ffff44' : 'transparent'
            }}>
                {sort.label}
              </material_1.Button>))}
          </material_1.Box>

          <material_1.Tooltip title={isPlaying ? 'Призупинити анімації' : 'Запустити анімації'}>
            <material_1.IconButton onClick={() => setIsPlaying(!isPlaying)} sx={{
            color: '#00ffff',
            '&:hover': {
                bgcolor: 'rgba(0,255,255,0.1)',
                transform: 'scale(1.1)'
            }
        }}>
              {isPlaying ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Box>

      {/* Global Actions Panel */}
      <material_1.Card className="glass-morphism" sx={{ p: 2, mb: 3 }}>
        <material_1.Typography variant="h6" className="subtitle-glow" sx={{ mb: 2 }}>
          🌐 Глобальні дії
        </material_1.Typography>
        <material_1.Box display="flex" gap={2} flexWrap="wrap">
          <material_1.Button variant="contained" startIcon={globalAction === 'restart-all' ? <material_1.CircularProgress size={16}/> : <icons_material_1.RestartAlt />} onClick={() => executeGlobalAction('restart-all')} disabled={!!globalAction} sx={{ bgcolor: '#ffff44', color: '#000', '&:hover': { bgcolor: '#dddd00' } }}>
            Перезапустити всі
          </material_1.Button>

          <material_1.Button variant="contained" startIcon={globalAction === 'optimize-all' ? <material_1.CircularProgress size={16}/> : <icons_material_1.Build />} onClick={() => executeGlobalAction('optimize-all')} disabled={!!globalAction} sx={{ bgcolor: '#00ff44', color: '#000', '&:hover': { bgcolor: '#00dd00' } }}>
            Оптимізувати всі
          </material_1.Button>

          <material_1.Button variant="contained" startIcon={globalAction === 'health-check' ? <material_1.CircularProgress size={16}/> : <icons_material_1.MonitorHeart />} onClick={() => executeGlobalAction('health-check')} disabled={!!globalAction} sx={{ bgcolor: '#00ffff', color: '#000', '&:hover': { bgcolor: '#00dddd' } }}>
            Перевірка здоров'я
          </material_1.Button>

          <material_1.Button variant="contained" startIcon={globalAction === 'backup-all' ? <material_1.CircularProgress size={16}/> : <icons_material_1.Backup />} onClick={() => executeGlobalAction('backup-all')} disabled={!!globalAction} sx={{ bgcolor: '#ff8800', color: '#000', '&:hover': { bgcolor: '#dd6600' } }}>
            Резервні копії
          </material_1.Button>

          <material_1.Button variant="contained" startIcon={globalAction === 'update-all' ? <material_1.CircularProgress size={16}/> : <icons_material_1.CloudSync />} onClick={() => executeGlobalAction('update-all')} disabled={!!globalAction} sx={{ bgcolor: '#8800ff', color: '#fff', '&:hover': { bgcolor: '#6600dd' } }}>
            Оновити всі
          </material_1.Button>
        </material_1.Box>
      </material_1.Card>

      {/* System Statistics */}
      <material_1.Grid container spacing={2} mb={3}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <material_1.Typography variant="h4" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
              {enhancedAgents.filter(a => a.status === 'active').length}
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
              Активних агентів
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <material_1.Typography variant="h4" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
              {enhancedAgents.reduce((sum, a) => sum + (a.improvements || 0), 0)}
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
              Покращень за день
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <material_1.Typography variant="h4" sx={{ color: '#ff8800', fontWeight: 'bold' }}>
              {enhancedAgents.reduce((sum, a) => sum + (a.fixes || 0), 0)}
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
              Виправлень за день
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card className="glass-morphism" sx={{ p: 2, textAlign: 'center' }}>
            <material_1.Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
              {Math.round(enhancedAgents.reduce((sum, a) => { var _a, _b; return sum + parseInt(((_b = (_a = a.metrics) === null || _a === void 0 ? void 0 : _a.successRate) === null || _b === void 0 ? void 0 : _b.replace('%', '')) || '0'); }, 0) / enhancedAgents.length)}%
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
              Середня успішність
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>

      {/* Agents Grid */}
      <material_1.Grid container spacing={3}>
        {sortedAgents.map((agent, index) => (<material_1.Grid item xs={12} sm={6} md={4} lg={3} key={agent.name}>
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
            }}>
              <AgentCard agent={agent} onClick={() => handleAgentClick(agent)} isSelected={selectedAgent === agent.name}/>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Floating stats */}
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }} style={{
            position: 'fixed',
            bottom: 30,
            left: 30,
            zIndex: 100
        }}>
        <material_1.Card className="glass-morphism" sx={{ p: 2, minWidth: 250 }}>
          <material_1.Typography variant="subtitle2" className="subtitle-glow" sx={{ mb: 1 }}>
            📊 Реалтайм статистика
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: '#fff' }}>
            Всього агентів: {enhancedAgents.length}
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: '#00ff44' }}>
            Активних: {enhancedAgents.filter(a => a.status === 'active').length}
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: '#ffff44' }}>
            Простоюють: {enhancedAgents.filter(a => a.status === 'idle').length}
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: '#ff4444' }}>
            З помилками: {enhancedAgents.filter(a => a.status === 'error').length}
          </material_1.Typography>
          <material_1.Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }}/>
          <material_1.Typography variant="body2" sx={{ color: '#00ffff' }}>
            Завдань виконано: {enhancedAgents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0)}
          </material_1.Typography>
          <material_1.Typography variant="body2" sx={{ color: '#ff8800' }}>
            Загальних помилок: {enhancedAgents.reduce((sum, a) => sum + (a.errorCount || 0), 0)}
          </material_1.Typography>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Global Notification */}
      <material_1.Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification(Object.assign(Object.assign({}, notification), { open: false }))}>
        <material_1.Alert onClose={() => setNotification(Object.assign(Object.assign({}, notification), { open: false }))} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </material_1.Alert>
      </material_1.Snackbar>
    </material_1.Box>);
};
exports.InteractiveAgentsGrid = InteractiveAgentsGrid;
