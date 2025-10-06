// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Paper, IconButton, Typography, TextField, Fab, Tooltip } from '@mui/material';
import { 
  Mic, 
  MicOff, 
  Send, 
  VolumeUp, 
  VolumeOff, 
  SmartToy,
  Close,
  Minimize,
  Settings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { nexusColors } from '../../theme/nexusTheme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited';
}

interface CyberFaceAIProps {
  onCommand?: (command: string) => void;
  systemStatus?: {
    health: number;
    activeModules: string[];
    alerts: number;
  };
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  minimized?: boolean;
}

const CyberFaceAI: React.FC<CyberFaceAIProps> = ({
  onCommand,
  systemStatus = { health: 95, activeModules: ['dashboard', 'mas'], alerts: 2 },
  position = 'bottom-right',
  minimized: initialMinimized = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(initialMinimized);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Вітаю! Я NEXUS AI - ваш кіберпровідник. Готовий допомогти з аналітикою та управлінням системою.',
      sender: 'ai',
      timestamp: new Date(),
      emotion: 'happy'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited'>('neutral');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const faceRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Ініціалізація 3D кібер-лиця
  const initializeFace = useCallback(() => {
    if (!canvasRef.current) return;

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
      color: nexusColors.quantum,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    faceGroup.add(head);

    // Очі (світлові точки)
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: nexusColors.emerald,
      emissive: nexusColors.emerald,
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
      color: nexusColors.sapphire,
      transparent: true,
      opacity: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 0.8);
    faceGroup.add(mouth);

    // Енергетичні лінії навколо голови
    const energyGeometry = new THREE.TorusGeometry(1.5, 0.02, 8, 100);
    const energyMaterial = new THREE.MeshStandardMaterial({
      color: nexusColors.quantum,
      emissive: nexusColors.quantum,
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
      color: nexusColors.emerald,
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
  const initializeSpeech = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'uk-UA';
      
      recognition.onresult = (event: any) => {
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
  const handleUserMessage = useCallback((text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Генерація відповіді AI
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage: Message = {
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
  const generateAIResponse = (userText: string): { text: string; emotion: Message['emotion']; command?: string } => {
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

  useEffect(() => {
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
    const base = { position: 'fixed' as const, zIndex: 1300 };
    switch (position) {
      case 'bottom-right':
        return { ...base, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...base, bottom: 20, left: 20 };
      case 'top-right':
        return { ...base, top: 20, right: 20 };
      case 'top-left':
        return { ...base, top: 20, left: 20 };
      default:
        return { ...base, bottom: 20, right: 20 };
    }
  };

  const positionStyles = getPositionStyles();
  
  return (
    <div style={positionStyles}>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Tooltip title="NEXUS AI Асистент">
              <Fab
                onClick={() => setIsOpen(true)}
                sx={{
                  background: `linear-gradient(135deg, ${nexusColors.quantum}, ${nexusColors.emerald})`,
                  color: 'white',
                  width: 70,
                  height: 70,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                    transform: 'scale(1.1)',
                  },
                  boxShadow: `0 0 20px ${nexusColors.quantum}40`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: `0 0 20px ${nexusColors.quantum}40` },
                    '50%': { boxShadow: `0 0 30px ${nexusColors.quantum}80` },
                    '100%': { boxShadow: `0 0 20px ${nexusColors.quantum}40` },
                  }
                }}
              >
                <SmartToy sx={{ fontSize: 32 }} />
              </Fab>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Paper
              elevation={24}
              sx={{
                width: minimized ? 300 : 400,
                height: minimized ? 100 : 600,
                background: `linear-gradient(135deg, ${nexusColors.obsidian}f0, ${nexusColors.void}e0)`,
                border: `2px solid ${nexusColors.quantum}60`,
                borderRadius: 3,
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: `0 0 40px ${nexusColors.quantum}30`,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: `linear-gradient(90deg, ${nexusColors.quantum}20, ${nexusColors.emerald}20)`,
                  borderBottom: `1px solid ${nexusColors.quantum}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <canvas
                    ref={canvasRef}
                    width={50}
                    height={50}
                    style={{
                      borderRadius: '50%',
                      border: `2px solid ${nexusColors.quantum}`,
                      background: 'transparent'
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: nexusColors.frost,
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '1rem'
                      }}
                    >
                      NEXUS AI
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: nexusColors.quantum,
                        fontFamily: 'Fira Code, monospace'
                      }}
                    >
                      {isSpeaking ? 'Говорить...' : isListening ? 'Слухає...' : 'Онлайн'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setMinimized(!minimized)}
                    sx={{ color: nexusColors.frost }}
                  >
                    <Minimize />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setIsOpen(false)}
                    sx={{ color: nexusColors.frost }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {!minimized && (
                <>
                  {/* Messages */}
                  <Box
                    sx={{
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
                        background: nexusColors.obsidian,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: nexusColors.quantum,
                        borderRadius: 3,
                      },
                    }}
                  >
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              maxWidth: '80%',
                              background: message.sender === 'user'
                                ? `linear-gradient(135deg, ${nexusColors.sapphire}40, ${nexusColors.quantum}40)`
                                : `linear-gradient(135deg, ${nexusColors.emerald}20, ${nexusColors.quantum}20)`,
                              border: `1px solid ${message.sender === 'user' ? nexusColors.sapphire : nexusColors.emerald}60`,
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                color: nexusColors.frost,
                                fontSize: '0.9rem',
                                fontFamily: 'Inter, sans-serif'
                              }}
                            >
                              {message.text}
                            </Typography>
                          </Paper>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>

                  {/* Input */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: `1px solid ${nexusColors.quantum}40`,
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center'
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Запитайте про систему..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: nexusColors.frost,
                          backgroundColor: `${nexusColors.obsidian}60`,
                          '& fieldset': {
                            borderColor: `${nexusColors.quantum}40`,
                          },
                          '&:hover fieldset': {
                            borderColor: nexusColors.quantum,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: nexusColors.emerald,
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: `${nexusColors.frost}60`,
                        }
                      }}
                    />
                    
                    <IconButton
                      onClick={startListening}
                      disabled={isListening}
                      sx={{
                        color: isListening ? nexusColors.emerald : nexusColors.frost,
                        backgroundColor: isListening ? `${nexusColors.emerald}20` : 'transparent',
                        '&:hover': {
                          backgroundColor: `${nexusColors.quantum}20`,
                        }
                      }}
                    >
                      {isListening ? <Mic /> : <MicOff />}
                    </IconButton>
                    
                    <IconButton
                      onClick={sendMessage}
                      disabled={!inputText.trim()}
                      sx={{
                        color: nexusColors.sapphire,
                        '&:hover': {
                          backgroundColor: `${nexusColors.sapphire}20`,
                        }
                      }}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyberFaceAI;
