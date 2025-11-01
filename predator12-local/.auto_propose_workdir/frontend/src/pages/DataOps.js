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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const framer_motion_1 = require("framer-motion");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../theme/nexusTheme");
const features_1 = require("../config/features");
// import DataPipelineFlow from '../components/data/DataPipelineFlow';
const RealtimeAnalyticsEngine_1 = __importDefault(require("../components/modules/RealtimeAnalyticsEngine"));
const DataOps = () => {
    const [viewAnalytics, setViewAnalytics] = (0, react_1.useState)(false);
    const [pipelines, setPipelines] = (0, react_1.useState)([
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
    const [dataStreams] = (0, react_1.useState)([
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
    (0, react_1.useEffect)(() => {
        // Симуляція оновлення прогресу пайплайнів
        const interval = setInterval(() => {
            setPipelines(prev => prev.map(pipeline => {
                if (pipeline.status === 'running' && pipeline.progress < 100) {
                    const newProgress = Math.min(100, pipeline.progress + Math.random() * 3);
                    const newProcessed = (newProgress / 100) * pipeline.totalData;
                    return Object.assign(Object.assign({}, pipeline), { progress: newProgress, dataProcessed: newProcessed, estimatedTime: Math.max(0, pipeline.estimatedTime - 1) });
                }
                return pipeline;
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return nexusTheme_1.nexusColors.sapphire;
            case 'completed': return nexusTheme_1.nexusColors.success;
            case 'failed': return nexusTheme_1.nexusColors.error;
            case 'paused': return nexusTheme_1.nexusColors.warning;
            default: return nexusTheme_1.nexusColors.shadow;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'running': return <icons_material_1.PlayArrow />;
            case 'completed': return <icons_material_1.CheckCircle />;
            case 'failed': return <icons_material_1.Error />;
            case 'paused': return <icons_material_1.Pause />;
            default: return <icons_material_1.AccessTime />;
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    if (viewAnalytics && (0, features_1.isFeatureEnabled)('threeDee')) {
        return (<material_1.Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <RealtimeAnalyticsEngine_1.default dataStreams={dataStreams} metrics={[]} showPredictions={true}/>

        <material_1.Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <material_1.Tooltip title="Повернутися до DataOps">
            <material_1.IconButton onClick={() => setViewAnalytics(false)} sx={{
                background: `${nexusTheme_1.nexusColors.obsidian}90`,
                color: nexusTheme_1.nexusColors.frost,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.quantum}40`
            }}>
              <icons_material_1.Refresh />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Box>
      </material_1.Box>);
    }
    return (<material_1.Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <material_1.Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <material_1.Typography variant="h3" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.sapphire})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontFamily: 'Orbitron, monospace'
        }}>
              📊 Контроль Даних
            </material_1.Typography>
            <material_1.Chip label={`${pipelines.filter(p => p.status === 'running').length} ПАЙПЛАЙНІВ АКТИВНІ`} sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
            color: nexusTheme_1.nexusColors.obsidian,
            fontWeight: 600
        }}/>
          </material_1.Box>

          {(0, features_1.isFeatureEnabled)('threeDee') && (<material_1.Tooltip title="3D Аналітика">
              <material_1.IconButton onClick={() => setViewAnalytics(true)} sx={{
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.sapphire})`,
                color: nexusTheme_1.nexusColors.frost,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.quantum})`,
                    transform: 'scale(1.1)'
                }
            }}>
                <icons_material_1.Analytics />
              </material_1.IconButton>
            </material_1.Tooltip>)}
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Pipeline Flow Visualization */}
      {(0, features_1.isFeatureEnabled)('dataOps') && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <material_1.Box sx={{ mb: 4, p: 3, background: `${nexusTheme_1.nexusColors.quantum}10`, borderRadius: 2, border: `1px solid ${nexusTheme_1.nexusColors.quantum}40` }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.quantum }}>
              📊 Pipeline Flow Visualization
            </material_1.Typography>
            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow, mt: 1 }}>
              ETL Pipeline stages: Extract → Transform → Load → Index
            </material_1.Typography>
          </material_1.Box>
        </framer_motion_1.motion.div>)}

      {/* Active Pipelines */}
      <material_1.Grid container spacing={3}>
        <framer_motion_1.AnimatePresence>
          {pipelines.map((pipeline, index) => (<material_1.Grid item xs={12} md={6} lg={4} key={pipeline.id}>
              <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ scale: 1.02, y: -8 }}>
                <material_1.Card sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}95, ${nexusTheme_1.nexusColors.darkMatter}85)`,
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
            }}>
                  <material_1.CardContent sx={{ p: 3 }}>
                    {/* Pipeline Header */}
                    <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <material_1.Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: `${getStatusColor(pipeline.status)}20`,
                border: `1px solid ${getStatusColor(pipeline.status)}40`
            }}>
                          {getStatusIcon(pipeline.status)}
                        </material_1.Box>
                        <material_1.Box>
                          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontWeight: 600 }}>
                            {pipeline.name}
                          </material_1.Typography>
                          <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                            ID: {pipeline.id}
                          </material_1.Typography>
                        </material_1.Box>
                      </material_1.Box>

                      <material_1.Chip label={pipeline.status.toUpperCase()} size="small" sx={{
                backgroundColor: `${getStatusColor(pipeline.status)}20`,
                color: getStatusColor(pipeline.status),
                border: `1px solid ${getStatusColor(pipeline.status)}`,
                fontWeight: 600
            }}/>
                    </material_1.Box>

                    {/* Progress */}
                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                          Progress
                        </material_1.Typography>
                        <material_1.Typography variant="caption" sx={{ color: getStatusColor(pipeline.status), fontWeight: 600 }}>
                          {pipeline.progress.toFixed(1)}%
                        </material_1.Typography>
                      </material_1.Box>
                      <material_1.LinearProgress variant="determinate" value={pipeline.progress} sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${getStatusColor(pipeline.status)}20`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(pipeline.status),
                    borderRadius: 4
                }
            }}/>
                    </material_1.Box>

                    {/* Data Stats */}
                    <material_1.Box sx={{ mb: 2 }}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.quantum, fontWeight: 600, mb: 1, display: 'block' }}>
                        DATA PROCESSING
                      </material_1.Typography>
                      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                          {formatBytes(pipeline.dataProcessed)} / {formatBytes(pipeline.totalData)}
                        </material_1.Typography>
                        {pipeline.estimatedTime > 0 && (<material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                            ~{pipeline.estimatedTime}min left
                          </material_1.Typography>)}
                      </material_1.Box>
                    </material_1.Box>

                    {/* Last Run */}
                    <material_1.Box sx={{ mb: 2, p: 2, borderRadius: 2, background: `${nexusTheme_1.nexusColors.sapphire}10` }}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.sapphire, fontWeight: 600 }}>
                        LAST RUN
                      </material_1.Typography>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, mt: 0.5 }}>
                        {pipeline.lastRun.toLocaleString()}
                      </material_1.Typography>
                    </material_1.Box>

                    {/* Actions */}
                    <material_1.Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: `1px solid ${nexusTheme_1.nexusColors.shadow}30` }}>
                      <material_1.Tooltip title={pipeline.status === 'running' ? 'Пауза' : 'Запуск'}>
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.frost, '&:hover': { color: getStatusColor(pipeline.status) } }}>
                          {pipeline.status === 'running' ? <icons_material_1.Pause /> : <icons_material_1.PlayArrow />}
                        </material_1.IconButton>
                      </material_1.Tooltip>
                      <material_1.Tooltip title="Завантажити Логи">
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.frost, '&:hover': { color: nexusTheme_1.nexusColors.quantum } }}>
                          <icons_material_1.Download />
                        </material_1.IconButton>
                      </material_1.Tooltip>
                      <material_1.Tooltip title="Перезапустити">
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.frost, '&:hover': { color: nexusTheme_1.nexusColors.emerald } }}>
                          <icons_material_1.Refresh />
                        </material_1.IconButton>
                      </material_1.Tooltip>
                    </material_1.Box>
                  </material_1.CardContent>

                  {/* Animated progress line */}
                  {pipeline.status === 'running' && (<material_1.Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${getStatusColor(pipeline.status)}, transparent)`,
                    animation: 'data-flow 2s ease-in-out infinite'
                }}/>)}
                </material_1.Card>
              </framer_motion_1.motion.div>
            </material_1.Grid>))}
        </framer_motion_1.AnimatePresence>
      </material_1.Grid>

      {/* Quick Actions */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
        <material_1.Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <material_1.Button startIcon={<icons_material_1.CloudUpload />} variant="contained" sx={{
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.quantum})`,
            color: nexusTheme_1.nexusColors.obsidian,
            fontWeight: 600,
            '&:hover': {
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.emerald})`,
                transform: 'translateY(-2px)'
            }
        }}>
            Upload Dataset
          </material_1.Button>

          <material_1.Button startIcon={<icons_material_1.Transform />} variant="outlined" sx={{
            borderColor: nexusTheme_1.nexusColors.sapphire,
            color: nexusTheme_1.nexusColors.sapphire,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.quantum,
                color: nexusTheme_1.nexusColors.quantum,
                background: `${nexusTheme_1.nexusColors.quantum}10`
            }
        }}>
            Create Pipeline
          </material_1.Button>

          <material_1.Button startIcon={<icons_material_1.DataObject />} variant="outlined" sx={{
            borderColor: nexusTheme_1.nexusColors.frost,
            color: nexusTheme_1.nexusColors.frost,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.emerald,
                color: nexusTheme_1.nexusColors.emerald,
                background: `${nexusTheme_1.nexusColors.emerald}10`
            }
        }}>
            Generate Synthetic Data
          </material_1.Button>
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes data-flow {
            0%, 100% { opacity: 0.5; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(100%); }
          }
        `}
      </style>
    </material_1.Box>);
};
exports.default = DataOps;
