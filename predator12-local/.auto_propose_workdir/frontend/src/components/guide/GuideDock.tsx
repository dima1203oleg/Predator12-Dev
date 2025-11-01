// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel,
  Popover,
  Typography,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Assistant as GuideIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppEventStore } from '../../stores/appEventStore';
import { nexusColors } from '../../theme/nexusTheme';
import HolographicAIFace from '../nexus_visuals/HolographicAIFace';

interface GuideDockProps {
  currentModule?: string;
  systemHealth?: 'optimal' | 'degraded' | 'unknown' | 'critical';
  cpuLoad?: number;
  memoryUsage?: number;
}

const GuideDock: React.FC<GuideDockProps> = ({
  currentModule = 'dashboard',
  systemHealth = 'optimal',
  cpuLoad = 0.3,
  memoryUsage = 0.4
}) => {
  const { guide, setGuideMode, activateGuide, deactivateGuide, updateLastInteraction } = useAppEventStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [position, setPosition] = useState({ bottom: 24, right: 24 });

  const dockRef = useRef<HTMLDivElement>(null);
  const settingsAnchorRef = useRef<HTMLButtonElement>(null);

  // Collision avoidance - check for overlapping elements
  useEffect(() => {
    const checkCollisions = () => {
      if (!dockRef.current) return;

      const dockRect = dockRef.current.getBoundingClientRect();
      const elements = document.querySelectorAll('button, [role="button"], .fab, .floating');

      let hasCollision = false;
      elements.forEach(element => {
        if (element === dockRef.current || dockRef.current?.contains(element)) return;
        const rect = element.getBoundingClientRect();
        const collision = !(
          rect.right < dockRect.left ||
          rect.left > dockRect.right ||
          rect.bottom < dockRect.top ||
          rect.top > dockRect.bottom
        );
        if (collision) hasCollision = true;
      });

      // Adjust position if collision detected
      if (hasCollision) {
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        // Try higher position on right first
        const newBottom = Math.min(Math.max(120, position.bottom + 96), viewport.height - 200);
        setPosition({ bottom: newBottom, right: 24 });
      } else {
        // Keep default dock
        setPosition({ bottom: 24, right: 24 });
      }
    };

    checkCollisions();
    window.addEventListener('resize', checkCollisions);
    const interval = setInterval(checkCollisions, 2000);
    return () => {
      window.removeEventListener('resize', checkCollisions);
      clearInterval(interval);
    };
  }, [position.bottom]);

  const handleGuideToggle = () => {
    if (guide.isActive) {
      deactivateGuide();
    } else {
      activateGuide(currentModule);
    }
    updateLastInteraction();
  };

  const getGuideMessage = (): string => {
    if (guide.mode === 'silent') return '';

    switch (systemHealth) {
      case 'unknown':
        return '🔍 Статус системи невідомий. Натисніть "Перевірити" або відкрийте журнали для діагностики.';
      case 'critical':
        return '🚨 КРИТИЧНО! Система потребує негайного втручання. Рекомендую перевірити логи.';
      case 'degraded':
        return '⚠️ Система працює з обмеженнями. Варто проаналізувати метрики продуктивності.';
      case 'optimal':
        return `✅ Система працює нормально. Модуль "${currentModule}" готовий до роботи.`;
      default:
        return 'AI Гід готовий допомогти з навігацією та поясненнями.';
    }
  };

  const getEmotionFromHealth = () => {
    switch (systemHealth) {
      case 'critical': return 'error';
      case 'degraded': return 'alert';
      case 'unknown': return 'processing';
      case 'optimal': return 'success';
      default: return 'neutral';
    }
  };

  const faceHealth: 'optimal' | 'warning' | 'critical' =
    systemHealth === 'critical' ? 'critical' :
    systemHealth === 'optimal' ? 'optimal' : 'warning';

  return (
    <>
      {/* Main Guide Dock */}
      <Box
        ref={dockRef}
        sx={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1
        }}
      >
        {/* 3D Guide Face */}
        <AnimatePresence>
          {guide.isActive && guide.mode !== 'silent' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: 'backOut' }}
            >
              {/*
              <HolographicAIFace
                isActive={true}
                isSpeaking={false}
                emotion={getEmotionFromHealth() as any}
                message={getGuideMessage()}
                intensity={0.7}
                size="small"
                enableGlitch={systemHealth === 'critical'}
                enableAura={true}
                enableDataStream={systemHealth === 'optimal'}
                enableSoundWaves={false}
                enableEnergyRings={false}
                systemHealth={faceHealth}
                cpuLoad={cpuLoad}
                memoryUsage={memoryUsage}
                autoPosition={false}
                fixedPosition={{ top: -180, right: 0 }}
              />
              */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Stack */}
        <Stack direction="column" spacing={1} alignItems="center">
          {/* Settings Button */}
          <Tooltip title="Налаштування гіда" placement="left">
            <IconButton
              ref={settingsAnchorRef}
              onClick={() => setSettingsOpen(true)}
              sx={{
                backgroundColor: `${nexusColors.quantum}60`,
                color: nexusColors.frost,
                width: 44,
                height: 44,
                '&:hover': {
                  backgroundColor: `${nexusColors.quantum}80`,
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Main Guide FAB */}
          <Tooltip title={guide.isActive ? 'Вимкнути гіда' : 'Активувати AI гіда'} placement="left">
            <Fab
              color="primary"
              onClick={handleGuideToggle}
              sx={{
                backgroundColor: guide.isActive ? nexusColors.success : nexusColors.sapphire,
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                  backgroundColor: guide.isActive ? nexusColors.emerald : nexusColors.quantum,
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${guide.isActive ? nexusColors.success + '40' : nexusColors.sapphire + '40'}`,
                border: `2px solid ${guide.isActive ? nexusColors.success : nexusColors.sapphire}`
              }}
            >
              <motion.div
                animate={{
                  rotate: guide.isActive ? 360 : 0,
                  scale: guide.isActive ? [1, 1.1, 1] : 1
                }}
                transition={{
                  rotate: { duration: 0.5 },
                  scale: { duration: 1, repeat: guide.isActive ? Infinity : 0, repeatType: 'reverse' }
                }}
              >
                <GuideIcon />
              </motion.div>
            </Fab>
          </Tooltip>
        </Stack>
      </Box>

      {/* Settings Popover */}
      <Popover
        open={settingsOpen}
        anchorEl={settingsAnchorRef.current}
        onClose={() => setSettingsOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
            border: `1px solid ${nexusColors.quantum}`,
            borderRadius: 2,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
              Налаштування гіда
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSettingsOpen(false)}
              sx={{ color: nexusColors.shadow }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: nexusColors.quantum, mb: 2 }} />

          {/* Guide Mode */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: nexusColors.frost, mb: 1 }}>
              Режим роботи
            </Typography>
            <Stack direction="row" spacing={1}>
              {(['passive', 'guide', 'silent'] as const).map((mode) => (
                <Chip
                  key={mode}
                  label={mode === 'passive' ? 'Пасивний' : mode === 'guide' ? 'Активний' : 'Вимкнений'}
                  variant={guide.mode === mode ? 'filled' : 'outlined'}
                  onClick={() => setGuideMode(mode)}
                  sx={{
                    backgroundColor: guide.mode === mode ? `${nexusColors.sapphire}40` : 'transparent',
                    borderColor: nexusColors.quantum,
                    color: nexusColors.frost,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: `${nexusColors.sapphire}20`
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Voice Controls */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: nexusColors.frost, mb: 1 }}>
              Голосові функції
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {voiceEnabled ? <VolumeIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                  <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                    Озвучування TTS
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={micEnabled}
                  onChange={(e) => setMicEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {micEnabled ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                  <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                    Голосовий ввід
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Current Status */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: `${nexusColors.quantum}20`, borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: nexusColors.nebula }}>
              Поточний модуль: <strong>{currentModule}</strong><br />
              Статус системи: <strong>{systemHealth}</strong>
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default GuideDock;
