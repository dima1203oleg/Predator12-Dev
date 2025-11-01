// @ts-nocheck
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid, IconButton, Tooltip, CircularProgress } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import useAgentStore from '@/stores/agentStore';
import { nexusColors } from '../../theme/nexusTheme';

export default function MASSupervisor() {
  const { t } = useTranslation();
  const agents = useAgentStore(state => state.agents);

  const statusColors = {
    active: '#00FF66',
    degraded: '#FFCC00',
    down: '#FF3300',
    starting: '#0A75FF'
  };

  return (
    <Box sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" sx={{
        color: nexusColors.frost,
        mb: 2,
        display: 'flex',
        alignItems: 'center'
      }}>
        <BarChartIcon sx={{ mr: 1 }} />
        {t('masSupervisor.title')}
      </Typography>

      <Grid container spacing={2}>
        {agents.map(agent => (
          <Grid item xs={12} sm={6} md={4} key={agent.id}>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(30, 40, 50, 0.5)',
              borderLeft: `3px solid ${statusColors[agent.status]}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{
                  color: nexusColors.frost,
                  fontWeight: 'bold'
                }}>
                  {agent.name}
                </Typography>
                <Box>
                  <Tooltip title={t('masSupervisor.restartTooltip')}>
                    <IconButton size="small" sx={{ color: nexusColors.sapphire }}>
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={agent.status === 'active' ?
                    t('masSupervisor.pauseTooltip') :
                    t('masSupervisor.startTooltip')}>
                    <IconButton size="small" sx={{
                      color: agent.status === 'active' ? nexusColors.quantum : nexusColors.frost
                    }}>
                      {agent.status === 'active' ?
                        <PauseCircleIcon fontSize="small" /> :
                        <PlayCircleIcon fontSize="small" />
                      }
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: nexusColors.quantum, mt: 1 }}>
                {t('masSupervisor.agentType', { type: agent.type })}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={75}
                  size={20}
                  thickness={5}
                  sx={{ color: statusColors[agent.status], mr: 1 }}
                />
                <Typography variant="body2" sx={{ color: nexusColors.quantum }}>
                  {t('masSupervisor.cpuUsage', { usage: 75 })}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={50}
                  size={20}
                  thickness={5}
                  sx={{ color: statusColors[agent.status], mr: 1 }}
                />
                <Typography variant="body2" sx={{ color: nexusColors.quantum }}>
                  {t('masSupervisor.memoryUsage', { usage: 50 })}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
