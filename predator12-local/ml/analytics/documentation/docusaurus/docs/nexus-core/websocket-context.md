# Global WebSocket Management

## Overview

Predator Analytics implements a global WebSocket management system that allows multiple components to share WebSocket connections and efficiently handle real-time data across the application. This approach reduces the number of active connections, provides centralized connection management, and enhances performance.

## Architecture

The WebSocket management system consists of two main parts:

1. **WebSocketContext**: A React Context that provides global WebSocket connection management
2. **useGlobalWebSocket Hook**: A custom hook that wraps the context for easy consumption by components

The system is designed to allow components to share WebSocket connections while maintaining a clean separation of concerns and providing a familiar hooks-based API.

## WebSocketContext Provider

The `WebSocketProvider` component must wrap your application to enable global WebSocket management:

```jsx
// In App.jsx
import { WebSocketProvider } from './context/WebSocketContext';

const App = () => {
  return (
    <WebSocketProvider>
      {/* Your application components */}
    </WebSocketProvider>
  );
};
```

## Using Shared WebSocket Connections

### The useGlobalWebSocket Hook

The easiest way to consume the global WebSocket context is through the `useGlobalWebSocket` hook:

```jsx
import useGlobalWebSocket from '../../hooks/useGlobalWebSocket';

const MyComponent = () => {
  // Handle incoming messages
  const handleMessages = (data) => {
    console.log('Received data:', data);
    // Update component state
  };

  // Use the global WebSocket hook
  const { connectionStatus, sendMessage } = useGlobalWebSocket(
    'my-endpoint',  // Just the endpoint name, no need for full URL
    {
      onMessage: handleMessages,
      autoReconnect: true
    }
  );

  // Send a message
  const handleButtonClick = () => {
    sendMessage({ type: 'request_data', id: 123 });
  };

  return (
    <div>
      <p>Connection Status: {connectionStatus}</p>
      <button onClick={handleButtonClick}>Request Data</button>
    </div>
  );
};
```

### API Reference

#### useGlobalWebSocket Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `endpoint` | string | The WebSocket endpoint to connect to (without base URL) |
| `options` | object | Configuration options |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onMessage` | function | null | Callback function that receives parsed messages |
| `autoConnect` | boolean | true | Whether to automatically connect on mount |
| `autoReconnect` | boolean | true | Whether to automatically attempt reconnection when the connection is lost |
| `reconnectInterval` | number | 5000 | Time in milliseconds to wait before attempting to reconnect |
| `maxReconnectAttempts` | number | 5 | Maximum number of reconnection attempts before giving up |

#### Return Value

The hook returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `connectionStatus` | string | Current WebSocket connection status: 'connected', 'connecting', or 'disconnected' |
| `lastMessage` | any | The most recent message received from the WebSocket |
| `sendMessage` | function | Function to send a message through the WebSocket |
| `connect` | function | Function to manually initiate a connection |
| `disconnect` | function | Function to manually close the WebSocket connection |

## Benefits of Global WebSocket Management

### Connection Sharing

Multiple components can share the same WebSocket connection, reducing the number of open connections and improving performance:

```jsx
// Component A
const { connectionStatus: statusA } = useGlobalWebSocket('data-updates', {
  onMessage: handleDataUpdates
});

// Component B (elsewhere in the application)
const { connectionStatus: statusB } = useGlobalWebSocket('data-updates', {
  onMessage: handleOtherDataUpdates
});
```

Both components will share a single WebSocket connection to 'data-updates', and both message handlers will be called when messages arrive.

### Consistent Connection Status

All components using the same WebSocket endpoint will see the same connection status, providing a consistent user experience.

### Reduced Resource Usage

By sharing connections, the application uses fewer browser resources and places less load on the server, improving overall performance and scalability.

## Advanced Usage

### Direct Context Access

For advanced use cases, you can access the WebSocketContext directly:

```jsx
import { useWebSocketContext } from '../context/WebSocketContext';

const AdvancedComponent = () => {
  const {
    connections,
    connect,
    disconnect,
    sendMessage,
    registerMessageHandler,
    getConnectionStatus
  } = useWebSocketContext();

  // See all active connections
  console.log(connections);

  // Register a message handler for a specific endpoint
  useEffect(() => {
    const unregister = registerMessageHandler('my-endpoint', handleMessage);
    
    // Clean up when unmounting
    return () => unregister();
  }, []);

  // Manually connect to an endpoint
  const handleConnect = () => {
    connect('my-endpoint', { autoReconnect: true });
  };

  // Send message to a specific endpoint
  const handleSend = () => {
    sendMessage('my-endpoint', { type: 'command', action: 'refresh' });
  };

  return (
    // ...
  );
};
```

### Multiple Endpoints per Component

Components can connect to multiple WebSocket endpoints if needed:

```jsx
// Connect to real-time data feed
const { 
  connectionStatus: dataStatus, 
  lastMessage: dataMessage 
} = useGlobalWebSocket('data-feed');

// Connect to notification channel
const { 
  connectionStatus: notifyStatus, 
  lastMessage: notification 
} = useGlobalWebSocket('notifications');
```

## Integration with WebSocketStatus Component

The global WebSocket system works seamlessly with the `WebSocketStatus` component:

```jsx
const { connectionStatus, connect } = useGlobalWebSocket('sentiment-updates');

return (
  <div>
    <WebSocketStatus 
      wsEndpoint="/ws/sentiment-updates"
      connectionStatus={connectionStatus}
      onReconnect={connect}
    />
    {/* Rest of your component */}
  </div>
);
```

## Best Practices

1. **Application-Wide Provider**: Always use the `WebSocketProvider` at the root of your application.
2. **Use the Hook**: Prefer `useGlobalWebSocket` over direct context access for most use cases.
3. **Cleanup**: The hooks handle cleanup automatically, but be cautious when manually registering message handlers.
4. **Message Handling**: Keep message handling logic separate from connection management.
5. **Connection Sharing**: Take advantage of connection sharing to optimize performance. 