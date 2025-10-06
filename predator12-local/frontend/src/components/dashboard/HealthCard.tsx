// @ts-nocheck
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  HelpOutline as UnknownIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timeline as LogsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useAppEventStore } from '../../stores/appEventStore';

interface HealthCardProps {
  title: string;
  status: 'optimal' | 'degraded' | 'unknown' | 'critical';
  metric?: number;
  details?: string;
  reasons?: string[];
  onRecheck?: () => void;
  onOpenLogs?: () => void;
  onOpenSettings?: () => void;
  loading?: boolean;
  lastUpdated?: Date;
  helpText?: string;
  quickActions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    primary?: boolean;
  }>;
}

const HealthCard: React.FC<HealthCardProps> = ({
  title,
  status,
  metric,
  details,
  reasons = [],
  onRecheck,
  onOpenLogs,
  onOpenSettings,
  loading = false,
  lastUpdated,
  helpText,
  quickActions = []
}) => {
  const { addEvent } = useAppEventStore();

  const getStatusConfig = () => {
    switch (status) {
      case 'optimal':
        return {
          color: nexusColors.success,
          icon: <HealthyIcon />,
          label: 'Оптимально',
          bgColor: `${nexusColors.success}15`
        };
      case 'degraded':
        return {
          color: nexusColors.warning,
          icon: <WarningIcon />,
          label: 'Обмежено',
          bgColor: `${nexusColors.warning}15`
        };
      case 'critical':
        return {
          color: nexusColors.error,
          icon: <ErrorIcon />,
          label: 'Критично',
          bgColor: `${nexusColors.error}15`
        };
      case 'unknown':
      default:
        return {
          color: nexusColors.nebula,
          icon: <UnknownIcon />,
          label: 'Невідомо',
          bgColor: `${nexusColors.nebula}15`
        };
    }
  };

  const config = getStatusConfig();

  // Генерація пояснень для unknown станів
  const getUnknownExplanation = () => {
    if (status !== 'unknown') return null;

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
          action: () => addEvent(
            { type: 'ACTION_REQUIRED', cta: { label: 'Перевірити мережу', run: () => {} } },
            'Перевірка підключення',
            'Перевіряємо підключення до сервісу...',
            'info'
          ),
          primary: true
        },
        { 
          label: 'Переглянути логи', 
          action: onOpenLogs || (() => {}), 
          icon: <LogsIcon fontSize="small" />
        },
        { 
          label: 'Налаштування', 
          action: onOpenSettings || (() => {}), 
          icon: <SettingsIcon fontSize="small" />
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
        action: onRecheck || (() => {}),
        icon: <RefreshIcon fontSize="small" />,
        primary: true
      });
    }

    if (status === 'degraded' || status === 'critical') {
      buttons.push({
        label: 'Діагностика',
        action: () => addEvent(
          { type: 'ACTION_REQUIRED', cta: { label: 'Запустити діагностику', run: () => {} } },
          'Системна діагностика',
          'Запускаємо системну діагностику...',
          'info'
        )
      });
    }

    return buttons.slice(0, 3); // Максимум 3 кнопки
  };

  const actionButtons = getActionButtons();

  const handleAction = (actionType: 'recheck' | 'logs' | 'settings') => {
    switch (actionType) {
      case 'recheck':
        onRecheck?.();
        addEvent(
          { type: 'ACTION_REQUIRED', cta: { label: 'Recheck', run: () => {} } },
          'Перевірка стану',
          `Перевірка стану: ${title}`,
          'info'
        );
        break;
      case 'logs':
        onOpenLogs?.();
        break;
      case 'settings':
        onOpenSettings?.();
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${nexusColors.obsidian}E0, ${nexusColors.darkMatter}D0)`,
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
        }}
      >
        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: 4,
            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
            borderRadius: '4px 4px 0 0'
          }}
        />

        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: config.color }}>
                {config.icon}
              </Box>
              <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                {title}
              </Typography>
            </Box>

            <Chip
              label={config.label}
              size="small"
              sx={{
                backgroundColor: config.bgColor,
                color: config.color,
                fontWeight: 'bold',
                border: `1px solid ${config.color}40`
              }}
            />
          </Box>

          {/* Metric display */}
          {metric !== undefined && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: nexusColors.frost }}>
                  Рівень
                </Typography>
                <Typography variant="body2" sx={{ color: config.color, fontWeight: 'bold' }}>
                  {Math.round(metric * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metric * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: `${nexusColors.shadow}40`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: config.color,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}

          {/* Details */}
          {details && (
            <Typography variant="body2" sx={{ color: nexusColors.nebula, mb: 2 }}>
              {details}
            </Typography>
          )}

          {/* Unknown status explanation */}
          {status === 'unknown' && reasons.length > 0 && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                backgroundColor: `${nexusColors.nebula}15`,
                border: `1px solid ${nexusColors.nebula}40`,
                '& .MuiAlert-icon': { color: nexusColors.nebula },
                '& .MuiAlert-message': { color: nexusColors.frost }
              }}
            >
              <AlertTitle sx={{ color: nexusColors.frost, fontSize: '0.9rem' }}>
                Чому статус невідомий?
              </AlertTitle>
              <Stack spacing={0.5}>
                {reasons.map((reason, index) => (
                  <Typography key={index} variant="caption" sx={{ color: nexusColors.nebula }}>
                    • {reason}
                  </Typography>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Loading indicator */}
          {loading && (
            <LinearProgress
              sx={{
                mb: 2,
                backgroundColor: `${nexusColors.quantum}40`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: nexusColors.quantum
                }
              }}
            />
          )}

          {/* Adaptive Action buttons */}
          {actionButtons.length > 0 && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
              {actionButtons.map((action, index) => (
                <Tooltip key={index} title={action.label} placement="top">
                  <Button
                    size="small"
                    onClick={action.action}
                    disabled={loading}
                    variant={action.primary ? 'contained' : 'outlined'}
                    startIcon={action.icon}
                    sx={{
                      color: action.primary ? nexusColors.obsidian : nexusColors.frost,
                      backgroundColor: action.primary ? nexusColors.sapphire : 'transparent',
                      borderColor: action.primary ? nexusColors.sapphire : nexusColors.frost,
                      minHeight: 44, // WCAG 2.2 AA compliance
                      minWidth: 44,
                      '&:hover': {
                        backgroundColor: action.primary 
                          ? `${nexusColors.sapphire}CC` 
                          : `${nexusColors.quantum}20`,
                        borderColor: action.primary ? nexusColors.sapphire : nexusColors.quantum
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              ))}
            </Stack>
          )}

          {/* Last updated timestamp */}
          {lastUpdated && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: nexusColors.nebula, 
                opacity: 0.7,
                display: 'block',
                textAlign: 'right',
                mb: 1
              }}
            >
              Оновлено: {lastUpdated.toLocaleTimeString('uk-UA')}
            </Typography>
          )}

          {/* Suggested actions for unknown status */}
          {unknownInfo && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${nexusColors.shadow}40` }}>
              <Typography variant="subtitle2" sx={{ color: nexusColors.frost, mb: 1 }}>
                {unknownInfo.title}
              </Typography>
              <Stack spacing={1}>
                {unknownInfo.reasons.map((reason, index) => (
                  <Typography key={index} variant="caption" sx={{ color: nexusColors.nebula }}>
                    • {reason}
                  </Typography>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {unknownInfo.suggestedActions.map((action, index) => (
                  <Button
                    key={index}
                    size="small"
                    onClick={action.action}
                    variant={action.primary ? 'contained' : 'outlined'}
                    sx={{
                      color: action.primary ? nexusColors.sapphire : nexusColors.frost,
                      borderColor: action.primary ? nexusColors.sapphire : 'transparent',
                      backgroundColor: action.primary ? `${nexusColors.sapphire}20` : 'transparent',
                      minHeight: 32,
                      flex: 1
                    }}
                    startIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthCard;
