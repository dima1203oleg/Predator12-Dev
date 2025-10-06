// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Chip, Card, CardContent, Badge } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';
import { AGENT_MODEL_ASSIGNMENTS } from '../../services/modelRegistry';

interface QuickAgentsViewProps {
  onAgentClick?: (agentId: string) => void;
}

const QuickAgentsView: React.FC<QuickAgentsViewProps> = ({ onAgentClick }) => {
  // Всі 26 агентів
  const allAgents = [
    // Core Agents (16)
    { id: 'ChiefOrchestrator', category: 'core', status: 'active', health: 95 },
    { id: 'QueryPlanner', category: 'core', status: 'active', health: 88 },
    { id: 'ModelRouter', category: 'core', status: 'active', health: 92 },
    { id: 'Arbiter', category: 'core', status: 'active', health: 89 },
    { id: 'NexusGuide', category: 'core', status: 'active', health: 94 },
    { id: 'DatasetIngest', category: 'core', status: 'active', health: 96 },
    { id: 'DataQuality', category: 'core', status: 'degraded', health: 71 },
    { id: 'SchemaMapper', category: 'core', status: 'active', health: 85 },
    { id: 'ETLOrchestrator', category: 'core', status: 'active', health: 91 },
    { id: 'Indexer', category: 'core', status: 'active', health: 93 },
    { id: 'Embedding', category: 'core', status: 'active', health: 97 },
    { id: 'OSINTCrawler', category: 'core', status: 'active', health: 82 },
    { id: 'GraphBuilder', category: 'core', status: 'active', health: 86 },
    { id: 'Anomaly', category: 'core', status: 'active', health: 90 },
    { id: 'Forecast', category: 'core', status: 'active', health: 88 },
    { id: 'Simulator', category: 'core', status: 'active', health: 84 },
    
    // Specialized Agents (10)
    { id: 'SyntheticData', category: 'specialized', status: 'paused', health: 0 },
    { id: 'ReportExport', category: 'specialized', status: 'active', health: 95 },
    { id: 'BillingGate', category: 'specialized', status: 'active', health: 98 },
    { id: 'PIIGuardian', category: 'specialized', status: 'active', health: 96 },
    { id: 'AutoHeal', category: 'specialized', status: 'active', health: 89 },
    { id: 'SelfDiagnosis', category: 'specialized', status: 'active', health: 87 },
    { id: 'SelfImprovement', category: 'specialized', status: 'degraded', health: 65 },
    { id: 'RedTeam', category: 'specialized', status: 'down', health: 0 },
    { id: 'ComplianceMonitor', category: 'specialized', status: 'active', health: 93 },
    { id: 'PerformanceOptimizer', category: 'specialized', status: 'active', health: 91 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return nexusColors.emerald;
      case 'degraded': return nexusColors.warning;
      case 'paused': return nexusColors.shadow;
      case 'down': return nexusColors.crimson;
      default: return nexusColors.shadow;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'degraded': return '🟡';
      case 'paused': return '⏸️';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  const getCategoryEmoji = (category: string) => {
    return category === 'core' ? '🎯' : '🔧';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          color: nexusColors.frost,
          textAlign: 'center',
          background: `linear-gradient(45deg, ${nexusColors.quantum}, ${nexusColors.sapphire})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🤖 Всі {allAgents.length} агентів системи
      </Typography>
      
      <Grid container spacing={2}>
        {allAgents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${nexusColors.obsidian}CC, ${nexusColors.darkMatter}AA)`,
                border: `1px solid ${getStatusColor(agent.status)}40`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${getStatusColor(agent.status)}30`,
                  border: `1px solid ${getStatusColor(agent.status)}80`
                }
              }}
              onClick={() => onAgentClick?.(agent.id)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    {getCategoryEmoji(agent.category)} {getStatusEmoji(agent.status)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 1, 
                      fontWeight: 600,
                      color: nexusColors.frost,
                      fontSize: '0.8rem'
                    }}
                  >
                    {agent.id}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={agent.status}
                    sx={{
                      backgroundColor: `${getStatusColor(agent.status)}20`,
                      color: getStatusColor(agent.status),
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: agent.health > 80 ? nexusColors.emerald : 
                             agent.health > 50 ? nexusColors.warning : nexusColors.crimson,
                      fontWeight: 600
                    }}
                  >
                    {agent.health}%
                  </Typography>
                </Box>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: nexusColors.shadow,
                    display: 'block',
                    mt: 1,
                    fontSize: '0.7rem'
                  }}
                >
                  {AGENT_MODEL_ASSIGNMENTS[agent.id] || 'No model assigned'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: nexusColors.shadow }}>
          Core: {allAgents.filter(a => a.category === 'core').length} | 
          Specialized: {allAgents.filter(a => a.category === 'specialized').length} | 
          Active: {allAgents.filter(a => a.status === 'active').length}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuickAgentsView;
