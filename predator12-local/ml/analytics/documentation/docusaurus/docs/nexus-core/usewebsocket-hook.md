# useWebSocket Custom Hook

## Overview

The `useWebSocket` hook provides a standardized way to manage WebSocket connections in React components throughout the Predator Analytics application. This hook abstracts away the details of WebSocket management, allowing developers to focus on implementing features rather than handling connection logic.

## Features

- Automatic connection management (connect on mount, disconnect on unmount)
- Standardized connection status states that work with the `WebSocketStatus` component
- Automatic reconnection attempts with configurable parameters
- JSON message parsing with error handling
- Clean API for sending messages
- TypeScript-friendly return types

## Installation

The hook is located in the `src/hooks` directory and can be imported into any component:

```jsx
import useWebSocket from '../../hooks/useWebSocket';
```

## Basic Usage

```jsx
import React from 'react';
import useWebSocket from '../../hooks/useWebSocket';
import WebSocketStatus from '../components/nexus_visuals/WebSocketStatus';

const API_WS_URL = process.env.REACT_APP_API_WS_URL || 'ws://localhost:8000/ws';

const MyComponent = () => {
  // Handle incoming messages
  const handleMessage = (data) => {
    console.log('Received message:', data);
    // Update component state based on the message
  };

  // Use the hook with basic configuration
  const { connectionStatus, sendMessage } = useWebSocket(
    `${API_WS_URL}/my-endpoint`,
    {
      onMessage: handleMessage,
      autoReconnect: true
    }
  );

  // Send a message through the WebSocket
  const sendSomeData = () => {
    sendMessage({
      type: 'request_data',
      filters: {
        region: 'EU',
        date: new Date().toISOString()
      }
    });
  };

  return (
    <div>
      {/* Use the WebSocketStatus component with the hook */}
      <WebSocketStatus 
        wsEndpoint="/my-endpoint"
        connectionStatus={connectionStatus}
      />
      
      <button onClick={sendSomeData}>
        Request Data
      </button>
    </div>
  );
};
```

## API Reference

### Parameters

The `useWebSocket` hook accepts two parameters:

1. `url` (string): The WebSocket endpoint URL to connect to.
2. `options` (object): Configuration options for the WebSocket connection.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onMessage` | function | `() => {}` | Callback function that receives parsed messages from the WebSocket. |
| `autoReconnect` | boolean | `true` | Whether to automatically attempt reconnection when the connection is lost. |
| `reconnectInterval` | number | `5000` | Time in milliseconds to wait before attempting to reconnect. |
| `maxReconnectAttempts` | number | `5` | Maximum number of reconnection attempts before giving up. |

### Return Value

The hook returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `connectionStatus` | string | Current WebSocket connection status: 'connected', 'connecting', or 'disconnected'. |
| `lastMessage` | any | The most recent message received from the WebSocket (parsed from JSON if possible). |
| `sendMessage` | function | Function to send a message through the WebSocket. Accepts string or object (automatically stringified). |
| `connect` | function | Function to manually initiate a connection or reconnection. |
| `disconnect` | function | Function to manually close the WebSocket connection. |

## Advanced Usage

### Managing Multiple WebSocket Connections

For components that need to maintain multiple WebSocket connections, simply use the hook multiple times with different endpoints:

```jsx
const { 
  connectionStatus: dataStatus,
  sendMessage: sendDataRequest
} = useWebSocket(`${API_WS_URL}/data-stream`);

const { 
  connectionStatus: controlStatus,
  sendMessage: sendControlCommand
} = useWebSocket(`${API_WS_URL}/control`);
```

### Custom Reconnection Logic

If you need custom reconnection behavior, you can disable the automatic reconnection and implement your own logic:

```jsx
const { 
  connectionStatus,
  connect,
  disconnect
} = useWebSocket(url, { autoReconnect: false });

// Custom reconnection logic
useEffect(() => {
  if (connectionStatus === 'disconnected' && shouldReconnect) {
    const timer = setTimeout(() => {
      connect();
    }, customInterval);
    
    return () => clearTimeout(timer);
  }
}, [connectionStatus, shouldReconnect, connect]);
```

## Integration with the WebSocketStatus Component

The `useWebSocket` hook is designed to work seamlessly with the `WebSocketStatus` component:

```jsx
const { connectionStatus, connect } = useWebSocket(wsUrl);

return (
  <WebSocketStatus 
    wsEndpoint={wsUrl}
    connectionStatus={connectionStatus}
    onReconnect={connect}
  />
);
```

## Best Practices

1. **Error Handling**: Always provide fallback mechanisms for when WebSocket connections fail.
2. **Connection Status**: Use the connection status to provide visual feedback to users.
3. **Message Handling**: Keep message handling logic separate from connection management.
4. **Cleanup**: The hook automatically cleans up connections when components unmount, but be mindful of reconnection attempts that might be in progress.
5. **Testing**: Mock WebSocket connections in tests to ensure components behave correctly in all connection states. 