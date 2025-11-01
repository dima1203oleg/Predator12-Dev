"use strict";
// @ts-nocheck
/**
 * 📊 DASHBOARD EMBED COMPONENT
 *
 * Iframe контейнер з overlay CSS для маскування брендингу OpenSearch
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
const DashboardEmbed = ({ url, showPII = false, title }) => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // Modify URL based on PII access
    const effectiveUrl = showPII ? url : `${url}?alias=safe`;
    (0, react_1.useEffect)(() => {
        setLoading(true);
        setError(null);
        // Log PII access if enabled
        if (showPII) {
            console.log(`[AUDIT] PII access to dashboard: ${title}`);
            // TODO: Send to backend audit log
        }
    }, [url, showPII, title]);
    const handleIframeLoad = () => {
        setLoading(false);
    };
    const handleIframeError = () => {
        setLoading(false);
        setError('Failed to load dashboard. Please check your connection and permissions.');
    };
    return (<material_1.Box sx={{ position: 'relative', height: 'calc(100vh - 250px)', minHeight: '600px' }}>
      {/* Loading State */}
      {loading && (<material_1.Stack alignItems="center" justifyContent="center" sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: nexusThemeV2_1.nexusColorsDark.background.paper,
                zIndex: 10
            }}>
          <material_1.CircularProgress sx={{ color: nexusThemeV2_1.nexusColorsDark.primary.main, mb: 2 }}/>
          <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
            Завантаження дашборду...
          </material_1.Typography>
        </material_1.Stack>)}

      {/* Error State */}
      {error && (<material_1.Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </material_1.Alert>)}

      {/* Iframe Container with Masking Overlay */}
      <material_1.Box sx={{
            position: 'relative',
            height: '100%',
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.medium}`,
            backgroundColor: nexusThemeV2_1.nexusColorsDark.background.paper,
            // Overlay CSS для приховування OpenSearch брендингу
            '& iframe': {
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
            },
            // Custom CSS injection для iframe (через постпроцесінг)
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 60,
                background: `linear-gradient(180deg, ${nexusThemeV2_1.nexusColorsDark.background.paper} 0%, transparent 100%)`,
                zIndex: 1,
                pointerEvents: 'none'
            }
        }}>
        <iframe src={effectiveUrl} title={title} onLoad={handleIframeLoad} onError={handleIframeError} sandbox="allow-same-origin allow-scripts allow-forms" style={{
            colorScheme: 'dark'
        }}/>
      </material_1.Box>

      {/* PII Indicator Overlay */}
      {showPII && (<material_1.Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 5,
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}>
          🔓 PII MODE
        </material_1.Box>)}
    </material_1.Box>);
};
exports.default = DashboardEmbed;
