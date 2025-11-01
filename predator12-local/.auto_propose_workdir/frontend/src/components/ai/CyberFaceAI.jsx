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
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const THREE = __importStar(require("three"));
const nexusTheme_1 = require("../../theme/nexusTheme");
const CyberFaceAI = ({ onCommand, systemStatus = { health: 95, activeModules: ['dashboard', 'mas'], alerts: 2 }, position = 'bottom-right', minimized: initialMinimized = false }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [minimized, setMinimized] = (0, react_1.useState)(initialMinimized);
    const [messages, setMessages] = (0, react_1.useState)([
        {
            id: '1',
            text: 'Вітаю! Я NEXUS AI - ваш кіберпровідник. Готовий допомогти з аналітикою та управлінням системою.',
            sender: 'ai',
            timestamp: new Date(),
            emotion: 'happy'
        }
    ]);
    const [inputText, setInputText] = (0, react_1.useState)('');
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    const [currentEmotion, setCurrentEmotion] = (0, react_1.useState)('neutral');
    const canvasRef = (0, react_1.useRef)(null);
    const sceneRef = (0, react_1.useRef)();
    const rendererRef = (0, react_1.useRef)();
    const cameraRef = (0, react_1.useRef)();
    const faceRef = (0, react_1.useRef)();
    const animationIdRef = (0, react_1.useRef)();
    const recognitionRef = (0, react_1.useRef)(null);
    const synthRef = (0, react_1.useRef)(null);
    // Ініціалізація 3D кібер-лиця
    const initializeFace = (0, react_1.useCallback)(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(200, 200);
        renderer.setClearColor(0x000000, 0);
        // Створення кібер-лиця
        const faceGroup = new THREE.Group();
        // Основа голови (сфера з wireframe)
        const headGeometry = new THREE.SphereGeometry(1, 32, 32);
        const headMaterial = new THREE.MeshBasicMaterial({
            color: nexusTheme_1.nexusColors.quantum,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        faceGroup.add(head);
        // Очі (світлові точки)
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: nexusTheme_1.nexusColors.emerald,
            emissive: nexusTheme_1.nexusColors.emerald,
            emissiveIntensity: 0.5
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.2, 0.8);
        faceGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.2, 0.8);
        faceGroup.add(rightEye);
        // Рот (лінія, що змінюється залежно від емоцій)
        const mouthGeometry = new THREE.RingGeometry(0.1, 0.15, 16);
        const mouthMaterial = new THREE.MeshBasicMaterial({
            color: nexusTheme_1.nexusColors.sapphire,
            transparent: true,
            opacity: 0.8
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.3, 0.8);
        faceGroup.add(mouth);
        // Енергетичні лінії навколо голови
        const energyGeometry = new THREE.TorusGeometry(1.5, 0.02, 8, 100);
        const energyMaterial = new THREE.MeshStandardMaterial({
            color: nexusTheme_1.nexusColors.quantum,
            emissive: nexusTheme_1.nexusColors.quantum,
            emissiveIntensity: 0.3
        });
        for (let i = 0; i < 3; i++) {
            const energyRing = new THREE.Mesh(energyGeometry, energyMaterial);
            energyRing.rotation.x = (Math.PI / 3) * i;
            energyRing.rotation.y = (Math.PI / 4) * i;
            faceGroup.add(energyRing);
        }
        // Частинки навколо голови
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 6;
            positions[i + 1] = (Math.random() - 0.5) * 6;
            positions[i + 2] = (Math.random() - 0.5) * 6;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            color: nexusTheme_1.nexusColors.emerald,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        faceGroup.add(particles);
        scene.add(faceGroup);
        camera.position.z = 3;
        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        faceRef.current = faceGroup;
        // Анімаційний цикл
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            if (faceRef.current) {
                // Обертання голови
                faceRef.current.rotation.y += 0.005;
                // Пульсація залежно від емоції
                const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
                faceRef.current.scale.setScalar(scale);
                // Анімація частинок
                const particles = faceRef.current.children.find(child => child instanceof THREE.Points);
                if (particles) {
                    particles.rotation.x += 0.01;
                    particles.rotation.y += 0.01;
                }
            }
            renderer.render(scene, camera);
        };
        animate();
    }, []);
    // Ініціалізація голосового розпізнавання
    const initializeSpeech = (0, react_1.useCallback)(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'uk-UA';
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                handleUserMessage(text);
                setIsListening(false);
            };
            recognition.onerror = () => {
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        }
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
    }, []);
    // Обробка повідомлень користувача
    const handleUserMessage = (0, react_1.useCallback)((text) => {
        const userMessage = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        // Генерація відповіді AI
        setTimeout(() => {
            const aiResponse = generateAIResponse(text);
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponse.text,
                sender: 'ai',
                timestamp: new Date(),
                emotion: aiResponse.emotion
            };
            setMessages(prev => [...prev, aiMessage]);
            if (aiResponse.emotion) {
                setCurrentEmotion(aiResponse.emotion);
            }
            // Голосова відповідь
            if (synthRef.current && !isSpeaking) {
                const utterance = new SpeechSynthesisUtterance(aiResponse.text);
                utterance.lang = 'uk-UA';
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                synthRef.current.speak(utterance);
            }
            // Виконання команди
            if (onCommand && aiResponse.command) {
                onCommand(aiResponse.command);
            }
        }, 1000);
    }, [onCommand, isSpeaking]);
    // Генерація відповідей AI
    const generateAIResponse = (userText) => {
        const text = userText.toLowerCase();
        if (text.includes('статус') || text.includes('стан')) {
            return {
                text: `Система працює на ${systemStatus.health}% потужності. Активні модулі: ${systemStatus.activeModules.join(', ')}. Виявлено ${systemStatus.alerts} попереджень.`,
                emotion: systemStatus.health > 90 ? 'happy' : 'concerned',
                command: 'show_status'
            };
        }
        if (text.includes('агент') || text.includes('mas')) {
            return {
                text: 'Переключаюсь на модуль MAS Supervisor для моніторингу агентів. Зараз активні ETL та OSINT агенти.',
                emotion: 'excited',
                command: 'navigate_mas'
            };
        }
        if (text.includes('дані') || text.includes('аналітика')) {
            return {
                text: 'Відкриваю DataOps Control Hub. Тут ви можете завантажити нові датасети та керувати ETL процесами.',
                emotion: 'thinking',
                command: 'navigate_etl'
            };
        }
        if (text.includes('безпека') || text.includes('загроз')) {
            return {
                text: 'Активую модуль кібербезпеки. Система під захистом, всі метрики в нормі.',
                emotion: 'concerned',
                command: 'navigate_security'
            };
        }
        if (text.includes('привіт') || text.includes('вітаю')) {
            return {
                text: 'Привіт! Готовий допомогти з управлінням Predator Analytics. Що вас цікавить?',
                emotion: 'happy'
            };
        }
        return {
            text: 'Цікаве питання! Я аналізую дані та можу допомогти з навігацією системою, моніторингом агентів та аналітикою. Спробуйте запитати про статус системи або конкретний модуль.',
            emotion: 'thinking'
        };
    };
    // Початок голосового вводу
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };
    // Відправка текстового повідомлення
    const sendMessage = () => {
        if (inputText.trim()) {
            handleUserMessage(inputText);
            setInputText('');
        }
    };
    (0, react_1.useEffect)(() => {
        initializeFace();
        initializeSpeech();
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [initializeFace, initializeSpeech]);
    // Позиціонування
    const getPositionStyles = () => {
        const base = { position: 'fixed', zIndex: 1300 };
        switch (position) {
            case 'bottom-right':
                return Object.assign(Object.assign({}, base), { bottom: 20, right: 20 });
            case 'bottom-left':
                return Object.assign(Object.assign({}, base), { bottom: 20, left: 20 });
            case 'top-right':
                return Object.assign(Object.assign({}, base), { top: 20, right: 20 });
            case 'top-left':
                return Object.assign(Object.assign({}, base), { top: 20, left: 20 });
            default:
                return Object.assign(Object.assign({}, base), { bottom: 20, right: 20 });
        }
    };
    const positionStyles = getPositionStyles();
    return (<div style={positionStyles}>
      {/* Floating Action Button */}
      <framer_motion_1.AnimatePresence>
        {!isOpen && (<framer_motion_1.motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <material_1.Tooltip title="NEXUS AI Асистент">
              <material_1.Fab onClick={() => setIsOpen(true)} sx={{
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.emerald})`,
                color: 'white',
                width: 70,
                height: 70,
                '&:hover': {
                    background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`,
                    transform: 'scale(1.1)',
                },
                boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.quantum}40`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                    '0%': { boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.quantum}40` },
                    '50%': { boxShadow: `0 0 30px ${nexusTheme_1.nexusColors.quantum}80` },
                    '100%': { boxShadow: `0 0 20px ${nexusTheme_1.nexusColors.quantum}40` },
                }
            }}>
                <icons_material_1.SmartToy sx={{ fontSize: 32 }}/>
              </material_1.Fab>
            </material_1.Tooltip>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* AI Chat Interface */}
      <framer_motion_1.AnimatePresence>
        {isOpen && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
            <material_1.Paper elevation={24} sx={{
                width: minimized ? 300 : 400,
                height: minimized ? 100 : 600,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}f0, ${nexusTheme_1.nexusColors.void}e0)`,
                border: `2px solid ${nexusTheme_1.nexusColors.quantum}60`,
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: `0 0 40px ${nexusTheme_1.nexusColors.quantum}30`,
            }}>
              {/* Header */}
              <material_1.Box sx={{
                p: 2,
                background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.quantum}20, ${nexusTheme_1.nexusColors.emerald}20)`,
                borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <canvas ref={canvasRef} width={50} height={50} style={{
                borderRadius: '50%',
                border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
                background: 'transparent'
            }}/>
                  <material_1.Box>
                    <material_1.Typography variant="h6" sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontFamily: 'Orbitron, monospace',
                fontSize: '1rem'
            }}>
                      NEXUS AI
                    </material_1.Typography>
                    <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.quantum,
                fontFamily: 'Fira Code, monospace'
            }}>
                      {isSpeaking ? 'Говорить...' : isListening ? 'Слухає...' : 'Онлайн'}
                    </material_1.Typography>
                  </material_1.Box>
                </material_1.Box>

                <material_1.Box sx={{ display: 'flex', gap: 1 }}>
                  <material_1.IconButton size="small" onClick={() => setMinimized(!minimized)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <icons_material_1.Minimize />
                  </material_1.IconButton>
                  <material_1.IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <icons_material_1.Close />
                  </material_1.IconButton>
                </material_1.Box>
              </material_1.Box>

              {!minimized && (<>
                  {/* Messages */}
                  <material_1.Box sx={{
                    flex: 1,
                    p: 2,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    '&::-webkit-scrollbar': {
                        width: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: nexusTheme_1.nexusColors.obsidian,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: nexusTheme_1.nexusColors.quantum,
                        borderRadius: 3,
                    },
                }}>
                    {messages.map((message) => (<framer_motion_1.motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <material_1.Box sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1
                    }}>
                          <material_1.Paper sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        background: message.sender === 'user'
                            ? `linear-gradient(135deg, ${nexusTheme_1.nexusColors.sapphire}40, ${nexusTheme_1.nexusColors.quantum}40)`
                            : `linear-gradient(135deg, ${nexusTheme_1.nexusColors.emerald}20, ${nexusTheme_1.nexusColors.quantum}20)`,
                        border: `1px solid ${message.sender === 'user' ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.emerald}60`,
                        borderRadius: 2,
                    }}>
                            <material_1.Typography sx={{
                        color: nexusTheme_1.nexusColors.frost,
                        fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                              {message.text}
                            </material_1.Typography>
                          </material_1.Paper>
                        </material_1.Box>
                      </framer_motion_1.motion.div>))}
                  </material_1.Box>

                  {/* Input */}
                  <material_1.Box sx={{
                    p: 2,
                    borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center'
                }}>
                    <material_1.TextField fullWidth size="small" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Запитайте про систему..." sx={{
                    '& .MuiOutlinedInput-root': {
                        color: nexusTheme_1.nexusColors.frost,
                        backgroundColor: `${nexusTheme_1.nexusColors.obsidian}60`,
                        '& fieldset': {
                            borderColor: `${nexusTheme_1.nexusColors.quantum}40`,
                        },
                        '&:hover fieldset': {
                            borderColor: nexusTheme_1.nexusColors.quantum,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: nexusTheme_1.nexusColors.emerald,
                        },
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: `${nexusTheme_1.nexusColors.frost}60`,
                    }
                }}/>

                    <material_1.IconButton onClick={startListening} disabled={isListening} sx={{
                    color: isListening ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.frost,
                    backgroundColor: isListening ? `${nexusTheme_1.nexusColors.emerald}20` : 'transparent',
                    '&:hover': {
                        backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
                    }
                }}>
                      {isListening ? <icons_material_1.Mic /> : <icons_material_1.MicOff />}
                    </material_1.IconButton>

                    <material_1.IconButton onClick={sendMessage} disabled={!inputText.trim()} sx={{
                    color: nexusTheme_1.nexusColors.sapphire,
                    '&:hover': {
                        backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`,
                    }
                }}>
                      <icons_material_1.Send />
                    </material_1.IconButton>
                  </material_1.Box>
                </>)}
            </material_1.Paper>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </div>);
};
exports.default = CyberFaceAI;
