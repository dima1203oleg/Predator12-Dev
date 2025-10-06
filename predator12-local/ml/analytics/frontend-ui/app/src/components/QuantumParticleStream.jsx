import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const QuantumParticleStream = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Particle system
    const particles = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * 2;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 2;
      positions[i * 3 + 2] = Math.random() * 2 - 1;
      sizes[i] = Math.random() * 0.03 + 0.01;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00FFC6,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.001;
        if (positions[i * 3 + 1] < -1) positions[i * 3 + 1] = 1;
      }
      particles.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth || width;
      const newHeight = mountRef.current.clientHeight || height;
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId) cancelAnimationFrame(frameId);
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 opacity-30" />;
};

export default QuantumParticleStream; 
