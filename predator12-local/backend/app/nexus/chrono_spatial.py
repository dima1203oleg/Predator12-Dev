"""
Chrono-Spatial Analysis API endpoints for Nexus Core
Provides 4D visualization data and temporal analysis capabilities
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import random
import math

router = APIRouter(prefix="/api/v1/chrono-spatial", tags=["chrono-spatial"])


class GeoEvent(BaseModel):
    id: str
    lat: float
    lon: float
    timestamp: float
    intensity: float
    type: str  # 'incident', 'anomaly', 'alert', 'normal'
    title: str
    description: str
    metadata: Optional[Dict[str, Any]] = None


class TimeRange(BaseModel):
    start: float
    end: float


class ChronoSpatialQuery(BaseModel):
    time_range: TimeRange
    event_types: Optional[List[str]] = None
    geo_bounds: Optional[Dict[str, float]] = None  # {'north': lat, 'south': lat, 'east': lon, 'west': lon}
    intensity_threshold: Optional[float] = None


@router.get("/events", response_model=List[GeoEvent])
async def get_geo_events(
    start_time: float = Query(0, description="Start timestamp"),
    end_time: float = Query(100, description="End timestamp"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    min_intensity: Optional[float] = Query(None, description="Minimum intensity threshold")
) -> List[GeoEvent]:
    """
    Get geographical events within specified time range and filters
    """
    
    # Generate sample events (in production, this would query a database)
    sample_events = []
    
    # Major world cities for realistic coordinates
    cities = [
        {"name": "Kyiv", "lat": 50.4501, "lon": 30.5234},
        {"name": "New York", "lat": 40.7128, "lon": -74.0060},
        {"name": "London", "lat": 51.5074, "lon": -0.1278},
        {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503},
        {"name": "Sydney", "lat": -33.8688, "lon": 151.2093},
        {"name": "Berlin", "lat": 52.5200, "lon": 13.4050},
        {"name": "Paris", "lat": 48.8566, "lon": 2.3522},
        {"name": "Moscow", "lat": 55.7558, "lon": 37.6176},
        {"name": "Beijing", "lat": 39.9042, "lon": 116.4074},
        {"name": "São Paulo", "lat": -23.5505, "lon": -46.6333}
    ]
    
    event_types = ['incident', 'anomaly', 'alert', 'normal']
    
    # Generate events across the time range
    for i in range(50):
        city = random.choice(cities)
        event_timestamp = random.uniform(start_time, end_time)
        event_type_choice = random.choice(event_types)
        
        # Add some randomness to coordinates
        lat_offset = random.uniform(-0.5, 0.5)
        lon_offset = random.uniform(-0.5, 0.5)
        
        intensity = random.uniform(0.1, 1.0)
        
        # Generate realistic event titles and descriptions
        if event_type_choice == 'incident':
            titles = ["Security Breach", "Unauthorized Access", "Data Leak", "System Intrusion"]
            descriptions = [
                "Suspicious login activity detected",
                "Multiple failed authentication attempts",
                "Unusual data access pattern",
                "Potential malware activity"
            ]
        elif event_type_choice == 'anomaly':
            titles = ["Traffic Anomaly", "Performance Spike", "Usage Pattern Change", "Data Anomaly"]
            descriptions = [
                "Unusual network traffic detected",
                "Performance metrics outside normal range",
                "User behavior pattern deviation",
                "Data quality issues identified"
            ]
        elif event_type_choice == 'alert':
            titles = ["Critical Alert", "System Warning", "Threshold Exceeded", "Service Disruption"]
            descriptions = [
                "Critical system threshold exceeded",
                "Service availability below SLA",
                "Resource utilization critical",
                "Emergency response required"
            ]
        else:  # normal
            titles = ["Normal Operation", "Routine Check", "Scheduled Maintenance", "Status Update"]
            descriptions = [
                "System functioning within parameters",
                "Routine system health check",
                "Scheduled maintenance completed",
                "Regular status report"
            ]
        
        event = GeoEvent(
            id=f"event_{i}_{int(event_timestamp)}",
            lat=city["lat"] + lat_offset,
            lon=city["lon"] + lon_offset,
            timestamp=event_timestamp,
            intensity=intensity,
            type=event_type_choice,
            title=random.choice(titles),
            description=random.choice(descriptions),
            metadata={
                "city": city["name"],
                "source": "nexus_monitor",
                "severity": "high" if intensity > 0.7 else "medium" if intensity > 0.4 else "low"
            }
        )
        
        sample_events.append(event)
    
    # Apply filters
    filtered_events = sample_events
    
    if event_type:
        filtered_events = [e for e in filtered_events if e.type == event_type]
    
    if min_intensity is not None:
        filtered_events = [e for e in filtered_events if e.intensity >= min_intensity]
    
    # Sort by timestamp
    filtered_events.sort(key=lambda x: x.timestamp)
    
    return filtered_events


@router.post("/events/query", response_model=List[GeoEvent])
async def query_geo_events(query: ChronoSpatialQuery) -> List[GeoEvent]:
    """
    Advanced query for geographical events with complex filters
    """
    
    # Get events using the basic endpoint logic
    events = await get_geo_events(
        start_time=query.time_range.start,
        end_time=query.time_range.end,
        min_intensity=query.intensity_threshold
    )
    
    # Apply additional filters
    if query.event_types:
        events = [e for e in events if e.type in query.event_types]
    
    if query.geo_bounds:
        bounds = query.geo_bounds
        events = [
            e for e in events
            if (bounds.get('south', -90) <= e.lat <= bounds.get('north', 90) and
                bounds.get('west', -180) <= e.lon <= bounds.get('east', 180))
        ]
    
    return events


@router.get("/heatmap")
async def get_event_heatmap(
    start_time: float = Query(0),
    end_time: float = Query(100),
    grid_size: int = Query(20, description="Grid resolution for heatmap")
) -> Dict[str, Any]:
    """
    Generate heatmap data for event density visualization
    """
    
    events = await get_geo_events(start_time=start_time, end_time=end_time)
    
    # Create grid
    lat_min, lat_max = -90, 90
    lon_min, lon_max = -180, 180
    
    lat_step = (lat_max - lat_min) / grid_size
    lon_step = (lon_max - lon_min) / grid_size
    
    heatmap_data = []
    
    for i in range(grid_size):
        for j in range(grid_size):
            lat_center = lat_min + (i + 0.5) * lat_step
            lon_center = lon_min + (j + 0.5) * lon_step
            
            # Count events in this grid cell
            count = 0
            total_intensity = 0
            
            for event in events:
                if (lat_min + i * lat_step <= event.lat < lat_min + (i + 1) * lat_step and
                    lon_min + j * lon_step <= event.lon < lon_min + (j + 1) * lon_step):
                    count += 1
                    total_intensity += event.intensity
            
            if count > 0:
                heatmap_data.append({
                    "lat": lat_center,
                    "lon": lon_center,
                    "count": count,
                    "avg_intensity": total_intensity / count,
                    "total_intensity": total_intensity
                })
    
    return {
        "grid_size": grid_size,
        "time_range": {"start": start_time, "end": end_time},
        "data": heatmap_data
    }


@router.get("/timeline")
async def get_event_timeline(
    start_time: float = Query(0),
    end_time: float = Query(100),
    bucket_size: float = Query(5.0, description="Time bucket size for aggregation")
) -> Dict[str, Any]:
    """
    Get event timeline with temporal aggregation
    """
    
    events = await get_geo_events(start_time=start_time, end_time=end_time)
    
    # Create time buckets
    timeline_data = []
    current_time = start_time
    
    while current_time < end_time:
        bucket_end = min(current_time + bucket_size, end_time)
        
        # Count events in this time bucket
        bucket_events = [
            e for e in events
            if current_time <= e.timestamp < bucket_end
        ]
        
        # Aggregate by type
        type_counts = {}
        for event in bucket_events:
            type_counts[event.type] = type_counts.get(event.type, 0) + 1
        
        timeline_data.append({
            "time_start": current_time,
            "time_end": bucket_end,
            "total_events": len(bucket_events),
            "event_types": type_counts,
            "avg_intensity": sum(e.intensity for e in bucket_events) / len(bucket_events) if bucket_events else 0
        })
        
        current_time = bucket_end
    
    return {
        "bucket_size": bucket_size,
        "time_range": {"start": start_time, "end": end_time},
        "timeline": timeline_data
    }


@router.get("/predictions")
async def get_event_predictions(
    current_time: float = Query(50),
    prediction_horizon: float = Query(20, description="How far into the future to predict")
) -> Dict[str, Any]:
    """
    Generate predictive analysis for future events
    """
    
    # Get historical events for pattern analysis
    historical_events = await get_geo_events(
        start_time=max(0, current_time - 50),
        end_time=current_time
    )
    
    # Simple prediction algorithm (in production, use ML models)
    predictions = []
    
    # Analyze patterns by location and type
    location_patterns = {}
    for event in historical_events:
        location_key = f"{round(event.lat, 1)}_{round(event.lon, 1)}"
        if location_key not in location_patterns:
            location_patterns[location_key] = {
                "lat": event.lat,
                "lon": event.lon,
                "events": [],
                "avg_interval": 0
            }
        location_patterns[location_key]["events"].append(event)
    
    # Generate predictions based on patterns
    for location_key, pattern in location_patterns.items():
        if len(pattern["events"]) >= 2:
            # Calculate average time between events
            events = sorted(pattern["events"], key=lambda x: x.timestamp)
            intervals = [events[i+1].timestamp - events[i].timestamp for i in range(len(events)-1)]
            avg_interval = sum(intervals) / len(intervals) if intervals else 10
            
            # Predict next event
            last_event_time = events[-1].timestamp
            predicted_time = last_event_time + avg_interval
            
            if current_time <= predicted_time <= current_time + prediction_horizon:
                # Predict event type based on historical patterns
                type_counts = {}
                for event in events:
                    type_counts[event.type] = type_counts.get(event.type, 0) + 1
                
                most_likely_type = max(type_counts.keys(), key=lambda k: type_counts[k])
                confidence = type_counts[most_likely_type] / len(events)
                
                predictions.append({
                    "predicted_time": predicted_time,
                    "lat": pattern["lat"],
                    "lon": pattern["lon"],
                    "predicted_type": most_likely_type,
                    "confidence": confidence,
                    "predicted_intensity": sum(e.intensity for e in events) / len(events)
                })
    
    return {
        "current_time": current_time,
        "prediction_horizon": prediction_horizon,
        "predictions": sorted(predictions, key=lambda x: x["predicted_time"])
    }


@router.get("/stats")
async def get_chrono_spatial_stats(
    start_time: float = Query(0),
    end_time: float = Query(100)
) -> Dict[str, Any]:
    """
    Get comprehensive statistics for the chrono-spatial data
    """
    
    events = await get_geo_events(start_time=start_time, end_time=end_time)
    
    if not events:
        return {
            "total_events": 0,
            "time_range": {"start": start_time, "end": end_time},
            "message": "No events found in specified time range"
        }
    
    # Calculate statistics
    total_events = len(events)
    
    # Event type distribution
    type_distribution = {}
    for event in events:
        type_distribution[event.type] = type_distribution.get(event.type, 0) + 1
    
    # Intensity statistics
    intensities = [e.intensity for e in events]
    avg_intensity = sum(intensities) / len(intensities)
    max_intensity = max(intensities)
    min_intensity = min(intensities)
    
    # Geographic distribution
    latitudes = [e.lat for e in events]
    longitudes = [e.lon for e in events]
    
    geographic_center = {
        "lat": sum(latitudes) / len(latitudes),
        "lon": sum(longitudes) / len(longitudes)
    }
    
    # Temporal distribution
    timestamps = [e.timestamp for e in events]
    time_span = max(timestamps) - min(timestamps)
    events_per_time_unit = total_events / time_span if time_span > 0 else 0
    
    return {
        "total_events": total_events,
        "time_range": {"start": start_time, "end": end_time},
        "type_distribution": type_distribution,
        "intensity_stats": {
            "average": avg_intensity,
            "maximum": max_intensity,
            "minimum": min_intensity
        },
        "geographic_stats": {
            "center": geographic_center,
            "lat_range": {"min": min(latitudes), "max": max(latitudes)},
            "lon_range": {"min": min(longitudes), "max": max(longitudes)}
        },
        "temporal_stats": {
            "time_span": time_span,
            "events_per_time_unit": events_per_time_unit,
            "first_event": min(timestamps),
            "last_event": max(timestamps)
        }
    }
