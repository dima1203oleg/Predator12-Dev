// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  Memory,
  Assessment,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon, color = '#00d4ff' }) => {
  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color }}>{icon}</div>
          {trend !== undefined && (
            <Chip
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              style={{
                backgroundColor: trend > 0 ? '#00ff0030' : '#ff000030',
                color: trend > 0 ? '#00ff00' : '#ff0000',
              }}
            />
          )}
        </div>
        <Typography variant="h6" style={{ color: '#ffffff', marginBottom: 8 }}>
          {title}
        </Typography>
        <Typography variant="h4" style={{ color, fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const AdvancedMetricsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    activeAgents: 0,
    successRate: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // TODO: Замінити на реальний API виклик
        // const response = await fetch('/api/metrics');
        // const data = await response.json();
        // setMetrics(data);
        
        setMetrics({
          totalRequests: 0,
          avgResponseTime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          activeAgents: 0,
          successRate: 0,
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Typography
        variant="h5"
        style={{
          color: '#00d4ff',
          marginBottom: 24,
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0,212,255,0.5)',
        }}
      >
        📊 Розширена панель метрик
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Загальна кількість запитів"
            value={metrics.totalRequests.toLocaleString()}
            trend={12}
            icon={<Assessment style={{ fontSize: 32 }} />}
            color="#00d4ff"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Середній час відповіді"
            value={`${metrics.avgResponseTime}ms`}
            trend={-5}
            icon={<Speed style={{ fontSize: 32 }} />}
            color="#00ff88"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Використання CPU"
            value={`${metrics.cpuUsage}%`}
            trend={3}
            icon={<TrendingUp style={{ fontSize: 32 }} />}
            color="#ff9900"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Використання пам'яті"
            value={`${metrics.memoryUsage}%`}
            trend={-2}
            icon={<Memory style={{ fontSize: 32 }} />}
            color="#ff00ff"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Активні агенти"
            value={metrics.activeAgents}
            trend={8}
            icon={<Assessment style={{ fontSize: 32 }} />}
            color="#00ffff"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Успішність"
            value={`${metrics.successRate}%`}
            trend={1}
            icon={<TrendingUp style={{ fontSize: 32 }} />}
            color="#00ff00"
          />
        </Grid>
      </Grid>

      <Paper
        style={{
          padding: 24,
          marginTop: 24,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,212,255,0.3)',
        }}
      >
        <Typography variant="h6" style={{ color: '#00d4ff', marginBottom: 16 }}>
          Тенденції системи
        </Typography>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography variant="body2" style={{ color: '#ffffff' }}>
              CPU Load
            </Typography>
            <Typography variant="body2" style={{ color: '#00d4ff' }}>
              {metrics.cpuUsage}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={metrics.cpuUsage}
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,212,255,0.2)',
            }}
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00d4ff',
              },
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography variant="body2" style={{ color: '#ffffff' }}>
              Memory Usage
            </Typography>
            <Typography variant="body2" style={{ color: '#ff9900' }}>
              {metrics.memoryUsage}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={metrics.memoryUsage}
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,153,0,0.2)',
            }}
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ff9900',
              },
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography variant="body2" style={{ color: '#ffffff' }}>
              Success Rate
            </Typography>
            <Typography variant="body2" style={{ color: '#00ff00' }}>
              {metrics.successRate}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={metrics.successRate}
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,255,0,0.2)',
            }}
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ff00',
              },
            }}
          />
        </div>
      </Paper>
    </div>
  );
};
