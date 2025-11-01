// Lightweight client helpers for self-heal and observability integration
export async function triggerSelfHeal(): Promise<any> {
  try {
    const res = await fetch('/health/self-heal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'frontend', triggeredBy: 'ui' })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Self-heal request failed: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error('triggerSelfHeal error', err);
    throw err;
  }
}

export async function reportObservabilityError(payload: any): Promise<void> {
  try {
    // send minimal payload to backend observability endpoint
    await fetch('/observability/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // don't throw — this is best-effort
    console.warn('Failed to report observability error', err);
  }
}

export function initGlobalErrorReporting(options?: { sampleRate?: number }) {
  const sampleRate = options?.sampleRate ?? 1.0; // 0..1

  function shouldSend() {
    return Math.random() <= sampleRate;
  }

  window.addEventListener('error', (ev) => {
    try {
      if (!shouldSend()) return;
      const payload = {
        source: 'browser-error',
        message: ev.message || 'unknown',
        filename: (ev.filename || '') + '',
        lineno: (ev.lineno || 0),
        colno: (ev.colno || 0),
        stack: (ev.error && ev.error.stack) ? ev.error.stack : undefined,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      void reportObservabilityError(payload);
    } catch (e) {
      // ignore
    }
  });

  window.addEventListener('unhandledrejection', (ev) => {
    try {
      if (!shouldSend()) return;
      const reason = ev.reason;
      const payload = {
        source: 'unhandledrejection',
        message: reason && reason.message ? reason.message : String(reason),
        stack: reason && reason.stack ? reason.stack : undefined,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      void reportObservabilityError(payload);
    } catch (e) {
      // ignore
    }
  });
}

export default {
  triggerSelfHeal,
  reportObservabilityError,
  initGlobalErrorReporting
};
