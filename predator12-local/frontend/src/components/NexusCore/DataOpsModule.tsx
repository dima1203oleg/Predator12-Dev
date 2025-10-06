// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  Storage as StorageIcon,
  CloudUpload as UploadIcon,
  Transform as TransformIcon,
  DataObject as DataIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { nexusColors } from '../../theme/nexusTheme';

interface Dataset {
  id: string;
  name: string;
  type: 'CSV' | 'JSON' | 'Parquet' | 'SQL';
  size: string;
  status: 'active' | 'processing' | 'error';
  lastUpdated: string;
  records: number;
}

interface ETLPipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  source: string;
  target: string;
}

const DataOpsModule: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: 'ds_001',
      name: 'security_events.parquet',
      type: 'Parquet',
      size: '2.3 GB',
      status: 'active',
      lastUpdated: '2024-09-26T15:30:00Z',
      records: 1250000
    },
    {
      id: 'ds_002',
      name: 'anomaly_patterns.json',
      type: 'JSON',
      size: '450 MB',
      status: 'active',
      lastUpdated: '2024-09-26T14:15:00Z',
      records: 87000
    },
    {
      id: 'ds_003',
      name: 'forecast_models.csv',
      type: 'CSV',
      size: '180 MB',
      status: 'processing',
      lastUpdated: '2024-09-26T13:45:00Z',
      records: 45000
    }
  ]);

  const [pipelines, setPipelines] = useState<ETLPipeline[]>([
    {
      id: 'etl_001',
      name: 'Security Data Ingestion',
      status: 'running',
      progress: 75,
      source: 'External API',
      target: 'PostgreSQL'
    },
    {
      id: 'etl_002',
      name: 'Anomaly Detection Pipeline',
      status: 'completed',
      progress: 100,
      source: 'Data Lake',
      target: 'OpenSearch'
    },
    {
      id: 'etl_003',
      name: 'Synthetic Data Generation',
      status: 'queued',
      progress: 0,
      source: 'ML Models',
      target: 'Test Database'
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate file upload with teleportation effect
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);

            // Add new dataset
            const newDataset: Dataset = {
              id: `ds_${Date.now()}`,
              name: file.name,
              type: file.name.endsWith('.csv') ? 'CSV' :
                    file.name.endsWith('.json') ? 'JSON' :
                    file.name.endsWith('.parquet') ? 'Parquet' : 'CSV',
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              status: 'processing',
              lastUpdated: new Date().toISOString(),
              records: Math.floor(Math.random() * 100000)
            };

            setDatasets(prev => [newDataset, ...prev]);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 200);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/parquet': ['.parquet']
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed': return nexusColors.success;
      case 'processing':
      case 'running': return nexusColors.warning;
      case 'error':
      case 'failed': return nexusColors.crimson;
      case 'queued': return nexusColors.sapphire;
      default: return nexusColors.nebula;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CSV': return nexusColors.emerald;
      case 'JSON': return nexusColors.sapphire;
      case 'Parquet': return nexusColors.amethyst;
      case 'SQL': return nexusColors.warning;
      default: return nexusColors.nebula;
    }
  };

  return (
    <Box sx={{
      height: '100%',
      p: 3,
      background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`
    }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>

        {/* Data Teleportation Zone */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusColors.emerald}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UploadIcon sx={{ color: nexusColors.emerald, mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{
                  color: nexusColors.frost,
                  fontFamily: 'Orbitron'
                }}>
                  Data Teleportation
                </Typography>
              </Box>

              {/* Drop Zone */}
              <Box
                {...getRootProps()}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${isDragActive ? nexusColors.emerald : nexusColors.quantum}`,
                  borderRadius: 2,
                  backgroundColor: isDragActive ? `${nexusColors.emerald}10` : `${nexusColors.quantum}05`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: nexusColors.emerald,
                    backgroundColor: `${nexusColors.emerald}10`,
                    boxShadow: `0 0 20px ${nexusColors.emerald}20`
                  }
                }}
              >
                <input {...getInputProps()} />

                {isUploading ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ textAlign: 'center' }}
                  >
                    <Box sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      border: `4px solid ${nexusColors.emerald}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      animation: 'pulse 1s infinite'
                    }}>
                      <Typography variant="h4" sx={{ color: nexusColors.emerald }}>
                        {Math.round(uploadProgress)}%
                      </Typography>
                    </Box>
                    <Typography sx={{ color: nexusColors.emerald }}>
                      Teleporting Data...
                    </Typography>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{ textAlign: 'center' }}
                  >
                    <UploadIcon sx={{ fontSize: 64, color: nexusColors.emerald, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 1 }}>
                      {isDragActive ? 'Activate Teleportation' : 'Drag & Drop Files'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
                      Support: CSV, JSON, Parquet
                    </Typography>
                  </motion.div>
                )}

                {/* Particle effects for teleportation */}
                {isDragActive && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle, ${nexusColors.emerald}20 0%, transparent 70%)`,
                    animation: 'pulse 0.5s infinite'
                  }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dataset Registry */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusColors.sapphire}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataIcon sx={{ color: nexusColors.sapphire, mr: 2 }} />
                <Typography variant="h6" sx={{
                  color: nexusColors.frost,
                  fontFamily: 'Orbitron'
                }}>
                  Dataset Crystal Matrix
                </Typography>
                <IconButton
                  size="small"
                  sx={{ ml: 'auto', color: nexusColors.nebula }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>

              <TableContainer sx={{
                flex: 1,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': {
                  background: nexusColors.sapphire,
                  borderRadius: '3px'
                }
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: nexusColors.frost, borderColor: nexusColors.quantum }}>
                        Dataset
                      </TableCell>
                      <TableCell sx={{ color: nexusColors.frost, borderColor: nexusColors.quantum }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ color: nexusColors.frost, borderColor: nexusColors.quantum }}>
                        Size
                      </TableCell>
                      <TableCell sx={{ color: nexusColors.frost, borderColor: nexusColors.quantum }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ color: nexusColors.frost, borderColor: nexusColors.quantum }}>
                        Records
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datasets.map((dataset, index) => (
                      <motion.tr
                        key={dataset.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        style={{
                          background: `linear-gradient(90deg, ${nexusColors.quantum}05, transparent)`,
                          borderBottom: `1px solid ${nexusColors.quantum}40`
                        }}
                      >
                        <TableCell sx={{ color: nexusColors.frost, borderColor: nexusColors.quantum }}>
                          <Typography variant="body2" sx={{ fontFamily: 'Fira Code' }}>
                            {dataset.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: nexusColors.quantum }}>
                          <Chip
                            label={dataset.type}
                            size="small"
                            sx={{
                              backgroundColor: `${getTypeColor(dataset.type)}30`,
                              color: getTypeColor(dataset.type),
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          {dataset.size}
                        </TableCell>
                        <TableCell sx={{ borderColor: nexusColors.quantum }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <div
                              className={dataset.status === 'processing' ? 'pulse-element' : ''}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(dataset.status)
                              }}
                            />
                            <Typography variant="caption" sx={{
                              color: getStatusColor(dataset.status),
                              textTransform: 'uppercase'
                            }}>
                              {dataset.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: nexusColors.nebula, borderColor: nexusColors.quantum }}>
                          {dataset.records.toLocaleString()}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ETL Pipeline Status */}
        <Grid item xs={12}>
          <Card sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusColors.amethyst}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TransformIcon sx={{ color: nexusColors.amethyst, mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{
                  color: nexusColors.frost,
                  fontFamily: 'Orbitron'
                }}>
                  Neural ETL Pipeline Matrix
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {pipelines.map((pipeline, index) => (
                  <Grid item xs={12} md={4} key={pipeline.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Paper sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${nexusColors.quantum}10, ${nexusColors.quantum}05)`,
                        border: `1px solid ${getStatusColor(pipeline.status)}40`,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{
                            color: nexusColors.frost,
                            fontFamily: 'Fira Code'
                          }}>
                            {pipeline.name}
                          </Typography>
                          <Chip
                            label={pipeline.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(pipeline.status)}30`,
                              color: getStatusColor(pipeline.status),
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>

                        <Typography variant="caption" sx={{ color: nexusColors.nebula, display: 'block', mb: 1 }}>
                          {pipeline.source} → {pipeline.target}
                        </Typography>

                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                              Progress
                            </Typography>
                            <Typography variant="caption" sx={{ color: nexusColors.frost }}>
                              {pipeline.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pipeline.progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: `${getStatusColor(pipeline.status)}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getStatusColor(pipeline.status)
                              }
                            }}
                          />
                        </Box>

                        {pipeline.status === 'queued' && (
                          <Button
                            size="small"
                            startIcon={<PlayIcon />}
                            sx={{
                              color: nexusColors.emerald,
                              border: `1px solid ${nexusColors.emerald}40`,
                              '&:hover': {
                                backgroundColor: `${nexusColors.emerald}10`
                              }
                            }}
                          >
                            Start Pipeline
                          </Button>
                        )}
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DataOpsModule;

