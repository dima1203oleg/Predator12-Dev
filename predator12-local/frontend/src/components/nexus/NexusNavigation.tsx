// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Tooltip, Badge, Divider } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as MASIcon,
  DataObject as ETLIcon,
  Timeline as ChronoIcon,
  Science as SimulatorIcon,
  Search as OpenSearchIcon,
  Security as AdminIcon,
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
  AccountTree as DataFlowIcon,
  Psychology as AISystemIcon,
  Analytics as AnalyticsIcon,
  Shield as SecurityIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

// Типи модулів згідно з ТЗ
export type NexusModule =
  | 'dashboard'
  | 'mas'
  | 'etl'
  | 'chrono'
  | 'simulator'
  | 'opensearch'
  | 'admin'
  | 'self-improvement'
  | 'data-flow'
  | 'ai-system'
  | 'analytics'
  | 'security';

interface ModuleConfig {
  id: NexusModule;
  title: string;
  titleUA: string;
  icon: React.ReactNode;
  description: string;
  descriptionUA: string;
  roles: ('Admin' | 'Analyst' | 'Viewer')[];
  notifications?: number;
  status?: 'ok' | 'warning' | 'error' | 'unknown';
}

// Конфігурація модулів згідно з ТЗ п.5
const NEXUS_MODULES: ModuleConfig[] = [
  {
    id: 'dashboard',
    title: 'Command Bridge',
    titleUA: 'Міст Управління',
    icon: <DashboardIcon />,
    description: 'System Health, Agents, Pipelines, Integrations',
    descriptionUA: 'Стан системи, Агенти, Конвеєри, Інтеграції',
    roles: ['Admin', 'Analyst', 'Viewer']
  },
  {
    id: 'mas',
    title: 'AI Orbital Node',
    titleUA: 'Орбітальний Вузол ШІ',
    icon: <MASIcon />,
    description: 'Agent states, logs, restarts, health probes',
    descriptionUA: 'Стан агентів, логи, перезапуски, health-проби',
    roles: ['Admin', 'Analyst', 'Viewer']
  },
  {
    id: 'etl',
    title: 'Data Factory',
    titleUA: 'Фабрика Даних',
    icon: <ETLIcon />,
    description: 'Queues, jobs, connector status, manual runs',
    descriptionUA: 'Черги, джоби, статус конекторів, manual run',
    roles: ['Admin', 'Analyst']
  },
  {
    id: 'chrono',
    title: 'Chrono Analysis',
    titleUA: 'Хроно-Аналіз',
    icon: <ChronoIcon />,
    description: '4D timelines, trends, anomalies',
    descriptionUA: '4D таймлайни, тренди, аномалії',
    roles: ['Admin', 'Analyst', 'Viewer']
  },
  {
    id: 'simulator',
    title: 'Reality Simulator',
    titleUA: 'Симулятор Реальностей',
    icon: <SimulatorIcon />,
    description: 'What-if scenarios, execution, parameters',
    descriptionUA: 'What-if сценарії, запуск, параметри',
    roles: ['Admin', 'Analyst']
  },
  {
    id: 'opensearch',
    title: 'Analytics Deck',
    titleUA: 'Аналітична Палуба',
    icon: <OpenSearchIcon />,
    description: 'OpenSearch Dashboard integration',
    descriptionUA: 'Інтеграція OpenSearch Dashboard',
    roles: ['Admin', 'Analyst', 'Viewer']
  },
  {
    id: 'admin',
    title: 'Architect Sanctuary',
    titleUA: 'Святилище Архітектора',
    icon: <AdminIcon />,
    description: 'Secrets, tokens, integrations, feature flags',
    descriptionUA: 'Секрети, токени, інтеграції, фіча-флаги',
    roles: ['Admin']
  },
  {
    id: 'self-improvement',
    title: 'AI Self-Evolution',
    titleUA: 'AI Самоеволюція',
    icon: <MASIcon />,
    description: 'Real-time self-improvement and business analytics',
    descriptionUA: 'Самовдосконалення та бізнес-аналітика в реальному часі',
    roles: ['Admin', 'Analyst', 'Viewer']
  },
  {
    id: 'data-flow',
    title: 'Data Flow Map',
    titleUA: 'Карта Потоків Даних',
    icon: <DataFlowIcon />,
    description: '3D visualization of data flows and connections',
    descriptionUA: '3D візуалізація потоків даних та з\'єднань',
    roles: ['Admin', 'Analyst', 'Viewer'],
    status: 'ok'
  },
  {
    id: 'ai-system',
    title: 'AI Neural Network',
    titleUA: 'AI Нейронна Мережа',
    icon: <AISystemIcon />,
    description: 'Advanced AI agents with intelligence metrics',
    descriptionUA: 'Просунуті AI агенти з метриками інтелекту',
    roles: ['Admin', 'Analyst'],
    status: 'ok'
  },
  {
    id: 'analytics',
    title: 'Real-time Analytics',
    titleUA: 'Аналітика в Реальному Часі',
    icon: <AnalyticsIcon />,
    description: 'Live data streams and performance metrics',
    descriptionUA: 'Живі потоки даних та метрики продуктивності',
    roles: ['Admin', 'Analyst', 'Viewer'],
    status: 'ok'
  },
  {
    id: 'security',
    title: 'Cyber Security Shield',
    titleUA: 'Кібер-Безпека Щит',
    icon: <SecurityIcon />,
    description: 'Threat detection and security monitoring',
    descriptionUA: 'Виявлення загроз та моніторинг безпеки',
    roles: ['Admin', 'Analyst'],
    status: 'warning'
  }
];

interface NexusContextValue {
  activeModule: NexusModule;
  setActiveModule: (module: NexusModule) => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  userRole: 'Admin' | 'Analyst' | 'Viewer';
  language: 'UA' | 'EN';
  setLanguage: (lang: 'UA' | 'EN') => void;
}

const NexusContext = createContext<NexusContextValue | null>(null);

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within NexusProvider');
  }
  return context;
};

interface NexusProviderProps {
  children: React.ReactNode;
  defaultModule?: NexusModule;
  userRole?: 'Admin' | 'Analyst' | 'Viewer';
}

export const NexusProvider: React.FC<NexusProviderProps> = ({
  children,
  defaultModule = 'dashboard',
  userRole = 'Analyst'
}) => {
  const [activeModule, setActiveModule] = useState<NexusModule>(defaultModule);
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const [language, setLanguage] = useState<'UA' | 'EN'>('UA');

  const value: NexusContextValue = {
    activeModule,
    setActiveModule,
    isDrawerOpen,
    setDrawerOpen,
    userRole,
    language,
    setLanguage
  };

  return (
    <NexusContext.Provider value={value}>
      {children}
    </NexusContext.Provider>
  );
};

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

export const NexusNavigation: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isDrawerOpen,
    setDrawerOpen,
    userRole,
    language
  } = useNexus();

  // Фільтруємо модулі за ролями користувача
  const availableModules = NEXUS_MODULES.filter(module =>
    module.roles.includes(userRole)
  );

  const handleModuleClick = (moduleId: NexusModule) => {
    setActiveModule(moduleId);
  };

  const getModuleStatus = (moduleId: NexusModule): 'ok' | 'warning' | 'error' | 'unknown' => {
    // TODO: Замінити на реальний API-виклик, наприклад systemStatusAPI.getModuleStatus(moduleId)
    // return await systemStatusAPI.getModuleStatus(moduleId);
    return 'unknown';
  };

  const getNotificationCount = (moduleId: NexusModule): number => {
    // TODO: Замінити на реальний API-виклик, наприклад NotificationHub.getCount(moduleId)
    // return await NotificationHub.getCount(moduleId);
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return nexusColors.success;
      case 'warning': return nexusColors.warning;
      case 'error': return nexusColors.error;
      case 'unknown': return nexusColors.nebula;
      default: return nexusColors.frost;
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: 'border-box',
          background: `linear-gradient(180deg, ${nexusColors.obsidian}F0, ${nexusColors.darkMatter}E0)`,
          borderRight: `1px solid ${nexusColors.quantum}40`,
          backdropFilter: 'blur(20px)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${nexusColors.quantum}30`
      }}>
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: nexusColors.frost,
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                NEXUS MODULES
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip title={isDrawerOpen ? 'Згорнути панель' : 'Розгорнути панель'}>
          <IconButton
            onClick={() => setDrawerOpen(!isDrawerOpen)}
            sx={{
              color: nexusColors.quantum,
              minWidth: 44,
              minHeight: 44,
              '&:hover': {
                backgroundColor: `${nexusColors.quantum}20`,
                color: nexusColors.sapphire
              }
            }}
          >
            {isDrawerOpen ? <CollapseIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Modules List */}
      <List sx={{ px: 1, py: 2 }}>
        {availableModules.map((module, index) => {
          const isActive = activeModule === module.id;
          const status = getModuleStatus(module.id);
          const notifications = getNotificationCount(module.id);
          const statusColor = getStatusColor(status);

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <Tooltip
                  title={
                    !isDrawerOpen ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {language === 'UA' ? module.titleUA : module.title}
                        </Typography>
                        <Typography variant="caption">
                          {language === 'UA' ? module.descriptionUA : module.description}
                        </Typography>
                        {notifications > 0 && (
                          <Typography variant="caption" sx={{ color: nexusColors.warning }}>
                            • {notifications} сповіщень
                          </Typography>
                        )}
                      </Box>
                    ) : ''
                  }
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    selected={isActive}
                    onClick={() => handleModuleClick(module.id)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 56,
                      bgcolor: isActive ? `${nexusColors.quantum}20` : 'transparent',
                      border: `1px solid ${isActive ? nexusColors.quantum : 'transparent'}`,
                      '&:hover': {
                        bgcolor: `${nexusColors.sapphire}15`,
                        border: `1px solid ${nexusColors.sapphire}40`
                      },
                      '&.Mui-selected': {
                        bgcolor: `${nexusColors.quantum}25`,
                        '&:hover': {
                          bgcolor: `${nexusColors.quantum}30`
                        }
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: isDrawerOpen ? 40 : 'auto',
                      mr: isDrawerOpen ? 2 : 0,
                      color: isActive ? nexusColors.quantum : nexusColors.frost,
                      position: 'relative'
                    }}>
                      {/* Status Indicator */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: statusColor,
                          border: `1px solid ${nexusColors.obsidian}`,
                          boxShadow: `0 0 8px ${statusColor}80`
                        }}
                      />

                      {/* Notification Badge */}
                      {notifications > 0 && (
                        <Badge
                          badgeContent={notifications}
                          sx={{
                            '& .MuiBadge-badge': {
                              bgcolor: nexusColors.warning,
                              color: nexusColors.obsidian,
                              fontSize: '0.7rem',
                              minWidth: 16,
                              height: 16
                            }
                          }}
                        >
                          {module.icon}
                        </Badge>
                      )}

                      {notifications === 0 && module.icon}
                    </ListItemIcon>

                    <AnimatePresence>
                      {isDrawerOpen && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <ListItemText
                            primary={language === 'UA' ? module.titleUA : module.title}
                            secondary={language === 'UA' ? module.descriptionUA : module.description}
                            primaryTypographyProps={{
                              sx: {
                                color: isActive ? nexusColors.quantum : nexusColors.frost,
                                fontFamily: 'Orbitron, monospace',
                                fontSize: '0.95rem',
                                fontWeight: isActive ? 600 : 400
                              }
                            }}
                            secondaryTypographyProps={{
                              sx: {
                                color: nexusColors.nebula,
                                fontSize: '0.75rem',
                                opacity: 0.8
                              }
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </motion.div>
          );
        })}
      </List>

      {/* Footer Info */}
      <Box sx={{
        mt: 'auto',
        p: 2,
        borderTop: `1px solid ${nexusColors.quantum}30`
      }}>
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: nexusColors.nebula,
                  opacity: 0.7,
                  display: 'block'
                }}
              >
                Predator Analytics v1.0
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: nexusColors.nebula,
                  opacity: 0.5,
                  display: 'block'
                }}
              >
                Role: {userRole} • Lang: {language}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Drawer>
  );
};

export default NexusNavigation;
