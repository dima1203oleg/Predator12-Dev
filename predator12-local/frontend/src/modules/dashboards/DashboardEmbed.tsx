// @ts-nocheck
/**
 * 📊 DASHBOARD EMBED COMPONENT
 *
 * Iframe контейнер з overlay CSS для маскування брендингу OpenSearch
 */

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Stack, Typography } from '@mui/material';
import { nexusColorsDark as nexusColors } from '../../theme/nexusThemeV2';

interface DashboardEmbedProps {
  url: string;
  showPII?: boolean;
  title: string;
}

const DashboardEmbed: React.FC<DashboardEmbedProps> = ({ url, showPII = false, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modify URL based on PII access
  const effectiveUrl = showPII ? url : `${url}?alias=safe`;

  useEffect(() => {
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

  return (
    <Box sx={{ position: 'relative', height: 'calc(100vh - 250px)', minHeight: '600px' }}>
      {/* Loading State */}
      {loading && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: nexusColors.background.paper,
            zIndex: 10
          }}
        >
          <CircularProgress sx={{ color: nexusColors.primary.main, mb: 2 }} />
          <Typography variant="body2" sx={{ color: nexusColors.text.secondary }}>
            Завантаження дашборду...
          </Typography>
        </Stack>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Iframe Container with Masking Overlay */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${nexusColors.border.medium}`,
          backgroundColor: nexusColors.background.paper,
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
            background: `linear-gradient(180deg, ${nexusColors.background.paper} 0%, transparent 100%)`,
            zIndex: 1,
            pointerEvents: 'none'
          }
        }}
      >
        <iframe
          src={effectiveUrl}
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms"
          style={{
            colorScheme: 'dark'
          }}
        />
      </Box>

      {/* PII Indicator Overlay */}
      {showPII && (
        <Box
          sx={{
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
          }}
        >
          🔓 PII MODE
        </Box>
      )}
    </Box>
  );
};

export default DashboardEmbed;
