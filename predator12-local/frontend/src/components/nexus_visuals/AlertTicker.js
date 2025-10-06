import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';
const severityColor = (s) => {
    switch (s) {
        case 'critical': return nexusColors.crimson;
        case 'warning': return nexusColors.warning;
        default: return nexusColors.sapphire;
    }
};
const getWsBase = () => {
    const apiBase = import.meta.env?.VITE_API_BASE || 'http://localhost:8000';
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
    const [alerts, setAlerts] = useState([]);
    const wsRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const [retries, setRetries] = useState(0);
    const reduceMotion = prefersReducedMotion();
    const filtered = useMemo(() => (filterSeverities && filterSeverities.length
        ? alerts.filter(a => filterSeverities.includes(a.severity))
        : alerts), [alerts, filterSeverities]);
    useEffect(() => {
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
                catch { }
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
                catch { }
            };
        };
        connect();
        return () => {
            alive = false;
            try {
                wsRef.current?.close();
            }
            catch { }
        };
    }, [maxItems]);
    // обчислюємо тривалість анімації відповідно до ширини контенту і швидкості
    const laneRef = useRef(null);
    const [animDuration, setAnimDuration] = useState(30); // fallback
    useEffect(() => {
        if (!laneRef.current)
            return;
        const w = laneRef.current.scrollWidth / 2; // бо дублюємо контент
        const duration = Math.max(10, Math.round(w / Math.max(20, speedPxPerSec)));
        setAnimDuration(duration);
    }, [filtered, speedPxPerSec]);
    const content = filtered.length ? filtered : [];
    return (_jsxs(Box, { sx: {
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflow: 'hidden',
            border: `1px solid ${nexusColors.quantum}`,
            borderRadius: 2,
            background: `${nexusColors.obsidian}B0`,
            backdropFilter: 'blur(10px)',
            px: 2,
            py: 1
        }, "aria-live": "polite", role: "region", "aria-label": "\u0421\u0442\u0440\u0456\u0447\u043A\u0430 \u0430\u043B\u0435\u0440\u0442\u0456\u0432", onMouseEnter: () => pauseOnHover && setPaused(true), onMouseLeave: () => pauseOnHover && setPaused(false), children: [_jsx(Chip, { label: "\u0410\u043B\u0435\u0440\u0442\u0438", size: "small", sx: {
                    backgroundColor: `${nexusColors.emerald}20`,
                    color: nexusColors.emerald,
                    border: `1px solid ${nexusColors.emerald}60`
                } }), reduceMotion || !content.length ? (_jsxs(Box, { sx: { display: 'flex', gap: 4 }, children: [content.slice(0, 6).map((a, i) => (_jsxs(Box, { children: [_jsxs(Typography, { component: "span", sx: { color: severityColor(a.severity), fontFamily: 'Fira Code', fontSize: 13 }, children: ["[", new Date(a.ts).toLocaleTimeString(), "]"] }), _jsx(Typography, { component: "span", sx: { color: nexusColors.frost, ml: 1, fontFamily: 'Fira Code', fontSize: 13 }, children: a.title })] }, i))), !content.length && (_jsx(Typography, { component: "span", sx: { color: nexusColors.shadow, fontFamily: 'Fira Code', fontSize: 13 }, children: "\u041F\u043E\u0434\u0456\u0439 \u043D\u0435\u043C\u0430\u0454" }))] })) : (_jsx(Box, { sx: {
                    whiteSpace: 'nowrap',
                    minWidth: '200%',
                    animation: `ticker ${animDuration}s linear infinite`,
                    animationPlayState: paused ? 'paused' : 'running',
                    '@keyframes ticker': {
                        '0%': { transform: 'translateX(0%)' },
                        '100%': { transform: 'translateX(-50%)' }
                    },
                }, ref: laneRef, children: _jsx(Box, { component: "span", sx: { pr: 6 }, children: [...content, ...content].map((a, i) => (_jsxs(Box, { component: "span", sx: { mr: 4 }, children: [_jsxs(Typography, { component: "span", sx: { color: severityColor(a.severity), fontFamily: 'Fira Code', fontSize: 13 }, children: ["[", new Date(a.ts).toLocaleTimeString(), "]"] }), _jsx(Tooltip, { title: a.title, arrow: true, children: _jsx(Typography, { component: "span", sx: { color: nexusColors.frost, ml: 1, fontFamily: 'Fira Code', fontSize: 13 }, children: truncateText(a.title, truncate) }) })] }, i))) }) }))] }));
};
export default AlertTicker;
