// @ts-nocheck
import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Slider, Chip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { PlayArrow, Stop, Settings, Save, Refresh } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface Scenario {
  id: string;
  name: string;
  description: string;
  status: 'ready' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  lastRun?: string;
  results?: any;
}

const SimulatorModule: React.FC = () => {
  const [scenarios] = useState<Scenario[]>([
    {
      id: 'tariff-impact',
      name: 'Вплив тарифів на торгівлю',
      description: 'Моделювання впливу зміни тарифних ставок на обсяги торгівлі',
      status: 'ready',
      parameters: {
        tariffIncrease: 15,
        affectedCategories: ['Електроніка', 'Текстиль'],
        timeHorizon: 12
      }
    },
    {
      id: 'customs-efficiency',
      name: 'Оптимізація митних процедур',
      description: 'What-if аналіз впливу автоматизації на швидкість оформлення',
      status: 'running',
      parameters: {
        automationLevel: 80,
        staffReduction: 25,
        digitalDocs: true
      },
      lastRun: '15 хв тому'
    },
    {
      id: 'fraud-detection',
      name: 'Покращення виявлення шахрайства',
      description: 'Моделювання ефективності нових алгоритмів детекції',
      status: 'completed',
      parameters: {
        algorithmSensitivity: 75,
        falsePositiveRate: 5,
        trainingData: 'extended'
      },
      lastRun: '2 години тому',
      results: {
        detectionRate: '+23%',
        falsePositives: '-12%',
        processingTime: '-8%'
      }
    }
  ]);

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [parameters, setParameters] = useState({
    economicGrowth: 2.5,
    inflationRate: 8.5,
    currencyVolatility: 15,
    regulatoryChanges: 'moderate',
    timeHorizon: 6
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return nexusColors.emerald;
      case 'running': return nexusColors.warning;
      case 'completed': return nexusColors.success;
      case 'failed': return nexusColors.error;
      default: return nexusColors.frost;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'ready': return '⚡';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❔';
    }
  };

  const handleRunScenario = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    // Тут буде логіка запуску симуляції
    console.log(`Running scenario: ${scenarioId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: nexusColors.frost,
          textAlign: 'center',
          background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.emerald})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🌌 Симулятор Реальностей
      </Typography>

      <Grid container spacing={3}>
        {/* Список сценаріїв */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            {scenarios.map((scenario) => (
              <Grid item xs={12} md={6} key={scenario.id}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                    border: `1px solid ${getStatusColor(scenario.status)}40`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${getStatusColor(scenario.status)}30`
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: nexusColors.frost, flexGrow: 1 }}>
                        {scenario.name}
                      </Typography>
                      <Typography sx={{ fontSize: '1.2rem' }}>
                        {getStatusEmoji(scenario.status)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 2 }}>
                      {scenario.description}
                    </Typography>

                    <Chip
                      size="small"
                      label={scenario.status}
                      sx={{
                        backgroundColor: `${getStatusColor(scenario.status)}20`,
                        color: getStatusColor(scenario.status),
                        mb: 2
                      }}
                    />

                    {scenario.lastRun && (
                      <Typography variant="caption" sx={{ color: nexusColors.shadow, display: 'block', mb: 2 }}>
                        Останній запуск: {scenario.lastRun}
                      </Typography>
                    )}

                    {scenario.results && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: nexusColors.success, fontWeight: 600 }}>
                          Результати:
                        </Typography>
                        {Object.entries(scenario.results).map(([key, value]) => (
                          <Typography key={key} variant="caption" sx={{ color: nexusColors.nebula, display: 'block', ml: 1 }}>
                            • {key}: {String(value)}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={scenario.status === 'running' ? <Stop /> : <PlayArrow />}
                        onClick={() => handleRunScenario(scenario.id)}
                        disabled={scenario.status === 'running'}
                        sx={{
                          background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`
                          }
                        }}
                      >
                        {scenario.status === 'running' ? 'Зупинити' : 'Запустити'}
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Settings />}
                        sx={{
                          borderColor: nexusColors.emerald,
                          color: nexusColors.emerald,
                          '&:hover': {
                            borderColor: nexusColors.sapphire,
                            color: nexusColors.sapphire
                          }
                        }}
                      >
                        Параметри
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Панель параметрів */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
              border: `1px solid ${nexusColors.amethyst}40`,
              borderRadius: 2,
              p: 2
            }}
          >
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 3 }}>
              ⚙️ Глобальні параметри
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                Економічне зростання (%): {parameters.economicGrowth}
              </Typography>
              <Slider
                value={parameters.economicGrowth}
                onChange={(_, value) => setParameters(prev => ({ ...prev, economicGrowth: value as number }))}
                min={-5}
                max={10}
                step={0.1}
                sx={{
                  color: nexusColors.emerald,
                  '& .MuiSlider-thumb': {
                    backgroundColor: nexusColors.emerald
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: nexusColors.emerald
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                Рівень інфляції (%): {parameters.inflationRate}
              </Typography>
              <Slider
                value={parameters.inflationRate}
                onChange={(_, value) => setParameters(prev => ({ ...prev, inflationRate: value as number }))}
                min={0}
                max={20}
                step={0.1}
                sx={{
                  color: nexusColors.warning,
                  '& .MuiSlider-thumb': {
                    backgroundColor: nexusColors.warning
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: nexusColors.warning
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                Волатильність валюти (%): {parameters.currencyVolatility}
              </Typography>
              <Slider
                value={parameters.currencyVolatility}
                onChange={(_, value) => setParameters(prev => ({ ...prev, currencyVolatility: value as number }))}
                min={0}
                max={50}
                step={1}
                sx={{
                  color: nexusColors.error,
                  '& .MuiSlider-thumb': {
                    backgroundColor: nexusColors.error
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: nexusColors.error
                  }
                }}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: nexusColors.nebula }}>Регуляторні зміни</InputLabel>
              <Select
                value={parameters.regulatoryChanges}
                onChange={(e) => setParameters(prev => ({ ...prev, regulatoryChanges: e.target.value }))}
                sx={{
                  color: nexusColors.frost,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: nexusColors.sapphire
                  }
                }}
              >
                <MenuItem value="minimal">Мінімальні</MenuItem>
                <MenuItem value="moderate">Помірні</MenuItem>
                <MenuItem value="significant">Значні</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Часовий горизонт (місяці)"
              value={parameters.timeHorizon}
              onChange={(e) => setParameters(prev => ({ ...prev, timeHorizon: parseInt(e.target.value) }))}
              sx={{
                mb: 3,
                '& .MuiInputLabel-root': { color: nexusColors.nebula },
                '& .MuiInputBase-input': { color: nexusColors.frost },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.sapphire }
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                fullWidth
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`
                  }
                }}
              >
                Зберегти
              </Button>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                sx={{
                  borderColor: nexusColors.amethyst,
                  color: nexusColors.amethyst
                }}
              >
                Скинути
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimulatorModule;
