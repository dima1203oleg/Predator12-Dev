import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCyberAceStore } from './state/cyberAceStore';
import {
  AceAvatar,
  QuickActions,
  AgentCards,
  StatusBar,
  VoiceInput
} from './components';
import { cyberAceAPI, utils } from './services/cyberAceAPI';
import './i18n'; // Ініціалізація i18n
import './styles/cyber-ace.css';

/**
 * CYBER-ACE Home Screen
 * Головний екран кібер-асистента з інтерактивним 3D аватаром,
 * швидкими діями, картками агентів та голосовим управлінням
 */
export const CyberAcePage: React.FC = () => {
  const { t } = useTranslation();
  const {
    isActive,
    currentAgent,
    systemStatus,
    greeting,
    initializeAce,
    setGreeting
  } = useCyberAceStore();

  const [isListening, setIsListening] = useState(false);
  const [showAgents, setShowAgents] = useState(false);

  useEffect(() => {
    // Ініціалізація CYBER-ACE при завантаженні
    const init = async () => {
      initializeAce();

      // Привітання користувача
      const hour = new Date().getHours();
      let greetingKey = 'greeting.default';

      if (hour >= 5 && hour < 12) {
        greetingKey = 'greeting.morning';
      } else if (hour >= 12 && hour < 17) {
        greetingKey = 'greeting.afternoon';
      } else if (hour >= 17 && hour < 22) {
        greetingKey = 'greeting.evening';
      } else {
        greetingKey = 'greeting.night';
      }

      setGreeting(t(greetingKey));

      // Тестування підключення до backend
      try {
        const isConnected = await cyberAceAPI.testConnection();
        if (isConnected) {
          console.log('✅ CYBER-ACE backend connected');

          // Завантаження агентів з backend
          const agentsData = await cyberAceAPI.getAgents();
          console.log('Loaded agents:', agentsData.agents);

          // TODO: Оновити store з агентами з backend
        } else {
          console.warn('⚠️ CYBER-ACE backend not available, using mock data');
        }
      } catch (error) {
        console.error('Failed to connect to CYBER-ACE backend:', error);
      }
    };

    init();
  }, [initializeAce, setGreeting, t]);

  const handleVoiceCommand = async (command: string) => {
    console.log('Voice command:', command);

    try {
      const userId = utils.getUserId();
      const language = t('lang') === 'Українська' ? 'uk' : 'en';

      // Відправка команди до CYBER-ACE API
      const response = await cyberAceAPI.chat(command, userId, language as 'uk' | 'en');

      console.log('CYBER-ACE response:', response);

      // Оновлення UI з відповіддю
      setGreeting(response.response);

      // TODO: Додати TTS для озвучення відповіді

    } catch (error) {
      console.error('Error processing voice command:', error);
      setGreeting(t('error.processing'));
    }
  };

  const handleQuickAction = async (action: string) => {
    console.log('Quick action:', action);

    try {
      const userId = utils.getUserId();
      const language = t('lang') === 'Українська' ? 'uk' : 'en';

      // Мапування швидких дій на команди
      const actionCommands: Record<string, string> = {
        'analyze': t('actions.analyze'),
        'detect': t('actions.detect'),
        'report': t('actions.report'),
        'monitor': t('actions.monitor')
      };

      const command = actionCommands[action] || action;
      const response = await cyberAceAPI.chat(command, userId, language as 'uk' | 'en');

      setGreeting(response.response);

    } catch (error) {
      console.error('Error processing quick action:', error);
      setGreeting(t('error.processing'));
    }
  };

  return (
    <div className="cyber-ace-page">
      {/* Статус-бар */}
      <StatusBar status={systemStatus} currentAgent={currentAgent} />

      {/* Головний контейнер */}
      <div className="ace-main-container">
        {/* 3D Аватар CYBER-ACE */}
        <motion.div
          className="ace-avatar-section"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <AceAvatar
            isActive={isActive}
            isListening={isListening}
            currentMood="neutral"
          />
        </motion.div>

        {/* Привітання */}
        <motion.div
          className="ace-greeting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="greeting-text">{greeting}</h1>
          <p className="greeting-subtext">{t('greeting.subtitle')}</p>
        </motion.div>

        {/* Голосовий ввід */}
        <motion.div
          className="ace-voice-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <VoiceInput
            onCommand={handleVoiceCommand}
            onListeningChange={setIsListening}
            placeholder={t('voice.placeholder')}
          />
        </motion.div>

        {/* Швидкі дії */}
        <motion.div
          className="ace-quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <QuickActions onAction={handleQuickAction} />
        </motion.div>

        {/* Кнопка відкриття агентів */}
        <motion.button
          className="ace-agents-toggle"
          onClick={() => setShowAgents(!showAgents)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showAgents ? t('agents.hide') : t('agents.show')}
        </motion.button>
      </div>

      {/* Панель агентів */}
      <AnimatePresence>
        {showAgents && (
          <motion.div
            className="ace-agents-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <AgentCards />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Фонові ефекти */}
      <div className="ace-background-effects">
        <div className="grid-overlay" />
        <div className="cyber-particles" />
        <div className="scan-lines" />
      </div>
    </div>
  );
};

// Loading компонент
const LoadingScreen = () => (
  <div className="cyber-ace-loading-screen">
    <div className="cyber-ace-loading-content">
      <div className="cyber-ace-loading-icon">🤖</div>
      <div>Loading CYBER-ACE...</div>
    </div>
  </div>
);

// Обгортка з Suspense
const CyberAcePageWithSuspense: React.FC = () => (
  <Suspense fallback={<LoadingScreen />}>
    <CyberAcePage />
  </Suspense>
);

export default CyberAcePageWithSuspense;
