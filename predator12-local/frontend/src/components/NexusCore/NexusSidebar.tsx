// @ts-nocheck
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Tooltip,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { NexusModule, NexusMenuItem } from './nexusTypes';

interface NexusSidebarProps {
  open: boolean;
  modules: NexusMenuItem[];
  activeModule: NexusModule;
  onModuleSelect: (module: NexusModule) => void;
}

export const NexusSidebar: React.FC<NexusSidebarProps> = ({
  open,
  modules,
  activeModule,
  onModuleSelect
}) => {
  const drawerWidth = open ? 280 : 80;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: `linear-gradient(180deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E6)`,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${nexusColors.quantum}`,
          boxShadow: `4px 0 20px ${nexusColors.quantum}30`,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          mt: 8 // Account for AppBar
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Orbitron',
                color: nexusColors.emerald,
                textShadow: `0 0 10px ${nexusColors.emerald}`,
                mb: 1
              }}
            >
              NEXUS MODULES
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: nexusColors.nebula,
                fontSize: '0.75rem'
              }}
            >
              Galactic Command Interface
            </Typography>
          </motion.div>
        )}
      </Box>

      <Divider sx={{ borderColor: nexusColors.quantum, mx: 1 }} />

      <List sx={{ px: 1, py: 2 }}>
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Tooltip 
              title={open ? '' : `${module.label} - ${module.description}`}
              placement="right"
              arrow
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeModule === module.id}
                  onClick={() => onModuleSelect(module.id)}
                  sx={{
                    borderRadius: '12px',
                    border: activeModule === module.id 
                      ? `2px solid ${module.color}` 
                      : `1px solid ${nexusColors.quantum}40`,
                    background: activeModule === module.id
                      ? `linear-gradient(45deg, ${module.color}20, transparent)`
                      : 'transparent',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${module.color}30, transparent)`,
                      border: `1px solid ${module.color}80`,
                      boxShadow: `0 0 20px ${module.color}40`,
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      boxShadow: `0 0 25px ${module.color}60`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${module.color}30, transparent)`,
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: activeModule === module.id ? module.color : nexusColors.nebula,
                      minWidth: open ? 40 : 'auto',
                      justifyContent: 'center',
                      transition: 'color 0.3s ease',
                      filter: activeModule === module.id 
                        ? `drop-shadow(0 0 8px ${module.color})` 
                        : 'none'
                    }}
                  >
                    {module.icon}
                  </ListItemIcon>
                  
                  {open && (
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'Orbitron',
                            fontWeight: activeModule === module.id ? 600 : 400,
                            color: activeModule === module.id ? module.color : nexusColors.frost,
                            fontSize: '0.85rem',
                            textShadow: activeModule === module.id 
                              ? `0 0 6px ${module.color}80` 
                              : 'none'
                          }}
                        >
                          {module.label}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: nexusColors.shadow,
                            fontSize: '0.7rem',
                            fontFamily: 'Fira Code'
                          }}
                        >
                          {module.description}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </motion.div>
        ))}
      </List>

      {/* Status Panel */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />
        
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: nexusColors.shadow,
                fontFamily: 'Fira Code',
                display: 'block',
                mb: 1
              }}
            >
              SYSTEM STATUS
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: nexusColors.success,
                  boxShadow: `0 0 8px ${nexusColors.success}`,
                  animation: 'pulse 2s infinite'
                }}
              />
              <Typography variant="caption" sx={{ color: nexusColors.nebula, fontSize: '0.7rem' }}>
                All Systems Operational
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: nexusColors.sapphire,
                  boxShadow: `0 0 8px ${nexusColors.sapphire}`,
                  animation: 'pulse 1.5s infinite'
                }}
              />
              <Typography variant="caption" sx={{ color: nexusColors.nebula, fontSize: '0.7rem' }}>
                Neural Network Active
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>
    </Drawer>
  );
};