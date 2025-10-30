// @ts-nocheck
import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Switch, FormControlLabel, Chip, Alert } from '@mui/material';
import { OpenInNew, Refresh, Search, FilterList, Analytics } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

const AnalyticsModule: React.FC = () => {
  const [dashboardUrl] = useState('http://localhost:5601');
  const [isConnected, setIsConnected] = useState(true);
  const [searches] = useState([
    {
      id: 'customs-fraud',
      name: 'Пошук шахрайства',
      query: 'customs_fraud_detection',
      lastUsed: '10 хв тому',
      results: 247
    },
    {
      id: 'trade-anomalies',
      name: 'Торговельні аномалії',
      query: 'trade_volume_anomalies',
      lastUsed: '25 хв тому',
      results: 89
    },
    {
      id: 'compliance-check',
      name: 'Перевірка відповідності',
      query: 'compliance_violations',
      lastUsed: '1 год тому',
      results: 156
    }
  ]);

  const [indices] = useState([
    { name: 'customs-declarations', docs: 1234567, size: '2.3 GB', status: 'healthy' },
    { name: 'trade-transactions', docs: 890123, size: '1.8 GB', status: 'healthy' },
    { name: 'osint-data', docs: 456789, size: '980 MB', status: 'warning' },
    { name: 'fraud-patterns', docs: 78901, size: '450 MB', status: 'healthy' }
  ]);

  const handleOpenDashboard = () => {
    window.open(dashboardUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return nexusColors.success;
      case 'warning': return nexusColors.warning;
      case 'error': return nexusColors.error;
      default: return nexusColors.frost;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: nexusColors.frost,
          textAlign: 'center',
          background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🔍 Аналітична Палуба OpenSearch
      </Typography>

      {/* Статус з'єднання */}
      <Alert
        severity={isConnected ? "success" : "error"}
        sx={{
          mb: 3,
          background: isConnected ? `${nexusColors.success}20` : `${nexusColors.error}20`,
          border: `1px solid ${isConnected ? nexusColors.success : nexusColors.error}40`,
          color: nexusColors.frost
        }}
      >
        {isConnected ?
          `✅ З'єднання з OpenSearch активне (${dashboardUrl})` :
          `❌ Немає з'єднання з OpenSearch`
        }
      </Alert>

      <Grid container spacing={3}>
        {/* Швидкий доступ */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
              border: `1px solid ${nexusColors.sapphire}40`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" sx={{ color: nexusColors.frost, mb: 2 }}>
              🚀 Швидкий доступ
            </Typography>

            <Typography variant="body1" sx={{ color: nexusColors.nebula, mb: 3 }}>
              Відкрити повнофункціональну OpenSearch Dashboard для глибокого аналізу даних
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNew />}
              onClick={handleOpenDashboard}
              sx={{
                background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                '&:hover': {
                  background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`
                }
              }}
            >
              Відкрити OpenSearch Dashboard
            </Button>

            <Typography variant="caption" sx={{ color: nexusColors.shadow, display: 'block', mt: 2 }}>
              {dashboardUrl}
            </Typography>
          </Card>
        </Grid>

        {/* Швидкі пошуки */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
              border: `1px solid ${nexusColors.emerald}40`,
              borderRadius: 2,
              p: 2
            }}
          >
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              ⚡ Швидкі пошуки
            </Typography>

            {searches.map((search) => (
              <Box key={search.id} sx={{ mb: 2, p: 1.5, background: `${nexusColors.obsidian}80`, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 600 }}>
                    {search.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${search.results} результатів`}
                    sx={{
                      backgroundColor: `${nexusColors.emerald}20`,
                      color: nexusColors.emerald,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: nexusColors.nebula, display: 'block', mb: 1 }}>
                  Query: {search.query}
                </Typography>
                <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                  Останнє використання: {search.lastUsed}
                </Typography>
              </Box>
            ))}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Search />}
              sx={{
                mt: 1,
                borderColor: nexusColors.emerald,
                color: nexusColors.emerald,
                '&:hover': {
                  borderColor: nexusColors.sapphire,
                  color: nexusColors.sapphire
                }
              }}
            >
              Новий пошук
            </Button>
          </Card>
        </Grid>

        {/* Індекси */}
        <Grid item xs={12}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
              border: `1px solid ${nexusColors.amethyst}40`,
              borderRadius: 2,
              p: 2
            }}
          >
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              📚 Стан індексів
            </Typography>

            <Grid container spacing={2}>
              {indices.map((index) => (
                <Grid item xs={12} sm={6} md={3} key={index.name}>
                  <Box
                    sx={{
                      p: 2,
                      background: `linear-gradient(135deg, ${nexusColors.obsidian}CC, ${nexusColors.darkMatter}80)`,
                      border: `1px solid ${getStatusColor(index.status)}40`,
                      borderRadius: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 15px ${getStatusColor(index.status)}30`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '1rem', mr: 1 }}>
                        {getStatusEmoji(index.status)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 600 }}>
                        {index.name}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: nexusColors.nebula, display: 'block' }}>
                      📄 Документів: {index.docs.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: nexusColors.nebula, display: 'block' }}>
                      💾 Розмір: {index.size}
                    </Typography>

                    <Chip
                      size="small"
                      label={index.status}
                      sx={{
                        mt: 1,
                        backgroundColor: `${getStatusColor(index.status)}20`,
                        color: getStatusColor(index.status),
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        {/* Додаткові дії */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              sx={{
                borderColor: nexusColors.sapphire,
                color: nexusColors.sapphire,
                '&:hover': {
                  borderColor: nexusColors.emerald,
                  color: nexusColors.emerald
                }
              }}
            >
              Створити візуалізацію
            </Button>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{
                borderColor: nexusColors.amethyst,
                color: nexusColors.amethyst,
                '&:hover': {
                  borderColor: nexusColors.sapphire,
                  color: nexusColors.sapphire
                }
              }}
            >
              Налаштувати фільтри
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{
                borderColor: nexusColors.emerald,
                color: nexusColors.emerald,
                '&:hover': {
                  borderColor: nexusColors.warning,
                  color: nexusColors.warning
                }
              }}
            >
              Оновити дані
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsModule;
