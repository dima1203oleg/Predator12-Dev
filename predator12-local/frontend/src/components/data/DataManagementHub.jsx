"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const DataManagementHub = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterType, setFilterType] = (0, react_1.useState)('all');
    const [sortBy, setSortBy] = (0, react_1.useState)('name');
    const [dataDialogOpen, setDataDialogOpen] = (0, react_1.useState)(false);
    const [selectedDataSource, setSelectedDataSource] = (0, react_1.useState)(null);
    const [isRefreshing, setIsRefreshing] = (0, react_1.useState)(false);
    // Джерела даних
    const dataSources = [
        {
            id: '1',
            name: 'Main Database',
            type: 'database',
            status: 'online',
            size: 2.4 * 1024 * 1024 * 1024,
            lastUpdated: new Date(Date.now() - 300000),
            location: 'Local Server',
            security: 'encrypted',
            connections: 45,
            performance: 95,
            icon: icons_material_1.Database,
            color: nexusTheme_1.nexusColors.primary.main
        },
        {
            id: '2',
            name: 'AI Training Data',
            type: 'file',
            status: 'syncing',
            size: 15.7 * 1024 * 1024 * 1024,
            lastUpdated: new Date(Date.now() - 900000),
            location: 'Cloud Storage',
            security: 'private',
            connections: 12,
            performance: 87,
            icon: icons_material_1.CloudQueue,
            color: nexusTheme_1.nexusColors.info.main
        },
        {
            id: '3',
            name: 'Real-time Analytics',
            type: 'stream',
            status: 'online',
            size: 0.8 * 1024 * 1024 * 1024,
            lastUpdated: new Date(Date.now() - 5000),
            location: 'Edge Nodes',
            security: 'encrypted',
            connections: 156,
            performance: 92,
            icon: icons_material_1.Analytics,
            color: nexusTheme_1.nexusColors.success.main
        },
        {
            id: '4',
            name: 'User Documents',
            type: 'file',
            status: 'online',
            size: 5.2 * 1024 * 1024 * 1024,
            lastUpdated: new Date(Date.now() - 1800000),
            location: 'Document Server',
            security: 'private',
            connections: 78,
            performance: 89,
            icon: icons_material_1.Folder,
            color: nexusTheme_1.nexusColors.warning.main
        },
        {
            id: '5',
            name: 'External API Data',
            type: 'api',
            status: 'error',
            size: 1.1 * 1024 * 1024 * 1024,
            lastUpdated: new Date(Date.now() - 3600000),
            location: 'Third-party',
            security: 'public',
            connections: 23,
            performance: 45,
            icon: icons_material_1.NetworkCheck,
            color: nexusTheme_1.nexusColors.error.main
        },
        {
            id: '6',
            name: 'Backup Archive',
            type: 'cloud',
            status: 'offline',
            size: 45.6 * 1024 * 1024 * 1024,
            lastUpdated: new Date(Date.now() - 86400000),
            location: 'Cold Storage',
            security: 'encrypted',
            connections: 0,
            performance: 100,
            icon: icons_material_1.Backup,
            color: nexusTheme_1.nexusColors.accent.main
        }
    ];
    // Метрики даних
    const dataMetrics = [
        {
            id: 'total-storage',
            label: 'Загальне сховище',
            value: '71.2',
            unit: 'GB',
            change: 5.2,
            status: 'good',
            icon: icons_material_1.Storage,
            color: nexusTheme_1.nexusColors.primary.main,
            description: 'Загальний обсяг даних'
        },
        {
            id: 'active-connections',
            label: 'Активні з\'єднання',
            value: 314,
            change: 12.5,
            status: 'good',
            icon: icons_material_1.NetworkCheck,
            color: nexusTheme_1.nexusColors.success.main,
            description: 'Поточні активні з\'єднання'
        },
        {
            id: 'data-throughput',
            label: 'Пропускна здатність',
            value: '2.4',
            unit: 'GB/s',
            change: -2.1,
            status: 'warning',
            icon: icons_material_1.Speed,
            color: nexusTheme_1.nexusColors.warning.main,
            description: 'Швидкість передачі даних'
        },
        {
            id: 'backup-status',
            label: 'Статус резервного копіювання',
            value: '98.5',
            unit: '%',
            change: 0.3,
            status: 'good',
            icon: icons_material_1.Backup,
            color: nexusTheme_1.nexusColors.info.main,
            description: 'Завершеність резервного копіювання'
        },
        {
            id: 'data-quality',
            label: 'Якість даних',
            value: '94.2',
            unit: '%',
            change: -1.8,
            status: 'warning',
            icon: icons_material_1.CheckCircle,
            color: nexusTheme_1.nexusColors.accent.main,
            description: 'Загальна якість даних'
        },
        {
            id: 'security-score',
            label: 'Рівень безпеки',
            value: '96.7',
            unit: '%',
            change: 2.4,
            status: 'good',
            icon: icons_material_1.Security,
            color: nexusTheme_1.nexusColors.success.main,
            description: 'Рівень захисту даних'
        }
    ];
    const formatFileSize = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'online':
                return nexusTheme_1.nexusColors.success.main;
            case 'syncing':
                return nexusTheme_1.nexusColors.warning.main;
            case 'offline':
                return nexusTheme_1.nexusColors.text.secondary;
            case 'error':
                return nexusTheme_1.nexusColors.error.main;
            default:
                return nexusTheme_1.nexusColors.text.secondary;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'online':
                return <icons_material_1.CheckCircle sx={{ color: nexusTheme_1.nexusColors.success.main }}/>;
            case 'syncing':
                return <icons_material_1.Sync sx={{ color: nexusTheme_1.nexusColors.warning.main }}/>;
            case 'offline':
                return <icons_material_1.Info sx={{ color: nexusTheme_1.nexusColors.text.secondary }}/>;
            case 'error':
                return <icons_material_1.Error sx={{ color: nexusTheme_1.nexusColors.error.main }}/>;
            default:
                return <icons_material_1.Info />;
        }
    };
    const getSecurityIcon = (security) => {
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
    const handleRefresh = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsRefreshing(true);
        yield new Promise(resolve => setTimeout(resolve, 2000));
        setIsRefreshing(false);
    });
    const renderMetricCard = (metric) => (<material_1.Grid item xs={12} sm={6} md={4} lg={2} key={metric.id}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.random() * 0.3 }} whileHover={{ scale: 1.05, y: -5 }}>
        <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
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
        }}>
          <material_1.CardContent sx={{ p: 2.5 }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${metric.color}40, ${metric.color}60)`,
            width: 40,
            height: 40
        }}>
                <metric.icon sx={{ color: metric.color, fontSize: '1.2rem' }}/>
              </material_1.Avatar>

              <material_1.Box sx={{ textAlign: 'right' }}>
                <material_1.Typography variant="body2" sx={{
            color: metric.change > 0 ? nexusTheme_1.nexusColors.success.main :
                metric.change < 0 ? nexusTheme_1.nexusColors.error.main : nexusTheme_1.nexusColors.text.secondary,
            fontWeight: 'bold'
        }}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>

            <material_1.Typography variant="h5" sx={{
            color: nexusTheme_1.nexusColors.text.primary,
            fontWeight: 'bold',
            mb: 0.5,
            background: `linear-gradient(45deg, ${metric.color}, ${nexusTheme_1.nexusColors.accent.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
              {metric.value}{metric.unit || ''}
            </material_1.Typography>

            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1, fontWeight: 600 }}>
              {metric.label}
            </material_1.Typography>

            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
              {metric.description}
            </material_1.Typography>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Grid>);
    const renderDataSourceCard = (source) => (<material_1.Grid item xs={12} sm={6} md={4} key={source.id}>
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: Math.random() * 0.3 }} whileHover={{ scale: 1.05, y: -5 }}>
        <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
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
        }} onClick={() => {
            setSelectedDataSource(source);
            setDataDialogOpen(true);
        }}>
          <material_1.CardContent sx={{ p: 3 }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${source.color}40, ${source.color}60)`,
            width: 50,
            height: 50
        }}>
                <source.icon sx={{ color: source.color }}/>
              </material_1.Avatar>

              <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(source.status)}
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  {getSecurityIcon(source.security)}
                </material_1.Typography>
              </material_1.Box>
            </material_1.Box>

            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 1, fontWeight: 'bold' }}>
              {source.name}
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <material_1.Chip label={source.type} size="small" sx={{
            background: `${source.color}20`,
            color: source.color,
            fontWeight: 'bold'
        }}/>
              <material_1.Chip label={source.status} size="small" sx={{
            background: `${getStatusColor(source.status)}20`,
            color: getStatusColor(source.status),
            fontWeight: 'bold'
        }}/>
            </material_1.Box>

            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 2 }}>
              📍 {source.location}
            </material_1.Typography>

            <material_1.Typography variant="h5" sx={{
            color: source.color,
            fontWeight: 'bold',
            mb: 1
        }}>
              {formatFileSize(source.size)}
            </material_1.Typography>

            <material_1.Box sx={{ mb: 2 }}>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                  Продуктивність
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: source.color, fontWeight: 'bold' }}>
                  {source.performance}%
                </material_1.Typography>
              </material_1.Box>
              <material_1.LinearProgress variant="determinate" value={source.performance} sx={{
            height: 6,
            borderRadius: 3,
            background: `${nexusTheme_1.nexusColors.primary.dark}30`,
            '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${source.color}60, ${source.color})`
            }
        }}/>
            </material_1.Box>

            <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                З'єднання: {source.connections}
              </material_1.Typography>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                {source.lastUpdated.toLocaleTimeString()}
              </material_1.Typography>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>
    </material_1.Grid>);
    const renderDataTable = () => (<material_1.TableContainer component={material_1.Paper} sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            borderRadius: 3
        }}>
      <material_1.Table>
        <material_1.TableHead>
          <material_1.TableRow>
            <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>Джерело</material_1.TableCell>
            <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>Тип</material_1.TableCell>
            <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>Розмір</material_1.TableCell>
            <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>Статус</material_1.TableCell>
            <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>Продуктивність</material_1.TableCell>
            <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>Дії</material_1.TableCell>
          </material_1.TableRow>
        </material_1.TableHead>
        <material_1.TableBody>
          {filteredDataSources.map((source) => (<material_1.TableRow key={source.id} hover>
              <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <material_1.Avatar sx={{ width: 32, height: 32, background: `${source.color}40` }}>
                    <source.icon sx={{ color: source.color, fontSize: '1rem' }}/>
                  </material_1.Avatar>
                  <material_1.Box>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.primary, fontWeight: 'bold' }}>
                      {source.name}
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      {source.location}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>
              </material_1.TableCell>
              <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                <material_1.Chip label={source.type} size="small" sx={{
                background: `${source.color}20`,
                color: source.color
            }}/>
              </material_1.TableCell>
              <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                {formatFileSize(source.size)}
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(source.status)}
                  <material_1.Typography variant="body2" sx={{ color: getStatusColor(source.status) }}>
                    {source.status}
                  </material_1.Typography>
                </material_1.Box>
              </material_1.TableCell>
              <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <material_1.LinearProgress variant="determinate" value={source.performance} sx={{
                width: 60,
                height: 4,
                borderRadius: 2,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: source.color
                }
            }}/>
                  <material_1.Typography variant="body2">{source.performance}%</material_1.Typography>
                </material_1.Box>
              </material_1.TableCell>
              <material_1.TableCell>
                <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                  <material_1.Tooltip title="Переглянути">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.info.main }}>
                      <icons_material_1.Visibility />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Редагувати">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.warning.main }}>
                      <icons_material_1.Edit />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                  <material_1.Tooltip title="Завантажити">
                    <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.success.main }}>
                      <icons_material_1.Download />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>
              </material_1.TableCell>
            </material_1.TableRow>))}
        </material_1.TableBody>
      </material_1.Table>
    </material_1.TableContainer>);
    return (<material_1.Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <material_1.Avatar sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.info.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            width: 60,
            height: 60
        }}>
            <icons_material_1.Storage sx={{ fontSize: '2rem' }}/>
          </material_1.Avatar>
          <material_1.Box>
            <material_1.Typography variant="h3" sx={{
            color: nexusTheme_1.nexusColors.text.primary,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.info.main}, ${nexusTheme_1.nexusColors.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
              🗄️ Центр Управління Даними
            </material_1.Typography>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
              Управління, моніторинг та аналітика даних
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Метрики */}
      <material_1.Grid container spacing={3} sx={{ mb: 3 }}>
        {dataMetrics.map(renderMetricCard)}
      </material_1.Grid>

      {/* Панель управління */}
      <material_1.Paper sx={{
            background: `${nexusTheme_1.nexusColors.primary.dark}60`,
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 2,
            mb: 3
        }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <material_1.TextField placeholder="Пошук джерел даних..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
                color: nexusTheme_1.nexusColors.text.primary,
                '& fieldset': { borderColor: `${nexusTheme_1.nexusColors.accent.main}50` },
                '&:hover fieldset': { borderColor: nexusTheme_1.nexusColors.accent.main },
            }
        }} InputProps={{
            startAdornment: <icons_material_1.Search sx={{ color: nexusTheme_1.nexusColors.text.secondary, mr: 1 }}/>
        }}/>

          <material_1.FormControl size="small" sx={{ minWidth: 120 }}>
            <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Тип</material_1.InputLabel>
            <material_1.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={{
            color: nexusTheme_1.nexusColors.text.primary,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: `${nexusTheme_1.nexusColors.accent.main}50` }
        }}>
              <material_1.MenuItem value="all">Всі</material_1.MenuItem>
              <material_1.MenuItem value="database">База даних</material_1.MenuItem>
              <material_1.MenuItem value="file">Файл</material_1.MenuItem>
              <material_1.MenuItem value="api">API</material_1.MenuItem>
              <material_1.MenuItem value="stream">Потік</material_1.MenuItem>
              <material_1.MenuItem value="cloud">Хмара</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>

          <material_1.FormControl size="small" sx={{ minWidth: 120 }}>
            <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>Сортування</material_1.InputLabel>
            <material_1.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} sx={{
            color: nexusTheme_1.nexusColors.text.primary,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: `${nexusTheme_1.nexusColors.accent.main}50` }
        }}>
              <material_1.MenuItem value="name">За назвою</material_1.MenuItem>
              <material_1.MenuItem value="size">За розміром</material_1.MenuItem>
              <material_1.MenuItem value="updated">За оновленням</material_1.MenuItem>
              <material_1.MenuItem value="performance">За продуктивністю</material_1.MenuItem>
            </material_1.Select>
          </material_1.FormControl>

          <material_1.Button variant="outlined" startIcon={<icons_material_1.Refresh />} onClick={handleRefresh} disabled={isRefreshing} sx={{
            borderColor: nexusTheme_1.nexusColors.accent.main,
            color: nexusTheme_1.nexusColors.accent.main,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.accent.light,
                background: `${nexusTheme_1.nexusColors.accent.main}20`
            }
        }}>
            {isRefreshing ? 'Оновлення...' : 'Оновити'}
          </material_1.Button>
        </material_1.Box>
      </material_1.Paper>

      {/* Вкладки */}
      <material_1.Paper sx={{
            background: `${nexusTheme_1.nexusColors.primary.dark}60`,
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            mb: 3
        }}>
        <material_1.Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{
            '& .MuiTab-root': {
                color: nexusTheme_1.nexusColors.text.secondary,
                fontWeight: 'bold',
                '&.Mui-selected': {
                    color: nexusTheme_1.nexusColors.info.main
                }
            },
            '& .MuiTabs-indicator': {
                background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.info.main}, ${nexusTheme_1.nexusColors.primary.main})`
            }
        }}>
          <material_1.Tab label="📊 Картки"/>
          <material_1.Tab label="📋 Таблиця"/>
          <material_1.Tab label="📈 Аналітика"/>
          <material_1.Tab label="⚙️ Налаштування"/>
        </material_1.Tabs>
      </material_1.Paper>

      {/* Контент вкладок */}
      <framer_motion_1.AnimatePresence mode="wait">
        {currentTab === 0 && (<framer_motion_1.motion.div key="cards" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Grid container spacing={3}>
              {filteredDataSources.map(renderDataSourceCard)}
            </material_1.Grid>
          </framer_motion_1.motion.div>)}

        {currentTab === 1 && (<framer_motion_1.motion.div key="table" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            {renderDataTable()}
          </framer_motion_1.motion.div>)}

        {currentTab === 2 && (<framer_motion_1.motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.info.main}40, ${nexusTheme_1.nexusColors.primary.main}20)`,
                border: `1px solid ${nexusTheme_1.nexusColors.info.main}50`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
            }}>
                  <icons_material_1.Analytics sx={{ fontSize: '3rem', color: nexusTheme_1.nexusColors.info.main, mb: 2 }}/>
                  <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    📊 Детальна Аналітика
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                    Глибокий аналіз використання та продуктивності даних
                  </material_1.Typography>
                  <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.info.main}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                    Переглянути звіт
                  </material_1.Button>
                </material_1.Card>
              </material_1.Grid>
              <material_1.Grid item xs={12} md={6}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.warning.main}40, ${nexusTheme_1.nexusColors.primary.main}20)`,
                border: `1px solid ${nexusTheme_1.nexusColors.warning.main}50`,
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
            }}>
                  <icons_material_1.Security sx={{ fontSize: '3rem', color: nexusTheme_1.nexusColors.warning.main, mb: 2 }}/>
                  <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    🔒 Аудит Безпеки
                  </material_1.Typography>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                    Перевірка захищеності та дотримання стандартів
                  </material_1.Typography>
                  <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.warning.main}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                    Запустити аудит
                  </material_1.Button>
                </material_1.Card>
              </material_1.Grid>
            </material_1.Grid>
          </framer_motion_1.motion.div>)}

        {currentTab === 3 && (<framer_motion_1.motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
            <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center'
            }}>
              <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                ⚙️ Налаштування Системи
              </material_1.Typography>
              <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 3 }}>
                Конфігурація джерел даних та параметрів системи
              </material_1.Typography>
              <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5
            }}>
                Відкрити налаштування
              </material_1.Button>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Діалог деталей джерела даних */}
      <material_1.Dialog open={dataDialogOpen} onClose={() => setDataDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                borderRadius: 3
            }
        }}>
        {selectedDataSource && (<>
            <material_1.DialogTitle sx={{
                color: nexusTheme_1.nexusColors.text.primary,
                borderBottom: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
              <selectedDataSource.icon sx={{ color: selectedDataSource.color }}/>
              {selectedDataSource.name}
            </material_1.DialogTitle>
            <material_1.DialogContent sx={{ pt: 3 }}>
              <material_1.Grid container spacing={3}>
                <material_1.Grid item xs={12} md={8}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                    Інформація про джерело:
                  </material_1.Typography>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Тип: <material_1.Chip label={selectedDataSource.type} size="small" sx={{
                background: `${selectedDataSource.color}20`,
                color: selectedDataSource.color
            }}/>
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Розташування: {selectedDataSource.location}
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Розмір: {formatFileSize(selectedDataSource.size)}
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Останнє оновлення: {selectedDataSource.lastUpdated.toLocaleString()}
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                      Рівень безпеки: {getSecurityIcon(selectedDataSource.security)} {selectedDataSource.security}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Grid>

                <material_1.Grid item xs={12} md={4}>
                  <material_1.Paper sx={{ p: 2, background: `${nexusTheme_1.nexusColors.secondary.dark}30`, borderRadius: 2 }}>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                      Статистика
                    </material_1.Typography>

                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                        Статус: <material_1.Chip label={selectedDataSource.status} size="small" sx={{
                background: `${getStatusColor(selectedDataSource.status)}20`,
                color: getStatusColor(selectedDataSource.status)
            }}/>
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                        Активні з'єднання: {selectedDataSource.connections}
                      </material_1.Typography>
                    </material_1.Box>

                    <material_1.Box>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                        Продуктивність: {selectedDataSource.performance}%
                      </material_1.Typography>
                      <material_1.LinearProgress variant="determinate" value={selectedDataSource.performance} sx={{
                height: 8,
                borderRadius: 4,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${selectedDataSource.color}60, ${selectedDataSource.color})`
                }
            }}/>
                    </material_1.Box>
                  </material_1.Paper>
                </material_1.Grid>
              </material_1.Grid>
            </material_1.DialogContent>
            <material_1.DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
              <material_1.Button onClick={() => setDataDialogOpen(false)} sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                Закрити
              </material_1.Button>
              <material_1.Button variant="contained" sx={{
                background: `linear-gradient(45deg, ${selectedDataSource.color}, ${nexusTheme_1.nexusColors.primary.main})`,
                color: 'white'
            }}>
                Управляти
              </material_1.Button>
            </material_1.DialogActions>
          </>)}
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = DataManagementHub;
