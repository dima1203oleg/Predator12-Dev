import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { nexusAPI } from '../../services/nexusAPI';
export const HolographicDataSphere = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef();
    const rendererRef = useRef();
    const sphereRef = useRef();
    const [systemData, setSystemData] = useState(null);
    const [realTimeData, setRealTimeData] = useState(null);
    useEffect(() => {
        // Fetch initial system data
        const fetchSystemData = async () => {
            try {
                const data = await nexusAPI.getSystemStatus();
                setSystemData(data);
            }
            catch (error) {
                console.error('Failed to fetch system data:', error);
            }
        };
        fetchSystemData();
        // Set up WebSocket for real-time updates
        const ws = nexusAPI.connect3DStream((data) => {
            setRealTimeData(data);
        });
        // Periodic refresh of system data
        const interval = setInterval(fetchSystemData, 15000);
        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, []);
    useEffect(() => {
        if (!mountRef.current)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 8;
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);
        // Create holographic sphere with dynamic color based on system health
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        let sphereColor = 0x00ffc6; // Default emerald
        if (systemData) {
            sphereColor = systemData.system_health === 'optimal' ? 0x00ffc6 :
                systemData.system_health === 'warning' ? 0xffb800 : 0xff0033;
        }
        const material = new THREE.MeshBasicMaterial({
            color: sphereColor,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphereRef.current = sphere;
        scene.add(sphere);
        // Add inner core sphere
        const coreGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: sphereColor,
            transparent: true,
            opacity: 0.3
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);
        // Add data nodes around sphere (representing agents)
        const nodeCount = systemData?.active_agents || 8;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const nodeMaterial = new THREE.MeshBasicMaterial({
                color: 0x0a75ff,
                transparent: true,
                opacity: 0.8
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            // Position nodes in orbit around main sphere
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 3.5;
            node.position.x = Math.cos(angle) * radius;
            node.position.z = Math.sin(angle) * radius;
            node.position.y = (Math.random() - 0.5) * 2;
            nodes.push(node);
            scene.add(node);
        }
        // Add connecting lines between nodes and sphere
        const connections = [];
        nodes.forEach(node => {
            const points = [node.position, new THREE.Vector3(0, 0, 0)];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00ffc6,
                transparent: true,
                opacity: 0.2
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            connections.push(line);
            scene.add(line);
        });
        // Add particles for data flow effect
        const particleCount = 1000;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffc6,
            size: 0.02,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (sphereRef.current) {
                sphereRef.current.rotation.y += 0.005;
                sphereRef.current.rotation.x += 0.003;
                // Pulse based on system activity
                const scale = 1 + 0.1 * Math.sin(Date.now() * 0.002);
                sphereRef.current.scale.setScalar(scale);
            }
            // Animate core
            core.rotation.y -= 0.008;
            core.rotation.x += 0.002;
            // Animate nodes (agent activity)
            nodes.forEach((node, index) => {
                const angle = (index / nodeCount) * Math.PI * 2 + Date.now() * 0.0005;
                const radius = 3.5 + 0.5 * Math.sin(Date.now() * 0.001 + index);
                node.position.x = Math.cos(angle) * radius;
                node.position.z = Math.sin(angle) * radius;
                // Оновлення кольору вузла за даними реального часу — з безпечними перевірками
                if (realTimeData?.nodes?.[index]) {
                    const load = realTimeData.nodes[index].load || 50;
                    const intensity = load / 100;
                    const mat = node.material;
                    if (mat && mat.color && typeof mat.color.setRGB === 'function') {
                        mat.color.setRGB(0, 1 - intensity, 1);
                    }
                    node.scale.setScalar(0.8 + intensity * 0.4);
                }
            });
            // Animate particles
            particles.rotation.y += 0.001;
            renderer.render(scene, camera);
        };
        animate();
        // Handle resize
        const handleResize = () => {
            if (mountRef.current && rendererRef.current) {
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [systemData, realTimeData]);
    return (_jsx("div", { ref: mountRef, style: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
        } }));
};
