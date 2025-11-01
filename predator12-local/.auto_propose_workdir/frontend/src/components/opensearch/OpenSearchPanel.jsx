"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const OPENSEARCH_EMBED_ENABLED = ((_b = (_a = import.meta) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.VITE_OPENSEARCH_EMBED_ENABLED) === 'true' || true;
const OPENSEARCH_IFRAME_SRC = ((_d = (_c = import.meta) === null || _c === void 0 ? void 0 : _c.env) === null || _d === void 0 ? void 0 : _d.VITE_OPENSEARCH_IFRAME_SRC) || '/osd/app/dashboards#/view/overview?embed=true';
const OpenSearchPanel = () => {
    if (!OPENSEARCH_EMBED_ENABLED) {
        return <material_1.Alert severity="warning">OpenSearch embed вимкнено (VITE_OPENSEARCH_EMBED_ENABLED=false)</material_1.Alert>;
    }
    return (<material_1.Box sx={{ mt: 3 }}>
      <material_1.Typography variant="h5" sx={{ mb: 2, color: '#00ffff' }}>Аналітична палуба (OpenSearch)</material_1.Typography>
      <material_1.Box sx={{
            position: 'relative',
            width: '100%',
            height: '70vh',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(0,255,255,0.15)'
        }}>
        <iframe title="OpenSearch Dashboards" src={OPENSEARCH_IFRAME_SRC} style={{ width: '100%', height: '100%', border: '0' }} sandbox="allow-same-origin allow-scripts allow-forms allow-popups"/>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = OpenSearchPanel;
