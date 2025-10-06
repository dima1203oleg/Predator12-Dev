// @ts-nocheck
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Storage as DataIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Transform as TransformIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

interface Dataset {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'parquet' | 'xml' | 'database';
  size: number;
  rows: number;
  columns: number;
  status: 'ready' | 'processing' | 'error' | 'uploading';
  lastModified: Date;
  source: string;
}

interface ETLPipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'running' | 'stopped' | 'error' | 'completed';
  progress: number;
  lastRun: Date;
  nextRun?: Date;
}

export const DataOpsModule: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: '1',
      name: 'User Analytics Data',
      type: 'csv',
      size: 2.5 * 1024 * 1024, // 2.5MB
      rows: 15000,
      columns: 12,
      status: 'ready',
      lastModified: new Date('2024-01-15'),
      source: 'analytics_db'
    },
    {
      id: '2',
      name: 'Security Logs',
      type: 'json',
      size: 8.7 * 1024 * 1024, // 8.7MB
      rows: 45000,
      columns: 8,
      status: 'processing',
      lastModified: new Date('2024-01-16'),
      source: 'security_system'
    },
    {
      id: '3',
      name: 'Performance Metrics',
      type: 'parquet',
      size: 1.2 * 1024 * 1024, // 1.2MB
      rows: 8500,
      columns: 15,
      status: 'ready',
      lastModified: new Date('2024-01-16'),
      source: 'monitoring_stack'
    }
  ]);

  const [pipelines, setPipelines] = useState<ETLPipeline[]>([
    {
      id: '1',
      name: 'Daily Analytics ETL',
      source: 'PostgreSQL',
      destination: 'Data Warehouse',
      status: 'running',
      progress: 65,
      lastRun: new Date('2024-01-16T08:00:00'),
      nextRun: new Date('2024-01-17T08:00:00')
    },
    {
      id: '2',
      name: 'Security Data Pipeline',
      source: 'Kafka Stream',
      destination: 'OpenSearch',
      status: 'completed',
      progress: 100,
      lastRun: new Date('2024-01-16T12:30:00')
    },
    {
      id: '3',
      name: 'ML Feature Pipeline',
      source: 'Multiple Sources',
      destination: 'Feature Store',
      status: 'error',
      progress: 25,
      lastRun: new Date('2024-01-16T10:15:00')
    }
  ]);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [syntheticDialogOpen, setSyntheticDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newDataset: Dataset = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop() as any || 'csv',
        size: file.size,
        rows: 0,
        columns: 0,
        status: 'uploading',
        lastModified: new Date(),
        source: 'upload'
      };
      
      setDatasets(prev => [...prev, newDataset]);
      
      // Simulate upload process
      setTimeout(() => {
        setDatasets(prev => prev.map(ds => 
          ds.id === newDataset.id 
            ? { ...ds, status: 'ready', rows: Math.floor(Math.random() * 10000) + 1000, columns: Math.floor(Math.random() * 20) + 5 }
            : ds
        ));
      }, 2000);
    });
    setUploadDialogOpen(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/parquet': ['.parquet'],
      'text/xml': ['.xml']
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return nexusColors.emerald;
      case 'processing': case 'running': case 'uploading': return nexusColors.sapphire;
      case 'error': return nexusColors.crimson;
      case 'completed': return nexusColors.success;
      case 'stopped': return nexusColors.shadow;
      default: return nexusColors.nebula;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'csv': return nexusColors.emerald;
      case 'json': return nexusColors.sapphire;
      case 'parquet': return nexusColors.amethyst;
      case 'xml': return nexusColors.warning;
      case 'database': return nexusColors.info;
      default: return nexusColors.nebula;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3, 
            color: nexusColors.amethyst,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusColors.amethyst}`
          }}
        >
          <DataIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Фабрика Даних
        </Typography>

        <Grid container spacing={3}>
          {/* Data Upload Zone */}
          <Grid item xs={12} md={6}>
            <Card className="holographic">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.emerald }}>
                  <UploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Телепортація Даних
                </Typography>
                
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${nexusColors.quantum}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isDragActive 
                      ? `linear-gradient(45deg, ${nexusColors.emerald}20, transparent)`
                      : 'transparent',
                    '&:hover': {
                      borderColor: nexusColors.emerald,
                      boxShadow: `0 0 20px ${nexusColors.emerald}30`
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon sx={{ fontSize: 48, color: nexusColors.emerald, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 1 }}>
                    {isDragActive ? 'Відпустіть файли тут...' : 'Перетягніть файли сюди'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                    Підтримуються: CSV, JSON, Parquet, XML
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                    sx={{ flex: 1 }}
                  >
                    Завантажити файл
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TransformIcon />}
                    onClick={() => setSyntheticDialogOpen(true)}
                    sx={{ flex: 1 }}
                  >
                    Генерувати дані
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ETL Pipelines */}
          <Grid item xs={12} md={6}>
            <Card className="holographic">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.sapphire }}>
                  <TransformIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  ETL Конвеєри
                </Typography>
                
                {pipelines.map((pipeline) => (
                  <Box key={pipeline.id} sx={{ mb: 2, p: 2, border: `1px solid ${nexusColors.quantum}`, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: nexusColors.frost }}>
                        {pipeline.name}
                      </Typography>
                      <Chip
                        label={pipeline.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(pipeline.status),
                          color: nexusColors.frost
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 1 }}>
                      {pipeline.source} → {pipeline.destination}
                    </Typography>
                    
                    {pipeline.status === 'running' && (
                      <LinearProgress
                        variant="determinate"
                        value={pipeline.progress}
                        sx={{
                          mb: 1,
                          backgroundColor: nexusColors.darkMatter,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: nexusColors.sapphire,
                          },
                        }}
                      />
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                        Останній запуск: {pipeline.lastRun.toLocaleString()}
                      </Typography>
                      <Box>
                        <IconButton size="small" sx={{ color: nexusColors.emerald }}>
                          <RunIcon />
                        </IconButton>
                        <IconButton size="small" sx={{ color: nexusColors.warning }}>
                          <StopIcon />
                        </IconButton>
                        <IconButton size="small" sx={{ color: nexusColors.sapphire }}>
                          <RefreshIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Datasets Table */}
          <Grid item xs={12}>
            <Card className="holographic">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: nexusColors.warning }}>
                  Каталог Датасетів
                </Typography>
                
                <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Назва
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Тип
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Розмір
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Рядки/Колонки
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Статус
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          Дії
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {datasets.map((dataset) => (
                        <TableRow key={dataset.id}>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                              {dataset.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                              {dataset.source}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Chip
                              label={dataset.type.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: getTypeColor(dataset.type),
                                color: nexusColors.frost
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                              {formatFileSize(dataset.size)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Typography variant="body2" sx={{ color: nexusColors.nebula }}>
                              {dataset.rows.toLocaleString()} / {dataset.columns}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={dataset.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(dataset.status),
                                  color: nexusColors.frost
                                }}
                              />
                              {dataset.status === 'processing' && (
                                <LinearProgress
                                  sx={{
                                    width: 50,
                                    backgroundColor: nexusColors.darkMatter,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: nexusColors.sapphire,
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderColor: nexusColors.quantum }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Переглянути">
                                <IconButton 
                                  size="small" 
                                  sx={{ color: nexusColors.sapphire }}
                                  onClick={() => setSelectedDataset(dataset)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Завантажити">
                                <IconButton size="small" sx={{ color: nexusColors.emerald }}>
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Видалити">
                                <IconButton size="small" sx={{ color: nexusColors.crimson }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: nexusColors.emerald }}>
            Завантаження Файлу
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Перетягніть файли в область нижче або натисніть для вибору
            </Alert>
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${nexusColors.quantum}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: nexusColors.emerald, mb: 2 }} />
              <Typography>Оберіть файли для завантаження</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Скасувати</Button>
          </DialogActions>
        </Dialog>

        {/* Synthetic Data Dialog */}
        <Dialog open={syntheticDialogOpen} onClose={() => setSyntheticDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: nexusColors.amethyst }}>
            Генерація Синтетичних Даних
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Назва датасету"
                  variant="outlined"
                  defaultValue="Synthetic Dataset"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Кількість рядків"
                  type="number"
                  variant="outlined"
                  defaultValue={1000}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Кількість колонок"
                  type="number"
                  variant="outlined"
                  defaultValue={10}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Тип даних</InputLabel>
                  <Select defaultValue="mixed">
                    <MenuItem value="mixed">Змішані дані</MenuItem>
                    <MenuItem value="numerical">Числові дані</MenuItem>
                    <MenuItem value="categorical">Категоріальні дані</MenuItem>
                    <MenuItem value="timeseries">Часові ряди</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSyntheticDialogOpen(false)}>Скасувати</Button>
            <Button 
              variant="contained" 
              onClick={() => setSyntheticDialogOpen(false)}
              sx={{ backgroundColor: nexusColors.emerald }}
            >
              Генерувати
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};
