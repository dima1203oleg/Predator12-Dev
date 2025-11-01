/**
 * 🎨 THEME INTEGRATION EXAMPLE
 *
 * Приклад інтеграції системи тем у додаток
 */

import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { NexusThemeProvider, useNexusTheme } from './contexts/ThemeContext';
import ThemeSwitcher from './components/theme/ThemeSwitcher';

// ============= APP WITH THEME =============

const AppContent: React.FC = () => {
  const { currentTheme, setTheme, colors } = useNexusTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.background.default,
        transition: 'all 0.5s ease',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              background: colors.gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            🎨 Predator12 Nexus Core V3
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Multi-Theme System Demo
          </Typography>
        </Box>

        {/* Current Theme Info */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: colors.gradients.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                }}
              >
                {currentTheme.icon}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {currentTheme.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentTheme.description}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Demo Components */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Primary Button */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Primary Button
              </Typography>
              <Button variant="contained" fullWidth>
                Click Me
              </Button>
            </CardContent>
          </Card>

          {/* Secondary Button */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Secondary Button
              </Typography>
              <Button variant="contained" color="secondary" fullWidth>
                Secondary
              </Button>
            </CardContent>
          </Card>

          {/* Outlined Button */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Outlined Button
              </Typography>
              <Button variant="outlined" fullWidth>
                Outlined
              </Button>
            </CardContent>
          </Card>

          {/* Status Colors */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Status Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="contained" color="success">
                  Success
                </Button>
                <Button size="small" variant="contained" color="warning">
                  Warning
                </Button>
                <Button size="small" variant="contained" color="error">
                  Error
                </Button>
                <Button size="small" variant="contained" color="info">
                  Info
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Accent Colors Preview */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Accent Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(colors.accent).map(([name, color]) => (
                <Box key={name} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      background: color,
                      mb: 1,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                    {name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Gradients Preview */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Gradients
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {Object.entries(colors.gradients).map(([name, gradient]) => (
                <Box key={name}>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block', textTransform: 'capitalize' }}>
                    {name}
                  </Typography>
                  <Box
                    sx={{
                      height: 60,
                      borderRadius: 2,
                      background: gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      {name.charAt(0).toUpperCase() + name.slice(1)} Gradient
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Theme Switcher */}
      <ThemeSwitcher
        currentThemeId={currentTheme.id}
        onThemeChange={setTheme}
      />
    </Box>
  );
};

// ============= MAIN APP =============

const App: React.FC = () => {
  return (
    <NexusThemeProvider defaultThemeId="dark-cyber">
      <AppContent />
    </NexusThemeProvider>
  );
};

export default App;
