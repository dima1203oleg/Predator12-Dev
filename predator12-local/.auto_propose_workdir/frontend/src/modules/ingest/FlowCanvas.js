"use strict";
// @ts-nocheck
/**
 * 🌊 FLOW CANVAS
 *
 * Data flow visualization (mini version)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
const icons_material_1 = require("@mui/icons-material");
// ============= DATA =============
const flowNodes = [
    {
        id: 'files',
        label: 'Files',
        icon: <icons_material_1.CloudUpload fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.accent.cyan,
        active: true
    },
    {
        id: 'links',
        label: 'Links',
        icon: <icons_material_1.Link fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.accent.green,
        active: true
    },
    {
        id: 'telegram',
        label: 'Telegram',
        icon: <icons_material_1.Telegram fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.accent.purple
    },
    {
        id: 'transform',
        label: 'Transform',
        icon: <icons_material_1.Transform fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.primary.main,
        active: true
    },
    {
        id: 'storage',
        label: 'Storage',
        icon: <icons_material_1.Storage fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.accent.orange,
        active: true
    },
    {
        id: 'opensearch',
        label: 'OpenSearch',
        icon: <icons_material_1.Search fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.accent.yellow,
        active: true
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <icons_material_1.Dashboard fontSize="small"/>,
        color: nexusThemeV2_1.nexusColorsDark.accent.pink,
        active: true
    }
];
const flowEdges = [
    { from: 'files', to: 'transform' },
    { from: 'links', to: 'transform' },
    { from: 'telegram', to: 'transform' },
    { from: 'transform', to: 'storage' },
    { from: 'storage', to: 'opensearch' },
    { from: 'opensearch', to: 'dashboard' }
];
// ============= COMPONENT =============
const FlowCanvas = () => {
    return (<material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusThemeV2_1.nexusColorsDark.background.elevated}, ${nexusThemeV2_1.nexusColorsDark.background.paper})`,
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
            p: 2,
            position: 'relative',
            overflow: 'hidden'
        }}>
      {/* Title */}
      <material_1.Typography variant="caption" sx={{
            color: nexusThemeV2_1.nexusColorsDark.text.secondary,
            mb: 2,
            display: 'block'
        }}>
        📊 Data Flow Pipeline
      </material_1.Typography>

      {/* Flow Visualization */}
      <material_1.Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ position: 'relative' }}>
        {/* Sources */}
        <material_1.Stack spacing={1}>
          {flowNodes.slice(0, 3).map(node => (<framer_motion_1.motion.div key={node.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <material_1.Chip icon={node.icon} label={node.label} size="small" sx={{
                bgcolor: node.active ? `${node.color}30` : `${node.color}10`,
                color: node.color,
                borderColor: node.color,
                border: '1px solid',
                fontWeight: 600,
                position: 'relative',
                '&::after': node.active ? {
                    content: '""',
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: `6px solid ${node.color}`,
                    opacity: 0.6
                } : {}
            }}/>
            </framer_motion_1.motion.div>))}
        </material_1.Stack>

        {/* Arrow */}
        <material_1.Box sx={{
            width: 30,
            height: 2,
            background: nexusThemeV2_1.nexusColorsDark.primary.main,
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderLeft: `6px solid ${nexusThemeV2_1.nexusColorsDark.primary.main}`
            }
        }}/>

        {/* Processing */}
        <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <material_1.Chip icon={flowNodes[3].icon} label={flowNodes[3].label} size="small" sx={{
            bgcolor: `${flowNodes[3].color}30`,
            color: flowNodes[3].color,
            borderColor: flowNodes[3].color,
            border: '1px solid',
            fontWeight: 600,
            px: 2
        }}/>
        </framer_motion_1.motion.div>

        {/* Arrow */}
        <material_1.Box sx={{
            width: 30,
            height: 2,
            background: nexusThemeV2_1.nexusColorsDark.primary.main,
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderLeft: `6px solid ${nexusThemeV2_1.nexusColorsDark.primary.main}`
            }
        }}/>

        {/* Storage & Index */}
        <material_1.Stack spacing={1}>
          {flowNodes.slice(4, 6).map(node => (<framer_motion_1.motion.div key={node.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <material_1.Chip icon={node.icon} label={node.label} size="small" sx={{
                bgcolor: node.active ? `${node.color}30` : `${node.color}10`,
                color: node.color,
                borderColor: node.color,
                border: '1px solid',
                fontWeight: 600
            }}/>
            </framer_motion_1.motion.div>))}
        </material_1.Stack>

        {/* Arrow */}
        <material_1.Box sx={{
            width: 30,
            height: 2,
            background: nexusThemeV2_1.nexusColorsDark.primary.main,
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderLeft: `6px solid ${nexusThemeV2_1.nexusColorsDark.primary.main}`
            }
        }}/>

        {/* Dashboard */}
        <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <material_1.Chip icon={flowNodes[6].icon} label={flowNodes[6].label} size="small" sx={{
            bgcolor: `${flowNodes[6].color}30`,
            color: flowNodes[6].color,
            borderColor: flowNodes[6].color,
            border: '1px solid',
            fontWeight: 600,
            px: 2
        }}/>
        </framer_motion_1.motion.div>
      </material_1.Stack>

      {/* Active indicator */}
      <material_1.Box sx={{ mt: 2, textAlign: 'center' }}>
        <material_1.Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <material_1.Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: nexusThemeV2_1.nexusColorsDark.status.success,
            animation: 'pulse 2s infinite'
        }}/>
          <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
            Pipeline Active • {flowNodes.filter(n => n.active).length} nodes running
          </material_1.Typography>
        </material_1.Stack>
      </material_1.Box>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </material_1.Card>);
};
exports.default = FlowCanvas;
