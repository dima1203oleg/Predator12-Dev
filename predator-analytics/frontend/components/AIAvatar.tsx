'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AIAvatarProps {
  isListening: boolean;
  isProcessing: boolean;
}

function AvatarHead({ isListening, isProcessing }: AIAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Gentle rotation
    meshRef.current.rotation.y += 0.005;

    // Pulse effect when listening
    if (isListening && materialRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
      materialRef.current.distort = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    } else if (isProcessing && materialRef.current) {
      materialRef.current.distort = 0.6;
    } else if (materialRef.current) {
      materialRef.current.distort = 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
      <MeshDistortMaterial
        ref={materialRef}
        color={isListening ? '#a855f7' : isProcessing ? '#3b82f6' : '#8b5cf6'}
        attach="material"
        distort={0.2}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

function Eyes({ isListening }: { isListening: boolean }) {
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (leftEyeRef.current && rightEyeRef.current) {
      // Blinking animation
      const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.95 ? 0.1 : 1;
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;
    }
  });

  return (
    <group>
      {/* Left Eye */}
      <Sphere ref={leftEyeRef} args={[0.15, 32, 32]} position={[-0.4, 0.3, 1.8]}>
        <meshStandardMaterial color={isListening ? '#60a5fa' : '#ffffff'} emissive={isListening ? '#3b82f6' : '#000000'} emissiveIntensity={0.5} />
      </Sphere>

      {/* Right Eye */}
      <Sphere ref={rightEyeRef} args={[0.15, 32, 32]} position={[0.4, 0.3, 1.8]}>
        <meshStandardMaterial color={isListening ? '#60a5fa' : '#ffffff'} emissive={isListening ? '#3b82f6' : '#000000'} emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

function ParticleField({ isActive }: { isActive: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const geometry = particlesRef.current.geometry;
    const positions = new Float32Array(100 * 3);

    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    if (isActive) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        color={isActive ? '#a855f7' : '#6366f1'}
        transparent
        opacity={isActive ? 0.6 : 0.3}
        sizeAttenuation
      />
    </points>
  );
}

export function AIAvatar({ isListening, isProcessing }: AIAvatarProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Avatar Components */}
      <AvatarHead isListening={isListening} isProcessing={isProcessing} />
      <Eyes isListening={isListening} />
      <ParticleField isActive={isListening || isProcessing} />

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
