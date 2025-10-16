import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

interface QuickAction {
  id: string;
  icon: string;
  labelKey: string;
  color: string;
  action: string;
}

/**
 * Компонент швидких дій для CYBER-ACE
 */
export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      id: 'analyze-data',
      icon: '📊',
      labelKey: 'actions.analyzeData',
      color: '#3498db',
      action: 'analyze-data'
    },
    {
      id: 'detect-risks',
      icon: '🔍',
      labelKey: 'actions.detectRisks',
      color: '#e74c3c',
      action: 'detect-risks'
    },
    {
      id: 'explore-network',
      icon: '🕸️',
      labelKey: 'actions.exploreNetwork',
      color: '#9b59b6',
      action: 'explore-network'
    },
    {
      id: 'check-compliance',
      icon: '🛡️',
      labelKey: 'actions.checkCompliance',
      color: '#2ecc71',
      action: 'check-compliance'
    },
    {
      id: 'hunt-threats',
      icon: '🎯',
      labelKey: 'actions.huntThreats',
      color: '#e67e22',
      action: 'hunt-threats'
    },
    {
      id: 'find-patterns',
      icon: '🔮',
      labelKey: 'actions.findPatterns',
      color: '#1abc9c',
      action: 'find-patterns'
    }
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      className="quick-actions-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="quick-actions-title">{t('actions.title')}</h3>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            className="quick-action-btn"
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.action)}
          >
            <div className="action-icon">{action.icon}</div>
            <span className="action-label">{t(action.labelKey)}</span>
            <div
              className="action-glow"
              style={{ backgroundColor: action.color }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
