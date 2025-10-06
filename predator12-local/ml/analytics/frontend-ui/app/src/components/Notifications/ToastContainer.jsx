import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ToastContainer.css';
import { NOTIFICATION_SEVERITY } from './schema';

/**
 * ToastContainer component for displaying pop-up notifications
 * with animated progress bars for auto-dismissal
 */
const ToastContainer = ({
  notifications = [],
  position = 'top-right',
  autoClose = true,
  autoCloseDelay = 5000,
  closeOnClick = true,
  pauseOnHover = true,
  limit = 5,
  animationStyle = 'slide-right', // slide-right, slide-up, fade, bounce, glitch
  onClose
}) => {
  const [toasts, setToasts] = useState([]);
  const [exitingToasts, setExitingToasts] = useState([]);
  const timersRef = useRef({});
  
  // Update toasts when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      // Get only new notifications not already in toasts
      const existingIds = new Set([...toasts.map(t => t.id), ...exitingToasts.map(t => t.id)]);
      const newNotifications = notifications
        .filter(n => !existingIds.has(n.id))
        .slice(0, limit);
      
      if (newNotifications.length > 0) {
        // Add animation style to each notification
        const styledNotifications = newNotifications.map(notification => ({
          ...notification,
          animationStyle: notification.animationStyle || animationStyle
        }));
        
        setToasts(prev => [...styledNotifications, ...prev].slice(0, limit));
      }
    }
  }, [notifications, limit, toasts, exitingToasts, animationStyle]);
  
  // Handle toast removal with exit animation
  const removeToast = useCallback((id) => {
    // Clear the timer for this toast
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    
    // Find the toast to exit
    const toastToExit = toasts.find(t => t.id === id);
    if (toastToExit) {
      // Move to exiting list
      setExitingToasts(prev => [...prev, {...toastToExit, exiting: true}]);
      // Remove from active toasts
      setToasts(prev => prev.filter(toast => toast.id !== id));
      
      // Remove the toast after animation completes
      setTimeout(() => {
        setExitingToasts(prev => prev.filter(toast => toast.id !== id));
        if (onClose) onClose(id);
      }, 300); // Match animation duration
    }
  }, [onClose, toasts]);
  
  // Auto-close toasts after delay
  useEffect(() => {
    if (autoClose && toasts.length > 0) {
      toasts.forEach(toast => {
        if (!timersRef.current[toast.id]) {
          timersRef.current[toast.id] = setTimeout(() => {
            removeToast(toast.id);
          }, autoCloseDelay);
        }
      });
      
      return () => {
        // Clear all timers on unmount
        Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
      };
    }
  }, [toasts, autoClose, autoCloseDelay, removeToast]);
  
  // Handle mouse enter - pause auto-close timer
  const handleMouseEnter = useCallback((id) => {
    if (pauseOnHover && autoClose && timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      
      // Find the progress bar element and pause its animation
      const progressBar = document.getElementById(`progress-${id}`);
      if (progressBar) {
        progressBar.style.animationPlayState = 'paused';
      }
    }
  }, [pauseOnHover, autoClose]);
  
  // Handle mouse leave - resume auto-close timer
  const handleMouseLeave = useCallback((id) => {
    if (pauseOnHover && autoClose) {
      // Restart the timer
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, autoCloseDelay);
      
      // Find the progress bar element and resume its animation
      const progressBar = document.getElementById(`progress-${id}`);
      if (progressBar) {
        progressBar.style.animationPlayState = 'running';
      }
    }
  }, [pauseOnHover, autoClose, autoCloseDelay, removeToast]);
  
  // Get the animation class based on the style
  const getAnimationClass = (style) => {
    switch (style) {
      case 'slide-right':
        return 'anim-slide-right';
      case 'slide-up':
        return 'anim-slide-up';
      case 'fade':
        return 'anim-fade';
      case 'bounce':
        return 'anim-bounce';
      case 'glitch':
        return 'anim-glitch';
      default:
        return 'anim-slide-right';
    }
  };
  
  // Get severity icon
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
  
  // Render both active and exiting toasts
  const renderToast = (toast, isExiting = false) => {
    const animClass = getAnimationClass(toast.animationStyle);
    
    return (
      <div 
        key={toast.id} 
        className={`toast ${toast.severity} ${animClass} ${isExiting ? 'exiting' : ''}`}
        onClick={() => !isExiting && closeOnClick && removeToast(toast.id)}
        onMouseEnter={() => !isExiting && handleMouseEnter(toast.id)}
        onMouseLeave={() => !isExiting && handleMouseLeave(toast.id)}
      >
        <div className="toast-icon">
          {getSeverityIcon(toast.severity)}
        </div>
        <div className="toast-content">
          <h4>{toast.title}</h4>
          <p>{toast.message}</p>
          {toast.action && toast.action.label && !isExiting && (
            <button 
              className="toast-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (toast.action.url) {
                  window.open(toast.action.url, toast.action.target || '_self');
                }
                removeToast(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button 
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation();
            !isExiting && removeToast(toast.id);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {autoClose && !isExiting && (
          <div className="toast-progress-container">
            <div 
              id={`progress-${toast.id}`}
              className="toast-progress"
              style={{
                animationDuration: `${autoCloseDelay}ms`
              }}
            />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`toast-container ${position}`}>
      {toasts.map(toast => renderToast(toast))}
      {exitingToasts.map(toast => renderToast(toast, true))}
    </div>
  );
};

export default ToastContainer; 