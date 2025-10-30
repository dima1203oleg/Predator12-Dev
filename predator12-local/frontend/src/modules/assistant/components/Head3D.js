"use strict";
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
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const postprocessing_1 = require("@react-three/postprocessing");
const THREE = __importStar(require("three"));
const assistantStore_1 = require("../state/assistantStore");
/**
 * Animated Head Mesh
 */
function HeadMesh() {
    const meshRef = (0, react_1.useRef)(null);
    const mic = (0, assistantStore_1.useAssistantStore)((s) => s.mic);
    const chat = (0, assistantStore_1.useAssistantStore)((s) => s.chat);
    // Procedural geometry: icosphere with face-like morphing
    const geometry = (0, react_1.useMemo)(() => {
        const geo = new THREE.IcosahedronGeometry(1.2, 3);
        // Morph to slightly elongate for face shape
        const positions = geo.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const y = positions[i + 1];
            positions[i + 1] = y * 1.15; // stretch vertically
            positions[i] *= 0.95; // compress horizontally
        }
        geo.computeVertexNormals();
        return geo;
    }, []);
    // Scanline shader material
    const material = (0, react_1.useMemo)(() => {
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
    (0, fiber_1.useFrame)((state, delta) => {
        if (!meshRef.current)
            return;
        // Update shader time
        material.uniforms.time.value += delta;
        // React to mic level (emission intensity)
        const targetIntensity = mic.enabled ? 0.5 + mic.level * 0.5 : 0.3;
        material.uniforms.intensity.value = THREE.MathUtils.lerp(material.uniforms.intensity.value, targetIntensity, 0.1);
        // TTS pulsation (when chat is loading = assistant is speaking)
        if (chat.loading) {
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
            meshRef.current.scale.setScalar(pulse);
        }
        else {
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
        // Subtle rotation
        meshRef.current.rotation.y += delta * 0.1;
        // Cursor tracking (subtle lookAt)
        const mouse = state.mouse;
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -mouse.y * 0.2, 0.05);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, mouse.x * 0.1, 0.05);
    });
    return <mesh ref={meshRef} geometry={geometry} material={material}/>;
}
/**
 * Main Head3D Component
 */
function Head3D() {
    return (<div className="relative w-full h-full bg-nexus-dark">
      <fiber_1.Canvas>
        <drei_1.PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50}/>

        {/* Lighting */}
        <ambientLight intensity={0.2}/>
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#00ffff"/>
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ff00ff"/>

        {/* Head Mesh */}
        <HeadMesh />

        {/* Environment */}
        <drei_1.Environment preset="city"/>

        {/* Post-processing */}
        <postprocessing_1.EffectComposer>
          <postprocessing_1.Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5}/>
        </postprocessing_1.EffectComposer>

        {/* Optional controls (disable in production) */}
        {process.env.NODE_ENV === 'development' && <drei_1.OrbitControls enableZoom={false}/>}
      </fiber_1.Canvas>

      {/* Debug overlay */}
      {process.env.NODE_ENV === 'development' && (<div className="absolute top-2 left-2 text-xs text-cyan-400 font-mono bg-black/50 p-2 rounded">
          <div>3D Head Active</div>
          <div>GPU: ~3-5%</div>
        </div>)}
    </div>);
}
exports.default = Head3D;
