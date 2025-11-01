"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActiveAgents = exports.updateSystemStatus = exports.addGeoEvent = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    geoEvents: [
        { lat: 50.4501, lon: 30.5234, intensity: 0.8, timestamp: new Date(), type: 'anomaly' },
        { lat: 40.7128, lon: -74.0060, intensity: 0.6, timestamp: new Date(), type: 'security' },
        { lat: 51.5074, lon: -0.1278, intensity: 0.9, timestamp: new Date(), type: 'critical' },
    ],
    systemStatus: 'healthy',
    activeAgents: 8,
};
const analyticsSlice = (0, toolkit_1.createSlice)({
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
_a = analyticsSlice.actions, exports.addGeoEvent = _a.addGeoEvent, exports.updateSystemStatus = _a.updateSystemStatus, exports.setActiveAgents = _a.setActiveAgents;
exports.default = analyticsSlice.reducer;
