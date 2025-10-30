"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderStatsDashboard = exports.ProviderStatsCard = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const ProviderStatsCard = ({ stats, onRefresh }) => {
    const [refreshing, setRefreshing] = (0, react_1.useState)(false);
    const successRate = (0, react_1.useMemo)(() => {
        if (stats.totalRequests === 0)
            return 0;
        return (stats.successfulRequests / stats.totalRequests) * 100;
    }, [stats]);
    const errorRate = (0, react_1.useMemo)(() => {
        if (stats.totalRequests === 0)
            return 0;
        return (stats.failedRequests / stats.totalRequests) * 100;
    }, [stats]);
    const getStatusColor = (rate) => {
        if (rate >= 95)
            return nexusTheme_1.nexusColors.emerald;
        if (rate >= 85)
            return nexusTheme_1.nexusColors.quantum;
        if (rate >= 70)
            return '#FFA726';
        return nexusTheme_1.nexusColors.crimson;
    };
    const handleRefresh = () => __awaiter(void 0, void 0, void 0, function* () {
        setRefreshing(true);
        yield new Promise(resolve => setTimeout(resolve, 1000));
        onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
        setRefreshing(false);
    });
    return (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <material_1.Card sx={{
            background: 'linear-gradient(135deg, rgba(0,242,255,0.05) 0%, rgba(138,43,226,0.05) 100%)',
            border: `1px solid ${nexusTheme_1.nexusColors.shadow}40`,
            borderRadius: '12px',
            overflow: 'visible',
            position: 'relative'
        }}>
        <material_1.CardContent>
          <material_1.Stack spacing={2}>
            {/* Header */}
            <material_1.Stack direction="row" justifyContent="space-between" alignItems="center">
              <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                {stats.providerName}
              </material_1.Typography>
              <material_1.Stack direction="row" spacing={1}>
                <material_1.Chip label={`${stats.activeAccounts} accounts`} size="small" sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
            color: nexusTheme_1.nexusColors.quantum,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}60`
        }}/>
                <material_1.Tooltip title="Refresh">
                  <material_1.IconButton size="small" onClick={handleRefresh} disabled={refreshing} sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    <icons_material_1.Refresh sx={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
            }
        }}/>
                  </material_1.IconButton>
                </material_1.Tooltip>
              </material_1.Stack>
            </material_1.Stack>

            <material_1.Divider sx={{ borderColor: `${nexusTheme_1.nexusColors.shadow}20` }}/>

            {/* Main Stats */}
            <material_1.Grid container spacing={2}>
              {/* Total Requests */}
              <material_1.Grid item xs={6}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Total Requests
                  </material_1.Typography>
                  <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                    {stats.totalRequests.toLocaleString()}
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>

              {/* Success Rate */}
              <material_1.Grid item xs={6}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Success Rate
                  </material_1.Typography>
                  <material_1.Stack direction="row" alignItems="center" spacing={1}>
                    <material_1.Typography variant="h5" sx={{
            color: getStatusColor(successRate),
            fontFamily: 'Orbitron'
        }}>
                      {successRate.toFixed(1)}%
                    </material_1.Typography>
                    {successRate >= 95 ? (<icons_material_1.TrendingUp sx={{ color: nexusTheme_1.nexusColors.emerald }}/>) : (<icons_material_1.TrendingDown sx={{ color: nexusTheme_1.nexusColors.crimson }}/>)}
                  </material_1.Stack>
                </material_1.Stack>
              </material_1.Grid>

              {/* Avg Latency */}
              <material_1.Grid item xs={6}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Stack direction="row" alignItems="center" spacing={0.5}>
                    <icons_material_1.Speed sx={{ fontSize: 16, color: nexusTheme_1.nexusColors.shadow }}/>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                      Avg Latency
                    </material_1.Typography>
                  </material_1.Stack>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    {stats.avgLatency}ms
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>

              {/* Estimated Cost */}
              <material_1.Grid item xs={6}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Stack direction="row" alignItems="center" spacing={0.5}>
                    <icons_material_1.MonetizationOn sx={{ fontSize: 16, color: nexusTheme_1.nexusColors.shadow }}/>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                      Est. Cost
                    </material_1.Typography>
                  </material_1.Stack>
                  <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost }}>
                    ${stats.estimatedCost.toFixed(2)}
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>
            </material_1.Grid>

            {/* Progress Bar */}
            <material_1.Box>
              <material_1.Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <material_1.Stack direction="row" spacing={1} alignItems="center">
                  <icons_material_1.CheckCircle sx={{ fontSize: 16, color: nexusTheme_1.nexusColors.emerald }}/>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Success: {stats.successfulRequests}
                  </material_1.Typography>
                </material_1.Stack>
                <material_1.Stack direction="row" spacing={1} alignItems="center">
                  <icons_material_1.Error sx={{ fontSize: 16, color: nexusTheme_1.nexusColors.crimson }}/>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Failed: {stats.failedRequests}
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Stack>
              <material_1.LinearProgress variant="determinate" value={successRate} sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: `${nexusTheme_1.nexusColors.crimson}30`,
            '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(successRate),
                borderRadius: 4
            }
        }}/>
            </material_1.Box>

            {/* Additional Info */}
            <material_1.Stack direction="row" justifyContent="space-between" alignItems="center">
              <material_1.Chip label={`Top: ${stats.topModel}`} size="small" sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.sapphire}20`,
            color: nexusTheme_1.nexusColors.sapphire,
            fontSize: '11px'
        }}/>
              <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                Updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </material_1.Typography>
            </material_1.Stack>
          </material_1.Stack>
        </material_1.CardContent>
      </material_1.Card>
    </framer_motion_1.motion.div>);
};
exports.ProviderStatsCard = ProviderStatsCard;
const ProviderStatsDashboard = ({ providers, onRefreshAll }) => {
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            onRefreshAll === null || onRefreshAll === void 0 ? void 0 : onRefreshAll();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, onRefreshAll]);
    const totalStats = (0, react_1.useMemo)(() => {
        return providers.reduce((acc, provider) => ({
            totalRequests: acc.totalRequests + provider.totalRequests,
            successfulRequests: acc.successfulRequests + provider.successfulRequests,
            failedRequests: acc.failedRequests + provider.failedRequests,
            totalTokens: acc.totalTokens + provider.totalTokens,
            estimatedCost: acc.estimatedCost + provider.estimatedCost,
            avgLatency: 0 // Calculate below
        }), {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalTokens: 0,
            estimatedCost: 0,
            avgLatency: 0
        });
    }, [providers]);
    // Calculate average latency
    totalStats.avgLatency =
        providers.length > 0
            ? Math.round(providers.reduce((sum, p) => sum + p.avgLatency, 0) / providers.length)
            : 0;
    const overallSuccessRate = totalStats.totalRequests > 0
        ? (totalStats.successfulRequests / totalStats.totalRequests) * 100
        : 0;
    return (<material_1.Box>
      {/* Summary Card */}
      <material_1.Card sx={{
            background: 'linear-gradient(135deg, rgba(0,242,255,0.1) 0%, rgba(138,43,226,0.1) 100%)',
            border: `2px solid ${nexusTheme_1.nexusColors.sapphire}60`,
            borderRadius: '16px',
            mb: 3
        }}>
        <material_1.CardContent>
          <material_1.Stack spacing={2}>
            <material_1.Stack direction="row" justifyContent="space-between" alignItems="center">
              <material_1.Typography variant="h5" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                📊 Overall Statistics
              </material_1.Typography>
              <material_1.Stack direction="row" spacing={2}>
                <material_1.Chip icon={<icons_material_1.Timeline />} label={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'} onClick={() => setAutoRefresh(!autoRefresh)} color={autoRefresh ? 'success' : 'default'} sx={{
            backgroundColor: autoRefresh ? `${nexusTheme_1.nexusColors.emerald}20` : 'transparent',
            border: `1px solid ${autoRefresh ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.shadow}60`,
            color: autoRefresh ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.shadow
        }}/>
                <material_1.Chip label={`${providers.length} Providers`} sx={{
            backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
            color: nexusTheme_1.nexusColors.quantum,
            border: `1px solid ${nexusTheme_1.nexusColors.quantum}60`
        }}/>
              </material_1.Stack>
            </material_1.Stack>

            <material_1.Grid container spacing={3}>
              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Total Requests
                  </material_1.Typography>
                  <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                    {totalStats.totalRequests.toLocaleString()}
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>

              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Success Rate
                  </material_1.Typography>
                  <material_1.Typography variant="h4" sx={{
            color: overallSuccessRate >= 95 ? nexusTheme_1.nexusColors.emerald : nexusTheme_1.nexusColors.quantum,
            fontFamily: 'Orbitron'
        }}>
                    {overallSuccessRate.toFixed(1)}%
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>

              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Avg Latency
                  </material_1.Typography>
                  <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                    {totalStats.avgLatency}ms
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>

              <material_1.Grid item xs={12} sm={6} md={3}>
                <material_1.Stack spacing={0.5}>
                  <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow }}>
                    Total Cost
                  </material_1.Typography>
                  <material_1.Typography variant="h4" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
                    ${totalStats.estimatedCost.toFixed(2)}
                  </material_1.Typography>
                </material_1.Stack>
              </material_1.Grid>
            </material_1.Grid>
          </material_1.Stack>
        </material_1.CardContent>
      </material_1.Card>

      {/* Provider Cards Grid */}
      <material_1.Grid container spacing={3}>
        {providers.map(provider => (<material_1.Grid item xs={12} sm={6} lg={4} key={provider.providerId}>
            <exports.ProviderStatsCard stats={provider} onRefresh={onRefreshAll}/>
          </material_1.Grid>))}
      </material_1.Grid>
    </material_1.Box>);
};
exports.ProviderStatsDashboard = ProviderStatsDashboard;
exports.default = exports.ProviderStatsDashboard;
