// @ts-nocheck
import React from 'react';
import { Box, Typography } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';

const AdminModule: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: nexusColors.crimson,
      }}
    >
      <Typography variant="h3" sx={{ mb: 2 }}>
        Святилище Архітектора
      </Typography>
      <Typography variant="body1">
        Панель адміністрування у розробці...
      </Typography>
    </Box>
  );
};

export default AdminModule;

