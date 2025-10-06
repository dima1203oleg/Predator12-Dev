// @ts-nocheck
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Sphere,
  Text,
  Html,
  Trail,
  Sparkles,
  Line,
  OrbitControls
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { useHotkeys } from 'react-hotkeys-hook';
import * as THREE from 'three';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BlockIcon from '@mui/icons-material/Block';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Типи агентів
interface Agent {
  id: string;
  name: string;
  type: 'etl' | 'osint' | 'graph' | 'forecast' | 'security' | 'analytics';
  status: 'active' | 'idle' | 'overloaded' | 'error' | 'blocked';
  position: [number, number, number];
  metrics: {
    rps: number;
    errors: number;
    latency: number;
    budget: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  selfHealing: {
    enabled: boolean;
    lastAction: string;
    actionCount: number;
  };
  policies: {
    maxRps: number;
    maxErrors: number;
    maxLatency: number;
    autoRestart: boolean;
  };
}

interface MASupervisorProps {
  agents: Agent[];
  onAgentAction?: (agentId: string, action: 'restart' | 'block' | 'unblock' | 'configure') => void;
  onPolicyUpdate?: (agentId: string, policies: Agent['policies']) => void;
  enableVoiceControl?: boolean;
}

// 3D агент у вулику
const AgentNode: React.FC<{
  agent: Agent;
  onClick: () => void;
  isSelected: boolean;
  hiveCenter: [number, number, number];
}> = ({ agent, onClick, isSelected, hiveCenter }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Анімація "дихання" вулика та міграції при навантаженні
  useFrame((state, delta) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;

      // Пульсація залежно від статусу
      let pulse = Math.sin(time * 2) * 0.1 + 1;
      if (agent.status === 'overloaded') {
        pulse = Math.sin(time * 5) * 0.3 + 1.2;
      } else if (agent.status === 'error') {
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
    if (agent.status === 'error') return '#ff0066';
    if (agent.status === 'overloaded') return '#ff6600';
    if (agent.status === 'blocked') return '#666666';

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

  return (
    <group position={agent.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={getAgentColor()}
          transparent
          opacity={hovered ? 0.9 : 0.7}
          emissive={getAgentColor()}
          emissiveIntensity={hovered ? 0.4 : agent.status === 'active' ? 0.2 : 0.1}
        />
      </mesh>

      {/* Ефекти для різних станів */}
      {agent.status === 'active' && (
        <Sparkles
          count={15}
          scale={[1.5, 1.5, 1.5]}
          size={0.5}
          speed={0.4}
          color={getAgentColor()}
        />
      )}

      {agent.status === 'overloaded' && (
        <Trail
          width={2}
          length={8}
          color={new THREE.Color('#ff6600')}
          attenuation={(t) => t * t}
        >
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff6600" />
          </mesh>
        </Trail>
      )}

      {/* Інформація про агента */}
      <Html position={[0, 1, 0]} center>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
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
          }}
        >
          <div style={{ fontSize: '14px', marginBottom: '2px' }}>
            {getStatusIcon()} {agent.name}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>
            {agent.metrics.rps} RPS | {agent.metrics.latency}ms
          </div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>
            CPU: {agent.metrics.cpuUsage}% | Err: {agent.metrics.errors}
          </div>
          {agent.selfHealing.enabled && (
            <div style={{ fontSize: '8px', color: '#00ff66' }}>
              🩹 Self-Healing
            </div>
          )}
        </motion.div>
      </Html>
    </group>
  );
};

// Головний компонент MAS Supervisor
const MASupervisor: React.FC<MASupervisorProps> = ({
  agents,
  onAgentAction,
  onPolicyUpdate,
  enableVoiceControl = true
}) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showSelfHealingLogs, setShowSelfHealingLogs] = useState(false);
  const [autoHealEnabled, setAutoHealEnabled] = useState(true);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'warning'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const hiveCenter: [number, number, number] = [0, 0, 0];

  // Обробка кліку по агенту
  const handleAgentClick = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
  }, []);

  // Дії з агентами
  const handleAgentAction = useCallback((action: 'restart' | 'block' | 'unblock' | 'configure') => {
    if (!selectedAgent) return;

    onAgentAction?.(selectedAgent.id, action);

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
  const bind = useGesture({
    onDoubleClick: () => {
      setSelectedAgent(null);
    }
  });

  // Гарячі клавіші
  useHotkeys('escape', () => setSelectedAgent(null));
  useHotkeys('r', () => selectedAgent && handleAgentAction('restart'));
  useHotkeys('b', () => selectedAgent && handleAgentAction('block'));
  useHotkeys('c', () => selectedAgent && handleAgentAction('configure'));

  // Статистика вулика
  const hiveStats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    errorAgents: agents.filter(a => a.status === 'error').length,
    overloadedAgents: agents.filter(a => a.status === 'overloaded').length,
    averageRps: Math.round(agents.reduce((sum, a) => sum + a.metrics.rps, 0) / agents.length),
    totalErrors: agents.reduce((sum, a) => sum + a.metrics.errors, 0)
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', background: '#0a0a0f' }}>
      {/* Бічна панель з контролами */}
      <Paper
        elevation={3}
        sx={{
          width: 350,
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #333',
          p: 2,
          overflowY: 'auto'
        }}
      >
        {/* Статистика вулика */}
        <Card sx={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#00ff66', mb: 2 }}>
              🐝 Стан Вулика
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Всього агентів: <span style={{ color: '#00ff66' }}>{hiveStats.totalAgents}</span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Активних: <span style={{ color: '#00ff66' }}>{hiveStats.activeAgents}</span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Помилок: <span style={{ color: '#ff6600' }}>{hiveStats.errorAgents}</span>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Перевантажених: <span style={{ color: '#ff6600' }}>{hiveStats.overloadedAgents}</span>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Середній RPS: <span style={{ color: '#00ff66' }}>{hiveStats.averageRps}</span>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Глобальні контроли */}
        <Card sx={{ background: 'rgba(0, 0, 0, 0.7)', border: '1px solid #333', mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#00ff66', mb: 2 }}>
              Глобальні Контроли
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={autoHealEnabled}
                  onChange={(e) => setAutoHealEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff66'
                    }
                  }}
                />
              }
              label="Auto-Healing"
              sx={{ color: '#ccc', display: 'block', mb: 1 }}
            />

            <Button
              startIcon={<HealthAndSafetyIcon />}
              onClick={() => setShowSelfHealingLogs(true)}
              sx={{
                color: '#00ff66',
                border: '1px solid #00ff66',
                mb: 1,
                width: '100%'
              }}
            >
              Журнал Самовиправлень
            </Button>
          </CardContent>
        </Card>

        {/* Інформація про вибраний агент */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card sx={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#00ff66', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedAgent.status === 'active' && <CheckCircleIcon />}
                    {selectedAgent.status === 'error' && <ErrorIcon />}
                    {selectedAgent.status === 'overloaded' && <WarningIcon />}
                    {selectedAgent.name}
                  </Typography>

                  <Chip
                    label={selectedAgent.type}
                    size="small"
                    sx={{ background: '#00ff66', color: '#000', mb: 2 }}
                  />

                  <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                    Статус: <span style={{ color: selectedAgent.status === 'active' ? '#00ff66' : '#ff6600' }}>
                      {selectedAgent.status}
                    </span>
                  </Typography>

                  {/* Метрики */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>RPS: {selectedAgent.metrics.rps}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(selectedAgent.metrics.rps / selectedAgent.policies.maxRps) * 100}
                      sx={{
                        mb: 1,
                        '& .MuiLinearProgress-bar': { backgroundColor: '#00ff66' }
                      }}
                    />

                    <Typography variant="body2" sx={{ color: '#ccc' }}>CPU: {selectedAgent.metrics.cpuUsage}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedAgent.metrics.cpuUsage}
                      sx={{
                        mb: 1,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: selectedAgent.metrics.cpuUsage > 80 ? '#ff6600' : '#00ff66'
                        }
                      }}
                    />

                    <Typography variant="body2" sx={{ color: '#ccc' }}>Пам'ять: {selectedAgent.metrics.memoryUsage}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedAgent.metrics.memoryUsage}
                      sx={{
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: selectedAgent.metrics.memoryUsage > 80 ? '#ff6600' : '#00ff66'
                        }
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    Затримка: {selectedAgent.metrics.latency}ms
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    Помилки: {selectedAgent.metrics.errors}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    Бюджет: ${selectedAgent.metrics.budget}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<RestartAltIcon />}
                    onClick={() => handleAgentAction('restart')}
                    sx={{ color: '#00ff66' }}
                  >
                    Перезапуск
                  </Button>
                  <Button
                    size="small"
                    startIcon={selectedAgent.status === 'blocked' ? <PlayArrowIcon /> : <BlockIcon />}
                    onClick={() => handleAgentAction(selectedAgent.status === 'blocked' ? 'unblock' : 'block')}
                    sx={{ color: selectedAgent.status === 'blocked' ? '#00ff66' : '#ff6600' }}
                  >
                    {selectedAgent.status === 'blocked' ? 'Розблокувати' : 'Блокувати'}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => handleAgentAction('configure')}
                    sx={{ color: '#0099ff' }}
                  >
                    Налаштування
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Список агентів */}
        <Typography variant="h6" sx={{ color: '#00ff66', mb: 1 }}>
          Агенти за типами
        </Typography>
        <List dense>
          {['etl', 'osint', 'graph', 'forecast', 'security', 'analytics'].map(type => {
            const typeAgents = agents.filter(a => a.type === type);
            const activeCount = typeAgents.filter(a => a.status === 'active').length;

            return (
              <ListItem key={type} sx={{ border: '1px solid #333', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={`${type.toUpperCase()} (${typeAgents.length})`}
                  secondary={`Активних: ${activeCount}`}
                  primaryTypographyProps={{ color: '#00ff66', fontSize: '14px' }}
                  secondaryTypographyProps={{ color: '#ccc', fontSize: '12px' }}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={activeCount}
                    size="small"
                    color={activeCount === typeAgents.length ? 'success' : 'warning'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* 3D сцена вулика */}
      <Box {...bind()} sx={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 5, 15], fov: 75 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ff66" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0099ff" />
          <spotLight position={[0, 20, 0]} intensity={1} color="#ffffff" angle={Math.PI / 4} />

          {/* Центр вулика */}
          <mesh position={hiveCenter}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color="#ffaa00"
              emissive="#ffaa00"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Агенти */}
          {agents.map(agent => (
            <AgentNode
              key={agent.id}
              agent={agent}
              onClick={() => handleAgentClick(agent)}
              isSelected={selectedAgent?.id === agent.id}
              hiveCenter={hiveCenter}
            />
          ))}

          <OrbitControls
            autoRotate={!selectedAgent}
            autoRotateSpeed={0.3}
            enableZoom={true}
            enablePan={true}
            maxDistance={25}
            minDistance={8}
          />
        </Canvas>

        {/* Підказки */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontFamily: 'monospace',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '4px 8px',
              borderRadius: 1
            }}
          >
            ESC: скасувати | R: перезапуск | B: блокувати | C: налаштування
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#00ff66',
              fontFamily: 'monospace',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '4px 8px',
              borderRadius: 1
            }}
          >
            🐝 Вулик здоровий: {hiveStats.activeAgents}/{hiveStats.totalAgents}
          </Typography>
        </Box>
      </Box>

      {/* Діалог конфігурації */}
      <Dialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#00ff66' }}>
          Налаштування агента: {selectedAgent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Максимальний RPS"
                type="number"
                defaultValue={selectedAgent.policies.maxRps}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Максимальні помилки"
                type="number"
                defaultValue={selectedAgent.policies.maxErrors}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Максимальна затримка (мс)"
                type="number"
                defaultValue={selectedAgent.policies.maxLatency}
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch defaultChecked={selectedAgent.policies.autoRestart} />
                }
                label="Автоматичний перезапуск"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfigDialog(false)}>Скасувати</Button>
          <Button onClick={() => setShowConfigDialog(false)} sx={{ color: '#00ff66' }}>
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для повідомлень */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MASupervisor;
