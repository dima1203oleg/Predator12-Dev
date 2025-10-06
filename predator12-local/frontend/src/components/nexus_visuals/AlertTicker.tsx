// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';

interface AlertItem {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  ts: string;
}

type Severity = AlertItem['severity'];

interface AlertTickerProps {
  maxItems?: number;
  filterSeverities?: Severity[]; // наприклад: ['warning','critical']
  speedPxPerSec?: number; // швидкість руху, за замовчуванням 60
  pauseOnHover?: boolean;
  truncate?: number; // макс. символів у заголовку до обрізання
}

const severityColor = (s: Severity) => {
  switch (s) {
    case 'critical': return nexusColors.crimson;
    case 'warning': return nexusColors.warning;
    default: return nexusColors.sapphire;
  }
};

const getWsBase = () => {
  const apiBase = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';
  return apiBase.replace(/^http/i, 'ws');
};

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const truncateText = (text: string, len?: number) => {
  if (!len || text.length <= len) return text;
  return text.slice(0, len - 1) + '…';
};

const AlertTicker: React.FC<AlertTickerProps> = ({
  maxItems = 30,
  filterSeverities,
  speedPxPerSec = 60,
  pauseOnHover = true,
  truncate = 100,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [paused, setPaused] = useState(false);
  const [retries, setRetries] = useState(0);
  const reduceMotion = prefersReducedMotion();

  const filtered = useMemo(() => (
    filterSeverities && filterSeverities.length
      ? alerts.filter(a => filterSeverities.includes(a.severity))
      : alerts
  ), [alerts, filterSeverities]);

  useEffect(() => {
    let alive = true;
    const base = getWsBase();
    const url = `${base}/ws/alerts`;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!alive) return;
        setRetries(0);
      };

      ws.onmessage = (ev) => {
        if (!alive) return;
        try {
          const data = JSON.parse(ev.data);
          const item: AlertItem = {
            severity: (['info','warning','critical'].includes(data.severity) ? data.severity : 'info') as Severity,
            title: typeof data.title === 'string' ? data.title : 'Подія',
            ts: typeof data.ts === 'string' ? data.ts : new Date().toISOString()
          };
          setAlerts((prev) => [item, ...prev].slice(0, maxItems));
        } catch {}
      };

      ws.onclose = () => {
        if (!alive) return;
        const next = Math.min(15000, 500 * Math.pow(2, retries));
        setTimeout(() => {
          if (!alive) return;
          setRetries(r => r + 1);
          connect();
        }, next || 500);
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
    };

    connect();
    return () => {
      alive = false;
      try { wsRef.current?.close(); } catch {}
    };
  }, [maxItems]);

  // обчислюємо тривалість анімації відповідно до ширини контенту і швидкості
  const laneRef = useRef<HTMLDivElement>(null);
  const [animDuration, setAnimDuration] = useState(30); // fallback

  useEffect(() => {
    if (!laneRef.current) return;
    const w = laneRef.current.scrollWidth / 2; // бо дублюємо контент
    const duration = Math.max(10, Math.round(w / Math.max(20, speedPxPerSec)));
    setAnimDuration(duration);
  }, [filtered, speedPxPerSec]);

  const content = filtered.length ? filtered : [];

  return (
    <Box sx={{
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
    }}
    aria-live="polite"
    role="region"
    aria-label="Стрічка алертів"
    onMouseEnter={() => pauseOnHover && setPaused(true)}
    onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <Chip label="Алерти" size="small" sx={{
        backgroundColor: `${nexusColors.emerald}20`,
        color: nexusColors.emerald,
        border: `1px solid ${nexusColors.emerald}60`
      }} />

      {/* якщо ввімкнено reduce-motion або нема алертів — показуємо статичний список */}
      {reduceMotion || !content.length ? (
        <Box sx={{ display: 'flex', gap: 4 }}>
          {content.slice(0, 6).map((a, i) => (
            <Box key={i}>
              <Typography component="span" sx={{ color: severityColor(a.severity), fontFamily: 'Fira Code', fontSize: 13 }}>
                [{new Date(a.ts).toLocaleTimeString()}]
              </Typography>
              <Typography component="span" sx={{ color: nexusColors.frost, ml: 1, fontFamily: 'Fira Code', fontSize: 13 }}>
                {a.title}
              </Typography>
            </Box>
          ))}
          {!content.length && (
            <Typography component="span" sx={{ color: nexusColors.shadow, fontFamily: 'Fira Code', fontSize: 13 }}>
              Подій немає
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{
          whiteSpace: 'nowrap',
          minWidth: '200%',
          animation: `ticker ${animDuration}s linear infinite`,
          animationPlayState: paused ? 'paused' as any : 'running' as any,
          '@keyframes ticker': {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-50%)' }
          },
        }} ref={laneRef}>
          <Box component="span" sx={{ pr: 6 }}>
            {[...content, ...content].map((a, i) => (
              <Box component="span" key={i} sx={{ mr: 4 }}>
                <Typography component="span" sx={{ color: severityColor(a.severity), fontFamily: 'Fira Code', fontSize: 13 }}>
                  [{new Date(a.ts).toLocaleTimeString()}]
                </Typography>
                <Tooltip title={a.title} arrow>
                  <Typography component="span" sx={{ color: nexusColors.frost, ml: 1, fontFamily: 'Fira Code', fontSize: 13 }}>
                    {truncateText(a.title, truncate)}
                  </Typography>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AlertTicker;
