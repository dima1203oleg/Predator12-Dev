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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const NotificationSystem = ({ soundEnabled, onSoundToggle }) => {
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [showPanel, setShowPanel] = (0, react_1.useState)(false);
    const [autoHide, setAutoHide] = (0, react_1.useState)(true);
    const audioContext = (0, react_1.useRef)(null);
    // Звукові ефекти
    const playNotificationSound = (0, react_1.useCallback)((type, priority) => {
        if (!soundEnabled)
            return;
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
        }
        catch (error) {
            console.warn('Звук не підтримується:', error);
        }
    }, [soundEnabled]);
    // Додавання нотифікації
    const addNotification = (0, react_1.useCallback)((notification) => {
        const newNotification = Object.assign(Object.assign({}, notification), { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), timestamp: new Date() });
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
    const removeNotification = (0, react_1.useCallback)((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    // Очищення всіх нотифікацій
    const clearAllNotifications = (0, react_1.useCallback)(() => {
        setNotifications([]);
    }, []);
    // Функція для отримання іконки нотифікації
    const getNotificationIcon = (notification) => {
        if (notification.icon) {
            const IconComponent = notification.icon;
            return <IconComponent />;
        }
        switch (notification.type) {
            case 'success':
                return <icons_material_1.CheckCircle />;
            case 'warning':
                return <icons_material_1.Warning />;
            case 'error':
                return <icons_material_1.Error />;
            case 'achievement':
                return <icons_material_1.Rocket />;
            case 'system':
                return <icons_material_1.Security />;
            default:
                return <icons_material_1.Info />;
        }
    };
    // Функція для отримання кольору нотифікації
    const getNotificationColor = (notification) => {
        if (notification.color)
            return notification.color;
        switch (notification.type) {
            case 'success':
                return nexusTheme_1.nexusColors.success.main;
            case 'warning':
                return nexusTheme_1.nexusColors.warning.main;
            case 'error':
                return nexusTheme_1.nexusColors.error.main;
            case 'achievement':
                return nexusTheme_1.nexusColors.secondary.main;
            case 'system':
                return nexusTheme_1.nexusColors.primary.main;
            default:
                return nexusTheme_1.nexusColors.info.main;
        }
    };
    // Симуляція системних нотифікацій
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            const notificationTypes = [
                {
                    type: 'system',
                    title: '🤖 AI Агент Активований',
                    message: 'SelfHealingAgent почав моніторинг системи',
                    priority: 'normal',
                    category: 'ai',
                    icon: icons_material_1.Psychology
                },
                {
                    type: 'info',
                    title: '📊 Оновлення Метрик',
                    message: 'Нові дані аналітики доступні',
                    priority: 'low',
                    category: 'general',
                    icon: icons_material_1.Analytics
                },
                {
                    type: 'success',
                    title: '✅ Завдання Виконано',
                    message: 'Оптимізація системи завершена успішно',
                    priority: 'normal',
                    category: 'system'
                },
                {
                    type: 'achievement',
                    title: '🏆 Нове Досягнення!',
                    message: 'Ви досягли рівня "Експерт"',
                    priority: 'high',
                    category: 'achievement',
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
    return (<>
      {/* Кнопка відкриття панелі нотифікацій */}
      <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <material_1.Fab color="primary" onClick={() => setShowPanel(true)} sx={{
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
        }}>
          <material_1.Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? <icons_material_1.NotificationsActive /> : <icons_material_1.Notifications />}
          </material_1.Badge>
        </material_1.Fab>
      </framer_motion_1.motion.div>

      {/* Панель нотифікацій */}
      <framer_motion_1.AnimatePresence>
        {showPanel && (<framer_motion_1.motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} style={{
                position: 'fixed',
                top: 80,
                right: 24,
                bottom: 24,
                width: 380,
                zIndex: 1500,
                pointerEvents: 'auto'
            }}>
            <material_1.Card sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(18, 24, 40, 0.95), rgba(30, 39, 59, 0.95))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${nexusTheme_1.nexusColors.primary.main}`,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column'
            }}>
              {/* Заголовок панелі */}
              <material_1.CardContent sx={{ borderBottom: `1px solid ${nexusTheme_1.nexusColors.primary.main}`, pb: 2 }}>
                <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.primary.main, fontWeight: 'bold' }}>
                    🔔 Нотифікації
                  </material_1.Typography>
                  <material_1.IconButton onClick={() => setShowPanel(false)} sx={{ color: 'white' }}>
                    <icons_material_1.Close />
                  </material_1.IconButton>
                </material_1.Box>

                <material_1.Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                  <material_1.FormControlLabel control={<material_1.Switch checked={soundEnabled} onChange={onSoundToggle} size="small"/>} label={<material_1.Box display="flex" alignItems="center" gap={1}>
                        {soundEnabled ? <icons_material_1.VolumeUp /> : <icons_material_1.VolumeOff />}
                        <material_1.Typography variant="caption">Звук</material_1.Typography>
                      </material_1.Box>}/>

                  <material_1.FormControlLabel control={<material_1.Switch checked={autoHide} onChange={(e) => setAutoHide(e.target.checked)} size="small"/>} label={<material_1.Typography variant="caption">Автоприховування</material_1.Typography>}/>
                </material_1.Box>

                {notifications.length > 0 && (<material_1.Box display="flex" gap={1} mt={2}>
                    <material_1.Chip label={`Всього: ${notifications.length}`} size="small" sx={{ background: nexusTheme_1.nexusColors.primary.main, color: 'white' }}/>
                    {criticalCount > 0 && (<material_1.Chip label={`Критичні: ${criticalCount}`} size="small" sx={{ background: nexusTheme_1.nexusColors.error.main, color: 'white' }}/>)}
                  </material_1.Box>)}
              </material_1.CardContent>

              {/* Список нотифікацій */}
              <material_1.Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <framer_motion_1.AnimatePresence>
                  {notifications.length === 0 ? (<material_1.Box textAlign="center" py={4}>
                      <icons_material_1.Notifications sx={{ fontSize: 48, color: nexusTheme_1.nexusColors.grey[600], mb: 2 }}/>
                      <material_1.Typography color="textSecondary">
                        Нотифікацій немає
                      </material_1.Typography>
                    </material_1.Box>) : (notifications.map((notification, index) => (<framer_motion_1.motion.div key={notification.id} initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ delay: index * 0.05 }} style={{ marginBottom: 12 }}>
                        <material_1.Card sx={{
                    background: `linear-gradient(135deg, ${getNotificationColor(notification)}15, ${getNotificationColor(notification)}05)`,
                    border: `1px solid ${getNotificationColor(notification)}`,
                    borderLeft: `4px solid ${getNotificationColor(notification)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: `0 0 15px ${getNotificationColor(notification)}30`,
                        transform: 'translateY(-2px)'
                    }
                }}>
                          <material_1.CardContent sx={{ py: 2 }}>
                            <material_1.Box display="flex" alignItems="flex-start" gap={2}>
                              <material_1.Avatar sx={{
                    background: getNotificationColor(notification),
                    width: 40,
                    height: 40
                }}>
                                {getNotificationIcon(notification)}
                              </material_1.Avatar>

                              <material_1.Box flex={1}>
                                <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                  <material_1.Typography variant="subtitle2" sx={{ color: getNotificationColor(notification), fontWeight: 'bold' }}>
                                    {notification.title}
                                  </material_1.Typography>
                                  <material_1.IconButton size="small" onClick={() => removeNotification(notification.id)} sx={{ color: nexusTheme_1.nexusColors.grey[400] }}>
                                    <icons_material_1.Close fontSize="small"/>
                                  </material_1.IconButton>
                                </material_1.Box>

                                <material_1.Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                                  {notification.message}
                                </material_1.Typography>

                                <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
                                  <material_1.Typography variant="caption" color="textSecondary">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </material_1.Typography>

                                  <material_1.Box display="flex" gap={1}>
                                    <material_1.Chip label={notification.priority.toUpperCase()} size="small" sx={{
                    fontSize: '0.6rem',
                    height: 20,
                    background: notification.priority === 'critical' ? nexusTheme_1.nexusColors.error.main :
                        notification.priority === 'high' ? nexusTheme_1.nexusColors.warning.main :
                            nexusTheme_1.nexusColors.grey[600],
                    color: 'white'
                }}/>

                                    {notification.xp && (<material_1.Chip label={`+${notification.xp} XP`} size="small" sx={{
                        fontSize: '0.6rem',
                        height: 20,
                        background: nexusTheme_1.nexusColors.secondary.main,
                        color: 'white'
                    }}/>)}
                                  </material_1.Box>
                                </material_1.Box>
                              </material_1.Box>
                            </material_1.Box>
                          </material_1.CardContent>
                        </material_1.Card>
                      </framer_motion_1.motion.div>)))}
                </framer_motion_1.AnimatePresence>
              </material_1.Box>
            </material_1.Card>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Глобальні нотифікації (для критичних повідомлень) */}
      {notifications
            .filter(n => n.priority === 'critical')
            .slice(0, 3)
            .map((notification, index) => (<material_1.Snackbar key={notification.id} open={true} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} style={{ top: 80 + index * 70 }}>
            <material_1.Alert severity="error" onClose={() => removeNotification(notification.id)} sx={{
                background: 'linear-gradient(135deg, rgba(244,67,54,0.9), rgba(229,115,115,0.9))',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusTheme_1.nexusColors.error.main}`,
                color: 'white'
            }}>
              <material_1.Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {notification.title}
              </material_1.Typography>
              <material_1.Typography variant="body2">
                {notification.message}
              </material_1.Typography>
            </material_1.Alert>
          </material_1.Snackbar>))}
    </>);
};
exports.default = NotificationSystem;
