"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCards = void 0;
const react_1 = __importDefault(require("react"));
const react_i18next_1 = require("react-i18next");
const framer_motion_1 = require("framer-motion");
const cyberAceStore_1 = require("../state/cyberAceStore");
/**
 * Компонент картки агента
 */
const AgentCard = ({ agent, onSelect }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const getStatusColor = (status) => {
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
    const getStatusLabel = (status) => {
        return t(`agents.status.${status}`);
    };
    return (<framer_motion_1.motion.div className="agent-card" whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }} onClick={onSelect} layout>
      {/* Аватар агента */}
      <div className="agent-avatar">
        <span className="agent-emoji">{agent.avatar}</span>
        <div className="agent-status-indicator" data-status={agent.status}/>
      </div>

      {/* Інформація про агента */}
      <div className="agent-info">
        <h4 className="agent-name">{t(`agents.${agent.type}.name`)}</h4>
        <p className="agent-description">
          {t(`agents.${agent.type}.description`)}
        </p>

        {/* Статус */}
        <div className="agent-status">
          <span className="status-dot" data-color={getStatusColor(agent.status)}/>
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
        {agent.lastActive && (<div className="agent-last-active">
            <span className="last-active-label">
              {t('agents.lastActive')}:
            </span>
            <span className="last-active-time">
              {new Date(agent.lastActive).toLocaleTimeString()}
            </span>
          </div>)}
      </div>

      {/* Можливості агента */}
      <div className="agent-capabilities">
        {agent.capabilities.slice(0, 3).map((capability) => (<span key={capability} className="capability-tag">
            {t(`capabilities.${capability}`)}
          </span>))}
        {agent.capabilities.length > 3 && (<span className="capability-tag more">
            +{agent.capabilities.length - 3}
          </span>)}
      </div>

      {/* Кнопка дії */}
      <framer_motion_1.motion.button className="agent-action-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => {
            e.stopPropagation();
            onSelect();
        }}>
        {t('agents.activate')}
      </framer_motion_1.motion.button>
    </framer_motion_1.motion.div>);
};
/**
 * Компонент списку карток агентів
 */
const AgentCards = () => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const { agents, setCurrentAgent } = (0, cyberAceStore_1.useCyberAceStore)();
    const handleAgentSelect = (agent) => {
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
    return (<div className="agent-cards-container">
      <div className="agents-header">
        <h2 className="agents-title">{t('agents.title')}</h2>
        <p className="agents-subtitle">{t('agents.subtitle')}</p>
      </div>

      <framer_motion_1.motion.div className="agents-grid" variants={containerVariants} initial="hidden" animate="visible">
        {agents.map((agent) => (<framer_motion_1.motion.div key={agent.id} variants={itemVariants}>
            <AgentCard agent={agent} onSelect={() => handleAgentSelect(agent)}/>
          </framer_motion_1.motion.div>))}
      </framer_motion_1.motion.div>

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
    </div>);
};
exports.AgentCards = AgentCards;
