// @ts-nocheck
// Экспорт всех компонентов гиперреалистичного 3D-гида
import Avatar3D from './Avatar3D';
import ContextualChat from './ContextualChat';
import GuideFloatingButton from './GuideFloatingButton';
import GuideSystemDemo from './GuideSystemDemo';
import ProductionDemo from './ProductionDemo';
import { GuideSettingsManager, defaultSettings } from './GuideSettingsManager';
import { GuideProvider, useGuide, useModuleGuide } from './GuideContext';

// Реэкспорт компонентов
export { Avatar3D };
export { ContextualChat };
export { GuideFloatingButton };
export { GuideSystemDemo };
export { ProductionDemo };
export { GuideSettingsManager, defaultSettings };
export { GuideProvider, useGuide, useModuleGuide };

// Нові компоненти Nexus Core
export { default as GuideCore } from './GuideCore';
export { default as GuideDock } from './GuideDock';
export { default as EnhancedContextualChat } from './EnhancedContextualChat';
export { default as GuideSettingsPanel } from './GuideSettingsPanel';
export { HolographicAIFace } from './HolographicAIFaceV2';

// Экспорт типов
export type { GuideSettings } from './GuideSettingsManager';

// Утилитарные функции для интеграции
export const createGuideInstance = (moduleName: string, config?: any) => {
  return {
    moduleName,
    config: config || {},
    show: () => console.log(`Показать гид для модуля: ${moduleName}`),
    hide: () => console.log(`Скрыть гид для модуля: ${moduleName}`),
    updateContext: (data: any) => console.log(`Обновить контекст для ${moduleName}:`, data)
  };
};

// Интеграционные хуки для различных модулей
export const useETLGuide = () => useModuleGuide('etl');
export const useAgentsGuide = () => useModuleGuide('agents');
export const useSecurityGuide = () => useModuleGuide('security');
export const useAnalyticsGuide = () => useModuleGuide('analytics');
export const useDashboardGuide = () => useModuleGuide('dashboard');
export const useSettingsGuide = () => useModuleGuide('settings');
