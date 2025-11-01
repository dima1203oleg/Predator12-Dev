"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchModule = void 0;
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const OpenSearchWrapper_1 = __importDefault(require("../nexus_visuals/OpenSearchWrapper"));
const OpenSearchModule = () => {
    const dashboardId = process.env.REACT_APP_OPENSEARCH_DEFAULT_DASHBOARD || 'Overview';
    const jwtToken = localStorage.getItem('jwt') || '';
    return (<OpenSearchWrapper_1.default dashboardId={dashboardId} jwtToken={jwtToken}/>);
};
exports.OpenSearchModule = OpenSearchModule;
