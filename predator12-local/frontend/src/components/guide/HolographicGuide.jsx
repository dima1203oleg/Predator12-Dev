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
const react_1 = __importStar(require("react"));
const fiber_1 = require("@react-three/fiber");
const drei_1 = require("@react-three/drei");
const framer_motion_1 = require("framer-motion");
const react_2 = require("@use-gesture/react");
const react_hotkeys_hook_1 = require("react-hotkeys-hook");
const THREE = __importStar(require("three"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
// 3D обличчя з зеленою сіткою
const CyberFace = ({ state, mousePosition, isListening }) => {
    const meshRef = (0, react_1.useRef)(null);
    const groupRef = (0, react_1.useRef)(null);
    const wireframeRef = (0, react_1.useRef)(null);
    // Анімація обертання обличчя за курсором
    (0, fiber_1.useFrame)((frameState, delta) => {
        if (groupRef.current) {
            // Плавне обертання за мишею
            const targetRotationY = (mousePosition.x - 0.5) * 0.3;
            const targetRotationX = (mousePosition.y - 0.5) * 0.2;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, delta * 2);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, delta * 2);
        }
        // Пульсація в залежності від стану
        if (meshRef.current) {
            const pulse = Math.sin(frameState.clock.elapsedTime * 2) * 0.1 + 1;
            const scale = state === 'thinking' ? pulse * 1.1 :
                state === 'alert' ? pulse * 1.2 : pulse;
            meshRef.current.scale.setScalar(scale);
        }
        // Анімація wireframe
        if (wireframeRef.current) {
            const material = wireframeRef.current.material;
            if (state === 'listening') {
                material.opacity = 0.8 + Math.sin(frameState.clock.elapsedTime * 5) * 0.2;
            }
            else if (state === 'alert') {
                material.color.setHex(0xff0066);
            }
            else {
                material.color.setHex(0x00ff66);
                material.opacity = 0.6;
            }
        }
    });
    // Геометрія обличчя
    const faceGeometry = new THREE.SphereGeometry(1, 32, 32);
    const wireframeGeometry = new THREE.WireframeGeometry(faceGeometry);
    return (<group ref={groupRef} position={[0, 0, 0]}>
      {/* Основне обличчя */}
      <mesh ref={meshRef} geometry={faceGeometry}>
        <drei_1.MeshWobbleMaterial color={state === 'alert' ? '#ff0066' : '#0099ff'} factor={state === 'thinking' ? 0.6 : 0.1} speed={state === 'speaking' ? 2 : 0.5} transparent opacity={0.3}/>
      </mesh>

      {/* Зелена сітка поверх */}
      <lineSegments ref={wireframeRef} geometry={wireframeGeometry}>
        <lineBasicMaterial color="#00ff66" transparent opacity={0.6} linewidth={2}/>
      </lineSegments>

      {/* Частинки навколо обличчя при активності */}
      {(state === 'thinking' || state === 'speaking') && (<drei_1.Sparkles count={50} scale={[4, 4, 4]} size={2} speed={0.4} color="#00ff66"/>)}

      {/* Текст стану */}
      <drei_1.Html position={[0, -2, 0]} center>
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{
            textAlign: 'center',
            color: '#00ff66',
            fontFamily: 'monospace',
            fontSize: '14px',
            textShadow: '0 0 10px #00ff66'
        }}>
          {state === 'idle' && 'Готовий допомогти'}
          {state === 'listening' && 'Слухаю...'}
          {state === 'thinking' && 'Обробляю запит...'}
          {state === 'speaking' && 'Відповідаю...'}
          {state === 'alert' && 'Увага! Потрібна дія'}
        </framer_motion_1.motion.div>
      </drei_1.Html>
    </group>);
};
// Головний компонент гіда
const HolographicGuide = ({ onVoiceCommand, onTextInput, currentTask, systemStatus = 'normal', personalizedHints = [] }) => {
    const [guideState, setGuideState] = (0, react_1.useState)('idle');
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [mousePosition, setMousePosition] = (0, react_1.useState)({ x: 0.5, y: 0.5 });
    const [showHints, setShowHints] = (0, react_1.useState)(false);
    const [currentHint, setCurrentHint] = (0, react_1.useState)('');
    // Web Speech API
    const [recognition, setRecognition] = (0, react_1.useState)(null);
    const [synthesis] = (0, react_1.useState)(() => window.speechSynthesis);
    // Ініціалізація розпізнавання мови
    (0, react_1.useEffect)(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'uk-UA';
            recognitionInstance.onstart = () => {
                setGuideState('listening');
                setIsListening(true);
            };
            recognitionInstance.onresult = (event) => {
                const command = event.results[0][0].transcript;
                setGuideState('thinking');
                onVoiceCommand === null || onVoiceCommand === void 0 ? void 0 : onVoiceCommand(command);
                // Симулація обробки
                setTimeout(() => {
                    setGuideState('speaking');
                    speak(`Виконую команду: ${command}`);
                }, 1000);
            };
            recognitionInstance.onerror = () => {
                setGuideState('idle');
                setIsListening(false);
            };
            recognitionInstance.onend = () => {
                setIsListening(false);
                if (guideState !== 'thinking') {
                    setGuideState('idle');
                }
            };
            setRecognition(recognitionInstance);
        }
    }, [onVoiceCommand, guideState]);
    // Функція синтезу мови
    const speak = (0, react_1.useCallback)((text) => {
        if (synthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uk-UA';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.onstart = () => setGuideState('speaking');
            utterance.onend = () => setGuideState('idle');
            synthesis.speak(utterance);
        }
    }, [synthesis]);
    // Відстеження миші для обертання обличчя
    const handleMouseMove = (0, react_1.useCallback)((event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height
        });
    }, []);
    // Жести
    const bind = (0, react_2.useGesture)({
        onPinch: ({ offset: [scale] }) => {
            // Реагувати на pinch для зуму/взаємодії
            if (scale > 1.2) {
                setShowHints(true);
            }
        },
        onDoubleClick: () => {
            startListening();
        }
    });
    // Гарячі клавіші
    (0, react_hotkeys_hook_1.useHotkeys)('space', () => startListening(), { preventDefault: true });
    (0, react_hotkeys_hook_1.useHotkeys)('ctrl+h', () => setShowHints(!showHints), { preventDefault: true });
    // Функція запуску слухання
    const startListening = (0, react_1.useCallback)(() => {
        if (recognition && !isListening) {
            recognition.start();
        }
    }, [recognition, isListening]);
    // Контекстні підказки
    (0, react_1.useEffect)(() => {
        if (personalizedHints.length > 0 && guideState === 'idle') {
            const randomHint = personalizedHints[Math.floor(Math.random() * personalizedHints.length)];
            setCurrentHint(randomHint);
            const timer = setTimeout(() => {
                setShowHints(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [personalizedHints, guideState]);
    return (<material_1.Box {...bind()} onMouseMove={handleMouseMove} sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
            background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: isListening ? 'not-allowed' : 'pointer',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300ff66" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                animation: 'starfield 20s linear infinite',
                pointerEvents: 'none'
            }
        }}>
      {/* 3D Canvas */}
      <fiber_1.Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.3}/>
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ff66"/>
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0099ff"/>

        <CyberFace state={guideState} mousePosition={mousePosition} isListening={isListening}/>

        <drei_1.OrbitControls enableZoom={false} enablePan={false} autoRotate={guideState === 'idle'} autoRotateSpeed={0.5}/>
      </fiber_1.Canvas>

      {/* Контроли */}
      <material_1.Box sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2
        }}>
        <material_1.IconButton onClick={startListening} disabled={isListening} sx={{
            background: 'rgba(0, 255, 102, 0.2)',
            border: '1px solid #00ff66',
            color: '#00ff66',
            '&:hover': {
                background: 'rgba(0, 255, 102, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 102, 0.5)'
            },
            '&:disabled': {
                color: '#666',
                border: '1px solid #666'
            }
        }}>
          {isListening ? <icons_material_1.MicOff /> : <icons_material_1.Mic />}
        </material_1.IconButton>

        <material_1.IconButton onClick={() => speak('Привіт! Я ваш кібер-помічник. Як можу допомогти?')} sx={{
            background: 'rgba(0, 153, 255, 0.2)',
            border: '1px solid #0099ff',
            color: '#0099ff',
            '&:hover': {
                background: 'rgba(0, 153, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 153, 255, 0.5)'
            }
        }}>
          <icons_material_1.VolumeUp />
        </material_1.IconButton>
      </material_1.Box>

      {/* Підказки */}
      <framer_motion_1.AnimatePresence>
        {showHints && currentHint && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} style={{
                position: 'absolute',
                top: 16,
                right: 16,
                maxWidth: '300px'
            }}>
            <material_1.Card sx={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid #00ff66',
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }}>
              <material_1.CardContent>
                <material_1.Typography variant="body2" sx={{
                color: '#00ff66',
                fontFamily: 'monospace',
                lineHeight: 1.4
            }}>
                  💡 {currentHint}
                </material_1.Typography>
              </material_1.CardContent>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Системний статус */}
      {systemStatus !== 'normal' && (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                position: 'absolute',
                top: 16,
                left: 16
            }}>
          <material_1.Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: systemStatus === 'warning' ? '#ffaa00' : '#ff0066',
                boxShadow: `0 0 20px ${systemStatus === 'warning' ? '#ffaa00' : '#ff0066'}`,
                animation: 'pulse 1s infinite'
            }}/>
        </framer_motion_1.motion.div>)}

      {/* CSS анімації */}
      <style>
        {`
        @keyframes starfield {
          0% { transform: translateY(0); }
          100% { transform: translateY(-40px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        `}
      </style>
    </material_1.Box>);
};
exports.default = HolographicGuide;
