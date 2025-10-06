import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { AdvancedMetricsPanel } from '../components/metrics/AdvancedMetricsPanel';
import { nexusColors } from '../theme/nexusTheme';
import { isFeatureEnabled } from '../config/features';

interface SystemStats {
  agentsActive: number;
  totalRequests: number;
  averageLatency: number;
  systemHealth: number;
}

const Dashboard: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    agentsActive: 26,
    totalRequests: 47830,
    averageLatency: 89,
    systemHealth: 98
  });

  useEffect(() => {
    // Симуляція оновлення статистики
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        agentsActive: prev.agentsActive + Math.floor(Math.random() * 3) - 1,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 50) + 10,
        averageLatency: Math.max(50, prev.averageLatency + Math.floor(Math.random() * 20) - 10),
        systemHealth: Math.max(80, Math.min(100, prev.systemHealth + Math.floor(Math.random() * 4) - 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: number) => {
    if (health >= 95) return nexusColors.success;
    if (health >= 85) return nexusColors.warning;
    return nexusColors.error;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              background: `linear-gradient(45deg, ${nexusColors.sapphire}, ${nexusColors.quantum})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontFamily: 'Orbitron, monospace'
            }}
          >
            🚀 Predator Analytics
          </Typography>
          <Chip
            label="LIVE"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.success}, ${nexusColors.emerald})`,
              color: nexusColors.obsidian,
              fontWeight: 600,
              animation: 'pulse 2s infinite'
            }}
          />
        </Box>
      </motion.div>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Активні Агенти', labelEn: 'Active Agents', value: systemStats.agentsActive, unit: '', color: nexusColors.emerald, icon: '🤖' },
          { label: 'Загальні Запити', labelEn: 'Total Requests', value: systemStats.totalRequests.toLocaleString(), unit: '', color: nexusColors.sapphire, icon: '📊' },
          { label: 'Серед. Затримка', labelEn: 'Avg Latency', value: systemStats.averageLatency, unit: 'мс', color: nexusColors.quantum, icon: '⚡' },
          { label: 'Стан Системи', labelEn: 'System Health', value: systemStats.systemHealth, unit: '%', color: getHealthColor(systemStats.systemHealth), icon: '💚' }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${nexusColors.obsidian}90, ${nexusColors.darkMatter}80)`,
                  border: `2px solid ${stat.color}40`,
                  borderRadius: 3,
                  backdropFilter: 'blur(20px)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    borderColor: stat.color + '80',
                    boxShadow: `0 8px 30px ${stat.color}30`
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h4" sx={{ opacity: 0.8 }}>{stat.icon}</Typography>
                    <Typography variant="subtitle1" sx={{ color: nexusColors.frost, fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: stat.color, 
                      fontWeight: 700,
                      textShadow: `0 0 10px ${stat.color}50`
                    }}
                  >
                    {stat.value}{stat.unit}
                  </Typography>
                </CardContent>
                
                {/* Glow effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                    animation: 'glow 3s ease-in-out infinite'
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Advanced Metrics Panel */}
      {isFeatureEnabled('charts') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AdvancedMetricsPanel />
        </motion.div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes glow {
            0%, 100% { opacity: 0.5; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(100%); }
          }
        `}
      </style>
    </Box>
  );
};

export default Dashboard;
