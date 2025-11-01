"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFeatureEnabled = exports.featureFlags = void 0;
exports.featureFlags = {
    charts: true,
    threeDee: true,
    aiGuide: false,
    realitySim: false,
    dataOps: true
};
const isFeatureEnabled = (key) => exports.featureFlags[key];
exports.isFeatureEnabled = isFeatureEnabled;
