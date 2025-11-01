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
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const AdvancedMetricsPanel_1 = require("../components/metrics/AdvancedMetricsPanel");
const nexusTheme_1 = require("../theme/nexusTheme");
const features_1 = require("../config/features");
const Dashboard = () => {
    const [systemStats, setSystemStats] = (0, react_1.useState)({
        agentsActive: 26,
        totalRequests: 47830,
        averageLatency: 89,
        systemHealth: 98
    });
    (0, react_1.useEffect)(() => {
        // Симуляція оновлення статистики
        const interval = setInterval(() => {
            setSystemStats(prev => ({
                agentsActive: prev.agentsActive + Math.floor(Math.random() * 3) - 1,
                totalRequests: prev.totalRequests + Math.floor(Math.random() * 50) + 10,
                averageLatency: Math.max(50, prev.averageLatency + Math.floor(Math.random() * 20) - 10),
                systemHealth: Math.max(80, Math.min(100, prev.systemHealth + Math.floor(Math.random() * 4) - 2))
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    const getHealthColor = (health) => {
        if (health >= 95)
            return nexusTheme_1.nexusColors.success;
        if (health >= 85)
            return nexusTheme_1.nexusColors.warning;
        return nexusTheme_1.nexusColors.error;
    };
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <material_1.Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontFamily: 'Orbitron, monospace'
        }}>
            🚀 Predator Analytics
          </material_1.Typography>
          <material_1.Chip label="LIVE" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.success}, ${nexusTheme_1.nexusColors.emerald})`,
            color: nexusTheme_1.nexusColors.obsidian,
            fontWeight: 600,
            animation: 'pulse 2s infinite'
        }}/>
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Stats Overview */}
      <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
        {[
            { label: 'Активні Агенти', labelEn: 'Active Agents', value: systemStats.agentsActive, unit: '', color: nexusTheme_1.nexusColors.emerald, icon: '🤖' },
            { label: 'Загальні Запити', labelEn: 'Total Requests', value: systemStats.totalRequests.toLocaleString(), unit: '', color: nexusTheme_1.nexusColors.sapphire, icon: '📊' },
            { label: 'Серед. Затримка', labelEn: 'Avg Latency', value: systemStats.averageLatency, unit: 'мс', color: nexusTheme_1.nexusColors.quantum, icon: '⚡' },
            { label: 'Стан Системи', labelEn: 'System Health', value: systemStats.systemHealth, unit: '%', color: getHealthColor(systemStats.systemHealth), icon: '💚' }
        ].map((stat, index) => (<material_1.Grid item xs={12} sm={6} md={3} key={stat.label}>
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -5 }}>
              <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}90, ${nexusTheme_1.nexusColors.darkMatter}80)`,
                border: `2px solid ${stat.color}40`,
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                    borderColor: stat.color + '80',
                    boxShadow: `0 8px 30px ${stat.color}30`
                },
                transition: 'all 0.3s ease'
            }}>
                <material_1.CardContent sx={{ p: 3 }}>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <material_1.Typography variant="h4" sx={{ opacity: 0.8 }}>{stat.icon}</material_1.Typography>
                    <material_1.Typography variant="subtitle1" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 600 }}>
                      {stat.label}
                    </material_1.Typography>
                  </material_1.Box>
                  <material_1.Typography variant="h4" sx={{
                color: stat.color,
                fontWeight: 700,
                textShadow: `0 0 10px ${stat.color}50`
            }}>
                    {stat.value}{stat.unit}
                  </material_1.Typography>
                </material_1.CardContent>

                {/* Glow effect */}
                <material_1.Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                animation: 'glow 3s ease-in-out infinite'
            }}/>
              </material_1.Card>
            </framer_motion_1.motion.div>
          </material_1.Grid>))}
      </material_1.Grid>

      {/* Advanced Metrics Panel */}
      {(0, features_1.isFeatureEnabled)('charts') && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <AdvancedMetricsPanel_1.AdvancedMetricsPanel />
        </framer_motion_1.motion.div>)}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          @keyframes glow {
            0%, 100% { opacity: 0.5; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(100%); }
          }
        `}
      </style>
    </material_1.Box>);
};
exports.default = Dashboard;
