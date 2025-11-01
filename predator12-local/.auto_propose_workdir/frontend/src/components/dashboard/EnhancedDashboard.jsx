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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const appEventStore_1 = require("../../stores/appEventStore");
const HealthCard_1 = __importDefault(require("./HealthCard"));
const AgentStatusCard_1 = __importDefault(require("./AgentStatusCard"));
const NotificationHub_1 = __importDefault(require("../notifications/NotificationHub"));
const GuideDock_1 = __importDefault(require("../guide/GuideDock"));
const EnhancedDashboard = () => {
    var _a;
    const { addEvent, activateGuide } = (0, appEventStore_1.useAppEventStore)();
    const [systemHealth, setSystemHealth] = (0, react_1.useState)(null);
    const [agents, setAgents] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(new Date());
    const [isFullscreen, setIsFullscreen] = (0, react_1.useState)(false);
    // Завантаження даних
    const loadDashboardData = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setLoading(true);
            setError(null);
            // TODO: Replace with real API calls when backend is ready
            const healthData = {
                status: 'optimal',
                cpu: 45,
                memory: 62,
                activeAgents: 12,
                reasons: []
            };
            const agentsData = [];
            setSystemHealth(healthData);
            setAgents(agentsData);
            setLastUpdated(new Date());
            // Генеруємо події для unknown станів
            if (healthData.status === 'unknown') {
                healthData.reasons.forEach((reason) => {
                    addEvent({ type: 'HEALTH_UNKNOWN', source: 'backend', hint: reason }, 'Невідомий стан системи', `Невизначений стан системи: ${reason}`, 'warn');
                });
            }
            // Перевіряємо агентів
            const downAgents = agentsData.filter(a => a.status === 'down');
            downAgents.forEach(agent => {
                addEvent({ type: 'AGENT_DOWN', agentId: agent.id }, 'Агент недоступний', `Агент ${agent.name} недоступний`, 'error');
            });
        }
        catch (err) {
            const errorMessage = (err === null || err === void 0 ? void 0 : err.message) || 'Failed to load dashboard data';
            setError(errorMessage);
            addEvent({ type: 'NETWORK_OFFLINE' }, 'Помилка мережі', errorMessage, 'error');
        }
        finally {
            setLoading(false);
        }
    });
    // Обробники дій
    const handleRefresh = () => {
        loadDashboardData();
        activateGuide('dashboard');
    };
    const handleRestartAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // TODO: Implement real restart when backend is ready
            console.log('Restarting agent:', agentId);
            addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Перезапуск', run: () => { } } }, 'Перезапуск агента', `Agent ${agentId} restart initiated`, 'success');
            // Оновлюємо дані через кілька секунд
            setTimeout(loadDashboardData, 2000);
        }
        catch (err) {
            console.error('Restart agent error:', err);
        }
    });
    const handleViewLogs = (agentId) => {
        activateGuide('logs');
        addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Відкрити логи', run: () => { } } }, 'Перегляд логів', `Відкриваємо логи агента ${agentId}`, 'info');
    };
    const handleOpenSettings = (componentName) => {
        activateGuide('settings');
        addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Налаштування', run: () => { } } }, 'Відкриття налаштувань', `Відкриваємо налаштування ${componentName || 'системи'}`, 'info');
    };
    const handleFullscreenToggle = () => {
        var _a, _b, _c;
        if (!document.fullscreenElement) {
            (_b = (_a = document.documentElement).requestFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a);
            setIsFullscreen(true);
        }
        else {
            (_c = document.exitFullscreen) === null || _c === void 0 ? void 0 : _c.call(document);
            setIsFullscreen(false);
        }
    };
    // Початкове завантаження даних
    (0, react_1.useEffect)(() => {
        loadDashboardData();
        // Автооновлення кожні 30 секунд
        const interval = setInterval(loadDashboardData, 30000);
        // TODO: Реальний WebSocket для подій реального часу
        // const ws = nexusAPI.connectWebSocket((event: any) => {
        //   let message = '';
        //   let level: 'info' | 'success' | 'warn' | 'error' = 'info';
        //
        //   switch (event.type) {
        //     case 'HEALTH_UNKNOWN':
        //       message = `Компонент ${event.source} не відповідає`;
        //       level = 'warn';
        //       break;
        //     case 'AGENT_DOWN':
        //       message = `Агент ${event.agentId} припинив роботу`;
        //       level = 'error';
        //       break;
        //     case 'NETWORK_OFFLINE':
        //       message = 'Втрачено мережеве підключення';
        //       level = 'error';
        //       break;
        //     case 'ACTION_REQUIRED':
        //       message = 'Потрібна дія користувача';
        //       level = 'warn';
        //       break;
        //   }
        //
        //   if (message) {
        //     addEvent(event, 'Системна подія', message, level);
        //   }
        // });
        return () => {
            clearInterval(interval);
            // ws?.close();
        };
    }, [addEvent]);
    // Обробка fullscreen режиму
    (0, react_1.useEffect)(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);
    return (<material_1.Box style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian} 0%, ${nexusTheme_1.nexusColors.darkMatter} 50%, ${nexusTheme_1.nexusColors.obsidian} 100%)`,
            position: 'relative',
            overflow: 'hidden'
        }}>
      {/* Background effects */}
      <material_1.Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
            radial-gradient(circle at 20% 80%, ${nexusTheme_1.nexusColors.quantum}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${nexusTheme_1.nexusColors.sapphire}10 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${nexusTheme_1.nexusColors.nebula}05 0%, transparent 50%)
          `,
            zIndex: 0
        }}/>

      {/* Header */}
      <material_1.Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 3, pb: 2 }}>
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <material_1.Box>
              <material_1.Typography variant="h3" sx={{
            color: nexusTheme_1.nexusColors.frost,
            fontFamily: 'Orbitron, monospace',
            fontWeight: 700,
            textShadow: `0 0 20px ${nexusTheme_1.nexusColors.quantum}50`,
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.frost}, ${nexusTheme_1.nexusColors.quantum})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
                Міст Управління
              </material_1.Typography>
              <material_1.Typography variant="subtitle1" sx={{
            color: nexusTheme_1.nexusColors.nebula,
            mt: 1,
            opacity: 0.8
        }}>
                Predator11 • Multi-Agent System Dashboard
              </material_1.Typography>
            </material_1.Box>

            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Last updated indicator */}
              <material_1.Typography variant="caption" sx={{
            color: nexusTheme_1.nexusColors.nebula,
            opacity: 0.7
        }}>
                Оновлено: {lastUpdated.toLocaleTimeString('uk-UA')}
              </material_1.Typography>

              <material_1.Tooltip title="Оновити дані">
                <material_1.IconButton onClick={handleRefresh} disabled={loading} sx={{
            color: nexusTheme_1.nexusColors.quantum,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`
            }
        }}>
                  <icons_material_1.Refresh sx={{
            animation: loading ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' }
            }
        }}/>
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title={isFullscreen ? 'Вийти з повноекранного режиму' : 'Повноекранний режим'}>
                <material_1.IconButton onClick={handleFullscreenToggle} sx={{
            color: nexusTheme_1.nexusColors.frost,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.frost}20`
            }
        }}>
                  <icons_material_1.Fullscreen />
                </material_1.IconButton>
              </material_1.Tooltip>

              <material_1.Tooltip title="Налаштування системи">
                <material_1.IconButton onClick={() => handleOpenSettings()} sx={{
            color: nexusTheme_1.nexusColors.nebula,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
                backgroundColor: `${nexusTheme_1.nexusColors.nebula}20`
            }
        }}>
                  <icons_material_1.Settings />
                </material_1.IconButton>
              </material_1.Tooltip>
            </material_1.Box>
          </material_1.Box>
        </framer_motion_1.motion.div>

        {/* Error Alert */}
        {error && (<material_1.Fade in={true}>
            <material_1.Alert severity="error" sx={{
                mb: 3,
                backgroundColor: `${nexusTheme_1.nexusColors.error}15`,
                border: `1px solid ${nexusTheme_1.nexusColors.error}40`,
                '& .MuiAlert-icon': { color: nexusTheme_1.nexusColors.error }
            }} action={<material_1.IconButton onClick={loadDashboardData} size="small" sx={{ color: nexusTheme_1.nexusColors.error }}>
                  <icons_material_1.Refresh />
                </material_1.IconButton>}>
              <material_1.AlertTitle sx={{ color: nexusTheme_1.nexusColors.frost }}>Помилка завантаження</material_1.AlertTitle>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                {error}
              </material_1.Typography>
            </material_1.Alert>
          </material_1.Fade>)}

        {/* Dashboard Grid */}
        <material_1.Grid container spacing={3}>
          {/* System Health */}
          <material_1.Grid item xs={12} md={6} lg={4}>
            <HealthCard_1.default title="Стан системи" status={(systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.status) || 'unknown'} metric={(systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.status) === 'ok' ? 0.95 : (systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.status) === 'degraded' ? 0.7 : undefined} details={systemHealth ? `Status: ${systemHealth.status}` : undefined} reasons={systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.reasons} onRecheck={loadDashboardData} onOpenLogs={() => handleViewLogs('system')} onOpenSettings={() => handleOpenSettings('система')} loading={loading} lastUpdated={lastUpdated} helpText="Загальний стан всіх компонентів системи" quickActions={(systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.status) === 'unknown' ? [
            {
                label: 'Діагностика',
                action: () => {
                    activateGuide('diagnostics');
                    addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Запуск діагностики', run: () => { } } }, 'Системна діагностика', 'Запускаємо повну діагностику системи...', 'info');
                },
                primary: true
            }
        ] : []}/>
          </material_1.Grid>

          {/* Components Health */}
          {(_a = systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.components) === null || _a === void 0 ? void 0 : _a.map((component, index) => (<material_1.Grid item xs={12} md={6} lg={4} key={component.name}>
              <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <HealthCard_1.default title={component.name} status={component.status} reasons={component.reasons} onRecheck={loadDashboardData} onOpenLogs={() => handleViewLogs(component.name)} onOpenSettings={() => handleOpenSettings(component.name)} loading={loading} lastUpdated={component.lastCheck} quickActions={[]}/>
              </framer_motion_1.motion.div>
            </material_1.Grid>))}

          {/* Agents Status */}
          <material_1.Grid item xs={12} lg={8}>
            <AgentStatusCard_1.default agents={agents} onRestartAgent={handleRestartAgent} onViewLogs={handleViewLogs} onOpenSettings={handleOpenSettings} loading={loading}/>
          </material_1.Grid>

          {/* Additional metrics can be added here */}
        </material_1.Grid>
      </material_1.Container>

      {/* Fixed UI elements */}
      <NotificationHub_1.default />
      <GuideDock_1.default currentModule="dashboard" systemHealth={systemHealth === null || systemHealth === void 0 ? void 0 : systemHealth.status}/>
    </material_1.Box>);
};
exports.default = EnhancedDashboard;
