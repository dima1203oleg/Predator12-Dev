// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Button, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusTheme, nexusColors } from './theme/nexusTheme';
import EnhancedProductionDashboard from './components/dashboard/EnhancedProductionDashboard';
import NexusCore from './components/nexus/NexusCore';
import HolographicGuide from './components/guide/HolographicGuide';

const GUIDE_MINI = false;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [holographicGuideVisible, setHolographicGuideVisible] = useState(false);

  return (
    <>
      <ThemeProvider theme={nexusTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${nexusColors.primary.dark} 0%, ${nexusColors.secondary.dark} 50%, ${nexusColors.accent.dark} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', // Додаємо flex для горизонтального layout
          }}
        >
          {/* Кнопки переключення режимів */}
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 1000,
              display: 'flex',
              gap: 2
            }}
          >
            <Button
              variant={currentView === 'dashboard' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('dashboard')}
              sx={{
                background: currentView === 'dashboard'
                  ? `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`
                  : 'transparent',
                border: `1px solid ${nexusColors.accent.main}`,
                color: nexusColors.text.primary,
                '&:hover': {
                  background: `linear-gradient(45deg, ${nexusColors.accent.dark}, ${nexusColors.primary.dark})`,
                }
              }}
            >
              🎮 Дашборд
            </Button>
            <Button
              variant={currentView === 'nexus-core' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('nexus-core')}
              sx={{
                background: currentView === 'nexus-core'
                  ? `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`
                  : 'transparent',
                border: `1px solid ${nexusColors.accent.main}`,
                color: nexusColors.text.primary,
                '&:hover': {
                  background: `linear-gradient(45deg, ${nexusColors.accent.dark}, ${nexusColors.primary.dark})`,
                }
              }}
            >
              🌌 Nexus Core
            </Button>
            <Button
              variant="outlined"
              onClick={() => setHolographicGuideVisible(!holographicGuideVisible)}
              sx={{
                border: `1px solid ${nexusColors.secondary.main}`,
                color: nexusColors.text.secondary,
                '&:hover': {
                  background: nexusColors.secondary.dark,
                }
              }}
            >
              {holographicGuideVisible ? '🤖 Приховати AI' : '🤖 Показати AI'}
            </Button>
          </Box>

          {/* Головний контент */}
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <EnhancedProductionDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="nexus-core"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <NexusCore />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Голографічний гід */}
          {holographicGuideVisible && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'fixed',
                bottom: GUIDE_MINI ? 12 : 20,
                right: GUIDE_MINI ? 12 : 20,
                zIndex: 999,
                width: GUIDE_MINI ? 120 : 'auto',
                height: GUIDE_MINI ? 120 : 'auto'
              }}
            >
              <HolographicGuide />
            </motion.div>
          )}
        </Box>
      </ThemeProvider>
    </>
  );
}

export default App;
