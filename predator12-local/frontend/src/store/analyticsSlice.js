import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    geoEvents: [
        { lat: 50.4501, lon: 30.5234, intensity: 0.8, timestamp: new Date(), type: 'anomaly' },
        { lat: 40.7128, lon: -74.0060, intensity: 0.6, timestamp: new Date(), type: 'security' },
        { lat: 51.5074, lon: -0.1278, intensity: 0.9, timestamp: new Date(), type: 'critical' },
    ],
    systemStatus: 'healthy',
    activeAgents: 8,
};
const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        addGeoEvent: (state, action) => {
            state.geoEvents.push(action.payload);
        },
        updateSystemStatus: (state, action) => {
            state.systemStatus = action.payload;
        },
        setActiveAgents: (state, action) => {
            state.activeAgents = action.payload;
        },
    },
});
export const { addGeoEvent, updateSystemStatus, setActiveAgents } = analyticsSlice.actions;
export default analyticsSlice.reducer;
