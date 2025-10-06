import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, Chip, LinearProgress, IconButton } from '@mui/material';
import { Psychology as AIIcon, Refresh as RefreshIcon, Memory as MemoryIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { nexusColors } from '../../theme/nexusTheme';
import { nexusAPI } from '../../services/nexusAPI';
const AISupervisionModule = () => {
    const mountRef = useRef(null);
    const [agents, setAgents] = useState([]);
    const [realTimeData, setRealTimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchAgentData();
        // Set up WebSocket for real-time updates
        const ws = nexusAPI.connect3DStream((data) => {
            setRealTimeData(data);
        });
        // Periodic refresh
        const interval = setInterval(fetchAgentData, 10000);
        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, []);
    const fetchAgentData = async () => {
        try {
            const data = await nexusAPI.getAgentsStatus();
            setAgents(data.agents);
            setLoading(false);
        }
        catch (error) {
            console.error('Failed to fetch agent data:', error);
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!mountRef.current)
            return;
        // 3D Swarm Visualization
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 500 / 400, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(500, 400);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        // Create agent swarm
        const agentNodes = [];
        const agentCount = agents.length || 8;
        for (let i = 0; i < agentCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(i / agentCount, 0.8, 0.6),
                transparent: true,
                opacity: 0.8
            });
            const agentNode = new THREE.Mesh(geometry, material);
            // Position in 3D swarm formation
            const angle = (i / agentCount) * Math.PI * 2;
            const radius = 2 + Math.random() * 1;
            const height = (Math.random() - 0.5) * 3;
            agentNode.position.x = Math.cos(angle) * radius;
            agentNode.position.z = Math.sin(angle) * radius;
            agentNode.position.y = height;
            agentNode.userData = {
                originalPosition: agentNode.position.clone(),
                speed: 0.02 + Math.random() * 0.01,
                phase: Math.random() * Math.PI * 2
            };
            agentNodes.push(agentNode);
            scene.add(agentNode);
            // Add trail effect
            const trailGeometry = new THREE.BufferGeometry();
            const trailMaterial = new THREE.LineBasicMaterial({
                color: material.color,
                transparent: true,
                opacity: 0.3
            });
            const trail = new THREE.Line(trailGeometry, trailMaterial);
            scene.add(trail);
        }
        // Add connections between agents
        agentNodes.forEach((node1, i) => {
            agentNodes.forEach((node2, j) => {
                if (i < j && Math.random() > 0.7) {
                    const points = [node1.position.clone(), node2.position.clone()];
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x00ffc6,
                        transparent: true,
                        opacity: 0.2
                    });
                    const connection = new THREE.Line(lineGeometry, lineMaterial);
                    scene.add(connection);
                }
            });
        });
        // Add central hub
        const hubGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const hubMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffc6,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        scene.add(hub);
        camera.position.set(0, 0, 8);
        const animate = () => {
            requestAnimationFrame(animate);
            // Animate agent nodes in swarm pattern
            agentNodes.forEach((node, index) => {
                node.userData.phase += node.userData.speed;
                const basePos = node.userData.originalPosition;
                const swarmRadius = 0.5 + 0.3 * Math.sin(node.userData.phase);
                const swarmHeight = 0.2 * Math.sin(node.userData.phase * 2);
                node.position.x = basePos.x + swarmRadius * Math.cos(node.userData.phase);
                node.position.z = basePos.z + swarmRadius * Math.sin(node.userData.phase);
                node.position.y = basePos.y + swarmHeight;
                // Update based on real-time data
                if (realTimeData?.nodes?.[index]) {
                    const load = realTimeData.nodes[index].load || 50;
                    const intensity = load / 100;
                    node.scale.setScalar(0.8 + intensity * 0.4);
                    const mat = node.material;
                    if (mat && 'opacity' in mat)
                        mat.opacity = 0.6 + intensity * 0.4;
                }
            });
            // Animate hub
            hub.rotation.y += 0.01;
            hub.scale.setScalar(1 + 0.1 * Math.sin(Date.now() * 0.003));
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [agents, realTimeData]);
    const getHealthColor = (health) => {
        switch (health) {
            case 'excellent': return nexusColors.success;
            case 'good': return nexusColors.emerald;
            case 'warning': return nexusColors.warning;
            case 'critical': return nexusColors.crimson;
            default: return nexusColors.nebula;
        }
    };
    if (loading) {
        return (_jsxs(Box, { sx: {
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: nexusColors.sapphire,
                fontFamily: 'Orbitron'
            }, children: [_jsx("div", { className: "loading-spinner", style: { marginRight: '16px' } }), "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0456\u0437\u0430\u0446\u0456\u044F \u0437 \u0440\u043E\u0454\u043C \u0428\u0406..."] }));
    }
    return (_jsx(Box, { sx: {
            height: '100%',
            p: 3,
            background: `linear-gradient(135deg, ${nexusColors.void} 0%, ${nexusColors.obsidian} 50%, ${nexusColors.darkMatter} 100%)`
        }, children: _jsxs(Grid, { container: true, spacing: 3, sx: { height: '100%' }, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.sapphire}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(AIIcon, { sx: { color: nexusColors.sapphire, mr: 2, fontSize: 32 } }), _jsx(Typography, { variant: "h5", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron',
                                                textShadow: `0 0 10px ${nexusColors.sapphire}`
                                            }, children: "AI Swarm Matrix" }), _jsx(IconButton, { size: "small", onClick: fetchAgentData, sx: { ml: 'auto', color: nexusColors.nebula }, children: _jsx(RefreshIcon, {}) })] }), _jsxs(Box, { sx: {
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: `1px solid ${nexusColors.quantum}`,
                                        borderRadius: 2,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }, children: [_jsx("div", { ref: mountRef }), _jsxs(Box, { sx: {
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1
                                            }, children: [_jsx(Chip, { label: `${agents.length} Agents Active`, size: "small", sx: {
                                                        backgroundColor: `${nexusColors.success}30`,
                                                        color: nexusColors.success
                                                    } }), realTimeData && (_jsx(Chip, { label: `${realTimeData.throughput || 'N/A'}`, size: "small", sx: {
                                                        backgroundColor: `${nexusColors.sapphire}30`,
                                                        color: nexusColors.sapphire
                                                    } }))] })] })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.amethyst}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [_jsx(MemoryIcon, { sx: { color: nexusColors.amethyst, mr: 2 } }), _jsx(Typography, { variant: "h6", sx: {
                                                color: nexusColors.frost,
                                                fontFamily: 'Orbitron'
                                            }, children: "Agent Performance Matrix" })] }), _jsx(List, { sx: {
                                        flex: 1,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: nexusColors.amethyst,
                                            borderRadius: '3px'
                                        }
                                    }, children: agents.map((agent, index) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: index * 0.1 }, children: _jsx(ListItem, { sx: {
                                                mb: 2,
                                                backgroundColor: `${nexusColors.quantum}10`,
                                                borderRadius: 2,
                                                border: `1px solid ${nexusColors.quantum}40`
                                            }, children: _jsxs(Box, { sx: { width: '100%' }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { sx: {
                                                                    color: nexusColors.frost,
                                                                    fontFamily: 'Fira Code',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1.1rem'
                                                                }, children: agent.name }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Chip, { label: agent.status, size: "small", sx: {
                                                                            backgroundColor: `${nexusColors.success}30`,
                                                                            color: nexusColors.success,
                                                                            fontSize: '0.7rem'
                                                                        } }), _jsx(Chip, { label: agent.health, size: "small", sx: {
                                                                            backgroundColor: `${getHealthColor(agent.health)}30`,
                                                                            color: getHealthColor(agent.health),
                                                                            fontSize: '0.7rem'
                                                                        } })] })] }), _jsxs(Box, { sx: { mb: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "CPU Usage" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: agent.cpu })] }), _jsx(LinearProgress, { variant: "determinate", value: parseInt(agent.cpu.replace('%', '')), sx: {
                                                                    height: 4,
                                                                    borderRadius: 2,
                                                                    backgroundColor: `${nexusColors.sapphire}20`,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: nexusColors.sapphire
                                                                    }
                                                                } })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "Memory Usage" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: agent.memory })] }), _jsx(LinearProgress, { variant: "determinate", value: parseInt(agent.memory.replace('%', '')), sx: {
                                                                    height: 4,
                                                                    borderRadius: 2,
                                                                    backgroundColor: `${nexusColors.amethyst}20`,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: nexusColors.amethyst
                                                                    }
                                                                } })] })] }) }) }, agent.name))) })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Card, { sx: {
                            background: `linear-gradient(135deg, ${nexusColors.obsidian}E6, ${nexusColors.darkMatter}CC)`,
                            border: `2px solid ${nexusColors.emerald}40`,
                            borderRadius: 3,
                            backdropFilter: 'blur(20px)',
                            height: '100%'
                        }, children: _jsxs(CardContent, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsx(Typography, { variant: "h6", sx: {
                                        color: nexusColors.frost,
                                        fontFamily: 'Orbitron',
                                        mb: 2
                                    }, children: "Swarm Behavior Pattern" }), _jsxs(Box, { sx: {
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: `1px solid ${nexusColors.quantum}`,
                                        borderRadius: 2,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }, children: [_jsx("div", { ref: mountRef }), _jsxs(Box, { sx: {
                                                position: 'absolute',
                                                bottom: 10,
                                                left: 10,
                                                right: 10,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor: `${nexusColors.obsidian}80`,
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: 1,
                                                p: 1
                                            }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.nebula }, children: "Swarm Coherence: 98.7%" }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx("div", { className: "pulse-element", style: {
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: '50%',
                                                                backgroundColor: nexusColors.success
                                                            } }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.success }, children: "Optimal" })] })] })] })] }) }) })] }) }));
};
export default AISupervisionModule;
