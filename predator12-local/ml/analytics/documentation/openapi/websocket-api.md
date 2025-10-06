# WebSocket API for Predator Analytics

This document describes the WebSocket endpoints available in the Predator Analytics API for real-time data streaming.

## Sentiment Updates

- **Endpoint**: `/ws/sentiment-updates`
- **Description**: Provides real-time sentiment updates for various geographic regions. Clients can connect to this endpoint to receive periodic updates about sentiment scores, trends, and contributing topics for different regions.
- **Message Format**: JSON
- **Message Structure**:
  ```json
  {
    "timestamp": "string (ISO 8601 format)", // Timestamp of the update
    "region_sentiments": [
      {
        "region_id": "string", // Identifier for the geographic region (e.g., 'USA_CA')
        "sentiment_score": "number", // Aggregated sentiment score (-1.0 to 1.0)
        "trend": "string", // Sentiment trend (e.g., 'improving', 'declining', 'stable')
        "key_topics_contributing": ["string"] // Top topics influencing sentiment
      }
      // ... more regions
    ]
  }
  ```
- **Update Frequency**: Approximately every 5 seconds
- **Usage**: Connect to this endpoint using a WebSocket client (e.g., in JavaScript, use `new WebSocket('ws://<api-host>/ws/sentiment-updates')`). Handle incoming messages to update UI components in real-time. 