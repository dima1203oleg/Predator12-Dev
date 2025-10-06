// @ts-nocheck
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  Chip,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Типи вузлів системи
interface SystemNode {
  id: string;
  name: string;
  type: 'service' | 'database' | 'queue' | 'api' | 'frontend';
  position: [number, number, number];
  status: 'healthy' | 'warning' | 'error' | 'processing';
  metrics: {
    latency: number;
    throughput: number;
    errors: number;
    queueSize?: number;
  };
  connections: string[];
}

// Типи потоків даних
interface DataFlow {
  id: string;
  from: string;
  to: string;
  status: 'active' | 'idle' | 'error';
  dataType: 'import' | 'query' | 'sync' | 'alert';
  volume: number;
  latency: number;
}

interface DataFlowMapProps {
  nodes: SystemNode[];
  flows: DataFlow[];
  onNodeClick?: (node: SystemNode) => void;
  onFlowClick?: (flow: DataFlow) => void;
  enableVoiceControl?: boolean;
}

// 3D вузол системи як "планета"
const SystemPlanet: React.FC<{
  node: SystemNode;
  onClick: () => void;
  isSelected: boolean;
  isFiltered: boolean;
}> = ({ node, onClick, isSelected, isFiltered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Анімація обертання та пульсації
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;

      // Пульсація залежно від статусу
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      const scale = node.status === 'processing' ? pulse * 1.2 :
                   node.status === 'error' ? pulse * 1.3 : pulse;
      meshRef.current.scale.setScalar(scale * (isSelected ? 1.4 : 1));
    }
  });

  // Кольори залежно від типу та статусу
  const getNodeColor = () => {
    if (node.status === 'error') return '#ff0066';
    if (node.status === 'warning') return '#ffaa00';
    if (node.status === 'processing') return '#00aaff';

    switch (node.type) {
      case 'frontend': return '#00ff66';
      case 'service': return '#0099ff';
      case 'database': return '#9900ff';
      case 'queue': return '#ff9900';
      case 'api': return '#00ffaa';
      default: return '#ffffff';
    }
  };

  const getNodeSize = () => {
    switch (node.type) {
      case 'database': return 0.8;
      case 'queue': return 0.6;
      case 'service': return 0.7;
      case 'frontend': return 0.9;
      default: return 0.5;
    }
  };

  if (isFiltered) return null;

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={getNodeSize()}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={getNodeColor()}
          transparent
          opacity={hovered ? 0.9 : 0.7}
          emissive={getNodeColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Sparkles для активних вузлів */}
      {node.status === 'processing' && (
        <Sparkles
          count={20}
          scale={[2, 2, 2]}
          size={1}
          speed={0.6}
          color={getNodeColor()}
        />
      )}

      {/* Назва вузла */}
      <Html position={[0, 1.5, 0]} center>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: getNodeColor(),
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: `1px solid ${getNodeColor()}`,
            textAlign: 'center',
            minWidth: '80px'
          }}
        >
          {node.name}
          <br />
          <span style={{ fontSize: '10px', opacity: 0.8 }}>
            {node.metrics.latency}ms | {node.metrics.throughput}/s
          </span>
        </motion.div>
      </Html>
    </group>
  );
};

// Анімований потік даних між вузлами
const DataFlowLine: React.FC<{
  flow: DataFlow;
  nodes: SystemNode[];
  isVisible: boolean;
}> = ({ flow, nodes, isVisible }) => {
  const lineRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<THREE.Vector3[]>([]);

  const fromNode = nodes.find(n => n.id === flow.from);
  const toNode = nodes.find(n => n.id === flow.to);

  useEffect(() => {
    if (fromNode && toNode && isVisible) {
      // Створюємо частинки для анімації потоку
      const particleCount = Math.min(flow.volume, 10);
      const newParticles: THREE.Vector3[] = [];

      for (let i = 0; i < particleCount; i++) {
        const progress = i / particleCount;
        const position = new THREE.Vector3()
          .lerpVectors(
            new THREE.Vector3(...fromNode.position),
            new THREE.Vector3(...toNode.position),
            progress
          );
        newParticles.push(position);
      }

      setParticles(newParticles);
    }
  }, [flow, fromNode, toNode, isVisible]);

  useFrame((state, delta) => {
    if (particles.length > 0 && fromNode && toNode) {
      // Анімуємо частинки по лінії
      setParticles(prevParticles =>
        prevParticles.map((particle, index) => {
          const speed = flow.status === 'active' ? 0.02 : 0.005;
          const progress = (index / prevParticles.length + state.clock.elapsedTime * speed) % 1;

          return new THREE.Vector3()
            .lerpVectors(
              new THREE.Vector3(...fromNode.position),
              new THREE.Vector3(...toNode.position),
              progress
            );
        })
      );
    }
  });

  if (!fromNode || !toNode || !isVisible) return null;

  const getFlowColor = () => {
    if (flow.status === 'error') return '#ff0066';
    switch (flow.dataType) {
      case 'import': return '#00ff66';
      case 'query': return '#0099ff';
      case 'sync': return '#ffaa00';
      case 'alert': return '#ff6600';
      default: return '#ffffff';
    }
  };

  return (
    <group ref={lineRef}>
      {/* Лінія з'єднання */}
      <Line
        points={[fromNode.position, toNode.position]}
        color={getFlowColor()}
        lineWidth={flow.volume / 10}
        transparent
        opacity={0.6}
      />

      {/* Анімовані частинки */}
      {particles.map((position, index) => (
        <mesh key={index} position={position.toArray()}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={getFlowColor()}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Головний компонент Data Flow Map
const DataFlowMap: React.FC<DataFlowMapProps> = ({
  nodes,
  flows,
  onNodeClick,
  onFlowClick,
  enableVoiceControl = true
}) => {
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [filteredNodeTypes, setFilteredNodeTypes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  // Фільтрація вузлів
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filteredNodeTypes.has(node.type);
    return matchesSearch && matchesType;
  });

  // Обробка кліку по вузлу
  const handleNodeClick = useCallback((node: SystemNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  // Жести
  const bind = useGesture({
    onPinch: ({ offset: [scale] }) => {
      // Zoom logic handled by OrbitControls
    },
    onDoubleClick: () => {
      setSelectedNode(null);
    }
  });

  // Гарячі клавіші
  useHotkeys('escape', () => setSelectedNode(null));
  useHotkeys('space', () => setIsPaused(!isPaused));
  useHotkeys('r', () => setAutoRotate(!autoRotate));
  useHotkeys('m', () => setShowMetrics(!showMetrics));

  // Голосові команди
  useEffect(() => {
    if (enableVoiceControl && 'webkitSpeechRecognition' in window) {
      // Voice control implementation would go here
    }
  }, [enableVoiceControl]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', background: '#0a0a0f' }}>
      {/* Бічна панель з контролами */}
      <Paper
        elevation={3}
        sx={{
          width: 300,
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #333',
          p: 2,
          overflowY: 'auto'
        }}
      >
        {/* Пошук */}
        <TextField
          fullWidth
          placeholder="Пошук вузлів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#00ff66', mr: 1 }} />
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#00ff66',
              '& fieldset': { borderColor: '#333' },
              '&:hover fieldset': { borderColor: '#00ff66' },
              '&.Mui-focused fieldset': { borderColor: '#00ff66' }
            }
          }}
        />

        {/* Фільтри */}
        <Typography variant="h6" sx={{ color: '#00ff66', mb: 1 }}>
          Фільтри
        </Typography>

        {['service', 'database', 'queue', 'api', 'frontend'].map(type => (
          <FormControlLabel
            key={type}
            control={
              <Switch
                checked={!filteredNodeTypes.has(type)}
                onChange={(e) => {
                  const newFiltered = new Set(filteredNodeTypes);
                  if (e.target.checked) {
                    newFiltered.delete(type);
                  } else {
                    newFiltered.add(type);
                  }
                  setFilteredNodeTypes(newFiltered);
                }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00ff66'
                  }
                }}
              />
            }
            label={type}
            sx={{ color: '#ccc', display: 'block' }}
          />
        ))}

        {/* Контроли */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ color: '#00ff66', mb: 1 }}>
            Контроли
          </Typography>

          <IconButton
            onClick={() => setIsPaused(!isPaused)}
            sx={{ color: isPaused ? '#ff6600' : '#00ff66', mr: 1 }}
          >
            {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>

          <IconButton
            onClick={() => setShowMetrics(!showMetrics)}
            sx={{ color: showMetrics ? '#00ff66' : '#666' }}
          >
            {showMetrics ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Box>

        {/* Інформація про вибраний вузол */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 16 }}
          >
            <Card sx={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#00ff66' }}>
                  {selectedNode.name}
                </Typography>
                <Chip
                  label={selectedNode.type}
                  size="small"
                  sx={{ background: '#00ff66', color: '#000', mb: 1 }}
                />
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Статус: <span style={{ color: '#00ff66' }}>{selectedNode.status}</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Затримка: {selectedNode.metrics.latency}ms
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Пропускна здатність: {selectedNode.metrics.throughput}/s
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Помилки: {selectedNode.metrics.errors}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Список потоків */}
        <Typography variant="h6" sx={{ color: '#00ff66', mt: 3, mb: 1 }}>
          Активні потоки
        </Typography>
        <List dense>
          {flows.filter(f => f.status === 'active').map(flow => (
            <ListItem
              key={flow.id}
              button
              onClick={() => onFlowClick?.(flow)}
              sx={{
                border: '1px solid #333',
                borderRadius: 1,
                mb: 1,
                '&:hover': { background: 'rgba(0, 255, 102, 0.1)' }
              }}
            >
              <ListItemText
                primary={`${flow.from} → ${flow.to}`}
                secondary={`${flow.dataType} | ${flow.volume} req/s`}
                primaryTypographyProps={{ color: '#00ff66', fontSize: '14px' }}
                secondaryTypographyProps={{ color: '#ccc', fontSize: '12px' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* 3D сцена */}
      <Box {...bind()} sx={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 75 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ff66" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0099ff" />

          {/* Вузли системи */}
          {filteredNodes.map(node => (
            <SystemPlanet
              key={node.id}
              node={node}
              onClick={() => handleNodeClick(node)}
              isSelected={selectedNode?.id === node.id}
              isFiltered={filteredNodeTypes.has(node.type)}
            />
          ))}

          {/* Потоки даних */}
          {!isPaused && flows.map(flow => (
            <DataFlowLine
              key={flow.id}
              flow={flow}
              nodes={nodes}
              isVisible={!filteredNodeTypes.has(
                nodes.find(n => n.id === flow.from)?.type || ''
              )}
            />
          ))}

          <OrbitControls
            autoRotate={autoRotate && !selectedNode}
            autoRotateSpeed={0.5}
            enableZoom={true}
            enablePan={true}
            maxDistance={30}
            minDistance={5}
          />
        </Canvas>

        {/* Оверлей з підказками */}
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
            ESC: скасувати вибір | SPACE: пауза | R: обертання | M: метрики
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
            Вузлів: {filteredNodes.length} | Потоків: {flows.filter(f => f.status === 'active').length}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DataFlowMap;
