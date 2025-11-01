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
const material_1 = require("@mui/material");
const nexusTheme_1 = require("../../theme/nexusTheme");
const severityColor = (s) => {
    switch (s) {
        case 'critical': return nexusTheme_1.nexusColors.crimson;
        case 'warning': return nexusTheme_1.nexusColors.warning;
        default: return nexusTheme_1.nexusColors.sapphire;
    }
};
const getWsBase = () => {
    var _a;
    const apiBase = ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.VITE_API_BASE) || 'http://localhost:8000';
    return apiBase.replace(/^http/i, 'ws');
};
const prefersReducedMotion = () => {
    if (typeof window === 'undefined' || !('matchMedia' in window))
        return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
const truncateText = (text, len) => {
    if (!len || text.length <= len)
        return text;
    return text.slice(0, len - 1) + '…';
};
const AlertTicker = ({ maxItems = 30, filterSeverities, speedPxPerSec = 60, pauseOnHover = true, truncate = 100, }) => {
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    const wsRef = (0, react_1.useRef)(null);
    const [paused, setPaused] = (0, react_1.useState)(false);
    const [retries, setRetries] = (0, react_1.useState)(0);
    const reduceMotion = prefersReducedMotion();
    const filtered = (0, react_1.useMemo)(() => (filterSeverities && filterSeverities.length
        ? alerts.filter(a => filterSeverities.includes(a.severity))
        : alerts), [alerts, filterSeverities]);
    (0, react_1.useEffect)(() => {
        let alive = true;
        const base = getWsBase();
        const url = `${base}/ws/alerts`;
        const connect = () => {
            const ws = new WebSocket(url);
            wsRef.current = ws;
            ws.onopen = () => {
                if (!alive)
                    return;
                setRetries(0);
            };
            ws.onmessage = (ev) => {
                if (!alive)
                    return;
                try {
                    const data = JSON.parse(ev.data);
                    const item = {
                        severity: (['info', 'warning', 'critical'].includes(data.severity) ? data.severity : 'info'),
                        title: typeof data.title === 'string' ? data.title : 'Подія',
                        ts: typeof data.ts === 'string' ? data.ts : new Date().toISOString()
                    };
                    setAlerts((prev) => [item, ...prev].slice(0, maxItems));
                }
                catch (_a) { }
            };
            ws.onclose = () => {
                if (!alive)
                    return;
                const next = Math.min(15000, 500 * Math.pow(2, retries));
                setTimeout(() => {
                    if (!alive)
                        return;
                    setRetries(r => r + 1);
                    connect();
                }, next || 500);
            };
            ws.onerror = () => {
                try {
                    ws.close();
                }
                catch (_a) { }
            };
        };
        connect();
        return () => {
            var _a;
            alive = false;
            try {
                (_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.close();
            }
            catch (_b) { }
        };
    }, [maxItems]);
    // обчислюємо тривалість анімації відповідно до ширини контенту і швидкості
    const laneRef = (0, react_1.useRef)(null);
    const [animDuration, setAnimDuration] = (0, react_1.useState)(30); // fallback
    (0, react_1.useEffect)(() => {
        if (!laneRef.current)
            return;
        const w = laneRef.current.scrollWidth / 2; // бо дублюємо контент
        const duration = Math.max(10, Math.round(w / Math.max(20, speedPxPerSec)));
        setAnimDuration(duration);
    }, [filtered, speedPxPerSec]);
    const content = filtered.length ? filtered : [];
    return (<material_1.Box sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflow: 'hidden',
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 2,
            background: `${nexusTheme_1.nexusColors.obsidian}B0`,
            backdropFilter: 'blur(10px)',
            px: 2,
            py: 1
        }} aria-live="polite" role="region" aria-label="Стрічка алертів" onMouseEnter={() => pauseOnHover && setPaused(true)} onMouseLeave={() => pauseOnHover && setPaused(false)}>
      <material_1.Chip label="Алерти" size="small" sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
            color: nexusTheme_1.nexusColors.emerald,
            border: `1px solid ${nexusTheme_1.nexusColors.emerald}60`
        }}/>

      {/* якщо ввімкнено reduce-motion або нема алертів — показуємо статичний список */}
      {reduceMotion || !content.length ? (<material_1.Box sx={{ display: 'flex', gap: 4 }}>
          {content.slice(0, 6).map((a, i) => (<material_1.Box key={i}>
              <material_1.Typography component="span" sx={{ color: severityColor(a.severity), fontFamily: 'Fira Code', fontSize: 13 }}>
                [{new Date(a.ts).toLocaleTimeString()}]
              </material_1.Typography>
              <material_1.Typography component="span" sx={{ color: nexusTheme_1.nexusColors.frost, ml: 1, fontFamily: 'Fira Code', fontSize: 13 }}>
                {a.title}
              </material_1.Typography>
            </material_1.Box>))}
          {!content.length && (<material_1.Typography component="span" sx={{ color: nexusTheme_1.nexusColors.shadow, fontFamily: 'Fira Code', fontSize: 13 }}>
              Подій немає
            </material_1.Typography>)}
        </material_1.Box>) : (<material_1.Box sx={{
                whiteSpace: 'nowrap',
                minWidth: '200%',
                animation: `ticker ${animDuration}s linear infinite`,
                animationPlayState: paused ? 'paused' : 'running',
                '@keyframes ticker': {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' }
                },
            }} ref={laneRef}>
          <material_1.Box component="span" sx={{ pr: 6 }}>
            {[...content, ...content].map((a, i) => (<material_1.Box component="span" key={i} sx={{ mr: 4 }}>
                <material_1.Typography component="span" sx={{ color: severityColor(a.severity), fontFamily: 'Fira Code', fontSize: 13 }}>
                  [{new Date(a.ts).toLocaleTimeString()}]
                </material_1.Typography>
                <material_1.Tooltip title={a.title} arrow>
                  <material_1.Typography component="span" sx={{ color: nexusTheme_1.nexusColors.frost, ml: 1, fontFamily: 'Fira Code', fontSize: 13 }}>
                    {truncateText(a.title, truncate)}
                  </material_1.Typography>
                </material_1.Tooltip>
              </material_1.Box>))}
          </material_1.Box>
        </material_1.Box>)}
    </material_1.Box>);
};
exports.default = AlertTicker;
