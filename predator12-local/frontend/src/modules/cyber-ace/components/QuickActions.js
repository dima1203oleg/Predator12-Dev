"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickActions = void 0;
const react_1 = __importDefault(require("react"));
const react_i18next_1 = require("react-i18next");
const framer_motion_1 = require("framer-motion");
/**
 * Компонент швидких дій для CYBER-ACE
 */
const QuickActions = ({ onAction }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const actions = [
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
    return (<framer_motion_1.motion.div className="quick-actions-container" variants={containerVariants} initial="hidden" animate="visible">
      <h3 className="quick-actions-title">{t('actions.title')}</h3>
      <div className="quick-actions-grid">
        {actions.map((action) => (<framer_motion_1.motion.button key={action.id} className="quick-action-btn" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => onAction(action.action)}>
            <div className="action-icon">{action.icon}</div>
            <span className="action-label">{t(action.labelKey)}</span>
            <div className="action-glow" style={{ backgroundColor: action.color }}/>
          </framer_motion_1.motion.button>))}
      </div>
    </framer_motion_1.motion.div>);
};
exports.QuickActions = QuickActions;
