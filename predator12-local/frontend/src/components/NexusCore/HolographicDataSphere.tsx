// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { nexusAPI, SystemStatus } from '../../services/nexusAPI';

export const HolographicDataSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sphereRef = useRef<THREE.Mesh>();
  const [systemData, setSystemData] = useState<SystemStatus | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);

  useEffect(() => {
    // Fetch initial system data
    const fetchSystemData = async () => {
      try {
        const data = await nexusAPI.getSystemStatus();
        setSystemData(data);
      } catch (error) {
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
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create holographic sphere with dynamic color and enhanced materials
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    let sphereColor = 0x00ffc6; // Default emerald

    if (systemData) {
      sphereColor = systemData.system_health === 'optimal' ? 0x00ffc6 :
                   systemData.system_health === 'warning' ? 0xffb800 : 0xff0033;
    }

    // Shader material for iridescent effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(sphereColor) },
        iridescence: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform float iridescence;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 glow = baseColor * intensity;
          
          // Iridescent shimmer
          float shimmer = sin(vPosition.x * 10.0 + time) * 
                         cos(vPosition.y * 10.0 + time) * 0.3;
          vec3 iridescent = vec3(
            0.5 + 0.5 * sin(time + vPosition.x * 5.0),
            0.5 + 0.5 * cos(time + vPosition.y * 5.0),
            0.5 + 0.5 * sin(time + vPosition.z * 5.0)
          );
          
          vec3 finalColor = mix(glow, iridescent, iridescence * shimmer);
          gl_FragColor = vec4(finalColor, 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Add inner core sphere with bioluminescent effect
    const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color(sphereColor) },
        pulse: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 glowColor;
        uniform float pulse;
        varying vec3 vNormal;
        
        void main() {
          float intensity = pow(0.4 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          float pulseEffect = 0.5 + 0.5 * sin(time * 2.0);
          vec3 glow = glowColor * intensity * (pulse + pulseEffect);
          gl_FragColor = vec4(glow, intensity * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Add data nodes around sphere (representing agents)
    const nodeCount = systemData?.active_agents || 8;
    const nodes: THREE.Mesh[] = [];

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
    const connections: THREE.Line[] = [];
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

    // Animation loop with enhanced effects
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (sphereRef.current) {
        sphereRef.current.rotation.y += 0.005;
        sphereRef.current.rotation.x += 0.003;

        // Pulse based on system activity with breathing effect
        const pulse = 1 + 0.1 * Math.sin(time * 2);
        const breathe = 1 + 0.05 * Math.sin(time * 0.5);
        sphereRef.current.scale.setScalar(pulse * breathe);
        
        // Update shader uniform
        const mat = sphereRef.current.material as THREE.ShaderMaterial;
        if (mat.uniforms) {
          mat.uniforms.time.value = time;
        }
      }

      // Animate core with bio-luminescent pulse
      core.rotation.y -= 0.008;
      core.rotation.x += 0.002;
      const coreMat = core.material as THREE.ShaderMaterial;
      if (coreMat.uniforms) {
        coreMat.uniforms.time.value = time;
        coreMat.uniforms.pulse.value = 0.8 + 0.4 * Math.sin(time * 3);
      }

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
          const mat: any = (node as any).material;
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
        rendererRef.current.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight
        );
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

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
      }}
    />
  );
};
