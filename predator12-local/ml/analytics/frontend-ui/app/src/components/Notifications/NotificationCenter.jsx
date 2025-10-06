import React, { useState, useEffect, useCallback } from 'react';
import useGlobalWebSocket from '../../hooks/useGlobalWebSocket';
import NotificationPreferences from './NotificationPreferences';
import { getNotificationPreferences } from '../../api/notificationPreferences';
import { DEFAULT_NOTIFICATION_PREFERENCES, NOTIFICATION_SEVERITY } from './schema';
import './NotificationCenter.css';

/**
 * Notification Center component that displays real-time system notifications
 * received via WebSocket
 */
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  
  // Load user preferences on mount from API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Спробуємо завантажити з API
        const apiPrefs = await getNotificationPreferences();
        setPreferences(apiPrefs);
      } catch (error) {
        console.error('Помилка завантаження з API:', error);
        
        // Якщо API недоступний, використовуємо localStorage як запасний варіант
        const savedPreferences = localStorage.getItem('notificationPreferences');
        if (savedPreferences) {
          try {
            setPreferences(JSON.parse(savedPreferences));
          } catch (parseError) {
            console.error('Помилка при завантаженні налаштувань сповіщень:', parseError);
          }
        }
      }
    };
    
    loadPreferences();
  }, []);
  
  // Auto-close notifications if enabled
  useEffect(() => {
    if (preferences.autoClose && notifications.length > 0) {
      const timer = setTimeout(() => {
        if (isOpen) {
          setIsOpen(false);
        }
      }, preferences.autoCloseDelay);
      
      // Clear timeout when component unmounts or preferences change
      return () => clearTimeout(timer);
    }
  }, [notifications, preferences.autoClose, preferences.autoCloseDelay, isOpen]);
  
  // Process incoming notifications from WebSocket
  const handleNotification = useCallback((data) => {
    if (data && data.type === 'notification') {
      // Check if this severity is enabled in preferences
      if (!preferences[data.severity || NOTIFICATION_SEVERITY.INFO]) {
        return; // Skip this notification based on user preferences
      }
      
      const newNotification = {
        id: data.id || `notif-${Date.now()}`,
        title: data.title || 'System Notification',
        message: data.message,
        severity: data.severity || NOTIFICATION_SEVERITY.INFO,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        action: data.action
      };
      
      setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Limit to 50 notifications
      setUnreadCount(prev => prev + 1);
      
      // Play sound based on severity and preference
      if (preferences.sound) {
        if (data.severity === NOTIFICATION_SEVERITY.CRITICAL || data.severity === NOTIFICATION_SEVERITY.ERROR) {
          const audio = new Audio('/notification-critical.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        } else if (data.severity === NOTIFICATION_SEVERITY.WARNING) {
          const audio = new Audio('/notification-warning.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        }
      }
    }
  }, [preferences]);
  
  // Connect to the notifications WebSocket endpoint
  const { connectionStatus } = useGlobalWebSocket(
    'notifications',
    {
      onMessage: handleNotification,
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10
    }
  );
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };
  
  // Mark a single notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  // Delete a single notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  // Handle notification click (for action URLs)
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action && notification.action.url) {
      window.open(notification.action.url, notification.action.target || '_self');
    }
  };
  
  // Toggle notification panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markAllAsRead();
    }
  };
  
  // Open preferences modal
  const openPreferences = (e) => {
    e.stopPropagation();
    setShowPreferences(true);
  };
  
  // Close preferences modal and reload preferences
  const closePreferences = () => {
    setShowPreferences(false);
    
    // Reload preferences in case they were changed
    const loadPreferences = async () => {
      try {
        // Спробуємо завантажити з API
        const apiPrefs = await getNotificationPreferences();
        setPreferences(apiPrefs);
      } catch (error) {
        console.error('Помилка завантаження з API:', error);
        
        // Якщо API недоступний, використовуємо localStorage як запасний варіант
        const savedPreferences = localStorage.getItem('notificationPreferences');
        if (savedPreferences) {
          try {
            setPreferences(JSON.parse(savedPreferences));
          } catch (parseError) {
            console.error('Помилка при завантаженні налаштувань сповіщень:', parseError);
          }
        }
      }
    };
    
    loadPreferences();
  };
  
  // Get severity icon based on notification type
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case NOTIFICATION_SEVERITY.CRITICAL:
        return (
          <svg className="icon-critical" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case NOTIFICATION_SEVERITY.ERROR:
        return (
          <svg className="icon-error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case NOTIFICATION_SEVERITY.WARNING:
        return (
          <svg className="icon-warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case NOTIFICATION_SEVERITY.SUCCESS:
        return (
          <svg className="icon-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      default: // info
        return (
          <svg className="icon-info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };
  
  // Format timestamp to local time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="notification-center">
      {/* Notification Bell Button */}
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={togglePanel}
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button 
                onClick={openPreferences} 
                className="action-button"
                title="Налаштування сповіщень"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <button 
                onClick={markAllAsRead} 
                className="action-button"
                title="Mark all as read"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </button>
              <button 
                onClick={clearAll} 
                className="action-button"
                title="Clear all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button 
                onClick={togglePanel} 
                className="action-button"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>Немає повідомлень</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.severity} ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getSeverityIcon(notification.severity)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h4>{notification.title}</h4>
                      <span className="notification-time">{formatTime(notification.timestamp)}</span>
                    </div>
                    <p>{notification.message}</p>
                    {notification.action && notification.action.label && (
                      <button className="notification-action-btn">
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                  <button 
                    className="notification-delete" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="notification-footer">
            {connectionStatus === 'connected' ? (
              <div className="connection-status connected">
                <span className="status-indicator"></span>
                Підключено до сервера сповіщень
              </div>
            ) : (
              <div className="connection-status disconnected">
                <span className="status-indicator"></span>
                Відключено від сервера сповіщень
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notification Preferences Modal */}
      <NotificationPreferences 
        isOpen={showPreferences} 
        onClose={closePreferences} 
      />
    </div>
  );
};

export default NotificationCenter; 