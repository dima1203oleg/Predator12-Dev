// @ts-nocheck
/**
 * 📊 PROVIDER STATISTICS & MONITORING COMPONENT
 *
 * Функціонал:
 * - Реал-тайм статистика використання
 * - Графіки та метрики
 * - Cost tracking
 * - Performance monitoring
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as CostIcon,
  Speed as SpeedIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';

// ============= ТИПИ =============

interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  totalTokens: number;
  estimatedCost: number;
  lastUpdated: string;
}

interface ProviderStats extends UsageStats {
  providerId: string;
  providerName: string;
  activeAccounts: number;
  topModel: string;
}

// ============= КОМПОНЕНТ =============

interface ProviderStatsCardProps {
  stats: ProviderStats;
  onRefresh?: () => void;
}

export const ProviderStatsCard: React.FC<ProviderStatsCardProps> = ({ stats, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const successRate = useMemo(() => {
    if (stats.totalRequests === 0) return 0;
    return (stats.successfulRequests / stats.totalRequests) * 100;
  }, [stats]);

  const errorRate = useMemo(() => {
    if (stats.totalRequests === 0) return 0;
    return (stats.failedRequests / stats.totalRequests) * 100;
  }, [stats]);

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return nexusColors.emerald;
    if (rate >= 85) return nexusColors.quantum;
    if (rate >= 70) return '#FFA726';
    return nexusColors.crimson;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh?.();
    setRefreshing(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(0,242,255,0.05) 0%, rgba(138,43,226,0.05) 100%)',
          border: `1px solid ${nexusColors.shadow}40`,
          borderRadius: '12px',
          overflow: 'visible',
          position: 'relative'
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                {stats.providerName}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${stats.activeAccounts} accounts`}
                  size="small"
                  sx={{
                    backgroundColor: `${nexusColors.quantum}20`,
                    color: nexusColors.quantum,
                    border: `1px solid ${nexusColors.quantum}60`
                  }}
                />
                <Tooltip title="Refresh">
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{ color: nexusColors.frost }}
                  >
                    <RefreshIcon
                      sx={{
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: `${nexusColors.shadow}20` }} />

            {/* Main Stats */}
            <Grid container spacing={2}>
              {/* Total Requests */}
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Total Requests
                  </Typography>
                  <Typography variant="h5" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                    {stats.totalRequests.toLocaleString()}
                  </Typography>
                </Stack>
              </Grid>

              {/* Success Rate */}
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Success Rate
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: getStatusColor(successRate),
                        fontFamily: 'Orbitron'
                      }}
                    >
                      {successRate.toFixed(1)}%
                    </Typography>
                    {successRate >= 95 ? (
                      <TrendingUpIcon sx={{ color: nexusColors.emerald }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: nexusColors.crimson }} />
                    )}
                  </Stack>
                </Stack>
              </Grid>

              {/* Avg Latency */}
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <SpeedIcon sx={{ fontSize: 16, color: nexusColors.shadow }} />
                    <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                      Avg Latency
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                    {stats.avgLatency}ms
                  </Typography>
                </Stack>
              </Grid>

              {/* Estimated Cost */}
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CostIcon sx={{ fontSize: 16, color: nexusColors.shadow }} />
                    <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                      Est. Cost
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ color: nexusColors.frost }}>
                    ${stats.estimatedCost.toFixed(2)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {/* Progress Bar */}
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SuccessIcon sx={{ fontSize: 16, color: nexusColors.emerald }} />
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Success: {stats.successfulRequests}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ErrorIcon sx={{ fontSize: 16, color: nexusColors.crimson }} />
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Failed: {stats.failedRequests}
                  </Typography>
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={successRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: `${nexusColors.crimson}30`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(successRate),
                    borderRadius: 4
                  }
                }}
              />
            </Box>

            {/* Additional Info */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip
                label={`Top: ${stats.topModel}`}
                size="small"
                sx={{
                  backgroundColor: `${nexusColors.sapphire}20`,
                  color: nexusColors.sapphire,
                  fontSize: '11px'
                }}
              />
              <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                Updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============= DASHBOARD OVERVIEW =============

interface ProviderStatsDashboardProps {
  providers: ProviderStats[];
  onRefreshAll?: () => void;
}

export const ProviderStatsDashboard: React.FC<ProviderStatsDashboardProps> = ({
  providers,
  onRefreshAll
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefreshAll?.();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, onRefreshAll]);

  const totalStats = useMemo(() => {
    return providers.reduce(
      (acc, provider) => ({
        totalRequests: acc.totalRequests + provider.totalRequests,
        successfulRequests: acc.successfulRequests + provider.successfulRequests,
        failedRequests: acc.failedRequests + provider.failedRequests,
        totalTokens: acc.totalTokens + provider.totalTokens,
        estimatedCost: acc.estimatedCost + provider.estimatedCost,
        avgLatency: 0 // Calculate below
      }),
      {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        estimatedCost: 0,
        avgLatency: 0
      }
    );
  }, [providers]);

  // Calculate average latency
  totalStats.avgLatency =
    providers.length > 0
      ? Math.round(
          providers.reduce((sum, p) => sum + p.avgLatency, 0) / providers.length
        )
      : 0;

  const overallSuccessRate =
    totalStats.totalRequests > 0
      ? (totalStats.successfulRequests / totalStats.totalRequests) * 100
      : 0;

  return (
    <Box>
      {/* Summary Card */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(0,242,255,0.1) 0%, rgba(138,43,226,0.1) 100%)',
          border: `2px solid ${nexusColors.sapphire}60`,
          borderRadius: '16px',
          mb: 3
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                📊 Overall Statistics
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<TimelineIcon />}
                  label={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  color={autoRefresh ? 'success' : 'default'}
                  sx={{
                    backgroundColor: autoRefresh ? `${nexusColors.emerald}20` : 'transparent',
                    border: `1px solid ${autoRefresh ? nexusColors.emerald : nexusColors.shadow}60`,
                    color: autoRefresh ? nexusColors.emerald : nexusColors.shadow
                  }}
                />
                <Chip
                  label={`${providers.length} Providers`}
                  sx={{
                    backgroundColor: `${nexusColors.quantum}20`,
                    color: nexusColors.quantum,
                    border: `1px solid ${nexusColors.quantum}60`
                  }}
                />
              </Stack>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                    {totalStats.totalRequests.toLocaleString()}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Success Rate
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: overallSuccessRate >= 95 ? nexusColors.emerald : nexusColors.quantum,
                      fontFamily: 'Orbitron'
                    }}
                  >
                    {overallSuccessRate.toFixed(1)}%
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Avg Latency
                  </Typography>
                  <Typography variant="h4" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                    {totalStats.avgLatency}ms
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: nexusColors.shadow }}>
                    Total Cost
                  </Typography>
                  <Typography variant="h4" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
                    ${totalStats.estimatedCost.toFixed(2)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Provider Cards Grid */}
      <Grid container spacing={3}>
        {providers.map(provider => (
          <Grid item xs={12} sm={6} lg={4} key={provider.providerId}>
            <ProviderStatsCard stats={provider} onRefresh={onRefreshAll} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProviderStatsDashboard;
