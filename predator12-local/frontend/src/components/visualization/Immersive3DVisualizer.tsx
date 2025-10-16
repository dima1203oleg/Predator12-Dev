// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  ButtonGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ThreeDRotation,
  ViewInAr,
  CameraAlt,
  Videocam,
  FullscreenExit,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Palette,
  Layers,
  GridOn,
  Visibility,
  VisibilityOff,
  Download,
  Share,
  Mic,
  Psychology,
  Close,
  Memory,
  Storage,
  Cloud,
  TrendingUp,
  Refresh,
  AutoAwesome,
  Psychology,
  Memory,
  Storage,
  Cloud,
  TrendingUp
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface DataNode {
  id: string;
  name: string;
  type: 'server' | 'database' | 'ai-agent' | 'user' | 'process' | 'connection';
  position: { x: number; y: number; z: number };
  connections: string[];
  status: 'active' | 'warning' | 'error' | 'idle';
  metrics: {
    cpu?: number;
    memory?: number;
    network?: number;
    performance?: number;
  };
  color: string;
  size: number;
  data?: any;
}

interface Scene3DConfig {
  gridVisible: boolean;
  axesVisible: boolean;
  animationSpeed: number;
  cameraPosition: { x: number; y: number; z: number };
  lightIntensity: number;
  fogEnabled: boolean;
  particlesEnabled: boolean;
  autoRotate: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

const generateSampleData = (): DataNode[] => {
  const nodeTypes = ['server', 'database', 'ai-agent', 'user', 'process'] as const;
  const statuses = ['active', 'warning', 'error', 'idle'] as const;
  const colors = ['#667eea', '#764ba2', '#ff6b35', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `node-${i}`,
    name: `Node ${i + 1}`,
    type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
    position: {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20
    },
    connections: Array.from({ length: Math.floor(Math.random() * 5) }, () =>
      `node-${Math.floor(Math.random() * 50)}`
    ),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    metrics: {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100,
      performance: Math.random() * 100
    },
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 2 + 0.5
  }));
};

interface Immersive3DVisualizerProps {
  data?: DataNode[];
  onNodeSelect?: (node: DataNode) => void;
  onSceneChange?: (config: Scene3DConfig) => void;
  enableVR?: boolean;
  enableAR?: boolean;
}

export const Immersive3DVisualizer: React.FC<Immersive3DVisualizerProps> = ({
  data = generateSampleData(),
  onNodeSelect,
  onSceneChange,
  enableVR = true,
  enableAR = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedNode, setSelectedNode] = useState<DataNode | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [cameraMode, setCameraMode] = useState<'free' | 'orbit' | 'follow'>('orbit');
  const [renderMode, setRenderMode] = useState<'wireframe' | 'solid' | 'points'>('solid');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [sceneConfig, setSceneConfig] = useState<Scene3DConfig>({
    gridVisible: true,
    axesVisible: true,
    animationSpeed: 1,
    cameraPosition: { x: 0, y: 0, z: 30 },
    lightIntensity: 1,
    fogEnabled: true,
    particlesEnabled: true,
    autoRotate: true,
    quality: 'high'
  });

  // 3D Scene state
  const [camera, setCamera] = useState({
    position: { x: 0, y: 0, z: 30 },
    rotation: { x: 0, y: 0, z: 0 },
    fov: 75
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);

  // AI Асистент для 3D навігації
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [voiceControlActive, setVoiceControlActive] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Інтерактивні режими
  const [interactionMode, setInteractionMode] = useState<'explore' | 'analyze' | 'present' | 'collaborate'>('explore');
  const [multiUserMode, setMultiUserMode] = useState(false);
  const [realTimeSync, setRealTimeSync] = useState(false);

  // Покращений рендеринг
  const [rayTracingEnabled, setRayTracingEnabled] = useState(false);
  const [particleEffects, setParticleEffects] = useState(true);
  const [dynamicLighting, setDynamicLighting] = useState(true);
  const [shadows, setShadows] = useState(true);

  // Покращений рендеринг
  const [rayTracingEnabled, setRayTracingEnabled] = useState(false);
  const [particleEffects, setParticleEffects] = useState(true);
  const [dynamicLighting, setDynamicLighting] = useState(true);
  const [shadows, setShadows] = useState(true);

  // AI аналітика сцени
  const analyzeScene = () => {
    const suggestions = [
      "🎯 Виявлено кластер з високою активністю в правому секторі",
      "⚡ Рекомендую збільшити масштаб вузла 'AI-Agents' для детального аналізу",
      "🔍 Помічено аномальну активність в мережевому трафіку",
      "📊 Оптимальний кут огляду: 45° для кращого аналізу зв'язків",
      "🌐 Переключіться на тепловий режим для візуалізації навантаження"
    ];

    setAiSuggestions(suggestions.slice(0, 3));
  };

  // Голосові команди для 3D навігації
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('zoom in') || lowerCommand.includes('наблизити')) {
      setSceneConfig(prev => ({
        ...prev,
        cameraPosition: { ...prev.cameraPosition, z: prev.cameraPosition.z * 0.8 }
      }));
    } else if (lowerCommand.includes('zoom out') || lowerCommand.includes('віддалити')) {
      setSceneConfig(prev => ({
        ...prev,
        cameraPosition: { ...prev.cameraPosition, z: prev.cameraPosition.z * 1.2 }
      }));
    } else if (lowerCommand.includes('rotate') || lowerCommand.includes('обертати')) {
      setCameraMode('orbit');
    } else if (lowerCommand.includes('analyze') || lowerCommand.includes('аналіз')) {
      setInteractionMode('analyze');
      analyzeScene();
    }
  };

  // Ініціалізація AI асистента
  useEffect(() => {
    if (aiAssistantActive) {
      analyzeScene();
      const interval = setInterval(analyzeScene, 10000); // Оновлення кожні 10 секунд
      return () => clearInterval(interval);
    }
  }, [aiAssistantActive, data]);

  // Memoized calculations
  const processedNodes = useMemo(() => {
    return data.map(node => ({
      ...node,
      screenPosition: project3DTo2D(node.position, camera, canvasRef.current)
    }));
  }, [data, camera]);

  // 3D to 2D projection
  function project3DTo2D(pos3D: { x: number; y: number; z: number }, cam: any, canvas: HTMLCanvasElement | null) {
    if (!canvas) return { x: 0, y: 0, visible: false };

    const width = canvas.width;
    const height = canvas.height;

    // Simple perspective projection
    const distance = cam.position.z;
    const scale = distance / (distance + pos3D.z);

    return {
      x: (pos3D.x * scale * zoom + width / 2),
      y: (pos3D.y * scale * zoom + height / 2),
      visible: pos3D.z > -distance && scale > 0.1
    };
  }

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid if enabled
      if (sceneConfig.gridVisible) {
        drawGrid(ctx, canvas);
      }

      // Draw connections
      drawConnections(ctx, processedNodes);

      // Draw nodes
      drawNodes(ctx, processedNodes, time);

      // Draw particles if enabled
      if (sceneConfig.particlesEnabled) {
        drawParticles(ctx, canvas, time);
      }

      // Update camera for auto-rotation
      if (sceneConfig.autoRotate) {
        setCamera(prev => ({
          ...prev,
          rotation: {
            ...prev.rotation,
            y: prev.rotation.y + 0.01 * sceneConfig.animationSpeed
          }
        }));
      }

      time += sceneConfig.animationSpeed;
      animationRef.current = requestAnimationFrame(animate);
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, sceneConfig, processedNodes, zoom]);

  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    const steps = 20;

    for (let i = -steps; i <= steps; i++) {
      const pos = i * (gridSize / steps);

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 + pos * zoom, 0);
      ctx.lineTo(canvas.width / 2 + pos * zoom, canvas.height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2 + pos * zoom);
      ctx.lineTo(canvas.width, canvas.height / 2 + pos * zoom);
      ctx.stroke();
    }
  };

  const drawConnections = (ctx: CanvasRenderingContext2D, nodes: any[]) => {
    nodes.forEach(node => {
      if (!node.screenPosition.visible) return;

      node.connections.forEach((connId: string) => {
        const connectedNode = nodes.find(n => n.id === connId);
        if (!connectedNode || !connectedNode.screenPosition.visible) return;

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.screenPosition.x, node.screenPosition.y);
        ctx.lineTo(connectedNode.screenPosition.x, connectedNode.screenPosition.y);
        ctx.stroke();
      });
    });
  };

  const drawNodes = (ctx: CanvasRenderingContext2D, nodes: any[], time: number) => {
    nodes.forEach(node => {
      if (!node.screenPosition.visible) return;

      const { x, y } = node.screenPosition;
      const radius = node.size * 10 * zoom;

      // Node glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, node.color + '80');
      gradient.addColorStop(1, node.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main node
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Status indicator
      const statusColor = {
        active: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        idle: '#9E9E9E'
      }[node.status];

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(x + radius * 0.7, y - radius * 0.7, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing effect for active nodes
      if (node.status === 'active') {
        const pulse = Math.sin(time * 0.05) * 0.5 + 0.5;
        ctx.strokeStyle = node.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node label
      if (radius > 5) {
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(8, radius / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, x, y + radius + 15);
      }
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.01 + i) * canvas.width / 4) + canvas.width / 2;
      const y = (Math.cos(time * 0.015 + i) * canvas.height / 4) + canvas.height / 2;
      const alpha = (Math.sin(time * 0.02 + i) + 1) / 4;

      ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Event handlers
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = processedNodes.find(node => {
      if (!node.screenPosition.visible) return false;
      const distance = Math.sqrt(
        Math.pow(clickX - node.screenPosition.x, 2) +
        Math.pow(clickY - node.screenPosition.y, 2)
      );
      return distance <= node.size * 10 * zoom;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      onNodeSelect?.(clickedNode);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const newMousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    if (isDragging && cameraMode === 'free') {
      const deltaX = (newMousePos.x - mousePosition.x) * 0.01;
      const deltaY = (newMousePos.y - mousePosition.y) * 0.01;

      setCamera(prev => ({
        ...prev,
        rotation: {
          ...prev.rotation,
          x: prev.rotation.x - deltaY,
          y: prev.rotation.y + deltaX
        }
      }));
    }

    setMousePosition(newMousePos);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * zoomDelta)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetCamera = () => {
    setCamera({
      position: { x: 0, y: 0, z: 30 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 75
    });
    setZoom(1);
  };

  const takeScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `nexus-3d-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Storage />;
      case 'database': return <Memory />;
      case 'ai-agent': return <Psychology />;
      case 'user': return <Memory />;
      case 'process': return <TrendingUp />;
      default: return <Cloud />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            🌌 3D Immersive Visualizer
          </Typography>
          <Chip
            icon={<ThreeDRotation />}
            label={`${data.length} Nodes`}
            sx={{
              bgcolor: 'rgba(102, 126, 234, 0.2)',
              color: 'white'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Playback Controls */}
          <ButtonGroup size="small">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={() => setIsPlaying(false)} startIcon={<Stop />}>
              Stop
            </Button>
          </ButtonGroup>

          {/* Camera Controls */}
          <ButtonGroup size="small">
            <Button
              variant={cameraMode === 'orbit' ? 'contained' : 'outlined'}
              onClick={() => setCameraMode('orbit')}
            >
              Orbit
            </Button>
            <Button
              variant={cameraMode === 'free' ? 'contained' : 'outlined'}
              onClick={() => setCameraMode('free')}
            >
              Free
            </Button>
            <Button
              variant={cameraMode === 'follow' ? 'contained' : 'outlined'}
              onClick={() => setCameraMode('follow')}
            >
              Follow
            </Button>
          </ButtonGroup>

          {/* Render Mode */}
          <ButtonGroup size="small">
            <Button
              variant={renderMode === 'solid' ? 'contained' : 'outlined'}
              onClick={() => setRenderMode('solid')}
            >
              Solid
            </Button>
            <Button
              variant={renderMode === 'wireframe' ? 'contained' : 'outlined'}
              onClick={() => setRenderMode('wireframe')}
            >
              Wire
            </Button>
            <Button
              variant={renderMode === 'points' ? 'contained' : 'outlined'}
              onClick={() => setRenderMode('points')}
            >
              Points
            </Button>
          </ButtonGroup>

          {/* Action Buttons */}
          <Tooltip title="Reset Camera">
            <IconButton onClick={resetCamera}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Screenshot">
            <IconButton onClick={takeScreenshot}>
              <CameraAlt />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettings(true)}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>

          {/* VR/AR Buttons */}
          {enableVR && (
            <Tooltip title="Enter VR">
              <IconButton>
                <ViewInAr />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Main 3D Canvas */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: cameraMode === 'free' ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
            background: 'radial-gradient(circle at center, #0a0a2e 0%, #000000 100%)'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onWheel={handleWheel}
        />

        {/* Zoom Indicator */}
        <Chip
          label={`Zoom: ${(zoom * 100).toFixed(0)}%`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white'
          }}
        />

        {/* Camera Info */}
        <Paper
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            p: 1,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.8rem'
          }}
        >
          <Typography variant="caption" display="block">
            Camera: {cameraMode.toUpperCase()}
          </Typography>
          <Typography variant="caption" display="block">
            Mode: {renderMode.toUpperCase()}
          </Typography>
          <Typography variant="caption" display="block">
            Nodes: {data.length}
          </Typography>
        </Paper>
      </Box>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              zIndex: 1000
            }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${selectedNode.color}`,
                color: 'white'
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      sx={{
                        bgcolor: selectedNode.color,
                        width: 60,
                        height: 60
                      }}
                    >
                      {getNodeTypeIcon(selectedNode.type)}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedNode.name}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Type: {selectedNode.type.toUpperCase()} | Status: {selectedNode.status.toUpperCase()}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {Object.entries(selectedNode.metrics).map(([key, value]) => (
                        <Box key={key} sx={{ minWidth: 80 }}>
                          <Typography variant="caption" display="block">
                            {key.toUpperCase()}
                          </Typography>
                          <Typography variant="h6" color={selectedNode.color}>
                            {value?.toFixed(1)}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => setSelectedNode(null)}
                      sx={{ color: 'white' }}
                    >
                      <VisibilityOff />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {aiAssistantActive && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{
              position: 'absolute',
              top: 100,
              right: 20,
              width: 350,
              maxHeight: 'calc(100vh - 200px)',
              zIndex: 2000
            }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                overflowY: 'auto'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Psychology sx={{ mr: 1, color: 'white' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    AI Асистент 3D
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setAiAssistantActive(false)}
                    sx={{ ml: 'auto', color: 'white' }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Інтелектуальний аналіз 3D сцени та рекомендації
                </Typography>

                {/* AI Suggestions */}
                <List dense sx={{ mb: 2 }}>
                  {aiSuggestions.map((suggestion, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1,
                        p: 1
                      }}
                    >
                      <ListItemText
                        primary={suggestion}
                        sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Quick Actions */}
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Швидкі Дії:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => setInteractionMode('analyze')}
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Аналіз
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => setRenderMode('wireframe')}
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Каркас
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={resetCamera}
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Скинути
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={takeScreenshot}
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Фото
                    </Button>
                  </Grid>
                </Grid>

                {/* Voice Control Status */}
                {voiceControlActive && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Mic sx={{ mr: 1, fontSize: 16 }} />
                      Голосове управління активне
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                      Скажіть: "наблизити", "обертати", "аналіз"
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          🌌 3D Scene Settings
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Visual Settings</Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={sceneConfig.gridVisible}
                    onChange={(e) => setSceneConfig(prev => ({ ...prev, gridVisible: e.target.checked }))}
                  />
                }
                label="Show Grid"
                sx={{ display: 'block', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={sceneConfig.particlesEnabled}
                    onChange={(e) => setSceneConfig(prev => ({ ...prev, particlesEnabled: e.target.checked }))}
                  />
                }
                label="Particles"
                sx={{ display: 'block', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={sceneConfig.autoRotate}
                    onChange={(e) => setSceneConfig(prev => ({ ...prev, autoRotate: e.target.checked }))}
                  />
                }
                label="Auto Rotate"
                sx={{ display: 'block', mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Animation Speed: {sceneConfig.animationSpeed}
              </Typography>
              <Slider
                value={sceneConfig.animationSpeed}
                onChange={(_, value) => setSceneConfig(prev => ({ ...prev, animationSpeed: value as number }))}
                min={0.1}
                max={3}
                step={0.1}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>Performance</Typography>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quality: {sceneConfig.quality.toUpperCase()}
              </Typography>
              <Slider
                value={['low', 'medium', 'high', 'ultra'].indexOf(sceneConfig.quality)}
                onChange={(_, value) => {
                  const qualities = ['low', 'medium', 'high', 'ultra'];
                  setSceneConfig(prev => ({ ...prev, quality: qualities[value as number] as any }));
                }}
                min={0}
                max={3}
                step={1}
                marks={[
                  { value: 0, label: 'Low' },
                  { value: 1, label: 'Med' },
                  { value: 2, label: 'High' },
                  { value: 3, label: 'Ultra' }
                ]}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Light Intensity: {sceneConfig.lightIntensity}
              </Typography>
              <Slider
                value={sceneConfig.lightIntensity}
                onChange={(_, value) => setSceneConfig(prev => ({ ...prev, lightIntensity: value as number }))}
                min={0.1}
                max={2}
                step={0.1}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onSceneChange?.(sceneConfig);
              setShowSettings(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Immersive3DVisualizer;
