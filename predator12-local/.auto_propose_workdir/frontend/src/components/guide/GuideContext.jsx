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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModuleGuide = exports.useGuide = exports.GuideProvider = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const GuideSettingsManager_1 = require("./GuideSettingsManager");
const ContextualChat_1 = __importDefault(require("./ContextualChat"));
const GuideContext = (0, react_1.createContext)(null);
const GuideProvider = ({ children, onAction }) => {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [currentModule, setCurrentModule] = (0, react_1.useState)('dashboard');
    const [settings, setSettings] = (0, react_1.useState)(GuideSettingsManager_1.defaultSettings);
    const [systemHealth, setSystemHealth] = (0, react_1.useState)('optimal');
    const [agentsData, setAgentsData] = (0, react_1.useState)([]);
    // Загрузка настроек из localStorage
    (0, react_1.useEffect)(() => {
        const savedSettings = localStorage.getItem('nexus-guide-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(Object.assign(Object.assign({}, GuideSettingsManager_1.defaultSettings), parsed));
            }
            catch (error) {
                console.error('Ошибка загрузки настроек гида:', error);
            }
        }
    }, []);
    // Сохранение настроек в localStorage
    const updateSettings = (0, react_1.useCallback)((newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('nexus-guide-settings', JSON.stringify(newSettings));
    }, []);
    const showGuide = (0, react_1.useCallback)((module = 'dashboard') => {
        if (settings.modules[module]) {
            setCurrentModule(module);
            setIsVisible(true);
        }
    }, [settings.modules]);
    const hideGuide = (0, react_1.useCallback)(() => {
        setIsVisible(false);
    }, []);
    const updateSystemData = (0, react_1.useCallback)((health, agents) => {
        setSystemHealth(health);
        setAgentsData(agents);
    }, []);
    const executeAction = (0, react_1.useCallback)((action) => {
        onAction === null || onAction === void 0 ? void 0 : onAction(action, currentModule);
        // Встроенные действия
        switch (action) {
            case 'show-logs':
                console.log('Открываем логи для модуля:', currentModule);
                break;
            case 'run-diagnostics':
                console.log('Запускаем диагностику для модуля:', currentModule);
                break;
            case 'export-report':
                console.log('Экспортируем отчет для модуля:', currentModule);
                break;
            case 'quick-tour':
                console.log('Запускаем быстрый тур по модулю:', currentModule);
                break;
            default:
                console.log('Выполняем действие:', action, 'в модуле:', currentModule);
        }
    }, [currentModule, onAction]);
    const contextValue = {
        isVisible,
        currentModule,
        settings,
        systemHealth,
        agentsData,
        showGuide,
        hideGuide,
        updateSettings,
        updateSystemData,
        executeAction
    };
    return (<GuideContext.Provider value={contextValue}>
      {children}
      {isVisible && (<ContextualChat_1.default visible={isVisible} module={currentModule} systemHealth={systemHealth} agentsData={agentsData} onAction={executeAction}/>)}
    </GuideContext.Provider>);
};
exports.GuideProvider = GuideProvider;
const useGuide = () => {
    const context = (0, react_1.useContext)(GuideContext);
    if (!context) {
        throw new Error('useGuide must be used within a GuideProvider');
    }
    return context;
};
exports.useGuide = useGuide;
// Hook для интеграции в модули
const useModuleGuide = (moduleName) => {
    const guide = (0, exports.useGuide)();
    const showModuleGuide = (0, react_1.useCallback)(() => {
        guide.showGuide(moduleName);
    }, [guide, moduleName]);
    const isActiveModule = guide.currentModule === moduleName;
    return {
        showGuide: showModuleGuide,
        hideGuide: guide.hideGuide,
        isVisible: guide.isVisible && isActiveModule,
        executeAction: guide.executeAction,
        settings: guide.settings
    };
};
exports.useModuleGuide = useModuleGuide;
