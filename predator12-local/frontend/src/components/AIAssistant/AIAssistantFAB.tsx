// @ts-nocheck
import React from 'react';
import { Fab, Tooltip, Badge } from '@mui/material';
import { Psychology as AIIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface AIAssistantFABProps {
  onClick: () => void;
  hasNotifications?: boolean;
  isActive?: boolean;
}

export const AIAssistantFAB: React.FC<AIAssistantFABProps> = ({
  onClick,
  hasNotifications = false,
  isActive = false
}) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1300
      }}
    >
      <Tooltip title="Nexus AI Assistant" placement="left">
        <Badge
          badgeContent={hasNotifications ? '!' : 0}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: nexusColors.crimson,
              color: nexusColors.frost,
              animation: hasNotifications ? 'pulse 2s infinite' : 'none'
            }
          }}
        >
          <Fab
            onClick={onClick}
            sx={{
              background: isActive 
                ? `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`
                : `linear-gradient(45deg, ${nexusColors.emerald}80, ${nexusColors.sapphire}80)`,
              color: nexusColors.frost,
              border: `2px solid ${nexusColors.quantum}`,
              boxShadow: `0 0 20px ${nexusColors.emerald}40`,
              '&:hover': {
                background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                boxShadow: `0 0 30px ${nexusColors.emerald}60`,
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <motion.div
              animate={isActive ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AIIcon sx={{ fontSize: 28 }} />
            </motion.div>
          </Fab>
        </Badge>
      </Tooltip>
    </motion.div>
  );
};
