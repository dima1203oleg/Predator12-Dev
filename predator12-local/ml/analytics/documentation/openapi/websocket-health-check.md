# WebSocket Health Check Endpoint

## Overview

The WebSocket service in Predator Analytics now includes a health check endpoint to monitor its operational status. This feature allows both backend monitoring tools and frontend components to verify if the WebSocket service is running correctly, aiding in debugging and ensuring reliable real-time data updates.

## Endpoint Details

- **URL**: `/ws/health`
- **Method**: `GET`
- **Response Format**: JSON
- **Response Example**:
  ```json
  {
    "status": "healthy",
    "message": "WebSocket service is operational."
  }
  ```
- **Purpose**: Returns the current status of the WebSocket service. A `status` of `healthy` indicates the service is operational and ready to accept connections.

## Integration in Frontend

The health check endpoint is integrated into the `ChronoSpatialMap` component to provide real-time feedback on the WebSocket service status. The component performs the following actions:

1. **Periodic Health Checks**: The frontend sends a request to `/ws/health` every 10 seconds to check the service status.
2. **Status Display**: The UI reflects the connection status and service health, showing messages like "Connected", "Disconnected but Service Healthy", or "Service Unhealthy or Disconnected".
3. **Reconnection Logic**: If the WebSocket connection is lost but the service is reported as healthy, the component attempts to reconnect automatically after a 5-second delay.

This integration enhances user experience by providing transparency about the system's state and automating recovery attempts when possible.

## Usage in Monitoring

This endpoint can also be used by external monitoring tools (e.g., Prometheus) to scrape the health status of the WebSocket service. This allows for alerts to be set up if the service becomes unhealthy, ensuring quick response to potential issues.

## Metrics Endpoint

- **URL**: `/ws/metrics`
- **Method**: `GET`
- **Response Format**: Plain Text (Prometheus format)
- **Response Example**:
  ```
  # HELP websocket_active_connections Number of active WebSocket connections
  # TYPE websocket_active_connections gauge
  websocket_active_connections 5
  ```
- **Purpose**: Returns metrics about the WebSocket service, specifically the number of active connections, in a format that can be scraped by Prometheus for monitoring and alerting.

## Future Enhancements

- Add detailed metrics to the health check response, such as the number of active connections or average latency.
- Implement authentication for the health check and metrics endpoints to restrict access to authorized users or systems. 