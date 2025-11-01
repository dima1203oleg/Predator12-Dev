"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const react_1 = __importDefault(require("react"));
const react_i18next_1 = require("react-i18next");
const framer_motion_1 = require("framer-motion");
/**
 * Компонент статус-бару системи
 */
const StatusBar = ({ status, currentAgent }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const getStatusColor = (status) => {
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
    const getStatusIcon = (status) => {
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
    return (<framer_motion_1.motion.div className="status-bar" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
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
          <div className="status-indicator" data-status={status} data-color={getStatusColor(status)}/>
        </div>
      </div>

      <div className="status-bar-center">
        {/* Поточний агент */}
        {currentAgent && (<framer_motion_1.motion.div className="current-agent" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <span className="agent-badge">
              {currentAgent.avatar} {t(`agents.${currentAgent.type}.name`)}
            </span>
          </framer_motion_1.motion.div>)}
      </div>

      <div className="status-bar-right">
        {/* Час */}
        <div className="system-time">
          {new Date().toLocaleTimeString()}
        </div>

        {/* Нотифікації */}
        <framer_motion_1.motion.button className="notifications-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          🔔
          <span className="notification-badge">3</span>
        </framer_motion_1.motion.button>

        {/* Налаштування */}
        <framer_motion_1.motion.button className="settings-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          ⚙️
        </framer_motion_1.motion.button>
      </div>
    </framer_motion_1.motion.div>);
};
exports.StatusBar = StatusBar;
