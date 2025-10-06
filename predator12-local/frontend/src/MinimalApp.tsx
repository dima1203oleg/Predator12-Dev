import React, { Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { nexusTheme } from './theme/nexusTheme';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import DataOps from './pages/DataOps';
import Security from './pages/Security';
import { NexusVisualEffects } from './components/effects/NexusVisualEffects';

const loaderBackground: string = [
  'radial-gradient(circle at top, rgba(10, 255, 200, 0.08), transparent 60%)',
  'radial-gradient(circle at bottom, rgba(10, 117, 255, 0.12), transparent 55%)',
  '#010409'
].join(', ');

const LoaderOverlay = () => (
  <Box
    sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: loaderBackground
    }}
  >
    <CircularProgress sx={{ color: '#38bdf8' }} size={48} thickness={4} />
    <Typography variant="subtitle1" sx={{ color: '#93c5fd', mt: 3 }}>
      Ініціалізація Predator Nexus UI...
    </Typography>
  </Box>
);

const NotFoundPage = () => (
  <Box sx={{ p: 6, textAlign: 'center' }}>
    <Typography variant="h2" sx={{ color: '#fca5a5', fontWeight: 700 }}>
      404
    </Typography>
    <Typography variant="h5" sx={{ color: '#bfdbfe', mt: 2 }}>
      Розділ у розробці. Повернімося на головну панель.
    </Typography>
  </Box>
);

const MinimalApp: React.FC = () => {
  return (
    <ThemeProvider theme={nexusTheme}>
      <CssBaseline />
      
      {/* Nexus Visual Effects */}
      <NexusVisualEffects 
        showCosmicDust={true}
        showHolographicFrames={true}
        showScanLines={true}
      />
      <BrowserRouter>
        <Suspense fallback={<LoaderOverlay />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="agents" element={<Agents />} />
              <Route path="dataops" element={<DataOps />} />
              <Route path="security" element={<Security />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default MinimalApp;
