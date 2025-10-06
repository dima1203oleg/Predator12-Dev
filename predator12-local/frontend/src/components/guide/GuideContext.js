import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultSettings } from './GuideSettingsManager';
import ContextualChat from './ContextualChat';
const GuideContext = createContext(null);
export const GuideProvider = ({ children, onAction }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentModule, setCurrentModule] = useState('dashboard');
    const [settings, setSettings] = useState(defaultSettings);
    const [systemHealth, setSystemHealth] = useState('optimal');
    const [agentsData, setAgentsData] = useState([]);
    // Загрузка настроек из localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('nexus-guide-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...defaultSettings, ...parsed });
            }
            catch (error) {
                console.error('Ошибка загрузки настроек гида:', error);
            }
        }
    }, []);
    // Сохранение настроек в localStorage
    const updateSettings = useCallback((newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('nexus-guide-settings', JSON.stringify(newSettings));
    }, []);
    const showGuide = useCallback((module = 'dashboard') => {
        if (settings.modules[module]) {
            setCurrentModule(module);
            setIsVisible(true);
        }
    }, [settings.modules]);
    const hideGuide = useCallback(() => {
        setIsVisible(false);
    }, []);
    const updateSystemData = useCallback((health, agents) => {
        setSystemHealth(health);
        setAgentsData(agents);
    }, []);
    const executeAction = useCallback((action) => {
        onAction?.(action, currentModule);
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
    return (_jsxs(GuideContext.Provider, { value: contextValue, children: [children, isVisible && (_jsx(ContextualChat, { visible: isVisible, module: currentModule, systemHealth: systemHealth, agentsData: agentsData, onAction: executeAction }))] }));
};
export const useGuide = () => {
    const context = useContext(GuideContext);
    if (!context) {
        throw new Error('useGuide must be used within a GuideProvider');
    }
    return context;
};
// Hook для интеграции в модули
export const useModuleGuide = (moduleName) => {
    const guide = useGuide();
    const showModuleGuide = useCallback(() => {
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
