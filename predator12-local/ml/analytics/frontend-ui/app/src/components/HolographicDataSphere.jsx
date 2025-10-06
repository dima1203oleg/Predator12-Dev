import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const HolographicDataSphere = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Holographic sphere
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00FFC6,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Data points as small spheres
    const pointGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const basePointMaterial = new THREE.MeshBasicMaterial({ color: 0x0A75FF, opacity: 0.8 });
    const pointMaterials = [];
    for (let i = 0; i < 50; i++) {
      const materialClone = basePointMaterial.clone();
      pointMaterials.push(materialClone);
      const point = new THREE.Mesh(pointGeometry, materialClone);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 2.5;
      point.position.x = radius * Math.sin(phi) * Math.cos(theta);
      point.position.y = radius * Math.cos(phi);
      point.position.z = radius * Math.sin(phi) * Math.sin(theta);
      sphere.add(point);
    }

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 7;
    controls.enableDamping = true;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.002;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth || width;
      const newHeight = mountRef.current.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId) cancelAnimationFrame(frameId);
      controls.dispose();
      geometry.dispose();
      pointGeometry.dispose();
      material.dispose();
      basePointMaterial.dispose();
      pointMaterials.forEach((mat) => mat.dispose());
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-[300px] md:h-[500px]" />;
};

export default HolographicDataSphere; 
