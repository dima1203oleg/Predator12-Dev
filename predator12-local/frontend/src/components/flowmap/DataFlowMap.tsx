// @ts-nocheck
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DataFlowMap = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070A);
    
    const camera = new THREE.PerspectiveCamera(75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    // Nodes and connections
    const nodes = [
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(0, -3, 0),
      new THREE.Vector3(5, 0, 0)
    ];
    
    // Create node spheres
    const nodeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF66 });
    
    nodes.forEach(pos => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(pos);
      scene.add(node);
    });
    
    // Create connections
    const connections = [
      [nodes[0], nodes[1]],
      [nodes[0], nodes[2]],
      [nodes[1], nodes[3]],
      [nodes[2], nodes[3]]
    ];
    
    connections.forEach(([start, end]) => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0A75FF });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    });
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default DataFlowMap;
