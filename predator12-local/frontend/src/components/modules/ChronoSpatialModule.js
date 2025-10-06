import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Slider, Card, CardContent, Grid, Button, Chip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { PlayArrow as PlayIcon, Pause as PauseIcon, SkipPrevious as PrevIcon, SkipNext as NextIcon, Timeline as TimelineIcon, Public as GlobeIcon } from '@mui/icons-material';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
export const ChronoSpatialModule = ({ events = [] }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef();
    const rendererRef = useRef();
    const animationIdRef = useRef();
    // Time controls
    const [currentTime, setCurrentTime] = useState(0);
    const [timeRange, setTimeRange] = useState([0, 100]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedEventType, setSelectedEventType] = useState('all');
    const [show3D, setShow3D] = useState(true);
    // Sample events data
    const sampleEvents = [
        {
            id: '1',
            lat: 50.4501,
            lon: 30.5234,
            timestamp: 10,
            intensity: 0.8,
            type: 'incident',
            title: 'Security Breach',
            description: 'Unauthorized access detected'
        },
        {
            id: '2',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: 25,
            intensity: 0.6,
            type: 'anomaly',
            title: 'Data Anomaly',
            description: 'Unusual traffic pattern'
        },
        {
            id: '3',
            lat: 51.5074,
            lon: -0.1278,
            timestamp: 45,
            intensity: 0.9,
            type: 'alert',
            title: 'Critical Alert',
            description: 'System overload detected'
        },
        {
            id: '4',
            lat: 35.6762,
            lon: 139.6503,
            timestamp: 70,
            intensity: 0.4,
            type: 'normal',
            title: 'Normal Operation',
            description: 'System functioning normally'
        }
    ];
    const allEvents = events.length > 0 ? events : sampleEvents;
    useEffect(() => {
        if (!mountRef.current || !show3D)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        camera.position.set(0, 0, 15);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(800, 600);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);
        // Create Earth
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(nexusColors.sapphire),
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(new THREE.Color(nexusColors.emerald), 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        // Create event markers
        const eventMarkers = [];
        allEvents.forEach((event) => {
            if (event.timestamp <= currentTime) {
                const phi = (90 - event.lat) * (Math.PI / 180);
                const theta = (event.lon + 180) * (Math.PI / 180);
                const radius = 5.2;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                const markerGeometry = new THREE.SphereGeometry(0.1 * event.intensity, 16, 16);
                let markerColor;
                switch (event.type) {
                    case 'incident':
                        markerColor = nexusColors.crimson;
                        break;
                    case 'anomaly':
                        markerColor = nexusColors.warning;
                        break;
                    case 'alert':
                        markerColor = nexusColors.amethyst;
                        break;
                    default:
                        markerColor = nexusColors.emerald;
                }
                const markerMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(markerColor),
                    transparent: true,
                    opacity: 0.8
                });
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(x, y, z);
                eventMarkers.push(marker);
                scene.add(marker);
                // Add pulsing effect for recent events
                if (currentTime - event.timestamp < 10) {
                    const pulseGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
                    const pulseMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(markerColor),
                        transparent: true,
                        opacity: 0.3,
                        side: THREE.DoubleSide
                    });
                    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
                    pulse.position.copy(marker.position);
                    pulse.lookAt(camera.position);
                    scene.add(pulse);
                }
            }
        });
        // Animation loop
        let time = 0;
        const animate = () => {
            time += 0.01;
            // Rotate Earth
            earth.rotation.y += 0.005;
            // Animate markers
            eventMarkers.forEach((marker, index) => {
                marker.rotation.x += 0.02;
                marker.rotation.y += 0.02;
                // Pulse effect
                const scale = 1 + Math.sin(time * 3 + index) * 0.2;
                marker.scale.setScalar(scale);
            });
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
    }, [currentTime, show3D, selectedEventType]);
    // Auto-play functionality
    useEffect(() => {
        if (!isPlaying)
            return;
        const interval = setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + playbackSpeed;
                return next > timeRange[1] ? timeRange[0] : next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, timeRange]);
    const filteredEvents = allEvents.filter(event => selectedEventType === 'all' || event.type === selectedEventType);
    const currentEvents = filteredEvents.filter(event => Math.abs(event.timestamp - currentTime) < 5);
    return (_jsx(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: [_jsxs(Typography, { variant: "h4", sx: {
                        mb: 3,
                        color: nexusColors.emerald,
                        fontFamily: 'Orbitron',
                        textShadow: `0 0 10px ${nexusColors.emerald}`
                    }, children: [_jsx(TimelineIcon, { sx: { mr: 2, verticalAlign: 'middle' } }), "\u0425\u0440\u043E\u043D\u043E-\u043F\u0440\u043E\u0441\u0442\u043E\u0440\u043E\u0432\u0438\u0439 \u0410\u043D\u0430\u043B\u0456\u0437"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, lg: 8, children: _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: [_jsx(GlobeIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0430 \u041A\u0430\u0440\u0442\u0430 \u041F\u043E\u0434\u0456\u0439"] }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: show3D, onChange: (e) => setShow3D(e.target.checked), sx: {
                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                color: nexusColors.emerald,
                                                            },
                                                        } }), label: "3D \u0420\u0435\u0436\u0438\u043C", sx: { color: nexusColors.nebula } })] }), show3D ? (_jsx(Box, { ref: mountRef, sx: {
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
                                            }, children: _jsx(Typography, { variant: "h6", sx: { color: nexusColors.nebula }, children: "2D Map View (Coming Soon)" }) }))] }) }) }), _jsxs(Grid, { item: true, xs: 12, lg: 4, children: [_jsx(Card, { className: "holographic", sx: { mb: 2 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.sapphire }, children: "\u0427\u0430\u0441\u043E\u0432\u0456 \u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "body2", sx: { mb: 1, color: nexusColors.nebula }, children: ["\u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0447\u0430\u0441: ", currentTime.toFixed(1)] }), _jsx(Slider, { value: currentTime, min: timeRange[0], max: timeRange[1], onChange: (_, value) => setCurrentTime(value), sx: {
                                                            color: nexusColors.emerald,
                                                            '& .MuiSlider-thumb': {
                                                                boxShadow: `0 0 10px ${nexusColors.emerald}`,
                                                            },
                                                        } })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1, mb: 2 }, children: [_jsx(Button, { variant: "outlined", size: "small", onClick: () => setCurrentTime(timeRange[0]), sx: { minWidth: 'auto' }, children: _jsx(PrevIcon, {}) }), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setIsPlaying(!isPlaying), sx: { minWidth: 'auto' }, children: isPlaying ? _jsx(PauseIcon, {}) : _jsx(PlayIcon, {}) }), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setCurrentTime(timeRange[1]), sx: { minWidth: 'auto' }, children: _jsx(NextIcon, {}) })] }), _jsxs(FormControl, { fullWidth: true, size: "small", sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C" }), _jsxs(Select, { value: playbackSpeed, onChange: (e) => setPlaybackSpeed(e.target.value), sx: { color: nexusColors.frost }, children: [_jsx(MenuItem, { value: 0.5, children: "0.5x" }), _jsx(MenuItem, { value: 1, children: "1x" }), _jsx(MenuItem, { value: 2, children: "2x" }), _jsx(MenuItem, { value: 5, children: "5x" })] })] }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { sx: { color: nexusColors.nebula }, children: "\u0422\u0438\u043F \u043F\u043E\u0434\u0456\u0439" }), _jsxs(Select, { value: selectedEventType, onChange: (e) => setSelectedEventType(e.target.value), sx: { color: nexusColors.frost }, children: [_jsx(MenuItem, { value: "all", children: "\u0412\u0441\u0456" }), _jsx(MenuItem, { value: "incident", children: "\u0406\u043D\u0446\u0438\u0434\u0435\u043D\u0442\u0438" }), _jsx(MenuItem, { value: "anomaly", children: "\u0410\u043D\u043E\u043C\u0430\u043B\u0456\u0457" }), _jsx(MenuItem, { value: "alert", children: "\u0410\u043B\u0435\u0440\u0442\u0438" }), _jsx(MenuItem, { value: "normal", children: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u0456" })] })] })] }) }), _jsx(Card, { className: "holographic", children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2, color: nexusColors.amethyst }, children: "\u041F\u043E\u0442\u043E\u0447\u043D\u0456 \u041F\u043E\u0434\u0456\u0457" }), currentEvents.length === 0 ? (_jsx(Typography, { variant: "body2", sx: { color: nexusColors.shadow }, children: "\u041D\u0435\u043C\u0430\u0454 \u043F\u043E\u0434\u0456\u0439 \u0432 \u043F\u043E\u0442\u043E\u0447\u043D\u043E\u043C\u0443 \u0447\u0430\u0441\u043E\u0432\u043E\u043C\u0443 \u043F\u0440\u043E\u043C\u0456\u0436\u043A\u0443" })) : (currentEvents.map((event) => (_jsxs(Box, { sx: { mb: 2, p: 2, border: `1px solid ${nexusColors.quantum}`, borderRadius: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.frost }, children: event.title }), _jsx(Chip, { label: event.type, size: "small", sx: {
                                                                    backgroundColor: event.type === 'incident' ? nexusColors.crimson :
                                                                        event.type === 'anomaly' ? nexusColors.warning :
                                                                            event.type === 'alert' ? nexusColors.amethyst : nexusColors.emerald,
                                                                    color: nexusColors.frost
                                                                } })] }), _jsx(Typography, { variant: "body2", sx: { color: nexusColors.nebula, mb: 1 }, children: event.description }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.shadow }, children: ["\u041A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u0438: ", event.lat.toFixed(2), ", ", event.lon.toFixed(2), " | \u0427\u0430\u0441: ", event.timestamp, " | \u0406\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", (event.intensity * 100).toFixed(0), "%"] })] }, event.id))))] }) })] })] })] }) }));
};
