// @ts-nocheck
import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0f1a', color: '#00ffc6', padding: 24, textAlign: 'center'
        }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>⚠️ Помилка інтерфейсу</h1>
            <p style={{ opacity: 0.8 }}>Ми перехопили виняток, щоб уникнути білого екрану. Оновіть сторінку або перевірте консоль.</p>
            {this.state.error && (
              <pre style={{ textAlign: 'left', marginTop: 16, background: '#0f1522', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
