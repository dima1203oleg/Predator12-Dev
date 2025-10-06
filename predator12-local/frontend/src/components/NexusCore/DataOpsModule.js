import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, LinearProgress, IconButton, Paper } from '@mui/material';
import { CloudUpload as UploadIcon, Transform as TransformIcon, DataObject as DataIcon, Refresh as RefreshIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { nexusColors } from '../../theme/nexusTheme';
const DataOpsModule = () => {
    const [datasets, setDatasets] = useState([
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
    const [pipelines, setPipelines] = useState([
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const onDrop = useCallback((acceptedFiles) => {
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
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
            case 'completed': return nexusColors.success;
            case 'processing':
            case 'running': return nexusColors.warning;
            case 'error':
            case 'failed': return nexusColors.crimson;
            case 'queued': return nexusColors.sapphire;
            default: return nexusColors.nebula;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'CSV': return nexusColors.emerald;
            case 'JSON': return nexusColors.sapphire;
            case 'Parquet': return nexusColors.amethyst;
            case 'SQL': return nexusColors.warning;
            default: return nexusColors.nebula;
        }
    };
    return (_jsx(Box, { sx: {
            height: '100%',
            p: 3,
            background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`
        }, children: _jsxs(Grid, { container: true, spacing: 3, sx: { height: '100%' }, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.emerald}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(UploadIcon, { sx: { color: nexusColors.emerald, mr: 2, fontSize: 28 } }), _jsx(Typography, { variant: "h6", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron'
                                            }, children: "Data Teleportation" })] }), _jsxs(Box, { ...getRootProps(), sx: {
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
                                    }, children: [_jsx("input", { ...getInputProps() }), isUploading ? (_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, style: { textAlign: 'center' }, children: [_jsx(Box, { sx: {
                                                        width: 100,
                                                        height: 100,
                                                        borderRadius: '50%',
                                                        border: `4px solid ${nexusColors.emerald}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mb: 2,
                                                        animation: 'pulse 1s infinite'
                                                    }, children: _jsxs(Typography, { variant: "h4", sx: { color: nexusColors.emerald }, children: [Math.round(uploadProgress), "%"] }) }), _jsx(Typography, { sx: { color: nexusColors.emerald }, children: "Teleporting Data..." })] })) : (_jsxs(motion.div, { whileHover: { scale: 1.05 }, style: { textAlign: 'center' }, children: [_jsx(UploadIcon, { sx: { fontSize: 64, color: nexusColors.emerald, mb: 2 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 1 }, children: isDragActive ? 'Activate Teleportation' : 'Drag & Drop Files' }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "Support: CSV, JSON, Parquet" })] })), isDragActive && (_jsx(Box, { sx: {
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: `radial-gradient(circle, ${nexusColors.emerald}20 0%, transparent 70%)`,
                                                animation: 'pulse 0.5s infinite'
                                            } }))] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.sapphire}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(DataIcon, { sx: { color: nexusColors.sapphire, mr: 2 } }), _jsx(Typography, { variant: "h6", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron'
                                            }, children: "Dataset Crystal Matrix" }), _jsx(IconButton, { size: "small", sx: { ml: 'auto', color: nexusColors.nebula }, children: _jsx(RefreshIcon, {}) })] }), _jsx(TableContainer, { sx: {
                                        flex: 1,
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: nexusColors.sapphire,
                                            borderRadius: '3px'
                                        }
                                    }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: nexusColors.frost, borderColor: nexusColors.quantum }, children: "Dataset" }), _jsx(TableCell, { sx: { color: nexusColors.frost, borderColor: nexusColors.quantum }, children: "Type" }), _jsx(TableCell, { sx: { color: nexusColors.frost, borderColor: nexusColors.quantum }, children: "Size" }), _jsx(TableCell, { sx: { color: nexusColors.frost, borderColor: nexusColors.quantum }, children: "Status" }), _jsx(TableCell, { sx: { color: nexusColors.frost, borderColor: nexusColors.quantum }, children: "Records" })] }) }), _jsx(TableBody, { children: datasets.map((dataset, index) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: index * 0.1 }, style: {
                                                        background: `linear-gradient(90deg, ${nexusColors.quantum}05, transparent)`,
                                                        borderBottom: `1px solid ${nexusColors.quantum}40`
                                                    }, children: [_jsx(TableCell, { sx: { color: nexusColors.frost, borderColor: nexusColors.quantum }, children: _jsx(Typography, { variant: "body2", sx: { fontFamily: 'Fira Code' }, children: dataset.name }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Chip, { label: dataset.type, size: "small", sx: {
                                                                    backgroundColor: `${getTypeColor(dataset.type)}30`,
                                                                    color: getTypeColor(dataset.type),
                                                                    fontSize: '0.7rem'
                                                                } }) }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: dataset.size }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx("div", { className: dataset.status === 'processing' ? 'pulse-element' : '', style: {
                                                                            width: 8,
                                                                            height: 8,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: getStatusColor(dataset.status)
                                                                        } }), _jsx(Typography, { variant: "caption", sx: {
                                                                            color: getStatusColor(dataset.status),
                                                                            textTransform: 'uppercase'
                                                                        }, children: dataset.status })] }) }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: dataset.records.toLocaleString() })] }, dataset.id))) })] }) })] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.amethyst}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)'
                        }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(TransformIcon, { sx: { color: nexusColors.amethyst, mr: 2, fontSize: 28 } }), _jsx(Typography, { variant: "h6", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron'
                                            }, children: "Neural ETL Pipeline Matrix" })] }), _jsx(Grid, { container: true, spacing: 2, children: pipelines.map((pipeline, index) => (_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: index * 0.1 }, children: _jsxs(Paper, { sx: {
                                                    p: 2,
                                                    background: `linear-gradient(135deg, ${nexusColors.quantum}10, ${nexusColors.quantum}05)`,
                                                    border: `1px solid ${getStatusColor(pipeline.status)}40`,
                                                    borderRadius: 2,
                                                    backdropFilter: 'blur(10px)'
                                                }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", sx: {
                                                                    color: nexusColors.frost,
                                                                    fontFamily: 'Fira Code'
                                                                }, children: pipeline.name }), _jsx(Chip, { label: pipeline.status, size: "small", sx: {
                                                                    backgroundColor: `${getStatusColor(pipeline.status)}30`,
                                                                    color: getStatusColor(pipeline.status),
                                                                    fontSize: '0.7rem'
                                                                } })] }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula, display: 'block', mb: 1 }, children: [pipeline.source, " \u2192 ", pipeline.target] }), _jsxs(Box, { sx: { mb: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: "Progress" }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: [pipeline.progress, "%"] })] }), _jsx(LinearProgress, { variant: "determinate", value: pipeline.progress, sx: {
                                                                    height: 4,
                                                                    borderRadius: 2,
                                                                    backgroundColor: `${getStatusColor(pipeline.status)}20`,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: getStatusColor(pipeline.status)
                                                                    }
                                                                } })] }), pipeline.status === 'queued' && (_jsx(Button, { size: "small", startIcon: _jsx(PlayIcon, {}), sx: {
                                                            color: nexusColors.emerald,
                                                            border: `1px solid ${nexusColors.emerald}40`,
                                                            '&:hover': {
                                                                backgroundColor: `${nexusColors.emerald}10`
                                                            }
                                                        }, children: "Start Pipeline" }))] }) }) }, pipeline.id))) })] }) }) })] }) }));
};
export default DataOpsModule;
