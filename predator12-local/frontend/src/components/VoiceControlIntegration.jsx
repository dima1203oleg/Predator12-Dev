"use strict";
/**
 * 🎤 Voice Control Integration Component
 * Інтеграція голосового керування в основному інтерфейсі
 * Частина Premium FREE Voice System Predator12 Nexus Core V5.2
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const voiceProvidersAPI_1 = require("../services/voiceProvidersAPI");
const premiumFreeVoiceAPI_1 = require("../services/premiumFreeVoiceAPI");
const VoiceProvidersAdmin_1 = __importDefault(require("./voice/VoiceProvidersAdmin"));
const VoiceControlIntegration = ({ onVoiceCommand, onVoiceResponse, enabled = true }) => {
    const [status, setStatus] = (0, react_1.useState)({
        backend_available: false,
        voice_api_available: false,
        current_tts_provider: 'unknown',
        current_stt_provider: 'unknown',
        settings: null,
        last_check: new Date()
    });
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const [adminOpen, setAdminOpen] = (0, react_1.useState)(false);
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    // Перевірка статусу при завантаженні
    (0, react_1.useEffect)(() => {
        const checkStatus = () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('🎤 Перевірка статусу голосової системи...');
            try {
                // Перевірка backend API
                const backendHealth = yield voiceProvidersAPI_1.voiceProvidersAPI.checkHealth();
                const backendAvailable = backendHealth.status === 'healthy';
                // Перевірка Voice API
                const voiceApiAvailable = yield premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.checkHealth();
                let settings = null;
                let currentTTS = 'unknown';
                let currentSTT = 'unknown';
                if (backendAvailable) {
                    try {
                        settings = yield voiceProvidersAPI_1.voiceProvidersAPI.getSettings();
                        currentTTS = settings.default_tts_provider;
                        currentSTT = settings.default_stt_provider;
                    }
                    catch (error) {
                        console.warn('⚠️ Не вдалося завантажити налаштування:', error);
                    }
                }
                else if (voiceApiAvailable) {
                    // Fallback до Voice API
                    try {
                        const capabilities = yield premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.getCapabilities();
                        currentTTS = capabilities.recommended_tts;
                        currentSTT = capabilities.recommended_stt;
                    }
                    catch (error) {
                        console.warn('⚠️ Не вдалося отримати можливості Voice API:', error);
                    }
                }
                setStatus({
                    backend_available: backendAvailable,
                    voice_api_available: voiceApiAvailable,
                    current_tts_provider: currentTTS,
                    current_stt_provider: currentSTT,
                    settings,
                    last_check: new Date()
                });
                console.log('✅ Статус голосової системи оновлено:', {
                    backend: backendAvailable ? '✅' : '❌',
                    voiceAPI: voiceApiAvailable ? '✅' : '❌',
                    tts: currentTTS,
                    stt: currentSTT
                });
            }
            catch (error) {
                console.error('❌ Помилка перевірки статусу:', error);
                setStatus(prev => (Object.assign(Object.assign({}, prev), { backend_available: false, voice_api_available: false, last_check: new Date() })));
            }
        });
        checkStatus();
        // Періодична перевірка кожні 30 секунд
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);
    // Визначення статусу підключення
    const getConnectionStatus = () => {
        if (status.backend_available && status.voice_api_available) {
            return {
                status: 'connected',
                icon: icons_material_1.CheckCircle,
                color: '#4caf50',
                text: 'Повністю підключено'
            };
        }
        else if (status.voice_api_available) {
            return {
                status: 'partial',
                icon: icons_material_1.Cloud,
                color: '#ff9800',
                text: 'Часткове підключення (тільки Voice API)'
            };
        }
        else {
            return {
                status: 'offline',
                icon: icons_material_1.CloudOff,
                color: '#f44336',
                text: 'Офлайн режим'
            };
        }
    };
    const connectionInfo = getConnectionStatus();
    // Обробка голосової команди (заглушка для демонстрації)
    const handleVoiceCommand = (text) => __awaiter(void 0, void 0, void 0, function* () {
        setIsListening(false);
        console.log('🎤 Отримана голосова команда:', text);
        if (onVoiceCommand) {
            onVoiceCommand(text, 0.9); // Симуляція високої впевненості
        }
        // Симуляція відповіді AI
        const responses = [
            'Команда прийнята. Виконую...',
            'Зрозумів. Працюю над цим.',
            'Команда розпізнана. Обробляю запит.',
            'Отримав завдання. Виконую операцію.'
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        yield handleTTSResponse(response);
    });
    // Озвучування відповіді
    const handleTTSResponse = (text) => __awaiter(void 0, void 0, void 0, function* () {
        if (!enabled)
            return;
        setIsSpeaking(true);
        console.log('🔊 Озвучування відповіді:', text);
        try {
            if (status.voice_api_available) {
                // Використання Premium FREE Voice API
                const audioUrl = yield premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.textToSpeech({
                    text,
                    language: 'uk-UA',
                    provider: status.current_tts_provider
                });
                if (audioUrl) {
                    const audio = new Audio(audioUrl);
                    audio.onended = () => setIsSpeaking(false);
                    yield audio.play();
                }
                else {
                    throw new Error('Не вдалося отримати аудіо');
                }
            }
            else {
                // Fallback до Web Speech API
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'uk-UA';
                utterance.onend = () => setIsSpeaking(false);
                speechSynthesis.speak(utterance);
            }
            if (onVoiceResponse) {
                onVoiceResponse(text);
            }
        }
        catch (error) {
            console.error('❌ Помилка озвучування:', error);
            setIsSpeaking(false);
        }
    });
    // Симуляція слухання
    const handleStartListening = () => {
        if (!enabled)
            return;
        setIsListening(true);
        console.log('🎤 Початок прослуховування...');
        // Симуляція розпізнавання мовлення
        setTimeout(() => {
            const commands = [
                'показати статус системи',
                'запустити аналіз аномалій',
                'відкрити панель агентів',
                'створити новий прогноз',
                'перевірити безпеку системи'
            ];
            const command = commands[Math.floor(Math.random() * commands.length)];
            handleVoiceCommand(command);
        }, 2000);
    };
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleOpenAdmin = () => {
        setAdminOpen(true);
        handleMenuClose();
    };
    return (<>
      {/* Floating Action Button для голосового керування */}
      <material_1.Box sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
        }}>
        <framer_motion_1.motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <material_1.Tooltip title={<material_1.Box>
                <material_1.Typography variant="body2" fontWeight="bold">
                  Голосове керування
                </material_1.Typography>
                <material_1.Typography variant="caption">
                  {connectionInfo.text}
                </material_1.Typography>
                <material_1.Typography variant="caption" display="block">
                  TTS: {status.current_tts_provider}
                </material_1.Typography>
                <material_1.Typography variant="caption" display="block">
                  STT: {status.current_stt_provider}
                </material_1.Typography>
              </material_1.Box>} placement="left">
            <material_1.Fab color="primary" onClick={handleStartListening} onContextMenu={(e) => {
            e.preventDefault();
            handleMenuClick(e);
        }} disabled={!enabled} sx={{
            background: isListening
                ? 'linear-gradient(45deg, #ff4081, #ff6ec7)'
                : isSpeaking
                    ? 'linear-gradient(45deg, #4caf50, #81c784)'
                    : 'linear-gradient(45deg, #2196f3, #64b5f6)',
            '&:hover': {
                background: isListening
                    ? 'linear-gradient(45deg, #e91e63, #f06292)'
                    : isSpeaking
                        ? 'linear-gradient(45deg, #388e3c, #66bb6a)'
                        : 'linear-gradient(45deg, #1976d2, #42a5f5)',
            }
        }}>
              <material_1.Badge badgeContent="" color="error" variant="dot" invisible={connectionInfo.status === 'connected'}>
                <framer_motion_1.AnimatePresence mode="wait">
                  {isListening ? (<framer_motion_1.motion.div key="listening" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <icons_material_1.Mic />
                    </framer_motion_1.motion.div>) : isSpeaking ? (<framer_motion_1.motion.div key="speaking" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <icons_material_1.VolumeUp />
                    </framer_motion_1.motion.div>) : (<framer_motion_1.motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <icons_material_1.Mic />
                    </framer_motion_1.motion.div>)}
                </framer_motion_1.AnimatePresence>
              </material_1.Badge>
            </material_1.Fab>
          </material_1.Tooltip>
        </framer_motion_1.motion.div>

        {/* Статус чіпи */}
        <material_1.Box sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
        }}>
          <material_1.Chip icon={<connectionInfo.icon sx={{ color: connectionInfo.color }}/>} label={connectionInfo.status === 'connected' ? 'Онлайн' :
            connectionInfo.status === 'partial' ? 'Частково' : 'Офлайн'} size="small" variant="outlined" sx={{
            bgcolor: 'background.paper',
            borderColor: connectionInfo.color
        }}/>

          {status.voice_api_available && (<material_1.Chip icon={<icons_material_1.VolumeUp />} label={status.current_tts_provider} size="small" color="primary" variant="outlined" sx={{ bgcolor: 'background.paper' }}/>)}
        </material_1.Box>
      </material_1.Box>

      {/* Контекстне меню */}
      <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }} transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}>
        <material_1.MenuItem onClick={handleOpenAdmin}>
          <material_1.ListItemIcon>
            <icons_material_1.Settings />
          </material_1.ListItemIcon>
          <material_1.ListItemText>Налаштування провайдерів</material_1.ListItemText>
        </material_1.MenuItem>

        <material_1.Divider />

        <material_1.MenuItem disabled>
          <material_1.ListItemIcon>
            <icons_material_1.VolumeUp />
          </material_1.ListItemIcon>
          <material_1.ListItemText>
            <material_1.Typography variant="body2">TTS: {status.current_tts_provider}</material_1.Typography>
          </material_1.ListItemText>
        </material_1.MenuItem>

        <material_1.MenuItem disabled>
          <material_1.ListItemIcon>
            <icons_material_1.Hearing />
          </material_1.ListItemIcon>
          <material_1.ListItemText>
            <material_1.Typography variant="body2">STT: {status.current_stt_provider}</material_1.Typography>
          </material_1.ListItemText>
        </material_1.MenuItem>

        <material_1.Divider />

        <material_1.MenuItem disabled>
          <material_1.ListItemIcon>
            <connectionInfo.icon sx={{ color: connectionInfo.color }}/>
          </material_1.ListItemIcon>
          <material_1.ListItemText>
            <material_1.Typography variant="caption">{connectionInfo.text}</material_1.Typography>
          </material_1.ListItemText>
        </material_1.MenuItem>
      </material_1.Menu>

      {/* Адмін панель */}
      <VoiceProvidersAdmin_1.default open={adminOpen} onClose={() => setAdminOpen(false)}/>
    </>);
};
exports.default = VoiceControlIntegration;
