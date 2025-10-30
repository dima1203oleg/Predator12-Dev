"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = require("react");
const THREE = __importStar(require("three"));
const DataFlowMap = () => {
    const mountRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!mountRef.current)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x05070A);
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
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
            if (!mountRef.current)
                return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            var _a;
            window.removeEventListener('resize', handleResize);
            (_a = mountRef.current) === null || _a === void 0 ? void 0 : _a.removeChild(renderer.domElement);
        };
    }, []);
    return <div ref={mountRef} style={{ width: '100%', height: '100%' }}/>;
};
exports.default = DataFlowMap;
