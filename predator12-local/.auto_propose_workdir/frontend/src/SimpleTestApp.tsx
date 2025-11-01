import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, Card, CardContent, Container } from '@mui/material';
import { Rocket, SmartToy, TrendingUp } from '@mui/icons-material';

// Simple theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FFC6',
    },
    secondary: {
      main: '#A020F0',
    },
    background: {
      default: '#000000',
      paper: '#1A1D2E',
    },
  },
});

// Simple test component
function SimpleTestApp() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #0F121A 50%, #1A1D2E 100%)',
        padding: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{
            color: '#00FFC6',
            mb: 4,
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(0, 255, 198, 0.8)',
          }}
        >
          🚀 Predator Analytics
        </Typography>

        <Typography
          variant="h4"
          align="center"
          sx={{ color: '#A020F0', mb: 6 }}
        >
          Multi-Agent System Dashboard
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Card sx={{ bgcolor: 'rgba(26, 29, 46, 0.8)', border: '1px solid #00FFC6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SmartToy sx={{ fontSize: 40, color: '#00FFC6' }} />
                <Typography variant="h5" sx={{ color: '#fff' }}>
                  26 AI Agents
                </Typography>
              </Box>
              <Typography sx={{ color: '#C5D1E6' }}>
                Multi-Agent System активний та працює
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'rgba(26, 29, 46, 0.8)', border: '1px solid #00FF88' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: '#00FF88' }} />
                <Typography variant="h5" sx={{ color: '#fff' }}>
                  Self-Healing
                </Typography>
              </Box>
              <Typography sx={{ color: '#C5D1E6' }}>
                Автоматичне відновлення активне
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'rgba(26, 29, 46, 0.8)', border: '1px solid #A020F0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rocket sx={{ fontSize: 40, color: '#A020F0' }} />
                <Typography variant="h5" sx={{ color: '#fff' }}>
                  Self-Learning
                </Typography>
              </Box>
              <Typography sx={{ color: '#C5D1E6' }}>
                Continuous learning у процесі
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            mt: 6,
            p: 4,
            bgcolor: 'rgba(26, 29, 46, 0.6)',
            borderRadius: 2,
            border: '2px solid #00FFC6',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ color: '#00FFC6', mb: 2 }}>
            ✅ Веб-інтерфейс працює!
          </Typography>
          <Typography sx={{ color: '#C5D1E6' }}>
            Якщо ви бачите цей текст - React рендериться коректно
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

// Render
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <SimpleTestApp />
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default SimpleTestApp;
