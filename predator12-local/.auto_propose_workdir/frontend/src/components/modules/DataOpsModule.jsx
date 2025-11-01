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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataOpsModule = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_dropzone_1 = require("react-dropzone");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const DataOpsModule = () => {
    const [datasets, setDatasets] = (0, react_1.useState)([
        {
            id: '1',
            name: 'User Analytics Data',
            type: 'csv',
            size: 2.5 * 1024 * 1024,
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
            size: 8.7 * 1024 * 1024,
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
            size: 1.2 * 1024 * 1024,
            rows: 8500,
            columns: 15,
            status: 'ready',
            lastModified: new Date('2024-01-16'),
            source: 'monitoring_stack'
        }
    ]);
    const [pipelines, setPipelines] = (0, react_1.useState)([
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
    const [uploadDialogOpen, setUploadDialogOpen] = (0, react_1.useState)(false);
    const [syntheticDialogOpen, setSyntheticDialogOpen] = (0, react_1.useState)(false);
    const [selectedDataset, setSelectedDataset] = (0, react_1.useState)(null);
    // File upload handling
    const onDrop = (0, react_1.useCallback)((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const newDataset = {
                id: Date.now().toString(),
                name: file.name,
                type: file.name.split('.').pop() || 'csv',
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
                setDatasets(prev => prev.map(ds => ds.id === newDataset.id
                    ? Object.assign(Object.assign({}, ds), { status: 'ready', rows: Math.floor(Math.random() * 10000) + 1000, columns: Math.floor(Math.random() * 20) + 5 }) : ds));
            }, 2000);
        });
        setUploadDialogOpen(false);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/json': ['.json'],
            'application/parquet': ['.parquet'],
            'text/xml': ['.xml']
        }
    });
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return nexusTheme_1.nexusColors.emerald;
            case 'processing':
            case 'running':
            case 'uploading': return nexusTheme_1.nexusColors.sapphire;
            case 'error': return nexusTheme_1.nexusColors.crimson;
            case 'completed': return nexusTheme_1.nexusColors.success;
            case 'stopped': return nexusTheme_1.nexusColors.shadow;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'csv': return nexusTheme_1.nexusColors.emerald;
            case 'json': return nexusTheme_1.nexusColors.sapphire;
            case 'parquet': return nexusTheme_1.nexusColors.amethyst;
            case 'xml': return nexusTheme_1.nexusColors.warning;
            case 'database': return nexusTheme_1.nexusColors.info;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    return (<material_1.Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Typography variant="h4" sx={{
            mb: 3,
            color: nexusTheme_1.nexusColors.amethyst,
            fontFamily: 'Orbitron',
            textShadow: `0 0 10px ${nexusTheme_1.nexusColors.amethyst}`
        }}>
          <icons_material_1.Storage sx={{ mr: 2, verticalAlign: 'middle' }}/>
          Фабрика Даних
        </material_1.Typography>

        <material_1.Grid container spacing={3}>
          {/* Data Upload Zone */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.emerald }}>
                  <icons_material_1.CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }}/>
                  Телепортація Даних
                </material_1.Typography>

                <material_1.Box {...getRootProps()} sx={{
            border: `2px dashed ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: isDragActive
                ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}20, transparent)`
                : 'transparent',
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.emerald,
                boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.emerald}30`
            }
        }}>
                  <input {...getInputProps()}/>
                  <icons_material_1.CloudUpload sx={{ fontSize: 48, color: nexusTheme_1.nexusColors.emerald, mb: 2 }}/>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                    {isDragActive ? 'Відпустіть файли тут...' : 'Перетягніть файли сюди'}
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                    Підтримуються: CSV, JSON, Parquet, XML
                  </material_1.Typography>
                </material_1.Box>

                <material_1.Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <material_1.Button variant="outlined" startIcon={<icons_material_1.Add />} onClick={() => setUploadDialogOpen(true)} sx={{ flex: 1 }}>
                    Завантажити файл
                  </material_1.Button>
                  <material_1.Button variant="outlined" startIcon={<icons_material_1.Transform />} onClick={() => setSyntheticDialogOpen(true)} sx={{ flex: 1 }}>
                    Генерувати дані
                  </material_1.Button>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* ETL Pipelines */}
          <material_1.Grid item xs={12} md={6}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.sapphire }}>
                  <icons_material_1.Transform sx={{ mr: 1, verticalAlign: 'middle' }}/>
                  ETL Конвеєри
                </material_1.Typography>

                {pipelines.map((pipeline) => (<material_1.Box key={pipeline.id} sx={{ mb: 2, p: 2, border: `1px solid ${nexusTheme_1.nexusColors.quantum}`, borderRadius: 1 }}>
                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                        {pipeline.name}
                      </material_1.Typography>
                      <material_1.Chip label={pipeline.status} size="small" sx={{
                backgroundColor: getStatusColor(pipeline.status),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                    </material_1.Box>

                    <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 1 }}>
                      {pipeline.source} → {pipeline.destination}
                    </material_1.Typography>

                    {pipeline.status === 'running' && (<material_1.LinearProgress variant="determinate" value={pipeline.progress} sx={{
                    mb: 1,
                    backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: nexusTheme_1.nexusColors.sapphire,
                    },
                }}/>)}

                    <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                        Останній запуск: {pipeline.lastRun.toLocaleString()}
                      </material_1.Typography>
                      <material_1.Box>
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                          <icons_material_1.PlayArrow />
                        </material_1.IconButton>
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.warning }}>
                          <icons_material_1.Stop />
                        </material_1.IconButton>
                        <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                          <icons_material_1.Refresh />
                        </material_1.IconButton>
                      </material_1.Box>
                    </material_1.Box>
                  </material_1.Box>))}
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>

          {/* Datasets Table */}
          <material_1.Grid item xs={12}>
            <material_1.Card className="holographic">
              <material_1.CardContent>
                <material_1.Typography variant="h6" sx={{ mb: 2, color: nexusTheme_1.nexusColors.warning }}>
                  Каталог Датасетів
                </material_1.Typography>

                <material_1.TableContainer component={material_1.Paper} sx={{ backgroundColor: 'transparent' }}>
                  <material_1.Table>
                    <material_1.TableHead>
                      <material_1.TableRow>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Назва
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Тип
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Розмір
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Рядки/Колонки
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Статус
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          Дії
                        </material_1.TableCell>
                      </material_1.TableRow>
                    </material_1.TableHead>
                    <material_1.TableBody>
                      {datasets.map((dataset) => (<material_1.TableRow key={dataset.id}>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                              {dataset.name}
                            </material_1.Typography>
                            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                              {dataset.source}
                            </material_1.Typography>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Chip label={dataset.type.toUpperCase()} size="small" sx={{
                backgroundColor: getTypeColor(dataset.type),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                              {formatFileSize(dataset.size)}
                            </material_1.Typography>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                              {dataset.rows.toLocaleString()} / {dataset.columns}
                            </material_1.Typography>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <material_1.Chip label={dataset.status} size="small" sx={{
                backgroundColor: getStatusColor(dataset.status),
                color: nexusTheme_1.nexusColors.frost
            }}/>
                              {dataset.status === 'processing' && (<material_1.LinearProgress sx={{
                    width: 50,
                    backgroundColor: nexusTheme_1.nexusColors.darkMatter,
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: nexusTheme_1.nexusColors.sapphire,
                    },
                }}/>)}
                            </material_1.Box>
                          </material_1.TableCell>
                          <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                            <material_1.Box sx={{ display: 'flex', gap: 0.5 }}>
                              <material_1.Tooltip title="Переглянути">
                                <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.sapphire }} onClick={() => setSelectedDataset(dataset)}>
                                  <icons_material_1.Visibility fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>
                              <material_1.Tooltip title="Завантажити">
                                <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                                  <icons_material_1.Download fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>
                              <material_1.Tooltip title="Видалити">
                                <material_1.IconButton size="small" sx={{ color: nexusTheme_1.nexusColors.crimson }}>
                                  <icons_material_1.Delete fontSize="small"/>
                                </material_1.IconButton>
                              </material_1.Tooltip>
                            </material_1.Box>
                          </material_1.TableCell>
                        </material_1.TableRow>))}
                    </material_1.TableBody>
                  </material_1.Table>
                </material_1.TableContainer>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>

        {/* Upload Dialog */}
        <material_1.Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.emerald }}>
            Завантаження Файлу
          </material_1.DialogTitle>
          <material_1.DialogContent>
            <material_1.Alert severity="info" sx={{ mb: 2 }}>
              Перетягніть файли в область нижче або натисніть для вибору
            </material_1.Alert>
            <material_1.Box {...getRootProps()} sx={{
            border: `2px dashed ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer'
        }}>
              <input {...getInputProps()}/>
              <icons_material_1.CloudUpload sx={{ fontSize: 48, color: nexusTheme_1.nexusColors.emerald, mb: 2 }}/>
              <material_1.Typography>Оберіть файли для завантаження</material_1.Typography>
            </material_1.Box>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={() => setUploadDialogOpen(false)}>Скасувати</material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>

        {/* Synthetic Data Dialog */}
        <material_1.Dialog open={syntheticDialogOpen} onClose={() => setSyntheticDialogOpen(false)} maxWidth="sm" fullWidth>
          <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.amethyst }}>
            Генерація Синтетичних Даних
          </material_1.DialogTitle>
          <material_1.DialogContent>
            <material_1.Grid container spacing={2} sx={{ mt: 1 }}>
              <material_1.Grid item xs={12}>
                <material_1.TextField fullWidth label="Назва датасету" variant="outlined" defaultValue="Synthetic Dataset"/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.TextField fullWidth label="Кількість рядків" type="number" variant="outlined" defaultValue={1000}/>
              </material_1.Grid>
              <material_1.Grid item xs={6}>
                <material_1.TextField fullWidth label="Кількість колонок" type="number" variant="outlined" defaultValue={10}/>
              </material_1.Grid>
              <material_1.Grid item xs={12}>
                <material_1.FormControl fullWidth>
                  <material_1.InputLabel>Тип даних</material_1.InputLabel>
                  <material_1.Select defaultValue="mixed">
                    <material_1.MenuItem value="mixed">Змішані дані</material_1.MenuItem>
                    <material_1.MenuItem value="numerical">Числові дані</material_1.MenuItem>
                    <material_1.MenuItem value="categorical">Категоріальні дані</material_1.MenuItem>
                    <material_1.MenuItem value="timeseries">Часові ряди</material_1.MenuItem>
                  </material_1.Select>
                </material_1.FormControl>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={() => setSyntheticDialogOpen(false)}>Скасувати</material_1.Button>
            <material_1.Button variant="contained" onClick={() => setSyntheticDialogOpen(false)} sx={{ backgroundColor: nexusTheme_1.nexusColors.emerald }}>
              Генерувати
            </material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>
      </framer_motion_1.motion.div>
    </material_1.Box>);
};
exports.DataOpsModule = DataOpsModule;
