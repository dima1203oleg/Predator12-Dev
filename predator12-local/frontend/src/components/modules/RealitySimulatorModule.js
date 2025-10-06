import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem, Slider, LinearProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Science as SimulatorIcon, PlayArrow as PlayIcon, Save as SaveIcon, Visibility as ViewIcon, TrendingUp as ResultsIcon } from '@mui/icons-material';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const RealitySimulatorModule = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef();
    const rendererRef = useRef();
    const animationIdRef = useRef();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [parameters, setParameters] = useState([]);
    const [simulationRuns, setSimulationRuns] = useState([]);
    const [currentRun, setCurrentRun] = useState(null);
    const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
    const [selectedResults, setSelectedResults] = useState(null);
    const [show3D, setShow3D] = useState(true);
    // Sample simulation templates
    const templates = [
        {
            id: 'network_security',
            name: 'Мережева Безпека',
            description: 'Моделювання поширення кібератак через мережу',
            model_type: 'agent_based',
            duration: 100,
            parameters: [
                {
                    name: 'initial_infected_nodes',
                    type: 'number',
                    value: 1,
                    min: 1,
                    max: 10,
                    description: 'Кількість початково скомпрометованих вузлів'
                },
                {
                    name: 'infection_rate',
                    type: 'range',
                    value: [0.1, 0.3],
                    min: 0,
                    max: 1,
                    description: 'Швидкість поширення інфекції'
                },
                {
                    name: 'detection_enabled',
                    type: 'boolean',
                    value: true,
                    description: 'Увімкнути систему виявлення'
                }
            ]
        },
        {
            id: 'resource_optimization',
            name: 'Оптимізація Ресурсів',
            description: 'Оптимізація розподілу ресурсів при змінному попиті',
            model_type: 'system_dynamics',
            duration: 200,
            parameters: [
                {
                    name: 'initial_resources',
                    type: 'number',
                    value: 1000,
                    min: 100,
                    max: 10000,
                    description: 'Початковий пул ресурсів'
                },
                {
                    name: 'demand_variability',
                    type: 'range',
                    value: [0.8, 1.2],
                    min: 0.1,
                    max: 2.0,
                    description: 'Варіативність попиту'
                }
            ]
        },
        {
            id: 'market_risk',
            name: 'Ринковий Ризик',
            description: 'Монте-Карло симуляція для оцінки фінансових ризиків',
            model_type: 'monte_carlo',
            duration: 252,
            parameters: [
                {
                    name: 'portfolio_value',
                    type: 'number',
                    value: 1000000,
                    min: 10000,
                    max: 100000000,
                    description: 'Вартість портфеля'
                },
                {
                    name: 'volatility',
                    type: 'range',
                    value: [0.15, 0.25],
                    min: 0.01,
                    max: 1.0,
                    description: 'Волатильність ринку'
                }
            ]
        }
    ];
    // Sample simulation runs
    const sampleRuns = [
        {
            id: 'run_1',
            name: 'Мережева Безпека - Сценарій 1',
            status: 'completed',
            progress: 100,
            started_at: new Date(Date.now() - 3600000),
            completed_at: new Date(Date.now() - 1800000),
            results: {
                infected_nodes: 15,
                detection_time: 45.2,
                mitigation_success: 0.85
            }
        },
        {
            id: 'run_2',
            name: 'Оптимізація Ресурсів - Тест',
            status: 'running',
            progress: 67,
            started_at: new Date(Date.now() - 900000)
        },
        {
            id: 'run_3',
            name: 'Ринковий Ризик - Базовий',
            status: 'failed',
            progress: 25,
            started_at: new Date(Date.now() - 7200000),
            completed_at: new Date(Date.now() - 6900000)
        }
    ];
    useEffect(() => {
        setSimulationRuns(sampleRuns);
    }, []);
    useEffect(() => {
        if (!mountRef.current || !show3D)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 800 / 400, 0.1, 1000);
        camera.position.set(0, 0, 10);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(800, 400);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);
        // Create fractal-like structure for simulation visualization
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(nexusColors.amethyst),
            transparent: true,
            opacity: 0.7
        });
        const cubes = [];
        // Create branching structure
        for (let i = 0; i < 20; i++) {
            const cube = new THREE.Mesh(geometry, material.clone());
            const angle = (i / 20) * Math.PI * 2;
            const radius = 2 + Math.random() * 3;
            cube.position.x = Math.cos(angle) * radius;
            cube.position.y = Math.sin(angle) * radius;
            cube.position.z = (Math.random() - 0.5) * 4;
            cube.scale.setScalar(0.3 + Math.random() * 0.5);
            cubes.push(cube);
            scene.add(cube);
        }
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(new THREE.Color(nexusColors.emerald), 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        // Animation loop
        let time = 0;
        const animate = () => {
            time += 0.01;
            cubes.forEach((cube, index) => {
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.02;
                // Pulsing effect
                const scale = 0.5 + Math.sin(time + index * 0.5) * 0.3;
                cube.scale.setScalar(scale);
                // Color change based on simulation state
                if (cube.material instanceof THREE.MeshPhongMaterial) {
                    const hue = (time + index * 0.1) % 1;
                    cube.material.color.setHSL(hue, 0.7, 0.5);
                }
            });
            // Rotate camera
            camera.position.x = Math.cos(time * 0.2) * 8;
            camera.position.z = Math.sin(time * 0.2) * 8;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            animationIdRef.current = requestAnimationFrame(animate);
        };
        animate();
        // Cleanup
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [show3D, currentRun]);
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setParameters([...template.parameters]);
    };
    const handleParameterChange = (index, value) => {
        const newParameters = [...parameters];
        newParameters[index].value = value;
        setParameters(newParameters);
    };
    const handleStartSimulation = () => {
        if (!selectedTemplate)
            return;
        const newRun = {
            id: `run_${Date.now()}`,
            name: `${selectedTemplate.name} - ${new Date().toLocaleTimeString()}`,
            status: 'running',
            progress: 0,
            started_at: new Date()
        };
        setSimulationRuns(prev => [newRun, ...prev]);
        setCurrentRun(newRun);
        // Simulate progress
        const progressInterval = setInterval(() => {
            setSimulationRuns(prev => prev.map(run => run.id === newRun.id
                ? { ...run, progress: Math.min(run.progress + Math.random() * 10, 100) }
                : run));
        }, 500);
        // Complete simulation after random time
        setTimeout(() => {
            clearInterval(progressInterval);
            setSimulationRuns(prev => prev.map(run => run.id === newRun.id
                ? {
                    ...run,
                    status: 'completed',
                    progress: 100,
                    completed_at: new Date(),
                    results: {
                        success_rate: Math.random(),
                        efficiency: Math.random(),
                        risk_score: Math.random()
                    }
                }
                : run));
            setCurrentRun(null);
        }, 5000 + Math.random() * 5000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return nexusColors.emerald;
            case 'running': return nexusColors.sapphire;
            case 'failed': return nexusColors.crimson;
            case 'queued': return nexusColors.warning;
            default: return nexusColors.nebula;
        }
    };
    return (_jsx(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Typography, { variant: "h4", sx: {
                        mb: 3,
                        color: nexusColors.warning,
                        fontFamily: 'Orbitron',
                        textShadow: `0 0 10px ${nexusColors.warning}`
                    }, children: [_jsx(SimulatorIcon, { sx: { mr: 2, verticalAlign: 'middle' } }), "\u0421\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440 \u0420\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0435\u0439"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.emerald }, children: "\u041A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044F \u0421\u0446\u0435\u043D\u0430\u0440\u0456\u044E" }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u0457" }), _jsx(Select, { value: selectedTemplate?.id || '', onChange: (e) => {
                                                        const template = templates.find(t => t.id === e.target.value);
                                                        if (template)
                                                            handleTemplateSelect(template);
                                                    }, sx: { color: nexusColors.frost }, children: templates.map((template) => (_jsx(MenuItem, { value: template.id, children: template.name }, template.id))) })] }), selectedTemplate && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 2 }, children: selectedTemplate.description }), _jsx(Chip, { label: selectedTemplate.model_type.replace('_', ' ').toUpperCase(), sx: {
                                                        backgroundColor: nexusColors.amethyst,
                                                        color: nexusColors.frost,
                                                        mb: 2
                                                    } }), parameters.map((param, index) => (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost, mb: 1 }, children: param.description }), param.type === 'number' && (_jsx(TextField, { fullWidth: true, type: "number", value: param.value, onChange: (e) => handleParameterChange(index, parseFloat(e.target.value)), inputProps: { min: param.min, max: param.max }, size: "small" })), param.type === 'boolean' && (_jsx(FormControl, { fullWidth: true, size: "small", children: _jsxs(Select, { value: param.value ? 'true' : 'false', onChange: (e) => handleParameterChange(index, e.target.value === 'true'), children: [_jsx(MenuItem, { value: "true", children: "\u0423\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043E" }), _jsx(MenuItem, { value: "false", children: "\u0412\u0438\u043C\u043A\u043D\u0435\u043D\u043E" })] }) })), param.type === 'range' && (_jsx(Box, { sx: { px: 2 }, children: _jsx(Slider, { value: param.value, onChange: (_, value) => handleParameterChange(index, value), valueLabelDisplay: "auto", min: param.min, max: param.max, step: 0.01, sx: {
                                                                    color: nexusColors.sapphire,
                                                                    '& .MuiSlider-thumb': {
                                                                        boxShadow: `0 0 10px ${nexusColors.sapphire}`,
                                                                    },
                                                                } }) }))] }, param.name)))] })), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(PlayIcon, {}), onClick: handleStartSimulation, disabled: !selectedTemplate || currentRun !== null, sx: {
                                                        backgroundColor: nexusColors.emerald,
                                                        '&:hover': { backgroundColor: nexusColors.emerald + 'CC' }
                                                    }, children: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(SaveIcon, {}), disabled: !selectedTemplate, children: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438" })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.sapphire }, children: "\u0424\u0440\u0430\u043A\u0442\u0430\u043B \u041E\u0431\u0447\u0438\u0441\u043B\u0435\u043D\u044C" }), show3D ? (_jsx(Box, { ref: mountRef, sx: {
                                                width: '100%',
                                                height: 400,
                                                border: `1px solid ${nexusColors.quantum}`,
                                                borderRadius: 2,
                                                overflow: 'hidden'
                                            } })) : (_jsx(Box, { sx: {
                                                width: '100%',
                                                height: 400,
                                                border: `1px solid ${nexusColors.quantum}`,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(45deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                                            }, children: _jsx(Typography, { variant: "h6", sx: { color: nexusColors.nebula }, children: "3D Visualization Disabled" }) })), currentRun && (_jsxs(Box, { sx: { mt: 2 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost, mb: 1 }, children: ["\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u044F: ", currentRun.name] }), _jsx(LinearProgress, { variant: "determinate", value: currentRun.progress, sx: {
                                                        backgroundColor: nexusColors.darkMatter,
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: nexusColors.sapphire,
                                                        },
                                                    } }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: [currentRun.progress.toFixed(1), "% \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E"] })] }))] }) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.amethyst }, children: "\u0406\u0441\u0442\u043E\u0440\u0456\u044F \u0421\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u0439" }), _jsx(TableContainer, { component: Paper, sx: { backgroundColor: 'transparent' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u041D\u0430\u0437\u0432\u0430" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0427\u0430\u0441 \u0437\u0430\u043F\u0443\u0441\u043A\u0443" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0414\u0456\u0457" })] }) }), _jsx(TableBody, { children: simulationRuns.map((run) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: run.name }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Chip, { label: run.status, size: "small", sx: {
                                                                            backgroundColor: getStatusColor(run.status),
                                                                            color: nexusColors.frost
                                                                        } }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(LinearProgress, { variant: "determinate", value: run.progress, sx: {
                                                                                    width: 100,
                                                                                    backgroundColor: nexusColors.darkMatter,
                                                                                    '& .MuiLinearProgress-bar': {
                                                                                        backgroundColor: getStatusColor(run.status),
                                                                                    },
                                                                                } }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: [run.progress.toFixed(0), "%"] })] }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: run.started_at.toLocaleString() }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Button, { size: "small", startIcon: _jsx(ViewIcon, {}), onClick: () => {
                                                                            setSelectedResults(run.results);
                                                                            setResultsDialogOpen(true);
                                                                        }, disabled: !run.results, sx: { color: nexusColors.sapphire }, children: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438" }) })] }, run.id))) })] }) })] }) }) })] }), _jsxs(Dialog, { open: resultsDialogOpen, onClose: () => setResultsDialogOpen(false), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { color: nexusColors.emerald }, children: [_jsx(ResultsIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438 \u0421\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u0457"] }), _jsx(DialogContent, { children: selectedResults && (_jsx(Box, { children: Object.entries(selectedResults).map(([key, value]) => (_jsx(Box, { sx: { mb: 2 }, children: _jsxs(Typography, { variant: "body1", sx: { color: nexusColors.frost }, children: [key.replace('_', ' ').toUpperCase(), ": ", typeof value === 'number'
                                                ? value.toFixed(3)
                                                : String(value)] }) }, key))) })) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setResultsDialogOpen(false), children: "\u0417\u0430\u043A\u0440\u0438\u0442\u0438" }) })] })] }) }));
};
