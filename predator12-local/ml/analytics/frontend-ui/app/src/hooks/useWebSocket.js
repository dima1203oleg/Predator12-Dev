import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing WebSocket connections with standardized status handling
 * 
 * @param {string} url - The WebSocket endpoint URL
 * @param {Object} options - Configuration options
 * @param {function} options.onMessage - Callback for handling incoming messages
 * @param {boolean} options.autoReconnect - Whether to automatically attempt reconnection
 * @param {number} options.reconnectInterval - Time in ms to wait before reconnection attempt
 * @param {number} options.maxReconnectAttempts - Maximum number of reconnection attempts
 * @returns {Object} WebSocket connection state and control functions
 */
const useWebSocket = (
  url,
  {
    onMessage = () => {},
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = {}
) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Function to parse messages (assumes JSON)
  const parseMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessage(data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      // Still set the raw message in case the consumer wants to handle it
      setLastMessage(event.data);
      onMessage(event.data);
    }
  }, [onMessage]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clean up any existing connection first
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log(`WebSocket connected to ${url}`);
        setConnectionStatus('connected');
        setReconnectAttempts(0); // Reset reconnect attempts on successful connection
      };

      wsRef.current.onmessage = parseMessage;

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket disconnected from ${url}:`, event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Handle reconnection if enabled
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error(`WebSocket error on ${url}:`, error);
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error(`Failed to create WebSocket connection to ${url}:`, error);
      setConnectionStatus('disconnected');
    }
  }, [url, autoReconnect, maxReconnectAttempts, reconnectAttempts, parseMessage, reconnectInterval]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((data) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
};

export default useWebSocket; 