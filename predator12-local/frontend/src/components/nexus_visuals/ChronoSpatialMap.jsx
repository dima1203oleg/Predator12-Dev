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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const THREE = __importStar(require("three"));
const nexusAPI_1 = require("../../services/nexusAPI");
const ChronoSpatialMap = () => {
    const mountRef = (0, react_1.useRef)(null);
    const [geoEvents, setGeoEvents] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Fetch initial data
        const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield nexusAPI_1.nexusAPI.getChronoSpatialData();
                setGeoEvents(data.events);
                setLoading(false);
            }
            catch (error) {
                console.error('Failed to fetch chrono spatial data:', error);
                setLoading(false);
            }
        });
        fetchData();
        // Set up periodic updates
        const interval = setInterval(fetchData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);
    (0, react_1.useEffect)(() => {
        if (!mountRef.current || loading)
            return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        // Earth with cyberpunk styling
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: 0x1a1d2e,
            transparent: true,
            opacity: 0.8,
            wireframe: true
        });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);
        // Add grid lines for cyberpunk effect
        const gridGeometry = new THREE.SphereGeometry(5.1, 32, 32);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffc6,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        scene.add(grid);
        // Events
        geoEvents.forEach((event, index) => {
            const { lat, lon, intensity, type } = event;
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = 5.2 * Math.sin(phi) * Math.cos(theta);
            const y = 5.2 * Math.cos(phi);
            const z = 5.2 * Math.sin(phi) * Math.sin(theta);
            const markerGeometry = new THREE.SphereGeometry(0.08 + (intensity * 0.12), 16, 16);
            const markerColor = type === 'critical' ? 0xff0033 :
                type === 'security' ? 0xa020f0 :
                    type === 'anomaly' ? 0xffb800 : 0x00ffc6;
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: markerColor,
                transparent: true,
                opacity: 0.9
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(x, y, z);
            scene.add(marker);
            // Pulsing rings around markers
            const pulseGeometry = new THREE.RingGeometry(0.15, 0.25, 16);
            const pulseMaterial = new THREE.MeshBasicMaterial({
                color: markerColor,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
            pulse.position.set(x, y, z);
            pulse.lookAt(camera.position);
            scene.add(pulse);
            // Animate pulse
            pulse.userData = { originalScale: 1, time: index * 0.5 };
        });
        // Enhanced lighting for cyberpunk effect
        scene.add(new THREE.AmbientLight(0x404040, 0.3));
        const directionalLight = new THREE.DirectionalLight(0x00ffc6, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);
        // Add point lights for glow effect
        const pointLight1 = new THREE.PointLight(0x0a75ff, 0.5, 20);
        pointLight1.position.set(8, 0, 0);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0xa020f0, 0.5, 20);
        pointLight2.position.set(-8, 0, 0);
        scene.add(pointLight2);
        // Camera position
        camera.position.set(0, 0, 12);
        const animate = () => {
            requestAnimationFrame(animate);
            // Rotate meshes
            scene.children.forEach((obj) => {
                if (obj.isMesh) {
                    // leave as is
                }
            });
            // Animate pulses safely
            scene.traverse((child) => {
                if (child.userData && child.userData.time !== undefined) {
                    child.userData.time += 0.02;
                    const scale = 1 + 0.3 * Math.sin(child.userData.time);
                    child.scale.setScalar(scale);
                    const mat = child.material;
                    if (mat && 'opacity' in mat) {
                        mat.opacity = 0.4 + 0.2 * Math.sin(child.userData.time);
                    }
                }
            });
            renderer.render(scene, camera);
        };
        animate();
        const handleResize = () => {
            if (mountRef.current) {
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
    }, [geoEvents, loading]);
    if (loading) {
        return (<div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00FFC6',
                fontFamily: 'Orbitron'
            }}>
        <div className="loading-spinner" style={{ marginRight: '16px' }}></div>
        Initializing Chrono-Spatial Matrix...
      </div>);
    }
    return <div ref={mountRef} style={{ width: '100%', height: '100%' }}/>;
};
exports.default = ChronoSpatialMap;
