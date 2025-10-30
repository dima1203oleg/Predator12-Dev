"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const appEventStore_1 = require("../../stores/appEventStore");
const HealthCard = ({ title, status, metric, details, reasons = [], onRecheck, onOpenLogs, onOpenSettings, loading = false, lastUpdated, helpText, quickActions = [] }) => {
    const { addEvent } = (0, appEventStore_1.useAppEventStore)();
    const getStatusConfig = () => {
        switch (status) {
            case 'optimal':
                return {
                    color: nexusTheme_1.nexusColors.success,
                    icon: <icons_material_1.CheckCircle />,
                    label: 'Оптимально',
                    bgColor: `${nexusTheme_1.nexusColors.success}15`
                };
            case 'degraded':
                return {
                    color: nexusTheme_1.nexusColors.warning,
                    icon: <icons_material_1.Warning />,
                    label: 'Обмежено',
                    bgColor: `${nexusTheme_1.nexusColors.warning}15`
                };
            case 'critical':
                return {
                    color: nexusTheme_1.nexusColors.error,
                    icon: <icons_material_1.Error />,
                    label: 'Критично',
                    bgColor: `${nexusTheme_1.nexusColors.error}15`
                };
            case 'unknown':
            default:
                return {
                    color: nexusTheme_1.nexusColors.nebula,
                    icon: <icons_material_1.HelpOutline />,
                    label: 'Невідомо',
                    bgColor: `${nexusTheme_1.nexusColors.nebula}15`
                };
        }
    };
    const config = getStatusConfig();
    // Генерація пояснень для unknown станів
    const getUnknownExplanation = () => {
        if (status !== 'unknown')
            return null;
        const commonReasons = [
            'Недостатньо метрик для оцінки',
            'Таймаут підключення до сервісу',
            'Відсутні права доступу',
            'Сервіс не відповідає на запити',
            'Помилка в конфігурації'
        ];
        const explanation = reasons.length > 0 ? reasons : commonReasons.slice(0, 2);
        return {
            title: 'Чому статус невідомий?',
            reasons: explanation,
            suggestedActions: [
                {
                    label: 'Перевірити підключення',
                    action: () => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Перевірити мережу', run: () => { } } }, 'Перевірка підключення', 'Перевіряємо підключення до сервісу...', 'info'),
                    primary: true
                },
                {
                    label: 'Переглянути логи',
                    action: onOpenLogs || (() => { }),
                    icon: <icons_material_1.Timeline fontSize="small"/>
                },
                {
                    label: 'Налаштування',
                    action: onOpenSettings || (() => { }),
                    icon: <icons_material_1.Settings fontSize="small"/>
                }
            ]
        };
    };
    const unknownInfo = getUnknownExplanation();
    // Автоматична генерація CTA кнопок
    const getActionButtons = () => {
        const buttons = [...quickActions];
        // Додаємо стандартні дії для кожного статусу
        if (status === 'unknown' || status === 'critical') {
            buttons.unshift({
                label: 'Оновити',
                action: onRecheck || (() => { }),
                icon: <icons_material_1.Refresh fontSize="small"/>,
                primary: true
            });
        }
        if (status === 'degraded' || status === 'critical') {
            buttons.push({
                label: 'Діагностика',
                action: () => addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Запустити діагностику', run: () => { } } }, 'Системна діагностика', 'Запускаємо системну діагностику...', 'info')
            });
        }
        return buttons.slice(0, 3); // Максимум 3 кнопки
    };
    const actionButtons = getActionButtons();
    const handleAction = (actionType) => {
        switch (actionType) {
            case 'recheck':
                onRecheck === null || onRecheck === void 0 ? void 0 : onRecheck();
                addEvent({ type: 'ACTION_REQUIRED', cta: { label: 'Recheck', run: () => { } } }, 'Перевірка стану', `Перевірка стану: ${title}`, 'info');
                break;
            case 'logs':
                onOpenLogs === null || onOpenLogs === void 0 ? void 0 : onOpenLogs();
                break;
            case 'settings':
                onOpenSettings === null || onOpenSettings === void 0 ? void 0 : onOpenSettings();
                break;
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} whileHover={{ y: -2 }}>
      <material_1.Card sx={{
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E0, ${nexusTheme_1.nexusColors.darkMatter}D0)`,
            border: `1px solid ${config.color}60`,
            borderRadius: 2,
            position: 'relative',
            overflow: 'visible',
            minHeight: 180,
            '&:hover': {
                border: `1px solid ${config.color}80`,
                boxShadow: `0 8px 32px ${config.color}20`
            },
            transition: 'all 0.3s ease'
        }}>
        {/* Status indicator */}
        <material_1.Box sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: 4,
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
            borderRadius: '4px 4px 0 0'
        }}/>

        <material_1.CardContent sx={{ p: 3 }}>
          {/* Header */}
          <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <material_1.Box sx={{ color: config.color }}>
                {config.icon}
              </material_1.Box>
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                {title}
              </material_1.Typography>
            </material_1.Box>

            <material_1.Chip label={config.label} size="small" sx={{
            backgroundColor: config.bgColor,
            color: config.color,
            fontWeight: 'bold',
            border: `1px solid ${config.color}40`
        }}/>
          </material_1.Box>

          {/* Metric display */}
          {metric !== undefined && (<material_1.Box sx={{ mb: 2 }}>
              <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                  Рівень
                </material_1.Typography>
                <material_1.Typography variant="body2" sx={{ color: config.color, fontWeight: 'bold' }}>
                  {Math.round(metric * 100)}%
                </material_1.Typography>
              </material_1.Box>
              <material_1.LinearProgress variant="determinate" value={metric * 100} sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${nexusTheme_1.nexusColors.shadow}40`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: config.color,
                    borderRadius: 3
                }
            }}/>
            </material_1.Box>)}

          {/* Details */}
          {details && (<material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.nebula, mb: 2 }}>
              {details}
            </material_1.Typography>)}

          {/* Unknown status explanation */}
          {status === 'unknown' && reasons.length > 0 && (<material_1.Alert severity="info" sx={{
                mb: 2,
                backgroundColor: `${nexusTheme_1.nexusColors.nebula}15`,
                border: `1px solid ${nexusTheme_1.nexusColors.nebula}40`,
                '& .MuiAlert-icon': { color: nexusTheme_1.nexusColors.nebula },
                '& .MuiAlert-message': { color: nexusTheme_1.nexusColors.frost }
            }}>
              <material_1.AlertTitle sx={{ color: nexusTheme_1.nexusColors.frost, fontSize: '0.9rem' }}>
                Чому статус невідомий?
              </material_1.AlertTitle>
              <material_1.Stack spacing={0.5}>
                {reasons.map((reason, index) => (<material_1.Typography key={index} variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                    • {reason}
                  </material_1.Typography>))}
              </material_1.Stack>
            </material_1.Alert>)}

          {/* Loading indicator */}
          {loading && (<material_1.LinearProgress sx={{
                mb: 2,
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}40`,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: nexusTheme_1.nexusColors.quantum
                }
            }}/>)}

          {/* Adaptive Action buttons */}
          {actionButtons.length > 0 && (<material_1.Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
              {actionButtons.map((action, index) => (<material_1.Tooltip key={index} title={action.label} placement="top">
                  <material_1.Button size="small" onClick={action.action} disabled={loading} variant={action.primary ? 'contained' : 'outlined'} startIcon={action.icon} sx={{
                    color: action.primary ? nexusTheme_1.nexusColors.obsidian : nexusTheme_1.nexusColors.frost,
                    backgroundColor: action.primary ? nexusTheme_1.nexusColors.sapphire : 'transparent',
                    borderColor: action.primary ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.frost,
                    minHeight: 44,
                    minWidth: 44,
                    '&:hover': {
                        backgroundColor: action.primary
                            ? `${nexusTheme_1.nexusColors.sapphire}CC`
                            : `${nexusTheme_1.nexusColors.quantum}20`,
                        borderColor: action.primary ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.quantum
                    }
                }}>
                    {action.label}
                  </material_1.Button>
                </material_1.Tooltip>))}
            </material_1.Stack>)}

          {/* Last updated timestamp */}
          {lastUpdated && (<material_1.Typography variant="caption" sx={{
                color: nexusTheme_1.nexusColors.nebula,
                opacity: 0.7,
                display: 'block',
                textAlign: 'right',
                mb: 1
            }}>
              Оновлено: {lastUpdated.toLocaleTimeString('uk-UA')}
            </material_1.Typography>)}

          {/* Suggested actions for unknown status */}
          {unknownInfo && (<material_1.Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${nexusTheme_1.nexusColors.shadow}40` }}>
              <material_1.Typography variant="subtitle2" sx={{ color: nexusTheme_1.nexusColors.frost, mb: 1 }}>
                {unknownInfo.title}
              </material_1.Typography>
              <material_1.Stack spacing={1}>
                {unknownInfo.reasons.map((reason, index) => (<material_1.Typography key={index} variant="caption" sx={{ color: nexusTheme_1.nexusColors.nebula }}>
                    • {reason}
                  </material_1.Typography>))}
              </material_1.Stack>
              <material_1.Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {unknownInfo.suggestedActions.map((action, index) => (<material_1.Button key={index} size="small" onClick={action.action} variant={action.primary ? 'contained' : 'outlined'} sx={{
                    color: action.primary ? nexusTheme_1.nexusColors.sapphire : nexusTheme_1.nexusColors.frost,
                    borderColor: action.primary ? nexusTheme_1.nexusColors.sapphire : 'transparent',
                    backgroundColor: action.primary ? `${nexusTheme_1.nexusColors.sapphire}20` : 'transparent',
                    minHeight: 32,
                    flex: 1
                }} startIcon={action.icon}>
                    {action.label}
                  </material_1.Button>))}
              </material_1.Stack>
            </material_1.Box>)}
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
exports.default = HealthCard;
