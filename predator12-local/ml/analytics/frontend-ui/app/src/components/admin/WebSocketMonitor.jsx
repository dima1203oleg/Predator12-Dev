import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from '../../context/WebSocketContext';

/**
 * Component for monitoring and managing all active WebSocket connections
 * within the application
 */
const WebSocketMonitor = () => {
  const { 
    connections, 
    connect, 
    disconnect,
    getConnectionStatus
  } = useWebSocketContext();
  
  const [refreshTimestamp, setRefreshTimestamp] = useState(new Date());
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refresh the view every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTimestamp(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle manual connection
  const handleConnect = (e) => {
    e.preventDefault();
    
    if (!customEndpoint.trim()) {
      setErrorMessage('Please enter an endpoint name');
      return;
    }
    
    try {
      connect(customEndpoint, { autoReconnect: true });
      setCustomEndpoint('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Connection error: ${error.message}`);
    }
  };
  
  // Safely disconnect a connection
  const handleDisconnect = (endpoint) => {
    try {
      disconnect(endpoint);
    } catch (error) {
      setErrorMessage(`Disconnect error: ${error.message}`);
    }
  };
  
  // Get status indicator color
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#00FFC6'; // Cyan
      case 'connecting': return '#FFD700'; // Gold
      case 'disconnected': return '#FF4C4C'; // Red
      default: return '#888888'; // Gray
    }
  };
  
  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg shadow-lg border border-gray-700 p-6 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-400">WebSocket Connections Monitor</h2>
        <div className="text-sm text-gray-400">
          Last updated: {refreshTimestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {/* Connection summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-blue-300">{Object.keys(connections).length}</div>
          <div className="text-xs text-gray-400">Total Connections</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-green-300">
            {Object.values(connections).filter(c => c.status === 'connected').length}
          </div>
          <div className="text-xs text-gray-400">Connected</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-yellow-300">
            {Object.values(connections).filter(c => c.status === 'connecting').length}
          </div>
          <div className="text-xs text-gray-400">Connecting</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-3xl font-bold text-red-300">
            {Object.values(connections).filter(c => c.status === 'disconnected').length}
          </div>
          <div className="text-xs text-gray-400">Disconnected</div>
        </div>
      </div>
      
      {/* Add new connection */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-sm font-bold text-gray-300 mb-3">Add Connection</h3>
        <form onSubmit={handleConnect} className="flex gap-3">
          <input
            type="text"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            placeholder="Enter endpoint name (e.g. 'data-feed')"
            className="flex-1 bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Connect
          </button>
        </form>
        {errorMessage && (
          <div className="mt-2 text-red-400 text-sm">{errorMessage}</div>
        )}
      </div>
      
      {/* Connection list */}
      <div className="overflow-auto max-h-96 bg-gray-800 rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Endpoint</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Auto Reconnect</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Object.keys(connections).length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 px-4 text-center text-gray-400">No active connections</td>
              </tr>
            ) : (
              Object.entries(connections).map(([endpoint, details]) => {
                const status = getConnectionStatus(endpoint);
                return (
                  <tr key={endpoint} className="hover:bg-gray-700">
                    <td className="py-2 px-4">{endpoint}</td>
                    <td className="py-2 px-4 text-gray-400 font-mono text-xs">{details.url}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getStatusColor(status) }}
                        />
                        {status}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {details.config?.autoReconnect ? 'Yes' : 'No'}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleDisconnect(endpoint)}
                        className="bg-red-800 hover:bg-red-900 text-white text-xs px-2 py-1 rounded"
                      >
                        Disconnect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebSocketMonitor; 