import React, { useState, useCallback } from 'react';
import useSimulationStore from '../../store/simulationStore';
import WebSocketStatus from './WebSocketStatus';
import useGlobalWebSocket from '../../hooks/useGlobalWebSocket';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Mock regions that correspond to what the backend might send IDs for
const MOCK_MAP_REGIONS = {
    "USA_CA": { name: "California", style: { top: '30%', left: '10%', width: '100px', height: '120px' } },
    "USA_NY": { name: "New York", style: { top: '25%', left: '30%', width: '80px', height: '70px' } },
    "EU_DE": { name: "Germany", style: { top: '20%', left: '50%', width: '90px', height: '100px' } },
    "EU_FR": { name: "France", style: { top: '35%', left: '45%', width: '80px', height: '90px' } },
    "AS_JP": { name: "Japan", style: { top: '30%', left: '80%', width: '70px', height: '100px' } },
    "AS_CN": { name: "China", style: { top: '25%', left: '65%', width: '150px', height: '130px' } },
};

const getSentimentColor = (score) => {
    if (score > 0.5) return 'rgba(0, 255, 198, 0.7)'; // Strong Positive - Bright Cyan
    if (score > 0.1) return 'rgba(0, 200, 150, 0.6)'; // Positive - Cyan
    if (score < -0.5) return 'rgba(255, 76, 76, 0.7)'; // Strong Negative - Bright Red
    if (score < -0.1) return 'rgba(255, 100, 100, 0.6)'; // Negative - Red
    return 'rgba(100, 120, 150, 0.5)'; // Neutral - Greyish Blue
};

const ChronoSpatialMap = () => {
    const [regionSentiments, setRegionSentiments] = useState({});
    const [lastUpdate, setLastUpdate] = useState(null);
    const [selectedRegionLocal, setSelectedRegionLocal] = useState(null);
    const { selectedRegion, setSelectedRegion } = useSimulationStore();
    
    // Process incoming WebSocket messages
    const handleSentimentUpdate = useCallback((data) => {
        if (data.timestamp && data.region_sentiments) {
            const newSentiments = {};
            data.region_sentiments.forEach(rs => {
                newSentiments[rs.region_id] = {
                    score: rs.sentiment_score,
                    trend: rs.trend,
                    topics: rs.key_topics_contributing,
                };
            });
            setRegionSentiments(prev => ({ ...prev, ...newSentiments }));
            setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
        }
    }, []);
    
    // Use the global WebSocket hook
    const { connectionStatus, connect } = useGlobalWebSocket(
        'sentiment-updates',
        {
            onMessage: handleSentimentUpdate,
            autoReconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10
        }
    );

    const handleRegionClick = (regionId) => {
        setSelectedRegionLocal(regionId);
        setSelectedRegion(regionId); // Update global store
    };

    const handleClosePopup = () => {
        setSelectedRegionLocal(null);
    };

    const mapContainerStyle = {
        position: 'relative',
        width: '100%',
        height: '600px', // Adjust as needed
        backgroundColor: '#051020', // Very dark blue, slightly lighter than main background
        border: '1px solid #00FFC6',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '20px 0',
        fontFamily: '"Orbitron", sans-serif',
    };

    const regionBaseStyle = {
        position: 'absolute',
        border: '1px solid #00A99D',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
        fontSize: '10px',
        color: '#E6F1FF',
        textAlign: 'center',
        transition: 'background-color 0.5s ease',
        cursor: 'pointer',
    };
    
    const statusHeaderStyle = {
        color: connectionStatus === 'connected' ? '#00FFC6' : '#FF4C4C',
        padding: '10px',
        textAlign: 'center',
        fontSize: '1em',
    };

    const popupStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(10, 25, 47, 0.9)',
        border: '2px solid #00FFC6',
        borderRadius: '8px',
        padding: '15px',
        color: '#E6F1FF',
        fontFamily: '"Orbitron", sans-serif',
        zIndex: 1000,
        maxWidth: '300px',
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    };

    return (
        <div style={{ padding: '10px' }}>
            <h3 style={{ color: '#00FFC6', borderBottom: '1px solid #00FFC6', paddingBottom: '10px' }}>
                Real-Time Regional Sentiment Map
            </h3>
            <WebSocketStatus 
                wsEndpoint="/ws/sentiment-updates"
                connectionStatus={connectionStatus}
                onReconnect={connect}
            />
            <div style={mapContainerStyle}>
                {Object.entries(MOCK_MAP_REGIONS).map(([regionId, regionData]) => {
                    const sentiment = regionSentiments[regionId];
                    const bgColor = sentiment ? getSentimentColor(sentiment.score) : 'rgba(50, 70, 100, 0.4)';
                    const isSelected = regionId === selectedRegion;
                    return (
                        <div 
                            key={regionId} 
                            style={{
                                ...regionBaseStyle,
                                ...regionData.style,
                                backgroundColor: bgColor,
                                border: isSelected ? '3px solid #FF0033' : '1px solid #00A99D', // Highlight selected
                            }}
                            onClick={() => handleRegionClick(regionId)}
                            title={sentiment ? `Score: ${sentiment.score}, Trend: ${sentiment.trend}, Topics: ${sentiment.topics?.join(', ')}` : regionData.name}
                        >
                            <div>{regionData.name}</div>
                            {sentiment && (
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                    {sentiment.score.toFixed(2)}
                                </div>
                            )}
                        </div>
                    );
                })}
                {selectedRegionLocal && (
                    <>
                        <div style={overlayStyle} onClick={handleClosePopup}></div>
                        <div style={popupStyle}>
                            <h4 style={{ color: '#00FFC6', marginTop: 0 }}>{MOCK_MAP_REGIONS[selectedRegionLocal].name}</h4>
                            {regionSentiments[selectedRegionLocal] ? (
                                <div>
                                    <p><strong>Sentiment Score:</strong> {regionSentiments[selectedRegionLocal].score.toFixed(2)}</p>
                                    <p><strong>Trend:</strong> {regionSentiments[selectedRegionLocal].trend}</p>
                                    <p><strong>Key Topics:</strong> {regionSentiments[selectedRegionLocal].topics?.join(', ') || 'N/A'}</p>
                                </div>
                            ) : (
                                <p>No sentiment data available.</p>
                            )}
                            <button 
                                onClick={handleClosePopup} 
                                style={{ 
                                    backgroundColor: '#00FFC6', 
                                    color: '#0A192F', 
                                    border: 'none', 
                                    padding: '5px 10px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer', 
                                    marginTop: '10px' 
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChronoSpatialMap; 