/**
 * 🎤 Voice Control Integration Component
 * Інтеграція голосового керування в основному інтерфейсі
 * Частина Premium FREE Voice System Predator12 Nexus Core V5.2
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  Tooltip,
  Badge,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import {
  Mic as MicIcon,
  Settings as SettingsIcon,
  VolumeUp as TTSIcon,
  Hearing as STTIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceProvidersAPI, type VoiceSettings } from '../services/voiceProvidersAPI';
import { premiumFreeVoiceAPI } from '../services/premiumFreeVoiceAPI';
import VoiceProvidersAdmin from './voice/VoiceProvidersAdmin';

interface VoiceControlStatus {
  backend_available: boolean;
  voice_api_available: boolean;
  current_tts_provider: string;
  current_stt_provider: string;
  settings: VoiceSettings | null;
  last_check: Date;
}

interface VoiceControlIntegrationProps {
  onVoiceCommand?: (command: string, confidence: number) => void;
  onVoiceResponse?: (text: string) => void;
  enabled?: boolean;
}

const VoiceControlIntegration: React.FC<VoiceControlIntegrationProps> = ({
  onVoiceCommand,
  onVoiceResponse,
  enabled = true
}) => {
  const [status, setStatus] = useState<VoiceControlStatus>({
    backend_available: false,
    voice_api_available: false,
    current_tts_provider: 'unknown',
    current_stt_provider: 'unknown',
    settings: null,
    last_check: new Date()
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Перевірка статусу при завантаженні
  useEffect(() => {
    const checkStatus = async () => {
      console.log('🎤 Перевірка статусу голосової системи...');

      try {
        // Перевірка backend API
        const backendHealth = await voiceProvidersAPI.checkHealth();
        const backendAvailable = backendHealth.status === 'healthy';

        // Перевірка Voice API
        const voiceApiAvailable = await premiumFreeVoiceAPI.checkHealth();

        let settings = null;
        let currentTTS = 'unknown';
        let currentSTT = 'unknown';

        if (backendAvailable) {
          try {
            settings = await voiceProvidersAPI.getSettings();
            currentTTS = settings.default_tts_provider;
            currentSTT = settings.default_stt_provider;
          } catch (error) {
            console.warn('⚠️ Не вдалося завантажити налаштування:', error);
          }
        } else if (voiceApiAvailable) {
          // Fallback до Voice API
          try {
            const capabilities = await premiumFreeVoiceAPI.getCapabilities();
            currentTTS = capabilities.recommended_tts;
            currentSTT = capabilities.recommended_stt;
          } catch (error) {
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

      } catch (error) {
        console.error('❌ Помилка перевірки статусу:', error);
        setStatus(prev => ({
          ...prev,
          backend_available: false,
          voice_api_available: false,
          last_check: new Date()
        }));
      }
    };

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
        icon: ConnectedIcon,
        color: '#4caf50',
        text: 'Повністю підключено'
      };
    } else if (status.voice_api_available) {
      return {
        status: 'partial',
        icon: OnlineIcon,
        color: '#ff9800',
        text: 'Часткове підключення (тільки Voice API)'
      };
    } else {
      return {
        status: 'offline',
        icon: OfflineIcon,
        color: '#f44336',
        text: 'Офлайн режим'
      };
    }
  };

  const connectionInfo = getConnectionStatus();

  // Обробка голосової команди (заглушка для демонстрації)
  const handleVoiceCommand = async (text: string) => {
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
    await handleTTSResponse(response);
  };

  // Озвучування відповіді
  const handleTTSResponse = async (text: string) => {
    if (!enabled) return;

    setIsSpeaking(true);
    console.log('🔊 Озвучування відповіді:', text);

    try {
      if (status.voice_api_available) {
        // Використання Premium FREE Voice API
        const audioUrl = await premiumFreeVoiceAPI.textToSpeech({
          text,
          language: 'uk-UA',
          provider: status.current_tts_provider
        });

        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.onended = () => setIsSpeaking(false);
          await audio.play();
        } else {
          throw new Error('Не вдалося отримати аудіо');
        }
      } else {
        // Fallback до Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uk-UA';
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }

      if (onVoiceResponse) {
        onVoiceResponse(text);
      }
    } catch (error) {
      console.error('❌ Помилка озвучування:', error);
      setIsSpeaking(false);
    }
  };

  // Симуляція слухання
  const handleStartListening = () => {
    if (!enabled) return;

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenAdmin = () => {
    setAdminOpen(true);
    handleMenuClose();
  };

  return (
    <>
      {/* Floating Action Button для голосового керування */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Tooltip
            title={
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Голосове керування
                </Typography>
                <Typography variant="caption">
                  {connectionInfo.text}
                </Typography>
                <Typography variant="caption" display="block">
                  TTS: {status.current_tts_provider}
                </Typography>
                <Typography variant="caption" display="block">
                  STT: {status.current_stt_provider}
                </Typography>
              </Box>
            }
            placement="left"
          >
            <Fab
              color="primary"
              onClick={handleStartListening}
              onContextMenu={(e) => {
                e.preventDefault();
                handleMenuClick(e);
              }}
              disabled={!enabled}
              sx={{
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
              }}
            >
              <Badge
                badgeContent=""
                color="error"
                variant="dot"
                invisible={connectionInfo.status === 'connected'}
              >
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="listening"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <MicIcon />
                    </motion.div>
                  ) : isSpeaking ? (
                    <motion.div
                      key="speaking"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <TTSIcon />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <MicIcon />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Badge>
            </Fab>
          </Tooltip>
        </motion.div>

        {/* Статус чіпи */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          <Chip
            icon={<connectionInfo.icon sx={{ color: connectionInfo.color }} />}
            label={connectionInfo.status === 'connected' ? 'Онлайн' :
                   connectionInfo.status === 'partial' ? 'Частково' : 'Офлайн'}
            size="small"
            variant="outlined"
            sx={{
              bgcolor: 'background.paper',
              borderColor: connectionInfo.color
            }}
          />

          {status.voice_api_available && (
            <Chip
              icon={<TTSIcon />}
              label={status.current_tts_provider}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ bgcolor: 'background.paper' }}
            />
          )}
        </Box>
      </Box>

      {/* Контекстне меню */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenAdmin}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Налаштування провайдерів</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem disabled>
          <ListItemIcon>
            <TTSIcon />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">TTS: {status.current_tts_provider}</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem disabled>
          <ListItemIcon>
            <STTIcon />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">STT: {status.current_stt_provider}</Typography>
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem disabled>
          <ListItemIcon>
            <connectionInfo.icon sx={{ color: connectionInfo.color }} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="caption">{connectionInfo.text}</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Адмін панель */}
      <VoiceProvidersAdmin
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
      />
    </>
  );
};

export default VoiceControlIntegration;
