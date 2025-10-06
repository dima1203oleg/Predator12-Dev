# ChronoSpatialMap: Real-Time Sentiment Monitoring

## Overview

`ChronoSpatialMap` is a component of the Nexus Core interface in Predator Analytics that provides a visual representation of real-time sentiment across different geographic regions. It connects to a WebSocket endpoint to receive periodic updates on sentiment data, allowing users to monitor changes as they happen.

## Features

- **Real-Time Updates**: Sentiment data for various regions is updated every few seconds via a WebSocket connection.
- **Visual Representation**: Regions are displayed as colored blocks on a map-like interface. The color indicates the sentiment score:
  - **Bright Cyan (Strong Positive)**: Sentiment score > 0.5
  - **Cyan (Positive)**: Sentiment score > 0.1
  - **Red (Negative)**: Sentiment score < -0.1
  - **Bright Red (Strong Negative)**: Sentiment score < -0.5
  - **Greyish Blue (Neutral)**: Sentiment score between -0.1 and 0.1
- **Interactivity**: Click on a region to view detailed information including sentiment score, trend (improving, declining, stable), and key topics influencing the sentiment.
- **Connection Status**: Displays whether the WebSocket connection is active, with an option to reconnect if disconnected.

## How to Use

1. **Access the Map**: Navigate to the section of the Nexus Core dashboard where the `ChronoSpatialMap` is displayed.
2. **Monitor Sentiment**: Observe the color changes of regions on the map to get a quick overview of sentiment shifts.
3. **View Details**: Click on any region to open a popup with detailed sentiment data for that region.
4. **Reconnect if Needed**: If the status shows 'Disconnected', click the 'Reconnect' button to attempt re-establishing the WebSocket connection.

## Technical Notes

- The map connects to the `/ws/sentiment-updates` WebSocket endpoint of the Predator Analytics API.
- Updates are received approximately every 5 seconds.
- If the connection is lost, the UI will indicate this, and manual reconnection can be attempted.

## Troubleshooting

- **Disconnected Status**: If the map shows 'Disconnected', ensure your network connection is stable and the API server is reachable. Use the 'Reconnect' button to retry.
- **No Data for Regions**: If regions do not update or show 'No sentiment data available' in the popup, the backend might not be sending data for those regions. This is expected if the mock data or real data does not cover all displayed regions. 