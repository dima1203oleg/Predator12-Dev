import React, { useState } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { ViewInAr, GridView, Security as SecurityIcon } from '@mui/icons-material';
import { nexusColors } from '../theme/nexusTheme';
import { isFeatureEnabled } from '../config/features';
import CyberSecurityMonitor, { ThreatSignature, SecurityMetric } from '../components/modules/CyberSecurityMonitor';

const SecurityPage: React.FC = () => {
  const [view3D, setView3D] = useState(false);

  // Mock data for security threats and metrics
  const [threats] = useState<ThreatSignature[]>([
    {
      id: 'threat-1',
      name: 'Intrusion Attempt',
      type: 'intrusion',
      severity: 'high',
      status: 'active',
      position: [0, 0, 0],
      size: 1,
      detected: new Date(),
      source: '192.168.1.100',
      target: 'web-server-01',
      confidence: 95,
      impact: 80,
      details: 'Suspicious login attempts detected'
    },
    {
      id: 'threat-2',
      name: 'DDoS Attack',
      type: 'ddos',
      severity: 'medium',
      status: 'contained',
      position: [1, 0, 0],
      size: 0.8,
      detected: new Date(Date.now() - 300000),
      source: 'external',
      target: 'api-gateway',
      confidence: 88,
      impact: 60,
      details: 'DDoS attack mitigated'
    }
  ]);

  const [metrics] = useState<SecurityMetric[]>([
    {
      id: 'metric-1',
      name: 'Firewall Status',
      value: 98,
      threshold: 95,
      unit: '%',
      status: 'safe',
      category: 'firewall',
      history: [95, 96, 97, 98],
      lastUpdate: new Date()
    },
    {
      id: 'metric-2',
      name: 'Intrusion Detection',
      value: 92,
      threshold: 85,
      unit: '%',
      status: 'safe',
      category: 'intrusion',
      history: [88, 89, 90, 92],
      lastUpdate: new Date()
    }
  ]);

  const handleThreatAction = (threatId: string, action: string) => {
    console.log(`Threat ${threatId}: ${action}`);
  };

  const handleMetricAlert = (metric: SecurityMetric) => {
    console.log(`Alert for metric: ${metric.name}`);
  };

  if (view3D && isFeatureEnabled('threeDee')) {
    return (
      <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <CyberSecurityMonitor
          threats={threats}
          metrics={metrics}
          onThreatAction={handleThreatAction}
          onMetricAlert={handleMetricAlert}
          realTimeScanning={true}
          autoResponse={false}
        />

        <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Tooltip title="Повернутися до 2D виду">
            <IconButton
              onClick={() => setView3D(false)}
              sx={{
                background: `${nexusColors.obsidian}90`,
                color: nexusColors.frost,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${nexusColors.quantum}40`
              }}
            >
              <GridView />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h3"
              sx={{
                background: `linear-gradient(45deg, ${nexusColors.nebula}, ${nexusColors.quantum})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace'
              }}
            >
              🛡️ Кібер-Безпека
            </Typography>
            <Chip
              label={`${threats.filter(t => t.status === 'active').length} АКТИВНІ ЗАГРОЗИ`}
              sx={{
                background: threats.some(t => t.severity === 'critical')
                  ? `linear-gradient(45deg, ${nexusColors.error}, ${nexusColors.nebula})`
                  : threats.some(t => t.severity === 'high')
                  ? `linear-gradient(45deg, ${nexusColors.warning}, ${nexusColors.quantum})`
                  : `linear-gradient(45deg, ${nexusColors.success}, ${nexusColors.emerald})`,
                color: nexusColors.obsidian,
                fontWeight: 600
              }}
            />
          </Box>

          {isFeatureEnabled('threeDee') && (
            <Tooltip title="3D Візуалізація Загроз">
              <IconButton
                onClick={() => setView3D(true)}
                sx={{
                  background: `linear-gradient(45deg, ${nexusColors.nebula}, ${nexusColors.quantum})`,
                  color: nexusColors.frost,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.nebula})`,
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <ViewInAr />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </motion.div>

      {/* Security Overview Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: nexusColors.frost, mb: 3, fontWeight: 600 }}>
          🚨 Системна Безпека в Реальному Часі
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box
            sx={{
              p: 4,
              background: `linear-gradient(135deg, ${nexusColors.obsidian}95, ${nexusColors.darkMatter}85)`,
              border: `2px solid ${nexusColors.nebula}40`,
              borderRadius: 3,
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="h6" sx={{ color: nexusColors.frost, mb: 2 }}>
              🔍 Кібер-загрози детектовані та відслідковуються в реальному часі
            </Typography>

            <Typography variant="body1" sx={{ color: nexusColors.shadow, mb: 3 }}>
              Predator Security використовує найсучасніші алгоритми машинного навчання для
              виявлення та аналізу загроз безпеки. 3D візуалізація дозволяє бачити атаки в
              реальному часі та приймати швидкі рішення.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[
                { label: 'Firewall Active', status: 'operational', color: nexusColors.success },
                { label: 'IDS/IPS Running', status: 'monitoring', color: nexusColors.sapphire },
                { label: 'Threat Intelligence', status: 'updated', color: nexusColors.emerald },
                { label: 'AI Protection', status: 'learning', color: nexusColors.quantum }
              ].map(item => (
                <Chip
                  key={item.label}
                  label={`${item.label}: ${item.status.toUpperCase()}`}
                  sx={{
                    background: `${item.color}20`,
                    color: item.color,
                    border: `1px solid ${item.color}40`,
                    fontWeight: 600
                  }}
                />
              ))}
            </Box>

            {/* Animated security scan line */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${nexusColors.nebula}, transparent)`,
                animation: 'scan 4s ease-in-out infinite'
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* Call to action for 3D view */}
      {isFeatureEnabled('threeDee') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <Box
            onClick={() => setView3D(true)}
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${nexusColors.nebula}20, ${nexusColors.quantum}20)`,
              border: `2px solid ${nexusColors.nebula}60`,
              borderRadius: 3,
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: nexusColors.nebula,
                boxShadow: `0 8px 30px ${nexusColors.nebula}40`
              },
              transition: 'all 0.3s ease'
            }}
          >
            <SecurityIcon sx={{ fontSize: 48, color: nexusColors.nebula, mb: 2 }} />
            <Typography variant="h5" sx={{ color: nexusColors.frost, mb: 1, fontWeight: 600 }}>
              🌐 Активувати 3D Cyber Monitor
            </Typography>
            <Typography variant="body1" sx={{ color: nexusColors.shadow }}>
              Перегляньте загрози безпеки в інтерактивному 3D просторі з голографічними ефектами
            </Typography>

            {/* Hover glow effect */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${nexusColors.nebula}30, transparent)`,
                borderRadius: '50%',
                animation: 'pulse-glow 3s ease-in-out infinite',
                zIndex: 0
              }}
            />
          </Box>
        </motion.div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes scan {
            0%, 100% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(100%); }
          }

          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
          }
        `}
      </style>
    </Box>
  );
};

export default SecurityPage;
