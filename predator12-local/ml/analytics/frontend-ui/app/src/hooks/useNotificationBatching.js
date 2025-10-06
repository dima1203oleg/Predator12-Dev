import { useState, useEffect, useRef, useCallback } from 'react';
import NotificationBatchManager from '../components/Notifications/BatchingManager';

/**
 * Хук для оптимізації обробки сповіщень через механізм батчингу
 * @param {Object} options - Параметри конфігурації
 * @param {number} options.maxBatchSize - Максимальний розмір групи сповіщень
 * @param {number} options.flushInterval - Інтервал надсилання в мс
 * @param {Function} options.onBatchProcess - Функція обробки групи сповіщень
 * @returns {Object} Методи управління сповіщеннями
 */
const useNotificationBatching = (options = {}) => {
  const {
    maxBatchSize = 10,
    flushInterval = 500,
    onBatchProcess
  } = options;
  
  // Стан і референція для менеджера
  const [isActive, setIsActive] = useState(false);
  const batchManagerRef = useRef(null);
  
  // Створюємо обробник для готового пакету
  const handleBatchReady = useCallback((batch) => {
    if (onBatchProcess && batch.length > 0) {
      onBatchProcess(batch);
    }
  }, [onBatchProcess]);
  
  // Ініціалізуємо менеджер під час монтування компонента
  useEffect(() => {
    batchManagerRef.current = new NotificationBatchManager({
      maxBatchSize,
      flushInterval,
      onBatchReady: handleBatchReady
    });
    
    return () => {
      // Зупиняємо менеджер при розмонтуванні компонента
      if (batchManagerRef.current) {
        batchManagerRef.current.stop();
      }
    };
  }, [maxBatchSize, flushInterval, handleBatchReady]);
  
  // Оновлюємо статус активності, коли він змінюється
  useEffect(() => {
    if (batchManagerRef.current) {
      if (isActive) {
        batchManagerRef.current.start();
      } else {
        batchManagerRef.current.stop();
      }
    }
  }, [isActive]);
  
  // Додавання сповіщення до черги
  const addNotification = useCallback((notification) => {
    if (batchManagerRef.current) {
      batchManagerRef.current.add(notification);
    }
  }, []);
  
  // Примусове надсилання всіх сповіщень у черзі
  const flushNotifications = useCallback(() => {
    if (batchManagerRef.current) {
      batchManagerRef.current.flush();
    }
  }, []);
  
  // Перемикання стану активності менеджера
  const toggleActive = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);
  
  // Явний запуск менеджера
  const startBatching = useCallback(() => {
    setIsActive(true);
  }, []);
  
  // Явна зупинка менеджера
  const stopBatching = useCallback(() => {
    setIsActive(false);
  }, []);
  
  // Отримання кількості сповіщень у поточній черзі
  const getCurrentBatchSize = useCallback(() => {
    return batchManagerRef.current ? batchManagerRef.current.size() : 0;
  }, []);
  
  return {
    addNotification,
    flushNotifications,
    isActive,
    toggleActive,
    startBatching,
    stopBatching,
    getCurrentBatchSize
  };
};

export default useNotificationBatching; 