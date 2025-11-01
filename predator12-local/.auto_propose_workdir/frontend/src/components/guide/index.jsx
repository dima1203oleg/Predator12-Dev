"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSettingsGuide = exports.useDashboardGuide = exports.useAnalyticsGuide = exports.useSecurityGuide = exports.useAgentsGuide = exports.useETLGuide = exports.createGuideInstance = exports.HolographicAIFace = exports.GuideSettingsPanel = exports.EnhancedContextualChat = exports.GuideDock = exports.GuideCore = exports.useModuleGuide = exports.useGuide = exports.GuideProvider = exports.defaultSettings = exports.GuideSettingsManager = exports.ProductionDemo = exports.GuideSystemDemo = exports.GuideFloatingButton = exports.ContextualChat = exports.Avatar3D = void 0;
// @ts-nocheck
// Экспорт всех компонентов гиперреалистичного 3D-гида
const Avatar3D_1 = __importDefault(require("./Avatar3D"));
exports.Avatar3D = Avatar3D_1.default;
const ContextualChat_1 = __importDefault(require("./ContextualChat"));
exports.ContextualChat = ContextualChat_1.default;
const GuideFloatingButton_1 = __importDefault(require("./GuideFloatingButton"));
exports.GuideFloatingButton = GuideFloatingButton_1.default;
const GuideSystemDemo_1 = __importDefault(require("./GuideSystemDemo"));
exports.GuideSystemDemo = GuideSystemDemo_1.default;
const ProductionDemo_1 = __importDefault(require("./ProductionDemo"));
exports.ProductionDemo = ProductionDemo_1.default;
const GuideSettingsManager_1 = require("./GuideSettingsManager");
Object.defineProperty(exports, "GuideSettingsManager", { enumerable: true, get: function () { return GuideSettingsManager_1.GuideSettingsManager; } });
Object.defineProperty(exports, "defaultSettings", { enumerable: true, get: function () { return GuideSettingsManager_1.defaultSettings; } });
const GuideContext_1 = require("./GuideContext");
Object.defineProperty(exports, "GuideProvider", { enumerable: true, get: function () { return GuideContext_1.GuideProvider; } });
Object.defineProperty(exports, "useGuide", { enumerable: true, get: function () { return GuideContext_1.useGuide; } });
Object.defineProperty(exports, "useModuleGuide", { enumerable: true, get: function () { return GuideContext_1.useModuleGuide; } });
// Нові компоненти Nexus Core
var GuideCore_1 = require("./GuideCore");
Object.defineProperty(exports, "GuideCore", { enumerable: true, get: function () { return __importDefault(GuideCore_1).default; } });
var GuideDock_1 = require("./GuideDock");
Object.defineProperty(exports, "GuideDock", { enumerable: true, get: function () { return __importDefault(GuideDock_1).default; } });
var EnhancedContextualChat_1 = require("./EnhancedContextualChat");
Object.defineProperty(exports, "EnhancedContextualChat", { enumerable: true, get: function () { return __importDefault(EnhancedContextualChat_1).default; } });
var GuideSettingsPanel_1 = require("./GuideSettingsPanel");
Object.defineProperty(exports, "GuideSettingsPanel", { enumerable: true, get: function () { return __importDefault(GuideSettingsPanel_1).default; } });
var HolographicAIFaceV2_1 = require("./HolographicAIFaceV2");
Object.defineProperty(exports, "HolographicAIFace", { enumerable: true, get: function () { return HolographicAIFaceV2_1.HolographicAIFace; } });
// Утилитарные функции для интеграции
const createGuideInstance = (moduleName, config) => {
    return {
        moduleName,
        config: config || {},
        show: () => console.log(`Показать гид для модуля: ${moduleName}`),
        hide: () => console.log(`Скрыть гид для модуля: ${moduleName}`),
        updateContext: (data) => console.log(`Обновить контекст для ${moduleName}:`, data)
    };
};
exports.createGuideInstance = createGuideInstance;
// Интеграционные хуки для различных модулей
const useETLGuide = () => (0, GuideContext_1.useModuleGuide)('etl');
exports.useETLGuide = useETLGuide;
const useAgentsGuide = () => (0, GuideContext_1.useModuleGuide)('agents');
exports.useAgentsGuide = useAgentsGuide;
const useSecurityGuide = () => (0, GuideContext_1.useModuleGuide)('security');
exports.useSecurityGuide = useSecurityGuide;
const useAnalyticsGuide = () => (0, GuideContext_1.useModuleGuide)('analytics');
exports.useAnalyticsGuide = useAnalyticsGuide;
const useDashboardGuide = () => (0, GuideContext_1.useModuleGuide)('dashboard');
exports.useDashboardGuide = useDashboardGuide;
const useSettingsGuide = () => (0, GuideContext_1.useModuleGuide)('settings');
exports.useSettingsGuide = useSettingsGuide;
