import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Assuming axios is available

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Mock regions matching ChronoSpatialMap
const MOCK_REGIONS = [
    { id: "", name: "All Regions" },
    { id: "USA_CA", name: "California, USA" },
    { id: "USA_NY", name: "New York, USA" },
    { id: "EU_DE", name: "Germany, EU" },
    { id: "EU_FR", name: "France, EU" },
    { id: "AS_JP", name: "Japan, Asia" },
    { id: "AS_CN", name: "China, Asia" },
];

const InfluencersPanel = () => {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ platform: '', min_followers: '', topic: '' });
    const [impactRequest, setImpactRequest] = useState({ influencer_ids: [], keywords: '', time_period_days: 7, region_id: '' });
    const [impactResults, setImpactResults] = useState([]);
    const [loadingImpact, setLoadingImpact] = useState(false);

    const fetchInfluencers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (filters.platform) queryParams.append('platform', filters.platform);
            if (filters.min_followers) queryParams.append('min_followers', filters.min_followers);
            if (filters.topic) queryParams.append('topic', filters.topic);

            const response = await axios.get(`${API_BASE_URL}/api/analysis/social-media-influencers?${queryParams.toString()}`);
            setInfluencers(response.data.influencers || []);
        } catch (err) {
            setError('Failed to fetch influencers: ' + (err.response?.data?.detail || err.message));
            setInfluencers([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchInfluencers();
    }, [fetchInfluencers]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleImpactRequestChange = (e) => {
        const { name, value } = e.target;
        if (name === "influencer_ids" || name === "keywords") {
            setImpactRequest({ ...impactRequest, [name]: value.split(',').map(item => item.trim()).filter(item => item) });
        } else {
            setImpactRequest({ ...impactRequest, [name]: value });
        }
    };

    const handleFetchImpact = async (e) => {
        e.preventDefault();
        if (!impactRequest.influencer_ids.length) {
            alert("Please enter at least one influencer ID.");
            return;
        }
        setLoadingImpact(true);
        setError(null);
        try {
            const payload = {
                influencer_ids: impactRequest.influencer_ids,
                keywords: impactRequest.keywords.length > 0 ? impactRequest.keywords : null,
                time_period_days: parseInt(impactRequest.time_period_days, 10) || 7,
                region_id: impactRequest.region_id || null
            };
            const response = await axios.post(`${API_BASE_URL}/api/analysis/influencer-impact`, payload);
            setImpactResults(response.data || []);
        } catch (err) {
            setError('Failed to fetch influencer impact: ' + (err.response?.data?.detail || err.message));
            setImpactResults([]);
        } finally {
            setLoadingImpact(false);
        }
    };

    // Basic styling - can be replaced with Tailwind or Material-UI specific classes
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
        margin: '5px'
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
    const thTdStyle = { border: '1px solid #00A99D', padding: '8px', textAlign: 'left' };
    const selectStyle = {
        backgroundColor: 'rgba(25, 40, 65, 0.9)',
        color: '#E6F1FF',
        border: '1px solid #00A99D',
        padding: '8px 12px',
        borderRadius: '4px',
        margin: '5px',
        width: 'calc(40% - 20px)'
    };

    return (
        <div style={panelStyle}>
            <h2 style={{ color: '#00FFC6', borderBottom: '1px solid #00FFC6', paddingBottom: '10px' }}>Social Media Influencers Analysis</h2>
            
            <h3>Filter Influencers</h3>
            <form onSubmit={(e) => { e.preventDefault(); fetchInfluencers(); }}>
                <input type="text" name="platform" placeholder="Platform (e.g., Twitter)" value={filters.platform} onChange={handleFilterChange} style={inputStyle} />
                <input type="number" name="min_followers" placeholder="Min Followers" value={filters.min_followers} onChange={handleFilterChange} style={inputStyle} />
                <input type="text" name="topic" placeholder="Topic (e.g., crypto)" value={filters.topic} onChange={handleFilterChange} style={inputStyle} />
                <button type="submit" style={buttonStyle} disabled={loading}>{loading ? 'Loading...' : 'Apply Filters'}</button>
            </form>

            {error && <p style={{ color: '#FF4C4C' }}>Error: {error}</p>}

            <h3>Influencer List</h3>
            {influencers.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr>
                            <th style={thTdStyle}>Username</th>
                            <th style={thTdStyle}>Platform</th>
                            <th style={thTdStyle}>Followers</th>
                            <th style={thTdStyle}>Influence Score</th>
                            <th style={thTdStyle}>Key Topics</th>
                        </tr>
                    </thead>
                    <tbody>
                        {influencers.map(inf => (
                            <tr key={inf.id}>
                                <td style={thTdStyle}>{inf.username}</td>
                                <td style={thTdStyle}>{inf.platform}</td>
                                <td style={thTdStyle}>{inf.followers_count.toLocaleString()}</td>
                                <td style={thTdStyle}>{inf.influence_score}</td>
                                <td style={thTdStyle}>{inf.key_topics.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>{loading ? 'Loading influencers...' : 'No influencers found for the current filters.'}</p>
            )}

            <h3 style={{ marginTop: '30px' }}>Analyze Influencer Impact</h3>
            <form onSubmit={handleFetchImpact}>
                <input 
                    type="text" 
                    name="influencer_ids" 
                    placeholder="Influencer IDs (comma-separated, e.g., tw_elon,tg_durov)" 
                    value={impactRequest.influencer_ids.join(',')}
                    onChange={handleImpactRequestChange} 
                    style={{...inputStyle, width: 'calc(100% - 24px)'}}
                    required
                />
                <input 
                    type="text" 
                    name="keywords" 
                    placeholder="Keywords (comma-separated, optional)" 
                    value={impactRequest.keywords.join(',')}
                    onChange={handleImpactRequestChange} 
                    style={{...inputStyle, width: 'calc(60% - 20px)'}}
                />
                <input 
                    type="number" 
                    name="time_period_days" 
                    placeholder="Time Period (days)" 
                    value={impactRequest.time_period_days}
                    onChange={handleImpactRequestChange} 
                    style={{...inputStyle, width: 'calc(30% - 20px)'}}
                />
                <select
                    name="region_id"
                    value={impactRequest.region_id}
                    onChange={handleImpactRequestChange}
                    style={selectStyle}
                >
                    {MOCK_REGIONS.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                </select>
                <button type="submit" style={buttonStyle} disabled={loadingImpact}>{loadingImpact ? 'Analyzing...' : 'Analyze Impact'}</button>
            </form>

            {impactResults.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Impact Analysis Results:</h4>
                    {impactResults.map(res => (
                        <div key={res.influencer_id} style={{ border: '1px solid #00A99D', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
                            <p><strong>Influencer ID:</strong> {res.influencer_id}</p>
                            <p><strong>Estimated Reach:</strong> {res.estimated_reach.toLocaleString()}</p>
                            <p><strong>Engagement on Keywords:</strong> {res.engagement_on_keywords.toLocaleString()}</p>
                            <p><strong>Key Themes:</strong> {res.key_themes_in_posts.join(', ')}</p>
                            <p><strong>Overall Sentiment:</strong> {res.overall_sentiment_on_keywords}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InfluencersPanel; 