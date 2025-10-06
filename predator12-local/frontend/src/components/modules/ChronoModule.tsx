// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { Timeline, TimelineItem, TimelineContent, TimelineSeparator, TimelineDot, TimelineConnector } from '@mui/lab';
import { Timeline as TimelineIcon, TrendingUp, Warning, CheckCircle } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { nexusColors } from '../../theme/nexusTheme';

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  type: 'normal' | 'anomaly' | 'trend' | 'warning';
  value: number;
  description: string;
}

const ChronoModule: React.FC = () => {
  const [timelineData, setTimelineData] = useState([
    { time: '00:00', imports: 120, exports: 95, anomalies: 2 },
    { time: '04:00', imports: 150, exports: 110, anomalies: 1 },
    { time: '08:00', imports: 280, exports: 190, anomalies: 0 },
    { time: '12:00', imports: 340, exports: 250, anomalies: 3 },
    { time: '16:00', imports: 290, exports: 220, anomalies: 1 },
    { time: '20:00', imports: 180, exports: 140, anomalies: 0 },
  ]);

  const [events] = useState<TimelineEvent[]>([
    {
      id: '1',
      timestamp: '2025-09-27 14:30',
      title: 'Аномалія в імпорті',
      type: 'anomaly',
      value: 350,
      description: 'Різкий стрибок імпорту товарів з ЄС на 45%'
    },
    {
      id: '2',
      timestamp: '2025-09-27 12:15',
      title: 'Тренд зростання',
      type: 'trend',
      value: 280,
      description: 'Стабільне зростання експорту протягом 6 годин'
    },
    {
      id: '3',
      timestamp: '2025-09-27 09:45',
      title: 'Нормалізація показників',
      type: 'normal',
      value: 200,
      description: 'Повернення до нормальних значень після ранкового сплеску'
    },
    {
      id: '4',
      timestamp: '2025-09-27 06:20',
      title: 'Попередження системи',
      type: 'warning',
      value: 150,
      description: 'Виявлено підозрілі патерни в декларації товарів'
    }
  ]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <Warning sx={{ color: nexusColors.error }} />;
      case 'trend': return <TrendingUp sx={{ color: nexusColors.success }} />;
      case 'warning': return <Warning sx={{ color: nexusColors.warning }} />;
      default: return <CheckCircle sx={{ color: nexusColors.emerald }} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'anomaly': return nexusColors.error;
      case 'trend': return nexusColors.success;
      case 'warning': return nexusColors.warning;
      default: return nexusColors.emerald;
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
          background: `linear-gradient(45deg, ${nexusColors.amethyst}, ${nexusColors.sapphire})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🕐 Хроно-Аналіз 4D
      </Typography>
      
      <Grid container spacing={3}>
        {/* Головний граф */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
              border: `1px solid ${nexusColors.amethyst}40`,
              borderRadius: 2,
              p: 2
            }}
          >
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              📈 Тренди імпорту/експорту (24 години)
            </Typography>
            
            <Box sx={{ width: '100%', height: 300 }}>
              <LineChart
                width={800}
                height={300}
                series={[
                  {
                    data: timelineData.map(item => item.imports),
                    label: 'Імпорт',
                    color: nexusColors.emerald
                  },
                  {
                    data: timelineData.map(item => item.exports),
                    label: 'Експорт',
                    color: nexusColors.sapphire
                  }
                ]}
                xAxis={[{
                  scaleType: 'point',
                  data: timelineData.map(item => item.time)
                }]}
                sx={{
                  '& .MuiChartsAxis-line': {
                    stroke: nexusColors.nebula
                  },
                  '& .MuiChartsAxis-tick': {
                    stroke: nexusColors.nebula
                  },
                  '& .MuiChartsAxis-tickLabel': {
                    fill: nexusColors.nebula
                  }
                }}
              />
            </Box>
          </Card>
        </Grid>
        
        {/* Таймлайн подій */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
              border: `1px solid ${nexusColors.amethyst}40`,
              borderRadius: 2,
              p: 2,
              height: '360px',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              🎯 Хронологія подій
            </Typography>
            
            <Timeline sx={{ p: 0 }}>
              {events.map((event, index) => (
                <TimelineItem key={event.id}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: 'transparent', p: 0 }}>
                      {getEventIcon(event.type)}
                    </TimelineDot>
                    {index < events.length - 1 && <TimelineConnector sx={{ bgcolor: nexusColors.shadow }} />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.frost, fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                        {event.timestamp}
                      </Typography>
                      <Typography variant="caption" sx={{ color: nexusColors.nebula, display: 'block', mt: 0.5 }}>
                        {event.description}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Значення: ${event.value}`}
                        sx={{
                          mt: 1,
                          backgroundColor: `${getEventColor(event.type)}20`,
                          color: getEventColor(event.type),
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Card>
        </Grid>
        
        {/* Статистика */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(45deg, ${nexusColors.success}20, ${nexusColors.emerald}10)`, border: `1px solid ${nexusColors.success}40`, p: 2 }}>
                <Typography variant="h6" sx={{ color: nexusColors.success }}>
                  📈 Загальний тренд
                </Typography>
                <Typography variant="h4" sx={{ color: nexusColors.frost }}>+12.5%</Typography>
                <Typography variant="caption" sx={{ color: nexusColors.nebula }}>За останні 24 години</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(45deg, ${nexusColors.error}20, ${nexusColors.crimson}10)`, border: `1px solid ${nexusColors.error}40`, p: 2 }}>
                <Typography variant="h6" sx={{ color: nexusColors.error }}>
                  ⚠️ Аномалії
                </Typography>
                <Typography variant="h4" sx={{ color: nexusColors.frost }}>7</Typography>
                <Typography variant="caption" sx={{ color: nexusColors.nebula }}>Виявлено сьогодні</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(45deg, ${nexusColors.sapphire}20, ${nexusColors.amethyst}10)`, border: `1px solid ${nexusColors.sapphire}40`, p: 2 }}>
                <Typography variant="h6" sx={{ color: nexusColors.sapphire }}>
                  🔄 Активність
                </Typography>
                <Typography variant="h4" sx={{ color: nexusColors.frost }}>1.2K</Typography>
                <Typography variant="caption" sx={{ color: nexusColors.nebula }}>Транзакцій/годину</Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(45deg, ${nexusColors.warning}20, ${nexusColors.emerald}10)`, border: `1px solid ${nexusColors.warning}40`, p: 2 }}>
                <Typography variant="h6" sx={{ color: nexusColors.warning }}>
                  🎯 Точність
                </Typography>
                <Typography variant="h4" sx={{ color: nexusColors.frost }}>94.8%</Typography>
                <Typography variant="caption" sx={{ color: nexusColors.nebula }}>Прогнозування</Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChronoModule;
