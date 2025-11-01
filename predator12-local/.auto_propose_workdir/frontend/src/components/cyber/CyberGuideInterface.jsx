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
const nexusTheme_1 = require("../../theme/nexusTheme");
// Компонент голографічного ефекту
const HolographicOverlay = ({ effect, isActive }) => {
    const overlayRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!overlayRef.current || !effect.enabled || !isActive)
            return;
        const overlay = overlayRef.current;
        let animationId;
        const animate = () => {
            if (effect.glitch) {
                const glitchValue = Math.sin(Date.now() * 0.01) * 0.5;
                overlay.style.filter = `hue-rotate(${glitchValue * 10}deg) brightness(${1 + glitchValue * 0.1})`;
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationId);
    }, [effect, isActive]);
    if (!effect.enabled || !isActive)
        return null;
    return (<material_1.Box ref={overlayRef} sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: effect.scanlines ? `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
          )
        ` : 'none',
            opacity: effect.intensity / 100,
            zIndex: 1000
        }}>
      {effect.particles && (<material_1.Box sx={{
                width: '100%',
                height: '100%',
                background: `
              radial-gradient(circle at 20% 50%, rgba(0,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,0,100,0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(0,255,100,0.1) 0%, transparent 50%)
            `,
                animation: 'particleFlow 15s ease-in-out infinite'
            }}/>)}
    </material_1.Box>);
};
// Компонент кібер-обличчя
const CyberFace = ({ emotion, isSpeaking, transparency }) => {
    const canvasRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = 200;
        canvas.height = 200;
        let animationId;
        const drawFace = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const time = Date.now() * 0.003;
            // Основне кібер-обличчя
            ctx.strokeStyle = `rgba(0, 255, 255, ${transparency})`;
            ctx.lineWidth = 2;
            // Зовнішній контур
            ctx.beginPath();
            ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
            ctx.stroke();
            // Очі залежно від емоції
            const eyeGlow = isSpeaking ? Math.sin(time * 5) * 0.3 + 0.7 : 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${eyeGlow * transparency})`;
            if (emotion === 'happy') {
                // Веселі очі
                ctx.beginPath();
                ctx.arc(centerX - 25, centerY - 15, 8, 0, Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX + 25, centerY - 15, 8, 0, Math.PI);
                ctx.stroke();
            }
            else if (emotion === 'focused') {
                // Сфокусовані очі
                ctx.fillRect(centerX - 30, centerY - 20, 10, 2);
                ctx.fillRect(centerX + 20, centerY - 20, 10, 2);
            }
            else {
                // Нейтральні очі
                ctx.beginPath();
                ctx.arc(centerX - 25, centerY - 15, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + 25, centerY - 15, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            // Рот залежно від мовлення
            if (isSpeaking) {
                const mouthAnimation = Math.sin(time * 8) * 10;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY + 20, 15 + mouthAnimation, 8, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.arc(centerX, centerY + 20, 5, 0, Math.PI);
                ctx.stroke();
            }
            // Додаткові кібер-елементи
            ctx.strokeStyle = `rgba(255, 0, 100, ${transparency * 0.6})`;
            ctx.lineWidth = 1;
            // Кібер-сітка
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + time;
                const x1 = centerX + Math.cos(angle) * 60;
                const y1 = centerY + Math.sin(angle) * 60;
                const x2 = centerX + Math.cos(angle) * 90;
                const y2 = centerY + Math.sin(angle) * 90;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            animationId = requestAnimationFrame(drawFace);
        };
        drawFace();
        return () => cancelAnimationFrame(animationId);
    }, [emotion, isSpeaking, transparency]);
    return (<canvas ref={canvasRef} style={{
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))',
            borderRadius: '50%'
        }}/>);
};
// Основний компонент кібер-гіда
const CyberGuideInterface = () => {
    const [guideState, setGuideState] = (0, react_1.useState)({
        isActive: false,
        isListening: false,
        isSpeaking: false,
        currentEmotion: 'neutral',
        personality: 'friendly',
        language: 'uk',
        voiceEnabled: true,
        gestureEnabled: true,
        eyeTrackingEnabled: false,
        adaptiveMode: true,
        transparency: 0.8
    });
    const [hologramEffect, setHologramEffect] = (0, react_1.useState)({
        enabled: true,
        intensity: 60,
        particles: true,
        glitch: true,
        scanlines: true
    });
    const [settingsOpen, setSettingsOpen] = (0, react_1.useState)(false);
    const [currentMessage, setCurrentMessage] = (0, react_1.useState)('Вітаю! Я ваш кібер-гід по системі Predator Analytics.');
    // Жести
    const gestureCommands = [
        {
            name: 'Подвійний клік',
            pattern: 'double-tap',
            action: () => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isActive: !prev.isActive }))),
            description: 'Активувати/деактивувати гіда'
        },
        {
            name: 'Свайп вправо',
            pattern: 'swipe-right',
            action: () => setCurrentMessage('Переходжу до наступного модуля...'),
            description: 'Наступний модуль'
        },
        {
            name: 'Тривале натискання',
            pattern: 'long-press',
            action: () => setSettingsOpen(true),
            description: 'Відкрити налаштування'
        }
    ];
    // Голосові команди
    const voiceCommands = [
        { command: 'привіт', action: () => setCurrentMessage('Привіт! Чим можу допомогти?') },
        { command: 'допомога', action: () => setCurrentMessage('Ось список доступних команд...') },
        { command: 'статус', action: () => setCurrentMessage('Система працює в оптимальному режимі') },
        { command: 'налаштування', action: () => setSettingsOpen(true) }
    ];
    // Адаптивні підказки
    const adaptiveHints = [
        'Спробуйте подвійний клік для активації гіда',
        'Використовуйте голосові команди для кращого контролю',
        'Налаштуйте прозорість для комфортного використання',
        'Увімкніть жести для інтуїтивного управління'
    ];
    const [currentHint, setCurrentHint] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (guideState.adaptiveMode) {
            const interval = setInterval(() => {
                setCurrentHint(prev => (prev + 1) % adaptiveHints.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [guideState.adaptiveMode]);
    // Симуляція голосового синтезу
    const speak = (text) => {
        if (!guideState.voiceEnabled)
            return;
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { isSpeaking: true })));
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = guideState.language === 'uk' ? 'uk-UA' : 'en-US';
            utterance.onend = () => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isSpeaking: false })));
            speechSynthesis.speak(utterance);
        }
        else {
            setTimeout(() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isSpeaking: false }))), 2000);
        }
    };
    // Симуляція розпізнавання голосу
    const startListening = () => {
        if (!guideState.voiceEnabled)
            return;
        setGuideState(prev => (Object.assign(Object.assign({}, prev), { isListening: true })));
        // Симуляція
        setTimeout(() => {
            setGuideState(prev => (Object.assign(Object.assign({}, prev), { isListening: false })));
            setCurrentMessage('Команду розпізнано успішно!');
            speak('Команду розпізнано успішно!');
        }, 3000);
    };
    if (!guideState.isActive) {
        return (<material_1.Fab color="primary" onClick={() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isActive: true })))} sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.emerald}, ${nexusTheme_1.nexusColors.sapphire})`,
                '&:hover': {
                    background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.sapphire}, ${nexusTheme_1.nexusColors.emerald})`,
                    transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease',
                zIndex: 1000
            }}>
        <icons_material_1.Psychology />
      </material_1.Fab>);
    }
    return (<>
      <HolographicOverlay effect={hologramEffect} isActive={guideState.isActive}/>

      <framer_motion_1.AnimatePresence>
        {guideState.isActive && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8, x: 100 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 100 }} transition={{ duration: 0.5, ease: 'easeInOut' }} style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1001
            }}>
            <material_1.Paper elevation={24} sx={{
                p: 3,
                background: `linear-gradient(135deg,
                  rgba(0, 20, 40, ${guideState.transparency}) 0%,
                  rgba(0, 10, 30, ${guideState.transparency}) 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid rgba(0, 255, 255, 0.3)`,
                borderRadius: '20px',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 0 0 1px rgba(0, 255, 255, 0.2)
                `,
                minWidth: 320,
                maxWidth: 400
            }}>
              {/* Заголовок з аватаром */}
              <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <material_1.Avatar sx={{
                background: 'transparent',
                border: `2px solid ${nexusTheme_1.nexusColors.emerald}`,
                mr: 2
            }}>
                  <CyberFace emotion={guideState.currentEmotion} isSpeaking={guideState.isSpeaking} transparency={guideState.transparency}/>
                </material_1.Avatar>

                <material_1.Box sx={{ flex: 1 }}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                    Кібер-Гід NEXUS
                  </material_1.Typography>
                  <material_1.Chip size="small" label={guideState.personality} sx={{
                background: `rgba(0, 255, 255, 0.2)`,
                color: nexusTheme_1.nexusColors.emerald,
                fontSize: '0.7rem'
            }}/>
                </material_1.Box>

                <material_1.Box>
                  <material_1.Tooltip title="Налаштування">
                    <material_1.IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                      <icons_material_1.Settings />
                    </material_1.IconButton>
                  </material_1.Tooltip>

                  <material_1.Tooltip title="Закрити">
                    <material_1.IconButton size="small" onClick={() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isActive: false })))} sx={{ color: nexusTheme_1.nexusColors.sapphire }}>
                      <icons_material_1.Close />
                    </material_1.IconButton>
                  </material_1.Tooltip>
                </material_1.Box>
              </material_1.Box>

              {/* Повідомлення */}
              <material_1.Paper sx={{
                p: 2,
                mb: 2,
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                borderRadius: '10px'
            }}>
                <material_1.Typography variant="body2" sx={{
                color: nexusTheme_1.nexusColors.frost,
                lineHeight: 1.5,
                animation: guideState.isSpeaking ? 'pulse 1s ease-in-out infinite' : 'none'
            }}>
                  {currentMessage}
                </material_1.Typography>
              </material_1.Paper>

              {/* Адаптивні підказки */}
              {guideState.adaptiveMode && (<material_1.Box sx={{ mb: 2 }}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, mb: 1, display: 'block' }}>
                    💡 Підказка:
                  </material_1.Typography>
                  <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost, fontSize: '0.8rem' }}>
                    {adaptiveHints[currentHint]}
                  </material_1.Typography>
                </material_1.Box>)}

              {/* Контроли */}
              <material_1.Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <material_1.Tooltip title={guideState.voiceEnabled ? "Вимкнути голос" : "Увімкнути голос"}>
                  <material_1.IconButton color={guideState.voiceEnabled ? "primary" : "default"} onClick={() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { voiceEnabled: !prev.voiceEnabled })))} sx={{
                background: guideState.voiceEnabled ? 'rgba(0, 255, 255, 0.2)' : 'transparent'
            }}>
                    {guideState.voiceEnabled ? <icons_material_1.VolumeUp /> : <icons_material_1.VolumeOff />}
                  </material_1.IconButton>
                </material_1.Tooltip>

                <material_1.Tooltip title={guideState.isListening ? "Зупинити прослуховування" : "Почати прослуховування"}>
                  <material_1.IconButton color={guideState.isListening ? "secondary" : "default"} onClick={guideState.isListening ? () => setGuideState(prev => (Object.assign(Object.assign({}, prev), { isListening: false }))) : startListening} sx={{
                background: guideState.isListening ? 'rgba(255, 0, 100, 0.2)' : 'transparent',
                animation: guideState.isListening ? 'pulse 1s ease-in-out infinite' : 'none'
            }}>
                    {guideState.isListening ? <icons_material_1.MicOff /> : <icons_material_1.Mic />}
                  </material_1.IconButton>
                </material_1.Tooltip>

                <material_1.Tooltip title={guideState.gestureEnabled ? "Вимкнути жести" : "Увімкнути жести"}>
                  <material_1.IconButton color={guideState.gestureEnabled ? "primary" : "default"} onClick={() => setGuideState(prev => (Object.assign(Object.assign({}, prev), { gestureEnabled: !prev.gestureEnabled })))} sx={{
                background: guideState.gestureEnabled ? 'rgba(0, 255, 255, 0.2)' : 'transparent'
            }}>
                    <icons_material_1.Gesture />
                  </material_1.IconButton>
                </material_1.Tooltip>

                <material_1.Tooltip title="Говорити повідомлення">
                  <material_1.IconButton onClick={() => speak(currentMessage)} disabled={guideState.isSpeaking} sx={{ color: nexusTheme_1.nexusColors.emerald }}>
                    <icons_material_1.RecordVoiceOver />
                  </material_1.IconButton>
                </material_1.Tooltip>
              </material_1.Box>
            </material_1.Paper>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Панель налаштувань */}
      <material_1.Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(135deg,
              rgba(0, 20, 40, 0.95) 0%,
              rgba(0, 10, 30, 0.95) 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid rgba(0, 255, 255, 0.3)`,
            }
        }}>
        <material_1.DialogContent>
          <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.emerald, mb: 3 }}>
            Налаштування Кібер-Гіда
          </material_1.Typography>

          <material_1.Box sx={{ mb: 3 }}>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Прозорість: {Math.round(guideState.transparency * 100)}%
            </material_1.Typography>
            <material_1.Slider value={guideState.transparency} onChange={(_, value) => setGuideState(prev => (Object.assign(Object.assign({}, prev), { transparency: value })))} min={0.2} max={1} step={0.1} sx={{
            color: nexusTheme_1.nexusColors.emerald,
            '& .MuiSlider-thumb': {
                background: nexusTheme_1.nexusColors.emerald
            }
        }}/>
          </material_1.Box>

          <material_1.Box sx={{ mb: 3 }}>
            <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 2 }}>
              Інтенсивність голограми: {hologramEffect.intensity}%
            </material_1.Typography>
            <material_1.Slider value={hologramEffect.intensity} onChange={(_, value) => setHologramEffect(prev => (Object.assign(Object.assign({}, prev), { intensity: value })))} min={0} max={100} step={10} sx={{
            color: nexusTheme_1.nexusColors.sapphire,
            '& .MuiSlider-thumb': {
                background: nexusTheme_1.nexusColors.sapphire
            }
        }}/>
          </material_1.Box>

          <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <material_1.FormControlLabel control={<material_1.Switch checked={guideState.adaptiveMode} onChange={(e) => setGuideState(prev => (Object.assign(Object.assign({}, prev), { adaptiveMode: e.target.checked })))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: nexusTheme_1.nexusColors.emerald } }}/>} label="Адаптивний режим" sx={{ color: nexusTheme_1.nexusColors.frost }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={hologramEffect.particles} onChange={(e) => setHologramEffect(prev => (Object.assign(Object.assign({}, prev), { particles: e.target.checked })))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: nexusTheme_1.nexusColors.emerald } }}/>} label="Частинки голограми" sx={{ color: nexusTheme_1.nexusColors.frost }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={hologramEffect.glitch} onChange={(e) => setHologramEffect(prev => (Object.assign(Object.assign({}, prev), { glitch: e.target.checked })))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: nexusTheme_1.nexusColors.emerald } }}/>} label="Глітч ефекти" sx={{ color: nexusTheme_1.nexusColors.frost }}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={guideState.eyeTrackingEnabled} onChange={(e) => setGuideState(prev => (Object.assign(Object.assign({}, prev), { eyeTrackingEnabled: e.target.checked })))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: nexusTheme_1.nexusColors.emerald } }}/>} label="Відстеження погляду (експериментально)" sx={{ color: nexusTheme_1.nexusColors.frost }}/>
          </material_1.Box>
        </material_1.DialogContent>
      </material_1.Dialog>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes particleFlow {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          33% { transform: translateX(30px) translateY(-20px) rotate(120deg); }
          66% { transform: translateX(-20px) translateY(30px) rotate(240deg); }
        }
      `}</style>
    </>);
};
exports.default = CyberGuideInterface;
