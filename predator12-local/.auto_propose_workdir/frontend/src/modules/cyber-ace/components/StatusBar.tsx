import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { SystemStatus, Agent } from '../state/cyberAceStore';

interface StatusBarProps {
  status: SystemStatus;
  currentAgent: Agent | null;
}

/**
 * Компонент статус-бару системи
 */
export const StatusBar: React.FC<StatusBarProps> = ({ status, currentAgent }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: SystemStatus): string => {
    switch (status) {
      case 'online':
        return '#2ecc71';
      case 'degraded':
        return '#f39c12';
      case 'maintenance':
        return '#3498db';
      case 'offline':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status: SystemStatus): string => {
    switch (status) {
      case 'online':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'maintenance':
        return '🔧';
      case 'offline':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <motion.div
      className="status-bar"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="status-bar-left">
        {/* Логотип CYBER-ACE */}
        <div className="ace-logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">CYBER-ACE</span>
        </div>

        {/* Системний статус */}
        <div className="system-status">
          <span className="status-icon">{getStatusIcon(status)}</span>
          <span className="status-text">{t(`system.status.${status}`)}</span>
          <div
            className="status-indicator"
            data-status={status}
            data-color={getStatusColor(status)}
          />
        </div>
      </div>

      <div className="status-bar-center">
        {/* Поточний агент */}
        {currentAgent && (
          <motion.div
            className="current-agent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <span className="agent-badge">
              {currentAgent.avatar} {t(`agents.${currentAgent.type}.name`)}
            </span>
          </motion.div>
        )}
      </div>

      <div className="status-bar-right">
        {/* Час */}
        <div className="system-time">
          {new Date().toLocaleTimeString()}
        </div>

        {/* Нотифікації */}
        <motion.button
          className="notifications-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔔
          <span className="notification-badge">3</span>
        </motion.button>

        {/* Налаштування */}
        <motion.button
          className="settings-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ⚙️
        </motion.button>
      </div>
    </motion.div>
  );
};
