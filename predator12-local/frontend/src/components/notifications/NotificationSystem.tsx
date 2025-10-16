// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Fab,
  Badge,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Close as CloseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Rocket as RocketIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';

export interface NotificationData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  actionable?: boolean;
  soundEnabled?: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: 'system' | 'ai' | 'security' | 'achievement' | 'general';
  icon?: React.ComponentType;
  color?: string;
  xp?: number;
}

interface NotificationSystemProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  soundEnabled, 
  onSoundToggle 
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [autoHide, setAutoHide] = useState(true);
  const audioContext = useRef<AudioContext | null>(null);

  // Звукові ефекти
  const playNotificationSound = useCallback((type: string, priority: string) => {
    if (!soundEnabled) return;

    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Різні звуки для різних типів нотифікацій
      let frequency = 440;
      let duration = 0.3;

      switch (type) {
        case 'success':
        case 'achievement':
          frequency = 523; // C5
          duration = 0.5;
          break;
        case 'warning':
          frequency = 349; // F4
          duration = 0.4;
          break;
        case 'error':
          frequency = 196; // G3
          duration = 0.6;
          break;
        case 'info':
          frequency = 440; // A4
          duration = 0.3;
          break;
        case 'system':
          frequency = 659; // E5
          duration = 0.2;
          break;
      }

      // Вища частота для критичних нотифікацій
      if (priority === 'critical') {
        frequency *= 1.5;
        duration *= 1.5;
      }

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // Для досягнень грає мелодію
      if (type === 'achievement') {
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.frequency.setValueAtTime(659, ctx.currentTime); // E5
          osc2.type = 'sine';
          gain2.gain.setValueAtTime(0, ctx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.3);
        }, 200);
      }
    } catch (error) {
      console.warn('Звук не підтримується:', error);
    }
  }, [soundEnabled]);

  // Додавання нотифікації
  const addNotification = useCallback((notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Максимум 50 нотифікацій
    
    // Програвання звуку
    playNotificationSound(notification.type, notification.priority);

    // Автоматичне приховування
    if (autoHide && !notification.persistent) {
      const hideDelay = notification.priority === 'critical' ? 8000 : 
                      notification.priority === 'high' ? 6000 : 4000;
      
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, hideDelay);
    }

    return newNotification.id;
  }, [playNotificationSound, autoHide]);

  // Видалення нотифікації
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Очищення всіх нотифікацій
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Функція для отримання іконки нотифікації
  const getNotificationIcon = (notification: NotificationData) => {
    if (notification.icon) {
      const IconComponent = notification.icon;
      return <IconComponent />;
    }

    switch (notification.type) {
      case 'success':
        return <SuccessIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'achievement':
        return <RocketIcon />;
      case 'system':
        return <SecurityIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Функція для отримання кольору нотифікації
  const getNotificationColor = (notification: NotificationData) => {
    if (notification.color) return notification.color;

    switch (notification.type) {
      case 'success':
        return nexusColors.success.main;
      case 'warning':
        return nexusColors.warning.main;
      case 'error':
        return nexusColors.error.main;
      case 'achievement':
        return nexusColors.secondary.main;
      case 'system':
        return nexusColors.primary.main;
      default:
        return nexusColors.info.main;
    }
  };

  // Симуляція системних нотифікацій
  useEffect(() => {
    const interval = setInterval(() => {
      const notificationTypes = [
        {
          type: 'system' as const,
          title: '🤖 AI Агент Активований',
          message: 'SelfHealingAgent почав моніторинг системи',
          priority: 'normal' as const,
          category: 'ai' as const,
          icon: PsychologyIcon
        },
        {
          type: 'info' as const,
          title: '📊 Оновлення Метрик',
          message: 'Нові дані аналітики доступні',
          priority: 'low' as const,
          category: 'general' as const,
          icon: AnalyticsIcon
        },
        {
          type: 'success' as const,
          title: '✅ Завдання Виконано',
          message: 'Оптимізація системи завершена успішно',
          priority: 'normal' as const,
          category: 'system' as const
        },
        {
          type: 'achievement' as const,
          title: '🏆 Нове Досягнення!',
          message: 'Ви досягли рівня "Експерт"',
          priority: 'high' as const,
          category: 'achievement' as const,
          xp: 250
        }
      ];

      if (Math.random() < 0.3) { // 30% шанс кожні 10 секунд
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        addNotification(randomNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [addNotification]);

  const unreadCount = notifications.length;
  const criticalCount = notifications.filter(n => n.priority === 'critical').length;

  return (
    <>
      {/* Кнопка відкриття панелі нотифікацій */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Fab
          color="primary"
          onClick={() => setShowPanel(true)}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            background: unreadCount > 0 
              ? 'linear-gradient(45deg, #ff9800, #ffc107)'
              : 'linear-gradient(45deg, #2196f3, #03dac6)',
            '&:hover': {
              background: unreadCount > 0 
                ? 'linear-gradient(45deg, #f57c00, #ffb300)'
                : 'linear-gradient(45deg, #1976d2, #0097a7)',
              transform: 'scale(1.1)',
            }
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
          </Badge>
        </Fab>
      </motion.div>

      {/* Панель нотифікацій */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            style={{
              position: 'fixed',
              top: 80,
              right: 24,
              bottom: 24,
              width: 380,
              zIndex: 1500,
              pointerEvents: 'auto'
            }}
          >
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusColors.primary.main}`,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Заголовок панелі */}
              <CardContent sx={{ borderBottom: `1px solid ${nexusColors.primary.main}`, pb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" sx={{ color: nexusColors.primary.main, fontWeight: 'bold' }}>
                    🔔 Нотифікації
                  </Typography>
                  <IconButton onClick={() => setShowPanel(false)} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={soundEnabled}
                        onChange={onSoundToggle}
                        size="small"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                        <Typography variant="caption">Звук</Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoHide}
                        onChange={(e) => setAutoHide(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption">Автоприховування</Typography>
                    }
                  />
                </Box>
                
                {notifications.length > 0 && (
                  <Box display="flex" gap={1} mt={2}>
                    <Chip
                      label={`Всього: ${notifications.length}`}
                      size="small"
                      sx={{ background: nexusColors.primary.main, color: 'white' }}
                    />
                    {criticalCount > 0 && (
                      <Chip
                        label={`Критичні: ${criticalCount}`}
                        size="small"
                        sx={{ background: nexusColors.error.main, color: 'white' }}
                      />
                    )}
                  </Box>
                )}
              </CardContent>

              {/* Список нотифікацій */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <AnimatePresence>
                  {notifications.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <NotificationsIcon sx={{ fontSize: 48, color: nexusColors.grey[600], mb: 2 }} />
                      <Typography color="textSecondary">
                        Нотифікацій немає
                      </Typography>
                    </Box>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ marginBottom: 12 }}
                      >
                        <Card
                          sx={{
                            background: `linear-gradient(135deg, ${getNotificationColor(notification)}15, ${getNotificationColor(notification)}05)`,
                            border: `1px solid ${getNotificationColor(notification)}`,
                            borderLeft: `4px solid ${getNotificationColor(notification)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 0 15px ${getNotificationColor(notification)}30`,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <CardContent sx={{ py: 2 }}>
                            <Box display="flex" alignItems="flex-start" gap={2}>
                              <Avatar
                                sx={{
                                  background: getNotificationColor(notification),
                                  width: 40,
                                  height: 40
                                }}
                              >
                                {getNotificationIcon(notification)}
                              </Avatar>
                              
                              <Box flex={1}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ color: getNotificationColor(notification), fontWeight: 'bold' }}
                                  >
                                    {notification.title}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeNotification(notification.id)}
                                    sx={{ color: nexusColors.grey[400] }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                                  {notification.message}
                                </Typography>
                                
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <Typography variant="caption" color="textSecondary">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </Typography>
                                  
                                  <Box display="flex" gap={1}>
                                    <Chip
                                      label={notification.priority.toUpperCase()}
                                      size="small"
                                      sx={{
                                        fontSize: '0.6rem',
                                        height: 20,
                                        background: notification.priority === 'critical' ? nexusColors.error.main : 
                                                  notification.priority === 'high' ? nexusColors.warning.main :
                                                  nexusColors.grey[600],
                                        color: 'white'
                                      }}
                                    />
                                    
                                    {notification.xp && (
                                      <Chip
                                        label={`+${notification.xp} XP`}
                                        size="small"
                                        sx={{
                                          fontSize: '0.6rem',
                                          height: 20,
                                          background: nexusColors.secondary.main,
                                          color: 'white'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </Box>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Глобальні нотифікації (для критичних повідомлень) */}
      {notifications
        .filter(n => n.priority === 'critical')
        .slice(0, 3)
        .map((notification, index) => (
          <Snackbar
            key={notification.id}
            open={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            style={{ top: 80 + index * 70 }}
          >
            <Alert
              severity="error"
              onClose={() => removeNotification(notification.id)}
              sx={{
                background: 'linear-gradient(135deg, rgba(244,67,54,0.9), rgba(229,115,115,0.9))',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.error.main}`,
                color: 'white'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {notification.title}
              </Typography>
              <Typography variant="body2">
                {notification.message}
              </Typography>
            </Alert>
          </Snackbar>
        ))}
    </>
  );
};

export default NotificationSystem;
