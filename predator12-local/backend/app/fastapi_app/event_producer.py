import json
import os

from kafka import KafkaProducer


class EventProducer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=os.getenv("KAFKA_SERVERS", "localhost:9092"),
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        )

    def send_event(self, topic: str, event: dict):
        """Send event to Kafka topic"""
        try:
            future = self.producer.send(topic, event)
            self.producer.flush()
            return f"Event sent to {topic}"
        except Exception as e:
            return f"Error sending event: {str(e)}"

    def send_etl_completion(self, file_name: str, records_processed: int):
        """Send ETL completion event"""
        event = {
            "event_type": "etl_completed",
            "file_name": file_name,
            "records_processed": records_processed,
            "timestamp": "2025-09-24T12:00:00Z",
        }
        return self.send_event("etl-events", event)

    def send_anomaly_detected(self, anomaly_data: dict):
        """Send anomaly detection event"""
        event = {
            "event_type": "anomaly_detected",
            "data": anomaly_data,
            "timestamp": "2025-09-24T12:00:00Z",
        }
        return self.send_event("ml-events", event)


# Global instance
event_producer = EventProducer()
