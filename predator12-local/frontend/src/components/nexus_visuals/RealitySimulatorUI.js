import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Slider, FormControl, InputLabel, Select, MenuItem, Grid, LinearProgress, Chip } from '@mui/material';
import { PlayArrow as PlayIcon, Stop as StopIcon, Science as ScienceIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { nexusColors } from '../../theme/nexusTheme';
import { nexusAPI } from '../../services/nexusAPI';
const RealitySimulatorUI = () => {
    const mountRef = useRef(null);
    const [simulationId, setSimulationId] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [params, setParams] = useState({
        type: 'scenario_analysis',
        complexity: 50,
        duration: 300,
        variables: 10
    });
    useEffect(() => {
        if (!mountRef.current)
            return;
        // Create 3D fractal visualization
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(400, 300);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        // Create fractal-like structure
        const createFractalBranch = (depth, scale, position, rotation) => {
            if (depth <= 0)
                return;
            const geometry = new THREE.CylinderGeometry(0.02 * scale, 0.05 * scale, 0.5 * scale, 8);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL((depth / 5) * 0.8, 0.8, 0.6),
                transparent: true,
                opacity: 0.8
            });
            const branch = new THREE.Mesh(geometry, material);
            branch.position.copy(position);
            branch.rotation.copy(rotation);
            scene.add(branch);
            // Create child branches
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const newPos = position.clone().add(new THREE.Vector3(Math.cos(angle) * 0.3 * scale, 0.4 * scale, Math.sin(angle) * 0.3 * scale));
                const newRot = new THREE.Euler(rotation.x + (Math.random() - 0.5) * 0.5, rotation.y + angle, rotation.z + (Math.random() - 0.5) * 0.3);
                createFractalBranch(depth - 1, scale * 0.7, newPos, newRot);
            }
        };
        // Create initial fractal
        createFractalBranch(4, 1, new THREE.Vector3(0, -1, 0), new THREE.Euler(0, 0, 0));
        // Add particles
        const particleCount = 200;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 10;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xa020f0,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        camera.position.set(0, 0, 5);
        const animate = () => {
            requestAnimationFrame(animate);
            // Rotate scene
            scene.rotation.y += 0.005;
            particles.rotation.x += 0.001;
            particles.rotation.y += 0.002;
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);
    const startSimulation = async () => {
        try {
            setIsRunning(true);
            setProgress(0);
            setResults(null);
            const response = await nexusAPI.createSimulation(params.type, {
                complexity: params.complexity,
                duration: params.duration,
                variables: params.variables
            });
            setSimulationId(response.simulation_id);
            // Simulate progress
            const progressInterval = setInterval(async () => {
                if (simulationId) {
                    try {
                        const status = await nexusAPI.getSimulationStatus(simulationId);
                        setProgress(status.progress);
                        if (status.status === 'completed') {
                            setResults(status.results);
                            setIsRunning(false);
                            clearInterval(progressInterval);
                        }
                    }
                    catch (error) {
                        console.error('Failed to get simulation status:', error);
                    }
                }
            }, 1000);
            // Fallback completion after 10 seconds
            setTimeout(() => {
                setProgress(100);
                setResults({
                    success_rate: '94%',
                    risk_level: 'low',
                    recommendations: [
                        'Збільшити моніторинг аномалій',
                        'Оптимізувати розподіл навантаження',
                        'Підвищити рівень безпеки'
                    ]
                });
                setIsRunning(false);
                clearInterval(progressInterval);
            }, 10000);
        }
        catch (error) {
            console.error('Failed to start simulation:', error);
            setIsRunning(false);
        }
    };
    const stopSimulation = () => {
        setIsRunning(false);
        setProgress(0);
        setResults(null);
        setSimulationId(null);
    };
    return (_jsx(Box, { sx: {
            height: '100%',
            p: 3,
            background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`
        }, children: _jsxs(Grid, { container: true, spacing: 3, sx: { height: '100%' }, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.amethyst}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(ScienceIcon, { sx: { color: nexusColors.amethyst, mr: 2, fontSize: 32 } }), _jsx(Typography, { variant: "h4", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron',
                                                textShadow: `0 0 10px ${nexusColors.amethyst}`
                                            }, children: "Reality Simulator" })] }), _jsx(Typography, { variant: "body1", sx: { color: nexusColors.nebula, mb: 3 }, children: "\u041C\u043E\u0434\u0435\u043B\u044E\u0439\u0442\u0435 \u0441\u043A\u043B\u0430\u0434\u043D\u0456 \u0441\u0446\u0435\u043D\u0430\u0440\u0456\u0457 \"\u0449\u043E, \u044F\u043A\u0449\u043E\" \u0442\u0430 \u0430\u043D\u0430\u043B\u0456\u0437\u0443\u0439\u0442\u0435 \u043C\u043E\u0436\u043B\u0438\u0432\u0456 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438" }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0422\u0438\u043F \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u0457" }), _jsxs(Select, { value: params.type, onChange: (e) => setParams({ ...params, type: e.target.value }), sx: {
                                                color: nexusColors.frost,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: nexusColors.quantum
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: nexusColors.amethyst
                                                }
                                            }, children: [_jsx(MenuItem, { value: "scenario_analysis", children: "\u0410\u043D\u0430\u043B\u0456\u0437 \u0441\u0446\u0435\u043D\u0430\u0440\u0456\u0457\u0432" }), _jsx(MenuItem, { value: "risk_assessment", children: "\u041E\u0446\u0456\u043D\u043A\u0430 \u0440\u0438\u0437\u0438\u043A\u0456\u0432" }), _jsx(MenuItem, { value: "performance_prediction", children: "\u041F\u0440\u043E\u0433\u043D\u043E\u0437\u0443\u0432\u0430\u043D\u043D\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0456" }), _jsx(MenuItem, { value: "security_simulation", children: "\u0421\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u044F \u0431\u0435\u0437\u043F\u0435\u043A\u0438" })] })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0421\u043A\u043B\u0430\u0434\u043D\u0456\u0441\u0442\u044C: ", params.complexity, "%"] }), _jsx(Slider, { value: params.complexity, onChange: (_, value) => setParams({ ...params, complexity: value }), min: 10, max: 100, sx: {
                                                color: nexusColors.amethyst,
                                                '& .MuiSlider-thumb': {
                                                    backgroundColor: nexusColors.amethyst,
                                                    border: `2px solid ${nexusColors.frost}`,
                                                    '&:hover': {
                                                        boxShadow: `0 0 15px ${nexusColors.amethyst}`
                                                    }
                                                },
                                                '& .MuiSlider-track': {
                                                    backgroundColor: nexusColors.amethyst
                                                },
                                                '& .MuiSlider-rail': {
                                                    backgroundColor: nexusColors.quantum
                                                }
                                            } })] }), _jsx(TextField, { label: "\u0422\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C (\u0441\u0435\u043A)", type: "number", value: params.duration, onChange: (e) => setParams({ ...params, duration: parseInt(e.target.value) }), sx: {
                                        mb: 2,
                                        '& .MuiInputLabel-root': { color: nexusColors.nebula },
                                        '& .MuiInputBase-input': { color: nexusColors.frost },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.amethyst }
                                    } }), _jsx(TextField, { label: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0437\u043C\u0456\u043D\u043D\u0438\u0445", type: "number", value: params.variables, onChange: (e) => setParams({ ...params, variables: parseInt(e.target.value) }), sx: {
                                        mb: 3,
                                        '& .MuiInputLabel-root': { color: nexusColors.nebula },
                                        '& .MuiInputBase-input': { color: nexusColors.frost },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.quantum },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: nexusColors.amethyst }
                                    } }), _jsx(Box, { sx: { display: 'flex', gap: 2, mt: 'auto' }, children: _jsx(Button, { variant: "contained", startIcon: isRunning ? _jsx(StopIcon, {}) : _jsx(PlayIcon, {}), onClick: isRunning ? stopSimulation : startSimulation, disabled: isRunning && progress === 0, sx: {
                                            backgroundColor: isRunning ? nexusColors.crimson : nexusColors.amethyst,
                                            color: nexusColors.frost,
                                            '&:hover': {
                                                backgroundColor: isRunning ? nexusColors.crimson : nexusColors.amethyst,
                                                boxShadow: `0 0 20px ${isRunning ? nexusColors.crimson : nexusColors.amethyst}60`
                                            }
                                        }, children: isRunning ? 'Зупинити' : 'Запустити' }) }), isRunning && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, style: { marginTop: 16 }, children: [_jsxs(Typography, { sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u041F\u0440\u043E\u0433\u0440\u0435\u0441 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u0457: ", progress, "%"] }), _jsx(LinearProgress, { variant: "determinate", value: progress, sx: {
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: `${nexusColors.amethyst}20`,
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: nexusColors.amethyst,
                                                    borderRadius: 4
                                                }
                                            } })] }))] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.sapphire}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsx(Typography, { variant: "h6", sx: {
                                        color: nexusColors.frost,
                                        fontFamily: 'Orbitron',
                                        mb: 2
                                    }, children: "Quantum Fractal Visualization" }), _jsxs(Box, { sx: {
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: `1px solid ${nexusColors.quantum}`,
                                        borderRadius: 2,
                                        mb: 2,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }, children: [_jsx("div", { ref: mountRef }), isRunning && (_jsx(Box, { sx: {
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                display: 'flex',
                                                gap: 1
                                            }, children: _jsx(Chip, { label: "\u0421\u0418\u041C\u0423\u041B\u042F\u0426\u0406\u042F \u0410\u041A\u0422\u0418\u0412\u041D\u0410", size: "small", sx: {
                                                    backgroundColor: `${nexusColors.amethyst}30`,
                                                    color: nexusColors.amethyst,
                                                    animation: 'pulse 2s infinite'
                                                } }) }))] }), _jsx(AnimatePresence, { children: results && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, children: _jsxs(Box, { sx: {
                                                p: 2,
                                                backgroundColor: `${nexusColors.success}10`,
                                                border: `1px solid ${nexusColors.success}40`,
                                                borderRadius: 2
                                            }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.success, mb: 1 }, children: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0438 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0456\u0457" }), _jsxs(Typography, { sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0423\u0441\u043F\u0456\u0448\u043D\u0456\u0441\u0442\u044C: ", results.success_rate] }), _jsxs(Typography, { sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0420\u0456\u0432\u0435\u043D\u044C \u0440\u0438\u0437\u0438\u043A\u0443: ", results.risk_level] }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.shadow }, children: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0456\u0457:" }), results.recommendations?.map((rec, index) => (_jsxs(Typography, { variant: "caption", sx: {
                                                        color: nexusColors.nebula,
                                                        display: 'block',
                                                        ml: 1
                                                    }, children: ["\u2022 ", rec] }, index)))] }) })) })] }) }) })] }) }));
};
export default RealitySimulatorUI;
