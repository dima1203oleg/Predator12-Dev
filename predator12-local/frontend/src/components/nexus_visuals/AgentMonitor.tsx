// @ts-nocheck
import { useState, useEffect } from 'react';
import useAgentStore from '@/stores/agentStore';
import { useTranslation } from 'react-i18next';
import { TextField, Box, Typography } from '@mui/material';

export default function AgentMonitor() {
  const agents = useAgentStore(state => state.agents);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      const data = await agentsAPI.getAllAgentsStatus();
      useAgentStore.getState().updateAgents(data);
    };
    
    const interval = setInterval(fetchAgents, 5000);
    fetchAgents(); // Первинне завантаження
    
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder={t('agentMonitor.searchAgents')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {filteredAgents.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          {t('agentMonitor.noAgentsFound')}
        </Typography>
      )}
      
      {filteredAgents.length > 0 && (
        <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, mt: 2 }}>
          {filteredAgents.map(agent => (
            <Box key={agent.id} sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: 'rgba(30, 40, 50, 0.4)',
              borderLeft: `3px solid ${statusColors[agent.status]}`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateX(-3px)',
                bgcolor: 'rgba(40, 50, 60, 0.6)'
              }
            }}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: statusColors[agent.status],
                mr: 2,
                flexShrink: 0
              }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ 
                  color: nexusColors.frost, 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {agent.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: nexusColors.quantum,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t('agentMonitor.agentStatus', { 
                    status: agent.type, 
                    time: agent.lastActive.toLocaleTimeString() 
                  })}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                sx={{ color: nexusColors.quantum }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
