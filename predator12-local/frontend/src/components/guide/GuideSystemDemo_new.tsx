// @ts-nocheck
import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
import ContextualChat from './ContextualChat';

interface Props {
  currentModule?: 'dashboard' | 'etl' | 'agents' | 'security' | 'analytics' | 'settings';
  systemHealth?: string;
  agentsData?: any[];
}

const GuideSystemDemo: React.FC<Props> = ({
  currentModule = 'dashboard',
  systemHealth = 'optimal',
  agentsData = []
}) => {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', p: 2, background: `linear-gradient(135deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})` }}>
      <Typography variant="h5" sx={{ color: nexusColors.frost, mb: 2 }}>
        Guide System Demo
      </Typography>
      
      {/* Кнопка відкриття чату */}
      {!chatVisible && (
        <IconButton
          onClick={() => setChatVisible(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: `${nexusColors.quantum}80`,
            color: nexusColors.frost,
            '&:hover': {
              backgroundColor: `${nexusColors.quantum}B0`,
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
          aria-label="Відкрити чат гіда"
        >
          <ChatIcon />
        </IconButton>
      )}

      <ContextualChat 
        visible={chatVisible} 
        module={currentModule} 
        systemHealth={systemHealth} 
        agentsData={agentsData}
        onClose={() => setChatVisible(false)}
        closable={true}
      />
    </Box>
  );
};

export default GuideSystemDemo;
