import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/**
 * A reusable component that displays WebSocket connection status
 * and provides reconnection functionality
 */
const WebSocketStatus = ({ 
  wsEndpoint, 
  connectionStatus, 
  onConnected, 
  onDisconnected, 
  showReconnectButton = true,
  onReconnect,
  minimal = false, 
  className = '' 
}) => {
  const [serviceHealthy, setServiceHealthy] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);

  // Check if the WebSocket service is healthy via the health endpoint
  const checkServiceHealth = useCallback(async () => {
    if (checking) return;
    
    try {
      setChecking(true);
      const response = await fetch(`${API_BASE_URL}/ws/health`);
      if (response.ok) {
        const data = await response.json();
        setServiceHealthy(data.status === 'healthy');
      } else {
        setServiceHealthy(false);
      }
      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check WebSocket service health:", error);
      setServiceHealthy(false);
    } finally {
      setChecking(false);
    }
  }, [checking]);

  // Check service health on component mount and periodically
  useEffect(() => {
    checkServiceHealth();
    const healthInterval = setInterval(checkServiceHealth, 30000); // Check every 30 seconds

    return () => {
      clearInterval(healthInterval);
    };
  }, [checkServiceHealth]);

  // Get the appropriate status color based on connection and service health
  const getStatusColor = () => {
    if (connectionStatus === 'connected' && serviceHealthy) return '#00FFC6'; // Bright cyan - Connected
    if (connectionStatus === 'connecting') return '#FFD700'; // Gold - Connecting
    if (connectionStatus === 'disconnected' && serviceHealthy) return '#FFA500'; // Orange - Disconnected but service healthy
    return '#FF4C4C'; // Red - Disconnected and service unhealthy
  };

  // Get the appropriate status text
  const getStatusText = () => {
    if (connectionStatus === 'connected' && serviceHealthy) return 'Connected';
    if (connectionStatus === 'connecting') return 'Connecting...';
    if (connectionStatus === 'disconnected' && serviceHealthy) return 'Disconnected (Service Available)';
    return 'Service Unavailable';
  };

  // Handle reconnect button click
  const handleReconnect = () => {
    if (onReconnect && typeof onReconnect === 'function') {
      onReconnect();
    }
  };

  // Minimal version (just a status indicator dot)
  if (minimal) {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '5px'
          }}
          title={`WebSocket Status: ${getStatusText()} (${wsEndpoint})`}
        />
        {connectionStatus === 'connected' ? 'Live' : ''}
      </div>
    );
  }

  // Full version
  return (
    <div 
      className={className} 
      style={{ 
        backgroundColor: 'rgba(10, 25, 47, 0.8)',
        padding: '8px 12px',
        borderRadius: '4px',
        color: '#E6F1FF',
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '0.85rem',
        border: '1px solid #00A99D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '8px'
          }}
        />
        <span>{getStatusText()}</span>
        <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: '0.7' }}>
          {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : ''}
        </span>
      </div>
      
      {showReconnectButton && connectionStatus !== 'connected' && serviceHealthy && (
        <button
          onClick={handleReconnect}
          disabled={connectionStatus === 'connecting'}
          style={{
            backgroundColor: '#00FFC6',
            color: '#0A192F',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            marginLeft: '10px'
          }}
        >
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnect'}
        </button>
      )}
    </div>
  );
};

WebSocketStatus.propTypes = {
  wsEndpoint: PropTypes.string.isRequired,
  connectionStatus: PropTypes.oneOf(['connected', 'connecting', 'disconnected']).isRequired,
  onConnected: PropTypes.func,
  onDisconnected: PropTypes.func,
  showReconnectButton: PropTypes.bool,
  onReconnect: PropTypes.func,
  minimal: PropTypes.bool,
  className: PropTypes.string
};

export default WebSocketStatus; 