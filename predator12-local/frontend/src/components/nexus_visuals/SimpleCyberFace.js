import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const voiceCommands = [
// Enhanced voice commands with NLP
];
// Enhanced voice commands with NLP
const extendedVoiceCommands = [
    // System monitoring
    { keywords: ['стан системи', 'системний статус', 'як система', 'діагностика'], response: 'Виконую повну діагностику системи... Всі підсистеми в нормі, критичних помилок не виявлено.', action: () => { setCurrentExpression('thinking'); performSystemScan(); } },
    { keywords: ['показники', 'метрики', 'статистика', 'моніторинг'], response: 'Відображаю поточні системні метрики в 3D візуалізації.', action: () => { setValue(5); setCurrentExpression('speaking'); } },
    // Learning and help
    { keywords: ['навчи мене', 'підкажи', 'інструкція', 'як користуватися'], response: 'Активую адаптивний навчальний режим. Давайте почнемо з основних функцій системи.', action: () => { startLearningMode(); setShowLearningDialog(true); } },
    { keywords: ['контекстна допомога', 'що це', 'поясни', 'детальніше'], response: 'Показую контекстну допомогу для поточного модуля.', action: () => { showContextHelp(); } },
    // Personalization
    { keywords: ['зміни зовнішність', 'персоналізація', 'налаштувати аватар', 'зовнішній вигляд'], response: 'Відкриваю панель персоналізації аватара.', action: () => { setShowCustomization(true); } },
    { keywords: ['емоції', 'настрій', 'почуття'], response: 'Мій емоційний рівень: ' + Math.round(emotionLevel * 100) + '%. Можу адаптувати свою поведінку.', action: () => { setCurrentExpression('surprised'); } },
    // Advanced features
    { keywords: ['VR режим', 'віртуальна реальність', '3D імерсія', 'повне занурення'], response: 'Активую режим віртуальної реальності з повним 3D зануренням.', action: () => { toggleVrMode(); } },
    { keywords: ['сповіщення', 'повідомлення', 'алерти', 'події'], response: 'Показую панель сповіщень та системних подій.', action: () => { setShowNotifications(true); } },
    { keywords: ['аналіз даних', 'інтелект', 'ШІ', 'машинне навчання'], response: 'Запускаю глибокий аналіз даних з використанням ШІ.', action: () => { performDataAnalysis(); } },
    { keywords: ['прогноз', 'передбачення', 'майбутнє', 'тренди'], response: 'Генерую прогнози на основі поточних трендів системи.', action: () => { generatePredictions(); } }
];
{
    keywords: ['статус', 'стан', 'система'],
        response;
    'Система працює в оптимальному режимі. Всі модулі функціонують нормально.',
        action;
    () => setCurrentExpression('thinking');
}
{
    keywords: ['допомога', 'поміч', 'підкажи'],
        response;
    'Я можу допомогти з навігацією, аналізом даних, або відповісти на питання про систему.',
        action;
    () => setCurrentExpression('speaking');
}
{
    keywords: ['аналіз', 'дані', 'статистика'],
        response;
    'Поточні показники: CPU - 42%, Пам\'ять - 65%, Мережа - 28%. Всі параметри в нормі.',
        action;
    () => setCurrentExpression('thinking');
}
{
    keywords: ['проблема', 'помилка', 'проблеми'],
        response;
    'Наразі критичних проблем не виявлено. Якщо виникнуть питання, повідомте мені.',
        action;
    () => setCurrentExpression('concerned');
}
;
// Initialize voice recognition
useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.continuous = false;
        recognitionRef.interimResults = false;
        recognitionRef.lang = 'uk-UA';
        recognitionRef.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            processVoiceCommand(transcript);
            setIsListening(false);
        };
        recognitionRef.onend = () => {
            setIsListening(false);
        };
        recognitionRef.onerror = () => {
            setIsListening(false);
        };
    }
}, []);
// Process voice commands
const processVoiceCommand = useCallback((transcript) => {
    for (const command of voiceCommands) {
        if (command.keywords.some(keyword => transcript.includes(keyword))) {
            setCurrentMessage(command.response);
            if (voiceEnabled) {
                speakText(command.response);
            }
            if (command.action) {
                command.action();
            }
            return;
        }
    }
    const defaultResponse = 'Вибачте, я не зрозумів. Спробуйте перефразувати запит.';
    setCurrentMessage(defaultResponse);
    if (voiceEnabled) {
        speakText(defaultResponse);
    }
    setCurrentExpression('concerned');
}, [voiceEnabled]);
// Text-to-speech
const speakText = useCallback((text) => {
    if ('speechSynthesis' in window && voiceEnabled) {
        setIsSpeaking(true);
        setCurrentExpression('speaking');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uk-UA';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentExpression('neutral');
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentExpression('neutral');
        };
        speechSynthesisRef.current = utterance;
        speechSynthesis.speak(utterance);
    }
}, [voiceEnabled]);
// Start voice recognition
const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
        setIsListening(true);
        setCurrentExpression('listening');
        recognitionRef.current.start();
    }
}, [isListening]);
// Stop speaking
const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentExpression('neutral');
    }
}, []);
// Initialize 3D scene with advanced avatar
useEffect(() => {
    if (!mountRef.current)
        return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(nexusColors.emerald, 0.5, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    // Create avatar group
    const avatarGroup = new THREE.Group();
    avatarRef.current = avatarGroup;
    // Create head with realistic geometry
    const headGeometry = new THREE.SphereGeometry(2.2, 64, 32);
    headGeometry.scale(1, 1.1, 0.9); // Slightly elongated head
    const headMaterial = new THREE.MeshPhongMaterial({
        color: nexusColors.emerald,
        transparent: true,
        opacity: 0.8,
        shininess: 100
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    faceRef.current = head;
    avatarGroup.add(head);
    // Create facial features
    const faceGroup = new THREE.Group();
    // Eyes
    const eyesGroup = new THREE.Group();
    eyesRef.current = eyesGroup;
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.6, 0.2, 2.1);
    eyesGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.6, 0.2, 2.1);
    eyesGroup.add(rightEye);
    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.6, 0.2, 2.2);
    eyesGroup.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.6, 0.2, 2.2);
    eyesGroup.add(rightPupil);
    faceGroup.add(eyesGroup);
    // Mouth
    const mouthGeometry = new THREE.TorusGeometry(0.4, 0.08, 8, 16);
    mouthGeometry.rotateX(Math.PI / 2);
    const mouthMaterial = new THREE.MeshBasicMaterial({
        color: nexusColors.amethyst,
        transparent: true,
        opacity: 0.9
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.4, 2.1);
    mouthRef.current = mouth;
    faceGroup.add(mouth);
    // Eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.02);
    const eyebrowMaterial = new THREE.MeshBasicMaterial({ color: nexusColors.shadow });
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.6, 0.6, 2.1);
    faceGroup.add(leftEyebrow);
    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.6, 0.6, 2.1);
    faceGroup.add(rightEyebrow);
    avatarGroup.add(faceGroup);
    // Neural network connections
    const neuralLines = [];
    const neuralPoints = [];
    // Generate neural network points
    for (let i = 0; i < 60; i++) {
        const phi = Math.acos(-1 + (2 * i) / 60);
        const theta = Math.sqrt(60 * Math.PI) * phi;
        const radius = 4 + Math.random() * 2;
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        neuralPoints.push(new THREE.Vector3(x, y, z));
    }
    // Connect neural points
    for (let i = 0; i < neuralPoints.length; i++) {
        for (let j = i + 1; j < neuralPoints.length; j++) {
            if (neuralPoints[i].distanceTo(neuralPoints[j]) < 4) {
                const points = [neuralPoints[i], neuralPoints[j]];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: nexusColors.quantum,
                    transparent: true,
                    opacity: 0.3
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                neuralLines.push(line);
                scene.add(line);
            }
        }
    }
    neuralLinesRef.current = neuralLines;
    // Data particles
    const particleCount = 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 8 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
        const colorChoice = Math.random();
        if (colorChoice < 0.3) {
            colors[i] = nexusColors.emerald.r;
            colors[i + 1] = nexusColors.emerald.g;
            colors[i + 2] = nexusColors.emerald.b;
        }
        else if (colorChoice < 0.6) {
            colors[i] = nexusColors.sapphire.r;
            colors[i + 1] = nexusColors.sapphire.g;
            colors[i + 2] = nexusColors.sapphire.b;
        }
        else {
            colors[i] = nexusColors.amethyst.r;
            colors[i + 1] = nexusColors.amethyst.g;
            colors[i + 2] = nexusColors.amethyst.b;
        }
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        transparent: true,
        opacity: 0.7,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);
    scene.add(avatarGroup);
    // Animation loop
    const animate = () => {
        // Guide animationn    if (guideRef.current) {n      // Smooth transition to target positionn      guideRef.current.position.x += (guidePosition.x - guideRef.current.position.x) * 0.1;n      guideRef.current.position.y += (guidePosition.y - guideRef.current.position.y) * 0.1;n      n      // Scale adjustmentn      const targetScale = guidePosition.scale;n      guideRef.current.scale.x += (targetScale - guideRef.current.scale.x) * 0.1;n      guideRef.current.scale.y += (targetScale - guideRef.current.scale.y) * 0.1;n      guideRef.current.scale.z += (targetScale - guideRef.current.scale.z) * 0.1;n      n      // Expression-based animationsn      if (guideExpression === 'explaining' && isGuideSpeaking) {n        // Mouth animation for speakingn        const mouthOpen = 0.3 + 0.2 * Math.sin(Date.now() * 0.02);n        if (mouthRef.current) mouthRef.current.morphTargetInfluences[0] = mouthOpen;n      } else if (guideExpression === 'happy') {n        // Smile animationn        if (mouthRef.current) mouthRef.current.morphTargetInfluences[1] = 0.5;n      } else if (guideExpression === 'warning') {n        // Concerned expressionn        if (browRef.current) browRef.current.morphTargetInfluences[0] = 0.7;n      }n    }n
        // Enhanced visual effects
        if (avatarRef.current) {
            // Breathing animation with emotion intensity
            const breathScale = 1 + (0.02 + emotionLevel * 0.05) * Math.sin(Date.now() * (0.002 + emotionLevel * 0.001));
            avatarRef.current.scale.setScalar(breathScale);
            // VR mode enhanced rotation
            if (vrMode) {
                avatarRef.current.rotation.y += 0.005;
                avatarRef.current.rotation.x = 0.1 * Math.sin(Date.now() * 0.002);
                avatarRef.current.rotation.z = 0.05 * Math.sin(Date.now() * 0.0015);
            }
            else {
                avatarRef.current.rotation.y = 0.1 * Math.sin(Date.now() * 0.001);
                avatarRef.current.rotation.x = 0.05 * Math.sin(Date.now() * 0.0005);
            }
        }
        // Enhanced neural network pulsing
        neuralLines.forEach((line, index) => {
            const time = Date.now() * 0.001;
            const baseOpacity = 0.1 + 0.3 * Math.sin(time + index * 0.1);
            const emotionBoost = emotionLevel * 0.2;
            line.material.opacity = Math.min(baseOpacity + emotionBoost, 0.8);
            if (vrMode) {
                line.scale.setScalar(1 + 0.2 * Math.sin(time * 2 + index));
            }
        });
        // Enhanced particle effects
        if (particles) {
            particles.rotation.y += vrMode ? 0.0015 : 0.0003;
            particles.rotation.x += vrMode ? 0.0012 : 0.0002;
            particles.rotation.z += vrMode ? 0.0008 : 0.0001;
            // Emotion-based particle intensity
            const emotionIntensity = 0.7 + emotionLevel * 0.3;
            particles.material.opacity = emotionIntensity;
            particles.material.size = (0.08 + emotionLevel * 0.04) * (vrMode ? 1.5 : 1);
        }
        // Dynamic lighting based on emotion
        if (pointLight) {
            const emotionHue = emotionLevel * 360;
            pointLight.intensity = 0.5 + emotionLevel * 0.5;
        }
        requestAnimationFrame(animate);
        if (avatarRef.current) {
            // Gentle breathing animation
            const breathScale = 1 + 0.02 * Math.sin(Date.now() * 0.002);
            avatarRef.current.scale.setScalar(breathScale);
            // Subtle head movement
            avatarRef.current.rotation.y = 0.1 * Math.sin(Date.now() * 0.001);
            avatarRef.current.rotation.x = 0.05 * Math.sin(Date.now() * 0.0005);
        }
        // Eye blinking
        if (eyesRef.current) {
            const blinkTime = Date.now() * 0.005;
            const blink = Math.sin(blinkTime) > 0.98 ? 0.1 : 1;
            eyesRef.current.children.forEach((eye, index) => {
                if (index < 4) { // Only eyes and pupils
                    eye.scale.y = blink;
                }
            });
        }
        // Mouth animation for speaking
        if (mouthRef.current && isSpeaking) {
            const talkScale = 1 + 0.4 * Math.sin(Date.now() * 0.02);
            mouthRef.current.scale.setScalar(talkScale);
            mouthRef.current.material.opacity = 0.95;
        }
        else if (mouthRef.current) {
            mouthRef.current.scale.setScalar(1);
            mouthRef.current.material.opacity = 0.9;
        }
        // Neural network animation
        neuralLines.forEach((line, index) => {
            const time = Date.now() * 0.001;
            line.material.opacity = 0.1 + 0.3 * Math.sin(time + index * 0.1);
        });
        // Particles animation
        if (particles) {
            particles.rotation.y += 0.0003;
            particles.rotation.x += 0.0002;
        }
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
    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
    };
}, [isSpeaking]);
// Update facial expression
useEffect(() => {
    const expression = facialExpressions[currentExpression];
    if (!expression)
        return;
    // Apply morph targets (simplified for basic geometry)
    if (mouthRef.current && expression.morphTargets.mouth_open) {
        mouthRef.current.scale.y = 1 + expression.morphTargets.mouth_open;
    }
}, [currentExpression]);
// Simulate autonomous mode messages
useEffect(() => {
    if (!isAutonomousMode)
        return;
    const messages = [
        'Моніторинг системи активний. Всі показники в нормі.',
        'ETL процес завершився успішно. Дані оновлені.',
        'Агенти працюють оптимально. Ніяких аномалій.',
        'Мережева активність стабільна. Латенція в межах норми.',
        'Система безпеки працює коректно. Загроз не виявлено.'
    ];
    const interval = setInterval(() => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setCurrentMessage(randomMessage);
        if (voiceEnabled) {
            speakText(randomMessage);
        }
    }, 15000); // Every 15 seconds
    return () => clearInterval(interval);
    // Guide position calculationsn  const calculateGuidePosition = useCallback(() => {n    const positions = {n      dashboard: { x: 0, y: 0, scale: 1 },
    etl: {
        x: -50, y;
        30, scale;
        0.8;
    }
    agent: {
        x: 50, y;
        30, scale;
        0.8;
    }
    security: {
        x: 0, y;
        -30, scale;
        0.8;
    }
    data: {
        x: -50, y;
        -30, scale;
        0.8;
    }
    analytics: {
        x: 50, y;
        -30, scale;
        0.8;
    }
    n;
});
n;
n;
return positions[activeModule] || positions.dashboard;
n;
[activeModule];
;
nn; // Handle module changesn  useEffect(() => {n    const handleModuleChange = (newModule: string) => {n      setActiveModule(newModule);n      setGuidePosition(calculateGuidePosition());n      n      // Context-aware messagesn      const messages = {n        dashboard: 'Перехожу до головної панелі. Чим можу допомогти?',n        etl: 'ETL модуль активовано. Моніторю процеси завантаження даних.',n        agent: 'Аналізую стан агентів. Всі працюють стабільно.',n        security: 'Перевіряю систему безпеки. Загроз не виявлено.',n        data: 'Індексую доступні набори даних. Готовий до аналізу.',n        analytics: 'Генерую аналітичні звіти. Дані оновлені.'n      };n      n      if (autonomousMode && messages[newModule as keyof typeof messages]) {n        speakGuideMessage(messages[newModule as keyof typeof messages]);n      }n    };n    n    // Simulate module changes - in real app this would come from router or staten    const moduleButtons = document.querySelectorAll('[data-module]');n    moduleButtons.forEach(button => {n      button.addEventListener('click', () => {n        const newModule = button.getAttribute('data-module');n        if (newModule) handleModuleChange(newModule);n      });n    });n    n    return () => {n      moduleButtons.forEach(button => {n        button.removeEventListener('click', () => {});n      });n    };n  }, [autonomousMode, calculateGuidePosition, speakGuideMessage]);n
// Enhanced functions
const performSystemScan = useCallback(() => {
    // Simulate system scan
    setTimeout(() => {
        const scanResults = [
            'CPU: Оптимально',
            'Пам', ять, Стабільно, ',,
            'Мережа: Нормально',
            'Безпека: Активна'
        ];
        const result = scanResults[Math.floor(Math.random() * scanResults.length)];
        setCurrentMessage('Сканування завершено: ' + result);
        if (voiceEnabled)
            speakText('Сканування системи завершено. ' + result);
    }, 2000);
}, [voiceEnabled, speakText]);
const startLearningMode = useCallback(() => {
    const learningSession = {
        id: 'session_',
        module: 'general',
        progress: 0,
        steps: [
            'Вивчення основних функцій',
            'Навігація по модулях',
            'Робота з даними',
            'Системний моніторинг',
            'Розширені можливості'
        ],
        currentStep: 0
    };
    setCurrentLearningSession(learningSession);
    setCurrentExpression('thinking');
}, []);
const showContextHelp = useCallback(() => {
    const helpTexts = {
        0: 'AI Ядро: Тут відображається стан штучного інтелекту та обчислювальних ресурсів',
        1: 'Пам', ять: Моніторинг, використання, оперативної, пам, 'яті та швидкості доступу': ,
        2: 'Мережа: Статистика мережевого трафіку та з', єднань, ',: 3, 'Сховище: Аналіз використання дискового простору та даних': ,
        4: 'Безпека: Система виявлення загроз та захисних механізмів'
    };
    setContextHelp(helpTexts[value] || 'Виберіть модуль для отримання контекстної допомоги');
}, [value]);
const toggleVrMode = useCallback(() => {
    setVrMode(!vrMode);
    setCurrentExpression(vrMode ? 'neutral' : 'surprised');
    setCurrentMessage(vrMode ? 'VR режим вимкнено' : 'VR режим активовано. Повне 3D занурення');
}, [vrMode]);
const performDataAnalysis = useCallback(() => {
    setCurrentExpression('thinking');
    setTimeout(() => {
        const insights = [
            'Виявлено аномалію в мережевому трафіку',
            'Рекомендую оптимізацію використання пам', яті, ',,
            'Зростання навантаження на CPU на 15%',
            'Оптимальні показники системи',
            'Потрібно перевірити дисковий простір',
            'Мережева латентність в межах норми'
        ];
        const insight = insights[Math.floor(Math.random() * insights.length)];
        setCurrentMessage('Аналіз даних завершено: ' + insight);
        if (voiceEnabled)
            speakText(insight);
        addNotification({ type: 'info', title: 'Аналіз даних', message: insight });
    }, 3000);
}, [voiceEnabled, speakText]);
const generatePredictions = useCallback(() => {
    const predictions = [
        'Очікується зростання навантаження через 2 години',
        'Рекомендую резервне копіювання даних',
        'Можливе збільшення мережевого трафіку',
        'Система буде працювати стабільно',
        'Потрібно планувати оновлення обладнання',
        'Оптимальний час для обслуговування: нічний період'
    ];
    const prediction = predictions[Math.floor(Math.random() * predictions.length)];
    setCurrentMessage('Прогноз: ' + prediction);
    if (voiceEnabled)
        speakText('Прогноз на майбутнє: ' + prediction);
    setCurrentExpression('thinking');
}, [voiceEnabled, speakText]);
const addNotification = useCallback((notification) => {
    const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
}, []);
const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
}, []);
// WebSocket simulation for real-time updates
useEffect(() => {
    const wsInterval = setInterval(() => {
        // Simulate real-time system updates
        const randomEvent = Math.random();
        if (randomEvent < 0.1) {
            addNotification({
                type: 'warning',
                title: 'Системне попередження',
                message: 'Виявлено підвищене навантаження на ' + ['CPU', 'пам', ять, ', ', мережу, '][Math.floor(Math.random() * 3)]]
            });
        }
        else if (randomEvent < 0.05) {
            addNotification({
                type: 'error',
                title: 'Критична подія',
                message: 'Втрачено з', єднання, з, ' + [': базою, даних, ', ': зовнішнім, API, ', ': файловою, системою, '][Math.floor(Math.random() * 3)]: 
            });
        }
    }, 30000); // Every 30 seconds
    return () => clearInterval(wsInterval);
}, [addNotification]);
[isAutonomousMode, voiceEnabled, speakText];
;
// Simulate system metrics
useEffect(() => {
    const interval = setInterval(() => {
        setCpuLoad(Math.floor(Math.random() * 30) + 30);
        setПам;
        'ятьUsage(Math.floor(Math.random() * 30) + 40);;
        setМережаLoad(Math.floor(Math.random() * 40) + 20);
    }, 3000);
    return () => clearInterval(interval);
    // Guide position calculationsn  const calculateGuidePosition = useCallback(() => {n    const positions = {n      dashboard: { x: 0, y: 0, scale: 1 },
    etl: {
        x: -50, y;
        30, scale;
        0.8;
    }
    agent: {
        x: 50, y;
        30, scale;
        0.8;
    }
    security: {
        x: 0, y;
        -30, scale;
        0.8;
    }
    data: {
        x: -50, y;
        -30, scale;
        0.8;
    }
    analytics: {
        x: 50, y;
        -30, scale;
        0.8;
    }
    n;
});
n;
n;
return positions[activeModule] || positions.dashboard;
n;
[activeModule];
;
nn; // Handle module changesn  useEffect(() => {n    const handleModuleChange = (newModule: string) => {n      setActiveModule(newModule);n      setGuidePosition(calculateGuidePosition());n      n      // Context-aware messagesn      const messages = {n        dashboard: 'Перехожу до головної панелі. Чим можу допомогти?',n        etl: 'ETL модуль активовано. Моніторю процеси завантаження даних.',n        agent: 'Аналізую стан агентів. Всі працюють стабільно.',n        security: 'Перевіряю систему безпеки. Загроз не виявлено.',n        data: 'Індексую доступні набори даних. Готовий до аналізу.',n        analytics: 'Генерую аналітичні звіти. Дані оновлені.'n      };n      n      if (autonomousMode && messages[newModule as keyof typeof messages]) {n        speakGuideMessage(messages[newModule as keyof typeof messages]);n      }n    };n    n    // Simulate module changes - in real app this would come from router or staten    const moduleButtons = document.querySelectorAll('[data-module]');n    moduleButtons.forEach(button => {n      button.addEventListener('click', () => {n        const newModule = button.getAttribute('data-module');n        if (newModule) handleModuleChange(newModule);n      });n    });n    n    return () => {n      moduleButtons.forEach(button => {n        button.removeEventListener('click', () => {});n      });n    };n  }, [autonomousMode, calculateGuidePosition, speakGuideMessage]);n
// Enhanced functions
const performSystemScan = useCallback(() => {
    // Simulate system scan
    setTimeout(() => {
        const scanResults = [
            'CPU: Оптимально',
            'Пам', ять, Стабільно, ',,
            'Мережа: Нормально',
            'Безпека: Активна'
        ];
        const result = scanResults[Math.floor(Math.random() * scanResults.length)];
        setCurrentMessage('Сканування завершено: ' + result);
        if (voiceEnabled)
            speakText('Сканування системи завершено. ' + result);
    }, 2000);
}, [voiceEnabled, speakText]);
const startLearningMode = useCallback(() => {
    const learningSession = {
        id: 'session_',
        module: 'general',
        progress: 0,
        steps: [
            'Вивчення основних функцій',
            'Навігація по модулях',
            'Робота з даними',
            'Системний моніторинг',
            'Розширені можливості'
        ],
        currentStep: 0
    };
    setCurrentLearningSession(learningSession);
    setCurrentExpression('thinking');
}, []);
const showContextHelp = useCallback(() => {
    const helpTexts = {
        0: 'AI Ядро: Тут відображається стан штучного інтелекту та обчислювальних ресурсів',
        1: 'Пам', ять: Моніторинг, використання, оперативної, пам, 'яті та швидкості доступу': ,
        2: 'Мережа: Статистика мережевого трафіку та з', єднань, ',: 3, 'Сховище: Аналіз використання дискового простору та даних': ,
        4: 'Безпека: Система виявлення загроз та захисних механізмів'
    };
    setContextHelp(helpTexts[value] || 'Виберіть модуль для отримання контекстної допомоги');
}, [value]);
const toggleVrMode = useCallback(() => {
    setVrMode(!vrMode);
    setCurrentExpression(vrMode ? 'neutral' : 'surprised');
    setCurrentMessage(vrMode ? 'VR режим вимкнено' : 'VR режим активовано. Повне 3D занурення');
}, [vrMode]);
const performDataAnalysis = useCallback(() => {
    setCurrentExpression('thinking');
    setTimeout(() => {
        const insights = [
            'Виявлено аномалію в мережевому трафіку',
            'Рекомендую оптимізацію використання пам', яті, ',,
            'Зростання навантаження на CPU на 15%',
            'Оптимальні показники системи',
            'Потрібно перевірити дисковий простір',
            'Мережева латентність в межах норми'
        ];
        const insight = insights[Math.floor(Math.random() * insights.length)];
        setCurrentMessage('Аналіз даних завершено: ' + insight);
        if (voiceEnabled)
            speakText(insight);
        addNotification({ type: 'info', title: 'Аналіз даних', message: insight });
    }, 3000);
}, [voiceEnabled, speakText]);
const generatePredictions = useCallback(() => {
    const predictions = [
        'Очікується зростання навантаження через 2 години',
        'Рекомендую резервне копіювання даних',
        'Можливе збільшення мережевого трафіку',
        'Система буде працювати стабільно',
        'Потрібно планувати оновлення обладнання',
        'Оптимальний час для обслуговування: нічний період'
    ];
    const prediction = predictions[Math.floor(Math.random() * predictions.length)];
    setCurrentMessage('Прогноз: ' + prediction);
    if (voiceEnabled)
        speakText('Прогноз на майбутнє: ' + prediction);
    setCurrentExpression('thinking');
}, [voiceEnabled, speakText]);
const addNotification = useCallback((notification) => {
    const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
}, []);
const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
}, []);
// WebSocket simulation for real-time updates
useEffect(() => {
    const wsInterval = setInterval(() => {
        // Simulate real-time system updates
        const randomEvent = Math.random();
        if (randomEvent < 0.1) {
            addNotification({
                type: 'warning',
                title: 'Системне попередження',
                message: 'Виявлено підвищене навантаження на ' + ['CPU', 'пам', ять, ', ', мережу, '][Math.floor(Math.random() * 3)]]
            });
        }
        else if (randomEvent < 0.05) {
            addNotification({
                type: 'error',
                title: 'Критична подія',
                message: 'Втрачено з', єднання, з, ' + [': базою, даних, ', ': зовнішнім, API, ', ': файловою, системою, '][Math.floor(Math.random() * 3)]: 
            });
        }
    }, 30000); // Every 30 seconds
    return () => clearInterval(wsInterval);
}, [addNotification]);
[];
;
const handleChange = (event, newValue) => {
    setValue(newValue);
};
const toggleVoice = () => setVoiceEnabled(!voiceEnabled);
const toggleAutonomousMode = () => setIsAutonomousMode(!isAutonomousMode);
return (_jsxs(Box, { sx: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: `linear-gradient(135deg, ${nexusColors.darkMatter} 0%, ${nexusColors.obsidian} 100%)`,
        color: nexusColors.frost,
        p: 3
    }, children: [_jsxs(Box, { sx: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                borderBottom: `1px solid ${nexusColors.quantum}80`,
                pb: 2
            }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Avatar, { sx: { bgcolor: nexusColors.emerald, width: 48, height: 48 }, children: _jsx(AiIcon, {}) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: {
                                        fontFamily: 'Orbitron',
                                        background: `linear-gradient(90deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }, children: "NEXUS AI \u041F\u0420\u041E\u0412\u0406\u0414\u041D\u0418\u041A" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, opacity: 0.7 }, children: "\u0413\u0456\u043F\u0435\u0440\u0440\u0435\u0430\u043B\u0456\u0441\u0442\u0438\u0447\u043D\u0438\u0439 3D-\u043F\u0440\u043E\u0432\u0456\u0434\u043D\u0438\u043A" })] })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Tooltip, { title: voiceEnabled ? "Вимкнути голос" : "Увімкнути голос", children: _jsx(IconButton, { onClick: toggleVoice, sx: { color: voiceEnabled ? nexusColors.emerald : nexusColors.frost, mr: 1 }, children: _jsx(VolumeUpIcon, {}) }) }), _jsx(Tooltip, { title: isListening ? "Зупинити прослуховування" : "Почати прослуховування", children: _jsx(IconButton, { onClick: startListening, sx: { color: isListening ? nexusColors.crimson : nexusColors.frost }, children: isListening ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) }) }), isSpeaking && (_jsx(Tooltip, { title: "\u0417\u0443\u043F\u0438\u043D\u0438\u0442\u0438 \u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F", children: _jsx(IconButton, { onClick: stopSpeaking, sx: { color: nexusColors.warning }, children: _jsx(PauseIcon, {}) }) })), _jsx(Tooltip, { title: isAutonomousMode ? "Вимкнути автономний режим" : "Увімкнути автономний режим", children: _jsx(Chip, { label: isAutonomousMode ? "Автономний" : "Ручний", onClick: toggleAutonomousMode, sx: {
                                    bgcolor: isAutonomousMode ? nexusColors.emerald : nexusColors.shadow,
                                    color: nexusColors.frost,
                                    cursor: 'pointer'
                                } }) }), _jsxs(Tooltip, { title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438", children: [_jsx(Tooltip, { title: `Сповіщення ${notifications.filter(n => !n.read).length > 0 ? `(${notifications.filter(n => !n.read).length})` : }`, children: _jsx(IconButton, { onClick: () => setShowNotifications(true), sx: { color: notifications.filter(n => !n.read).length > 0 ? nexusColors.warning : nexusColors.frost, ml: 1 }, children: _jsx(NotificationsIcon, {}) }) }), _jsx(Tooltip, { title: "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0430", children: _jsx(IconButton, { onClick: showContextHelp, sx: { color: nexusColors.frost, ml: 1 }, children: _jsx(HelpIcon, {}) }) }), _jsx(IconButton, { sx: { color: nexusColors.frost, ml: 1 }, children: _jsx(SettingsIcon, {}) })] })] })] }), _jsxs(Box, { sx: { display: 'flex', flexGrow: 1, gap: 3 }, children: [_jsxs(Box, { sx: {
                        flex: 2,
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${nexusColors.quantum}80`,
                        boxShadow: `0 0 20px ${nexusColors.quantum}40`
                    }, children: [_jsx("div", { ref: mountRef, style: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 } }), _jsx(Box, { sx: {
                                position: 'absolute',
                                top: '50%',
                                left: 10,
                                width: 4,
                                height: 200,
                                background: 'linear-gradient(to bottom, transparent, ' + nexusColors.emerald + ', transparent)',
                                borderRadius: 2,
                                opacity: 0.7,
                                animation: 'pulse 2s infinite'
                            } }), _jsx(Box, { sx: {
                                position: 'absolute',
                                top: '30%',
                                right: 10,
                                width: 4,
                                height: 150,
                                background: 'linear-gradient(to bottom, transparent, ' + nexusColors.sapphire + ', transparent)',
                                borderRadius: 2,
                                opacity: 0.7,
                                animation: 'pulse 3s infinite'
                            } }), _jsx(Box, { sx: {
                                position: 'absolute',
                                bottom: '20%',
                                left: '50%',
                                width: 200,
                                height: 4,
                                background: 'linear-gradient(to right, transparent, ' + nexusColors.amethyst + ', transparent)',
                                borderRadius: 2,
                                opacity: 0.7,
                                animation: 'pulse 4s infinite'
                            } }), _jsx(Box, { sx: {
                                position: 'absolute',
                                top: 20,
                                left: 20,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                border: '3px solid' + nexusColors.quantum,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0, 255, 136, 0.1)',
                                backdropFilter: 'blur(5px)'
                            }, children: _jsx(Box, { sx: {
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    border: '2px solid' + nexusColors.emerald,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0, 255, 136, 0.2)'
                                }, children: _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.emerald }, children: [cpuLoad, "%"] }) }) }), _jsxs(Box, { sx: {
                                position: 'absolute',
                                bottom: 150,
                                left: 20,
                                width: 200,
                                height: 60,
                                background: 'rgba(10, 15, 20, 0.8)',
                                border: '1px solid' + nexusColors.quantum,
                                borderRadius: 2,
                                p: 1,
                                backdropFilter: 'blur(5px)'
                            }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, display: 'block', mb: 0.5 }, children: "\uD83C\uDF10 \u041C\u0415\u0420\u0415\u0416\u0415\u0412\u0410 \u0410\u041A\u0422\u0418\u0412\u041D\u0406\u0421\u0422\u042C" }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Box, { sx: { flexGrow: 1 }, children: _jsx(LinearProgress, { variant: "determinate", value: networkLoad, sx: {
                                                    height: 6,
                                                    borderRadius: 3,
                                                    background: 'rgba(255,255,255,0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        background: 'linear-gradient(90deg, ' + nexusColors.amethyst + ', ' + nexusColors.quantum + '), ,
                                                        borderRadius: 3
                                                    }
                                                } }) }), _jsxs(Typography, { variant: "caption", sx: { color: nexusColors.amethyst, minWidth: 30 }, children: [networkLoad, "%"] })] })] }), _jsx(Box, { sx: {
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                width: 100,
                                height: 100,
                                background: 'conic-gradient(' + nexusColors.sapphire + ' 0deg, ' + nexusColors.sapphire + ' ' + (memoryUsage * 3.6) + 'deg, transparent ' + (memoryUsage * 3.6) + 'deg)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid' + nexusColors.quantum
                            }, children: _jsxs(Box, { sx: {
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'rgba(10, 15, 20, 0.8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid' + nexusColors.quantum
                                }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost }, children: "RAM" }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.sapphire, display: 'block', textAlign: 'center', mt: 0.5 }, children: [memoryUsage, "%"] })] }) }), _jsxs(Box, { sx: {
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                background: `linear-gradient(transparent, ${nexusColors.darkMatter}CC)`
                            }, children: [_jsxs(Typography, { variant: "subtitle2", sx: {
                                        textAlign: 'center',
                                        color: nexusColors.frost,
                                        textShadow: `0 0 5px ${nexusColors.quantum}`,
                                        mb: 1
                                    }, children: ["\u041D\u0435\u0439\u0440\u043E\u043D\u043D\u0456 \u043C\u0435\u0440\u0435\u0436\u0456: \u0410\u041A\u0422\u0418\u0412\u041D\u0406 | \u0421\u0442\u0430\u0442\u0443\u0441: ", _jsx("span", { style: { color: nexusColors.emerald }, children: systemStatus })] }), _jsxs(Typography, { variant: "body2", sx: {
                                        textAlign: 'center',
                                        color: nexusColors.frost,
                                        opacity: 0.8,
                                        fontStyle: 'italic'
                                    }, children: ["\"", currentMessage, "\""] })] }), _jsx(Chip, { label: `Емоції: ${Math.round(emotionLevel * 100)}%`, size: "small", sx: {
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                bgcolor: emotionLevel > 0.7 ? nexusColors.crimson + 'CC' : emotionLevel > 0.4 ? nexusColors.warning + 'CC' : nexusColors.emerald + 'CC',
                                color: nexusColors.frost,
                                border: '1px solid ' + nexusColors.quantum
                            } }), vrMode && (_jsx(Chip, { label: "VR", size: "small", sx: {
                                position: 'absolute',
                                top: 10,
                                right: 120,
                                bgcolor: nexusColors.amethyst + 'CC',
                                color: nexusColors.frost,
                                border: '1px solid ' + nexusColors.quantum
                            } })), value === 5 && (_jsx(Box, { sx: {
                                position: 'absolute',
                                top: 20,
                                left: 20,
                                right: 20,
                                bottom: 20,
                                pointerEvents: 'none',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: 1
                            }, children: systemMetrics.slice(0, 6).map((metric, index) => (_jsxs(Box, { sx: {
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    borderRadius: 1,
                                    p: 1,
                                    border: '1px solid ' + (metric.status === 'critical' ? nexusColors.crimson : metric.status === 'warning' ? nexusColors.warning : nexusColors.emerald) + ''
                                }, children: [_jsx(Typography, { variant: "caption", sx: { display: 'block', fontSize: '0.7rem', color: nexusColors.frost }, children: metric.name }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost }, children: [metric.value, metric.unit] })] }, index))) })), _jsx(Chip, { label: currentExpression.toUpperCase(), size: "small", sx: {
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                bgcolor: nexusColors.obsidian + 'CC',
                                color: nexusColors.frost,
                                border: `1px solid ${nexusColors.quantum}`
                            } })] }), _jsxs(Box, { sx: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx(Paper, { sx: { background: 'transparent', boxShadow: 'none' }, children: _jsxs(Tabs, { value: value, onChange: handleChange, variant: "fullWidth", sx: {
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: nexusColors.emerald,
                                        height: 3
                                    }
                                }, children: [_jsx(Tab, { icon: _jsx(AiIcon, {}), label: "AI \u042F\u0434\u0440\u043E", sx: { color: value === 0 ? nexusColors.emerald : nexusColors.frost, opacity: 0.8, '&:hover': { opacity: 1 } } }), _jsx(Tab, { icon: _jsx(Пам, {}) }), "'\u044F\u0442\u044CIcon />} label=\"\u041F\u0430\u043C'\u044F\u0442\u044C\" sx=", { color: value === 1 ? nexusColors.emerald : nexusColors.frost, opacity: 0.8, '&:hover': { opacity: 1 } }, " />", _jsx(Tab, { icon: _jsx(МережаIcon, {}), label: "\u041C\u0435\u0440\u0435\u0436\u0430", sx: { color: value === 2 ? nexusColors.emerald : nexusColors.frost, opacity: 0.8, '&:hover': { opacity: 1 } } }), _jsx(Tab, { icon: _jsx(СховищеIcon, {}), label: "\u0421\u0445\u043E\u0432\u0438\u0449\u0435", sx: { color: value === 3 ? nexusColors.emerald : nexusColors.frost, opacity: 0.8, '&:hover': { opacity: 1 } } }), _jsx(Tab, { icon: _jsx(БезпекаIcon, {}), label: "\u0411\u0435\u0437\u043F\u0435\u043A\u0430", sx: { color: value === 4 ? nexusColors.emerald : nexusColors.frost, opacity: 0.8, '&:hover': { opacity: 1 } } })] }) }), _jsxs(Box, { sx: { display: 'flex', gap: 1, mb: 2 }, children: [_jsx(Button, { variant: "outlined", size: "small", children: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430" }), _jsx(Button, { variant: "outlined", size: "small", children: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0430\u0446\u0456\u044F" }), _jsx(Button, { variant: "outlined", size: "small", children: "\u0420\u0435\u0437\u0435\u0440\u0432" }), _jsx(Button, { variant: "outlined", size: "small", children: "\u0411\u0435\u0437\u043F\u0435\u043A\u0430" })] }), _jsxs(Paper, { sx: {
                                flexGrow: 1,
                                p: 3,
                                background: `rgba(10, 15, 20, 0.7)`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${nexusColors.quantum}80`,
                                borderRadius: 2,
                                overflow: 'auto'
                            }, children: [value === 0 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0421\u0442\u0430\u043D AI \u042F\u0434\u0440\u0430" }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "caption", sx: { display: 'block', mb: 1 }, children: ["\u041D\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0426\u041F: ", cpuLoad, "%"] }), _jsx(LinearProgress, { variant: "determinate", value: cpuLoad, sx: {
                                                        height: 8,
                                                        borderRadius: 4,
                                                        background: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: `linear-gradient(90deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`
                                                        }
                                                    } })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsxs(Typography, { variant: "caption", sx: { display: 'block', mb: 1 }, children: ["\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F \u043F\u0430\u043C'\u044F\u0442\u0456: ", memoryUsage, "%"] }), _jsx(LinearProgress, { variant: "determinate", value: memoryUsage, sx: {
                                                        height: 8,
                                                        borderRadius: 4,
                                                        background: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: `linear-gradient(90deg, ${nexusColors.amethyst}, ${nexusColors.quantum})`
                                                        }
                                                    } })] }), _jsxs(Box, { sx: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: 2,
                                                mb: 3
                                            }, children: [_jsxs(Paper, { sx: {
                                                        p: 2,
                                                        background: 'rgba(0, 200, 100, 0.1)',
                                                        border: `1px solid rgba(0, 200, 100, 0.3)`
                                                    }, children: [_jsx(Typography, { variant: "caption", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u043C\u043E\u0434\u0435\u043B\u0456" }), _jsx(Typography, { variant: "h5", children: "3" })] }), _jsxs(Paper, { sx: {
                                                        p: 2,
                                                        background: 'rgba(150, 0, 255, 0.1)',
                                                        border: `1px solid rgba(150, 0, 255, 0.3)`
                                                    }, children: [_jsx(Typography, { variant: "caption", children: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430" }), _jsx(Typography, { variant: "h5", children: "42\u00B0C" })] })] }), _jsx(Typography, { variant: "subtitle2", sx: {
                                                color: nexusColors.emerald,
                                                textAlign: 'center',
                                                mt: 2
                                            }, children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430: \u041E\u041F\u0422\u0418\u041C\u0410\u041B\u042C\u041D\u0410" })] })), value === 1 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u041C\u0430\u0442\u0440\u0438\u0446\u044F \u043F\u0430\u043C'\u044F\u0442\u0456" }), _jsxs(Box, { sx: {
                                                height: '200px',
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 1,
                                                mb: 2,
                                                border: `1px solid ${nexusColors.quantum}80`,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }, children: [_jsx(Box, { sx: {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(45deg, rgba(0,255,200,0.05) 0%, rgba(0,180,255,0.1) 100%)'
                                                    } }), _jsxs(Typography, { variant: "h4", sx: {
                                                        background: `linear-gradient(90deg, ${nexusColors.emerald}, ${nexusColors.sapphire})`,
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        zIndex: 1
                                                    }, children: [memoryUsage, "% \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043E"] })] }), _jsxs(Box, { sx: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: 2
                                            }, children: [_jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u0447\u0438\u0442\u0430\u043D\u043D\u044F" }), _jsx(Typography, { children: "12.4 GB/s" })] }), _jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u0443" }), _jsx(Typography, { children: "8.7 GB/s" })] }), _jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u0417\u0430\u0442\u0440\u0438\u043C\u043A\u0430" }), _jsx(Typography, { children: "14ns" })] }), _jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u041F\u043E\u043C\u0438\u043B\u043E\u043A" }), _jsx(Typography, { children: "0" })] })] })] })), value === 2 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u041C\u0435\u0440\u0435\u0436\u0435\u0432\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C" }), _jsxs(Box, { sx: {
                                                height: '150px',
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 1,
                                                mb: 2,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }, children: [_jsx(Box, { sx: {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'radial-gradient(circle at center, rgba(0,180,255,0.1) 0%, transparent 70%)'
                                                    } }), _jsxs(Typography, { variant: "h4", sx: {
                                                        background: `linear-gradient(90deg, ${nexusColors.amethyst}, ${nexusColors.quantum})`,
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        zIndex: 1
                                                    }, children: [networkLoad, "% \u043D\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F"] })] }), _jsxs(Box, { sx: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: 2
                                            }, children: [_jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u0412\u0456\u0434\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E" }), _jsx(Typography, { children: "45.8 MB/s" })] }), _jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u041E\u0442\u0440\u0438\u043C\u0430\u043D\u043E" }), _jsx(Typography, { children: "62.3 MB/s" })] }), _jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u0417\u0430\u0442\u0440\u0438\u043C\u043A\u0430" }), _jsx(Typography, { children: "24ms" })] }), _jsxs("div", { children: [_jsx(Typography, { variant: "caption", children: "\u0417'\u0454\u0434\u043D\u0430\u043D\u044C" }), _jsx(Typography, { children: "142" })] })] })] })), value === 3 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0421\u0445\u043E\u0432\u0438\u0449\u0435 \u0434\u0430\u043D\u0438\u0445" }), _jsxs(Box, { sx: {
                                                height: '120px',
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: 1,
                                                mb: 2,
                                                p: 2,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }, children: [_jsx(Box, { sx: {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(45deg, rgba(150,0,255,0.05) 0%, rgba(255,0,200,0.1) 100%)'
                                                    } }), _jsxs(Typography, { variant: "h4", sx: {
                                                        position: 'relative',
                                                        zIndex: 1,
                                                        textAlign: 'center'
                                                    }, children: ["1.2 ", _jsx("span", { style: { fontSize: '0.6em', opacity: 0.7 }, children: "TB / 2.0 TB" })] })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", sx: { display: 'block', mb: 1 }, children: "\u0414\u0430\u043D\u0456 \u043C\u043E\u0434\u0435\u043B\u0435\u0439: 45%" }), _jsx(LinearProgress, { variant: "determinate", value: 45, sx: {
                                                        height: 6,
                                                        borderRadius: 3,
                                                        background: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: `linear-gradient(90deg, ${nexusColors.sapphire}, ${nexusColors.emerald})`
                                                        }
                                                    } })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", sx: { display: 'block', mb: 1 }, children: "\u041D\u0430\u0432\u0447\u0430\u043B\u044C\u043D\u0456 \u0434\u0430\u043D\u0456: 30%" }), _jsx(LinearProgress, { variant: "determinate", value: 30, sx: {
                                                        height: 6,
                                                        borderRadius: 3,
                                                        background: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: `linear-gradient(90deg, ${nexusColors.amethyst}, ${nexusColors.quantum})`
                                                        }
                                                    } })] })] })), value === 5 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0420\u043E\u0437\u0448\u0438\u0440\u0435\u043D\u0438\u0439 \u0430\u043D\u0430\u043B\u0456\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsxs(Box, { sx: { mb: 3, p: 2, background: 'rgba(0, 200, 100, 0.1)', borderRadius: 1, border: '1px solid rgba(0, 200, 100, 0.3)', textAlign: 'center' }, children: [_jsx(Typography, { variant: "h5", sx: { mb: 1 }, children: "\u0428\u0406-\u0410\u043D\u0430\u043B\u0456\u0437 \u0430\u043A\u0442\u0438\u0432\u043D\u0438\u0439" }), _jsx(Typography, { variant: "body2", children: "\u041E\u0431\u0440\u043E\u0431\u043A\u0430 \u0434\u0430\u043D\u0438\u0445 \u0443 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0447\u0430\u0441\u0456" })] }), _jsx(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }, children: systemMetrics.map((metric, index) => (_jsxs(Paper, { sx: { p: 2, background: metric.status === 'critical' ? 'rgba(255, 50, 50, 0.1)' : metric.status === 'warning' ? 'rgba(255, 150, 0, 0.1)' : 'rgba(0, 200, 100, 0.1)', border: '1px solid ' + (metric.status === 'critical' ? '#ff3232' : metric.status === 'warning' ? '#ff9600' : '#00c864') + '' }, children: [_jsx(Typography, { variant: "caption", sx: { display: 'block', mb: 1 }, children: metric.name }), _jsxs(Typography, { variant: "h4", children: [metric.value, metric.unit] }), _jsxs(Typography, { variant: "caption", sx: { color: metric.trend === 'up' ? nexusColors.crimson : metric.trend === 'down' ? nexusColors.emerald : nexusColors.frost }, children: [metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→', " ", metric.status] })] }, index))) }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { variant: "contained", onClick: performDataAnalysis, sx: { backgroundColor: nexusColors.emerald }, children: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u0430\u043D\u0430\u043B\u0456\u0437" }), _jsx(Button, { variant: "outlined", onClick: generatePredictions, sx: { borderColor: nexusColors.sapphire, color: nexusColors.sapphire }, children: "\u041F\u0440\u043E\u0433\u043D\u043E\u0437\u0443\u0432\u0430\u0442\u0438" })] })] })), value === 6 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0435 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F" }), currentLearningSession ? (_jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle1", sx: { mb: 2 }, children: ["\u041A\u0440\u043E\u043A ", currentLearningSession.currentStep + 1, " \u0437 ", currentLearningSession.steps.length] }), _jsx(Typography, { variant: "body1", sx: { mb: 3 }, children: currentLearningSession.steps[currentLearningSession.currentStep] }), _jsx(LinearProgress, { variant: "determinate", value: (currentLearningSession.currentStep + 1) / currentLearningSession.steps.length * 100, sx: { mb: 3 } }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { variant: "outlined", disabled: currentLearningSession.currentStep === 0, children: "\u041F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439" }), _jsx(Button, { variant: "contained", onClick: () => setCurrentLearningSession(null), children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0438" }), _jsx(Button, { variant: "contained", disabled: currentLearningSession.currentStep === currentLearningSession.steps.length - 1, children: "\u041D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439" })] })] })) : (_jsxs(Box, { sx: { textAlign: 'center', py: 4 }, children: [_jsx(LearnIcon, { sx: { fontSize: 64, color: nexusColors.emerald, mb: 2 } }), _jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u041D\u0430\u0432\u0447\u0430\u043B\u044C\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C \u043D\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u0438\u0439" }), _jsx(Typography, { variant: "body2", sx: { mb: 3 }, children: "\u041F\u043E\u0447\u043D\u0456\u0442\u044C \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F \u0434\u043B\u044F \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043D\u044F \u043F\u043E\u043A\u0440\u043E\u043A\u043E\u0432\u0438\u0445 \u0456\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0456\u0439" }), _jsx(Button, { variant: "contained", onClick: startLearningMode, sx: { backgroundColor: nexusColors.emerald }, children: "\u041F\u043E\u0447\u0430\u0442\u0438 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F" })] }))] })), value === 7 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0420\u0435\u0436\u0438\u043C \u0432\u0456\u0440\u0442\u0443\u0430\u043B\u044C\u043D\u043E\u0457 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0456" }), _jsxs(Box, { sx: { mb: 3, p: 3, background: vrMode ? 'rgba(150, 0, 255, 0.1)' : 'rgba(100, 100, 100, 0.1)', borderRadius: 2, border: '2px solid ' + (vrMode ? nexusColors.amethyst : nexusColors.shadow) + '' }, children: [_jsx(Typography, { variant: "h5", sx: { mb: 1, color: vrMode ? nexusColors.amethyst : nexusColors.frost }, children: vrMode ? 'VR Режим активний' : 'VR Режим вимкнений' }), _jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: vrMode ? 'Повне 3D занурення з розширеними візуальними ефектами' : 'Перемкніть для повного імерсивного досвіду' }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: vrMode, onChange: toggleVrMode }), label: vrMode ? 'Вимкнути VR' : 'Увімкнути VR' })] }), vrMode && (_jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }, children: [_jsxs(Paper, { sx: { p: 2, textAlign: 'center', background: 'rgba(0, 255, 200, 0.1)', border: '1px solid #00ffc8' }, children: [_jsx(VrIcon, { sx: { fontSize: 32, color: '#00ffc8', mb: 1 } }), _jsx(Typography, { variant: "caption", children: "3D \u0413\u043B\u0438\u0431\u0438\u043D\u0430" }), _jsx(Typography, { variant: "h6", children: "100%" })] }), _jsxs(Paper, { sx: { p: 2, textAlign: 'center', background: 'rgba(255, 0, 200, 0.1)', border: '1px solid #ff00c8' }, children: [_jsx(AnalyticsIcon, { sx: { fontSize: 32, color: '#ff00c8', mb: 1 } }), _jsx(Typography, { variant: "caption", children: "\u0427\u0430\u0441\u0442\u0438\u043D\u043A\u0438" }), _jsx(Typography, { variant: "h6", children: "2000+" })] }), _jsxs(Paper, { sx: { p: 2, textAlign: 'center', background: 'rgba(255, 200, 0, 0.1)', border: '1px solid #ffc800' }, children: [_jsx(МережаIcon, { sx: { fontSize: 32, color: '#ffc800', mb: 1 } }), _jsx(Typography, { variant: "caption", children: "FPS" }), _jsx(Typography, { variant: "h6", children: "60" })] })] }))] })), value === 8 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0415\u043C\u043E\u0446\u0456\u0439\u043D\u0438\u0439 \u0456\u043D\u0442\u0435\u043B\u0435\u043A\u0442" }), _jsxs(Box, { sx: { mb: 3, p: 2, background: 'rgba(255, 100, 200, 0.1)', borderRadius: 1, border: '1px solid #ff64c8' }, children: [_jsxs(Typography, { variant: "subtitle1", sx: { mb: 2 }, children: ["\u0420\u0456\u0432\u0435\u043D\u044C \u0435\u043C\u043E\u0446\u0456\u0439\u043D\u043E\u0441\u0442\u0456: ", Math.round(emotionLevel * 100), "%"] }), _jsx(Slider, { value: emotionLevel, onChange: (e, newValue) => setEmotionLevel(newValue), min: 0, max: 1, step: 0.1, sx: { color: nexusColors.amethyst } })] }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2, mb: 3 }, children: [_jsx(Button, { variant: "outlined", onClick: () => setCurrentExpression('happy'), sx: { borderColor: nexusColors.emerald }, children: "\u0420\u0430\u0434\u0438\u0439" }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentExpression('sad'), sx: { borderColor: nexusColors.sapphire }, children: "\u0421\u0443\u043C\u043D\u0438\u0439" }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentExpression('angry'), sx: { borderColor: nexusColors.crimson }, children: "\u0417\u043B\u0438\u0439" }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentExpression('surprised'), sx: { borderColor: nexusColors.warning }, children: "\u0417\u0434\u0438\u0432\u043E\u0432\u0430\u043D\u0438\u0439" }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentExpression('thinking'), sx: { borderColor: nexusColors.quantum }, children: "\u0414\u0443\u043C\u0430\u044E" }), _jsx(Button, { variant: "outlined", onClick: () => setCurrentExpression('neutral'), sx: { borderColor: nexusColors.frost }, children: "\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u0438\u0439" })] }), _jsxs(Typography, { variant: "body2", sx: { color: nexusColors.frost, opacity: 0.7 }, children: ["\u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0435\u043C\u043E\u0446\u0456\u0439\u043D\u0438\u0439 \u0441\u0442\u0430\u043D: ", currentExpression.toUpperCase()] })] })), value === 9 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u044F \u0430\u0432\u0430\u0442\u0430\u0440\u0430" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }, children: [_jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 2 }, children: "\u041A\u043E\u043B\u0456\u0440 \u0448\u043A\u0456\u0440\u0438" }), _jsx(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap' }, children: ['#00ff88', '#ffaa00', '#ff6b6b', '#4ecdc4', '#a8e6cf', '#ffd93d', '#6c5ce7', '#fd79a8'].map(color => (_jsx(Box, { sx: {
                                                                    width: 30,
                                                                    height: 30,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: color,
                                                                    cursor: 'pointer',
                                                                    border: avatarCustomization.skinTone === color ? '3px solid #fff' : '2px solid #333',
                                                                    '&:hover': { transform: 'scale(1.1)', transition: '0.2s' }
                                                                }, onClick: () => setAvatarCustomization(prev => ({ ...prev, skinTone: color })) }, color))) })] }), _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 2 }, children: "\u041A\u043E\u043B\u0456\u0440 \u043E\u0447\u0435\u0439" }), _jsx(Box, { sx: { display: 'flex', gap: 1, flexWrap: 'wrap' }, children: ['#ffffff', '#0000ff', '#00ff00', '#ff0000', '#ffff00', '#ff00ff', '#00ffff', '#800080'].map(color => (_jsx(Box, { sx: {
                                                                    width: 30,
                                                                    height: 30,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: color,
                                                                    cursor: 'pointer',
                                                                    border: avatarCustomization.eyeColor === color ? '3px solid #fff' : '2px solid #333',
                                                                    '&:hover': { transform: 'scale(1.1)', transition: '0.2s' }
                                                                }, onClick: () => setAvatarCustomization(prev => ({ ...prev, eyeColor: color })) }, color))) })] }), _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 2 }, children: "\u0421\u0442\u0438\u043B\u044C \u0432\u043E\u043B\u043E\u0441\u0441\u044F" }), _jsx(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }, children: ['neural', 'cyber', 'minimal', 'flowing'].map(style => (_jsx(Button, { variant: avatarCustomization.hairStyle === style ? 'contained' : 'outlined', size: "small", onClick: () => setAvatarCustomization(prev => ({ ...prev, hairStyle: style })), sx: { textTransform: 'capitalize' }, children: style }, style))) })] })] }), _jsx(Button, { variant: "contained", onClick: () => setShowCustomization(false), sx: { backgroundColor: nexusColors.emerald }, children: "\u0417\u0430\u0441\u0442\u043E\u0441\u0443\u0432\u0430\u0442\u0438 \u0437\u043C\u0456\u043D\u0438" })] })), value === 4 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0431\u0435\u0437\u043F\u0435\u043A\u0438" }), _jsxs(Box, { sx: {
                                                p: 2,
                                                background: 'rgba(255, 50, 50, 0.1)',
                                                borderRadius: 1,
                                                mb: 2,
                                                borderLeft: `3px solid ${nexusColors.crimson}`
                                            }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.crimson }, children: "\u26A0\uFE0F \u0421\u043F\u0440\u043E\u0431\u0430 \u043D\u0435\u0441\u0430\u043D\u043A\u0446\u0456\u043E\u043D\u043E\u0432\u0430\u043D\u043E\u0433\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u0443" }), _jsx(Typography, { variant: "body2", sx: { opacity: 0.8 }, children: "\u0412\u0438\u044F\u0432\u043B\u0435\u043D\u043E \u0437 IP: 192.168.1.45 | 22:45:12" })] }), _jsxs(Box, { sx: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: 2,
                                                mb: 2
                                            }, children: [_jsxs(Paper, { sx: {
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        background: 'rgba(0, 200, 100, 0.1)',
                                                        border: `1px solid rgba(0, 200, 100, 0.3)`
                                                    }, children: [_jsx(Typography, { variant: "h6", sx: { color: '#00c864' }, children: "24/7" }), _jsx(Typography, { variant: "caption", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0439 \u0437\u0430\u0445\u0438\u0441\u0442" })] }), _jsxs(Paper, { sx: {
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        background: 'rgba(255, 50, 50, 0.1)',
                                                        border: `1px solid rgba(255, 50, 50, 0.3)`
                                                    }, children: [_jsx(Typography, { variant: "h6", sx: { color: nexusColors.crimson }, children: "1" }), _jsx(Typography, { variant: "caption", children: "\u0417\u0430\u0433\u0440\u043E\u0437\u0430" })] })] }), _jsxs(Box, { sx: {
                                                p: 2,
                                                background: 'rgba(0, 200, 100, 0.1)',
                                                borderRadius: 1,
                                                mb: 2,
                                                borderLeft: `3px solid ${nexusColors.emerald}`
                                            }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.emerald }, children: "\u2705 \u0417\u0430\u0445\u0438\u0441\u0442 \u0430\u043A\u0442\u0438\u0432\u043E\u0432\u0430\u043D\u043E" }), _jsx(Typography, { variant: "body2", sx: { opacity: 0.8 }, children: "\u0417\u0430\u0433\u0440\u043E\u0437\u0430 \u043D\u0435\u0439\u0442\u0440\u0430\u043B\u0456\u0437\u043E\u0432\u0430\u043D\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E" })] })] }))] })] })] }), showAgentPanel && (_jsxs(Box, { sx: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                zIndex: 9998,
                p: 4,
                overflow: 'auto',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.3s ease-in'
            }, children: [_jsxs(Box, { sx: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '80vw',
                        height: '80vh',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle at center, rgba(0,255,136,0.05) 0%, transparent 70%)',
                        border: '1px solid' + nexusColors.quantum,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }, children: [agents.map(agent => (agent.connections.map(connId => {
                            const targetAgent = agents.find(a => a.id === connId);
                            if (!targetAgent)
                                return null;
                            return (_jsx(Box, { sx: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '100%',
                                    height: 2,
                                    background: 'linear-gradient(90deg, transparent, ' +
                                        (agent.status === 'error' || targetAgent.status === 'error' ? nexusColors.crimson :
                                            agent.status === 'busy' || targetAgent.status === 'busy' ? nexusColors.warning :
                                                nexusColors.emerald) + ', transparent)',
                                    transformOrigin: 'left center',
                                    transform: 'rotate(' + (Math.random() * 20 - 10) + 'deg)',
                                    opacity: 0.7,
                                    animation: 'pulse 2s infinite ' + (Math.random() * 2) + 's',
                                    '&:hover': {
                                        opacity: 1,
                                        height: 3
                                    }
                                } }, `${agent.id}-${connId}`));
                        }))), "n", agents.map((agent, index) => (_jsx(Box, { sx: {
                                position: 'absolute',
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: agent.status === 'error' ? 'radial-gradient(circle at center, ' + nexusColors.crimson + ' 0%, transparent 70%)' :
                                    agent.status === 'busy' ? 'radial-gradient(circle at center, ' + nexusColors.warning + ' 0%, transparent 70%)' :
                                        'radial-gradient(circle at center, ' + nexusColors.emerald + ' 0%, transparent 70%)',
                                border: '2px solid' + (agent.status === 'error' ? nexusColors.crimson :
                                    agent.status === 'busy' ? nexusColors.warning : nexusColors.emerald),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transform: 'translate(-50%, -50%)',
                                left: '50%',
                                top: '50%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translate(-50%, -50%) scale(1.2)',
                                    boxShadow: '0 0 20px ' + (agent.status === 'error' ? nexusColors.crimson :
                                        agent.status === 'busy' ? nexusColors.warning : nexusColors.emerald)
                                },
                                ...getAgentPosition(index, agents.length)
                            }, onClick: () => setSelectedAgent(agent), children: _jsxs(Typography, { sx: {
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    textAlign: 'center',
                                    textShadow: '0 0 5px black',
                                    fontWeight: 'bold'
                                }, children: [agent.name.split(' ')[0], "n                "] }) }, agent.id))), "n          "] }), selectedAgent && (_jsxs(Box, { sx: {
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxWidth: 600,
                        maxHeight: '80vh',
                        bgcolor: 'rgba(10, 15, 20, 0.9)',
                        border: '1px solid' + (selectedAgent.status === 'error' ? nexusColors.crimson :
                            selectedAgent.status === 'busy' ? nexusColors.warning : nexusColors.emerald),
                        borderRadius: 2,
                        p: 3,
                        boxShadow: '0 0 30px ' + (selectedAgent.status === 'error' ? nexusColors.crimson + '40' :
                            selectedAgent.status === 'busy' ? nexusColors.warning + '40' : nexusColors.emerald + '40'),
                        zIndex: 9999,
                        backdropFilter: 'blur(10px)',
                        overflow: 'auto'
                    }, children: [_jsxs(Box, { sx: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3
                            }, children: [_jsxs(Typography, { variant: "h4", sx: {
                                        background: 'linear-gradient(90deg, ' +
                                            (selectedAgent.status === 'error' ? nexusColors.crimson :
                                                selectedAgent.status === 'busy' ? nexusColors.warning : nexusColors.emerald) +
                                            ', ' + nexusColors.quantum + '),,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }, children: [selectedAgent.name, "n                "] }), _jsx(IconButton, { onClick: () => setSelectedAgent(null), sx: {
                                        color: nexusColors.crimson,
                                        border: '1px solid' + nexusColors.crimson
                                    }, children: _jsx(CloseIcon, {}) })] }), _jsxs(Box, { sx: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 3,
                                mb: 3
                            }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7
                                            }, children: "\u0421\u0442\u0430\u0442\u0443\u0441:n                  " }), _jsxs(Typography, { variant: "h5", sx: {
                                                color: selectedAgent.status === 'error' ? nexusColors.crimson :
                                                    selectedAgent.status === 'busy' ? nexusColors.warning : nexusColors.emerald
                                            }, children: [selectedAgent.status.toUpperCase(), "n                  "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7
                                            }, children: "\u0422\u0438\u043F:n                  " }), _jsxs(Typography, { variant: "h5", sx: {
                                                color: nexusColors.frost
                                            }, children: [selectedAgent.type.toUpperCase(), "n                  "] })] })] }), selectedAgent.currentTask && (_jsxs(Box, { sx: {
                                mb: 3,
                                p: 2,
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 1
                            }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                        color: nexusColors.frost,
                                        mb: 1
                                    }, children: "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0437\u0430\u0434\u0430\u0447\u0430:n                  " }), _jsxs(Typography, { variant: "body1", sx: {
                                        color: nexusColors.frost
                                    }, children: [selectedAgent.currentTask, "n                  "] })] })), "n", _jsxs(Box, { sx: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 2,
                                mb: 3
                            }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7
                                            }, children: "\u0415\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C:n                  " }), _jsx(LinearProgress, { variant: "determinate", value: selectedAgent.efficiency, sx: {
                                                height: 10,
                                                borderRadius: 5,
                                                mt: 1,
                                                '& .MuiLinearProgress-bar': {
                                                    background: 'linear-gradient(90deg, ' + nexusColors.emerald + ', ' + nexusColors.sapphire + '),,
                                                    borderRadius: 5
                                                }
                                            } }), _jsxs(Typography, { variant: "body1", sx: {
                                                color: nexusColors.frost,
                                                mt: 1
                                            }, children: [selectedAgent.efficiency, "%n                  "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7
                                            }, children: "\u0412\u0438\u043A\u043E\u043D\u0430\u043D\u043E \u0437\u0430\u0434\u0430\u0447:n                  " }), _jsxs(Typography, { variant: "h3", sx: {
                                                color: nexusColors.frost,
                                                textAlign: 'center'
                                            }, children: [selectedAgent.tasksCompleted, "n                  "] })] })] }), _jsxs(Box, { sx: {
                                mb: 3
                            }, children: [_jsx(Typography, { variant: "subtitle1", sx: {
                                        color: nexusColors.frost,
                                        mb: 1
                                    }, children: "\u0417\u0454\u0434\u043D\u0430\u043D\u043D\u044F:n                " }), _jsx(Box, { sx: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1
                                    }, children: selectedAgent.connections.map(connId => {
                                        const connAgent = agents.find(a => a.id === connId);
                                        if (!connAgent)
                                            return null;
                                        return (_jsx(Chip, { label: connAgent.name, sx: {
                                                bgcolor: 'rgba(0, 180, 255, 0.1)',
                                                color: nexusColors.sapphire,
                                                border: '1px solid' + nexusColors.sapphire,
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 180, 255, 0.2)'
                                                }
                                            }, onClick: () => setSelectedAgent(connAgent) }, connId));
                                    }) })] }), _jsxs(Typography, { variant: "caption", sx: {
                                display: 'block',
                                color: nexusColors.frost,
                                opacity: 0.7,
                                textAlign: 'right'
                            }, children: ["\u041E\u0441\u0442\u0430\u043D\u043D\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", selectedAgent.lastActivity.toLocaleTimeString(), "n              "] })] })), "n        "] })), "n", "const getAgentPosition = (index: number, total: number) => ", , "const angle = (index / total) * Math.PI * 2; const distance = Math.min(300, Math.max(200, window.innerWidth / 4)); return ", left, ": 'calc(50% + ' + (Math.cos(angle) * distance) + 'px)', top: 'calc(50% + ' + (Math.sin(angle) * distance) + 'px)' }; };", _jsxs(Box, { sx: {
                position: 'fixed',
                bottom: 70,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                zIndex: 1000
            }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(PsychologyIcon, {}), onClick: () => setShowAgentPanel(!showAgentPanel), sx: {
                        bgcolor: showAgentPanel ? nexusColors.emerald : nexusColors.darkMatter,
                        '&:hover': { bgcolor: showAgentPanel ? nexusColors.emerald : nexusColors.obsidian },
                        border: '1px solid' + nexusColors.quantum
                    }, children: "\u0410\u0433\u0435\u043D\u0442\u0438" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AssignmentIcon, {}), onClick: () => setShowTaskPanel(!showTaskPanel), sx: {
                        bgcolor: showTaskPanel ? nexusColors.sapphire : nexusColors.darkMatter,
                        '&:hover': { bgcolor: showTaskPanel ? nexusColors.sapphire : nexusColors.obsidian },
                        border: '1px solid' + nexusColors.quantum
                    }, children: "\u0417\u0430\u0434\u0430\u0447\u0456" }), _jsx(Button, { variant: "contained", startIcon: _jsx(SettingsInputComponentIcon, {}), onClick: () => setShowProcessPanel(!showProcessPanel), sx: {
                        bgcolor: showProcessPanel ? nexusColors.amethyst : nexusColors.darkMatter,
                        '&:hover': { bgcolor: showProcessPanel ? nexusColors.amethyst : nexusColors.obsidian },
                        border: '1px solid' + nexusColors.quantum
                    }, children: "\u041F\u0440\u043E\u0446\u0435\u0441\u0438" })] }), showProcessPanel && (_jsxs(Box, { sx: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                p: 4,
                overflow: 'auto',
                backdropFilter: 'blur(5px)'
            }, children: [_jsxs(Box, { sx: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }, children: [_jsx(Typography, { variant: "h4", sx: {
                                background: 'linear-gradient(90deg, ' + nexusColors.warning + ', ' + nexusColors.crimson + '),,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }, children: "\u0421\u0418\u0421\u0422\u0415\u041C\u041D\u0406 \u041F\u0420\u041E\u0426\u0415\u0421\u0418" }), _jsx(IconButton, { onClick: () => setShowProcessPanel(false), sx: {
                                color: nexusColors.crimson,
                                border: '1px solid' + nexusColors.crimson
                            }, children: _jsx(CloseIcon, {}) })] }), _jsx(Box, { sx: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 3,
                        mb: 4
                    }, children: processes.map(process => (_jsxs(Paper, { sx: {
                            p: 2,
                            background: 'rgba(20, 25, 30, 0.8)',
                            border: '1px solid' + (process.status === 'error' ? nexusColors.crimson :
                                process.status === 'running' ? nexusColors.emerald :
                                    process.status === 'paused' ? nexusColors.warning : nexusColors.quantum),
                            borderRadius: 2,
                            boxShadow: '0 0 15px ' + (process.status === 'error' ? nexusColors.crimson + '40' :
                                process.status === 'running' ? nexusColors.emerald + '40' :
                                    process.status === 'paused' ? nexusColors.warning + '40' : nexusColors.quantum + '40')
                        }, children: [_jsxs(Box, { sx: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 1
                                }, children: [_jsxs(Typography, { variant: "h6", sx: {
                                            color: process.status === 'error' ? nexusColors.crimson :
                                                process.status === 'running' ? nexusColors.emerald :
                                                    process.status === 'paused' ? nexusColors.warning : nexusColors.frost
                                        }, children: [process.name, "n                    ", _jsxs(Typography, { variant: "caption", sx: {
                                                    display: 'block',
                                                    color: nexusColors.frost,
                                                    opacity: 0.7
                                                }, children: [process.id, "n                    "] })] }), _jsx(Chip, { label: process.status.toUpperCase(), size: "small", sx: {
                                            bgcolor: process.status === 'error' ? nexusColors.crimson + '20' :
                                                process.status === 'running' ? nexusColors.emerald + '20' :
                                                    process.status === 'paused' ? nexusColors.warning + '20' : nexusColors.quantum + '20',
                                            color: process.status === 'error' ? nexusColors.crimson :
                                                process.status === 'running' ? nexusColors.emerald :
                                                    process.status === 'paused' ? nexusColors.warning : nexusColors.frost,
                                            border: '1px solid' + (process.status === 'error' ? nexusColors.crimson :
                                                process.status === 'running' ? nexusColors.emerald :
                                                    process.status === 'paused' ? nexusColors.warning : nexusColors.quantum)
                                        } })] }), _jsxs(Box, { sx: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 1,
                                    mt: 2
                                }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                    display: 'block',
                                                    color: nexusColors.frost,
                                                    opacity: 0.7
                                                }, children: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F \u0426\u041F:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                    color: process.cpuUsage > 80 ? nexusColors.crimson :
                                                        process.cpuUsage > 50 ? nexusColors.warning : nexusColors.emerald
                                                }, children: [process.cpuUsage, "%n                    "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                    display: 'block',
                                                    color: nexusColors.frost,
                                                    opacity: 0.7
                                                }, children: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u043D\u043D\u044F \u043F\u0430\u043C\u044F\u0442\u0456:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                    color: process.memoryUsage > 80 ? nexusColors.crimson :
                                                        process.memoryUsage > 50 ? nexusColors.warning : nexusColors.emerald
                                                }, children: [process.memoryUsage, "%n                    "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                    display: 'block',
                                                    color: nexusColors.frost,
                                                    opacity: 0.7
                                                }, children: "\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u043D\u0430 \u0437\u0434\u0430\u0442\u043D\u0456\u0441\u0442\u044C:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                    color: nexusColors.sapphire
                                                }, children: [process.throughput, " MB/sn                    "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                    display: 'block',
                                                    color: nexusColors.frost,
                                                    opacity: 0.7
                                                }, children: "\u0417\u0430\u0442\u0440\u0438\u043C\u043A\u0430:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                    color: process.latency > 100 ? nexusColors.crimson :
                                                        process.latency > 50 ? nexusColors.warning : nexusColors.emerald
                                                }, children: [process.latency, "msn                    "] })] })] }), _jsxs(Box, { sx: {
                                    mt: 2,
                                    pt: 1,
                                    borderTop: '1px solid' + nexusColors.quantum
                                }, children: [_jsx(Typography, { variant: "caption", sx: {
                                            display: 'block',
                                            color: nexusColors.frost,
                                            opacity: 0.7,
                                            mb: 0.5
                                        }, children: "\u0427\u0430\u0441 \u0440\u043E\u0431\u043E\u0442\u0438:n                  " }), _jsxs(Typography, { variant: "body2", sx: {
                                            color: nexusColors.frost
                                        }, children: [Math.floor((Date.now() - process.startTime.getTime()) / (1000 * 60 * 60)), " \u0433\u043E\u0434.", Math.floor((Date.now() - process.startTime.getTime()) / (1000 * 60)) % 60, " \u0445\u0432."] })] })] }, process.id))) }), _jsx(Typography, { variant: "h6", sx: {
                        mt: 4,
                        mb: 2,
                        color: nexusColors.frost
                    }, children: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0456\u0432" }), _jsx(Box, { sx: {
                        height: 300,
                        background: 'rgba(20, 25, 30, 0.7)',
                        border: '1px solid' + nexusColors.quantum,
                        borderRadius: 2,
                        p: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }, children: _jsx(Box, { sx: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: nexusColors.frost,
                            opacity: 0.3
                        }, children: _jsx(Typography, { variant: "h5", children: "\u0422\u0423\u0422 \u0411\u0423\u0414\u0415 \u0412\u0406\u0417\u0423\u0410\u041B\u0406\u0417\u0410\u0426\u0406\u042F \u041F\u0420\u041E\u0414\u0423\u041A\u0422\u0418\u0412\u041D\u041E\u0421\u0422\u0406" }) }) })] })), "n", showTaskPanel && (_jsxs(Box, { sx: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                p: 4,
                overflow: 'auto',
                backdropFilter: 'blur(5px)'
            }, children: [_jsxs(Box, { sx: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }, children: [_jsx(Typography, { variant: "h4", sx: {
                                background: 'linear-gradient(90deg, ' + nexusColors.amethyst + ', ' + nexusColors.quantum + '),,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }, children: "\u0421\u0418\u0421\u0422\u0415\u041C\u041D\u0406 \u0417\u0410\u0414\u0410\u0427\u0406" }), _jsx(IconButton, { onClick: () => setShowTaskPanel(false), sx: {
                                color: nexusColors.crimson,
                                border: '1px solid' + nexusColors.crimson
                            }, children: _jsx(CloseIcon, {}) })] }), _jsxs(Box, { sx: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 3,
                        mb: 4
                    }, children: [tasks.map(task => (_jsxs(Paper, { sx: {
                                p: 2,
                                background: 'rgba(20, 25, 30, 0.8)',
                                border: '1px solid' + (task.priority === 'critical' ? nexusColors.crimson :
                                    task.priority === 'high' ? nexusColors.warning :
                                        task.priority === 'medium' ? nexusColors.sapphire : nexusColors.quantum),
                                borderRadius: 2,
                                boxShadow: '0 0 15px ' + (task.priority === 'critical' ? nexusColors.crimson + '40' :
                                    task.priority === 'high' ? nexusColors.warning + '40' :
                                        task.priority === 'medium' ? nexusColors.sapphire + '40' : nexusColors.quantum + '40')
                            }, children: [_jsxs(Box, { sx: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1
                                    }, children: [_jsxs(Typography, { variant: "h6", sx: {
                                                color: task.priority === 'critical' ? nexusColors.crimson :
                                                    task.priority === 'high' ? nexusColors.warning :
                                                        task.priority === 'medium' ? nexusColors.sapphire : nexusColors.frost
                                            }, children: [task.title, "n                    ", _jsxs(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        color: nexusColors.frost,
                                                        opacity: 0.7
                                                    }, children: [task.id, "n                    "] })] }), _jsx(Chip, { label: task.status.toUpperCase(), size: "small", sx: {
                                                bgcolor: task.status === 'failed' ? nexusColors.crimson + '20' :
                                                    task.status === 'in_progress' ? nexusColors.warning + '20' :
                                                        task.status === 'completed' ? nexusColors.emerald + '20' : nexusColors.quantum + '20',
                                                color: task.status === 'failed' ? nexusColors.crimson :
                                                    task.status === 'in_progress' ? nexusColors.warning :
                                                        task.status === 'completed' ? nexusColors.emerald : nexusColors.frost,
                                                border: '1px solid' + (task.status === 'failed' ? nexusColors.crimson :
                                                    task.status === 'in_progress' ? nexusColors.warning :
                                                        task.status === 'completed' ? nexusColors.emerald : nexusColors.quantum)
                                            } })] }), _jsxs(Typography, { variant: "body2", sx: {
                                        mt: 1,
                                        mb: 2,
                                        color: nexusColors.frost,
                                        opacity: 0.8
                                    }, children: [task.description, "n                "] }), _jsxs(Box, { sx: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: 1,
                                        mt: 2
                                    }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        color: nexusColors.frost,
                                                        opacity: 0.7
                                                    }, children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441:n                    " }), _jsx(LinearProgress, { variant: "determinate", value: task.progress, sx: {
                                                        height: 6,
                                                        borderRadius: 3,
                                                        mt: 0.5,
                                                        '& .MuiLinearProgress-bar': {
                                                            background: task.status === 'completed' ? 'linear-gradient(90deg, ' + nexusColors.emerald + ', ' + nexusColors.sapphire + '): 
                                                                :
                                                            ,
                                                            task, : .status === 'in_progress' ? 'linear-gradient(90deg, ' + nexusColors.warning + ', ' + nexusColors.amethyst + '): 
                                                                :
                                                            ,
                                                            'linear-gradient(90deg, ': +nexusColors.crimson + ', ' + nexusColors.quantum + '),,
                                                            borderRadius: 3
                                                        }
                                                    } }), _jsxs(Typography, { variant: "body2", sx: {
                                                        color: nexusColors.frost,
                                                        mt: 0.5
                                                    }, children: [task.progress, "%n                    "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        color: nexusColors.frost,
                                                        opacity: 0.7
                                                    }, children: "\u041F\u0440\u0438\u0437\u043D\u0430\u0447\u0435\u043D\u043E:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                        color: nexusColors.frost
                                                    }, children: [task.assignedTo || 'Не призначено', "n                    "] })] })] }), task.dependencies.length > 0 && (_jsxs(Box, { sx: {
                                        mt: 2,
                                        pt: 1,
                                        borderTop: '1px solid' + nexusColors.quantum
                                    }, children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7,
                                                mb: 0.5
                                            }, children: "\u0417\u0430\u043B\u0435\u0436\u043D\u043E\u0441\u0442\u0456:n                    " }), _jsxs(Box, { sx: {
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 0.5
                                            }, children: [task.dependencies.map(depId => (_jsx(Chip, { label: depId, size: "small", sx: {
                                                        bgcolor: 'rgba(255, 100, 0, 0.1)',
                                                        color: nexusColors.warning,
                                                        border: '1px solid' + nexusColors.warning
                                                    } }, depId))), "n                    "] })] })), "n              "] }, task.id))), "n          "] })] })), "n", showAgentPanel && (_jsxs(Box, { sx: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                p: 4,
                overflow: 'auto',
                backdropFilter: 'blur(5px)'
            }, children: [_jsxs(Box, { sx: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }, children: [_jsx(Typography, { variant: "h4", sx: {
                                background: 'linear-gradient(90deg, ' + nexusColors.emerald + ', ' + nexusColors.sapphire + '),,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }, children: "\u041C\u0415\u0420\u0415\u0416\u0410 \u0410\u0413\u0415\u041D\u0422\u0406\u0412" }), _jsx(IconButton, { onClick: () => setShowAgentPanel(false), sx: {
                                color: nexusColors.crimson,
                                border: '1px solid' + nexusColors.crimson
                            }, children: _jsx(CloseIcon, {}) })] }), _jsxs(Box, { sx: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 3,
                        mb: 4
                    }, children: [agents.map(agent => (_jsxs(Paper, { sx: {
                                p: 2,
                                background: 'rgba(20, 25, 30, 0.8)',
                                border: '1px solid' + (agent.status === 'error' ? nexusColors.crimson :
                                    agent.status === 'busy' ? nexusColors.warning :
                                        agent.status === 'active' ? nexusColors.emerald : nexusColors.quantum),
                                borderRadius: 2,
                                boxShadow: '0 0 15px ' + (agent.status === 'error' ? nexusColors.crimson + '40' :
                                    agent.status === 'busy' ? nexusColors.warning + '40' :
                                        agent.status === 'active' ? nexusColors.emerald + '40' : nexusColors.quantum + '40')
                            }, children: [_jsxs(Box, { sx: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1
                                    }, children: [_jsxs(Typography, { variant: "h6", sx: {
                                                color: agent.status === 'error' ? nexusColors.crimson :
                                                    agent.status === 'busy' ? nexusColors.warning :
                                                        agent.status === 'active' ? nexusColors.emerald : nexusColors.frost
                                            }, children: [agent.name, "n                    ", _jsxs(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        color: nexusColors.frost,
                                                        opacity: 0.7
                                                    }, children: [agent.id, "n                    "] })] }), _jsx(Chip, { label: agent.status.toUpperCase(), size: "small", sx: {
                                                bgcolor: agent.status === 'error' ? nexusColors.crimson + '20' :
                                                    agent.status === 'busy' ? nexusColors.warning + '20' :
                                                        agent.status === 'active' ? nexusColors.emerald + '20' : nexusColors.quantum + '20',
                                                color: agent.status === 'error' ? nexusColors.crimson :
                                                    agent.status === 'busy' ? nexusColors.warning :
                                                        agent.status === 'active' ? nexusColors.emerald : nexusColors.frost,
                                                border: '1px solid' + (agent.status === 'error' ? nexusColors.crimson :
                                                    agent.status === 'busy' ? nexusColors.warning :
                                                        agent.status === 'active' ? nexusColors.emerald : nexusColors.quantum)
                                            } })] }), agent.currentTask && (_jsxs(Box, { sx: {
                                        mt: 1,
                                        mb: 2,
                                        p: 1,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 1
                                    }, children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7
                                            }, children: "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0437\u0430\u0434\u0430\u0447\u0430:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                color: nexusColors.frost
                                            }, children: [agent.currentTask, "n                    "] })] })), "n", _jsxs(Box, { sx: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: 1,
                                        mt: 2
                                    }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        color: nexusColors.frost,
                                                        opacity: 0.7
                                                    }, children: "\u0415\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                        color: agent.efficiency > 90 ? nexusColors.emerald :
                                                            agent.efficiency > 70 ? nexusColors.warning : nexusColors.crimson
                                                    }, children: [agent.efficiency, "%n                    "] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: {
                                                        display: 'block',
                                                        color: nexusColors.frost,
                                                        opacity: 0.7
                                                    }, children: "\u0417\u0430\u0434\u0430\u0447 \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043E:n                    " }), _jsxs(Typography, { variant: "body2", sx: {
                                                        color: nexusColors.frost
                                                    }, children: [agent.tasksCompleted, "n                    "] })] })] }), agent.connections.length > 0 && (_jsxs(Box, { sx: {
                                        mt: 2,
                                        pt: 1,
                                        borderTop: '1px solid' + nexusColors.quantum
                                    }, children: [_jsx(Typography, { variant: "caption", sx: {
                                                display: 'block',
                                                color: nexusColors.frost,
                                                opacity: 0.7,
                                                mb: 0.5
                                            }, children: "\u0417\u0454\u0434\u043D\u0430\u043D\u043D\u044F:n                    " }), _jsxs(Box, { sx: {
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 0.5
                                            }, children: [agent.connections.map(connId => (_jsx(Chip, { label: connId, size: "small", sx: {
                                                        bgcolor: 'rgba(0, 180, 255, 0.1)',
                                                        color: nexusColors.sapphire,
                                                        border: '1px solid' + nexusColors.sapphire
                                                    } }, connId))), "n                    "] }), "n                  "] })), "n              "] }, agent.id))), "n          "] }), _jsx(Typography, { variant: "h6", sx: {
                        mt: 4,
                        mb: 2,
                        color: nexusColors.frost
                    }, children: "\u0412\u0456\u0437\u0443\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u044F \u0437\u0432\u044F\u0437\u043A\u0456\u0432" }), _jsx(Box, { sx: {
                        height: 400,
                        background: 'rgba(20, 25, 30, 0.7)',
                        border: '1px solid' + nexusColors.quantum,
                        borderRadius: 2,
                        p: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }, children: _jsx(Box, { sx: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: nexusColors.frost,
                            opacity: 0.3
                        }, children: _jsx(Typography, { variant: "h5", children: "\u0422\u0423\u0422 \u0411\u0423\u0414\u0415 3D-\u0412\u0406\u0417\u0423\u0410\u041B\u0406\u0417\u0410\u0426\u0406\u042F \u041C\u0415\u0420\u0415\u0416\u0406 \u0410\u0413\u0415\u041D\u0422\u0406\u0412" }) }) })] })), "n", _jsxs(Box, { sx: {
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                background: 'linear-gradient(135deg, ' + nexusColors.darkMatter + ' 0%, ' + nexusColors.obsidian + ' 100%)',
                borderTop: '1px solid' + nexusColors.quantum,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                px: 2
            }, children: [_jsx(Tooltip, { title: "\u0428\u0432\u0438\u0434\u043A\u0430 \u0434\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", children: _jsx(IconButton, { sx: { color: nexusColors.emerald }, children: _jsx(AnalyticsIcon, {}) }) }), _jsx(Tooltip, { title: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0430\u0446\u0456\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0438", children: _jsx(IconButton, { sx: { color: nexusColors.sapphire }, children: _jsx(MemoryIcon, {}) }) }), _jsx(Tooltip, { title: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0435 \u043A\u043E\u043F\u0456\u044E\u0432\u0430\u043D\u043D\u044F", children: _jsx(IconButton, { sx: { color: nexusColors.amethyst }, children: _jsx(StorageIcon, {}) }) }), _jsx(Tooltip, { title: "\u0411\u0435\u0437\u043F\u0435\u043A\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0438", children: _jsx(IconButton, { sx: { color: nexusColors.crimson }, children: _jsx(SecurityIcon, {}) }) }), _jsx(Tooltip, { title: "\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u0456 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F", children: _jsx(IconButton, { sx: { color: nexusColors.warning }, children: _jsx(SettingsIcon, {}) }) })] }), _jsxs(Box, { sx: {
                position: 'absolute',
                bottom: 200,
                right: 20,
                width: 250,
                maxHeight: 150,
                background: 'rgba(10, 15, 20, 0.9)',
                border: '1px solid' + nexusColors.quantum,
                borderRadius: 2,
                p: 1,
                backdropFilter: 'blur(10px)',
                overflow: 'auto'
            }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.emerald, display: 'block', mb: 1 }, children: "\uD83D\uDCDD \u041E\u0421\u0422\u0410\u041D\u041D\u0406 \u041A\u041E\u041C\u0410\u041D\u0414\u0418" }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 0.5 }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, opacity: 0.8 }, children: "\u2022 \u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0438" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, opacity: 0.6 }, children: "\u2022 \u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0430\u0446\u0456\u044F \u0440\u0435\u0441\u0443\u0440\u0441\u0456\u0432" }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, opacity: 0.4 }, children: "\u2022 \u041F\u0435\u0440\u0435\u0432\u0456\u0440\u043A\u0430 \u0431\u0435\u0437\u043F\u0435\u043A\u0438" })] })] }), _jsxs(Box, { sx: {
                position: 'absolute',
                bottom: 100,
                left: 20,
                background: 'rgba(10, 15, 20, 0.9)',
                border: '1px solid' + nexusColors.quantum,
                borderRadius: 2,
                p: 1,
                backdropFilter: 'blur(10px)'
            }, children: [_jsx(Typography, { variant: "caption", sx: { color: nexusColors.frost, mb: 1 }, children: "\u26A1 \u0428\u0412\u0418\u0414\u041A\u0406 \u0414\u0406\u0407" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }, children: [_jsx(Tooltip, { title: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.emerald }, children: _jsx(AnalyticsIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u041E\u043F\u0442\u0438\u043C\u0456\u0437\u0430\u0446\u0456\u044F", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.sapphire }, children: _jsx(MemoryIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0411\u0435\u0437\u043F\u0435\u043A\u0430", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.crimson }, children: _jsx(SecurityIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u0420\u0435\u0437\u0435\u0440\u0432", children: _jsx(IconButton, { size: "small", sx: { color: nexusColors.warning }, children: _jsx(StorageIcon, { fontSize: "small" }) }) })] })] }), _jsxs(Box, { sx: {
                position: 'absolute',
                top: 80,
                right: 20,
                width: 300,
                background: 'rgba(10, 15, 20, 0.9)',
                border: '1px solid' + nexusColors.quantum,
                borderRadius: 2,
                p: 2,
                backdropFilter: 'blur(10px)'
            }, children: [_jsx(Typography, { variant: "subtitle2", sx: { color: nexusColors.emerald, mb: 2 }, children: "\uD83D\uDCCA \u0421\u0418\u0421\u0422\u0415\u041C\u041D\u0418\u0419 \u041C\u041E\u041D\u0406\u0422\u041E\u0420" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }, children: [_jsxs(Box, { sx: { textAlign: 'center', p: 1, background: 'rgba(0, 255, 136, 0.1)', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", children: "\u0426\u041F" }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.emerald }, children: [cpuLoad, "%"] })] }), _jsxs(Box, { sx: { textAlign: 'center', p: 1, background: 'rgba(0, 180, 255, 0.1)', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", children: "\u041F\u0430\u043C\u044F\u0442\u044C" }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.sapphire }, children: [memoryUsage, "%"] })] }), _jsxs(Box, { sx: { textAlign: 'center', p: 1, background: 'rgba(150, 0, 255, 0.1)', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", children: "\u041C\u0435\u0440\u0435\u0436\u0430" }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.amethyst }, children: [networkLoad, "%"] })] }), _jsxs(Box, { sx: { textAlign: 'center', p: 1, background: 'rgba(255, 100, 0, 0.1)', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", children: "\u0422\u0435\u043C\u043F." }), _jsx(Typography, { variant: "h6", sx: { color: nexusColors.warning }, children: "42\u00B0C" })] })] })] }), _jsxs(Box, { sx: {
                mt: 2,
                pt: 1,
                borderTop: `1px solid ${nexusColors.quantum}80`,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: nexusColors.frost,
                opacity: 0.7
            }, children: [_jsx("span", { children: "NEXUS CORE v2.4.1 | \u0413\u0456\u043F\u0435\u0440\u0440\u0435\u0430\u043B\u0456\u0441\u0442\u0438\u0447\u043D\u0438\u0439 AI-\u043F\u0440\u043E\u0432\u0456\u0434\u043D\u0438\u043A" }), _jsxs("span", { children: ["\u0421\u0422\u0410\u041D \u0421\u0418\u0421\u0422\u0415\u041C\u0418: ", _jsx("span", { style: { color: nexusColors.emerald }, children: "\u041D\u041E\u0420\u041C\u0410\u041B\u042C\u041D\u0418\u0419" })] }), _jsx("span", { children: new Date().toLocaleTimeString() })] }), _jsxs(Box, { sx: { position: 'fixed', bottom: 80, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }, children: [_jsx(Tooltip, { title: "\u0428\u0432\u0438\u0434\u043A\u0430 \u0434\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", placement: "left", children: _jsx(Fab, { size: "small", sx: { bgcolor: nexusColors.emerald, '&:hover': { bgcolor: nexusColors.emerald } }, children: _jsx(AnalyticsIcon, {}) }) }), _jsx(Tooltip, { title: "\u0421\u0438\u0441\u0442\u0435\u043C\u043D\u0438\u0439 \u0437\u0432\u0456\u0442", placement: "left", children: _jsx(Fab, { size: "small", sx: { bgcolor: nexusColors.sapphire, '&:hover': { bgcolor: nexusColors.sapphire } }, children: _jsx(DashboardIcon, {}) }) }), _jsx(Tooltip, { title: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0435 \u043A\u043E\u043F\u0456\u044E\u0432\u0430\u043D\u043D\u044F", placement: "left", children: _jsx(Fab, { size: "small", sx: { bgcolor: nexusColors.amethyst, '&:hover': { bgcolor: nexusColors.amethyst } }, children: _jsx(StorageIcon, {}) }) })] }), _jsxs(Dialog, { open: showLearningDialog, onClose: () => setShowLearningDialog(false), maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { sx: { backgroundColor: nexusColors.darkMatter, color: nexusColors.frost }, children: "\u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0435 \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F" }), _jsxs(DialogContent, { sx: { backgroundColor: nexusColors.obsidian, color: nexusColors.frost }, children: [_jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: "\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u043C\u043E\u0434\u0443\u043B\u044C \u0434\u043B\u044F \u043D\u0430\u0432\u0447\u0430\u043D\u043D\u044F:" }), _jsx(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }, children: ['Основи системи', 'AI управління', 'Моніторинг', 'Безпека', 'Розширені функції'].map(module => (_jsx(Button, { variant: "outlined", onClick: () => {
                                    startLearningMode();
                                    setShowLearningDialog(false);
                                }, sx: { borderColor: nexusColors.emerald, color: nexusColors.emerald }, children: module }, module))) })] }), _jsx(DialogActions, { sx: { backgroundColor: nexusColors.darkMatter }, children: _jsx(Button, { onClick: () => setShowLearningDialog(false), sx: { color: nexusColors.frost }, children: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438" }) })] }), _jsx(Snackbar, { open: notifications.length > 0 && showNotifications, onClose: () => setShowNotifications(false), anchorOrigin: { vertical: 'top', horizontal: 'right' }, sx: { maxWidth: 400 }, children: _jsx(Alert, { onClose: () => setShowNotifications(false), severity: notifications[0]?.type || 'info', sx: { width: '100%, backgroundColor: nexusColors.obsidian, color: nexusColors.frost }} 
                        >
                            (_jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 'bold' }, children: [notifications[0]?.title || 'Повідомлення', ")}"] })
                                ,
                                    _jsxs(Typography, { variant: "body2", children: [notifications[0]?.message || 'Нове повідомлення', ")}"] })
                                        ,
                                            _jsx(Typography, { variant: "caption", sx: { opacity: 0.7 }, children: notifications[0]?.timestamp.toLocaleTimeString() })) } }) })] })) /* Context Help Tooltip */;
{ /* Context Help Tooltip */ }
{
    contextHelp && (_jsx(Snackbar, { open: !!contextHelp, onClose: () => setContextHelp(null), anchorOrigin: { vertical: 'bottom', horizontal: 'left' }, autoHideDuration: 5000, children: _jsx(Alert, { onClose: () => setContextHelp(null), severity: "info", sx: { backgroundColor: nexusColors.obsidian, color: nexusColors.frost }, children: _jsx(Typography, { variant: "body2", children: contextHelp }) }) }));
}
_jsx(Fab, { color: "primary", sx: {
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: isListening ? nexusColors.crimson : nexusColors.emerald,
        '&:hover': {
            bgcolor: isListening ? nexusColors.crimson : nexusColors.emerald
        }
    }, onClick: startListening, disabled: isListening, children: isListening ? _jsx(MicOffIcon, {}) : _jsx(MicIcon, {}) });
Box >
;
;
;
export default SimpleCyberFace;
