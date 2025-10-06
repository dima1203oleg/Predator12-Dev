import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, LinearProgress, IconButton, Tooltip, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, 
  DataObject,
  Analytics,
  Transform,
  Storage,
  PlayArrow,
  Pause,
  Refresh,
  Download,
  CheckCircle,
  Error,
  AccessTime
} from '@mui/icons-material';
import { nexusColors } from '../theme/nexusTheme';
import { isFeatureEnabled } from '../config/features';
// import DataPipelineFlow from '../components/data/DataPipelineFlow';
import RealtimeAnalyticsEngine from '../components/modules/RealtimeAnalyticsEngine';

interface Pipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  dataProcessed: number;
  totalData: number;
  estimatedTime: number;
  lastRun: Date;
}

interface DataStream {
  id: string;
  name: string;
  type: 'metrics' | 'logs' | 'events' | 'predictions' | 'anomalies';
  position: [number, number, number];
  velocity: [number, number, number];
  intensity: number;
  frequency: number;
  dataPoints: number[];
  status: 'normal' | 'warning' | 'critical';
  source: string;
  destination: string;
  latency: number;
  throughput: number;
  errors: number;
}

const DataOps: React.FC = () => {
  const [viewAnalytics, setViewAnalytics] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: 'pipeline-1',
      name: 'User Behavior ETL',
      status: 'running',
      progress: 78,
      dataProcessed: 1540000,
      totalData: 2000000,
      estimatedTime: 15,
      lastRun: new Date()
    },
    {
      id: 'pipeline-2',
      name: 'Security Logs Processing',
      status: 'completed',
      progress: 100,
      dataProcessed: 850000,
      totalData: 850000,
      estimatedTime: 0,
      lastRun: new Date(Date.now() - 300000)
    },
    {
      id: 'pipeline-3',
      name: 'ML Model Training Data',
      status: 'paused',
      progress: 45,
      dataProcessed: 675000,
      totalData: 1500000,
      estimatedTime: 25,
      lastRun: new Date(Date.now() - 600000)
    }
  ]);

  const [dataStreams] = useState<DataStream[]>([
    {
      id: 'stream-1',
      name: 'Real-time Events',
      type: 'events',
      position: [-3, 2, 1],
      velocity: [0.1, 0, 0.05],
      intensity: 0.8,
      frequency: 2.5,
      dataPoints: Array.from({ length: 50 }, () => Math.random() * 100),
      status: 'normal',
      source: 'event-collector',
      destination: 'data-lake',
      latency: 45,
      throughput: 1250.5,
      errors: 0
    },
    {
      id: 'stream-2',
      name: 'Metrics Stream',
      type: 'metrics',
      position: [3, -2, 0],
      velocity: [-0.1, 0.05, 0],
      intensity: 0.6,
      frequency: 1.8,
      dataPoints: Array.from({ length: 50 }, () => Math.random() * 100),
      status: 'normal',
      source: 'metrics-collector',
      destination: 'analytics-engine',
      latency: 32,
      throughput: 890.2,
      errors: 2
    }
  ]);

  useEffect(() => {
    // Симуляція оновлення прогресу пайплайнів
    const interval = setInterval(() => {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.status === 'running' && pipeline.progress < 100) {
          const newProgress = Math.min(100, pipeline.progress + Math.random() * 3);
          const newProcessed = (newProgress / 100) * pipeline.totalData;
          return {
            ...pipeline,
            progress: newProgress,
            dataProcessed: newProcessed,
            estimatedTime: Math.max(0, pipeline.estimatedTime - 1)
          };
        }
        return pipeline;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Pipeline['status']) => {
    switch (status) {
      case 'running': return nexusColors.sapphire;
      case 'completed': return nexusColors.success;
      case 'failed': return nexusColors.error;
      case 'paused': return nexusColors.warning;
      default: return nexusColors.shadow;
    }
  };

  const getStatusIcon = (status: Pipeline['status']) => {
    switch (status) {
      case 'running': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'failed': return <Error />;
      case 'paused': return <Pause />;
      default: return <AccessTime />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (viewAnalytics && isFeatureEnabled('threeDee')) {
    return (
      <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <RealtimeAnalyticsEngine
          dataStreams={dataStreams}
          metrics={[]}
          showPredictions={true}
        />
        
        <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Tooltip title="Повернутися до DataOps">
            <IconButton 
              onClick={() => setViewAnalytics(false)}
              sx={{ 
                background: `${nexusColors.obsidian}90`,
                color: nexusColors.frost,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.quantum}40`
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace'
              }}
            >
              📊 Контроль Даних
            </Typography>
            <Chip
              label={`${pipelines.filter(p => p.status === 'running').length} ПАЙПЛАЙНІВ АКТИВНІ`}
              sx={{
                background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                color: nexusColors.obsidian,
                fontWeight: 600
              }}
            />
          </Box>
          
          {isFeatureEnabled('threeDee') && (
            <Tooltip title="3D Аналітика">
              <IconButton
                onClick={() => setViewAnalytics(true)}
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                  color: nexusColors.frost,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <Analytics />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </motion.div>

      {/* Pipeline Flow Visualization */}
      {isFeatureEnabled('dataOps') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{ mb: 4, p: 3, background: `${nexusColors.quantum}10`, borderRadius: 2, border: `1px solid ${nexusColors.quantum}40` }}>
            <Typography variant="h6" sx={{ color: nexusColors.quantum }}>
              📊 Pipeline Flow Visualization
            </Typography>
            <Typography variant="body2" sx={{ color: nexusColors.shadow, mt: 1 }}>
              ETL Pipeline stages: Extract → Transform → Load → Index
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Active Pipelines */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {pipelines.map((pipeline, index) => (
            <Grid item xs={12} md={6} lg={4} key={pipeline.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -8 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.obsidian}95, ${nexusColors.darkMatter}85)`,
                    border: `2px solid ${getStatusColor(pipeline.status)}40`,
                    borderRadius: 3,
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      borderColor: getStatusColor(pipeline.status) + '80',
                      boxShadow: `0 12px 40px ${getStatusColor(pipeline.status)}30`
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Pipeline Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          background: `${getStatusColor(pipeline.status)}20`,
                          border: `1px solid ${getStatusColor(pipeline.status)}40`
                        }}>
                          {getStatusIcon(pipeline.status)}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: nexusColors.frost, fontWeight: 600 }}>
                            {pipeline.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                            ID: {pipeline.id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Chip
                        label={pipeline.status.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(pipeline.status)}20`,
                          color: getStatusColor(pipeline.status),
                          border: `1px solid ${getStatusColor(pipeline.status)}`,
                          fontWeight: 600
                        }}
                      />
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: getStatusColor(pipeline.status), fontWeight: 600 }}>
                          {pipeline.progress.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pipeline.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: `${getStatusColor(pipeline.status)}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor(pipeline.status),
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    {/* Data Stats */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: nexusColors.quantum, fontWeight: 600, mb: 1, display: 'block' }}>
                        DATA PROCESSING
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                          {formatBytes(pipeline.dataProcessed)} / {formatBytes(pipeline.totalData)}
                        </Typography>
                        {pipeline.estimatedTime > 0 && (
                          <Typography variant="body2" sx={{ color: nexusColors.shadow }}>
                            ~{pipeline.estimatedTime}min left
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Last Run */}
                    <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: `${nexusColors.sapphire}10` }}>
                      <Typography variant="caption" sx={{ color: nexusColors.sapphire, fontWeight: 600 }}>
                        LAST RUN
                      </Typography>
                      <Typography variant="body2" sx={{ color: nexusColors.frost, mt: 0.5 }}>
                        {pipeline.lastRun.toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: `1px solid ${nexusColors.shadow}30` }}>
                      <Tooltip title={pipeline.status === 'running' ? 'Пауза' : 'Запуск'}>
                        <IconButton
                          size="small"
                          sx={{ color: nexusColors.frost, '&:hover': { color: getStatusColor(pipeline.status) } }}
                        >
                          {pipeline.status === 'running' ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Завантажити Логи">
                        <IconButton
                          size="small"
                          sx={{ color: nexusColors.frost, '&:hover': { color: nexusColors.quantum } }}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Перезапустити">
                        <IconButton
                          size="small"
                          sx={{ color: nexusColors.frost, '&:hover': { color: nexusColors.emerald } }}
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                  
                  {/* Animated progress line */}
                  {pipeline.status === 'running' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${getStatusColor(pipeline.status)}, transparent)`,
                        animation: 'data-flow 2s ease-in-out infinite'
                      }}
                    />
                  )}
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<CloudUpload />}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.quantum})`,
              color: nexusColors.obsidian,
              fontWeight: 600,
              '&:hover': {
                background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.emerald})`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Upload Dataset
          </Button>
          
          <Button
            startIcon={<Transform />}
            variant="outlined"
            sx={{
              borderColor: nexusColors.sapphire,
              color: nexusColors.sapphire,
              '&:hover': {
                borderColor: nexusColors.quantum,
                color: nexusColors.quantum,
                background: `${nexusColors.quantum}10`
              }
            }}
          >
            Create Pipeline
          </Button>
          
          <Button
            startIcon={<DataObject />}
            variant="outlined"
            sx={{
              borderColor: nexusColors.frost,
              color: nexusColors.frost,
              '&:hover': {
                borderColor: nexusColors.emerald,
                color: nexusColors.emerald,
                background: `${nexusColors.emerald}10`
              }
            }}
          >
            Generate Synthetic Data
          </Button>
        </Box>
      </motion.div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes data-flow {
            0%, 100% { opacity: 0.5; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(100%); }
          }
        `}
      </style>
    </Box>
  );
};

export default DataOps;
