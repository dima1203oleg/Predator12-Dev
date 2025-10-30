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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const framer_motion_1 = require("framer-motion");
const react_2 = require("@use-gesture/react");
const react_hotkeys_hook_1 = require("react-hotkeys-hook");
const THREE = __importStar(require("three"));
const material_1 = require("@mui/material");
const RestartAlt_1 = __importDefault(require("@mui/icons-material/RestartAlt"));
const Block_1 = __importDefault(require("@mui/icons-material/Block"));
const PlayArrow_1 = __importDefault(require("@mui/icons-material/PlayArrow"));
const Settings_1 = __importDefault(require("@mui/icons-material/Settings"));
const HealthAndSafety_1 = __importDefault(require("@mui/icons-material/HealthAndSafety"));
const Error_1 = __importDefault(require("@mui/icons-material/Error"));
const Warning_1 = __importDefault(require("@mui/icons-material/Warning"));
const CheckCircle_1 = __importDefault(require("@mui/icons-material/CheckCircle"));
// 3D агент у вулику
const AgentNode = ({ agent, onClick, isSelected, hiveCenter }) => {
    const meshRef = (0, react_1.useRef)(null);
    const [hovered, setHovered] = (0, react_1.useState)(false);
    // Анімація "дихання" вулика та міграції при навантаженні
    (0, fiber_1.useFrame)((state, delta) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            // Пульсація залежно від статусу
            let pulse = Math.sin(time * 2) * 0.1 + 1;
            if (agent.status === 'overloaded') {
                pulse = Math.sin(time * 5) * 0.3 + 1.2;
            }
            else if (agent.status === 'error') {
                pulse = Math.sin(time * 8) * 0.4 + 1.3;
            }
            meshRef.current.scale.setScalar(pulse * (isSelected ? 1.5 : 1));
            // Орбітальне обертання навколо центру
            const radius = 5 + agent.metrics.cpuUsage * 2; // Відстань залежить від навантаження
            const speed = agent.status === 'active' ? 0.5 : 0.1;
            const angle = time * speed + agent.id.length; // Унікальний кут для кожного агента
            meshRef.current.position.x = hiveCenter[0] + Math.cos(angle) * radius;
            meshRef.current.position.z = hiveCenter[2] + Math.sin(angle) * radius;
            meshRef.current.position.y = hiveCenter[1] + Math.sin(time + agent.id.length) * 2;
        }
    });
    // Кольори залежно від типу та статусу
    const getAgentColor = () => {
        if (agent.status === 'error')
            return '#ff0066';
        if (agent.status === 'overloaded')
            return '#ff6600';
        if (agent.status === 'blocked')
            return '#666666';
        switch (agent.type) {
            case 'etl': return '#00ff66';
            case 'osint': return '#0099ff';
            case 'graph': return '#9900ff';
            case 'forecast': return '#ffaa00';
            case 'security': return '#ff0099';
            case 'analytics': return '#00ffaa';
            default: return '#ffffff';
        }
    };
    const getStatusIcon = () => {
        switch (agent.status) {
            case 'active': return '⚡';
            case 'idle': return '💤';
            case 'overloaded': return '🔥';
            case 'error': return '❌';
            case 'blocked': return '🚫';
            default: return '❓';
        }
    };
    return (<group position={agent.position}>
      <mesh ref={meshRef} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.5, 16, 16]}/>
        <meshStandardMaterial color={getAgentColor()} transparent opacity={hovered ? 0.9 : 0.7} emissive={getAgentColor()} emissiveIntensity={hovered ? 0.4 : agent.status === 'active' ? 0.2 : 0.1}/>
      </mesh>

      {/* Ефекти для різних станів */}
      {agent.status === 'active' && (<drei_1.Sparkles count={15} scale={[1.5, 1.5, 1.5]} size={0.5} speed={0.4} color={getAgentColor()}/>)}

      {agent.status === 'overloaded' && (<drei_1.Trail width={2} length={8} color={new THREE.Color('#ff6600')} attenuation={(t) => t * t}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]}/>
            <meshBasicMaterial color="#ff6600"/>
          </mesh>
        </drei_1.Trail>)}

      {/* Інформація про агента */}
      <drei_1.Html position={[0, 1, 0]} center>
        <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{
            background: 'rgba(0, 0, 0, 0.9)',
            color: getAgentColor(),
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            border: `1px solid ${getAgentColor()}`,
            textAlign: 'center',
            minWidth: '100px',
            boxShadow: `0 0 10px ${getAgentColor()}50`
        }}>
          <div style={{ fontSize: '14px', marginBottom: '2px' }}>
            {getStatusIcon()} {agent.name}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>
            {agent.metrics.rps} RPS | {agent.metrics.latency}ms
          </div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>
            CPU: {agent.metrics.cpuUsage}% | Err: {agent.metrics.errors}
          </div>
          {agent.selfHealing.enabled && (<div style={{ fontSize: '8px', color: '#00ff66' }}>
              🩹 Self-Healing
            </div>)}
        </framer_motion_1.motion.div>
      </drei_1.Html>
    </group>);
};
// Головний компонент MAS Supervisor
const MASupervisor = ({ agents, onAgentAction, onPolicyUpdate, enableVoiceControl = true }) => {
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const [showConfigDialog, setShowConfigDialog] = (0, react_1.useState)(false);
    const [showSelfHealingLogs, setShowSelfHealingLogs] = (0, react_1.useState)(false);
    const [autoHealEnabled, setAutoHealEnabled] = (0, react_1.useState)(true);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const hiveCenter = [0, 0, 0];
    // Обробка кліку по агенту
    const handleAgentClick = (0, react_1.useCallback)((agent) => {
        setSelectedAgent(agent);
    }, []);
    // Дії з агентами
    const handleAgentAction = (0, react_1.useCallback)((action) => {
        if (!selectedAgent)
            return;
        onAgentAction === null || onAgentAction === void 0 ? void 0 : onAgentAction(selectedAgent.id, action);
        setSnackbar({
            open: true,
            message: `Агент ${selectedAgent.name}: ${action}`,
            severity: action === 'restart' || action === 'unblock' ? 'success' : 'warning'
        });
        if (action === 'configure') {
            setShowConfigDialog(true);
        }
    }, [selectedAgent, onAgentAction]);
    // Жести
    const bind = (0, react_2.useGesture)({
        onDoubleClick: () => {
            setSelectedAgent(null);
        }
    });
    // Гарячі клавіші
    (0, react_hotkeys_hook_1.useHotkeys)('escape', () => setSelectedAgent(null));
    (0, react_hotkeys_hook_1.useHotkeys)('r', () => selectedAgent && handleAgentAction('restart'));
    (0, react_hotkeys_hook_1.useHotkeys)('b', () => selectedAgent && handleAgentAction('block'));
    (0, react_hotkeys_hook_1.useHotkeys)('c', () => selectedAgent && handleAgentAction('configure'));
    // Статистика вулика
    const hiveStats = {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        errorAgents: agents.filter(a => a.status === 'error').length,
        overloadedAgents: agents.filter(a => a.status === 'overloaded').length,
        averageRps: Math.round(agents.reduce((sum, a) => sum + a.metrics.rps, 0) / agents.length),
        totalErrors: agents.reduce((sum, a) => sum + a.metrics.errors, 0)
    };
    return (<material_1.Box sx={{ display: 'flex', height: '100vh', background: '#0a0a0f' }}>
      {/* Бічна панель з контролами */}
      <material_1.Paper elevation={3} sx={{
            width: 350,
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            p: 2,
            overflowY: 'auto'
        }}>
        {/* Статистика вулика */}
        <material_1.Card sx={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', mb: 2 }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" sx={{ color: '#00ff66', mb: 2 }}>
              🐝 Стан Вулика
            </material_1.Typography>
            <material_1.Grid container spacing={2}>
              <material_1.Grid item xs={6}>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Всього агентів: <span style={{ color: '#00ff66' }}>{hiveStats.totalAgents}</span>
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Активних: <span style={{ color: '#00ff66' }}>{hiveStats.activeAgents}</span>
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Помилок: <span style={{ color: '#ff6600' }}>{hiveStats.errorAgents}</span>
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Перевантажених: <span style={{ color: '#ff6600' }}>{hiveStats.overloadedAgents}</span>
                </material_1.Typography>
              </material_1.Grid>
              <material_1.Grid item xs={12}>
                <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                  Середній RPS: <span style={{ color: '#00ff66' }}>{hiveStats.averageRps}</span>
                </material_1.Typography>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.CardContent>
        </material_1.Card>

        {/* Глобальні контроли */}
        <material_1.Card sx={{ background: 'rgba(0, 0, 0, 0.7)', border: '1px solid #333', mb: 2 }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" sx={{ color: '#00ff66', mb: 2 }}>
              Глобальні Контроли
            </material_1.Typography>

            <material_1.FormControlLabel control={<material_1.Switch checked={autoHealEnabled} onChange={(e) => setAutoHealEnabled(e.target.checked)} sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00ff66'
                }
            }}/>} label="Auto-Healing" sx={{ color: '#ccc', display: 'block', mb: 1 }}/>

            <material_1.Button startIcon={<HealthAndSafety_1.default />} onClick={() => setShowSelfHealingLogs(true)} sx={{
            color: '#00ff66',
            border: '1px solid #00ff66',
            mb: 1,
            width: '100%'
        }}>
              Журнал Самовиправлень
            </material_1.Button>
          </material_1.CardContent>
        </material_1.Card>

        {/* Інформація про вибраний агент */}
        <framer_motion_1.AnimatePresence>
          {selectedAgent && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <material_1.Card sx={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', mb: 2 }}>
                <material_1.CardContent>
                  <material_1.Typography variant="h6" sx={{ color: '#00ff66', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedAgent.status === 'active' && <CheckCircle_1.default />}
                    {selectedAgent.status === 'error' && <Error_1.default />}
                    {selectedAgent.status === 'overloaded' && <Warning_1.default />}
                    {selectedAgent.name}
                  </material_1.Typography>

                  <material_1.Chip label={selectedAgent.type} size="small" sx={{ background: '#00ff66', color: '#000', mb: 2 }}/>

                  <material_1.Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                    Статус: <span style={{ color: selectedAgent.status === 'active' ? '#00ff66' : '#ff6600' }}>
                      {selectedAgent.status}
                    </span>
                  </material_1.Typography>

                  {/* Метрики */}
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>RPS: {selectedAgent.metrics.rps}</material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={(selectedAgent.metrics.rps / selectedAgent.policies.maxRps) * 100} sx={{
                mb: 1,
                '& .MuiLinearProgress-bar': { backgroundColor: '#00ff66' }
            }}/>

                    <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>CPU: {selectedAgent.metrics.cpuUsage}%</material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={selectedAgent.metrics.cpuUsage} sx={{
                mb: 1,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: selectedAgent.metrics.cpuUsage > 80 ? '#ff6600' : '#00ff66'
                }
            }}/>

                    <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>Пам'ять: {selectedAgent.metrics.memoryUsage}%</material_1.Typography>
                    <material_1.LinearProgress variant="determinate" value={selectedAgent.metrics.memoryUsage} sx={{
                '& .MuiLinearProgress-bar': {
                    backgroundColor: selectedAgent.metrics.memoryUsage > 80 ? '#ff6600' : '#00ff66'
                }
            }}/>
                  </material_1.Box>

                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                    Затримка: {selectedAgent.metrics.latency}ms
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                    Помилки: {selectedAgent.metrics.errors}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: '#ccc' }}>
                    Бюджет: ${selectedAgent.metrics.budget}
                  </material_1.Typography>
                </material_1.CardContent>

                <material_1.CardActions>
                  <material_1.Button size="small" startIcon={<RestartAlt_1.default />} onClick={() => handleAgentAction('restart')} sx={{ color: '#00ff66' }}>
                    Перезапуск
                  </material_1.Button>
                  <material_1.Button size="small" startIcon={selectedAgent.status === 'blocked' ? <PlayArrow_1.default /> : <Block_1.default />} onClick={() => handleAgentAction(selectedAgent.status === 'blocked' ? 'unblock' : 'block')} sx={{ color: selectedAgent.status === 'blocked' ? '#00ff66' : '#ff6600' }}>
                    {selectedAgent.status === 'blocked' ? 'Розблокувати' : 'Блокувати'}
                  </material_1.Button>
                  <material_1.Button size="small" startIcon={<Settings_1.default />} onClick={() => handleAgentAction('configure')} sx={{ color: '#0099ff' }}>
                    Налаштування
                  </material_1.Button>
                </material_1.CardActions>
              </material_1.Card>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>

        {/* Список агентів */}
        <material_1.Typography variant="h6" sx={{ color: '#00ff66', mb: 1 }}>
          Агенти за типами
        </material_1.Typography>
        <material_1.List dense>
          {['etl', 'osint', 'graph', 'forecast', 'security', 'analytics'].map(type => {
            const typeAgents = agents.filter(a => a.type === type);
            const activeCount = typeAgents.filter(a => a.status === 'active').length;
            return (<material_1.ListItem key={type} sx={{ border: '1px solid #333', borderRadius: 1, mb: 1 }}>
                <material_1.ListItemText primary={`${type.toUpperCase()} (${typeAgents.length})`} secondary={`Активних: ${activeCount}`} primaryTypographyProps={{ color: '#00ff66', fontSize: '14px' }} secondaryTypographyProps={{ color: '#ccc', fontSize: '12px' }}/>
                <material_1.ListItemSecondaryAction>
                  <material_1.Chip label={activeCount} size="small" color={activeCount === typeAgents.length ? 'success' : 'warning'}/>
                </material_1.ListItemSecondaryAction>
              </material_1.ListItem>);
        })}
        </material_1.List>
      </material_1.Paper>

      {/* 3D сцена вулика */}
      <material_1.Box {...bind()} sx={{ flex: 1, position: 'relative' }}>
        <fiber_1.Canvas camera={{ position: [0, 5, 15], fov: 75 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={0.3}/>
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ff66"/>
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0099ff"/>
          <spotLight position={[0, 20, 0]} intensity={1} color="#ffffff" angle={Math.PI / 4}/>

          {/* Центр вулика */}
          <mesh position={hiveCenter}>
            <sphereGeometry args={[0.3, 16, 16]}/>
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.3} transparent opacity={0.8}/>
          </mesh>

          {/* Агенти */}
          {agents.map(agent => (<AgentNode key={agent.id} agent={agent} onClick={() => handleAgentClick(agent)} isSelected={(selectedAgent === null || selectedAgent === void 0 ? void 0 : selectedAgent.id) === agent.id} hiveCenter={hiveCenter}/>))}

          <drei_1.OrbitControls autoRotate={!selectedAgent} autoRotateSpeed={0.3} enableZoom={true} enablePan={true} maxDistance={25} minDistance={8}/>
        </fiber_1.Canvas>

        {/* Підказки */}
        <material_1.Box sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
          <material_1.Typography variant="caption" sx={{
            color: '#666',
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: 1
        }}>
            ESC: скасувати | R: перезапуск | B: блокувати | C: налаштування
          </material_1.Typography>

          <material_1.Typography variant="caption" sx={{
            color: '#00ff66',
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: 1
        }}>
            🐝 Вулик здоровий: {hiveStats.activeAgents}/{hiveStats.totalAgents}
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>

      {/* Діалог конфігурації */}
      <material_1.Dialog open={showConfigDialog} onClose={() => setShowConfigDialog(false)} maxWidth="sm" fullWidth>
        <material_1.DialogTitle sx={{ color: '#00ff66' }}>
          Налаштування агента: {selectedAgent === null || selectedAgent === void 0 ? void 0 : selectedAgent.name}
        </material_1.DialogTitle>
        <material_1.DialogContent>
          {selectedAgent && (<material_1.Box sx={{ pt: 1 }}>
              <material_1.TextField fullWidth label="Максимальний RPS" type="number" defaultValue={selectedAgent.policies.maxRps} margin="normal"/>
              <material_1.TextField fullWidth label="Максимальні помилки" type="number" defaultValue={selectedAgent.policies.maxErrors} margin="normal"/>
              <material_1.TextField fullWidth label="Максимальна затримка (мс)" type="number" defaultValue={selectedAgent.policies.maxLatency} margin="normal"/>
              <material_1.FormControlLabel control={<material_1.Switch defaultChecked={selectedAgent.policies.autoRestart}/>} label="Автоматичний перезапуск" sx={{ mt: 2 }}/>
            </material_1.Box>)}
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setShowConfigDialog(false)}>Скасувати</material_1.Button>
          <material_1.Button onClick={() => setShowConfigDialog(false)} sx={{ color: '#00ff66' }}>
            Зберегти
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>

      {/* Snackbar для повідомлень */}
      <material_1.Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => (Object.assign(Object.assign({}, prev), { open: false })))}>
        <material_1.Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => (Object.assign(Object.assign({}, prev), { open: false })))}>
          {snackbar.message}
        </material_1.Alert>
      </material_1.Snackbar>
    </material_1.Box>);
};
exports.default = MASupervisor;
