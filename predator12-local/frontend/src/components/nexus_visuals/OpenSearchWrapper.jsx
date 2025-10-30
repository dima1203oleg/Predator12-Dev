"use strict";
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
// @ts-nocheck
const react_1 = __importStar(require("react"));
const OpenSearchWrapper = ({ dashboardId, jwtToken }) => {
    const iframeRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        var _a;
        const injectStyles = () => {
            var _a;
            if (!iframeRef.current)
                return;
            try {
                const doc = iframeRef.current.contentDocument || ((_a = iframeRef.current.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                if (!doc)
                    return;
                const style = doc.createElement('style');
                style.innerHTML = `
          body, .app-wrapper { background-color: #05070A !important; }
          .navbar, .top-nav { background-color: rgba(15,18,26,0.9) !important; }
          .visualizationPanel { border: 2px solid #00FFC6 !important; }
          .euiPageTemplate__header { color: #C5D1E6 !important; }
        `;
                doc.head.appendChild(style);
            }
            catch (e) {
                // cross-origin or load error
            }
        };
        (_a = iframeRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener('load', injectStyles);
        return () => {
            var _a;
            (_a = iframeRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('load', injectStyles);
        };
    }, []);
    const src = `${process.env.REACT_APP_OPENSEARCH_HOST}/app/dashboards#/view/${dashboardId}?jwt=${jwtToken}`;
    return (<div style={{ position: 'relative', border: '4px solid #0A75FF', borderRadius: 8, overflow: 'hidden' }}>
      <iframe ref={iframeRef} src={src} style={{ width: '100%', height: '100vh', border: 'none' }} allowFullScreen title="OpenSearch Dashboard"/>
    </div>);
};
exports.default = OpenSearchWrapper;
