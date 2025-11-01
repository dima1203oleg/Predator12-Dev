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
exports.AceAvatar = void 0;
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const THREE = __importStar(require("three"));
/**
 * Анімований 3D аватар CYBER-ACE
 */
const AnimatedAvatar = ({ isActive, isListening, mood }) => {
    const meshRef = (0, react_1.useRef)(null);
    const particlesRef = (0, react_1.useRef)(null);
    // Кольори в залежності від настрою
    const colors = (0, react_1.useMemo)(() => {
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
    (0, fiber_1.useFrame)((state) => {
        if (meshRef.current) {
            // Плавне обертання
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            // Пульсація при прослуховуванні
            if (isListening) {
                const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
                meshRef.current.scale.setScalar(scale);
            }
            else {
                meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
        // Анімація частинок
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.001;
        }
    });
    // Генерація частинок
    const particles = (0, react_1.useMemo)(() => {
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
    return (<group>
      {/* Головна сфера - "голова" CYBER-ACE */}
      <drei_1.Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <drei_1.MeshDistortMaterial color={colors} attach="material" distort={isActive ? 0.4 : 0.2} speed={isListening ? 3 : 1} roughness={0.2} metalness={0.8} emissive={colors} emissiveIntensity={isActive ? 0.5 : 0.2}/>
      </drei_1.Sphere>

      {/* Внутрішнє світіння */}
      <drei_1.Sphere args={[1.3, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color={colors} transparent opacity={0.2} side={THREE.BackSide}/>
      </drei_1.Sphere>

      {/* Зовнішнє кільце */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]}/>
        <meshStandardMaterial color={colors} emissive={colors} emissiveIntensity={0.5} metalness={0.8} roughness={0.2}/>
      </mesh>

      {/* Частинки навколо */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3}/>
        </bufferGeometry>
        <pointsMaterial size={0.02} color={colors} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending}/>
      </points>

      {/* Індикатор стану */}
      {isListening && (<drei_1.Html center>
          <div className="ace-listening-indicator">
            <div className="pulse-ring"/>
            <div className="pulse-ring" style={{ animationDelay: '0.3s' }}/>
            <div className="pulse-ring" style={{ animationDelay: '0.6s' }}/>
          </div>
        </drei_1.Html>)}
    </group>);
};
/**
 * Компонент AceAvatar - 3D аватар CYBER-ACE
 */
const AceAvatar = ({ isActive, isListening, currentMood }) => {
    return (<div className="ace-avatar-container">
      <fiber_1.Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        {/* Освітлення */}
        <ambientLight intensity={0.5}/>
        <pointLight position={[10, 10, 10]} intensity={1}/>
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff"/>

        {/* 3D Аватар */}
        <AnimatedAvatar isActive={isActive} isListening={isListening} mood={currentMood}/>

        {/* Контролери (опціонально) */}
        <drei_1.OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} autoRotate={!isListening} autoRotateSpeed={0.5}/>
      </fiber_1.Canvas>

      {/* Статус текст */}
      <div className="ace-status-text">
        {isListening ? 'Слухаю...' : isActive ? 'Готовий до роботи' : 'Offline'}
      </div>
    </div>);
};
exports.AceAvatar = AceAvatar;
