import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { Storage as DataIcon, CloudUpload as UploadIcon, Download as DownloadIcon, Transform as TransformIcon, Visibility as ViewIcon, Delete as DeleteIcon, Add as AddIcon, PlayArrow as RunIcon, Stop as StopIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const DataOpsModule = () => {
    const [datasets, setDatasets] = useState([
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
    const [pipelines, setPipelines] = useState([
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
    const [selectedDataset, setSelectedDataset] = useState(null);
    // File upload handling
    const onDrop = useCallback((acceptedFiles) => {
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
                    ? { ...ds, status: 'ready', rows: Math.floor(Math.random() * 10000) + 1000, columns: Math.floor(Math.random() * 20) + 5 }
                    : ds));
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
            case 'ready': return nexusColors.emerald;
            case 'processing':
            case 'running':
            case 'uploading': return nexusColors.sapphire;
            case 'error': return nexusColors.crimson;
            case 'completed': return nexusColors.success;
            case 'stopped': return nexusColors.shadow;
            default: return nexusColors.nebula;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'csv': return nexusColors.emerald;
            case 'json': return nexusColors.sapphire;
            case 'parquet': return nexusColors.amethyst;
            case 'xml': return nexusColors.warning;
            case 'database': return nexusColors.info;
            default: return nexusColors.nebula;
        }
    };
    return (_jsx(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Typography, { variant: "h4", sx: {
                        mb: 3,
                        color: nexusColors.amethyst,
                        fontFamily: 'Orbitron',
                        textShadow: `0 0 10px ${nexusColors.amethyst}`
                    }, children: [_jsx(DataIcon, { sx: { mr: 2, verticalAlign: 'middle' } }), "\u0424\u0430\u0431\u0440\u0438\u043A\u0430 \u0414\u0430\u043D\u0438\u0445"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.emerald }, children: [_jsx(UploadIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u0422\u0435\u043B\u0435\u043F\u043E\u0440\u0442\u0430\u0446\u0456\u044F \u0414\u0430\u043D\u0438\u0445"] }), _jsxs(Box, { ...getRootProps(), sx: {
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
                                            }, children: [_jsx("input", { ...getInputProps() }), _jsx(UploadIcon, { sx: { fontSize: 48, color: nexusColors.emerald, mb: 2 } }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost, mb: 1 }, children: isDragActive ? 'Відпустіть файли тут...' : 'Перетягніть файли сюди' }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: "\u041F\u0456\u0434\u0442\u0440\u0438\u043C\u0443\u044E\u0442\u044C\u0441\u044F: CSV, JSON, Parquet, XML" })] }), _jsxs(Box, { sx: { mt: 2, display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(AddIcon, {}), onClick: () => setUploadDialogOpen(true), sx: { flex: 1 }, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0444\u0430\u0439\u043B" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(TransformIcon, {}), onClick: () => setSyntheticDialogOpen(true), sx: { flex: 1 }, children: "\u0413\u0435\u043D\u0435\u0440\u0443\u0432\u0430\u0442\u0438 \u0434\u0430\u043D\u0456" })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.sapphire }, children: [_jsx(TransformIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "ETL \u041A\u043E\u043D\u0432\u0435\u0454\u0440\u0438"] }), pipelines.map((pipeline) => (_jsxs(Box, { sx: { mb: 2, p: 2, border: `1px solid ${nexusColors.quantum}`, borderRadius: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost }, children: pipeline.name }), _jsx(Chip, { label: pipeline.status, size: "small", sx: {
                                                                backgroundColor: getStatusColor(pipeline.status),
                                                                color: nexusColors.frost
                                                            } })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: [pipeline.source, " \u2192 ", pipeline.destination] }), pipeline.status === 'running' && (_jsx(LinearProgress, { variant: "determinate", value: pipeline.progress, sx: {
                                                        mb: 1,
                                                        backgroundColor: nexusColors.darkMatter,
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: nexusColors.sapphire,
                                                        },
                                                    } })), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: ["\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0437\u0430\u043F\u0443\u0441\u043A: ", pipeline.lastRun.toLocaleString()] }), _jsxs(Box, { children: [_jsx(IconButton, { size: "small", sx: { color: nexusColors.emerald }, children: _jsx(RunIcon, {}) }), _jsx(IconButton, { size: "small", sx: { color: nexusColors.warning }, children: _jsx(StopIcon, {}) }), _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, children: _jsx(RefreshIcon, {}) })] })] })] }, pipeline.id)))] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.warning }, children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0414\u0430\u0442\u0430\u0441\u0435\u0442\u0456\u0432" }), _jsx(TableContainer, { component: Paper, sx: { backgroundColor: 'transparent' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u041D\u0430\u0437\u0432\u0430" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0422\u0438\u043F" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0420\u043E\u0437\u043C\u0456\u0440" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0420\u044F\u0434\u043A\u0438/\u041A\u043E\u043B\u043E\u043D\u043A\u0438" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0414\u0456\u0457" })] }) }), _jsx(TableBody, { children: datasets.map((dataset) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { sx: { borderColor: nexusColors.quantum }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: dataset.name }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: dataset.source })] }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Chip, { label: dataset.type.toUpperCase(), size: "small", sx: {
                                                                            backgroundColor: getTypeColor(dataset.type),
                                                                            color: nexusColors.frost
                                                                        } }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: formatFileSize(dataset.size) }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: [dataset.rows.toLocaleString(), " / ", dataset.columns] }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Chip, { label: dataset.status, size: "small", sx: {
                                                                                    backgroundColor: getStatusColor(dataset.status),
                                                                                    color: nexusColors.frost
                                                                                } }), dataset.status === 'processing' && (_jsx(LinearProgress, { sx: {
                                                                                    width: 50,
                                                                                    backgroundColor: nexusColors.darkMatter,
                                                                                    '& .MuiLinearProgress-bar': {
                                                                                        backgroundColor: nexusColors.sapphire,
                                                                                    },
                                                                                } }))] }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, onClick: () => setSelectedDataset(dataset), children: _jsx(ViewIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.emerald }, children: _jsx(DownloadIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.crimson }, children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }) })] }, dataset.id))) })] }) })] }) }) })] }), _jsxs(Dialog, { open: uploadDialogOpen, onClose: () => setUploadDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { color: nexusColors.emerald }, children: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0424\u0430\u0439\u043B\u0443" }), _jsxs(DialogContent, { children: [_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "\u041F\u0435\u0440\u0435\u0442\u044F\u0433\u043D\u0456\u0442\u044C \u0444\u0430\u0439\u043B\u0438 \u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u043D\u0438\u0436\u0447\u0435 \u0430\u0431\u043E \u043D\u0430\u0442\u0438\u0441\u043D\u0456\u0442\u044C \u0434\u043B\u044F \u0432\u0438\u0431\u043E\u0440\u0443" }), _jsxs(Box, { ...getRootProps(), sx: {
                                        border: `2px dashed ${nexusColors.quantum}`,
                                        borderRadius: 2,
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer'
                                    }, children: [_jsx("input", { ...getInputProps() }), _jsx(UploadIcon, { sx: { fontSize: 48, color: nexusColors.emerald, mb: 2 } }), _jsx(Typography, { children: "\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0444\u0430\u0439\u043B\u0438 \u0434\u043B\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F" })] })] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setUploadDialogOpen(false), children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }) })] }), _jsxs(Dialog, { open: syntheticDialogOpen, onClose: () => setSyntheticDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { color: nexusColors.amethyst }, children: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0456\u044F \u0421\u0438\u043D\u0442\u0435\u0442\u0438\u0447\u043D\u0438\u0445 \u0414\u0430\u043D\u0438\u0445" }), _jsx(DialogContent, { children: _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "\u041D\u0430\u0437\u0432\u0430 \u0434\u0430\u0442\u0430\u0441\u0435\u0442\u0443", variant: "outlined", defaultValue: "Synthetic Dataset" }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { fullWidth: true, label: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0440\u044F\u0434\u043A\u0456\u0432", type: "number", variant: "outlined", defaultValue: 1000 }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { fullWidth: true, label: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u043A\u043E\u043B\u043E\u043D\u043E\u043A", type: "number", variant: "outlined", defaultValue: 10 }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0422\u0438\u043F \u0434\u0430\u043D\u0438\u0445" }), _jsxs(Select, { defaultValue: "mixed", children: [_jsx(MenuItem, { value: "mixed", children: "\u0417\u043C\u0456\u0448\u0430\u043D\u0456 \u0434\u0430\u043D\u0456" }), _jsx(MenuItem, { value: "numerical", children: "\u0427\u0438\u0441\u043B\u043E\u0432\u0456 \u0434\u0430\u043D\u0456" }), _jsx(MenuItem, { value: "categorical", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0430\u043B\u044C\u043D\u0456 \u0434\u0430\u043D\u0456" }), _jsx(MenuItem, { value: "timeseries", children: "\u0427\u0430\u0441\u043E\u0432\u0456 \u0440\u044F\u0434\u0438" })] })] }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setSyntheticDialogOpen(false), children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }), _jsx(Button, { variant: "contained", onClick: () => setSyntheticDialogOpen(false), sx: { backgroundColor: nexusColors.emerald }, children: "\u0413\u0435\u043D\u0435\u0440\u0443\u0432\u0430\u0442\u0438" })] })] })] }) }));
};
