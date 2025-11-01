"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberAcePage = void 0;
const react_1 = __importStar(require("react"));
const react_i18next_1 = require("react-i18next");
const framer_motion_1 = require("framer-motion");
const cyberAceStore_1 = require("./state/cyberAceStore");
const components_1 = require("./components");
const cyberAceAPI_1 = require("./services/cyberAceAPI");
require("./i18n"); // Ініціалізація i18n
require("./styles/cyber-ace.css");
/**
 * CYBER-ACE Home Screen
 * Головний екран кібер-асистента з інтерактивним 3D аватаром,
 * швидкими діями, картками агентів та голосовим управлінням
 */
const CyberAcePage = () => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const { isActive, currentAgent, systemStatus, greeting, initializeAce, setGreeting } = (0, cyberAceStore_1.useCyberAceStore)();
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [showAgents, setShowAgents] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Ініціалізація CYBER-ACE при завантаженні
        const init = () => __awaiter(void 0, void 0, void 0, function* () {
            initializeAce();
            // Привітання користувача
            const hour = new Date().getHours();
            let greetingKey = 'greeting.default';
            if (hour >= 5 && hour < 12) {
                greetingKey = 'greeting.morning';
            }
            else if (hour >= 12 && hour < 17) {
                greetingKey = 'greeting.afternoon';
            }
            else if (hour >= 17 && hour < 22) {
                greetingKey = 'greeting.evening';
            }
            else {
                greetingKey = 'greeting.night';
            }
            setGreeting(t(greetingKey));
            // Тестування підключення до backend
            try {
                const isConnected = yield cyberAceAPI_1.cyberAceAPI.testConnection();
                if (isConnected) {
                    console.log('✅ CYBER-ACE backend connected');
                    // Завантаження агентів з backend
                    const agentsData = yield cyberAceAPI_1.cyberAceAPI.getAgents();
                    console.log('Loaded agents:', agentsData.agents);
                    // TODO: Оновити store з агентами з backend
                }
                else {
                    console.warn('⚠️ CYBER-ACE backend not available, using mock data');
                }
            }
            catch (error) {
                console.error('Failed to connect to CYBER-ACE backend:', error);
            }
        });
        init();
    }, [initializeAce, setGreeting, t]);
    const handleVoiceCommand = (command) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Voice command:', command);
        try {
            const userId = cyberAceAPI_1.utils.getUserId();
            const language = t('lang') === 'Українська' ? 'uk' : 'en';
            // Відправка команди до CYBER-ACE API
            const response = yield cyberAceAPI_1.cyberAceAPI.chat(command, userId, language);
            console.log('CYBER-ACE response:', response);
            // Оновлення UI з відповіддю
            setGreeting(response.response);
            // TODO: Додати TTS для озвучення відповіді
        }
        catch (error) {
            console.error('Error processing voice command:', error);
            setGreeting(t('error.processing'));
        }
    });
    const handleQuickAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Quick action:', action);
        try {
            const userId = cyberAceAPI_1.utils.getUserId();
            const language = t('lang') === 'Українська' ? 'uk' : 'en';
            // Мапування швидких дій на команди
            const actionCommands = {
                'analyze': t('actions.analyze'),
                'detect': t('actions.detect'),
                'report': t('actions.report'),
                'monitor': t('actions.monitor')
            };
            const command = actionCommands[action] || action;
            const response = yield cyberAceAPI_1.cyberAceAPI.chat(command, userId, language);
            setGreeting(response.response);
        }
        catch (error) {
            console.error('Error processing quick action:', error);
            setGreeting(t('error.processing'));
        }
    });
    return (<div className="cyber-ace-page">
      {/* Статус-бар */}
      <components_1.StatusBar status={systemStatus} currentAgent={currentAgent}/>

      {/* Головний контейнер */}
      <div className="ace-main-container">
        {/* 3D Аватар CYBER-ACE */}
        <framer_motion_1.motion.div className="ace-avatar-section" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <components_1.AceAvatar isActive={isActive} isListening={isListening} currentMood="neutral"/>
        </framer_motion_1.motion.div>

        {/* Привітання */}
        <framer_motion_1.motion.div className="ace-greeting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h1 className="greeting-text">{greeting}</h1>
          <p className="greeting-subtext">{t('greeting.subtitle')}</p>
        </framer_motion_1.motion.div>

        {/* Голосовий ввід */}
        <framer_motion_1.motion.div className="ace-voice-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <components_1.VoiceInput onCommand={handleVoiceCommand} onListeningChange={setIsListening} placeholder={t('voice.placeholder')}/>
        </framer_motion_1.motion.div>

        {/* Швидкі дії */}
        <framer_motion_1.motion.div className="ace-quick-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <components_1.QuickActions onAction={handleQuickAction}/>
        </framer_motion_1.motion.div>

        {/* Кнопка відкриття агентів */}
        <framer_motion_1.motion.button className="ace-agents-toggle" onClick={() => setShowAgents(!showAgents)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {showAgents ? t('agents.hide') : t('agents.show')}
        </framer_motion_1.motion.button>
      </div>

      {/* Панель агентів */}
      <framer_motion_1.AnimatePresence>
        {showAgents && (<framer_motion_1.motion.div className="ace-agents-panel" initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <components_1.AgentCards />
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Фонові ефекти */}
      <div className="ace-background-effects">
        <div className="grid-overlay"/>
        <div className="cyber-particles"/>
        <div className="scan-lines"/>
      </div>
    </div>);
};
exports.CyberAcePage = CyberAcePage;
// Loading компонент
const LoadingScreen = () => (<div className="cyber-ace-loading-screen">
    <div className="cyber-ace-loading-content">
      <div className="cyber-ace-loading-icon">🤖</div>
      <div>Loading CYBER-ACE...</div>
    </div>
  </div>);
// Обгортка з Suspense
const CyberAcePageWithSuspense = () => (<react_1.Suspense fallback={<LoadingScreen />}>
    <exports.CyberAcePage />
  </react_1.Suspense>);
exports.default = CyberAcePageWithSuspense;
