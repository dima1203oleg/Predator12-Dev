/**
 * Схема даних та константи для системи сповіщень Predator Analytics.
 * Використовується як для фронтенду, так і для документування API.
 */

// Типи сповіщень за рівнем важливості
export const NOTIFICATION_SEVERITY = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Формат API запитів та відповідей для налаштувань сповіщень
export const NOTIFICATION_PREFERENCES_SCHEMA = {
  info: {
    type: 'boolean',
    default: true,
    description: 'Отримувати інформаційні сповіщення'
  },
  success: {
    type: 'boolean',
    default: true,
    description: 'Отримувати сповіщення про успішні операції'
  },
  warning: {
    type: 'boolean',
    default: true,
    description: 'Отримувати попередження'
  },
  error: {
    type: 'boolean',
    default: true,
    description: 'Отримувати сповіщення про помилки'
  },
  critical: {
    type: 'boolean',
    default: true,
    description: 'Отримувати критичні сповіщення'
  },
  sound: {
    type: 'boolean',
    default: true,
    description: 'Увімкнути звукові сповіщення'
  },
  autoClose: {
    type: 'boolean',
    default: false,
    description: 'Автоматично закривати сповіщення'
  },
  autoCloseDelay: {
    type: 'number',
    default: 5000,
    description: 'Затримка до автоматичного закриття (мс)'
  }
};

// Стандартні налаштування
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  info: true,
  success: true,
  warning: true,
  error: true,
  critical: true,
  sound: true,
  autoClose: false,
  autoCloseDelay: 5000
};

// Локалізація типів сповіщень
export const SEVERITY_TRANSLATIONS = {
  [NOTIFICATION_SEVERITY.INFO]: 'Інформаційне',
  [NOTIFICATION_SEVERITY.SUCCESS]: 'Успішно',
  [NOTIFICATION_SEVERITY.WARNING]: 'Попередження',
  [NOTIFICATION_SEVERITY.ERROR]: 'Помилка',
  [NOTIFICATION_SEVERITY.CRITICAL]: 'Критично'
};

// Структура WebSocket повідомлення для сповіщення
export const NOTIFICATION_MESSAGE_SCHEMA = {
  type: 'notification',
  id: '<uniq_id>',
  title: 'Заголовок повідомлення',
  message: 'Текст повідомлення',
  severity: NOTIFICATION_SEVERITY.INFO,
  timestamp: new Date().toISOString(),
  action: {
    label: 'Дія',
    url: '/some-url',
    target: '_self'
  }
}; 