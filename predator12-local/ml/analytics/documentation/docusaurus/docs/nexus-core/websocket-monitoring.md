# WebSocket Service Monitoring Dashboard

## Overview

The WebSocket Service Monitoring Dashboard provides real-time visibility into the status and performance of the WebSocket service in Predator Analytics. This dashboard helps administrators and developers identify potential issues, track usage patterns, and ensure the service is functioning optimally.

## Dashboard Components

### Active WebSocket Connections Gauge

This gauge displays the current number of active WebSocket connections to the service. It provides a quick, at-a-glance view of the current load on the WebSocket service.

### WebSocket Connections Over Time Graph

This time-series graph shows the number of active WebSocket connections over time. This helps identify usage patterns, potential spikes in connection activity, or connection drops.

## How to Access the Dashboard

1. Navigate to Grafana (typically available at `http://localhost:3000` in local development or at your designated Grafana URL in production).
2. Login with your credentials.
3. From the dashboard list, search for "WebSocket Service Monitoring" or navigate to it directly using the URL path: `/dashboards/f/websocket-monitoring`.

## Using the Dashboard for Monitoring

### Normal Operations

In normal operation, you should expect to see:
- Active connections corresponding to the number of frontend clients actively using the WebSocket-based features.
- Relatively stable connection counts with gradual changes as users connect and disconnect.

### Troubleshooting

If you observe abnormal patterns, such as:
- Sudden drops in connections
- Unusually high connection counts
- Zero connections when users are expected to be connected

Consider checking:
1. The `/ws/health` endpoint to verify the WebSocket service is running.
2. Network connectivity between clients and the server.
3. The backend logs for any errors related to WebSocket connections.
4. Frontend console logs for WebSocket connection errors.

## Integration with Alerts

This dashboard can be configured to trigger alerts when certain conditions are met, such as:
- Zero active connections during expected operational hours
- Connection count exceeding a certain threshold (indicating potential abuse)
- Rapid changes in connection counts (indicating potential service instability)

To set up alerts:
1. Navigate to the alert icon in the panel you want to add an alert to.
2. Configure the conditions that should trigger the alert.
3. Set up notification channels (Slack, email, etc.) to receive the alerts.

## Relationship to Other Monitoring Components

This dashboard works in conjunction with:
- The `/ws/health` endpoint, which provides basic health status of the WebSocket service.
- The `/ws/metrics` endpoint, which provides the raw Prometheus metrics used by this dashboard.
- Other Predator Analytics monitoring dashboards, giving a complete picture of system health. 