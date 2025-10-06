# WebSocket Monitoring Dashboard

## Overview

The WebSocket Monitoring Dashboard provides real-time visibility into active WebSocket connections within the Predator Analytics application. This administrative tool helps system operators monitor WebSocket activity, troubleshoot connection issues, and manage WebSocket connections across the system.

![WebSocket Monitoring Dashboard](../assets/images/websocket-monitor.png)

## Features

- **Real-time Connection Status**: View all active WebSocket connections and their current status
- **Connection Management**: Manually connect to endpoints or disconnect existing connections
- **Connection Statistics**: See aggregated statistics on total connections and their status
- **Auto-refresh**: Dashboard automatically updates every 5 seconds

## Accessing the Dashboard

The WebSocket Monitoring Dashboard is accessible only to administrators and can be reached via:

1. Navigate to the **Admin Dashboard** (`/admin`)
2. Click on the **WebSocket Monitoring** link in the admin tools section
3. Alternatively, navigate directly to `/admin/websocket-monitor`

## Dashboard Elements

### Connection Summary

The dashboard provides a quick overview of WebSocket connection statistics:

- **Total Connections**: The total number of active WebSocket connections managed by the application
- **Connected**: Number of connections currently in a connected state
- **Connecting**: Number of connections currently attempting to establish a connection
- **Disconnected**: Number of connections currently disconnected

### Add Connection

This section allows administrators to manually create a new WebSocket connection to a specific endpoint:

1. Enter the WebSocket endpoint name in the input field (e.g., `data-feed`, `notifications`)
2. Click the **Connect** button to establish the connection

> **Note**: The endpoint name is the relative path after the base WebSocket URL. For example, if the full WebSocket URL is `ws://localhost:8000/ws/data-feed`, enter `data-feed` as the endpoint name.

### Connection List

The connections table displays detailed information about each active WebSocket connection:

- **Endpoint**: The WebSocket endpoint name
- **URL**: The full WebSocket URL
- **Status**: Current connection status (Connected, Connecting, or Disconnected)
- **Auto Reconnect**: Whether automatic reconnection is enabled for this connection
- **Actions**: Available actions for this connection (e.g., Disconnect)

## Connection Status Indicators

The dashboard uses color-coded indicators to represent connection status:

- **Cyan (🔵)**: Connected - The WebSocket connection is active and operational
- **Gold (🟡)**: Connecting - The WebSocket is in the process of establishing a connection
- **Red (🔴)**: Disconnected - The WebSocket connection is not active

## Common Use Cases

### Troubleshooting Connection Issues

If users report issues with real-time updates not working correctly:

1. Check the WebSocket Monitor dashboard to see if the relevant endpoint is connected
2. If the connection is in a "Disconnected" state, examine if there are reconnection attempts occurring
3. If needed, manually reconnect the endpoint using the "Add Connection" feature

### Managing Connection Resources

During high system load, you might want to reduce the number of active WebSocket connections:

1. Identify non-critical connections using the connection list
2. Use the "Disconnect" action to close these connections temporarily
3. Monitor system performance improvement

### Testing New WebSocket Endpoints

When developing new real-time features, you can use the dashboard to test WebSocket connectivity:

1. Enter the new endpoint name in the "Add Connection" section
2. Establish a connection to verify it works correctly
3. Monitor the connection status to ensure stability

## Integration with System Monitoring

The WebSocket Monitoring Dashboard is part of the comprehensive monitoring system in Predator Analytics and works in conjunction with:

- Prometheus metrics for WebSocket connections
- Grafana dashboards for connection visualization
- System logs for detailed troubleshooting

For more information on the overall monitoring architecture, see the [Monitoring & Observability](/docs/monitoring/overview) documentation. 