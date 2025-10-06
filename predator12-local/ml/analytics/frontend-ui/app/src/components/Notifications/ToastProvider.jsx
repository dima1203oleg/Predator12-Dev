import React, { createContext, useContext, useEffect } from 'react';
import useToastNotifications from '../../hooks/useToastNotifications';
import ToastContainer from './ToastContainer';

// Create context for toast notifications
const ToastContext = createContext({
  addToast: () => {},
  removeToast: () => {},
  clearToasts: () => {},
  connectionStatus: 'disconnected'
});

/**
 * Provider component for toast notifications
 * Makes toast notifications available throughout the application
 */
export const ToastProvider = ({
  children,
  position = 'top-right',
  autoClose = true,
  autoCloseDelay = 5000,
  closeOnClick = true,
  pauseOnHover = true,
  maxToasts = 5,
  filterByPreferences = true,
  theme = 'cyberpunk', // 'cyberpunk' or 'default'
  animationStyle = 'slide-right' // slide-right, slide-up, fade, bounce, glitch
}) => {
  const {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    connectionStatus,
    preferences
  } = useToastNotifications({
    maxToasts,
    autoCloseDelay,
    filterByPreferences
  });
  
  // Inject cyberpunk theme CSS variables if needed
  useEffect(() => {
    if (theme === 'cyberpunk') {
      // Add cyberpunk-specific CSS variables
      document.documentElement.classList.add('toast-cyberpunk-theme');
    }
    
    return () => {
      // Clean up on unmount
      document.documentElement.classList.remove('toast-cyberpunk-theme');
    };
  }, [theme]);
  
  // Enhanced addToast function that supports animation style
  const addToastWithAnimation = (toast) => {
    // If toast has no animation style specified, use the default
    if (!toast.animationStyle) {
      toast = { ...toast, animationStyle };
    }
    return addToast(toast);
  };
  
  return (
    <ToastContext.Provider 
      value={{
        addToast: addToastWithAnimation,
        removeToast,
        clearToasts,
        connectionStatus
      }}
    >
      {children}
      <ToastContainer
        notifications={toasts}
        position={position}
        autoClose={autoClose}
        autoCloseDelay={autoCloseDelay}
        closeOnClick={closeOnClick}
        pauseOnHover={pauseOnHover}
        limit={maxToasts}
        animationStyle={animationStyle}
        onClose={removeToast}
      />
    </ToastContext.Provider>
  );
};

/**
 * Hook for using toast notifications in components
 * @returns {Object} Toast notification methods
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider; 