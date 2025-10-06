import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Sparkles, Line, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { useHotkeys } from 'react-hotkeys-hook';
import * as THREE from 'three';
import { Box, Typography, Card, CardContent, Chip, TextField, IconButton, Paper, List, ListItem, ListItemText, Switch, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
// 3D вузол системи як "планета"
const SystemPlanet = ({ node, onClick, isSelected, isFiltered }) => {
    const meshRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    // Анімація обертання та пульсації
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            // Пульсація залежно від статусу
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
            const scale = node.status === 'processing' ? pulse * 1.2 :
                node.status === 'error' ? pulse * 1.3 : pulse;
            meshRef.current.scale.setScalar(scale * (isSelected ? 1.4 : 1));
        }
    });
    // Кольори залежно від типу та статусу
    const getNodeColor = () => {
        if (node.status === 'error')
            return '#ff0066';
        if (node.status === 'warning')
            return '#ffaa00';
        if (node.status === 'processing')
            return '#00aaff';
        switch (node.type) {
            case 'frontend': return '#00ff66';
            case 'service': return '#0099ff';
            case 'database': return '#9900ff';
            case 'queue': return '#ff9900';
            case 'api': return '#00ffaa';
            default: return '#ffffff';
        }
    };
    const getNodeSize = () => {
        switch (node.type) {
            case 'database': return 0.8;
            case 'queue': return 0.6;
            case 'service': return 0.7;
            case 'frontend': return 0.9;
            default: return 0.5;
        }
    };
    if (isFiltered)
        return null;
    return (_jsxs("group", { position: node.position, children: [_jsxs("mesh", { ref: meshRef, onClick: onClick, onPointerOver: () => setHovered(true), onPointerOut: () => setHovered(false), scale: getNodeSize(), children: [_jsx("sphereGeometry", { args: [1, 32, 32] }), _jsx("meshStandardMaterial", { color: getNodeColor(), transparent: true, opacity: hovered ? 0.9 : 0.7, emissive: getNodeColor(), emissiveIntensity: hovered ? 0.3 : 0.1 })] }), node.status === 'processing' && (_jsx(Sparkles, { count: 20, scale: [2, 2, 2], size: 1, speed: 0.6, color: getNodeColor() })), _jsx(Html, { position: [0, 1.5, 0], center: true, children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, style: {
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: getNodeColor(),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        border: `1px solid ${getNodeColor()}`,
                        textAlign: 'center',
                        minWidth: '80px'
                    }, children: [node.name, _jsx("br", {}), _jsxs("span", { style: { fontSize: '10px', opacity: 0.8 }, children: [node.metrics.latency, "ms | ", node.metrics.throughput, "/s"] })] }) })] }));
};
// Анімований потік даних між вузлами
const DataFlowLine = ({ flow, nodes, isVisible }) => {
    const lineRef = useRef(null);
    const [particles, setParticles] = useState([]);
    const fromNode = nodes.find(n => n.id === flow.from);
    const toNode = nodes.find(n => n.id === flow.to);
    useEffect(() => {
        if (fromNode && toNode && isVisible) {
            // Створюємо частинки для анімації потоку
            const particleCount = Math.min(flow.volume, 10);
            const newParticles = [];
            for (let i = 0; i < particleCount; i++) {
                const progress = i / particleCount;
                const position = new THREE.Vector3()
                    .lerpVectors(new THREE.Vector3(...fromNode.position), new THREE.Vector3(...toNode.position), progress);
                newParticles.push(position);
            }
            setParticles(newParticles);
        }
    }, [flow, fromNode, toNode, isVisible]);
    useFrame((state, delta) => {
        if (particles.length > 0 && fromNode && toNode) {
            // Анімуємо частинки по лінії
            setParticles(prevParticles => prevParticles.map((particle, index) => {
                const speed = flow.status === 'active' ? 0.02 : 0.005;
                const progress = (index / prevParticles.length + state.clock.elapsedTime * speed) % 1;
                return new THREE.Vector3()
                    .lerpVectors(new THREE.Vector3(...fromNode.position), new THREE.Vector3(...toNode.position), progress);
            }));
        }
    });
    if (!fromNode || !toNode || !isVisible)
        return null;
    const getFlowColor = () => {
        if (flow.status === 'error')
            return '#ff0066';
        switch (flow.dataType) {
            case 'import': return '#00ff66';
            case 'query': return '#0099ff';
            case 'sync': return '#ffaa00';
            case 'alert': return '#ff6600';
            default: return '#ffffff';
        }
    };
    return (_jsxs("group", { ref: lineRef, children: [_jsx(Line, { points: [fromNode.position, toNode.position], color: getFlowColor(), lineWidth: flow.volume / 10, transparent: true, opacity: 0.6 }), particles.map((position, index) => (_jsxs("mesh", { position: position.toArray(), children: [_jsx("sphereGeometry", { args: [0.05, 8, 8] }), _jsx("meshBasicMaterial", { color: getFlowColor(), transparent: true, opacity: 0.8 })] }, index)))] }));
};
// Головний компонент Data Flow Map
const DataFlowMap = ({ nodes, flows, onNodeClick, onFlowClick, enableVoiceControl = true }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [filteredNodeTypes, setFilteredNodeTypes] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showMetrics, setShowMetrics] = useState(true);
    // Фільтрація вузлів
    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !filteredNodeTypes.has(node.type);
        return matchesSearch && matchesType;
    });
    // Обробка кліку по вузлу
    const handleNodeClick = useCallback((node) => {
        setSelectedNode(node);
        onNodeClick?.(node);
    }, [onNodeClick]);
    // Жести
    const bind = useGesture({
        onPinch: ({ offset: [scale] }) => {
            // Zoom logic handled by OrbitControls
        },
        onDoubleClick: () => {
            setSelectedNode(null);
        }
    });
    // Гарячі клавіші
    useHotkeys('escape', () => setSelectedNode(null));
    useHotkeys('space', () => setIsPaused(!isPaused));
    useHotkeys('r', () => setAutoRotate(!autoRotate));
    useHotkeys('m', () => setShowMetrics(!showMetrics));
    // Голосові команди
    useEffect(() => {
        if (enableVoiceControl && 'webkitSpeechRecognition' in window) {
            // Voice control implementation would go here
        }
    }, [enableVoiceControl]);
    return (_jsxs(Box, { sx: { display: 'flex', height: '100vh', background: '#0a0a0f' }, children: [_jsxs(Paper, { elevation: 3, sx: {
                    width: 300,
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #333',
                    p: 2,
                    overflowY: 'auto'
                }, children: [_jsx(TextField, { fullWidth: true, placeholder: "\u041F\u043E\u0448\u0443\u043A \u0432\u0443\u0437\u043B\u0456\u0432...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), InputProps: {
                            startAdornment: _jsx(SearchIcon, { sx: { color: '#00ff66', mr: 1 } })
                        }, sx: {
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                color: '#00ff66',
                                '& fieldset': { borderColor: '#333' },
                                '&:hover fieldset': { borderColor: '#00ff66' },
                                '&.Mui-focused fieldset': { borderColor: '#00ff66' }
                            }
                        } }), _jsx(Typography, { variant: "h6", sx: { color: '#00ff66', mb: 1 }, children: "\u0424\u0456\u043B\u044C\u0442\u0440\u0438" }), ['service', 'database', 'queue', 'api', 'frontend'].map(type => (_jsx(FormControlLabel, { control: _jsx(Switch, { checked: !filteredNodeTypes.has(type), onChange: (e) => {
                                const newFiltered = new Set(filteredNodeTypes);
                                if (e.target.checked) {
                                    newFiltered.delete(type);
                                }
                                else {
                                    newFiltered.add(type);
                                }
                                setFilteredNodeTypes(newFiltered);
                            }, sx: {
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#00ff66'
                                }
                            } }), label: type, sx: { color: '#ccc', display: 'block' } }, type))), _jsxs(Box, { sx: { mt: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ff66', mb: 1 }, children: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438" }), _jsx(IconButton, { onClick: () => setIsPaused(!isPaused), sx: { color: isPaused ? '#ff6600' : '#00ff66', mr: 1 }, children: isPaused ? _jsx(PlayArrowIcon, {}) : _jsx(PauseIcon, {}) }), _jsx(IconButton, { onClick: () => setShowMetrics(!showMetrics), sx: { color: showMetrics ? '#00ff66' : '#666' }, children: showMetrics ? _jsx(VisibilityIcon, {}) : _jsx(VisibilityOffIcon, {}) })] }), selectedNode && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, style: { marginTop: 16 }, children: _jsx(Card, { sx: { background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: '#00ff66' }, children: selectedNode.name }), _jsx(Chip, { label: selectedNode.type, size: "small", sx: { background: '#00ff66', color: '#000', mb: 1 } }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0421\u0442\u0430\u0442\u0443\u0441: ", _jsx("span", { style: { color: '#00ff66' }, children: selectedNode.status })] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u0417\u0430\u0442\u0440\u0438\u043C\u043A\u0430: ", selectedNode.metrics.latency, "ms"] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u043D\u0430 \u0437\u0434\u0430\u0442\u043D\u0456\u0441\u0442\u044C: ", selectedNode.metrics.throughput, "/s"] }), _jsxs(Typography, { variant: "body2", sx: { color: '#ccc' }, children: ["\u041F\u043E\u043C\u0438\u043B\u043A\u0438: ", selectedNode.metrics.errors] })] }) }) })), _jsx(Typography, { variant: "h6", sx: { color: '#00ff66', mt: 3, mb: 1 }, children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u043F\u043E\u0442\u043E\u043A\u0438" }), _jsx(List, { dense: true, children: flows.filter(f => f.status === 'active').map(flow => (_jsx(ListItem, { button: true, onClick: () => onFlowClick?.(flow), sx: {
                                border: '1px solid #333',
                                borderRadius: 1,
                                mb: 1,
                                '&:hover': { background: 'rgba(0, 255, 102, 0.1)' }
                            }, children: _jsx(ListItemText, { primary: `${flow.from} → ${flow.to}`, secondary: `${flow.dataType} | ${flow.volume} req/s`, primaryTypographyProps: { color: '#00ff66', fontSize: '14px' }, secondaryTypographyProps: { color: '#ccc', fontSize: '12px' } }) }, flow.id))) })] }), _jsxs(Box, { ...bind(), sx: { flex: 1, position: 'relative' }, children: [_jsxs(Canvas, { camera: { position: [0, 0, 15], fov: 75 }, style: { width: '100%', height: '100%' }, children: [_jsx("ambientLight", { intensity: 0.2 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 0.8, color: "#00ff66" }), _jsx("pointLight", { position: [-10, -10, -10], intensity: 0.5, color: "#0099ff" }), filteredNodes.map(node => (_jsx(SystemPlanet, { node: node, onClick: () => handleNodeClick(node), isSelected: selectedNode?.id === node.id, isFiltered: filteredNodeTypes.has(node.type) }, node.id))), !isPaused && flows.map(flow => (_jsx(DataFlowLine, { flow: flow, nodes: nodes, isVisible: !filteredNodeTypes.has(nodes.find(n => n.id === flow.from)?.type || '') }, flow.id))), _jsx(OrbitControls, { autoRotate: autoRotate && !selectedNode, autoRotateSpeed: 0.5, enableZoom: true, enablePan: true, maxDistance: 30, minDistance: 5 })] }), _jsxs(Box, { sx: {
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            right: 16,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }, children: [_jsx(Typography, { variant: "caption", sx: {
                                    color: '#666',
                                    fontFamily: 'monospace',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    padding: '4px 8px',
                                    borderRadius: 1
                                }, children: "ESC: \u0441\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u0432\u0438\u0431\u0456\u0440 | SPACE: \u043F\u0430\u0443\u0437\u0430 | R: \u043E\u0431\u0435\u0440\u0442\u0430\u043D\u043D\u044F | M: \u043C\u0435\u0442\u0440\u0438\u043A\u0438" }), _jsxs(Typography, { variant: "caption", sx: {
                                    color: '#00ff66',
                                    fontFamily: 'monospace',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    padding: '4px 8px',
                                    borderRadius: 1
                                }, children: ["\u0412\u0443\u0437\u043B\u0456\u0432: ", filteredNodes.length, " | \u041F\u043E\u0442\u043E\u043A\u0456\u0432: ", flows.filter(f => f.status === 'active').length] })] })] })] }));
};
export default DataFlowMap;
