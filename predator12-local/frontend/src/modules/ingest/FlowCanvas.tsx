// @ts-nocheck
/**
 * 🌊 FLOW CANVAS
 *
 * Data flow visualization (mini version)
 */

import React from 'react';
import { Box, Card, Typography, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';
import {
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Telegram as TelegramIcon,
  Storage as StorageIcon,
  Transform as TransformIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// ============= TYPES =============

interface FlowNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  active?: boolean;
}

interface FlowEdge {
  from: string;
  to: string;
}

// ============= DATA =============

const flowNodes: FlowNode[] = [
  {
    id: 'files',
    label: 'Files',
    icon: <UploadIcon fontSize="small" />,
    color: nexusColors.accent.cyan,
    active: true
  },
  {
    id: 'links',
    label: 'Links',
    icon: <LinkIcon fontSize="small" />,
    color: nexusColors.accent.green,
    active: true
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: <TelegramIcon fontSize="small" />,
    color: nexusColors.accent.purple
  },
  {
    id: 'transform',
    label: 'Transform',
    icon: <TransformIcon fontSize="small" />,
    color: nexusColors.primary.main,
    active: true
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: <StorageIcon fontSize="small" />,
    color: nexusColors.accent.orange,
    active: true
  },
  {
    id: 'opensearch',
    label: 'OpenSearch',
    icon: <SearchIcon fontSize="small" />,
    color: nexusColors.accent.yellow,
    active: true
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon fontSize="small" />,
    color: nexusColors.accent.pink,
    active: true
  }
];

const flowEdges: FlowEdge[] = [
  { from: 'files', to: 'transform' },
  { from: 'links', to: 'transform' },
  { from: 'telegram', to: 'transform' },
  { from: 'transform', to: 'storage' },
  { from: 'storage', to: 'opensearch' },
  { from: 'opensearch', to: 'dashboard' }
];

// ============= COMPONENT =============

const FlowCanvas: React.FC = () => {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${nexusColors.background.elevated}, ${nexusColors.background.paper})`,
      border: `1px solid ${nexusColors.border.light}`,
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Title */}
      <Typography
        variant="caption"
        sx={{
          color: nexusColors.text.secondary,
          mb: 2,
          display: 'block'
        }}
      >
        📊 Data Flow Pipeline
      </Typography>

      {/* Flow Visualization */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ position: 'relative' }}
      >
        {/* Sources */}
        <Stack spacing={1}>
          {flowNodes.slice(0, 3).map(node => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Chip
                icon={node.icon}
                label={node.label}
                size="small"
                sx={{
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
                }}
              />
            </motion.div>
          ))}
        </Stack>

        {/* Arrow */}
        <Box
          sx={{
            width: 30,
            height: 2,
            background: nexusColors.primary.main,
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
              borderLeft: `6px solid ${nexusColors.primary.main}`
            }
          }}
        />

        {/* Processing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Chip
            icon={flowNodes[3].icon}
            label={flowNodes[3].label}
            size="small"
            sx={{
              bgcolor: `${flowNodes[3].color}30`,
              color: flowNodes[3].color,
              borderColor: flowNodes[3].color,
              border: '1px solid',
              fontWeight: 600,
              px: 2
            }}
          />
        </motion.div>

        {/* Arrow */}
        <Box
          sx={{
            width: 30,
            height: 2,
            background: nexusColors.primary.main,
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
              borderLeft: `6px solid ${nexusColors.primary.main}`
            }
          }}
        />

        {/* Storage & Index */}
        <Stack spacing={1}>
          {flowNodes.slice(4, 6).map(node => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Chip
                icon={node.icon}
                label={node.label}
                size="small"
                sx={{
                  bgcolor: node.active ? `${node.color}30` : `${node.color}10`,
                  color: node.color,
                  borderColor: node.color,
                  border: '1px solid',
                  fontWeight: 600
                }}
              />
            </motion.div>
          ))}
        </Stack>

        {/* Arrow */}
        <Box
          sx={{
            width: 30,
            height: 2,
            background: nexusColors.primary.main,
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
              borderLeft: `6px solid ${nexusColors.primary.main}`
            }
          }}
        />

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Chip
            icon={flowNodes[6].icon}
            label={flowNodes[6].label}
            size="small"
            sx={{
              bgcolor: `${flowNodes[6].color}30`,
              color: flowNodes[6].color,
              borderColor: flowNodes[6].color,
              border: '1px solid',
              fontWeight: 600,
              px: 2
            }}
          />
        </motion.div>
      </Stack>

      {/* Active indicator */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: nexusColors.status.success,
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
            Pipeline Active • {flowNodes.filter(n => n.active).length} nodes running
          </Typography>
        </Stack>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </Card>
  );
};

export default FlowCanvas;
