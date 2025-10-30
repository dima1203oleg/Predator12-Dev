import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCyberAceStore } from '../state/cyberAceStore';
import type { Agent, AgentStatus } from '../state/cyberAceStore';

/**
 * Компонент картки агента
 */
const AgentCard: React.FC<{ agent: Agent; onSelect: () => void }> = ({
  agent,
  onSelect
}) => {
  const { t } = useTranslation();

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case 'active':
        return '#2ecc71';
      case 'busy':
        return '#f39c12';
      case 'error':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusLabel = (status: AgentStatus): string => {
    return t(`agents.status.${status}`);
  };

  return (
    <motion.div
      className="agent-card"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      layout
    >
      {/* Аватар агента */}
      <div className="agent-avatar">
        <span className="agent-emoji">{agent.avatar}</span>
        <div
          className="agent-status-indicator"
          data-status={agent.status}
        />
      </div>

      {/* Інформація про агента */}
      <div className="agent-info">
        <h4 className="agent-name">{t(`agents.${agent.type}.name`)}</h4>
        <p className="agent-description">
          {t(`agents.${agent.type}.description`)}
        </p>

        {/* Статус */}
        <div className="agent-status">
          <span
            className="status-dot"
            data-color={getStatusColor(agent.status)}
          />
          <span className="status-text">{getStatusLabel(agent.status)}</span>
        </div>

        {/* Метрики */}
        <div className="agent-metrics">
          <div className="metric">
            <span className="metric-label">{t('agents.tasks')}</span>
            <span className="metric-value">{agent.tasks}</span>
          </div>
          <div className="metric">
            <span className="metric-label">{t('agents.capabilities')}</span>
            <span className="metric-value">{agent.capabilities.length}</span>
          </div>
        </div>

        {/* Останнє активність */}
        {agent.lastActive && (
          <div className="agent-last-active">
            <span className="last-active-label">
              {t('agents.lastActive')}:
            </span>
            <span className="last-active-time">
              {new Date(agent.lastActive).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Можливості агента */}
      <div className="agent-capabilities">
        {agent.capabilities.slice(0, 3).map((capability) => (
          <span key={capability} className="capability-tag">
            {t(`capabilities.${capability}`)}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="capability-tag more">
            +{agent.capabilities.length - 3}
          </span>
        )}
      </div>

      {/* Кнопка дії */}
      <motion.button
        className="agent-action-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {t('agents.activate')}
      </motion.button>
    </motion.div>
  );
};

/**
 * Компонент списку карток агентів
 */
export const AgentCards: React.FC = () => {
  const { t } = useTranslation();
  const { agents, setCurrentAgent } = useCyberAceStore();

  const handleAgentSelect = (agent: Agent) => {
    setCurrentAgent(agent);
    console.log('Selected agent:', agent);
    // TODO: Відкрити деталі агента або почати взаємодію
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="agent-cards-container">
      <div className="agents-header">
        <h2 className="agents-title">{t('agents.title')}</h2>
        <p className="agents-subtitle">{t('agents.subtitle')}</p>
      </div>

      <motion.div
        className="agents-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agents.map((agent) => (
          <motion.div key={agent.id} variants={itemVariants}>
            <AgentCard agent={agent} onSelect={() => handleAgentSelect(agent)} />
          </motion.div>
        ))}
      </motion.div>

      {/* Статистика */}
      <div className="agents-stats">
        <div className="stat-item">
          <span className="stat-label">{t('agents.stats.total')}</span>
          <span className="stat-value">{agents.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('agents.stats.active')}</span>
          <span className="stat-value">
            {agents.filter((a) => a.status === 'active').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('agents.stats.busy')}</span>
          <span className="stat-value">
            {agents.filter((a) => a.status === 'busy').length}
          </span>
        </div>
      </div>
    </div>
  );
};
