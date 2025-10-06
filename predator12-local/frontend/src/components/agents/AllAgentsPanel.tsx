// @ts-nocheck
import React from 'react';
import { Box } from '@mui/material';
import { InteractiveAgentsGrid } from './InteractiveAgentsGrid';
import { CORE_AGENTS } from './agentsRegistry';

const AllAgentsPanel: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <InteractiveAgentsGrid
        agents={CORE_AGENTS}
        onAgentSelect={() => {}}
      />
    </Box>
  );
};

export default AllAgentsPanel;


