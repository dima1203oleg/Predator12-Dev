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
exports.CosmicDust = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const THREE = __importStar(require("three"));
const nexusTheme_1 = require("../../theme/nexusTheme");
const DustParticles = ({ count, colors, speed, particleSize, opacity }) => {
    const particlesRef = (0, react_1.useRef)(null);
    const particles = (0, react_1.useRef)([]);
    (0, react_1.useEffect)(() => {
        // Initialize particles
        particles.current = Array.from({ length: count }, () => ({
            position: new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02 * speed, (Math.random() - 0.5) * 0.02 * speed, (Math.random() - 0.5) * 0.02 * speed),
            life: Math.random(),
            maxLife: 1,
            size: Math.random() * particleSize + particleSize * 0.5,
            color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        }));
    }, [count, colors, speed, particleSize]);
    (0, fiber_1.useFrame)((state, delta) => {
        if (!particlesRef.current)
            return;
        const positions = particlesRef.current.geometry.attributes.position.array;
        const colorsAttr = particlesRef.current.geometry.attributes.color.array;
        const sizes = particlesRef.current.geometry.attributes.size.array;
        particles.current.forEach((particle, i) => {
            // Update position
            particle.position.add(particle.velocity);
            // Update life
            particle.life += delta * 0.2;
            if (particle.life >= particle.maxLife) {
                particle.life = 0;
                particle.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
            }
            // Update rotation
            particle.rotation += particle.rotationSpeed;
            // Boundary check
            if (Math.abs(particle.position.x) > 20)
                particle.velocity.x *= -1;
            if (Math.abs(particle.position.y) > 20)
                particle.velocity.y *= -1;
            if (Math.abs(particle.position.z) > 20)
                particle.velocity.z *= -1;
            // Apply gravitational swirl
            const distance = particle.position.length();
            const force = 0.0001 / (distance + 1);
            const angle = Math.atan2(particle.position.z, particle.position.x) + 0.01;
            particle.velocity.x += Math.cos(angle) * force;
            particle.velocity.z += Math.sin(angle) * force;
            // Update attributes
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;
            colorsAttr[i * 3] = particle.color.r;
            colorsAttr[i * 3 + 1] = particle.color.g;
            colorsAttr[i * 3 + 2] = particle.color.b;
            // Fade in/out
            const lifeFade = Math.sin(particle.life * Math.PI);
            sizes[i] = particle.size * lifeFade;
        });
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.geometry.attributes.color.needsUpdate = true;
        particlesRef.current.geometry.attributes.size.needsUpdate = true;
    });
    // Create geometry
    const positions = new Float32Array(count * 3);
    const colorsAttr = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    particles.current.forEach((particle, i) => {
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
        colorsAttr[i * 3] = particle.color.r;
        colorsAttr[i * 3 + 1] = particle.color.g;
        colorsAttr[i * 3 + 2] = particle.color.b;
        sizes[i] = particle.size;
    });
    return (<points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3}/>
        <bufferAttribute attach="attributes-color" count={count} array={colorsAttr} itemSize={3}/>
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1}/>
      </bufferGeometry>
      <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} vertexColors uniforms={{
            opacity: { value: opacity }
        }} vertexShader={`
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `} fragmentShader={`
          uniform float opacity;
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float alpha = 1.0 - (dist * 2.0);
            alpha = pow(alpha, 3.0);

            gl_FragColor = vec4(vColor, alpha * opacity);
          }
        `}/>
    </points>);
};
const CosmicDust = ({ particleCount = 2000, colors = [nexusTheme_1.nexusColors.emerald, nexusTheme_1.nexusColors.sapphire, nexusTheme_1.nexusColors.amethyst], speed = 1, size = 0.05, opacity = 0.6 }) => {
    return (<div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
        }}>
      <fiber_1.Canvas camera={{ position: [0, 0, 15], fov: 75 }} style={{ background: 'transparent' }}>
        <DustParticles count={particleCount} colors={colors} speed={speed} particleSize={size} opacity={opacity}/>
      </fiber_1.Canvas>
    </div>);
};
exports.CosmicDust = CosmicDust;
exports.default = exports.CosmicDust;
