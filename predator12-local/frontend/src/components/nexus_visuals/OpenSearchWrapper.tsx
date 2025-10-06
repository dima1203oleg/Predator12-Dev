// @ts-nocheck
import React, { useEffect, useRef } from 'react';

interface OpenSearchWrapperProps {
  dashboardId: string;
  jwtToken: string;
}

const OpenSearchWrapper: React.FC<OpenSearchWrapperProps> = ({ dashboardId, jwtToken }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const injectStyles = () => {
      if (!iframeRef.current) return;
      try {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (!doc) return;
        const style = doc.createElement('style');
        style.innerHTML = `
          body, .app-wrapper { background-color: #05070A !important; }
          .navbar, .top-nav { background-color: rgba(15,18,26,0.9) !important; }
          .visualizationPanel { border: 2px solid #00FFC6 !important; }
          .euiPageTemplate__header { color: #C5D1E6 !important; }
        `;
        doc.head.appendChild(style);
      } catch (e) {
        // cross-origin or load error
      }
    };
    iframeRef.current?.addEventListener('load', injectStyles);
    return () => {
      iframeRef.current?.removeEventListener('load', injectStyles);
    };
  }, []);

  const src = `${process.env.REACT_APP_OPENSEARCH_HOST}/app/dashboards#/view/${dashboardId}?jwt=${jwtToken}`;

  return (
    <div style={{ position: 'relative', border: '4px solid #0A75FF', borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={src}
        style={{ width: '100%', height: '100vh', border: 'none' }}
        allowFullScreen
        title="OpenSearch Dashboard"
      />
    </div>
  );
};

export default OpenSearchWrapper;

