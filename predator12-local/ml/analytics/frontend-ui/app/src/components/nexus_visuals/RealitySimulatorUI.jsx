import React, { useState, useEffect, useCallback } from 'react';
import useSimulationStore from '../../store/simulationStore';
import WebSocketStatus from './WebSocketStatus';
import useGlobalWebSocket from '../../hooks/useGlobalWebSocket';

const API_WS_URL = process.env.REACT_APP_API_WS_URL || 'ws://localhost:8000/ws';

const RealitySimulatorUI = () => {
    const [selectedScenario, setSelectedScenario] = useState('');
    const [sentimentImpact, setSentimentImpact] = useState('neutral');
    const [region, setRegion] = useState('');
    const [simulationResults, setSimulationResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const { selectedRegion } = useSimulationStore();

    // Handle incoming simulation update messages
    const handleSimulationUpdate = useCallback((data) => {
        if (data.type === 'simulation_update' && !isRunning) {
            // Update UI with any incoming simulation data when not actively running a simulation
            console.log('Received simulation update:', data);
        }
    }, [isRunning]);

    // Use the global WebSocket hook
    const { connectionStatus, sendMessage } = useGlobalWebSocket(
        'simulation-updates',
        {
            onMessage: handleSimulationUpdate,
            autoReconnect: true
        }
    );

    // Sync local region with global selectedRegion from store if available
    useEffect(() => {
        if (selectedRegion && selectedRegion !== region) {
            setRegion(selectedRegion);
        }
    }, [selectedRegion, region]);

    // Mock scenarios that can be influenced by sentiment
    const SCENARIOS = [
        { id: 'economic_forecast', name: 'Economic Forecast' },
        { id: 'political_stability', name: 'Political Stability' },
        { id: 'market_trends', name: 'Market Trends' },
    ];

    // Mock regions (same as ChronoSpatialMap and InfluencersPanel)
    const REGIONS = [
        { id: '', name: 'Global' },
        { id: 'USA_CA', name: 'California, USA' },
        { id: 'USA_NY', name: 'New York, USA' },
        { id: 'EU_DE', name: 'Germany, EU' },
        { id: 'EU_FR', name: 'France, EU' },
        { id: 'AS_JP', name: 'Japan, Asia' },
        { id: 'AS_CN', name: 'China, Asia' },
    ];

    // Mock sentiment impact options
    const SENTIMENT_IMPACTS = [
        { id: 'positive', name: 'Positive Sentiment' },
        { id: 'neutral', name: 'Neutral Sentiment' },
        { id: 'negative', name: 'Negative Sentiment' },
    ];

    const runSimulation = () => {
        if (!selectedScenario) {
            alert('Please select a scenario.');
            return;
        }

        setIsRunning(true);

        // Create simulation request object
        const simulationRequest = {
            scenario: selectedScenario,
            sentiment_impact: sentimentImpact,
            region: region || 'global'
        };

        // Try to send the request via WebSocket if connected
        const sentViaWs = sendMessage({
            type: 'run_simulation',
            data: simulationRequest
        });

        // If WebSocket send failed, fallback to mock data simulation
        if (!sentViaWs) {
            console.log('WebSocket unavailable, using mock simulation data');
            // Simulate a delay for processing
            setTimeout(() => {
                generateMockResults(selectedScenario, sentimentImpact, region);
                setIsRunning(false);
            }, 2000);
        }
    };

    // Generate mock results (moved from the inline setTimeout)
    const generateMockResults = (scenario, sentiment, regionId) => {
        // Mock results based on scenario and sentiment impact
        let resultText = `Simulation for ${SCENARIOS.find(s => s.id === scenario)?.name}`;
        if (regionId) {
            resultText += ` in ${REGIONS.find(r => r.id === regionId)?.name}`;
        } else {
            resultText += ` globally`;
        }
        resultText += ` with ${SENTIMENT_IMPACTS.find(s => s.id === sentiment)?.name.toLowerCase()}.`;

        // Mock outcomes influenced by sentiment
        if (scenario === 'economic_forecast') {
            if (sentiment === 'positive') {
                resultText += ` Result: Economic growth projected at 3.5% annually due to positive public sentiment boosting consumer confidence.`;
            } else if (sentiment === 'negative') {
                resultText += ` Result: Economic downturn projected with -1.2% growth due to negative sentiment reducing investment.`;
            } else {
                resultText += ` Result: Stable economy with minimal growth of 0.5% under neutral sentiment conditions.`;
            }
        } else if (scenario === 'political_stability') {
            if (sentiment === 'positive') {
                resultText += ` Result: High political stability with 85% public approval due to positive sentiment towards leadership.`;
            } else if (sentiment === 'negative') {
                resultText += ` Result: Increased political unrest with 40% approval rating due to negative public sentiment.`;
            } else {
                resultText += ` Result: Moderate political stability with 60% approval under neutral sentiment.`;
            }
        } else if (scenario === 'market_trends') {
            if (sentiment === 'positive') {
                resultText += ` Result: Bullish market trend with stock indices up by 7% driven by positive sentiment.`;
            } else if (sentiment === 'negative') {
                resultText += ` Result: Bearish market trend with indices down by 5% due to negative consumer sentiment.`;
            } else {
                resultText += ` Result: Flat market trend with minimal change under neutral sentiment.`;
            }
        }

        setSimulationResults({
            summary: resultText,
            timestamp: new Date().toLocaleString(),
            detailedMetrics: [
                { label: 'Confidence Index', value: sentiment === 'positive' ? 'High (78/100)' : sentiment === 'negative' ? 'Low (32/100)' : 'Moderate (55/100)' },
                { label: 'Impact Factor', value: sentiment === 'positive' ? '+15%' : sentiment === 'negative' ? '-12%' : '+/- 2%' },
            ]
        });
    };

    // Basic styling matching Nexus Core aesthetic
    const panelStyle = {
        backgroundColor: 'rgba(10, 25, 47, 0.85)', // Dark blue, semi-transparent
        border: '1px solid #00FFC6', // Neon cyan border
        borderRadius: '8px',
        padding: '20px',
        margin: '20px',
        color: '#E6F1FF', // Light text color
        fontFamily: '"Orbitron", sans-serif',
        maxHeight: '80vh',
        overflowY: 'auto'
    };
    const inputStyle = {
        backgroundColor: 'rgba(25, 40, 65, 0.9)',
        color: '#E6F1FF',
        border: '1px solid #00A99D',
        padding: '8px 12px',
        borderRadius: '4px',
        margin: '5px',
        width: 'calc(33% - 20px)'
    };
    const buttonStyle = {
        backgroundColor: '#00FFC6',
        color: '#0A192F',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        margin: '10px 5px'
    };

    return (
        <div style={panelStyle}>
            <h2 style={{ color: '#00FFC6', borderBottom: '1px solid #00FFC6', paddingBottom: '10px' }}>
                Reality Simulator
                <WebSocketStatus 
                    wsEndpoint="/ws/simulation-updates"
                    connectionStatus={connectionStatus}
                    minimal={true}
                    style={{ float: 'right', marginTop: '5px' }}
                />
            </h2>
            
            <h3>Configure Simulation</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <select 
                    value={selectedScenario} 
                    onChange={(e) => setSelectedScenario(e.target.value)} 
                    style={inputStyle}
                    disabled={isRunning}
                >
                    <option value="">Select Scenario</option>
                    {SCENARIOS.map(scenario => (
                        <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
                    ))}
                </select>
                <select 
                    value={sentimentImpact} 
                    onChange={(e) => setSentimentImpact(e.target.value)} 
                    style={inputStyle}
                    disabled={isRunning}
                >
                    {SENTIMENT_IMPACTS.map(impact => (
                        <option key={impact.id} value={impact.id}>{impact.name}</option>
                    ))}
                </select>
                <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)} 
                    style={inputStyle}
                    disabled={isRunning}
                >
                    {REGIONS.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>
            <button 
                onClick={runSimulation} 
                style={buttonStyle} 
                disabled={isRunning || !selectedScenario}
            >
                {isRunning ? 'Simulating...' : 'Run Simulation'}
            </button>

            {simulationResults && (
                <div style={{ marginTop: '20px', border: '1px solid #00A99D', padding: '10px', borderRadius: '4px' }}>
                    <h3 style={{ color: '#00FFC6' }}>Simulation Results</h3>
                    <p style={{ margin: 0 }}><strong>Time:</strong> {simulationResults.timestamp}</p>
                    <p style={{ margin: '10px 0' }}>{simulationResults.summary}</p>
                    <h4 style={{ marginTop: '15px' }}>Detailed Metrics:</h4>
                    <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                        {simulationResults.detailedMetrics.map((metric, index) => (
                            <li key={index}><strong>{metric.label}:</strong> {metric.value}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RealitySimulatorUI; 