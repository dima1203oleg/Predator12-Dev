// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, Chip, Button, Stack } from '@mui/material';
import { DataObject, Queue, PlayArrow, Pause, Settings, Refresh } from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
import DataUpload, { type UploadStage } from '../data/DataUpload';
import DataPipelineFlow from '../data/DataPipelineFlow';
import DataFlowMap from '../modules/DataFlowMap';

interface ETLPipeline {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'pending';
  progress: number;
  lastRun: string;
  recordsProcessed: number;
}

const ETLModule: React.FC = () => {
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [uploadedDatasetId, setUploadedDatasetId] = useState<string>('');
  const [showLiveFlow, setShowLiveFlow] = useState<boolean>(false);
  const [pipelines] = useState<ETLPipeline[]>([
    {
      id: 'customs-data',
      name: 'Customs Data Ingestion',
      status: 'running',
      progress: 75,
      lastRun: '2 хв тому',
      recordsProcessed: 15420
    },
    {
      id: 'osint-crawler',
      name: 'OSINT Social Crawler',
      status: 'running',
      progress: 45,
      lastRun: '5 хв тому',
      recordsProcessed: 8930
    },
    {
      id: 'telegram-parser',
      name: 'Telegram Channel Parser',
      status: 'stopped',
      progress: 0,
      lastRun: '30 хв тому',
      recordsProcessed: 0
    },
    {
      id: 'financial-sync',
      name: 'Financial Data Sync',
      status: 'error',
      progress: 23,
      lastRun: '1 год тому',
      recordsProcessed: 3450
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return nexusColors.success;
      case 'stopped': return nexusColors.shadow;
      case 'error': return nexusColors.error;
      case 'pending': return nexusColors.warning;
      default: return nexusColors.frost;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'running': return '▶️';
      case 'stopped': return '⏸️';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❔';
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
          background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🏭 Фабрика Даних ETL
      </Typography>
      {/* Upload & Pipeline Flow */}
      <DataUpload
        apiBase={import.meta.env.VITE_API_BASE || 'http://localhost:8000'}
        onStageChange={setUploadStage}
        onUploaded={(id) => setUploadedDatasetId(id)}
      />
      <DataPipelineFlow stage={uploadStage} />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => setShowLiveFlow((v) => !v)}>
          {showLiveFlow ? 'Сховати Live Flow' : 'Показати Live Flow'}
        </Button>
        {uploadedDatasetId && (
          <Chip label={`dataset_id: ${uploadedDatasetId}`} size="small" />
        )}
      </Stack>

      {showLiveFlow && (
        <Box sx={{ height: 420, mb: 3, border: `1px solid ${nexusColors.quantum}40`, borderRadius: 2, overflow: 'hidden' }}>
          <DataFlowMap
            nodes={[
              {
                id: 'frontend', name: 'Frontend (Nexus Core)', type: 'frontend', position: [-6, 2, 0],
                status: 'healthy', metrics: { latency: 20, throughput: 200, errors: 0 }, connections: ['api']
              },
              {
                id: 'api', name: 'FastAPI', type: 'api', position: [-2, 0, 0],
                status: uploadStage === 'uploading' || uploadStage === 'received' || uploadStage === 'analyzing' ? 'processing' : 'healthy',
                metrics: { latency: 35, throughput: 180, errors: 1 }, connections: ['postgres', 'qdrant', 'opensearch']
              },
              {
                id: 'postgres', name: 'PostgreSQL', type: 'database', position: [3, 2, 0],
                status: uploadStage === 'stored_pg' || uploadStage === 'completed' ? 'processing' : 'healthy',
                metrics: { latency: 12, throughput: 320, errors: 0 }, connections: []
              },
              {
                id: 'qdrant', name: 'Qdrant', type: 'database', position: [4, -1, 0],
                status: uploadStage === 'embeddings_qdrant' || uploadStage === 'completed' ? 'processing' : 'healthy',
                metrics: { latency: 28, throughput: 140, errors: 0 }, connections: []
              },
              {
                id: 'opensearch', name: 'OpenSearch', type: 'database', position: [6, 1, 0],
                status: uploadStage === 'indexed_opensearch' || uploadStage === 'completed' ? 'processing' : 'healthy',
                metrics: { latency: 42, throughput: 90, errors: 0 }, connections: []
              }
            ]}
            flows={[
              { id: 'f1', from: 'frontend', to: 'api', status: uploadStage !== 'idle' ? 'active' : 'idle', dataType: 'import', volume: 6, latency: 30 },
              { id: 'f2', from: 'api', to: 'postgres', status: uploadStage === 'stored_pg' || uploadStage === 'completed' ? 'active' : 'idle', dataType: 'sync', volume: 5, latency: 25 },
              { id: 'f3', from: 'api', to: 'qdrant', status: uploadStage === 'embeddings_qdrant' || uploadStage === 'completed' ? 'active' : 'idle', dataType: 'sync', volume: 4, latency: 40 },
              { id: 'f4', from: 'api', to: 'opensearch', status: uploadStage === 'indexed_opensearch' || uploadStage === 'completed' ? 'active' : 'idle', dataType: 'sync', volume: 3, latency: 55 },
            ]}
            onNodeClick={() => {}}
            onFlowClick={() => {}}
            enableVoiceControl={false}
          />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {pipelines.map((pipeline) => (
          <Grid item xs={12} md={6} lg={4} key={pipeline.id}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}B3)`,
                border: `1px solid ${getStatusColor(pipeline.status)}40`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${getStatusColor(pipeline.status)}30`
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DataObject sx={{ color: nexusColors.sapphire, mr: 1 }} />
                  <Typography variant="h6" sx={{ color: nexusColors.frost, flexGrow: 1 }}>
                    {pipeline.name}
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem' }}>
                    {getStatusEmoji(pipeline.status)}
                  </Typography>
                </Box>
                
                <Chip
                  size="small"
                  label={pipeline.status}
                  sx={{
                    backgroundColor: `${getStatusColor(pipeline.status)}20`,
                    color: getStatusColor(pipeline.status),
                    mb: 2
                  }}
                />
                
                {pipeline.status === 'running' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                      Прогрес: {pipeline.progress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pipeline.progress}
                      sx={{
                        bgcolor: `${nexusColors.shadow}40`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: nexusColors.emerald
                        }
                      }}
                    />
                  </Box>
                )}
                
                <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                  📊 Записів оброблено: {pipeline.recordsProcessed.toLocaleString()}
                </Typography>
                
                <Typography variant="caption" sx={{ color: nexusColors.shadow, display: 'block', mb: 2 }}>
                  🕐 Останній запуск: {pipeline.lastRun}
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={pipeline.status === 'running' ? <Pause /> : <PlayArrow />}
                    sx={{
                      background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`
                      }
                    }}
                  >
                    {pipeline.status === 'running' ? 'Пауза' : 'Запуск'}
                  </Button>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Refresh />}
                    sx={{
                      borderColor: nexusColors.emerald,
                      color: nexusColors.emerald,
                      '&:hover': {
                        borderColor: nexusColors.sapphire,
                        color: nexusColors.sapphire
                      }
                    }}
                  >
                    Перезапуск
                  </Button>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Settings />}
                    sx={{
                      borderColor: nexusColors.amethyst,
                      color: nexusColors.amethyst,
                      '&:hover': {
                        borderColor: nexusColors.sapphire,
                        color: nexusColors.sapphire
                      }
                    }}
                  >
                    Налаштування
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
          Активні: {pipelines.filter(p => p.status === 'running').length} | 
          Зупинені: {pipelines.filter(p => p.status === 'stopped').length} | 
          Помилки: {pipelines.filter(p => p.status === 'error').length}
        </Typography>
      </Box>
    </Box>
  );
};

export default ETLModule;
