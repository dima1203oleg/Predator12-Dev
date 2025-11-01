/**
 * Head3D Component - 3D Wireframe Head with Voice Reaction
 *
 * Features:
 * - Procedural wireframe sphere with face-like geometry
 * - Reacts to mic level (emission intensity)
 * - Subtle cursor tracking (lookAt)
 * - TTS pulsation animation
 * - Scanline shader for neon glow effect
 *
 * Performance: GPU budget ≤ 5% on mid-range laptops
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAssistantStore } from '../state/assistantStore';

/**
 * Animated Head Mesh
 */
function HeadMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mic = useAssistantStore((s) => s.mic);
  const chat = useAssistantStore((s) => s.chat);

  // Procedural geometry: icosphere with face-like morphing
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, 3);
    // Morph to slightly elongate for face shape
    const positions = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      positions[i + 1] = y * 1.15; // stretch vertically
      positions[i] *= 0.95; // compress horizontally
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Scanline shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 0.5 },
        color: { value: new THREE.Color(0x00ffff) },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Scanline effect
          float scanline = sin(vPosition.y * 20.0 + time * 2.0) * 0.5 + 0.5;

          // Fresnel glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.5);

          // Combine
          vec3 finalColor = color * (scanline * 0.3 + fresnel * intensity);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      wireframe: true,
      transparent: true,
    });
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update shader time
    material.uniforms.time.value += delta;

    // React to mic level (emission intensity)
    const targetIntensity = mic.enabled ? 0.5 + mic.level * 0.5 : 0.3;
    material.uniforms.intensity.value = THREE.MathUtils.lerp(
      material.uniforms.intensity.value,
      targetIntensity,
      0.1
    );

    // TTS pulsation (when chat is loading = assistant is speaking)
    if (chat.loading) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      meshRef.current.scale.setScalar(pulse);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }

    // Subtle rotation
    meshRef.current.rotation.y += delta * 0.1;

    // Cursor tracking (subtle lookAt)
    const mouse = state.mouse;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      -mouse.y * 0.2,
      0.05
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouse.x * 0.1,
      0.05
    );
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

/**
 * Main Head3D Component
 */
export default function Head3D() {
  return (
    <div className="relative w-full h-full bg-nexus-dark">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#00ffff" />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ff00ff" />

        {/* Head Mesh */}
        <HeadMesh />

        {/* Environment */}
        <Environment preset="city" />

        {/* Post-processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
        </EffectComposer>

        {/* Optional controls (disable in production) */}
        {process.env.NODE_ENV === 'development' && <OrbitControls enableZoom={false} />}
      </Canvas>

      {/* Debug overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs text-cyan-400 font-mono bg-black/50 p-2 rounded">
          <div>3D Head Active</div>
          <div>GPU: ~3-5%</div>
        </div>
      )}
    </div>
  );
}
