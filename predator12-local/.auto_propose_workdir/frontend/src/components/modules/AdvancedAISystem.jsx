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
// 3D AI Brain Visualization
const AIBrain = ({ agent }) => {
    const brainRef = (0, react_1.useRef)(null);
    const [pulseIntensity, setPulseIntensity] = (0, react_1.useState)(0);
    (0, fiber_1.useFrame)(({ clock }) => {
        if (brainRef.current) {
            const time = clock.getElapsedTime();
            // Pulsing based on intelligence and activity
            const pulse = Math.sin(time * (agent.intelligence / 10)) * 0.1 + 1;
            brainRef.current.scale.setScalar(pulse);
            // Rotating based on learning rate
            brainRef.current.rotation.y = time * (agent.learningRate / 100);
            // Color intensity based on status
            setPulseIntensity(agent.status === 'processing' ? 1 :
                agent.status === 'learning' ? 0.8 :
                    agent.status === 'alert' ? 0.6 : 0.4);
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
    return (<group ref={brainRef} position={agent.position}>
      {/* Main brain core */}
      <drei_1.Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial color={getAgentColor()} transparent opacity={0.7} emissive={getAgentColor()} emissiveIntensity={pulseIntensity * 0.3}/>
      </drei_1.Sphere>

      {/* Neural network connections */}
      {Array.from({ length: 8 }).map((_, i) => (<drei_1.Box key={i} args={[0.1, 0.1, 1.5]} position={[
                Math.cos((i / 8) * Math.PI * 2) * 1.2,
                Math.sin((i / 8) * Math.PI * 2) * 1.2,
                0
            ]} rotation={[0, 0, (i / 8) * Math.PI * 2]}>
          <meshStandardMaterial color={getAgentColor()} transparent opacity={0.5} emissive={getAgentColor()} emissiveIntensity={pulseIntensity * 0.2}/>
        </drei_1.Box>))}

      {/* Processing indicators */}
      {agent.status === 'processing' && (<drei_1.Sparkles count={20} scale={2} size={3} speed={0.5} color={getAgentColor()}/>)}

      {/* Agent name label */}
      <drei_1.Html position={[0, 1.5, 0]} center>
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
      </drei_1.Html>
    </group>);
};
// AI System Network Connections
const NetworkConnections = ({ agents }) => {
    const linesRef = (0, react_1.useRef)(null);
    (0, fiber_1.useFrame)(({ clock }) => {
        if (linesRef.current) {
            // Animate connection intensity
            linesRef.current.children.forEach((line, index) => {
                const material = line.material;
                material.opacity = 0.3 + Math.sin(clock.getElapsedTime() + index) * 0.2;
            });
        }
    });
    const connections = [];
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
    return (<group ref={linesRef}>
      {connections.map((connection, index) => {
            const points = [
                new THREE.Vector3(...connection.from),
                new THREE.Vector3(...connection.to)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            return (<mesh key={index}>
            <primitive object={geometry} attach="geometry"/>
            <lineBasicMaterial color={connection.color} transparent opacity={0.5}/>
          </mesh>);
        })}
    </group>);
};
// AI Insights Panel
const AIInsightsPanel = ({ agents }) => {
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusTheme_1.nexusColors.success;
            case 'processing': return nexusTheme_1.nexusColors.warning;
            case 'learning': return nexusTheme_1.nexusColors.info;
            case 'alert': return nexusTheme_1.nexusColors.error;
            default: return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'analyzer': return <icons_material_1.Visibility />;
            case 'protector': return <icons_material_1.Security />;
            case 'optimizer': return <icons_material_1.Speed />;
            case 'learner': return <icons_material_1.Psychology />;
            case 'predictor': return <icons_material_1.TrendingUp />;
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 350,
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
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum, mb: 2 }}>
            🧠 AI System Intelligence Hub
          </material_1.Typography>

          {agents.map((agent) => (<framer_motion_1.motion.div key={agent.id} whileHover={{ scale: 1.02 }} style={{ marginBottom: 16 }}>
              <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}80, ${nexusTheme_1.nexusColors.void}60)`,
                border: `1px solid ${getStatusColor(agent.status)}40`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }} onClick={() => setSelectedAgent((selectedAgent === null || selectedAgent === void 0 ? void 0 : selectedAgent.id) === agent.id ? null : agent)}>
                <material_1.CardContent sx={{ p: 2 }}>
                  <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <material_1.Box display="flex" alignItems="center" gap={1}>
                      {getTypeIcon(agent.type)}
                      <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                        {agent.name}
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.Chip label={agent.status} size="small" sx={{
                backgroundColor: `${getStatusColor(agent.status)}20`,
                color: getStatusColor(agent.status),
                border: `1px solid ${getStatusColor(agent.status)}`
            }}/>
                  </material_1.Box>

                  <material_1.Box display="flex" gap={2} mb={1}>
                    <material_1.Box flex={1}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Intelligence
                      </material_1.Typography>
                      <material_1.LinearProgress variant="determinate" value={agent.intelligence} sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.quantum
                }
            }}/>
                    </material_1.Box>
                    <material_1.Box flex={1}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Efficiency
                      </material_1.Typography>
                      <material_1.LinearProgress variant="determinate" value={agent.efficiency} sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.success}20`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.success
                }
            }}/>
                    </material_1.Box>
                  </material_1.Box>

                  {agent.currentTask && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      📋 {agent.currentTask}
                    </material_1.Typography>)}

                  <framer_motion_1.AnimatePresence>
                    {(selectedAgent === null || selectedAgent === void 0 ? void 0 : selectedAgent.id) === agent.id && (<framer_motion_1.motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 12 }}>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.quantum, fontWeight: 'bold' }}>
                          🎯 Capabilities:
                        </material_1.Typography>
                        <material_1.Box display="flex" flexWrap="wrap" gap={0.5} mt={1} mb={2}>
                          {agent.capabilities.map((capability) => (<material_1.Chip key={capability} label={capability} size="small" sx={{
                        backgroundColor: `${nexusTheme_1.nexusColors.success}15`,
                        color: nexusTheme_1.nexusColors.success,
                        fontSize: '10px'
                    }}/>))}
                        </material_1.Box>

                        {agent.insights.length > 0 && (<>
                            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.quantum, fontWeight: 'bold' }}>
                              💡 Recent Insights:
                            </material_1.Typography>
                            {agent.insights.slice(0, 3).map((insight, index) => (<material_1.Typography key={index} variant="caption" sx={{
                            color: nexusTheme_1.nexusColors.text.secondary,
                            display: 'block',
                            mt: 0.5,
                            fontSize: '11px'
                        }}>
                                • {insight}
                              </material_1.Typography>))}
                          </>)}
                      </framer_motion_1.motion.div>)}
                  </framer_motion_1.AnimatePresence>
                </material_1.CardContent>
              </material_1.Card>
            </framer_motion_1.motion.div>))}
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
// Main Advanced AI System Component
const AdvancedAISystem = ({ agents, onAgentInteraction, onSystemOptimization, showPredictions = true }) => {
    const [systemHealth, setSystemHealth] = (0, react_1.useState)(0);
    const [networkActivity, setNetworkActivity] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        // Calculate system health based on agent metrics
        const avgHealth = agents.reduce((sum, agent) => sum + (agent.intelligence + agent.efficiency + agent.reliability) / 3, 0) / agents.length;
        setSystemHealth(avgHealth);
        // Calculate network activity
        const activeConnections = agents.reduce((sum, agent) => sum + agent.connections.length, 0);
        setNetworkActivity(Math.min(activeConnections * 10, 100));
    }, [agents]);
    return (<material_1.Box sx={{
            width: '100%',
            height: '100vh',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 100%)`,
            position: 'relative',
            overflow: 'hidden'
        }}>
      {/* 3D Canvas */}
      <fiber_1.Canvas camera={{ position: [0, 0, 15], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <ambientLight intensity={0.3}/>
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff"/>
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff"/>

        {/* Environment */}
        <drei_1.Environment preset="night"/>

        {/* AI Agents */}
        {agents.map((agent) => (<AIBrain key={agent.id} agent={agent}/>))}

        {/* Network Connections */}
        <NetworkConnections agents={agents}/>

        {/* Central System Hub */}
        <drei_1.Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} emissive="#ffffff" emissiveIntensity={0.2}/>
        </drei_1.Sphere>

        {/* Post-processing effects */}
        <postprocessing_1.EffectComposer>
          <postprocessing_1.Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300}/>
          <postprocessing_1.ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} radialModulation modulationOffset={0.15}/>
        </postprocessing_1.EffectComposer>

        <drei_1.OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={30}/>
      </fiber_1.Canvas>

      {/* AI Insights Panel */}
      <AIInsightsPanel agents={agents}/>

      {/* System Status */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            zIndex: 10
        }}>
        <material_1.Card sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}40`,
            backdropFilter: 'blur(10px)',
            minWidth: 300
        }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum, mb: 2 }}>
              🌐 System Status
            </material_1.Typography>

            <material_1.Box display="flex" justifyContent="space-between" mb={1}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                System Health
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.success }}>
                {systemHealth.toFixed(1)}%
              </material_1.Typography>
            </material_1.Box>
            <material_1.LinearProgress variant="determinate" value={systemHealth} sx={{
            mb: 2,
            backgroundColor: `${nexusTheme_1.nexusColors.success}20`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.success
            }
        }}/>

            <material_1.Box display="flex" justifyContent="space-between" mb={1}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Network Activity
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
                {networkActivity.toFixed(1)}%
              </material_1.Typography>
            </material_1.Box>
            <material_1.LinearProgress variant="determinate" value={networkActivity} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: nexusTheme_1.nexusColors.quantum
            }
        }}/>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.default = AdvancedAISystem;
