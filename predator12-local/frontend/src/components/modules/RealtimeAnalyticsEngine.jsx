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
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const postprocessing_1 = require("@react-three/postprocessing");
const framer_motion_1 = require("framer-motion");
const THREE = __importStar(require("three"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
// 3D Data Particle System
const DataParticle = ({ stream, index }) => {
    const particleRef = (0, react_1.useRef)(null);
    const [position] = (0, react_1.useState)(() => [
        stream.position[0] + (Math.random() - 0.5) * 2,
        stream.position[1] + (Math.random() - 0.5) * 2,
        stream.position[2] + (Math.random() - 0.5) * 2
    ]);
    (0, fiber_1.useFrame)(({ clock }) => {
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
    return (<drei_1.Sphere ref={particleRef} args={[0.05, 8, 8]} position={position}>
      <meshStandardMaterial color={getStreamColor()} transparent opacity={stream.intensity} emissive={getStreamColor()} emissiveIntensity={getStatusIntensity()}/>
    </drei_1.Sphere>);
};
// 3D Data Flow Visualization
const DataFlowVisualization = ({ streams }) => {
    const groupRef = (0, react_1.useRef)(null);
    (0, fiber_1.useFrame)(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
        }
    });
    return (<group ref={groupRef}>
      {/* Central Analytics Hub */}
      <drei_1.Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} emissive="#00ffff" emissiveIntensity={0.2}/>
      </drei_1.Sphere>

      {/* Data Streams */}
      {streams.map((stream) => (<group key={stream.id}>
          {/* Stream source */}
          <drei_1.Box args={[0.3, 0.3, 0.3]} position={stream.position}>
            <meshStandardMaterial color={stream.type === 'metrics' ? '#00ff88' :
                stream.type === 'logs' ? '#ffaa00' :
                    stream.type === 'events' ? '#00aaff' :
                        stream.type === 'predictions' ? '#ff44aa' : '#ff4444'} emissive={stream.type === 'metrics' ? '#00ff88' :
                stream.type === 'logs' ? '#ffaa00' :
                    stream.type === 'events' ? '#00aaff' :
                        stream.type === 'predictions' ? '#ff44aa' : '#ff4444'} emissiveIntensity={0.3}/>
          </drei_1.Box>

          {/* Data particles */}
          {Array.from({ length: Math.floor(stream.intensity * 20) }).map((_, i) => (<DataParticle key={`${stream.id}-${i}`} stream={stream} index={i}/>))}

          {/* Stream label */}
          <drei_1.Html position={[stream.position[0], stream.position[1] + 0.5, stream.position[2]]} center>
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
          </drei_1.Html>
        </group>))}

      {/* Sparkles for active processing */}
      <drei_1.Sparkles count={50} scale={10} size={2} speed={0.3} color="#00ffff"/>
    </group>);
};
// Real-time Metrics Dashboard
const MetricsDashboard = ({ metrics, onMetricAlert }) => {
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const getMetricStatus = (metric) => {
        if (metric.value < metric.threshold.min || metric.value > metric.threshold.max) {
            return 'critical';
        }
        if (metric.value < metric.threshold.min * 1.1 || metric.value > metric.threshold.max * 0.9) {
            return 'warning';
        }
        return 'normal';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return nexusTheme_1.nexusColors.error;
            case 'warning': return nexusTheme_1.nexusColors.warning;
            case 'normal': return nexusTheme_1.nexusColors.success;
            default: return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <icons_material_1.TrendingUp />;
            case 'down': return <icons_material_1.TrendingUp style={{ transform: 'rotate(180deg)' }}/>;
            case 'stable': return <icons_material_1.ShowChart />;
            default: return <icons_material_1.ShowChart />;
        }
    };
    const filteredMetrics = selectedCategory === 'all'
        ? metrics
        : metrics.filter(m => m.category === selectedCategory);
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 400,
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 10
        }}>
      <material_1.Card sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}40`,
            backdropFilter: 'blur(10px)',
            color: nexusTheme_1.nexusColors.frost
        }}>
        <material_1.CardContent>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
              📊 Real-time Analytics
            </material_1.Typography>
            <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Box>

          {/* Category filter */}
          <material_1.Box display="flex" gap={1} mb={2} flexWrap="wrap">
            {['all', 'performance', 'security', 'quality', 'business'].map((category) => (<material_1.Chip key={category} label={category} size="small" onClick={() => setSelectedCategory(category)} sx={{
                backgroundColor: selectedCategory === category
                    ? `${nexusTheme_1.nexusColors.quantum}30`
                    : 'transparent',
                color: selectedCategory === category
                    ? nexusTheme_1.nexusColors.quantum
                    : nexusTheme_1.nexusColors.text.secondary,
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`
                }
            }}/>))}
          </material_1.Box>

          {/* Metrics list */}
          {filteredMetrics.map((metric) => {
            const status = getMetricStatus(metric);
            return (<framer_motion_1.motion.div key={metric.id} whileHover={{ scale: 1.02 }} style={{ marginBottom: 12 }}>
                <material_1.Card sx={{
                    background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}80, ${nexusTheme_1.nexusColors.void}60)`,
                    border: `1px solid ${getStatusColor(status)}40`,
                    transition: 'all 0.3s ease'
                }}>
                  <material_1.CardContent sx={{ p: 2 }}>
                    <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <material_1.Box display="flex" alignItems="center" gap={1}>
                        {getTrendIcon(metric.trend)}
                        <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                          {metric.name}
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Box display="flex" alignItems="center" gap={1}>
                        <material_1.Typography variant="h6" sx={{ color: getStatusColor(status) }}>
                          {metric.value.toFixed(1)}{metric.unit}
                        </material_1.Typography>
                        {status === 'critical' && <icons_material_1.Error sx={{ color: nexusTheme_1.nexusColors.error }}/>}
                        {status === 'warning' && <icons_material_1.Warning sx={{ color: nexusTheme_1.nexusColors.warning }}/>}
                        {status === 'normal' && <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.success }}/>}
                      </material_1.Box>
                    </material_1.Box>

                    <material_1.LinearProgress variant="determinate" value={(metric.value / metric.threshold.max) * 100} sx={{
                    mb: 1,
                    backgroundColor: `${getStatusColor(status)}20`,
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: getStatusColor(status)
                    }
                }}/>

                    <material_1.Box display="flex" justifyContent="space-between">
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Min: {metric.threshold.min}
                      </material_1.Typography>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Max: {metric.threshold.max}
                      </material_1.Typography>
                    </material_1.Box>
                  </material_1.CardContent>
                </material_1.Card>
              </framer_motion_1.motion.div>);
        })}
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
// Stream Control Panel
const StreamControlPanel = ({ streams, onStreamToggle }) => {
    const [isPlaying, setIsPlaying] = (0, react_1.useState)(true);
    return (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 10
        }}>
      <material_1.Card sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}40`,
            backdropFilter: 'blur(10px)',
            minWidth: 300
        }}>
        <material_1.CardContent>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
              🌊 Data Streams
            </material_1.Typography>
            <material_1.IconButton onClick={() => setIsPlaying(!isPlaying)} sx={{ color: nexusTheme_1.nexusColors.quantum }}>
              {isPlaying ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}
            </material_1.IconButton>
          </material_1.Box>

          {streams.map((stream) => (<material_1.Box key={stream.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <material_1.Box>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  {stream.name}
                </material_1.Typography>
                <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  {stream.throughput.toFixed(1)} MB/s • {stream.latency}ms
                </material_1.Typography>
              </material_1.Box>
              <material_1.Box display="flex" alignItems="center" gap={1}>
                <material_1.Chip label={stream.status} size="small" sx={{
                backgroundColor: stream.status === 'normal'
                    ? `${nexusTheme_1.nexusColors.success}20`
                    : stream.status === 'warning'
                        ? `${nexusTheme_1.nexusColors.warning}20`
                        : `${nexusTheme_1.nexusColors.error}20`,
                color: stream.status === 'normal'
                    ? nexusTheme_1.nexusColors.success
                    : stream.status === 'warning'
                        ? nexusTheme_1.nexusColors.warning
                        : nexusTheme_1.nexusColors.error,
                fontSize: '10px'
            }}/>
                <material_1.Switch checked={isPlaying} onChange={(e) => onStreamToggle === null || onStreamToggle === void 0 ? void 0 : onStreamToggle(stream.id, e.target.checked)} size="small" sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: nexusTheme_1.nexusColors.quantum
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: nexusTheme_1.nexusColors.quantum
                }
            }}/>
              </material_1.Box>
            </material_1.Box>))}
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
// Main Real-time Analytics Engine Component
const RealtimeAnalyticsEngine = ({ dataStreams, metrics, onStreamSelect, onMetricAlert, autoOptimize = true, showPredictions = true }) => {
    const [selectedStream, setSelectedStream] = (0, react_1.useState)(null);
    const [systemLoad, setSystemLoad] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
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
    const handleStreamSelect = (streamId) => {
        setSelectedStream(streamId);
        onStreamSelect === null || onStreamSelect === void 0 ? void 0 : onStreamSelect(streamId);
    };
    return (<material_1.Box sx={{
            width: '100%',
            height: '100vh',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 100%)`,
            position: 'relative',
            overflow: 'hidden'
        }}>
      {/* 3D Canvas */}
      <fiber_1.Canvas camera={{ position: [0, 0, 20], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} onClick={(e) => {
            // Handle stream selection in 3D space
            console.log('Canvas clicked:', e);
        }}>
        <ambientLight intensity={0.3}/>
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff"/>
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff"/>

        <drei_1.Environment preset="night"/>

        {/* Data Flow Visualization */}
        <DataFlowVisualization streams={dataStreams}/>

        {/* Post-processing effects */}
        <postprocessing_1.EffectComposer>
          <postprocessing_1.Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300}/>
          <postprocessing_1.ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} radialModulation modulationOffset={0.15}/>
        </postprocessing_1.EffectComposer>
      </fiber_1.Canvas>

      {/* Metrics Dashboard */}
      <MetricsDashboard metrics={metrics} onMetricAlert={onMetricAlert}/>

      {/* Stream Control Panel */}
      <StreamControlPanel streams={dataStreams}/>

      {/* System Status Indicator */}
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{
            position: 'absolute',
            top: 20,
            right: 450,
            zIndex: 10
        }}>
        <material_1.Card sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}40`,
            backdropFilter: 'blur(10px)',
            minWidth: 200
        }}>
          <material_1.CardContent sx={{ textAlign: 'center' }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum, mb: 1 }}>
              ⚡ System Load
            </material_1.Typography>
            <material_1.Typography variant="h4" sx={{
            color: systemLoad > 80 ? nexusTheme_1.nexusColors.error :
                systemLoad > 60 ? nexusTheme_1.nexusColors.warning :
                    nexusTheme_1.nexusColors.success,
            mb: 1
        }}>
              {systemLoad.toFixed(1)}%
            </material_1.Typography>
            <material_1.LinearProgress variant="determinate" value={systemLoad} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: systemLoad > 80 ? nexusTheme_1.nexusColors.error :
                    systemLoad > 60 ? nexusTheme_1.nexusColors.warning :
                        nexusTheme_1.nexusColors.success
            }
        }}/>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.default = RealtimeAnalyticsEngine;
