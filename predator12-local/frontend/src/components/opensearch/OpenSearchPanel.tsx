// @ts-nocheck
import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const OPENSEARCH_EMBED_ENABLED = (import.meta as any)?.env?.VITE_OPENSEARCH_EMBED_ENABLED === 'true' || true;
const OPENSEARCH_IFRAME_SRC = (import.meta as any)?.env?.VITE_OPENSEARCH_IFRAME_SRC || '/osd/app/dashboards#/view/overview?embed=true';

const OpenSearchPanel: React.FC = () => {
  if (!OPENSEARCH_EMBED_ENABLED) {
    return <Alert severity="warning">OpenSearch embed вимкнено (VITE_OPENSEARCH_EMBED_ENABLED=false)</Alert>;
  }
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#00ffff' }}>Аналітична палуба (OpenSearch)</Typography>
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '70vh',
        border: '1px solid rgba(0,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0,255,255,0.15)'
      }}>
        <iframe
          title="OpenSearch Dashboards"
          src={OPENSEARCH_IFRAME_SRC}
          style={{ width: '100%', height: '100%', border: '0' }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </Box>
    </Box>
  );
};

export default OpenSearchPanel;


