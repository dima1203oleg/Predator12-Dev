import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { nexusColors } from '../../theme/nexusTheme';
// Canvas Fallback Component for performance
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
            // Get emotion colors
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
                const size = isSpeaking ? 3 + Math.sin(time * 10 + i) * 1 : 2;
                // Create gradient
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
                gradient.addColorStop(0, colors.primary);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
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
    const [webglSupported, setWebglSupported] = useState(true);
    const [fps, setFps] = useState(60);
    const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
    const animationFrameRef = useRef();
    // Performance monitoring
    useEffect(() => {
        if (!isActive || fallbackMode)
            return;
        const measureFPS = () => {
            const now = performance.now();
            const delta = now - fpsCounterRef.current.lastTime;
            if (delta >= 1000) {
                const currentFPS = Math.round((fpsCounterRef.current.frames * 1000) / delta);
                setFps(currentFPS);
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
    }, [isActive, fallbackMode, onPerformanceChange]);
    // WebGL support detection
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setWebglSupported(!!gl);
    }, []);
    // Use fallback if WebGL not supported or explicitly requested or performance issues
    const shouldUseFallback = fallbackMode || !webglSupported || fps < 45;
    const emotionColors = useMemo(() => ({
        neutral: {
            primary: [0.2, 0.9, 1.0],
            secondary: [0.4, 0.8, 1.0],
            accent: [0.1, 1.0, 0.9]
        },
        alert: {
            primary: [1.0, 0.2, 0.2],
            secondary: [1.0, 0.4, 0.1],
            accent: [1.0, 0.0, 0.3]
        },
        processing: {
            primary: [0.9, 0.3, 1.0],
            secondary: [0.6, 0.5, 1.0],
            accent: [0.8, 0.2, 0.9]
        },
        success: {
            primary: [0.2, 1.0, 0.4],
            secondary: [0.1, 0.9, 0.6],
            accent: [0.3, 1.0, 0.2]
        },
        error: {
            primary: [1.0, 0.1, 0.1],
            secondary: [1.0, 0.3, 0.0],
            accent: [0.9, 0.0, 0.2]
        }
    }), []);
    const sizeConfig = useMemo(() => ({
        small: { width: 200, height: 200, particles: 500 },
        medium: { width: 350, height: 350, particles: 1200 },
        large: { width: 500, height: 500, particles: 2000 }
    }), []);
    useEffect(() => {
        if (!mountRef.current)
            return;
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;
        const config = sizeConfig[size];
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(config.width, config.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        // Vertex shader code
        const vertexShader = `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uActivity;
      void main() {
        vColor = color;
        vec3 pos = position;
        float angle = uTime * 0.1 + length(pos) * 0.1;
        pos.x += sin(angle) * 0.1;
        pos.z += cos(angle) * 0.1;
        pos *= 1.0 + uActivity * 0.2 * sin(uTime * 2.0);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
        // Fragment shader code
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
        // Aura effect (mystical glow around face)
        let auraParticles = null;
        if (enableAura) {
            const auraCount = Math.floor(count * 0.3);
            const auraGeometry = new THREE.BufferGeometry();
            const auraPositions = new Float32Array(auraCount * 3);
            const auraColors = new Float32Array(auraCount * 3);
            const auraSizes = new Float32Array(auraCount);
            for (let i = 0; i < auraCount; i++) {
                const i3 = i * 3;
                const angle = (i / auraCount) * Math.PI * 2;
                const radius = 2.5 + Math.sin(i * 0.1) * 0.5;
                auraPositions[i3] = Math.cos(angle) * radius;
                auraPositions[i3 + 1] = Math.sin(angle) * radius;
                auraPositions[i3 + 2] = (Math.random() - 0.5) * 2;
                const emotionColor = emotionColors[emotion];
                const [r, g, b] = emotionColor.accent;
                auraColors[i3] = r;
                auraColors[i3 + 1] = g;
                auraColors[i3 + 2] = b;
                auraSizes[i] = Math.random() * 8 + 4;
            }
            auraGeometry.setAttribute('position', new THREE.BufferAttribute(auraPositions, 3));
            auraGeometry.setAttribute('color', new THREE.BufferAttribute(auraColors, 3));
            auraGeometry.setAttribute('size', new THREE.BufferAttribute(auraSizes, 1));
            const auraVertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos += sin(uTime * 0.5 + pos.x * 0.1) * 0.3;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (${config.width}.0 / -mvPosition.z) * (0.5 + 0.5 * sin(uTime * 2.0));
          gl_Position = projectionMatrix * mvPosition;
        }
      `;
            const auraFragmentShader = `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - 0.5);
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * 0.3;
          gl_FragColor = vec4(vColor, alpha);
        }
      `;
            const auraMaterial = new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 } },
                vertexShader: auraVertexShader,
                fragmentShader: auraFragmentShader,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            auraParticles = new THREE.Points(auraGeometry, auraMaterial);
            auraRef.current = auraParticles;
            scene.add(auraParticles);
        }
        // Data stream effect
        let dataStreamParticles = null;
        if (enableDataStream) {
            const dataCount = 100;
            const dataGeometry = new THREE.BufferGeometry();
            const dataPositions = new Float32Array(dataCount * 3);
            const dataColors = new Float32Array(dataCount * 3);
            const dataSizes = new Float32Array(dataCount);
            for (let i = 0; i < dataCount; i++) {
                const i3 = i * 3;
                dataPositions[i3] = (Math.random() - 0.5) * 6;
                dataPositions[i3 + 1] = (Math.random() - 0.5) * 6;
                dataPositions[i3 + 2] = (Math.random() - 0.5) * 6;
                const emotionColor = emotionColors[emotion];
                const [r, g, b] = emotionColor.secondary;
                dataColors[i3] = r;
                dataColors[i3 + 1] = g;
                dataColors[i3 + 2] = b;
                dataSizes[i] = 1 + Math.random() * 2;
            }
            dataGeometry.setAttribute('position', new THREE.BufferAttribute(dataPositions, 3));
            dataGeometry.setAttribute('color', new THREE.BufferAttribute(dataColors, 3));
            dataGeometry.setAttribute('size', new THREE.BufferAttribute(dataSizes, 1));
            const dataVertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += mod(uTime * 2.0 + pos.x * 0.1, 6.0) - 3.0;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (${config.width}.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;
            const dataFragmentShader = `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - 0.5);
          if (dist > 0.5) discard;
          float alpha = 1.0 - dist * 2.0;
          gl_FragColor = vec4(vColor, alpha * 0.7);
        }
      `;
            const dataMaterial = new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 } },
                vertexShader: dataVertexShader,
                fragmentShader: dataFragmentShader,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            dataStreamParticles = new THREE.Points(dataGeometry, dataMaterial);
            dataStreamRef.current = dataStreamParticles;
            scene.add(dataStreamParticles);
        }
        // Alert particles (only for alert/error)
        let alertParticles = null;
        if (emotion === 'alert' || emotion === 'error') {
            const ac = 200;
            const ag = new THREE.BufferGeometry();
            const apos = new Float32Array(ac * 3);
            const acol = new Float32Array(ac * 3);
            const asize = new Float32Array(ac);
            for (let i = 0; i < ac; i++) {
                const i3 = i * 3;
                apos[i3] = (Math.random() - 0.5) * 8;
                apos[i3 + 1] = (Math.random() - 0.5) * 8;
                apos[i3 + 2] = (Math.random() - 0.5) * 8;
                acol[i3] = 1.0;
                acol[i3 + 1] = 0.3;
                acol[i3 + 2] = 0.1;
                asize[i] = Math.random() * 2 + 0.5;
            }
            ag.setAttribute('position', new THREE.BufferAttribute(apos, 3));
            ag.setAttribute('color', new THREE.BufferAttribute(acol, 3));
            ag.setAttribute('size', new THREE.BufferAttribute(asize, 1));
            // Alert vertex shader
            const alertVertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 2.0 + pos.x * 0.1) * 0.5;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;
            // Alert fragment shader
            const alertFragmentShader = `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - 0.5);
          if (dist > 0.5) discard;
          float alpha = 1.0 - dist * 2.0;
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `;
            const alertMat = new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 } },
                vertexShader: alertVertexShader,
                fragmentShader: alertFragmentShader,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            alertParticles = new THREE.Points(ag, alertMat);
            alertSystemRef.current = alertParticles;
            scene.add(alertParticles);
        }
        // Glitch lines effect
        let glitchLines = null;
        if (enableGlitch && Math.random() < 0.7) {
            const glitchCount = 50;
            const glitchGeometry = new THREE.BufferGeometry();
            const glitchPositions = new Float32Array(glitchCount * 6); // 2 points per line
            const glitchColors = new Float32Array(glitchCount * 6);
            for (let i = 0; i < glitchCount; i++) {
                const i6 = i * 6;
                // First point
                glitchPositions[i6] = (Math.random() - 0.5) * 4;
                glitchPositions[i6 + 1] = (Math.random() - 0.5) * 4;
                glitchPositions[i6 + 2] = (Math.random() - 0.5) * 2;
                // Second point
                glitchPositions[i6 + 3] = glitchPositions[i6] + (Math.random() - 0.5) * 0.5;
                glitchPositions[i6 + 4] = glitchPositions[i6 + 1] + (Math.random() - 0.5) * 0.5;
                glitchPositions[i6 + 5] = glitchPositions[i6 + 2];
                const emotionColor = emotionColors[emotion];
                const [r, g, b] = emotionColor.primary;
                for (let j = 0; j < 6; j += 3) {
                    glitchColors[i6 + j] = r;
                    glitchColors[i6 + j + 1] = g;
                    glitchColors[i6 + j + 2] = b;
                }
            }
            glitchGeometry.setAttribute('position', new THREE.BufferAttribute(glitchPositions, 3));
            glitchGeometry.setAttribute('color', new THREE.BufferAttribute(glitchColors, 3));
            const glitchMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            glitchLines = new THREE.LineSegments(glitchGeometry, glitchMaterial);
            glitchLinesRef.current = glitchLines;
            scene.add(glitchLines);
        }
        // Sound waves effect (when speaking) - тонкі і ненав'язливі
        const soundWaves = [];
        if (enableSoundWaves && isSpeaking) {
            for (let i = 0; i < 3; i++) {
                const waveGeometry = new THREE.RingGeometry(3 + i * 0.8, 3.05 + i * 0.8, 64);
                const waveMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(emotionColors[emotion].primary[0], emotionColors[emotion].primary[1], emotionColors[emotion].primary[2]),
                    transparent: true,
                    opacity: 0.1 - i * 0.02, // Набагато менша прозорість
                    side: THREE.DoubleSide
                });
                const wave = new THREE.Mesh(waveGeometry, waveMaterial);
                wave.position.z = -1 - i * 0.2; // Позаду основних ефектів
                wave.userData = { baseRadius: 3 + i * 0.8, waveIndex: i };
                soundWaves.push(wave);
                scene.add(wave);
            }
            soundWavesRef.current = soundWaves;
        }
        // Energy rings (system status indicators) - тонкі та ледь помітні
        const energyRings = [];
        if (enableEnergyRings) {
            const ringCount = systemHealth === 'optimal' ? 2 : systemHealth === 'warning' ? 1 : 1;
            const healthColors = {
                optimal: [0.2, 1.0, 0.4],
                warning: [1.0, 0.8, 0.2],
                critical: [1.0, 0.2, 0.2]
            };
            for (let i = 0; i < ringCount; i++) {
                const ringGeometry = new THREE.TorusGeometry(3.8 + i * 0.4, 0.01, 4, 16); // Тонші кільця, далі від центру
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(...healthColors[systemHealth]),
                    transparent: true,
                    opacity: 0.15 - i * 0.05 // Набагато менша прозорість
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                ring.position.z = -0.5 - i * 0.1; // Позаду основних ефектів
                ring.userData = { ringIndex: i, baseY: i * 0.05 };
                energyRings.push(ring);
                scene.add(ring);
            }
            energyRingsRef.current = energyRings;
        }
        const clock = new THREE.Clock();
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            const mat = particleSystemRef.current?.material;
            if (mat) {
                mat.uniforms.uTime.value = t;
                mat.uniforms.uActivity.value = intensity;
                mat.uniforms.uSpeaking.value = isSpeaking ? 1.0 : 0.0;
            }
            if (alertSystemRef.current) {
                const am = alertSystemRef.current.material;
                am.uniforms.uTime.value = t;
                alertSystemRef.current.rotation.y = -t * 0.2;
            }
            // Animate aura
            if (auraRef.current) {
                const auraMat = auraRef.current.material;
                auraMat.uniforms.uTime.value = t;
                auraRef.current.rotation.z = t * 0.05;
            }
            // Animate data stream
            if (dataStreamRef.current) {
                const dataMat = dataStreamRef.current.material;
                dataMat.uniforms.uTime.value = t;
            }
            // Animate glitch lines (random visibility)
            if (glitchLinesRef.current) {
                glitchLinesRef.current.visible = Math.random() > 0.7;
                glitchLinesRef.current.rotation.z = t * 2.0;
            }
            // Animate sound waves - ненав'язливо
            if (soundWavesRef.current.length > 0) {
                soundWavesRef.current.forEach((wave, index) => {
                    const baseRadius = wave.userData.baseRadius;
                    const waveScale = 1 + Math.sin(t * 2 - index * 0.3) * 0.1; // Менша амплітуда
                    wave.scale.setScalar(waveScale);
                    wave.rotation.z = t * (0.1 + index * 0.05); // Повільніше обертання
                    const material = wave.material;
                    material.opacity = (0.1 - index * 0.02) * (0.3 + 0.2 * Math.sin(t * 1.5 - index)); // Менша видимість
                });
            }
            // Animate energy rings - тонко і елегантно
            if (energyRingsRef.current.length > 0) {
                energyRingsRef.current.forEach((ring, index) => {
                    ring.rotation.y = t * (0.1 + index * 0.05); // Повільніше
                    ring.position.y = ring.userData.baseY + Math.sin(t * 1.5 + index) * 0.02; // Менший рух
                    // Pulse based on system metrics - м'якше
                    const pulse = 1 + (cpuLoad + memoryUsage) * 0.05 * Math.sin(t * 2 + index);
                    ring.scale.setScalar(pulse);
                });
            }
            particleSystemRef.current && (particleSystemRef.current.rotation.y = t * 0.1);
            renderer.render(scene, camera);
        };
        if (isActive)
            animate();
        return () => {
            if (animationIdRef.current)
                cancelAnimationFrame(animationIdRef.current);
            try {
                mountRef.current?.removeChild(renderer.domElement);
            }
            catch { }
            renderer.dispose();
            geometry.dispose();
            faceMaterial.dispose?.();
            // Cleanup all effects
            if (alertParticles) {
                alertParticles.geometry.dispose();
                alertParticles.material.dispose?.();
            }
            if (auraParticles) {
                auraParticles.geometry.dispose();
                auraParticles.material.dispose?.();
            }
            if (dataStreamParticles) {
                dataStreamParticles.geometry.dispose();
                dataStreamParticles.material.dispose?.();
            }
            if (glitchLines) {
                glitchLines.geometry.dispose();
                glitchLines.material.dispose?.();
            }
            // Cleanup sound waves
            soundWaves.forEach(wave => {
                wave.geometry.dispose();
                wave.material.dispose?.();
            });
            // Cleanup energy rings
            energyRings.forEach(ring => {
                ring.geometry.dispose();
                ring.material.dispose?.();
            });
        };
    }, [isActive, emotion, intensity, isSpeaking, emotionColors, size, enableGlitch, enableAura, enableDataStream, enableSoundWaves, enableEnergyRings, systemHealth, cpuLoad, memoryUsage, sizeConfig]);
    const config = sizeConfig[size];
    const emotionColor = emotionColors[emotion];
    // Система колізійного детектування
    const checkCollisions = useCallback(() => {
        if (!mountRef.current || !collisionAvoidance)
            return [];
        const rect = mountRef.current.getBoundingClientRect();
        const elementsUnder = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        // Фільтруємо елементи UI (кнопки, меню, модали тощо)
        const uiElements = elementsUnder.filter(el => el !== mountRef.current &&
            (el.tagName === 'BUTTON' ||
                el.closest('[role="button"]') ||
                el.closest('[role="dialog"]') ||
                el.closest('.MuiAppBar-root') ||
                el.closest('.MuiDrawer-root') ||
                el.closest('.MuiPaper-root') ||
                el.closest('.MuiCard-root') ||
                el.closest('[data-testid]') ||
                el.classList.contains('ui-element')));
        return uiElements;
    }, [collisionAvoidance]);
    // Адаптивне позиціонування для уникнення колізій
    const findSafePosition = useCallback(() => {
        if (!autoPosition || !collisionAvoidance)
            return currentPosition;
        const positions = [
            { bottom: 24, right: 24 }, // Стандартна позиція
            { bottom: 24, left: 24 }, // Ліва нижня
            { top: 80, right: 24 }, // Права верхня (з відступом для AppBar)
            { top: 80, left: 24 }, // Ліва верхня
            { bottom: 120, right: 24 }, // Вища справа
            { bottom: 24, right: 120 }, // Правіше внизу
        ];
        for (const pos of positions) {
            // Тимчасово встановлюємо позицію для перевірки
            const testElement = document.createElement('div');
            testElement.style.position = 'fixed';
            testElement.style.width = `${sizeConfig[size].width}px`;
            testElement.style.height = `${sizeConfig[size].height}px`;
            testElement.style.pointerEvents = 'none';
            testElement.style.zIndex = '-1';
            Object.entries(pos).forEach(([key, value]) => {
                testElement.style[key] = `${value}px`;
            });
            document.body.appendChild(testElement);
            const rect = testElement.getBoundingClientRect();
            const elementsUnder = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            document.body.removeChild(testElement);
            const hasCollision = elementsUnder.some(el => el.tagName === 'BUTTON' ||
                el.closest('[role="button"]') ||
                el.closest('[role="dialog"]') ||
                el.closest('.MuiAppBar-root') ||
                el.closest('.MuiDrawer-root'));
            if (!hasCollision) {
                return pos;
            }
        }
        return currentPosition; // Повертаємо поточну, якщо безпечну не знайдено
    }, [autoPosition, collisionAvoidance, currentPosition, size, sizeConfig]);
    // Оновлення позиції та прозорості на основі колізій
    useEffect(() => {
        if (!collisionAvoidance)
            return;
        const handleCollisionCheck = () => {
            const collisionElements = checkCollisions();
            if (collisionElements.length > 0) {
                onCollision?.(collisionElements);
                if (hideOnOverlap) {
                    setIsHidden(true);
                }
                else if (adaptiveOpacity) {
                    setCurrentOpacity(0.3); // Знижуємо прозорість при колізії
                }
                // Спробуємо знайти безпечну позицію
                if (autoPosition) {
                    const safePosition = findSafePosition();
                    setCurrentPosition(safePosition);
                }
            }
            else {
                setIsHidden(false);
                setCurrentOpacity(1);
            }
        };
        const interval = setInterval(handleCollisionCheck, 200); // Перевіряємо кожні 200мс
        handleCollisionCheck(); // Перевірка при монтуванні
        return () => clearInterval(interval);
    }, [checkCollisions, onCollision, hideOnOverlap, adaptiveOpacity, autoPosition, findSafePosition]);
    return (_jsx(Box, { ref: mountRef, "data-avatar-container": true, sx: {
            position: 'fixed',
            ...currentPosition,
            width: sizeConfig[size].width,
            height: sizeConfig[size].height,
            zIndex: 1000,
            borderRadius: '50%',
            background: `
          radial-gradient(circle at 30% 30%, 
            rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.15),
            rgba(${emotionColor.secondary[0] * 255}, ${emotionColor.secondary[1] * 255}, ${emotionColor.secondary[2] * 255}, 0.08),
            transparent 70%),
          radial-gradient(circle at 70% 70%, 
            rgba(${emotionColor.accent[0] * 255}, ${emotionColor.accent[1] * 255}, ${emotionColor.accent[2] * 255}, 0.1),
            transparent 50%),
          ${nexusColors.obsidian}20
        `,
            border: `2px solid rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.6)`,
            boxShadow: `
          0 0 20px rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.4),
          0 0 40px rgba(${emotionColor.accent[0] * 255}, ${emotionColor.accent[1] * 255}, ${emotionColor.accent[2] * 255}, 0.2),
          inset 0 0 20px rgba(${emotionColor.secondary[0] * 255}, ${emotionColor.secondary[1] * 255}, ${emotionColor.secondary[2] * 255}, 0.1)
        `,
            backdropFilter: 'blur(15px) saturate(180%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isActive && !isHidden ? currentOpacity : 0.1,
            transform: isSpeaking ? 'scale(1.05)' : isHidden ? 'scale(0.8)' : 'scale(1.0)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isHidden ? 'none' : 'auto',
            animation: isActive ? 'pulse 3s ease-in-out infinite' : 'none',
            '& canvas': {
                borderRadius: '50%',
                filter: `
            drop-shadow(0 0 10px rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.6))
            saturate(120%) 
            brightness(110%)
          `
            },
            '@keyframes pulse': {
                '0%, 100%': {
                    borderColor: `rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.6)`,
                    boxShadow: `
              0 0 20px rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.4),
              0 0 40px rgba(${emotionColor.accent[0] * 255}, ${emotionColor.accent[1] * 255}, ${emotionColor.accent[2] * 255}, 0.2)
            `
                },
                '50%': {
                    borderColor: `rgba(${emotionColor.accent[0] * 255}, ${emotionColor.accent[1] * 255}, ${emotionColor.accent[2] * 255}, 0.8)`,
                    boxShadow: `
              0 0 30px rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.6),
              0 0 60px rgba(${emotionColor.accent[0] * 255}, ${emotionColor.accent[1] * 255}, ${emotionColor.accent[2] * 255}, 0.4)
            `
                }
            }
        }, children: isActive && (_jsxs(_Fragment, { children: [_jsx(Box, { sx: {
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: `conic-gradient(
                rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.8) ${cpuLoad * 360}deg,
                rgba(255, 255, 255, 0.1) 0deg
              )`,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        animation: cpuLoad > 0.8 ? 'warning-pulse 1s infinite' : 'none',
                        '@keyframes warning-pulse': {
                            '0%, 100%': { boxShadow: '0 0 5px rgba(255, 100, 100, 0.5)' },
                            '50%': { boxShadow: '0 0 15px rgba(255, 100, 100, 0.8)' }
                        }
                    }, children: "CPU" }), _jsx(Box, { sx: {
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: `conic-gradient(
                rgba(${emotionColor.secondary[0] * 255}, ${emotionColor.secondary[1] * 255}, ${emotionColor.secondary[2] * 255}, 0.8) ${memoryUsage * 360}deg,
                rgba(255, 255, 255, 0.1) 0deg
              )`,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        animation: memoryUsage > 0.8 ? 'warning-pulse 1s infinite' : 'none'
                    }, children: "RAM" }), _jsx(Box, { sx: {
                        position: 'absolute',
                        bottom: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: systemHealth === 'optimal'
                            ? 'rgba(50, 255, 100, 0.2)'
                            : systemHealth === 'warning'
                                ? 'rgba(255, 200, 50, 0.2)'
                                : 'rgba(255, 50, 50, 0.2)',
                        border: `1px solid ${systemHealth === 'optimal'
                            ? 'rgba(50, 255, 100, 0.6)'
                            : systemHealth === 'warning'
                                ? 'rgba(255, 200, 50, 0.6)'
                                : 'rgba(255, 50, 50, 0.6)'}`,
                        fontSize: '10px',
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }, children: systemHealth }), message && (_jsx(Box, { sx: {
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '15px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: `1px solid rgba(${emotionColor.primary[0] * 255}, ${emotionColor.primary[1] * 255}, ${emotionColor.primary[2] * 255}, 0.6)`,
                        fontSize: '12px',
                        color: 'white',
                        maxWidth: '200px',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                        opacity: isSpeaking ? 1 : 0.7,
                        transition: 'opacity 0.3s ease'
                    }, children: message }))] })) }));
};
export default HolographicAIFace;
