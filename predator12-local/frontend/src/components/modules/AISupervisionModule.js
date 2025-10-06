import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Switch, FormControlLabel } from '@mui/material';
import { Psychology as AIIcon, Refresh as RestartIcon, Visibility as ViewIcon } from '@mui/icons-material';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const AISupervisionModule = ({ agents = [] }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef();
    const rendererRef = useRef();
    const animationIdRef = useRef();
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [show3D, setShow3D] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);
    // Sample agents data
    const sampleAgents = [
        {
            id: 'supervisor-1',
            name: 'Chief Orchestrator',
            type: 'supervisor',
            status: 'active',
            performance: 95,
            memory: 68,
            tasks: 12,
            uptime: 99.8,
            position: { x: 0, y: 0, z: 0 }
        },
        {
            id: 'worker-1',
            name: 'Data Processor Alpha',
            type: 'worker',
            status: 'active',
            performance: 87,
            memory: 45,
            tasks: 8,
            uptime: 98.5,
            position: { x: 3, y: 2, z: 1 }
        },
        {
            id: 'worker-2',
            name: 'Analytics Engine Beta',
            type: 'worker',
            status: 'idle',
            performance: 92,
            memory: 32,
            tasks: 3,
            uptime: 99.2,
            position: { x: -2, y: 3, z: -1 }
        },
        {
            id: 'monitor-1',
            name: 'System Monitor Gamma',
            type: 'monitor',
            status: 'active',
            performance: 78,
            memory: 55,
            tasks: 15,
            uptime: 97.8,
            position: { x: 1, y: -2, z: 3 }
        },
        {
            id: 'analyzer-1',
            name: 'Pattern Analyzer Delta',
            type: 'analyzer',
            status: 'error',
            performance: 45,
            memory: 89,
            tasks: 2,
            uptime: 85.3,
            position: { x: -3, y: 1, z: -2 }
        }
    ];
    const allAgents = agents.length > 0 ? agents : sampleAgents;
    useEffect(() => {
        if (!mountRef.current || !show3D)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(800, 600);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(new THREE.Color(nexusColors.emerald), 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        // Create central hub
        const hubGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const hubMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(nexusColors.emerald),
            transparent: true,
            opacity: 0.8,
            emissive: new THREE.Color(nexusColors.emerald),
            emissiveIntensity: 0.2
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        scene.add(hub);
        // Create agent nodes
        const agentMeshes = {};
        const connections = [];
        allAgents.forEach((agent) => {
            // Agent node
            const nodeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            let nodeColor;
            switch (agent.status) {
                case 'active':
                    nodeColor = nexusColors.emerald;
                    break;
                case 'idle':
                    nodeColor = nexusColors.sapphire;
                    break;
                case 'error':
                    nodeColor = nexusColors.crimson;
                    break;
                default:
                    nodeColor = nexusColors.shadow;
            }
            const nodeMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(nodeColor),
                transparent: true,
                opacity: 0.8,
                emissive: new THREE.Color(nodeColor),
                emissiveIntensity: 0.1
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(agent.position.x, agent.position.y, agent.position.z);
            agentMeshes[agent.id] = node;
            scene.add(node);
            // Connection to hub
            const points = [hub.position, node.position];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color(nodeColor),
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            connections.push(line);
            scene.add(line);
            // Agent type indicator (ring around node)
            let ringColor;
            switch (agent.type) {
                case 'supervisor':
                    ringColor = nexusColors.amethyst;
                    break;
                case 'worker':
                    ringColor = nexusColors.sapphire;
                    break;
                case 'monitor':
                    ringColor = nexusColors.warning;
                    break;
                case 'analyzer':
                    ringColor = nexusColors.info;
                    break;
                default:
                    ringColor = nexusColors.nebula;
            }
            const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(ringColor),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(node.position);
            ring.lookAt(camera.position);
            scene.add(ring);
        });
        // Animation loop
        let time = 0;
        const animate = () => {
            time += 0.01;
            // Rotate hub
            hub.rotation.x += 0.01;
            hub.rotation.y += 0.02;
            // Pulse hub based on activity
            const scale = 1 + Math.sin(time * 2) * 0.1;
            hub.scale.setScalar(scale);
            // Animate agent nodes
            Object.values(agentMeshes).forEach((mesh, index) => {
                mesh.rotation.x += 0.02;
                mesh.rotation.y += 0.01;
                // Floating animation
                const offset = index * 0.5;
                mesh.position.y += Math.sin(time + offset) * 0.01;
            });
            // Auto-rotate camera
            if (autoRotate) {
                camera.position.x = Math.cos(time * 0.2) * 12;
                camera.position.z = Math.sin(time * 0.2) * 12;
                camera.lookAt(0, 0, 0);
            }
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
    }, [show3D, autoRotate, selectedAgent]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return nexusColors.emerald;
            case 'idle': return nexusColors.sapphire;
            case 'error': return nexusColors.crimson;
            default: return nexusColors.shadow;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'supervisor': return nexusColors.amethyst;
            case 'worker': return nexusColors.sapphire;
            case 'monitor': return nexusColors.warning;
            case 'analyzer': return nexusColors.info;
            default: return nexusColors.nebula;
        }
    };
    return (_jsx(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Typography, { variant: "h4", sx: {
                        mb: 3,
                        color: nexusColors.sapphire,
                        fontFamily: 'Orbitron',
                        textShadow: `0 0 10px ${nexusColors.sapphire}`
                    }, children: [_jsx(AIIcon, { sx: { mr: 2, verticalAlign: 'middle' } }), "\u041E\u0440\u0431\u0456\u0442\u0430\u043B\u044C\u043D\u0438\u0439 \u0412\u0443\u043B\u0438\u043A \u0428\u0406"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: "\u0420\u0456\u0439 \u0410\u0433\u0435\u043D\u0442\u0456\u0432 MAS" }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: autoRotate, onChange: (e) => setAutoRotate(e.target.checked), sx: {
                                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                                        color: nexusColors.emerald,
                                                                    },
                                                                } }), label: "\u0410\u0432\u0442\u043E-\u043E\u0431\u0435\u0440\u0442\u0430\u043D\u043D\u044F", sx: { color: nexusColors.nebula } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: show3D, onChange: (e) => setShow3D(e.target.checked), sx: {
                                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                                        color: nexusColors.emerald,
                                                                    },
                                                                } }), label: "3D \u0420\u0435\u0436\u0438\u043C", sx: { color: nexusColors.nebula } })] })] }), show3D ? (_jsx(Box, { ref: mountRef, sx: {
                                                width: '100%',
                                                height: 600,
                                                border: `1px solid ${nexusColors.quantum}`,
                                                borderRadius: 2,
                                                overflow: 'hidden'
                                            } })) : (_jsx(Box, { sx: {
                                                width: '100%',
                                                height: 600,
                                                border: `1px solid ${nexusColors.quantum}`,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(45deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                                            }, children: _jsx(Typography, { variant: "h6", sx: { color: nexusColors.nebula }, children: "2D Network View (Coming Soon)" }) }))] }) }) }), _jsxs(Grid, { item: true, xs: 12, lg: 4, children: [_jsx(Card, { className: "holographic", sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.amethyst }, children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0421\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u0430\u0433\u0435\u043D\u0442\u0438: ", allAgents.filter(a => a.status === 'active').length, " / ", allAgents.length] }), _jsx(LinearProgress, { variant: "determinate", value: (allAgents.filter(a => a.status === 'active').length / allAgents.length) * 100, sx: {
                                                            backgroundColor: nexusColors.darkMatter,
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: nexusColors.emerald,
                                                            },
                                                        } })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", (allAgents.reduce((acc, a) => acc + a.performance, 0) / allAgents.length).toFixed(1), "%"] }), _jsx(LinearProgress, { variant: "determinate", value: allAgents.reduce((acc, a) => acc + a.performance, 0) / allAgents.length, sx: {
                                                            backgroundColor: nexusColors.darkMatter,
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: nexusColors.sapphire,
                                                            },
                                                        } })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: ["\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F \u043F\u0430\u043C'\u044F\u0442\u0456: ", (allAgents.reduce((acc, a) => acc + a.memory, 0) / allAgents.length).toFixed(1), "%"] }), _jsx(LinearProgress, { variant: "determinate", value: allAgents.reduce((acc, a) => acc + a.memory, 0) / allAgents.length, sx: {
                                                            backgroundColor: nexusColors.darkMatter,
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: nexusColors.warning,
                                                            },
                                                        } })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.nebula }, children: ["\u0417\u0430\u0433\u0430\u043B\u044C\u043D\u0430 \u043A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0437\u0430\u0432\u0434\u0430\u043D\u044C: ", allAgents.reduce((acc, a) => acc + a.tasks, 0)] })] }) }), _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.emerald }, children: "\u0421\u043F\u0438\u0441\u043E\u043A \u0410\u0433\u0435\u043D\u0442\u0456\u0432" }), _jsx(TableContainer, { component: Paper, sx: { backgroundColor: 'transparent' }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0410\u0433\u0435\u043D\u0442" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx(TableCell, { sx: { color: nexusColors.nebula, borderColor: nexusColors.quantum }, children: "\u0414\u0456\u0457" })] }) }), _jsx(TableBody, { children: allAgents.map((agent) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", sx: { color: nexusColors.frost }, children: agent.name }), _jsx(Chip, { label: agent.type, size: "small", sx: {
                                                                                        backgroundColor: getTypeColor(agent.type),
                                                                                        color: nexusColors.frost,
                                                                                        fontSize: '0.7rem'
                                                                                    } })] }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsx(Chip, { label: agent.status, size: "small", sx: {
                                                                                backgroundColor: getStatusColor(agent.status),
                                                                                color: nexusColors.frost
                                                                            } }) }), _jsx(TableCell, { sx: { borderColor: nexusColors.quantum }, children: _jsxs(Box, { sx: { display: 'flex', gap: 0.5 }, children: [_jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u0434\u0435\u0442\u0430\u043B\u0456", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, children: _jsx(ViewIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.warning }, children: _jsx(RestartIcon, { fontSize: "small" }) }) })] }) })] }, agent.id))) })] }) })] }) })] })] })] }) }));
};
