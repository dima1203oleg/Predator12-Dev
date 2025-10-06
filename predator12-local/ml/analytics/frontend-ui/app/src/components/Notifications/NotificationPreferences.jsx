import React, { useState, useEffect } from 'react';
import './NotificationPreferences.css';

/**
 * Компонент для налаштування сповіщень користувача
 */
const NotificationPreferences = ({ isOpen, onClose }) => {
  // Стан налаштувань
  const [preferences, setPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  
  // Стан завантаження та помилок
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Завантаження налаштувань при ініціалізації
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);
  
  // Функція для завантаження налаштувань
  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Спочатку спробуємо отримати з API
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Помилка отримання налаштувань з API:', err);
      
      // Якщо не вдалося отримати з API, пробуємо localStorage
      const savedPreferences = localStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (parseError) {
          console.error('Помилка при завантаженні налаштувань сповіщень:', parseError);
          setError('Не вдалося завантажити налаштування. Використовуються стандартні.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Збереження налаштувань
  const savePreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Зберігаємо в API
      await updateNotificationPreferences(preferences);
      
      // Також зберігаємо в localStorage для офлайн-режиму
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      // Закриття вікна налаштувань
      onClose();
    } catch (err) {
      console.error('Помилка збереження налаштувань:', err);
      setError('Не вдалося зберегти налаштування. Спробуйте пізніше.');
      
      // Зберігаємо локально у випадку помилки API
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Скидання налаштувань до стандартних
  const resetPreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Скидаємо на сервері
      await resetNotificationPreferences();
      
      // Встановлюємо стандартні значення
      setPreferences({...DEFAULT_NOTIFICATION_PREFERENCES});
      localStorage.removeItem('notificationPreferences');
    } catch (err) {
      console.error('Помилка скидання налаштувань:', err);
      setError('Не вдалося скинути налаштування. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обробка змін у налаштуваннях
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value, 10) : value
    }));
  };
  
  // Якщо вікно закрите, не відображаємо нічого
  if (!isOpen) return null;
  
  return (
    <div className="notification-preferences-overlay">
      <div className="notification-preferences-panel">
        <div className="preferences-header">
          <h3>Налаштування сповіщень</h3>
          <button 
            className="close-button"
            onClick={onClose}
            title="Закрити"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="preferences-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="preferences-section">
          <h4>Типи сповіщень</h4>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="critical" 
              name="critical" 
              checked={preferences.critical} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="critical">
              <span className="severity-indicator critical"></span>
              {SEVERITY_TRANSLATIONS.critical || 'Критичні'}
            </label>
          </div>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="error" 
              name="error" 
              checked={preferences.error} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="error">
              <span className="severity-indicator error"></span>
              {SEVERITY_TRANSLATIONS.error || 'Помилки'}
            </label>
          </div>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="warning" 
              name="warning" 
              checked={preferences.warning} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="warning">
              <span className="severity-indicator warning"></span>
              {SEVERITY_TRANSLATIONS.warning || 'Попередження'}
            </label>
          </div>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="success" 
              name="success" 
              checked={preferences.success} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="success">
              <span className="severity-indicator success"></span>
              {SEVERITY_TRANSLATIONS.success || 'Успішні операції'}
            </label>
          </div>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="info" 
              name="info" 
              checked={preferences.info} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="info">
              <span className="severity-indicator info"></span>
              {SEVERITY_TRANSLATIONS.info || 'Інформаційні'}
            </label>
          </div>
        </div>
        
        <div className="preferences-section">
          <h4>Звукові сповіщення</h4>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="sound" 
              name="sound" 
              checked={preferences.sound} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="sound">Увімкнути звукові сповіщення</label>
          </div>
        </div>
        
        <div className="preferences-section">
          <h4>Автоматичне закриття</h4>
          <div className="preferences-option">
            <input 
              type="checkbox" 
              id="autoClose" 
              name="autoClose" 
              checked={preferences.autoClose} 
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="autoClose">Автоматично закривати сповіщення</label>
          </div>
          
          {preferences.autoClose && (
            <div className="preferences-option with-input">
              <label htmlFor="autoCloseDelay">Затримка до закриття (мс):</label>
              <input 
                type="number" 
                id="autoCloseDelay" 
                name="autoCloseDelay" 
                value={preferences.autoCloseDelay} 
                onChange={handleChange}
                min="1000"
                max="30000"
                step="1000"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        
        <div className="preferences-actions">
          <button 
            className="reset-button" 
            onClick={resetPreferences}
            disabled={isLoading}
          >
            Скинути
          </button>
          <div className="preferences-actions-right">
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button 
              className="save-button" 
              onClick={savePreferences}
              disabled={isLoading}
            >
              {isLoading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences; 