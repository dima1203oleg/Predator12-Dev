import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { nexusColors } from '../../theme/nexusTheme';
// Canvas Fallback Component for better performance
const CanvasFallbackFace = ({ emotion, isSpeaking, intensity, systemHealth, size }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef();
    const fallbackSizeConfig = {
        small: { width: 120, height: 120 },
        medium: { width: 180, height: 180 },
        large: { width: 240, height: 240 }
    };
    const config = fallbackSizeConfig[size] || fallbackSizeConfig.small;
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let time = 0;
        const animate = () => {
            time += 0.016; // ~60fps
            // Clear canvas
            ctx.clearRect(0, 0, config.width, config.height);
            const centerX = config.width / 2;
            const centerY = config.height / 2;
            const baseRadius = config.width * 0.3;
            // Emotion colors
            const emotionColors = {
                neutral: { primary: '#4FC3F7', secondary: '#29B6F6', accent: '#03A9F4' },
                success: { primary: '#66BB6A', secondary: '#4CAF50', accent: '#388E3C' },
                alert: { primary: '#FFA726', secondary: '#FF9800', accent: '#F57C00' },
                error: { primary: '#EF5350', secondary: '#F44336', accent: '#D32F2F' },
                processing: { primary: '#AB47BC', secondary: '#9C27B0', accent: '#7B1FA2' }
            };
            const colors = emotionColors[emotion] || emotionColors.neutral;
            // Animate particles in circle formation (simplified face outline)
            const particleCount = 24;
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
                const radius = baseRadius + Math.sin(time * 2 + i * 0.5) * 5;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius * 0.8; // Ellipse for face shape
                // Particle size based on speaking and emotion
                const particleSize = isSpeaking ? 3 + Math.sin(time * 10 + i) * 1 : 2;
                // Create gradient
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 2);
                gradient.addColorStop(0, colors.primary);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            // Eyes (simplified)
            const eyeY = centerY - baseRadius * 0.3;
            const eyeSize = isSpeaking ? 4 + Math.sin(time * 8) * 1 : 3;
            // Left eye
            ctx.fillStyle = colors.accent;
            ctx.beginPath();
            ctx.arc(centerX - baseRadius * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            // Right eye
            ctx.beginPath();
            ctx.arc(centerX + baseRadius * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            // Mouth (animated for speaking)
            if (isSpeaking) {
                const mouthY = centerY + baseRadius * 0.2;
                const mouthWidth = 20 + Math.sin(time * 15) * 5;
                const mouthHeight = 8 + Math.sin(time * 12) * 3;
                ctx.strokeStyle = colors.secondary;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(centerX, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            // Aura effect (simplified)
            const auraRadius = baseRadius * 1.8 + Math.sin(time) * 10;
            const auraGradient = ctx.createRadialGradient(centerX, centerY, baseRadius, centerX, centerY, auraRadius);
            auraGradient.addColorStop(0, 'transparent');
            auraGradient.addColorStop(0.7, colors.primary + '20');
            auraGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
            ctx.fill();
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [emotion, isSpeaking, intensity, systemHealth, config]);
    return (_jsx("canvas", { ref: canvasRef, width: config.width, height: config.height, style: {
            width: config.width,
            height: config.height,
            borderRadius: '50%'
        } }));
};
export const HolographicAIFace = ({ isActive = true, isSpeaking = false, emotion = 'neutral', message = '', intensity = 0.5, size = 'medium', enableGlitch = true, enableAura = true, enableDataStream = true, enableSoundWaves = true, enableEnergyRings = true, systemHealth = 'optimal', cpuLoad = 0.3, memoryUsage = 0.4, autoPosition = true, fixedPosition, collisionAvoidance = true, onCollision, adaptiveOpacity = true, hideOnOverlap = false, fallbackMode = false, performanceMode = 'medium', onPerformanceChange }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const particleSystemRef = useRef(null);
    const dataStreamRef = useRef(null);
    const alertSystemRef = useRef(null);
    const auraRef = useRef(null);
    const [webglSupported, setWebglSupported] = useState(true);
    const [fps, setFps] = useState(60);
    const [forceCanvasFallback, setForceCanvasFallback] = useState(false);
    const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
    const animationFrameRef = useRef();
    // Performance monitoring
    useEffect(() => {
        if (!isActive || fallbackMode || forceCanvasFallback)
            return;
        const measureFPS = () => {
            const now = performance.now();
            const delta = now - fpsCounterRef.current.lastTime;
            if (delta >= 1000) {
                const currentFPS = Math.round((fpsCounterRef.current.frames * 1000) / delta);
                setFps(currentFPS);
                // Auto-fallback if FPS drops below 45
                if (currentFPS < 45 && !forceCanvasFallback) {
                    setForceCanvasFallback(true);
                    console.warn('HolographicAIFace: Performance degraded, switching to Canvas fallback');
                }
                if (onPerformanceChange) {
                    onPerformanceChange(currentFPS, currentFPS < 45);
                }
                fpsCounterRef.current.frames = 0;
                fpsCounterRef.current.lastTime = now;
            }
            fpsCounterRef.current.frames++;
            animationFrameRef.current = requestAnimationFrame(measureFPS);
        };
        measureFPS();
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, fallbackMode, forceCanvasFallback, onPerformanceChange]);
    // WebGL support detection
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            setWebglSupported(!!gl);
            // Test for WebGL context lost
            const extension = gl?.getExtension('WEBGL_lose_context');
            if (extension) {
                canvas.addEventListener('webglcontextlost', () => {
                    console.warn('WebGL context lost, switching to Canvas fallback');
                    setForceCanvasFallback(true);
                });
            }
        }
        catch (error) {
            setWebglSupported(false);
        }
    }, []);
    // Determine rendering mode
    const shouldUseFallback = fallbackMode || !webglSupported || forceCanvasFallback || fps < 45;
    // Size configurations
    const sizeConfig = useMemo(() => ({
        small: { width: 120, height: 120, particles: performanceMode === 'high' ? 800 : performanceMode === 'medium' ? 400 : 200 },
        medium: { width: 180, height: 180, particles: performanceMode === 'high' ? 1200 : performanceMode === 'medium' ? 600 : 300 },
        large: { width: 240, height: 240, particles: performanceMode === 'high' ? 1600 : performanceMode === 'medium' ? 800 : 400 }
    }), [performanceMode]);
    // Emotion color palettes
    const emotionColors = useMemo(() => ({
        neutral: {
            primary: [0.31, 0.76, 0.97], // Light blue
            secondary: [0.16, 0.71, 0.96],
            accent: [0.01, 0.66, 0.96]
        },
        success: {
            primary: [0.4, 0.73, 0.42], // Green
            secondary: [0.3, 0.69, 0.31],
            accent: [0.22, 0.56, 0.24]
        },
        alert: {
            primary: [1.0, 0.65, 0.15], // Orange
            secondary: [1.0, 0.6, 0.0],
            accent: [0.96, 0.49, 0.0]
        },
        error: {
            primary: [0.94, 0.33, 0.31], // Red
            secondary: [0.96, 0.26, 0.21],
            accent: [0.83, 0.18, 0.18]
        },
        processing: {
            primary: [0.67, 0.28, 0.74], // Purple
            secondary: [0.61, 0.15, 0.69],
            accent: [0.48, 0.12, 0.64]
        }
    }), []);
    // Three.js scene setup
    useEffect(() => {
        if (shouldUseFallback || !isActive)
            return;
        if (!mountRef.current)
            return;
        // Cleanup previous scene
        if (sceneRef.current) {
            mountRef.current.innerHTML = '';
        }
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;
        const config = sizeConfig[size];
        const renderer = new THREE.WebGLRenderer({
            antialias: performanceMode === 'high',
            alpha: true,
            powerPreference: performanceMode === 'high' ? 'high-performance' : 'default'
        });
        renderer.setSize(config.width, config.height);
        renderer.setPixelRatio(performanceMode === 'high' ? Math.min(window.devicePixelRatio, 2) : 1);
        mountRef.current.appendChild(renderer.domElement);
        // Face particles with dynamic count
        const count = config.particles;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2 + 0.6;
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.sin(angle) * radius * 0.8;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
            const emotionColor = emotionColors[emotion];
            const colorType = Math.random() < 0.6 ? 'primary' : Math.random() < 0.8 ? 'secondary' : 'accent';
            const [r, g, b] = emotionColor[colorType];
            colors[i3] = r;
            colors[i3 + 1] = g;
            colors[i3 + 2] = b;
            sizes[i] = Math.random() * 3 + 1;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        // Shader materials
        const vertexShader = `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uActivity;
      uniform float uSpeaking;
      void main() {
        vColor = color;
        vec3 pos = position;
        float angle = uTime * 0.1 + length(pos) * 0.1;
        pos.x += sin(angle) * 0.1;
        pos.z += cos(angle) * 0.1;
        pos *= 1.0 + uActivity * 0.2 * sin(uTime * 2.0);
        
        // Speaking animation
        if (uSpeaking > 0.5) {
          pos.y += sin(uTime * 10.0 + pos.x * 5.0) * 0.05;
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
        const fragmentShader = `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - 0.5);
        if (dist > 0.5) discard;
        float alpha = 1.0 - dist * 2.0;
        gl_FragColor = vec4(vColor, alpha * 0.85);
      }
    `;
        const faceMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uActivity: { value: intensity },
                uSpeaking: { value: isSpeaking ? 1.0 : 0.0 }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const particles = new THREE.Points(geometry, faceMaterial);
        particleSystemRef.current = particles;
        scene.add(particles);
        // Animation loop
        let time = 0;
        const animate = () => {
            time += 0.016; // ~60fps
            fpsCounterRef.current.frames++;
            if (faceMaterial.uniforms) {
                faceMaterial.uniforms.uTime.value = time;
                faceMaterial.uniforms.uActivity.value = intensity;
                faceMaterial.uniforms.uSpeaking.value = isSpeaking ? 1.0 : 0.0;
            }
            if (particles) {
                particles.rotation.y = time * 0.1;
            }
            renderer.render(scene, camera);
            if (isActive && !shouldUseFallback) {
                requestAnimationFrame(animate);
            }
        };
        animate();
        // Cleanup function
        return () => {
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometry.dispose();
            faceMaterial.dispose();
        };
    }, [
        shouldUseFallback,
        isActive,
        size,
        emotion,
        intensity,
        isSpeaking,
        performanceMode,
        sizeConfig,
        emotionColors
    ]);
    // Render Canvas fallback or WebGL
    if (shouldUseFallback) {
        return (_jsxs(Box, { sx: {
                position: 'relative',
                ...fixedPosition,
                opacity: adaptiveOpacity && hideOnOverlap ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
            }, children: [_jsx(CanvasFallbackFace, { emotion: emotion, isSpeaking: isSpeaking, intensity: intensity, systemHealth: systemHealth, size: size }), (cpuLoad > 0.8 || memoryUsage > 0.8) && (_jsx(Box, { sx: {
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        fontSize: '10px',
                        color: nexusColors.crimson,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        border: `1px solid ${nexusColors.crimson}`,
                        animation: 'pulse 1s infinite'
                    }, children: "\u26A0\uFE0F HIGH LOAD" })), message && (_jsx(Box, { sx: {
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '15px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: `1px solid ${nexusColors.quantum}`,
                        fontSize: '12px',
                        color: nexusColors.frost,
                        maxWidth: '200px',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)'
                    }, children: message }))] }));
    }
    return (_jsxs(Box, { sx: {
            position: 'relative',
            ...fixedPosition,
            opacity: adaptiveOpacity && hideOnOverlap ? 0.7 : 1,
            transition: 'opacity 0.3s ease'
        }, children: [_jsx("div", { ref: mountRef }), performanceMode === 'high' && fps < 50 && (_jsxs(Box, { sx: {
                    position: 'absolute',
                    bottom: -20,
                    left: 0,
                    fontSize: '8px',
                    color: nexusColors.nebula,
                    opacity: 0.7
                }, children: ["FPS: ", fps] })), systemHealth !== 'optimal' && (_jsxs(_Fragment, { children: [_jsx(Box, { sx: {
                            position: 'absolute',
                            top: -15,
                            left: -15,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: `conic-gradient(
                ${nexusColors.crimson} ${cpuLoad * 360}deg,
                rgba(255, 255, 255, 0.1) 0deg
              )`,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            color: 'white',
                            fontWeight: 'bold'
                        }, children: "CPU" }), _jsx(Box, { sx: {
                            position: 'absolute',
                            top: -15,
                            right: -15,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: `conic-gradient(
                ${nexusColors.sapphire} ${memoryUsage * 360}deg,
                rgba(255, 255, 255, 0.1) 0deg
              )`,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            color: 'white',
                            fontWeight: 'bold'
                        }, children: "RAM" })] })), message && (_jsx(Box, { sx: {
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '10px',
                    padding: '8px 12px',
                    borderRadius: '15px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: `1px solid ${nexusColors.quantum}`,
                    fontSize: '12px',
                    color: nexusColors.frost,
                    maxWidth: '200px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    opacity: isSpeaking ? 1 : 0.7,
                    transition: 'opacity 0.3s ease'
                }, children: message }))] }));
};
export default HolographicAIFace;
