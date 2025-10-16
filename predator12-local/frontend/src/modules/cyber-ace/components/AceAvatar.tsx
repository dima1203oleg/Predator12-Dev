import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AceMood } from '../state/cyberAceStore';

interface AceAvatarProps {
  isActive: boolean;
  isListening: boolean;
  currentMood: AceMood;
}

/**
 * Анімований 3D аватар CYBER-ACE
 */
const AnimatedAvatar: React.FC<{
  isActive: boolean;
  isListening: boolean;
  mood: AceMood;
}> = ({ isActive, isListening, mood }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Кольори в залежності від настрою
  const colors = useMemo(() => {
    const colorMap = {
      neutral: '#00ffff',
      thinking: '#9b59b6',
      speaking: '#3498db',
      alert: '#e74c3c',
      success: '#2ecc71',
      error: '#c0392b'
    };
    return colorMap[mood] || colorMap.neutral;
  }, [mood]);

  // Анімація обертання та пульсації
  useFrame((state) => {
    if (meshRef.current) {
      // Плавне обертання
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      // Пульсація при прослуховуванні
      if (isListening) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    // Анімація частинок
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  // Генерація частинок
  const particles = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  return (
    <group>
      {/* Головна сфера - "голова" CYBER-ACE */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={colors}
          attach="material"
          distort={isActive ? 0.4 : 0.2}
          speed={isListening ? 3 : 1}
          roughness={0.2}
          metalness={0.8}
          emissive={colors}
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </Sphere>

      {/* Внутрішнє світіння */}
      <Sphere args={[1.3, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={colors}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Зовнішнє кільце */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color={colors}
          emissive={colors}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Частинки навколо */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={colors}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Індикатор стану */}
      {isListening && (
        <Html center>
          <div className="ace-listening-indicator">
            <div className="pulse-ring" />
            <div className="pulse-ring" style={{ animationDelay: '0.3s' }} />
            <div className="pulse-ring" style={{ animationDelay: '0.6s' }} />
          </div>
        </Html>
      )}
    </group>
  );
};

/**
 * Компонент AceAvatar - 3D аватар CYBER-ACE
 */
export const AceAvatar: React.FC<AceAvatarProps> = ({
  isActive,
  isListening,
  currentMood
}) => {
  return (
    <div className="ace-avatar-container">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        {/* Освітлення */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

        {/* 3D Аватар */}
        <AnimatedAvatar
          isActive={isActive}
          isListening={isListening}
          mood={currentMood}
        />

        {/* Контролери (опціонально) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate={!isListening}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Статус текст */}
      <div className="ace-status-text">
        {isListening ? 'Слухаю...' : isActive ? 'Готовий до роботи' : 'Offline'}
      </div>
    </div>
  );
};
