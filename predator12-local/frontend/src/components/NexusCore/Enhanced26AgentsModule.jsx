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
exports.Enhanced26AgentsModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
// 26 Agents Data
const agents = [
    { id: 1, name: 'Chief Orchestrator', type: 'orchestrator', icon: <icons_material_1.Psychology />, color: '#FF6B6B', load: 85 },
    { id: 2, name: 'Data Scientist', type: 'analytics', icon: <icons_material_1.Analytics />, color: '#4ECDC4', load: 72 },
    { id: 3, name: 'ML Engineer', type: 'ml', icon: <icons_material_1.SmartToy />, color: '#45B7D1', load: 68 },
    { id: 4, name: 'Security Analyst', type: 'security', icon: <icons_material_1.Security />, color: '#F39C12', load: 91 },
    { id: 5, name: 'Code Generator', type: 'code', icon: <icons_material_1.Code />, color: '#9B59B6', load: 76 },
    { id: 6, name: 'NLP Processor', type: 'nlp', icon: <icons_material_1.Language />, color: '#E74C3C', load: 83 },
    // ... (abbreviated for space)
];
const Agent3D = ({ agent }) => (<group position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]}>
    <drei_1.Sphere args={[0.3, 16, 16]}>
      <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={0.3}/>
    </drei_1.Sphere>
    <drei_1.Html position={[0, 0.5, 0]} center>
      <div style={{ color: agent.color, fontSize: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', borderRadius: '2px' }}>
        {agent.name}
      </div>
    </drei_1.Html>
  </group>);
const Enhanced26AgentsModule = () => {
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    return (<material_1.Box sx={{ width: '100%', height: '100vh', position: 'relative', background: nexusTheme_1.nexusColors.void }}>
      {/* 3D Visualization */}
      <fiber_1.Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.3}/>
        <pointLight position={[10, 10, 10]} intensity={0.8} color={nexusTheme_1.nexusColors.emerald}/>

        {/* Central Hub */}
        <drei_1.Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color={nexusTheme_1.nexusColors.emerald} wireframe transparent opacity={0.6}/>
        </drei_1.Sphere>

        {/* Agents */}
        {agents.map((agent) => (<Agent3D key={agent.id} agent={agent}/>))}
      </fiber_1.Canvas>

      {/* Control Panel */}
      <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'absolute', top: 20, left: 20, width: 350, zIndex: 10 }}>
        <material_1.Card sx={{ background: 'rgba(10, 15, 26, 0.95)', border: `2px solid ${nexusTheme_1.nexusColors.sapphire}40` }}>
          <material_1.CardContent>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.sapphire, mb: 2 }}>
              🤖 26 AI Agents Hub
            </material_1.Typography>

            <material_1.Grid container spacing={1}>
              {agents.map((agent) => (<material_1.Grid item xs={6} key={agent.id}>
                  <material_1.Card sx={{
                background: `linear-gradient(135deg, ${agent.color}20, ${nexusTheme_1.nexusColors.void}60)`,
                border: `1px solid ${agent.color}40`,
                cursor: 'pointer'
            }} onClick={() => setSelectedAgent(agent.id)}>
                    <material_1.CardContent sx={{ p: 1 }}>
                      <material_1.Box display="flex" alignItems="center" gap={1}>
                        <material_1.Avatar sx={{ width: 24, height: 24, backgroundColor: agent.color }}>
                          {agent.icon}
                        </material_1.Avatar>
                        <material_1.Box>
                          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                            {agent.name}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" sx={{ color: agent.color, display: 'block' }}>
                            {agent.load}%
                          </material_1.Typography>
                        </material_1.Box>
                      </material_1.Box>
                    </material_1.CardContent>
                  </material_1.Card>
                </material_1.Grid>))}
            </material_1.Grid>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.Enhanced26AgentsModule = Enhanced26AgentsModule;
exports.default = exports.Enhanced26AgentsModule;
