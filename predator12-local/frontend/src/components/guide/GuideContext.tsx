// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GuideSettings, defaultSettings } from './GuideSettingsManager';
import ContextualChat from './ContextualChat';

interface GuideContextType {
  isVisible: boolean;
  currentModule: string;
  settings: GuideSettings;
  systemHealth: string;
  agentsData: any[];
  showGuide: (module?: string) => void;
  hideGuide: () => void;
  updateSettings: (settings: GuideSettings) => void;
  updateSystemData: (health: string, agents: any[]) => void;
  executeAction: (action: string) => void;
}

const GuideContext = createContext<GuideContextType | null>(null);

interface GuideProviderProps {
  children: React.ReactNode;
  onAction?: (action: string, module: string) => void;
}

export const GuideProvider: React.FC<GuideProviderProps> = ({ children, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [settings, setSettings] = useState<GuideSettings>(defaultSettings);
  const [systemHealth, setSystemHealth] = useState('optimal');
  const [agentsData, setAgentsData] = useState<any[]>([]);

  // Загрузка настроек из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('nexus-guide-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Ошибка загрузки настроек гида:', error);
      }
    }
  }, []);

  // Сохранение настроек в localStorage
  const updateSettings = useCallback((newSettings: GuideSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nexus-guide-settings', JSON.stringify(newSettings));
  }, []);

  const showGuide = useCallback((module: string = 'dashboard') => {
    if (settings.modules[module as keyof typeof settings.modules]) {
      setCurrentModule(module);
      setIsVisible(true);
    }
  }, [settings.modules]);

  const hideGuide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const updateSystemData = useCallback((health: string, agents: any[]) => {
    setSystemHealth(health);
    setAgentsData(agents);
  }, []);

  const executeAction = useCallback((action: string) => {
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

  const contextValue: GuideContextType = {
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

  return (
    <GuideContext.Provider value={contextValue}>
      {children}
      {isVisible && (
        <ContextualChat
          visible={isVisible}
          module={currentModule as any}
          systemHealth={systemHealth}
          agentsData={agentsData}
          onAction={executeAction}
        />
      )}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};

// Hook для интеграции в модули
export const useModuleGuide = (moduleName: string) => {
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
