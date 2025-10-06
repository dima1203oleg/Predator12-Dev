import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
export const QuantumParticleStream = () => {
    const mountRef = useRef(null);
    useEffect(() => {
        if (!mountRef.current)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        // Create flowing particle streams
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
            velocities[i] = (Math.random() - 0.5) * 0.02;
            velocities[i + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0x00ffc6,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        camera.position.z = 5;
        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
                // Reset particles that go too far
                if (Math.abs(positions[i]) > 10)
                    positions[i] = (Math.random() - 0.5) * 20;
                if (Math.abs(positions[i + 1]) > 10)
                    positions[i + 1] = (Math.random() - 0.5) * 20;
                if (Math.abs(positions[i + 2]) > 10)
                    positions[i + 2] = (Math.random() - 0.5) * 20;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.y += 0.001;
            renderer.render(scene, camera);
        };
        animate();
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);
    return (_jsx("div", { ref: mountRef, style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none'
        } }));
};
