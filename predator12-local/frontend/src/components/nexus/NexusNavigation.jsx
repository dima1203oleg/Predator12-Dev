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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusNavigation = exports.NexusProvider = exports.useNexus = void 0;
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
// Конфігурація модулів згідно з ТЗ п.5
const NEXUS_MODULES = [
    {
        id: 'dashboard',
        title: 'Command Bridge',
        titleUA: 'Міст Управління',
        icon: <icons_material_1.Dashboard />,
        description: 'System Health, Agents, Pipelines, Integrations',
        descriptionUA: 'Стан системи, Агенти, Конвеєри, Інтеграції',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'mas',
        title: 'AI Orbital Node',
        titleUA: 'Орбітальний Вузол ШІ',
        icon: <icons_material_1.SmartToy />,
        description: 'Agent states, logs, restarts, health probes',
        descriptionUA: 'Стан агентів, логи, перезапуски, health-проби',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'etl',
        title: 'Data Factory',
        titleUA: 'Фабрика Даних',
        icon: <icons_material_1.DataObject />,
        description: 'Queues, jobs, connector status, manual runs',
        descriptionUA: 'Черги, джоби, статус конекторів, manual run',
        roles: ['Admin', 'Analyst']
    },
    {
        id: 'chrono',
        title: 'Chrono Analysis',
        titleUA: 'Хроно-Аналіз',
        icon: <icons_material_1.Timeline />,
        description: '4D timelines, trends, anomalies',
        descriptionUA: '4D таймлайни, тренди, аномалії',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'simulator',
        title: 'Reality Simulator',
        titleUA: 'Симулятор Реальностей',
        icon: <icons_material_1.Science />,
        description: 'What-if scenarios, execution, parameters',
        descriptionUA: 'What-if сценарії, запуск, параметри',
        roles: ['Admin', 'Analyst']
    },
    {
        id: 'opensearch',
        title: 'Analytics Deck',
        titleUA: 'Аналітична Палуба',
        icon: <icons_material_1.Search />,
        description: 'OpenSearch Dashboard integration',
        descriptionUA: 'Інтеграція OpenSearch Dashboard',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'admin',
        title: 'Architect Sanctuary',
        titleUA: 'Святилище Архітектора',
        icon: <icons_material_1.Security />,
        description: 'Secrets, tokens, integrations, feature flags',
        descriptionUA: 'Секрети, токени, інтеграції, фіча-флаги',
        roles: ['Admin']
    },
    {
        id: 'self-improvement',
        title: 'AI Self-Evolution',
        titleUA: 'AI Самоеволюція',
        icon: <icons_material_1.SmartToy />,
        description: 'Real-time self-improvement and business analytics',
        descriptionUA: 'Самовдосконалення та бізнес-аналітика в реальному часі',
        roles: ['Admin', 'Analyst', 'Viewer']
    },
    {
        id: 'data-flow',
        title: 'Data Flow Map',
        titleUA: 'Карта Потоків Даних',
        icon: <icons_material_1.AccountTree />,
        description: '3D visualization of data flows and connections',
        descriptionUA: '3D візуалізація потоків даних та з\'єднань',
        roles: ['Admin', 'Analyst', 'Viewer'],
        status: 'ok'
    },
    {
        id: 'ai-system',
        title: 'AI Neural Network',
        titleUA: 'AI Нейронна Мережа',
        icon: <icons_material_1.Psychology />,
        description: 'Advanced AI agents with intelligence metrics',
        descriptionUA: 'Просунуті AI агенти з метриками інтелекту',
        roles: ['Admin', 'Analyst'],
        status: 'ok'
    },
    {
        id: 'analytics',
        title: 'Real-time Analytics',
        titleUA: 'Аналітика в Реальному Часі',
        icon: <icons_material_1.Analytics />,
        description: 'Live data streams and performance metrics',
        descriptionUA: 'Живі потоки даних та метрики продуктивності',
        roles: ['Admin', 'Analyst', 'Viewer'],
        status: 'ok'
    },
    {
        id: 'security',
        title: 'Cyber Security Shield',
        titleUA: 'Кібер-Безпека Щит',
        icon: <icons_material_1.Shield />,
        description: 'Threat detection and security monitoring',
        descriptionUA: 'Виявлення загроз та моніторинг безпеки',
        roles: ['Admin', 'Analyst'],
        status: 'warning'
    }
];
const NexusContext = (0, react_1.createContext)(null);
const useNexus = () => {
    const context = (0, react_1.useContext)(NexusContext);
    if (!context) {
        throw new Error('useNexus must be used within NexusProvider');
    }
    return context;
};
exports.useNexus = useNexus;
const NexusProvider = ({ children, defaultModule = 'dashboard', userRole = 'Analyst' }) => {
    const [activeModule, setActiveModule] = (0, react_1.useState)(defaultModule);
    const [isDrawerOpen, setDrawerOpen] = (0, react_1.useState)(true);
    const [language, setLanguage] = (0, react_1.useState)('UA');
    const value = {
        activeModule,
        setActiveModule,
        isDrawerOpen,
        setDrawerOpen,
        userRole,
        language,
        setLanguage
    };
    return (<NexusContext.Provider value={value}>
      {children}
    </NexusContext.Provider>);
};
exports.NexusProvider = NexusProvider;
const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;
const NexusNavigation = () => {
    const { activeModule, setActiveModule, isDrawerOpen, setDrawerOpen, userRole, language } = (0, exports.useNexus)();
    // Фільтруємо модулі за ролями користувача
    const availableModules = NEXUS_MODULES.filter(module => module.roles.includes(userRole));
    const handleModuleClick = (moduleId) => {
        setActiveModule(moduleId);
    };
    const getModuleStatus = (moduleId) => {
        // TODO: Замінити на реальний API-виклик, наприклад systemStatusAPI.getModuleStatus(moduleId)
        // return await systemStatusAPI.getModuleStatus(moduleId);
        return 'unknown';
    };
    const getNotificationCount = (moduleId) => {
        // TODO: Замінити на реальний API-виклик, наприклад NotificationHub.getCount(moduleId)
        // return await NotificationHub.getCount(moduleId);
        return 0;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'ok': return nexusTheme_1.nexusColors.success;
            case 'warning': return nexusTheme_1.nexusColors.warning;
            case 'error': return nexusTheme_1.nexusColors.error;
            case 'unknown': return nexusTheme_1.nexusColors.nebula;
            default: return nexusTheme_1.nexusColors.frost;
        }
    };
    return (<material_1.Drawer variant="permanent" sx={{
            width: isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
                boxSizing: 'border-box',
                background: `linear-gradient(180deg, ${nexusTheme_1.nexusColors.obsidian}F0, ${nexusTheme_1.nexusColors.darkMatter}E0)`,
                borderRight: `1px solid ${nexusTheme_1.nexusColors.quantum}40`,
                backdropFilter: 'blur(20px)',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }
        }}>
      {/* Header */}
      <material_1.Box sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}30`
        }}>
        <framer_motion_1.AnimatePresence>
          {isDrawerOpen && (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <material_1.Typography variant="h6" sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontFamily: 'Orbitron, monospace',
                fontWeight: 700,
                background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.quantum}, ${nexusTheme_1.nexusColors.sapphire})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                NEXUS MODULES
              </material_1.Typography>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>

        <material_1.Tooltip title={isDrawerOpen ? 'Згорнути панель' : 'Розгорнути панель'}>
          <material_1.IconButton onClick={() => setDrawerOpen(!isDrawerOpen)} sx={{
            color: nexusTheme_1.nexusColors.quantum,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
                color: nexusTheme_1.nexusColors.sapphire
            }
        }}>
            {isDrawerOpen ? <icons_material_1.ChevronLeft /> : <icons_material_1.Menu />}
          </material_1.IconButton>
        </material_1.Tooltip>
      </material_1.Box>

      {/* Modules List */}
      <material_1.List sx={{ px: 1, py: 2 }}>
        {availableModules.map((module, index) => {
            const isActive = activeModule === module.id;
            const status = getModuleStatus(module.id);
            const notifications = getNotificationCount(module.id);
            const statusColor = getStatusColor(status);
            return (<framer_motion_1.motion.div key={module.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <material_1.ListItem disablePadding sx={{ mb: 1 }}>
                <material_1.Tooltip title={!isDrawerOpen ? (<material_1.Box>
                        <material_1.Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {language === 'UA' ? module.titleUA : module.title}
                        </material_1.Typography>
                        <material_1.Typography variant="caption">
                          {language === 'UA' ? module.descriptionUA : module.description}
                        </material_1.Typography>
                        {notifications > 0 && (<material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.warning }}>
                            • {notifications} сповіщень
                          </material_1.Typography>)}
                      </material_1.Box>) : ''} placement="right" arrow>
                  <material_1.ListItemButton selected={isActive} onClick={() => handleModuleClick(module.id)} sx={{
                    borderRadius: 2,
                    minHeight: 56,
                    bgcolor: isActive ? `${nexusTheme_1.nexusColors.quantum}20` : 'transparent',
                    border: `1px solid ${isActive ? nexusTheme_1.nexusColors.quantum : 'transparent'}`,
                    '&:hover': {
                        bgcolor: `${nexusTheme_1.nexusColors.sapphire}15`,
                        border: `1px solid ${nexusTheme_1.nexusColors.sapphire}40`
                    },
                    '&.Mui-selected': {
                        bgcolor: `${nexusTheme_1.nexusColors.quantum}25`,
                        '&:hover': {
                            bgcolor: `${nexusTheme_1.nexusColors.quantum}30`
                        }
                    },
                    transition: 'all 0.3s ease'
                }}>
                    <material_1.ListItemIcon sx={{
                    minWidth: isDrawerOpen ? 40 : 'auto',
                    mr: isDrawerOpen ? 2 : 0,
                    color: isActive ? nexusTheme_1.nexusColors.quantum : nexusTheme_1.nexusColors.frost,
                    position: 'relative'
                }}>
                      {/* Status Indicator */}
                      <material_1.Box sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: statusColor,
                    border: `1px solid ${nexusTheme_1.nexusColors.obsidian}`,
                    boxShadow: `0 0 8px ${statusColor}80`
                }}/>

                      {/* Notification Badge */}
                      {notifications > 0 && (<material_1.Badge badgeContent={notifications} sx={{
                        '& .MuiBadge-badge': {
                            bgcolor: nexusTheme_1.nexusColors.warning,
                            color: nexusTheme_1.nexusColors.obsidian,
                            fontSize: '0.7rem',
                            minWidth: 16,
                            height: 16
                        }
                    }}>
                          {module.icon}
                        </material_1.Badge>)}

                      {notifications === 0 && module.icon}
                    </material_1.ListItemIcon>

                    <framer_motion_1.AnimatePresence>
                      {isDrawerOpen && (<framer_motion_1.motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                          <material_1.ListItemText primary={language === 'UA' ? module.titleUA : module.title} secondary={language === 'UA' ? module.descriptionUA : module.description} primaryTypographyProps={{
                        sx: {
                            color: isActive ? nexusTheme_1.nexusColors.quantum : nexusTheme_1.nexusColors.frost,
                            fontFamily: 'Orbitron, monospace',
                            fontSize: '0.95rem',
                            fontWeight: isActive ? 600 : 400
                        }
                    }} secondaryTypographyProps={{
                        sx: {
                            color: nexusTheme_1.nexusColors.nebula,
                            fontSize: '0.75rem',
                            opacity: 0.8
                        }
                    }}/>
                        </framer_motion_1.motion.div>)}
                    </framer_motion_1.AnimatePresence>
                  </material_1.ListItemButton>
                </material_1.Tooltip>
              </material_1.ListItem>
            </framer_motion_1.motion.div>);
        })}
      </material_1.List>

      {/* Footer Info */}
      <material_1.Box sx={{
            mt: 'auto',
            p: 2,
            borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}30`
        }}>
        <framer_motion_1.AnimatePresence>
          {isDrawerOpen && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.nebula,
                opacity: 0.7,
                display: 'block'
            }}>
                Predator Analytics v1.0
              </material_1.Typography>
              <material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.nebula,
                opacity: 0.5,
                display: 'block'
            }}>
                Role: {userRole} • Lang: {language}
              </material_1.Typography>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </material_1.Box>
    </material_1.Drawer>);
};
exports.NexusNavigation = NexusNavigation;
exports.default = exports.NexusNavigation;
