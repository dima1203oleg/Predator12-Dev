// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Sphere,
  Box,
  Cylinder,
  Text,
  OrbitControls,
  Environment,
  Sparkles,
  Html
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Card, CardContent, Typography, Box as MuiBox, IconButton, Chip, LinearProgress } from '@mui/material';
import { Visibility, Security, Speed, Psychology, TrendingUp } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface AIAgent {
  id: string;
  name: string;
  type: 'analyzer' | 'protector' | 'optimizer' | 'learner' | 'predictor';
  status: 'active' | 'idle' | 'processing' | 'learning' | 'alert';
  position: [number, number, number];
  intelligence: number; // 0-100
  efficiency: number; // 0-100
  reliability: number; // 0-100
  learningRate: number; // 0-100
  connections: string[];
  capabilities: string[];
  currentTask?: string;
  insights: string[];
  predictedActions: string[];
}

interface AdvancedAISystemProps {
  agents: AIAgent[];
  onAgentInteraction?: (agentId: string, action: string) => void;
  onSystemOptimization?: () => void;
  showPredictions?: boolean;
}

// 3D AI Brain Visualization
const AIBrain: React.FC<{ agent: AIAgent }> = ({ agent }) => {
  const brainRef = useRef<THREE.Group>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useFrame(({ clock }) => {
    if (brainRef.current) {
      const time = clock.getElapsedTime();

      // Pulsing based on intelligence and activity
      const pulse = Math.sin(time * (agent.intelligence / 10)) * 0.1 + 1;
      brainRef.current.scale.setScalar(pulse);

      // Rotating based on learning rate
      brainRef.current.rotation.y = time * (agent.learningRate / 100);

      // Color intensity based on status
      setPulseIntensity(
        agent.status === 'processing' ? 1 :
        agent.status === 'learning' ? 0.8 :
        agent.status === 'alert' ? 0.6 : 0.4
      );
    }
  });

  const getAgentColor = () => {
    switch (agent.type) {
      case 'analyzer': return '#00ff88';
      case 'protector': return '#ff4444';
      case 'optimizer': return '#ffaa00';
      case 'learner': return '#8844ff';
      case 'predictor': return '#00aaff';
      default: return '#ffffff';
    }
  };

  return (
    <group ref={brainRef} position={agent.position}>
      {/* Main brain core */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color={getAgentColor()}
          transparent
          opacity={0.7}
          emissive={getAgentColor()}
          emissiveIntensity={pulseIntensity * 0.3}
        />
      </Sphere>

      {/* Neural network connections */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          key={i}
          args={[0.1, 0.1, 1.5]}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 1.2,
            Math.sin((i / 8) * Math.PI * 2) * 1.2,
            0
          ]}
          rotation={[0, 0, (i / 8) * Math.PI * 2]}
        >
          <meshStandardMaterial
            color={getAgentColor()}
            transparent
            opacity={0.5}
            emissive={getAgentColor()}
            emissiveIntensity={pulseIntensity * 0.2}
          />
        </Box>
      ))}

      {/* Processing indicators */}
      {agent.status === 'processing' && (
        <Sparkles
          count={20}
          scale={2}
          size={3}
          speed={0.5}
          color={getAgentColor()}
        />
      )}

      {/* Agent name label */}
      <Html position={[0, 1.5, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: getAgentColor(),
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          border: `1px solid ${getAgentColor()}`,
          whiteSpace: 'nowrap'
        }}>
          {agent.name}
        </div>
      </Html>
    </group>
  );
};

// AI System Network Connections
const NetworkConnections: React.FC<{ agents: AIAgent[] }> = ({ agents }) => {
  const linesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (linesRef.current) {
      // Animate connection intensity
      linesRef.current.children.forEach((line, index) => {
        const material = (line as THREE.Line).material as THREE.LineBasicMaterial;
        material.opacity = 0.3 + Math.sin(clock.getElapsedTime() + index) * 0.2;
      });
    }
  });

  const connections: { from: [number, number, number]; to: [number, number, number]; color: string }[] = [];
  agents.forEach(agent => {
    agent.connections.forEach(targetId => {
      const target = agents.find(a => a.id === targetId);
      if (target) {
        connections.push({
          from: agent.position,
          to: target.position,
          color: '#00ffff'
        });
      }
    });
  });

  return (
    <group ref={linesRef}>
      {connections.map((connection, index) => {
        const points = [
          new THREE.Vector3(...connection.from),
          new THREE.Vector3(...connection.to)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <mesh key={index}>
            <primitive object={geometry} attach="geometry" />
            <lineBasicMaterial
              color={connection.color}
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// AI Insights Panel
const AIInsightsPanel: React.FC<{ agents: AIAgent[] }> = ({ agents }) => {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const getStatusColor = (status: AIAgent['status']) => {
    switch (status) {
      case 'active': return nexusColors.success;
      case 'processing': return nexusColors.warning;
      case 'learning': return nexusColors.info;
      case 'alert': return nexusColors.error;
      default: return nexusColors.text.secondary;
    }
  };

  const getTypeIcon = (type: AIAgent['type']) => {
    switch (type) {
      case 'analyzer': return <Visibility />;
      case 'protector': return <Security />;
      case 'optimizer': return <Speed />;
      case 'learner': return <Psychology />;
      case 'predictor': return <TrendingUp />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 350,
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
          <Typography variant="h6" sx={{ color: nexusColors.quantum, mb: 2 }}>
            🧠 AI System Intelligence Hub
          </Typography>

          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              style={{ marginBottom: 16 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${nexusColors.obsidian}80, ${nexusColors.void}60)`,
                  border: `1px solid ${getStatusColor(agent.status)}40`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
              >
                <CardContent sx={{ p: 2 }}>
                  <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <MuiBox display="flex" alignItems="center" gap={1}>
                      {getTypeIcon(agent.type)}
                      <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                        {agent.name}
                      </Typography>
                    </MuiBox>
                    <Chip
                      label={agent.status}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(agent.status)}20`,
                        color: getStatusColor(agent.status),
                        border: `1px solid ${getStatusColor(agent.status)}`
                      }}
                    />
                  </MuiBox>

                  <MuiBox display="flex" gap={2} mb={1}>
                    <MuiBox flex={1}>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        Intelligence
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={agent.intelligence}
                        sx={{
                          backgroundColor: `${nexusColors.quantum}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: nexusColors.quantum
                          }
                        }}
                      />
                    </MuiBox>
                    <MuiBox flex={1}>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        Efficiency
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={agent.efficiency}
                        sx={{
                          backgroundColor: `${nexusColors.success}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: nexusColors.success
                          }
                        }}
                      />
                    </MuiBox>
                  </MuiBox>

                  {agent.currentTask && (
                    <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                      📋 {agent.currentTask}
                    </Typography>
                  )}

                  <AnimatePresence>
                    {selectedAgent?.id === agent.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginTop: 12 }}
                      >
                        <Typography variant="caption" sx={{ color: nexusColors.quantum, fontWeight: 'bold' }}>
                          🎯 Capabilities:
                        </Typography>
                        <MuiBox display="flex" flexWrap="wrap" gap={0.5} mt={1} mb={2}>
                          {agent.capabilities.map((capability) => (
                            <Chip
                              key={capability}
                              label={capability}
                              size="small"
                              sx={{
                                backgroundColor: `${nexusColors.success}15`,
                                color: nexusColors.success,
                                fontSize: '10px'
                              }}
                            />
                          ))}
                        </MuiBox>

                        {agent.insights.length > 0 && (
                          <>
                            <Typography variant="caption" sx={{ color: nexusColors.quantum, fontWeight: 'bold' }}>
                              💡 Recent Insights:
                            </Typography>
                            {agent.insights.slice(0, 3).map((insight, index) => (
                              <Typography
                                key={index}
                                variant="caption"
                                sx={{
                                  color: nexusColors.text.secondary,
                                  display: 'block',
                                  mt: 0.5,
                                  fontSize: '11px'
                                }}
                              >
                                • {insight}
                              </Typography>
                            ))}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Advanced AI System Component
const AdvancedAISystem: React.FC<AdvancedAISystemProps> = ({
  agents,
  onAgentInteraction,
  onSystemOptimization,
  showPredictions = true
}) => {
  const [systemHealth, setSystemHealth] = useState(0);
  const [networkActivity, setNetworkActivity] = useState(0);

  useEffect(() => {
    // Calculate system health based on agent metrics
    const avgHealth = agents.reduce((sum, agent) =>
      sum + (agent.intelligence + agent.efficiency + agent.reliability) / 3, 0
    ) / agents.length;

    setSystemHealth(avgHealth);

    // Calculate network activity
    const activeConnections = agents.reduce((sum, agent) => sum + agent.connections.length, 0);
    setNetworkActivity(Math.min(activeConnections * 10, 100));
  }, [agents]);

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
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

        {/* Environment */}
        <Environment preset="night" />

        {/* AI Agents */}
        {agents.map((agent) => (
          <AIBrain key={agent.id} agent={agent} />
        ))}

        {/* Network Connections */}
        <NetworkConnections agents={agents} />

        {/* Central System Hub */}
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </Sphere>

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} />
          <ChromaticAberration
            offset={new THREE.Vector2(0.001, 0.001)}
            radialModulation
            modulationOffset={0.15}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>

      {/* AI Insights Panel */}
      <AIInsightsPanel agents={agents} />

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
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
            <Typography variant="h6" sx={{ color: nexusColors.quantum, mb: 2 }}>
              🌐 System Status
            </Typography>

            <MuiBox display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                System Health
              </Typography>
              <Typography variant="body2" sx={{ color: nexusColors.success }}>
                {systemHealth.toFixed(1)}%
              </Typography>
            </MuiBox>
            <LinearProgress
              variant="determinate"
              value={systemHealth}
              sx={{
                mb: 2,
                backgroundColor: `${nexusColors.success}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: nexusColors.success
                }
              }}
            />

            <MuiBox display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                Network Activity
              </Typography>
              <Typography variant="body2" sx={{ color: nexusColors.quantum }}>
                {networkActivity.toFixed(1)}%
              </Typography>
            </MuiBox>
            <LinearProgress
              variant="determinate"
              value={networkActivity}
              sx={{
                backgroundColor: `${nexusColors.quantum}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: nexusColors.quantum
                }
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </MuiBox>
  );
};

export default AdvancedAISystem;
