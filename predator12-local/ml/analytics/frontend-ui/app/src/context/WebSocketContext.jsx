import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// API base URL for WebSocket connections
const API_WS_URL = process.env.REACT_APP_API_WS_URL || 'ws://localhost:8000/ws';

// Create WebSocket context
const WebSocketContext = createContext(null);

/**
 * Custom hook to use the WebSocket context
 * @returns {Object} WebSocket context value
 */
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

/**
 * WebSocket Provider component to manage global WebSocket connections
 */
export const WebSocketProvider = ({ children }) => {
  // Track all active WebSocket connections
  const [connections, setConnections] = useState({});
  
  // Store connection statuses
  const [connectionStatuses, setConnectionStatuses] = useState({});
  
  // WebSocket references
  const wsRefs = useRef({});
  
  // Track reconnection attempts
  const reconnectAttempts = useRef({});
  
  // Track reconnection timeouts
  const reconnectTimeouts = useRef({});
  
  // Track message handlers
  const messageHandlers = useRef({});

  /**
   * Register a message handler for a specific endpoint
   */
  const registerMessageHandler = useCallback((endpoint, handler) => {
    if (!messageHandlers.current[endpoint]) {
      messageHandlers.current[endpoint] = [];
    }
    
    // Add handler if it doesn't already exist
    if (!messageHandlers.current[endpoint].includes(handler)) {
      messageHandlers.current[endpoint].push(handler);
    }
    
    // Return function to unregister
    return () => {
      if (messageHandlers.current[endpoint]) {
        messageHandlers.current[endpoint] = messageHandlers.current[endpoint].filter(h => h !== handler);
      }
    };
  }, []);

  /**
   * Broadcast message to all registered handlers for an endpoint
   */
  const broadcastMessage = useCallback((endpoint, data) => {
    if (messageHandlers.current[endpoint]) {
      messageHandlers.current[endpoint].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for ${endpoint}:`, error);
        }
      });
    }
  }, []);

  /**
   * Parse WebSocket message
   */
  const parseMessage = useCallback((endpoint, event) => {
    try {
      const data = JSON.parse(event.data);
      broadcastMessage(endpoint, data);
    } catch (error) {
      console.error(`Failed to parse WebSocket message from ${endpoint}:`, error);
      broadcastMessage(endpoint, event.data);
    }
  }, [broadcastMessage]);

  /**
   * Connect to a WebSocket endpoint
   */
  const connect = useCallback((endpoint, config = {}) => {
    const fullUrl = endpoint.startsWith('ws://') || endpoint.startsWith('wss://') 
      ? endpoint 
      : `${API_WS_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      
    const {
      autoReconnect = true,
      reconnectInterval = 5000,
      maxReconnectAttempts = 5
    } = config;
    
    // Don't reconnect if already connecting or connected
    if (connectionStatuses[endpoint] === 'connecting' || 
       (wsRefs.current[endpoint] && wsRefs.current[endpoint].readyState === WebSocket.OPEN)) {
      return;
    }
    
    // Update connection status
    setConnectionStatuses(prev => ({
      ...prev,
      [endpoint]: 'connecting'
    }));
    
    // Close existing connection if any
    if (wsRefs.current[endpoint]) {
      wsRefs.current[endpoint].close();
    }
    
    try {
      // Create new WebSocket connection
      const ws = new WebSocket(fullUrl);
      wsRefs.current[endpoint] = ws;
      
      // Set up event handlers
      ws.onopen = () => {
        console.log(`WebSocket connected to ${fullUrl}`);
        setConnectionStatuses(prev => ({
          ...prev,
          [endpoint]: 'connected'
        }));
        reconnectAttempts.current[endpoint] = 0;
        
        // Update connections mapping
        setConnections(prev => ({
          ...prev,
          [endpoint]: {
            url: fullUrl,
            status: 'connected',
            config
          }
        }));
      };
      
      ws.onmessage = (event) => {
        parseMessage(endpoint, event);
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket disconnected from ${fullUrl}:`, event.code, event.reason);
        setConnectionStatuses(prev => ({
          ...prev,
          [endpoint]: 'disconnected'
        }));
        
        // Clean up reconnect timeout if exists
        if (reconnectTimeouts.current[endpoint]) {
          clearTimeout(reconnectTimeouts.current[endpoint]);
        }
        
        // Handle reconnection if enabled
        if (autoReconnect) {
          const attempts = reconnectAttempts.current[endpoint] || 0;
          
          if (attempts < maxReconnectAttempts) {
            console.log(`Attempting to reconnect to ${endpoint} (${attempts + 1}/${maxReconnectAttempts})...`);
            
            reconnectTimeouts.current[endpoint] = setTimeout(() => {
              reconnectAttempts.current[endpoint] = attempts + 1;
              connect(endpoint, config);
            }, reconnectInterval);
          } else {
            console.log(`Max reconnection attempts (${maxReconnectAttempts}) reached for ${endpoint}`);
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error on ${fullUrl}:`, error);
        setConnectionStatuses(prev => ({
          ...prev,
          [endpoint]: 'disconnected'
        }));
      };
      
      return true;
    } catch (error) {
      console.error(`Failed to create WebSocket connection to ${fullUrl}:`, error);
      setConnectionStatuses(prev => ({
        ...prev,
        [endpoint]: 'disconnected'
      }));
      return false;
    }
  }, [connectionStatuses, parseMessage]);

  /**
   * Disconnect from a WebSocket endpoint
   */
  const disconnect = useCallback((endpoint) => {
    // Clear any pending reconnect timeout
    if (reconnectTimeouts.current[endpoint]) {
      clearTimeout(reconnectTimeouts.current[endpoint]);
      delete reconnectTimeouts.current[endpoint];
    }
    
    // Close WebSocket connection if exists
    if (wsRefs.current[endpoint]) {
      wsRefs.current[endpoint].close();
      delete wsRefs.current[endpoint];
    }
    
    // Update connection status
    setConnectionStatuses(prev => ({
      ...prev,
      [endpoint]: 'disconnected'
    }));
    
    // Remove from connections mapping
    setConnections(prev => {
      const newConnections = { ...prev };
      delete newConnections[endpoint];
      return newConnections;
    });
  }, []);

  /**
   * Send a message through a WebSocket connection
   */
  const sendMessage = useCallback((endpoint, data) => {
    const ws = wsRefs.current[endpoint];
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error(`Cannot send message to ${endpoint}: WebSocket is not connected`);
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      ws.send(message);
      return true;
    } catch (error) {
      console.error(`Failed to send WebSocket message to ${endpoint}:`, error);
      return false;
    }
  }, []);

  /**
   * Get the connection status for an endpoint
   */
  const getConnectionStatus = useCallback((endpoint) => {
    return connectionStatuses[endpoint] || 'disconnected';
  }, [connectionStatuses]);

  /**
   * Clean up all connections when component unmounts
   */
  useEffect(() => {
    return () => {
      // Clear all timeouts
      Object.keys(reconnectTimeouts.current).forEach(endpoint => {
        clearTimeout(reconnectTimeouts.current[endpoint]);
      });
      
      // Close all connections
      Object.keys(wsRefs.current).forEach(endpoint => {
        if (wsRefs.current[endpoint]) {
          wsRefs.current[endpoint].close();
        }
      });
    };
  }, []);

  // Memoize context value to prevent unnecessary renders
  const contextValue = useMemo(() => ({
    connections,
    connect,
    disconnect,
    sendMessage,
    registerMessageHandler,
    getConnectionStatus
  }), [connections, connect, disconnect, sendMessage, registerMessageHandler, getConnectionStatus]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default WebSocketContext; 