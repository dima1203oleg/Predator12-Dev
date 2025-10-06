// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Sphere, 
  Box, 
  Cylinder,
  Cone,
  Text,
  Html,
  Trail,
  Sparkles,
  Environment
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Glitch, DotScreen, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
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
  Alert,
  AlertTitle,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Security,
  Shield,
  Warning,
  Error,
  CheckCircle,
  Block,
  Visibility,
  VisibilityOff,
  NetworkCheck,
  Lock,
  VpnLock,
  BugReport,
  Speed,
  Timeline,
  Refresh,
  NotificationImportant
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

export interface ThreatSignature {
  id: string;
  name: string;
  type: 'malware' | 'intrusion' | 'ddos' | 'phishing' | 'anomaly' | 'vulnerability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  position: [number, number, number];
  size: number;
  detected: Date;
  source: string;
  target: string;
  status: 'active' | 'contained' | 'neutralized' | 'investigating';
  confidence: number; // 0-100
  impact: number; // 0-100
  details: string;
}

export interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'safe' | 'warning' | 'danger';
  category: 'firewall' | 'intrusion' | 'antivirus' | 'network' | 'access';
  history: number[];
  lastUpdate: Date;
}

export interface CyberSecurityMonitorProps {
  threats: ThreatSignature[];
  metrics: SecurityMetric[];
  onThreatAction?: (threatId: string, action: 'investigate' | 'contain' | 'neutralize') => void;
  onMetricAlert?: (metric: SecurityMetric) => void;
  realTimeScanning?: boolean;
  autoResponse?: boolean;
}

// 3D Threat Visualization
const ThreatVisualization: React.FC<{
  threat: ThreatSignature;
  onSelect?: (threatId: string) => void;
}> = ({ threat, onSelect }) => {
  const threatRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ clock }) => {
    if (threatRef.current) {
      const time = clock.getElapsedTime();
      
      // Pulsing based on severity with биолюмінесценція
      const severity = threat.severity === 'critical' ? 4 : 
                      threat.severity === 'high' ? 3 : 
                      threat.severity === 'medium' ? 2 : 1;
      
      const pulse = 1 + Math.sin(time * severity) * 0.2;
      const breathe = 1 + Math.sin(time * 0.5) * 0.1;
      threatRef.current.scale.setScalar(pulse * breathe);
      
      // Rotation based on type
      if (threat.type === 'ddos') {
        threatRef.current.rotation.z = time * 2;
        threatRef.current.rotation.x = Math.sin(time) * 0.3;
      } else if (threat.type === 'intrusion') {
        threatRef.current.rotation.y = time;
        threatRef.current.rotation.z = Math.cos(time * 0.5) * 0.2;
      } else {
        threatRef.current.rotation.x = time * 0.5;
        threatRef.current.rotation.y = time * 0.8;
      }
      
      // Іридесценція effect - shimmer
      const shimmer = Math.abs(Math.sin(time * 3 + Math.random()));
      if (threatRef.current.children[0]) {
        const mesh = threatRef.current.children[0] as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = 0.3 + shimmer * 0.4;
        }
      }
    }
  });

  const getThreatColor = () => {
    switch (threat.severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff4400';
      case 'medium': return '#ffaa00';
      case 'low': return '#ffff00';
      default: return '#ffffff';
    }
  };

  const getThreatShape = () => {
    switch (threat.type) {
      case 'malware':
        return (
          <Sphere args={[threat.size, 16, 16]}>
            <meshStandardMaterial
              color={getThreatColor()}
              transparent
              opacity={0.8}
              emissive={getThreatColor()}
              emissiveIntensity={0.5}
            />
          </Sphere>
        );
      case 'intrusion':
        return (
          <Cone args={[threat.size, threat.size * 2, 8]}>
            <meshStandardMaterial
              color={getThreatColor()}
              transparent
              opacity={0.8}
              emissive={getThreatColor()}
              emissiveIntensity={0.5}
            />
          </Cone>
        );
      case 'ddos':
        return (
          <Box args={[threat.size, threat.size, threat.size]}>
            <meshStandardMaterial
              color={getThreatColor()}
              transparent
              opacity={0.8}
              emissive={getThreatColor()}
              emissiveIntensity={0.5}
              wireframe
            />
          </Box>
        );
      default:
        return (
          <Cylinder args={[threat.size, threat.size, threat.size * 2, 8]}>
            <meshStandardMaterial
              color={getThreatColor()}
              transparent
              opacity={0.8}
              emissive={getThreatColor()}
              emissiveIntensity={0.5}
            />
          </Cylinder>
        );
    }
  };

  return (
    <group 
      ref={threatRef} 
      position={threat.position}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(threat.id)}
    >
      {getThreatShape()}
      
      {/* Threat aura based on impact */}
      <Sphere args={[threat.size * 2, 16, 16]}>
        <meshStandardMaterial
          color={getThreatColor()}
          transparent
          opacity={threat.impact / 200}
          emissive={getThreatColor()}
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Sparkles for active threats */}
      {threat.status === 'active' && (
        <Sparkles
          count={10}
          scale={threat.size * 3}
          size={2}
          speed={0.8}
          color={getThreatColor()}
        />
      )}
      
      {/* Threat label */}
      <Html position={[0, threat.size + 0.5, 0]} center>
        <div style={{
          background: isHovered ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
          color: getThreatColor(),
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          border: `2px solid ${getThreatColor()}`,
          whiteSpace: 'nowrap',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}>
          {threat.name}
          <br />
          <span style={{ fontSize: '10px', opacity: 0.8 }}>
            {threat.confidence}% • {threat.severity}
          </span>
        </div>
      </Html>
    </group>
  );
};

// Security Shield Visualization
const SecurityShield: React.FC<{
  strength: number;
  activeThreats: number;
}> = ({ strength, activeThreats }) => {
  const shieldRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (shieldRef.current) {
      const time = clock.getElapsedTime();
      
      // Shield rotation
      shieldRef.current.rotation.y = time * 0.2;
      
      // Pulsing when under attack
      if (activeThreats > 0) {
        const pulse = 1 + Math.sin(time * 5) * 0.1;
        shieldRef.current.scale.setScalar(pulse);
      }
    }
  });

  const getShieldColor = () => {
    if (strength > 80) return '#00ff88';
    if (strength > 60) return '#ffaa00';
    if (strength > 40) return '#ff6600';
    return '#ff4444';
  };

  return (
    <group ref={shieldRef} position={[0, 0, 0]}>
      {/* Main shield dome */}
      <Sphere args={[8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}>
        <meshStandardMaterial
          color={getShieldColor()}
          transparent
          opacity={0.3}
          emissive={getShieldColor()}
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </Sphere>
      
      {/* Shield grid pattern */}
      {Array.from({ length: 16 }).map((_, i) => (
        <group key={i} rotation={[0, (i / 16) * Math.PI * 2, 0]}>
          <Cylinder args={[8, 8, 0.05, 32, 1, true]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={getShieldColor()}
              transparent
              opacity={0.5}
              emissive={getShieldColor()}
              emissiveIntensity={0.1}
            />
          </Cylinder>
        </group>
      ))}
      
      {/* Shield core */}
      <Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial
          color={getShieldColor()}
          emissive={getShieldColor()}
          emissiveIntensity={0.8}
        />
      </Sphere>
    </group>
  );
};

// Threat Intelligence Panel
const ThreatIntelligencePanel: React.FC<{
  threats: ThreatSignature[];
  onThreatAction?: (threatId: string, action: 'investigate' | 'contain' | 'neutralize') => void;
}> = ({ threats, onThreatAction }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return nexusColors.error;
      case 'high': return '#ff6600';
      case 'medium': return nexusColors.warning;
      case 'low': return '#ffff00';
      default: return nexusColors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Warning sx={{ color: nexusColors.error }} />;
      case 'contained': return <Block sx={{ color: nexusColors.warning }} />;
      case 'neutralized': return <CheckCircle sx={{ color: nexusColors.success }} />;
      case 'investigating': return <Visibility sx={{ color: nexusColors.info }} />;
      default: return <Error />;
    }
  };

  const filteredThreats = selectedSeverity === 'all' 
    ? threats 
    : threats.filter(t => t.severity === selectedSeverity);

  const activeThreatCount = threats.filter(t => t.status === 'active').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
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
          border: `2px solid ${nexusColors.error}40`,
          backdropFilter: 'blur(10px)',
          color: nexusColors.frost
        }}
      >
        <CardContent>
          <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ color: nexusColors.error }}>
              🛡️ Threat Intelligence
            </Typography>
            <Badge badgeContent={activeThreatCount} color="error">
              <Security sx={{ color: nexusColors.error }} />
            </Badge>
          </MuiBox>
          
          {/* Severity filter */}
          <MuiBox display="flex" gap={1} mb={2} flexWrap="wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <Chip
                key={severity}
                label={severity}
                size="small"
                onClick={() => setSelectedSeverity(severity)}
                sx={{
                  backgroundColor: selectedSeverity === severity 
                    ? `${getSeverityColor(severity)}30` 
                    : 'transparent',
                  color: selectedSeverity === severity 
                    ? getSeverityColor(severity) 
                    : nexusColors.text.secondary,
                  border: `1px solid ${getSeverityColor(severity)}40`,
                  '&:hover': {
                    backgroundColor: `${getSeverityColor(severity)}20`
                  }
                }}
              />
            ))}
          </MuiBox>
          
          {/* Active threat alert */}
          {activeThreatCount > 0 && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: `${nexusColors.error}20`,
                border: `1px solid ${nexusColors.error}`,
                '& .MuiAlert-icon': { color: nexusColors.error }
              }}
            >
              <AlertTitle>Active Threats Detected</AlertTitle>
              {activeThreatCount} active threat{activeThreatCount > 1 ? 's' : ''} requiring immediate attention
            </Alert>
          )}
          
          {/* Threats list */}
          <List dense>
            {filteredThreats.map((threat) => (
              <motion.div
                key={threat.id}
                whileHover={{ scale: 1.02 }}
                style={{ marginBottom: 8 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}80, ${nexusColors.void}60)`,
                    border: `1px solid ${getSeverityColor(threat.severity)}40`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <MuiBox display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(threat.status)}
                        <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                          {threat.name}
                        </Typography>
                      </MuiBox>
                      <Chip
                        label={threat.severity}
                        size="small"
                        sx={{
                          backgroundColor: `${getSeverityColor(threat.severity)}20`,
                          color: getSeverityColor(threat.severity),
                          border: `1px solid ${getSeverityColor(threat.severity)}`
                        }}
                      />
                    </MuiBox>
                    
                    <Typography variant="caption" sx={{ color: nexusColors.text.secondary, display: 'block', mb: 1 }}>
                      {threat.details}
                    </Typography>
                    
                    <MuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        Confidence: {threat.confidence}% • Impact: {threat.impact}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                        {threat.source} → {threat.target}
                      </Typography>
                    </MuiBox>
                    
                    {threat.status === 'active' && (
                      <MuiBox display="flex" gap={1} mt={1}>
                        <IconButton
                          size="small"
                          onClick={() => onThreatAction?.(threat.id, 'investigate')}
                          sx={{ color: nexusColors.info }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onThreatAction?.(threat.id, 'contain')}
                          sx={{ color: nexusColors.warning }}
                        >
                          <Block fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onThreatAction?.(threat.id, 'neutralize')}
                          sx={{ color: nexusColors.error }}
                        >
                          <Shield fontSize="small" />
                        </IconButton>
                      </MuiBox>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </List>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Security Metrics Dashboard
const SecurityMetricsDashboard: React.FC<{
  metrics: SecurityMetric[];
  onMetricAlert?: (metric: SecurityMetric) => void;
}> = ({ metrics, onMetricAlert }) => {
  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'firewall': return <Shield />;
      case 'intrusion': return <Security />;
      case 'antivirus': return <BugReport />;
      case 'network': return <NetworkCheck />;
      case 'access': return <Lock />;
      default: return <Security />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return nexusColors.success;
      case 'warning': return nexusColors.warning;
      case 'danger': return nexusColors.error;
      default: return nexusColors.text.secondary;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 500,
        zIndex: 10
      }}
    >
      <Card
        sx={{
          background: 'rgba(10, 15, 26, 0.95)',
          border: `2px solid ${nexusColors.success}40`,
          backdropFilter: 'blur(10px)',
          color: nexusColors.frost
        }}
      >
        <CardContent>
          <MuiBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ color: nexusColors.success }}>
              📊 Security Metrics
            </Typography>
            <IconButton size="small" sx={{ color: nexusColors.success }}>
              <Refresh />
            </IconButton>
          </MuiBox>
          
          <Grid container spacing={2}>
            {metrics.map((metric) => (
              <Grid item xs={6} key={metric.id}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}80, ${nexusColors.void}60)`,
                    border: `1px solid ${getStatusColor(metric.status)}40`,
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <MuiBox display="flex" alignItems="center" gap={1} mb={1}>
                      {getMetricIcon(metric.category)}
                      <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                        {metric.name}
                      </Typography>
                    </MuiBox>
                    
                    <Typography variant="h6" sx={{ color: getStatusColor(metric.status), mb: 1 }}>
                      {metric.value.toFixed(1)}{metric.unit}
                    </Typography>
                    
                    <LinearProgress
                      variant="determinate"
                      value={(metric.value / metric.threshold) * 100}
                      sx={{
                        backgroundColor: `${getStatusColor(metric.status)}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(metric.status)
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Cyber Security Monitor Component
const CyberSecurityMonitor: React.FC<CyberSecurityMonitorProps> = ({
  threats,
  metrics,
  onThreatAction,
  onMetricAlert,
  realTimeScanning = true,
  autoResponse = false
}) => {
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [shieldStrength, setShieldStrength] = useState(85);
  const [scanningActive, setScanningActive] = useState(realTimeScanning);
  const chromaOffset = new THREE.Vector2(0.002, 0.002);

  const activeThreatCount = threats.filter(t => t.status === 'active').length;
  const criticalThreatCount = threats.filter(t => t.severity === 'critical').length;

  useEffect(() => {
    // Calculate shield strength based on metrics and threats
    const avgMetricStatus = metrics.reduce((sum, metric) => {
      return sum + (metric.status === 'safe' ? 100 : metric.status === 'warning' ? 60 : 20);
    }, 0) / metrics.length;
    
    const threatImpact = Math.max(0, 100 - (activeThreatCount * 15));
    
    setShieldStrength(Math.min(avgMetricStatus, threatImpact));
  }, [metrics, activeThreatCount]);

  const handleThreatSelect = (threatId: string) => {
    setSelectedThreat(threatId);
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
        camera={{ position: [0, 5, 25], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff4444" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88" />
        
        <Environment preset="night" />
        
        {/* Security Shield */}
        <SecurityShield strength={shieldStrength} activeThreats={activeThreatCount} />
        
        {/* Threat Visualizations */}
        {threats.map((threat) => (
          <ThreatVisualization
            key={threat.id}
            threat={threat}
            onSelect={handleThreatSelect}
          />
        ))}
        
        {/* Post-processing effects - ENHANCED */}
        <EffectComposer multisampling={8}>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.95} 
            height={400} 
            intensity={1.5}
            radius={0.85}
          />
          <ChromaticAberration
            offset={chromaOffset}
            radialModulation
            modulationOffset={0.3}
          />
          <Glitch
            active={criticalThreatCount > 0}
            delay={new THREE.Vector2(1.5, 3.5)}
            duration={new THREE.Vector2(0.6, 1.0)}
            strength={new THREE.Vector2(0.3, 1.0)}
            mode={1}
          />
          <DotScreen
            blendFunction={BlendFunction.OVERLAY}
            scale={0.8}
            angle={Math.PI * 0.5}
          />
          <Vignette
            offset={0.3}
            darkness={0.5}
            eskil={false}
            blendFunction={BlendFunction.NORMAL}
          />
          <Noise
            opacity={0.02}
            blendFunction={BlendFunction.OVERLAY}
          />
        </EffectComposer>
      </Canvas>
      
      {/* Threat Intelligence Panel */}
      <ThreatIntelligencePanel threats={threats} onThreatAction={onThreatAction} />
      
      {/* Security Metrics Dashboard */}
      <SecurityMetricsDashboard metrics={metrics} onMetricAlert={onMetricAlert} />
      
      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10
        }}
      >
        <Card
          sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${shieldStrength > 80 ? nexusColors.success : 
                                 shieldStrength > 60 ? nexusColors.warning : 
                                 nexusColors.error}40`,
            backdropFilter: 'blur(10px)',
            minWidth: 250
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: nexusColors.quantum, mb: 1 }}>
              🛡️ Security Status
            </Typography>
            
            <Typography variant="h4" sx={{ 
              color: shieldStrength > 80 ? nexusColors.success : 
                     shieldStrength > 60 ? nexusColors.warning : 
                     nexusColors.error,
              mb: 1
            }}>
              {shieldStrength.toFixed(0)}%
            </Typography>
            
            <LinearProgress
              variant="determinate"
              value={shieldStrength}
              sx={{
                mb: 2,
                backgroundColor: `${nexusColors.quantum}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: shieldStrength > 80 ? nexusColors.success : 
                                   shieldStrength > 60 ? nexusColors.warning : 
                                   nexusColors.error
                }
              }}
            />
            
            <MuiBox display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                Active Threats
              </Typography>
              <Typography variant="body2" sx={{ color: nexusColors.error }}>
                {activeThreatCount}
              </Typography>
            </MuiBox>
            
            <MuiBox display="flex" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                Shield Strength
              </Typography>
              <Typography variant="body2" sx={{ color: nexusColors.success }}>
                {shieldStrength > 80 ? 'Strong' : shieldStrength > 60 ? 'Moderate' : 'Weak'}
              </Typography>
            </MuiBox>
          </CardContent>
        </Card>
      </motion.div>
    </MuiBox>
  );
};

export default CyberSecurityMonitor;
