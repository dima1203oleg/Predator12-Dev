import { useState, useEffect, useCallback } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';

/**
 * Custom hook to use a shared WebSocket connection from the global context
 * 
 * @param {string} endpoint - The WebSocket endpoint to connect to
 * @param {Object} options - Configuration options
 * @param {function} options.onMessage - Callback for handling incoming messages
 * @param {boolean} options.autoConnect - Whether to automatically connect on mount
 * @param {boolean} options.autoReconnect - Whether to automatically attempt reconnection
 * @param {number} options.reconnectInterval - Time in ms to wait before reconnection attempt
 * @param {number} options.maxReconnectAttempts - Maximum number of reconnection attempts
 * @returns {Object} WebSocket connection state and control functions
 */
const useGlobalWebSocket = (
  endpoint,
  {
    onMessage = null,
    autoConnect = true,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = {}
) => {
  const {
    connect,
    disconnect,
    sendMessage: contextSendMessage,
    registerMessageHandler,
    getConnectionStatus
  } = useWebSocketContext();
  
  const [lastMessage, setLastMessage] = useState(null);
  
  // Get current connection status
  const connectionStatus = getConnectionStatus(endpoint);
  
  // Combine the external onMessage with our internal one
  const handleMessage = useCallback((data) => {
    setLastMessage(data);
    if (onMessage) {
      onMessage(data);
    }
  }, [onMessage]);
  
  // Connect to WebSocket
  const handleConnect = useCallback(() => {
    connect(endpoint, {
      autoReconnect,
      reconnectInterval,
      maxReconnectAttempts
    });
  }, [endpoint, connect, autoReconnect, reconnectInterval, maxReconnectAttempts]);
  
  // Disconnect from WebSocket
  const handleDisconnect = useCallback(() => {
    disconnect(endpoint);
  }, [endpoint, disconnect]);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((data) => {
    return contextSendMessage(endpoint, data);
  }, [endpoint, contextSendMessage]);
  
  // Register message handler on mount
  useEffect(() => {
    const unregister = registerMessageHandler(endpoint, handleMessage);
    
    // Auto-connect if enabled
    if (autoConnect) {
      handleConnect();
    }
    
    // Cleanup
    return () => {
      unregister();
    };
  }, [endpoint, handleMessage, registerMessageHandler, autoConnect, handleConnect]);
  
  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    connect: handleConnect,
    disconnect: handleDisconnect
  };
};

export default useGlobalWebSocket; 