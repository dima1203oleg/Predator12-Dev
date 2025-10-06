# WebSocket Status Component

## Overview

The `WebSocketStatus` component provides standardized visual feedback about WebSocket connection status across the Predator Analytics application. This component helps maintain consistent user interface patterns for real-time features and enhances user experience by clearly indicating connection issues and providing reconnection options.

## Component Features

- Real-time status indication for WebSocket connections
- Automatic service health checks via the `/ws/health` endpoint
- Reconnection capabilities with visual feedback
- Two display modes: standard and minimal
- Consistent styling with the Nexus Core design system

## Usage

### Basic Implementation

```jsx
import WebSocketStatus from '../components/nexus_visuals/WebSocketStatus';

// In your component
const [connectionStatus, setConnectionStatus] = useState('disconnected');

// Update connectionStatus to 'connecting' or 'connected' based on WebSocket events

return (
  <div>
    <WebSocketStatus 
      wsEndpoint="/ws/sentiment-updates"
      connectionStatus={connectionStatus}
      onReconnect={handleReconnect}
    />
  </div>
);
```

### Minimal Mode

Use the minimal mode when space is limited or when you need a less obtrusive indicator:

```jsx
<WebSocketStatus 
  wsEndpoint="/ws/data-stream"
  connectionStatus={connectionStatus}
  minimal={true}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wsEndpoint` | string | Required | The WebSocket endpoint this status reflects |
| `connectionStatus` | string | Required | Current connection status: 'connected', 'connecting', or 'disconnected' |
| `onConnected` | function | - | Callback fired when connection is established |
| `onDisconnected` | function | - | Callback fired when connection is lost |
| `showReconnectButton` | boolean | true | Whether to show the reconnect button when disconnected |
| `onReconnect` | function | - | Callback to attempt reconnection |
| `minimal` | boolean | false | Whether to use the minimal display mode |
| `className` | string | '' | Additional CSS class names |

## Connection States

The component visualizes four distinct states:

1. **Connected** (Cyan): WebSocket is connected and service is healthy
2. **Connecting** (Gold): WebSocket is in the process of connecting
3. **Disconnected but Available** (Orange): WebSocket is disconnected but the service is healthy
4. **Service Unavailable** (Red): WebSocket is disconnected and the service health check failed

## Integration with WebSocket Management

This component is designed to work with the WebSocket connection pattern used throughout Predator Analytics:

```jsx
// Initialize state
const [connectionStatus, setConnectionStatus] = useState('disconnected');
const ws = useRef(null);

// Connection function
const connectWebSocket = () => {
  setConnectionStatus('connecting');
  ws.current = new WebSocket(wsUrl);
  
  ws.current.onopen = () => {
    setConnectionStatus('connected');
  };
  
  ws.current.onclose = () => {
    setConnectionStatus('disconnected');
  };
  
  ws.current.onerror = () => {
    setConnectionStatus('disconnected');
  };
};

// Use the WebSocketStatus component
return (
  <WebSocketStatus 
    wsEndpoint={wsUrl}
    connectionStatus={connectionStatus}
    onReconnect={connectWebSocket}
  />
);
```

## Best Practices

1. Always update the `connectionStatus` prop based on WebSocket lifecycle events
2. Include the component near the top of any UI panel that relies on WebSocket data
3. Use the minimal mode in dashboards with multiple WebSocket-powered widgets
4. Add specific error handling for connection failures
5. Consider using a global WebSocket connection state manager for complex applications 