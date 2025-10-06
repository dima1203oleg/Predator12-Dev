// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Sphere, 
  Box, 
  Cone,
  Text,
  Html,
  Trail,
  Sparkles,
  Environment
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Card,
  CardContent,
  Typography,
  Box as MuiBox,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Timeline,
  ShowChart,
  Speed,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  PlayArrow,
  Pause,
  Refresh
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface DataStream {
  id: string;
  name: string;
  type: 'metrics' | 'logs' | 'events' | 'predictions' | 'anomalies';
  position: [number, number, number];
  velocity: [number, number, number];
  intensity: number; // 0-1
  frequency: number; // Hz
  dataPoints: number[];
  status: 'normal' | 'warning' | 'critical';
  source: string;
  destination: string;
  latency: number;
  throughput: number;
  errors: number;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: { min: number; max: number };
  history: number[];
  category: 'performance' | 'security' | 'quality' | 'business';
}

interface RealtimeAnalyticsEngineProps {
  dataStreams: DataStream[];
  metrics: AnalyticsMetric[];
  onStreamSelect?: (streamId: string) => void;
  onMetricAlert?: (metric: AnalyticsMetric) => void;
  autoOptimize?: boolean;
  showPredictions?: boolean;
}

// 3D Data Particle System
const DataParticle: React.FC<{
  stream: DataStream;
  index: number;
}> = ({ stream, index }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  const [position] = useState<[number, number, number]>(() => [
    stream.position[0] + (Math.random() - 0.5) * 2,
    stream.position[1] + (Math.random() - 0.5) * 2,
    stream.position[2] + (Math.random() - 0.5) * 2
  ]);

  useFrame(({ clock }) => {
    if (particleRef.current) {
      const time = clock.getElapsedTime();
      
      // Move particle along stream velocity
      particleRef.current.position.x += stream.velocity[0] * 0.01;
      particleRef.current.position.y += stream.velocity[1] * 0.01;
      particleRef.current.position.z += stream.velocity[2] * 0.01;
      
      // Reset position if too far
      if (particleRef.current.position.length() > 20) {
        const [x, y, z] = position;
        particleRef.current.position.set(x, y, z);
      }
      
      // Pulsing based on intensity
      const scale = 0.05 + stream.intensity * 0.1 + Math.sin(time * stream.frequency + index) * 0.02;
      particleRef.current.scale.setScalar(scale);
    }
  });

  const getStreamColor = () => {
    switch (stream.type) {
      case 'metrics': return '#00ff88';
      case 'logs': return '#ffaa00';
      case 'events': return '#00aaff';
      case 'predictions': return '#ff44aa';
      case 'anomalies': return '#ff4444';
      default: return '#ffffff';
    }
  };

  const getStatusIntensity = () => {
    switch (stream.status) {
      case 'critical': return 1.0;
      case 'warning': return 0.7;
      case 'normal': return 0.4;
      default: return 0.2;
    }
  };

  return (
    <Sphere ref={particleRef} args={[0.05, 8, 8]} position={position}>
      <meshStandardMaterial
        color={getStreamColor()}
        transparent
        opacity={stream.intensity}
        emissive={getStreamColor()}
        emissiveIntensity={getStatusIntensity()}
      />
    </Sphere>
  );
};

// 3D Data Flow Visualization
const DataFlowVisualization: React.FC<{ streams: DataStream[] }> = ({ streams }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Analytics Hub */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      {/* Data Streams */}
      {streams.map((stream) => (
        <group key={stream.id}>
          {/* Stream source */}
          <Box args={[0.3, 0.3, 0.3]} position={stream.position}>
            <meshStandardMaterial
              color={stream.type === 'metrics' ? '#00ff88' : 
                    stream.type === 'logs' ? '#ffaa00' :
                    stream.type === 'events' ? '#00aaff' :
                    stream.type === 'predictions' ? '#ff44aa' : '#ff4444'}
              emissive={stream.type === 'metrics' ? '#00ff88' : 
                       stream.type === 'logs' ? '#ffaa00' :
                       stream.type === 'events' ? '#00aaff' :
                       stream.type === 'predictions' ? '#ff44aa' : '#ff4444'}
              emissiveIntensity={0.3}
            />
          </Box>
          
          {/* Data particles */}
          {Array.from({ length: Math.floor(stream.intensity * 20) }).map((_, i) => (
            <DataParticle key={`${stream.id}-${i}`} stream={stream} index={i} />
          ))}
          
          {/* Stream label */}
          <Html position={[stream.position[0], stream.position[1] + 0.5, stream.position[2]]} center>
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#00ffff',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #00ffff',
              whiteSpace: 'nowrap'
            }}>
              {stream.name}
            </div>
          </Html>
        </group>
      ))}
      
      {/* Sparkles for active processing */}
      <Sparkles
        count={50}
        scale={10}
        size={2}
        speed={0.3}
        color="#00ffff"
      />
    </group>
  );
};

// Real-time Metrics Dashboard
const MetricsDashboard: React.FC<{
  metrics: AnalyticsMetric[];
  onMetricAlert?: (metric: AnalyticsMetric) => void;
}> = ({ metrics, onMetricAlert }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getMetricStatus = (metric: AnalyticsMetric) => {
    if (metric.value < metric.threshold.min || metric.value > metric.threshold.max) {
      return 'critical';
    }
    if (metric.value < metric.threshold.min * 1.1 || metric.value > metric.threshold.max * 0.9) {
      return 'warning';
    }
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return nexusColors.error;
      case 'warning': return nexusColors.warning;
      case 'normal': return nexusColors.success;
      default: return nexusColors.text.secondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp />;
      case 'down': return <TrendingUp style={{ transform: 'rotate(180deg)' }} />;
      case 'stable': return <ShowChart />;
      default: return <ShowChart />;
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: 400,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 10
      }}
    >
      <Card
        sx={{
          background: 'rgba(10, 15, 26, 0.95)',
          border: `2px solid ${nexusColors.quantum}40`,
          backdropFilter: 'blur(10px)',
          color: nexusColors.frost
        }}
      >
        <CardContent>
          <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ color: nexusColors.quantum }}>
              📊 Real-time Analytics
            </Typography>
            <IconButton size="small" sx={{ color: nexusColors.quantum }}>
              <Refresh />
            </IconButton>
          </MuiBox>
          
          {/* Category filter */}
          <MuiBox display="flex" gap={1} mb={2} flexWrap="wrap">
            {['all', 'performance', 'security', 'quality', 'business'].map((category) => (
              <Chip
                key={category}
                label={category}
                size="small"
                onClick={() => setSelectedCategory(category)}
                sx={{
                  backgroundColor: selectedCategory === category 
                    ? `${nexusColors.quantum}30` 
                    : 'transparent',
                  color: selectedCategory === category 
                    ? nexusColors.quantum 
                    : nexusColors.text.secondary,
                  border: `1px solid ${nexusColors.quantum}40`,
                  '&:hover': {
                    backgroundColor: `${nexusColors.quantum}20`
                  }
                }}
              />
            ))}
          </MuiBox>
          
          {/* Metrics list */}
          {filteredMetrics.map((metric) => {
            const status = getMetricStatus(metric);
            
            return (
              <motion.div
                key={metric.id}
                whileHover={{ scale: 1.02 }}
                style={{ marginBottom: 12 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}80, ${nexusColors.void}60)`,
                    border: `1px solid ${getStatusColor(status)}40`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <MuiBox display="flex" alignItems="center" gap={1}>
                        {getTrendIcon(metric.trend)}
                        <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                          {metric.name}
                        </Typography>
                      </MuiBox>
                      <MuiBox display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" sx={{ color: getStatusColor(status) }}>
                          {metric.value.toFixed(1)}{metric.unit}
                        </Typography>
                        {status === 'critical' && <Error sx={{ color: nexusColors.error }} />}
                        {status === 'warning' && <Warning sx={{ color: nexusColors.warning }} />}
                        {status === 'normal' && <CheckCircle sx={{ color: nexusColors.success }} />}
                      </MuiBox>
                    </MuiBox>
                    
                    <LinearProgress
                      variant="determinate"
                      value={(metric.value / metric.threshold.max) * 100}
                      sx={{
                        mb: 1,
                        backgroundColor: `${getStatusColor(status)}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(status)
                        }
                      }}
                    />
                    
                    <MuiBox display="flex" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        Min: {metric.threshold.min}
                      </Typography>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        Max: {metric.threshold.max}
                      </Typography>
                    </MuiBox>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stream Control Panel
const StreamControlPanel: React.FC<{
  streams: DataStream[];
  onStreamToggle?: (streamId: string, enabled: boolean) => void;
}> = ({ streams, onStreamToggle }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10
      }}
    >
      <Card
        sx={{
          background: 'rgba(10, 15, 26, 0.95)',
          border: `2px solid ${nexusColors.quantum}40`,
          backdropFilter: 'blur(10px)',
          minWidth: 300
        }}
      >
        <CardContent>
          <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ color: nexusColors.quantum }}>
              🌊 Data Streams
            </Typography>
            <IconButton
              onClick={() => setIsPlaying(!isPlaying)}
              sx={{ color: nexusColors.quantum }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </MuiBox>
          
          {streams.map((stream) => (
            <MuiBox key={stream.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <MuiBox>
                <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                  {stream.name}
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                  {stream.throughput.toFixed(1)} MB/s • {stream.latency}ms
                </Typography>
              </MuiBox>
              <MuiBox display="flex" alignItems="center" gap={1}>
                <Chip
                  label={stream.status}
                  size="small"
                  sx={{
                    backgroundColor: stream.status === 'normal' 
                      ? `${nexusColors.success}20` 
                      : stream.status === 'warning'
                      ? `${nexusColors.warning}20`
                      : `${nexusColors.error}20`,
                    color: stream.status === 'normal' 
                      ? nexusColors.success 
                      : stream.status === 'warning'
                      ? nexusColors.warning
                      : nexusColors.error,
                    fontSize: '10px'
                  }}
                />
                <Switch
                  checked={isPlaying}
                  onChange={(e) => onStreamToggle?.(stream.id, e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: nexusColors.quantum
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: nexusColors.quantum
                    }
                  }}
                />
              </MuiBox>
            </MuiBox>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Real-time Analytics Engine Component
const RealtimeAnalyticsEngine: React.FC<RealtimeAnalyticsEngineProps> = ({
  dataStreams,
  metrics,
  onStreamSelect,
  onMetricAlert,
  autoOptimize = true,
  showPredictions = true
}) => {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [systemLoad, setSystemLoad] = useState(0);

  useEffect(() => {
    // Calculate system load based on stream activity
    const totalThroughput = dataStreams.reduce((sum, stream) => sum + stream.throughput, 0);
    setSystemLoad(Math.min(totalThroughput / 100, 100));
    
    // Check for metric alerts
    metrics.forEach(metric => {
      const status = metric.value < metric.threshold.min || metric.value > metric.threshold.max;
      if (status && onMetricAlert) {
        onMetricAlert(metric);
      }
    });
  }, [dataStreams, metrics, onMetricAlert]);

  const handleStreamSelect = (streamId: string) => {
    setSelectedStream(streamId);
    onStreamSelect?.(streamId);
  };

  return (
    <MuiBox
      sx={{
        width: '100%',
        height: '100vh',
        background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        onClick={(e) => {
          // Handle stream selection in 3D space
          console.log('Canvas clicked:', e);
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        
        <Environment preset="night" />
        
        {/* Data Flow Visualization */}
        <DataFlowVisualization streams={dataStreams} />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} />
          <ChromaticAberration
            offset={new THREE.Vector2(0.001, 0.001)}
            radialModulation
            modulationOffset={0.15}
          />
        </EffectComposer>
      </Canvas>
      
      {/* Metrics Dashboard */}
      <MetricsDashboard metrics={metrics} onMetricAlert={onMetricAlert} />
      
      {/* Stream Control Panel */}
      <StreamControlPanel streams={dataStreams} />
      
      {/* System Status Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'absolute',
          top: 20,
          right: 450,
          zIndex: 10
        }}
      >
        <Card
          sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${nexusColors.quantum}40`,
            backdropFilter: 'blur(10px)',
            minWidth: 200
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: nexusColors.quantum, mb: 1 }}>
              ⚡ System Load
            </Typography>
            <Typography variant="h4" sx={{ 
              color: systemLoad > 80 ? nexusColors.error : 
                     systemLoad > 60 ? nexusColors.warning : 
                     nexusColors.success,
              mb: 1
            }}>
              {systemLoad.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={systemLoad}
              sx={{
                backgroundColor: `${nexusColors.quantum}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: systemLoad > 80 ? nexusColors.error : 
                                   systemLoad > 60 ? nexusColors.warning : 
                                   nexusColors.success
                }
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </MuiBox>
  );
};

export default RealtimeAnalyticsEngine;
