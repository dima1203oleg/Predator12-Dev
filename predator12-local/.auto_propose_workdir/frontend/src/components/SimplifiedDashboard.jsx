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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const icons_material_1 = require("@mui/icons-material");
const AgentCard = ({ agent, onAction }) => {
    const [loading, setLoading] = (0, react_1.useState)(null);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#00ff44';
            case 'idle': return '#ffff44';
            case 'error': return '#ff4444';
            default: return '#00ffff';
        }
    };
    const getAgentIcon = (name) => {
        if (name.includes('Heal'))
            return <icons_material_1.Healing />;
        if (name.includes('Improve'))
            return <icons_material_1.AutoFixHigh />;
        if (name.includes('Diagnosis'))
            return <icons_material_1.Analytics />;
        return <icons_material_1.SmartToy />;
    };
    const executeAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(action);
        yield new Promise(resolve => setTimeout(resolve, 2000));
        onAction(agent.name, action);
        setLoading(null);
    });
    return (<framer_motion_1.motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ duration: 0.3 }}>
      <material_1.Card sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: `2px solid ${getStatusColor(agent.status)}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            '&:hover': {
                border: `2px solid ${getStatusColor(agent.status)}`,
                boxShadow: `0 8px 32px ${getStatusColor(agent.status)}30`
            }
        }}>
        <material_1.Box display="flex" alignItems="center" mb={2}>
          <material_1.Avatar sx={{
            bgcolor: getStatusColor(agent.status),
            mr: 2,
            width: 48,
            height: 48
        }}>
            {getAgentIcon(agent.name)}
          </material_1.Avatar>
          <material_1.Box flex={1}>
            <material_1.Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {agent.name}
            </material_1.Typography>
            <material_1.Chip label={agent.status} size="small" sx={{
            bgcolor: `${getStatusColor(agent.status)}20`,
            color: getStatusColor(agent.status),
            fontWeight: 'bold'
        }}/>
          </material_1.Box>
        </material_1.Box>

        <material_1.Box mb={2}>
          <material_1.Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
            Здоров'я: {agent.health}
          </material_1.Typography>
          <material_1.LinearProgress variant="determinate" value={agent.health === 'excellent' ? 100 : agent.health === 'good' ? 80 : 60} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(agent.status)
            }
        }}/>
        </material_1.Box>

        <material_1.Grid container spacing={1} mb={2}>
          <material_1.Grid item xs={6}>
            <material_1.Typography variant="caption" sx={{ color: '#cccccc' }}>
              CPU: {agent.cpu}
            </material_1.Typography>
          </material_1.Grid>
          <material_1.Grid item xs={6}>
            <material_1.Typography variant="caption" sx={{ color: '#cccccc' }}>
              RAM: {agent.memory}
            </material_1.Typography>
          </material_1.Grid>
        </material_1.Grid>

        {(agent.improvements || agent.fixes) && (<material_1.Box display="flex" gap={1} mb={2}>
            {agent.improvements && (<material_1.Chip icon={<icons_material_1.AutoFixHigh />} label={agent.improvements} size="small" sx={{ bgcolor: 'rgba(0,255,0,0.2)', color: '#00ff44' }}/>)}
            {agent.fixes && (<material_1.Chip icon={<icons_material_1.Healing />} label={agent.fixes} size="small" sx={{ bgcolor: 'rgba(255,255,0,0.2)', color: '#ffff44' }}/>)}
          </material_1.Box>)}

        {/* Action Buttons */}
        <material_1.Box display="flex" gap={1} justifyContent="space-between">
          <material_1.Tooltip title="Перезапустити">
            <material_1.IconButton size="small" onClick={() => executeAction('restart')} disabled={!!loading} sx={{ color: '#ffff44' }}>
              {loading === 'restart' ? <material_1.Box className="loading-spinner"/> : <icons_material_1.RestartAlt />}
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Оптимізувати">
            <material_1.IconButton size="small" onClick={() => executeAction('optimize')} disabled={!!loading} sx={{ color: '#00ff44' }}>
              {loading === 'optimize' ? <material_1.Box className="loading-spinner"/> : <icons_material_1.Build />}
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Діагностика">
            <material_1.IconButton size="small" onClick={() => executeAction('diagnose')} disabled={!!loading} sx={{ color: '#ff8800' }}>
              {loading === 'diagnose' ? <material_1.Box className="loading-spinner"/> : <icons_material_1.BugReport />}
            </material_1.IconButton>
          </material_1.Tooltip>

          <material_1.Tooltip title="Налаштування">
            <material_1.IconButton size="small" onClick={() => executeAction('configure')} disabled={!!loading} sx={{ color: '#00ffff' }}>
              {loading === 'configure' ? <material_1.Box className="loading-spinner"/> : <icons_material_1.Settings />}
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
const SimplifiedDashboard = () => {
    const [notification, setNotification] = (0, react_1.useState)({
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
    const handleAgentAction = (agentName, action) => {
        const actionMessages = {
            restart: `Агент ${agentName} успішно перезапущено`,
            optimize: `Агент ${agentName} оптимізовано`,
            diagnose: `Діагностика агента ${agentName} завершена`,
            configure: `Налаштування агента ${agentName} збережено`
        };
        setNotification({
            open: true,
            message: actionMessages[action] || `Дія ${action} виконана`,
            severity: 'success'
        });
        console.log(`✅ ${agentName}: ${action} виконано успішно`);
    };
    const handleGlobalAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`🌐 Виконується: ${action}`);
        yield new Promise(resolve => setTimeout(resolve, 1000));
        const messages = {
            'restart-all': 'Всі агенти успішно перезапущені',
            'optimize-all': 'Глобальна оптимізація завершена',
            'health-check': 'Перевірка здоров\'я завершена',
            'backup': 'Резервна копія створена',
            'security-scan': 'Сканування безпеки завершено'
        };
        setNotification({
            open: true,
            message: messages[action] || 'Операція виконана',
            severity: 'success'
        });
    });
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <material_1.Paper sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,60,0.95) 100%)',
            border: '2px solid rgba(0,255,255,0.5)',
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
        }}>
          <material_1.Typography variant="h3" className="title-cyberpunk" sx={{ mb: 2 }}>
            🤖 Центр управління агентами PREDATOR11
          </material_1.Typography>

          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#00ff44', fontWeight: 'bold' }}>
                  {agents.filter(a => a.status === 'active').length}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Активних агентів
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#ffff44', fontWeight: 'bold' }}>
                  {agents.reduce((sum, a) => sum + (a.improvements || 0), 0)}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Покращень за день
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#ff8800', fontWeight: 'bold' }}>
                  {agents.reduce((sum, a) => sum + (a.fixes || 0), 0)}
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Виправлень за день
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
            <material_1.Grid item xs={6} sm={3}>
              <material_1.Box textAlign="center">
                <material_1.Typography variant="h4" sx={{ color: '#00ffff', fontWeight: 'bold' }}>
                  99%
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: '#cccccc' }}>
                  Готовність системи
                </material_1.Typography>
              </material_1.Box>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Global Actions */}
      <framer_motion_1.motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <material_1.Paper sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.9) 100%)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(20px)'
        }}>
          <material_1.Typography variant="h5" sx={{ color: '#00ffff', mb: 2, fontWeight: 'bold' }}>
            🌐 Глобальні операції
          </material_1.Typography>
          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.RestartAlt />} onClick={() => handleGlobalAction('restart-all')} sx={{
            bgcolor: '#ffff44',
            color: '#000',
            '&:hover': { bgcolor: '#dddd00', transform: 'translateY(-2px)' }
        }}>
                Перезапустити всі
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.AutoFixHigh />} onClick={() => handleGlobalAction('optimize-all')} sx={{
            bgcolor: '#00ff44',
            color: '#000',
            '&:hover': { bgcolor: '#00dd00', transform: 'translateY(-2px)' }
        }}>
                Оптимізувати
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" startIcon={<icons_material_1.BugReport />} onClick={() => handleGlobalAction('health-check')} sx={{
            bgcolor: '#00ffff',
            color: '#000',
            '&:hover': { bgcolor: '#00dddd', transform: 'translateY(-2px)' }
        }}>
                Діагностика
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" onClick={() => handleGlobalAction('backup')} sx={{
            bgcolor: '#ff8800',
            color: '#000',
            '&:hover': { bgcolor: '#dd6600', transform: 'translateY(-2px)' }
        }}>
                Резервна копія
              </material_1.Button>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6} md={2}>
              <material_1.Button fullWidth variant="contained" onClick={() => handleGlobalAction('security-scan')} sx={{
            bgcolor: '#ff4444',
            color: '#fff',
            '&:hover': { bgcolor: '#dd0000', transform: 'translateY(-2px)' }
        }}>
                Аудит безпеки
              </material_1.Button>
            </material_1.Grid>
          </material_1.Grid>
        </material_1.Paper>
      </framer_motion_1.motion.div>

      {/* Agents Grid */}
      <material_1.Grid container spacing={3}>
        {agents.map((agent, index) => (<material_1.Grid item xs={12} sm={6} md={3} key={agent.name}>
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <AgentCard agent={agent} onAction={handleAgentAction}/>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Notification */}
      <material_1.Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification(Object.assign(Object.assign({}, notification), { open: false }))}>
        <material_1.Alert onClose={() => setNotification(Object.assign(Object.assign({}, notification), { open: false }))} severity={notification.severity}>
          {notification.message}
        </material_1.Alert>
      </material_1.Snackbar>
    </material_1.Box>);
};
exports.default = SimplifiedDashboard;
