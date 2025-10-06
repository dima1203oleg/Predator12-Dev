// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Psychology as AIIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RestartIcon,
  Visibility as ViewIcon,
  TrendingUp as MetricsIcon,
  Memory as MemoryIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface Agent {
  id: string;
  name: string;
  type: 'supervisor' | 'worker' | 'monitor' | 'analyzer';
  status: 'active' | 'idle' | 'error' | 'stopped';
  performance: number;
  memory: number;
  tasks: number;
  uptime: number;
  position: { x: number; y: number; z: number };
}

interface AISupervisionModuleProps {
  agents?: Agent[];
}

export const AISupervisionModule: React.FC<AISupervisionModuleProps> = ({
  agents = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // TODO: Отримувати agents з реального API
  // const agents = await aiSupervisionAPI.getAgents();
  const allAgents = agents.length > 0 ? agents : [];

  useEffect(() => {
    if (!mountRef.current || !show3D) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(new THREE.Color(nexusColors.emerald), 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create central hub
    const hubGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const hubMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(nexusColors.emerald),
      transparent: true,
      opacity: 0.8,
      emissive: new THREE.Color(nexusColors.emerald),
      emissiveIntensity: 0.2
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    scene.add(hub);

    // Create agent nodes
    const agentMeshes: { [key: string]: THREE.Mesh } = {};
    const connections: THREE.Line[] = [];

    allAgents.forEach((agent) => {
      // Agent node
      const nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      let nodeColor: string;
      
      switch (agent.status) {
        case 'active':
          nodeColor = nexusColors.emerald;
          break;
        case 'idle':
          nodeColor = nexusColors.sapphire;
          break;
        case 'error':
          nodeColor = nexusColors.crimson;
          break;
        default:
          nodeColor = nexusColors.shadow;
      }

      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(nodeColor),
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color(nodeColor),
        emissiveIntensity: 0.1
      });

      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(agent.position.x, agent.position.y, agent.position.z);
      agentMeshes[agent.id] = node;
      scene.add(node);

      // Connection to hub
      const points = [hub.position, node.position];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(nodeColor),
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      connections.push(line);
      scene.add(line);

      // Agent type indicator (ring around node)
      let ringColor: string;
      switch (agent.type) {
        case 'supervisor':
          ringColor = nexusColors.amethyst;
          break;
        case 'worker':
          ringColor = nexusColors.sapphire;
          break;
        case 'monitor':
          ringColor = nexusColors.warning;
          break;
        case 'analyzer':
          ringColor = nexusColors.info;
          break;
        default:
          ringColor = nexusColors.nebula;
      }

      const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ringColor),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(node.position);
      ring.lookAt(camera.position);
      scene.add(ring);
    });

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Rotate hub
      hub.rotation.x += 0.01;
      hub.rotation.y += 0.02;
      
      // Pulse hub based on activity
      const scale = 1 + Math.sin(time * 2) * 0.1;
      hub.scale.setScalar(scale);
      
      // Animate agent nodes
      Object.values(agentMeshes).forEach((mesh, index) => {
        mesh.rotation.x += 0.02;
        mesh.rotation.y += 0.01;
        
        // Floating animation
        const offset = index * 0.5;
        mesh.position.y += Math.sin(time + offset) * 0.01;
      });
      
      // Auto-rotate camera
      if (autoRotate) {
        camera.position.x = Math.cos(time * 0.2) * 12;
        camera.position.z = Math.sin(time * 0.2) * 12;
        camera.lookAt(0, 0, 0);
      }
      
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [show3D, autoRotate, selectedAgent]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return nexusColors.emerald;
      case 'idle': return nexusColors.sapphire;
      case 'error': return nexusColors.crimson;
      default: return nexusColors.shadow;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'supervisor': return nexusColors.amethyst;
      case 'worker': return nexusColors.sapphire;
      case 'monitor': return nexusColors.warning;
      case 'analyzer': return nexusColors.info;
      default: return nexusColors.nebula;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3, 
            color: nexusColors.sapphire,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusColors.sapphire}`
          }}
        >
          <AIIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Орбітальний Вулик ШІ
        </Typography>

        <Grid container spacing={3}>
          {/* 3D Agent Visualization */}
          <Grid item xs={12} lg={8}>
            <Card className="holographic">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                    Рій Агентів MAS
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoRotate}
                          onChange={(e) => setAutoRotate(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: nexusColors.emerald,
                            },
                          }}
                        />
                      }
                      label="Авто-обертання"
                      sx={{ color: nexusColors.nebula }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={show3D}
                          onChange={(e) => setShow3D(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: nexusColors.emerald,
                            },
                          }}
                        />
                      }
                      label="3D Режим"
                      sx={{ color: nexusColors.nebula }}
                    />
                  </Box>
                </Box>
                
                {show3D ? (
                  <Box
                    ref={mountRef}
                    sx={{
                      width: '100%',
                      height: 600,
                      border: `1px solid ${nexusColors.quantum}`,
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 600,
                      border: `1px solid ${nexusColors.quantum}`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(45deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                    }}
                  >
                    <Typography variant="h6" sx={{ color: nexusColors.nebula }}>
                      2D Network View (Coming Soon)
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Agent Statistics */}
          <Grid item xs={12} lg={4}>
            <Card className="holographic" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.amethyst }}>
                  Статистика Системи
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                    Активні агенти: {allAgents.filter(a => a.status === 'active').length} / {allAgents.length}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(allAgents.filter(a => a.status === 'active').length / allAgents.length) * 100}
                    sx={{
                      backgroundColor: nexusColors.darkMatter,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: nexusColors.emerald,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                    Середня продуктивність: {(allAgents.reduce((acc, a) => acc + a.performance, 0) / allAgents.length).toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={allAgents.reduce((acc, a) => acc + a.performance, 0) / allAgents.length}
                    sx={{
                      backgroundColor: nexusColors.darkMatter,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: nexusColors.sapphire,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                    Використання пам'яті: {(allAgents.reduce((acc, a) => acc + a.memory, 0) / allAgents.length).toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={allAgents.reduce((acc, a) => acc + a.memory, 0) / allAgents.length}
                    sx={{
                      backgroundColor: nexusColors.darkMatter,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: nexusColors.warning,
                      },
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                  Загальна кількість завдань: {allAgents.reduce((acc, a) => acc + a.tasks, 0)}
                </Typography>
              </CardContent>
            </Card>

            {/* Agent List */}
            <Card className="holographic">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.emerald }}>
                  Список Агентів
                </Typography>
                
                <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Агент
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Статус
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Дії
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allAgents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Box>
                              <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                                {agent.name}
                              </Typography>
                              <Chip
                                label={agent.type}
                                size="small"
                                sx={{
                                  backgroundColor: getTypeColor(agent.type),
                                  color: nexusColors.frost,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Chip
                              label={agent.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(agent.status),
                                color: nexusColors.frost
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Переглянути деталі">
                                <IconButton size="small" sx={{ color: nexusColors.sapphire }}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Перезапустити">
                                <IconButton size="small" sx={{ color: nexusColors.warning }}>
                                  <RestartIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};
