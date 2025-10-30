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
const postprocessing_2 = require("postprocessing");
const framer_motion_1 = require("framer-motion");
const THREE = __importStar(require("three"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
// 3D Threat Visualization
const ThreatVisualization = ({ threat, onSelect }) => {
    const threatRef = (0, react_1.useRef)(null);
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    (0, fiber_1.useFrame)(({ clock }) => {
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
            }
            else if (threat.type === 'intrusion') {
                threatRef.current.rotation.y = time;
                threatRef.current.rotation.z = Math.cos(time * 0.5) * 0.2;
            }
            else {
                threatRef.current.rotation.x = time * 0.5;
                threatRef.current.rotation.y = time * 0.8;
            }
            // Іридесценція effect - shimmer
            const shimmer = Math.abs(Math.sin(time * 3 + Math.random()));
            if (threatRef.current.children[0]) {
                const mesh = threatRef.current.children[0];
                const mat = mesh.material;
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
                return (<drei_1.Sphere args={[threat.size, 16, 16]}>
            <meshStandardMaterial color={getThreatColor()} transparent opacity={0.8} emissive={getThreatColor()} emissiveIntensity={0.5}/>
          </drei_1.Sphere>);
            case 'intrusion':
                return (<drei_1.Cone args={[threat.size, threat.size * 2, 8]}>
            <meshStandardMaterial color={getThreatColor()} transparent opacity={0.8} emissive={getThreatColor()} emissiveIntensity={0.5}/>
          </drei_1.Cone>);
            case 'ddos':
                return (<drei_1.Box args={[threat.size, threat.size, threat.size]}>
            <meshStandardMaterial color={getThreatColor()} transparent opacity={0.8} emissive={getThreatColor()} emissiveIntensity={0.5} wireframe/>
          </drei_1.Box>);
            default:
                return (<drei_1.Cylinder args={[threat.size, threat.size, threat.size * 2, 8]}>
            <meshStandardMaterial color={getThreatColor()} transparent opacity={0.8} emissive={getThreatColor()} emissiveIntensity={0.5}/>
          </drei_1.Cylinder>);
        }
    };
    return (<group ref={threatRef} position={threat.position} onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => setIsHovered(false)} onClick={() => onSelect === null || onSelect === void 0 ? void 0 : onSelect(threat.id)}>
      {getThreatShape()}

      {/* Threat aura based on impact */}
      <drei_1.Sphere args={[threat.size * 2, 16, 16]}>
        <meshStandardMaterial color={getThreatColor()} transparent opacity={threat.impact / 200} emissive={getThreatColor()} emissiveIntensity={0.1}/>
      </drei_1.Sphere>

      {/* Sparkles for active threats */}
      {threat.status === 'active' && (<drei_1.Sparkles count={10} scale={threat.size * 3} size={2} speed={0.8} color={getThreatColor()}/>)}

      {/* Threat label */}
      <drei_1.Html position={[0, threat.size + 0.5, 0]} center>
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
      </drei_1.Html>
    </group>);
};
// Security Shield Visualization
const SecurityShield = ({ strength, activeThreats }) => {
    const shieldRef = (0, react_1.useRef)(null);
    (0, fiber_1.useFrame)(({ clock }) => {
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
        if (strength > 80)
            return '#00ff88';
        if (strength > 60)
            return '#ffaa00';
        if (strength > 40)
            return '#ff6600';
        return '#ff4444';
    };
    return (<group ref={shieldRef} position={[0, 0, 0]}>
      {/* Main shield dome */}
      <drei_1.Sphere args={[8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}>
        <meshStandardMaterial color={getShieldColor()} transparent opacity={0.3} emissive={getShieldColor()} emissiveIntensity={0.2} side={THREE.DoubleSide}/>
      </drei_1.Sphere>

      {/* Shield grid pattern */}
      {Array.from({ length: 16 }).map((_, i) => (<group key={i} rotation={[0, (i / 16) * Math.PI * 2, 0]}>
          <drei_1.Cylinder args={[8, 8, 0.05, 32, 1, true]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={getShieldColor()} transparent opacity={0.5} emissive={getShieldColor()} emissiveIntensity={0.1}/>
          </drei_1.Cylinder>
        </group>))}

      {/* Shield core */}
      <drei_1.Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial color={getShieldColor()} emissive={getShieldColor()} emissiveIntensity={0.8}/>
      </drei_1.Sphere>
    </group>);
};
// Threat Intelligence Panel
const ThreatIntelligencePanel = ({ threats, onThreatAction }) => {
    const [selectedSeverity, setSelectedSeverity] = (0, react_1.useState)('all');
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return nexusTheme_1.nexusColors.error;
            case 'high': return '#ff6600';
            case 'medium': return nexusTheme_1.nexusColors.warning;
            case 'low': return '#ffff00';
            default: return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <icons_material_1.Warning sx={{ color: nexusTheme_1.nexusColors.error }}/>;
            case 'contained': return <icons_material_1.Block sx={{ color: nexusTheme_1.nexusColors.warning }}/>;
            case 'neutralized': return <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.success }}/>;
            case 'investigating': return <icons_material_1.Visibility sx={{ color: nexusTheme_1.nexusColors.info }}/>;
            default: return <icons_material_1.Error />;
        }
    };
    const filteredThreats = selectedSeverity === 'all'
        ? threats
        : threats.filter(t => t.severity === selectedSeverity);
    const activeThreatCount = threats.filter(t => t.status === 'active').length;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{
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
            border: `2px solid ${nexusTheme_1.nexusColors.error}40`,
            backdropFilter: 'blur(10px)',
            color: nexusTheme_1.nexusColors.frost
        }}>
        <material_1.CardContent>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.error }}>
              🛡️ Threat Intelligence
            </material_1.Typography>
            <material_1.Badge badgeContent={activeThreatCount} color="error">
              <icons_material_1.Security sx={{ color: nexusTheme_1.nexusColors.error }}/>
            </material_1.Badge>
          </material_1.Box>

          {/* Severity filter */}
          <material_1.Box display="flex" gap={1} mb={2} flexWrap="wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (<material_1.Chip key={severity} label={severity} size="small" onClick={() => setSelectedSeverity(severity)} sx={{
                backgroundColor: selectedSeverity === severity
                    ? `${getSeverityColor(severity)}30`
                    : 'transparent',
                color: selectedSeverity === severity
                    ? getSeverityColor(severity)
                    : nexusTheme_1.nexusColors.text.secondary,
                border: `1px solid ${getSeverityColor(severity)}40`,
                '&:hover': {
                    backgroundColor: `${getSeverityColor(severity)}20`
                }
            }}/>))}
          </material_1.Box>

          {/* Active threat alert */}
          {activeThreatCount > 0 && (<material_1.Alert severity="error" sx={{
                mb: 2,
                backgroundColor: `${nexusTheme_1.nexusColors.error}20`,
                border: `1px solid ${nexusTheme_1.nexusColors.error}`,
                '& .MuiAlert-icon': { color: nexusTheme_1.nexusColors.error }
            }}>
              <material_1.AlertTitle>Active Threats Detected</material_1.AlertTitle>
              {activeThreatCount} active threat{activeThreatCount > 1 ? 's' : ''} requiring immediate attention
            </material_1.Alert>)}

          {/* Threats list */}
          <material_1.List dense>
            {filteredThreats.map((threat) => (<framer_motion_1.motion.div key={threat.id} whileHover={{ scale: 1.02 }} style={{ marginBottom: 8 }}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}80, ${nexusTheme_1.nexusColors.void}60)`,
                border: `1px solid ${getSeverityColor(threat.severity)}40`,
                transition: 'all 0.3s ease'
            }}>
                  <material_1.CardContent sx={{ p: 2 }}>
                    <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <material_1.Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(threat.status)}
                        <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                          {threat.name}
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.Chip label={threat.severity} size="small" sx={{
                backgroundColor: `${getSeverityColor(threat.severity)}20`,
                color: getSeverityColor(threat.severity),
                border: `1px solid ${getSeverityColor(threat.severity)}`
            }}/>
                    </material_1.Box>

                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary, display: 'block', mb: 1 }}>
                      {threat.details}
                    </material_1.Typography>

                    <material_1.Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        Confidence: {threat.confidence}% • Impact: {threat.impact}%
                      </material_1.Typography>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                        {threat.source} → {threat.target}
                      </material_1.Typography>
                    </material_1.Box>

                    {threat.status === 'active' && (<material_1.Box display="flex" gap={1} mt={1}>
                        <material_1.IconButton size="small" onClick={() => onThreatAction === null || onThreatAction === void 0 ? void 0 : onThreatAction(threat.id, 'investigate')} sx={{ color: nexusTheme_1.nexusColors.info }}>
                          <icons_material_1.Visibility fontSize="small"/>
                        </material_1.IconButton>
                        <material_1.IconButton size="small" onClick={() => onThreatAction === null || onThreatAction === void 0 ? void 0 : onThreatAction(threat.id, 'contain')} sx={{ color: nexusTheme_1.nexusColors.warning }}>
                          <icons_material_1.Block fontSize="small"/>
                        </material_1.IconButton>
                        <material_1.IconButton size="small" onClick={() => onThreatAction === null || onThreatAction === void 0 ? void 0 : onThreatAction(threat.id, 'neutralize')} sx={{ color: nexusTheme_1.nexusColors.error }}>
                          <icons_material_1.Shield fontSize="small"/>
                        </material_1.IconButton>
                      </material_1.Box>)}
                  </material_1.CardContent>
                </material_1.Card>
              </framer_motion_1.motion.div>))}
          </material_1.List>
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
// Security Metrics Dashboard
const SecurityMetricsDashboard = ({ metrics, onMetricAlert }) => {
    const getMetricIcon = (category) => {
        switch (category) {
            case 'firewall': return <icons_material_1.Shield />;
            case 'intrusion': return <icons_material_1.Security />;
            case 'antivirus': return <icons_material_1.BugReport />;
            case 'network': return <icons_material_1.NetworkCheck />;
            case 'access': return <icons_material_1.Lock />;
            default: return <icons_material_1.Security />;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'safe': return nexusTheme_1.nexusColors.success;
            case 'warning': return nexusTheme_1.nexusColors.warning;
            case 'danger': return nexusTheme_1.nexusColors.error;
            default: return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 500,
            zIndex: 10
        }}>
      <material_1.Card sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${nexusTheme_1.nexusColors.success}40`,
            backdropFilter: 'blur(10px)',
            color: nexusTheme_1.nexusColors.frost
        }}>
        <material_1.CardContent>
          <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.success }}>
              📊 Security Metrics
            </material_1.Typography>
            <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.success }}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Box>

          <material_1.Grid container spacing={2}>
            {metrics.map((metric) => (<material_1.Grid item xs={6} key={metric.id}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}80, ${nexusTheme_1.nexusColors.void}60)`,
                border: `1px solid ${getStatusColor(metric.status)}40`,
                height: '100%'
            }}>
                  <material_1.CardContent sx={{ p: 2 }}>
                    <material_1.Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getMetricIcon(metric.category)}
                      <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                        {metric.name}
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Typography variant="h6" sx={{ color: getStatusColor(metric.status), mb: 1 }}>
                      {metric.value.toFixed(1)}{metric.unit}
                    </material_1.Typography>

                    <material_1.LinearProgress variant="determinate" value={(metric.value / metric.threshold) * 100} sx={{
                backgroundColor: `${getStatusColor(metric.status)}20`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(metric.status)
                }
            }}/>
                  </material_1.CardContent>
                </material_1.Card>
              </material_1.Grid>))}
          </material_1.Grid>
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
// Main Cyber Security Monitor Component
const CyberSecurityMonitor = ({ threats, metrics, onThreatAction, onMetricAlert, realTimeScanning = true, autoResponse = false }) => {
    const [selectedThreat, setSelectedThreat] = (0, react_1.useState)(null);
    const [shieldStrength, setShieldStrength] = (0, react_1.useState)(85);
    const [scanningActive, setScanningActive] = (0, react_1.useState)(realTimeScanning);
    const chromaOffset = new THREE.Vector2(0.002, 0.002);
    const activeThreatCount = threats.filter(t => t.status === 'active').length;
    const criticalThreatCount = threats.filter(t => t.severity === 'critical').length;
    (0, react_1.useEffect)(() => {
        // Calculate shield strength based on metrics and threats
        const avgMetricStatus = metrics.reduce((sum, metric) => {
            return sum + (metric.status === 'safe' ? 100 : metric.status === 'warning' ? 60 : 20);
        }, 0) / metrics.length;
        const threatImpact = Math.max(0, 100 - (activeThreatCount * 15));
        setShieldStrength(Math.min(avgMetricStatus, threatImpact));
    }, [metrics, activeThreatCount]);
    const handleThreatSelect = (threatId) => {
        setSelectedThreat(threatId);
    };
    return (<material_1.Box sx={{
            width: '100%',
            height: '100vh',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 100%)`,
            position: 'relative',
            overflow: 'hidden'
        }}>
      {/* 3D Canvas */}
      <fiber_1.Canvas camera={{ position: [0, 5, 25], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <ambientLight intensity={0.2}/>
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff4444"/>
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88"/>

        <drei_1.Environment preset="night"/>

        {/* Security Shield */}
        <SecurityShield strength={shieldStrength} activeThreats={activeThreatCount}/>

        {/* Threat Visualizations */}
        {threats.map((threat) => (<ThreatVisualization key={threat.id} threat={threat} onSelect={handleThreatSelect}/>))}

        {/* Post-processing effects - ENHANCED */}
        <postprocessing_1.EffectComposer multisampling={8}>
          <postprocessing_1.Bloom luminanceThreshold={0.2} luminanceSmoothing={0.95} height={400} intensity={1.5} radius={0.85}/>
          <postprocessing_1.ChromaticAberration offset={chromaOffset} radialModulation modulationOffset={0.3}/>
          <postprocessing_1.Glitch active={criticalThreatCount > 0} delay={new THREE.Vector2(1.5, 3.5)} duration={new THREE.Vector2(0.6, 1.0)} strength={new THREE.Vector2(0.3, 1.0)} mode={1}/>
          <postprocessing_1.DotScreen blendFunction={postprocessing_2.BlendFunction.OVERLAY} scale={0.8} angle={Math.PI * 0.5}/>
          <postprocessing_1.Vignette offset={0.3} darkness={0.5} eskil={false} blendFunction={postprocessing_2.BlendFunction.NORMAL}/>
          <postprocessing_1.Noise opacity={0.02} blendFunction={postprocessing_2.BlendFunction.OVERLAY}/>
        </postprocessing_1.EffectComposer>
      </fiber_1.Canvas>

      {/* Threat Intelligence Panel */}
      <ThreatIntelligencePanel threats={threats} onThreatAction={onThreatAction}/>

      {/* Security Metrics Dashboard */}
      <SecurityMetricsDashboard metrics={metrics} onMetricAlert={onMetricAlert}/>

      {/* System Status */}
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10
        }}>
        <material_1.Card sx={{
            background: 'rgba(10, 15, 26, 0.95)',
            border: `2px solid ${shieldStrength > 80 ? nexusTheme_1.nexusColors.success :
                shieldStrength > 60 ? nexusTheme_1.nexusColors.warning :
                    nexusTheme_1.nexusColors.error}40`,
            backdropFilter: 'blur(10px)',
            minWidth: 250
        }}>
          <material_1.CardContent sx={{ textAlign: 'center' }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum, mb: 1 }}>
              🛡️ Security Status
            </material_1.Typography>

            <material_1.Typography variant="h4" sx={{
            color: shieldStrength > 80 ? nexusTheme_1.nexusColors.success :
                shieldStrength > 60 ? nexusTheme_1.nexusColors.warning :
                    nexusTheme_1.nexusColors.error,
            mb: 1
        }}>
              {shieldStrength.toFixed(0)}%
            </material_1.Typography>

            <material_1.LinearProgress variant="determinate" value={shieldStrength} sx={{
            mb: 2,
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: shieldStrength > 80 ? nexusTheme_1.nexusColors.success :
                    shieldStrength > 60 ? nexusTheme_1.nexusColors.warning :
                        nexusTheme_1.nexusColors.error
            }
        }}/>

            <material_1.Box display="flex" justifyContent="space-between" mb={1}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Active Threats
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.error }}>
                {activeThreatCount}
              </material_1.Typography>
            </material_1.Box>

            <material_1.Box display="flex" justifyContent="space-between">
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                Shield Strength
              </material_1.Typography>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.success }}>
                {shieldStrength > 80 ? 'Strong' : shieldStrength > 60 ? 'Moderate' : 'Weak'}
              </material_1.Typography>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.default = CyberSecurityMonitor;
