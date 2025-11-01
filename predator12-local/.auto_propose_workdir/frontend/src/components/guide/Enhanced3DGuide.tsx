// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper, Chip } from '@mui/material';
import {
  VolumeUp,
  Settings,
  Help,
  Psychology,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { HolographicAIFace } from './HolographicAIFaceV2';
import EnhancedContextualChat from './EnhancedContextualChat';

interface Enhanced3DGuideProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  systemHealth?: 'optimal' | 'degraded' | 'critical';
  agentsCount?: number;
  activeAgentsCount?: number;
}

const Enhanced3DGuide: React.FC<Enhanced3DGuideProps> = ({
  isVisible = true,
  onToggleVisibility,
  systemHealth = 'optimal',
  agentsCount = 26,
  activeAgentsCount = 22
}) => {
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('🚀 Система Predator готова до роботи');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Автоматичні повідомлення на основі стану системи
  useEffect(() => {
    const messages = {
      optimal: [
        '🤖 Всі системи функціонують оптимально',
        `📊 ${activeAgentsCount}/${agentsCount} агентів активні`,
        '⚡ AI моделі готові до роботи',
        '🛡️ Безпека системи забезпечена',
        '🔄 Самовдосконалення активне'
      ],
      degraded: [
        '⚠️ Виявлено деградацію продуктивності',
        '🔧 Рекомендую перевірити агентів',
        '📈 Автовиправлення в процесі',
        '🔍 Діагностика проблемних модулів'
      ],
      critical: [
        '🔴 Критичні проблеми в системі!',
        '🚨 Потрібна негайна увага',
        '⛑️ Активую аварійні протоколи',
        '🔧 Запускаю процедури відновлення'
      ]
    };

    const systemMessages = messages[systemHealth];
    let currentIndex = 0;

    const interval = setInterval(() => {
      setCurrentMessage(systemMessages[currentIndex]);
      currentIndex = (currentIndex + 1) % systemMessages.length;
    }, 8000);

    return () => clearInterval(interval);
  }, [systemHealth, agentsCount, activeAgentsCount]);

  const handleSpeak = () => {
    setIsSpeaking(true);
    // Тут можна додати TTS функціональність
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const getHealthColor = () => {
    switch (systemHealth) {
      case 'optimal': return nexusColors.emerald;
      case 'degraded': return nexusColors.warning;
      case 'critical': return nexusColors.crimson;
      default: return nexusColors.shadow;
    }
  };

  const getHealthEmoji = () => {
    switch (systemHealth) {
      case 'optimal': return '🟢';
      case 'degraded': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  if (!isVisible) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Tooltip title="Показати 3D гіда">
          <IconButton
            onClick={onToggleVisibility}
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
              color: 'white',
              width: 56,
              height: 56,
              '&:hover': {
                background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.amethyst})`,
              }
            }}
          >
            <Psychology />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
            border: `2px solid ${getHealthColor()}60`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            minWidth: 320,
            maxWidth: 400
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${nexusColors.shadow}40`,
              background: `linear-gradient(90deg, ${getHealthColor()}20, transparent)`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.2rem' }}>
                {getHealthEmoji()}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: nexusColors.frost,
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Nexus Guide AI
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Озвучити">
                <IconButton size="small" onClick={handleSpeak}>
                  <VolumeUp sx={{ color: nexusColors.frost, fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Чат">
                <IconButton size="small" onClick={() => setShowChat(!showChat)}>
                  <Help sx={{ color: nexusColors.frost, fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Налаштування">
                <IconButton size="small">
                  <Settings sx={{ color: nexusColors.frost, fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Приховати гіда">
                <IconButton size="small" onClick={onToggleVisibility}>
                  <VisibilityOff sx={{ color: nexusColors.frost, fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* 3D Face */}
          <Box sx={{ height: 180, position: 'relative', overflow: 'hidden' }}>
            {/*
            <HolographicAIFace
              isActive={true}
              isSpeaking={isSpeaking}
              emotion={systemHealth === 'optimal' ? 'neutral' :
                      systemHealth === 'degraded' ? 'processing' : 'alert'}
              message={currentMessage}
              size="medium"
              enableGlitch={systemHealth !== 'optimal'}
              enableAura={true}
              enableDataStream={true}
              systemHealth={systemHealth === 'degraded' ? 'warning' : systemHealth}
              cpuLoad={0.35}
              memoryUsage={0.28}
            />
            */}
          </Box>

          {/* Status Info */}
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: nexusColors.frost,
                mb: 1.5,
                textAlign: 'center',
                lineHeight: 1.4,
                fontSize: '0.9rem'
              }}
            >
              {currentMessage}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip
                size="small"
                label={`${activeAgentsCount}/${agentsCount} агентів`}
                sx={{
                  backgroundColor: `${nexusColors.quantum}20`,
                  color: nexusColors.quantum,
                  fontSize: '0.7rem'
                }}
              />
              <Chip
                size="small"
                label="48 AI моделей"
                sx={{
                  backgroundColor: `${nexusColors.sapphire}20`,
                  color: nexusColors.sapphire,
                  fontSize: '0.7rem'
                }}
              />
              <Chip
                size="small"
                label={systemHealth}
                sx={{
                  backgroundColor: `${getHealthColor()}20`,
                  color: getHealthColor(),
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 360,
              zIndex: 999,
            }}
          >
            <EnhancedContextualChat
              open={showChat}
              onClose={() => setShowChat(false)}
              currentModule="system_status"
              systemHealth={systemHealth === 'degraded' ? 'degraded' : systemHealth}
              onNavigate={(module) => {
                console.log('Navigate to:', module);
                setCurrentMessage(`🎯 Переходжу до модуля: ${module}`);
              }}
              onHealthCheck={() => {
                console.log('Health check requested');
                setCurrentMessage('🔍 Запускаю перевірку здоров\'я системи...');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Enhanced3DGuide;
