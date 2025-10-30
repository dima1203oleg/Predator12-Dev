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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../theme/nexusTheme");
const features_1 = require("../config/features");
const CyberSecurityMonitor_1 = __importDefault(require("../components/modules/CyberSecurityMonitor"));
const SecurityPage = () => {
    const [view3D, setView3D] = (0, react_1.useState)(false);
    // Mock data for security threats and metrics
    const [threats] = (0, react_1.useState)([
        {
            id: 'threat-1',
            name: 'Intrusion Attempt',
            type: 'intrusion',
            severity: 'high',
            status: 'active',
            position: [0, 0, 0],
            size: 1,
            detected: new Date(),
            source: '192.168.1.100',
            target: 'web-server-01',
            confidence: 95,
            impact: 80,
            details: 'Suspicious login attempts detected'
        },
        {
            id: 'threat-2',
            name: 'DDoS Attack',
            type: 'ddos',
            severity: 'medium',
            status: 'contained',
            position: [1, 0, 0],
            size: 0.8,
            detected: new Date(Date.now() - 300000),
            source: 'external',
            target: 'api-gateway',
            confidence: 88,
            impact: 60,
            details: 'DDoS attack mitigated'
        }
    ]);
    const [metrics] = (0, react_1.useState)([
        {
            id: 'metric-1',
            name: 'Firewall Status',
            value: 98,
            threshold: 95,
            unit: '%',
            status: 'safe',
            category: 'firewall',
            history: [95, 96, 97, 98],
            lastUpdate: new Date()
        },
        {
            id: 'metric-2',
            name: 'Intrusion Detection',
            value: 92,
            threshold: 85,
            unit: '%',
            status: 'safe',
            category: 'intrusion',
            history: [88, 89, 90, 92],
            lastUpdate: new Date()
        }
    ]);
    const handleThreatAction = (threatId, action) => {
        console.log(`Threat ${threatId}: ${action}`);
    };
    const handleMetricAlert = (metric) => {
        console.log(`Alert for metric: ${metric.name}`);
    };
    if (view3D && (0, features_1.isFeatureEnabled)('threeDee')) {
        return (<material_1.Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <CyberSecurityMonitor_1.default threats={threats} metrics={metrics} onThreatAction={handleThreatAction} onMetricAlert={handleMetricAlert} realTimeScanning={true} autoResponse={false}/>

        <material_1.Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <material_1.Tooltip title="Повернутися до 2D виду">
            <material_1.IconButton onClick={() => setView3D(false)} sx={{
                background: `${nexusTheme_1.nexusColors.obsidian}90`,
                color: nexusTheme_1.nexusColors.frost,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`
            }}>
              <icons_material_1.GridView />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Box>);
    }
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <material_1.Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.nebula}, ${nexusTheme_1.nexusColors.quantum})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontFamily: 'Orbitron, monospace'
        }}>
              🛡️ Кібер-Безпека
            </material_1.Typography>
            <material_1.Chip label={`${threats.filter(t => t.status === 'active').length} АКТИВНІ ЗАГРОЗИ`} sx={{
            background: threats.some(t => t.severity === 'critical')
                ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.error}, ${nexusTheme_1.nexusColors.nebula})`
                : threats.some(t => t.severity === 'high')
                    ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.warning}, ${nexusTheme_1.nexusColors.quantum})`
                    : `linear-gradient(45deg, ${nexusTheme_1.nexusColors.success}, ${nexusTheme_1.nexusColors.emerald})`,
            color: nexusTheme_1.nexusColors.obsidian,
            fontWeight: 600
        }}/>
          </material_1.Box>

          {(0, features_1.isFeatureEnabled)('threeDee') && (<material_1.Tooltip title="3D Візуалізація Загроз">
              <material_1.IconButton onClick={() => setView3D(true)} sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.nebula}, ${nexusTheme_1.nexusColors.quantum})`,
                color: nexusTheme_1.nexusColors.frost,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.nebula})`,
                    transform: 'scale(1.1)'
                }
            }}>
                <icons_material_1.ViewInAr />
              </material_1.IconButton>
            </material_1.Tooltip>)}
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Security Overview Cards */}
      <material_1.Box sx={{ mb: 4 }}>
        <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 3, fontWeight: 600 }}>
          🚨 Системна Безпека в Реальному Часі
        </material_1.Typography>

        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <material_1.Box sx={{
            p: 4,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}95, ${nexusTheme_1.nexusColors.darkMatter}85)`,
            border: `2px solid ${nexusTheme_1.nexusColors.nebula}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              🔍 Кібер-загрози детектовані та відслідковуються в реальному часі
            </material_1.Typography>

            <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 3 }}>
              Predator Security використовує найсучасніші алгоритми машинного навчання для
              виявлення та аналізу загроз безпеки. 3D візуалізація дозволяє бачити атаки в
              реальному часі та приймати швидкі рішення.
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[
            { label: 'Firewall Active', status: 'operational', color: nexusTheme_1.nexusColors.success },
            { label: 'IDS/IPS Running', status: 'monitoring', color: nexusTheme_1.nexusColors.sapphire },
            { label: 'Threat Intelligence', status: 'updated', color: nexusTheme_1.nexusColors.emerald },
            { label: 'AI Protection', status: 'learning', color: nexusTheme_1.nexusColors.quantum }
        ].map(item => (<material_1.Chip key={item.label} label={`${item.label}: ${item.status.toUpperCase()}`} sx={{
                background: `${item.color}20`,
                color: item.color,
                border: `1px solid ${item.color}40`,
                fontWeight: 600
            }}/>))}
            </material_1.Box>

            {/* Animated security scan line */}
            <material_1.Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${nexusTheme_1.nexusColors.nebula}, transparent)`,
            animation: 'scan 4s ease-in-out infinite'
        }}/>
          </material_1.Box>
        </framer_motion_1.motion.div>
      </material_1.Box>

      {/* Call to action for 3D view */}
      {(0, features_1.isFeatureEnabled)('threeDee') && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} whileHover={{ scale: 1.02 }}>
          <material_1.Box onClick={() => setView3D(true)} sx={{
                p: 3,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.nebula}20, ${nexusTheme_1.nexusColors.quantum}20)`,
                border: `2px solid ${nexusTheme_1.nexusColors.nebula}60`,
                borderRadius: 3,
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    borderColor: nexusTheme_1.nexusColors.nebula,
                    boxShadow: `0 8px 30px ${nexusTheme_1.nexusColors.nebula}40`
                },
                transition: 'all 0.3s ease'
            }}>
            <icons_material_1.Security sx={{ fontSize: 48, color: nexusTheme_1.nexusColors.nebula, mb: 2 }}/>
            <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1, fontWeight: 600 }}>
              🌐 Активувати 3D Cyber Monitor
            </material_1.Typography>
            <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
              Перегляньте загрози безпеки в інтерактивному 3D просторі з голографічними ефектами
            </material_1.Typography>

            {/* Hover glow effect */}
            <material_1.Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${nexusTheme_1.nexusColors.nebula}30, transparent)`,
                borderRadius: '50%',
                animation: 'pulse-glow 3s ease-in-out infinite',
                zIndex: 0
            }}/>
          </material_1.Box>
        </framer_motion_1.motion.div>)}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes scan {
            0%, 100% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(100%); }
          }

          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
          }
        `}
      </style>
    </material_1.Box>);
};
exports.default = SecurityPage;
