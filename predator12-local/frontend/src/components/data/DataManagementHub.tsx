// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  LinearProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Alert
} from '@mui/material';
import {
  Storage as StorageIcon,
  CloudQueue as CloudIcon,
  Database as DatabaseIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Backup as BackupIcon,
  Sync as SyncIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'file' | 'api' | 'stream' | 'cloud';
  status: 'online' | 'offline' | 'syncing' | 'error';
  size: number;
  lastUpdated: Date;
  location: string;
  security: 'public' | 'private' | 'encrypted';
  connections: number;
  performance: number;
  icon: any;
  color: string;
}

interface DataMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
  icon: any;
  color: string;
  description: string;
}

const DataManagementHub: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Джерела даних
  const dataSources: DataSource[] = [
    {
      id: '1',
      name: 'Main Database',
      type: 'database',
      status: 'online',
      size: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
      lastUpdated: new Date(Date.now() - 300000), // 5 min ago
      location: 'Local Server',
      security: 'encrypted',
      connections: 45,
      performance: 95,
      icon: DatabaseIcon,
      color: nexusColors.primary.main
    },
    {
      id: '2',
      name: 'AI Training Data',
      type: 'file',
      status: 'syncing',
      size: 15.7 * 1024 * 1024 * 1024, // 15.7 GB
      lastUpdated: new Date(Date.now() - 900000), // 15 min ago
      location: 'Cloud Storage',
      security: 'private',
      connections: 12,
      performance: 87,
      icon: CloudIcon,
      color: nexusColors.info.main
    },
    {
      id: '3',
      name: 'Real-time Analytics',
      type: 'stream',
      status: 'online',
      size: 0.8 * 1024 * 1024 * 1024, // 0.8 GB
      lastUpdated: new Date(Date.now() - 5000), // 5 sec ago
      location: 'Edge Nodes',
      security: 'encrypted',
      connections: 156,
      performance: 92,
      icon: AnalyticsIcon,
      color: nexusColors.success.main
    },
    {
      id: '4',
      name: 'User Documents',
      type: 'file',
      status: 'online',
      size: 5.2 * 1024 * 1024 * 1024, // 5.2 GB
      lastUpdated: new Date(Date.now() - 1800000), // 30 min ago
      location: 'Document Server',
      security: 'private',
      connections: 78,
      performance: 89,
      icon: FolderIcon,
      color: nexusColors.warning.main
    },
    {
      id: '5',
      name: 'External API Data',
      type: 'api',
      status: 'error',
      size: 1.1 * 1024 * 1024 * 1024, // 1.1 GB
      lastUpdated: new Date(Date.now() - 3600000), // 1 hour ago
      location: 'Third-party',
      security: 'public',
      connections: 23,
      performance: 45,
      icon: NetworkIcon,
      color: nexusColors.error.main
    },
    {
      id: '6',
      name: 'Backup Archive',
      type: 'cloud',
      status: 'offline',
      size: 45.6 * 1024 * 1024 * 1024, // 45.6 GB
      lastUpdated: new Date(Date.now() - 86400000), // 1 day ago
      location: 'Cold Storage',
      security: 'encrypted',
      connections: 0,
      performance: 100,
      icon: BackupIcon,
      color: nexusColors.accent.main
    }
  ];

  // Метрики даних
  const dataMetrics: DataMetric[] = [
    {
      id: 'total-storage',
      label: 'Загальне сховище',
      value: '71.2',
      unit: 'GB',
      change: 5.2,
      status: 'good',
      icon: StorageIcon,
      color: nexusColors.primary.main,
      description: 'Загальний обсяг даних'
    },
    {
      id: 'active-connections',
      label: 'Активні з\'єднання',
      value: 314,
      change: 12.5,
      status: 'good',
      icon: NetworkIcon,
      color: nexusColors.success.main,
      description: 'Поточні активні з\'єднання'
    },
    {
      id: 'data-throughput',
      label: 'Пропускна здатність',
      value: '2.4',
      unit: 'GB/s',
      change: -2.1,
      status: 'warning',
      icon: SpeedIcon,
      color: nexusColors.warning.main,
      description: 'Швидкість передачі даних'
    },
    {
      id: 'backup-status',
      label: 'Статус резервного копіювання',
      value: '98.5',
      unit: '%',
      change: 0.3,
      status: 'good',
      icon: BackupIcon,
      color: nexusColors.info.main,
      description: 'Завершеність резервного копіювання'
    },
    {
      id: 'data-quality',
      label: 'Якість даних',
      value: '94.2',
      unit: '%',
      change: -1.8,
      status: 'warning',
      icon: CheckIcon,
      color: nexusColors.accent.main,
      description: 'Загальна якість даних'
    },
    {
      id: 'security-score',
      label: 'Рівень безпеки',
      value: '96.7',
      unit: '%',
      change: 2.4,
      status: 'good',
      icon: SecurityIcon,
      color: nexusColors.success.main,
      description: 'Рівень захисту даних'
    }
  ];

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return nexusColors.success.main;
      case 'syncing':
        return nexusColors.warning.main;
      case 'offline':
        return nexusColors.text.secondary;
      case 'error':
        return nexusColors.error.main;
      default:
        return nexusColors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckIcon sx={{ color: nexusColors.success.main }} />;
      case 'syncing':
        return <SyncIcon sx={{ color: nexusColors.warning.main }} />;
      case 'offline':
        return <InfoIcon sx={{ color: nexusColors.text.secondary }} />;
      case 'error':
        return <ErrorIcon sx={{ color: nexusColors.error.main }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getSecurityIcon = (security: string) => {
    switch (security) {
      case 'encrypted':
        return '🔒';
      case 'private':
        return '🔐';
      case 'public':
        return '🔓';
      default:
        return '❓';
    }
  };

  const filteredDataSources = dataSources
    .filter(source => {
      const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || source.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'updated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        case 'performance':
          return b.performance - a.performance;
        default:
          return 0;
      }
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const renderMetricCard = (metric: DataMetric) => (
    <Grid item xs={12} sm={6} md={4} lg={2} key={metric.id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
        whileHover={{ scale: 1.05, y: -5 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${metric.color}30`,
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative',
            '&:hover': {
              boxShadow: `0 10px 30px ${metric.color}40`,
              border: `1px solid ${metric.color}60`
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Avatar
                sx={{
                  background: `linear-gradient(45deg, ${metric.color}40, ${metric.color}60)`,
                  width: 40,
                  height: 40
                }}
              >
                <metric.icon sx={{ color: metric.color, fontSize: '1.2rem' }} />
              </Avatar>

              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: metric.change > 0 ? nexusColors.success.main :
                          metric.change < 0 ? nexusColors.error.main : nexusColors.text.secondary,
                    fontWeight: 'bold'
                  }}
                >
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                color: nexusColors.text.primary,
                fontWeight: 'bold',
                mb: 0.5,
                background: `linear-gradient(45deg, ${metric.color}, ${nexusColors.accent.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {metric.value}{metric.unit || ''}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: nexusColors.text.primary, mb: 1, fontWeight: 600 }}
            >
              {metric.label}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: nexusColors.text.secondary }}
            >
              {metric.description}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  const renderDataSourceCard = (source: DataSource) => (
    <Grid item xs={12} sm={6} md={4} key={source.id}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
        whileHover={{ scale: 1.05, y: -5 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${source.color}30`,
            borderRadius: 3,
            height: '100%',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: `0 10px 30px ${source.color}40`,
              border: `1px solid ${source.color}60`
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => {
            setSelectedDataSource(source);
            setDataDialogOpen(true);
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Avatar
                sx={{
                  background: `linear-gradient(45deg, ${source.color}40, ${source.color}60)`,
                  width: 50,
                  height: 50
                }}
              >
                <source.icon sx={{ color: source.color }} />
              </Avatar>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(source.status)}
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  {getSecurityIcon(source.security)}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.primary, mb: 1, fontWeight: 'bold' }}
            >
              {source.name}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={source.type}
                size="small"
                sx={{
                  background: `${source.color}20`,
                  color: source.color,
                  fontWeight: 'bold'
                }}
              />
              <Chip
                label={source.status}
                size="small"
                sx={{
                  background: `${getStatusColor(source.status)}20`,
                  color: getStatusColor(source.status),
                  fontWeight: 'bold'
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{ color: nexusColors.text.secondary, mb: 2 }}
            >
              📍 {source.location}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: source.color,
                fontWeight: 'bold',
                mb: 1
              }}
            >
              {formatFileSize(source.size)}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                  Продуктивність
                </Typography>
                <Typography variant="body2" sx={{ color: source.color, fontWeight: 'bold' }}>
                  {source.performance}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={source.performance}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: `${nexusColors.primary.dark}30`,
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${source.color}60, ${source.color})`
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                З'єднання: {source.connections}
              </Typography>
              <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                {source.lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  const renderDataTable = () => (
    <TableContainer
      component={Paper}
      sx={{
        background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusColors.accent.main}30`,
        borderRadius: 3
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>Джерело</TableCell>
            <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>Тип</TableCell>
            <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>Розмір</TableCell>
            <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>Статус</TableCell>
            <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>Продуктивність</TableCell>
            <TableCell sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>Дії</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDataSources.map((source) => (
            <TableRow key={source.id} hover>
              <TableCell sx={{ color: nexusColors.text.primary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, background: `${source.color}40` }}>
                    <source.icon sx={{ color: source.color, fontSize: '1rem' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: nexusColors.text.primary, fontWeight: 'bold' }}>
                      {source.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: nexusColors.text.secondary }}>
                      {source.location}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={{ color: nexusColors.text.primary }}>
                <Chip
                  label={source.type}
                  size="small"
                  sx={{
                    background: `${source.color}20`,
                    color: source.color
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: nexusColors.text.primary }}>
                {formatFileSize(source.size)}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(source.status)}
                  <Typography variant="body2" sx={{ color: getStatusColor(source.status) }}>
                    {source.status}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: nexusColors.text.primary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={source.performance}
                    sx={{
                      width: 60,
                      height: 4,
                      borderRadius: 2,
                      background: `${nexusColors.primary.dark}30`,
                      '& .MuiLinearProgress-bar': {
                        background: source.color
                      }
                    }}
                  />
                  <Typography variant="body2">{source.performance}%</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Переглянути">
                    <IconButton size="small" sx={{ color: nexusColors.info.main }}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редагувати">
                    <IconButton size="small" sx={{ color: nexusColors.warning.main }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Завантажити">
                    <IconButton size="small" sx={{ color: nexusColors.success.main }}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.info.main}, ${nexusColors.primary.main})`,
              width: 60,
              height: 60
            }}
          >
            <StorageIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: nexusColors.text.primary,
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${nexusColors.info.main}, ${nexusColors.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🗄️ Центр Управління Даними
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.secondary }}
            >
              Управління, моніторинг та аналітика даних
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Метрики */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dataMetrics.map(renderMetricCard)}
      </Grid>

      {/* Панель управління */}
      <Paper
        sx={{
          background: `${nexusColors.primary.dark}60`,
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 2,
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Пошук джерел даних..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                color: nexusColors.text.primary,
                '& fieldset': { borderColor: `${nexusColors.accent.main}50` },
                '&:hover fieldset': { borderColor: nexusColors.accent.main },
              }
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: nexusColors.text.secondary, mr: 1 }} />
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: nexusColors.text.secondary }}>Тип</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                color: nexusColors.text.primary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: `${nexusColors.accent.main}50` }
              }}
            >
              <MenuItem value="all">Всі</MenuItem>
              <MenuItem value="database">База даних</MenuItem>
              <MenuItem value="file">Файл</MenuItem>
              <MenuItem value="api">API</MenuItem>
              <MenuItem value="stream">Потік</MenuItem>
              <MenuItem value="cloud">Хмара</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: nexusColors.text.secondary }}>Сортування</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                color: nexusColors.text.primary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: `${nexusColors.accent.main}50` }
              }}
            >
              <MenuItem value="name">За назвою</MenuItem>
              <MenuItem value="size">За розміром</MenuItem>
              <MenuItem value="updated">За оновленням</MenuItem>
              <MenuItem value="performance">За продуктивністю</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{
              borderColor: nexusColors.accent.main,
              color: nexusColors.accent.main,
              '&:hover': {
                borderColor: nexusColors.accent.light,
                background: `${nexusColors.accent.main}20`
              }
            }}
          >
            {isRefreshing ? 'Оновлення...' : 'Оновити'}
          </Button>
        </Box>
      </Paper>

      {/* Вкладки */}
      <Paper
        sx={{
          background: `${nexusColors.primary.dark}60`,
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          mb: 3
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: nexusColors.text.secondary,
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: nexusColors.info.main
              }
            },
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${nexusColors.info.main}, ${nexusColors.primary.main})`
            }
          }}
        >
          <Tab label="📊 Картки" />
          <Tab label="📋 Таблиця" />
          <Tab label="📈 Аналітика" />
          <Tab label="⚙️ Налаштування" />
        </Tabs>
      </Paper>

      {/* Контент вкладок */}
      <AnimatePresence mode="wait">
        {currentTab === 0 && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              {filteredDataSources.map(renderDataSourceCard)}
            </Grid>
          </motion.div>
        )}

        {currentTab === 1 && (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            {renderDataTable()}
          </motion.div>
        )}

        {currentTab === 2 && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.info.main}40, ${nexusColors.primary.main}20)`,
                    border: `1px solid ${nexusColors.info.main}50`,
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: '3rem', color: nexusColors.info.main, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    📊 Детальна Аналітика
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                    Глибокий аналіз використання та продуктивності даних
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${nexusColors.info.main}, ${nexusColors.primary.main})`,
                      color: 'white'
                    }}
                  >
                    Переглянути звіт
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${nexusColors.warning.main}40, ${nexusColors.primary.main}20)`,
                    border: `1px solid ${nexusColors.warning.main}50`,
                    borderRadius: 3,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <SecurityIcon sx={{ fontSize: '3rem', color: nexusColors.warning.main, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    🔒 Аудит Безпеки
                  </Typography>
                  <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                    Перевірка захищеності та дотримання стандартів
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${nexusColors.warning.main}, ${nexusColors.primary.main})`,
                      color: 'white'
                    }}
                  >
                    Запустити аудит
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {currentTab === 3 && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.accent.main}30`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                ⚙️ Налаштування Системи
              </Typography>
              <Typography variant="body1" sx={{ color: nexusColors.text.secondary, mb: 3 }}>
                Конфігурація джерел даних та параметрів системи
              </Typography>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5
                }}
              >
                Відкрити налаштування
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Діалог деталей джерела даних */}
      <Dialog
        open={dataDialogOpen}
        onClose={() => setDataDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}95, ${nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }
        }}
      >
        {selectedDataSource && (
          <>
            <DialogTitle sx={{
              color: nexusColors.text.primary,
              borderBottom: `1px solid ${nexusColors.accent.main}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <selectedDataSource.icon sx={{ color: selectedDataSource.color }} />
              {selectedDataSource.name}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                    Інформація про джерело:
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Тип: <Chip
                        label={selectedDataSource.type}
                        size="small"
                        sx={{
                          background: `${selectedDataSource.color}20`,
                          color: selectedDataSource.color
                        }}
                      />
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Розташування: {selectedDataSource.location}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Розмір: {formatFileSize(selectedDataSource.size)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Останнє оновлення: {selectedDataSource.lastUpdated.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
                      Рівень безпеки: {getSecurityIcon(selectedDataSource.security)} {selectedDataSource.security}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, background: `${nexusColors.secondary.dark}30`, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: nexusColors.text.primary, mb: 2 }}>
                      Статистика
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                        Статус: <Chip
                          label={selectedDataSource.status}
                          size="small"
                          sx={{
                            background: `${getStatusColor(selectedDataSource.status)}20`,
                            color: getStatusColor(selectedDataSource.status)
                          }}
                        />
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                        Активні з'єднання: {selectedDataSource.connections}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                        Продуктивність: {selectedDataSource.performance}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={selectedDataSource.performance}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          background: `${nexusColors.primary.dark}30`,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${selectedDataSource.color}60, ${selectedDataSource.color})`
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusColors.accent.main}30` }}>
              <Button
                onClick={() => setDataDialogOpen(false)}
                sx={{ color: nexusColors.text.secondary }}
              >
                Закрити
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${selectedDataSource.color}, ${nexusColors.primary.main})`,
                  color: 'white'
                }}
              >
                Управляти
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DataManagementHub;
