import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, OrbitControls, Html, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { useHotkeys } from 'react-hotkeys-hook';
import * as THREE from 'three';
import { Box, Typography, IconButton, Card, CardContent } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
// 3D обличчя з зеленою сіткою
const CyberFace = ({ state, mousePosition, isListening }) => {
    const meshRef = useRef(null);
    const groupRef = useRef(null);
    const wireframeRef = useRef(null);
    // Анімація обертання обличчя за курсором
    useFrame((frameState, delta) => {
        if (groupRef.current) {
            // Плавне обертання за мишею
            const targetRotationY = (mousePosition.x - 0.5) * 0.3;
            const targetRotationX = (mousePosition.y - 0.5) * 0.2;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, delta * 2);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, delta * 2);
        }
        // Пульсація в залежності від стану
        if (meshRef.current) {
            const pulse = Math.sin(frameState.clock.elapsedTime * 2) * 0.1 + 1;
            const scale = state === 'thinking' ? pulse * 1.1 :
                state === 'alert' ? pulse * 1.2 : pulse;
            meshRef.current.scale.setScalar(scale);
        }
        // Анімація wireframe
        if (wireframeRef.current) {
            const material = wireframeRef.current.material;
            if (state === 'listening') {
                material.opacity = 0.8 + Math.sin(frameState.clock.elapsedTime * 5) * 0.2;
            }
            else if (state === 'alert') {
                material.color.setHex(0xff0066);
            }
            else {
                material.color.setHex(0x00ff66);
                material.opacity = 0.6;
            }
        }
    });
    // Геометрія обличчя
    const faceGeometry = new THREE.SphereGeometry(1, 32, 32);
    const wireframeGeometry = new THREE.WireframeGeometry(faceGeometry);
    return (_jsxs("group", { ref: groupRef, position: [0, 0, 0], children: [_jsx("mesh", { ref: meshRef, geometry: faceGeometry, children: _jsx(MeshWobbleMaterial, { color: state === 'alert' ? '#ff0066' : '#0099ff', factor: state === 'thinking' ? 0.6 : 0.1, speed: state === 'speaking' ? 2 : 0.5, transparent: true, opacity: 0.3 }) }), _jsx("lineSegments", { ref: wireframeRef, geometry: wireframeGeometry, children: _jsx("lineBasicMaterial", { color: "#00ff66", transparent: true, opacity: 0.6, linewidth: 2 }) }), (state === 'thinking' || state === 'speaking') && (_jsx(Sparkles, { count: 50, scale: [4, 4, 4], size: 2, speed: 0.4, color: "#00ff66" })), _jsx(Html, { position: [0, -2, 0], center: true, children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, style: {
                        textAlign: 'center',
                        color: '#00ff66',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        textShadow: '0 0 10px #00ff66'
                    }, children: [state === 'idle' && 'Готовий допомогти', state === 'listening' && 'Слухаю...', state === 'thinking' && 'Обробляю запит...', state === 'speaking' && 'Відповідаю...', state === 'alert' && 'Увага! Потрібна дія'] }) })] }));
};
// Головний компонент гіда
const HolographicGuide = ({ onVoiceCommand, onTextInput, currentTask, systemStatus = 'normal', personalizedHints = [] }) => {
    const [guideState, setGuideState] = useState('idle');
    const [isListening, setIsListening] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [showHints, setShowHints] = useState(false);
    const [currentHint, setCurrentHint] = useState('');
    // Web Speech API
    const [recognition, setRecognition] = useState(null);
    const [synthesis] = useState(() => window.speechSynthesis);
    // Ініціалізація розпізнавання мови
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'uk-UA';
            recognitionInstance.onstart = () => {
                setGuideState('listening');
                setIsListening(true);
            };
            recognitionInstance.onresult = (event) => {
                const command = event.results[0][0].transcript;
                setGuideState('thinking');
                onVoiceCommand?.(command);
                // Симулація обробки
                setTimeout(() => {
                    setGuideState('speaking');
                    speak(`Виконую команду: ${command}`);
                }, 1000);
            };
            recognitionInstance.onerror = () => {
                setGuideState('idle');
                setIsListening(false);
            };
            recognitionInstance.onend = () => {
                setIsListening(false);
                if (guideState !== 'thinking') {
                    setGuideState('idle');
                }
            };
            setRecognition(recognitionInstance);
        }
    }, [onVoiceCommand, guideState]);
    // Функція синтезу мови
    const speak = useCallback((text) => {
        if (synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uk-UA';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.onstart = () => setGuideState('speaking');
            utterance.onend = () => setGuideState('idle');
            synthesis.speak(utterance);
        }
    }, [synthesis]);
    // Відстеження миші для обертання обличчя
    const handleMouseMove = useCallback((event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height
        });
    }, []);
    // Жести
    const bind = useGesture({
        onPinch: ({ offset: [scale] }) => {
            // Реагувати на pinch для зуму/взаємодії
            if (scale > 1.2) {
                setShowHints(true);
            }
        },
        onDoubleClick: () => {
            startListening();
        }
    });
    // Гарячі клавіші
    useHotkeys('space', () => startListening(), { preventDefault: true });
    useHotkeys('ctrl+h', () => setShowHints(!showHints), { preventDefault: true });
    // Функція запуску слухання
    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            recognition.start();
        }
    }, [recognition, isListening]);
    // Контекстні підказки
    useEffect(() => {
        if (personalizedHints.length > 0 && guideState === 'idle') {
            const randomHint = personalizedHints[Math.floor(Math.random() * personalizedHints.length)];
            setCurrentHint(randomHint);
            const timer = setTimeout(() => {
                setShowHints(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [personalizedHints, guideState]);
    return (_jsxs(Box, { ...bind(), onMouseMove: handleMouseMove, sx: {
            position: 'relative',
            width: '100%',
            height: '400px',
            background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: isListening ? 'not-allowed' : 'pointer',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300ff66" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                animation: 'starfield 20s linear infinite',
                pointerEvents: 'none'
            }
        }, children: [_jsxs(Canvas, { camera: { position: [0, 0, 5], fov: 75 }, style: { width: '100%', height: '100%' }, children: [_jsx("ambientLight", { intensity: 0.3 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 0.8, color: "#00ff66" }), _jsx("pointLight", { position: [-10, -10, -10], intensity: 0.5, color: "#0099ff" }), _jsx(CyberFace, { state: guideState, mousePosition: mousePosition, isListening: isListening }), _jsx(OrbitControls, { enableZoom: false, enablePan: false, autoRotate: guideState === 'idle', autoRotateSpeed: 0.5 })] }), _jsxs(Box, { sx: {
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 2
                }, children: [_jsx(IconButton, { onClick: startListening, disabled: isListening, sx: {
                            background: 'rgba(0, 255, 102, 0.2)',
                            border: '1px solid #00ff66',
                            color: '#00ff66',
                            '&:hover': {
                                background: 'rgba(0, 255, 102, 0.3)',
                                boxShadow: '0 0 20px rgba(0, 255, 102, 0.5)'
                            },
                            '&:disabled': {
                                color: '#666',
                                border: '1px solid #666'
                            }
                        }, children: isListening ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) }), _jsx(IconButton, { onClick: () => speak('Привіт! Я ваш кібер-помічник. Як можу допомогти?'), sx: {
                            background: 'rgba(0, 153, 255, 0.2)',
                            border: '1px solid #0099ff',
                            color: '#0099ff',
                            '&:hover': {
                                background: 'rgba(0, 153, 255, 0.3)',
                                boxShadow: '0 0 20px rgba(0, 153, 255, 0.5)'
                            }
                        }, children: _jsx(VolumeUpIcon, {}) })] }), _jsx(AnimatePresence, { children: showHints && currentHint && (_jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -50 }, style: {
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        maxWidth: '300px'
                    }, children: _jsx(Card, { sx: {
                            background: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid #00ff66',
                            borderRadius: 2,
                            backdropFilter: 'blur(10px)'
                        }, children: _jsx(CardContent, { children: _jsxs(Typography, { variant: "body2", sx: {
                                    color: '#00ff66',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.4
                                }, children: ["\uD83D\uDCA1 ", currentHint] }) }) }) })) }), systemStatus !== 'normal' && (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, style: {
                    position: 'absolute',
                    top: 16,
                    left: 16
                }, children: _jsx(Box, { sx: {
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: systemStatus === 'warning' ? '#ffaa00' : '#ff0066',
                        boxShadow: `0 0 20px ${systemStatus === 'warning' ? '#ffaa00' : '#ff0066'}`,
                        animation: 'pulse 1s infinite'
                    } }) })), _jsx("style", { children: `
        @keyframes starfield {
          0% { transform: translateY(0); }
          100% { transform: translateY(-40px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        ` })] }));
};
export default HolographicGuide;
