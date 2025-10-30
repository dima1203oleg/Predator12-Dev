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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const react_dropzone_1 = require("react-dropzone");
const nexusTheme_1 = require("../../theme/nexusTheme");
const DataOpsModule = () => {
    const [datasets, setDatasets] = (0, react_1.useState)([
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
    const [pipelines, setPipelines] = (0, react_1.useState)([
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
    const [uploadProgress, setUploadProgress] = (0, react_1.useState)(0);
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const onDrop = (0, react_1.useCallback)((acceptedFiles) => {
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
                        const newDataset = {
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
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/json': ['.json'],
            'application/parquet': ['.parquet']
        }
    });
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'completed': return nexusTheme_1.nexusColors.success;
            case 'processing':
            case 'running': return nexusTheme_1.nexusColors.warning;
            case 'error':
            case 'failed': return nexusTheme_1.nexusColors.crimson;
            case 'queued': return nexusTheme_1.nexusColors.sapphire;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'CSV': return nexusTheme_1.nexusColors.emerald;
            case 'JSON': return nexusTheme_1.nexusColors.sapphire;
            case 'Parquet': return nexusTheme_1.nexusColors.amethyst;
            case 'SQL': return nexusTheme_1.nexusColors.warning;
            default: return nexusTheme_1.nexusColors.nebula;
        }
    };
    return (<material_1.Box sx={{
            height: '100%',
            p: 3,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.void} 0%, ${nexusTheme_1.nexusColors.obsidian} 50%, ${nexusTheme_1.nexusColors.darkMatter} 100%)`
        }}>
      <material_1.Grid container spacing={3} sx={{ height: '100%' }}>

        {/* Data Teleportation Zone */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusTheme_1.nexusColors.emerald}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
        }}>
            <material_1.CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <icons_material_1.CloudUpload sx={{ color: nexusTheme_1.nexusColors.emerald, mr: 2, fontSize: 28 }}/>
                <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron'
        }}>
                  Data Teleportation
                </material_1.Typography>
              </material_1.Box>

              {/* Drop Zone */}
              <material_1.Box {...getRootProps()} sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px dashed ${isDragActive ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            backgroundColor: isDragActive ? `${nexusTheme_1.nexusColors.emerald}10` : `${nexusTheme_1.nexusColors.quantum}05`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.emerald,
                backgroundColor: `${nexusTheme_1.nexusColors.emerald}10`,
                boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.emerald}20`
            }
        }}>
                <input {...getInputProps()}/>

                {isUploading ? (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
                    <material_1.Box sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: `4px solid ${nexusTheme_1.nexusColors.emerald}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                animation: 'pulse 1s infinite'
            }}>
                      <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                        {Math.round(uploadProgress)}%
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                      Teleporting Data...
                    </material_1.Typography>
                  </framer_motion_1.motion.div>) : (<framer_motion_1.motion.div whileHover={{ scale: 1.05 }} style={{ textAlign: 'center' }}>
                    <icons_material_1.CloudUpload sx={{ fontSize: 64, color: nexusTheme_1.nexusColors.emerald, mb: 2 }}/>
                    <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                      {isDragActive ? 'Activate Teleportation' : 'Drag & Drop Files'}
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                      Support: CSV, JSON, Parquet
                    </material_1.Typography>
                  </framer_motion_1.motion.div>)}

                {/* Particle effects for teleportation */}
                {isDragActive && (<material_1.Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle, ${nexusTheme_1.nexusColors.emerald}20 0%, transparent 70%)`,
                animation: 'pulse 0.5s infinite'
            }}/>)}
              </material_1.Box>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Dataset Registry */}
        <material_1.Grid item xs={12} md={8}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusTheme_1.nexusColors.sapphire}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            height: '100%'
        }}>
            <material_1.CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <icons_material_1.DataObject sx={{ color: nexusTheme_1.nexusColors.sapphire, mr: 2 }}/>
                <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron'
        }}>
                  Dataset Crystal Matrix
                </material_1.Typography>
                <material_1.IconButton size="small" sx={{ ml: 'auto', color: nexusTheme_1.nexusColors.nebula }}>
                  <icons_material_1.Refresh />
                </material_1.IconButton>
              </material_1.Box>

              <material_1.TableContainer sx={{
            flex: 1,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': {
                background: nexusTheme_1.nexusColors.sapphire,
                borderRadius: '3px'
            }
        }}>
                <material_1.Table>
                  <material_1.TableHead>
                    <material_1.TableRow>
                      <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.frost, borderColor: nexusTheme_1.nexusColors.quantum }}>
                        Dataset
                      </material_1.TableCell>
                      <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.frost, borderColor: nexusTheme_1.nexusColors.quantum }}>
                        Type
                      </material_1.TableCell>
                      <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.frost, borderColor: nexusTheme_1.nexusColors.quantum }}>
                        Size
                      </material_1.TableCell>
                      <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.frost, borderColor: nexusTheme_1.nexusColors.quantum }}>
                        Status
                      </material_1.TableCell>
                      <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.frost, borderColor: nexusTheme_1.nexusColors.quantum }}>
                        Records
                      </material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableHead>
                  <material_1.TableBody>
                    {datasets.map((dataset, index) => (<framer_motion_1.motion.tr key={dataset.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} style={{
                background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.quantum}05, transparent)`,
                borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}40`
            }}>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.frost, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          <material_1.Typography variant="body2" sx={{ fontFamily: 'Fira Code' }}>
                            {dataset.name}
                          </material_1.Typography>
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                          <material_1.Chip label={dataset.type} size="small" sx={{
                backgroundColor: `${getTypeColor(dataset.type)}30`,
                color: getTypeColor(dataset.type),
                fontSize: '0.7rem'
            }}/>
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          {dataset.size}
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ borderColor: nexusTheme_1.nexusColors.quantum }}>
                          <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <div className={dataset.status === 'processing' ? 'pulse-element' : ''} style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getStatusColor(dataset.status)
            }}/>
                            <material_1.Typography variant="caption" sx={{
                color: getStatusColor(dataset.status),
                textTransform: 'uppercase'
            }}>
                              {dataset.status}
                            </material_1.Typography>
                          </material_1.Box>
                        </material_1.TableCell>
                        <material_1.TableCell sx={{ color: nexusTheme_1.nexusColors.nebula, borderColor: nexusTheme_1.nexusColors.quantum }}>
                          {dataset.records.toLocaleString()}
                        </material_1.TableCell>
                      </framer_motion_1.motion.tr>))}
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* ETL Pipeline Status */}
        <material_1.Grid item xs={12}>
          <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E6, ${nexusTheme_1.nexusColors.darkMatter}CC)`,
            border: `2px solid ${nexusTheme_1.nexusColors.amethyst}40`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
        }}>
            <material_1.CardContent>
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <icons_material_1.Transform sx={{ color: nexusTheme_1.nexusColors.amethyst, mr: 2, fontSize: 28 }}/>
                <material_1.Typography variant="h6" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron'
        }}>
                  Neural ETL Pipeline Matrix
                </material_1.Typography>
              </material_1.Box>

              <material_1.Grid container spacing={2}>
                {pipelines.map((pipeline, index) => (<material_1.Grid item xs={12} md={4} key={pipeline.id}>
                    <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                      <material_1.Paper sx={{
                p: 2,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.quantum}10, ${nexusTheme_1.nexusColors.quantum}05)`,
                border: `1px solid ${getStatusColor(pipeline.status)}40`,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }}>
                        <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <material_1.Typography variant="subtitle2" sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontFamily: 'Fira Code'
            }}>
                            {pipeline.name}
                          </material_1.Typography>
                          <material_1.Chip label={pipeline.status} size="small" sx={{
                backgroundColor: `${getStatusColor(pipeline.status)}30`,
                color: getStatusColor(pipeline.status),
                fontSize: '0.7rem'
            }}/>
                        </material_1.Box>

                        <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula, display: 'block', mb: 1 }}>
                          {pipeline.source} → {pipeline.target}
                        </material_1.Typography>

                        <material_1.Box sx={{ mb: 1 }}>
                          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                              Progress
                            </material_1.Typography>
                            <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                              {pipeline.progress}%
                            </material_1.Typography>
                          </material_1.Box>
                          <material_1.LinearProgress variant="determinate" value={pipeline.progress} sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: `${getStatusColor(pipeline.status)}20`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(pipeline.status)
                }
            }}/>
                        </material_1.Box>

                        {pipeline.status === 'queued' && (<material_1.Button size="small" startIcon={<icons_material_1.PlayArrow />} sx={{
                    color: nexusTheme_1.nexusColors.emerald,
                    border: `1px solid ${nexusTheme_1.nexusColors.emerald}40`,
                    '&:hover': {
                        backgroundColor: `${nexusTheme_1.nexusColors.emerald}10`
                    }
                }}>
                            Start Pipeline
                          </material_1.Button>)}
                      </material_1.Paper>
                    </framer_motion_1.motion.div>
                  </material_1.Grid>))}
              </material_1.Grid>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

      </material_1.Grid>
    </material_1.Box>);
};
exports.default = DataOpsModule;
